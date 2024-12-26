import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { useApp } from "./useApp.js";
import { DialogAlert } from './general/DialogAlert';

import { useNavigate } from "react-router-dom";

//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';



export default function P_FormProfileUpdate({ setShow }) {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  const navigate = useNavigate()

  const [dialogAlert, setDialogAlert] = useState()

  const [isim, setIsim] = useState(RealmApp.currentUser.customData.isim)
  const [soyisim, setSoyisim] = useState(RealmApp.currentUser.customData.soyisim)

  const [isimError, setIsimError] = useState()
  const [soyisimError, setSoyisimError] = useState()

  const [pageSituation, setPageSituation] = useState(1)


  // pageSituation 1 - email ve şifreler girilirken
  // pageSituation 2 - email ve şifre gönderiliyor - loading

  // pageSituation 3 - email ve şifre gönderildi - firma moduna girildi
  // pageSituation 4 - firma gönderiliyor - loading


  const sadeceHarfveBosluk = (e) => {
    let h = e.key.toLowerCase()
    if (!(e.code == "Space" || /[A-Za-z]/.test(h) || h == "ı" || h == "ğ" || h == "ü" || h == "ş" || h == "ö" || h == "ç")) {
      e.preventDefault()
    }
  }

  const basHarflerBuyuk = (value) => {
    value = value.replace("  ", " ")
    value = value.split(" ")
    value = value.reduce((z, x) => {
      x = x.charAt(0).replace("ı", "I").replace("i", "İ").toUpperCase() + x.slice(1).replace("I", "ı").replace("İ", "i").toLowerCase()
      return (
        !z ? x : z + " " + x
      )
    }, "")
    return value
  }




  const handleSubmit = async (event) => {

    // BURASI HIZLICA MONGO REALM FONKSİYON ANTREMAN ALANIMIZ
    // const credentialsApiKey = Realm.Credentials.apiKey("2FE7NrzR4gq9hUQLtuOsrp6lBDhDE9wp80ICWPBXxAnF6Bf5oJB2e3aYkz2rS3SH")
    // await RealmApp.logIn(credentialsApiKey)
    // const admin = await RealmApp.currentUser.callFunction("admin", email)
    // console.log("admin",admin)
    // await RealmApp.currentUser.logOut()
    // return

    event.preventDefault()

    let isError = false
    if (pageSituation == 1) {


      try {

        const data = new FormData(event.currentTarget);
        const isim = data.get('isim')
        const soyisim = data.get('soyisim')
        // let rehber = data.get('rehber')
        // rehber = rehber ? true : false



        if (isim.length < 2) {
          setIsimError("En az 2 karakter girmelisiniz")
          isError = true
        }
        if (!isim.length) {
          setIsimError("İsim giriniz")
          isError = true
        }




        if (soyisim.length < 2) {
          setSoyisimError("En az 2 karakter girmelisiniz")
          isError = true
        }
        if (!soyisim.length) {
          setSoyisimError("Soyisim giriniz")
          isError = true
        }



        // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        // sorgu olacaksa
        setPageSituation(2)
        const result = await RealmApp.currentUser.callFunction("auth_updateCustumData_isimSoyisim", { isim, soyisim })
        await RealmApp.currentUser.refreshCustomData()

        if (result.isError) {

          setPageSituation(1)

          if (result.hasOwnProperty('isimError')) {
            setIsimError(result.isimError)
          }

          if (result.hasOwnProperty('soyisimError')) {
            setSoyisimError(result.soyisimError)
          }

          return
        }

        navigate(0)
        return

        // setDialogAlert({
        //   icon: "success",
        //   message: "Başarı ile kaydedildi",
        //   onCloseAction: () => navigate(0)
        //   // onCloseAction: () => setDialogAlert()
        // })

        return

      } catch (error) {

        setPageSituation(1)

        console.log("error", error)

        let hataMesaj
        if (error.message.includes("Öncelikle mail adresinin sizin olduğunu teyit etmelisiniz")) {
          hataMesaj = "Öncelikle mail adresinin sizin olduğunu teyit etmelisiniz, kayıt işlemi için yönlendirileceksiniz, sorun devam ederse lütfen bizimle irtibata geçiniz."
        }

        setDialogAlert({
          icon: "warning",
          message: hataMesaj ? hataMesaj : "Beklenmedik bir hata oluştu, sayfa yenilenecek, sorun devam ederse lütfen bizimle irtibata geçiniz.",
          onCloseAction: () => navigate(0)
          // onCloseAction: () => setDialogAlert()
        })

      }

    }

  }




  return (
    <div>

      {dialogAlert &&
        < DialogAlert
          dialogIcon={dialogAlert.icon}
          dialogMessage={dialogAlert.message}
          onCloseAction={dialogAlert.onCloseAction}
        />
      }

      <Dialog
        PaperProps={{ sx: { width: "60%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("RootPage")} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Profil Bilgileri Güncelle
              {/* </Typography> */}
            </DialogContentText>

            <Box>

              <TextField
                // onClick={() => setIsimError()}
                variant="standard"
                error={isimError ? true : false}
                margin="normal"
                required
                fullWidth
                id="isim"
                label={isimError ? isimError : "İsim"}
                name="isim"
                autoComplete="off"
                autoFocus
                disabled={pageSituation !== 1}
                onKeyDown={(e) => {
                  sadeceHarfveBosluk(e)
                  setIsimError()
                }}
                onChange={(e) => setIsim(basHarflerBuyuk(e.target.value))}
                value={isim}
              />


              <TextField
                variant="standard"
                error={soyisimError ? true : false}
                margin="normal"
                required
                fullWidth
                name="soyisim"
                label={soyisimError ? soyisimError : "Soyisim"}
                type="text"
                id="soyisim"
                disabled={pageSituation !== 1}
                onKeyDown={(e) => {
                  sadeceHarfveBosluk(e)
                  setSoyisimError()
                }}
                onChange={(e) => setSoyisim(() => e.target.value.replace("i", "İ").toUpperCase())}
                autoComplete="off"
                value={soyisim}
              />


              {/* <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", mt: "1rem", borderBottom: "1px solid gray" }}>
                <Box sx={{ color: pageSituation !== 1 && "lightgray" }}>Aramalarda Görünmeye İzin Veriyorum</Box>
                <Box></Box>
                <Box>
                  <Checkbox
                    sx={{}}
                    id='rehber'
                    name='rehber'
                    disabled={pageSituation !== 1}
                    defaultChecked={RealmApp.currentUser.customData.rehber}
                  />
                </Box>
              </Box> */}

              {/* 
              <Checkbox
                checked={checked}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              /> */}


              {/* <FormControlLabel
                value="end"
                control={<Checkbox />}
                label="End"
                labelPlacement="end"
              /> */}


            </Box>

          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("ProjectMain")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div >
  );


}