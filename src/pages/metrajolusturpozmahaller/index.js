import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetLbsNodes, useGetWorkPackagePozAreas } from '../../hooks/useMongo'

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
  const { selectedProje, selectedIsPaket, selectedPoz, setSelectedMahal } = useContext(StoreContext)

  const { data: rawLbsNodes = [], isLoading: lbsLoading } = useGetLbsNodes()
  const { data: wpAreas = [], isLoading: areasLoading, error: areasError } = useGetWorkPackagePozAreas()

  const [collapsedIds, setCollapsedIds] = useState(new Set())

  const isLoading = lbsLoading || areasLoading
  const queryError = areasError

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) navigate('/metrajolustur')
    else if (!selectedPoz) navigate('/metrajolusturpozlar')
  }, [selectedProje, selectedIsPaket, selectedPoz, navigate])

  // work_package_poz_areas'dan work_area objelerini çıkar
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

  // Bu düğümde (veya alt düğümlerinde) iş paketine ait mahal var mı
  function nodeHasMahal(nodeId) {
    if (rawMahaller.some(m => m.lbs_node_id === nodeId)) return true
    return rawLbsNodes.filter(n => n.parent_id === nodeId).some(c => nodeHasMahal(c.id))
  }

  const handleMahalClick = (mahal) => {
    setSelectedMahal(mahal)
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
                        {isLeaf && !collapsedIds.has(node.id) && mahallerOfNode.map(mahal => (
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
                                backgroundColor: '#fafafa',
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
                                backgroundColor: '#fafafa',
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
                                backgroundColor: '#fafafa',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              {mahal.area != null ? `${mahal.area} m²` : '—'}
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
