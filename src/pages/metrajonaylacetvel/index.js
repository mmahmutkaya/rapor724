import React, { useState, useContext, useEffect, useMemo, useRef } from 'react'
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
import BlockIcon from '@mui/icons-material/Block'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import HourglassFullIcon from '@mui/icons-material/HourglassFull'
import CheckIcon from '@mui/icons-material/Check'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import UndoIcon from '@mui/icons-material/Undo'


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

function getCardColors(visualStatus, isOwn = true) {
  if (visualStatus === 'approved') return { border: '#A5D6A7', header: isOwn ? '#415a77' : '#555555', row: 'rgba(200,230,201,0.35)' }
  if (visualStatus === 'revised') return { border: isOwn ? '#90CAF9' : '#9e9e9e', header: isOwn ? '#415a77' : '#555555', row: isOwn ? 'rgba(187,222,251,0.35)' : 'rgba(158,158,158,0.18)' }
  if (visualStatus === 'pendingRevision') return { border: '#CE93D8', header: isOwn ? '#415a77' : '#555555', row: 'rgba(206,147,216,0.15)' }
  return { border: isOwn ? '#64B5F6' : '#9e9e9e', header: isOwn ? '#415a77' : '#555555', row: isOwn ? 'rgba(100,181,246,0.15)' : 'rgba(158,158,158,0.12)' }
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
  const [showHazırlayan, setShowHazırlayan]             = useState(true)
  const [showOnaylayan, setShowOnaylayan]               = useState(true)
  const [showRevizeTalepleri, setShowRevizeTalepleri]   = useState(true)
  const [cardEditMode, setCardEditMode]                 = useState({})  // { [sessId]: boolean }
  const [draftLines, setDraftLines]                     = useState({})  // { [lineId]: { status, ... } }
  const [onayKartiEditMode, setOnayKartiEditMode]       = useState(false)
  const [revertHoverId, setRevertHoverId]                = useState(null)
  const [expandedSessCards, setExpandedSessCards]       = useState({})

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

      const sorted = [...sessData].sort((a, b) => {
        const aOwn = a.created_by === currentUid
        const bOwn = b.created_by === currentUid
        if (aOwn && !bOwn) return -1
        if (!aOwn && bOwn) return 1
        return new Date(b.updated_at) - new Date(a.updated_at)
      })

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

      setExpandedSessCards(prev => {
        const next = { ...prev }
        sorted.forEach(sess => {
          if (next[sess.id] === undefined) {
            const hasPending = (linesBySession[sess.id] ?? []).some(l => !l.parent_line_id && l.status === 'pending')
            next[sess.id] = hasPending
          }
        })
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
    const allLines = sessions.flatMap(s => s.lines ?? []).map(l => {
      if (cardEditMode[l.session_id]) return l  // session kart edit modundaki değişiklikler save'e kadar onay kartına yansımasın
      return draftLines[l.id] ? { ...l, ...draftLines[l.id] } : l
    })
    return buildApprovalTree(allLines, sessions, userMap)
  }, [sessions, userMap, draftLines, cardEditMode])

  // Bir üst satırın alt revize taleplerinden bazısına karar verilip bazısına verilmemişse true döner
  const hasPartiallyDecidedGroup = useMemo(() => {
    function check(node) {
      const kids = node.children ?? []
      if (kids.length > 0) {
        const hasUndecidedPending = kids.some(c => c.status === 'pending')
        const hasDecided = kids.some(c => c.status === 'approved' || c.status === 'ignored')
        if (hasUndecidedPending && hasDecided) return true
        if (kids.some(check)) return true
      }
      return false
    }
    return approvalTree.some(check)
  }, [approvalTree])

  const hasSaveableChanges = useMemo(() => {
    const allLines = sessions.flatMap(s => s.lines ?? [])
    return Object.entries(draftLines).some(([id, draft]) =>
      draft.status !== 'pending' || allLines.find(l => l.id === id)?.status !== 'pending'
    )
  }, [draftLines, sessions])

  const autoExpandDone = useRef(false)
  useEffect(() => {
    if (autoExpandDone.current || approvalTree.length === 0) return
    autoExpandDone.current = true
    const expand = {}
    let hasPending = false
    function markExpand(node) {
      const kids = node.children ?? []
      if (kids.length > 0) { expand[node.id] = true; kids.forEach(markExpand) }
      if (node.status === 'pending') hasPending = true
    }
    approvalTree.forEach(markExpand)
    if (Object.keys(expand).length > 0) setExpandedApproved(expand)
    if (hasPending) setShowAllOriginals(true)
  }, [approvalTree])

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  // ── Aksiyonlar ────────────────────────────────────────────────────────────────

  const approveLine = async (lineId, sessId) => {
    const now = new Date().toISOString()
    if (sessId && cardEditMode[sessId]) {
      setDraftLines(prev => ({ ...prev, [lineId]: { status: 'approved', approved_by: currentUserId, approved_at: now } }))
      return
    }
    if (!sessId && onayKartiEditMode) {
      setDraftLines(prev => ({ ...prev, [lineId]: { status: 'approved', approved_by: currentUserId, approved_at: now } }))
      return
    }
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

  const ignoreLine = async (lineId, sessId) => {
    if (sessId && cardEditMode[sessId]) {
      setDraftLines(prev => ({ ...prev, [lineId]: { status: 'ignored' } }))
      return
    }
    if (!sessId && onayKartiEditMode) {
      setDraftLines(prev => ({ ...prev, [lineId]: { status: 'ignored' } }))
      return
    }
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

  const revertLine = (lineId) => {
    setDraftLines(prev => ({ ...prev, [lineId]: { status: 'pending' } }))
  }

  // ── Düzenleme modu ────────────────────────────────────────────────────────────

  const saveCardEdits = async (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const lineIds = new Set(sess.lines.map(l => l.id))
    const changes = Object.entries(draftLines).filter(([id]) => lineIds.has(id))
    for (const [lineId, draft] of changes) {
      const { error } = await supabase.from('measurement_lines').update(draft).eq('id', lineId)
      if (error) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kayıt sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
        return
      }
    }
    setSessions(prev => prev.map(s => s.id !== sessId ? s : {
      ...s,
      lines: s.lines.map(l => draftLines[l.id] ? { ...l, ...draftLines[l.id] } : l),
    }))
    setDraftLines(prev => { const next = { ...prev }; lineIds.forEach(id => delete next[id]); return next })
    setCardEditMode(prev => ({ ...prev, [sessId]: false }))
  }

  const cancelCardEdits = (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const lineIds = new Set(sess.lines.map(l => l.id))
    setDraftLines(prev => { const next = { ...prev }; lineIds.forEach(id => delete next[id]); return next })
    setCardEditMode(prev => ({ ...prev, [sessId]: false }))
  }

  const saveOnayKartiEdits = async () => {
    const allLines = sessions.flatMap(s => s.lines ?? [])
    const changes = Object.entries(draftLines).filter(([id, draft]) =>
      draft.status !== 'pending' || allLines.find(l => l.id === id)?.status !== 'pending'
    )
    if (changes.length === 0) { setOnayKartiEditMode(false); setExpandedApproved({}); setShowAllOriginals(false); return }
    for (const [lineId, draft] of changes) {
      const { error } = await supabase.from('measurement_lines').update(draft).eq('id', lineId)
      if (error) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kayıt sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
        return
      }
    }
    setSessions(prev => prev.map(s => ({
      ...s,
      lines: s.lines.map(l => draftLines[l.id] ? { ...l, ...draftLines[l.id] } : l),
    })))
    setDraftLines({})
    setOnayKartiEditMode(false)
    setExpandedApproved({})
    setShowAllOriginals(false)
    setRevertHoverId(null)
  }

  const cancelOnayKartiEdits = () => {
    setDraftLines({})
    setOnayKartiEditMode(false)
    setExpandedApproved({})
    setShowAllOriginals(false)
    setRevertHoverId(null)
  }

  const approveAllPending = (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const now = new Date().toISOString()
    const updates = {}
    sess.lines.forEach(l => {
      const eff = draftLines[l.id]?.status ?? l.status
      if (eff === 'pending') updates[l.id] = { status: 'approved', approved_by: currentUserId, approved_at: now }
    })
    setDraftLines(prev => ({ ...prev, ...updates }))
  }

  const ignoreAllPending = (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const updates = {}
    sess.lines.forEach(l => {
      const eff = draftLines[l.id]?.status ?? l.status
      if (eff === 'pending') updates[l.id] = { status: 'ignored' }
    })
    setDraftLines(prev => ({ ...prev, ...updates }))
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
            <IconButton onClick={() => setOpenVisibilityDialog(true)}>
              <VisibilityIcon sx={{ color: '#455a64' }} />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>

      {loading && <LinearProgress />}

      {!loading && sessions.length === 0 && (
        <Stack sx={{ width: '100%', p: '1rem' }}>
          <Alert severity="info">Bu mahal için henüz metraj hazırlanmamış.</Alert>
        </Stack>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* SESSION KARTLARI */}
      {(() => {
        const visibleSessions = sessions.filter(sess => visibleSessCards[sess.id] ?? true)
        return visibleSessions.length > 0 ? (
          <Box sx={{ mt: '1.5rem', px: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', order: 1 }}>
            {visibleSessions.map(sess => {
              const visualStatus = sess.visualStatus ?? getMeasurementVisualStatus(sess)
              const cardColors   = getCardColors(visualStatus, sess.created_by === currentUserId)
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
                      px: '1rem', minHeight: '44px', flexWrap: 'nowrap', overflow: 'hidden',
                      backgroundColor: cardColors.header,
                      color: '#e0e1dd',
                    }}
                  >
                    {cardEditMode[sess.id] ? (
                      <>
                        <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                          {sess.userName}
                        </Typography>
                        <IconButton size="small" sx={{ color: '#ef9a9a' }} onClick={() => cancelCardEdits(sess.id)}>
                          <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#a5d6a7' }} onClick={() => approveAllPending(sess.id)}>
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#b0bec5' }} onClick={() => ignoreAllPending(sess.id)}>
                          <DoNotDisturbIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#a5d6a7' }} onClick={() => saveCardEdits(sess.id)}>
                          <SaveIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton size="small"
                          sx={{ color: 'rgba(224,225,221,0.7)', flexShrink: 0, mr: '-4px' }}
                          onClick={() => setExpandedSessCards(prev => ({ ...prev, [sess.id]: !prev[sess.id] }))}>
                          {expandedSessCards[sess.id] ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                        <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1, cursor: 'pointer' }}
                          onClick={() => setExpandedSessCards(prev => ({ ...prev, [sess.id]: !prev[sess.id] }))}>
                          {sess.userName}
                        </Typography>
                        <IconButton size="small" sx={{ color: 'rgba(224,225,221,0.6)', '&:hover': { color: '#e0e1dd' } }}
                          onClick={() => { setExpandedSessCards(prev => ({ ...prev, [sess.id]: true })); setCardEditMode(prev => ({ ...prev, [sess.id]: true })) }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {(expandedSessCards[sess.id] || cardEditMode[sess.id]) && <>
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
                        <Box sx={{ ...css_lineHeaderCell, backgroundColor: cardColors.header }}>Sıra</Box>
                        <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start', backgroundColor: cardColors.header }}>Açıklama</Box>
                        {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_lineHeaderCell, backgroundColor: cardColors.header }}>{lbl}</Box>)}
                        <Box sx={{ ...css_lineHeaderCell, backgroundColor: cardColors.header }}>Metraj</Box>
                        <Box sx={{ ...css_lineHeaderCell, backgroundColor: cardColors.header }}>Durum</Box>

                        {/* Satırlar — sadece kök satırlar */}
                        {buildDisplayTree(rootLines).map(line => {
                          const qty = computeQuantity(line)
                          const isDeduction = qty < 0
                          const effStatus = draftLines[line.id]?.status ?? line.status
                          const isIgnoredLocked = effStatus === 'ignored'
                          const rowBg = isIgnoredLocked
                            ? '#BDBDBD'
                            : effStatus === 'pending' && !isApproved
                            ? '#BBDEFB'
                            : (!effStatus || effStatus === 'draft') && !isApproved
                            ? '#FFE0B2'
                            : effStatus === 'approved'
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
                              <Box sx={{ ...css_lineCell, ...cellBg, justifyContent: 'center', px: '2px', gap: '6px' }}>
                                {effStatus === 'approved' ? (
                                  <>
                                    <DoneAllIcon sx={{ fontSize: 18, color: '#2e7d32', fontWeight: 700 }} />
                                    {cardEditMode[sess.id] && (
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => revertLine(line.id)}>
                                        <UndoIcon sx={{ fontSize: 16, color: '#e53935' }} />
                                      </IconButton>
                                    )}
                                  </>
                                ) : effStatus === 'ignored' ? (
                                  <>
                                    <DoNotDisturbIcon sx={{ fontSize: 18, color: '#424242' }} />
                                    {cardEditMode[sess.id] && (
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => revertLine(line.id)}>
                                        <UndoIcon sx={{ fontSize: 16, color: '#e53935' }} />
                                      </IconButton>
                                    )}
                                  </>
                                ) : effStatus === 'pending' ? (
                                  cardEditMode[sess.id] ? (
                                    <>
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => approveLine(line.id, sess.id)}>
                                        <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                                      </IconButton>
                                      <IconButton size="small" sx={{ p: '2px' }} onClick={() => ignoreLine(line.id, sess.id)}>
                                        <BlockIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                                      </IconButton>
                                    </>
                                  ) : (
                                    <CheckIcon sx={{ fontSize: 16, color: '#1565c0' }} />
                                  )
                                ) : (!effStatus || effStatus === 'draft') ? (
                                  <HourglassFullIcon sx={{ fontSize: 15, color: '#E65100' }} />
                                ) : null}
                              </Box>
                            </React.Fragment>
                          )
                        })}

                      </Box>
                    </Box>
                  )}
                  </>}
                  <Box sx={{ backgroundColor: cardColors.header, borderTop: '2px solid', borderTopColor: cardColors.border, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', px: '14px', py: '8px', minHeight: '44px' }}>
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
                          <DoNotDisturbIcon sx={{ fontSize: 16, color: '#424242', filter: 'drop-shadow(0 0 0.4px #424242)' }} />
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
              )
            })}
          </Box>
        ) : null
      })()}

      {/* ONAYLANAN METRAJ KARTI */}
      {!loading && visibleOnayKarti && (() => {
        const ONAY_GRID = 'max-content 1fr 65px 65px 65px 65px 65px 80px'
          + (showHazırlayan ? ' max-content' : '')
          + (showOnaylayan  ? ' max-content' : '')
          + ' 80px'
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
          const allChildrenDecided = hasKids && (node.children ?? []).filter(c => c.status && c.status !== 'draft').every(c => c.status === 'approved' || c.status === 'ignored')

          if (isRevised) {
            const origCellBg = { backgroundColor: '#D5D5D5', borderBottom: '1px dashed #c8c8c8' }
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
                      {(() => {
                        const q = calcMetrajOnay(node)
                        const isEmpty = v => v === null || v === undefined || v === ''
                        const hasData = !isEmpty(node.description) || [(Number(node.multiplier) === 1 ? null : node.multiplier), node.count, node.length, node.width, node.height].some(v => !isEmpty(v))
                        return (q !== 0 || hasData) ? ikiHane(q) : ''
                      })()}
                      {pozBirim && calcMetrajOnay(node) !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: '#888' }}>{pozBirim}</Box>}
                    </Box>
                    {showHazırlayan && <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'center', fontSize: '0.78rem', color: '#666' }}>{node.hazırlayan}</Box>}
                    {showOnaylayan  && <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'center', fontSize: '0.78rem', color: '#666' }}>{node.onaylayan}</Box>}
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'center' }}
                      onMouseEnter={() => allChildrenDecided && setRevertHoverId(node.id)}
                      onMouseLeave={() => setRevertHoverId(null)}>
                      {revertHoverId === node.id
                        ? <IconButton size="small" sx={{ p: '2px' }} title="Tüm alt satırları onaya sun"
                            onClick={() => {
                              if (!onayKartiEditMode) {
                                const expand = {}
                                const markExpand = (n) => {
                                  const kids = n.children ?? []
                                  if (kids.length > 0) { expand[n.id] = true; kids.forEach(markExpand) }
                                }
                                approvalTree.forEach(markExpand)
                                setExpandedApproved(prev => ({ ...prev, ...expand }))
                                setShowAllOriginals(true)
                                setOnayKartiEditMode(true)
                              }
                              ;(node.children ?? []).forEach(c => revertLine(c.id))
                              setRevertHoverId(null)
                            }}>
                            <ReplyIcon sx={{ fontSize: 18, color: '#E65100' }} />
                          </IconButton>
                        : <DoneAllIcon sx={{ fontSize: 18, color: '#9e9e9e', filter: 'drop-shadow(0 0 0.6px #9e9e9e)' }} />
                      }
                    </Box>
                  </>
                )}
                {node.children.filter(c => (!c.status || c.status === 'draft') ? false : (!showRevizeTalepleri && c.status === 'pending') ? false : (showAllOriginals || c.status !== 'ignored')).map(child => (
                  <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
                ))}
              </>
            )
          }

          const isSuperseded = node.status === 'approved' && node.children?.some(c => c.status === 'approved')
          const rowBg = node.status !== 'approved'
            ? (node.status === 'pending' ? '#BBDEFB' : (!node.status || node.status === 'draft') ? 'rgba(255,250,180,0.6)' : node.status === 'ignored' ? '#D5D5D5' : 'rgba(236,239,241,0.5)')
            : (isSuperseded ? '#c5e1a5' : '#C8E6C9')
          const onaylayanText = node.status === 'pending' ? '' : (node.onaylayan ?? '')
          const isIgnored = node.status === 'ignored'
          const dimColor = 'rgba(0,0,0,0.28)'
          const isDim = isIgnored || isSuperseded
          const cellBg = { backgroundColor: rowBg, borderBottom: '1px dashed #c8c8c8', ...(isDim ? { color: dimColor } : {}) }
          const negColor = isDim ? dimColor : (metraj < 0 ? '#c62828' : undefined)

          return (
            <>
              {/* Sıra sütunu */}
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-start', pl: '0.5rem', display: 'flex', alignItems: 'center', gap: '2px', color: isDim ? dimColor : (node.depth > 0 ? '#1565c0' : '#555') }}>
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
                {pozBirim && metraj !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: isDim ? dimColor : (metraj < 0 ? '#c62828' : '#555') }}>{pozBirim}</Box>}
              </Box>
              {showHazırlayan && <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'center', fontSize: '0.78rem', color: isDim ? '#666' : '#455a64' }}>{node.hazırlayan}</Box>}
              {showOnaylayan  && <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'center', fontSize: '0.78rem', color: isDim ? '#666' : (node.status === 'pending' ? '#1565c0' : '#1b5e20') }}>
                {onaylayanText}
              </Box>}

              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'center', gap: '2px' }}>
                {onayKartiEditMode && node.status === 'pending' && (
                  <>
                    <IconButton size="small" sx={{ p: '2px' }} onClick={() => approveLine(node.id)}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                    </IconButton>
                    <IconButton size="small" sx={{ p: '2px' }} onClick={() => ignoreLine(node.id)}>
                      <BlockIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                    </IconButton>
                  </>
                )}
                {(node.status === 'approved' || node.status === 'ignored') && !!node.depth && (
                  <Box onMouseEnter={() => setRevertHoverId(node.id)} onMouseLeave={() => setRevertHoverId(null)}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {revertHoverId === node.id
                      ? <IconButton size="small" sx={{ p: '2px' }} title="Onaya sun"
                          onClick={() => {
                            if (!onayKartiEditMode) {
                              const expand = {}
                              const markExpand = (n) => {
                                const kids = n.children ?? []
                                if (kids.length > 0) { expand[n.id] = true; kids.forEach(markExpand) }
                              }
                              approvalTree.forEach(markExpand)
                              setExpandedApproved(prev => ({ ...prev, ...expand }))
                              setShowAllOriginals(true)
                              setOnayKartiEditMode(true)
                            }
                            revertLine(node.id)
                            setRevertHoverId(null)
                          }}>
                          <ReplyIcon sx={{ fontSize: 16, color: '#E65100' }} />
                        </IconButton>
                      : node.status === 'ignored'
                        ? <DoNotDisturbIcon sx={{ fontSize: 16, color: '#424242' }} />
                        : <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#2E7D32', lineHeight: 1 }}>R</Typography>
                    }
                  </Box>
                )}
                {(!onayKartiEditMode || !draftLines[node.id]) && node.status === 'approved' && !node.depth && <DoneAllIcon sx={{ fontSize: 18, color: '#2E7D32', filter: 'drop-shadow(0 0 0.6px #2E7D32)' }} />}
              </Box>

              {hasKids && node.children.filter(c => (!c.status || c.status === 'draft') ? false : (!showRevizeTalepleri && c.status === 'pending') ? false : (showAllOriginals || c.status !== 'ignored')).map(child => (
                <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
              ))}
            </>
          )
        }

        const allApprovalLines = flattenAll(approvalTree)
        const hasPendingInOnayKart = allApprovalLines.some(n => n.status === 'pending')
        const hasRevokableInOnayKart = allApprovalLines.some(n => (n.status === 'approved' || n.status === 'ignored') && n.depth > 0)
        const canEditOnayKarti = hasPendingInOnayKart || hasRevokableInOnayKart
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
          <Box sx={{ mt: '1.5rem', px: '1rem', maxWidth: '1100px', order: 0 }}>
            <Box sx={{ border: '2px solid #43A047', overflow: 'hidden', boxShadow: 2 }}>
              {/* Kart başlığı */}
              <Box sx={{ backgroundColor: '#1b5e20', color: '#fff', px: '1rem', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                  onClick={() => setShowAllOriginals(prev => !prev)}>
                  <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)', p: '2px' }}>
                    {showAllOriginals ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Onaylı Metraj</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Box component="span" onClick={() => setShowRevizeTalepleri(prev => !prev)}
                  sx={{ cursor: 'pointer', px: '6px', py: '2px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid', userSelect: 'none',
                    ...(showRevizeTalepleri ? { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' } : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.4)' }) }}>
                  Revize Talepleri
                </Box>
                <Box component="span" onClick={() => setShowHazırlayan(prev => !prev)}
                  sx={{ cursor: 'pointer', px: '6px', py: '2px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid', userSelect: 'none',
                    ...(showHazırlayan ? { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' } : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.4)' }) }}>
                  Hazırlayan
                </Box>
                <Box component="span" onClick={() => setShowOnaylayan(prev => !prev)}
                  sx={{ cursor: 'pointer', px: '6px', py: '2px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid', userSelect: 'none',
                    ...(showOnaylayan ? { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' } : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.4)' }) }}>
                  Onaylayan
                </Box>
                <IconButton size="small" sx={{ color: 'rgba(224,225,221,0.75)', '&:hover': { color: '#fff' } }} onClick={() => setShowAllOriginals(prev => !prev)}>
                  {showAllOriginals ? <ExpandLessIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 0 0.6px currentColor)' }} /> : <ExpandMoreIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 0 0.6px currentColor)' }} />}
                </IconButton>
                <IconButton size="small" onClick={cancelOnayKartiEdits}
                  sx={{ color: '#ef9a9a', visibility: onayKartiEditMode ? 'visible' : 'hidden', pointerEvents: onayKartiEditMode ? 'auto' : 'none' }}>
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Box sx={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0 }}>
                  <IconButton size="small"
                    disabled={!hasSaveableChanges || hasPartiallyDecidedGroup}
                    onClick={saveOnayKartiEdits}
                    sx={{ position: 'absolute', inset: 0, color: '#a5d6a7', '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' }, visibility: onayKartiEditMode ? 'visible' : 'hidden', pointerEvents: onayKartiEditMode ? 'auto' : 'none' }}
                  >
                    <SaveIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton size="small"
                    disabled={!canEditOnayKarti}
                    onClick={() => {
                      const expand = {}
                      function markExpand(node) {
                        const kids = node.children ?? []
                        if (kids.length > 0) { expand[node.id] = true; kids.forEach(markExpand) }
                      }
                      approvalTree.forEach(markExpand)
                      setExpandedApproved(prev => ({ ...prev, ...expand }))
                      setShowAllOriginals(true)
                      setOnayKartiEditMode(true)
                    }}
                    sx={{ position: 'absolute', inset: 0, color: 'rgba(224,225,221,0.75)', '&:hover': { color: '#e0e1dd' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.28)' }, visibility: !onayKartiEditMode ? 'visible' : 'hidden', pointerEvents: !onayKartiEditMode ? 'auto' : 'none' }}
                  >
                    <EditIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
                </Box>
              </Box>


              {approvalTree.length > 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: ONAY_GRID, minWidth: 'max-content' }}>
                  {/* Tablo başlığı */}
                  <Box sx={{ ...css_ohc }}>Sıra</Box>
                  <Box sx={{ ...css_ohc, justifyContent: 'flex-start' }}>Açıklama</Box>
                  {NUM_ONAY_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_ohc }}>{lbl}</Box>)}
                  <Box sx={{ ...css_ohc }}>Metraj</Box>
                  {showHazırlayan && <Box sx={{ ...css_ohc }}>Hazırlayan</Box>}
                  {showOnaylayan  && <Box sx={{ ...css_ohc }}>Onaylayan</Box>}
                  <Box sx={{ ...css_ohc }}></Box>

                  {approvalTree.filter(n => showAllOriginals || n.status !== 'ignored').map((rootNode, idx) => (
                    <React.Fragment key={rootNode.id}>
                      {idx > 0 && <Box sx={{ gridColumn: '1 / -1', borderTop: '2px solid #9e9e9e' }} />}
                      {renderOnayRow(rootNode)}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
              )}

              {/* Onaylı Metraj Statü Kutuları */}
              <Box sx={{ backgroundColor: '#1b5e20', color: '#fff', px: '1rem', py: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(67, 160, 71, 0.5)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BBDEFB', width: 26, height: 26, flexShrink: 0 }}>
                    <CheckIcon sx={{ fontSize: 16, color: '#1565C0', filter: 'drop-shadow(0 0 0.4px #1565C0)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Revize Talebi</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalRevizeTalebi === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalRevizeTalebi)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BDBDBD', width: 26, height: 26, flexShrink: 0 }}>
                    <DoNotDisturbIcon sx={{ fontSize: 16, color: '#424242', filter: 'drop-shadow(0 0 0.4px #424242)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Ret Edilen</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalRetEdilen === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalRetEdilen)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#C8E6C9', width: 26, height: 26, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#2E7D32', lineHeight: 1, filter: 'drop-shadow(0 0 0.4px #2E7D32)' }}>R</Typography>
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
    </Box>
  )
}
