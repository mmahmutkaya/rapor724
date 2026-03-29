import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'


function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

function nodeColor(depth) {
  const palette = [
    { bg: '#8b0000', co: '#e6e6e6' },
    { bg: '#330066', co: '#e6e6e6' },
    { bg: '#005555', co: '#e6e6e6' },
    { bg: '#737373', co: '#e6e6e6' },
    { bg: '#8b008b', co: '#e6e6e6' },
    { bg: '#2929bc', co: '#e6e6e6' },
    { bg: '#00853E', co: '#e6e6e6' },
    { bg: '#4B5320', co: '#e6e6e6' },
  ]
  return palette[depth % palette.length]
}


export default function P_Wbs() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje } = useContext(StoreContext)

  const { data: rawWbsNodes = [], isLoading, error: wbsError } = useGetWbsNodes()

  const [collapsedIds, setCollapsedIds]     = useState(new Set())
  const [activeNodeId, setActiveNodeId]     = useState(null)
  const [show, setShow]                     = useState('Main')
  const [nodeForm, setNodeForm]             = useState({ name: '', codeName: '' })
  const [nodeSaving, setNodeSaving]         = useState(false)
  const [editingNodeId, setEditingNodeId]   = useState(null)
  const [editForm, setEditForm]             = useState({ name: '', codeName: '' })
  const [editSaving, setEditSaving]         = useState(false)
  const [dialogAlert, setDialogAlert]       = useState()

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  const invalidate = () => queryClient.invalidateQueries(['wbsNodes', selectedProje?.id])

  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])

  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawWbsNodes.forEach(n => {
      if (!rawWbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawWbsNodes])

  function isHiddenByAncestor(node) {
    let parentId = node.parent_id
    while (parentId) {
      if (collapsedIds.has(parentId)) return true
      const parent = rawWbsNodes.find(n => n.id === parentId)
      parentId = parent?.parent_id ?? null
    }
    return false
  }

  function toggleCollapse(nodeId) {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  const selectedNode = useMemo(
    () => rawWbsNodes.find(n => n.id === activeNodeId) ?? null,
    [rawWbsNodes, activeNodeId]
  )

  const siblings = useMemo(() => {
    if (!selectedNode) return []
    return rawWbsNodes
      .filter(n => (n.parent_id ?? null) === (selectedNode.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
  }, [rawWbsNodes, selectedNode])

  const siblingIdx = useMemo(
    () => siblings.findIndex(n => n.id === activeNodeId),
    [siblings, activeNodeId]
  )

  const canMoveUp    = !!selectedNode && siblingIdx > 0
  const canMoveDown  = !!selectedNode && siblingIdx < siblings.length - 1
  const canMoveLeft  = !!selectedNode && selectedNode.parent_id != null
  const canMoveRight = !!selectedNode && siblingIdx > 0

  const handleMoveUp = async () => {
    if (!canMoveUp) return
    const prev = siblings[siblingIdx - 1]
    const curr = selectedNode
    await supabase.from('wbs_nodes').update({ order_index: prev.order_index }).eq('id', curr.id)
    await supabase.from('wbs_nodes').update({ order_index: curr.order_index }).eq('id', prev.id)
    invalidate()
  }

  const handleMoveDown = async () => {
    if (!canMoveDown) return
    const next = siblings[siblingIdx + 1]
    const curr = selectedNode
    await supabase.from('wbs_nodes').update({ order_index: next.order_index }).eq('id', curr.id)
    await supabase.from('wbs_nodes').update({ order_index: curr.order_index }).eq('id', next.id)
    invalidate()
  }

  const handleMoveLeft = async () => {
    if (!canMoveLeft) return
    const parent = rawWbsNodes.find(n => n.id === selectedNode.parent_id)
    const grandparentId = parent?.parent_id ?? null
    const parentSiblings = rawWbsNodes
      .filter(n => (n.parent_id ?? null) === (grandparentId ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const parentIdx = parentSiblings.findIndex(n => n.id === parent.id)
    const toShift = parentSiblings.filter((_, i) => i > parentIdx)
    for (const sib of toShift) {
      await supabase.from('wbs_nodes').update({ order_index: sib.order_index + 1 }).eq('id', sib.id)
    }
    await supabase.from('wbs_nodes').update({ parent_id: grandparentId, order_index: parent.order_index + 1 }).eq('id', selectedNode.id)
    invalidate()
  }

  const handleMoveRight = async () => {
    if (!canMoveRight) return
    const newParent = siblings[siblingIdx - 1]
    const newSiblings = rawWbsNodes.filter(n => n.parent_id === newParent.id)
    const newOrderIndex = newSiblings.length > 0 ? Math.max(...newSiblings.map(n => n.order_index)) + 1 : 0
    await supabase.from('wbs_nodes').update({ parent_id: newParent.id, order_index: newOrderIndex }).eq('id', selectedNode.id)
    setCollapsedIds(prev => { const next = new Set(prev); next.delete(newParent.id); return next })
    invalidate()
  }

  const handleAddNode = async () => {
    if (!nodeForm.name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Başlık adı boş olamaz.', onCloseAction: () => setDialogAlert() })
      return
    }
    const sibsOfTarget = rawWbsNodes.filter(n => (n.parent_id ?? null) === (activeNodeId ?? null))
    const maxOrder = sibsOfTarget.length > 0 ? Math.max(...sibsOfTarget.map(s => s.order_index)) : -1
    setNodeSaving(true)
    const { error } = await supabase.from('wbs_nodes').insert({
      project_id: selectedProje.id,
      parent_id: activeNodeId ?? null,
      name: nodeForm.name.trim(),
      code_name: nodeForm.codeName.trim() || null,
      order_index: maxOrder + 1,
    })
    setNodeSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Başlık kaydedilemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setNodeForm({ name: '', codeName: '' })
    setShow('Main')
    invalidate()
  }

  const handleStartEdit = (node) => {
    setEditingNodeId(node.id)
    setEditForm({ name: node.name, codeName: node.code_name ?? '' })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Başlık adı boş olamaz.', onCloseAction: () => setDialogAlert() })
      return
    }
    setEditSaving(true)
    const { error } = await supabase.from('wbs_nodes').update({
      name: editForm.name.trim(),
      code_name: editForm.codeName.trim() || null,
    }).eq('id', editingNodeId)
    setEditSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Güncelleme başarısız.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setEditingNodeId(null)
    invalidate()
  }

  const handleDeleteNode = (node) => {
    const hasChildren = rawWbsNodes.some(n => n.parent_id === node.id)
    if (hasChildren) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Alt başlıkları olan bir düğüm silinemez.',
        detailText: 'Önce alt başlıkları silin.',
        onCloseAction: () => setDialogAlert(),
      })
      return
    }
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: `"${node.name}" silinsin mi?`,
      actionText1: 'Sil',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase.from('wbs_nodes').delete().eq('id', node.id)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Silme başarısız.', detailText: error.message, onCloseAction: () => setDialogAlert() })
          return
        }
        if (activeNodeId === node.id) setActiveNodeId(null)
        invalidate()
      },
      onCloseAction: () => setDialogAlert(),
    })
  }


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
        />
      }

      {/* BAŞLIK */}
      <Paper>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: '1rem', py: '0.5rem' }}>
          <Grid item>
            <Typography variant="h6" fontWeight="bold">WBS</Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={0.5} alignItems="center">

              {activeNodeId && (
                <>
                  <Grid item>
                    <Tooltip title="Yukarı taşı">
                      <span>
                        <IconButton size="small" onClick={handleMoveUp} disabled={!canMoveUp}>
                          <KeyboardArrowUpIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Aşağı taşı">
                      <span>
                        <IconButton size="small" onClick={handleMoveDown} disabled={!canMoveDown}>
                          <KeyboardArrowDownIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Seviye yukarı (sol)">
                      <span>
                        <IconButton size="small" onClick={handleMoveLeft} disabled={!canMoveLeft}>
                          <KeyboardArrowLeftIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Seviye aşağı (sağ)">
                      <span>
                        <IconButton size="small" onClick={handleMoveRight} disabled={!canMoveRight}>
                          <KeyboardArrowRightIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </>
              )}

              <Grid item>
                <Tooltip title={activeNodeId ? 'Alt başlık ekle' : 'Kök başlık ekle'}>
                  <IconButton
                    size="small"
                    onClick={() => { setNodeForm({ name: '', codeName: '' }); setShow('Create') }}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && <LinearProgress />}
      {wbsError && <Alert severity="error" sx={{ m: '1rem' }}>{wbsError.message}</Alert>}

      {/* OLUŞTUR FORMU */}
      {show === 'Create' && (
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>
          <Paper variant="outlined" sx={{ p: '1.25rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '1rem' }}>
              {selectedNode ? <>Alt Başlık Ekle — <em>{selectedNode.name}</em></> : 'Kök Başlık Ekle'}
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="standard"
                  label="Kod (isteğe bağlı)"
                  fullWidth
                  value={nodeForm.codeName}
                  onChange={e => setNodeForm(f => ({ ...f, codeName: e.target.value }))}
                  disabled={nodeSaving}
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
                  value={nodeForm.name}
                  onChange={e => setNodeForm(f => ({ ...f, name: e.target.value }))}
                  disabled={nodeSaving}
                  onKeyDown={e => e.key === 'Enter' && handleAddNode()}
                />
              </Grid>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <IconButton size="small" onClick={handleAddNode} disabled={nodeSaving} color="primary">
                      <CheckIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton size="small" onClick={() => setShow('Main')} disabled={nodeSaving}>
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* WBS AĞACI */}
      {!isLoading && !wbsError && rawWbsNodes.length === 0 && show !== 'Create' && (
        <Box sx={{ m: '1rem' }}>
          <Alert severity="info">Henüz WBS başlığı yok. Eklemek için + butonunu kullanın.</Alert>
        </Box>
      )}

      {!isLoading && !wbsError && rawWbsNodes.length > 0 && (
        <Box sx={{ p: '0.5rem', width: 'fit-content', minWidth: '32rem', maxWidth: '80rem' }}>

          {/* Proje başlığı */}
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
                const isSelected = activeNodeId === node.id
                const isEditing = editingNodeId === node.id
                const c = nodeColor(depth)
                const cols = depth === 0 ? '1fr' : `repeat(${depth}, 1rem) 1fr`

                return (
                  <Box key={node.id} sx={{ display: 'grid', gridTemplateColumns: cols }}>
                    {Array.from({ length: depth }).map((_, i) => (
                      <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                    ))}

                    <Box
                      sx={{
                        pl: '6px',
                        py: '1px',
                        backgroundColor: c.bg,
                        color: c.co,
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                      }}
                    >
                      {/* Expand / leaf indicator */}
                      <Box
                        onClick={() => { if (!isLeaf && !isEditing) toggleCollapse(node.id) }}
                        sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, pr: '4px', cursor: isLeaf ? 'default' : 'pointer' }}
                      >
                        {!isLeaf && (
                          <Box sx={{ fontSize: '0.7rem' }}>
                            {collapsedIds.has(node.id) ? '▶' : '▼'}
                          </Box>
                        )}
                        {isLeaf && (
                          <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#65FF00', flexShrink: 0 }} />
                        )}
                      </Box>

                      {/* İnline düzenleme */}
                      {isEditing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, py: '2px' }}>
                          <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Kod"
                            value={editForm.codeName}
                            onChange={e => setEditForm(f => ({ ...f, codeName: e.target.value }))}
                            disabled={editSaving}
                            inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.78rem', padding: '2px 6px', color: '#fff' } }}
                            sx={{ width: '6rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' } }}
                          />
                          <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Başlık adı"
                            autoFocus
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            disabled={editSaving}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingNodeId(null) }}
                            inputProps={{ style: { fontSize: '0.85rem', padding: '2px 6px', color: '#fff' } }}
                            sx={{ flex: 1, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' } }}
                          />
                          <IconButton size="small" onClick={handleSaveEdit} disabled={editSaving} sx={{ p: '2px', color: '#aef0ae' }}>
                            <CheckIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingNodeId(null)} disabled={editSaving} sx={{ p: '2px', color: 'rgba(255,255,255,0.6)' }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          {/* İsim alanı */}
                          <Box
                            onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                            sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', py: '2px' }}
                          >
                            <Typography variant="body2" sx={{ '&:hover': { textShadow: '0 0 0.6px currentColor' } }}>
                              {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                            </Typography>
                            {isSelected && (
                              <Box sx={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow', flexShrink: 0 }} />
                            )}
                          </Box>

                          {/* Seçiliyken göster: edit + delete */}
                          {isSelected && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', pr: '4px' }}>
                              <IconButton size="small" onClick={() => handleStartEdit(node)} sx={{ p: '2px', color: 'rgba(255,255,255,0.7)' }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteNode(node)} sx={{ p: '2px', color: 'rgba(255,100,100,0.8)' }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>

        </Box>
      )}

    </Box>
  )
}
