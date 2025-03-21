import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
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


export default function FirmaPozHeader({ setShow, editPoz, setEditPoz, savePoz }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedFirma, setSelectedFirma } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedPozBaslik, setSelectedPozBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")


  // async function handleFirmaPozDelete(mahal) {

  //   // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
  //   if (!selectedPoz) {
  //     console.log("alttaki satırda --return-- oldu")
  //     return
  //   }

  //   // bu kontrol backend de ayrıca yapılıyor
  //   if (selectedPoz?.includesPoz) {
  //     throw new Error("Bu mahal metraj içerdiği için silinemez, öncelikle metrajları silmelisiniz.")
  //   }

  //   try {
  //     const result = await RealmApp.currentUser.callFunction("deletePoz", { mahalId: mahal._id });

  //     if (result.deletedCount) {

  //       // const oldPozlar = queryClient.getQueryData(["pozlar"])
  //       // const newPozlar = oldPozlar.filter(item => item._id.toString() !== mahal._id.toString())
  //       // queryClient.setQueryData(["pozlar"], newPozlar)

  //       setPozlar(oldPozlar => oldPozlar.filter(item => item._id.toString() !== mahal._id.toString()))

  //     }

  //     if (result.isIncludesPozFalse) {

  //       let oldProject = JSON.parse(JSON.stringify(selectedFirma))

  //       oldProject.wbs.find(item => item._id.toString() === mahal._wbsId.toString()).includesPoz = false

  //       setSelectedFirma(oldProject)

  //     }

  //     setSelectedPoz()

  //   } catch (err) {

  //     console.log(err)
  //     let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

  //     if (hataMesaj_.includes("Silmek istediğiniz  Wbs'in alt seviyeleri mevcut")) {
  //       hataMesaj_ = "Silmek istediğiniz  Wbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
  //     }

  //     if (hataMesaj_.includes("Poz eklemeye açık başlıklar silinemez")) {
  //       hataMesaj_ = "Poz eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
  //     }

  //     setSelectedPoz()
  //     setDialogCase("error")
  //     setShowDialog(hataMesaj_)
  //   }
  // }



  // async function handlePozBaslikDelete(mahalBaslik) {

  //   const mahal = selectedPozBaslik

  //   // seçili wbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
  //   if (!selectedPozBaslik) {
  //     console.log("alttaki satırda --return-- oldu")
  //     return
  //   }

  //   return { "silinecekPozBaslik": mahalBaslik }

  //   try {
  //     const result = await RealmApp.currentUser.callFunction("deletePozBaslik", { mahalId: mahal._id });

  //     if (result.deletedCount) {

  //       // const oldPozlar = queryClient.getQueryData(["pozlar"])
  //       // const newPozlar = oldPozlar.filter(item => item._id.toString() !== mahal._id.toString())
  //       // queryClient.setQueryData(["pozlar"], newPozlar)

  //       setPozlar(oldPozlar => oldPozlar.filter(item => item._id.toString() !== mahal._id.toString()))

  //     }

  //     if (result.isIncludesPozFalse) {

  //       let oldProject = JSON.parse(JSON.stringify(selectedFirma))

  //       oldProject.wbs.find(item => item._id.toString() === mahal._wbsId.toString()).includesPoz = false

  //       setSelectedFirma(oldProject)

  //     }

  //     setSelectedPoz()

  //   } catch (err) {

  //     console.log(err)
  //     let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

  //     if (hataMesaj_.includes("Silmek istediğiniz  Wbs'in alt seviyeleri mevcut")) {
  //       hataMesaj_ = "Silmek istediğiniz  Wbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
  //     }

  //     if (hataMesaj_.includes("Poz eklemeye açık başlıklar silinemez")) {
  //       hataMesaj_ = "Poz eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
  //     }

  //     setSelectedPoz()
  //     setDialogCase("error")
  //     setShowDialog(hataMesaj_)
  //   }
  // }



  const handle_BaslikGenislet = () => {
    setSelectedFirma(selectedFirma => {
      const selectedFirma_ = { ...selectedFirma }
      selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik = selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik + 0.5
      return selectedFirma_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const handle_BaslikDaralt = () => {
    setSelectedFirma(selectedFirma => {
      const selectedFirma_ = { ...selectedFirma }
      selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik = selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).genislik - 0.5
      return selectedFirma_
    })
    setWillBeUpdate_mahalBaslik(true)
  }



  const handle_YatayHiza = () => {
    setSelectedFirma(selectedFirma => {
      const selectedFirma_ = { ...selectedFirma }
      let guncelYatayHiza = selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza
      if (guncelYatayHiza == "start") selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "center"
      if (guncelYatayHiza == "center") selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "end"
      if (guncelYatayHiza == "end") selectedFirma_.mahalBasliklari.find(item => item.id == selectedPozBaslik.id).yatayHiza = "start"
      return selectedFirma_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const unSelectPozBaslik = async () => {
    if (willBeUpdate_mahalBaslik) {
      let mahalBaslik = selectedFirma.mahalBasliklari.find(item => item.id == selectedPozBaslik.id)
      console.log("mahalBaslik", mahalBaslik)
      const result = await RealmApp?.currentUser.callFunction("updateProjectPozBaslik", ({ _projectId: selectedFirma._id, mahalBaslik }));
      console.log("result", result)
      setWillBeUpdate_mahalBaslik(false)
    }
    setSelectedPozBaslik(false)
  }

  const handlePozDelete = () => {
    console.log("deneme")
  }

  let header = "Pozlar"
  // selectedFirma?.name ? header = selectedFirma?.name : null



  // const Item = styled(Paper)(({ theme }) => ({
  //   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  //   ...theme.typography.body2,
  //   padding: theme.spacing(1),
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary,
  // }));



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
              {header}
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>




              {(!selectedPozBaslik && !selectedPoz) &&
                <>
                  <Grid item>
                    <IconButton onClick={() => setShow("EditFirmaPozBaslik")} aria-label="addWbs">
                      <VisibilityIcon variant="contained" sx={{ color: "black" }} />
                    </IconButton>
                  </Grid>


                  <Grid item>
                    <IconButton onClick={() => setShow("FormFirmaPozBaslikCreate")} aria-label="addPozBilgi" disabled={(selectedFirma?.wbs?.filter(item => item.openForPoz).length == 0 || !selectedFirma?.wbs) ? true : false}>
                      <AddCircleOutlineIcon variant="contained" sx={{ color: (selectedFirma?.wbs?.filter(item => item.openForPoz).length == 0 || !selectedFirma?.wbs) ? "lightgray" : "blue" }} />
                    </IconButton>
                  </Grid>


                  <Grid item>
                    <IconButton onClick={() => setShow("FormFirmaPozCreate")} aria-label="addWbs" disabled={(selectedFirma?.wbs?.filter(item => item.openForPoz).length == 0 || !selectedFirma?.wbs) ? true : false}>
                      <AddCircleOutlineIcon variant="contained" color={(selectedFirma?.wbs?.filter(item => item.openForPoz).length == 0 || !selectedFirma?.wbs) ? " lightgray" : "success"} />
                    </IconButton>
                  </Grid>

                </>
              }



              {selectedPoz &&
                <>

                  {/* seçimleri temizle */}

                  <Grid item >
                    <IconButton onClick={() => setSelectedPoz()} aria-label="wbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>



                  {/* ne seçili ise silme */}

                  <Grid item onClick={() => handlePozDelete(selectedPoz)} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addPoz" disabled>
                      <DeleteIcon
                        // sx={{display: selectedFirma_display}}
                        variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                </>
              }




              {selectedPozBaslik && !editPoz &&
                <>

                  {/* başlığı düzenle*/}

                  <Grid item >
                    <IconButton onClick={() => unSelectPozBaslik()} aria-label="wbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => setEditPoz(selectedPozBaslik.id)} aria-label="wbsUncliced">
                      <EditIcon variant="contained"
                        sx={{ color: "#3D4849" }} />
                    </IconButton>
                  </Grid>



                  {/* <Grid item onClick={() => handlePozBaslikDelete(selectedPozBaslik)} sx={{ cursor: "pointer" }}> */}
                  <Grid item onClick={() => console.log("deneme_345")} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addPoz" disabled>
                      <DeleteIcon
                        // sx={{display: selectedFirma_display}}
                        variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>



                  <Grid item onClick={() => handle_BaslikDaralt()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addPoz" disabled>
                      <UnfoldLessIcon
                        variant="contained"
                        sx={{ rotate: "90deg", fontSize: "1.4rem", mt: "0.1rem", color: "black" }} />
                    </IconButton>
                  </Grid>



                  <Grid item onClick={() => handle_BaslikGenislet()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addPoz" disabled>
                      <UnfoldMoreIcon
                        variant="contained"
                        sx={{ rotate: "90deg", fontSize: "1.6rem", color: "black" }} />
                    </IconButton>
                  </Grid>


                  <Grid item onClick={() => handle_YatayHiza()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addPoz" disabled>
                      {selectedPozBaslik.yatayHiza == "start" &&
                        <AlignHorizontalLeftOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                      {selectedPozBaslik.yatayHiza == "center" &&
                        <AlignHorizontalCenterOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                      {selectedPozBaslik.yatayHiza == "end" &&
                        <AlignHorizontalRightOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                    </IconButton>
                  </Grid>

                </>

              }





              {selectedPozBaslik && editPoz &&
                <>
                  <Grid item >
                    <IconButton
                      onClick={() => {
                        setWillBeUpdate_mahalBaslik([])
                        setSelectedPozBaslik(false)
                        setEditPoz(false)
                      }}
                      aria-label="wbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={() => savePoz()} aria-label="addWbs">
                      <FileDownloadDoneIcon variant="contained" sx={{ color: "black" }} />
                    </IconButton>
                  </Grid>
                </>
              }




            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper>
  )
}
