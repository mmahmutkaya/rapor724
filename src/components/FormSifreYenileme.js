import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'


import { useNavigate } from "react-router-dom";
import { DialogAlert } from './general/DialogAlert';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import backgroundPicture from '../public/background_image_PM.png';



function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();



export default function FormSifreYenileme() {

  const navigate = useNavigate()
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [email_state, setEmail_state] = useState()
  const [password_state, setPassword_state] = useState()

  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [mailCodeError, setMailCodeError] = useState()
  const [pageSituation, setPageSituation] = useState(1)


  // pageSituation 1 - email ve şifreler girilirken
  // pageSituation 2 - email ve şifre gönderiliyor - loading

  // pageSituation 3 - email ve şifre gönderildi - mailCode moduna girildi
  // pageSituation 4 - mailCode gönderiliyor - loading



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
        const email = data.get('email')
        const password = data.get('password')
        const password2 = data.get('password2')


        // Email frontend kontrolü
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


        //  Password frontend kontrolü
        if (password.length < 6) {
          setPasswordError("En az 6 karakter kullanmalısınız")
          isError = true
        }


        if (!password.length) {
          setPasswordError("Şifre giriniz")
          isError = true
        }


        //  Password2 frontend kontrolü
        if (password !== password2) {
          setPasswordError("Şifreler uyuşmuyor")
          isError = true
        }


        // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        setPageSituation(2)
        // const credentialsApiKey = Realm.Credentials.apiKey("2FE7NrzR4gq9hUQLtuOsrp6lBDhDE9wp80ICWPBXxAnF6Bf5oJB2e3aYkz2rS3SH")
        // await RealmApp.logIn(credentialsApiKey)
        // await RealmApp.currentUser.callFunction("auth_SendConfirmationCode_PasswordReset", { email })
        // await RealmApp.currentUser.logOut()


        setEmail_state(email)
        setPassword_state(password)
        setPageSituation(3)


        return

      } catch (error) {

        setPageSituation(1)

        console.log("error", error)

        if (error.message.includes("Mail adresi hatalı (backend)")) {
          setEmailError("Mail adresini kontrol ediniz")
          return
        }

        if (error.message.includes("Bu email adresi sistemde kayıtlı değil")) {
          setEmailError("Bu mail adresi sistemde kayıtlı gözükmüyor.")
          return
        }

        setDialogAlert({
          icon: "warning",
          message: "Beklenmedik bir hata oluştu, sayfa yenilenecek, sorun devam ederse lütfen bizimle irtibata geçiniz.",
          onCloseAction: () => navigate(0)
          // onCloseAction: () => setDialogAlert()
        })

      }

    }


    if (pageSituation == 3) {

      try {

        const data = new FormData(event.currentTarget);
        const mailCode = data.get('mailCode')

        // YUKARIDA TAKILIP BİTMEDİYSE - MAİL CODE GİRME MODU BAŞLIYOR

        // Mail code frontend kontrolü
        if (mailCode.length !== 6) {
          setMailCodeError("6 karakter kullanmalısınız")
          isError = true
        }

        if (!mailCode.length) {
          setMailCodeError("Mailinize gelen kodu giriniz")
          isError = true
        }


        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        setPageSituation(4)
        // await RealmApp.emailPasswordAuth.callResetPasswordFunction({ email: email_state, password: password_state }, { mailCode })

        setDialogAlert({
          icon: "success",
          message: "Şifreniz başarı ile değiştirildi",
          onCloseAction: () => navigate(0)
          // onCloseAction: () => setDialogAlert()
        })

      } catch (error) {

        setPageSituation(3)
        console.log("error", error)

        if (error.message.includes("failed to reset password for user")) {
          setMailCodeError("Kod hatalı girildi")
          return
        }

        setDialogAlert({
          icon: "warning",
          message: "Mail kodu girilmesi sırasında hata oluştu, sayfa yenilenecek, sorun devam ederse lütfen bizimle irtibata geçiniz.",
          onCloseAction: () => navigate(0)
          // onCloseAction: () => setDialogAlert()
        })


      }


    }

  }




  return (

    <>

      {dialogAlert &&
        < DialogAlert
          dialogIcon={dialogAlert.icon}
          dialogMessage={dialogAlert.message}
          onCloseAction={dialogAlert.onCloseAction}
        />
      }

      <ThemeProvider theme={theme}>
        {/* <Grid container  > */}
        {/* 
        <Grid item sx={{ zIndex: "-1", }} >
          <Image
            src={backgroundPicture}
            fill
            // width={500}
            // height={500}

            alt="Background Image"
          />
        </Grid> */}

        {/* <Grid item sx={{ border: "2px solid red", borderRadius: "25px" }}> */}
        <Container component="main" maxWidth="xs">
          {/* <CssBaseline /> */}
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: "white",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Şifre Yenileme
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

              <TextField
                // onClick={() => setEmailError()}
                error={emailError ? true : false}
                margin="normal"
                required
                fullWidth
                id="email"
                label={emailError ? emailError : "Email"}
                name="email"
                autoComplete="off"
                autoFocus
                disabled={pageSituation !== 1}
                onKeyDown={() => setEmailError()}
              />


              <TextField
                error={passwordError ? true : false}
                margin="normal"
                required
                fullWidth
                name="password"
                label={passwordError ? passwordError : "Şifre"}
                type="password"
                id="password"
                disabled={pageSituation !== 1}
                onKeyDown={() => setPasswordError()}
                autoComplete="off"
              />


              <TextField
                error={passwordError ? true : false}
                margin="normal"
                required
                fullWidth
                name="password2"
                label={passwordError ? passwordError : "Şifre Tekrarı"}
                type="password"
                id="password2"
                disabled={pageSituation !== 1}
                onKeyDown={() => setPasswordError()}
                autoComplete="off"
              />


              <TextField
                onKeyDown={() => setMailCodeError()}
                error={mailCodeError ? true : false}
                margin="normal"
                required
                fullWidth
                name="mailCode"
                label={mailCodeError ? mailCodeError : "Mail Adresinize Gelen Kodu Giriniz"}
                type="text"
                id="mailCode"
                disabled={pageSituation !== 3}
                autoComplete="off"
              />


              <Typography sx={{ mt: "1rem", ml: "0.5rem", fontSize: "0.9rem", color: pageSituation >= 3 ? "#3371FF" : "white" }}>
                *Mail gönderildi, 'spam' kutusunu da kontrol ediniz
              </Typography>


              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                disabled={pageSituation === 2 || pageSituation === 4}
              >
                {pageSituation === 1 && "Mail Adresine Kod Gönder"}
                {pageSituation === 2 && "Gönderiliyor"}
                {pageSituation === 3 && "Maile Gelen Kodu Gönder"}
                {pageSituation === 4 && "Kod Gönderiliyor"}
              </Button>

              <Grid container>
                <Grid item xs>
                  <Link onClick={() => setLayout_Show("newUser")} href="#" variant="body2">
                    Yeni Kullanıcı Kaydı
                  </Link>
                </Grid>
                <Grid item>
                  <Link onClick={() => setLayout_Show("login")} href="#" variant="body2">
                    {"Mevcut Kullanıcı Giriş"}
                  </Link>
                </Grid>
              </Grid>

            </Box>
          </Box>
          {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
        </Container>
        {/* </Grid> */}

        {/* </Grid> */}
      </ThemeProvider>

    </>
  );
}