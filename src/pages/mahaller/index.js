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
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'


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

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function getSubtreeArea(nodeId, allNodes, mahaller, cache) {
  if (cache[nodeId] !== undefined) return cache[nodeId]
  const children = allNodes.filter(n => n.parent_id === nodeId)
  if (children.length === 0) {
    cache[nodeId] = mahaller
      .filter(m => m.lbs_node_id === nodeId)
      .reduce((sum, m) => sum + (Number(m.area) || 0), 0)
  } else {
    cache[nodeId] = children.reduce(
      (sum, child) => sum + getSubtreeArea(child.id, allNodes, mahaller, cache), 0
    )
  }
  return cache[nodeId]
}


export default function P_Mahaller() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: rawMahaller = [], isLoading: mahalLoading, error: mahalError } = useGetWorkAreas()

  const [viewMode, setViewMode] = useState('lbsMahal')
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [filterLbsIds, setFilterLbsIds] = useState(new Set())
  const [activeLbsNodeId, setActiveLbsNodeId] = useState(null)
  const [show, setShow] = useState('Main')
  const [dialogAlert, setDialogAlert] = useState()
  const [editingMahal, setEditingMahal] = useState(null)
  const [lbsChildForm, setLbsChildForm] = useState({ name: '', codeName: '' })
  const [lbsChildSaving, setLbsChildSaving] = useState(false)

  const isLoading = lbsLoading || mahalLoading
  const queryError = mahalError
  const modeMinWidth = '40rem'

  const cycleViewMode = () => {
    setViewMode(prev => {
      if (prev === 'lbsOnly') return 'mahalOnly'
      if (prev === 'mahalOnly') return 'lbsMahal'
      return 'lbsOnly'
    })
  }

  const viewModeLabel = useMemo(() => {
    if (viewMode === 'lbsOnly') return 'LBS'
    if (viewMode === 'mahalOnly') return 'Mahal'
    return 'L+M'
  }, [viewMode])

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  useEffect(() => {
    if (!lbsLoading && rawLbsNodes.length === 0) setViewMode('lbsOnly')
  }, [lbsLoading, rawLbsNodes.length])

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
    if (viewMode === 'mahalOnly' && filterLbsIds.size > 0) {
      return rawMahaller.filter(m => filterLbsIds.has(m.lbs_node_id))
    }
    return rawMahaller
  }, [rawMahaller, viewMode, filterLbsIds])

  const nodeAreaTotals = useMemo(() => {
    const cache = {}
    rawLbsNodes.forEach(n => getSubtreeArea(n.id, rawLbsNodes, rawMahaller, cache))
    return cache
  }, [rawLbsNodes, rawMahaller])

  const invalidate = () => queryClient.invalidateQueries(['workAreas', selectedProje?.id])
  const invalidateLbs = () => queryClient.invalidateQueries(['lbsNodes', selectedProje?.id])

  const selectedLbsNode = useMemo(() =>
    rawLbsNodes.find(n => n.id === activeLbsNodeId) ?? null,
    [rawLbsNodes, activeLbsNodeId]
  )

  const handleAddLbsChild = async () => {
    if (!lbsChildForm.name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Başlık adı boş olamaz.', onCloseAction: () => setDialogAlert() })
      return
    }
    if (activeLbsNodeId) {
      const hasMahal = rawMahaller.some(m => m.lbs_node_id === activeLbsNodeId)
      if (hasMahal) {
        setDialogAlert({
          dialogIcon: 'warning',
          dialogMessage: 'Bu düğümün altında mahaller mevcut olduğundan alt başlık eklenemez.',
          detailText: 'Mahaller yalnızca yaprak (en alt) düğümlere bağlıdır. Alt başlık eklemek istiyorsanız önce bu düğümdeki mahalleri, mahal oluşturacağınız bir LBS düğümüne taşıyın.',
          onCloseAction: () => setDialogAlert(),
        })
        return
      }
    }
    const siblings = rawLbsNodes.filter(n => (n.parent_id ?? null) === activeLbsNodeId)
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order_index)) : -1
    setLbsChildSaving(true)
    const { error } = await supabase.from('lbs_nodes').insert({
      project_id: selectedProje.id,
      parent_id: activeLbsNodeId,
      name: lbsChildForm.name.trim(),
      code_name: lbsChildForm.codeName.trim() || null,
      order_index: maxOrder + 1,
    })
    setLbsChildSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Alt başlık kaydedilemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setLbsChildForm({ name: '', codeName: '' })
    setShow('Main')
    invalidateLbs()
  }

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
    <Box sx={{ m: '0rem', overflowX: 'auto' }}>

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
                <Tooltip title={
                  viewMode === 'mahalOnly' ? 'Mahal modunda eklenemez — L+M moduna geçin'
                  : viewMode === 'lbsOnly' && !activeLbsNodeId ? 'LBS kök başlık ekle'
                  : viewMode === 'lbsOnly' && rawMahaller.some(m => m.lbs_node_id === activeLbsNodeId) ? 'Bu düğümde mahaller var — alt başlık eklenemez'
                  : viewMode === 'lbsOnly' ? 'LBS alt başlık ekle'
                  : viewMode === 'lbsMahal' && !activeLbsNodeId ? 'Bir LBS yaprak düğümü seçin'
                  : 'Mahal ekle'
                }>
                  <span>
                    <IconButton
                      onClick={() => {
                        if (viewMode === 'lbsOnly') {
                          if (activeLbsNodeId && rawMahaller.some(m => m.lbs_node_id === activeLbsNodeId)) {
                            setDialogAlert({
                              dialogIcon: 'warning',
                              dialogMessage: 'Bu düğümün altında mahaller mevcut olduğundan alt başlık eklenemez.',
                              detailText: 'Mahaller yalnızca yaprak (en alt) düğümlere bağlıdır. Alt başlık eklemek istiyorsanız önce bu düğümdeki mahalleri, mahal oluşturacağınız bir LBS düğümüne taşıyın.',
                              onCloseAction: () => setDialogAlert(),
                            })
                            return
                          }
                          setLbsChildForm({ name: '', codeName: '' })
                          setShow('LbsChildCreate')
                        } else {
                          setShow('MahalCreate')
                        }
                      }}
                      disabled={viewMode === 'mahalOnly' || (viewMode === 'lbsMahal' && !activeLbsNodeId)}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>

              <Grid item>
                <Tooltip title={rawLbsNodes.length === 0 ? 'Önce LBS başlıkları oluşturun' : `Görünüm: ${viewModeLabel} (tıkla: sonraki mod)`}>
                  <span>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={cycleViewMode}
                    disabled={rawLbsNodes.length === 0}
                    startIcon={<ViewAgendaIcon />}
                    sx={{
                      textTransform: 'none',
                      minWidth: '5.25rem',
                      px: '0.5rem',
                      color: 'text.secondary',
                      borderColor: 'grey.400',
                      '&:hover': {
                        borderColor: 'grey.600',
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    {viewModeLabel}
                  </Button>
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
          lbsNodeId={viewMode === 'lbsMahal' ? activeLbsNodeId : null}
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

      {show === 'LbsChildCreate' &&
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>
          <Paper variant="outlined" sx={{ p: '1.25rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '1rem' }}>
              {selectedLbsNode ? <>Alt Başlık Ekle — <em>{selectedLbsNode.name}</em></> : 'LBS Kök Başlık Ekle'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="standard"
                  label="Kod (isteğe bağlı)"
                  fullWidth
                  value={lbsChildForm.codeName}
                  onChange={e => setLbsChildForm(f => ({ ...f, codeName: e.target.value }))}
                  disabled={lbsChildSaving}
                  inputProps={{ style: { fontFamily: 'monospace' } }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  variant="standard"
                  label="Başlık Adı"
                  fullWidth
                  required
                  autoFocus
                  value={lbsChildForm.name}
                  onChange={e => setLbsChildForm(f => ({ ...f, name: e.target.value }))}
                  disabled={lbsChildSaving}
                  onKeyDown={e => e.key === 'Enter' && handleAddLbsChild()}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} justifyContent="flex-end">
                  <Grid item>
                    <Button variant="text" onClick={() => setShow('Main')} disabled={lbsChildSaving}>İptal</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={handleAddLbsChild} disabled={lbsChildSaving}>Kaydet</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Box>
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


      {/* ===== SADECE LBS GÖRÜNÜMÜ ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingMahal && viewMode === 'lbsOnly' && rawLbsNodes.length > 0 &&
        (() => {
          return (
            <Box sx={{ maxWidth: '80rem', minWidth: modeMinWidth, p: '0.5rem', width: 'fit-content' }}>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ backgroundColor: 'black', color: 'white', pl: '4px', py: '2px' }}>
                  <Typography variant="body2">{selectedProje?.name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box>
                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const isSelected = activeLbsNodeId === node.id
                    const cols = depth === 0 ? '1fr' : `repeat(${depth}, 1rem) 1fr`
                    const c = nodeColor(depth)

                    return (
                      <Box key={node.id} sx={{ display: 'grid', gridTemplateColumns: cols }}>
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}

                        <Box
                          sx={{
                            backgroundColor: c.bg,
                            color: c.co,
                            display: 'flex', alignItems: 'stretch',
                            userSelect: 'none',
                            '&:hover': { filter: 'brightness(1.2)' }
                          }}
                        >
                          {/* İsim alanı: tıklama = expand/collapse */}
                          <Box
                            onClick={() => toggleCollapse(node.id)}
                            sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0, pl: '6px', py: '1px' }}
                          >
                            {!isLeaf &&
                              <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                                {collapsedIds.has(node.id) ? '▶' : '▼'}
                              </Box>
                            }
                            {isLeaf &&
                              <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: rawMahaller.some(m => m.lbs_node_id === node.id) ? '#FF4444' : '#65FF00', flexShrink: 0 }} />
                            }
                            <Typography variant="body2">
                              {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                            </Typography>
                          </Box>
                          {/* Sağ alan: tıklama = seç/iptal */}
                          <Box
                            onClick={() => setActiveLbsNodeId(prev => prev === node.id ? null : node.id)}
                            sx={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', pl: '0.3rem', py: '1px' }}
                          >
                            {isSelected &&
                              <Box sx={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow' }} />
                            }
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )
        })()
      }


      {/* ===== LBS+MAHAL GÖRÜNÜMÜ — LBS sayfasıyla aynı stil, tek ortak grid ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingMahal && viewMode === 'lbsMahal' && rawLbsNodes.length > 0 &&
        (() => {
          // Tüm LBS + mahal satırları için tek ortak grid sütun tanımı
          const totalDepthCols = maxLeafDepth + 1
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content max-content minmax(0, 1fr)`

          return (
            <Box sx={{ maxWidth: '80rem', minWidth: modeMinWidth, p: '0.5rem', width: 'fit-content' }}>

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
                        {/* Main content */}
                        <Box
                          sx={{
                            gridColumn: `span ${totalDepthCols + 2 - depth}`,
                            backgroundColor: c.bg,
                            color: c.co,
                            display: 'flex', alignItems: 'stretch',
                            userSelect: 'none',
                            '&:hover': { filter: 'brightness(1.2)' }
                          }}
                        >
                          {/* İsim alanı: tıklama = expand/collapse */}
                          <Box
                            onClick={() => toggleCollapse(node.id)}
                            sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0, pl: '6px', py: '1px' }}
                          >
                            <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                              {collapsedIds.has(node.id) ? '▶' : '▼'}
                            </Box>
                            <Typography variant="body2">
                              {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                            </Typography>
                            {isSelected &&
                              <Box sx={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow', ml: '0.3rem' }} />
                            }
                          </Box>
                          {/* Sağ alan: tıklama = seç/iptal (leaf) */}
                          <Box
                            onClick={() => isLeaf && setActiveLbsNodeId(prev => prev === node.id ? null : node.id)}
                            sx={{ flex: 1, cursor: isLeaf ? 'pointer' : 'default', display: 'flex', alignItems: 'center', pl: '0.3rem', pr: '0.5rem' }}
                          >
                            {isLeaf && mahallerOfNode.length > 0 &&
                              <Box sx={{ ml: 'auto', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                                {mahallerOfNode.length} mahal
                              </Box>
                            }
                          </Box>
                        </Box>
                        {/* Alan toplamı */}
                        <Box sx={{
                          backgroundColor: c.bg, color: c.co,
                          px: '6px', py: '1px', fontSize: '0.8rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          whiteSpace: 'nowrap',
                          '&:hover': { filter: 'brightness(1.2)' }
                        }}>
                          {nodeAreaTotals[node.id] ? `${ikiHane(nodeAreaTotals[node.id])} m²` : ''}
                        </Box>
                        {/* Tail (butonlar + doldurma sütunları) */}
                        <Box sx={{ gridColumn: 'span 2', backgroundColor: c.bg }} />

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
                              backgroundColor: '#f0f0f0'
                            }}>
                              {mahal.code || '—'}
                            </Box>

                            {/* Mahal adı */}
                            <Box sx={{
                              px: '6px', py: '2px',
                              borderBottom: '0.5px solid #ddd',
                              fontSize: '0.875rem',
                              display: 'flex', alignItems: 'center',
                              backgroundColor: '#f0f0f0'
                            }}>
                              {mahal.name}
                            </Box>

                            {/* Alan m² */}
                            <Box sx={{
                              px: '6px', py: '2px',
                              borderBottom: '0.5px solid #ddd',
                              fontSize: '0.8rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                              backgroundColor: '#f0f0f0', whiteSpace: 'nowrap'
                            }}>
                              {mahal.area != null ? `${mahal.area} m²` : '—'}
                            </Box>

                            {/* Düzenle / Sil */}
                            <Box sx={{
                              borderBottom: '0.5px solid #ddd',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: '#f0f0f0'
                            }}>
                              <IconButton size="small" onClick={() => setEditingMahal(mahal)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteMahal(mahal)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Esnek dolgu sütunu: satırı proje başlığı genişliğine kadar uzatır */}
                            <Box sx={{
                              borderBottom: '0.5px solid #ddd',
                              backgroundColor: '#f0f0f0',
                            }} />

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
      {!isLoading && !queryError && show === 'Main' && !editingMahal && viewMode === 'mahalOnly' && rawLbsNodes.length > 0 &&
        <Box sx={{ m: '1rem', minWidth: modeMinWidth, width: 'fit-content' }}>

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
