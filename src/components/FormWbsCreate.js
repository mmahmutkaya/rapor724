import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
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
import { Typography } from '@mui/material';


export default function FormWbsCreate({ setShow, rawNodes, selectedWbs, setSelectedWbs, invalidate }) {

  const { selectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()
  const [wbsName, setWbsName] = useState("")
  const [wbsCodeName, setWbsCodeName] = useState("")
  const [wbsNameError, setWbsNameError] = useState()
  const [wbsCodeNameError, setWbsCodeNameError] = useState()

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

      // Compute order_index: max sibling order + 1
      const parentId = selectedWbs?.id ?? null
      const siblings = rawNodes.filter(n => (n.parent_id ?? null) === parentId)
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order_index)) : 0
      const newOrder = maxOrder + 1

      const { error } = await supabase.from('wbs_nodes').insert({
        project_id: selectedProje.id,
        parent_id: parentId,
        name,
        code_name: codeName,
        order_index: newOrder,
        open_for_poz: false,
      })

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
              Wbs Oluştur
            </DialogContentText>

            {selectedWbs &&
              <>
                <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                  {selectedWbs.code} {"-->"} {selectedWbs.name}
                </DialogContentText>
                <Typography>başlığı altına yeni bir Wbs eklemek üzeresiniz.</Typography>
              </>
            }

            {!selectedWbs &&
              <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                En üst düzeye yeni bir Wbs eklemek üzeresiniz.
              </DialogContentText>
            }

            <Box onClick={() => setWbsNameError()}>
              <TextField
                variant="standard"
                onChange={(e) => setWbsName(e.target.value.replace("i", "İ").toUpperCase())}
                value={wbsName}
                margin="normal"
                id="wbsName"
                name="wbsName"
                autoFocus
                error={!!wbsNameError}
                helperText={wbsNameError ?? ""}
                label="Poz Başlık İsmi"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setWbsCodeNameError()}>
              <TextField
                variant="standard"
                onChange={(e) => setWbsCodeName(e.target.value.replace("i", "İ").toUpperCase())}
                value={wbsCodeName}
                margin="normal"
                id="wbsCodeName"
                name="wbsCodeName"
                error={!!wbsCodeNameError}
                helperText={wbsCodeNameError ?? "Örnek : KABA İNŞAAT --> KAB"}
                label="Başlık İsminin Kısaltması"
                type="text"
                fullWidth
              />
            </Box>

          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow()}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div>
  )
}
