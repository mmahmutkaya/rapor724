import { useState, useContext } from 'react';
import { StoreContext } from '../components/store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogAlert } from './general/DialogAlert.js'
import { useNavigate } from "react-router-dom";


//mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


export default function P_FormWbsUpdate({ setShow, selectedWbs, setSelectedWbs, setOpenSnackBar, setSnackBarMessage }) {

  const navigate = useNavigate()

  const { appUser, setAppUser, selectedProje, setSelectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState(false)

  const [wbsNameError, setWbsNameError] = useState("")
  const [wbsCodeNameError, setWbsCodeNameError] = useState("")


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const wbsName = deleteLastSpace(data.get('wbsName'))
      const wbsCodeName = deleteLastSpace(data.get('wbsCodeName'))


      let isError = false

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsName) {
        setWbsNameError("Zorunlu")
        isError = true
        console.log("wbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsCodeName) {
        setWbsCodeNameError("Zorunlu")
        isError = true
        console.log("wbsCodeName", "yok -- error")
      }

      if (wbsCodeName.includes(" ")) {
        setWbsCodeNameError("Boşluk kullanmayınız")
        isError = true
        console.log("wbsCodeName", "yok -- error")
      }

      // ilgili hatalar yukarıda ilgili form alanlarına yazılmış olmalı
      // db ye sorgu yapılıp db meşgul edilmesin diye burada durduruyoruz
      // frontendden geçse bile db den errorFormObject kontrolü yapılıyor aşağıda
      if (isError) {
        console.log("frontend validation hata")
        return
      }


      const willBeUpdatedWbs = {
        projeId: selectedProje._id,
        wbsId: selectedWbs._id,
        newWbsName: wbsName,
        newWbsCodeName: wbsCodeName
      }


      const response = await fetch(`/api/projeler/updatewbs`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...willBeUpdatedWbs })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.errorObject) {
        setWbsNameError(responseJson.errorObject.wbsNameError)
        setWbsCodeNameError(responseJson.errorObject.wbsCodeNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }


      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }


      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // sorgu işleminden önce seçilen wbs varsa, temizliyoruz, en büyük gerekçe seçilen wbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedWbs(null)

      setShow()

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return

    }

  }


  return (
    <div>


      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }


      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow()} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Wbs Güncelle
              {/* </Typography> */}
            </DialogContentText>

            <Box onClick={() => setWbsNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                defaultValue={selectedWbs.name}
                margin="normal"
                id="wbsName"
                name="wbsName"
                autoFocus
                error={wbsNameError ? true : false}
                helperText={wbsNameError ? wbsNameError : ""}
                // margin="dense"
                label="Poz Başlık İsmi"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setWbsCodeNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                defaultValue={selectedWbs.codeName}
                margin="normal"
                id="wbsCodeName"
                name="wbsCodeName"
                // autoFocus
                error={wbsCodeNameError ? true : false}
                helperText={wbsCodeNameError ? wbsCodeNameError : "Örnek : KABA İNŞAAT --> KAB"}
                // margin="dense"
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
    </div >
  );


}