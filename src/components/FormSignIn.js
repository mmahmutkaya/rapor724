import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import { supabase } from '../lib/supabase.js'

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import grayTheme from '../lib/muiTheme.js'
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

const theme = grayTheme


export default function SignIn() {

  const { setLayout_Show } = useContext(StoreContext)

  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [subtextError, setSubtextError] = useState()

  const [dialogAlert, setDialogAlert] = useState()
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  async function handleMagicLink() {
    const email = document.getElementById('email')?.value?.trim()
    if (!email) {
      setEmailError("Önce email adresinizi girin")
      return
    }
    const { error } = await supabase.functions.invoke('send-magic-link', {
      body: { email }
    })
    if (error) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Link gönderilemedi, lütfen tekrar deneyin.",
        detailText: error.message
      })
      return
    }
    setMagicLinkSent(true)
  }


  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Google ile giriş yapılamadı, lütfen tekrar deneyin.",
        detailText: error.message
      })
    }
  }

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

      if (isError) return

      // Supabase Auth ile giriş
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials') ||
            error.message.toLowerCase().includes('invalid')) {
          setSubtextError(true)
        } else {
          throw error
        }
      }
      // Başarılı girişte store.js'deki onAuthStateChange appUser'ı otomatik günceller

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
          <Typography
            onClick={() => setLayout_Show('landing')}
            sx={{ cursor: 'pointer', fontSize: '0.8rem', color: '#bbb', mb: 2, alignSelf: 'flex-start', '&:hover': { color: '#333' }, transition: 'color 0.15s' }}
          >
            ← Rapor7/24
          </Typography>
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

            <Divider sx={{ my: 2, fontSize: '0.75rem', color: '#aaa' }}>veya</Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
              }
              sx={{
                textTransform: 'none',
                color: '#3c4043',
                borderColor: '#dadce0',
                bgcolor: '#fff',
                fontWeight: 500,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                '&:hover': { borderColor: '#aaa', bgcolor: '#f8f9fa' }
              }}
            >
              Google ile Giriş Yap
            </Button>

            <Divider sx={{ my: 2, fontSize: '0.75rem', color: '#aaa' }}>veya</Divider>

            {magicLinkSent ? (
              <Typography sx={{ textAlign: 'center', fontSize: '0.88rem', color: '#3D4849', border: '1px solid #d0e8d0', bgcolor: '#f6fff6', p: 1.5, borderRadius: 1 }}>
                Mailinize giriş linki gönderdik — kutunuzu kontrol edin.
              </Typography>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleMagicLink}
                sx={{
                  textTransform: 'none',
                  color: '#3D4849',
                  borderColor: '#ccc',
                  fontSize: '0.9rem',
                  '&:hover': { borderColor: '#3D4849', bgcolor: '#f5f5f5' }
                }}
              >
                Şifresiz link ile giriş yap
              </Button>
            )}

          </Box>
        </Box>
        {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
      </Container>
      {/* </Grid> */}

      {/* </Grid> */}
    </ThemeProvider>
  );
}