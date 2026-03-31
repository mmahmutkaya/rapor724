import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes, useGetPozUnits, useGetWorkPackagePozlar } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import CheckIcon from '@mui/icons-material/Check'
import PersonIcon from '@mui/icons-material/Person'

const EMPTY_ARRAY = []

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function negStyle(v) {
  return v != null && Number(v) < 0 ? { color: '#8b0000', fontWeight: 700 } : {}
}

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

export default function P_IhalePozlar() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, setSelectedPoz, appUser, metrajMode, metrajViewMode, setMetrajViewMode, topBarHeight, subHeaderHeight, drawerWidth, hiddenMetrajUsers, setHiddenMetrajUsers
  } = useContext(StoreContext)

  const isApproveMode = metrajMode === 'approve'

  // Guards
  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/ihale')
  }, [selectedProje, selectedIsPaket, navigate])

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

  // Base queries
  const { data: rawWbsNodesData, isLoading: wbsLoading } = useGetWbsNodes()
  const { data: unitsData, isLoading: unitsLoading } = useGetPozUnits()
  const { data: wpPozlarData, isLoading: wpPozLoading, error: wpPozError } = useGetWorkPackagePozlar()

  const rawWbsNodes = rawWbsNodesData ?? EMPTY_ARRAY
  const units = unitsData ?? EMPTY_ARRAY
  const wpPozlar = wpPozlarData ?? EMPTY_ARRAY

  // Shared state
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [hoveredPozId, setHoveredPozId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)

  // Prepare-mode state
  const [preparersList, setPreparersList] = useState([])
  const [pozOnayMap, setPozOnayMap] = useState({})
  const [pozWithAreasSet, setPozWithAreasSet] = useState(null)

  // Approve-mode state
  const [userVisDialogOpen, setUserVisDialogOpen] = useState(false)
  const [sessionMap, setSessionMap] = useState(null)
  const [userMap, setUserMap] = useState({})
  const [columnUsers, setColumnUsers] = useState([])

  // Prepare/view-mode data fetch
  useEffect(() => {
    if (isApproveMode || wpPozlar.length === 0) return

    setPozWithAreasSet(null)
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id })

    ;(async () => {
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas || areas.length === 0) {
        setPozWithAreasSet(new Set())
        setPreparersList([])
        setPozOnayMap({})
        return
      }

      const withAreas = new Set()
      const areaToPoz = {}
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) { withAreas.add(pozId); areaToPoz[a.id] = pozId }
      })

      const areaIds = areas.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, created_by')
        .in('work_package_poz_area_id', areaIds)

      if (!sessions?.length) {
        setPozWithAreasSet(withAreas)
        setPreparersList([])
        setPozOnayMap({})
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
        setPozWithAreasSet(withAreas)
        setPreparersList([])
        setPozOnayMap({})
        return
      }

      function computeQty(line) {
        if (!line || line.line_type !== 'data') return 0
        const isEmpty = (v) => v === null || v === undefined || v === ''
        const vals = [Number(line.multiplier) === 1 ? null : line.multiplier, line.count, line.length, line.width, line.height]
        if (vals.every(isEmpty)) return 0
        return vals.map(v => isEmpty(v) ? 1 : (Number(v) || 0)).reduce((a, b) => a * b, 1)
      }

      const lineById = {}
      lines.forEach(l => { lineById[l.id] = l })

      const approvedChildrenOf = {}
      lines.forEach(l => {
        if (l.parent_line_id && l.status === 'approved') {
          approvedChildrenOf[l.parent_line_id] = true
        }
      })

      const onayMap = {}
      const userHazMaps = {}

      lines.forEach(line => {
        const pozId = areaToPoz[sessAreaMap[line.session_id]]
        const userId = sessUserMap[line.session_id]
        if (!pozId) return
        const qty = computeQty(line)

        if (line.status === 'approved' && !approvedChildrenOf[line.id]) {
          onayMap[pozId] = (onayMap[pozId] ?? 0) + qty
        } else if (line.status === 'pending') {
          if (!userHazMaps[userId]) userHazMaps[userId] = {}
          let delta = qty
          if (line.parent_line_id) {
            const parentLine = lineById[line.parent_line_id]
            if (parentLine) delta = qty - computeQty(parentLine)
          }
          userHazMaps[userId][pozId] = (userHazMaps[userId][pozId] ?? 0) + delta
        }
      })

      const uniqueUserIds = [...new Set(sessions.map(s => s.created_by))].filter(uid => userHazMaps[uid])
      let nameMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: rpcData } = await supabase.rpc('get_user_display_names', { user_ids: uniqueUserIds })
        rpcData?.forEach(u => { nameMap[u.id] = u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.id.slice(0, 8) })
      }

      const preparers = uniqueUserIds.map(uid => ({
        id: uid,
        display_name: nameMap[uid] ?? uid.slice(0, 8),
        map: userHazMaps[uid] ?? {}
      }))

      setPreparersList(preparers)
      setPozOnayMap(onayMap)
      setPozWithAreasSet(withAreas)
    })()
  }, [wpPozlar, isApproveMode])

  // Approve-mode data fetch
  useEffect(() => {
    if (!isApproveMode || wpPozlar.length === 0) return

    setSessionMap(null)
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id })

    ;(async () => {
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas || areas.length === 0) {
        setSessionMap({})
        setUserMap({})
        setColumnUsers([])
        return
      }

      const areaToPoz = {}
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) areaToPoz[a.id] = pozId
      })

      const areaIds = areas.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, created_by')
        .in('work_package_poz_area_id', areaIds)

      if (!sessions?.length) {
        setSessionMap({})
        setUserMap({})
        setColumnUsers([])
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
        setSessionMap({})
        setUserMap({})
        setColumnUsers([])
        return
      }

      function computeQty(line) {
        if (!line || line.line_type !== 'data') return 0
        const isEmpty = (v) => v === null || v === undefined || v === ''
        const vals = [Number(line.multiplier) === 1 ? null : line.multiplier, line.count, line.length, line.width, line.height]
        if (vals.every(isEmpty)) return 0
        return vals.map(v => isEmpty(v) ? 1 : (Number(v) || 0)).reduce((a, b) => a * b, 1)
      }

      const lineById = {}
      lines.forEach(l => { lineById[l.id] = l })

      const approvedChildrenOf = {}
      lines.forEach(l => {
        if (l.parent_line_id && l.status === 'approved') approvedChildrenOf[l.parent_line_id] = true
      })

      const sMap = {}
      const userIds = new Set()

      lines.forEach(line => {
        const pozId = areaToPoz[sessAreaMap[line.session_id]]
        const userId = sessUserMap[line.session_id]
        if (!pozId) return
        const qty = computeQty(line)

        if (!sMap[pozId]) sMap[pozId] = { approvedSum: null, byUser: {} }

        if (line.status === 'approved' && !approvedChildrenOf[line.id]) {
          sMap[pozId].approvedSum = (sMap[pozId].approvedSum ?? 0) + qty
          userIds.add(userId)
        } else if (line.status === 'pending') {
          if (!sMap[pozId].byUser[userId]) sMap[pozId].byUser[userId] = { pendingSum: null }
          let delta = qty
          if (line.parent_line_id) {
            const parentLine = lineById[line.parent_line_id]
            if (parentLine) delta = qty - computeQty(parentLine)
          }
          sMap[pozId].byUser[userId].pendingSum = (sMap[pozId].byUser[userId].pendingSum ?? 0) + delta
          userIds.add(userId)
        }
      })

      const uIds = Array.from(userIds)
      if (uIds.length > 0) {
        const { data: rpcData } = await supabase.rpc('get_user_display_names', { user_ids: uIds })
        const uMap = {}
        if (rpcData) {
          rpcData.forEach(u => {
            uMap[u.id] = {
              display_name: u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.id.slice(0, 8)
            }
          })
        }
        setUserMap(uMap)
        setColumnUsers(uIds)
      } else {
        setUserMap({})
        setColumnUsers([])
      }

      setSessionMap(sMap)
    })()
  }, [wpPozlar, isApproveMode])

  const isLoading = isApproveMode
    ? sessionMap === null
    : pozWithAreasSet === null

  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])

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

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = (u.name || '').replace(/²/g, '2').replace(/³/g, '3') })
    return m
  }, [units])

  const rawPozlar = useMemo(() => {
    if (isApproveMode)
      return wpPozlar.filter(wpp => wpp.project_poz && sessionMap && sessionMap[wpp.project_poz_id]).map(wpp => wpp.project_poz)
    return wpPozlar.filter(wpp => wpp.project_poz && pozWithAreasSet?.has(wpp.project_poz_id)).map(wpp => wpp.project_poz)
  }, [wpPozlar, sessionMap, pozWithAreasSet, isApproveMode])

  const visibleColumnUsers = useMemo(
    () => columnUsers.filter(uid => !hiddenMetrajUsers.has(uid)),
    [columnUsers, hiddenMetrajUsers]
  )

  const totalDepthCols = maxLeafDepth + 1

  const cycleViewMode = () => {
    setMetrajViewMode(prev => {
      if (prev === 'pozOnly') return 'wbsPoz'
      return 'pozOnly'
    })
  }

  const viewModeLabel = useMemo(() => {
    if (metrajViewMode === 'pozOnly') return 'Poz'
    return 'W+P'
  }, [metrajViewMode])

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

  const handleExpandAll = () => setCollapsedIds(new Set())
  const handleCollapseAll = () => setCollapsedIds(new Set(flatNodes.filter(n => !isLeafSet.has(n.id)).map(n => n.id)))

  const getGridColsTemplate = () => {
    const statusColWidth = '8rem'
    const depthCols = `repeat(${totalDepthCols}, 1rem)`
    const hazCount = Math.max(1, preparersList.length)
    const hazCols = Array(hazCount).fill(statusColWidth).join(' ')

    if (metrajViewMode === 'pozOnly') {
      if (isApproveMode) {
        const userCols = visibleColumnUsers.length > 0
          ? visibleColumnUsers.map(() => statusColWidth).join(' ')
          : ''
        return userCols ? `1rem 8rem minmax(20rem, max-content) ${statusColWidth} ${userCols}` : `1rem 8rem minmax(20rem, max-content) ${statusColWidth}`
      } else {
        return `1rem 8rem minmax(20rem, max-content) ${statusColWidth} ${hazCols}`
      }
    }

    // wbsPoz modu
    if (isApproveMode) {
      const userCols = visibleColumnUsers.length > 0
        ? visibleColumnUsers.map(() => statusColWidth).join(' ')
        : ''
      return userCols ? `1rem ${depthCols} 8rem minmax(20rem, max-content) ${statusColWidth} ${userCols}` : `1rem ${depthCols} 8rem minmax(20rem, max-content) ${statusColWidth}`
    } else {
      return `1rem ${depthCols} 8rem minmax(20rem, max-content) ${statusColWidth} ${hazCols}`
    }
  }

  const treeGridCols = getGridColsTemplate()

  const handlePozClick = (poz) => {
    setSelectedPoz(poz)
    navigate(`/metraj/pozlar/${poz.id}/mahaller?from=ihale`)
  }

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
    backgroundColor: '#111',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
  }

  const css_satir_bg = '#c8d4dd'
  const css_satir_hover = '#a5b8c8'

  return (
    <Box sx={{ overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      {isApproveMode ? (
        <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 2 }}>
          <Grid container alignItems="center" sx={{ px: '1rem', minHeight: '3.5rem' }}>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Typography onClick={() => navigate('/ihale')} sx={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.5, whiteSpace: 'nowrap', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}>İhale</Typography>
                <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{selectedIsPaket?.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs="auto" sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Tooltip title={collapsedIds.size > 0 ? 'Tümünü Aç' : 'Tümünü Özetle'}>
                <IconButton
                  size="small"
                  onClick={collapsedIds.size > 0 ? handleExpandAll : handleCollapseAll}
                  sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}
                >
                  {collapsedIds.size > 0 ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Kullanıcıları göster/gizle">
                <IconButton
                  size="small"
                  onClick={() => setUserVisDialogOpen(true)}
                  sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', ...(hiddenMetrajUsers.size > 0 ? { pl: '0.4rem', pr: '0.9rem' } : {}), '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}
                >
                  <Badge badgeContent={hiddenMetrajUsers.size} color="error" sx={{ '& .MuiBadge-badge': { right: -8 } }}>
                    <PersonIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
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
            </Grid>
          </Grid>
        </AppBar>
      ) : (
        <Paper sx={{ px: '1rem', boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', minHeight: '3.5rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Typography onClick={() => navigate('/ihale')} sx={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.5, whiteSpace: 'nowrap', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}>İhale</Typography>
              <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{selectedIsPaket?.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tooltip title={collapsedIds.size > 0 ? 'Tümünü Aç' : 'Tümünü Özetle'}>
                <IconButton
                  size="small"
                  onClick={collapsedIds.size > 0 ? handleExpandAll : handleCollapseAll}
                  sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}
                >
                  {collapsedIds.size > 0 ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
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
          </Box>
        </Paper>
      )}

      {(wbsLoading || unitsLoading || wpPozLoading) && <LinearProgress />}

      {wpPozError && (
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veri alınırken hata: {wpPozError.message}
        </Alert>
      )}

      {!isLoading && rawPozlar.length === 0 && (
        <Alert severity="info" sx={{ m: '1rem' }}>
          {isApproveMode ? 'Onaylanmaya hazır metraj bulunmuyor.' : 'Bu iş paketine henüz poz atanmamış.'}
        </Alert>
      )}

      {/* User visibility dialog (approve mode only) */}
      {isApproveMode && (
        <Dialog open={userVisDialogOpen} onClose={() => setUserVisDialogOpen(false)}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
            <Box component="span" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>Metraj Yapanlar</Box>
            <Tooltip title={hiddenMetrajUsers.size === 0 ? 'Hepsini Kaldır' : 'Hepsini Seç'}>
              <IconButton
                size="small"
                color="default"
                sx={{ mr: 0 }}
                onClick={hiddenMetrajUsers.size === 0
                  ? () => setHiddenMetrajUsers(new Set(columnUsers))
                  : () => setHiddenMetrajUsers(new Set())}
              >
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CheckIcon sx={{ fontSize: 20, color: hiddenMetrajUsers.size >= columnUsers.length ? 'text.secondary' : 'primary.main', ...(hiddenMetrajUsers.size < columnUsers.length && { filter: 'drop-shadow(0 0 1px currentColor)' }) }} />
                  <CheckIcon sx={{ fontSize: 20, ml: '-8px', color: hiddenMetrajUsers.size === 0 ? 'primary.main' : 'text.secondary', ...(hiddenMetrajUsers.size === 0 && { filter: 'drop-shadow(0 0 1px currentColor)' }) }} />
                </Box>
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
            <List>
              {columnUsers.map(uid => (
                <ListItem
                  key={uid}
                  secondaryAction={
                    <Switch
                      edge="end"
                      checked={!hiddenMetrajUsers.has(uid)}
                      onChange={(e) => {
                        const newHidden = new Set(hiddenMetrajUsers)
                        if (e.target.checked) {
                          newHidden.delete(uid)
                        } else {
                          newHidden.add(uid)
                        }
                        setHiddenMetrajUsers(newHidden)
                      }}
                    />
                  }
                >
                  <ListItemText
                    primary={userMap[uid]?.display_name ?? uid.slice(0, 8)}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      )}

      {/* Tree Grid */}
      {!isLoading && rawPozlar.length > 0 && (
        <Box sx={{ p: '1rem', overflow: 'auto', height: `calc(100% - 5rem)` }}>

          {/* ===== POZ ONLY MODE ===== */}
          {metrajViewMode === 'pozOnly' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content' }}>
              {/* Headers */}
              <Box sx={{ ...css_baslik }} />
              <Box sx={{ ...css_baslik }} />
              <Box sx={{ ...css_baslik }} />
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>

              {isApproveMode ? (
                visibleColumnUsers.map((uid, idx) => (
                  <Box key={uid} sx={{ ...css_baslik, justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', ...(idx > 0 ? { borderLeft: '1px dotted rgba(255,255,255,0.5)' } : {}) }}>
                    {userMap[uid]?.display_name ?? uid.slice(0, 8)}
                  </Box>
                ))
              ) : (
                preparersList.length === 0
                  ? <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
                  : preparersList.map(p => <Box key={p.id} sx={{ ...css_baslik_hazirlanlan }}>{p.display_name}</Box>)
              )}

              {/* Proje adı satırı */}
              <Box sx={{ backgroundColor: 'black' }} />
              <Box sx={{ gridColumn: 'span 2', backgroundColor: 'black', color: 'white', pl: '6px', py: '2px', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedProje?.name}</Typography>
              </Box>
              <Box sx={{ backgroundColor: 'black', ml: '0.5rem', mr: '0.5rem' }} />
              {isApproveMode
                ? visibleColumnUsers.map(uid => <Box key={`pn-${uid}`} sx={{ backgroundColor: 'black' }} />)
                : (preparersList.length === 0 ? [null] : preparersList).map((_, i) => <Box key={`pn-${i}`} sx={{ backgroundColor: 'black' }} />)
              }

              {/* Only poz rows, flat list */}
              {rawPozlar.map((poz) => {
                const isHovered = hoveredPozId === poz.id
                const rowBg = isHovered ? css_satir_hover : css_satir_bg
                const pozBirim = unitsMap[poz.unit_id] || ''

                return (
                  <React.Fragment key={poz.id}>
                    <Box
                      onMouseEnter={() => setHoveredPozId(poz.id)}
                      onMouseLeave={() => setHoveredPozId(null)}
                      sx={{ backgroundColor: 'black', cursor: 'pointer' }}
                    />

                    <Box
                      onMouseEnter={() => setHoveredPozId(poz.id)}
                      onMouseLeave={() => setHoveredPozId(null)}
                      sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {poz.code}
                    </Box>

                    <Box
                      onMouseEnter={() => setHoveredPozId(poz.id)}
                      onMouseLeave={() => setHoveredPozId(null)}
                      onClick={() => handlePozClick(poz)}
                      sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {poz.short_desc}
                    </Box>

                    {/* Approved column */}
                    <Box
                      onMouseEnter={() => setHoveredPozId(poz.id)}
                      onMouseLeave={() => setHoveredPozId(null)}
                      sx={{
                        backgroundColor: rowBg,
                        ml: '0.5rem',
                        mr: '0.5rem',
                        px: '6px',
                        py: '2px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.3rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        ...negStyle(isApproveMode ? sessionMap?.[poz.id]?.approvedSum : pozOnayMap[poz.id])
                      }}
                    >
                      {isApproveMode && sessionMap?.[poz.id]?.approvedSum != null
                        ? <>{ikiHane(sessionMap[poz.id].approvedSum)}{pozBirim ? ` ${pozBirim}` : ''}</>
                        : pozOnayMap[poz.id] != null
                          ? <>{ikiHane(pozOnayMap[poz.id])}{pozBirim ? ` ${pozBirim}` : ''}</>
                          : ''}
                    </Box>

                    {/* Mode-specific columns */}
                    {isApproveMode ? (
                      visibleColumnUsers.map((uid, idx) => {
                        const ud = sessionMap?.[poz.id]?.byUser?.[uid]
                        return (
                          <Box
                            key={uid}
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', ...(idx > 0 ? { borderLeft: '1px dotted rgba(0,0,0,0.3)' } : {}), ...negStyle(ud?.pendingSum) }}
                          >
                            {ud?.pendingSum != null ? <>{ikiHane(ud.pendingSum)}{pozBirim ? ` ${pozBirim}` : ''}</> : ''}
                          </Box>
                        )
                      })
                    ) : (
                      (preparersList.length === 0 ? [null] : preparersList).map(p => (
                        <Box
                          key={p?.id ?? 'haz'}
                          onMouseEnter={() => setHoveredPozId(poz.id)}
                          onMouseLeave={() => setHoveredPozId(null)}
                          sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', ...negStyle(p?.map[poz.id]) }}
                        >
                          {p?.map[poz.id] != null ? <>{ikiHane(p.map[poz.id])}{pozBirim ? ` ${pozBirim}` : ''}</> : ''}
                        </Box>
                      ))
                    )}
                  </React.Fragment>
                )
              })}
            </Box>
          )}

          {/* ===== WBS + POZ MODE (default) ===== */}
          {metrajViewMode === 'wbsPoz' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content' }}>

              {/* Headers */}
              <Box sx={{ ...css_baslik }} />
              {Array.from({ length: totalDepthCols }).map((_, i) => <Box key={`h-depth-${i}`} sx={{ ...css_baslik }} />)}
              <Box sx={{ ...css_baslik }} />
              <Box sx={{ ...css_baslik }} />
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>

              {isApproveMode ? (
                visibleColumnUsers.map((uid, idx) => (
                  <Box key={uid} sx={{ ...css_baslik, justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', ...(idx > 0 ? { borderLeft: '1px dotted rgba(255,255,255,0.5)' } : {}) }}>
                    {userMap[uid]?.display_name ?? uid.slice(0, 8)}
                  </Box>
                ))
              ) : (
                preparersList.length === 0
                  ? <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
                  : preparersList.map(p => <Box key={p.id} sx={{ ...css_baslik_hazirlanlan }}>{p.display_name}</Box>)
              )}

              {/* Proje adı satırı */}
              <Box sx={{ backgroundColor: 'black' }} />
              <Box sx={{ gridColumn: `span ${totalDepthCols + 2}`, backgroundColor: 'black', color: 'white', pl: '6px', py: '2px', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedProje?.name}</Typography>
              </Box>
              <Box sx={{ backgroundColor: 'black', ml: '0.5rem', mr: '0.5rem' }} />
              {isApproveMode
                ? visibleColumnUsers.map(uid => <Box key={`pn-wbs-${uid}`} sx={{ backgroundColor: 'black' }} />)
                : (preparersList.length === 0 ? [null] : preparersList).map((_, i) => <Box key={`pn-wbs-${i}`} sx={{ backgroundColor: 'black' }} />)
              }

              {/* WBS nodes and poz rows with tree structure */}
              {flatNodes.map((node) => {
                const isLeaf = isLeafSet.has(node.id)
                const isCollapsed = collapsedIds.has(node.id)
                const pozlarOfNode = rawPozlar.filter(p => p.wbs_node_id === node.id)
                const c = nodeColor(node.depth)

                let ancestorParentId = node.parent_id
                let isAncestorCollapsed = false
                while (ancestorParentId) {
                  if (collapsedIds.has(ancestorParentId)) { isAncestorCollapsed = true; break }
                  const par = flatNodes.find(n => n.id === ancestorParentId)
                  ancestorParentId = par?.parent_id
                }
                if (isAncestorCollapsed) return null

                return (
                  <React.Fragment key={node.id}>
                    {/* WBS node header row */}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      sx={{ backgroundColor: 'black' }}
                    />
                    {Array.from({ length: node.depth }).map((_, i) => (
                      <Box
                        key={`nd-${node.id}-${i}`}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        sx={{ backgroundColor: nodeColor(i).bg }}
                      />
                    ))}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      sx={{
                        gridColumn: `span ${totalDepthCols + 2 - node.depth}`,
                        pl: '6px',
                        py: '1px',
                        backgroundColor: c.bg,
                        color: c.co,
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                      }}
                    >
                      <Box
                        onClick={() => toggleCollapse(node.id)}
                        sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                      >
                        <Box sx={{ fontSize: '0.7rem', flexShrink: 0, color: (isCollapsed && (!isLeaf || pozlarOfNode.length > 0)) ? '#00e676' : 'inherit' }}>
                          {isCollapsed ? '▶' : '▼'}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Spacing for Onaylanan column */}
                    <Box
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      sx={{ backgroundColor: c.bg, borderLeft: '0.5rem solid white', borderRight: '0.5rem solid white' }}
                    />

                    {/* Spacing for preparer columns */}
                    {isApproveMode ? (
                      visibleColumnUsers.map((uid, idx) => (
                        <Box key={`space-${node.id}-${uid}`} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)} sx={{ backgroundColor: c.bg, ...(idx > 0 ? { borderLeft: '1px dotted rgba(255,255,255,0.5)' } : {}) }} />
                      ))
                    ) : (
                      (preparersList.length === 0 ? [null] : preparersList).map((_, i) => (
                        <Box key={`space-${node.id}-prep-${i}`} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)} sx={{ backgroundColor: c.bg }} />
                      ))
                    )}

                    {/* Poz rows — only show if leaf node and not collapsed */}
                    {isLeaf && !isCollapsed && pozlarOfNode.map(poz => {
                      const isHovered = hoveredPozId === poz.id
                      const rowBg = isHovered ? css_satir_hover : css_satir_bg
                      const pozBirim = unitsMap[poz.unit_id] || ''
                      return (
                        <React.Fragment key={poz.id}>
                          <Box sx={{ backgroundColor: 'black', cursor: 'pointer' }} />

                          {Array.from({ length: totalDepthCols }).map((_, i) => (
                            <Box
                              key={`d-${poz.id}-${i}`}
                              sx={{
                                backgroundColor: i <= node.depth ? nodeColor(i).bg : 'transparent',
                                py: '2px',
                                cursor: 'pointer',
                              }}
                            />
                          ))}

                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {poz.code}
                          </Box>

                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            onClick={() => handlePozClick(poz)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {poz.short_desc}
                          </Box>

                          {/* Onaylanan column */}
                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{
                              backgroundColor: rowBg,
                              ml: '0.5rem',
                              mr: '0.5rem',
                              px: '6px',
                              py: '2px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.3rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              ...negStyle(isApproveMode ? sessionMap?.[poz.id]?.approvedSum : pozOnayMap[poz.id])
                            }}
                          >
                            {isApproveMode && sessionMap?.[poz.id]?.approvedSum != null
                              ? <>{ikiHane(sessionMap[poz.id].approvedSum)}{pozBirim ? ` ${pozBirim}` : ''}</>
                              : pozOnayMap[poz.id] != null
                                ? <>{ikiHane(pozOnayMap[poz.id])}{pozBirim ? ` ${pozBirim}` : ''}</>
                                : ''}
                          </Box>

                          {/* Mode-specific columns */}
                          {isApproveMode ? (
                            visibleColumnUsers.map((uid, idx) => {
                              const ud = sessionMap?.[poz.id]?.byUser?.[uid]
                              return (
                                <Box
                                  key={uid}
                                  onMouseEnter={() => setHoveredPozId(poz.id)}
                                  onMouseLeave={() => setHoveredPozId(null)}
                                  sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', ...(idx > 0 ? { borderLeft: '1px dotted rgba(0,0,0,0.3)' } : {}), ...negStyle(ud?.pendingSum) }}
                                >
                                  {ud?.pendingSum != null ? <>{ikiHane(ud.pendingSum)}{pozBirim ? ` ${pozBirim}` : ''}</> : ''}
                                </Box>
                              )
                            })
                          ) : (
                            (preparersList.length === 0 ? [null] : preparersList).map(p => (
                              <Box
                                key={p?.id ?? 'haz'}
                                onMouseEnter={() => setHoveredPozId(poz.id)}
                                onMouseLeave={() => setHoveredPozId(null)}
                                sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', ...negStyle(p?.map[poz.id]) }}
                              >
                                {p?.map[poz.id] != null ? <>{ikiHane(p.map[poz.id])}{pozBirim ? ` ${pozBirim}` : ''}</> : ''}
                              </Box>
                            ))
                          )}
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
