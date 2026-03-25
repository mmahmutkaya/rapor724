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
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

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


export default function P_MetrajOlusturPozlar() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, setSelectedPoz, appUser } = useContext(StoreContext)
  const preparedByLabel = (appUser?.email?.split('@')?.[0] || appUser?.email || 'Hazirlayan').trim()

  const { data: rawWbsNodesData, isLoading: wbsLoading } = useGetWbsNodes()
  const { data: unitsData, isLoading: unitsLoading } = useGetPozUnits()
  const { data: wpPozlarData, isLoading: wpPozLoading, error: wpPozError } = useGetWorkPackagePozlar()

  const rawWbsNodes = rawWbsNodesData ?? EMPTY_ARRAY
  const units = unitsData ?? EMPTY_ARRAY
  const wpPozlar = wpPozlarData ?? EMPTY_ARRAY

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [hoveredPozId, setHoveredPozId] = useState(null)
  const showUserCols = true
  const [pozHazMap, setPozHazMap] = useState({})   // project_poz_id → aktif kullanıcı draft+ready toplam
  const [pozOnayMap, setPozOnayMap] = useState({}) // project_poz_id → approved toplam (tüm kullanıcılar)
  const [pozWithAreasSet, setPozWithAreasSet] = useState(null) // project_poz_id'leri — en az 1 mahali olanlar

  const isLoading = wbsLoading || unitsLoading || wpPozLoading || pozWithAreasSet === null
  const queryError = wpPozError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/metrajolustur')
  }, [selectedProje, selectedIsPaket, navigate])

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

  useEffect(() => {
    if (!wpPozlar || wpPozlar.length === 0) { setPozHazMap({}); setPozOnayMap({}); setPozWithAreasSet(new Set()); return }
    setPozWithAreasSet(null) // yükleniyor
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id });
    (async () => {
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas || areas.length === 0) { setPozWithAreasSet(new Set()); setPozHazMap({}); setPozOnayMap({}); return }

      // En az 1 mahali olan project_poz_id'leri belirle
      const withAreas = new Set()
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) withAreas.add(pozId)
      })
      setPozWithAreasSet(withAreas)

      const areaIds = areas.map(a => a.id)
      const areaToWpp = {}
      areas.forEach(a => { areaToWpp[a.id] = a.work_package_poz_id })

      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('work_package_poz_area_id, total_quantity, status, created_by')
        .in('work_package_poz_area_id', areaIds)
        .in('status', ['draft', 'ready', 'approved'])

      if (!sessions) return

      const hazMap = {}
      const onayMap = {}
      sessions.forEach(s => {
        const wppId = areaToWpp[s.work_package_poz_area_id]
        const pozId = wppToPoz[wppId]
        if (!pozId) return
        const qty = s.total_quantity ?? 0
        if (s.status === 'approved') {
          onayMap[pozId] = (onayMap[pozId] ?? 0) + qty
        } else if (appUser?.id && s.created_by === appUser.id) {
          hazMap[pozId] = (hazMap[pozId] ?? 0) + qty
        }
      })
      setPozHazMap(hazMap)
      setPozOnayMap(onayMap)
    })()
  }, [wpPozlar, appUser?.id])

  // work_package_pozlar'dan project_poz objelerini çıkar — sadece mahali atanmış pozlar
  const rawPozlar = useMemo(() =>
    wpPozlar
      .filter(wpp => wpp.project_poz && pozWithAreasSet?.has(wpp.project_poz_id))
      .map(wpp => wpp.project_poz)
  , [wpPozlar, pozWithAreasSet])

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

  // Bu düğümde (veya alt düğümlerinde) iş paketine ait poz var mı
  function nodeHasPoz(nodeId) {
    if (rawPozlar.some(p => p.wbs_node_id === nodeId)) return true
    return rawWbsNodes.filter(n => n.parent_id === nodeId).some(c => nodeHasPoz(c.id))
  }

  const handlePozClick = (poz) => {
    setSelectedPoz(poz)
    navigate('/metrajolusturpozmahaller')
  }


  return (
    <Box sx={{ m: '0rem' }}>

      <Paper>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.6, cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajolustur')}
              >
                Metraj Oluştur
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.6, fontSize: 18 }} />
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
              <NavigateNextIcon sx={{ opacity: 0.6, fontSize: 18 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Pozlar
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

      {!isLoading && !queryError && rawWbsNodes.length === 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Poz oluşturmadan önce <strong>WBS (Poz Başlıkları)</strong> ağacını oluşturun.
        </Alert>
      }

      {!isLoading && !queryError && rawPozlar.length === 0 && rawWbsNodes.length > 0 &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Bu iş paketine henüz poz atanmamış. İş Paketleri &rsaquo; Pozlar sayfasından atayabilirsiniz.
        </Alert>
      }

      {/* AĞAÇ GÖRÜNÜMÜ */}
      {!isLoading && !queryError && rawWbsNodes.length > 0 && rawPozlar.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          const statusColWidth = '8rem'
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content ${statusColWidth}${showUserCols ? ` ${statusColWidth}` : ''}`

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
            <Box sx={{ maxWidth: '80rem', pt: 0, px: '0.5rem', pb: '0.5rem', width: 'fit-content' }}>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {/* ── SÜTUN BAŞLIKLARI ── */}
                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                    <Box key={`hd-depth-${i}`} sx={{ ...css_header }} />
                  ))}
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header }} />
                  <Box sx={{ ...css_header, px: '4px', ml: '0.5rem', mr: '0.5rem' }}>Onaylanan</Box>
                  {showUserCols && <Box sx={{ ...css_header, px: '4px', mr: '0.5rem' }}>{preparedByLabel}</Box>}

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
                          {isLeaf && pozlarOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.7, flexShrink: 0 }}>
                              {pozlarOfNode.length} poz
                            </Box>
                          }
                        </Box>
                        <Box sx={{ ml: '0.5rem', mr: '0.5rem', backgroundColor: c.bg }} />
                        {showUserCols && <Box sx={{ mr: '0.5rem', backgroundColor: c.bg }} />}

                        {/* Poz satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && pozlarOfNode.map(poz => {
                          const isRowHovered = hoveredPozId === poz.id
                          const rowTextColor = '#1f2937'
                          const mutedTextColor = '#6b7280'
                          return (
                          <React.Fragment key={poz.id}>

                            {Array.from({ length: totalDepthCols }).map((_, i) => (
                              <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                            ))}

                            {/* Poz kodu */}
                            <Box
                              onClick={() => handlePozClick(poz)}
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{
                                px: '4px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                borderLeft: '1px solid #aaa',
                                fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                backgroundColor: isRowHovered ? '#e0e0e0' : '#eeeeee',
                                color: rowTextColor,
                                cursor: 'pointer',
                              }}
                            >
                              {poz.code || '—'}
                            </Box>

                            {/* Açıklama */}
                            <Box
                              onClick={() => handlePozClick(poz)}
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{
                                px: '4px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                fontSize: '0.875rem',
                                display: 'flex', alignItems: 'center',
                                backgroundColor: isRowHovered ? '#e0e0e0' : '#eeeeee',
                                color: rowTextColor,
                                cursor: 'pointer',
                              }}
                            >
                              {poz.short_desc}
                            </Box>

                            {/* Birim */}
                            <Box
                              onClick={() => handlePozClick(poz)}
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                borderRight: '1px solid #c0c0c0',
                                fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center',
                                backgroundColor: isRowHovered ? '#e0e0e0' : '#eeeeee', whiteSpace: 'nowrap',
                                color: rowTextColor,
                                cursor: 'pointer',
                              }}
                            >
                              {unitsMap[poz.unit_id] ?? '—'}
                            </Box>

                            {/* Onaylanan (tüm kullanıcılar) */}
                            <Box
                              onClick={() => handlePozClick(poz)}
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                borderLeft: '1px solid #c0c0c0', borderRight: '1px solid #c0c0c0',
                                ml: '0.5rem', mr: '0.5rem',
                                fontSize: '0.8rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                gap: '0.3rem',
                                backgroundColor: isRowHovered ? '#e0e0e0' : '#eeeeee',
                                color: rowTextColor,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                cursor: 'pointer',
                              }}
                            >
                              {pozOnayMap[poz.id] != null && pozOnayMap[poz.id] !== 0
                                ? <>
                                    {`${ikiHane(pozOnayMap[poz.id])} ${unitsMap[poz.unit_id] ?? ''}`}
                                  </>
                                : <Box component="span" sx={{ color: mutedTextColor }}>—</Box>
                              }
                            </Box>

                            {/* Hazırlanan (aktif kullanıcı) */}
                            {showUserCols && <Box
                              onClick={() => handlePozClick(poz)}
                              onMouseEnter={() => setHoveredPozId(poz.id)}
                              onMouseLeave={() => setHoveredPozId(null)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                borderLeft: '1px solid #c0c0c0',
                                borderRight: '1px solid #c0c0c0',
                                mr: '0.5rem',
                                fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                gap: '0.3rem',
                                backgroundColor: isRowHovered ? '#e0e0e0' : '#eeeeee',
                                color: rowTextColor,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                cursor: 'pointer',
                              }}
                            >
                              {pozHazMap[poz.id] != null && pozHazMap[poz.id] !== 0
                                ? <>
                                    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#757575', flexShrink: 0 }} />
                                    {`${ikiHane(pozHazMap[poz.id])} ${unitsMap[poz.unit_id] ?? ''}`}
                                  </>
                                : <Box component="span" sx={{ color: mutedTextColor }}>—</Box>
                              }
                            </Box>}

                          </React.Fragment>
                        )})}

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
