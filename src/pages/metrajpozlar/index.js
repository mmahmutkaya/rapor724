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
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import IconButton from '@mui/material/IconButton'
import ReplyIcon from '@mui/icons-material/Reply'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'

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

export default function P_MetrajPozlar() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, setSelectedPoz, appUser, metrajMode, metrajViewMode, setMetrajViewMode, topBarHeight, subHeaderHeight, drawerWidth
  } = useContext(StoreContext)

  const isApproveMode = metrajMode === 'approve'

  // Guards
  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metraj')
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

  // Prepare-mode state
  const [pozHazMap, setPozHazMap] = useState({})
  const [pozOnayMap, setPozOnayMap] = useState({})
  const [pozWithAreasSet, setPozWithAreasSet] = useState(null)

  // Approve-mode state
  const [userVisDialogOpen, setUserVisDialogOpen] = useState(false)
  const [hiddenUsers, setHiddenUsers] = useState(new Set())
  const [sessionMap, setSessionMap] = useState(null)
  const [userMap, setUserMap] = useState({})
  const [columnUsers, setColumnUsers] = useState([])

  const preparedByLabel = useMemo(
    () => (appUser?.email?.split('@')?.[0] || appUser?.email || 'Hazirlayan').trim(),
    [appUser?.email]
  )

  // Prepare-mode data fetch
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
        setPozHazMap({})
        setPozOnayMap({})
        return
      }

      const withAreas = new Set()
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) withAreas.add(pozId)
      })

      const areaIds = areas.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('work_package_poz_area_id, total_quantity, status, created_by')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'approved'])

      if (!sessions) {
        setPozWithAreasSet(withAreas)
        setPozHazMap({})
        setPozOnayMap({})
        return
      }

      const hazMap = {}
      const onayMap = {}

      sessions.forEach(s => {
        const pozId = wppToPoz[areas.find(a => a.id === s.work_package_poz_area_id)?.work_package_poz_id]
        if (!pozId) return

        if (s.status === 'approved') {
          onayMap[pozId] = (onayMap[pozId] ?? 0) + (s.total_quantity ?? 0)
        } else if (s.created_by === appUser.id) {
          hazMap[pozId] = (hazMap[pozId] ?? 0) + (s.total_quantity ?? 0)
        }
      })

      setPozHazMap(hazMap)
      setPozOnayMap(onayMap)
      setPozWithAreasSet(withAreas)
    })()
  }, [wpPozlar, appUser?.id, isApproveMode])

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

      const areaIds = areas.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, total_quantity, status, created_by')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['ready', 'approved', 'revised', 'revise_requested'])

      if (!sessions) {
        setSessionMap({})
        setUserMap({})
        setColumnUsers([])
        return
      }

      // Build sessionMap
      const sMap = {}
      const userIds = new Set()

      sessions.forEach(s => {
        const area = areas.find(a => a.id === s.work_package_poz_area_id)
        const pozId = wppToPoz[area?.work_package_poz_id]
        if (!pozId) return

        if (!sMap[pozId]) sMap[pozId] = { byUser: {}, approvedSum: 0 }
        if (!sMap[pozId].byUser[s.created_by]) {
          sMap[pozId].byUser[s.created_by] = { readySum: 0, approvedSum: 0 }
        }

        if (s.status === 'approved') {
          sMap[pozId].approvedSum += s.total_quantity ?? 0
          sMap[pozId].byUser[s.created_by].approvedSum += s.total_quantity ?? 0
        } else if (s.status === 'ready') {
          sMap[pozId].byUser[s.created_by].readySum += s.total_quantity ?? 0
        }

        userIds.add(s.created_by)
      })

      // Fetch user display names
      const uIds = Array.from(userIds)
      if (uIds.length > 0) {
        const { data: rpcData } = await supabase.rpc('get_user_display_names', { user_ids: uIds })
        const uMap = {}
        if (rpcData) {
          rpcData.forEach(u => {
            uMap[u.id] = { first_name: u.first_name || '', last_name: u.last_name || '' }
          })
        }
        setUserMap(uMap)
        setColumnUsers(uIds)
      }

      setSessionMap(sMap)
    })()
  }, [wpPozlar, isApproveMode])

  // Clear hidden users on mode switch
  useEffect(() => {
    setHiddenUsers(new Set())
  }, [metrajMode])

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
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const rawPozlar = useMemo(() => {
    if (isApproveMode)
      return wpPozlar.filter(wpp => wpp.project_poz && sessionMap && sessionMap[wpp.project_poz_id]).map(wpp => wpp.project_poz)
    return wpPozlar.filter(wpp => wpp.project_poz && pozWithAreasSet?.has(wpp.project_poz_id)).map(wpp => wpp.project_poz)
  }, [wpPozlar, sessionMap, pozWithAreasSet, isApproveMode])

  const visibleColumnUsers = useMemo(
    () => columnUsers.filter(uid => !hiddenUsers.has(uid)),
    [columnUsers, hiddenUsers]
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

  const getGridColsTemplate = () => {
    const statusColWidth = '8rem'
    const depthCols = `repeat(${totalDepthCols}, 1rem)`

    if (metrajViewMode === 'pozOnly') {
      // Sadece poz sütunları, derinlik sütunları yok
      if (isApproveMode) {
        const userCols = visibleColumnUsers.length > 0
          ? visibleColumnUsers.map(() => statusColWidth).join(' ')
          : ''
        return userCols ? `max-content minmax(20rem, max-content) max-content ${statusColWidth} ${userCols}` : `max-content minmax(20rem, max-content) max-content ${statusColWidth}`
      } else {
        return `max-content minmax(20rem, max-content) max-content ${statusColWidth} ${statusColWidth}`
      }
    }

    // wbsPoz modu: tam grid derinlik + poz sütunları
    if (isApproveMode) {
      const userCols = visibleColumnUsers.length > 0
        ? visibleColumnUsers.map(() => statusColWidth).join(' ')
        : ''
      return userCols ? `${depthCols} max-content minmax(20rem, max-content) max-content ${statusColWidth} ${userCols}` : `${depthCols} max-content minmax(20rem, max-content) max-content ${statusColWidth}`
    } else {
      return `${depthCols} max-content minmax(20rem, max-content) max-content ${statusColWidth} ${statusColWidth}`
    }
  }

  const treeGridCols = getGridColsTemplate()

  const handlePozClick = (poz) => {
    setSelectedPoz(poz)
    navigate(`/metraj/pozlar/${poz.id}/mahaller`)
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
    justifyContent: 'flex-end',
  }

  const css_baslik_hazirlanlan = {
    ...css_baslik,
    px: '4px',
    justifyContent: 'flex-end',
  }

  const css_satir_bg = '#f2f2f2'
  const css_satir_hover = '#e0ecff'

  return (
    <Box sx={{ overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      {isApproveMode ? (
        <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 2 }}>
          <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem' }}>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconButton sx={{ m: 0, p: '4px' }} onClick={() => navigate('/metraj')}>
                  <ReplyIcon sx={{ color: 'gray', fontSize: 18 }} />
                </IconButton>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Metraj</Typography>
                <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.5 }}>Pozlar</Typography>
              </Box>
            </Grid>
            <Grid item xs="auto" sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
              <IconButton
                size="small"
                onClick={() => setUserVisDialogOpen(true)}
                sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
              >
                <Badge badgeContent={hiddenUsers.size} color="error">
                  Kullanıcılar
                </Badge>
              </IconButton>
            </Grid>
          </Grid>
        </AppBar>
      ) : (
        <Paper sx={{ p: '0.5rem 1rem', boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Metraj</Typography>
              <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
              <Typography variant="caption" sx={{ opacity: 0.5 }}>Pozlar</Typography>
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
          <DialogTitle>Görünen Kullanıcılar</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
            <List>
              {columnUsers.map(uid => (
                <ListItem
                  key={uid}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={!hiddenUsers.has(uid)}
                      onChange={(e) => {
                        const newHidden = new Set(hiddenUsers)
                        if (e.target.checked) {
                          newHidden.delete(uid)
                        } else {
                          newHidden.add(uid)
                        }
                        setHiddenUsers(newHidden)
                      }}
                    />
                  }
                >
                  <ListItemText
                    primary={`${userMap[uid]?.first_name || ''} ${userMap[uid]?.last_name || ''}`}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>
              {/* Headers */}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Açıklama</Box>
              <Box sx={{ ...css_baslik }}>Birim</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>

              {isApproveMode ? (
                visibleColumnUsers.map(uid => (
                  <Box key={uid} sx={{ ...css_baslik, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', mr: '0.5rem' }}>
                    <Box>{userMap[uid]?.first_name}</Box>
                    <Box>{userMap[uid]?.last_name}</Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
              )}

              {/* Only poz rows, flat list */}
              {rawPozlar.map((poz) => {
                const isHovered = hoveredPozId === poz.id
                const rowBg = isHovered ? css_satir_hover : css_satir_bg

                return (
                  <React.Fragment key={poz.id}>
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
                      sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {poz.short_desc}
                    </Box>

                    <Box
                      onMouseEnter={() => setHoveredPozId(poz.id)}
                      onMouseLeave={() => setHoveredPozId(null)}
                      sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}
                    >
                      {unitsMap[poz.unit_id] || ''}
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
                        overflow: 'hidden'
                      }}
                    >
                      {isApproveMode && sessionMap?.[poz.id]?.approvedSum
                        ? <>
                            <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2e7d32', mr: '4px' }} />
                            {ikiHane(sessionMap[poz.id].approvedSum)}
                          </>
                        : pozOnayMap[poz.id]
                          ? <>
                              <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1565c0', mr: '4px' }} />
                              {ikiHane(pozOnayMap[poz.id])}
                            </>
                          : '—'}
                    </Box>

                    {/* Mode-specific columns */}
                    {isApproveMode ? (
                      visibleColumnUsers.map(uid => {
                        const ud = sessionMap?.[poz.id]?.byUser?.[uid]
                        return (
                          <Box
                            key={uid}
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}
                          >
                            {ud?.approvedSum ? ikiHane(ud.approvedSum) : ud?.readySum ? ikiHane(ud.readySum) : '—'}
                          </Box>
                        )
                      })
                    ) : (
                      <Box
                        onMouseEnter={() => setHoveredPozId(poz.id)}
                        onMouseLeave={() => setHoveredPozId(null)}
                        sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
                      >
                        {pozHazMap[poz.id]
                          ? <>
                              <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#757575', mr: '4px' }} />
                              {ikiHane(pozHazMap[poz.id])}
                            </>
                          : '—'}
                      </Box>
                    )}
                  </React.Fragment>
                )
              })}
            </Box>
          )}

          {/* ===== WBS + POZ MODE (default) ===== */}
          {metrajViewMode === 'wbsPoz' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>

              {/* Headers */}
              {Array.from({ length: totalDepthCols }).map((_, i) => <Box key={`h-depth-${i}`} sx={{ ...css_baslik }} />)}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Açıklama</Box>
              <Box sx={{ ...css_baslik }}>Birim</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>

              {isApproveMode ? (
                visibleColumnUsers.map(uid => (
                  <Box key={uid} sx={{ ...css_baslik, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', mr: '0.5rem' }}>
                    <Box>{userMap[uid]?.first_name}</Box>
                    <Box>{userMap[uid]?.last_name}</Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>
              )}

              {/* WBS nodes and poz rows with tree structure */}
              {flatNodes.map(node => {
                const isLeaf = isLeafSet.has(node.id)
                const isCollapsed = collapsedIds.has(node.id)
                const pozlarOfNode = rawPozlar.filter(p => p.wbs_node_id === node.id)
                const c = nodeColor(node.depth)
                const totalCols = totalDepthCols + (isApproveMode ? 4 + visibleColumnUsers.length : 5)

                return (
                  <React.Fragment key={node.id}>
                    {/* WBS node header row */}
                    {Array.from({ length: node.depth }).map((_, i) => (
                      <Box key={`nd-${node.id}-${i}`} sx={{ backgroundColor: nodeColor(i).bg }} />
                    ))}
                    <Box
                      onClick={() => {
                        if (!isLeaf) {
                          toggleCollapse(node.id)
                        }
                      }}
                      sx={{
                        gridColumn: `span ${totalCols - node.depth - (isApproveMode ? 1 + visibleColumnUsers.length : 2)}`,
                        pl: '6px',
                        py: '1px',
                        backgroundColor: c.bg,
                        color: c.co,
                        cursor: !isLeaf ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        userSelect: 'none',
                        '&:hover': !isLeaf ? { filter: 'brightness(1.2)' } : {}
                      }}
                    >
                      {!isLeaf && (
                        <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                          {isCollapsed ? '▶' : '▼'}
                        </Box>
                      )}
                      {isLeaf && (
                        <Box sx={{
                          width: '0.45rem',
                          height: '0.45rem',
                          borderRadius: '50%',
                          backgroundColor: '#65FF00',
                          flexShrink: 0
                        }} />
                      )}
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                      </Typography>
                      {isLeaf && pozlarOfNode.length > 0 && (
                        <Box sx={{
                          ml: 'auto',
                          pr: '0.5rem',
                          fontSize: '0.65rem',
                          opacity: 0.7,
                          flexShrink: 0
                        }}>
                          {pozlarOfNode.length} poz
                        </Box>
                      )}
                    </Box>

                    {/* Spacing for Onaylanan column */}
                    <Box sx={{ backgroundColor: c.bg, borderLeft: '0.5rem solid white', borderRight: '0.5rem solid white' }} />

                    {/* Spacing for user columns (approve mode) or Hazırlayan (prepare mode) */}
                    {isApproveMode ? (
                      visibleColumnUsers.map(uid => (
                        <Box key={`space-${node.id}-${uid}`} sx={{ backgroundColor: c.bg }} />
                      ))
                    ) : (
                      <Box sx={{ backgroundColor: c.bg }} />
                    )}

                    {/* Poz rows — only show if leaf node and not collapsed */}
                    {isLeaf && !isCollapsed && pozlarOfNode.map(poz => {
                      const isHovered = hoveredPozId === poz.id
                      const rowBg = isHovered ? css_satir_hover : css_satir_bg

                      return (
                        <React.Fragment key={poz.id}>
                          {/* Depth bars */}
                          {Array.from({ length: totalDepthCols }).map((_, i) => (
                            <Box
                              key={`d-${poz.id}-${i}`}
                              sx={{
                                backgroundColor: i <= node.depth ? nodeColor(i).bg : 'transparent',
                                py: '2px',
                              }}
                            />
                          ))}

                          {/* Kod */}
                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {poz.code}
                          </Box>

                          {/* Açıklama */}
                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            onClick={() => handlePozClick(poz)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {poz.short_desc}
                          </Box>

                          {/* Birim */}
                          <Box
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}
                          >
                            {unitsMap[poz.unit_id] || ''}
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
                              overflow: 'hidden'
                            }}
                          >
                            {isApproveMode && sessionMap?.[poz.id]?.approvedSum
                              ? <>
                                  <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2e7d32', mr: '4px' }} />
                                  {ikiHane(sessionMap[poz.id].approvedSum)}
                                </>
                              : pozOnayMap[poz.id]
                                ? <>
                                    <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1565c0', mr: '4px' }} />
                                    {ikiHane(pozOnayMap[poz.id])}
                                  </>
                                : '—'}
                          </Box>

                          {/* Mode-specific columns */}
                          {isApproveMode ? (
                            visibleColumnUsers.map(uid => {
                              const ud = sessionMap?.[poz.id]?.byUser?.[uid]
                              return (
                                <Box
                                  key={uid}
                                  onMouseEnter={() => setHoveredPozId(poz.id)}
                                  onMouseLeave={() => setHoveredPozId(null)}
                                  sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', mr: '0.5rem' }}
                                >
                                  {ud?.approvedSum ? ikiHane(ud.approvedSum) : ud?.readySum ? ikiHane(ud.readySum) : '—'}
                                </Box>
                              )
                            })
                          ) : (
                            <Box
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
                            >
                              {pozHazMap[poz.id]
                                ? <>
                                    <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#757575', mr: '4px' }} />
                                    {ikiHane(pozHazMap[poz.id])}
                                  </>
                                : '—'}
                            </Box>
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

      {/* Dialogs */}
    </Box>
  )
}
