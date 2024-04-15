import { useState, useContext } from 'react';
import { StoreContext } from '../components/store'
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


export default function LbsHeader({ RealmApp, setShow, nameMode, setNameMode, codeMode, setCodeMode }) {

  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedLbs, setSelectedLbs } = useContext(StoreContext)


  async function handleLbsUnclicked() {

    // aslında gerek yok zaten lbs yok ama olsun
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    setSelectedLbs()
  }


  async function handleSwitchForMahal(event) {

    // lbs mahale açık hale getirilecekse
    if (event.target.checked === true) {

      try {

        if (!selectedLbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        // bu kontrol backend de ayrıca yapılıyor
        let text = selectedLbs.code + "."
        if (isProject.lbs.find(item => item.code.indexOf(text) === 0)) {
          // throw new Error("\"" + selectedLbs.name + "\" isimli başlığın bir veya daha fazla alt başlığı mevcut, bu sebeple direk mahal eklemeye açık hale getirilemez, mevcut alt başlıklar uygun değilse, yeni bir alt başlık oluşturup, o başlığı mahal eklemeye açabilirsiniz.")
          throw new Error("Alt başlığı bulunan başlıklar mahal eklemeye açılamaz.")
        }

        const resultProject = await RealmApp.currentUser.callFunction("openLbsForMahal", { projectId: isProject._id, lbsId: selectedLbs._id });
        setIsProject(resultProject)

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedLbs(resultProject.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

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


    // lbs mahale kapalı hale getirilecekse
    if (event.target.checked === false) {

      try {

        if (!selectedLbs) {
          console.log("alttaki satırda --return-- oldu")
          return
        }

        const resultProject = await RealmApp.currentUser.callFunction("closeLbsForMahal", { projectId: isProject._id, lbsId: selectedLbs._id });
        setIsProject(resultProject)

        // switch on-off gösterim durumunu güncellemesi için 
        setSelectedLbs(resultProject.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

        return

      } catch (err) {

        console.log("err", err.message)
        let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

        if (hataMesaj_.includes("kayıtlı mahaller mevcut")) {
          hataMesaj_ = "\"" + selectedLbs.name + "\" isimli başlık altında kayıtlı mahaller mevcut olduğu için silinemez, öncelikle mahalleri silmeli ya da başka başlık altına taşımalısınız."
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


  async function handleLbsDelete() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    try {

      // bu kontrol backend de ayrıca yapılıyor
      if (selectedLbs.openForMahal) {
        throw new Error("Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız")
      }

      const resultProject = await RealmApp.currentUser.callFunction("deleteLbs", { projectId: isProject._id, lbsId: selectedLbs._id });
      setIsProject(resultProject)
      setSelectedLbs(null)

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  Lbs'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  Lbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Mahal eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }


  async function handleMoveLbsUp() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsUp -1 ")
      return
    }

    let _lbs = JSON.parse(JSON.stringify(isProject.lbs))
    let _selectedLbs = JSON.parse(JSON.stringify(selectedLbs))
    let _lbs2

    try {

      let leftPart
      let level
      let sortNumber
      let longText


      leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
      level = _selectedLbs?.code?.split(".").length - 1
      sortNumber = Number(_selectedLbs.code.split(".")[level])
      longText = _selectedLbs.code

      // bu kontrol backend de ayrıca yapılmalı - kontrol
      if (sortNumber == 1) {
        console.log("Zaten en üstte")
        return
        // throw new Error("Zaten en üstte - f")
      }

      const result = await RealmApp.currentUser.callFunction("moveLbsUp", { projectId: isProject._id, lbsId: selectedLbs._id });
      setIsProject(result.project)
      // console.log(result._selectedLbs2)
      setSelectedLbs(result.project.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

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





  async function handleMoveLbsDown() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsDown")
      return
    }

    try {

      const result = await RealmApp.currentUser.callFunction("moveLbsDown", { projectId: isProject._id, lbsId: selectedLbs._id });
      setIsProject(result.project)
      setSelectedLbs(result.project.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

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


  async function handleMoveLbsLeft() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsLeft1")
      return
    }

    let _lbs = JSON.parse(JSON.stringify(isProject.lbs))
    let _selectedLbs = JSON.parse(JSON.stringify(selectedLbs))
    let _lbs2

    try {

      let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
      let level = _selectedLbs.code.split(".").length - 1
      let sortNumber = Number(_selectedLbs.code.split(".")[level])
      let longText = _selectedLbs.code

      let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
      let levelB = leftPart.split(".").length - 1
      let sortNumberB = Number(leftPart.split(".")[levelB])

      let switch1 = false

      if (!leftPart) {
        setDialogCase("error")
        setShowDialog("Zaten en üstte")
        console.log("alttaki satırda --return-- oldu - handleMoveLbsLeft2")
        return
      }

      const result = await RealmApp.currentUser.callFunction("moveLbsLeft", { projectId: isProject._id, lbsId: selectedLbs._id });
      setIsProject(result.project)
      // console.log(result._selectedLbs2)
      setSelectedLbs(result.project.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

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


  async function handleMoveLbsRight() {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedLbs) {
      console.log("alttaki satırda --return-- oldu - handleMoveLbsRight")
      return
    }

    try {

      // frontenddeki verinin nasıl güncellendiğini göstermek için bıraktım, _lbs felan şu an yok 
      // setIsProject({ ...isProject, lbs: _lbs })
      // setSelectedLbs(_lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

      const result = await RealmApp.currentUser.callFunction("moveLbsRight", { projectId: isProject._id, lbsId: selectedLbs._id });
      setIsProject(result.project)
      // console.log(result._selectedLbs2)
      setSelectedLbs(result.project.lbs.find(item => item._id.toString() === selectedLbs._id.toString()))

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
              Mahal Başlıkları
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

              <Grid item onClick={() => setShow("FormLbsUpdate")} sx={{ color: !selectedLbs ? "lightgray" : "rgb(139,0,0)" }} aria-label="updateLbs">
                <IconButton aria-label="moveRight">
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