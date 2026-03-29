import { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetPozUnits, useGetProjeNameHistory, useGetProjectCurrencies, useGetCurrencyDeletions } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'


function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}


export default function P_ProjeAyarlari() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { appUser, selectedProje, setSelectedProje, selectedFirma } = useContext(StoreContext)

  const s = searchParams.get('s')
  const section = s === 'sil' ? 'sil' : s === 'birimler' ? 'birimler' : s === 'parabirimleri' ? 'parabirimleri' : 'profil'

  const { data: units = [], isLoading: unitsLoading } = useGetPozUnits()
  const { data: nameHistory = [], isLoading: historyLoading } = useGetProjeNameHistory()
  const { data: currencies = [], isLoading: currLoading } = useGetProjectCurrencies()
  const { data: currencyDeletions = [] } = useGetCurrencyDeletions()

  const [dialogAlert, setDialogAlert] = useState()

  // Profil — isim değiştirme
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [renaming, setRenaming] = useState(false)

  // Para birimleri — ekleme
  const [newCurrCode, setNewCurrCode] = useState('')
  const [newCurrSymbol, setNewCurrSymbol] = useState('')
  const [newCurrName, setNewCurrName] = useState('')
  const [currSaving, setCurrSaving] = useState(false)

  // Poz birimleri
  const [newUnitName, setNewUnitName] = useState('')
  const [saving, setSaving] = useState(false)

  // Sil
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])


  async function handleRename() {
    const newName = editName.trim()
    if (!newName || newName === selectedProje.name) { setEditingName(false); return }

    setRenaming(true)
    await supabase.from('project_name_history').insert({
      project_id: selectedProje.id,
      old_name: selectedProje.name,
      new_name: newName,
      changed_by_email: appUser?.email,
    })
    const { error } = await supabase.from('projects').update({ name: newName }).eq('id', selectedProje.id)
    setRenaming(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İsim güncellenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSelectedProje({ ...selectedProje, name: newName })
    queryClient.invalidateQueries(['dataProjeler', selectedFirma?.id])
    queryClient.invalidateQueries(['projeNameHistory', selectedProje.id])
    setEditingName(false)
  }


  async function handleAddCurrency() {
    const code = newCurrCode.trim().toUpperCase()
    const symbol = newCurrSymbol.trim()
    if (!code || !symbol) return

    setCurrSaving(true)
    const { error } = await supabase.from('project_currencies').insert({
      project_id: selectedProje.id,
      code,
      symbol,
      name: newCurrName.trim() || null,
    })
    setCurrSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Para birimi eklenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setNewCurrCode('')
    setNewCurrSymbol('')
    setNewCurrName('')
    queryClient.invalidateQueries(['projectCurrencies', selectedProje?.id])
  }

  async function handleDeleteCurrency(curr) {
    await supabase.from('project_currency_deletions').insert({
      project_id: selectedProje.id,
      code: curr.code,
      symbol: curr.symbol,
      name: curr.name ?? null,
      deleted_by_email: appUser?.email,
    })
    const { error } = await supabase.from('project_currencies').delete().eq('id', curr.id)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Para birimi silinemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['projectCurrencies', selectedProje?.id])
    queryClient.invalidateQueries(['currencyDeletions', selectedProje?.id])
  }


  const invalidateUnits = () => queryClient.invalidateQueries(['pozUnits', selectedProje?.id])

  async function handleAddUnit() {
    const name = newUnitName.trim()
    if (!name) return
    setSaving(true)
    const maxOrder = units.length > 0 ? Math.max(...units.map(u => u.order_index)) : 0
    const { error } = await supabase.from('project_poz_units').insert({
      project_id: selectedProje.id, name, order_index: maxOrder + 1
    })
    setSaving(false)
    if (error) { setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Birim eklenemedi.', detailText: error.message }); return }
    setNewUnitName('')
    invalidateUnits()
  }

  async function handleDeleteUnit(unit) {
    setSaving(true)
    const { error } = await supabase.from('project_poz_units').delete().eq('id', unit.id)
    setSaving(false)
    if (error) { setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Bu birim kullanımda olduğundan silinemez.', detailText: error.message }); return }
    invalidateUnits()
  }

  async function handleMove(unit, direction) {
    const idx = units.findIndex(u => u.id === unit.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= units.length) return
    const swapUnit = units[swapIdx]
    setSaving(true)
    const [r1, r2] = await Promise.all([
      supabase.from('project_poz_units').update({ order_index: swapUnit.order_index }).eq('id', unit.id),
      supabase.from('project_poz_units').update({ order_index: unit.order_index }).eq('id', swapUnit.id),
    ])
    setSaving(false)
    if (r1.error || r2.error) { setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Sıralama güncellenemedi.' }); return }
    invalidateUnits()
  }

  async function handleDeleteProject() {
    if (deleteInput !== selectedProje.name) return
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', selectedProje.id)
    setDeleting(false)
    if (error) { setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Proje silinemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() }); return }
    setSelectedProje(null)
    queryClient.invalidateQueries(['dataProjeler', selectedFirma?.id])
    navigate('/projeler')
  }

  return (
    <Box sx={{ m: '0rem' }}>
      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Proje Ayarları</Typography>
        </Box>
      </Paper>

      {/* ── PROFİL ────────────────────────────────────────────── */}
      {section === 'profil' &&
        <Box sx={{ m: '1rem' }}>

          {/* Proje Bilgileri */}
          <Paper variant="outlined" sx={{ p: '1.25rem', mb: '1rem', maxWidth: '36rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '1rem' }}>Proje Bilgileri</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.75rem' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '130px' }}>Firma</Typography>
              <Typography variant="body2">{selectedFirma?.name ?? '—'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.75rem' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '130px' }}>Proje Adı</Typography>
              {editingName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TextField
                    size="small" value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus sx={{ minWidth: '200px' }}
                  />
                  <IconButton size="small" onClick={handleRename}
                    disabled={renaming || !editName.trim() || editName.trim() === selectedProje?.name}>
                    <CheckIcon fontSize="small" color="success" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setEditingName(false); setEditName('') }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Typography variant="body2" fontWeight={600}>{selectedProje?.name}</Typography>
                  <IconButton size="small" onClick={() => { setEditingName(true); setEditName(selectedProje?.name || '') }}>
                    <EditIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '130px' }}>Oluşturulma</Typography>
              <Typography variant="body2">{formatDate(selectedProje?.created_at)}</Typography>
            </Box>
          </Paper>

          {/* İsim Değişiklik Geçmişi — log accordion */}
          <Accordion disableGutters elevation={0}
            sx={{ maxWidth: '56rem', border: '1px solid', borderColor: 'divider', borderRadius: '4px !important', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />}
              sx={{ minHeight: '2.25rem', px: '1rem', '& .MuiAccordionSummary-content': { my: '0.4rem' } }}
            >
              <Typography variant="body2" color="text.secondary">
                İsim Değişiklik Geçmişi
                {nameHistory.length > 0 && (
                  <Box component="span" sx={{
                    ml: '0.5rem', fontSize: '0.72rem', color: 'text.disabled',
                    backgroundColor: 'rgba(0,0,0,0.06)', px: '0.4rem', py: '0.1rem', borderRadius: '10px'
                  }}>
                    {nameHistory.length}
                  </Box>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: '1rem', pt: 0, pb: '0.75rem', backgroundColor: 'rgba(0,0,0,0.015)' }}>
              {historyLoading && <LinearProgress />}

              {!historyLoading && nameHistory.length === 0 && (
                <Typography variant="caption" color="text.disabled">Henüz isim değişikliği yapılmamış.</Typography>
              )}

              {!historyLoading && nameHistory.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: '2rem', pb: '0.3rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content' }}>
                    {['Eski Ad', 'Yeni Ad', 'Tarih', 'Kişi'].map(col => (
                      <Typography key={col} variant="caption" fontWeight={600} color="text.disabled" sx={{ minWidth: col === 'Kişi' ? 'auto' : '160px' }}>{col}</Typography>
                    ))}
                  </Box>
                  {nameHistory.map(log => (
                    <Box key={log.id} sx={{
                      display: 'flex', gap: '2rem', alignItems: 'center',
                      py: '0.35rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content',
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.35)', textDecoration: 'line-through' }}>{log.old_name}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }} fontWeight={600}>{log.new_name}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }} color="text.secondary">{formatDate(log.changed_at)}</Typography>
                      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }} color="text.secondary">{log.changed_by_email ?? '—'}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

        </Box>
      }

      {/* ── PARA BİRİMLERİ ────────────────────────────────────── */}
      {section === 'parabirimleri' &&
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>
          <Paper variant="outlined" sx={{ p: '1.25rem', mb: '1rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '0.75rem' }}>Para Birimleri</Typography>

            {currLoading && <LinearProgress sx={{ mb: 1 }} />}

            {currencies.map(curr => (
              <Box key={curr.id} sx={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                py: '0.35rem', borderBottom: '1px solid', borderColor: 'divider'
              }}>
                <Typography variant="body2" sx={{ minWidth: '28px', fontWeight: 600 }}>{curr.symbol}</Typography>
                <Typography variant="body2" sx={{ minWidth: '48px', color: 'text.secondary' }}>{curr.code}</Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>{curr.name ?? ''}</Typography>
                <IconButton size="small" onClick={() => handleDeleteCurrency(curr)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {!currLoading && currencies.length === 0 &&
              <Typography variant="body2" color="text.secondary" sx={{ mb: '0.5rem' }}>Henüz para birimi eklenmedi.</Typography>
            }

            <Divider sx={{ my: '0.75rem' }} />

            <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField size="small" label="Sembol" placeholder="₺"
                value={newCurrSymbol} onChange={e => setNewCurrSymbol(e.target.value)}
                sx={{ width: '80px' }} disabled={currSaving}
              />
              <TextField size="small" label="Kod" placeholder="TRY"
                value={newCurrCode} onChange={e => setNewCurrCode(e.target.value.toUpperCase())}
                sx={{ width: '88px' }} disabled={currSaving}
              />
              <TextField size="small" label="Ad (opsiyonel)" placeholder="Türk Lirası"
                value={newCurrName} onChange={e => setNewCurrName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCurrency()}
                sx={{ width: '160px' }} disabled={currSaving}
              />
              <IconButton onClick={handleAddCurrency} disabled={!newCurrCode.trim() || !newCurrSymbol.trim() || currSaving}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Silinen Para Birimleri — log accordion */}
          <Accordion disableGutters elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px !important', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />}
              sx={{ minHeight: '2.25rem', px: '1rem', '& .MuiAccordionSummary-content': { my: '0.4rem' } }}
            >
              <Typography variant="body2" color="text.secondary">
                Silinen Para Birimleri
                {currencyDeletions.length > 0 && (
                  <Box component="span" sx={{
                    ml: '0.5rem', fontSize: '0.72rem', color: 'text.disabled',
                    backgroundColor: 'rgba(0,0,0,0.06)', px: '0.4rem', py: '0.1rem', borderRadius: '10px'
                  }}>
                    {currencyDeletions.length}
                  </Box>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: '1rem', pt: 0, pb: '0.75rem', backgroundColor: 'rgba(0,0,0,0.015)' }}>
              {currencyDeletions.length === 0 && (
                <Typography variant="caption" color="text.disabled">Henüz silinmiş para birimi yok.</Typography>
              )}
              {currencyDeletions.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: '1.5rem', pb: '0.3rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content' }}>
                    {['Sembol', 'Kod', 'Ad', 'Tarih', 'Kişi'].map(col => (
                      <Typography key={col} variant="caption" fontWeight={600} color="text.disabled"
                        sx={{ minWidth: col === 'Sembol' ? '36px' : col === 'Kod' ? '52px' : col === 'Ad' ? '120px' : col === 'Tarih' ? '160px' : 'auto' }}>
                        {col}
                      </Typography>
                    ))}
                  </Box>
                  {currencyDeletions.map(log => (
                    <Box key={log.id} sx={{
                      display: 'flex', gap: '1.5rem', alignItems: 'center',
                      py: '0.35rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content',
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <Typography variant="caption" sx={{ minWidth: '36px', whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.5)' }}>{log.symbol}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '52px', whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.5)', textDecoration: 'line-through' }}>{log.code}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '120px', whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.5)' }}>{log.name ?? '—'}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }} color="text.secondary">{formatDate(log.deleted_at)}</Typography>
                      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }} color="text.secondary">{log.deleted_by_email ?? '—'}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      }

      {/* ── POZ BİRİMLERİ ─────────────────────────────────────── */}
      {section === 'birimler' &&
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>
          {unitsLoading && <LinearProgress color="inherit" sx={{ mb: 1 }} />}
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '0.75rem' }}>Poz Birimleri</Typography>

            {units.map((unit, idx) => (
              <Grid key={unit.id} container alignItems="center"
                sx={{ py: '0.3rem', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Grid item xs><Typography>{unit.name}</Typography></Grid>
                <Grid item>
                  <IconButton size="small" onClick={() => handleMove(unit, 'up')} disabled={idx === 0 || saving}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton size="small" onClick={() => handleMove(unit, 'down')} disabled={idx === units.length - 1 || saving}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton size="small" onClick={() => handleDeleteUnit(unit)} disabled={saving}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            {units.length === 0 &&
              <Typography variant="body2" color="text.secondary" sx={{ mb: '0.75rem' }}>Henüz birim eklenmedi.</Typography>
            }

            <Divider sx={{ my: '0.75rem' }} />

            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField variant="standard" label="Yeni birim (örn. m², adet, kg)" fullWidth
                  value={newUnitName} onChange={e => setNewUnitName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUnit() } }}
                  disabled={saving}
                />
              </Grid>
              <Grid item>
                <IconButton onClick={handleAddUnit} disabled={!newUnitName.trim() || saving}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      }

      {/* ── PROJEYI SİL ───────────────────────────────────────── */}
      {section === 'sil' &&
        <Box sx={{ m: '1.5rem', maxWidth: '34rem' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '1.5rem' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, backgroundColor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteForeverIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>Projeyi Sil</Typography>
              <Typography variant="body2" color="text.secondary">Bu işlem geri alınamaz</Typography>
            </Box>
          </Box>

          <Paper variant="outlined" sx={{ p: '1rem', mb: '1.5rem', borderColor: 'warning.main', backgroundColor: '#fffdf5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.75rem' }}>
              <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
              <Typography variant="body2" fontWeight={600}>Silmeden önce dikkat:</Typography>
            </Box>
            {['Projeye ait tüm pozlar silinir', 'Tüm mahaller ve metrajlar silinir', 'Tüm iş paketleri ve bütçe verileri silinir', 'Bu veriler kurtarılamaz'].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.25rem' }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'warning.main', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">{item}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: '1.5rem', borderColor: 'error.light' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: '0.4rem' }}>Devam etmek için proje adını yazın:</Typography>
            <Box sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', backgroundColor: 'grey.100', color: 'text.primary', px: '0.6rem', py: '0.3rem', borderRadius: 1, display: 'inline-block', mb: '1rem', border: '1px solid', borderColor: 'grey.300' }}>
              {selectedProje?.name}
            </Box>
            <TextField fullWidth size="small" placeholder={selectedProje?.name}
              value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
              disabled={deleting}
              error={deleteInput.length > 0 && deleteInput !== selectedProje?.name}
              helperText={deleteInput.length > 0 && deleteInput !== selectedProje?.name ? 'Proje adı eşleşmiyor' : ' '}
              sx={{ mb: '0.75rem' }}
            />
            <Button variant="contained" color="error" fullWidth
              disabled={deleteInput !== selectedProje?.name || deleting}
              onClick={handleDeleteProject}
              startIcon={<DeleteForeverIcon />}
              sx={{ py: '0.65rem', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' }}
            >
              {deleting ? 'Siliniyor...' : `"${selectedProje?.name}" projesini kalıcı olarak sil`}
            </Button>
          </Paper>

        </Box>
      }
    </Box>
  )
}
