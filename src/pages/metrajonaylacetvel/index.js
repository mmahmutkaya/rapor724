import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store.js'
import { supabase } from '../../lib/supabase.js'
import { useGetPozUnits } from '../../hooks/useMongo.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'
import { getMeasurementVisualStatus } from '../../lib/measurementStatus.js'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ClearIcon from '@mui/icons-material/Clear'
import BlockIcon from '@mui/icons-material/Block'
import HourglassFullIcon from '@mui/icons-material/HourglassFull'
import CheckIcon from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'


function computeQuantity(line) {
  if (!line || line.line_type !== 'data') return 0
  const isEmpty = (val) => val === null || val === undefined || val === ''
  const vals = [
    (Number(line.multiplier) === 1 ? null : line.multiplier),
    line.count, line.length, line.width, line.height,
  ]
  const allEmpty = vals.every(isEmpty)
  if (allEmpty) return 0
  const v = (val) => isEmpty(val) ? 1 : Number(val)
  const qty = v(line.multiplier) * v(line.count) * v(line.length) * v(line.width) * v(line.height)
  return isNaN(qty) ? 0 : qty
}

// Düz listeyi depth-first ağaç sırasına çevirir; her öğeye siraNo ve depth ekler
function buildDisplayTree(lines) {
  const childrenOf = {}
  const roots = []
  lines.forEach(l => {
    if (!l.parent_line_id) roots.push(l)
    else {
      if (!childrenOf[l.parent_line_id]) childrenOf[l.parent_line_id] = []
      childrenOf[l.parent_line_id].push(l)
    }
  })
  const sort = arr => arr.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  sort(roots)
  Object.values(childrenOf).forEach(sort)
  const result = []
  function visit(line, siraNo, depth) {
    result.push({ ...line, siraNo, depth })
    ;(childrenOf[line.id] ?? []).forEach((child, i) => visit(child, `${siraNo}.${i + 1}`, depth + 1))
  }
  roots.forEach((root, i) => visit(root, `${i + 1}`, 0))
  return result
}

/**
 * Onaylanan Metraj ağacı:
 *   Kök: parent_line_id IS NULL AND status = 'approved'
 *   Çocuk: parent_line_id IS NOT NULL (tüm alt satırlar, her durumda)
 */
