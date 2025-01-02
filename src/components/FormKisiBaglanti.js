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
import { useQueryClient } from '@tanstack/react-query'



export default function P_FormKisiBaglanti({ setShow }) {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  const queryClient = useQueryClient()

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


        //  Email frontend kontrolü
        const validateEmail = (email) => {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        };

        if (!validateEmail(email)) {
          setEmailError("Email adresinizi kontrol ediniz")
          isError = true
        }

        if (!email.length) {
          setEmailError("Email giriniz")
          isError = true
        }

        if (email === RealmApp.currentUser._profile.data.email) {
          setEmailError("Kendi mail adresinizi girmiş gözüküyorsunuz")
          isError = true
        }


        // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        // sorgu olacaksa
        setPageSituation(2)
        const result = await RealmApp.currentUser.callFunction("collectionNetworkUser", { functionName: "kisiBaglantiTalep", otherUserEmail: email })
        console.log("result", result)
        if (result.isError) {
          result.emailError && setEmailError(result.emailError)
          return
        }

        let { otherUserObj } = result
        if (otherUserObj) {
          queryClient.setQueryData(['networkUsers', RealmApp.currentUser._profile.data.email], (networkUsers) => [...networkUsers, otherUserObj])
        }

        setShow("Main")
        return


      } catch (error) {

        setPageSituation(1)

        console.log("error", error)


        let hataMesaj
        if (error.message.includes("-mesajSplit-")) {
          hataMesaj = error.message.split("-mesajSplit-")[1]
        }


        console.log("error.message", error.message)
        console.log("hataMesaj", hataMesaj)

        setDialogAlert({
          icon: "warning",
          message: hataMesaj ? hataMesaj : "HATA - " + error.message,
          onCloseAction: () => setDialogAlert(),
          // onCloseAction: () => setDialogAlert()
          detailText: hataMesaj && hataMesaj.length !== error.message.length ? error.message : null
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
          detailText={dialogAlert.detailText}
        />
      }

      <Dialog
        PaperProps={{ sx: { width: "60%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("Main")} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Başka Biri ile Bağlantı Kurma
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
            <Button onClick={() => setShow("Main")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div >
  );


}