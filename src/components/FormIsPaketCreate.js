import React, { useState, useContext } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
import { DialogAlert } from './general/DialogAlert'
import { supabase } from '../lib/supabase'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


export default function FormIsPaketCreate({ onClose }) {

  const queryClient = useQueryClient()
  const { appUser, selectedProje } = useContext(StoreContext)

  const [isPaketName, setIsPaketName] = useState("")
  const [aciklama, setAciklama] = useState("")
  const [isPaketNameError, setIsPaketNameError] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()


  async function handleSubmit(event) {
    event.preventDefault()

    if (typeof isPaketName !== "string" || isPaketName.trim().length < 3) {
      setIsPaketNameError("İş paketi adı en az 3 karakter olmalıdır")
      return
    }

    try {
      const { error } = await supabase
        .from('work_packages')
        .insert({
          project_id: selectedProje.id,
          name: isPaketName.trim(),
          description: aciklama.trim() || null,
          status: 'active'
        })

      if (error) throw new Error(error.message)

      queryClient.invalidateQueries(['workPackages', selectedProje.id])
      onClose()

    } catch (err) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "İş paketi oluşturulurken hata oluştu.",
        detailText: err?.message ?? null,
        onCloseAction: () => setDialogAlert()
      })
    }
  }


  return (
    <div>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction}
        />
      )}

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={onClose}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <DialogContent sx={{ display: "grid", overflow: "visible" }}>
            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              İş Paketi Oluştur
            </DialogContentText>

            <Box onClick={() => setIsPaketNameError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="isPaketName"
                label="İş Paketi Adı"
                type="text"
                fullWidth
                onChange={(e) => setIsPaketName(e.target.value.replace(/^i/, 'İ').toUpperCase())}
                value={isPaketName}
                error={Boolean(isPaketNameError)}
                helperText={isPaketNameError || ""}
                autoFocus
              />
            </Box>

            <TextField
              multiline
              variant="standard"
              margin="normal"
              id="aciklama"
              label="Açıklama"
              type="text"
              fullWidth
              onChange={(e) => setAciklama(e.target.value)}
              value={aciklama}
            />
          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={onClose}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  )
}