function buildApprovalTree(allLines, allSessions, userMap) {
  const sessionMap = {}
  allSessions.forEach(s => { sessionMap[s.id] = s })

  const childrenOf = {}
  allLines.filter(l => l.parent_line_id).forEach(l => {
    if (!childrenOf[l.parent_line_id]) childrenOf[l.parent_line_id] = []
    childrenOf[l.parent_line_id].push(l)
  })

  function enrich(line, siraNo, depth) {
    const sess = sessionMap[line.session_id]
    const hazırlayan = userMap[sess?.created_by] ?? sess?.userName ?? '?'
    const onaylayan  = line.approved_by
      ? (userMap[line.approved_by] ?? '?')
      : line.status === 'pending' ? '(bekliyor)' : null
    const kids = (childrenOf[line.id] ?? [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    return {
      ...line, siraNo, depth, hazırlayan, onaylayan,
      children: kids.map((c, i) => enrich(c, `${siraNo}.${i + 1}`, depth + 1)),
    }
  }

  return allLines
    .filter(l => !l.parent_line_id && l.status === 'approved')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((l, i) => enrich(l, `${i + 1}`, 0))
}

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

const STATUS_ORDER = { approved: 0, ready: 1, draft: 2 }
const GRID_COLS = 'max-content 1fr 70px 70px 70px 70px 70px 90px 80px'
const NUM_FIELDS = ['multiplier', 'count', 'length', 'width', 'height']
const NUM_LABELS = ['Çarpan', 'Adet', 'Boy', 'En', 'Yükseklik']

const css_lineHeaderCell = {
  px: '4px', py: '3px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
  backgroundColor: '#415a77', color: '#e0e1dd',
  fontSize: '0.75rem', fontWeight: 600,
}
const css_lineCell = {
  px: '4px',
  height: '34px',
  fontSize: '0.85rem',
  color: '#333',
  display: 'flex', alignItems: 'center',
  borderRight: '1px dashed #d8d8d8',
  overflow: 'hidden',
}

function getCardColors(visualStatus) {
  if (visualStatus === 'approved') return { border: '#A5D6A7', header: '#415a77', row: 'rgba(200,230,201,0.35)' }
  if (visualStatus === 'revised') return { border: '#90CAF9', header: '#415a77', row: 'rgba(187,222,251,0.35)' }
  if (visualStatus === 'rejected') return { border: '#EF9A9A', header: '#415a77', row: 'rgba(255,205,210,0.28)' }
  if (visualStatus === 'pendingRevision') return { border: '#CE93D8', header: '#415a77', row: 'rgba(206,147,216,0.15)' }
  return { border: '#64B5F6', header: '#415a77', row: 'rgba(100,181,246,0.15)' }
}


export default function P_MetrajOnaylaCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal_metraj } = useContext(StoreContext)
  const { data: units = [] } = useGetPozUnits()

  const [dialogAlert, setDialogAlert]       = useState()
  const [loading, setLoading]               = useState(true)
  const [sessions, setSessions]             = useState([])
  const [userMap, setUserMap]               = useState({})
  const [currentUserId, setCurrentUserId]   = useState(null)
  const [expandedApproved, setExpandedApproved] = useState({})
  const [showAllOriginals, setShowAllOriginals] = useState(false)
  const [openVisibilityDialog, setOpenVisibilityDialog] = useState(false)
  const [visibleOnayKarti, setVisibleOnayKarti]         = useState(true)
  const [visibleSessCards, setVisibleSessCards]         = useState({})

  const wpAreaId = selectedMahal_metraj?.wpAreaId

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) { navigate('/metrajonayla'); return }
    if (!selectedPoz)                        { navigate('/metrajonaylapozlar'); return }
    if (!wpAreaId)                           { navigate('/metrajonaylapozmahaller'); return }
  }, [])

  const loadData = async () => {
    if (!wpAreaId) return
    setLoading(true)
    try {
      const { data: { session: authSess } } = await supabase.auth.getSession()
      const currentUid = authSess?.user?.id ?? null
      setCurrentUserId(currentUid)

      const { data: sessData, error: sessError } = await supabase
        .from('measurement_sessions')
        .select('*')
        .eq('work_package_poz_area_id', wpAreaId)
        .order('updated_at', { ascending: false })
      if (sessError) throw sessError

      if (!sessData?.length) { setSessions([]); setLoading(false); return }

      const sessionIds = sessData.map(s => s.id)
      const { data: linesData, error: linesError } = await supabase
        .from('measurement_lines')
        .select('*')
        .in('session_id', sessionIds)
        .order('order_index')
      if (linesError) throw linesError

      const uniqueUserIds = [...new Set([
        currentUid,
        ...sessData.map(s => s.created_by),
        ...(linesData ?? []).map(l => l.approved_by),
      ].filter(Boolean))]
      const nameMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: nameRows } = await supabase.rpc('get_user_display_names', { user_ids: uniqueUserIds })
        if (nameRows) nameRows.forEach(row => { nameMap[row.id] = row.display_name || row.id })
      }
      setUserMap(nameMap)

      const linesBySession = {}
      ;(linesData ?? []).forEach(l => {
        if (!linesBySession[l.session_id]) linesBySession[l.session_id] = []
        linesBySession[l.session_id].push(l)
      })

      const sorted = [...sessData].sort((a, b) =>
        (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
      )

      setSessions(sorted.map(sess => ({
        ...sess,
        visualStatus: getMeasurementVisualStatus(sess),
        userName: nameMap[sess.created_by] ?? '?',
        lines: linesBySession[sess.id] ?? [],
      })))

      setVisibleSessCards(prev => {
        const next = { ...prev }
        sorted.forEach(sess => { if (next[sess.id] === undefined) next[sess.id] = true })
        return next
      })
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Veriler yüklenirken hata oluştu.', detailText: err.message, onCloseAction: () => setDialogAlert() })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [wpAreaId])

  // ── Türetilmiş Veri ────────────────────────────────────────────────────────────

  const approvalTree = useMemo(() => {
    const allLines = sessions.flatMap(s => s.lines ?? [])
    return buildApprovalTree(allLines, sessions, userMap)
  }, [sessions, userMap])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  // ── Aksiyonlar ────────────────────────────────────────────────────────────────

  const approveLine = async (lineId) => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('measurement_lines')
      .update({ status: 'approved', approved_by: currentUserId, approved_at: now })
      .eq('id', lineId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Onaylama sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSessions(prev => prev.map(s => ({
      ...s,
      lines: s.lines.map(l => l.id === lineId ? { ...l, status: 'approved', approved_by: currentUserId, approved_at: now } : l),
    })))
  }

  const ignoreLine = async (lineId) => {
    const { error } = await supabase
      .from('measurement_lines').update({ status: 'ignored' }).eq('id', lineId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Ignore sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSessions(prev => prev.map(s => ({
      ...s,
      lines: s.lines.map(l => l.id === lineId ? { ...l, status: 'ignored' } : l),
    })))
  }

  const rejectLine = async (lineId) => {
    const { error } = await supabase
      .from('measurement_lines').update({ status: 'rejected' }).eq('id', lineId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Reddetme sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSessions(prev => prev.map(s => ({
      ...s,
      lines: s.lines.map(l => l.id === lineId ? { ...l, status: 'rejected' } : l),
    })))
  }

  // ── Onay ağacı yardımcıları ───────────────────────────────────────────────────

  const flattenAll = (nodes) => {
    const result = []
    const visit = (n) => { result.push(n); if (n.children) n.children.forEach(visit) }
    nodes.forEach(visit)
    return result
  }

  // ── RENDER ────────────────────────────────────────────────────────────────────

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  return (
    <Box>
      <style>{`
        .metraj-num-input::-webkit-outer-spin-button,
        .metraj-num-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          actionText1={dialogAlert.actionText1}
          action1={dialogAlert.action1}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* KART GÖRÜNÜRLÜĞÜ DİALOG */}
      <Dialog
        open={openVisibilityDialog}
        onClose={() => setOpenVisibilityDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '10rem !important',
            transform: 'none',
            margin: 0,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>Göster / Gizle</DialogTitle>
        <DialogContent>
          <List dense disablePadding>
            <Divider sx={{ mb: 0.5 }} />
            <ListItem
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { backgroundColor: 'rgba(27,94,32,0.06)' } }}
              onClick={() => setVisibleOnayKarti(v => !v)}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setVisibleOnayKarti(v => !v) }}
                  sx={{ color: visibleOnayKarti ? '#1b5e20' : '#90a4ae' }}
                >
                  {visibleOnayKarti
                    ? <VisibilityIcon sx={{ fontSize: 20 }} />
                    : <VisibilityOffIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              }
            >
              <ListItemText
                primary="Onaylı Metraj"
                primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 600, color: visibleOnayKarti ? '#1b5e20' : '#9e9e9e', sx: { textDecoration: visibleOnayKarti ? 'none' : 'line-through' } }}
              />
            </ListItem>

            {sessions.length > 0 && <Divider sx={{ my: 1 }} />}

            {sessions.map(sess => {
              const isVisible = visibleSessCards[sess.id] ?? true
              return (
                <ListItem
                  key={sess.id}
                  sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { backgroundColor: 'rgba(65,90,119,0.06)' } }}
                  onClick={() => setVisibleSessCards(prev => ({ ...prev, [sess.id]: !isVisible }))}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setVisibleSessCards(prev => ({ ...prev, [sess.id]: !isVisible })) }}
                      sx={{ color: isVisible ? '#415a77' : '#90a4ae' }}
                    >
                      {isVisible
                        ? <VisibilityIcon sx={{ fontSize: 20 }} />
                        : <VisibilityOffIcon sx={{ fontSize: 20 }} />}
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={sess.userName}
                    primaryTypographyProps={{ fontSize: '0.88rem', color: isVisible ? '#263238' : '#9e9e9e', sx: { textDecoration: isVisible ? 'none' : 'line-through' } }}
                  />
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* BAŞLIK */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <IconButton sx={{ m: 0, p: 0 }} onClick={() => navigate('/metrajonaylapozmahaller')}>
                <ReplyIcon sx={{ color: 'gray' }} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonayla')}
              >
                Metraj Onayla
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonaylapozlar')}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.6, cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonaylapozmahaller')}
              >
                {pozLabel}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {selectedMahal_metraj?.name ?? 'Mahal'}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Tooltip title="Kart görünürlüğü">
              <IconButton onClick={() => setOpenVisibilityDialog(true)}>
                <VisibilityIcon sx={{ color: '#455a64' }} />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </AppBar>

      {loading && <LinearProgress />}

      {!loading && sessions.length === 0 && (
        <Stack sx={{ width: '100%', p: '1rem' }}>
          <Alert severity="info">Bu mahal için henüz metraj hazırlanmamış.</Alert>
        </Stack>
      )}

      {/* SESSION KARTLARI */}
      {(() => {
        const visibleSessions = sessions.filter(sess => visibleSessCards[sess.id] ?? true)
        return visibleSessions.length > 0 ? (
          <Box sx={{ mt: '1.5rem', px: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px' }}>
            {visibleSessions.map(sess => {
              const visualStatus = sess.visualStatus ?? getMeasurementVisualStatus(sess)
              const cardColors   = getCardColors(visualStatus)
              const isApproved   = visualStatus === 'approved' || visualStatus === 'revised'
              const rootLines    = sess.lines.filter(l => !l.parent_line_id)
              const totalDraft   = rootLines.filter(l => !l.status || l.status === 'draft').reduce((sum, l) => sum + computeQuantity(l), 0)
              const totalPending = rootLines.filter(l => l.status === 'pending').reduce((sum, l) => sum + computeQuantity(l), 0)
              const totalIgnored = rootLines.filter(l => l.status === 'ignored').reduce((sum, l) => sum + computeQuantity(l), 0)
              const totalApproved = rootLines.filter(l => l.status === 'approved').reduce((sum, l) => sum + computeQuantity(l), 0)

              return (
                <Box
                  key={sess.id}
                  sx={{
                    border: '2px solid',
                    borderColor: cardColors.border,
                    overflow: 'hidden',
                    boxShadow: 1,
                  }}
                >
                  {/* Kart başlığı */}
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      px: '1rem', height: '50px', flexWrap: 'nowrap', overflow: 'hidden',
                      backgroundColor: cardColors.header,
                      color: '#e0e1dd',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                      {sess.userName}
                    </Typography>
                  </Box>

                  {/* Satır yok */}
                  {rootLines.length === 0 && (
                    <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                      Bu oturumda metraj satırı bulunmuyor.
                    </Box>
                  )}

                  {/* Tablo */}
                  {rootLines.length > 0 && (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, minWidth: 'max-content' }}>

                        {/* Tablo başlığı */}
                        <Box sx={{ ...css_lineHeaderCell }}>Sıra</Box>
                        <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                        {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>)}
                        <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                        <Box sx={{ ...css_lineHeaderCell }}>Durum</Box>

                        {/* Satırlar — sadece kök satırlar */}
                        {buildDisplayTree(rootLines).map(line => {
                          const qty = computeQuantity(line)
                          const isDeduction = qty < 0
                          const isIgnoredLocked = line.status === 'ignored'
                          const rowBg = isIgnoredLocked
                            ? '#BDBDBD'
                            : line.status === 'pending' && !isApproved
                            ? '#BBDEFB'
                            : (!line.status || line.status === 'draft') && !isApproved
                            ? '#FFE0B2'
                            : line.status === 'approved'
                            ? '#C8E6C9'
                            : isApproved
                            ? cardColors.row
                            : 'white'
                          const deductionColor = isDeduction ? '#b71c1c' : undefined
                          const depthStyle = line.depth > 0
                            ? { borderLeft: `${Math.min(line.depth, 3) * 3}px solid rgba(144,202,249,0.7)` }
                            : {}
                          const cellBg = { backgroundColor: rowBg, borderBottom: '1px dashed #c8c8c8', ...depthStyle }

                          return (
                            <React.Fragment key={line.id}>
                              <Box sx={{
                                ...css_lineCell, ...cellBg, justifyContent: 'center',
                                color: line.depth > 0 ? '#1565C0' : '#555',
                              }}>
                                {line.siraNo}
                              </Box>

                              <Box sx={{ ...css_lineCell, ...cellBg, color: deductionColor }}>
                                {line.description ?? ''}
                              </Box>

                              {NUM_FIELDS.map(field => (
                                <Box key={field} sx={{ ...css_lineCell, ...cellBg, justifyContent: 'flex-end', color: deductionColor }}>
                                  {field === 'multiplier' && Number(line[field]) === 1 ? '' : (line[field] != null ? ikiHane(line[field]) : '')}
                                </Box>
                              ))}

                              <Box sx={{ ...css_lineCell, ...cellBg, justifyContent: 'flex-end', color: qty < 0 ? '#c62828' : deductionColor }}>
                                {qty !== 0 ? ikiHane(qty) : (() => {
                                  const isEmpty = v => v === null || v === undefined || v === ''
                                  const hasData = [(Number(line.multiplier) === 1 ? null : line.multiplier), line.count, line.length, line.width, line.height].some(v => !isEmpty(v))
                                  return hasData ? ikiHane(qty) : ''
                                })()}
                                {pozBirim && qty !== 0 && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.75rem', color: '#555' }}>{pozBirim}</Box>}
                              </Box>

                              {/* DURUM sütunu */}
                              <Box sx={{ ...css_lineCell, ...cellBg, justifyContent: 'center', px: '2px' }}>
                                {line.status === 'approved' ? (
                                  <DoneAllIcon sx={{ fontSize: 18, color: '#2e7d32', fontWeight: 700 }} />
                                ) : line.status === 'rejected' ? (
                                  <ClearIcon sx={{ fontSize: 18, color: '#c62828' }} />
                                ) : line.status === 'ignored' ? (
                                  <DoneAllIcon sx={{ fontSize: 18, color: '#424242' }} />
                                ) : line.status === 'pending' ? (
                                  <>
                                    <Tooltip title="Onayla">
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => approveLine(line.id)}>
                                        <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Ignore">
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => ignoreLine(line.id)}>
                                        <BlockIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (!line.status || line.status === 'draft') ? (
                                  <HourglassFullIcon sx={{ fontSize: 15, color: '#E65100' }} />
                                ) : null}
                              </Box>
                            </React.Fragment>
                          )
                        })}

                        {/* Toplam satırları */}
                        <Box sx={{ gridColumn: '1 / -1', backgroundColor: cardColors.header, borderTop: '2px solid', borderTopColor: cardColors.border, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', px: '14px', py: '8px', minHeight: '44px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#FFE0B2', width: 26, height: 26, flexShrink: 0 }}>
                              <HourglassFullIcon sx={{ fontSize: 16, color: '#E65100', filter: 'drop-shadow(0 0 0.4px #E65100)' }} />
                            </Box>
                            <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Hazırlanan</Box>
                            <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalDraft === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalDraft)}</Box>
                            {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BBDEFB', width: 26, height: 26, flexShrink: 0 }}>
                              <CheckIcon sx={{ fontSize: 16, color: '#1565C0', filter: 'drop-shadow(0 0 0.4px #1565C0)' }} />
                            </Box>
                            <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Onaya Sunulan</Box>
                            <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalPending === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalPending)}</Box>
                            {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BDBDBD', width: 26, height: 26, flexShrink: 0 }}>
                              <DoneAllIcon sx={{ fontSize: 16, color: '#424242', filter: 'drop-shadow(0 0 0.4px #424242)' }} />
                            </Box>
                            <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Ignore</Box>
                            <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalIgnored === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalIgnored)}</Box>
                            {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#C8E6C9', width: 26, height: 26, flexShrink: 0 }}>
                              <DoneAllIcon sx={{ fontSize: 16, color: '#2E7D32', filter: 'drop-shadow(0 0 0.4px #2E7D32)' }} />
                            </Box>
                            <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Onaylanan</Box>
                            <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalApproved === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalApproved)}</Box>
                            {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                          </Box>
                        </Box>

                      </Box>
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        ) : null
      })()}

      {/* ONAYLANAN METRAJ KARTI */}
      {!loading && visibleOnayKarti && approvalTree.length > 0 && (() => {
        const ONAY_GRID = 'max-content 1fr 65px 65px 65px 65px 65px 80px 90px 90px 80px'
        const NUM_ONAY_LABELS = ['Çarpan', 'Adet', 'Boy', 'En', 'Yük']
        const NUM_ONAY_FIELDS = ['multiplier', 'count', 'length', 'width', 'height']
        const calcMetrajOnay = (line) => {
          const vals = [
            (Number(line.multiplier) === 1 ? null : line.multiplier),
            line.count, line.length, line.width, line.height,
          ]
            .map(v => (v != null && v !== '' ? parseFloat(v) : null))
            .filter(v => v !== null && !isNaN(v))
          if (vals.length === 0) return 0
          return vals.reduce((p, v) => p * v, 1)
        }
        const css_ohc = { px: '4px', py: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#1b5e20', color: '#fff' }
        const css_oc = { px: '4px', py: '6px', height: '34px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', borderRight: '1px dashed #d8d8d8', overflow: 'hidden' }

        function renderOnayRow(node) {
          const hasKids = (node.children?.length ?? 0) > 0
          const isExp   = expandedApproved[node.id] ?? false
          const metraj  = calcMetrajOnay(node)
          const isRevised = node.status === 'approved' && hasKids && (node.children ?? []).some(c => c.status === 'approved')

          if (isRevised) {
            const origCellBg = { backgroundColor: 'rgba(200,230,201,0.2)', borderBottom: '1px dashed #c8c8c8', opacity: 0.7 }
            return (
              <>
                {showAllOriginals && (
                  <>
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'flex-start', pl: '0.5rem', color: '#888', fontSize: '0.78rem' }}>{node.siraNo}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, color: '#777', fontStyle: 'italic', fontSize: '0.82rem' }}>{node.description ?? ''}</Box>
                    {NUM_ONAY_FIELDS.map(f => (
                      <Box key={f} sx={{ ...css_oc, ...origCellBg, justifyContent: 'flex-end', color: '#888' }}>{f === 'multiplier' && Number(node[f]) === 1 ? '' : (node[f] != null ? ikiHane(node[f]) : '')}</Box>
                    ))}
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'flex-end', fontWeight: 700, color: '#888' }}>
                      {ikiHane(calcMetrajOnay(node))}
                      {pozBirim && calcMetrajOnay(node) !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: '#888' }}>{pozBirim}</Box>}
                    </Box>
                    <Box sx={{ ...css_oc, ...origCellBg, fontSize: '0.78rem', color: '#9E9E9E' }}>{node.hazırlayan}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, fontSize: '0.78rem', color: '#9E9E9E' }}>{node.onaylayan}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'center' }}></Box>
                  </>
                )}
                {node.children.map(child => (
                  <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
                ))}
              </>
            )
          }

          const rowBg = node.status !== 'approved'
            ? (node.status === 'pending' ? '#BBDEFB' : node.status === 'rejected' ? 'rgba(255,235,238,0.5)' : (!node.status || node.status === 'draft') ? 'rgba(255,250,180,0.6)' : node.status === 'ignored' ? '#EEEEEE' : 'rgba(236,239,241,0.5)')
            : '#C8E6C9'
          const onaylayanText = node.status === 'pending' ? '' : node.status === 'rejected' ? '(reddedildi)' : (node.onaylayan ?? '')
          const isIgnored = node.status === 'ignored'
          const dimColor = 'rgba(0,0,0,0.28)'
          const cellBg = { backgroundColor: rowBg, borderBottom: '1px dashed #c8c8c8', ...(isIgnored ? { color: dimColor } : {}) }
          const negColor = isIgnored ? dimColor : (metraj < 0 ? '#c62828' : undefined)

          return (
            <>
              {/* Sıra sütunu */}
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-start', pl: hasKids ? '2px' : '0.5rem', display: 'flex', alignItems: 'center', gap: '2px', color: isIgnored ? dimColor : (node.depth > 0 ? '#1565c0' : '#555') }}>
                {hasKids && (
                  <IconButton size="small" sx={{ p: '1px', flexShrink: 0 }} onClick={() => setExpandedApproved(prev => ({ ...prev, [node.id]: !prev[node.id] }))}>
                    {isExp ? <ExpandLessIcon sx={{ fontSize: 16, color: '#888' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#888' }} />}
                  </IconButton>
                )}
                {node.siraNo}
              </Box>
              <Box sx={{ ...css_oc, ...cellBg, color: negColor }}>
                {node.description ?? ''}
              </Box>
              {NUM_ONAY_FIELDS.map(f => (
                <Box key={f} sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-end', color: negColor }}>
                  {f === 'multiplier' && Number(node[f]) === 1 ? '' : (node[f] != null ? ikiHane(node[f]) : '')}
                </Box>
              ))}
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-end', fontWeight: 700, color: negColor }}>
                {metraj !== 0 ? ikiHane(metraj) : (() => {
                  const isEmpty = v => v === null || v === undefined || v === ''
                  const hasData = !isEmpty(node.description) ||
                    [(Number(node.multiplier) === 1 ? null : node.multiplier), node.count, node.length, node.width, node.height].some(v => !isEmpty(v))
                  return hasData ? ikiHane(metraj) : ''
                })()}
                {pozBirim && metraj !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: isIgnored ? dimColor : (metraj < 0 ? '#c62828' : '#555') }}>{pozBirim}</Box>}
              </Box>
              <Box sx={{ ...css_oc, ...cellBg, fontSize: '0.78rem', color: isIgnored ? dimColor : '#455a64' }}>{node.hazırlayan}</Box>
              <Box sx={{ ...css_oc, ...cellBg, fontSize: '0.78rem', color: isIgnored ? dimColor : (node.status === 'pending' ? '#1565c0' : node.status === 'rejected' ? '#b71c1c' : '#1b5e20') }}>
                {onaylayanText}
              </Box>

              {/* Aksiyon sütunu — pending satırlar için onay butonları */}
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'center', gap: '2px' }}>
                {node.status === 'pending' && (
                  <>
                    <Tooltip title="Onayla">
                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => approveLine(node.id)}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ignore">
                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => ignoreLine(node.id)}>
                        <BlockIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>

              {hasKids && isExp && node.children.map(child => (
                <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
              ))}
            </>
          )
        }

        const allApprovalLines = flattenAll(approvalTree)
        const onayKartiTotal = allApprovalLines
          .filter(n => !(n.children?.length > 0))
          .reduce((s, n) => s + calcMetrajOnay(n), 0)

        // Revize Talebi = pending alt satırlar - üst satırları
        const pendingRevizeLines = allApprovalLines.filter(n => n.status === 'pending' && n.parent_line_id)
        const a_pend = pendingRevizeLines.reduce((s, n) => s + calcMetrajOnay(n), 0)
        const pendingParentIds = new Set(pendingRevizeLines.map(n => String(n.parent_line_id)))
        const b_pend = allApprovalLines.filter(n => pendingParentIds.has(String(n.id))).reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalRevizeTalebi = a_pend - b_pend

        // Ret Edilen = ignore alt satırlar - üst satırları
        const ignoredRevizeLines = allApprovalLines.filter(n => n.status === 'ignored' && n.parent_line_id)
        const a_ign = ignoredRevizeLines.reduce((s, n) => s + calcMetrajOnay(n), 0)
        const ignoredParentIds = new Set(ignoredRevizeLines.map(n => String(n.parent_line_id)))
        const b_ign = allApprovalLines.filter(n => ignoredParentIds.has(String(n.id))).reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalRetEdilen = a_ign - b_ign

        // Kabul Edilen = onaylanan alt satırlar - üst satırları
        const approvedRevizeLines = allApprovalLines.filter(n => n.status === 'approved' && n.parent_line_id)
        const a_kab = approvedRevizeLines.reduce((s, n) => s + calcMetrajOnay(n), 0)
        const approvedRevizeParentIds = new Set(approvedRevizeLines.map(n => String(n.parent_line_id)))
        const b_kab = allApprovalLines.filter(n => approvedRevizeParentIds.has(String(n.id))).reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalKabulEdilen = a_kab - b_kab

        // Onaylanan = onaylanan satırlar, onaylanmış alt satırı olanlar (geçersiz kılınanlar) hariç
        const totalOnaylanan = allApprovalLines
          .filter(n => n.status === 'approved' && !(n.children?.some(c => c.status === 'approved')))
          .reduce((s, n) => s + calcMetrajOnay(n), 0)

        return (
          <Box sx={{ mt: '1.5rem', px: '1rem', maxWidth: '1100px' }}>
            <Box sx={{ border: '2px solid #43A047', overflow: 'hidden', boxShadow: 2 }}>
              {/* Kart başlığı */}
              <Box sx={{ backgroundColor: '#1b5e20', color: '#fff', px: '1rem', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Onaylı Metraj</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.78rem', opacity: 0.85, userSelect: 'none', '&:hover': { opacity: 1 } }}
                    onClick={() => setShowAllOriginals(prev => !prev)}
                  >
                    {showAllOriginals ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    {showAllOriginals ? 'Orjinalleri gizle' : 'Tüm orjinalleri göster'}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: ONAY_GRID, minWidth: 'max-content' }}>
                  {/* Tablo başlığı */}
                  <Box sx={{ ...css_ohc }}>Sıra</Box>
                  <Box sx={{ ...css_ohc, justifyContent: 'flex-start' }}>Açıklama</Box>
                  {NUM_ONAY_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_ohc }}>{lbl}</Box>)}
                  <Box sx={{ ...css_ohc }}>Metraj</Box>
                  <Box sx={{ ...css_ohc }}>Hazırlayan</Box>
                  <Box sx={{ ...css_ohc }}>Onaylayan</Box>
                  <Box sx={{ ...css_ohc }}></Box>

                  {approvalTree.map(rootNode => (
                    <React.Fragment key={rootNode.id}>{renderOnayRow(rootNode)}</React.Fragment>
                  ))}
                </Box>
              </Box>

              {/* Onaylı Metraj Statü Kutuları */}
              <Box sx={{ backgroundColor: '#1b5e20', color: '#fff', px: '1rem', py: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(67, 160, 71, 0.5)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#FFE0B2', width: 26, height: 26, flexShrink: 0 }}>
                    <HourglassFullIcon sx={{ fontSize: 16, color: '#E65100', filter: 'drop-shadow(0 0 0.4px #E65100)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Revize Talebi</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalRevizeTalebi === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalRevizeTalebi)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BBDEFB', width: 26, height: 26, flexShrink: 0 }}>
                    <CheckIcon sx={{ fontSize: 16, color: '#1565C0', filter: 'drop-shadow(0 0 0.4px #1565C0)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Ret Edilen</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalRetEdilen === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalRetEdilen)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BDBDBD', width: 26, height: 26, flexShrink: 0 }}>
                    <DoneAllIcon sx={{ fontSize: 16, color: '#424242', filter: 'drop-shadow(0 0 0.4px #424242)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Kabul Edilen</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalKabulEdilen === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalKabulEdilen)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#C8E6C9', width: 26, height: 26, flexShrink: 0 }}>
                    <DoneAllIcon sx={{ fontSize: 16, color: '#2E7D32', filter: 'drop-shadow(0 0 0.4px #2E7D32)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Onaylanan</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalOnaylanan === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalOnaylanan)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
              </Box>
            </Box>
          </Box>
        )
      })()}

    </Box>
  )
}
