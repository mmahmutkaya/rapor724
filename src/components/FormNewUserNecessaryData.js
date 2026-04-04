import { useState, useContext } from 'react';
import { StoreContext } from './store.js'

import { useNavigate } from "react-router-dom";
import { DialogAlert } from './general/DialogAlert.js';
import { supabase } from '../lib/supabase.js'

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Person2Icon from '@mui/icons-material/Person2';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import grayTheme from '../lib/muiTheme.js'


const theme = grayTheme


export default function FormSifreYenileme() {

  const { appUser, setAppUser } = useContext(StoreContext)
  const navigate = useNavigate()

  const [dialogAlert, setDialogAlert] = useState()

  const [isim, setIsim] = useState(appUser?.isim ? appUser.isim : "")
  const [soyisim, setSoyisim] = useState(appUser?.soyisim ? appUser.soyisim : "")

  const [isimError, setIsimError] = useState()
  const [soyisimError, setSoyisimError] = useState()

  const [pageSituation, setPageSituation] = useState(1)

  // pageSituation 1 - isim/soyisim girme
  // pageSituation 2 - kaydediliyor - loading


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
    event.preventDefault()

    let isError = false
    if (pageSituation == 1) {

      try {

        const data = new FormData(event.currentTarget);
        const isim = data.get('isim')
        const soyisim = data.get('soyisim')

        if (isim.length < 2) {
          setIsimError("En az 2 karakter girmelisiniz")
          isError = true
        }
        if (!isim.length) {
          setIsimError("Boş bırakılamaz")
          isError = true
        }

        if (soyisim.length < 2) {
          setSoyisimError("En az 2 karakter girmelisiniz")
          isError = true
        }
        if (!soyisim.length) {
          setSoyisimError("Boş bırakılamaz")
          isError = true
        }

        if (isError) return

        setPageSituation(2)

        const { error } = await supabase.auth.updateUser({
          data: { first_name: isim, last_name: soyisim }
        })

        if (error) throw error

        // store.js onAuthStateChange otomatik appUser'ı güncelleyecek
        navigate('/firmalar')

        return

      } catch (error) {

        setPageSituation(1)

        setDialogAlert({
          icon: "warning",
          message: "Beklenmedik bir hata oluştu, sayfa yenilenecek, sorun devam ederse lütfen bizimle irtibata geçiniz.",
          onCloseAction: () => navigate(0)
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
            <Avatar sx={{ m: 1, bgcolor: '#2979ff' }}>
              <Person2Icon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Gerekli Bilgiler
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

              <TextField
                error={isimError ? true : false}
                margin="normal"
                required
                fullWidth
                id="isim"
                label={"İsim"}
                helperText={isimError ? isimError : " "}
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
                error={soyisimError ? true : false}
                margin="normal"
                required
                fullWidth
                name="soyisim"
                label={"Soyisim"}
                helperText={soyisimError ? soyisimError : " "}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: "2rem", mb: "1rem" }}
                disabled={pageSituation === 2 || pageSituation === 4}
              >
                {pageSituation === 1 && "Kaydet"}
                {pageSituation === 2 && "Kaydediliyor"}
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
