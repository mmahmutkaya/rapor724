import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'
import { DialogAlert } from '../../components/general/DialogAlert'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import IconButton from '@mui/material/IconButton'
import ReplyIcon from '@mui/icons-material/Reply'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

const EMPTY_ARRAY = []

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
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

function getSubtreeMetrajSum(nodeId, allNodes, mahaller, metrajMap, cache) {
  if (cache[nodeId] !== undefined) return cache[nodeId]
  const children = allNodes.filter(n => n.parent_id === nodeId)
  if (children.length === 0) {
    cache[nodeId] = mahaller
      .filter(m => m.lbs_node_id === nodeId)
      .reduce((sum, m) => sum + (metrajMap[m.wpAreaId] ?? 0), 0)
  } else {
    cache[nodeId] = children.reduce(
      (sum, child) => sum + getSubtreeMetrajSum(child.id, allNodes, mahaller, metrajMap, cache), 0
    )
  }
  return cache[nodeId]
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

export default function P_MetrajPozMahaller() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje, selectedIsPaket, selectedPoz, setSelectedMahal, setSelectedMahal_metraj, appUser, metrajMahalViewMode, setMetrajMahalViewMode } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metraj')
    else if (!selectedPoz) navigate('/metraj/pozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  const { data: rawLbsNodesData = EMPTY_ARRAY, isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreasData = EMPTY_ARRAY, isLoading: wpAreasLoading, error: wpAreasError } = useGetWorkPackagePozAreas()
  const { data: units = EMPTY_ARRAY } = useGetPozUnits()

  const [hoveredMahalId, setHoveredMahalId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [activeNodeId, setActiveNodeId] = useState(null)

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [show, setShow] = useState('Main')
  const [dialogAlert, setDialogAlert] = useState()
  const [lbsChildForm, setLbsChildForm] = useState({ name: '', codeName: '' })
  const [lbsChildSaving, setLbsChildSaving] = useState(false)
  const [mahalForm, setMahalForm] = useState({ code: '', name: '', area: '' })
  const [mahalSaving, setMahalSaving] = useState(false)

  // Metraj data
  const [mahalOnayMap, setMahalOnayMap] = useState({})
  // preparersList: [{ id: uuid, display_name: string, map: { areaId: qty } }]
  const [preparersList, setPreparersList] = useState([])

  // Metraj data fetch
  useEffect(() => {
    if (wpAreasData.length === 0 || !appUser?.id) return

    ;(async () => {
      const areaIds = wpAreasData.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, created_by')
        .in('work_package_poz_area_id', areaIds)

      if (!sessions?.length) {
        setMahalOnayMap({})
        setPreparersList([])
        return
      }

      const sessAreaMap = {}
      const sessUserMap = {}
      sessions.forEach(s => {
        sessAreaMap[s.id] = s.work_package_poz_area_id
        sessUserMap[s.id] = s.created_by
      })

      const { data: lines } = await supabase
        .from('measurement_lines')
        .select('id, session_id, status, line_type, multiplier, count, length, width, height, parent_line_id')
        .in('session_id', sessions.map(s => s.id))

      if (!lines) {
        setMahalOnayMap({})
        setPreparersList([])
        return
      }

      function computeQty(line) {
        if (!line || line.line_type !== 'data') return 0
        const isEmpty = (v) => v === null || v === undefined || v === ''
        const vals = [Number(line.multiplier) === 1 ? null : line.multiplier, line.count, line.length, line.width, line.height]
        if (vals.every(isEmpty)) return 0
        return vals.map(v => isEmpty(v) ? 1 : (Number(v) || 0)).reduce((a, b) => a * b, 1)
      }

      const userHazMaps = {} // { userId: { areaId: qty } }
      const onayMap = {}

      // Build parent→children map to detect superseded approved lines
      const linesById = {}
      const approvedChildrenOf = {} // parentId → true if any approved child exists
      lines.forEach(l => { linesById[l.id] = l })
      lines.forEach(l => {
        if (l.parent_line_id && l.status === 'approved') {
          approvedChildrenOf[l.parent_line_id] = true
        }
      })

      lines.forEach(line => {
        const areaId = sessAreaMap[line.session_id]
        const userId = sessUserMap[line.session_id]
        if (!areaId) return
        const qty = computeQty(line)
        if (line.status === 'approved') {
          // Only count if not superseded by a later approved revision
          if (!approvedChildrenOf[line.id]) {
            onayMap[areaId] = (onayMap[areaId] ?? 0) + qty
          }
        } else {
          if (!userHazMaps[userId]) userHazMaps[userId] = {}
          userHazMaps[userId][areaId] = (userHazMaps[userId][areaId] ?? 0) + qty
        }
      })

      const uniqueUserIds = [...new Set(sessions.map(s => s.created_by))]
      const { data: nameRows } = await supabase.rpc('get_user_display_names', { user_ids: uniqueUserIds })
      const nameMap = {}
      nameRows?.forEach(r => { nameMap[r.id] = r.display_name })

      const preparers = uniqueUserIds
        .filter(uid => userHazMaps[uid])
        .map(uid => ({ id: uid, display_name: nameMap[uid] ?? uid.slice(0, 8), map: userHazMaps[uid] }))

      setPreparersList(preparers)
      setMahalOnayMap(onayMap)
    })()
  }, [wpAreasData, appUser?.id])

  const cycleViewMode = () => {
    setMetrajMahalViewMode(prev => {
      if (prev === 'mahalOnly') return 'lbsMahal'
      return 'mahalOnly'
    })
  }

  const toggleCollapse = (nodeId) => {
    setCollapsedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const viewModeLabel = useMemo(() => {
    if (metrajMahalViewMode === 'mahalOnly') return 'Mahal'
    return 'L+M'
  }, [metrajMahalViewMode])

  const invalidateLbs = () => queryClient.invalidateQueries(['lbsNodes', selectedProje?.id])
  const invalidateAreas = () => queryClient.invalidateQueries(['workPackagePozAreas', selectedIsPaket?.id, selectedPoz?.id])

  const flatNodes = useMemo(() => flattenTree(rawLbsNodesData), [rawLbsNodesData])
  const isLeafSet = useMemo(() => {
    const leafSet = new Set()
    flatNodes.forEach(n => {
      if (!flatNodes.some(c => c.parent_id === n.id)) leafSet.add(n.id)
    })
    return leafSet
  }, [flatNodes])

  const maxLeafDepth = useMemo(() => {
    let max = 0
    flatNodes.forEach(n => {
      if (isLeafSet.has(n.id)) max = Math.max(max, n.depth)
    })
    return max
  }, [flatNodes, isLeafSet])

  const rawMahaller = useMemo(() => wpAreasData.map(a => ({ ...a.work_area, wpAreaId: a.id })), [wpAreasData])
  const totalDepthCols = maxLeafDepth + 1

  // === LBS node selection / move logic ===
  const selectedLbsNode = useMemo(() => rawLbsNodesData.find(n => n.id === activeNodeId) ?? null, [rawLbsNodesData, activeNodeId])

  const lbsSiblings = useMemo(() => {
    if (!selectedLbsNode) return []
    return rawLbsNodesData
      .filter(n => (n.parent_id ?? null) === (selectedLbsNode.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
  }, [rawLbsNodesData, selectedLbsNode])

  const lbsSiblingIdx = useMemo(() => lbsSiblings.findIndex(n => n.id === activeNodeId), [lbsSiblings, activeNodeId])

  const canMoveUp = !!selectedLbsNode && lbsSiblingIdx > 0
  const canMoveDown = !!selectedLbsNode && lbsSiblingIdx < lbsSiblings.length - 1
  const canMoveLeft = !!selectedLbsNode && selectedLbsNode.parent_id != null
  const canMoveRight = !!selectedLbsNode && lbsSiblingIdx > 0

  const handleMoveUp = async () => {
    if (!canMoveUp) return
    const prev = lbsSiblings[lbsSiblingIdx - 1]
    const curr = selectedLbsNode
    await supabase.from('lbs_nodes').update({ order_index: prev.order_index }).eq('id', curr.id)
    await supabase.from('lbs_nodes').update({ order_index: curr.order_index }).eq('id', prev.id)
    invalidateLbs()
  }

  const handleMoveDown = async () => {
    if (!canMoveDown) return
    const next = lbsSiblings[lbsSiblingIdx + 1]
    const curr = selectedLbsNode
    await supabase.from('lbs_nodes').update({ order_index: next.order_index }).eq('id', curr.id)
    await supabase.from('lbs_nodes').update({ order_index: curr.order_index }).eq('id', next.id)
    invalidateLbs()
  }

  const handleMoveLeft = async () => {
    if (!canMoveLeft) return
    const parent = rawLbsNodesData.find(n => n.id === selectedLbsNode.parent_id)
    const grandparentId = parent?.parent_id ?? null
    const parentSiblings = rawLbsNodesData
      .filter(n => (n.parent_id ?? null) === (grandparentId ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const parentIdx = parentSiblings.findIndex(n => n.id === parent.id)
    const toShift = parentSiblings.filter((_, i) => i > parentIdx)
    for (const sib of toShift) {
      await supabase.from('lbs_nodes').update({ order_index: sib.order_index + 1 }).eq('id', sib.id)
    }
    await supabase.from('lbs_nodes').update({ parent_id: grandparentId, order_index: parent.order_index + 1 }).eq('id', selectedLbsNode.id)
    invalidateLbs()
  }

  const handleMoveRight = async () => {
    if (!canMoveRight) return
    const newParent = lbsSiblings[lbsSiblingIdx - 1]
    const newSiblings = rawLbsNodesData.filter(n => n.parent_id === newParent.id)
    const newOrderIndex = newSiblings.length > 0 ? Math.max(...newSiblings.map(n => n.order_index)) + 1 : 0
    await supabase.from('lbs_nodes').update({ parent_id: newParent.id, order_index: newOrderIndex }).eq('id', selectedLbsNode.id)
    setCollapsedIds(prev => { const next = new Set(prev); next.delete(newParent.id); return next })
    invalidateLbs()
  }

  const handleAddLbsChild = async () => {
    if (!lbsChildForm.name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Başlık adı boş olamaz.', onCloseAction: () => setDialogAlert() })
      return
    }
    if (activeNodeId) {
      const hasMahal = rawMahaller.some(m => m.lbs_node_id === activeNodeId)
      if (hasMahal) {
        setDialogAlert({
          dialogIcon: 'warning',
          dialogMessage: 'Bu düğümün altında mahaller mevcut olduğundan alt başlık eklenemez.',
          detailText: 'Mahaller yalnızca yaprak düğümlere bağlıdır.',
          onCloseAction: () => setDialogAlert(),
        })
        return
      }
    }
    const siblings = rawLbsNodesData.filter(n => (n.parent_id ?? null) === activeNodeId)
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order_index)) : -1
    setLbsChildSaving(true)
    const { error } = await supabase.from('lbs_nodes').insert({
      project_id: selectedProje.id,
      parent_id: activeNodeId,
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

  const handleAddMahal = async () => {
    if (!mahalForm.name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal adı boş olamaz.', onCloseAction: () => setDialogAlert() })
      return
    }
    setMahalSaving(true)
    const { data: wppData, error: wppError } = await supabase
      .from('work_package_pozlar')
      .select('id')
      .eq('work_package_id', selectedIsPaket.id)
      .eq('project_poz_id', selectedPoz.id)
      .maybeSingle()
    if (wppError || !wppData) {
      setMahalSaving(false)
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İş paketi poz bağlantısı bulunamadı.', onCloseAction: () => setDialogAlert() })
      return
    }
    const existingAreas = rawMahaller.filter(m => m.lbs_node_id === activeNodeId)
    const maxOrder = existingAreas.length > 0 ? Math.max(...existingAreas.map(m => m.order_index ?? 0)) : -1
    const { data: newArea, error: areaError } = await supabase.from('work_areas').insert({
      project_id: selectedProje.id,
      lbs_node_id: activeNodeId,
      code: mahalForm.code.trim() || null,
      name: mahalForm.name.trim(),
      area: mahalForm.area ? Number(mahalForm.area) : null,
      order_index: maxOrder + 1,
    }).select().single()
    if (areaError) {
      setMahalSaving(false)
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal kaydedilemedi.', detailText: areaError.message, onCloseAction: () => setDialogAlert() })
      return
    }
    const { error: linkError } = await supabase.from('work_package_poz_areas').insert({
      work_package_poz_id: wppData.id,
      work_area_id: newArea.id,
      order_index: maxOrder + 1,
    })
    if (linkError) {
      setMahalSaving(false)
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal bağlantısı kurulamadı.', detailText: linkError.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setMahalForm({ code: '', name: '', area: '' })
    setShow('Main')
    setMahalSaving(false)
    invalidateAreas()
  }

  const handleDeleteLbsNode = () => {
    if (!selectedLbsNode) return
    const hasMahal = rawMahaller.some(m => m.lbs_node_id === activeNodeId)
    const hasChildren = rawLbsNodesData.some(n => n.parent_id === activeNodeId)
    if (hasMahal || hasChildren) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Bu düğüm silinemez.',
        detailText: hasMahal ? 'Altında mahaller mevcut. Önce mahalleri silin.' : 'Altında alt başlıklar mevcut. Önce alt başlıkları silin.',
        onCloseAction: () => setDialogAlert(),
      })
      return
    }
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: `"${selectedLbsNode.name}" silinsin mi?`,
      actionText1: 'Sil',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase.from('lbs_nodes').delete().eq('id', activeNodeId)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Silinemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
          return
        }
        setActiveNodeId(null)
        invalidateLbs()
      },
      actionText2: 'İptal',
      action2: () => setDialogAlert(),
      onCloseAction: () => setDialogAlert(),
    })
  }

  const nodeAreaTotals = useMemo(() => {
    const cache = {}
    rawLbsNodesData.forEach(n => getSubtreeArea(n.id, rawLbsNodesData, rawMahaller, cache))
    return cache
  }, [rawLbsNodesData, rawMahaller])

  const nodeOnayTotals = useMemo(() => {
    const cache = {}
    rawLbsNodesData.forEach(n => getSubtreeMetrajSum(n.id, rawLbsNodesData, rawMahaller, mahalOnayMap, cache))
    return cache
  }, [rawLbsNodesData, rawMahaller, mahalOnayMap])

  const nodeHazTotalsPerPreparer = useMemo(() => {
    return preparersList.map(p => {
      const cache = {}
      rawLbsNodesData.forEach(n => getSubtreeMetrajSum(n.id, rawLbsNodesData, rawMahaller, p.map, cache))
      return { id: p.id, display_name: p.display_name, totals: cache }
    })
  }, [rawLbsNodesData, rawMahaller, preparersList])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  const handleMahalClick = (mahal) => {
    setSelectedMahal(mahal)
    setSelectedMahal_metraj({ wpAreaId: mahal.wpAreaId, name: mahal.name, code: mahal.code })
    navigate('/metraj/cetvel')
  }

  const getGridColsTemplate = () => {
    const depthCols = `repeat(${totalDepthCols}, 1rem)`
    const hazCount = Math.max(1, preparersList.length)
    const hazCols = Array(hazCount).fill('8rem').join(' ')

    if (metrajMahalViewMode === 'mahalOnly') {
      return `max-content minmax(20rem, max-content) 8rem 8rem ${hazCols}`
    }

    // lbsMahal modu: tam grid + metraj
    return `${depthCols} max-content minmax(20rem, max-content) 8rem 8rem ${hazCols}`
  }

  const treeGridCols = getGridColsTemplate()

  const css_baslik = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: '0.4rem',
    py: '0.3rem',
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    borderBottom: '1px solid #333',
    whiteSpace: 'nowrap',
  }

  const css_baslik_onaylanan = {
    ...css_baslik,
    px: '4px',
    ml: '0.5rem',
    mr: '0.5rem',
  }

  const css_baslik_hazirlanlan = {
    ...css_baslik,
    px: '4px',
  }

  const css_satir_bg = '#c8cdd4'
  const css_satir_hover = '#a8b0bb'

  return (
    <Box sx={{ overflow: 'hidden', height: '100%' }}>

      {dialogAlert && (
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
      )}

      {/* Main header */}
      <Paper sx={{ p: '0.5rem 1rem', boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconButton sx={{ m: 0, p: '4px' }} onClick={() => navigate('/metraj/pozlar')}>
              <ReplyIcon sx={{ color: 'gray', fontSize: 18 }} />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Metraj</Typography>
            <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Mahaller</Typography>
          </Box>
          <Tooltip title={`Görünüm: ${viewModeLabel} (tıkla: sonraki mod)`}>
            <Button
              size="small"
              variant="outlined"
              onClick={cycleViewMode}
              startIcon={<ViewAgendaIcon />}
              sx={{
                textTransform: 'none',
                minWidth: '5.25rem',
                px: '0.5rem',
                color: 'text.secondary',
                borderColor: 'grey.400',
                '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' },
              }}
            >
              {viewModeLabel}
            </Button>
          </Tooltip>
        </Box>

        {/* Node action row — shown inline when a LBS node is selected */}
        {activeNodeId && metrajMahalViewMode === 'lbsMahal' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', mt: '0.25rem', pt: '0.25rem', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: nodeColor(selectedLbsNode?.depth ?? 0).bg, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, mr: '0.25rem', flexShrink: 0 }}>{selectedLbsNode?.name}</Typography>
            <Tooltip title="Yukarı taşı"><span>
              <IconButton size="small" onClick={handleMoveUp} disabled={!canMoveUp} sx={{ p: '2px' }}>
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </span></Tooltip>
            <Tooltip title="Aşağı taşı"><span>
              <IconButton size="small" onClick={handleMoveDown} disabled={!canMoveDown} sx={{ p: '2px' }}>
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            </span></Tooltip>
            <Tooltip title="Sol'a taşı (üst seviyeye)"><span>
              <IconButton size="small" onClick={handleMoveLeft} disabled={!canMoveLeft} sx={{ p: '2px' }}>
                <KeyboardArrowLeftIcon fontSize="small" />
              </IconButton>
            </span></Tooltip>
            <Tooltip title="Sağ'a taşı (bir üst kardeşin altına)"><span>
              <IconButton size="small" onClick={handleMoveRight} disabled={!canMoveRight} sx={{ p: '2px' }}>
                <KeyboardArrowRightIcon fontSize="small" />
              </IconButton>
            </span></Tooltip>
            <Tooltip title={isLeafSet.has(activeNodeId) ? 'Mahal ekle' : 'Alt LBS başlık ekle'}>
              <IconButton size="small" sx={{ p: '2px' }} onClick={() => {
                if (isLeafSet.has(activeNodeId)) {
                  setMahalForm({ code: '', name: '', area: '' })
                  setShow('MahalCreate')
                } else {
                  setLbsChildForm({ name: '', codeName: '' })
                  setShow('LbsChildCreate')
                }
              }}>
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Seçili düğümü sil">
              <IconButton size="small" sx={{ p: '2px' }} onClick={handleDeleteLbsNode}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>

      {/* LBS child create form */}
      {show === 'LbsChildCreate' && (
        <Paper sx={{ px: '1rem', py: '0.5rem', boxShadow: 1, backgroundColor: '#fffde7', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {activeNodeId ? `"${selectedLbsNode?.name}" altına alt başlık:` : 'Kök LBS başlık:'}
          </Typography>
          <TextField
            size="small" label="Başlık Adı" value={lbsChildForm.name}
            onChange={e => setLbsChildForm(p => ({ ...p, name: e.target.value }))}
            sx={{ minWidth: '12rem' }} inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <TextField
            size="small" label="Kod (opsiyonel)" value={lbsChildForm.codeName}
            onChange={e => setLbsChildForm(p => ({ ...p, codeName: e.target.value }))}
            sx={{ minWidth: '8rem' }} inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <Button size="small" variant="contained" onClick={handleAddLbsChild} disabled={lbsChildSaving}>Kaydet</Button>
          <Button size="small" onClick={() => setShow('Main')}>İptal</Button>
        </Paper>
      )}

      {/* Mahal create form */}
      {show === 'MahalCreate' && (
        <Paper sx={{ px: '1rem', py: '0.5rem', boxShadow: 1, backgroundColor: '#fffde7', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {`"${selectedLbsNode?.name}" altına yeni mahal:`}
          </Typography>
          <TextField
            size="small" label="Kod (opsiyonel)" value={mahalForm.code}
            onChange={e => setMahalForm(p => ({ ...p, code: e.target.value }))}
            sx={{ minWidth: '8rem' }} inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <TextField
            size="small" label="Mahal Adı" value={mahalForm.name}
            onChange={e => setMahalForm(p => ({ ...p, name: e.target.value }))}
            sx={{ minWidth: '14rem' }} inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <TextField
            size="small" label="Alan m²" value={mahalForm.area} type="number"
            onChange={e => setMahalForm(p => ({ ...p, area: e.target.value }))}
            sx={{ minWidth: '7rem' }} inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <Button size="small" variant="contained" onClick={handleAddMahal} disabled={mahalSaving}>Kaydet</Button>
          <Button size="small" onClick={() => setShow('Main')}>İptal</Button>
        </Paper>
      )}

      {(lbsLoading || wpAreasLoading) && <LinearProgress />}

      {wpAreasError && <Alert severity="error" sx={{ m: '1rem' }}>Veri alınırken hata: {wpAreasError.message}</Alert>}

      {!lbsLoading && !wpAreasLoading && rawMahaller.length === 0 && !wpAreasError && (
        <Alert severity="info" sx={{ m: '1rem' }}>Bu pozda henüz mahal atanmamış.</Alert>
      )}

      {!lbsLoading && rawMahaller.length > 0 && !wpAreasError && (
        <Box sx={{ p: '1rem', overflow: 'auto', height: `calc(100% - 5rem)` }}>

          {/* ===== MAHAL ONLY MODE ===== */}
          {metrajMahalViewMode === 'mahalOnly' && !wpAreasError && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>
              {/* Headers */}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Mahal Adı</Box>
              <Box sx={{ ...css_baslik }}>Alan</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>
              {preparersList.length === 0
                ? <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
                : preparersList.map(p => <Box key={p.id} sx={{ ...css_baslik_hazirlanlan }}>{p.display_name}</Box>)}

              {/* Only mahal rows, flat list */}
              {rawMahaller.map(mahal => {
                const isHovered = hoveredMahalId === mahal.id
                const rowBg = isHovered ? css_satir_hover : css_satir_bg
                const mahalTs = isHovered ? '0 0 0.65px #333, 0 0 0.65px #333' : 'none'
                return (
                  <React.Fragment key={mahal.id}>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textShadow: mahalTs }}>
                      {mahal.code}
                    </Box>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', textShadow: mahalTs }}>
                      {mahal.name}
                    </Box>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer', textShadow: mahalTs }}>
                      {ikiHane(mahal.area)}{mahal.area != null && mahal.area !== '' ? ' m²' : ''}
                    </Box>
                    {/* Onaylanan */}
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, ml: '0.5rem', mr: '0.5rem', px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', textShadow: mahalTs }}>
                      {mahalOnayMap[mahal.wpAreaId]
                        ? `${ikiHane(mahalOnayMap[mahal.wpAreaId])}${pozBirim ? ` ${pozBirim}` : ''}`
                        : '—'}
                    </Box>
                    {/* Hazırlanan — per preparer */}
                    {(preparersList.length === 0 ? [null] : preparersList).map((p) => (
                      <Box key={p?.id ?? 'haz'} onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', textShadow: mahalTs }}>
                        {p?.map[mahal.wpAreaId]
                          ? `${ikiHane(p.map[mahal.wpAreaId])}${pozBirim ? ` ${pozBirim}` : ''}`
                          : '—'}
                      </Box>
                    ))}
                  </React.Fragment>
                )
              })}
            </Box>
          )}

          {/* ===== LBS + MAHAL MODE (default) ===== */}
          {metrajMahalViewMode === 'lbsMahal' && !wpAreasError && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>
              {/* Headers */}
              {Array.from({ length: totalDepthCols }).map((_, i) => <Box key={`h-depth-${i}`} sx={{ ...css_baslik }} />)}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Mahal Adı</Box>
              <Box sx={{ ...css_baslik }}>Alan</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>
              {preparersList.length === 0
                ? <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
                : preparersList.map(p => <Box key={p.id} sx={{ ...css_baslik_hazirlanlan }}>{p.display_name}</Box>)}

              {/* LBS nodes and mahal rows with tree structure */}
              {flatNodes.map(node => {
                const isLeaf = isLeafSet.has(node.id)
                const isCollapsed = collapsedIds.has(node.id)
                const mahallersOfNode = rawMahaller.filter(m => m.lbs_node_id === node.id)
                const c = nodeColor(node.depth)
                const totalCols = totalDepthCols + 5
                const isHoveredNode = hoveredNodeId === node.id
                const isActiveNode = activeNodeId === node.id
                const nodeTs = isHoveredNode ? '0 0 0.55px currentColor, 0 0 0.55px currentColor' : 'none'

                return (
                  <React.Fragment key={node.id}>
                    {/* LBS node header row */}
                    {Array.from({ length: node.depth }).map((_, i) => (
                      <Box key={`nd-${node.id}-${i}`}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                        sx={{ backgroundColor: nodeColor(i).bg, cursor: 'pointer' }}
                      />
                    ))}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      sx={{
                        gridColumn: `span ${totalCols - node.depth - 3}`,
                        backgroundColor: c.bg,
                        color: c.co,
                        display: 'flex',
                        alignItems: 'stretch',
                        userSelect: 'none',
                      }}
                    >
                      {/* Name area — collapse for non-leaf */}
                      <Box
                        onClick={() => { if (!isLeaf) toggleCollapse(node.id) }}
                        sx={{ pl: '6px', py: '1px', cursor: !isLeaf ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {!isLeaf && (
                          <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                            {isCollapsed ? '▶' : '▼'}
                          </Box>
                        )}
                        {isLeaf && (
                          <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#65FF00', flexShrink: 0 }} />
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                        </Typography>
                        {(isActiveNode || isHoveredNode) && (
                          <Box sx={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow', flexShrink: 0 }} />
                        )}
                      </Box>
                      {/* Right area — select for ALL nodes */}
                      <Box
                        onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                        sx={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '0.5rem', gap: '0.4rem' }}
                      >
                        {isLeaf && isActiveNode && mahallersOfNode.length > 0 && (
                          <Box sx={{ fontSize: '0.65rem', opacity: 0.7, flexShrink: 0 }}>
                            {mahallersOfNode.length} mahal
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* ALAN toplamı */}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                      sx={{
                        backgroundColor: c.bg,
                        color: c.co,
                        px: '4px', py: '1px',
                        fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}>
                      {nodeAreaTotals[node.id] ? `${ikiHane(nodeAreaTotals[node.id])} m²` : ''}
                    </Box>

                    {/* Onaylanan toplamı */}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                      sx={{ backgroundColor: c.bg, color: c.co, borderLeft: '0.5rem solid white', borderRight: '0.5rem solid white', px: '4px', py: '1px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', cursor: 'pointer' }}
                    >
                      {nodeOnayTotals[node.id] ? `${ikiHane(nodeOnayTotals[node.id])}${pozBirim ? ` ${pozBirim}` : ''}` : ''}
                    </Box>

                    {/* Hazırlanan toplamı — per preparer */}
                    {(nodeHazTotalsPerPreparer.length === 0 ? [{ id: 'haz', totals: {} }] : nodeHazTotalsPerPreparer).map(ph => (
                      <Box
                        key={ph.id}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                        sx={{ backgroundColor: c.bg, color: c.co, px: '4px', py: '1px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', cursor: 'pointer' }}
                      >
                        {ph.totals[node.id] ? `${ikiHane(ph.totals[node.id])}${pozBirim ? ` ${pozBirim}` : ''}` : ''}
                      </Box>
                    ))}

                    {/* Mahal rows — only show if leaf node and not collapsed */}
                    {isLeaf && !isCollapsed && mahallersOfNode.map(mahal => {
                      const isHovered = hoveredMahalId === mahal.id
                      const rowBg = isHovered ? css_satir_hover : css_satir_bg
                      const mahalTs = isHovered ? '0 0 0.65px #333, 0 0 0.65px #333' : 'none'

                      return (
                        <React.Fragment key={mahal.id}>
                          {/* Depth bars */}
                          {Array.from({ length: totalDepthCols }).map((_, i) => (
                            <Box
                              key={`d-${mahal.id}-${i}`}
                              onMouseEnter={() => setHoveredMahalId(mahal.id)}
                              onMouseLeave={() => setHoveredMahalId(null)}
                              onClick={() => handleMahalClick(mahal)}
                              sx={{
                                backgroundColor: i <= node.depth ? nodeColor(i).bg : 'transparent',
                                py: '2px',
                                cursor: 'pointer',
                              }}
                            />
                          ))}

                          {/* Kod */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            onClick={() => handleMahalClick(mahal)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textShadow: mahalTs }}
                          >
                            {mahal.code}
                          </Box>

                          {/* Mahal Adı */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            onClick={() => handleMahalClick(mahal)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', textShadow: mahalTs }}
                          >
                            {mahal.name}
                          </Box>

                          {/* Alan */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            onClick={() => handleMahalClick(mahal)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer', textShadow: mahalTs }}
                          >
                            {ikiHane(mahal.area)}{mahal.area != null && mahal.area !== '' ? ' m²' : ''}
                          </Box>

                          {/* Onaylanan */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            onClick={() => handleMahalClick(mahal)}
                            sx={{ backgroundColor: rowBg, ml: '0.5rem', mr: '0.5rem', px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', textShadow: mahalTs }}
                          >
                            {mahalOnayMap[mahal.wpAreaId]
                              ? `${ikiHane(mahalOnayMap[mahal.wpAreaId])}${pozBirim ? ` ${pozBirim}` : ''}`
                              : '—'}
                          </Box>

                          {/* Hazırlanan — per preparer */}
                          {(preparersList.length === 0 ? [null] : preparersList).map((p) => (
                            <Box
                              key={p?.id ?? 'haz'}
                              onMouseEnter={() => setHoveredMahalId(mahal.id)}
                              onMouseLeave={() => setHoveredMahalId(null)}
                              onClick={() => handleMahalClick(mahal)}
                              sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', textShadow: mahalTs }}
                            >
                              {p?.map[mahal.wpAreaId]
                                ? `${ikiHane(p.map[mahal.wpAreaId])}${pozBirim ? ` ${pozBirim}` : ''}`
                                : '—'}
                            </Box>
                          ))}
                        </React.Fragment>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
