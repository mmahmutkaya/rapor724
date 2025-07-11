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


export default function HeaderLbs({ setShow, nameMode, setNameMode, codeMode, setCodeMode }) {

  const navigate = useNavigate()

  const { RealmApp, drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

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

    // console.log(selectedLbs)
    // console.log("event.target.checked", event.target.checked)

    // lbs mahale açık hale getirilecekse
    if (event.target.checked === true) {

      try {

        if (!selectedLbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        // bu kontrol backend de ayrıca yapılıyor
        let text = selectedLbs.code + "."
        if (selectedProje.lbs.find(item => item.code.indexOf(text) === 0)) {
          // throw new Error("\"" + selectedLbs.name + "\" isimli başlığın bir veya daha fazla alt başlığı mevcut, bu sebeple direk mahal eklemeye açık hale getirilemez, mevcut alt başlıklar uygun değilse, yeni bir alt başlık oluşturup, o başlığı mahal eklemeye açabilirsiniz.")
          throw new Error("__mesajBaslangic__ Alt başlığı bulunan başlıklar mahal eklemeye açılamaz. __mesajBitis__")
        }

        const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "openLbsForMahal", _projeId: selectedProje._id, _lbsId: selectedLbs._id });

        if (result.lbs) {
          setSelectedProje(proje => {
            proje.lbs = result.lbs
            return proje
          })
        }

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

        return

      } catch (err) {

        console.log(err)

        let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
        if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
          let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
          let mesajBitis = err.message.indexOf("__mesajBitis__")
          dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
        }

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage,
          detailText: err?.message ? err.message : null
        })

        return

      }
    }


    // lbs mahale kapalı hale getirilecekse
    if (event.target.checked === false) {

      try {

        if (!selectedLbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "closeLbsForMahal", _projeId: selectedProje._id, _lbsId: selectedLbs._id });

        if (result.lbs) {
          setSelectedProje(proje => {
            proje.lbs = result.lbs
            return proje
          })
        }

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

        return

      } catch (err) {

        console.log(err)

        let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
        if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
          let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
          let mesajBitis = err.message.indexOf("__mesajBitis__")
          dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
        }

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage,
          detailText: err?.message ? err.message : null
        })

        return

      }
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
      if (selectedLbs.openForMahal) {
        throw new Error("__mesajBaslangic__ Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız. __mesajBitis__")
      }

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "deleteLbs", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedLbs()

      return

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
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

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "moveLbsUp", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
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

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "moveLbsDown", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
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

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "moveLbsLeft", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
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

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "moveLbsRight", _projeId: selectedProje._id, _lbsId: selectedLbs._id });
      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // switch on-off gösterim durumunu güncellemesi için 
      setSelectedLbs(result.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      return

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
        detailText: err?.message ? err.message : null
      })

      return
    }
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
                    <AntSwitch disabled={!selectedLbs} checked={selectedLbs?.openForMahal ? true : false} onChange={handleSwitchForMahal} />
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
                <IconButton onClick={() => setShow("FormLbsCreate")} disabled={selectedLbs?.code.split(".").length == 8 ? true : false} aria-label="addLbs">
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