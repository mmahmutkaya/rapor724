import { useState } from 'react';
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogAlert } from './general/DialogAlert.js'
import { supabase } from '../lib/supabase.js'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


export default function FormLbsUpdate({ setShow, selectedLbs, setSelectedLbs, invalidate }) {

  const [dialogAlert, setDialogAlert] = useState()
  const [lbsNameError, setLbsNameError] = useState("")
  const [lbsCodeNameError, setLbsCodeNameError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const data = new FormData(event.currentTarget)
      const name = deleteLastSpace(data.get('lbsName'))
      const codeName = deleteLastSpace(data.get('lbsCodeName'))

      let isError = false
      if (!name) { setLbsNameError("Zorunlu"); isError = true }
      if (!codeName) { setLbsCodeNameError("Zorunlu"); isError = true }
      if (codeName.includes(" ")) { setLbsCodeNameError("Boşluk kullanmayınız"); isError = true }
      if (isError) return

      const { error } = await supabase.from('lbs_nodes')
        .update({ name, code_name: codeName })
        .eq('id', selectedLbs.id)

      if (error) throw error

      setSelectedLbs(null)
      invalidate()
      setShow()

    } catch (err) {
      console.log(err)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ?? null
      })
    }
  }


  return (
    <div>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow()}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              Lbs Güncelle
            </DialogContentText>

            <Box onClick={() => setLbsNameError("")}>
              <TextField
                variant="standard"
                defaultValue={selectedLbs.name}
                margin="normal"
                id="lbsName"
                name="lbsName"
                autoFocus
                error={!!lbsNameError}
                helperText={lbsNameError}
                label="Mahal Başlık İsmi"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setLbsCodeNameError("")}>
              <TextField
                variant="standard"
                defaultValue={selectedLbs.code_name}
                margin="normal"
                id="lbsCodeName"
                name="lbsCodeName"
                error={!!lbsCodeNameError}
                helperText={lbsCodeNameError || "Örnek : ZEMİN KAT --> ZK"}
                label="Başlık İsminin Kısaltması"
                type="text"
                fullWidth
              />
            </Box>

          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow()}>İptal</Button>
            <Button type="submit">Güncelle</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div>
  )
}
