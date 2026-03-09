import { useState, useContext, useMemo } from 'react'

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


// Kök → yaprak arası code_name'leri noktalı birleştir (LBS için)
function buildLbsPathCode(nodeId, rawNodes) {
  const path = []
  let current = rawNodes.find(n => n.id === nodeId)
  while (current) {
    if (current.code_name) path.unshift(current.code_name)
    current = current.parent_id ? rawNodes.find(n => n.id === current.parent_id) : null
  }
  return path.join('.')
}

function buildMahalCode(lbsNodeId, rawNodes, existingMahaller) {
  if (!lbsNodeId) return ''
  const prefix = buildLbsPathCode(lbsNodeId, rawNodes)
  const count = existingMahaller.filter(m => m.lbs_node_id === lbsNodeId).length
  const seq = String(count + 1).padStart(3, '0')
  return prefix ? `${prefix}.${seq}` : seq
}


export default function FormMahalCreate({ setShow, lbsNodeId, rawLbsNodes, rawMahaller, invalidate }) {
  const { selectedProje } = useContext(StoreContext)

  // Sadece yaprak node'lar seçilebilir
  const leafNodes = useMemo(() => {
    return rawLbsNodes.filter(n => !rawLbsNodes.some(c => c.parent_id === n.id))
  }, [rawLbsNodes])

  const [selectedLbsNodeId, setSelectedLbsNodeId] = useState(lbsNodeId ?? '')
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [codeOverride, setCodeOverride] = useState('')
  const [dialogAlert, setDialogAlert] = useState()
  const [saving, setSaving] = useState(false)

  // Otomatik kod: lbs değişince güncelle
  const autoCode = useMemo(
    () => buildMahalCode(selectedLbsNodeId || null, rawLbsNodes, rawMahaller),
    [selectedLbsNodeId, rawLbsNodes, rawMahaller]
  )

  const displayCode = codeOverride || autoCode

  // LBS yaprak node'larının tam yol adı (select listesi için)
  function leafLabel(node) {
    const parts = []
    let current = node
    while (current) {
      parts.unshift(current.code_name ? `[${current.code_name}] ${current.name}` : current.name)
      current = current.parent_id ? rawLbsNodes.find(n => n.id === current.parent_id) : null
    }
    return parts.join(' > ')
  }

  async function handleSave(andNew = false) {
    if (!name.trim()) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal adı boş olamaz.' })
      return
    }
    if (!selectedLbsNodeId) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'LBS (Mahal Başlığı) seçiniz.' })
      return
    }

    const finalCode = displayCode || null
    const finalArea = area !== '' ? parseFloat(area) : null

    if (area !== '' && isNaN(finalArea)) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Alan değeri geçerli bir sayı olmalıdır.' })
      return
    }

    // Sonraki order_index: bu LBS'in max order + 1
    const sibs = rawMahaller.filter(m => m.lbs_node_id === selectedLbsNodeId)
    const maxOrder = sibs.length > 0 ? Math.max(...sibs.map(s => s.order_index)) : 0

    setSaving(true)
    const { error } = await supabase.from('work_areas').insert({
      project_id: selectedProje.id,
      lbs_node_id: selectedLbsNodeId,
      name: name.trim(),
      code: finalCode,
      area: finalArea,
      order_index: maxOrder + 1,
    })
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Mahal kaydedilemedi.', detailText: error.message })
      return
    }

    invalidate()

    if (andNew) {
      setName('')
      setArea('')
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
          Yeni Mahal
        </Typography>

        <Grid container spacing={2}>

          {/* LBS seçimi — lbsNodeId prop yoksa göster */}
          {!lbsNodeId &&
            <Grid item xs={12}>
              <FormControl fullWidth variant="standard" required>
                <InputLabel>LBS (Mahal Başlığı)</InputLabel>
                <Select
                  value={selectedLbsNodeId}
                  onChange={e => { setSelectedLbsNodeId(e.target.value); setCodeOverride('') }}
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

          {/* Mahal kodu (otomatik, override edilebilir) */}
          <Grid item xs={12} sm={4}>
            <TextField
              variant="standard"
              label="Mahal Kodu"
              fullWidth
              value={displayCode}
              onChange={e => setCodeOverride(e.target.value)}
              helperText={codeOverride ? 'Manuel' : 'Otomatik'}
              disabled={saving || !selectedLbsNodeId}
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
