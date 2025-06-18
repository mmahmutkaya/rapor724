import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';



import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
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


export default function WbsHeader({ RealmApp, setShow, nameMode, setNameMode, codeMode, setCodeMode }) {

  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedWbs, setSelectedWbs } = useContext(StoreContext)


  async function handleWbsUnclicked() {

    // aslında gerek yok zaten wbs yok ama olsun
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    setSelectedWbs()
  }


  async function handleSwitchForPoz(event) {

    // wbs poza açık hale getirilecekse
    if (event.target.checked === true) {

      try {

        if (!selectedWbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        // bu kontrol backend de ayrıca yapılıyor
        let text = selectedWbs.code + "."
        if (selectedProje.wbs.find(item => item.code.indexOf(text) === 0)) {
          // throw new Error("\"" + selectedWbs.name + "\" isimli başlığın bir veya daha fazla alt başlığı mevcut, bu sebeple direk poz eklemeye açık hale getirilemez, mevcut alt başlıklar uygun değilse, yeni bir alt başlık oluşturup, o başlığı poz eklemeye açabilirsiniz.")
          throw new Error("Alt başlığı bulunan başlıklar poz eklemeye açılamaz.")
        }

        const resultProject = await RealmApp.currentUser.callFunction("openWbsForPoz", { projectId: selectedProje._id, wbsId: selectedWbs._id });
        setSelectedProje(resultProject)

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedWbs(resultProject.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

        return

      } catch (err) {

        console.log(err)
        let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."

        let text1 = "__mesajBaslangic__"
        let text2 = "__mesajBitis__"
        let mesajBaslangic = hataMesaj_.includes(text1) ? hataMesaj_.indexOf(text1) + text1.length : 0
        let mesajBitis = hataMesaj_.includes(text2) ? hataMesaj_.indexOf(text2) : hataMesaj_.length
        // console.log(hataMesaj_.slice(mesajBaslangic + "mesajBaslangic:".length, mesajBitis))
        hataMesaj_ = hataMesaj_.slice(mesajBaslangic, mesajBitis)

        console.log(hataMesaj_)

        setDialogCase("error")
        setShowDialog(hataMesaj_)
      }
    }


    // wbs poza kapalı hale getirilecekse
    if (event.target.checked === false) {

      try {

        if (!selectedWbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        const resultProject = await RealmApp.currentUser.callFunction("closeWbsForPoz", { projectId: selectedProje._id, wbsId: selectedWbs._id });
        setSelectedProje(resultProject)

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedWbs(resultProject.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

        return

      } catch (err) {

        console.log("err", err.message)
        let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

        if (hataMesaj_.includes("kayıtlı pozlar mevcut")) {
          hataMesaj_ = "\"" + selectedWbs.name + "\" isimli başlık altında kayıtlı pozlar mevcut olduğu için silinemez, öncelikle pozları silmeli ya da başka başlık altına taşımalısınız."
        }

        setDialogCase("error")
        setShowDialog(hataMesaj_)
      }
    }

  }


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


  async function handleWbsDelete() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    try {

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedWbs.openForPoz) {
        throw new Error("Poz eklemeye açık başlıklar silinemez, öncelikle poz eklemeye kapatınız")
      }

      const resultProject = await RealmApp.currentUser.callFunction("deleteWbs", { projectId: selectedProje._id, wbsId: selectedWbs._id });
      setSelectedProje(resultProject)
      setSelectedWbs(null)

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  WBS'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  WBS'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Poz eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Poz eklemeye açık başlıklar silinemez, öncelikle poz eklemeye kapatınız."
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }


  async function handleMoveWbsUp() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsUp -1 ")
      return
    }

    let _wbs = JSON.parse(JSON.stringify(selectedProje.wbs))
    let _selectedWbs = JSON.parse(JSON.stringify(selectedWbs))
    let _wbs2

    try {

      let leftPart
      let level
      let sortNumber
      let longText


      leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
      level = _selectedWbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedWbs.code.split(".")[level])
      longText = _selectedWbs.code

      // bu kontrol backend de ayrıca yapılmalı - kontrol
      if (sortNumber == 1) {
        console.log("Zaten en üstte")
        return
        // throw new Error("Zaten en üstte - f")
      }

      const result = await RealmApp.currentUser.callFunction("moveWbsUp", { projectId: selectedProje._id, wbsId: selectedWbs._id });
      setSelectedProje(result.project)
      // console.log(result._selectedWbs2)
      setSelectedWbs(result.project.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Zaten")) {
        hataMesaj_ = "Zaten en üstte"
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }





  async function handleMoveWbsDown() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsDown")
      return
    }

    try {

      const result = await RealmApp.currentUser.callFunction("moveWbsDown", { projectId: selectedProje._id, wbsId: selectedWbs._id });
      setSelectedProje(result.project)
      setSelectedWbs(result.project.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Zaten")) {
        return
        hataMesaj_ = "Zaten en üstte"
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }


  }


  async function handleMoveWbsLeft() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsLeft1")
      return
    }

    let _wbs = JSON.parse(JSON.stringify(selectedProje.wbs))
    let _selectedWbs = JSON.parse(JSON.stringify(selectedWbs))
    let _wbs2

    try {

      let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
      let level = _selectedWbs.code.split(".").length - 1
      let sortNumber = Number(_selectedWbs.code.split(".")[level])
      let longText = _selectedWbs.code

      let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
      let levelB = leftPart.split(".").length - 1
      let sortNumberB = Number(leftPart.split(".")[levelB])

      let switch1 = false

      // if (!leftPart) {
      //   setDialogCase("error")
      //   setShowDialog("Zaten en üstte")
      //   console.log("alttaki satırda --return-- oldu - handleMoveWbsLeft2")
      //   return
      // }

      const result = await RealmApp.currentUser.callFunction("moveWbsLeft", { projectId: selectedProje._id, wbsId: selectedWbs._id });
      setSelectedProje(result.project)
      // console.log(result._selectedWbs2)
      setSelectedWbs(result.project.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

    } catch (err) {

      console.log("err", err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."

      let text1 = "__mesajBaslangic__"
      let text2 = "__mesajBitis__"
      let mesajBaslangic = hataMesaj_.includes(text1) ? hataMesaj_.indexOf(text1) + text1.length : 0
      let mesajBitis = hataMesaj_.includes(text2) ? hataMesaj_.indexOf(text2) : hataMesaj_.length

      hataMesaj_ = hataMesaj_.slice(mesajBaslangic, mesajBitis)
      console.log("hataMesaj_", hataMesaj_)

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }


  }


  async function handleMoveWbsRight() {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedWbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveWbsRight")
      return
    }

    try {

      // frontenddeki verinin nasıl güncellendiğini göstermek için bıraktım, _wbs felan şu an yok 
      // setSelectedProje({ ...selectedProje, wbs: _wbs })
      // setSelectedWbs(_wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

      const result = await RealmApp.currentUser.callFunction("moveWbsRight", { projectId: selectedProje._id, wbsId: selectedWbs._id });
      setSelectedProje(result.project)
      // console.log(result._selectedWbs2)
      setSelectedWbs(result.project.wbs.find(item => item._id.toString() === selectedWbs._id.toString()))

    } catch (err) {

      console.log("err", err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."

      let text1 = "__mesajBaslangic__"
      let text2 = "__mesajBitis__"
      let mesajBaslangic = hataMesaj_.includes(text1) ? hataMesaj_.indexOf(text1) + text1.length : 0
      let mesajBitis = hataMesaj_.includes(text2) ? hataMesaj_.indexOf(text2) : hataMesaj_.length

      hataMesaj_ = hataMesaj_.slice(mesajBaslangic, mesajBitis)
      console.log("hataMesaj_", hataMesaj_)

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }

  }


  return (
    <Paper>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      }


      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, mt: topBarHeight, ml: { md: `${drawerWidth}px` }, backgroundColor: "white" }}>

        <Grid
          container
          justifyContent="space-between"
          sx={{ alignItems: "center", padding: "0rem 0.5rem", height: subHeaderHeight }}
        >

          {/* başlık sol */}
          <Grid item  >
            <Typography
              sx={{ display: { xs: 'none', sm: "block" } }}
              color={"black"}
              variant="h5"
              fontWeight="bold"
            >
              Poz Başlıkları
            </Typography>
          </Grid>


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
                    <AntSwitch disabled={!selectedWbs} checked={selectedWbs?.openForPoz ? true : false} onChange={handleSwitchForPoz} />
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

              <Grid item onClick={() => setShow("FormWbsUpdate")} sx={{ color: !selectedWbs ? "lightgray" : "rgb(139,0,0)" }} aria-label="updateWbs">
                <IconButton aria-label="moveRight">
                  <EditIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => handleWbsDelete()} >
                <IconButton aria-label="delete">
                  <DeleteIcon variant="contained" color="error" sx={{ color: !selectedWbs ? "lightgray" : "rgb(139,0,0)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={() => setShow("FormWbsCreate")} disabled={selectedWbs?.code.split(".").length == 8 ? true : false} aria-label="addWbs">
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