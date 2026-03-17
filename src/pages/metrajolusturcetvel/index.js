import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

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
import Chip from '@mui/material/Chip'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import HourglassFullIcon from '@mui/icons-material/HourglassFull'
import CheckIcon from '@mui/icons-material/Check'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'


function computeQuantity(line) {
  if (!line || line.line_type !== 'data') return 0
  const isEmpty = (val) => val === null || val === undefined || val === ''
  // multiplier=1 is the neutral default (shown as blank in UI), treat as not-set for allEmpty check
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
const GRID_COLS = 'max-content 1fr 70px 70px 70px 70px 70px 90px 52px'
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
const inputSx = {
  width: '100%', border: 'none', outline: 'none',
  backgroundColor: 'rgba(255,250,180,0.6)',
  fontSize: '0.85rem', padding: '2px 4px',
  textAlign: 'right',
  MozAppearance: 'textfield',
}

function getCardColors(visualStatus) {
  if (visualStatus === 'approved') return { border: '#A5D6A7', header: '#415a77', row: 'rgba(200,230,201,0.35)', totalText: '#e0e1dd' }
  if (visualStatus === 'revised') return { border: '#90CAF9', header: '#415a77', row: 'rgba(187,222,251,0.35)', totalText: '#e0e1dd' }
  if (visualStatus === 'rejected') return { border: '#EF9A9A', header: '#415a77', row: 'rgba(255,205,210,0.28)', totalText: '#e0e1dd' }
  if (visualStatus === 'pendingRevision') return { border: '#CE93D8', header: '#415a77', row: 'rgba(206,147,216,0.15)', totalText: '#e0e1dd' }
  return { border: '#64B5F6', header: '#415a77', row: 'rgba(100,181,246,0.15)', totalText: '#e0e1dd' }
}


export default function P_MetrajOlusturCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal, appUser } = useContext(StoreContext)
  const { data: units = [] } = useGetPozUnits()

  const [dialogAlert, setDialogAlert] = useState()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [userMap, setUserMap] = useState({})
  const [expandedApproved, setExpandedApproved] = useState({})   // { lineId: bool }
  const [revizeForms, setRevizeForms] = useState({}) // { [lineId]: [{ tempId, description, multiplier, count, length, width, height }] }
  const [showAllOriginals, setShowAllOriginals] = useState(false)
  const [openVisibilityDialog, setOpenVisibilityDialog] = useState(false)
  const [visibleOnayKarti, setVisibleOnayKarti] = useState(true)
  const [visibleSessCards, setVisibleSessCards] = useState({})  // { sessId: boolean }

  const wpAreaId = selectedMahal?.wpAreaId

  const anyChanged = sessions.some(s => s.isChanged)

  const navGuard = (path) => {
    if (anyChanged) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Kaydedilmemiş değişiklikler var. Devam etmeden önce kaydedin veya değişiklikleri iptal edin.',
        onCloseAction: () => setDialogAlert(),
      })
    } else {
      navigate(path)
    }
  }

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) { navigate('/metrajolustur'); return }
    if (!selectedPoz) { navigate('/metrajolusturpozlar'); return }
    if (!wpAreaId) { navigate('/metrajolusturpozmahaller'); return }
  }, [])

  const loadSessions = async () => {
    if (!wpAreaId) return
    setLoading(true)
    try {
      const { data: sessData, error: sessError } = await supabase
        .from('measurement_sessions')
        .select('*')
        .eq('work_package_poz_area_id', wpAreaId)
        .order('updated_at', { ascending: false })
      if (sessError) throw sessError

      if (!sessData?.length) { setSessions([]); setLoading(false); return }

      // Tüm satırları çek
      const sessionIds = sessData.map(s => s.id)
      const { data: linesData } = await supabase
        .from('measurement_lines')
        .select('*')
        .in('session_id', sessionIds)
        .order('order_index')

      // Kullanıcı görünen adlarını çek (hazırlayanlar + onaylayanlar)
      const uniqueUserIds = [...new Set([
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

      // Onaylı → Onay Bekleyen → Taslak sırasıyla sırala
      const sorted = [...sessData].sort((a, b) =>
        (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
      )

      setSessions(sorted.map(sess => {
        const revisedLines = Array.isArray(sess.revision_snapshot) && sess.revision_snapshot.length > 0
          ? Object.fromEntries(sess.revision_snapshot.filter(e => !e.__revision_meta__ && e.id).map(e => [e.id, e]))
          : {}
        return {
          ...sess,
          visualStatus: getMeasurementVisualStatus(sess),
          userName: nameMap[sess.created_by] ?? '?',
          isOwn: sess.created_by === appUser?.id,
          lines: linesBySession[sess.id] ?? [],
          linesBackup: _.cloneDeep(linesBySession[sess.id] ?? []),
          mode_edit: false,
          isRevisionEdit: false,
          isChanged: false,
          revisedLines,
        }
      }))
      setVisibleSessCards(prev => {
        const next = { ...prev }
        sorted.forEach(sess => { if (next[sess.id] === undefined) next[sess.id] = true })
        return next
      })
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSessions() }, [wpAreaId])

  // ── Yardımcı: belirli session'ı günceller ───────────────────
  const updateSess = (sessId, updater) =>
    setSessions(prev => prev.map(s => s.id === sessId ? { ...s, ...updater(s) } : s))

  // ── Satır işlemleri ─────────────────────────────────────────
  // Bu ekranda hiyerarsik (alt seviye) satir olusturma kapali.
  const handleAddLine = (sessId, parentId = null) => {
    if (parentId) {
      setDialogAlert({
        dialogIcon: 'info',
        dialogMessage: 'Yeni metraj olustururken alt seviye satir eklenemez.',
        onCloseAction: () => setDialogAlert(),
      })
      return
    }
    setSessions(prev => prev.map(s => {
      if (s.id !== sessId) return s
      const siblings = s.lines.filter(l => !l.parent_line_id)
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(l => l.order_index ?? 0)) : 0
      const tempId = `new-${Date.now()}-${Math.random()}`
      return {
        ...s,
        mode_edit: true,
        isChanged: true,
        lines: [...s.lines, {
          id: tempId,
          session_id: sessId,
          order_index: maxOrder + 1,
          description: '',
          multiplier: null,
          count: null,
          length: null,
          width: null,
          height: null,
          parent_line_id: null,
          line_type: 'data',
          isNew: true,
        }],
      }
    }))
  }

  const handleDeleteLine = (sessId, lineId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const toDelete = new Set()
    const collect = (id) => {
      toDelete.add(id)
      sess.lines.filter(l => l.parent_line_id === id).forEach(child => collect(child.id))
    }
    collect(lineId)
    updateSess(sessId, s => ({
      lines: s.lines.filter(l => !toDelete.has(l.id)),
      isChanged: true,
      // linesBackup değiştirilmiyor — iptal edilince geri gelir
    }))
  }

  const handleLineChange = (sessId, lineId, field, value) => {
    updateSess(sessId, s => {
      const newRevised = { ...s.revisedLines }
      if (s.isRevisionEdit && !newRevised[lineId] && !s.lines.find(l => l.id === lineId)?.isNew) {
        const origLine = s.linesBackup?.find(l => l.id === lineId)
        if (origLine) newRevised[lineId] = { ...origLine, originalMetraj: computeQuantity(origLine) }
      }
      return {
        isChanged: true,
        revisedLines: newRevised,
        lines: s.lines.map(l => l.id === lineId ? { ...l, [field]: value } : l),
      }
    })
  }

  // ── Kaydet ──────────────────────────────────────────────────
  const handleSave = async (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    try {
      // Silinen (backup'ta olan ama lines'ta olmayan) kayıtlı satırları sil
      const backupIds = new Set(sess.linesBackup.map(l => l.id))
      const currentIds = new Set(sess.lines.filter(l => !l.isNew).map(l => l.id))
      const deletedIds = [...backupIds].filter(id => !currentIds.has(id))
      if (deletedIds.length > 0) {
        const { error } = await supabase.from('measurement_lines').delete().in('id', deletedIds)
        if (error) throw error
      }

      // Insert new (local-only) lines
      const insertedMap = {}
      const newLines = sess.lines.filter(l => l.isNew)
      const toInsert = [...newLines]
      while (toInsert.length > 0) {
        const candidate = toInsert.find(l =>
          !l.parent_line_id ||
          !newLines.find(p => p.id === l.parent_line_id) ||
          insertedMap[l.parent_line_id]
        )
        if (!candidate) break
        const realParentId = candidate.parent_line_id
          ? (insertedMap[candidate.parent_line_id]?.id ?? candidate.parent_line_id)
          : null
        const { data: inserted, error } = await supabase
          .from('measurement_lines')
          .insert({
            session_id: sessId,
            order_index: candidate.order_index,
            description: candidate.description || null,
            multiplier: (candidate.multiplier === '' || candidate.multiplier === null) ? 1 : Number(candidate.multiplier),
            count:  candidate.count  === '' ? null : candidate.count,
            length: candidate.length === '' ? null : candidate.length,
            width:  candidate.width  === '' ? null : candidate.width,
            height: candidate.height === '' ? null : candidate.height,
            parent_line_id: realParentId,
            line_type: 'data',
            status: candidate.status ?? 'draft',
          })
          .select().single()
        if (error) throw error
        insertedMap[candidate.id] = inserted
        toInsert.splice(toInsert.indexOf(candidate), 1)
      }

      // Update existing changed lines
      for (const line of sess.lines.filter(l => !l.isNew)) {
        const backup = sess.linesBackup.find(b => b.id === line.id)
        if (backup && JSON.stringify(line) === JSON.stringify(backup)) continue
        const { error } = await supabase
          .from('measurement_lines')
          .update({
            description: line.description,
            multiplier: (line.multiplier === '' || line.multiplier === null) ? 1 : Number(line.multiplier),
            count:  line.count  === '' ? null : line.count,
            length: line.length === '' ? null : line.length,
            width:  line.width  === '' ? null : line.width,
            height: line.height === '' ? null : line.height,
            status: line.status ?? 'draft',
          })
          .eq('id', line.id)
        if (error) throw error
      }

      const updatedLines = sess.lines.map(l => insertedMap[l.id] ? { ...insertedMap[l.id] } : l)
      const parentIds = new Set(updatedLines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
      const total = updatedLines.filter(l => !parentIds.has(l.id)).reduce((sum, l) => sum + computeQuantity(l), 0)
      const anyPending = updatedLines.some(l => l.status === 'pending')
      await supabase
        .from('measurement_sessions')
        .update({ total_quantity: total, status: anyPending ? 'ready' : 'draft', updated_at: new Date().toISOString() })
        .eq('id', sessId)
      updateSess(sessId, s => ({
        total_quantity: total,
        status: anyPending ? 'ready' : 'draft',
        lines: updatedLines,
        linesBackup: _.cloneDeep(updatedLines),
        isChanged: false,
        mode_edit: false,
      }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleCancelEdit = (sessId) => {
    updateSess(sessId, s => ({
      lines: _.cloneDeep(s.linesBackup),
      isChanged: false,
      mode_edit: false,
    }))
  }

  // ── Durum değişiklikleri ─────────────────────────────────────
  const handleMarkReady = (sessId) => {
    setDialogAlert({
      dialogIcon: 'info',
      dialogMessage: 'Metraj onay için gönderilsin mi?',
      actionText1: 'Evet, Gönder',
      action1: async () => {
        setDialogAlert()
        const sess = sessions.find(s => s.id === sessId)
        if (!sess) return
        const parentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
        const total = sess.lines.filter(l => !parentIds.has(l.id)).reduce((sum, l) => sum + computeQuantity(l), 0)
        const { error } = await supabase
          .from('measurement_sessions')
          .update({ status: 'ready', total_quantity: total, updated_at: new Date().toISOString() })
          .eq('id', sessId)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: error.message, onCloseAction: () => setDialogAlert() })
          return
        }
        updateSess(sessId, () => ({ status: 'ready', total_quantity: total }))
      },
      onCloseAction: () => setDialogAlert(),
    })
  }

  const handleBackToDraft = async (sessId) => {
    const { error } = await supabase
      .from('measurement_sessions')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', sessId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    updateSess(sessId, () => ({ status: 'draft' }))
  }

  const handleBackToDraftAndAddLine = async (sessId) => {
    const { error } = await supabase
      .from('measurement_sessions')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', sessId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSessions(prev => prev.map(s => {
      if (s.id !== sessId) return s
      const siblings = s.lines.filter(l => !l.parent_line_id)
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(l => l.order_index ?? 0)) : 0
      const tempId = `new-${Date.now()}-${Math.random()}`
      return {
        ...s,
        status: 'draft',
        mode_edit: true,
        isChanged: true,
        lines: [...s.lines, {
          id: tempId,
          session_id: sessId,
          order_index: maxOrder + 1,
          description: '',
          multiplier: null,
          count: null,
          length: null,
          width: null,
          height: null,
          parent_line_id: null,
          line_type: 'data',
          isNew: true,
        }],
      }
    }))
  }

  // ── Onay bekleyen oturumu düzenleme moduna al ────────────────
  // Oturumu draft'a, bekleyen satırları draft'a geri çeker ve edit moduna girer
  const handleStartEditReadySession = async (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const pendingLineIds = (sess.lines ?? []).filter(l => l.status === 'pending').map(l => l.id)
    try {
      const { error: sessErr } = await supabase
        .from('measurement_sessions')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', sessId)
      if (sessErr) throw sessErr
      if (pendingLineIds.length > 0) {
        const { error: lineErr } = await supabase
          .from('measurement_lines')
          .update({ status: 'draft' })
          .in('id', pendingLineIds)
        if (lineErr) throw lineErr
      }
      updateSess(sessId, s => {
        const updatedLines = s.lines.map(l =>
          l.status === 'pending' ? { ...l, status: 'draft' } : l
        )
        return {
          status: 'draft',
          mode_edit: true,
          lines: updatedLines,
          linesBackup: _.cloneDeep(updatedLines),
          isChanged: false,
        }
      })
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  // ── Yeni metraj oturumu başlat ───────────────────────────────
  const handleStartNew = async () => {
    try {
      const { data, error } = await supabase
        .from('measurement_sessions')
        .insert({ work_package_poz_area_id: wpAreaId, status: 'draft', total_quantity: 0, created_by: appUser?.id ?? null })
        .select().single()
      if (error) throw error
      setSessions(prev => [
        ...prev,
        {
          ...data,
          userName: appUser?.email ?? '?',
          isOwn: true,
          lines: [],
          linesBackup: [],
          mode_edit: true,
          isChanged: false,
        },
      ])
      setVisibleSessCards(prev => ({ ...prev, [data.id]: true }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  // ── Onaylı metraj üzerinde doğrudan revize başlat ──────────
  const handleStartRevision = (sessId) => {
    updateSess(sessId, s => ({
      mode_edit: true,
      isRevisionEdit: true,
      linesBackup: _.cloneDeep(s.lines),
      isChanged: false,
      revisedLines: {},
    }))
  }

  // ── Revize düzenleme modunu iptal et ────────────────────────
  const handleCancelRevisionEdit = (sessId) => {
    updateSess(sessId, s => ({
      lines: _.cloneDeep(s.linesBackup),
      mode_edit: false,
      isRevisionEdit: false,
      isChanged: false,
      revisedLines: {},
    }))
  }

  // ── Revize talebini geri çek (approved'a dön) ────────────────
  const handleCancelRevisionRequest = (sessId) => {
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: 'Revize talebi geri çekilsin mi? Metraj önceki onaylı değere döner.',
      actionText1: 'Evet, Geri Çek',
      action1: async () => {
        setDialogAlert()
        const sess = sessions.find(s => s.id === sessId)
        if (!sess) return
        const meta = Array.isArray(sess.revision_snapshot)
          ? sess.revision_snapshot.find(e => e.__revision_meta__)
          : null
        if (!meta) return
        const { approved_total, new_line_ids, changed_line_ids } = meta
        try {
          const restoreEntries = (sess.revision_snapshot ?? []).filter(
            e => !e.__revision_meta__ && Array.isArray(changed_line_ids) && changed_line_ids.includes(e.id)
          )
          for (const entry of restoreEntries) {
            const { error } = await supabase.from('measurement_lines').update({
              multiplier: entry.multiplier, count: entry.count, length: entry.length,
              width: entry.width, height: entry.height, description: entry.description,
            }).eq('id', entry.id)
            if (error) throw error
          }
          if (Array.isArray(new_line_ids) && new_line_ids.length > 0) {
            const { error } = await supabase.from('measurement_lines').delete().in('id', new_line_ids)
            if (error) throw error
          }
          const cleanSnapshot = (sess.revision_snapshot ?? []).filter(
            e => !e.__revision_meta__ && !(Array.isArray(changed_line_ids) && changed_line_ids.includes(e.id))
          )
          const { error: updErr } = await supabase.from('measurement_sessions').update({
            status: 'approved',
            total_quantity: approved_total,
            revision_snapshot: cleanSnapshot.length > 0 ? cleanSnapshot : null,
            updated_at: new Date().toISOString(),
          }).eq('id', sessId)
          if (updErr) throw updErr

          updateSess(sessId, s => {
            const restoredLines = s.lines
              .filter(l => !Array.isArray(new_line_ids) || !new_line_ids.includes(l.id))
              .map(l => {
                const entry = restoreEntries.find(e => e.id === l.id)
                if (entry) return { ...l, multiplier: entry.multiplier, count: entry.count, length: entry.length, width: entry.width, height: entry.height, description: entry.description }
                return l
              })
            const newRevisedLines = cleanSnapshot.length > 0 ? Object.fromEntries(cleanSnapshot.map(e => [e.id, e])) : {}
            const updated = {
              status: 'approved',
              total_quantity: approved_total,
              revision_snapshot: cleanSnapshot.length > 0 ? cleanSnapshot : null,
              lines: restoredLines,
              linesBackup: _.cloneDeep(restoredLines),
              revisedLines: newRevisedLines,
            }
            return { ...updated, visualStatus: getMeasurementVisualStatus(updated) }
          })
        } catch (err) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        }
      },
      onCloseAction: () => setDialogAlert(),
    })
  }

  // ── Revize düzenlemesini kaydet ─────────────────────────────
  const handleSaveRevision = async (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    try {
      // Yeni (isNew) alt satırları DB'ye kaydet — parent'tan önce child eklenmemesi için topolojik sıra
      const insertedMap = {}
      const newLines = sess.lines.filter(l => l.isNew)
      const toInsert = [...newLines]
      while (toInsert.length > 0) {
        const candidate = toInsert.find(l =>
          !l.parent_line_id ||
          !newLines.find(p => p.id === l.parent_line_id) ||
          insertedMap[l.parent_line_id]
        )
        if (!candidate) break
        const realParentId = candidate.parent_line_id
          ? (insertedMap[candidate.parent_line_id]?.id ?? candidate.parent_line_id)
          : null
        const { data: inserted, error } = await supabase
          .from('measurement_lines')
          .insert({
            session_id: sessId,
            order_index: candidate.order_index,
            description: candidate.description || null,
            multiplier: (candidate.multiplier === '' || candidate.multiplier === null) ? 1 : Number(candidate.multiplier),
            count:  candidate.count  === '' ? null : candidate.count,
            length: candidate.length === '' ? null : candidate.length,
            width:  candidate.width  === '' ? null : candidate.width,
            height: candidate.height === '' ? null : candidate.height,
            parent_line_id: realParentId,
            line_type: 'data',
            status: 'draft',
          })
          .select().single()
        if (error) throw error
        insertedMap[candidate.id] = inserted
        toInsert.splice(toInsert.indexOf(candidate), 1)
      }

      // Değişen mevcut satırları güncelle
      for (const line of sess.lines.filter(l => !l.isNew)) {
        const backup = sess.linesBackup.find(b => b.id === line.id)
        if (backup && JSON.stringify(line) === JSON.stringify(backup)) continue
        const { error } = await supabase
          .from('measurement_lines')
          .update({
            description: line.description,
            multiplier: (line.multiplier === '' || line.multiplier === null) ? 1 : Number(line.multiplier),
            count:  line.count  === '' ? null : line.count,
            length: line.length === '' ? null : line.length,
            width:  line.width  === '' ? null : line.width,
            height: line.height === '' ? null : line.height,
          })
          .eq('id', line.id)
        if (error) throw error
      }

      // Yaprak (parent olmayan) satırların toplamını hesapla
      const parentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
      const leafTotal = sess.lines.filter(l => !parentIds.has(l.id)).reduce((sum, l) => sum + computeQuantity(l), 0)

      // Revize snapshot'ını birleştir
      const prevSnapshot = Array.isArray(sess.revision_snapshot) ? sess.revision_snapshot : []
      const prevSnapshotMap = Object.fromEntries(prevSnapshot.filter(e => !e.__revision_meta__).map(e => [e.id, e]))
      const snapshotArray = Object.values({ ...prevSnapshotMap, ...sess.revisedLines })

      // Meta girişi: onaylı toplam ve değişen/yeni satır listesini sakla
      const newLineIds = Object.values(insertedMap).map(l => l.id)
      const metaEntry = {
        __revision_meta__: true,
        approved_total: sess.total_quantity,
        new_line_ids: newLineIds,
        changed_line_ids: Object.keys(sess.revisedLines),
      }
      const fullSnapshot = [...snapshotArray, metaEntry]

      const { error: updErr } = await supabase
        .from('measurement_sessions')
        .update({
          status: 'revise_requested',
          total_quantity: leafTotal,
          updated_at: new Date().toISOString(),
          revision_snapshot: fullSnapshot,
        })
        .eq('id', sessId)
      if (updErr) throw updErr

      const updatedLines = sess.lines.map(l => insertedMap[l.id] ? { ...insertedMap[l.id] } : l)
      const newRevisedLines = { ...prevSnapshotMap, ...sess.revisedLines }
      updateSess(sessId, () => ({
        status: 'revise_requested',
        visualStatus: getMeasurementVisualStatus({ status: 'revise_requested' }),
        total_quantity: leafTotal,
        lines: updatedLines,
        linesBackup: _.cloneDeep(updatedLines),
        mode_edit: false,
        isRevisionEdit: false,
        isChanged: false,
        revisedLines: newRevisedLines,
        revision_snapshot: fullSnapshot,
      }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  // ── Revize modunda alt satır ekle (yerel, kayıt sonraya) ────
  const addSubLineLocal = (sessId, parentLineId) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessId) return s
      const siblings = s.lines.filter(l => l.parent_line_id === parentLineId)
      const maxOrder = siblings.reduce((max, l) => Math.max(max, l.order_index ?? 0), 0)
      const tempId = `new-${Date.now()}-${Math.random()}`
      return {
        ...s,
        isChanged: true,
        lines: [...s.lines, {
          id: tempId,
          session_id: sessId,
          order_index: maxOrder + 1,
          description: '',
          multiplier: null,
          count: null,
          length: null,
          width: null,
          height: null,
          parent_line_id: parentLineId,
          line_type: 'data',
          isNew: true,
        }],
      }
    }))
  }

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  // Tüm session satırlarından onaylanan ağacı türet
  const approvalTree = useMemo(() => {
    const allLines = sessions.flatMap(s => s.lines ?? [])
    return buildApprovalTree(allLines, sessions, userMap)
  }, [sessions, userMap])

  // ── Revize talebi gönder ─────────────────────────────────────
  const handleSendRevizeTalebi = async () => {
    const formEntries = Object.entries(revizeForms)
    if (formEntries.length === 0 || !formEntries.some(([, rows]) => rows.length > 0)) return

    // Mevcut kullanıcının oturumunu bul veya yeni oluştur
    let mySess = sessions.find(s => s.isOwn)
    if (!mySess) {
      try {
        const { data, error } = await supabase
          .from('measurement_sessions')
          .insert({ work_package_poz_area_id: wpAreaId, status: 'draft', total_quantity: 0, created_by: appUser?.id ?? null })
          .select().single()
        if (error) throw error
        mySess = {
          ...data, userName: appUser?.email ?? '?', isOwn: true,
          lines: [], linesBackup: [], mode_edit: false,
          isRevisionEdit: false, isChanged: false, revisedLines: {},
        }
        setSessions(prev => [...prev, mySess])
      } catch (err) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        return
      }
    }

    const allLines = sessions.flatMap(s => s.lines ?? [])
    const allSavedLines = []
    const expandUpdates = {}

    for (const [parentLineId, rows] of formEntries) {
      if (rows.length === 0) continue
      const siblings = allLines.filter(l => l.parent_line_id === parentLineId)
      const maxOrder = siblings.reduce((mx, l) => Math.max(mx, l.order_index ?? 0), 0)
      const savedLines = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const { data: newLine, error } = await supabase
            .from('measurement_lines')
            .insert({
              session_id: mySess.id,
              parent_line_id: parentLineId,
              order_index: maxOrder + i + 1,
              description: row.description || null,
              multiplier: row.multiplier !== '' ? Number(row.multiplier) : 1,
              count:  row.count  !== '' ? Number(row.count)  : null,
              length: row.length !== '' ? Number(row.length) : null,
              width:  row.width  !== '' ? Number(row.width)  : null,
              height: row.height !== '' ? Number(row.height) : null,
              status: 'pending',
              line_type: 'data',
            })
            .select().single()
          if (error) throw error
          savedLines.push(newLine)
        } catch (err) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
          return
        }
      }
      allSavedLines.push(...savedLines)
      expandUpdates[parentLineId] = true
    }

    setSessions(prev => prev.map(s =>
      s.id === mySess.id ? { ...s, lines: [...s.lines, ...allSavedLines] } : s
    ))
    setExpandedApproved(prev => ({ ...prev, ...expandUpdates }))
    setRevizeForms({})
  }

  const handleCancelRevizeTalebi = async (lineId, sessId) => {
    try {
      const { error } = await supabase.from('measurement_lines').delete().eq('id', lineId)
      if (error) throw error
      setSessions(prev => prev.map(s =>
        s.id === sessId ? { ...s, lines: s.lines.filter(l => l.id !== lineId) } : s
      ))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleDeletePendingLine = async (lineId) => {
    try {
      const { error } = await supabase.from('measurement_lines').delete().eq('id', lineId)
      if (error) throw error
      setSessions(prev => prev.map(s => ({
        ...s,
        lines: s.lines.filter(l => l.id !== lineId)
      })))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleApprovePendingLine = async (lineId) => {
    try {
      const { error } = await supabase.from('measurement_lines').update({ status: 'approved' }).eq('id', lineId)
      if (error) throw error
      setSessions(prev => prev.map(s => ({
        ...s,
        lines: s.lines.map(l => l.id === lineId ? { ...l, status: 'approved' } : l)
      })))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''
  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  const hasMyActiveSess = sessions.some(s => s.isOwn && (s.status !== 'approved' || s.isRevisionEdit))

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
                  onClick={(e) => {
                    e.stopPropagation()
                    setVisibleOnayKarti(v => !v)
                  }}
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

            {sessions
              .sort((a, b) => {
                if (a.isOwn && !b.isOwn) return -1
                if (!a.isOwn && b.isOwn) return 1
                return 0
              })
              .map(sess => {
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setVisibleSessCards(prev => ({ ...prev, [sess.id]: !isVisible }))
                      }}
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
              <IconButton sx={{ m: 0, p: 0 }} onClick={() => navGuard('/metrajolusturpozmahaller')}>
                <ReplyIcon sx={{ color: 'gray' }} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navGuard('/metrajolusturpozlar')}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { opacity: 0.9 } }}
                onClick={() => navGuard('/metrajolusturpozmahaller')}
              >
                {pozLabel}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {selectedMahal?.code ? `${selectedMahal.code} · ${selectedMahal.name}` : selectedMahal?.name}
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

      {loadError && (
        <Stack sx={{ width: '100%', p: '1rem' }}>
          <Alert severity="error">Veri alınırken hata: {loadError}</Alert>
        </Stack>
      )}

      {/* Yeni metraj başlatma butonu (aktif oturum yoksa) */}
      {!loading && !loadError && !hasMyActiveSess && (
        <Box sx={{ px: '1rem', pt: '1rem' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', px: '6px', py: '4px', cursor: 'pointer', width: 'fit-content' }}
            onClick={handleStartNew}
          >
            <AddIcon sx={{ fontSize: 20, color: '#1565c0' }} />
            <Typography sx={{ fontSize: '0.85rem', color: '#1565c0' }}>Yeni Metraj Başlat</Typography>
          </Box>
        </Box>
      )}

      {/* SESSION KARTLARI */}
      {(() => {
        const visibleSessions = sessions.filter(sess => visibleSessCards[sess.id] ?? true)
        return visibleSessions.length > 0 ? (
          <Box sx={{ mt: '1.5rem', px: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px' }}>
            {visibleSessions
              .sort((a, b) => {
                if (a.isOwn && !b.isOwn) return -1
                if (!a.isOwn && b.isOwn) return 1
                return 0
              })
              .map(sess => {
          const visualStatus = sess.visualStatus ?? getMeasurementVisualStatus(sess)
          const cardColors = getCardColors(visualStatus)
          const isDraft    = sess.status === 'draft'
          const isReady    = sess.status === 'ready'
          const isApproved = visualStatus === 'approved' || visualStatus === 'revised'
          const canEdit    = sess.isOwn && (isDraft || isReady)
          const rootLines = sess.lines.filter(l => !l.parent_line_id)
          const hasApprovedLines = rootLines.some(l => l.status === 'approved')
          const totalDraft     = rootLines.filter(l => !l.status || l.status === 'draft').reduce((sum, l) => sum + computeQuantity(l), 0)
          const totalPending   = rootLines.filter(l => l.status === 'pending').reduce((sum, l) => sum + computeQuantity(l), 0)
          const totalIgnored   = rootLines.filter(l => l.status === 'ignored').reduce((sum, l) => sum + computeQuantity(l), 0)
          const totalApproved  = rootLines.filter(l => l.status === 'approved').reduce((sum, l) => sum + computeQuantity(l), 0)

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
                  {!sess.isOwn && (
                    <Box component="span" sx={{ fontWeight: 400, fontSize: '0.78rem', ml: '6px', color: 'rgba(255,255,255,0.6)' }}>
                      (salt okunur)
                    </Box>
                  )}
                </Typography>


                {/* Kendi onaylı oturumu için revize düzenle */}
                {isApproved && sess.isOwn && !sess.mode_edit && (
                  <IconButton size="small" onClick={() => handleStartRevision(sess.id)}>
                    <EditIcon sx={{ fontSize: 20, color: '#90CAF9' }} />
                  </IconButton>
                )}

                {/* Revize düzenleme modu — iptal / kaydet */}
                {sess.isRevisionEdit && sess.mode_edit && (
                  <>
                    <IconButton size="small" onClick={() => handleCancelRevisionEdit(sess.id)}>
                      <ClearIcon sx={{ color: sess.isChanged ? '#FFCDD2' : 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                    </IconButton>
                    {sess.isChanged && (
                      <IconButton size="small" onClick={() => handleSaveRevision(sess.id)}>
                        <SaveIcon sx={{ color: '#90CAF9', fontSize: 20 }} />
                      </IconButton>
                    )}
                  </>
                )}

                {/* Taslak veya onay bekleyen oturum — her zaman düzenleme ikonu */}
                {(isDraft || isReady) && sess.isOwn && !sess.mode_edit && !sess.isRevisionEdit && (
                  <>
                    <IconButton size="small" onClick={() => updateSess(sess.id, () => ({ mode_edit: true }))}>
                      <EditIcon sx={{ fontSize: 20, color: '#e0e1dd' }} />
                    </IconButton>
                    {isDraft && rootLines.length > 0 && (
                      <IconButton size="small" onClick={() => handleMarkReady(sess.id)}>
                        <CheckCircleIcon sx={{ fontSize: 24, color: '#A5D6A7' }} />
                      </IconButton>
                    )}
                  </>
                )}

                {/* Taslak düzenleme modu — iptal / kaydet */}
                {(isDraft || isReady) && sess.isOwn && sess.mode_edit && (
                  <>
                    <IconButton size="small" onClick={() => handleCancelEdit(sess.id)}>
                      <ClearIcon sx={{ color: sess.isChanged ? '#FFCDD2' : 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleSave(sess.id)} disabled={!sess.isChanged}>
                      <SaveIcon sx={{ color: sess.isChanged ? '#90CAF9' : 'rgba(255,255,255,0.25)', fontSize: 20 }} />
                    </IconButton>
                  </>
                )}

                {/* Kendi revize talebi — geri çek */}
                {sess.status === 'revise_requested' && sess.isOwn && !sess.mode_edit && (
                  <IconButton size="small" onClick={() => handleCancelRevisionRequest(sess.id)}>
                    <ReplyIcon sx={{ color: '#CE93D8', fontSize: 20 }} />
                  </IconButton>
                )}

                {/* Satır ekle */}
                {sess.mode_edit && (canEdit || (isApproved && sess.isOwn) || sess.isRevisionEdit) && (
                  <IconButton size="small" title="Satır Ekle" onClick={() => {
                    if (sess.isRevisionEdit && sess.mode_edit) { addSubLineLocal(sess.id, null) }
                    else if (isApproved) { handleStartRevision(sess.id); addSubLineLocal(sess.id, null) }
                    else { handleAddLine(sess.id) }
                  }}>
                    <AddCircleOutlineIcon sx={{ fontSize: 22, color: '#90CAF9' }} />
                  </IconButton>
                )}
              </Box>

              {/* Satır yok */}
              {rootLines.length === 0 && !sess.mode_edit && !canEdit && (
                <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                  Bu oturumda metraj satırı bulunmuyor.
                </Box>
              )}

              {/* Tablo */}
              {(rootLines.length > 0 || canEdit || (sess.isRevisionEdit && sess.mode_edit)) && (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLS, minWidth: 'max-content' }}>

                    {/* Tablo başlığı */}
                    <Box sx={{ ...css_lineHeaderCell }}>Sıra</Box>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                    {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>)}
                    <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                    <Box sx={{ ...css_lineHeaderCell }}>Durum</Box>

                    {/* Satırlar — sadece kök satırlar (revize alt satırları onaylanan metraj kartında gösterilir) */}
                    {buildDisplayTree(rootLines).map(line => {
                      const qty = computeQuantity(line)
                      const isDeduction = qty < 0
                      const isPendingLocked = isReady && line.status === 'pending'
                      const isIgnoredLocked = line.status === 'ignored'
                      const isDraftLine = !line.status || line.status === 'draft'
                      const rowBg = (line.isNew && sess.isRevisionEdit)
                        ? 'rgba(255,250,200,0.6)'
                        : isIgnoredLocked
                        ? '#BDBDBD'
                        : line.status === 'pending' && !isApproved
                        ? '#BBDEFB'
                        : isDraftLine && !isApproved
                        ? (sess.mode_edit ? 'rgba(255,250,180,0.6)' : '#FFE0B2')
                        : line.status === 'approved'
                        ? '#C8E6C9'
                        : isApproved
                        ? cardColors.row
                        : visualStatus === 'unread'
                        ? cardColors.row
                        : sess.mode_edit ? 'rgba(255,250,200,0.4)' : 'white'
                      const deductionColor = isDeduction ? '#b71c1c' : undefined
                      const editActive = (canEdit && sess.mode_edit && line.status !== 'approved' && line.status !== 'pending' && !isIgnoredLocked) || (sess.isRevisionEdit && sess.mode_edit && line.isNew)
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
                            {sess.isRevisionEdit && sess.mode_edit && !line.isNew && (
                              <IconButton
                                size="small"
                                sx={{ p: '1px', mr: '3px', flexShrink: 0 }}
                                onClick={() => addSubLineLocal(sess.id, line.id)}
                              >
                                <SubdirectoryArrowRightIcon sx={{ fontSize: 13, color: '#1565c0', opacity: 0.7 }} />
                              </IconButton>
                            )}
                            {canEdit && sess.mode_edit && !sess.isRevisionEdit && line.status !== 'approved' && line.status !== 'pending' && !isIgnoredLocked && (
                              <IconButton
                                size="small"
                                sx={{ p: '1px', mr: '3px', flexShrink: 0 }}
                                onClick={() => handleDeleteLine(sess.id, line.id)}
                              >
                                <ClearIcon sx={{ fontSize: 14, color: '#b71c1c' }} />
                              </IconButton>
                            )}
                            {editActive ? (
                              <input
                                style={{ ...inputSx, textAlign: 'left', color: deductionColor }}
                                value={line.description ?? ''}
                                placeholder="Açıklama"
                                onChange={e => handleLineChange(sess.id, line.id, 'description', e.target.value)}
                              />
                            ) : (
                              line.description ?? ''
                            )}
                          </Box>

                          {NUM_FIELDS.map(field => (
                            <Box key={field} sx={{ ...css_lineCell, ...cellBg, justifyContent: 'flex-end', color: deductionColor }}>
                              {editActive ? (
                                <input
                                  type="number"
                                  className="metraj-num-input"
                                  style={{ ...inputSx, color: deductionColor }}
                                  value={field === 'multiplier' && Number(line[field]) === 1 ? '' : (line[field] ?? '')}
                                  placeholder="—"
                                  onChange={e => handleLineChange(sess.id, line.id, field, e.target.value)}
                                  onKeyDown={e => ['e', 'E', '+'].includes(e.key) && e.preventDefault()}
                                />
                              ) : (
                                field === 'multiplier' && Number(line[field]) === 1 ? '' : (line[field] != null ? ikiHane(line[field]) : '')
                              )}
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

                          <Box sx={{ ...css_lineCell, ...cellBg, justifyContent: 'center', px: '2px' }}>
                            {(sess.isRevisionEdit && sess.mode_edit && line.isNew) ? (
                              <IconButton size="small" onClick={() => handleDeleteLine(sess.id, line.id)} sx={{ p: '2px' }}>
                                <ClearIcon sx={{ fontSize: 18, color: '#b71c1c' }} />
                              </IconButton>
                            ) : line.status === 'approved' ? (
                              <DoneAllIcon sx={{ fontSize: 18, color: '#2e7d32', fontWeight: 700 }} />
                            ) : line.status === 'rejected' ? (
                              <ClearIcon sx={{ fontSize: 18, color: '#c62828' }} />
                            ) : line.status === 'ignored' ? (
                              <DoneAllIcon sx={{ fontSize: 18, color: '#424242' }} />
                            ) : line.status === 'pending' && isApproved ? (
                              <IconButton size="small" onClick={() => handleDeleteLine(sess.id, line.id)} sx={{ p: '2px' }}>
                                <ReplyIcon sx={{ fontSize: 18, color: 'orange' }} />
                              </IconButton>
                            ) : canEdit && sess.mode_edit && (!line.status || line.status === 'draft' || line.status === 'pending') ? (
                              <IconButton
                                size="small"
                                sx={{ p: '2px' }}
                                onClick={() => {
                                  const newStatus = (!line.status || line.status === 'draft') ? 'pending' : 'draft'
                                  updateSess(sess.id, s => ({
                                    isChanged: true,
                                    lines: s.lines.map(l => l.id === line.id ? { ...l, status: newStatus } : l),
                                  }))
                                }}
                              >
                                {(!line.status || line.status === 'draft')
                                  ? <HourglassFullIcon sx={{ fontSize: 15, color: '#E65100' }} />
                                  : <CheckIcon sx={{ fontSize: 18, color: '#1565C0' }} />
                                }
                              </IconButton>
                            ) : line.status === 'pending' ? (
                              <CheckIcon sx={{ fontSize: 18, color: '#1565C0' }} />
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

      {/* ONAYLANAN METRAJ — Hazırlayan için salt-okunur; onaylı satırlara revize talebi gönderilebilir */}
      {!loading && visibleOnayKarti && approvalTree.length > 0 && (() => {
        const ONAY_GRID = 'max-content 1fr 65px 65px 65px 65px 65px 80px 90px 90px 36px'
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
        const LINE_STATUS_CHIP = {
          pending:  <Chip size="small" label="Bekliyor"   sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />,
          rejected: <Chip size="small" label="Reddedildi" sx={{ backgroundColor: '#FFEBEE', color: '#B71C1C', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />,
          ignored:  <Chip size="small" label="Ignore"     sx={{ backgroundColor: '#ECEFF1', color: '#455A64', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />,
        }
        const css_ohc = { px: '4px', py: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#1b5e20', color: '#fff' }
        const css_oc = { px: '4px', py: '6px', height: '34px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', borderRight: '1px dashed #d8d8d8', overflow: 'hidden' }
        const inputOnay = { width: '100%', border: 'none', outline: 'none', backgroundColor: 'rgba(255,250,180,0.6)', fontSize: '0.85rem', padding: '2px 4px', MozAppearance: 'textfield' }

        const openRevize = (lineId) => {
          if (revizeForms[lineId]) return // zaten açık
          setRevizeForms(prev => ({
            ...prev,
            [lineId]: [{ tempId: `tmp-${Date.now()}`, description: '', multiplier: '', count: '', length: '', width: '', height: '', status: 'draft' }],
          }))
        }

        // Plain function (not component) — prevents React unmount/remount on state change
        function renderOnayRow(node) {
          const metraj = calcMetrajOnay(node)
          const hasKids = (node.children?.length ?? 0) > 0
          const isExp   = expandedApproved[node.id] ?? false
          const isRevizeOpen = !!(revizeForms[node.id]?.length)
          const isRevised = node.status === 'approved' && hasKids

          // Çoklu satır revize editörü (metrajonaylacetvel ile aynı)
          const nodeRevizeRows = revizeForms[node.id] ?? []
          const revizeEditor = isRevizeOpen && nodeRevizeRows.length > 0 ? (
            <>
              {nodeRevizeRows.map((row, rowIdx) => {
                const isSubmitted = row.status === 'submitted_for_approval'
                const revizeCellBg = isSubmitted
                  ? { backgroundColor: '#BBDEFB', borderBottom: '1px solid #90CAF9' }
                  : { backgroundColor: 'rgba(255,250,180,0.6)', borderBottom: '1px solid #c8c8c8' }

                return (
                  <React.Fragment key={row.tempId}>
                    <Box sx={{ ...css_oc, ...revizeCellBg, justifyContent: 'flex-start', pl: '0.5rem', color: isSubmitted ? '#1565c0' : '#E65100', fontSize: '0.82rem' }}>
                      {`${node.siraNo}.${(node.children?.length ?? 0) + rowIdx + 1}`}
                    </Box>
                    <Box sx={{ ...css_oc, ...revizeCellBg, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {!isSubmitted && (
                        <IconButton size="small" sx={{ p: '1px', flexShrink: 0 }}
                          onClick={() => setRevizeForms(prev => {
                            const filtered = (prev[node.id] ?? []).filter(r => r.tempId !== row.tempId)
                            return filtered.length > 0
                              ? { ...prev, [node.id]: filtered }
                              : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== String(node.id)))
                          })}>
                          <ClearIcon sx={{ fontSize: 14, color: '#c62828' }} />
                        </IconButton>
                      )}
                      <input style={{ ...inputOnay, textAlign: 'left', backgroundColor: isSubmitted ? '#BBDEFB' : 'rgba(255,250,180,0.6)' }} value={row.description} placeholder="Açıklama"
                        disabled={isSubmitted}
                        onChange={e => setRevizeForms(prev => ({ ...prev, [node.id]: prev[node.id].map(r => r.tempId === row.tempId ? { ...r, description: e.target.value } : r) }))} />
                    </Box>
                    {NUM_ONAY_FIELDS.map(f => (
                      <Box key={f} sx={{ ...css_oc, ...revizeCellBg }}>
                        <input type="number" className="metraj-num-input" style={{ ...inputOnay, textAlign: 'right', backgroundColor: isSubmitted ? '#BBDEFB' : 'rgba(255,250,180,0.6)' }}
                          value={row[f]} placeholder="—"
                          disabled={isSubmitted}
                          onChange={e => setRevizeForms(prev => ({ ...prev, [node.id]: prev[node.id].map(r => r.tempId === row.tempId ? { ...r, [f]: e.target.value } : r) }))}
                          onKeyDown={e => ['e', 'E', '+'].includes(e.key) && e.preventDefault()} />
                      </Box>
                    ))}
                    <Box sx={{ ...css_oc, ...revizeCellBg, justifyContent: 'flex-end', fontWeight: 700, color: calcMetrajOnay(row) < 0 ? '#c62828' : (isSubmitted ? '#1565c0' : '#333') }}>
                      {(() => {
                        const qty = calcMetrajOnay(row)
                        const isEmpty = v => v === null || v === undefined || v === ''
                        const hasData = [row.multiplier, row.count, row.length, row.width, row.height].some(v => !isEmpty(v))
                        return (qty !== 0 || hasData) ? ikiHane(qty) : ''
                      })()}
                      {pozBirim && calcMetrajOnay(row) !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: isSubmitted ? '#1565c0' : '#555' }}>{pozBirim}</Box>}
                    </Box>
                    <Box sx={{ ...css_oc, ...revizeCellBg, fontSize: '0.78rem', color: isSubmitted ? '#1565c0' : '#455a64' }}>{appUser?.displayName ?? appUser?.email ?? '(ben)'}</Box>
                    <Box sx={{ ...css_oc, ...revizeCellBg, fontSize: '0.78rem', color: isSubmitted ? '#1565c0' : '#455a64' }}></Box>
                    <Box sx={{ ...css_oc, ...revizeCellBg, justifyContent: 'center', gap: '2px' }}>
                      {!isSubmitted && (
                        <IconButton size="small" sx={{ p: '2px' }} title="Onaya Sunulan"
                          onClick={() => setRevizeForms(prev => ({ ...prev, [node.id]: prev[node.id].map(r => r.tempId === row.tempId ? { ...r, status: 'submitted_for_approval' } : r) }))}>
                          <HourglassFullIcon sx={{ fontSize: 16, color: '#E65100' }} />
                        </IconButton>
                      )}
                      {isSubmitted && (
                        <CheckIcon sx={{ fontSize: 16, color: '#1565C0' }} />
                      )}
                    </Box>
                  </React.Fragment>
                )
              })}
            </>
          ) : null

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
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'flex-end', fontWeight: 700, color: '#888' }}>{ikiHane(calcMetrajOnay(node))}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, fontSize: '0.78rem', color: '#9E9E9E' }}>{node.hazırlayan}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, fontSize: '0.78rem', color: '#9E9E9E' }}>{node.onaylayan}</Box>
                    <Box sx={{ ...css_oc, ...origCellBg, justifyContent: 'center' }}>
                      {!isRevizeOpen && (
                        <IconButton size="small" sx={{ p: '2px' }} onClick={() => openRevize(node.id)}>
                          <EditIcon sx={{ fontSize: 16, color: '#7b1fa2' }} />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}
                {node.children.map(child => (
                  <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
                ))}
                {revizeEditor}
              </>
            )
          }

          const rowBg = node.status !== 'approved'
            ? (node.status === 'pending' ? '#FFCC80' : node.status === 'rejected' ? 'rgba(255,235,238,0.5)' : 'rgba(236,239,241,0.5)')
            : '#C8E6C9'
          const onaylayanText = node.status === 'pending' ? '(bekliyor)' : node.status === 'rejected' ? '(reddedildi)' : node.status === 'ignored' ? '(ignore)' : (node.onaylayan ?? '')
          const cellBg = { backgroundColor: rowBg, borderBottom: '1px dashed #c8c8c8', ...(metraj < 0 && { color: '#c62828' }) }

          return (
            <>
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-start', pl: '0.5rem', color: node.depth > 0 ? '#1565c0' : '#555' }}>
                {node.siraNo}
              </Box>
              <Box sx={{ ...css_oc, ...cellBg, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {node.status === 'pending' && (
                  <IconButton size="small" sx={{ p: '1px', flexShrink: 0 }} onClick={() => handleDeletePendingLine(node.id)}>
                    <ClearIcon sx={{ fontSize: 14, color: '#c62828' }} />
                  </IconButton>
                )}
                {node.description ?? ''}
              </Box>
              {NUM_ONAY_FIELDS.map(f => (
                <Box key={f} sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-end' }}>{f === 'multiplier' && Number(node[f]) === 1 ? '' : (node[f] != null ? ikiHane(node[f]) : '')}</Box>
              ))}
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'flex-end', fontWeight: 700, ...(metraj < 0 && { color: '#c62828' }) }}>
                {metraj !== 0 ? ikiHane(metraj) : (() => {
                  const isEmpty = v => v === null || v === undefined || v === ''
                  const hasData = !isEmpty(node.description) ||
                    [(Number(node.multiplier) === 1 ? null : node.multiplier), node.count, node.length, node.width, node.height].some(v => !isEmpty(v))
                  return hasData ? ikiHane(metraj) : ''
                })()}
                {pozBirim && !hasKids && metraj !== 0 && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: '#555' }}>{pozBirim}</Box>}
              </Box>
              <Box sx={{ ...css_oc, ...cellBg, fontSize: '0.78rem', color: '#455a64' }}>{node.hazırlayan}</Box>
              <Box sx={{ ...css_oc, ...cellBg, fontSize: '0.78rem', color: node.status === 'pending' ? '#e65100' : node.status === 'rejected' ? '#b71c1c' : '#1b5e20' }}>
                {onaylayanText}
              </Box>
              <Box sx={{ ...css_oc, ...cellBg, justifyContent: 'center', gap: '2px' }}>
                {node.status === 'approved' && !isRevizeOpen && (
                  <IconButton size="small" sx={{ p: '2px' }} onClick={() => openRevize(node.id)}>
                    <EditIcon sx={{ fontSize: 16, color: '#7b1fa2' }} />
                  </IconButton>
                )}
                {node.status === 'approved' && isRevizeOpen && (
                  <IconButton size="small" sx={{ p: '2px' }}
                    onClick={() => setRevizeForms(prev => ({ ...prev, [node.id]: [...(prev[node.id] ?? []), { tempId: `tmp-${Date.now()}-${Math.random()}`, description: '', multiplier: '', count: '', length: '', width: '', height: '' }] }))}>
                    <AddCircleOutlineIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
                  </IconButton>
                )}
                {node.status === 'pending' && sessions.find(s => s.id === node.session_id)?.isOwn && (
                  <>
                    <IconButton size="small" sx={{ p: '2px' }} title="Onaya Sunulan" onClick={() => handleApprovePendingLine(node.id)}>
                      <HourglassFullIcon sx={{ fontSize: 16, color: '#E65100' }} />
                    </IconButton>
                    <IconButton size="small" sx={{ p: '2px' }} title="Onaylandı" onClick={() => handleApprovePendingLine(node.id)}>
                      <CheckIcon sx={{ fontSize: 16, color: '#1565C0' }} />
                    </IconButton>
                  </>
                )}
                {hasKids && (
                  <IconButton size="small" sx={{ p: '2px' }} onClick={() => setExpandedApproved(prev => ({ ...prev, [node.id]: !prev[node.id] }))}>
                    {isExp ? <ExpandLessIcon sx={{ fontSize: 18, color: '#888' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#888' }} />}
                  </IconButton>
                )}
              </Box>

              {hasKids && isExp && node.children.map(child => (
                <React.Fragment key={child.id}>{renderOnayRow(child)}</React.Fragment>
              ))}

              {revizeEditor}
            </>
          )
        }

        const flattenAll = (nodes) => {
          const result = []
          const visit = (n) => { result.push(n); if (n.children) n.children.forEach(visit) }
          nodes.forEach(visit)
          return result
        }
        const onayKartiTotal = flattenAll(approvalTree)
          .filter(n => !(n.children?.length > 0))
          .filter(n => !revizeForms[n.id]?.length)
          .reduce((s, n) => s + calcMetrajOnay(n), 0)
          + Object.values(revizeForms).flat().reduce((s, row) => s + calcMetrajOnay(row), 0)

        // Onaylı Metraj kartı için istatistikleri hesapla
        const allApprovalLines = flattenAll(approvalTree)
        const totalApprovalDraft = allApprovalLines.filter(n => !n.status || n.status === 'draft').reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalApprovalPending = allApprovalLines.filter(n => n.status === 'pending').reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalApprovalIgnored = allApprovalLines.filter(n => n.status === 'ignored').reduce((s, n) => s + calcMetrajOnay(n), 0)
        const totalApprovalApproved = allApprovalLines.filter(n => n.status === 'approved').reduce((s, n) => s + calcMetrajOnay(n), 0)

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
                  {Object.keys(revizeForms).length > 0 && (
                    <>
                      <IconButton size="small" sx={{ p: '2px', color: '#ffcdd2' }} onClick={() => setRevizeForms({})}>
                        <ClearIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton size="small" sx={{ p: '2px', color: '#c8e6c9' }} onClick={handleSendRevizeTalebi}>
                        <SaveIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </>
                  )}
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
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Hazırlanan</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalApprovalDraft === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalApprovalDraft)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BBDEFB', width: 26, height: 26, flexShrink: 0 }}>
                    <CheckIcon sx={{ fontSize: 16, color: '#1565C0', filter: 'drop-shadow(0 0 0.4px #1565C0)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Onaya Sunulan</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalApprovalPending === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalApprovalPending)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#BDBDBD', width: 26, height: 26, flexShrink: 0 }}>
                    <DoneAllIcon sx={{ fontSize: 16, color: '#424242', filter: 'drop-shadow(0 0 0.4px #424242)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Ignore</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalApprovalIgnored === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalApprovalIgnored)}</Box>
                  {pozBirim && <Box component="span" sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{pozBirim}</Box>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#C8E6C9', width: 26, height: 26, flexShrink: 0 }}>
                    <DoneAllIcon sx={{ fontSize: 16, color: '#2E7D32', filter: 'drop-shadow(0 0 0.4px #2E7D32)' }} />
                  </Box>
                  <Box component="span" sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Onaylanan</Box>
                  <Box component="span" sx={{ fontSize: '0.95rem', fontWeight: 700, color: totalApprovalApproved === 0 ? 'rgba(255,255,255,0.55)' : '#e0e1dd', ml: '2px' }}>{ikiHane(totalApprovalApproved)}</Box>
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
