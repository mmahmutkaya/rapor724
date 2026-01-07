import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';


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


export default function FormSignUp() {

  const navigate = useNavigate()
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)
  const { setAppUser } = useContext(StoreContext)


  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [passwordError2, setPasswordError2] = useState()
  const [dialogAlert, setDialogAlert] = useState()


  async function handleSubmit(event) {

    event.preventDefault();

    let isError = false

    try {

      const data = new FormData(event.currentTarget);
      const email = data.get('email')
      const password = data.get('password')
      const password2 = data.get('password2')


      let emailError
      let passwordError
      let passwordError2


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


      if (!password2.length && !passwordError2) {
        setPasswordError2("Boş bırakılamaz")
        passwordError2 = true
        isError = true
      }


      //  Password2 frontend kontrolü
      if (password !== password2 && !passwordError2) {
        setPasswordError2("Şifreler uyuşmuyor")
        passwordError2 = true
        isError = true
      }




      // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
      if (isError) {
        console.log("Hata var ve alt satırda durduruldu")
        return
      }


      // console.log("email", email)
      // console.log("password", password)
      // console.log("password2", password2)


      // await RealmApp.emailPasswordAuth.registerUser({ email, password });
      // const credentials = Realm.Credentials.emailPassword(email, password);
      // await RealmApp.logIn(credentials);


      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
        setPasswordError2(errorObject.passwordError2)
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
            backgroundColor: "white"
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Yeni Kullanıcı Kaydı
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
              helperText={emailError ? emailError : " "}
              name="email"
              autoComplete="email"
              autoFocus
              // value={email}
              onKeyDown={() => setEmailError()}
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
              helperText={passwordError ? passwordError : " "}
              type="password"
              id="password"
              // value={password}
              onKeyDown={() => setPasswordError()}
            // onChange={(e) => setPassword(e.target.value)}
            // autoComplete="current-password"
            />


            <TextField
              // onClick={() => setPasswordError2()}
              error={passwordError2 ? true : false}
              margin="normal"
              required
              fullWidth
              name="password2"
              label={"Şifre Tekrarı"}
              helperText={passwordError2 ? passwordError2 : " "}
              type="password"
              id="password2"
              // value={password2}
              onKeyDown={() => setPasswordError2()}
            // onChange={(e) => setPassword2(e.target.value)}
            // autoComplete="current-password"
            />



            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Gönder
            </Button>


            <Grid container>
              <Grid item xs>
                <Link onClick={() => setLayout_Show("sifreYenileme")} href="#" variant="body2">
                  Şifre Yenileme
                </Link>
              </Grid>
              <Grid item>
                <Link onClick={() => setLayout_Show("login")} href="#" variant="body2">
                  {"Mevcut Kullanıcı Girişi"}
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