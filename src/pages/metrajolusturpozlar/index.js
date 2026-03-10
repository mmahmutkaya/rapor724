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

  const { data: rawWbsNodes = [], isLoading: wbsLoading } = useGetWbsNodes()
  const { data: units = [], isLoading: unitsLoading } = useGetPozUnits()
  const { data: wpPozlar = [], isLoading: wpPozLoading, error: wpPozError } = useGetWorkPackagePozlar()

  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [pozMetrajMap, setPozMetrajMap] = useState({}) // project_poz_id → toplam metraj
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
    if (!wpPozlar || wpPozlar.length === 0) { setPozMetrajMap({}); setPozWithAreasSet(new Set()); return }
    setPozWithAreasSet(null) // yükleniyor
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id });
    (async () => {
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas || areas.length === 0) { setPozWithAreasSet(new Set()); return }

      // En az 1 mahali olan project_poz_id'leri belirle
      const withAreas = new Set()
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) withAreas.add(pozId)
      })
      setPozWithAreasSet(withAreas)

      const areaIds = areas.map(a => a.id)
      let sessionsQuery = supabase
        .from('measurement_sessions')
        .select('work_package_poz_area_id, total_quantity')
        .in('work_package_poz_area_id', areaIds)
      if (appUser?.id) sessionsQuery = sessionsQuery.eq('created_by', appUser.id)
      const { data: sessions } = await sessionsQuery
      if (!sessions) return
      const areaToWpp = {}
      areas.forEach(a => { areaToWpp[a.id] = a.work_package_poz_id })
      const map = {}
      sessions.forEach(s => {
        const wppId = areaToWpp[s.work_package_poz_area_id]
        const pozId = wppToPoz[wppId]
        if (pozId) map[pozId] = (map[pozId] ?? 0) + (s.total_quantity ?? 0)
      })
      setPozMetrajMap(map)
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

      {/* BAŞLIK */}
      <Paper>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={() => navigate('/metrajolustur')}
              >
                Metraj Oluştur
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  opacity: 0.4,
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
          const totalCols = totalDepthCols + 4
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content max-content`

          return (
            <Box sx={{ maxWidth: '80rem', p: '0.5rem', width: 'fit-content' }}>

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
                          {isLeaf && pozlarOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                              {pozlarOfNode.length} poz
                            </Box>
                          }
                        </Box>

                        {/* Poz satırları */}
                        {isLeaf && !collapsedIds.has(node.id) && pozlarOfNode.map(poz => (
                          <React.Fragment key={poz.id}>

                            {Array.from({ length: totalDepthCols }).map((_, i) => (
                              <Box key={i} sx={{ backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent' }} />
                            ))}

                            {/* Poz kodu */}
                            <Box
                              onClick={() => handlePozClick(poz)}
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
                              {poz.code || '—'}
                            </Box>

                            {/* Açıklama */}
                            <Box
                              onClick={() => handlePozClick(poz)}
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
                              {poz.short_desc}
                            </Box>

                            {/* Birim */}
                            <Box
                              onClick={() => handlePozClick(poz)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center',
                                backgroundColor: '#f0f0f0', whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              {unitsMap[poz.unit_id] ?? '—'}
                            </Box>

                            {/* Metraj toplamı */}
                            <Box
                              onClick={() => handlePozClick(poz)}
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
                              {pozMetrajMap[poz.id] != null
                                ? `${ikiHane(pozMetrajMap[poz.id])} ${unitsMap[poz.unit_id] ?? ''}`
                                : '—'}
                            </Box>

                          </React.Fragment>
                        ))}

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
