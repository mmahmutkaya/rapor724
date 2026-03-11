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
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PersonIcon from '@mui/icons-material/Person'


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

export default function P_MetrajOlusturPozMahaller() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, setSelectedMahal, appUser } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreas = [], isLoading: areasLoading, error: areasError } = useGetWorkPackagePozAreas()
  const { data: units = [] } = useGetPozUnits()

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [showUserCols, setShowUserCols] = useState(true)

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
      // Aktif kullanıcı her zaman listede (sessions yüklenemese bile göster)
      const currentUserName = [appUser?.isim, appUser?.soyisim].filter(v => v && v !== '-').join(' ') || appUser?.email || '(Ben)'
      const userMap = appUser?.id ? { [appUser.id]: currentUserName } : {}

      const { data: sessions, error: sessionsError } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, status, total_quantity, created_by, created_at, updated_at')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'approved'])
        .order('updated_at', { ascending: false })

      if (sessionsError || !sessions) {
        // Sessions yüklenemedi — en azından aktif kullanıcıyı göster
        setSessionsMap({})
        const users = appUser?.id ? [{ id: appUser.id, name: currentUserName }] : []
        setSessionUsers(users)
        return
      }

      // created_by ID'lerini topla, users tablosundan isimleri al
      const uniqueUserIds = [...new Set(
        sessions.map(s => s.created_by).filter(id => id && id !== appUser?.id)
      )]

      if (uniqueUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', uniqueUserIds)

        if (usersData) {
          usersData.forEach(u => {
            userMap[u.id] = [u.first_name, u.last_name].filter(v => v && v !== '-').join(' ') || u.id
          })
        }
      }

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
          // created_by null ise (migration öncesi session) aktif kullanıcıya ata
          const uid = s.created_by ?? appUser?.id
          if (uid) {
            // Kullanıcı başına en yeni session'ı sakla
            if (!newMap[areaId].byUser[uid]) {
              newMap[areaId].byUser[uid] = s
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
          <Grid item sx={{ ml: 'auto' }}>
            <Tooltip title={showUserCols ? 'Hazırlayanları gizle' : 'Hazırlayanları göster'}>
              <IconButton size="small" onClick={() => setShowUserCols(v => !v)} sx={{ opacity: showUserCols ? 1 : 0.4, p: '4px' }}>
                <Badge badgeContent={sessionUsers.length} color="primary" max={99}>
                  <PersonIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
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
          const treeGridCols = [
            `repeat(${totalDepthCols}, 1rem)`,
            'max-content',
            'minmax(20rem, max-content)',
            'max-content',
            'max-content',
            ...(showUserCols ? Array(userColCount).fill('max-content') : []),
          ].join(' ')

          const css_header = {
            px: '4px', py: '2px',
            backgroundColor: 'black',
            color: 'white',
            borderBottom: '1px solid #333',
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
            <Box sx={{ pt: 0, px: '0.5rem', pb: '0.5rem', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {/* ── SÜTUN BAŞLIKLARI ── */}
                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                    <Box key={`hd-depth-${i}`} sx={{ ...css_header, borderBottom: '1px solid #333' }} />
                  ))}
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header, ml: '0.5rem', mr: '0.5rem' }}>
                    Onaylanan
                  </Box>
                  {showUserCols && sessionUsers.map((user, idx) => (
                    <Tooltip key={`hd-user-${user.id}`} title={user.name} placement="top">
                      <Box sx={{
                        ...css_header,
                        ...(idx === sessionUsers.length - 1 && { mr: '0.5rem' }),
                      }}>
                        {user.name}
                      </Box>
                    </Tooltip>
                  ))}
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
                            gridColumn: `span ${totalDepthCols - depth + 3}`,
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
                        <Box sx={{ ml: '0.5rem', mr: '0.5rem', backgroundColor: c.bg, borderLeft: '1px solid rgba(255,255,255,0.25)', borderRight: '1px solid rgba(255,255,255,0.25)' }} />
                        {showUserCols && sessionUsers.map((_, i) => (
                          <Box key={i} sx={{
                            backgroundColor: c.bg,
                            borderLeft: '1px solid rgba(255,255,255,0.25)',
                            ...(i === sessionUsers.length - 1 && { mr: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.25)' })
                          }} />
                        ))}

                        {/* Mahal satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => {
                          const areaData = sessionsMap[mahal.wpAreaId] ?? { byUser: {}, approved: null }
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
                                  px: '6px', py: '2px',
                                  borderBottom: '0.5px solid #ddd',
                                  borderLeft: '1px solid #aaa',
                                  fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: rowBg,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
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
                                  backgroundColor: rowBg,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
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
                                  borderRight: '1px solid #c0c0c0',
                                  fontSize: '0.8rem',
                                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  backgroundColor: rowBg,
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {mahal.area != null ? `${mahal.area} m²` : '—'}
                              </Box>

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
                                        borderLeft: '1px solid #c0c0c0', borderRight: '1px solid #c0c0c0',
                                        ml: '0.5rem', mr: '0.5rem',
                                        fontSize: '0.8rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        gap: '0.3rem',
                                        backgroundColor: rowBg,
                                        whiteSpace: 'nowrap',
                                        cursor: approvedSes ? 'pointer' : 'default',
                                        '&:hover': approvedSes ? { backgroundColor: hoverBg } : {},
                                      }}
                                    >
                                      {approvedSes
                                        ? <>
                                            <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1565c0', flexShrink: 0 }} />
                                            {`${ikiHane(approvedSes.total_quantity)} ${pozBirim}`}
                                          </>
                                        : <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                      }
                                    </Box>
                                  </Tooltip>
                                )
                              })()}

                              {/* Kullanıcı başına metraj sütunları */}
                              {showUserCols && sessionUsers.map((user, idx) => {
                                const ses = areaData.byUser[user.id]
                                const isCurrentUser = appUser?.id === user.id
                                const isClickable = !!ses || isCurrentUser
                                const isLast = idx === sessionUsers.length - 1
                                const dotColor = ses?.status === 'ready' ? '#e65100' : '#757575'

                                return (
                                  <Tooltip
                                    key={`cell-${mahal.id}-${user.id}`}
                                    title={ses ? (ses.status === 'ready' ? 'Onaya Hazır' : ses.status === 'draft' ? 'Taslak' : '') : (isCurrentUser ? 'Metraj başlat' : '')}
                                    placement="top"
                                  >
                                    <Box
                                      onClick={() => isClickable ? handleMahalClick(mahal, ses || null) : undefined}
                                      sx={{
                                        px: '6px', py: '2px',
                                        borderBottom: '0.5px solid #ddd',
                                        borderLeft: '1px solid #c0c0c0',
                                        ...(isLast && { borderRight: '1px solid #c0c0c0', mr: '0.5rem' }),
                                        fontSize: '0.8rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        gap: '0.3rem',
                                        backgroundColor: rowBg,
                                        whiteSpace: 'nowrap',
                                        cursor: isClickable ? 'pointer' : 'default',
                                        '&:hover': isClickable ? { backgroundColor: hoverBg } : {},
                                      }}
                                    >
                                      {ses
                                        ? <>
                                            <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                                            {`${ikiHane(ses.total_quantity)} ${pozBirim}`}
                                          </>
                                        : (isCurrentUser
                                            ? <Box component="span" sx={{ fontSize: '0.75rem', color: '#aaa' }}>+ Ekle</Box>
                                            : <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                          )
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
