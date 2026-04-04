import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert';
import { supabase } from '../lib/supabase.js'

import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import grayTheme from '../lib/muiTheme.js'
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

const theme = grayTheme

// pagesituation 0 - mail göndermeye hazır
// pagesituation 1 - mail gönderiliyor - loading
// pagesituation 3 - kod gönderildi, code girme için hazır
// pagesituation 4 - kod doğrulanıyor - loading

export default function FormMailTeyit() {

  const { appUser, setAppUser } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()
  const [pageSituation, setPageSituation] = useState(0)
  const [mailCodeError, setMailCodeError] = useState()


  async function handleSubmit(event) {
    event.preventDefault();
    let isError = false

    if (pageSituation === 0) {
      try {
        setPageSituation(1)

        const { error } = await supabase.auth.signInWithOtp({
          email: appUser.email,
          options: { shouldCreateUser: false }
        })

        if (error) throw error

        setPageSituation(3)

      } catch (error) {
        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: error?.message || null,
          onCloseAction: () => {
            setDialogAlert()
            setPageSituation(0)
          }
        })
      }
    }

    if (pageSituation === 3) {
      try {
        const data = new FormData(event.currentTarget);
        const mailCode = data.get('mailCode')

        if (!mailCode.length) {
          setMailCodeError("Mailinize gelen kodu giriniz")
          isError = true
        }

        if (isError) return

        setPageSituation(4)

        const { error } = await supabase.auth.verifyOtp({
          email: appUser.email,
          token: mailCode,
          type: 'email'
        })

        if (error) {
          if (error.message?.toLowerCase().includes('token') || error.message?.toLowerCase().includes('otp')) {
            setMailCodeError("Geçersiz veya süresi dolmuş kod")
            setPageSituation(3)
          } else {
            throw error
          }
        }

        // Başarılı: store.js onAuthStateChange otomatik appUser'ı güncelleyecek

      } catch (error) {
        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: error?.message || null,
          onCloseAction: () => {
            setPageSituation(3)
            setDialogAlert()
          }
        })
      }
    }
  }


  return (
    <>
      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
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

              <TextField
                margin="normal"
                fullWidth
                disabled={true}
                defaultValue={appUser?.email}
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
                disabled={pageSituation === 1 || pageSituation === 4}
              >
                {pageSituation === 0 && "Mail Adresime Kod Gönder"}
                {pageSituation === 1 && "Mail Gönderiliyor"}
                {pageSituation === 3 && "Doğrula"}
                {pageSituation === 4 && "Kod Doğrulanıyor"}
              </Button>

              <Grid container sx={{ display: "grid", justifyContent: "end" }}>
                <Grid item sx={{ display: "grid", justifyContent: "end" }}>
                  <Link
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setAppUser(null)
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
        </Container>
      </ThemeProvider>
    </>
  );
}
