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

import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';


export default function MahalHeader({ setShow, editMode_MahalListesi, setEditMode_MahalListesi, saveMahal }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { setMahaller } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)


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

        let oldProject = JSON.parse(JSON.stringify(selectedProje))

        oldProject.lbs.find(item => item._id.toString() === mahal._lbsId.toString()).includesMahal = false

        setSelectedProje(oldProject)

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



  let header = "Mahaller"
  // selectedProje?.name ? header = selectedProje?.name : null



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


              {!editMode_MahalListesi &&
                <Grid item>
                  <IconButton onClick={() => setEditMode_MahalListesi(true)} aria-label="addLbs" disabled={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? true : false}>
                    <EditIcon variant="contained" color={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }


              {editMode_MahalListesi &&
                <Grid item>
                  <IconButton
                    onClick={
                      () => { setEditMode_MahalListesi(false) }
                    }
                    aria-label="addLbs"
                    disabled={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? true : false}>
                    <FileDownloadDoneIcon variant="contained" color={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }


            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}
