import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes, useGetProjectPozlar, useGetPozUnits } from '../../hooks/useMongo'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'


function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

function nodeColor(depth) {
  const palette = [
    { bg: "#8b0000", co: "#e6e6e6" },
    { bg: "#330066", co: "#e6e6e6" },
    { bg: "#005555", co: "#e6e6e6" },
    { bg: "#737373", co: "#e6e6e6" },
    { bg: "#8b008b", co: "#e6e6e6" },
    { bg: "#2929bc", co: "#e6e6e6" },
    { bg: "#00853E", co: "#e6e6e6" },
    { bg: "#4B5320", co: "#e6e6e6" },
  ]
  return palette[depth % palette.length]
}


export default function P_isPaketPozlar() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, setSelectedPoz } = useContext(StoreContext)

  const { data: rawWbsNodes = [], isLoading: wbsLoading } = useGetWbsNodes()
  const { data: rawPozlar = [], isLoading: pozLoading, error: pozError } = useGetProjectPozlar()
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useGetPozUnits()

  const [collapsedIds, setCollapsedIds] = useState(new Set())

  const isLoading = wbsLoading || pozLoading || unitsLoading
  const queryError = pozError || unitsError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/ispaketler')
  }, [selectedProje, selectedIsPaket, navigate])

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

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

  const handlePozClick = (poz) => {
    setSelectedPoz(poz)
    navigate('/ispaketpozmahaller')
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
                onClick={() => navigate('/ispaketler')}
              >
                İş Paketleri
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
          Henüz poz eklenmedi.
        </Alert>
      }

      {/* AĞAÇ GÖRÜNÜMÜ */}
      {!isLoading && !queryError && rawWbsNodes.length > 0 && rawPozlar.length > 0 &&
        (() => {
          const totalDepthCols = maxLeafDepth + 1
          const totalCols = totalDepthCols + 3
          const treeGridCols = `repeat(${totalDepthCols}, 1rem) max-content minmax(20rem, max-content) max-content`

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
                                backgroundColor: '#fafafa',
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
                                backgroundColor: '#fafafa',
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
                                backgroundColor: '#fafafa', whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              {unitsMap[poz.unit_id] ?? '—'}
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
