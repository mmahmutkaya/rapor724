import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../components/store'
import { useGetFirmalar } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
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
    const { error } = await supabase.from('firms').insert({ name: newName.trim() })
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogMessage: error.message, dialogIcon: 'warning', onCloseAction: () => setDialogAlert() })
      return
    }
    setNewName('')
    setShowCreate(false)
    queryClient.invalidateQueries(['firmalar'])
  }


  return (
    <Box sx={{ p: 2 }}>

      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="h6">Firmalar</Typography>
        <IconButton onClick={() => setShowCreate(v => !v)} color="primary" size="small">
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>

      {showCreate && (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Firma adı"
            value={newName}
            onChange={e => setNewName(e.target.value)}
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
  )
}
