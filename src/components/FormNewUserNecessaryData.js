import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'

import { useNavigate } from "react-router-dom";
import { DialogAlert } from './general/DialogAlert.js';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Person2Icon from '@mui/icons-material/Person2';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';



const theme = createTheme();


export default function FormSifreYenileme() {

  // const RealmApp = useApp();
  const { appUser, setAppUser } = useContext(StoreContext)
  const navigate = useNavigate()

  const [dialogAlert, setDialogAlert] = useState()

  const [isim, setIsim] = useState(appUser?.isim ? appUser.isim : "")
  const [soyisim, setSoyisim] = useState(appUser?.soyisim ? appUser.soyisim : "")

  const [isimError, setIsimError] = useState()
  const [soyisimError, setSoyisimError] = useState()

  const [pageSituation, setPageSituation] = useState(1)


  // pageSituation 1 - email ve şifreler girilirken
  // pageSituation 2 - email ve şifre gönderiliyor - loading

  // pageSituation 3 - email ve şifre gönderildi - firma moduna girildi
  // pageSituation 4 - firma gönderiliyor - loading


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
        const isim = data.get('isim')
        const soyisim = data.get('soyisim')
        // let rehber = data.get('rehber')
        // rehber = rehber ? true : false



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



        // useState deki bir değere bakamıyoruz, çünkü henüz render tazelenmediği için true görünmüyorlar, onun için isError diye bi değişken ile bu işi görmeye çalışıyoruz
        if (isError) {
          console.log("Hata var ve alt satırda durduruldu")
          return
        }


        // sorgu olacaksa
        setPageSituation(2)


        const response = await fetch('/api/user/savenecessaryuserdata', {
          method: 'POST',
          headers: {
            'email': appUser.email,
            'token': appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isim, soyisim })
        })

        const responseJson = await response.json()


        if (!response.ok) {
          throw new Error(responseJson.error);
        }


        if (responseJson.errorObject) {
          setIsimError(responseJson.errorObject.isimError)
          setSoyisimError(responseJson.errorObject.soyisimError)
          setPageSituation(1)
        }


        if (responseJson.user) {

          // save the user to local storage
          localStorage.setItem('appUser', JSON.stringify(responseJson.user))

          // save the user to react context
          setAppUser(responseJson.user)
          // navigate(0)
        }


        // console.log("result", result)
        // await RealmApp.currentUser.refreshCustomData()
        navigate('/firmalar')

        return

      } catch (error) {

        setPageSituation(1)

        console.log("error", error)

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
            <Avatar sx={{ m: 1, bgcolor: '#2979ff' }}>
              <Person2Icon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Gerekli Bilgiler
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

              <TextField
                // onClick={() => setIsimError()}
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



              {/* <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", mt: "1.5rem", mx: "0.2rem", borderBottom: "1px solid gray" }}>
                <Typography sx={{ ml: "0.2rem", color: "rgb(60, 60, 60)" }}>Aramalarda Görünmeye İzin Veriyorum</Typography>
                <Box></Box>
                <Box>
                  <Checkbox
                    id='rehber'
                    name='rehber'
                    defaultChecked
                  />
                </Box>
              </Box> */}



              {/* <Autocomplete
                value={value}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setValue({
                      title: newValue,
                    });
                  } else if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    setValue({
                      title: newValue.inputValue,
                    });
                  } else {
                    setValue(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  const { inputValue } = params;
                  // Suggest the creation of a new value
                  const isExisting = options.some((option) => inputValue === option.title);
                  if (inputValue !== '' && !isExisting) {
                    filtered.push({
                      inputValue,
                      title: `Firma Ekle --> ${inputValue}`,
                    });
                  }

                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                id="firma"
                options={firmalar}
                getOptionLabel={(option) => {
                  // Value selected with enter, right from the input
                  if (typeof option === 'string') {
                    return option;
                  }
                  // Add "xxx" option created dynamically
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  // Regular option
                  return option.title;
                }}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      {option.title}
                    </li>
                  );
                }}
                sx={{}}
                freeSolo
                renderInput={(params) => <TextField
                  {...params}
                  margin="normal"
                  required
                  label={firmaError ? firmaError : "Firma"}
                />}
              /> */}



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
                    onClick={() => {
                      setAppUser()
                      localStorage.removeItem('appUser')
                      navigate(0)
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