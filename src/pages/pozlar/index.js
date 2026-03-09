import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes, useGetProjectPozlar, useGetPozUnits } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'
import FormPozCreate from '../../components/FormPozCreate'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ListIcon from '@mui/icons-material/List'


// Adjacency listini düzleştir
function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

// Kök → yaprak arası code_name'leri noktalı birleştir
function buildWbsPathCode(nodeId, rawNodes) {
  const path = []
  let current = rawNodes.find(n => n.id === nodeId)
  while (current) {
    if (current.code_name) path.unshift(current.code_name)
    current = current.parent_id ? rawNodes.find(n => n.id === current.parent_id) : null
  }
  return path.join('.')
}

// Yeni poz için otomatik kod üret: WBS_PATH.001
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

  const [viewMode, setViewMode] = useState('tree')      // 'tree' | 'flat'
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [filterWbsIds, setFilterWbsIds] = useState(new Set()) // flat mod filtresi
  const [activeWbsNodeId, setActiveWbsNodeId] = useState(null)
  const [show, setShow] = useState('Main')              // 'Main' | 'PozCreate'
  const [dialogAlert, setDialogAlert] = useState()

  const isLoading = wbsLoading || pozLoading || unitsLoading
  const queryError = pozError || unitsError

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  // Tüm WBS node'larını sıralı düz liste olarak al
  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])

  // Çocuğu olmayan node'lar → yaprak
  const isLeafSet = useMemo(() => {
    const s = new Set()
    rawWbsNodes.forEach(n => {
      if (!rawWbsNodes.some(c => c.parent_id === n.id)) s.add(n.id)
    })
    return s
  }, [rawWbsNodes])

  // Sadece yaprak node'lar (flat mod filter için)
  const leafNodes = useMemo(
    () => flatNodes.filter(n => isLeafSet.has(n.id)),
    [flatNodes, isLeafSet]
  )

  // unit_id → name map
  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  // Flat modda filtreli pozlar
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

  async function handleDeletePoz(poz) {
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: `"${poz.short_desc}" pozunu silmek istediğinizden emin misiniz?`,
      actionText1: 'Sil',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase.from('project_pozlar').delete().eq('id', poz.id)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Poz silinemedi.', detailText: error.message })
          return
        }
        invalidate()
      },
      actionText2: 'İptal',
      action2: () => setDialogAlert()
    })
  }

  // Herhangi bir atadan collapse edilmiş mi?
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

  // Ortak CSS objeleri
  const colHeaders = [
    { label: 'Poz Kodu', align: 'center' },
    { label: 'Açıklama', align: 'left' },
    { label: 'Birim', align: 'center' },
    { label: '', align: 'center' },
  ]

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

  const columns = 'max-content minmax(min-content, 40rem) max-content max-content'


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

              {/* Görünüm toggle */}
              <Grid item>
                <Tooltip title="WBS ağaç görünümü">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('tree')}
                    color={viewMode === 'tree' ? 'primary' : 'default'}
                  >
                    <AccountTreeIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Düz liste">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('flat')}
                    color={viewMode === 'flat' ? 'primary' : 'default'}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              {/* Poz ekle */}
              <Grid item>
                <Tooltip title={
                  !canAddPoz
                    ? 'Önce Proje Ayarları\'ndan birim ekleyin'
                    : viewMode === 'tree' && !activeWbsNodeId
                    ? 'Bir WBS yaprak düğümü seçin'
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

            </Grid>
          </Grid>
        </Grid>
      </Paper>


      {isLoading &&
        <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>
      }

      {/* POZ OLUŞTURMA FORMU */}
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

      {/* Veritabanı hatası */}
      {!isLoading && queryError && show === 'Main' &&
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veritabanı sorgusu başarısız. SQL'lerin çalıştırıldığından emin olun.
          <br /><small style={{ opacity: 0.7 }}>{queryError.message}</small>
        </Alert>
      }

      {/* Uyarılar */}
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


      {/* ===== AĞAÇ GÖRÜNÜMÜ ===== */}
      {!isLoading && !queryError && show === 'Main' && viewMode === 'tree' && rawWbsNodes.length > 0 &&
        <Box sx={{ m: '1rem', display: 'grid', gridTemplateColumns: columns }}>

          {/* Sütun başlıkları */}
          {colHeaders.map((col, i) => (
            <Box key={i} sx={{ ...headerCellCss, textAlign: col.align }}>
              {col.label}
            </Box>
          ))}

          {flatNodes.map(node => {
            if (isHiddenByAncestor(node)) return null
            const isLeaf = isLeafSet.has(node.id)
            const isSelected = activeWbsNodeId === node.id
            const pozlarOfNode = rawPozlar
              .filter(p => p.wbs_node_id === node.id)
              .sort((a, b) => a.order_index - b.order_index)

            return (
              <React.Fragment key={node.id}>

                {/* WBS düğümü başlığı */}
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    pl: `${0.5 + node.depth * 1.5}rem`, pr: '0.5rem', py: '0.3rem',
                    backgroundColor: isSelected ? '#1a3a5c' : isLeaf ? '#1e2c1e' : '#2a2a2a',
                    color: isSelected ? '#90caf9' : isLeaf ? '#a5d6a7' : '#ccc',
                    fontWeight: 600,
                    border: '1px solid #444',
                    mt: '0.2rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => {
                    if (!isLeaf) { toggleCollapse(node.id); return }
                    setActiveWbsNodeId(prev => prev === node.id ? null : node.id)
                  }}
                >
                  {/* Açma/kapama oku (non-leaf) */}
                  {!isLeaf &&
                    <Box sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {collapsedIds.has(node.id) ? '▶' : '▼'}
                    </Box>
                  }
                  {/* Yaprak göstergesi */}
                  {isLeaf &&
                    <Box sx={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#65FF00', flexShrink: 0 }} />
                  }
                  {/* Kısa kod */}
                  {node.code_name &&
                    <Box sx={{ fontSize: '0.75rem', color: '#888', flexShrink: 0 }}>
                      [{node.code_name}]
                    </Box>
                  }
                  {/* Node adı */}
                  <Box>{node.name}</Box>
                  {/* Poz sayısı */}
                  {isLeaf &&
                    <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#888', flexShrink: 0 }}>
                      {pozlarOfNode.length > 0 ? `${pozlarOfNode.length} poz` : 'poz yok'}
                    </Box>
                  }
                </Box>

                {/* Yaprak ise pozlarını göster */}
                {isLeaf && !collapsedIds.has(node.id) && pozlarOfNode.map(poz => (
                  <React.Fragment key={poz.id}>
                    <Box sx={{ ...pozCellCss, fontFamily: 'monospace', fontWeight: 600, justifyContent: 'center' }}>
                      {poz.code || '-'}
                    </Box>
                    <Box sx={{ ...pozCellCss }}>
                      {poz.short_desc}
                    </Box>
                    <Box sx={{ ...pozCellCss, justifyContent: 'center' }}>
                      {unitsMap[poz.unit_id] ?? '-'}
                    </Box>
                    <Box sx={{ ...pozCellCss, justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => handleDeletePoz(poz)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </React.Fragment>
                ))}

              </React.Fragment>
            )
          })}

        </Box>
      }


      {/* ===== DÜZ LİSTE GÖRÜNÜMÜ ===== */}
      {!isLoading && !queryError && show === 'Main' && viewMode === 'flat' && rawWbsNodes.length > 0 &&
        <Box sx={{ m: '1rem' }}>

          {/* WBS yaprak filtre chip'leri */}
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
                  size="small"
                  color="error"
                  variant="outlined"
                />
              }
            </Box>
          }

          {/* Poz tablosu */}
          <Box sx={{ display: 'grid', gridTemplateColumns: columns }}>

            {colHeaders.map((col, i) => (
              <Box key={i} sx={{ ...headerCellCss, textAlign: col.align }}>
                {col.label}
              </Box>
            ))}

            {displayedPozlar.length === 0 &&
              <Box sx={{ gridColumn: '1 / -1', p: '1rem', textAlign: 'center', color: 'text.secondary' }}>
                {filterWbsIds.size > 0 ? 'Seçili WBS için poz bulunamadı.' : 'Henüz poz eklenmedi.'}
              </Box>
            }

            {displayedPozlar.map(poz => (
              <React.Fragment key={poz.id}>
                <Box sx={{ ...pozCellCss, fontFamily: 'monospace', fontWeight: 600, justifyContent: 'center' }}>
                  {poz.code || '-'}
                </Box>
                <Box sx={{ ...pozCellCss }}>
                  {poz.short_desc}
                </Box>
                <Box sx={{ ...pozCellCss, justifyContent: 'center' }}>
                  {unitsMap[poz.unit_id] ?? '-'}
                </Box>
                <Box sx={{ ...pozCellCss, justifyContent: 'center' }}>
                  <IconButton size="small" onClick={() => handleDeletePoz(poz)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </React.Fragment>
            ))}

          </Box>
        </Box>
      }

    </Box>
  )
}
