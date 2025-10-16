import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import { useNavigate } from "react-router-dom";


import UndoIcon from '@mui/icons-material/Undo';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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


export default function HeaderWbs({ setShow, nameMode, setNameMode, codeMode, setCodeMode, openSnackBar, setOpenSnackBar, snackBarMessage, setSnackBarMessage }) {

  const navigate = useNavigate()
  const [isPending, setIsPending] = useState()

  const { RealmApp, appUser, setAppUser, drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedWbs, setSelectedWbs } = useContext(StoreContext)



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



  async function handleWbsUnclicked() {

    // aslında gerek yok zaten wbs yok ama olsun
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    setSelectedWbs()
  }


  async function handleSwitchForPoz(event) {

    try {

      if (!selectedWbs) {
        console.log("alttaki satırda --return-- oldu")
        return
      }

      // bu kontrol backend de ayrıca yapılıyor
      let text = selectedWbs.code + "."
      if (selectedProje.wbs.find(item => item.code.indexOf(text) === 0)) {
        setOpenSnackBar(true)
        setSnackBarMessage("Alt başlığı bulunan başlıklar poz eklemeye açılamaz.")
        return
      }

      setIsPending(true)

      const response = await fetch(`/api/projeler/togglewbsforpoz`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id, switchValue: event.target.checked ? true : false })
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

      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için
      setSelectedWbs(responseJson.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))
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



  async function handleWbsDelete() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    try {

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedProje?.wbs.find(item => item.code.indexOf(selectedWbs.code + ".") === 0)) {
        setOpenSnackBar(true)
        setSnackBarMessage("Alt başlığı bulunan başlıklar silinemez.")
        return
      }

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedWbs.openForPoz) {
        setOpenSnackBar(true)
        setSnackBarMessage("Poz eklemeye açık başlıklar silinemez.")
        return
      }

      // const result = await RealmApp.currentUser.callFunction("collection_projeler__wbs", { functionName: "deleteWbs", _projeId: selectedProje._id, _wbsId: selectedWbs._id });

      const response = await fetch(`/api/projeler/deletewbs`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id })
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


      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedWbs()

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



  async function handleMoveWbsUp() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsUp -1 ")
      return
    }


    try {

      let _selectedWbs = JSON.parse(JSON.stringify(selectedWbs))

      let level
      let sortNumber

      level = _selectedWbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedWbs.code.split(".")[level])

      // bu kontrol backend de ayrıca yapılmalı - kontrol
      if (sortNumber == 1) {
        console.log("Zaten en üstte, db sorguya gitmedi")
        return
      }

      // const result = await RealmApp.currentUser.callFunction("collection_projeler__wbs", { functionName: "moveWbsUp", _projeId: selectedProje._id, _wbsId: selectedWbs._id });
      const response = await fetch(`/api/projeler/movewbsup`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id })
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

      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedWbs(responseJson.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

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





  async function handleMoveWbsDown() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsDown")
      return
    }


    try {

      let _wbs = JSON.parse(JSON.stringify(selectedProje.wbs))
      let _selectedWbs = JSON.parse(JSON.stringify(selectedWbs))

      let level
      let sortNumber
      let isNecessary = false

      level = _selectedWbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedWbs.code.split(".")[level])

      _wbs.map(oneWbs => {
        if (Number(oneWbs.code.split(".")[level]) > sortNumber) {
          isNecessary = true
        }
      })

      if (!isNecessary) {
        console.log("Zaten en altta, db sorguya gitmedi")
        return
      }


      const response = await fetch(`/api/projeler/movewbsdown`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id })
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

      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedWbs(responseJson.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

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




  async function handleMoveWbsLeft() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsLeft1")
      return
    }

    try {

      const response = await fetch(`/api/projeler/movewbsleft`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id })
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

      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedWbs(responseJson.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

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




  async function handleMoveWbsRight() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsRight")
      return
    }

    try {

      const response = await fetch(`/api/projeler/movewbsright`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projeId: selectedProje._id, wbsId: selectedWbs._id })
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

      if (responseJson.wbs) {
        setSelectedProje(proje => {
          proje.wbs = responseJson.wbs
          return proje
        })
      }


      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedWbs(responseJson.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

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



  const openWbsCreateForm = () => {
    if (selectedWbs?.openForPoz) {
      setOpenSnackBar(true)
      setSnackBarMessage("Poz eklemeye açılan başlıklara alt başlık eklenemez.")
      return
    }
    if (selectedWbs?.code?.split(".").length === 8) {
      setOpenSnackBar(true)
      setSnackBarMessage("Daha fazla alt başlık ekleyemezsiniz")
      return
    }
    setShow("FormWbsCreate")
  }




  return (
    <Paper>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
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
                Poz Başlıkları (WBS)
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
                <IconButton onClick={() => handleWbsUnclicked()} aria-label="wbsUncliced">
                  <ClearOutlined variant="contained" sx={{
                    color: !selectedWbs ? "lightgray" : "red",
                  }} />
                </IconButton>
              </Grid>

              <Grid item >
                <Grid container direction={"column"} alignItems={"center"}>
                  <Grid item >
                    <Typography sx={{ color: !selectedWbs ? "lightgray" : "rgb(24,24,24)" }} >poz</Typography>
                  </Grid>
                  <Grid item >
                    <AntSwitch disabled={!selectedWbs || isPending} checked={selectedWbs?.openForPoz ? true : false} onChange={handleSwitchForPoz} />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item onClick={() => handleMoveWbsUp()}>
                <IconButton aria-label="moveUp">
                  <KeyboardArrowUpIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveWbsDown()}>
                <IconButton aria-label="moveDown">
                  <KeyboardArrowDownIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveWbsLeft()}>
                <IconButton aria-label="moveLeft">
                  <KeyboardArrowLeftIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleMoveWbsRight()}>
                <IconButton aria-label="moveRight">
                  <KeyboardArrowRightIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => setShow("FormWbsUpdate")}>
                <IconButton aria-label="edit" disabled={!selectedWbs ? true : false}>
                  <EditIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleWbsDelete()} >
                <IconButton aria-label="delete">
                  <DeleteIcon variant="contained" color="error" sx={{ color: !selectedWbs ? "lightgray" : "rgb(139,0,0)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={() => openWbsCreateForm()} disabled={selectedWbs?.code.split(".").length == 8 ? true : false} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color={selectedWbs?.code.split(".").length == 8 ? " lightgray" : "success"} />
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