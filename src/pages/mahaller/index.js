import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkAreas } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'
import FormMahalCreate from '../../components/FormMahalCreate'
import FormMahalEdit from '../../components/FormMahalEdit'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ListIcon from '@mui/icons-material/List'


// LBS sayfasından aynı yardımcılar
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


export default function P_Mahaller() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: rawMahaller = [], isLoading: mahalLoading, error: mahalError } = useGetWorkAreas()

  const [viewMode, setViewMode] = useState('tree')
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [filterLbsIds, setFilterLbsIds] = useState(new Set())
  const [activeLbsNodeId, setActiveLbsNodeId] = useState(null)
  const [show, setShow] = useState('Main')
  const [dialogAlert, setDialogAlert] = useState()
  const [editingMahal, setEditingMahal] = useState(null)

  const isLoading = lbsLoading || mahalLoading
  const queryError = mahalError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  const flatNodes = useMemo(() => flattenTree(rawLbsNodes), [rawLbsNodes])

  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawLbsNodes.forEach(n => {
      if (!rawLbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawLbsNodes])

  const leafNodes = useMemo(
    () => flatNodes.filter(n => isLeafSet.has(n.id)),
    [flatNodes, isLeafSet]
  )

  // En derin yaprak node'un derinliği → ortak grid sütun sayısını belirler
  const maxLeafDepth = useMemo(() => {
    const leaves = flatNodes.filter(n => isLeafSet.has(n.id))
    return leaves.length > 0 ? Math.max(...leaves.map(n => n.depth)) : 0
  }, [flatNodes, isLeafSet])

  const displayedMahaller = useMemo(() => {
    if (viewMode === 'flat' && filterLbsIds.size > 0) {
      return rawMahaller.filter(m => filterLbsIds.has(m.lbs_node_id))
    }
    return rawMahaller
  }, [rawMahaller, viewMode, filterLbsIds])

  const invalidate = () => queryClient.invalidateQueries(['workAreas', selectedProje?.id])

  function toggleCollapse(nodeId) {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  function toggleFilterLbs(nodeId) {
    setFilterLbsIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  async function handleDeleteMahal(mahal) {
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: `"${mahal.name}" mahalini silmek istediğinizden emin misiniz?`,
      actionText1: 'Sil',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase.from('work_areas').delete().eq('id', mahal.id)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal silinemedi.', detailText: error.message })
          return
        }
        invalidate()
      },
      actionText2: 'İptal',
      action2: () => setDialogAlert()
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

  // Düz liste sütun CSS
  const headerCellCss = {
    border: '1px solid black',
    px: '0.7rem', py: '0.3rem',
    backgroundColor: '#333', color: 'white',
    fontWeight: 600, fontSize: '0.85rem',
  }
  const mahalCellCss = {
    border: '1px solid #ddd',
    px: '0.5rem', py: '0.25rem',
    fontSize: '0.875rem',
    display: 'flex', alignItems: 'center',
  }
  const flatColumns = 'max-content minmax(20rem, max-content) max-content max-content'
  const colHeaders = [
    { label: 'Mahal Kodu', align: 'center' },
    { label: 'Mahal Adı', align: 'left' },
    { label: 'Alan m²', align: 'center' },
    { label: '', align: 'center' },
  ]


  return (
    <Box sx={{ m: '0rem' }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
          actionText1={dialogAlert.actionText1 ?? null}
          action1={dialogAlert.action1 ?? null}
          actionText2={dialogAlert.actionText2 ?? null}
          action2={dialogAlert.action2 ?? null}
        />
      }

      {/* BAŞLIK */}
      <Paper>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Typography variant="h6" fontWeight="bold">Mahaller</Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={0.5} alignItems="center">

              <Grid item>
                <Tooltip title="LBS ağaç görünümü">
                  <IconButton size="small" onClick={() => setViewMode('tree')} color={viewMode === 'tree' ? 'primary' : 'default'}>
                    <AccountTreeIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Düz liste">
                  <IconButton size="small" onClick={() => setViewMode('flat')} color={viewMode === 'flat' ? 'primary' : 'default'}>
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              <Grid item>
                <Tooltip title={
                  viewMode === 'tree' && !activeLbsNodeId
                    ? 'Bir LBS yaprak düğümü seçin'
                    : 'Mahal ekle'
                }>
                  <span>
                    <IconButton
                      onClick={() => setShow('MahalCreate')}
                      disabled={viewMode === 'tree' && !activeLbsNodeId}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Paper>


      {isLoading &&
        <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>
      }

      {show === 'MahalCreate' &&
        <FormMahalCreate
          setShow={setShow}
          lbsNodeId={viewMode === 'tree' ? activeLbsNodeId : null}
          rawLbsNodes={rawLbsNodes}
          rawMahaller={rawMahaller}
          invalidate={invalidate}
        />
      }

      {editingMahal &&
        <FormMahalEdit
          mahal={editingMahal}
          setEditingMahal={setEditingMahal}
          invalidate={invalidate}
        />
      }

      {!isLoading && queryError && show === 'Main' &&
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veritabanı sorgusu başarısız. SQL'lerin çalıştırıldığından emin olun.
          <br /><small style={{ opacity: 0.7 }}>{queryError.message}</small>
        </Alert>
      }

      {!isLoading && !queryError && rawLbsNodes.length === 0 && show === 'Main' &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Mahal oluşturmadan önce <strong>LBS (Mahal Başlıkları)</strong> ağacını oluşturun.
        </Alert>
      }


      {/* ===== AĞAÇ GÖRÜNÜMÜ — LBS sayfasıyla aynı stil, tek ortak grid ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingMahal && viewMode === 'tree' && rawLbsNodes.length > 0 &&
        (() => {
          // Tüm LBS + mahal satırları için tek ortak grid sütun tanımı
          const totalDepthCols = maxLeafDepth + 1
          const totalCols = totalDepthCols + 4    // +4: kod, ad, alan, sil
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content max-content`

          return (
            <Box sx={{ maxWidth: '80rem', p: '0.5rem', width: 'fit-content' }}>

              {/* Proje adı satırı */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ backgroundColor: 'black', color: 'white', pl: '4px', py: '2px' }}>
                  <Typography variant="body2">{selectedProje?.name}</Typography>
                </Box>
              </Box>

              {/* Tek ortak grid — LBS ve mahal satırları hizalı */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const isSelected = activeLbsNodeId === node.id
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
                          onClick={() => {
                            if (!isLeaf) { toggleCollapse(node.id); return }
                            setActiveLbsNodeId(prev => prev === node.id ? null : node.id)
                          }}
                          sx={{
                            gridColumn: `span ${totalCols - depth}`,
                            pl: '6px', py: '1px',
                            backgroundColor: isSelected ? '#3a1a00' : c.bg,
                            color: c.co,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            userSelect: 'none',
                            '&:hover': { filter: 'brightness(1.2)' }
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
                          {isSelected &&
                            <Box sx={{ ml: '0.3rem', width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow' }} />
                          }
                          {isLeaf && mahallerOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                              {mahallerOfNode.length} mahal
                            </Box>
                          }
                        </Box>

                        {/* Mahal satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => (
                          <React.Fragment key={mahal.id}>

                            {/* Derinlik çubukları: depth+1 adedi renkli, kalanı saydam dolgu */}
                            {Array.from({ length: totalDepthCols }).map((_, i) => (
                              <Box key={i} sx={{
                                backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent',
                              }} />
                            ))}

                            {/* Mahal kodu */}
                            <Box sx={{
                              px: '6px', py: '2px',
                              borderBottom: '0.5px solid #ddd',
                              borderLeft: '1px solid #aaa',
                              fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                              backgroundColor: '#fafafa'
                            }}>
                              {mahal.code || '—'}
                            </Box>

                            {/* Mahal adı */}
                            <Box sx={{
                              px: '6px', py: '2px',
                              borderBottom: '0.5px solid #ddd',
                              fontSize: '0.875rem',
                              display: 'flex', alignItems: 'center',
                              backgroundColor: '#fafafa'
                            }}>
                              {mahal.name}
                            </Box>

                            {/* Alan m² */}
                            <Box sx={{
                              px: '6px', py: '2px',
                              borderBottom: '0.5px solid #ddd',
                              fontSize: '0.8rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                              backgroundColor: '#fafafa', whiteSpace: 'nowrap'
                            }}>
                              {mahal.area != null ? `${mahal.area} m²` : '—'}
                            </Box>

                            {/* Düzenle / Sil */}
                            <Box sx={{
                              borderBottom: '0.5px solid #ddd',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: '#fafafa'
                            }}>
                              <IconButton size="small" onClick={() => setEditingMahal(mahal)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteMahal(mahal)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                          </React.Fragment>
                        ))}

                      </React.Fragment>
                    )
                  })}

                </Box>
              </Box>
            </Box>
          )
        })()
      }


      {/* ===== DÜZ LİSTE GÖRÜNÜMÜ ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingMahal && viewMode === 'flat' && rawLbsNodes.length > 0 &&
        <Box sx={{ m: '1rem' }}>

          {/* LBS leaf chip filtreleri */}
          {leafNodes.length > 0 &&
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', mb: '1rem' }}>
              {leafNodes.map(node => {
                const isActive = filterLbsIds.has(node.id)
                const c = nodeColor(node.depth)
                return (
                  <Chip
                    key={node.id}
                    label={node.code_name ? `(${node.code_name}) ${node.name}` : node.name}
                    onClick={() => toggleFilterLbs(node.id)}
                    size="small"
                    sx={{
                      backgroundColor: isActive ? c.bg : undefined,
                      color: isActive ? c.co : undefined,
                      fontWeight: isActive ? 600 : undefined,
                    }}
                  />
                )
              })}
            </Box>
          }

          {/* Düz liste tablosu */}
          <Box sx={{ display: 'grid', gridTemplateColumns: flatColumns, width: 'fit-content' }}>

            {/* Başlık satırı */}
            {colHeaders.map((h, i) => (
              <Box key={i} sx={{ ...headerCellCss, textAlign: h.align }}>{h.label}</Box>
            ))}

            {/* Mahal satırları */}
            {displayedMahaller.length === 0
              ? <Box sx={{ gridColumn: `1 / span 4`, p: '1rem', color: 'gray', fontSize: '0.875rem' }}>
                  {rawMahaller.length === 0 ? 'Henüz mahal eklenmedi.' : 'Seçili LBS başlıklarında mahal yok.'}
                </Box>
              : displayedMahaller.map(mahal => (
                  <React.Fragment key={mahal.id}>
                    <Box sx={{ ...mahalCellCss, justifyContent: 'center', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                      {mahal.code || '—'}
                    </Box>
                    <Box sx={{ ...mahalCellCss }}>
                      {mahal.name}
                    </Box>
                    <Box sx={{ ...mahalCellCss, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                      {mahal.area != null ? `${mahal.area} m²` : '—'}
                    </Box>
                    <Box sx={{ ...mahalCellCss, justifyContent: 'center', p: 0 }}>
                      <IconButton size="small" onClick={() => setEditingMahal(mahal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteMahal(mahal)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </React.Fragment>
                ))
            }

          </Box>
        </Box>
      }

    </Box>
  )
}
