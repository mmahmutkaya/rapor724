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

  const [emailError, setEmailError] = useState()

  const [pageSituation, setPageSituation] = useState(1)


  // pageSituation 1 - email ve şifreler girilirken
  // pageSituation 2 - email ve şifre gönderiliyor - loading

  // pageSituation 3 - email ve şifre gönderildi - firma moduna girildi
  // pageSituation 4 - firma gönderiliyor - loading



  const handleSubmit = async (event) => {


    event.preventDefault()

    let isError = false
    if (pageSituation == 1) {


      try {

        const data = new FormData(event.currentTarget);
        const email = data.get('email')


        // //  Email frontend kontrolü
        // const validateEmail = (email) => {
        //   return String(email)
        //     .toLowerCase()
        //     .match(
        //       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        //     );
        // };

        // if (!validateEmail(email)) {
        //   setEmailError("Email adresinizi kontrol ediniz")
        //   isError = true
        // }

        // if (!email.length) {
        //   setEmailError("Email giriniz")
        //   isError = true
        // }


        // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        console.log("email", email)
        // sorgu olacaksa
        setPageSituation(2)
        await RealmApp.currentUser.callFunction("collectionDugumler", { functionName: "kisiBaglantiTalep", baglantiTalepEmail: email })

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

        if (error.message.includes("Email adresinizi kontrol ediniz")) {
          setEmailError("Email adresinizi kontrol ediniz")
          return
        }

        if (error.message.includes("Email adresi giriniz")) {
          setEmailError("Email adresi giriniz")
          return
        }

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
                variant="standard"
                error={emailError ? true : false}
                margin="normal"
                required
                fullWidth
                id="email"
                label={emailError ? emailError : "Email"}
                name="email"
                autoComplete="email"
                autoFocus
                // value={email}
                onKeyDown={() => setEmailError()}
              // onChange={(e) => setEmail(e.target.value)}
              />


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