import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas } from '../../hooks/useMongo'
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

export default function P_MetrajPozMahaller() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, setSelectedMahal, setSelectedMahal_metraj, appUser, metrajMahalViewMode, setMetrajMahalViewMode } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metraj')
    else if (!selectedPoz) navigate('/metraj/pozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  const { data: rawLbsNodesData = EMPTY_ARRAY, isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreasData = EMPTY_ARRAY, isLoading: wpAreasLoading, error: wpAreasError } = useGetWorkPackagePozAreas()

  const [hoveredMahalId, setHoveredMahalId] = useState(null)
  const [collapsedIds, setCollapsedIds] = useState(new Set())

  // Metraj data
  const [mahalOnayMap, setMahalOnayMap] = useState({})
  const [mahalHazMap, setMahalHazMap] = useState({})

  // Metraj data fetch
  useEffect(() => {
    if (wpAreasData.length === 0 || !appUser?.id) return

    ;(async () => {
      const areaIds = wpAreasData.map(a => a.id)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('work_package_poz_area_id, total_quantity, status, created_by')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'approved'])

      if (!sessions) {
        setMahalOnayMap({})
        setMahalHazMap({})
        return
      }

      const hazMap = {}
      const onayMap = {}

      sessions.forEach(s => {
        const areaId = s.work_package_poz_area_id
        if (!areaId) return

        if (s.status === 'approved') {
          onayMap[areaId] = (onayMap[areaId] ?? 0) + (s.total_quantity ?? 0)
        } else if (s.created_by === appUser.id) {
          hazMap[areaId] = (hazMap[areaId] ?? 0) + (s.total_quantity ?? 0)
        }
      })

      setMahalHazMap(hazMap)
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

  const handleMahalClick = (mahal) => {
    setSelectedMahal(mahal)
    setSelectedMahal_metraj({ wpAreaId: mahal.wpAreaId, name: mahal.name, code: mahal.code })
    navigate('/metraj/cetvel')
  }

  const getGridColsTemplate = () => {
    const depthCols = `repeat(${totalDepthCols}, 1rem)`

    if (metrajMahalViewMode === 'mahalOnly') {
      // Sadece mahal sütunları + metraj
      return `max-content minmax(20rem, max-content) 8rem 8rem 8rem`
    }

    // lbsMahal modu: tam grid + metraj
    return `${depthCols} max-content minmax(20rem, max-content) 8rem 8rem 8rem`
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
      </Paper>

      {(lbsLoading || wpAreasLoading) && <LinearProgress />}

      {wpAreasError && <Alert severity="error" sx={{ m: '1rem' }}>Veri alınırken hata: {wpAreasError.message}</Alert>}

      {!lbsLoading && !wpAreasLoading && rawMahaller.length === 0 && (
        <Alert severity="info" sx={{ m: '1rem' }}>Bu pozda henüz mahal atanmamış.</Alert>
      )}

      {!lbsLoading && rawMahaller.length > 0 && (
        <Box sx={{ p: '1rem', overflow: 'auto', height: `calc(100% - 5rem)` }}>

          {/* ===== MAHAL ONLY MODE ===== */}
          {metrajMahalViewMode === 'mahalOnly' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>
              {/* Headers */}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Mahal Adı</Box>
              <Box sx={{ ...css_baslik }}>Alan</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>
              <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>

              {/* Only mahal rows, flat list */}
              {rawMahaller.map(mahal => {
                const isHovered = hoveredMahalId === mahal.id
                const rowBg = isHovered ? css_satir_hover : css_satir_bg
                return (
                  <React.Fragment key={mahal.id}>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}>
                      {mahal.code}
                    </Box>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} onClick={() => handleMahalClick(mahal)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      {mahal.name}
                    </Box>
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}>
                      {ikiHane(mahal.area)}
                    </Box>
                    {/* Onaylanan */}
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} sx={{ backgroundColor: rowBg, ml: '0.5rem', mr: '0.5rem', px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {mahalOnayMap[mahal.wpAreaId]
                        ? <>
                            <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1565c0', mr: '4px' }} />
                            {ikiHane(mahalOnayMap[mahal.wpAreaId])}
                          </>
                        : '—'}
                    </Box>
                    {/* Hazırlanan */}
                    <Box onMouseEnter={() => setHoveredMahalId(mahal.id)} onMouseLeave={() => setHoveredMahalId(null)} sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {mahalHazMap[mahal.wpAreaId]
                        ? <>
                            <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#757575', mr: '4px' }} />
                            {ikiHane(mahalHazMap[mahal.wpAreaId])}
                          </>
                        : '—'}
                    </Box>
                  </React.Fragment>
                )
              })}
            </Box>
          )}

          {/* ===== LBS + MAHAL MODE (default) ===== */}
          {metrajMahalViewMode === 'lbsMahal' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content', minWidth: '100%' }}>
              {/* Headers */}
              {Array.from({ length: totalDepthCols }).map((_, i) => <Box key={`h-depth-${i}`} sx={{ ...css_baslik }} />)}
              <Box sx={{ ...css_baslik }}>Kod</Box>
              <Box sx={{ ...css_baslik }}>Mahal Adı</Box>
              <Box sx={{ ...css_baslik }}>Alan</Box>
              <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>
              <Box sx={{ ...css_baslik_hazirlanlan }}>Hazırlanan</Box>

              {/* LBS nodes and mahal rows with tree structure */}
              {flatNodes.map(node => {
                const isLeaf = isLeafSet.has(node.id)
                const isCollapsed = collapsedIds.has(node.id)
                const mahallersOfNode = rawMahaller.filter(m => m.lbs_node_id === node.id)
                const c = nodeColor(node.depth)
                const totalCols = totalDepthCols + 5

                return (
                  <React.Fragment key={node.id}>
                    {/* LBS node header row */}
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
                        gridColumn: `span ${totalCols - node.depth - 2}`,
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
                      {isLeaf && mahallersOfNode.length > 0 && (
                        <Box sx={{
                          ml: 'auto',
                          pr: '0.5rem',
                          fontSize: '0.65rem',
                          opacity: 0.7,
                          flexShrink: 0
                        }}>
                          {mahallersOfNode.length} mahal
                        </Box>
                      )}
                    </Box>

                    {/* Spacing for Onaylanan column */}
                    <Box sx={{ backgroundColor: c.bg, borderLeft: '0.5rem solid white', borderRight: '0.5rem solid white' }} />

                    {/* Spacing for Hazırlanan column */}
                    <Box sx={{ backgroundColor: c.bg }} />

                    {/* Mahal rows — only show if leaf node and not collapsed */}
                    {isLeaf && !isCollapsed && mahallersOfNode.map(mahal => {
                      const isHovered = hoveredMahalId === mahal.id
                      const rowBg = isHovered ? css_satir_hover : css_satir_bg

                      return (
                        <React.Fragment key={mahal.id}>
                          {/* Depth bars */}
                          {Array.from({ length: totalDepthCols }).map((_, i) => (
                            <Box
                              key={`d-${mahal.id}-${i}`}
                              sx={{
                                backgroundColor: i <= node.depth ? nodeColor(i).bg : 'transparent',
                                py: '2px',
                              }}
                            />
                          ))}

                          {/* Kod */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            {mahal.code}
                          </Box>

                          {/* Mahal Adı */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            onClick={() => handleMahalClick(mahal)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {mahal.name}
                          </Box>

                          {/* Alan */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem' }}
                          >
                            {ikiHane(mahal.area)}
                          </Box>

                          {/* Onaylanan */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            sx={{ backgroundColor: rowBg, ml: '0.5rem', mr: '0.5rem', px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
                          >
                            {mahalOnayMap[mahal.wpAreaId]
                              ? <>
                                  <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1565c0', mr: '4px' }} />
                                  {ikiHane(mahalOnayMap[mahal.wpAreaId])}
                                </>
                              : '—'}
                          </Box>

                          {/* Hazırlanan */}
                          <Box
                            onMouseEnter={() => setHoveredMahalId(mahal.id)}
                            onMouseLeave={() => setHoveredMahalId(null)}
                            sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
                          >
                            {mahalHazMap[mahal.wpAreaId]
                              ? <>
                                  <Box sx={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#757575', mr: '4px' }} />
                                  {ikiHane(mahalHazMap[mahal.wpAreaId])}
                                </>
                              : '—'}
                          </Box>
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
