import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

import { StoreContext } from '../../components/store.js'
import { supabase } from '../../lib/supabase.js'
import { useGetPozUnits } from '../../hooks/useMongo.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

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
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
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

function StatusChip({ status }) {
  if (status === 'draft')    return <Chip size="small" label="Taslak"      sx={{ backgroundColor: '#FFF9C4', color: '#F57F17', fontWeight: 600 }} />
  if (status === 'ready')    return <Chip size="small" label="Onaya Hazır" sx={{ backgroundColor: '#C8E6C9', color: '#1B5E20', fontWeight: 600 }} />
  if (status === 'approved') return <Chip size="small" label="Onaylı"      sx={{ backgroundColor: '#B3E5FC', color: '#01579B', fontWeight: 600 }} />
  return <Chip size="small" label={status ?? '—'} />
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

      setSessions(sorted.map(sess => ({
        ...sess,
        userName: userMap[sess.created_by] ?? '?',
        isOwn: sess.created_by === appUser?.id,
        lines: linesBySession[sess.id] ?? [],
        linesBackup: _.cloneDeep(linesBySession[sess.id] ?? []),
        mode_edit: false,
        isChanged: false,
      })))
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
  // parentId: null → kök satır, string → alt satır
  const handleAddLine = async (sessId, parentId = null) => {
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
    try {
      const { error } = await supabase.from('measurement_lines').delete().eq('id', lineId)
      if (error) throw error
      updateSess(sessId, s => ({
        lines: s.lines.filter(l => l.id !== lineId),
        linesBackup: s.linesBackup.filter(l => l.id !== lineId),
      }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleLineChange = (sessId, lineId, field, value) => {
    updateSess(sessId, s => ({
      isChanged: true,
      lines: s.lines.map(l => l.id === lineId ? { ...l, [field]: value } : l),
    }))
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
      const total = sess.lines.reduce((sum, l) => sum + computeQuantity(l), 0)
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
        const total = sess.lines.reduce((sum, l) => sum + computeQuantity(l), 0)
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

  // ── Onaylı metrajı kopyalayarak revize teklifi oluştur ──────
  const handleStartRevision = (sourceSessionId) => {
    const myExisting = sessions.find(s => s.isOwn && s.status !== 'approved')
    if (myExisting) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Zaten devam eden bir metraj oturumunuz var. Önce mevcut oturumunuzu tamamlayın.',
        onCloseAction: () => setDialogAlert(),
      })
      return
    }

    const sourceSess = sessions.find(s => s.id === sourceSessionId)
    if (!sourceSess) return

    setDialogAlert({
      dialogIcon: 'info',
      dialogMessage: 'Onaylanan metraj kopyalanarak revize teklifi oluşturulsun mu? Kopyayı düzenleyip onaya sunabilirsiniz.',
      actionText1: 'Evet, Revize Başlat',
      action1: async () => {
        setDialogAlert()
        try {
          const { data: newSess, error: sessErr } = await supabase
            .from('measurement_sessions')
            .insert({
              work_package_poz_area_id: wpAreaId,
              status: 'draft',
              total_quantity: sourceSess.total_quantity,
              created_by: appUser?.id ?? null,
            })
            .select().single()
          if (sessErr) throw sessErr

          let newLines = []
          if (sourceSess.lines.length > 0) {
            const linesToCopy = sourceSess.lines.map(l => ({
              session_id: newSess.id,
              order_index: l.order_index,
              description: l.description,
              multiplier: l.multiplier,
              count: l.count,
              length: l.length,
              width: l.width,
              height: l.height,
              line_type: l.line_type ?? 'data',
              parent_line_id: null,   // kopyada hiyerarşi sıfırlanır; kullanıcı yeniden düzenler
            }))
            const { data: inserted, error: linesErr } = await supabase
              .from('measurement_lines')
              .insert(linesToCopy)
              .select()
            if (linesErr) throw linesErr
            newLines = inserted ?? []
          }

          setSessions(prev => [
            ...prev,
            {
              ...newSess,
              userName: appUser?.email ?? '?',
              isOwn: true,
              lines: newLines,
              linesBackup: _.cloneDeep(newLines),
              mode_edit: true,
              isChanged: false,
            },
          ].sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)))
        } catch (err) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        }
      },
      onCloseAction: () => setDialogAlert(),
    })
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

  const hasMyActiveSess = sessions.some(s => s.isOwn && s.status !== 'approved')

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
          const isDraft    = sess.status === 'draft'
          const isReady    = sess.status === 'ready'
          const isApproved = sess.status === 'approved'
          const canEdit    = sess.isOwn && isDraft
          const totalQuantity = sess.lines.reduce((sum, l) => sum + computeQuantity(l), 0)

          return (
            <Box
              key={sess.id}
              sx={{
                border: '1px solid',
                borderColor: isApproved ? '#90CAF9' : isReady ? '#A5D6A7' : '#ddd',
                overflow: 'hidden',
                boxShadow: 1,
              }}
            >
              {/* Kart başlığı */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  px: '1rem', height: '50px',
                  backgroundColor: isApproved ? '#E3F2FD' : isReady ? '#F1F8E9' : '#e0e0e0',
                  borderBottom: '1px solid',
                  borderColor: isApproved ? '#90CAF9' : isReady ? '#A5D6A7' : '#ddd',
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

                <StatusChip status={sess.status} />

                {/* Onaylı oturum için: Revize Teklifi Başlat */}
                {isApproved && !hasMyActiveSess && (
                  <Tooltip title="Bu onaylı metrajı kopyalayarak revize teklifi oluştur">
                    <IconButton size="small" onClick={() => handleStartRevision(sess.id)}>
                      <ContentCopyIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                    </IconButton>
                  </Tooltip>
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

                {/* Düzenleme modu — değişiklik yoksa bitir */}
                {isDraft && sess.isOwn && sess.mode_edit && !sess.isChanged && (
                  <Tooltip title="Düzenlemeyi Bitir">
                    <IconButton size="small" onClick={() => updateSess(sess.id, () => ({ mode_edit: false }))}>
                      <ClearIcon sx={{ color: '#888', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Değişiklik varsa — iptal / kaydet */}
                {sess.isChanged && (
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
              </Box>

              {/* Satır yok */}
              {sess.lines.length === 0 && !sess.mode_edit && (
                <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                  Bu oturumda metraj satırı bulunmuyor.
                </Box>
              )}

              {/* Tablo */}
              {(sess.lines.length > 0 || (canEdit && sess.mode_edit)) && (
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
                    const isDeduction = qty < 0
                    const rowBg = isApproved
                      ? 'rgba(179,229,252,0.35)'
                      : isReady
                      ? 'rgba(200,230,200,0.3)'
                      : sess.mode_edit ? 'rgba(255,250,200,0.4)' : 'white'
                    const deductionColor = isDeduction ? '#b71c1c' : undefined
                    const editActive = canEdit && sess.mode_edit
                    const depthStyle = line.depth > 0
                      ? { borderLeft: `${Math.min(line.depth, 3) * 3}px solid rgba(144,202,249,0.7)` }
                      : {}

                    return (
                      <Box key={line.id} sx={{ ...css_lineRow, backgroundColor: rowBg, minWidth: 'max-content', ...depthStyle }}>

                        <Box sx={{
                          ...css_lineCell, justifyContent: 'flex-end', pr: '4px',
                          color: line.depth > 0 ? '#1565c0' : '#888',
                          fontSize: line.depth > 0 ? '0.78rem' : undefined,
                        }}>
                          {line.siraNo}
                        </Box>

                        <Box sx={{ ...css_lineCell, color: deductionColor }}>
                          {editActive && (
                            <Tooltip title={`Alt satır ekle (${line.siraNo}.1…)`}>
                              <IconButton size="small" sx={{ p: '1px', mr: '3px', flexShrink: 0 }} onClick={() => handleAddLine(sess.id, line.id)}>
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

                        <Box sx={{ ...css_lineCell, justifyContent: 'flex-end', color: deductionColor }}>
                          {ikiHane(qty)}
                          {pozBirim && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.75rem', color: '#888' }}>{pozBirim}</Box>}
                        </Box>

                        <Box sx={{ ...css_lineCell, justifyContent: 'center', px: '2px' }}>
                          {editActive && (
                            <IconButton size="small" onClick={() => handleDeleteLine(sess.id, line.id)} sx={{ p: '2px' }}>
                              <DeleteOutlineIcon sx={{ fontSize: 18, color: 'salmon' }} />
                            </IconButton>
                          )}
                        </Box>

                      </Box>
                    )
                  })}

                  {/* Satır ekle (düzenleme modunda) */}
                  {canEdit && sess.mode_edit && (
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
                      backgroundColor: isApproved ? '#E3F2FD' : isReady ? '#F1F8E9' : '#e0e0e0',
                      borderTop: '2px solid',
                      borderColor: isApproved ? '#90CAF9' : isReady ? '#A5D6A7' : '#ddd',
                      minWidth: 'max-content',
                    }}
                  >
                    <Box sx={{ gridColumn: '1 / 8', px: '8px', py: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#555' }}>
                      Toplam
                    </Box>
                    <Box sx={{ px: '8px', py: '4px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: totalQuantity < 0 ? 'red' : isApproved ? '#01579B' : '#1B5E20' }}>
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
