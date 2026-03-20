import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { StoreContext } from '../../components/store'
import { useGetProjeler_byFirma } from '../../hooks/useMongo'
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


export default function P_Projeler() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUser, selectedFirma, setSelectedProje } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedFirma) navigate('/firmalar')
  }, [selectedFirma, navigate])

  const { data, isLoading, isError } = useGetProjeler_byFirma()
  const projeler = data?.projeler ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()


  const handleSelect = (proje) => {
    setSelectedProje(proje)
    navigate('/pozlar')
  }


  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { error } = await supabase.from('projects').insert({ name: newName.trim(), firm_id: selectedFirma.id })
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogMessage: error.message, dialogIcon: 'warning', onCloseAction: () => setDialogAlert() })
      return
    }
    setNewName('')
    setShowCreate(false)
    queryClient.invalidateQueries(['dataProjeler', selectedFirma?.id])
  }


  return (
    <Box sx={{ p: 2 }}>

      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {selectedFirma?.name}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="h6">Projeler</Typography>
        <IconButton onClick={() => setShowCreate(v => !v)} color="primary" size="small">
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>

      {showCreate && (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Proje adı"
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

      {projeler.map(proje => (
        <Paper
          key={proje.id}
          onClick={() => handleSelect(proje)}
          sx={{ p: 1.5, mb: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        >
          <Typography>{proje.name}</Typography>
        </Paper>
      ))}

      {!isLoading && projeler.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>Henüz proje eklenmemiş.</Typography>
      )}

    </Box>
  )
}
