import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkAreas, useGetWorkPackagePozAreas } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SaveIcon from '@mui/icons-material/Save'


function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

function nodeColor(depth) {
  const palette = [
    { bg: "#7a3333", co: "#e6e6e6" },
    { bg: "#2d5c3a", co: "#e6e6e6" },
    { bg: "#2d4f80", co: "#e6e6e6" },
    { bg: "#6b5a2a", co: "#e6e6e6" },
    { bg: "#2d6060", co: "#e6e6e6" },
    { bg: "#4a2d7a", co: "#e6e6e6" },
    { bg: "#6b2d50", co: "#e6e6e6" },
    { bg: "#505050", co: "#e6e6e6" },
  ]
  return palette[depth % palette.length]
}


export default function P_isPaketPozMahaller() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje, selectedIsPaket, selectedPoz } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: rawMahaller = [], isLoading: mahalLoading, error: mahalError } = useGetWorkAreas()
  const { data: wpAreaData = [], isLoading: wpAreaLoading } = useGetWorkPackagePozAreas()

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()

  const isLoading = lbsLoading || mahalLoading || wpAreaLoading
  const queryError = mahalError

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) navigate('/ispaketler')
    else if (!selectedPoz) navigate('/ispaketpozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  // Mevcut atamalar yüklenince selectedIds'i initialize et
  useEffect(() => {
    if (!wpAreaLoading) {
      setSelectedIds(new Set(wpAreaData.map(d => d.work_area_id)))
      setHasChanges(false)
    }
  }, [wpAreaData, wpAreaLoading])

  const flatNodes = useMemo(() => flattenTree(rawLbsNodes), [rawLbsNodes])

  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawLbsNodes.forEach(n => {
      if (!rawLbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawLbsNodes])

  const maxLeafDepth = useMemo(() => {
    const leaves = flatNodes.filter(n => isLeafSet.has(n.id))
    return leaves.length > 0 ? Math.max(...leaves.map(n => n.depth)) : 0
  }, [flatNodes, isLeafSet])

  function toggleCollapse(nodeId) {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  function isHiddenByAncestor(node) {
    let parentId = node.parent_id
    while (parentId) {
      if (collapsedIds.has(parentId)) return true
      const parent = rawLbsNodes.find(n => n.id === parentId)
      parentId = parent?.parent_id ?? null
    }
    return false
  }

  const toggleMahal = (mahal) => {
    setHasChanges(true)
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(mahal.id) ? next.delete(mahal.id) : next.add(mahal.id)
      return next
    })
  }

  const handleCancel = () => {
    setSelectedIds(new Set(wpAreaData.map(d => d.work_area_id)))
    setHasChanges(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Poz'u bu iş paketine ata (yoksa ekle, varsa var olanı al)
      let wppId
      const { data: existingWpp, error: selectError } = await supabase
        .from('work_package_pozlar')
        .select('id')
        .eq('work_package_id', selectedIsPaket.id)
        .eq('project_poz_id', selectedPoz.id)
        .maybeSingle()

      if (selectError) throw selectError

      if (existingWpp) {
        wppId = existingWpp.id
      } else {
        const { data: newWpp, error: insertWppError } = await supabase
          .from('work_package_pozlar')
          .insert({ work_package_id: selectedIsPaket.id, project_poz_id: selectedPoz.id })
          .select('id')
          .single()

        if (insertWppError) throw insertWppError
        wppId = newWpp.id
      }

      // 2. Mevcut mahal atamalarını sil
      const { error: deleteError } = await supabase
        .from('work_package_poz_areas')
        .delete()
        .eq('work_package_poz_id', wppId)

      if (deleteError) throw deleteError

      // 3. Seçili mahalleri ekle
      if (selectedIds.size > 0) {
        const newAreas = Array.from(selectedIds).map((areaId, idx) => ({
          work_package_poz_id: wppId,
          work_area_id: areaId,
          order_index: idx,
        }))

        const { error: insertError } = await supabase
          .from('work_package_poz_areas')
          .insert(newAreas)

        if (insertError) throw insertError
      }

      // 4. Cache'leri güncelle
      queryClient.invalidateQueries({ queryKey: ['workPackagePozAreas', selectedIsPaket.id, selectedPoz.id] })
      queryClient.invalidateQueries({ queryKey: ['workPackagePozlar', selectedIsPaket.id] })

      setHasChanges(false)
    } catch (err) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Kaydetme başarısız: ' + (err.message ?? 'Bilinmeyen hata'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc


  return (
    <Box sx={{ m: '0rem' }}>

      {dialogAlert && (
        <DialogAlert
          {...dialogAlert}
          onCloseAction={() => setDialogAlert()}
        />
      )}

      {/* BAŞLIK */}
      <Paper>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ px: '1rem', py: '0.5rem', minHeight: '3.5rem' }}>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.8 } }}
                onClick={() => navigate('/ispaketler')}
              >
                İş Paketleri
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600, opacity: 0.4, cursor: 'pointer',
                  maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => navigate('/ispaketpozlar')}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600, opacity: 0.4, cursor: 'pointer',
                  maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => navigate('/ispaketpozlar')}
              >
                {pozLabel}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Mahaller
              </Typography>
            </Box>
          </Grid>

          {/* Kaydet / İptal butonları */}
          {hasChanges && (
            <Grid item>
              <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  disabled={isSaving}
                  onClick={handleCancel}
                  sx={{ textTransform: 'none' }}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isSaving}
                  onClick={handleSave}
                  startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />}
                  sx={{ textTransform: 'none' }}
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {isLoading &&
        <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>
      }

      {!isLoading && queryError &&
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veri alınırken hata oluştu.<br /><small style={{ opacity: 0.7 }}>{queryError.message}</small>
        </Alert>
      }

      {!isLoading && !queryError && rawLbsNodes.length === 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Mahal oluşturmadan önce <strong>LBS (Mahal Başlıkları)</strong> ağacını oluşturun.
        </Alert>
      }

      {!isLoading && !queryError && rawMahaller.length === 0 && rawLbsNodes.length > 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Henüz mahal eklenmedi.
        </Alert>
      }

      {/* AĞAÇ GÖRÜNÜMÜ */}
      {!isLoading && !queryError && rawLbsNodes.length > 0 && rawMahaller.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          const totalCols = totalDepthCols + 3
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content`

          return (
            <Box sx={{ maxWidth: '80rem', p: '0.5rem', width: 'fit-content' }}>

              {/* Proje adı satırı */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ backgroundColor: 'black', color: 'white', pl: '4px', py: '2px' }}>
                  <Typography variant="body2">{selectedProje?.name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const c = nodeColor(depth)
                    const mahallerOfNode = rawMahaller
                      .filter(m => m.lbs_node_id === node.id)
                      .sort((a, b) => a.order_index - b.order_index)

                    return (
                      <React.Fragment key={node.id}>

                        {/* LBS düğüm satırı */}
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}
                        <Box
                          onClick={() => { if (!isLeaf) toggleCollapse(node.id) }}
                          sx={{
                            gridColumn: `span ${totalCols - depth}`,
                            pl: '6px', py: '1px',
                            backgroundColor: c.bg,
                            color: c.co,
                            cursor: isLeaf ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            userSelect: 'none',
                            '&:hover': { filter: isLeaf ? 'none' : 'brightness(1.2)' }
                          }}
                        >
                          {!isLeaf &&
                            <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                              {collapsedIds.has(node.id) ? '▶' : '▼'}
                            </Box>
                          }
                          {isLeaf &&
                            <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#65FF00', flexShrink: 0 }} />
                          }
                          <Typography variant="body2">
                            {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                          </Typography>
                          {isLeaf && mahallerOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                              {mahallerOfNode.length} mahal
                            </Box>
                          }
                        </Box>

                        {/* Mahal satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => {
                          const isSelected = selectedIds.has(mahal.id)
                          const bg = isSelected ? '#bbdefb' : '#f0f0f0'
                          return (
                            <React.Fragment key={mahal.id}>

                              {Array.from({ length: totalDepthCols }).map((_, i) => (
                                <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                              ))}

                              {/* Mahal kodu */}
                              <Box
                                onClick={() => toggleMahal(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  borderLeft: '1px solid #aaa',
                                  fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: bg,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.code || '—'}
                              </Box>

                              {/* Mahal adı */}
                              <Box
                                onClick={() => toggleMahal(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.875rem',
                                  display: 'flex', alignItems: 'center',
                                  backgroundColor: bg,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.name}
                              </Box>

                              {/* Alan m² */}
                              <Box
                                onClick={() => toggleMahal(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.8rem',
                                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  backgroundColor: bg,
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.area != null ? `${mahal.area} m²` : '—'}
                              </Box>

                            </React.Fragment>
                          )
                        })}

                      </React.Fragment>
                    )
                  })}

                </Box>
              </Box>
            </Box>
          )
        })()
      }

    </Box>
  )
}
