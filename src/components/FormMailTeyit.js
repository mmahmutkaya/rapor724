import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'

import * as Realm from "realm-web";


import { useNavigate } from "react-router-dom";

import { DialogAlert } from './general/DialogAlert';


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
// icons
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';



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


// pagesituation 0 - mail göndermeye hazır olduğunda
// pagesituation 1 - mail gönderme tuşuna bastıktan hemen sonra - loading
// pagesituation 2 - sonuç hatalı gelince - error

// pagesituation 3 - mail kodu gönderilmiş, code girme için hazır olduğunda
// pagesituation 4 - mail kodu doğrulama tuşuna bastıktan hemen sonra - loading


export default function FormMailTeyit() {

  const navigate = useNavigate()
  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)
  const { appUser, setAppUser } = useContext(StoreContext)

  const [pageSituation, setPageSituation] = useState(0)

  const [mailCodeError, setMailCodeError] = useState()
  const [detailText, setDetailText] = useState()

  const [email, setEmail] = useState()


  useEffect(() => {
    RealmApp?.currentUser && setEmail(RealmApp?.currentUser?._profile?.data?.email)
  }, [RealmApp?.currentUser])



  async function handleSubmit(event) {

    event.preventDefault();
    let isError = false

    if (pageSituation == 0) {
      try {

        setPageSituation(1)
        const resultMailSended = await RealmApp.currentUser.callFunction("auth_SendConfirmationCode")
        console.log("resultMailSended", resultMailSended)
        setPageSituation(3)
        return

      } catch (error) {
        console.log("error", error)
        setDetailText(error.message)
        console.log("mongo fonksiyon - auth_SendConfirmationCode")
        setPageSituation(2)
        return
      }
    }

    if (pageSituation == 3) {

      try {

        const data = new FormData(event.currentTarget);
        const mailCode = data.get('mailCode')


        //  Mail code frontend kontrolü
        if (mailCode.length < 6) {
          setMailCodeError("En az 6 karakter kullanmalısınız") // biz kabul etsek mongodb oluşturmuyor kullanıcıyı 6 haneden az şifre ile
          isError = true
        }

        if (!mailCode.length) {
          setMailCodeError("Mailinize gelen kodu giriniz")
          isError = true
        }


        // yukarıda hata varsa ilgili useState değerlerini error olarak belirledik fakat henüz react render tazelenmediği için değişmediler kontrol edemiyoruz
        // bu sebeple başlangıçta false değerine sahip isError diye bir js değişkeni oluşturduk, bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }

        setPageSituation(4)
        const resultConfirmation = await RealmApp.currentUser.callFunction("auth_ConfirmationMail", mailCode);
        if (resultConfirmation.includes("teyit edildi")) {
          await RealmApp.currentUser.refreshCustomData()
          console.log("başarılı, navigate(0) yapılacak")
          navigate(0)
        }
        if (resultConfirmation.includes("mail kodu doğru girilmedi")) {
          console.log("mail kodu doğru girilmedi")
          setMailCodeError("Mail kodu doğru girilmedi, kontrol ediniz")
          setPageSituation(3)
        }
        return

      } catch (error) {

        console.log("error", error)
        setDetailText(error.message)
        console.log("Giriş esnasında hata oluştu, sayfayı yenileyiniz, sorun devam ederse lütfen iletişime geçiniz..")
        setPageSituation(2)
        return
      }
    }
  }


  return (
    <>
      {pageSituation === 2 &&
        < DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Mail adresine kod gönderirken beklenmedik bir hata oluştu, sorun devam ederse bizimle irtibata geçiniz."}
          onCloseAction={() => navigate(0)}
          detailText={detailText}
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
              Mail Adresi Doğrulama
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

              {appUser?.email &&
                <TextField
                  // onClick={() => setEmailError()}
                  // error={emailError ? true : false}
                  margin="normal"
                  // required
                  fullWidth
                  // id="email"
                  // label={emailError ? emailError : "Email"}
                  // name="email"
                  // autoComplete="email"
                  // autoFocus
                  disabled={true}
                  defaultValue={appUser?.email}
                />
              }

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


              {appUser?.email &&
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2 }}
                  disabled={pageSituation === 1 || pageSituation === 4}
                >
                  {pageSituation === 0 && "Mail Adresime Kod Gönder"}
                  {pageSituation === 1 && "Mail Gönderiliyor"}
                  {pageSituation === 3 && "Doğrula"}
                  {pageSituation === 4 && "Kod Doğrulanıyor"}
                </Button>
              }

              <Grid container sx={{ display: "grid", justifyContent: "end" }}>

                <Grid item sx={{ display: "grid", justifyContent: "end" }}>
                  <Link
                    onClick={() => {
                      setAppUser()
                      localStorage.removeItem('appUser')
                      // setLayout_Show("newUser")
                      // navigate(0)
                    }}
                    sx={{}}
                    href="#"
                    variant="body2"
                  >
                    Çıkış
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