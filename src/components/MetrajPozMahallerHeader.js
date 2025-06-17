import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

import { useApp } from "./useApp";
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

//icons
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlignHorizontalLeftOutlinedIcon from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlinedIcon from '@mui/icons-material/AlignHorizontalRightOutlined';
import AlignHorizontalCenterOutlinedIcon from '@mui/icons-material/AlignHorizontalCenterOutlined';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';


export default function MetrajPozMahallerHeader() {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { setPozlar } = useContext(StoreContext)

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedPozBaslik, setSelectedPozBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")


  async function handlePozDelete(mahal) {

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedPoz) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    // bu kontrol backend de ayrıca yapılıyor
    if (selectedPoz.includesPoz) {
      throw new Error("Bu mahal metraj içerdiği için silinemez, öncelikle metrajları silmelisiniz.")
    }

    try {
      const result = await RealmApp.currentUser.callFunction("deletePoz", { mahalId: mahal._id });

      if (result.deletedCount) {

        // const oldPozlar = queryClient.getQueryData(["pozlar"])
        // const newPozlar = oldPozlar.filter(item => item._id.toString() !== mahal._id.toString())
        // queryClient.setQueryData(["pozlar"], newPozlar)

        setPozlar(oldPozlar => oldPozlar.filter(item => item._id.toString() !== mahal._id.toString()))

      }

      if (result.isIncludesPozFalse) {

        let oldProject = JSON.parse(JSON.stringify(selectedProje))

        oldProject.wbs.find(item => item._id.toString() === mahal._wbsId.toString()).includesPoz = false

        setSelectedProje(oldProject)

      }

      setSelectedPoz()

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  Wbs'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  Wbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Poz eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Poz eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
      }

      setSelectedPoz()
      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }



  async function handlePozBaslikDelete(mahalBaslik) {

    const mahal = selectedPozBaslik

    // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedPozBaslik) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    return { "silinecekPozBaslik": mahalBaslik }

    try {
      const result = await RealmApp.currentUser.callFunction("deletePozBaslik", { mahalId: mahal._id });

      if (result.deletedCount) {

        // const oldPozlar = queryClient.getQueryData(["pozlar"])
        // const newPozlar = oldPozlar.filter(item => item._id.toString() !== mahal._id.toString())
        // queryClient.setQueryData(["pozlar"], newPozlar)

        setPozlar(oldPozlar => oldPozlar.filter(item => item._id.toString() !== mahal._id.toString()))

      }

      if (result.isIncludesPozFalse) {

        let oldProject = JSON.parse(JSON.stringify(selectedProje))

        oldProject.wbs.find(item => item._id.toString() === mahal._wbsId.toString()).includesPoz = false

        setSelectedProje(oldProject)

      }

      setSelectedPoz()

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  Wbs'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  Wbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Poz eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Poz eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
      }

      setSelectedPoz()
      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }



  const handle_BaslikGenislet = () => {
    setSelectedProje(selectedProje => {
      const selectedProje_ = { ...selectedProje }
      selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik = selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik + 0.5
      return selectedProje_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const handle_BaslikDaralt = () => {
    setSelectedProje(selectedProje => {
      const selectedProje_ = { ...selectedProje }
      selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik = selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik - 0.5
      return selectedProje_
    })
    setWillBeUpdate_mahalBaslik(true)
  }



  const handle_YatayHiza = () => {
    setSelectedProje(selectedProje => {
      const selectedProje_ = { ...selectedProje }
      let guncelYatayHiza = selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza
      if (guncelYatayHiza == "start") selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "center"
      if (guncelYatayHiza == "center") selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "end"
      if (guncelYatayHiza == "end") selectedProje_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "start"
      return selectedProje_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const unSelectPozBaslik = async () => {
    if (willBeUpdate_mahalBaslik) {
      let mahalBaslik = selectedProje.mahalBasliklari.find(item => item.id == selectedPozBaslik.id)
      console.log("mahalBaslik", mahalBaslik)
      const result = await RealmApp?.currentUser.callFunction("updateProjectPozBaslik", ({ _projectId: selectedProje._id, mahalBaslik }));
      console.log("result", result)
      setWillBeUpdate_mahalBaslik(false)
    }
    setSelectedPozBaslik(false)
  }



  return (
    <Paper >

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      }

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          color: "black",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: topBarHeight,
          // pt:"3rem",
          ml: { md: `${drawerWidth}px` }
        }}
      >

        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >



          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              selectedPoz?.name
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>

              <Grid item >
                <IconButton onClick={() => navigate("/metrajpozlar")} aria-label="wbsUncliced">
                  <ReplyIcon variant="contained"
                    sx={{ color: selectedPoz ? "red" : "lightgray" }} />
                </IconButton>
              </Grid>

              <Grid item onClick={() => console.log("selectedPoz", selectedPoz)} sx={{ cursor: "pointer" }}>
                <IconButton aria-label="addPoz" disabled>
                  <VisibilityIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>
              </Grid>


            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper>
  )
}
