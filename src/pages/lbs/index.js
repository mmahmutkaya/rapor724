
import { useState, useContext, useEffect } from 'react'
import { StoreContext } from '../../components/store'
import { DialogAlert } from '../../components/general/DialogAlert';
import { useNavigate } from 'react-router-dom'

import FormLbsCreate from '../../components/FormLbsCreate'
import FormLbsUpdate from '../../components/FormLbsUpdate'

import UndoIcon from '@mui/icons-material/Undo';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PinIcon from '@mui/icons-material/Pin';
import EditIcon from '@mui/icons-material/Edit';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import Divider from '@mui/material/Divider';
import { AppBar, Select } from '@mui/material';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';


function HeaderLbs({ setShow, nameMode, setNameMode, codeMode, setCodeMode, openSnackBar, setOpenSnackBar, snackBarMessage, setSnackBarMessage }) {

  const navigate = useNavigate()
  const [isPending, setIsPending] = useState()

  const { RealmApp, appUser, setAppUser, drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedLbs, setSelectedLbs } = useContext(StoreContext)



  const nameMode_name = () => {
    switch (nameMode) {
      case null:
        return (
          "i+k"
        )
      case false:
        return (
          "ism"
        )
      case true:
        return (
          "kod"
        )
      default:
        return (
          "i+k"
        )
    }
  }

  const codeMode_name = () => {
    switch (codeMode) {
      case null:
        return (
          "ksa"
        )
      case false:
        return (
          "tam"
        )
      case true:
        return (
          "yok"
        )
      default:
        return (
          "ksa"
        )
    }
  }




  function handleTextMode() {

    switch (nameMode) {
      case null:
        return (
          setNameMode(false)
        )
      case false:
        return (
          setNameMode(true)
        )
      case true:
        return (
          setNameMode(null)
        )
      default:
        return (
          // nameMode_name = "i+k",
          setNameMode(false)
        )
    }

  }

  function handleCodeMode() {

    switch (codeMode) {
      case null:
        return (
          setCodeMode(false)
        )
      case false:
        return (
          setCodeMode(true)
        )
      case true:
        return (
          setCodeMode(null)
        )
      default:
        return (
          // nameMode_name = "i+k",
          setCodeMode(false)
        )
    }

  }



  async function handleLbsUnclicked() {

    // aslında gerek yok zaten lbs yok ama olsun
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    setSelectedLbs()
  }


  async function handleSwitchForMahal(event) {

    try {

      if (!selectedLbs) {
        console.log("alttaki satırda --return-- oldu")
        return
      }

      // bu kontrol backend de ayrıca yapılıyor
      let text = selectedLbs.code + "."
      if (selectedProje.lbs.find(item => item.code.indexOf(text) === 0)) {
        setOpenSnackBar(true)
        setSnackBarMessage("Alt başlığı bulunan başlıklar mahal eklemeye açılamaz.")
        return
      }

      setIsPending(true)

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/togglelbsformahal`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id, switchValue: event.target.checked ? true : false })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }

      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs(responseJson.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))
      setIsPending(false)

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      setIsPending(false)
      return

    }

  }



  async function handleLbsDelete() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    try {

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedProje?.lbs.find(item => item.code.indexOf(selectedLbs.code + ".") === 0)) {
        setOpenSnackBar(true)
        setSnackBarMessage("Alt başlığı bulunan başlıklar silinemez.")
        return
      }

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedLbs.openForMahal) {
        setOpenSnackBar(true)
        setSnackBarMessage("Mahal eklemeye açık başlıklar silinemez.")
        return
      }

      // const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "deleteLbs", _projeId: selectedProje._id, _lbsId: selectedLbs._id });

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/deletelbs`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }


      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs()

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return
    }
  }



  async function handleMoveLbsUp() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsUp -1 ")
      return
    }


    try {

      let _selectedLbs = JSON.parse(JSON.stringify(selectedLbs))

      let level
      let sortNumber

      level = _selectedLbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedLbs.code.split(".")[level])

      // bu kontrol backend de ayrıca yapılmalı - kontrol
      if (sortNumber == 1) {
        console.log("Zaten en üstte, db sorguya gitmedi")
        return
      }

      // const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "moveLbsUp", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/movelbsup`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }

      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs(responseJson.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return
    }
  }




  async function handleMoveLbsDown() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsDown")
      return
    }


    try {

      let _lbs = JSON.parse(JSON.stringify(selectedProje.lbs))
      let _selectedLbs = JSON.parse(JSON.stringify(selectedLbs))

      let level
      let sortNumber
      let isNecessary = false

      level = _selectedLbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedLbs.code.split(".")[level])

      _lbs.map(oneLbs => {
        if (Number(oneLbs.code.split(".")[level]) > sortNumber) {
          isNecessary = true
        }
      })

      if (!isNecessary) {
        console.log("Zaten en altta, db sorguya gitmedi")
        return
      }


      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/movelbsdown`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }

      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs(responseJson.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return
    }
  }




  async function handleMoveLbsLeft() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsLeft1")
      return
    }

    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/movelbsleft`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }

      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs(responseJson.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return
    }
  }




  async function handleMoveLbsRight() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsRight")
      return
    }

    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/movelbsright`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, lbsId: selectedLbs._id })
      })


      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.snackMessage) {
        setOpenSnackBar(true)
        setSnackBarMessage(responseJson.snackMessage)
        return
      }

      if (responseJson.lbs) {
        setSelectedProje(proje => {
          proje.lbs = responseJson.lbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için
      setSelectedLbs(responseJson.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

      return
    }
  }



  const openLbsCreateForm = () => {
    if (selectedLbs?.openForMahal) {
      setOpenSnackBar(true)
      setSnackBarMessage("Mahal eklemeye açılan başlıklara alt başlık eklenemez.")
      return
    }
    if (selectedLbs?.code?.split(".").length === 8) {
      setOpenSnackBar(true)
      setSnackBarMessage("Daha fazla alt başlık ekleyemezsiniz")
      return
    }
    setShow("FormLbsCreate")
  }




  return (
    <Paper>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* {showDialog &&
        <DialogAlert dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      } */}


      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, mt: topBarHeight, ml: { md: `${drawerWidth}px` }, backgroundColor: "white" }}>

        <Grid
          container
          justifyContent="space-between"
          sx={{ alignItems: "center", padding: "0rem 0.25rem", height: subHeaderHeight }}
        >

          {/* başlık sol */}
          <Box sx={{ display: { xs: 'none', sm: "grid" }, gridAutoFlow: "column", alignItems: "center" }}>


            <Grid item sx={{ ml: "0.5rem" }}>
              <Typography
                color="black"
                variant="h6"
                noWrap
                component="div"
              >
                Mahal Başlıkları (LBS)
              </Typography>
            </Grid>


          </Box>


          {/* başlık sağ */}
          <Grid item>
            <Grid container spacing={0.5} sx={{ alignItems: "center" }}>

              {/* codeMode değiştir */}
              <Grid item onClick={handleCodeMode} sx={{ cursor: "pointer", color: "#595959" }}>
                <Grid container direction={"column"} >
                  <Grid item>
                    <Typography sx={{ height: "1rem", width: "1rem", mb: "0.3rem" }} >{codeMode_name()}</Typography>
                  </Grid>
                  <Grid item sx={{ height: "1rem", width: "1rem", mb: "0.5rem" }}>
                    <PinIcon variant="contained" sx={{
                      fontSize: "1.55rem"
                    }} />
                  </Grid>
                </Grid>
              </Grid>

              {/* nameMode değiştir */}
              <Grid item onClick={handleTextMode} sx={{ cursor: "pointer", ml: "1.5rem", color: "#595959" }}>
                <Grid container direction={"column"} >
                  <Grid item>
                    <Typography sx={{ height: "1rem", width: "1rem", mb: "0.3rem" }} >{nameMode_name()}</Typography>
                  </Grid>
                  <Grid item sx={{ height: "1rem", width: "1rem", mb: "0.5rem" }}>
                    <FontDownloadIcon variant="contained" sx={{
                      fontSize: "1.4rem"
                    }} />
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ ml: "2rem" }} color={"#b3b3b3"} orientation="vertical" flexItem />

              <Grid item >
                <IconButton onClick={() => handleLbsUnclicked()} aria-label="lbsUncliced">
                  <ClearOutlined variant="contained" sx={{
                    color: !selectedLbs ? "lightgray" : "red",
                  }} />
                </IconButton>
              </Grid>

              <Grid item >
                <Grid container direction={"column"} alignItems={"center"}>
                  <Grid item >
                    <Typography sx={{ color: !selectedLbs ? "lightgray" : "rgb(24,24,24)" }} >mahal</Typography>
                  </Grid>
                  <Grid item >
                    <AntSwitch disabled={!selectedLbs || isPending} checked={selectedLbs?.openForMahal ? true : false} onChange={handleSwitchForMahal} />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item onClick={() => handleMoveLbsUp()}>
                <IconButton aria-label="moveUp">
                  <KeyboardArrowUpIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveLbsDown()}>
                <IconButton aria-label="moveDown">
                  <KeyboardArrowDownIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveLbsLeft()}>
                <IconButton aria-label="moveLeft">
                  <KeyboardArrowLeftIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveLbsRight()}>
                <IconButton aria-label="moveRight">
                  <KeyboardArrowRightIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => setShow("FormLbsUpdate")}>
                <IconButton aria-label="edit" disabled={!selectedLbs ? true : false}>
                  <EditIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleLbsDelete()} >
                <IconButton aria-label="delete">
                  <DeleteIcon variant="contained" color="error" sx={{ color: !selectedLbs ? "lightgray" : "rgb(139,0,0)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={() => openLbsCreateForm()} disabled={selectedLbs?.code.split(".").length == 8 ? true : false} aria-label="addLbs">
                  <AddCircleOutlineIcon variant="contained" color={selectedLbs?.code.split(".").length == 8 ? " lightgray" : "success"} />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}



const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));


export default function P_Lbs() {

  const navigate = useNavigate()

  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState("")

  const { subHeaderHeight } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedLbs, setSelectedLbs } = useContext(StoreContext)

  const [show, setShow] = useState()
  const [nameMode, setNameMode] = useState(false)
  const [codeMode, setCodeMode] = useState(true)


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])


  const handleSelectLbs = (lbs) => {
    setSelectedLbs(lbs)
  }

  let level


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  //   const [openSnackBar, setOpenSnackBar] = useState(false)
  // const [snackBarMessage, setSnackBarMessage] = useState("")



  return (
    <Grid container direction="column" spacing={0} sx={{ mt: subHeaderHeight }}>

      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>


      <Grid item  >
        <HeaderLbs
          setShow={setShow}
          nameMode={nameMode} setNameMode={setNameMode}
          codeMode={codeMode} setCodeMode={setCodeMode}
          openSnackBar={openSnackBar} setOpenSnackBar={setOpenSnackBar}
          snackBarMessage={snackBarMessage} setSnackBarMessage={setSnackBarMessage}
        />
      </Grid>


      {show == "FormLbsCreate" &&
        <Grid item >
          <FormLbsCreate
            setShow={setShow}
            selectedProje={selectedProje} setSelectedProje={setSelectedProje}
            selectedLbs={selectedLbs} setSelectedLbs={setSelectedLbs}
            setOpenSnackBar={setOpenSnackBar}
            setSnackBarMessage={setSnackBarMessage}
          />
        </Grid>
      }

      {show == "FormLbsUpdate" &&
        <Grid item >
          <FormLbsUpdate
            setShow={setShow}
            selectedProje={selectedProje} setSelectedProje={setSelectedProje}
            selectedLbs={selectedLbs} setSelectedLbs={setSelectedLbs}
            setOpenSnackBar={setOpenSnackBar}
            setSnackBarMessage={setSnackBarMessage}
          />
        </Grid>
      }


      {!selectedProje?.lbs?.length &&
        <Stack sx={{ width: '100%', padding: "0.5rem" }} spacing={2}>
          <Alert severity="info">
            Yukarıdaki "+" tuşuna basarak "Mahal Başlığı" oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {selectedProje?.lbs?.length > 0 &&
        < Stack sx={{ width: '60rem', padding: "0.5rem" }} spacing={0}>

          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black", color: "white" }}>

            </Box>
            <Box sx={{ backgroundColor: "black", color: "white" }}>
              {selectedProje.name}
            </Box>
          </Box>


          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>

            <Box sx={{ backgroundColor: "black" }}>

            </Box>

            {/* {console.log("selectedProje?.lbs?.length", selectedProje?.lbs?.length)} */}
            <Box display="grid">

              {
                selectedProje.lbs.sort(function (a, b) {
                  var nums1 = a.code.split(".");
                  var nums2 = b.code.split(".");

                  for (var i = 0; i < nums1.length; i++) {
                    if (nums2[i]) { // assuming 5..2 is invalid
                      if (nums1[i] !== nums2[i]) {
                        return nums1[i] - nums2[i];
                      } // else continue
                    } else {
                      return 1; // no second number in b
                    }
                  }
                  return -1; // was missing case b.len > a.len
                }).map((theLbs, index) => {

                  // theLbs = { _id, code, name }

                  level = theLbs?.code?.split(".").length

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: (level - 1) == 0 ? "1rem 1fr" : "1rem repeat(" + (level - 1) + ", 1rem) 1fr", // baştaki mahal var mı yok mu için
                        "&:hover .hoverTheLbsLeft": {
                          visibility: "visible",
                          color: "red",
                        },

                      }}>

                      {Array.from({ length: (level - 1) > -1 ? (level - 1) : 0 }).map((_item, index) => {
                        return (
                          // <Box sx={{ backgroundColor: color(index + 1).bg, borderLeft: "1px solid " + color("border") }}></Box>
                          <Box key={index} sx={{ backgroundColor: color(index + 1).bg, borderLeft: "1px solid " + color("border") }}></Box>
                        )
                      })}


                      <Box sx={{ position: "relative", backgroundColor: color(level)?.bg, borderLeft: "1px solid " + color("border") }}>

                        {theLbs.openForMahal &&
                          // lbs mahale açıksa - var olan mevcut kutunun içinde beliren sarı kutu
                          <Grid container sx={{ position: "absolute", borderRadius: "10%", backgroundColor: "#65FF00", top: "20%", left: "30%", width: "0.7rem", height: "0.7rem" }}>

                            {/* mahal kayıtlı ise sarı kutunun içinde beliren siyah nokta */}
                            {theLbs.includesMahal &&
                              <Grid item sx={{ position: "relative", width: "100%", height: "100%" }}>

                                <Box sx={{ position: "absolute", borderRadius: "50%", backgroundColor: "red", top: "25%", left: "25%", width: "50%", height: "50%" }}>

                                </Box>

                              </Grid>
                            }


                          </Grid>
                        }

                      </Box>


                      <Box
                        onClick={() => handleSelectLbs(theLbs)}
                        sx={{

                          pl: "2px",

                          borderBottom: "0.5px solid " + color("border"),

                          // önce hepsini bu şekilde sonra seçilmişi aşağıda değiştiriyoruz
                          backgroundColor: color(level).bg,
                          color: color(level).co,

                          "&:hover .hoverTheLbs": {
                            // display: "inline"
                            visibility: "visible"
                          },

                          cursor: "pointer",

                        }}
                      >

                        <Grid container sx={{ display: "grid", gridTemplateColumns: "1fr 2rem" }}>

                          {/* theLbs isminin yazılı olduğu kısım */}
                          <Grid item>

                            <Grid container sx={{ color: "#cccccc" }}>

                              {codeMode === null && //kısa
                                <Grid item sx={{ ml: "0.2rem" }}>
                                  {theLbs.code.split(".")[level - 1] + " - "}
                                </Grid>
                              }

                              {codeMode === false && //tam
                                <Grid item sx={{ ml: "0.2rem" }}>
                                  {theLbs.code + " - "}
                                </Grid>
                              }

                              {/* codeMode === true && //yok */}

                              {nameMode === null &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  {"(" + theLbs.codeName + ")" + " - " + theLbs.name}
                                </Grid>
                              }

                              {nameMode === false &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  {theLbs.name}
                                </Grid>
                              }

                              {nameMode === true &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  ({theLbs.codeName})
                                </Grid>
                              }

                              <Grid item className='hoverTheLbs'
                                sx={{
                                  ml: "0.5rem",
                                  visibility: selectedLbs?._id.toString() === theLbs._id.toString() ? "visible" : "hidden",
                                }}>

                                <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                                  <Grid item >
                                    <Box sx={{
                                      backgroundColor: "yellow",
                                      borderRadius: "0.5rem",
                                      height: "0.5rem",
                                      width: "0.5rem",

                                    }}>
                                    </Box>
                                  </Grid>
                                </Grid>

                              </Grid>

                            </Grid>
                          </Grid>

                        </Grid>

                      </Box>



                    </Box>
                  )

                })

              }

            </Box>

          </Box>

        </Stack>
      }

    </Grid >

  )

}



function color(index) {
  switch (index) {
    case 0:
      return { bg: "#202020", co: "#e6e6e6" }
    case 1:
      return { bg: "#8b0000", co: "#e6e6e6" }
    case 2:
      return { bg: "#330066", co: "#e6e6e6" }
    case 3:
      return { bg: "#005555", co: "#e6e6e6" }
    case 4:
      return { bg: "#737373", co: "#e6e6e6" }
    case 5:
      return { bg: "#8b008b", co: "#e6e6e6" }
    case 6:
      return { bg: "#2929bc", co: "#e6e6e6" }
    case 7:
      return { bg: "#00853E", co: "#e6e6e6" }
    case 8:
      return { bg: "#4B5320", co: "#e6e6e6" }
    case "border":
      return "gray"
    case "font":
      return "#e6e6e6"
  }
}
