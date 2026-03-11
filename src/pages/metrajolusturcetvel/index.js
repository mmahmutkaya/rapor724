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


function computeQuantity(line) {
  if (!line || line.line_type !== 'data') return 0
  const isEmpty = (val) => val === null || val === undefined || val === ''
  const allEmpty = [line.multiplier, line.count, line.length, line.width, line.height].every(isEmpty)
  if (allEmpty) return 0
  const v = (val) => isEmpty(val) ? 1 : Number(val)
  const qty = v(line.multiplier) * v(line.count) * v(line.length) * v(line.width) * v(line.height)
  return isNaN(qty) ? 0 : qty
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
  const [session, setSession] = useState(null)
  const [lines, setLines] = useState([])
  const [linesBackup, setLinesBackup] = useState([])
  const [mode_edit, setMode_edit] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)

  const wpAreaId = selectedMahal?.wpAreaId

  const navGuard = (path) => {
    if (isChanged) { setPendingNav(path); setShowCancelConfirm(true) }
    else navigate(path)
  }

  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) { navigate('/metrajolustur'); return }
    if (!selectedPoz) { navigate('/metrajolusturpozlar'); return }
    if (!wpAreaId) { navigate('/metrajolusturpozmahaller'); return }
  }, [])

  useEffect(() => {
    if (!wpAreaId) return
    setLoading(true)
    ;(async () => {
      try {
        let sessionData = null

        if (selectedMahal?.sessionId) {
          const { data, error } = await supabase
            .from('measurement_sessions')
            .select('*')
            .eq('id', selectedMahal.sessionId)
            .single()
          if (error) throw error
          sessionData = data
        } else {
          let query = supabase
            .from('measurement_sessions')
            .select('*')
            .eq('work_package_poz_area_id', wpAreaId)
            .in('status', ['draft', 'ready'])
            .order('updated_at', { ascending: false })
            .limit(1)
          if (appUser?.id) query = query.eq('created_by', appUser.id)
          const { data, error } = await query.maybeSingle()
          if (error) throw error
          sessionData = data
        }

        if (sessionData) {
          const { data: lineData, error: lineError } = await supabase
            .from('measurement_lines')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('order_index')
          if (lineError) throw lineError
          const ls = lineData ?? []
          setSession(sessionData)
          setLines(ls)
          setLinesBackup(_.cloneDeep(ls))
        } else {
          setSession(null)
          setLines([])
          setLinesBackup([])
        }
      } catch (err) {
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [wpAreaId, selectedMahal?.sessionId])

  const handleAddLine = async () => {
    let currentSession = session
    if (!currentSession) {
      try {
        const { data, error } = await supabase
          .from('measurement_sessions')
          .insert({ work_package_poz_area_id: wpAreaId, status: 'draft', total_quantity: 0, created_by: appUser?.id ?? null })
          .select()
          .single()
        if (error) throw error
        currentSession = data
        setSession(data)
        setMode_edit(true)
      } catch (err) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        return
      }
    }
    const nextIdx = lines.length > 0 ? Math.max(...lines.map(l => l.order_index)) + 1 : 0
    try {
      const { data, error } = await supabase
        .from('measurement_lines')
        .insert({ session_id: currentSession.id, line_type: 'data', description: '', order_index: nextIdx })
        .select()
        .single()
      if (error) throw error
      const newLine = { ...data, multiplier: null }
      setLines(prev => [...prev, newLine])
      setLinesBackup(prev => [...prev, _.cloneDeep(newLine)])
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleDeleteLine = async (lineId) => {
    try {
      const { error } = await supabase.from('measurement_lines').delete().eq('id', lineId)
      if (error) throw error
      setLines(prev => prev.filter(l => l.id !== lineId))
      setLinesBackup(prev => prev.filter(l => l.id !== lineId))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleLineChange = (lineId, field, value) => {
    setIsChanged(true)
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, [field]: value } : l))
  }

  const handleSave = async () => {
    try {
      for (const line of lines) {
        const backup = linesBackup.find(b => b.id === line.id)
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
      const total = lines.reduce((sum, l) => sum + computeQuantity(l), 0)
      await supabase
        .from('measurement_sessions')
        .update({ total_quantity: total, updated_at: new Date().toISOString() })
        .eq('id', session.id)
      setSession(prev => ({ ...prev, total_quantity: total }))
      setLinesBackup(_.cloneDeep(lines))
      setIsChanged(false)
      setMode_edit(false)
      if (pendingNav) {
        const dest = pendingNav
        setPendingNav(null)
        setShowCancelConfirm(false)
        navigate(dest)
      }
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleCancel = () => {
    if (isChanged) { setShowCancelConfirm(true) }
    else { setMode_edit(false) }
  }

  const handleMarkReady = () => {
    setDialogAlert({
      dialogIcon: 'info',
      dialogMessage: 'Metraj hazırlama onay için gönderilsin mi?',
      actionText1: 'Evet, Gönder',
      action1: async () => {
        setDialogAlert()
        try {
          const total = lines.reduce((sum, l) => sum + computeQuantity(l), 0)
          const { error } = await supabase
            .from('measurement_sessions')
            .update({ status: 'ready', total_quantity: total, updated_at: new Date().toISOString() })
            .eq('id', session.id)
          if (error) throw error
          setSession(prev => ({ ...prev, status: 'ready', total_quantity: total }))
        } catch (err) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        }
      },
      onCloseAction: () => setDialogAlert(),
    })
  }

  const handleBackToDraft = async () => {
    try {
      const { error } = await supabase
        .from('measurement_sessions')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', session.id)
      if (error) throw error
      setSession(prev => ({ ...prev, status: 'draft' }))
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleApprove = () => {
    setDialogAlert({
      dialogIcon: 'info',
      dialogMessage: 'Bu metraj onaylanarak kesinleştirilsin mi?',
      actionText1: 'Evet, Onayla',
      action1: async () => {
        setDialogAlert()
        try {
          const total = lines.reduce((sum, l) => sum + computeQuantity(l), 0)
          const { error } = await supabase
            .from('measurement_sessions')
            .update({ status: 'approved', total_quantity: total, updated_at: new Date().toISOString() })
            .eq('id', session.id)
          if (error) throw error
          setSession(prev => ({ ...prev, status: 'approved', total_quantity: total }))
        } catch (err) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
        }
      },
      onCloseAction: () => setDialogAlert(),
    })
  }

  const handleRevise = () => {
    setDialogAlert({
      dialogIcon: 'warning',
      dialogMessage: 'Onaylanan metraj düzenleme için taslağa alınsın mı?',
      actionText1: 'Evet, Düzenle',
      action1: async () => {
        setDialogAlert()
        try {
          const { error } = await supabase
            .from('measurement_sessions')
            .update({ status: 'draft', updated_at: new Date().toISOString() })
            .eq('id', session.id)
          if (error) throw error
          setSession(prev => ({ ...prev, status: 'draft' }))
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
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + computeQuantity(l), 0), [lines])
  const isDraft   = session?.status === 'draft'
  const isReady   = session?.status === 'ready'
  const isApproved = session?.status === 'approved'

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

      {showCancelConfirm && (
        pendingNav ? (
          <DialogAlert
            dialogIcon="warning"
            dialogMessage="Kaydedilmemiş değişiklikler var. Ne yapmak istersiniz?"
            actionText1="Kaydet ve Çık"
            action1={() => { setShowCancelConfirm(false); handleSave() }}
            actionText2="Kaydetmeden Çık"
            action2={() => {
              const dest = pendingNav
              setPendingNav(null)
              setLines(_.cloneDeep(linesBackup))
              setIsChanged(false)
              setMode_edit(false)
              setShowCancelConfirm(false)
              navigate(dest)
            }}
            onCloseAction={() => { setShowCancelConfirm(false); setPendingNav(null) }}
          />
        ) : (
          <DialogAlert
            dialogIcon="warning"
            dialogMessage="Yaptığınız değişiklikler iptal edilsin mi?"
            actionText1="İptal Et"
            action1={() => {
              setLines(_.cloneDeep(linesBackup))
              setIsChanged(false)
              setMode_edit(false)
              setShowCancelConfirm(false)
            }}
            onCloseAction={() => setShowCancelConfirm(false)}
          />
        )
      )}

      {/* BAŞLIK — sadece navigasyon */}
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

      {!loading && !loadError && !session && (
        <Box sx={{ p: '1rem' }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              px: '6px', py: '4px', cursor: 'pointer', width: 'fit-content',
            }}
            onClick={handleAddLine}
          >
            <AddIcon sx={{ fontSize: 20, color: '#1565c0' }} />
            <Typography sx={{ fontSize: '0.85rem', color: '#1565c0' }}>Satır Ekle</Typography>
          </Box>
        </Box>
      )}

      {/* SESSION KARTI */}
      {!loading && !loadError && session && (
        <Box sx={{ p: '1rem', maxWidth: '900px' }}>
          <Box
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
                Metraj
              </Typography>

              <StatusChip status={session.status} />

              {isDraft && !mode_edit && !isChanged && (
                <>
                  <Tooltip title="Düzenle">
                    <IconButton size="small" onClick={() => setMode_edit(true)}>
                      <EditIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                  {lines.length > 0 && (
                    <Tooltip title="Onaya Gönder">
                      <IconButton size="small" onClick={handleMarkReady}>
                        <CheckCircleIcon sx={{ fontSize: 24, color: '#2e7d32' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}

              {isDraft && mode_edit && !isChanged && (
                <Tooltip title="Düzenlemeyi Bitir">
                  <IconButton size="small" onClick={() => setMode_edit(false)}>
                    <ClearIcon sx={{ color: '#888', fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}

              {isChanged && (
                <>
                  <Tooltip title="İptal">
                    <IconButton size="small" onClick={handleCancel}>
                      <ClearIcon sx={{ color: '#c62828', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Kaydet">
                    <IconButton size="small" onClick={handleSave}>
                      <SaveIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {isReady && (
                <>
                  <Tooltip title="Taslağa geri al">
                    <IconButton size="small" onClick={handleBackToDraft}>
                      <ReplyIcon sx={{ color: 'orange', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Onayla">
                    <IconButton size="small" onClick={handleApprove}>
                      <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {isApproved && (
                <Tooltip title="Düzenle (Revize)">
                  <IconButton size="small" onClick={handleRevise}>
                    <EditIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Satır yok */}
            {lines.length === 0 && !mode_edit && (
              <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                Bu oturumda metraj satırı bulunmuyor.
              </Box>
            )}

            {/* Tablo */}
            {(lines.length > 0 || mode_edit) && (
              <Box sx={{ overflowX: 'auto' }}>

                {/* Tablo başlığı */}
                <Box sx={{ ...css_lineHeader, minWidth: 'max-content' }}>
                  <Box sx={{ ...css_lineHeaderCell, justifyContent: 'center' }}>Sıra</Box>
                  <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                  {NUM_LABELS.map(lbl => (
                    <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>
                  ))}
                  <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                  <Box sx={{ ...css_lineHeaderCell }}></Box>
                </Box>

                {/* Satırlar */}
                {lines.map((line, index) => {
                  const qty = computeQuantity(line)
                  const isDeduction = qty < 0
                  const rowBg = isApproved
                    ? 'rgba(179,229,252,0.35)'
                    : isReady
                    ? 'rgba(200,230,200,0.3)'
                    : mode_edit ? 'rgba(255,250,200,0.4)' : 'white'
                  const deductionColor = isDeduction ? '#b71c1c' : undefined

                  return (
                    <Box key={line.id} sx={{ ...css_lineRow, backgroundColor: rowBg, minWidth: 'max-content' }}>

                      <Box sx={{ ...css_lineCell, justifyContent: 'center', color: '#888' }}>
                        {index + 1}
                      </Box>

                      <Box sx={{ ...css_lineCell, color: deductionColor }}>
                        {mode_edit && isDraft ? (
                          <input
                            style={{ ...inputSx, textAlign: 'left', color: deductionColor }}
                            value={line.description ?? ''}
                            onChange={e => handleLineChange(line.id, 'description', e.target.value)}
                          />
                        ) : (
                          line.description ?? ''
                        )}
                      </Box>

                      {NUM_FIELDS.map(field => (
                        <Box key={field} sx={{ ...css_lineCell, justifyContent: 'flex-end', color: deductionColor }}>
                          {mode_edit && isDraft ? (
                            <input
                              type="number"
                              className="metraj-num-input"
                              style={{ ...inputSx, color: deductionColor }}
                              value={line[field] ?? ''}
                              onChange={e => handleLineChange(line.id, field, e.target.value)}
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
                        {mode_edit && isDraft && (
                          <IconButton size="small" onClick={() => handleDeleteLine(line.id)} sx={{ p: '2px' }}>
                            <DeleteOutlineIcon sx={{ fontSize: 18, color: 'salmon' }} />
                          </IconButton>
                        )}
                      </Box>

                    </Box>
                  )
                })}

                {/* Satır ekle butonu (edit modunda) */}
                {isDraft && mode_edit && (
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', px: '6px', py: '2px',
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: 'rgba(21,101,192,0.04)',
                      minWidth: 'max-content',
                    }}
                  >
                    <IconButton size="small" onClick={handleAddLine}>
                      <AddIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                    </IconButton>
                    <Typography
                      sx={{ fontSize: '0.8rem', color: '#1565c0', ml: '2px', cursor: 'pointer', userSelect: 'none' }}
                      onClick={handleAddLine}
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
        </Box>
      )}
    </Box>
  )
}
