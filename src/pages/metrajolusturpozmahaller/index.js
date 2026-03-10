import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'


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

// status → renk
function sessionBg(status) {
  if (status === 'draft')    return '#FFF9C4'   // sarı  - taslak
  if (status === 'ready')    return '#C8E6C9'   // yeşil - onaya hazır
  if (status === 'approved') return '#B3E5FC'   // mavi  - onaylanan
  return '#f0f0f0'
}

function statusLabel(status) {
  if (status === 'draft')    return 'Taslak'
  if (status === 'ready')    return 'Hazır'
  if (status === 'approved') return 'Onaylı'
  return ''
}


export default function P_MetrajOlusturPozMahaller() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, setSelectedMahal, appUser } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreas = [], isLoading: areasLoading, error: areasError } = useGetWorkPackagePozAreas()
  const { data: units = [] } = useGetPozUnits()

  const [collapsedIds, setCollapsedIds] = useState(new Set())

  // wpAreaId → { byUser: { userId: session }, approved: session }
  const [sessionsMap, setSessionsMap] = useState({})
  // Sıralı kullanıcı listesi: önce aktif kullanıcı
  const [sessionUsers, setSessionUsers] = useState([])

  const isLoading = lbsLoading || areasLoading
  const queryError = areasError

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) navigate('/metrajolustur')
    else if (!selectedPoz) navigate('/metrajolusturpozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  useEffect(() => {
    if (!wpAreas || wpAreas.length === 0) {
      setSessionsMap({})
      setSessionUsers([])
      return
    }

    const areaIds = wpAreas.map(a => a.id);

    (async () => {
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, status, total_quantity, created_by, created_at, updated_at, creator:users!created_by(first_name, last_name)')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'approved'])
        .order('updated_at', { ascending: false })

      if (!sessions) return

      // Aktif kullanıcı her zaman listede
      const currentUserName = [appUser?.isim, appUser?.soyisim].filter(Boolean).join(' ') || appUser?.email || '(Ben)'
      const userMap = appUser?.id ? { [appUser.id]: currentUserName } : {}

      const newMap = {}
      sessions.forEach(s => {
        const areaId = s.work_package_poz_area_id
        if (!newMap[areaId]) newMap[areaId] = { byUser: {}, approved: null }

        if (s.status === 'approved') {
          // İlk bulunan (en yeni) onaylanan metrajı sakla
          if (!newMap[areaId].approved) {
            newMap[areaId].approved = s
          }
        } else {
          const uid = s.created_by
          if (uid) {
            // Kullanıcı başına en yeni session'ı sakla
            if (!newMap[areaId].byUser[uid]) {
              newMap[areaId].byUser[uid] = s
            }
            if (s.creator && !userMap[uid]) {
              userMap[uid] = [s.creator.first_name, s.creator.last_name].filter(Boolean).join(' ') || uid
            }
          }
        }
      })

      setSessionsMap(newMap)

      // Aktif kullanıcı en başta
      const users = Object.entries(userMap).map(([id, name]) => ({ id, name }))
      users.sort((a, b) => {
        if (appUser?.id && a.id === appUser.id) return -1
        if (appUser?.id && b.id === appUser.id) return 1
        return a.name.localeCompare(b.name, 'tr')
      })
      setSessionUsers(users)
    })()
  }, [wpAreas, appUser])

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

  // session parametresi verilirse o session'ı açar; verilmezse aktif kullanıcının session'ını açar
  const handleMahalClick = (mahal, session = null) => {
    const mahalWithSession = session
      ? { ...mahal, sessionId: session.id, sessionStatus: session.status }
      : mahal
    setSelectedMahal(mahalWithSession)
    navigate('/metrajolusturcetvel')
  }

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc


  return (
    <Box sx={{ m: '0rem' }}>

      {/* BAŞLIK */}
      <Paper>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.8 } }}
                onClick={() => navigate('/metrajolustur')}
              >
                Metraj Oluştur
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600, opacity: 0.4, cursor: 'pointer',
                  maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => navigate('/metrajolusturpozlar')}
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
                onClick={() => navigate('/metrajolusturpozlar')}
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
          Bu iş paketi + poz kombinasyonuna henüz mahal atanmamış. İş Paketleri &rsaquo; Mahaller sayfasından atayabilirsiniz.
        </Alert>
      }

      {/* AĞAÇ GÖRÜNÜMÜ */}
      {!isLoading && !queryError && rawLbsNodes.length > 0 && rawMahaller.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          // Sabit sütunlar: code, name, area  →  3 adet
          // Dinamik: sessionUsers.length adet kullanıcı + 1 onaylanan
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
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }

          return (
            <Box sx={{ p: '0.5rem', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>

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

                  {/* ── SÜTUN BAŞLIKLARI ── */}
                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                    <Box key={`hd-depth-${i}`} sx={{ ...css_header, backgroundColor: 'transparent', borderBottom: '1px solid #bbb' }} />
                  ))}
                  <Box sx={{ ...css_header }}>Kod</Box>
                  <Box sx={{ ...css_header, justifyContent: 'flex-start' }}>Mahal</Box>
                  <Box sx={{ ...css_header }}>Alan</Box>
                  {sessionUsers.map(user => (
                    <Tooltip key={`hd-user-${user.id}`} title={user.name} placement="top">
                      <Box sx={{ ...css_header, color: appUser?.id === user.id ? '#1565C0' : 'inherit' }}>
                        {user.name}
                      </Box>
                    </Tooltip>
                  ))}
                  <Box sx={{ ...css_header, backgroundColor: '#B3E5FC', color: '#01579B' }}>
                    Onaylanan
                  </Box>
                  {/* ── / SÜTUN BAŞLIKLARI ── */}

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
                          const areaData = sessionsMap[mahal.wpAreaId] ?? { byUser: {}, approved: null }

                          return (
                            <React.Fragment key={mahal.id}>

                              {Array.from({ length: totalDepthCols }).map((_, i) => (
                                <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                              ))}

                              {/* Mahal kodu */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  borderLeft: '1px solid #aaa',
                                  fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: '#f0f0f0',
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.code || '—'}
                              </Box>

                              {/* Mahal adı */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.875rem',
                                  display: 'flex', alignItems: 'center',
                                  backgroundColor: '#f0f0f0',
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.name}
                              </Box>

                              {/* Alan m² */}
                              <Box
                                onClick={() => handleMahalClick(mahal)}
                                sx={{
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.8rem',
                                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  backgroundColor: '#f0f0f0',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {mahal.area != null ? `${mahal.area} m²` : '—'}
                              </Box>

                              {/* Kullanıcı başına metraj sütunları */}
                              {sessionUsers.map(user => {
                                const ses = areaData.byUser[user.id]
                                const isCurrentUser = appUser?.id === user.id
                                const bg = ses ? sessionBg(ses.status) : '#f5f5f5'
                                const isClickable = !!ses || isCurrentUser

                                return (
                                  <Tooltip
                                    key={`cell-${mahal.id}-${user.id}`}
                                    title={ses ? statusLabel(ses.status) : (isCurrentUser ? 'Metraj başlat' : '')}
                                    placement="top"
                                  >
                                    <Box
                                      onClick={() => isClickable ? handleMahalClick(mahal, ses || null) : undefined}
                                      sx={{
                                        px: '6px', py: '2px',
                                        borderBottom: '0.5px solid #ddd',
                                        fontSize: '0.8rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        backgroundColor: bg,
                                        whiteSpace: 'nowrap',
                                        cursor: isClickable ? 'pointer' : 'default',
                                        opacity: !ses && !isCurrentUser ? 0.4 : 1,
                                        '&:hover': isClickable ? { filter: 'brightness(0.95)' } : {},
                                      }}
                                    >
                                      {ses
                                        ? `${ikiHane(ses.total_quantity)} ${pozBirim}`
                                        : (isCurrentUser ? <span style={{ fontSize: '0.75rem', color: '#aaa' }}>+ Ekle</span> : '—')
                                      }
                                    </Box>
                                  </Tooltip>
                                )
                              })}

                              {/* Onaylanan metraj sütunu */}
                              {(() => {
                                const approvedSes = areaData.approved
                                return (
                                  <Tooltip title={approvedSes ? 'Onaylanan metraj — görüntüle / düzenle' : ''} placement="top">
                                    <Box
                                      onClick={() => approvedSes ? handleMahalClick(mahal, approvedSes) : undefined}
                                      sx={{
                                        px: '6px', py: '2px',
                                        borderBottom: '0.5px solid #ddd',
                                        fontSize: '0.8rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        backgroundColor: approvedSes ? sessionBg('approved') : '#f0f8ff',
                                        whiteSpace: 'nowrap',
                                        cursor: approvedSes ? 'pointer' : 'default',
                                        fontWeight: approvedSes ? 600 : 'normal',
                                        '&:hover': approvedSes ? { filter: 'brightness(0.95)' } : {},
                                      }}
                                    >
                                      {approvedSes
                                        ? `${ikiHane(approvedSes.total_quantity)} ${pozBirim}`
                                        : '—'}
                                    </Box>
                                  </Tooltip>
                                )
                              })()}

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
                  { color: sessionBg('draft'),    label: 'Taslak' },
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
