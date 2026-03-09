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


export default function FormWbsUpdate({ setShow, selectedWbs, setSelectedWbs, invalidate }) {

  const [dialogAlert, setDialogAlert] = useState()
  const [wbsNameError, setWbsNameError] = useState("")
  const [wbsCodeNameError, setWbsCodeNameError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const data = new FormData(event.currentTarget)
      const name = deleteLastSpace(data.get('wbsName'))
      const codeName = deleteLastSpace(data.get('wbsCodeName'))

      let isError = false
      if (!name) { setWbsNameError("Zorunlu"); isError = true }
      if (!codeName) { setWbsCodeNameError("Zorunlu"); isError = true }
      if (codeName.includes(" ")) { setWbsCodeNameError("Boşluk kullanmayınız"); isError = true }
      if (isError) return

      const { error } = await supabase.from('wbs_nodes')
        .update({ name, code_name: codeName })
        .eq('id', selectedWbs.id)

      if (error) throw error

      setSelectedWbs(null)
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
              Wbs Güncelle
            </DialogContentText>

            <Box onClick={() => setWbsNameError("")}>
              <TextField
                variant="standard"
                defaultValue={selectedWbs.name}
                margin="normal"
                id="wbsName"
                name="wbsName"
                autoFocus
                error={!!wbsNameError}
                helperText={wbsNameError}
                label="Poz Başlık İsmi"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setWbsCodeNameError("")}>
              <TextField
                variant="standard"
                defaultValue={selectedWbs.code_name}
                margin="normal"
                id="wbsCodeName"
                name="wbsCodeName"
                error={!!wbsCodeNameError}
                helperText={wbsCodeNameError || "Örnek : KABA İNŞAAT --> KAB"}
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
