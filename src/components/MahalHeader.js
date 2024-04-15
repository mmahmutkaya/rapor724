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


export default function MahalHeader({ setShow, editMahal, setEditMahal, saveMahal }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { isProject, setIsProject } = useContext(StoreContext)
  const { setMahaller } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")


  async function handleMahalDelete(mahal) {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedMahal) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    // bu kontrol backend de ayrıca yapılıyor
    if (selectedMahal.includesMahal) {
      throw new Error("Bu mahal metraj içerdiği için silinemez, öncelikle metrajları silmelisiniz.")
    }

    try {
      const result = await RealmApp.currentUser.callFunction("deleteMahal", { mahalId: mahal._id });

      if (result.deletedCount) {

        // const oldMahaller = queryClient.getQueryData(["mahaller"])
        // const newMahaller = oldMahaller.filter(item => item._id.toString() !== mahal._id.toString())
        // queryClient.setQueryData(["mahaller"], newMahaller)

        setMahaller(oldMahaller => oldMahaller.filter(item => item._id.toString() !== mahal._id.toString()))

      }

      if (result.isIncludesMahalFalse) {

        let oldProject = JSON.parse(JSON.stringify(isProject))

        oldProject.lbs.find(item => item._id.toString() === mahal._lbsId.toString()).includesMahal = false

        setIsProject(oldProject)

      }

      setSelectedMahal()

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  Lbs'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  Lbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Mahal eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
      }

      setSelectedMahal()
      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }



  async function handleMahalBaslikDelete(mahalBaslik) {

    // seçili lbs yoksa durdurma, inaktif iken tuşlara basılabiliyor mesela, bu fonksiyon çalıştırılıyor, orayı iptal etmekle uğraşmak istemedim
    if (!selectedMahalBaslik) {
      console.log("alttaki satırda --return-- oldu")
      return
    }

    return { "silinecekMahalBaslik": mahalBaslik }

    try {
      const result = await RealmApp.currentUser.callFunction("deleteMahalBaslik", { mahalId: mahal._id });

      if (result.deletedCount) {

        // const oldMahaller = queryClient.getQueryData(["mahaller"])
        // const newMahaller = oldMahaller.filter(item => item._id.toString() !== mahal._id.toString())
        // queryClient.setQueryData(["mahaller"], newMahaller)

        setMahaller(oldMahaller => oldMahaller.filter(item => item._id.toString() !== mahal._id.toString()))

      }

      if (result.isIncludesMahalFalse) {

        let oldProject = JSON.parse(JSON.stringify(isProject))

        oldProject.lbs.find(item => item._id.toString() === mahal._lbsId.toString()).includesMahal = false

        setIsProject(oldProject)

      }

      setSelectedMahal()

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("Silmek istediğiniz  Lbs'in alt seviyeleri mevcut")) {
        hataMesaj_ = "Silmek istediğiniz  Lbs'in alt seviyeleri mevcut, öncelikle onları silmelisiniz."
      }

      if (hataMesaj_.includes("Mahal eklemeye açık başlıklar silinemez")) {
        hataMesaj_ = "Mahal eklemeye açık başlıklar silinemez, öncelikle mahal eklemeye kapatınız."
      }

      setSelectedMahal()
      setDialogCase("error")
      setShowDialog(hataMesaj_)
    }
  }



  const handle_BaslikGenislet = () => {
    setIsProject(isProject => {
      const isProject_ = { ...isProject }
      isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).genislik = isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).genislik + 0.5
      return isProject_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const handle_BaslikDaralt = () => {
    setIsProject(isProject => {
      const isProject_ = { ...isProject }
      isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).genislik = isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).genislik - 0.5
      return isProject_
    })
    setWillBeUpdate_mahalBaslik(true)
  }



  const handle_YatayHiza = () => {
    setIsProject(isProject => {
      const isProject_ = { ...isProject }
      let guncelYatayHiza = isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).yatayHiza
      guncelYatayHiza == "start" ? isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).yatayHiza = "center" : null
      guncelYatayHiza == "center" ? isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).yatayHiza = "end" : null
      guncelYatayHiza == "end" ? isProject_.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id).yatayHiza = "start" : null
      return isProject_
    })
    setWillBeUpdate_mahalBaslik(true)
  }


  const unSelectMahalBaslik = async () => {
    if (willBeUpdate_mahalBaslik) {
      let mahalBaslik = isProject.mahalBasliklari.find(item => item.id == selectedMahalBaslik.id)
      console.log("mahalBaslik", mahalBaslik)
      const result = await RealmApp?.currentUser.callFunction("updateProjectMahalBaslik", ({ _projectId: isProject._id, mahalBaslik }));
      console.log("result", result)
      setWillBeUpdate_mahalBaslik(false)
    }
    setSelectedMahalBaslik(false)
  }


  let header = "Mahaller"
  // isProject?.name ? header = isProject?.name : null



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


              {selectedMahal &&
                <>

                  {/* seçimleri temizle */}

                  <Grid item >
                    <IconButton onClick={() => setSelectedMahal()} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>



                  {/* ne seçili ise silme */}

                  <Grid item onClick={() => handleMahalDelete(selectedMahal)} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addMahal" disabled>
                      <DeleteIcon
                        // sx={{display: isProject_display}}
                        variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                </>
              }




              {selectedMahalBaslik && !editMahal &&
                <>

                  {/* başlığı düzenle*/}

                  <Grid item >
                    <IconButton onClick={() => unSelectMahalBaslik()} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => setEditMahal(selectedMahalBaslik.id)} aria-label="lbsUncliced">
                      <EditIcon variant="contained"
                        sx={{ color: "#3D4849" }} />
                    </IconButton>
                  </Grid>



                  <Grid item onClick={() => handleMahalBaslikDelete(selectedMahalBaslik)} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addMahal" disabled>
                      <DeleteIcon
                        // sx={{display: isProject_display}}
                        variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>



                  <Grid item onClick={() => handle_BaslikDaralt()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addMahal" disabled>
                      <UnfoldLessIcon
                        variant="contained"
                        sx={{ rotate: "90deg", fontSize: "1.4rem", mt: "0.1rem", color: "black" }} />
                    </IconButton>
                  </Grid>



                  <Grid item onClick={() => handle_BaslikGenislet()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addMahal" disabled>
                      <UnfoldMoreIcon
                        variant="contained"
                        sx={{ rotate: "90deg", fontSize: "1.6rem", color: "black" }} />
                    </IconButton>
                  </Grid>


                  <Grid item onClick={() => handle_YatayHiza()} sx={{ cursor: "pointer" }}>
                    <IconButton aria-label="addMahal" disabled>
                      {selectedMahalBaslik.yatayHiza == "start" &&
                        <AlignHorizontalLeftOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                      {selectedMahalBaslik.yatayHiza == "center" &&
                        <AlignHorizontalCenterOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                      {selectedMahalBaslik.yatayHiza == "end" &&
                        <AlignHorizontalRightOutlinedIcon
                          variant="contained"
                          sx={{ color: "black" }} />
                      }
                    </IconButton>
                  </Grid>

                </>

              }




              {selectedMahalBaslik && editMahal &&
                <>
                  <Grid item >
                    <IconButton
                      onClick={() => {
                        setWillBeUpdate_mahalBaslik([])
                        setSelectedMahalBaslik(false)
                        setEditMahal(false)
                      }}
                      aria-label="lbsUncliced">
                      <ClearOutlined variant="contained"
                        sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={() => saveMahal()} aria-label="addLbs">
                      <FileDownloadDoneIcon variant="contained" sx={{ color: "black" }} />
                    </IconButton>
                  </Grid>
                </>
              }




              {(!selectedMahalBaslik && !selectedMahal) &&
                <Grid item>
                  <IconButton onClick={() => setShow("EditMahalBaslik")} aria-label="addLbs">
                    <VisibilityIcon variant="contained" sx={{ color: "black" }} />
                  </IconButton>
                </Grid>
              }


              {(!selectedMahalBaslik && !selectedMahal) &&
                <Grid item>
                  <IconButton onClick={() => setShow("FormMahalBaslikCreate")} aria-label="addMahalBilgi" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <AddCircleOutlineIcon variant="contained" sx={{ color: (isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? "lightgray" : "blue" }} />
                  </IconButton>
                </Grid>
              }


              {(!selectedMahalBaslik && !selectedMahal) &&
                <Grid item>
                  <IconButton onClick={() => setShow("FormMahalCreate")} aria-label="addLbs" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <AddCircleOutlineIcon variant="contained" color={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }



            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper>
  )
}
