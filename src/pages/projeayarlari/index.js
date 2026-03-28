import { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetPozUnits } from '../../hooks/useMongo'
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'


export default function P_ProjeAyarlari() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { selectedProje, setSelectedProje, selectedFirma } = useContext(StoreContext)

  const section = searchParams.get('s') === 'sil' ? 'sil' : 'birimler'

  const { data: units = [], isLoading } = useGetPozUnits()
  const [dialogAlert, setDialogAlert] = useState()
  const [newUnitName, setNewUnitName] = useState('')
  const [saving, setSaving] = useState(false)

  // Sil bölümü
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])

  const invalidate = () => queryClient.invalidateQueries(['pozUnits', selectedProje?.id])

  async function handleAddUnit() {
    const name = newUnitName.trim()
    if (!name) return

    setSaving(true)
    const maxOrder = units.length > 0 ? Math.max(...units.map(u => u.order_index)) : 0
    const { error } = await supabase.from('project_poz_units').insert({
      project_id: selectedProje.id,
      name,
      order_index: maxOrder + 1
    })
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Birim eklenemedi.', detailText: error.message })
      return
    }
    setNewUnitName('')
    invalidate()
  }

  async function handleDeleteUnit(unit) {
    setSaving(true)
    const { error } = await supabase.from('project_poz_units').delete().eq('id', unit.id)
    setSaving(false)

    if (error) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Bu birim kullanımda olduğundan silinemez.',
        detailText: error.message
      })
      return
    }
    invalidate()
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

    if (r1.error || r2.error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Sıralama güncellenemedi.' })
      return
    }
    invalidate()
  }

  async function handleDeleteProject() {
    if (deleteInput !== selectedProje.name) return
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', selectedProje.id)
    setDeleting(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Proje silinemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }

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

      {/* Başlık */}
      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Proje Ayarları</Typography>
        </Box>
      </Paper>

      {isLoading && <Box sx={{ m: '1rem', color: 'gray' }}><LinearProgress color="inherit" /></Box>}

      {!isLoading && section === 'birimler' &&
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '0.75rem' }}>
              Poz Birimleri
            </Typography>

            {units.map((unit, idx) => (
              <Grid
                key={unit.id}
                container
                alignItems="center"
                sx={{ py: '0.3rem', borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Grid item xs>
                  <Typography>{unit.name}</Typography>
                </Grid>
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: '0.75rem' }}>
                Henüz birim eklenmedi.
              </Typography>
            }

            <Divider sx={{ my: '0.75rem' }} />

            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField
                  variant="standard"
                  label="Yeni birim (örn. m², adet, kg)"
                  fullWidth
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
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

      {!isLoading && section === 'sil' &&
        <Box sx={{ m: '1.5rem', maxWidth: '34rem' }}>

          {/* Başlık */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '1.5rem' }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'error.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <DeleteForeverIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>Projeyi Sil</Typography>
              <Typography variant="body2" color="text.secondary">Bu işlem geri alınamaz</Typography>
            </Box>
          </Box>

          {/* Uyarı listesi */}
          <Paper variant="outlined" sx={{ p: '1rem', mb: '1.5rem', borderColor: 'warning.main', backgroundColor: '#fffdf5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.75rem' }}>
              <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
              <Typography variant="body2" fontWeight={600}>Silmeden önce dikkat:</Typography>
            </Box>
            {[
              'Projeye ait tüm pozlar silinir',
              'Tüm mahaller ve metrajlar silinir',
              'Tüm iş paketleri ve bütçe verileri silinir',
              'Bu veriler kurtarılamaz',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.25rem' }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'warning.main', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">{item}</Typography>
              </Box>
            ))}
          </Paper>

          {/* Onay kutusu */}
          <Paper variant="outlined" sx={{ p: '1.5rem', borderColor: 'error.light' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: '0.4rem' }}>
              Devam etmek için proje adını yazın:
            </Typography>
            <Box sx={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem',
              backgroundColor: 'grey.100', color: 'text.primary',
              px: '0.6rem', py: '0.3rem', borderRadius: 1,
              display: 'inline-block', mb: '1rem',
              border: '1px solid', borderColor: 'grey.300'
            }}>
              {selectedProje?.name}
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder={selectedProje?.name}
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              disabled={deleting}
              error={deleteInput.length > 0 && deleteInput !== selectedProje?.name}
              helperText={deleteInput.length > 0 && deleteInput !== selectedProje?.name ? 'Proje adı eşleşmiyor' : ' '}
              sx={{ mb: '0.75rem' }}
            />

            <Button
              variant="contained"
              color="error"
              fullWidth
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
