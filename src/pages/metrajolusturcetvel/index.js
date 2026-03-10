import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

import { StoreContext } from '../../components/store.js'
import { supabase } from '../../lib/supabase.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'
import { useGetPozUnits } from '../../hooks/useMongo.js'

import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Input from '@mui/material/Input'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'


function computeQuantity(line) {
  if (!line || line.line_type !== 'data') return 0
  const isEmpty = (val) => val === null || val === undefined || val === ''
  const allEmpty = [line.multiplier, line.count, line.length, line.width, line.height].every(isEmpty)
  if (allEmpty) return 0
  const v = (val) => isEmpty(val) ? 1 : Number(val)
  const mult = v(line.multiplier)
  const cnt  = v(line.count)
  const len  = v(line.length)
  const wid  = v(line.width)
  const hei  = v(line.height)
  const qty  = mult * cnt * len * wid * hei
  return isNaN(qty) ? 0 : qty
}

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}


export default function P_MetrajOlusturCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal } = useContext(StoreContext)
  const { data: units = [] } = useGetPozUnits()

  const [session, setSession] = useState(null)
  const [lines, setLines] = useState([])
  const [linesBackup, setLinesBackup] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [mode_edit, setMode_edit] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // wpAreaId is stored in selectedMahal when building mahaller list
  const wpAreaId = selectedMahal?.wpAreaId

  // Guards
  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) navigate('/metrajolustur')
    else if (!selectedPoz) navigate('/metrajolusturpozlar')
    else if (!selectedMahal) navigate('/metrajolusturpozmahaller')
  }, [selectedProje, selectedIsPaket, selectedPoz, selectedMahal, navigate])

  // Load session and lines
  useEffect(() => {
    if (!wpAreaId) return
    loadData()
  }, [wpAreaId])

  const loadData = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('measurement_sessions')
        .select('*')
        .eq('work_package_poz_area_id', wpAreaId)
        .in('status', ['draft', 'ready'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sessionError) throw sessionError

      if (sessionData) {
        const { data: lineData, error: lineError } = await supabase
          .from('measurement_lines')
          .select('*')
          .eq('session_id', sessionData.id)
          .order('order_index')

        if (lineError) throw lineError

        const ls = (lineData ?? []).map(l => {
          const noDimensions = l.count == null && l.length == null && l.width == null && l.height == null
          if (l.multiplier === 1 && noDimensions) return { ...l, multiplier: null }
          return l
        })

        const computedTotal = ls.reduce((sum, l) => sum + computeQuantity(l), 0)
        if (sessionData.total_quantity !== computedTotal) {
          await supabase
            .from('measurement_sessions')
            .update({ total_quantity: computedTotal })
            .eq('id', sessionData.id)
          setSession({ ...sessionData, total_quantity: computedTotal })
        } else {
          setSession(sessionData)
        }

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
      setIsLoading(false)
    }
  }

  const handleStartSession = async () => {
    try {
      const { data, error } = await supabase
        .from('measurement_sessions')
        .insert({ work_package_poz_area_id: wpAreaId, status: 'draft', total_quantity: 0 })
        .select()
        .single()

      if (error) throw error

      setSession(data)
      setLines([])
      setLinesBackup([])
      setMode_edit(true)
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleAddLine = async () => {
    if (!session) return
    const nextIdx = lines.length > 0 ? Math.max(...lines.map(l => l.order_index)) + 1 : 0
    try {
      const { data, error } = await supabase
        .from('measurement_lines')
        .insert({ session_id: session.id, line_type: 'data', description: '', order_index: nextIdx })
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
      const { error } = await supabase
        .from('measurement_lines')
        .delete()
        .eq('id', lineId)

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
            multiplier: (line.multiplier === '' || line.multiplier === null) ? 1 : line.multiplier,
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
    } catch (err) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: err.message, onCloseAction: () => setDialogAlert() })
    }
  }

  const handleCancel = () => {
    if (isChanged) {
      setShowCancelConfirm(true)
    } else {
      setMode_edit(false)
    }
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

  const unitsMap = useMemo(() => {
    const m = {}
    units.forEach(u => { m[u.id] = u.name })
    return m
  }, [units])

  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? '—'
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + computeQuantity(l), 0), [lines])
  const isDraft = session?.status === 'draft'
  const isReady = session?.status === 'ready'

  const headerIconButton_sx = { width: 40, height: 40 }
  const headerIcon_sx = { fontSize: 24 }

  const css_baslik = {
    px: '0.3rem',
    border: '1px solid black',
    backgroundColor: 'lightgray',
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    mb: '1rem',
  }

  const css_satir = {
    px: '0.3rem',
    border: '1px solid black',
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
  }

  const gridCols = 'max-content minmax(10rem, 3fr) repeat(5, minmax(4rem, 1fr)) minmax(5rem, 1fr) max-content max-content'


  return (
    <>
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
        <DialogAlert
          dialogIcon="warning"
          dialogMessage="Yaptığınız değişiklikler kaybolacak. Devam edilsin mi?"
          actionText1="İptal Et"
          action1={() => {
            setLines(_.cloneDeep(linesBackup))
            setIsChanged(false)
            setMode_edit(false)
            setShowCancelConfirm(false)
          }}
          onCloseAction={() => setShowCancelConfirm(false)}
        />
      )}

      {/* BAŞLIK */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: '0.5rem 1rem', minHeight: '3.5rem', maxHeight: '5rem' }}
        >
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <IconButton sx={headerIconButton_sx} onClick={() => navigate('/metrajolusturpozmahaller')}>
                <ReplyIcon sx={{ ...headerIcon_sx, color: 'gray' }} />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, opacity: 0.5, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajolusturpozlar')}
              >
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 16, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, opacity: 0.5, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '10rem', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajolusturpozmahaller')}
              >
                {selectedPoz?.code ? `${selectedPoz.code} · ${selectedPoz.short_desc}` : selectedPoz?.short_desc}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 16, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {selectedMahal?.code ? `${selectedMahal.code} · ${selectedMahal.name}` : selectedMahal?.name}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {session && isDraft && !mode_edit && !isChanged && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={() => setMode_edit(true)}>
                    <EditIcon sx={{ ...headerIcon_sx, color: 'gray' }} />
                  </IconButton>
                  {lines.length > 0 && (
                    <IconButton sx={headerIconButton_sx} onClick={handleMarkReady}>
                      <CheckCircleIcon sx={{ ...headerIcon_sx, color: 'gray' }} />
                    </IconButton>
                  )}
                </>
              )}
              {session && isDraft && mode_edit && !isChanged && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={() => setMode_edit(false)}>
                    <ClearOutlinedIcon sx={{ ...headerIcon_sx, color: 'gray' }} />
                  </IconButton>
                </>
              )}
              {session && isDraft && mode_edit && (
                <IconButton sx={headerIconButton_sx} onClick={handleAddLine}>
                  <AddCircleOutlineIcon sx={{ ...headerIcon_sx, color: 'green' }} />
                </IconButton>
              )}
              {isChanged && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={handleCancel}>
                    <ClearOutlinedIcon sx={{ ...headerIcon_sx, color: 'red' }} />
                  </IconButton>
                  <IconButton sx={headerIconButton_sx} onClick={handleSave}>
                    <SaveIcon sx={headerIcon_sx} />
                  </IconButton>
                </>
              )}
              {session && isReady && (
                <IconButton sx={headerIconButton_sx} onClick={handleBackToDraft} title="Taslağa geri al">
                  <ReplyIcon sx={{ ...headerIcon_sx, color: 'orange' }} />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {isLoading && <LinearProgress />}

      {loadError && (
        <Alert severity="error" sx={{ m: '1rem' }}>
          Veri alınırken hata: {loadError}
        </Alert>
      )}

      {/* Metraj başlat */}
      {!isLoading && !loadError && !session && (
        <Box sx={{ p: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Typography variant="body1" sx={{ color: 'gray' }}>
            Bu mahal için henüz metraj başlatılmamış.
          </Typography>
          <IconButton onClick={handleStartSession} sx={{ flexDirection: 'column', borderRadius: 2 }}>
            <PlayCircleOutlineIcon sx={{ fontSize: 48, color: 'green' }} />
            <Typography variant="caption">Metraj Başlat</Typography>
          </IconButton>
        </Box>
      )}

      {/* Boş draft */}
      {!isLoading && !loadError && session && isDraft && lines.length === 0 && (
        <Box sx={{ p: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Typography variant="body1" sx={{ color: 'gray' }}>
            Henüz metraj satırı eklenmemiş.
          </Typography>
          <IconButton onClick={handleAddLine} sx={{ flexDirection: 'column', borderRadius: 2 }}>
            <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'green' }} />
            <Typography variant="caption">İlk Satırı Ekle</Typography>
          </IconButton>
        </Box>
      )}

      {/* Cetvel */}
      {!isLoading && !loadError && session && lines.length > 0 && (
        <Box sx={{ p: '0.5rem 1rem', overflowX: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, width: 'fit-content', minWidth: '50rem' }}>

            {/* Başlık satırı */}
            <Box sx={{ ...css_baslik }}>Sıra</Box>
            <Box sx={{ ...css_baslik, justifyContent: 'start' }}>Açıklama</Box>
            <Box sx={{ ...css_baslik }}>Çarpan</Box>
            <Box sx={{ ...css_baslik }}>Adet</Box>
            <Box sx={{ ...css_baslik }}>Boy</Box>
            <Box sx={{ ...css_baslik }}>En</Box>
            <Box sx={{ ...css_baslik }}>Yük.</Box>
            <Box sx={{ ...css_baslik }}>Metraj</Box>
            <Box sx={{ ...css_baslik }}>Birim</Box>
            <Box sx={{ ...css_baslik }}></Box>

            {/* Toplam satırı */}
            <Box sx={{ ...css_baslik, gridColumn: '1/8', justifyContent: 'end', pr: '0.5rem', backgroundColor: 'rgba(253,197,123,0.6)' }}>
              Toplam Metraj
            </Box>
            <Box sx={{ ...css_baslik, justifyContent: 'end', pr: '0.3rem', backgroundColor: 'rgba(253,197,123,0.6)', color: totalQuantity < 0 ? 'red' : null }}>
              {ikiHane(totalQuantity)}
            </Box>
            <Box sx={{ ...css_baslik, backgroundColor: 'rgba(253,197,123,0.6)' }}>{pozBirim}</Box>
            <Box sx={{ ...css_baslik, backgroundColor: 'rgba(253,197,123,0.6)' }}></Box>

            {/* Veri satırları */}
            {lines.map((line, index) => {
              const qty = computeQuantity(line)
              const isDeduction = Number(line.multiplier ?? 1) < 0
              const rowColor = isReady ? 'rgba(200,230,200,0.3)' : null

              return (
                <React.Fragment key={line.id}>

                  {/* Sıra */}
                  <Box sx={{ ...css_satir, justifyContent: 'center', backgroundColor: rowColor }}>
                    {index + 1}
                  </Box>

                  {/* Açıklama */}
                  <Box sx={{ ...css_satir, justifyContent: 'start', backgroundColor: mode_edit && isDraft ? 'rgba(255,255,0,0.2)' : rowColor, color: isDeduction ? 'red' : null }}>
                    {mode_edit && isDraft ? (
                      <Input
                        value={line.description ?? ''}
                        onChange={e => handleLineChange(line.id, 'description', e.target.value)}
                        disableUnderline
                        fullWidth
                        sx={{ fontSize: '0.85rem', color: isDeduction ? 'red' : null }}
                      />
                    ) : (
                      line.description || '—'
                    )}
                  </Box>

                  {/* Çarpan */}
                  {['multiplier', 'count', 'length', 'width', 'height'].map(field => (
                    <Box key={field} sx={{ ...css_satir, justifyContent: 'end', backgroundColor: mode_edit && isDraft ? 'rgba(255,255,0,0.2)' : rowColor, color: isDeduction ? 'red' : null }}>
                      {mode_edit && isDraft ? (
                        <Input
                          value={line[field] ?? ''}
                          type="number"
                          onChange={e => handleLineChange(line.id, field, e.target.value)}
                          onKeyDown={e => ['e', 'E', '+'].includes(e.key) && e.preventDefault()}
                          disableUnderline
                          sx={{
                            fontSize: '0.85rem',
                            color: isDeduction ? 'red' : null,
                            '& input': { textAlign: 'right' },
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                            '& input[type=number]': { MozAppearance: 'textfield' },
                          }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        ikiHane(line[field])
                      )}
                    </Box>
                  ))}

                  {/* Metraj */}
                  <Box sx={{ ...css_satir, justifyContent: 'end', pr: '0.3rem', backgroundColor: rowColor, color: isDeduction ? 'red' : null }}>
                    {ikiHane(qty)}
                  </Box>

                  {/* Birim */}
                  <Box sx={{ ...css_satir, justifyContent: 'center', backgroundColor: rowColor, color: isDeduction ? 'red' : null }}>
                    {pozBirim}
                  </Box>

                  {/* Sil butonu */}
                  <Box sx={{ ...css_satir, justifyContent: 'center', backgroundColor: rowColor }}>
                    {mode_edit && isDraft && (
                      <IconButton size="small" onClick={() => handleDeleteLine(line.id)} sx={{ p: '2px' }}>
                        <DeleteOutlineIcon sx={{ fontSize: 18, color: 'salmon' }} />
                      </IconButton>
                    )}
                  </Box>

                </React.Fragment>
              )
            })}

          </Box>
        </Box>
      )}
    </>
  )
}
