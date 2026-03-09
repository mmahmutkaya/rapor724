import { useState, useContext, useEffect, useMemo } from 'react'

import { StoreContext } from './store'
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


// Kök → yaprak arası code_name'leri noktalı birleştir
function buildWbsPathCode(nodeId, rawNodes) {
  const path = []
  let current = rawNodes.find(n => n.id === nodeId)
  while (current) {
    if (current.code_name) path.unshift(current.code_name)
    current = current.parent_id ? rawNodes.find(n => n.id === current.parent_id) : null
  }
  return path.join('.')
}

function buildPozCode(wbsNodeId, rawNodes, existingPozlar) {
  if (!wbsNodeId) return ''
  const prefix = buildWbsPathCode(wbsNodeId, rawNodes)
  const count = existingPozlar.filter(p => p.wbs_node_id === wbsNodeId).length
  const seq = String(count + 1).padStart(3, '0')
  return prefix ? `${prefix}.${seq}` : seq
}


export default function FormPozCreate({ setShow, wbsNodeId, rawWbsNodes, rawPozlar, units, invalidate }) {
  const { selectedProje } = useContext(StoreContext)

  // Sadece yaprak node'lar seçilebilir
  const leafNodes = useMemo(() => {
    const flat = rawWbsNodes.filter(n => !rawWbsNodes.some(c => c.parent_id === n.id))
    return flat
  }, [rawWbsNodes])

  const [selectedWbsNodeId, setSelectedWbsNodeId] = useState(wbsNodeId ?? '')
  const [shortDesc, setShortDesc] = useState('')
  const [longDesc, setLongDesc] = useState('')
  const [projectNote, setProjectNote] = useState('')
  const [unitId, setUnitId] = useState(units.length === 1 ? units[0].id : '')
  const [codeOverride, setCodeOverride] = useState('')  // manuel kod
  const [dialogAlert, setDialogAlert] = useState()
  const [saving, setSaving] = useState(false)

  // Otomatik kod: wbs değişince güncelle (manuel override yoksa)
  const autoCode = useMemo(
    () => buildPozCode(selectedWbsNodeId || null, rawWbsNodes, rawPozlar),
    [selectedWbsNodeId, rawWbsNodes, rawPozlar]
  )

  // Gösterilecek kod: override varsa onu, yoksa otomatik
  const displayCode = codeOverride || autoCode

  // WBS yaprak node'larının düz adını al (select listesi için)
  function leafLabel(node) {
    // Kökten yaprağa tam yol ismi
    const parts = []
    let current = node
    while (current) {
      parts.unshift(current.code_name ? `[${current.code_name}] ${current.name}` : current.name)
      current = current.parent_id ? rawWbsNodes.find(n => n.id === current.parent_id) : null
    }
    return parts.join(' > ')
  }

  async function handleSave(andNew = false) {
    if (!shortDesc.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Poz açıklaması boş olamaz.' })
      return
    }
    if (!unitId) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Birim seçiniz.' })
      return
    }
    if (!selectedWbsNodeId) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'WBS seçiniz.' })
      return
    }

    const finalCode = displayCode || null

    // Sonraki order_index: bu WBS'in max order + 1
    const sibs = rawPozlar.filter(p => p.wbs_node_id === selectedWbsNodeId)
    const maxOrder = sibs.length > 0 ? Math.max(...sibs.map(s => s.order_index)) : 0

    setSaving(true)
    const { error } = await supabase.from('project_pozlar').insert({
      project_id: selectedProje.id,
      wbs_node_id: selectedWbsNodeId,
      short_desc: shortDesc.trim(),
      long_desc: longDesc.trim() || null,
      project_note: projectNote.trim() || null,
      unit_id: unitId,
      code: finalCode,
      order_index: maxOrder + 1,
    })
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Poz kaydedilemedi.', detailText: error.message })
      return
    }

    invalidate()

    if (andNew) {
      // Formu sıfırla, aynı WBS'e devam et
      setShortDesc('')
      setLongDesc('')
      setProjectNote('')
      setCodeOverride('')
    } else {
      setShow('Main')
    }
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
          Yeni Poz
        </Typography>

        <Grid container spacing={2}>

          {/* WBS seçimi — wbsNodeId prop yoksa göster */}
          {!wbsNodeId &&
            <Grid item xs={12}>
              <FormControl fullWidth variant="standard" required>
                <InputLabel>WBS (Poz Başlığı)</InputLabel>
                <Select
                  value={selectedWbsNodeId}
                  onChange={e => { setSelectedWbsNodeId(e.target.value); setCodeOverride('') }}
                  disabled={saving}
                >
                  {leafNodes.map(node => (
                    <MenuItem key={node.id} value={node.id}>
                      {leafLabel(node)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          }

          {/* Poz kodu (otomatik, override edilebilir) */}
          <Grid item xs={12} sm={4}>
            <TextField
              variant="standard"
              label="Poz Kodu"
              fullWidth
              value={displayCode}
              onChange={e => setCodeOverride(e.target.value)}
              helperText={codeOverride ? 'Manuel' : 'Otomatik'}
              disabled={saving || !selectedWbsNodeId}
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
                <Button variant="text" onClick={() => setShow('Main')} disabled={saving}>
                  İptal
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => handleSave(true)} disabled={saving}>
                  Kaydet + Yeni
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => handleSave(false)} disabled={saving}>
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
