import React from 'react'
import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import Divider from '@mui/material/Divider';
import _ from 'lodash';

//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import { DialogTitle, Typography } from '@mui/material';



export default function ShowMetrajYapanlar({ setShow }) {

  const RealmApp = useApp();
  const { selectedProje } = useContext(StoreContext)

  let showMetrajYapabilenler = RealmApp?.currentUser.customData.customSettings.showMetrajYapabilenler

  let metrajYapabilenler = selectedProje?.yetki.metrajYapabilenler

  const [dialogAlert, setDialogAlert] = useState()


  const showUpdate = async ({ userEmail, showValue }) => {

    try {

      // frontend de hızlı olsun diye önce bu sonra arkada db güncelleme
      if (showValue) {
        if (!showMetrajYapabilenler) {
          showMetrajYapabilenler = [userEmail]
        } else {
          showMetrajYapabilenler = [...showMetrajYapabilenler, userEmail]
        }
      } else {
        showMetrajYapabilenler = showMetrajYapabilenler.filter(x => x !== userEmail)
      }

      // db ye gönderme işlemi
      await RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "showMetrajYapabilenler", userEmail, showValue }))
      await RealmApp?.currentUser.refreshCustomData()

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

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Dialog
        PaperProps={{ sx: { maxWidth: "30rem", minWidth: "20rem", position: "fixed", top: "10rem", p: "1.5rem" } }}
        open={true}
        onClose={() => setShow("Main")}
      >
        <Typography variant="subtitle1" sx={{ mb: "0.5rem", fontWeight: "600" }}>
          Göster / Gizle
        </Typography>

        <Divider></Divider>

        {metrajYapabilenler.map((oneYapabilen, index) =>
          <React.Fragment key={index}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5rem", alignItems: "center" }}>
              <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneYapabilen.userEmail}</Box>
              <Box sx={{ justifySelf: "end" }}>
                <Switch
                  checked={showMetrajYapabilenler?.find(x => x === oneYapabilen.userEmail)}
                  onChange={() => showUpdate({ userEmail: oneYapabilen.userEmail, showValue: !showMetrajYapabilenler?.find(x => x === oneYapabilen.userEmail) })}
                />
              </Box>
            </Box>
            <Divider></Divider>
          </React.Fragment>
        )}


        {/* <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5rem", alignItems: "center" }}>
          <Box sx={{ my: "0.2rem", justifySelf: "start" }}>Pasif Pozlar</Box>
          <Box sx={{ justifySelf: "end" }}>
            <Switch
              checked={showHasMahal}
              onChange={() => toggle_showHasMahal(!showHasMahal)}
            />
          </Box>
        </Box> */}

        <Divider></Divider>

      </Dialog>
    </ >
  );



}