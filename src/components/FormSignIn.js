import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'

import * as Realm from "realm-web";
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
  const { isProject, setIsProject } = useContext(StoreContext)
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)

  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [subtextError, setSubtextError] = useState()


  async function handleSubmit(event) {

    event.preventDefault();

    let isError = false

    try {

      const data = new FormData(event.currentTarget);
      const email = data.get('email')
      const password = data.get('password')


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




      //  Password frontend kontrolü
      if (password.length < 6) {
        setPasswordError("En az 6 karakter kullanmalısınız") // biz kabul etsek mongodb oluşturmuyor kullanıcıyı 6 haneden az şifre ile
        isError = true
      }

      if (!password.length) {
        setPasswordError("Şifre giriniz")
        isError = true
      }



      // yukarıda hata varsa ilgili useState değerlerini error olarak belirledik fakat henüz react render tazelenmediği için değişmediler kontrol edemiyoruz
      // bu sebeple başlangıçta false değerine sahip isError diye bir js değişkeni oluşturduk, bu işi görmeye çalışıyoruz
      if (isError) {
        console.log("Hata var ve alt satırda durduruldu")
        return
      }


      const credentials = Realm.Credentials.emailPassword(email, password);
      await RealmApp.logIn(credentials);
      if (RealmApp.currentUser) {
        console.log("Giriş işlemi başarılı")
        navigate(0)
        return
      }

      setSubtextError("Kullanıcı adı veya şifre hatalı")
      isError = true

    } catch (error) {

      console.log("error.message", error.message)

      if (error.message.includes("unauthorized")) {
        setSubtextError("Kullanıcı adı veya şifre hatalı")
        isError = true
      }

      return

    }

  }


  return (
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
              label={emailError ? emailError : "Email"}
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
              label={passwordError ? passwordError : "Şifre"}
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