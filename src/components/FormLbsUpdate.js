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


export default function P_FormLbsUpdate({ setShow, selectedLbs, setSelectedLbs, setOpenSnackBar, setSnackBarMessage }) {

  const navigate = useNavigate()

  const { appUser, setAppUser, selectedProje, setSelectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState(false)

  const [lbsNameError, setLbsNameError] = useState("")
  const [lbsCodeNameError, setLbsCodeNameError] = useState("")


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const lbsName = deleteLastSpace(data.get('lbsName'))
      const lbsCodeName = deleteLastSpace(data.get('lbsCodeName'))


      let isError = false

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsName) {
        setLbsNameError("Zorunlu")
        isError = true
        console.log("lbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsCodeName) {
        setLbsCodeNameError("Zorunlu")
        isError = true
        console.log("lbsCodeName", "yok -- error")
      }

      if (lbsCodeName.includes(" ")) {
        setLbsCodeNameError("Boşluk kullanmayınız")
        isError = true
        console.log("lbsCodeName", "yok -- error")
      }

      // ilgili hatalar yukarıda ilgili form alanlarına yazılmış olmalı
      // db ye sorgu yapılıp db meşgul edilmesin diye burada durduruyoruz
      // frontendden geçse bile db den errorFormObject kontrolü yapılıyor aşağıda
      if (isError) {
        console.log("frontend validation hata")
        return
      }


      const willBeUpdatedLbs = {
        projeId: selectedProje._id,
        lbsId: selectedLbs._id,
        newLbsName: lbsName,
        newLbsCodeName: lbsCodeName
      }


      const response = await fetch(`/api/projeler/updatelbs`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...willBeUpdatedLbs })
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
        setLbsNameError(responseJson.errorObject.lbsNameError)
        setLbsCodeNameError(responseJson.errorObject.lbsCodeNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }


      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }


      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // sorgu işleminden önce seçilen lbs varsa, temizliyoruz, en büyük gerekçe seçilen lbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedLbs(null)

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
          onCloseAction={() => setDialogAlert()}
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
              Lbs Güncelle
              {/* </Typography> */}
            </DialogContentText>

            <Box onClick={() => setLbsNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                defaultValue={selectedLbs.name}
                margin="normal"
                id="lbsName"
                name="lbsName"
                autoFocus
                error={lbsNameError ? true : false}
                helperText={lbsNameError ? lbsNameError : ""}
                // margin="dense"
                label="Mahal Başlık İsmi"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setLbsCodeNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                defaultValue={selectedLbs.codeName}
                margin="normal"
                id="lbsCodeName"
                name="lbsCodeName"
                // autoFocus
                error={lbsCodeNameError ? true : false}
                helperText={lbsCodeNameError ? lbsCodeNameError : "Örnek : KABA İNŞAAT --> KAB"}
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