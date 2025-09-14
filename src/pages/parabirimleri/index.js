
import React from 'react'
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import FormProjeCreate from '../../components/FormProjeCreate'
import { useNavigate } from "react-router-dom";
import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from '../../components/general/DialogAlert'


import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';

import FolderIcon from '@mui/icons-material/Folder';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


export default function P_ParaBirimleri() {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)
  const { selectedFirma, setSelectedFirma } = useContext(StoreContext)

  const [show, setShow] = useState("Main")

  const [dialogAlert, setDialogAlert] = useState()

  const [showEminMisin, setShowEminMisin] = useState()

  const [paraBirimleri, setParaBirimleri] = useState(selectedFirma?.paraBirimleri)

  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedFirma) navigate("/firmalar")
  }, []);




  const baslikUpdate = async ({ baslikId, showValue }) => {

    if (!showValue) {
      setShowEminMisin(true)
    }

    try {

      const paraBirimleri2 = paraBirimleri.map(oneBaslik => {
        if (oneBaslik.id === baslikId) {
          oneBaslik.isActive = showValue
        }
        return oneBaslik
      })

      // önce frontend deki veri güncelleme
      setParaBirimleri(paraBirimleri2)

      // db ye gönderme işlemi
      await RealmApp?.currentUser.callFunction("update_firma_paraBirimleri", ({ _firmaId: selectedFirma._id, paraBirimiId: baslikId, showValue }))
      // await RealmApp?.currentUser.refreshCustomData()

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }

  }


  return (
    <Box>

      {
        showEminMisin &&
        <DialogAlert
          dialogIcon={"info"}
          dialogMessage={"Bu para birimini kullanmış olan projeler kullanmaya devam edecektir. Henüz kullanmamış olan ve yeni oluşturulan projelerde bu para birimi kullanılmayacaktır."}
          onCloseAction={() => {
            setShowEminMisin()
          }}
          actionText1={"OK"}
          action1={() => {
            setShowEminMisin()
          }}
        />
      }

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}
      <Paper >
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
              Para Birimleri
            </Typography>
          </Grid>


          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>

              <Grid item>
                <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                  <DeleteIcon
                    variant="contained" color="error"
                  />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={() => setShow("FormProjeCreate")} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "Main" && paraBirimleri?.length > 0 &&

        // <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
        <Stack sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "max-content max-content max-content", columnGap: "2rem", alignItems: "center" }} spacing={0}>

          {paraBirimleri.map((oneBirim, index) => {

            return (
              <React.Fragment key={index}>
                <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.id}</Box>
                <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.name}</Box>
                <Box sx={{ justifySelf: "end" }}><Switch checked={oneBirim.isActive} onChange={() => baslikUpdate({ baslikId: oneBirim.id, showValue: !oneBirim.isActive })} /></Box>
              </React.Fragment>
            )

          })}


        </Stack>

      }

    </Box>

  )

}


