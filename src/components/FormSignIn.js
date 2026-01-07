import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';


import { useApp } from "./useApp.js";

import { useNavigate } from "react-router-dom";

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



export default function SignIn() {

  const RealmApp = useApp();
  const navigate = useNavigate()
  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)
  const { setAppUser } = useContext(StoreContext)

  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [subtextError, setSubtextError] = useState()

  const [dialogAlert, setDialogAlert] = useState()


  async function handleSubmit(event) {

    event.preventDefault();

    let isError = false

    try {

      const data = new FormData(event.currentTarget);
      const email = data.get('email')
      const password = data.get('password')


      let emailError
      let passwordError


      //  Email frontend kontrolü
      const validateEmail = (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

      if (!validateEmail(email) && !emailError) {
        setEmailError("Email adresinizi kontrol ediniz")
        emailError = true
        isError = true
      }

      if (!email.length && !emailError) {
        setEmailError("Boş bırakılamaz")
        emailError = true
        isError = true
      }




      //  Password frontend kontrolü
      if (password.length < 8 && !passwordError) {
        setPasswordError("En az 8 karakter kullanmalısınız")
        passwordError = true
        isError = true
      }

      if (!password.length && !passwordError) {
        setPasswordError("Boş bırakılamaz")
        passwordError = true
        isError = true
      }



      // yukarıda hata varsa ilgili useState değerlerini error olarak belirledik fakat henüz react render tazelenmediği için değişmediler kontrol edemiyoruz
      // bu sebeple başlangıçta false değerine sahip isError diye bir js değişkeni oluşturduk, bu işi görmeye çalışıyoruz
      if (isError) {
        console.log("Hata var ve alt satırda durduruldu")
        return
      }


      // const credentials = Realm.Credentials.emailPassword(email, password);
      // await RealmApp.logIn(credentials);
      // if (RealmApp.currentUser) {
      //   console.log("Giriş işlemi başarılı")
      //   navigate(0)
      //   return
      // }

      const response = await fetch(`api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ email, password })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }


      // form validation - backend
      if (responseJson.errorObject) {
        let { errorObject } = responseJson
        setEmailError(errorObject.emailError)
        setPasswordError(errorObject.passwordError)
        return
      }



      if (responseJson.user) {

        // save the user to local storage
        localStorage.setItem('appUser', JSON.stringify(responseJson.user))

        // save the user to react context
        setAppUser(responseJson.user)
        // navigate(0)
      }


    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }

  }


  return (
    <ThemeProvider theme={theme}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

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
            Mevcut Kullanıcı Girişi
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

            <TextField
              // onClick={() => setEmailError()}
              error={emailError ? true : false}
              margin="normal"
              required
              fullWidth
              id="email"
              label={"Email"}
              helperText={emailError ? emailError : null}
              name="email"
              autoComplete="email"
              autoFocus
              // value={email}
              onKeyDown={() => {
                setEmailError()
                setSubtextError()
              }}
            // onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              // onClick={() => setPasswordError()}
              error={passwordError ? true : false}
              margin="normal"
              required
              fullWidth
              name="password"
              label={"Şifre"}
              helperText={passwordError ? passwordError : null}
              type="password"
              id="password"
              // value={password}
              onKeyDown={() => {
                setPasswordError()
                setSubtextError()
              }}
            // onChange={(e) => setPassword(e.target.value)}
            // autoComplete="current-password"
            />

            <Typography sx={{ ml: "0.5rem", color: subtextError ? "red" : "white", fontSize: "0.9rem" }}>
              *Kullanıcı adı veya şifre hatalı
            </Typography>


            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 2 }}
            >
              GİRİŞ
            </Button>

            <Grid container>

              <Grid item xs>
                <Link onClick={() => setLayout_Show("sifreYenileme")} href="#" variant="body2">
                  Şifre Yenileme
                </Link>
              </Grid>

              <Grid item>
                <Link onClick={() => setLayout_Show("newUser")} href="#" variant="body2">
                  Yeni Kullanıcı Kaydı
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
  );
}