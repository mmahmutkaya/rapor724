import { useState } from 'react'

import { supabase } from '../lib/supabase'
import { DialogAlert } from './general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'


export default function FormPozEdit({ poz, units, setEditingPoz, invalidate }) {
  const [code, setCode] = useState(poz.code ?? '')
  const [shortDesc, setShortDesc] = useState(poz.short_desc ?? '')
  const [longDesc, setLongDesc] = useState(poz.long_desc ?? '')
  const [projectNote, setProjectNote] = useState(poz.project_note ?? '')
  const [unitId, setUnitId] = useState(poz.unit_id ?? '')
  const [dialogAlert, setDialogAlert] = useState()
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!shortDesc.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Poz açıklaması boş olamaz.' })
      return
    }
    if (!unitId) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Birim seçiniz.' })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('project_pozlar')
      .update({
        code: code.trim() || null,
        short_desc: shortDesc.trim(),
        long_desc: longDesc.trim() || null,
        project_note: projectNote.trim() || null,
        unit_id: unitId,
      })
      .eq('id', poz.id)
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Poz kaydedilemedi.', detailText: error.message })
      return
    }

    invalidate()
    setEditingPoz(null)
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
          Poz Düzenle
        </Typography>

        <Grid container spacing={2}>

          {/* Poz kodu */}
          <Grid item xs={12} sm={4}>
            <TextField
              variant="standard"
              label="Poz Kodu"
              fullWidth
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={saving}
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />
          </Grid>

          {/* Birim */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="standard" required>
              <InputLabel>Birim</InputLabel>
              <Select
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                disabled={saving}
              >
                {units.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Açıklama */}
          <Grid item xs={12}>
            <TextField
              variant="standard"
              label="Poz Açıklaması"
              fullWidth
              required
              value={shortDesc}
              onChange={e => setShortDesc(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </Grid>

          {/* Uzun açıklama */}
          <Grid item xs={12}>
            <TextField
              variant="standard"
              label="Uzun Açıklama (isteğe bağlı)"
              fullWidth
              multiline
              rows={2}
              value={longDesc}
              onChange={e => setLongDesc(e.target.value)}
              disabled={saving}
            />
          </Grid>

          {/* Proje notu */}
          <Grid item xs={12}>
            <TextField
              variant="standard"
              label="Proje Notu (isteğe bağlı)"
              fullWidth
              value={projectNote}
              onChange={e => setProjectNote(e.target.value)}
              disabled={saving}
            />
          </Grid>

          {/* Butonlar */}
          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item>
                <Button variant="text" onClick={() => setEditingPoz(null)} disabled={saving}>
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
