import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

import { StoreContext } from '../../components/store.js'
import { supabase } from '../../lib/supabase.js'
import { useGetPozUnits } from '../../hooks/useMongo.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'
import { getMeasurementChipStyle, getMeasurementDotColor, getMeasurementStatusLabel, getMeasurementVisualStatus } from '../../lib/measurementStatus.js'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'


function computeQuantity(line) {
  if (!line || line.line_type !== 'data') return 0
  const isEmpty = (val) => val === null || val === undefined || val === ''
  const allEmpty = [line.multiplier, line.count, line.length, line.width, line.height].every(isEmpty)
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

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function StatusChip({ session }) {
  const visual = getMeasurementVisualStatus(session)
  const hasRevision = Array.isArray(session?.revision_snapshot) && session?.revision_snapshot.length > 0
  if (visual === 'unread' && hasRevision) return <Chip size="small" label="Revize Edildi (Onay Bekliyor)" sx={{ backgroundColor: '#E3F2FD', color: '#0D47A1', fontWeight: 600 }} />
  if (visual === 'unread') return <Chip size="small" label="Henüz Okunmamış" sx={getMeasurementChipStyle(session)} />
  if (visual === 'approved') return <Chip size="small" label="Onaylanmış" sx={getMeasurementChipStyle(session)} />
  if (visual === 'revised') return <Chip size="small" label="Onay Sonrası Revize" sx={getMeasurementChipStyle(session)} />
  if (visual === 'rejected') return <Chip size="small" label="Reddedilmiş" sx={getMeasurementChipStyle(session)} />
  if (visual === 'pendingRevision') return <Chip size="small" label="Revize Talebi (Onay Bekliyor)" sx={getMeasurementChipStyle(session)} />
  if ((session?.status ?? '') === 'draft') return <Chip size="small" label="Taslak" sx={getMeasurementChipStyle(session)} />
  return <Chip size="small" label="Görüldü" sx={getMeasurementChipStyle(session)} />
}

const STATUS_ORDER = { approved: 0, ready: 1, draft: 2 }
const GRID_COLS = '40px 1fr 70px 70px 70px 70px 70px 90px 36px'
const NUM_FIELDS = ['multiplier', 'count', 'length', 'width', 'height']
const NUM_LABELS = ['Çarpan', 'Adet', 'Boy', 'En', 'Yükseklik']

const css_lineHeader = {
  display: 'grid', gridTemplateColumns: GRID_COLS,
  backgroundColor: '#555555', color: '#f5f5f5',
  fontSize: '0.75rem', fontWeight: 600,
}
const css_lineHeaderCell = {
  px: '4px', py: '3px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
}
const css_lineRow = {
  display: 'grid', gridTemplateColumns: GRID_COLS,
  borderBottom: '1px dashed #c8c8c8',
  '&:hover': { backgroundColor: '#fafafa' },
}
const css_lineCell = {
  px: '4px', py: '3px',
  fontSize: '0.85rem',
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
  if (visualStatus === 'approved') return { border: '#A5D6A7', header: '#E8F5E9', row: 'rgba(200,230,201,0.35)', totalText: '#1B5E20' }
  if (visualStatus === 'revised') return { border: '#90CAF9', header: '#E3F2FD', row: 'rgba(187,222,251,0.35)', totalText: '#0D47A1' }
  if (visualStatus === 'unread') return { border: '#FFCC80', header: '#FFF3E0', row: 'rgba(255,224,178,0.3)', totalText: '#E65100' }
  if (visualStatus === 'rejected') return { border: '#EF9A9A', header: '#FFEBEE', row: 'rgba(255,205,210,0.28)', totalText: '#B71C1C' }
  if (visualStatus === 'pendingRevision') return { border: '#CE93D8', header: '#F3E5F5', row: 'rgba(206,147,216,0.15)', totalText: '#4A148C' }
  return { border: '#B0BEC5', header: '#ECEFF1', row: 'rgba(236,239,241,0.3)', totalText: '#455A64' }
}


export default function P_MetrajOlusturCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal, appUser } = useContext(StoreContext)
  const { data: units = [] } = useGetPozUnits()

  const [dialogAlert, setDialogAlert] = useState()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sessions, setSessions] = useState([])

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

      // Kullanıcı görünen adlarını çek
      const uniqueUserIds = [...new Set(sessData.map(s => s.created_by).filter(Boolean))]
      const userMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: nameRows } = await supabase.rpc('get_user_display_names', { user_ids: uniqueUserIds })
        if (nameRows) nameRows.forEach(row => { userMap[row.id] = row.display_name || row.id })
      }

      // Tüm satırları çek
      const sessionIds = sessData.map(s => s.id)
      const { data: linesData } = await supabase
        .from('measurement_lines')
        .select('*')
        .in('session_id', sessionIds)
        .order('order_index')

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
          userName: userMap[sess.created_by] ?? '?',
          isOwn: sess.created_by === appUser?.id,
          lines: linesBySession[sess.id] ?? [],
          linesBackup: _.cloneDeep(linesBySession[sess.id] ?? []),
          mode_edit: false,
          isRevisionEdit: false,
          isChanged: false,
          revisedLines,
        }
      }))
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
  const handleAddLine = async (sessId, parentId = null) => {
    if (parentId) {
      setDialogAlert({
        dialogIcon: 'info',
        dialogMessage: 'Yeni metraj olustururken alt seviye satir eklenemez.',
        onCloseAction: () => setDialogAlert(),
      })
      return
    }
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const siblings = parentId
      ? sess.lines.filter(l => l.parent_line_id === parentId)
      : sess.lines.filter(l => !l.parent_line_id)
    const nextIdx = siblings.length > 0 ? Math.max(...siblings.map(l => l.order_index)) + 1 : 0
    try {
      const { data, error } = await supabase
        .from('measurement_lines')
        .insert({ session_id: sessId, line_type: 'data', description: '', order_index: nextIdx, parent_line_id: parentId || null })
        .select().single()
      if (error) throw error
      const newLine = { ...data, multiplier: null }
      updateSess(sessId, s => ({
        lines: [...s.lines, newLine],
        linesBackup: [...s.linesBackup, _.cloneDeep(newLine)],
        mode_edit: true,
      }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleDeleteLine = async (sessId, lineId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const toDelete = new Set()
    const collect = (id) => {
      toDelete.add(id)
      sess.lines.filter(l => l.parent_line_id === id).forEach(child => collect(child.id))
    }
    collect(lineId)
    const savedIds = [...toDelete].filter(id => !sess.lines.find(l => l.id === id)?.isNew)
    if (savedIds.length > 0) {
      try {
        const { error } = await supabase.from('measurement_lines').delete().in('id', savedIds)
        if (error) throw error
      } catch (err) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        return
      }
    }
    updateSess(sessId, s => ({
      lines: s.lines.filter(l => !toDelete.has(l.id)),
      linesBackup: s.linesBackup.filter(l => !toDelete.has(l.id)),
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
      for (const line of sess.lines) {
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
      const parentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
      const total = sess.lines.filter(l => !parentIds.has(l.id)).reduce((sum, l) => sum + computeQuantity(l), 0)
      await supabase
        .from('measurement_sessions')
        .update({ total_quantity: total, updated_at: new Date().toISOString() })
        .eq('id', sessId)
      updateSess(sessId, s => ({
        total_quantity: total,
        linesBackup: _.cloneDeep(s.lines),
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
      <Box sx={{ p: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        {sessions.map(sess => {
          const visualStatus = sess.visualStatus ?? getMeasurementVisualStatus(sess)
          const cardColors = getCardColors(visualStatus)
          const isDraft    = sess.status === 'draft'
          const isReady    = sess.status === 'ready'
          const isApproved = visualStatus === 'approved' || visualStatus === 'revised'
          const canEdit    = sess.isOwn && isDraft
          const revisedParentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
          const totalQuantity = sess.lines.filter(l => !revisedParentIds.has(l.id)).reduce((sum, l) => sum + computeQuantity(l), 0)

          return (
            <Box
              key={sess.id}
              sx={{
                border: '1px solid',
                borderColor: cardColors.border,
                overflow: 'hidden',
                boxShadow: 1,
              }}
            >
              {/* Kart başlığı */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  px: '1rem', height: '50px',
                  backgroundColor: cardColors.header,
                  borderBottom: '1px solid',
                  borderColor: cardColors.border,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                  {sess.isOwn ? 'Benim Metrajım' : sess.userName}
                  {!sess.isOwn && (
                    <Box component="span" sx={{ fontWeight: 400, fontSize: '0.78rem', ml: '6px', color: '#888' }}>
                      (salt okunur)
                    </Box>
                  )}
                </Typography>

                <Box
                  title={getMeasurementStatusLabel(sess)}
                  sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getMeasurementDotColor(sess), flexShrink: 0 }}
                />

                <StatusChip session={sess} />

                {/* Kendi onaylı oturumu için revize düzenle */}
                {isApproved && sess.isOwn && !sess.mode_edit && (
                  <Tooltip title="Revize et">
                    <IconButton size="small" onClick={() => handleStartRevision(sess.id)}>
                      <EditIcon sx={{ fontSize: 20, color: '#1565c0' }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Revize düzenleme modu — iptal / kaydet */}
                {sess.isRevisionEdit && sess.mode_edit && (
                  <>
                    <Tooltip title={sess.isChanged ? 'İptal' : 'Düzenlemeyi Bitir'}>
                      <IconButton size="small" onClick={() => handleCancelRevisionEdit(sess.id)}>
                        <ClearIcon sx={{ color: sess.isChanged ? '#c62828' : '#888', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                    {sess.isChanged && (
                      <Tooltip title="Kaydet (Revize)">
                        <IconButton size="small" onClick={() => handleSaveRevision(sess.id)}>
                          <SaveIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}

                {/* Kendi taslağı — düzenle / onaya gönder */}
                {isDraft && sess.isOwn && !sess.mode_edit && !sess.isChanged && (
                  <>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => updateSess(sess.id, () => ({ mode_edit: true }))}>
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                    {sess.lines.length > 0 && (
                      <Tooltip title="Onaya Gönder">
                        <IconButton size="small" onClick={() => handleMarkReady(sess.id)}>
                          <CheckCircleIcon sx={{ fontSize: 24, color: '#2e7d32' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}

                {/* Taslak düzenleme modu — değişiklik yoksa bitir */}
                {isDraft && sess.isOwn && sess.mode_edit && !sess.isChanged && (
                  <Tooltip title="Düzenlemeyi Bitir">
                    <IconButton size="small" onClick={() => updateSess(sess.id, () => ({ mode_edit: false }))}>
                      <ClearIcon sx={{ color: '#888', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Taslak değişiklik varsa — iptal / kaydet */}
                {isDraft && sess.isChanged && (
                  <>
                    <Tooltip title="İptal">
                      <IconButton size="small" onClick={() => handleCancelEdit(sess.id)}>
                        <ClearIcon sx={{ color: '#c62828', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kaydet">
                      <IconButton size="small" onClick={() => handleSave(sess.id)}>
                        <SaveIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                {/* Kendi oturumu onay bekliyor — taslağa geri al */}
                {isReady && sess.isOwn && (
                  <Tooltip title="Taslağa geri al">
                    <IconButton size="small" onClick={() => handleBackToDraft(sess.id)}>
                      <ReplyIcon sx={{ color: 'orange', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Kendi revize talebi — geri çek */}
                {sess.status === 'revise_requested' && sess.isOwn && !sess.mode_edit && (
                  <Tooltip title="Revize talebini geri çek (önceki onaylı değere dön)">
                    <IconButton size="small" onClick={() => handleCancelRevisionRequest(sess.id)}>
                      <ReplyIcon sx={{ color: '#6a1fa2', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Satır yok */}
              {sess.lines.length === 0 && !sess.mode_edit && (
                <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                  Bu oturumda metraj satırı bulunmuyor.
                </Box>
              )}

              {/* Tablo */}
              {(sess.lines.length > 0 || (canEdit && sess.mode_edit) || (sess.isRevisionEdit && sess.mode_edit)) && (
                <Box sx={{ overflowX: 'auto' }}>

                  {/* Tablo başlığı */}
                  <Box sx={{ ...css_lineHeader, minWidth: 'max-content' }}>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'center' }}>Sıra</Box>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                    {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>)}
                    <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                    <Box sx={{ ...css_lineHeaderCell }}></Box>
                  </Box>

                  {/* Satırlar — ağaç düzeninde */}
                  {buildDisplayTree(sess.lines).map(line => {
                    const qty = computeQuantity(line)
                    const isRevisedParent = revisedParentIds.has(line.id)
                    const isDeduction = qty < 0
                    const rowBg = isRevisedParent
                      ? 'rgba(191,54,12,0.04)'
                      : (line.isNew && sess.isRevisionEdit)
                      ? 'rgba(255,250,200,0.6)'
                      : isApproved
                      ? cardColors.row
                      : visualStatus === 'unread'
                      ? cardColors.row
                      : sess.mode_edit ? 'rgba(255,250,200,0.4)' : 'white'
                    const deductionColor = isRevisedParent ? '#bbb' : isDeduction ? '#b71c1c' : undefined
                    const editActive = (canEdit && sess.mode_edit) || (sess.isRevisionEdit && sess.mode_edit && line.isNew)
                    const depthStyle = line.depth > 0
                      ? { borderLeft: `${Math.min(line.depth, 3) * 3}px solid rgba(144,202,249,0.7)` }
                      : {}

                    return (
                      <Box key={line.id} sx={{ ...css_lineRow, backgroundColor: rowBg, minWidth: 'max-content', ...depthStyle }}>

                        <Box sx={{
                          ...css_lineCell, justifyContent: 'flex-end', pr: '4px',
                          color: isRevisedParent ? '#bf360c' : line.depth > 0 ? '#1565c0' : '#888',
                          fontSize: line.depth > 0 ? '0.78rem' : undefined,
                          opacity: isRevisedParent ? 0.5 : 1,
                        }}>
                          {line.siraNo}
                        </Box>

                        <Box sx={{
                          ...css_lineCell, color: deductionColor,
                          textDecoration: isRevisedParent ? 'line-through' : undefined,
                          fontStyle: isRevisedParent ? 'italic' : undefined,
                        }}>
                          {sess.isRevisionEdit && sess.mode_edit && !line.isNew && (
                            <Tooltip title={`Alt satır ekle → ${line.siraNo}.${sess.lines.filter(l => l.parent_line_id === line.id).length + 1}`}>
                              <IconButton
                                size="small"
                                sx={{ p: '1px', mr: '3px', flexShrink: 0 }}
                                onClick={() => addSubLineLocal(sess.id, line.id)}
                              >
                                <SubdirectoryArrowRightIcon sx={{ fontSize: 13, color: '#1565c0', opacity: 0.7 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {editActive ? (
                            <input
                              style={{ ...inputSx, textAlign: 'left', color: deductionColor }}
                              value={line.description ?? ''}
                              onChange={e => handleLineChange(sess.id, line.id, 'description', e.target.value)}
                            />
                          ) : (
                            line.description ?? ''
                          )}
                        </Box>

                        {NUM_FIELDS.map(field => (
                          <Box key={field} sx={{ ...css_lineCell, justifyContent: 'flex-end', color: deductionColor }}>
                            {editActive ? (
                              <input
                                type="number"
                                className="metraj-num-input"
                                style={{ ...inputSx, color: deductionColor }}
                                value={line[field] ?? ''}
                                onChange={e => handleLineChange(sess.id, line.id, field, e.target.value)}
                                onKeyDown={e => ['e', 'E', '+'].includes(e.key) && e.preventDefault()}
                              />
                            ) : (
                              line[field] != null ? ikiHane(line[field]) : ''
                            )}
                          </Box>
                        ))}

                        <Box sx={{
                          ...css_lineCell, justifyContent: 'flex-end', color: deductionColor,
                          textDecoration: isRevisedParent ? 'line-through' : undefined,
                        }}>
                          {ikiHane(qty)}
                          {pozBirim && !isRevisedParent && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.75rem', color: '#888' }}>{pozBirim}</Box>}
                        </Box>

                        <Box sx={{ ...css_lineCell, justifyContent: 'center', px: '2px' }}>
                          {((canEdit && sess.mode_edit) ||
                            (sess.isRevisionEdit && sess.mode_edit && line.isNew)) && (
                            <IconButton size="small" onClick={() => handleDeleteLine(sess.id, line.id)} sx={{ p: '2px' }}>
                              <DeleteOutlineIcon sx={{ fontSize: 18, color: 'salmon' }} />
                            </IconButton>
                          )}
                        </Box>

                      </Box>
                    )
                  })}

                  {/* Satır ekle (taslak düzenleme modunda) */}
                  {canEdit && sess.mode_edit && !sess.isRevisionEdit && (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', px: '6px', py: '2px',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: 'rgba(21,101,192,0.04)',
                        minWidth: 'max-content',
                      }}
                    >
                      <IconButton size="small" onClick={() => handleAddLine(sess.id)}>
                        <AddIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                      </IconButton>
                      <Typography
                        sx={{ fontSize: '0.8rem', color: '#1565c0', ml: '2px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleAddLine(sess.id)}
                      >
                        Satır Ekle
                      </Typography>
                    </Box>
                  )}

                  {/* Toplam satırı */}
                  <Box
                    sx={{
                      display: 'grid', gridTemplateColumns: GRID_COLS,
                      backgroundColor: cardColors.header,
                      borderTop: '2px solid',
                      borderColor: cardColors.border,
                      minWidth: 'max-content',
                    }}
                  >
                    <Box sx={{ gridColumn: '1 / 8', px: '8px', py: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#555' }}>
                      Toplam
                    </Box>
                    <Box sx={{ px: '8px', py: '4px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: totalQuantity < 0 ? 'red' : cardColors.totalText }}>
                      {ikiHane(totalQuantity)}
                      {pozBirim && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.8rem' }}>{pozBirim}</Box>}
                    </Box>
                    <Box />
                  </Box>

                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
