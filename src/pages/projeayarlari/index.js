import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'


export default function P_ProjeAyarlari() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje } = useContext(StoreContext)

  const { data: units = [], isLoading } = useGetPozUnits()
  const [dialogAlert, setDialogAlert] = useState()
  const [newUnitName, setNewUnitName] = useState('')
  const [saving, setSaving] = useState(false)

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

  async function handleDelete(unit) {
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

      {!isLoading &&
        <Box sx={{ m: '1rem', maxWidth: '36rem' }}>

          {/* Poz Birimleri bölümü */}
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '0.75rem' }}>
              Poz Birimleri
            </Typography>

            {/* Mevcut birimler listesi */}
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
                  <IconButton
                    size="small"
                    onClick={() => handleMove(unit, 'up')}
                    disabled={idx === 0 || saving}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    size="small"
                    onClick={() => handleMove(unit, 'down')}
                    disabled={idx === units.length - 1 || saving}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(unit)}
                    disabled={saving}
                  >
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

            {/* Yeni birim ekleme */}
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
    </Box>
  )
}
