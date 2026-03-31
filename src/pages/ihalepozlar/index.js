import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { useGetWbsNodes, useGetPozUnits, useGetWorkPackagePozlar, useGetIhaleBids } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import TextField from '@mui/material/TextField'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'

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

export default function P_IhalePozlar() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, setSelectedPoz, appUser } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    else if (!selectedIsPaket) navigate('/ihale')
  }, [selectedProje, selectedIsPaket, navigate])

  useEffect(() => { setSelectedPoz(null) }, [])

  const { data: rawWbsNodesData, isLoading: wbsLoading } = useGetWbsNodes()
  const { data: unitsData, isLoading: unitsLoading } = useGetPozUnits()
  const { data: wpPozlarData, isLoading: wpPozLoading, error: wpPozError } = useGetWorkPackagePozlar()
  const { data: bidsData = [], isLoading: bidsLoading, refetch: refetchBids } = useGetIhaleBids()

  const rawWbsNodes = rawWbsNodesData ?? EMPTY_ARRAY
  const units = unitsData ?? EMPTY_ARRAY
  const wpPozlar = wpPozlarData ?? EMPTY_ARRAY

  // Onaylanan miktar hesabı (measurement_lines status=approved)
  const [onayMap, setOnayMap] = useState({})
  const [onayLoading, setOnayLoading] = useState(false)

  useEffect(() => {
    if (wpPozlar.length === 0) return
    setOnayLoading(true)
    const wppIds = wpPozlar.map(wpp => wpp.id)
    const wppToPoz = {}
    wpPozlar.forEach(wpp => { wppToPoz[wpp.id] = wpp.project_poz_id })

    ;(async () => {
      const { data: areas } = await supabase
        .from('work_package_poz_areas')
        .select('id, work_package_poz_id')
        .in('work_package_poz_id', wppIds)

      if (!areas?.length) { setOnayMap({}); setOnayLoading(false); return }

      const areaToPoz = {}
      areas.forEach(a => {
        const pozId = wppToPoz[a.work_package_poz_id]
        if (pozId) areaToPoz[a.id] = pozId
      })

      const { data: sessions } = await supabase
        .from('measurement_sessions')
        .select('id, work_package_poz_area_id')
        .in('work_package_poz_area_id', areas.map(a => a.id))

      if (!sessions?.length) { setOnayMap({}); setOnayLoading(false); return }

      const sessAreaMap = {}
      sessions.forEach(s => { sessAreaMap[s.id] = s.work_package_poz_area_id })

      const { data: lines } = await supabase
        .from('measurement_lines')
        .select('id, session_id, status, line_type, multiplier, count, length, width, height, parent_line_id')
        .in('session_id', sessions.map(s => s.id))

      if (!lines) { setOnayMap({}); setOnayLoading(false); return }

      function computeQty(line) {
        if (!line || line.line_type !== 'data') return 0
        const isEmpty = v => v === null || v === undefined || v === ''
        const vals = [Number(line.multiplier) === 1 ? null : line.multiplier, line.count, line.length, line.width, line.height]
        if (vals.every(isEmpty)) return 0
        return vals.map(v => isEmpty(v) ? 1 : (Number(v) || 0)).reduce((a, b) => a * b, 1)
      }

      const approvedChildrenOf = {}
      lines.forEach(l => {
        if (l.parent_line_id && l.status === 'approved') approvedChildrenOf[l.parent_line_id] = true
      })

      const map = {}
      lines.forEach(line => {
        if (line.status !== 'approved' || approvedChildrenOf[line.id]) return
        const pozId = areaToPoz[sessAreaMap[line.session_id]]
        if (!pozId) return
        map[pozId] = (map[pozId] ?? 0) + computeQty(line)
      })

      setOnayMap(map)
      setOnayLoading(false)
    })()
  }, [wpPozlar])

  // Teklif verenler + display name
  const [bidders, setBidders] = useState([]) // [{ id, display_name }]

  useEffect(() => {
    if (bidsData.length === 0) { setBidders([]); return }
    const uniqueIds = [...new Set(bidsData.map(b => b.bidder_user_id))]
    ;(async () => {
      const { data } = await supabase.rpc('get_user_display_names', { user_ids: uniqueIds })
      const nameMap = {}
      data?.forEach(u => { nameMap[u.id] = u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.id.slice(0, 8) })
      setBidders(uniqueIds.map(id => ({ id, display_name: nameMap[id] ?? id.slice(0, 8) })))
    })()
  }, [bidsData])

  // Frontend-first düzenleme
  const [localEdits, setLocalEdits] = useState({}) // key: "pozId_bidderUserId" → string
  const [isSaving, setIsSaving] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()

  const isChanged = Object.keys(localEdits).length > 0

  const getEffectiveUnitPrice = (pozId, bidderUserId) => {
    const key = `${pozId}_${bidderUserId}`
    if (localEdits[key] !== undefined) return localEdits[key]
    const existing = bidsData.find(b => b.project_poz_id === pozId && b.bidder_user_id === bidderUserId)
    return existing?.unit_price != null ? String(existing.unit_price) : ''
  }

  const getTutar = (pozId, bidderUserId) => {
    const onay = onayMap[pozId]
    const bf = Number(getEffectiveUnitPrice(pozId, bidderUserId))
    if (!onay || !bf || isNaN(bf)) return null
    return onay * bf
  }

  const handleBirimFiyatChange = (pozId, bidderUserId, value) => {
    const key = `${pozId}_${bidderUserId}`
    setLocalEdits(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const rows = Object.entries(localEdits).map(([key, value]) => {
      const [pozId, bidderUserId] = key.split('_')
      return {
        work_package_id: selectedIsPaket.id,
        project_poz_id: pozId,
        bidder_user_id: bidderUserId,
        unit_price: value === '' ? null : Number(value),
        updated_at: new Date().toISOString(),
      }
    })
    const { error } = await supabase
      .from('ihale_bids')
      .upsert(rows, { onConflict: 'work_package_id,project_poz_id,bidder_user_id' })
    setIsSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kaydetme sırasında hata oluştu.', detailText: error.message, onCloseAction: () => setDialogAlert() })
    } else {
      setLocalEdits({})
      refetchBids()
    }
  }

  const handleCancel = () => setLocalEdits({})

  // Firma görünürlüğü
  const [hiddenBidders, setHiddenBidders] = useState(new Set())
  const [bidderVisDialogOpen, setBidderVisDialogOpen] = useState(false)
  const visibleBidders = useMemo(() => bidders.filter(b => !hiddenBidders.has(b.id)), [bidders, hiddenBidders])

  // WBS tree
  const [collapsedIds, setCollapsedIds] = useState(new Set())
  const [hoveredPozId, setHoveredPozId] = useState(null)

  const flatNodes = useMemo(() => flattenTree(rawWbsNodes), [rawWbsNodes])
  const isLeafSet = useMemo(() => {
    const s = new Set()
    flatNodes.forEach(n => { if (!flatNodes.some(c => c.parent_id === n.id)) s.add(n.id) })
    return s
  }, [flatNodes])
  const maxLeafDepth = useMemo(() => {
    let max = 0
    flatNodes.forEach(n => { if (isLeafSet.has(n.id)) max = Math.max(max, n.depth) })
    return max
  }, [flatNodes, isLeafSet])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = (u.name || '').replace(/²/g, '2').replace(/³/g, '3') })
    return m
  }, [units])

  const rawPozlar = useMemo(() =>
    wpPozlar.filter(wpp => wpp.project_poz).map(wpp => wpp.project_poz),
    [wpPozlar]
  )

  const handleExpandAll = () => setCollapsedIds(new Set())
  const handleCollapseAll = () => setCollapsedIds(new Set(flatNodes.filter(n => !isLeafSet.has(n.id)).map(n => n.id)))
  const toggleCollapse = id => setCollapsedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const handlePozClick = poz => {
    setSelectedPoz(poz)
    navigate(`/metraj/pozlar/${poz.id}/mahaller?from=ihale`)
  }

  // Grid sütun şablonu
  const totalDepthCols = maxLeafDepth + 1
  const treeGridCols = useMemo(() => {
    const depthCols = `repeat(${totalDepthCols}, 1rem)`
    const firmaCols = visibleBidders.flatMap(() => ['7rem', '8rem']).join(' ')
    return `1rem ${depthCols} 6rem minmax(20rem, max-content) 8rem${firmaCols ? ' ' + firmaCols : ''}`
  }, [totalDepthCols, visibleBidders])

  const css_baslik = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    px: '0.4rem', py: '0.3rem',
    backgroundColor: 'black', color: 'white',
    fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase',
    borderBottom: '1px solid #333', whiteSpace: 'nowrap',
  }
  const css_baslik_onaylanan = { ...css_baslik, px: '4px', ml: '0.5rem', mr: '0.5rem' }
  const css_baslik_firma = { ...css_baslik, px: '4px', backgroundColor: '#111', borderLeft: '1px solid rgba(255,255,255,0.1)' }
  const css_satir_bg = '#c8d4dd'
  const css_satir_hover = '#a5b8c8'

  const isLoading = wbsLoading || unitsLoading || wpPozLoading || bidsLoading || onayLoading

  return (
    <Box sx={{ overflow: 'hidden', height: '100%' }}>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction}
        />
      )}

      {/* Teklif Verenler Dialog */}
      <Dialog open={bidderVisDialogOpen} onClose={() => setBidderVisDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Box component="span" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>Teklif Verenler</Box>
          <Tooltip title={hiddenBidders.size === 0 ? 'Hepsini Kaldır' : 'Hepsini Seç'}>
            <IconButton size="small" sx={{ mr: 0 }}
              onClick={() => {
                hiddenBidders.size === 0
                  ? setHiddenBidders(new Set(bidders.map(b => b.id)))
                  : setHiddenBidders(new Set())
              }}
            >
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <CheckIcon sx={{ fontSize: 20, color: hiddenBidders.size > 0 ? 'text.secondary' : 'primary.main', ...(hiddenBidders.size === 0 && { filter: 'drop-shadow(0 0 1px currentColor)' }) }} />
                <CheckIcon sx={{ fontSize: 20, ml: '-8px', color: hiddenBidders.size === 0 ? 'primary.main' : 'text.secondary', ...(hiddenBidders.size === 0 && { filter: 'drop-shadow(0 0 1px currentColor)' }) }} />
              </Box>
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <List>
            {bidders.map(b => (
              <ListItem key={b.id} secondaryAction={
                <Switch edge="end"
                  checked={!hiddenBidders.has(b.id)}
                  onChange={e => {
                    const s = new Set(hiddenBidders)
                    e.target.checked ? s.delete(b.id) : s.add(b.id)
                    setHiddenBidders(s)
                  }}
                />
              }>
                <ListItemText primary={b.display_name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* BAŞLIK */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 2 }}>
        <Grid container alignItems="center" sx={{ px: '1rem', minHeight: '3.5rem' }}>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Typography onClick={() => navigate('/ihale')} sx={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.5, whiteSpace: 'nowrap', textTransform: 'uppercase', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}>İhale</Typography>
              <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{selectedIsPaket?.name}</Typography>
            </Box>
          </Grid>
          <Grid item xs="auto" sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isChanged && (
              <>
                <Tooltip title="Kaydet">
                  <IconButton size="small" onClick={handleSave} disabled={isSaving}
                    sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: '4px', color: 'success.main', '&:hover': { backgroundColor: 'success.light' } }}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="İptal">
                  <IconButton size="small" onClick={handleCancel}
                    sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={collapsedIds.size > 0 ? 'Tümünü Aç' : 'Tümünü Özetle'}>
              <IconButton size="small" onClick={collapsedIds.size > 0 ? handleExpandAll : handleCollapseAll}
                sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}>
                {collapsedIds.size > 0 ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Teklif verenleri göster/gizle">
              <IconButton size="small" onClick={() => setBidderVisDialogOpen(true)}
                sx={{ border: '1px solid', borderColor: 'grey.400', borderRadius: '4px', ...(hiddenBidders.size > 0 ? { pl: '0.4rem', pr: '0.9rem' } : {}), '&:hover': { borderColor: 'grey.600', backgroundColor: 'grey.100' } }}>
                <Badge badgeContent={hiddenBidders.size} color="error" sx={{ '& .MuiBadge-badge': { right: -8 } }}>
                  <PersonIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </AppBar>

      {isLoading && <LinearProgress />}

      {wpPozError && (
        <Alert severity="error" sx={{ m: '1rem' }}>Veri alınırken hata: {wpPozError.message}</Alert>
      )}

      {!isLoading && rawPozlar.length === 0 && (
        <Alert severity="info" sx={{ m: '1rem' }}>Bu iş paketine henüz poz atanmamış.</Alert>
      )}

      {rawPozlar.length > 0 && (
        <Box sx={{ p: '1rem', overflow: 'auto', height: `calc(100% - 5rem)` }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: treeGridCols, gap: '0px', width: 'fit-content' }}>

            {/* Başlık satırı */}
            <Box sx={{ ...css_baslik }} />
            {Array.from({ length: totalDepthCols }).map((_, i) => <Box key={`h-d-${i}`} sx={{ ...css_baslik }} />)}
            <Box sx={{ ...css_baslik }} />
            <Box sx={{ ...css_baslik }} />
            <Box sx={{ ...css_baslik_onaylanan }}>Onaylanan</Box>
            {visibleBidders.flatMap(b => [
              <Box key={`hbf-${b.id}`} sx={{ ...css_baslik_firma, fontSize: '0.65rem' }}>{b.display_name}<br />BF</Box>,
              <Box key={`ht-${b.id}`} sx={{ ...css_baslik_firma, fontSize: '0.65rem' }}>{b.display_name}<br />Tutar</Box>,
            ])}

            {/* Proje adı satırı */}
            <Box sx={{ backgroundColor: 'black' }} />
            <Box sx={{ gridColumn: `span ${totalDepthCols + 2}`, backgroundColor: 'black', color: 'white', pl: '6px', py: '2px', display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedProje?.name}</Typography>
            </Box>
            <Box sx={{ backgroundColor: 'black', ml: '0.5rem', mr: '0.5rem' }} />
            {visibleBidders.flatMap(b => [
              <Box key={`pnbf-${b.id}`} sx={{ backgroundColor: 'black' }} />,
              <Box key={`pnt-${b.id}`} sx={{ backgroundColor: 'black' }} />,
            ])}

            {/* WBS + Poz satırları */}
            {flatNodes.map(node => {
              const isLeaf = isLeafSet.has(node.id)
              const isCollapsed = collapsedIds.has(node.id)
              const pozlarOfNode = rawPozlar.filter(p => p.wbs_node_id === node.id)
              const c = nodeColor(node.depth)

              let ancestorParentId = node.parent_id
              let isAncestorCollapsed = false
              while (ancestorParentId) {
                if (collapsedIds.has(ancestorParentId)) { isAncestorCollapsed = true; break }
                const par = flatNodes.find(n => n.id === ancestorParentId)
                ancestorParentId = par?.parent_id
              }
              if (isAncestorCollapsed) return null

              return (
                <React.Fragment key={node.id}>
                  {/* WBS node başlık satırı */}
                  <Box sx={{ backgroundColor: 'black' }} />
                  {Array.from({ length: node.depth }).map((_, i) => (
                    <Box key={`nd-${node.id}-${i}`} sx={{ backgroundColor: nodeColor(i).bg }} />
                  ))}
                  <Box
                    sx={{ gridColumn: `span ${totalDepthCols + 2 - node.depth}`, pl: '6px', py: '1px', backgroundColor: c.bg, color: c.co, display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}
                    onClick={() => toggleCollapse(node.id)}
                  >
                    <Box sx={{ fontSize: '0.7rem', mr: '0.4rem', color: (isCollapsed && (!isLeaf || pozlarOfNode.length > 0)) ? '#00e676' : 'inherit' }}>
                      {isCollapsed ? '▶' : '▼'}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: c.bg, borderLeft: '0.5rem solid white', borderRight: '0.5rem solid white' }} />
                  {visibleBidders.flatMap(b => [
                    <Box key={`wbf-${node.id}-${b.id}`} sx={{ backgroundColor: c.bg }} />,
                    <Box key={`wt-${node.id}-${b.id}`} sx={{ backgroundColor: c.bg }} />,
                  ])}

                  {/* Poz satırları */}
                  {isLeaf && !isCollapsed && pozlarOfNode.map(poz => {
                    const isHovered = hoveredPozId === poz.id
                    const rowBg = isHovered ? css_satir_hover : css_satir_bg
                    const pozBirim = unitsMap[poz.unit_id] || ''
                    const onaylanan = onayMap[poz.id]

                    return (
                      <React.Fragment key={poz.id}>
                        <Box sx={{ backgroundColor: 'black', cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPozId(poz.id)}
                          onMouseLeave={() => setHoveredPozId(null)} />

                        {Array.from({ length: totalDepthCols }).map((_, i) => (
                          <Box key={`d-${poz.id}-${i}`}
                            onMouseEnter={() => setHoveredPozId(poz.id)}
                            onMouseLeave={() => setHoveredPozId(null)}
                            sx={{ backgroundColor: i <= node.depth ? nodeColor(i).bg : 'transparent', py: '2px', cursor: 'pointer' }} />
                        ))}

                        {/* Kod */}
                        <Box
                          onMouseEnter={() => setHoveredPozId(poz.id)} onMouseLeave={() => setHoveredPozId(null)}
                          sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          {poz.code}
                        </Box>

                        {/* Açıklama */}
                        <Box
                          onMouseEnter={() => setHoveredPozId(poz.id)} onMouseLeave={() => setHoveredPozId(null)}
                          onClick={() => handlePozClick(poz)}
                          sx={{ backgroundColor: rowBg, px: '4px', py: '2px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          {poz.short_desc}
                        </Box>

                        {/* Onaylanan */}
                        <Box
                          onMouseEnter={() => setHoveredPozId(poz.id)} onMouseLeave={() => setHoveredPozId(null)}
                          sx={{ backgroundColor: rowBg, ml: '0.5rem', mr: '0.5rem', px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                          {onaylanan != null ? `${ikiHane(onaylanan)}${pozBirim ? ` ${pozBirim}` : ''}` : ''}
                        </Box>

                        {/* Firma sütunları */}
                        {visibleBidders.flatMap(b => {
                          const canEdit = appUser?.id === b.id
                          const bf = getEffectiveUnitPrice(poz.id, b.id)
                          const tutar = getTutar(poz.id, b.id)
                          return [
                            /* Birim Fiyat */
                            <Box key={`bf-${poz.id}-${b.id}`}
                              onMouseEnter={() => setHoveredPozId(poz.id)} onMouseLeave={() => setHoveredPozId(null)}
                              sx={{ backgroundColor: rowBg, px: '2px', py: '1px', borderLeft: '1px dotted rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {canEdit ? (
                                <TextField
                                  variant="standard"
                                  size="small"
                                  value={bf}
                                  onChange={e => handleBirimFiyatChange(poz.id, b.id, e.target.value)}
                                  inputProps={{ style: { fontSize: '0.75rem', textAlign: 'right', padding: '1px 4px' } }}
                                  sx={{ width: '6rem' }}
                                />
                              ) : (
                                <Box sx={{ fontSize: '0.75rem', px: '4px', color: '#555' }}>{bf ? ikiHane(Number(bf)) : ''}</Box>
                              )}
                            </Box>,
                            /* Tutar */
                            <Box key={`t-${poz.id}-${b.id}`}
                              onMouseEnter={() => setHoveredPozId(poz.id)} onMouseLeave={() => setHoveredPozId(null)}
                              sx={{ backgroundColor: rowBg, px: '6px', py: '2px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', whiteSpace: 'nowrap', borderLeft: '1px dotted rgba(0,0,0,0.1)' }}>
                              {tutar != null ? ikiHane(tutar) : ''}
                            </Box>,
                          ]
                        })}
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}
