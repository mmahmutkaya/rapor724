import { useState } from 'react'

import { supabase } from '../lib/supabase'
import { DialogAlert } from './general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'


export default function FormMahalEdit({ mahal, setEditingMahal, invalidate }) {
  const [name, setName] = useState(mahal.name ?? '')
  const [code, setCode] = useState(mahal.code ?? '')
  const [area, setArea] = useState(mahal.area != null ? String(mahal.area) : '')
  const [dialogAlert, setDialogAlert] = useState()
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal adı boş olamaz.' })
      return
    }

    const finalArea = area !== '' ? parseFloat(area) : null
    if (area !== '' && isNaN(finalArea)) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Alan değeri geçerli bir sayı olmalıdır.' })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('work_areas')
      .update({
        name: name.trim(),
        code: code.trim() || null,
        area: finalArea,
      })
      .eq('id', mahal.id)
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal kaydedilemedi.', detailText: error.message })
      return
    }

    invalidate()
    setEditingMahal(null)
  }

  return (
    <Box sx={{ m: '1rem', maxWidth: '44rem' }}>
      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Paper variant="outlined" sx={{ p: '1.25rem' }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '1rem' }}>
          Mahal Düzenle
        </Typography>

        <Grid container spacing={2}>

          {/* Mahal kodu */}
          <Grid item xs={12} sm={4}>
            <TextField
              variant="standard"
              label="Mahal Kodu"
              fullWidth
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={saving}
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />
          </Grid>

          {/* Alan m² */}
          <Grid item xs={12} sm={4}>
            <TextField
              variant="standard"
              label="Alan m² (isteğe bağlı)"
              fullWidth
              value={area}
              onChange={e => setArea(e.target.value)}
              disabled={saving}
              inputProps={{ inputMode: 'decimal' }}
            />
          </Grid>

          {/* Mahal adı */}
          <Grid item xs={12}>
            <TextField
              variant="standard"
              label="Mahal Adı"
              fullWidth
              required
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </Grid>

          {/* Butonlar */}
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item>
                <Button variant="text" onClick={() => setEditingMahal(null)} disabled={saving}>
                  İptal
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  Kaydet
                </Button>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  )
}
