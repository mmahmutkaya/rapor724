
import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'
import { getMeasurementDotColor, getMeasurementStatusLabel } from '../../lib/measurementStatus.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import AppBar from '@mui/material/AppBar'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import PersonIcon from '@mui/icons-material/Person'

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

export default function P_MetrajOnaylaPozMahaller() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, selectedPoz,
    setSelectedMahal_metraj, appUser
  } = useContext(StoreContext)

  const { data: rawLbsNodesData, isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreasData, isLoading: areasLoading, error: areasError } = useGetWorkPackagePozAreas()
  const { data: unitsData } = useGetPozUnits()

  const rawLbsNodes = rawLbsNodesData ?? EMPTY_ARRAY
  const wpAreas = wpAreasData ?? EMPTY_ARRAY
  const units = unitsData ?? EMPTY_ARRAY

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [showUserCols, setShowUserCols] = useState(true)
  // wpAreaId → { byUser: { userId: { session, userName } }, approvedTotal }
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
        .select('id, work_package_poz_area_id, status, total_quantity, created_by, updated_at, revision_snapshot')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'seen', 'approved', 'revised', 'rejected', 'revise_requested'])
        .order('updated_at', { ascending: false })

      if (sessionsError || !sessions || sessions.length === 0) {
        setSessionsMap({})
        setSessionUsers([])
        return
      }

      // Fetch user display names via security-definer RPC (accesses auth.users metadata)
      const uniqueUserIds = [...new Set(sessions.map(s => s.created_by).filter(Boolean))]
      const userMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: nameRows } = await supabase
          .rpc('get_user_display_names', { user_ids: uniqueUserIds })
        if (nameRows) {
          nameRows.forEach(row => {
            userMap[row.id] = row.display_name || row.id
          })
        }
      }

      // Build sessionsMap
      const newMap = {}
      sessions.forEach(s => {
        const areaId = s.work_package_poz_area_id
        if (!newMap[areaId]) newMap[areaId] = { byUser: {}, approvedTotal: 0 }

        if (s.status === 'approved' || s.status === 'revised') {
          newMap[areaId].approvedTotal += s.total_quantity ?? 0
        }

        const uid = s.created_by
        if (uid && !newMap[areaId].byUser[uid]) {
          newMap[areaId].byUser[uid] = { session: s, userName: userMap[uid] ?? uid }
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
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
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
          <Grid item xs="auto">
            <Tooltip title={showUserCols ? 'Hazırlayanları gizle' : 'Hazırlayanları göster'}>
              <IconButton onClick={() => setShowUserCols(v => !v)} sx={{ opacity: showUserCols ? 1 : 0.4, width: 40, height: 40 }}>
                <Badge badgeContent={sessionUsers.length} color="primary" max={99}>
                  <PersonIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
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
          const treeGridCols = [
            `repeat(${totalDepthCols}, 1rem)`,
            'max-content',
            'minmax(20rem, max-content)',
            'max-content',
            'max-content',
            ...(showUserCols && userColCount > 0 ? Array(userColCount).fill('max-content') : []),
          ].join(' ')

          const css_header = {
            px: '4px', py: '2px',
            backgroundColor: '#000000',
            color: '#e0e1dd',
            borderBottom: '1px solid #444',
            fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }

          return (
            <Box sx={{ pt: 0, px: '0.5rem', pb: '0.5rem', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {/* SÜTUN BAŞLIKLARI */}
                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                    <Box key={`hd-depth-${i}`} sx={{ ...css_header }} />
                  ))}
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header, ml: '0.5rem', mr: '0.5rem' }}>Onaylanan</Box>
                  {showUserCols && sessionUsers.map((user, idx) => (
                    <Box key={`hd-${user.id}`} sx={{ ...css_header, flexDirection: 'column', lineHeight: 1.2, ...(idx === sessionUsers.length - 1 && { mr: '0.5rem' }) }}>
                      <span>{user.name.split(' ')[0]}</span>
                      <span>{user.name.split(' ').slice(1).join(' ')}</span>
                    </Box>
                  ))}

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
                            gridColumn: `span ${totalDepthCols - depth + (showUserCols && userColCount > 0 ? 3 : 4)}`,
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
                        {showUserCols && userColCount > 0 && (
                          <>
                            <Box sx={{ ml: '0.5rem', mr: '0.5rem', backgroundColor: c.bg, borderLeft: '1px solid rgba(255,255,255,0.25)', borderRight: '1px solid rgba(255,255,255,0.25)' }} />
                            {sessionUsers.map((_, i) => (
                              <Box key={i} sx={{
                                backgroundColor: c.bg,
                                borderLeft: '1px solid rgba(255,255,255,0.25)',
                                ...(i === sessionUsers.length - 1 && { mr: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.25)' })
                              }} />
                            ))}
                          </>
                        )}

                        {/* MAHAL SATIRLARI */}
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => {
                          const areaData = sessionsMap[mahal.wpAreaId] ?? { byUser: {}, approvedTotal: 0 }
                          const rowBg = '#eeeeee'
                          const hoverBg = '#e0e0e0'

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
                                  backgroundColor: rowBg,
                                  cursor: 'pointer', '&:hover': { backgroundColor: hoverBg }
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
                                  backgroundColor: rowBg,
                                  cursor: 'pointer', '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {mahal.name}
                              </Box>

                              {/* Alan */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  borderRight: '1px solid #c0c0c0',
                                  fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  backgroundColor: rowBg,
                                  whiteSpace: 'nowrap', cursor: 'pointer', '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {mahal.area != null ? `${mahal.area} m²` : '—'}
                              </Box>

                              {/* Onaylanan sütun */}
                              <Tooltip title={areaData.approvedTotal !== 0 ? 'Onaylanan metraj — görüntüle / düzenle' : 'Henüz onaylanan metraj yok'} placement="top">
                                <Box
                                  onClick={() => handleMahalClick(mahal)}
                                  sx={{
                                    px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                    borderLeft: '1px solid #c0c0c0', borderRight: '1px solid #c0c0c0',
                                    ml: '0.5rem', mr: '0.5rem',
                                    fontSize: '0.8rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                    backgroundColor: rowBg,
                                    whiteSpace: 'nowrap', cursor: 'pointer',
                                    '&:hover': { backgroundColor: hoverBg }
                                  }}
                                >
                                  {areaData.approvedTotal !== 0
                                    ? `${ikiHane(areaData.approvedTotal)} ${pozBirim}`
                                    : <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                  }
                                </Box>
                              </Tooltip>

                              {/* Per-user sütunları */}
                              {showUserCols && sessionUsers.map((user, idx) => {
                                const ud = areaData.byUser[user.id]
                                const ses = ud?.session
                                const isLast = idx === sessionUsers.length - 1
                                const dotColor = ses ? getMeasurementDotColor(ses) : null
                                const statusLabel = ses ? getMeasurementStatusLabel(ses) : null
                                return (
                                  <Tooltip key={`cell-${mahal.id}-${user.id}`} title={statusLabel ?? ''} placement="top">
                                    <Box
                                      onClick={() => handleMahalClick(mahal)}
                                      sx={{
                                        px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                        borderLeft: '1px solid #c0c0c0',
                                        ...(isLast && { borderRight: '1px solid #c0c0c0', mr: '0.5rem' }),
                                        fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        gap: '0.3rem',
                                        backgroundColor: rowBg,
                                        whiteSpace: 'nowrap', cursor: 'pointer',
                                        '&:hover': { backgroundColor: hoverBg }
                                      }}
                                    >
                                      {ses
                                        ? <>
                                            <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                                            {`${ikiHane(ses.total_quantity)} ${pozBirim}`}
                                          </>
                                        : <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                      }
                                    </Box>
                                  </Tooltip>
                                )
                              })}

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
