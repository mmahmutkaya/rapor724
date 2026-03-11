
import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import AppBar from '@mui/material/AppBar'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'


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
    { bg: '#7a3333', co: '#e6e6e6' },
    { bg: '#2d5c3a', co: '#e6e6e6' },
    { bg: '#2d4f80', co: '#e6e6e6' },
    { bg: '#6b5a2a', co: '#e6e6e6' },
    { bg: '#2d6060', co: '#e6e6e6' },
    { bg: '#4a2d7a', co: '#e6e6e6' },
    { bg: '#6b2d50', co: '#e6e6e6' },
    { bg: '#505050', co: '#e6e6e6' },
  ]
  return palette[depth % palette.length]
}

function sessionBg(status) {
  if (status === 'ready')    return '#C8E6C9'
  if (status === 'approved') return '#B3E5FC'
  return '#f0f0f0'
}

export default function P_MetrajOnaylaPozMahaller() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, selectedPoz,
    setSelectedMahal_metraj, appUser
  } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreas = [], isLoading: areasLoading, error: areasError } = useGetWorkPackagePozAreas()
  const { data: units = [] } = useGetPozUnits()

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  // wpAreaId → { byUser: { userId: { session, userName } }, approvedSession }
  const [sessionsMap, setSessionsMap] = useState({})
  // ordered array of { id, name }
  const [sessionUsers, setSessionUsers] = useState([])

  const isLoading = lbsLoading || areasLoading
  const queryError = areasError

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) navigate('/metrajonayla')
    else if (!selectedPoz) navigate('/metrajonaylapozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  useEffect(() => {
    if (!wpAreas || wpAreas.length === 0) {
      setSessionsMap({})
      setSessionUsers([])
      return
    }

    const areaIds = wpAreas.map(a => a.id);

    (async () => {
      const { data: sessions, error: sessionsError } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, status, total_quantity, created_by, updated_at, creator:users!created_by(first_name, last_name)')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['ready', 'approved'])
        .order('updated_at', { ascending: false })

      if (sessionsError || !sessions || sessions.length === 0) {
        setSessionsMap({})
        setSessionUsers([])
        return
      }

      // Build userMap from joined creator data
      const uniqueUserIds = [...new Set(sessions.map(s => s.created_by).filter(Boolean))]
      const userMap = {}
      sessions.forEach(s => {
        if (s.created_by && s.creator && !userMap[s.created_by]) {
          userMap[s.created_by] = [s.creator.first_name, s.creator.last_name].filter(Boolean).join(' ') || s.created_by
        }
      })

      // Build sessionsMap
      const newMap = {}
      sessions.forEach(s => {
        const areaId = s.work_package_poz_area_id
        if (!newMap[areaId]) newMap[areaId] = { byUser: {}, approvedSession: null }

        if (s.status === 'approved') {
          if (!newMap[areaId].approvedSession) {
            newMap[areaId].approvedSession = s
          }
        } else if (s.status === 'ready') {
          const uid = s.created_by
          if (uid && !newMap[areaId].byUser[uid]) {
            newMap[areaId].byUser[uid] = { session: s, userName: userMap[uid] ?? uid }
          }
        }
      })

      setSessionsMap(newMap)

      // Build ordered user list
      const users = uniqueUserIds.map(uid => ({ id: uid, name: userMap[uid] ?? uid }))
      users.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
      setSessionUsers(users)
    })()
  }, [wpAreas])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  const rawMahaller = useMemo(() =>
    wpAreas
      .filter(wpa => wpa.work_area)
      .map(wpa => ({ ...wpa.work_area, wpAreaId: wpa.id }))
  , [wpAreas])

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

  function nodeHasMahal(nodeId) {
    if (rawMahaller.some(m => m.lbs_node_id === nodeId)) return true
    return rawLbsNodes.filter(n => n.parent_id === nodeId).some(c => nodeHasMahal(c.id))
  }

  const handleMahalClick = (mahal) => {
    setSelectedMahal_metraj({
      wpAreaId: mahal.wpAreaId,
      name: mahal.name,
      code: mahal.code,
    })
    navigate('/metrajonaylacetvel')
  }

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  return (
    <Box sx={{ m: '0rem' }}>

      {/* BAŞLIK */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <IconButton sx={{ m: 0, p: 0 }} onClick={() => navigate('/metrajonaylapozlar')}>
                <ReplyIcon sx={{ color: 'gray' }} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonayla')}
              >
                Metraj Onayla
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600, opacity: 0.4, cursor: 'pointer',
                  maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => navigate('/metrajonaylapozlar')}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600, opacity: 0.6,
                  maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  cursor: 'pointer', '&:hover': { opacity: 0.9 }
                }}
                onClick={() => navigate('/metrajonaylapozlar')}
              >
                {pozLabel}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Mahaller
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {isLoading &&
        <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>
      }

      {!isLoading && queryError &&
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veri alınırken hata oluştu.<br /><small style={{ opacity: 0.7 }}>{queryError.message}</small>
        </Alert>
      }

      {!isLoading && !queryError && rawMahaller.length === 0 && rawLbsNodes.length > 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Bu iş paketi + poz kombinasyonuna henüz mahal atanmamış.
        </Alert>
      }

      {/* AĞAÇ GÖRÜNÜMÜ */}
      {!isLoading && !queryError && rawLbsNodes.length > 0 && rawMahaller.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          const userColCount = sessionUsers.length
          const totalCols = totalDepthCols + 3 + userColCount + 1
          const userColWidth = 'minmax(7rem, 10rem)'
          const treeGridCols = [
            `repeat(${totalDepthCols}, 1rem)`,
            'max-content',
            'minmax(20rem, max-content)',
            'max-content',
            ...Array(userColCount).fill(userColWidth),
            userColWidth,
          ].join(' ')

          const css_header = {
            px: '4px', py: '2px',
            backgroundColor: '#e0e0e0',
            borderBottom: '1px solid #bbb',
            fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }

          return (
            <Box sx={{ p: '0.5rem', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ backgroundColor: 'black', color: 'white', pl: '4px', py: '2px' }}>
                  <Typography variant="body2">{selectedProje?.name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {/* SÜTUN BAŞLIKLARI */}
                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                    <Box key={`hd-depth-${i}`} sx={{ ...css_header, backgroundColor: 'transparent' }} />
                  ))}
                  <Box sx={{ ...css_header }}>Kod</Box>
                  <Box sx={{ ...css_header, justifyContent: 'flex-start' }}>Mahal</Box>
                  <Box sx={{ ...css_header }}>Alan</Box>
                  {sessionUsers.map(user => (
                    <Box key={`hd-${user.id}`} sx={{ ...css_header, flexDirection: 'column', lineHeight: 1.2 }}>
                      <span>{user.name.split(' ')[0]}</span>
                      <span>{user.name.split(' ').slice(1).join(' ')}</span>
                    </Box>
                  ))}
                  <Box sx={{ ...css_header, backgroundColor: '#B3E5FC', color: '#01579B' }}>Onaylanan</Box>

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    if (!nodeHasMahal(node.id)) return null

                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const c = nodeColor(depth)
                    const mahallerOfNode = rawMahaller
                      .filter(m => m.lbs_node_id === node.id)
                      .sort((a, b) => a.order_index - b.order_index)

                    return (
                      <React.Fragment key={node.id}>
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}
                        <Box
                          onClick={() => { if (!isLeaf) toggleCollapse(node.id) }}
                          sx={{
                            gridColumn: `span ${totalCols - depth}`,
                            pl: '6px', py: '1px',
                            backgroundColor: c.bg, color: c.co,
                            cursor: isLeaf ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            userSelect: 'none',
                            '&:hover': { filter: isLeaf ? 'none' : 'brightness(1.2)' }
                          }}
                        >
                          {!isLeaf && <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>{collapsedIds.has(node.id) ? '▶' : '▼'}</Box>}
                          {isLeaf && <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#65FF00', flexShrink: 0 }} />}
                          <Typography variant="body2">
                            {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                          </Typography>
                          {isLeaf && mahallerOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                              {mahallerOfNode.length} mahal
                            </Box>
                          }
                        </Box>

                        {/* MAHAL SATIRLARI */}
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => {
                          const areaData = sessionsMap[mahal.wpAreaId] ?? { byUser: {}, approvedSession: null }
                          const hasAnyData = sessionUsers.some(u => areaData.byUser[u.id]) || !!areaData.approvedSession

                          return (
                            <React.Fragment key={mahal.id}>
                              {Array.from({ length: totalDepthCols }).map((_, i) => (
                                <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                              ))}

                              {/* Mahal kodu */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd', borderLeft: '1px solid #aaa',
                                  fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: hasAnyData ? '#f0f4ff' : '#f0f0f0',
                                  cursor: 'pointer', '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.code || '—'}
                              </Box>

                              {/* Mahal adı */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.875rem', display: 'flex', alignItems: 'center',
                                  backgroundColor: hasAnyData ? '#f0f4ff' : '#f0f0f0',
                                  cursor: 'pointer', '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.name}
                              </Box>

                              {/* Alan */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  backgroundColor: hasAnyData ? '#f0f4ff' : '#f0f0f0',
                                  whiteSpace: 'nowrap', cursor: 'pointer', '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.area != null ? `${mahal.area} m²` : '—'}
                              </Box>

                              {/* Per-user ready sessions */}
                              {sessionUsers.map(user => {
                                const ud = areaData.byUser[user.id]
                                const ses = ud?.session
                                return (
                                  <Tooltip key={`cell-${mahal.id}-${user.id}`} title={ses ? 'Onaya hazır — görüntüle' : ''} placement="top">
                                    <Box
                                      onClick={() => handleMahalClick(mahal)}
                                      sx={{
                                        px: '6px', py: '2px', borderBottom: '0.5px solid #ddd', borderLeft: '1px solid #e0e0e0',
                                        fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        backgroundColor: ses ? sessionBg('ready') : '#f5f5f5',
                                        whiteSpace: 'nowrap', cursor: 'pointer',
                                        opacity: !ses ? 0.4 : 1,
                                        '&:hover': { filter: 'brightness(0.95)' }
                                      }}
                                    >
                                      {ses
                                        ? `${ikiHane(ses.total_quantity)} ${pozBirim}`
                                        : '—'
                                      }
                                    </Box>
                                  </Tooltip>
                                )
                              })}

                              {/* Onaylanan sütun */}
                              <Tooltip title={areaData.approvedSession ? 'Onaylanan metraj — görüntüle / düzenle' : 'Henüz onaylanan metraj yok'} placement="top">
                                <Box
                                  onClick={() => handleMahalClick(mahal)}
                                  sx={{
                                    px: '6px', py: '2px', borderBottom: '0.5px solid #ddd', borderLeft: '2px solid #1565c0',
                                    fontSize: '0.8rem', fontWeight: areaData.approvedSession ? 600 : 'normal',
                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                    backgroundColor: areaData.approvedSession ? sessionBg('approved') : '#f0f8ff',
                                    whiteSpace: 'nowrap', cursor: 'pointer',
                                    '&:hover': { filter: 'brightness(0.95)' }
                                  }}
                                >
                                  {areaData.approvedSession
                                    ? `${ikiHane(areaData.approvedSession.total_quantity)} ${pozBirim}`
                                    : '—'}
                                </Box>
                              </Tooltip>

                            </React.Fragment>
                          )
                        })}

                      </React.Fragment>
                    )
                  })}

                </Box>
              </Box>

              {/* Renk açıklaması */}
              <Box sx={{ display: 'flex', gap: '1rem', mt: '0.75rem', px: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { color: sessionBg('ready'),    label: 'Onaya Hazır' },
                  { color: sessionBg('approved'), label: 'Onaylanan' },
                ].map(({ color, label }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Box sx={{ width: 14, height: 14, backgroundColor: color, border: '1px solid #bbb', borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ color: 'gray' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )
        })()
      }

    </Box>
  )
}
