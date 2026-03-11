
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
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import ReplyIcon from '@mui/icons-material/Reply'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PersonIcon from '@mui/icons-material/Person'
import { AppBar } from '@mui/material'


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

export default function P_MetrajOnaylaPozlar() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, setSelectedPoz, appUser, drawerWidth, topBarHeight } = useContext(StoreContext)

  const { data: rawWbsNodes = [], isLoading: wbsLoading } = useGetWbsNodes()
  const { data: units = [], isLoading: unitsLoading } = useGetPozUnits()
  const { data: wpPozlar = [], isLoading: wpPozLoading, error: wpPozError } = useGetWorkPackagePozlar()

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [showUserCols, setShowUserCols] = useState(true)
  // pozId → { [userId]: { readySum, approvedSum }, approvedSum }
  const [sessionMap, setSessionMap] = useState(null)
  // userId → { first_name, last_name }
  const [userMap, setUserMap] = useState({})
  // ordered array of userIds to display as columns
  const [columnUsers, setColumnUsers] = useState([])

  const isLoading = wbsLoading || unitsLoading || wpPozLoading || sessionMap === null
  const queryError = wpPozError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metrajonayla')
  }, [selectedProje, selectedIsPaket, navigate])

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

  // Load session data for all users in this work package
  useEffect(() => {
    if (!wpPozlar || wpPozlar.length === 0) {
      setSessionMap({})
      return
    }
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id });

    (async () => {
      // Get all areas for these work_package_pozlar
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas || areas.length === 0) { setSessionMap({}); return }

      const areaIds = areas.map(a => a.id)
      const areaToWpp = {}
      areas.forEach(a => { areaToWpp[a.id] = a.work_package_poz_id })

      // Get all ready/approved sessions (no FK join — created_by refs auth.users, not public.users)
      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id, total_quantity, status, created_by')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['ready', 'approved'])

      if (!sessions || sessions.length === 0) { setSessionMap({}); return }

      // Fetch user display names via security-definer RPC (accesses auth.users metadata)
      const uniqueUserIds = [...new Set(sessions.map(s => s.created_by).filter(Boolean))]
      const uMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: nameRows } = await supabase
          .rpc('get_user_display_names', { user_ids: uniqueUserIds })
        if (nameRows) {
          nameRows.forEach(row => {
            const parts = (row.display_name || '').trim().split(' ')
            uMap[row.id] = { first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '' }
          })
        }
      }
      setUserMap(uMap)
      const sortedUserIds = [...uniqueUserIds].sort((a, b) => {
        const nameA = [uMap[a]?.first_name, uMap[a]?.last_name].filter(Boolean).join(' ')
        const nameB = [uMap[b]?.first_name, uMap[b]?.last_name].filter(Boolean).join(' ')
        return nameA.localeCompare(nameB, 'tr')
      })
      setColumnUsers(sortedUserIds)

      // Build pozId → { [userId]: { readySum, approvedSum }, approvedSum }
      const map = {}
      sessions.forEach(s => {
        const wppId = areaToWpp[s.work_package_poz_area_id]
        const pozId = wppToPoz[wppId]
        if (!pozId) return
        if (!map[pozId]) map[pozId] = { byUser: {}, approvedSum: 0 }
        if (!map[pozId].byUser[s.created_by]) map[pozId].byUser[s.created_by] = { readySum: 0, approvedSum: 0 }
        const qty = s.total_quantity ?? 0
        if (s.status === 'ready') map[pozId].byUser[s.created_by].readySum += qty
        if (s.status === 'approved') {
          map[pozId].byUser[s.created_by].approvedSum += qty
          map[pozId].approvedSum = (map[pozId].approvedSum ?? 0) + qty
        }
      })
      setSessionMap(map)
    })()
  }, [wpPozlar])

  const rawPozlar = useMemo(() =>
    wpPozlar
      .filter(wpp => wpp.project_poz && sessionMap && sessionMap[wpp.project_poz_id])
      .map(wpp => wpp.project_poz)
  , [wpPozlar, sessionMap])

  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])

  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawWbsNodes.forEach(n => {
      if (!rawWbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawWbsNodes])

  const maxLeafDepth = useMemo(() => {
    const leaves = flatNodes.filter(n => isLeafSet.has(n.id))
    return leaves.length > 0 ? Math.max(...leaves.map(n => n.depth)) : 0
  }, [flatNodes, isLeafSet])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

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
      const parent = rawWbsNodes.find(n => n.id === parentId)
      parentId = parent?.parent_id ?? null
    }
    return false
  }

  function nodeHasPoz(nodeId) {
    if (rawPozlar.some(p => p.wbs_node_id === nodeId)) return true
    return rawWbsNodes.filter(n => n.parent_id === nodeId).some(c => nodeHasPoz(c.id))
  }

  const handlePozClick = (poz) => {
    setSelectedPoz(poz)
    navigate('/metrajonaylapozmahaller')
  }

  const userName = (userId) => {
    const u = userMap[userId]
    if (!u) return userId
    return [u.first_name, u.last_name].filter(Boolean).join(' ')
  }

  return (
    <Box sx={{ m: '0rem' }}>

      {/* BAŞLIK */}
      <AppBar
        position="static"
        sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}
      >
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <IconButton sx={{ m: 0, p: 0 }} onClick={() => navigate('/metrajonayla')}>
                <ReplyIcon sx={{ color: 'gray' }} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.5, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonayla')}
              >
                Metraj Onayla
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  opacity: 0.6,
                  maxWidth: '14rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Pozlar
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Tooltip title={showUserCols ? 'Hazırlayanları gizle' : 'Hazırlayanları göster'}>
              <IconButton size="small" onClick={() => setShowUserCols(v => !v)} sx={{ opacity: showUserCols ? 1 : 0.4, p: '4px' }}>
                <Badge badgeContent={columnUsers.length} color="primary" max={99}>
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

      {!isLoading && !queryError && rawPozlar.length === 0 && rawWbsNodes.length > 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          {wpPozlar.length === 0
            ? 'Bu iş paketine henüz poz atanmamış.'
            : 'Bu iş paketine atanmış pozlar için onaylanmaya hazır metraj bulunmuyor.'}
        </Alert>
      }

      {/* POZ AĞACI */}
      {!isLoading && !queryError && rawPozlar.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          const treeGridCols = [
            `repeat(${totalDepthCols}, 1rem)`,
            'max-content',
            'minmax(20rem, max-content)',
            'max-content',
            'max-content',
            ...(showUserCols && columnUsers.length > 0 ? columnUsers.map(() => 'max-content') : []),
          ].join(' ')

          const headerBg = '#000000'
          const headerCo = '#e0e1dd'
          const css_header = {
            backgroundColor: headerBg, color: headerCo,
            px: '0.4rem', py: '0.2rem',
            fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', whiteSpace: 'nowrap',
          }

          return (
            <Box sx={{ pt: 0, px: '0.5rem', pb: '0.5rem', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>

              {/* Header + WBS satırları — tek grid içinde, sütun genişlikleri ortak hesaplanır */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {/* Sütun başlıkları */}
                  <>
                    <Box sx={{ gridColumn: `span ${totalDepthCols + 3}`, ...css_header, justifyContent: 'flex-start' }} />
                    <Box sx={{ ...css_header, ml: '0.5rem', mr: '0.5rem' }}>Onaylanan</Box>
                    {showUserCols && columnUsers.map((uid, idx) => (
                      <Box key={uid} sx={{ ...css_header, flexDirection: 'column', gap: '0px', ...(idx === columnUsers.length - 1 && { mr: '0.5rem' }) }}>
                        <Box>{userName(uid).split(' ')[0]}</Box>
                        <Box>{userName(uid).split(' ').slice(1).join(' ')}</Box>
                      </Box>
                    ))}
                  </>

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    if (!nodeHasPoz(node.id)) return null

                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const c = nodeColor(depth)
                    const pozlarOfNode = rawPozlar
                      .filter(p => p.wbs_node_id === node.id)
                      .sort((a, b) => a.order_index - b.order_index)

                    return (
                      <React.Fragment key={node.id}>
                        {/* WBS düğüm satırı */}
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}
                        <Box
                          onClick={() => { if (!isLeaf) toggleCollapse(node.id) }}
                          sx={{
                            gridColumn: `span ${totalDepthCols - depth + (showUserCols && columnUsers.length > 0 ? 3 : 4)}`,
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
                        </Box>
                        {showUserCols && columnUsers.length > 0 && (
                          <>
                            <Box sx={{ ml: '0.5rem', mr: '0.5rem', backgroundColor: c.bg, borderLeft: '1px solid rgba(255,255,255,0.25)', borderRight: '1px solid rgba(255,255,255,0.25)' }} />
                            {columnUsers.map((_, i) => (
                              <Box key={i} sx={{
                                backgroundColor: c.bg,
                                borderLeft: '1px solid rgba(255,255,255,0.25)',
                                ...(i === columnUsers.length - 1 && { mr: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.25)' })
                              }} />
                            ))}
                          </>
                        )}

                        {/* Poz satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && pozlarOfNode.map(poz => {
                          const pozData = sessionMap?.[poz.id]
                          const rowBg = '#eeeeee'
                          const hoverBg = '#e0e0e0'

                          return (
                            <React.Fragment key={poz.id}>
                              {Array.from({ length: totalDepthCols }).map((_, i) => (
                                <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                              ))}

                              {/* Poz kodu */}
                              <Box
                                onClick={() => handlePozClick(poz)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd', borderLeft: '1px solid #aaa',
                                  fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: rowBg, cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {poz.code || '—'}
                              </Box>

                              {/* Poz adı */}
                              <Box
                                onClick={() => handlePozClick(poz)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  fontSize: '0.875rem', display: 'flex', alignItems: 'center',
                                  backgroundColor: rowBg, cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {poz.short_desc}
                              </Box>

                              {/* Birim */}
                              <Box
                                onClick={() => handlePozClick(poz)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  borderRight: '1px solid #c0c0c0',
                                  fontSize: '0.8rem', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                  backgroundColor: rowBg, cursor: 'pointer',
                                  '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {unitsMap[poz.unit_id] ?? '—'}
                              </Box>

                              {/* Onaylanan toplam */}
                              <Box
                                onClick={() => handlePozClick(poz)}
                                sx={{
                                  px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                  borderLeft: '1px solid #c0c0c0', borderRight: '1px solid #c0c0c0',
                                  ml: '0.5rem', mr: '0.5rem',
                                  fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                  whiteSpace: 'nowrap', cursor: 'pointer', gap: '0.3rem',
                                  backgroundColor: rowBg,
                                  '&:hover': { backgroundColor: hoverBg }
                                }}
                              >
                                {pozData?.approvedSum != null && pozData.approvedSum !== 0
                                  ? <>
                                      <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1565c0', flexShrink: 0 }} />
                                      <Box component="span">{ikiHane(pozData.approvedSum)}</Box>
                                    </>
                                  : <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                }
                              </Box>

                              {/* Per-user sütunları */}
                              {showUserCols && columnUsers.map((uid, idx) => {
                                const ud = pozData?.byUser?.[uid]
                                const hasReady = ud?.readySum != null && ud.readySum !== 0
                                const hasApproved = ud?.approvedSum != null && ud.approvedSum !== 0
                                const isLast = idx === columnUsers.length - 1
                                return (
                                  <Box
                                    key={uid}
                                    onClick={() => handlePozClick(poz)}
                                    sx={{
                                      px: '6px', py: '2px', borderBottom: '0.5px solid #ddd',
                                      borderLeft: '1px solid #c0c0c0',
                                      ...(isLast && { borderRight: '1px solid #c0c0c0', mr: '0.5rem' }),
                                      fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                      gap: '0.3rem', whiteSpace: 'nowrap', cursor: 'pointer',
                                      backgroundColor: rowBg,
                                      '&:hover': { backgroundColor: hoverBg }
                                    }}
                                  >
                                    {hasApproved && (
                                      <>
                                        <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1565c0', flexShrink: 0 }} />
                                        <Box component="span">{ikiHane(ud.approvedSum)}</Box>
                                      </>
                                    )}
                                    {!hasApproved && hasReady && (
                                      <>
                                        <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e65100', flexShrink: 0 }} />
                                        <Box component="span">{ikiHane(ud.readySum)}</Box>
                                      </>
                                    )}
                                    {!hasApproved && !hasReady && (
                                      <Box component="span" sx={{ color: '#ccc' }}>—</Box>
                                    )}
                                  </Box>
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
