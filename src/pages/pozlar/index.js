import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes, useGetProjectPozlar, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'
import FormPozCreate from '../../components/FormPozCreate'
import FormPozEdit from '../../components/FormPozEdit'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ListIcon from '@mui/icons-material/List'


// WBS sayfasından aynı yardımcılar
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

function buildWbsPathCode(nodeId, rawNodes) {
  const path = []
  let current = rawNodes.find(n => n.id === nodeId)
  while (current) {
    if (current.code_name) path.unshift(current.code_name)
    current = current.parent_id ? rawNodes.find(n => n.id === current.parent_id) : null
  }
  return path.join('.')
}

export function buildPozCode(wbsNodeId, rawNodes, existingPozlar) {
  const prefix = buildWbsPathCode(wbsNodeId, rawNodes)
  const count = existingPozlar.filter(p => p.wbs_node_id === wbsNodeId).length
  const seq = String(count + 1).padStart(3, '0')
  return prefix ? `${prefix}.${seq}` : seq
}


export default function P_Pozlar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje } = useContext(StoreContext)

  const { data: rawWbsNodes = [], isLoading: wbsLoading } = useGetWbsNodes()
  const { data: rawPozlar = [], isLoading: pozLoading, error: pozError } = useGetProjectPozlar()
  const { data: units = [], isLoading: unitsLoading, error: unitsError } = useGetPozUnits()

  const [viewMode, setViewMode] = useState('tree')
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [filterWbsIds, setFilterWbsIds] = useState(new Set())
  const [activeWbsNodeId, setActiveWbsNodeId] = useState(null)
  const [show, setShow] = useState('Main')
  const [dialogAlert, setDialogAlert] = useState()
  const [editingPoz, setEditingPoz] = useState(null)

  // Select modu
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openEditFromHeader = () => {
    const poz = rawPozlar.find(p => selectedIds.has(p.id))
    if (poz) {
      setEditingPoz(poz)
      exitSelectMode()
    }
  }

  const handleDeleteSelected = () => {
    const count = selectedIds.size
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: `Seçili ${count} poz silinsin mi?`,
      actionText1: 'Sil',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase.from('project_pozlar').delete().in('id', [...selectedIds])
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Silme işlemi sırasında hata oluştu.', detailText: error.message, onCloseAction: () => setDialogAlert() })
          return
        }
        exitSelectMode()
        invalidate()
      },
      onCloseAction: () => setDialogAlert()
    })
  }

  const isLoading = wbsLoading || pozLoading || unitsLoading
  const queryError = pozError || unitsError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])

  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawWbsNodes.forEach(n => {
      if (!rawWbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawWbsNodes])

  const leafNodes = useMemo(
    () => flatNodes.filter(n => isLeafSet.has(n.id)),
    [flatNodes, isLeafSet]
  )

  // En derin yaprak node'un derinliği → ortak grid sütun sayısını belirler
  const maxLeafDepth = useMemo(() => {
    const leaves = flatNodes.filter(n => isLeafSet.has(n.id))
    return leaves.length > 0 ? Math.max(...leaves.map(n => n.depth)) : 0
  }, [flatNodes, isLeafSet])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const displayedPozlar = useMemo(() => {
    if (viewMode === 'flat' && filterWbsIds.size > 0) {
      return rawPozlar.filter(p => filterWbsIds.has(p.wbs_node_id))
    }
    return rawPozlar
  }, [rawPozlar, viewMode, filterWbsIds])

  const invalidate = () => queryClient.invalidateQueries(['projectPozlar', selectedProje?.id])

  function toggleCollapse(nodeId) {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId)
      return next
    })
  }

  function toggleFilterWbs(nodeId) {
    setFilterWbsIds(prev => {
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

  const canAddPoz = units.length > 0

  // Düz liste sütun CSS
  const headerCellCss = {
    border: '1px solid black',
    px: '0.7rem', py: '0.3rem',
    backgroundColor: '#333', color: 'white',
    fontWeight: 600, fontSize: '0.85rem',
  }
  const pozCellCss = {
    border: '1px solid #ddd',
    px: '0.5rem', py: '0.25rem',
    fontSize: '0.875rem',
    display: 'flex', alignItems: 'center',
  }
  const flatColumns = 'max-content minmax(20rem, max-content) max-content max-content'
  const colHeaders = [
    { label: 'Poz Kodu', align: 'center' },
    { label: 'Açıklama', align: 'left' },
    { label: 'Birim', align: 'center' },
    { label: '', align: 'center' },
  ]


  return (
    <Box sx={{ m: '0rem' }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
          actionText1={dialogAlert.actionText1 ?? null}
          action1={dialogAlert.action1 ?? null}
          actionText2={dialogAlert.actionText2 ?? null}
          action2={dialogAlert.action2 ?? null}
        />
      }

      {/* BAŞLIK */}
      <Paper>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Typography variant="h6" fontWeight="bold">Pozlar</Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={0.5} alignItems="center">

              {!selectMode && (
                <>
                  <Grid item>
                    <Tooltip title="WBS ağaç görünümü">
                      <IconButton size="small" onClick={() => setViewMode('tree')} color={viewMode === 'tree' ? 'primary' : 'default'}>
                        <AccountTreeIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Düz liste">
                      <IconButton size="small" onClick={() => setViewMode('flat')} color={viewMode === 'flat' ? 'primary' : 'default'}>
                        <ListIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => setSelectMode(true)}
                      disabled={rawPozlar.length === 0}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Tooltip title={
                      !canAddPoz ? 'Önce Proje Ayarları\'ndan birim ekleyin'
                      : viewMode === 'tree' && !activeWbsNodeId ? 'Bir WBS yaprak düğümü seçin'
                      : 'Poz ekle'
                    }>
                      <span>
                        <IconButton
                          onClick={() => setShow('PozCreate')}
                          disabled={!canAddPoz || (viewMode === 'tree' && !activeWbsNodeId)}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </>
              )}

              {selectMode && (
                <>
                  <Grid item>
                    <IconButton onClick={exitSelectMode}>
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                  {selectedIds.size === 1 && (
                    <Grid item>
                      <IconButton onClick={openEditFromHeader}>
                        <EditIcon />
                      </IconButton>
                    </Grid>
                  )}
                  <Grid item>
                    <IconButton onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
                      <DeleteIcon color={selectedIds.size > 0 ? 'error' : 'disabled'} />
                    </IconButton>
                  </Grid>
                </>
              )}

            </Grid>
          </Grid>
        </Grid>
      </Paper>


      {isLoading &&
        <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>
      }

      {show === 'PozCreate' &&
        <FormPozCreate
          setShow={setShow}
          wbsNodeId={viewMode === 'tree' ? activeWbsNodeId : null}
          rawWbsNodes={rawWbsNodes}
          rawPozlar={rawPozlar}
          units={units}
          invalidate={invalidate}
        />
      }

      {editingPoz &&
        <FormPozEdit
          poz={editingPoz}
          units={units}
          setEditingPoz={setEditingPoz}
          invalidate={invalidate}
        />
      }

      {!isLoading && queryError && show === 'Main' &&
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veritabanı sorgusu başarısız. SQL'lerin çalıştırıldığından emin olun.
          <br /><small style={{ opacity: 0.7 }}>{queryError.message}</small>
        </Alert>
      }

      {!isLoading && !queryError && units.length === 0 && show === 'Main' &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Poz oluşturmadan önce <strong>Proje Ayarları</strong> sayfasından birim ekleyin.
        </Alert>
      }
      {!isLoading && !queryError && rawWbsNodes.length === 0 && show === 'Main' &&
        <Alert severity="info" sx={{ m: '1rem' }}>
          Poz oluşturmadan önce <strong>WBS (Poz Başlıkları)</strong> ağacını oluşturun.
        </Alert>
      }


      {/* ===== AĞAÇ GÖRÜNÜMÜ — WBS sayfasıyla aynı stil, tek ortak grid ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingPoz && viewMode === 'tree' && rawWbsNodes.length > 0 &&
        (() => {
          // Tüm WBS + poz satırları için tek ortak grid sütun tanımı
          const totalDepthCols = maxLeafDepth + 1   // 1rem'lik derinlik çubuğu sayısı
          const totalCols = totalDepthCols + 4      // +4: kod, açıklama, birim, sil
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

              {/* Tek ortak grid — WBS ve poz satırları hizalı */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1rem 1fr' }}>
                <Box sx={{ backgroundColor: 'black' }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols }}>

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null
                    const { depth } = node
                    const isLeaf = isLeafSet.has(node.id)
                    const isSelected = activeWbsNodeId === node.id
                    const c = nodeColor(depth)
                    const pozlarOfNode = rawPozlar
                      .filter(p => p.wbs_node_id === node.id)
                      .sort((a, b) => a.order_index - b.order_index)

                    return (
                      <React.Fragment key={node.id}>

                        {/* WBS düğüm satırı: depth adet renkli bar + içerik geri kalanı span eder */}
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}
                        <Box
                          onClick={() => {
                            if (!isLeaf) { toggleCollapse(node.id); return }
                            setActiveWbsNodeId(prev => prev === node.id ? null : node.id)
                          }}
                          sx={{
                            gridColumn: `span ${totalCols - depth}`,
                            pl: '6px', py: '1px',
                            backgroundColor: isSelected ? '#1a3a5c' : c.bg,
                            color: c.co,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            userSelect: 'none',
                            '&:hover': { filter: 'brightness(1.2)' }
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
                          {isSelected &&
                            <Box sx={{ ml: '0.3rem', width: '0.4rem', height: '0.4rem', borderRadius: '50%', backgroundColor: 'yellow' }} />
                          }
                          {isLeaf && pozlarOfNode.length > 0 &&
                            <Box sx={{ ml: 'auto', pr: '0.5rem', fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>
                              {pozlarOfNode.length} poz
                            </Box>
                          }
                        </Box>

                        {/* Poz satırları — totalDepthCols adet bar (bazıları saydam) + 4 veri hücresi */}
                        {isLeaf && !collapsedIds.has(node.id) && pozlarOfNode.map(poz => {
                          const isChecked = selectedIds.has(poz.id)
                          const selectedBg = isChecked ? '#e3f2fd' : '#fafafa'
                          return (
                          <React.Fragment key={poz.id}>

                            {/* Derinlik çubukları: depth+1 adedi renkli, kalanı saydam dolgu */}
                            {Array.from({ length: totalDepthCols }).map((_, i) => (
                              <Box key={i} sx={{
                                backgroundColor: i <= depth ? nodeColor(i).bg : 'transparent',
                              }} />
                            ))}

                            {/* Poz kodu */}
                            <Box
                              onClick={() => selectMode && toggleSelect(poz.id)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                borderLeft: '1px solid #aaa',
                                fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600,
                                display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                                backgroundColor: selectedBg,
                                cursor: selectMode ? 'pointer' : 'default',
                              }}>
                              {poz.code || '—'}
                            </Box>

                            {/* Açıklama */}
                            <Box
                              onClick={() => selectMode && toggleSelect(poz.id)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                fontSize: '0.875rem',
                                display: 'flex', alignItems: 'center',
                                backgroundColor: selectedBg,
                                cursor: selectMode ? 'pointer' : 'default',
                              }}>
                              {poz.short_desc}
                            </Box>

                            {/* Birim */}
                            <Box
                              onClick={() => selectMode && toggleSelect(poz.id)}
                              sx={{
                                px: '6px', py: '2px',
                                borderBottom: '0.5px solid #ddd',
                                fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center',
                                backgroundColor: selectedBg, whiteSpace: 'nowrap',
                                cursor: selectMode ? 'pointer' : 'default',
                              }}>
                              {unitsMap[poz.unit_id] ?? '—'}
                            </Box>

                            {/* Checkbox (selectMode) */}
                            <Box sx={{
                              borderBottom: '0.5px solid #ddd',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: selectedBg,
                            }}>
                              {selectMode && (
                                <Checkbox
                                  size="small"
                                  checked={isChecked}
                                  onChange={() => toggleSelect(poz.id)}
                                  sx={{ p: '2px' }}
                                />
                              )}
                            </Box>

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


      {/* ===== DÜZ LİSTE GÖRÜNÜMÜ ===== */}
      {!isLoading && !queryError && show === 'Main' && !editingPoz && viewMode === 'flat' && rawWbsNodes.length > 0 &&
        <Box sx={{ m: '1rem' }}>

          {leafNodes.length > 0 &&
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', mb: '1rem' }}>
              {leafNodes.map(node => (
                <Chip
                  key={node.id}
                  label={node.code_name ? `[${node.code_name}] ${node.name}` : node.name}
                  onClick={() => toggleFilterWbs(node.id)}
                  color={filterWbsIds.has(node.id) ? 'primary' : 'default'}
                  variant={filterWbsIds.has(node.id) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
              {filterWbsIds.size > 0 &&
                <Chip
                  label="Filtreyi temizle"
                  onClick={() => setFilterWbsIds(new Set())}
                  size="small" color="error" variant="outlined"
                />
              }
            </Box>
          }

          <Box sx={{ display: 'grid', gridTemplateColumns: flatColumns }}>
            {colHeaders.map((col, i) => (
              <Box key={i} sx={{ ...headerCellCss, textAlign: col.align }}>
                {i === colHeaders.length - 1 && selectMode
                  ? <Checkbox
                      size="small"
                      checked={displayedPozlar.length > 0 && displayedPozlar.every(p => selectedIds.has(p.id))}
                      indeterminate={displayedPozlar.some(p => selectedIds.has(p.id)) && !displayedPozlar.every(p => selectedIds.has(p.id))}
                      onChange={() => {
                        const allChecked = displayedPozlar.every(p => selectedIds.has(p.id))
                        setSelectedIds(allChecked
                          ? new Set([...selectedIds].filter(id => !displayedPozlar.some(p => p.id === id)))
                          : new Set([...selectedIds, ...displayedPozlar.map(p => p.id)])
                        )
                      }}
                      sx={{ p: '2px', color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
                    />
                  : col.label
                }
              </Box>
            ))}

            {displayedPozlar.length === 0 &&
              <Box sx={{ gridColumn: '1 / -1', p: '1rem', textAlign: 'center', color: 'text.secondary' }}>
                {filterWbsIds.size > 0 ? 'Seçili WBS için poz bulunamadı.' : 'Henüz poz eklenmedi.'}
              </Box>
            }

            {displayedPozlar.map(poz => {
              const isChecked = selectedIds.has(poz.id)
              const selectedBg = isChecked ? { backgroundColor: '#e3f2fd' } : {}
              return (
              <React.Fragment key={poz.id}>
                <Box sx={{ ...pozCellCss, fontFamily: 'monospace', fontWeight: 600, justifyContent: 'center', cursor: selectMode ? 'pointer' : 'default', ...selectedBg }}
                  onClick={() => selectMode && toggleSelect(poz.id)}>
                  {poz.code || '—'}
                </Box>
                <Box sx={{ ...pozCellCss, cursor: selectMode ? 'pointer' : 'default', ...selectedBg }}
                  onClick={() => selectMode && toggleSelect(poz.id)}>
                  {poz.short_desc}
                </Box>
                <Box sx={{ ...pozCellCss, justifyContent: 'center', cursor: selectMode ? 'pointer' : 'default', ...selectedBg }}
                  onClick={() => selectMode && toggleSelect(poz.id)}>
                  {unitsMap[poz.unit_id] ?? '—'}
                </Box>
                <Box sx={{ ...pozCellCss, justifyContent: 'center', ...selectedBg }}>
                  {selectMode && (
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={() => toggleSelect(poz.id)}
                      sx={{ p: '2px' }}
                    />
                  )}
                </Box>
              </React.Fragment>
              )
            })}
          </Box>
        </Box>
      }

    </Box>
  )
}
