
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ClearIcon from '@mui/icons-material/Clear'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'


function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function calcMetraj(line) {
  const vals = [line.carpan, line.adet, line.boy, line.en, line.yukseklik]
    .map(v => (v != null && v !== '' ? parseFloat(v) : null))
    .filter(v => v !== null && !isNaN(v))
  if (vals.length === 0) return 0
  return vals.reduce((prod, v) => prod * v, 1)
}

function StatusChip({ status }) {
  if (status === 'ready')    return <Chip size="small" label="Onaya Hazır" sx={{ backgroundColor: '#C8E6C9', color: '#1B5E20', fontWeight: 600 }} />
  if (status === 'approved') return <Chip size="small" label="Onaylı" sx={{ backgroundColor: '#B3E5FC', color: '#01579B', fontWeight: 600 }} />
  return <Chip size="small" label={status} />
}

const GRID_COLS = '40px 1fr 70px 70px 70px 70px 70px 90px'
const NUM_FIELDS = ['carpan', 'adet', 'boy', 'en', 'yukseklik']
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
}


export default function P_MetrajOnaylaCetvel() {
  const navigate = useNavigate()
  const {
    selectedProje, selectedIsPaket, selectedPoz, selectedMahal_metraj,
  } = useContext(StoreContext)

  const { data: units = [] } = useGetPozUnits()
  const [dialogAlert, setDialogAlert] = useState()
  const [loading, setLoading] = useState(true)
  // sessions: array with UI state mixed in
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
        .select('id, status, total_quantity, created_by, creator:users!created_by(first_name, last_name)')
        .eq('work_package_poz_area_id', wpAreaId)
        .in('status', ['ready', 'approved'])
        .order('created_by')

      if (sessError) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Veri alınırken hata oluştu.', detailText: sessError.message, onCloseAction: () => setDialogAlert() })
        setLoading(false)
        return
      }

      if (!sessData?.length) { setSessions([]); setLoading(false); return }

      // Build userMap from joined creator data
      const uniqueUserIds = [...new Set(sessData.map(s => s.created_by).filter(Boolean))]
      const userMap = {}
      sessData.forEach(s => {
        if (s.created_by && s.creator && !userMap[s.created_by]) {
          userMap[s.created_by] = [s.creator.first_name, s.creator.last_name].filter(Boolean).join(' ') || '?'
        }
      })

      // Load lines for all sessions
      const sessionIds = sessData.map(s => s.id)
      const { data: linesData } = await supabase
        .from('measurement_lines')
        .select('id, session_id, sira, aciklama, carpan, adet, boy, en, yukseklik')
        .in('session_id', sessionIds)
        .order('sira')

      const linesBySession = {}
      ;(linesData ?? []).forEach(l => {
        if (!linesBySession[l.session_id]) linesBySession[l.session_id] = []
        linesBySession[l.session_id].push(l)
      })

      // approved sessions first, then ready
      const sorted = [...sessData].sort((a, b) => {
        if (a.status === b.status) return 0
        if (a.status === 'approved') return -1
        return 1
      })

      setSessions(sorted.map(sess => ({
        ...sess,
        userName: userMap[sess.created_by] ?? '?',
        lines: linesBySession[sess.id] ?? [],
        editMode: false,
        editBackup: null,
        revisedLines: {},   // lineId → { originalMetraj }
        showOriginals: true,
      })))
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
    setSessions(s => s.map(sess => sess.id === sessId ? { ...sess, status: 'approved' } : sess))
  }

  const enterEditMode = (sessId) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      return { ...sess, editMode: true, editBackup: _.cloneDeep(sess.lines) }
    }))
  }

  const cancelEdit = (sessId) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      return { ...sess, editMode: false, lines: _.cloneDeep(sess.editBackup), editBackup: null, revisedLines: {} }
    }))
  }

  const handleLineChange = (sessId, lineId, field, value) => {
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const newRevised = { ...sess.revisedLines }
      if (!newRevised[lineId]) {
        const origLine = sess.editBackup?.find(l => l.id === lineId)
        if (origLine) newRevised[lineId] = { originalMetraj: calcMetraj(origLine) }
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
    const changedLines = sess.lines.filter(l => {
      const orig = sess.editBackup?.find(b => b.id === l.id)
      if (!orig) return false
      return ['carpan', 'adet', 'boy', 'en', 'yukseklik', 'aciklama'].some(f => String(orig[f] ?? '') !== String(l[f] ?? ''))
    })
    try {
      for (const line of changedLines) {
        const { error } = await supabase
          .from('measurement_lines')
          .update({ carpan: line.carpan, adet: line.adet, boy: line.boy, en: line.en, yukseklik: line.yukseklik, aciklama: line.aciklama })
          .eq('id', line.id)
        if (error) throw error
      }
      const total = sess.lines.reduce((s, l) => s + calcMetraj(l), 0)
      const { error: updError } = await supabase
        .from('measurement_sessions').update({ total_quantity: total }).eq('id', sessId)
      if (updError) throw updError
      setSessions(s => s.map(sess2 => {
        if (sess2.id !== sessId) return sess2
        return { ...sess2, editMode: false, editBackup: null, total_quantity: total }
        // revisedLines intentionally kept to show revision history
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

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
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
          const hasRevisions = Object.keys(sess.revisedLines).length > 0
          const editTotal = sess.editMode ? sess.lines.reduce((s, l) => s + calcMetraj(l), 0) : null

          return (
            <Box
              key={sess.id}
              sx={{
                border: '1px solid',
                borderColor: sess.status === 'approved' ? '#90CAF9' : '#A5D6A7',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 1,
              }}
            >
              {/* Session başlığı */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  px: '1rem', py: '0.5rem',
                  backgroundColor: sess.status === 'approved' ? '#E3F2FD' : '#F1F8E9',
                  borderBottom: '1px solid',
                  borderColor: sess.status === 'approved' ? '#90CAF9' : '#A5D6A7',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                  {sess.userName}
                </Typography>

                <StatusChip status={sess.status} />

                {/* Revize geçmişini göster/gizle */}
                {hasRevisions && !sess.editMode && (
                  <Tooltip title={sess.showOriginals ? 'Orijinal değerleri gizle' : 'Orijinal değerleri göster'}>
                    <IconButton size="small" onClick={() => toggleShowOriginals(sess.id)}>
                      {sess.showOriginals
                        ? <VisibilityIcon sx={{ fontSize: 20, color: '#e65100' }} />
                        : <VisibilityOffIcon sx={{ fontSize: 20, color: '#888' }} />
                      }
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
                {sess.status === 'approved' && !sess.editMode && (
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
              {sess.lines.length === 0 && (
                <Box sx={{ px: '1rem', py: '0.75rem', color: 'gray', fontSize: '0.85rem' }}>
                  Bu oturumda metraj satırı bulunmuyor.
                </Box>
              )}

              {/* Satırlar tablosu */}
              {sess.lines.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>

                  {/* Tablo başlığı */}
                  <Box sx={{ ...css_lineHeader, minWidth: 'max-content' }}>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'center' }}>Sıra</Box>
                    <Box sx={{ ...css_lineHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                    {NUM_LABELS.map(lbl => (
                      <Box key={lbl} sx={{ ...css_lineHeaderCell }}>{lbl}</Box>
                    ))}
                    <Box sx={{ ...css_lineHeaderCell }}>Metraj</Box>
                  </Box>

                  {/* Satırlar */}
                  {sess.lines.map(line => {
                    const metraj = calcMetraj(line)
                    const isRevised = !!sess.revisedLines[line.id]
                    const origMetraj = sess.revisedLines[line.id]?.originalMetraj
                    const rowBg = isRevised && !sess.editMode && sess.showOriginals
                      ? 'rgba(255,160,0,0.07)'
                      : sess.editMode ? 'rgba(255,250,200,0.4)' : 'white'

                    return (
                      <Box key={line.id} sx={{ ...css_lineRow, backgroundColor: rowBg, minWidth: 'max-content' }}>

                        {/* Sıra */}
                        <Box sx={{ ...css_lineCell, justifyContent: 'center', color: '#888' }}>
                          {line.sira}
                        </Box>

                        {/* Açıklama */}
                        <Box sx={{ ...css_lineCell }}>
                          {sess.editMode ? (
                            <input
                              style={{ ...inputSx, textAlign: 'left' }}
                              value={line.aciklama ?? ''}
                              onChange={e => handleLineChange(sess.id, line.id, 'aciklama', e.target.value)}
                            />
                          ) : (
                            line.aciklama ?? ''
                          )}
                        </Box>

                        {/* Sayısal alanlar */}
                        {NUM_FIELDS.map(field => (
                          <Box key={field} sx={{ ...css_lineCell, justifyContent: 'flex-end' }}>
                            {sess.editMode ? (
                              <input
                                type="number"
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
                        <Box
                          sx={{
                            ...css_lineCell, flexDirection: 'column', alignItems: 'flex-end',
                            justifyContent: 'center', gap: '1px',
                          }}
                        >
                          <Box sx={{ fontWeight: isRevised && !sess.editMode ? 600 : 'normal' }}>
                            {ikiHane(metraj)}
                          </Box>
                          {isRevised && !sess.editMode && sess.showOriginals && (
                            <Box sx={{ fontSize: '0.7rem', color: '#e65100', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span>←</span>
                              <span>{ikiHane(origMetraj)}</span>
                            </Box>
                          )}
                        </Box>

                      </Box>
                    )
                  })}

                  {/* Toplam satırı */}
                  <Box
                    sx={{
                      display: 'grid', gridTemplateColumns: GRID_COLS,
                      backgroundColor: sess.status === 'approved' ? '#E3F2FD' : '#F1F8E9',
                      borderTop: '2px solid',
                      borderColor: sess.status === 'approved' ? '#90CAF9' : '#A5D6A7',
                      minWidth: 'max-content',
                    }}
                  >
                    <Box sx={{ gridColumn: '1 / 8', px: '8px', py: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#555' }}>
                      Toplam
                    </Box>
                    <Box sx={{ px: '8px', py: '4px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: sess.status === 'approved' ? '#01579B' : '#1B5E20' }}>
                      {ikiHane(sess.editMode ? editTotal : sess.total_quantity)}
                      {pozBirim && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.8rem' }}>{pozBirim}</Box>}
                    </Box>
                  </Box>

                  {/* Revize notu */}
                  {hasRevisions && !sess.editMode && sess.showOriginals && (
                    <Box sx={{ px: '8px', py: '4px', fontSize: '0.72rem', color: '#e65100', backgroundColor: 'rgba(255,160,0,0.06)' }}>
                      ← işareti: orijinal değer (revize edilmiş satırlar turuncu arka planla gösterilmektedir)
                    </Box>
                  )}

                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
