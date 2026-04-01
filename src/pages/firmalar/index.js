import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../components/store'
import { useGetFirmalar } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useQueryClient } from '@tanstack/react-query'


export default function P_Firmalar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUser, setSelectedFirma, setSelectedProje } = useContext(StoreContext)

  const { data, isLoading, isError } = useGetFirmalar()
  const firmalar = data?.firmalar ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()


  const handleSelect = (firma) => {
    setSelectedFirma(firma)
    setSelectedProje()
    navigate('/projeler')
  }


  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { data: newFirma, error } = await supabase
      .from('firms')
      .insert({ name: newName.trim().toUpperCase() })
      .select('id')
      .single()
    if (error) {
      setSaving(false)
      setDialogAlert({ dialogMessage: error.message, dialogIcon: 'warning', onCloseAction: () => setDialogAlert() })
      return
    }
    // Firmayı kuran kişiyi kadro listesine otomatik ekle
    await supabase.from('firma_members').insert({
      firma_id: newFirma.id,
      email: appUser.email,
      name: `${appUser.isim} ${appUser.soyisim}`.trim(),
      title: 'Firma Yöneticisi',
      status: 'active',
      invited_by: appUser.id,
      approved_by: appUser.id,
      approved_at: new Date().toISOString(),
    })
    setSaving(false)
    setNewName('')
    setShowCreate(false)
    queryClient.invalidateQueries(['firmalar'])
  }


  return (
    <Box sx={{ m: '0rem' }}>

      {dialogAlert && <DialogAlert {...dialogAlert} />}

      {/* BAŞLIK */}
      <Paper sx={{ borderBottom: '2px solid rgba(0,0,0,0.15)' }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: '1rem', py: '0.5rem', maxHeight: '5rem' }}>
          <Grid item>
            <Typography variant="h6" fontWeight="bold">Firmalar</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setShowCreate(v => !v)}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ p: 2 }}>

      {showCreate && (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Firma adı"
            value={newName}
            onChange={e => setNewName(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <Button variant="contained" size="small" onClick={handleCreate} disabled={saving || !newName.trim()}>
            Kaydet
          </Button>
          <Button size="small" onClick={() => { setShowCreate(false); setNewName('') }}>İptal</Button>
        </Paper>
      )}

      {isLoading && <LinearProgress />}
      {isError && <Alert severity="error">Veriler yüklenemedi.</Alert>}

      {firmalar.map(firma => (
        <Paper
          key={firma.id}
          onClick={() => handleSelect(firma)}
          sx={{ p: 1.5, mb: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        >
          <Typography>{firma.name}</Typography>
        </Paper>
      ))}

      {!isLoading && firmalar.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>Henüz firma eklenmemiş.</Typography>
      )}

      </Box>
    </Box>
  )
}
