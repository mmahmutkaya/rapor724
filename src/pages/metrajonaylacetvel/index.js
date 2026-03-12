
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AddIcon from '@mui/icons-material/Add'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function calcMetraj(line) {
  const vals = [line.multiplier, line.count, line.length, line.width, line.height]
    .map(v => (v != null && v !== '' ? parseFloat(v) : null))
    .filter(v => v !== null && !isNaN(v))
  if (vals.length === 0) return 0
  return vals.reduce((prod, v) => prod * v, 1)
}

function StatusChip({ session }) {
  const visual = getMeasurementVisualStatus(session)
  if (visual === 'unread') return <Chip size="small" label="Henüz Okunmamış" sx={getMeasurementChipStyle(session)} />
  if (visual === 'approved') return <Chip size="small" label="Onaylanmış" sx={getMeasurementChipStyle(session)} />
  if (visual === 'revised') return <Chip size="small" label="Onay Sonrası Revize" sx={getMeasurementChipStyle(session)} />
  if (visual === 'rejected') return <Chip size="small" label="Reddedilmiş" sx={getMeasurementChipStyle(session)} />
  if ((session?.status ?? '') === 'draft') return <Chip size="small" label="Taslak" sx={getMeasurementChipStyle(session)} />
  return <Chip size="small" label="Görüldü" sx={getMeasurementChipStyle(session)} />
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

const getGridCols = (siraWidth) => `${siraWidth}px 1fr 70px 70px 70px 70px 70px 90px 36px`
const GRID_COLS = getGridCols(44)   // varsayılan (header için)
const NUM_FIELDS = ['multiplier', 'count', 'length', 'width', 'height']
const NUM_LABELS = ['Çarpan', 'Adet', 'Boy', 'En', 'Yükseklik']

const css_lineHeader = {
  display: 'grid', gridTemplateColumns: GRID_COLS,
  backgroundColor: '#415a77', color: '#e0e1dd',
  fontSize: '0.75rem', fontWeight: 600,
}
const css_lineHeaderCell = {
  px: '4px', py: '3px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
}
const css_lineRow = {
  display: 'grid', gridTemplateColumns: GRID_COLS,
  borderBottom: '1px solid #e0e0e0',
  '&:hover': { backgroundColor: '#fafafa' },
}
const css_lineCell = {
  px: '4px', py: '3px',
  fontSize: '0.85rem',
  display: 'flex', alignItems: 'center',
  borderRight: '1px solid #eeeeee',
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
  return { border: '#B0BEC5', header: '#ECEFF1', row: 'rgba(236,239,241,0.3)', totalText: '#455A64' }
}


export default function P_MetrajOnaylaCetvel() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, selectedPoz, selectedMahal_metraj,
  } = useContext(StoreContext)

  const { data: units = [] } = useGetPozUnits()
  const [dialogAlert, setDialogAlert] = useState()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])

  const wpAreaId = selectedMahal_metraj?.wpAreaId

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])
  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) { navigate('/metrajonayla'); return }
    if (!selectedPoz) { navigate('/metrajonaylapozlar'); return }
    if (!wpAreaId) { navigate('/metrajonaylapozmahaller'); return }
  }, [])

  useEffect(() => {
    if (!wpAreaId) return
    setLoading(true)
    ;(async () => {
      const { data: sessData, error: sessError } = await supabase
        .from('measurement_sessions')
        .select('id, status, total_quantity, created_by, revision_snapshot')
        .eq('work_package_poz_area_id', wpAreaId)
        .in('status', ['draft', 'ready', 'seen', 'approved', 'revised', 'rejected', 'revise_requested'])
        .order('created_by')

      if (sessError) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Veri alınırken hata oluştu.', detailText: sessError.message, onCloseAction: () => setDialogAlert() })
        setLoading(false)
        return
      }

      if (!sessData?.length) { setSessions([]); setLoading(false); return }

      const uniqueUserIds = [...new Set(sessData.map(s => s.created_by).filter(Boolean))]
      const userMap = {}
      if (uniqueUserIds.length > 0) {
        const { data: nameRows } = await supabase
          .rpc('get_user_display_names', { user_ids: uniqueUserIds })
        if (nameRows) {
          nameRows.forEach(row => { userMap[row.id] = row.display_name || row.id })
        }
      }

      const sessionIds = sessData.map(s => s.id)
      const { data: linesData } = await supabase
        .from('measurement_lines')
        .select('id, session_id, order_index, description, multiplier, count, length, width, height, parent_line_id')
        .in('session_id', sessionIds)
        .order('order_index')

      const linesBySession = {}
      ;(linesData ?? []).forEach(l => {
        if (!linesBySession[l.session_id]) linesBySession[l.session_id] = []
        linesBySession[l.session_id].push(l)
      })

      const sorted = [...sessData].sort((a, b) => {
        if (a.status === b.status) return 0
        if (a.status === 'approved') return -1
        return 1
      })

      setSessions(sorted.map(sess => {
        const revisedLines = Array.isArray(sess.revision_snapshot) && sess.revision_snapshot.length > 0
          ? Object.fromEntries(sess.revision_snapshot.map(entry => [entry.id, entry]))
          : {}
        return {
          ...sess,
          visualStatus: getMeasurementVisualStatus(sess),
          userName: userMap[sess.created_by] ?? '?',
          lines: linesBySession[sess.id] ?? [],
          editMode: false,
          editBackup: null,
          revisedLines,
          showOriginals: Object.keys(revisedLines).length > 0,
        }
      }))

      setLoading(false)
    })()
  }, [wpAreaId])

  // Actions
  const handleApprove = async (sessId) => {
    const { error } = await supabase
      .from('measurement_sessions').update({ status: 'approved' }).eq('id', sessId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Onaylama sırasında hata.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const updated = { ...sess, status: 'approved' }
      return { ...updated, visualStatus: getMeasurementVisualStatus(updated) }
    }))
  }

  const handleDismiss = (sessId) => {
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: 'Bu metraj hazırlığı reddedilerek hazırlayana geri gönderilsin mi? İleride yeniden düzenleyip onaya sunabilir.',
      actionText1: 'Evet, Geri Gönder',
      action1: async () => {
        setDialogAlert()
        const { error } = await supabase
          .from('measurement_sessions')
          .update({ status: 'draft', updated_at: new Date().toISOString() })
          .eq('id', sessId)
        if (error) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Hata oluştu.', detailText: error.message, onCloseAction: () => setDialogAlert() })
          return
        }
        setSessions(s => s.filter(sess => sess.id !== sessId))
      },
      onCloseAction: () => setDialogAlert(),
    })
  }

  const enterEditMode = (sessId) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      return {
        ...sess,
        editMode: true,
        editBackup: _.cloneDeep(sess.lines),
        savedRevisedLines: { ...sess.revisedLines },
      }
    }))
  }

  const cancelEdit = (sessId) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const restored = { ...(sess.savedRevisedLines ?? {}) }
      return {
        ...sess,
        editMode: false,
        lines: _.cloneDeep(sess.editBackup),
        editBackup: null,
        savedRevisedLines: null,
        revisedLines: restored,
        showOriginals: Object.keys(restored).length > 0,
      }
    }))
  }

  const handleLineChange = (sessId, lineId, field, value) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const newRevised = { ...sess.revisedLines }
      if (!newRevised[lineId]) {
        const origLine = sess.editBackup?.find(l => l.id === lineId)
        if (origLine) newRevised[lineId] = { ...origLine, originalMetraj: calcMetraj(origLine) }
      }
      const parsed = value === '' ? null : value
      return {
        ...sess,
        revisedLines: newRevised,
        lines: sess.lines.map(l => l.id === lineId ? { ...l, [field]: parsed } : l),
      }
    }))
  }

  const saveEdit = async (sessId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    const newLines = sess.lines.filter(l => l.isNew)
    const changedLines = sess.lines.filter(l => !l.isNew).filter(l => {
      const orig = sess.editBackup?.find(b => b.id === l.id)
      if (!orig) return false
      return ['multiplier', 'count', 'length', 'width', 'height', 'description'].some(f => String(orig[f] ?? '') !== String(l[f] ?? ''))
    })
    try {
      for (const line of changedLines) {
        const { error } = await supabase
          .from('measurement_lines')
          .update({
            multiplier: (line.multiplier === '' || line.multiplier === null) ? 1 : Number(line.multiplier),
            count: line.count === '' ? null : line.count,
            length: line.length === '' ? null : line.length,
            width: line.width === '' ? null : line.width,
            height: line.height === '' ? null : line.height,
            description: line.description,
          })
          .eq('id', line.id)
        if (error) throw error
      }
      const insertedMap = {}
      for (const line of newLines) {
        const { data: inserted, error } = await supabase
          .from('measurement_lines')
          .insert({
            session_id: sessId,
            order_index: line.order_index,
            description: line.description || null,
            multiplier: (line.multiplier === '' || line.multiplier === null) ? 1 : Number(line.multiplier),
            count: line.count === '' ? null : line.count,
            length: line.length === '' ? null : line.length,
            width: line.width === '' ? null : line.width,
            height: line.height === '' ? null : line.height,
            parent_line_id: line.parent_line_id || null,
          })
          .select()
          .single()
        if (error) throw error
        insertedMap[line.id] = inserted
      }
      const savedParentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
      const total = sess.lines.filter(l => !savedParentIds.has(l.id)).reduce((s, l) => s + calcMetraj(l), 0)

      const prevSnapshot = Array.isArray(sess.revision_snapshot) ? sess.revision_snapshot : []
      const prevSnapshotMap = Object.fromEntries(prevSnapshot.map(e => [e.id, e]))
      const mergedSnapshot = { ...prevSnapshotMap, ...sess.revisedLines }
      const snapshotArray = Object.values(mergedSnapshot)

      const updatePayload = {
        total_quantity: total,
        ...(snapshotArray.length > 0 ? { revision_snapshot: snapshotArray } : {}),
      }
      const { error: updError } = await supabase
        .from('measurement_sessions').update(updatePayload).eq('id', sessId)
      if (updError) throw updError

      setSessions(s => s.map(sess2 => {
        if (sess2.id !== sessId) return sess2
        const updatedLines = sess2.lines.map(l =>
          insertedMap[l.id] ? { ...insertedMap[l.id] } : l
        )
        const newRevisedLines = { ...prevSnapshotMap, ...sess2.revisedLines }
        return {
          ...sess2,
          editMode: false,
          editBackup: null,
          savedRevisedLines: null,
          total_quantity: total,
          lines: updatedLines,
          revision_snapshot: snapshotArray,
          revisedLines: newRevisedLines,
          showOriginals: Object.keys(newRevisedLines).length > 0,
        }
      }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kaydetme sırasında hata oluştu.', detailText: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const toggleShowOriginals = (sessId) => {
    setSessions(s => s.map(sess =>
      sess.id === sessId ? { ...sess, showOriginals: !sess.showOriginals } : sess
    ))
  }

  // Mevcut bir satır için alt seviye revize satırı oluşturur (derinlik sınırı yok).
  const addNewLine = (sessId, parentId = null) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const siblings = parentId
        ? sess.lines.filter(l => l.parent_line_id === parentId)
        : sess.lines.filter(l => !l.parent_line_id)
      const maxOrder = siblings.reduce((max, l) => Math.max(max, l.order_index ?? 0), 0)
      const tempId = `new-${Date.now()}-${Math.random()}`
      return {
        ...sess,
        lines: [...sess.lines, {
          id: tempId,
          session_id: sessId,
          order_index: maxOrder + 1,
          description: '',
          multiplier: null,
          count: null,
          length: null,
          width: null,
          height: null,
          parent_line_id: parentId,
          isNew: true,
        }]
      }
    }))
  }

  const handleDeleteLine = async (sessId, lineId) => {
    const sess = sessions.find(s => s.id === sessId)
    if (!sess) return
    // Silinecek satır ve tüm torunlarını topla
    const toDelete = new Set()
    const collect = (id) => {
      toDelete.add(id)
      sess.lines.filter(l => l.parent_line_id === id).forEach(child => collect(child.id))
    }
    collect(lineId)
    // DB'de kayıtlı olanları sil
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
    setSessions(s => s.map(sess2 => sess2.id !== sessId ? sess2 : { ...sess2, lines: sess2.lines.filter(l => !toDelete.has(l.id)) }))
  }

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  return (
    <Box>
      <style>{`
        .metraj-num-input::-webkit-outer-spin-button,
        .metraj-num-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
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
        </Grid>
      </AppBar>

      {loading && <LinearProgress />}

      {!loading && sessions.length === 0 && (
        <Stack sx={{ width: '100%', p: '1rem' }}>
          <Alert severity="info">
            Bu mahal için henüz onaya hazır veya onaylanmış metraj bulunmuyor.
          </Alert>
        </Stack>
      )}

      {/* SESSION KARTLARI */}
      <Box sx={{ p: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
        {sessions.map(sess => {
          const visualStatus = sess.visualStatus ?? getMeasurementVisualStatus(sess)
          const cardColors = getCardColors(visualStatus)
          const revisedParentIds = new Set(sess.lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
          const hasRevisions = Object.keys(sess.revisedLines).length > 0 || revisedParentIds.size > 0
          const displayTree = buildDisplayTree(sess.lines)
          const leafTotal = sess.lines.filter(l => !revisedParentIds.has(l.id)).reduce((s, l) => s + calcMetraj(l), 0)
          const editTotal = sess.editMode ? leafTotal : null
          const maxSiraNoLen = displayTree.length > 0 ? Math.max(...displayTree.map(l => l.siraNo?.length ?? 1)) : 1
          const siraColWidth = Math.max(44, maxSiraNoLen * 8 + 8)
          const gridCols = getGridCols(siraColWidth)

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
              {/* Session başlığı */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  px: '1rem', py: '0.5rem',
                  backgroundColor: cardColors.header,
                  borderBottom: '1px solid',
                  borderColor: cardColors.border,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                  {sess.userName}
                </Typography>

                <Box
                  title={getMeasurementStatusLabel(sess)}
                  sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getMeasurementDotColor(sess), flexShrink: 0 }}
                />

                <StatusChip session={sess} />

                {/* Revize geçmişini göster/gizle */}
                {hasRevisions && !sess.editMode && (
                  <Tooltip title={sess.showOriginals ? 'Revize öncesini gizle' : 'Revize öncesini göster'}>
                    <IconButton size="small" onClick={() => toggleShowOriginals(sess.id)}>
                      {sess.showOriginals
                        ? <VisibilityIcon sx={{ fontSize: 20, color: '#e65100' }} />
                        : <VisibilityOffIcon sx={{ fontSize: 20, color: '#888' }} />
                      }
                    </IconButton>
                  </Tooltip>
                )}

                {/* Görüldü — hazırlayana geri gönder */}
                {sess.status === 'ready' && !sess.editMode && (
                  <Tooltip title="Görüldü — Geri Gönder (Reddet)">
                    <IconButton size="small" onClick={() => handleDismiss(sess.id)}>
                      <ReplyIcon sx={{ color: '#e65100', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Onayla */}
                {sess.status === 'ready' && !sess.editMode && (
                  <Tooltip title="Onayla">
                    <IconButton size="small" onClick={() => handleApprove(sess.id)}>
                      <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Düzenle */}
                {(sess.status === 'approved' || sess.status === 'revised') && !sess.editMode && (
                  <Tooltip title="Düzenle (Revize)">
                    <IconButton size="small" onClick={() => enterEditMode(sess.id)}>
                      <EditIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Düzenleme modunda: İptal + Kaydet */}
                {sess.editMode && (
                  <>
                    <Tooltip title="İptal">
                      <IconButton size="small" onClick={() => cancelEdit(sess.id)}>
                        <ClearIcon sx={{ color: '#c62828', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kaydet">
                      <IconButton size="small" onClick={() => saveEdit(sess.id)}>
                        <SaveIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>

              {/* Satır yok */}
              {sess.lines.length === 0 && !sess.editMode && (
                <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                  Bu oturumda metraj satırı bulunmuyor.
                </Box>
              )}

              {/* Tablo */}
              {(sess.lines.length > 0 || sess.editMode) && (
                <Box sx={{ overflowX: 'auto' }}>

                  {/* Tablo başlığı */}
                  <Box sx={{ ...css_lineHeader, gridTemplateColumns: gridCols, minWidth: 'max-content' }}>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'center' }}>Sıra</Box>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                    {NUM_LABELS.map(lbl => (
                      <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>
                    ))}
                    <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                    <Box sx={{ ...css_lineHeaderCell }}></Box>
                  </Box>

                  {/* Satırlar — ağaç düzeninde */}
                  {displayTree.flatMap(line => {
                    const metraj = calcMetraj(line)
                    const isRevised = !!sess.revisedLines[line.id]
                    const isRevisedParent = revisedParentIds.has(line.id)
                    const origData = sess.revisedLines[line.id]
                    const depthStyle = line.depth > 0
                      ? { boxShadow: `inset ${Math.min(line.depth, 3) * 3}px 0 0 rgba(144,202,249,0.7)` }
                      : {}

                    // Revize edilmiş ata satırları: edit dışında showOriginals false ise gizle
                    if (isRevisedParent && !sess.editMode && !sess.showOriginals) return []

                    const rowBg = isRevisedParent && !sess.editMode
                      ? 'rgba(191,54,12,0.06)'
                      : isRevised && !sess.editMode && sess.showOriginals
                      ? 'rgba(255,160,0,0.07)'
                      : sess.editMode ? 'rgba(255,250,200,0.4)' : 'white'

                    const mainRow = (
                      <Box
                        key={line.id}
                        sx={{ ...css_lineRow, gridTemplateColumns: gridCols, backgroundColor: rowBg, minWidth: 'max-content', ...depthStyle }}
                      >
                        {/* Sıra */}
                        <Box sx={{
                          ...css_lineCell, justifyContent: 'flex-end', pr: '4px',
                          color: isRevisedParent && !sess.editMode ? '#bf360c' : line.depth > 0 ? '#1565c0' : '#888',
                          fontSize: line.depth > 0 ? '0.78rem' : undefined,
                          opacity: isRevisedParent && !sess.editMode ? 0.6 : 1,
                        }}>
                          {line.siraNo}
                        </Box>

                        {/* Açıklama + alt satır ekle butonu (edit modunda) */}
                        <Box sx={{
                          ...css_lineCell,
                          color: isRevisedParent && !sess.editMode ? '#888' : undefined,
                          textDecoration: isRevisedParent && !sess.editMode ? 'line-through' : undefined,
                          fontStyle: isRevisedParent && !sess.editMode ? 'italic' : undefined,
                        }}>
                          {sess.editMode && !line.isNew && line.parent_line_id === null && (
                            <Tooltip title={`Revize satırı ekle → ${line.siraNo}.${sess.lines.filter(l => l.parent_line_id === line.id).length + 1}`}>
                              <IconButton
                                size="small"
                                sx={{ p: '1px', mr: '3px', flexShrink: 0 }}
                                onClick={() => addNewLine(sess.id, line.id)}
                              >
                                <SubdirectoryArrowRightIcon sx={{ fontSize: 13, color: '#1565c0', opacity: 0.7 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(sess.editMode && line.isNew) ? (
                            <input
                              style={{ ...inputSx, textAlign: 'left' }}
                              value={line.description ?? ''}
                              onChange={e => handleLineChange(sess.id, line.id, 'description', e.target.value)}
                            />
                          ) : (
                            line.description ?? ''
                          )}
                        </Box>

                        {/* Sayısal alanlar */}
                        {NUM_FIELDS.map(field => (
                          <Box key={field} sx={{
                            ...css_lineCell, justifyContent: 'flex-end',
                            color: isRevisedParent && !sess.editMode ? '#bbb' : undefined,
                          }}>
                            {(sess.editMode && line.isNew) ? (
                              <input
                                type="number"
                                className="metraj-num-input"
                                style={inputSx}
                                value={line[field] ?? ''}
                                onChange={e => handleLineChange(sess.id, line.id, field, e.target.value)}
                                onKeyDown={e => ['e', 'E', '+'].includes(e.key) && e.preventDefault()}
                              />
                            ) : (
                              line[field] != null ? line[field] : ''
                            )}
                          </Box>
                        ))}

                        {/* Metraj */}
                        <Box sx={{
                          ...css_lineCell, justifyContent: 'flex-end',
                          fontWeight: isRevised && !sess.editMode ? 600 : 'normal',
                          color: isRevisedParent && !sess.editMode ? '#bbb' : undefined,
                          textDecoration: isRevisedParent && !sess.editMode ? 'line-through' : undefined,
                        }}>
                          {ikiHane(metraj)}
                          {pozBirim && !sess.editMode && !isRevisedParent && (
                            <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.73rem', color: '#888' }}>{pozBirim}</Box>
                          )}
                        </Box>

                        {/* Aksiyon — revize satırını sil */}
                        <Box sx={{ ...css_lineCell, justifyContent: 'center', px: '2px' }}>
                          {sess.editMode && (line.isNew || line.parent_line_id !== null) && (
                            <IconButton size="small" onClick={() => handleDeleteLine(sess.id, line.id)} sx={{ p: '2px' }}>
                              <DeleteOutlineIcon sx={{ fontSize: 18, color: 'salmon' }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    )

                    // Inline "Revize Öncesi" satırı — doğrudan revize edilen satırın altında
                    const beforeRow = isRevised && !sess.editMode && sess.showOriginals ? (
                      <Box
                        key={`${line.id}-before`}
                        sx={{
                          ...css_lineRow,
                          gridTemplateColumns: gridCols,
                          backgroundColor: 'rgba(191,54,12,0.06)',
                          minWidth: 'max-content',
                          ...depthStyle,
                        }}
                      >
                        <Box sx={{ ...css_lineCell, justifyContent: 'center', color: '#bf360c', fontSize: '0.72rem', fontWeight: 700 }}>
                          ↑
                        </Box>
                        <Box sx={{ ...css_lineCell, color: '#af5b3f', fontStyle: 'italic', fontSize: '0.82rem', pl: '6px' }}>
                          {origData.description ?? ''}
                        </Box>
                        {NUM_FIELDS.map(field => (
                          <Box key={field} sx={{ ...css_lineCell, justifyContent: 'flex-end', color: '#777', fontSize: '0.82rem' }}>
                            {origData[field] != null ? origData[field] : ''}
                          </Box>
                        ))}
                        <Box sx={{ ...css_lineCell, justifyContent: 'flex-end', color: '#bf360c', fontWeight: 600, fontSize: '0.82rem' }}>
                          {ikiHane(origData.originalMetraj)}
                        </Box>
                        <Box />
                      </Box>
                    ) : null

                    return [mainRow, beforeRow].filter(Boolean)
                  })}

                  {/* Kök seviye satır ekle butonu (edit modunda) */}
                  {sess.editMode && (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', px: '6px', py: '2px',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: 'rgba(21,101,192,0.04)',
                        minWidth: 'max-content',
                      }}
                    >
                      <IconButton size="small" onClick={() => addNewLine(sess.id)}>
                        <AddIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                      </IconButton>
                      <Typography sx={{ fontSize: '0.8rem', color: '#1565c0', ml: '2px', cursor: 'pointer', userSelect: 'none' }} onClick={() => addNewLine(sess.id)}>
                        Satır Ekle
                      </Typography>
                    </Box>
                  )}

                  {/* Toplam satırı */}
                  <Box
                    sx={{
                      display: 'grid', gridTemplateColumns: gridCols,
                      backgroundColor: cardColors.header,
                      borderTop: '2px solid',
                      borderColor: cardColors.border,
                      minWidth: 'max-content',
                    }}
                  >
                    <Box sx={{ gridColumn: '1 / 8', px: '8px', py: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#555' }}>
                      Toplam
                    </Box>
                    <Box sx={{ px: '8px', py: '4px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: cardColors.totalText }}>
                      {ikiHane(sess.editMode ? editTotal : leafTotal)}
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
