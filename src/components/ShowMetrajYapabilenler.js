import React from 'react'
import { useState, useContext, useEffect } from 'react';
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



export default function ShowMetrajYapabilenler({ setShow }) {

  const { RealmApp, selectedProje } = useContext(StoreContext)

  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)
  useEffect(() => {
    setShowMetrajYapabilenler(RealmApp.currentUser.customData.customSettings.showMetrajYapabilenler)
  }, [RealmApp])




  let metrajYapabilenler = selectedProje?.yetki.metrajYapabilenler

  const [dialogAlert, setDialogAlert] = useState()


  const update_state = async ({ userEmail, isShow }) => {

    try {

      let showMetrajYapabilenler2 = _.cloneDeep(showMetrajYapabilenler)

      if (!showMetrajYapabilenler2) {
        showMetrajYapabilenler2 = [{ userEmail, isShow }]

      } else if (showMetrajYapabilenler2?.find(x => x.userEmail === userEmail)) {
        showMetrajYapabilenler2 = showMetrajYapabilenler2.map(oneYapabilen => {
          if (oneYapabilen.userEmail === userEmail) {
            oneYapabilen.isShow = isShow
          }
          return oneYapabilen
        })

      } else {
        showMetrajYapabilenler2 = [...showMetrajYapabilenler2, { userEmail, isShow }]
      }

      setShowMetrajYapabilenler(showMetrajYapabilenler2)
      // console.log("showMetrajYapabilenler2", showMetrajYapabilenler2)

      await RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "showMetrajYapabilenler", showMetrajYapabilenler: showMetrajYapabilenler2 }))
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
          onCloseAction={() => {
            setDialogAlert()
          }}
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

        {metrajYapabilenler.map((oneYapabilen, index) => {
          let userValue = showMetrajYapabilenler?.find(x => x.userEmail === oneYapabilen.userEmail)
          return (
            <React.Fragment key={index}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5rem", alignItems: "center" }}>
                <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneYapabilen.userEmail}</Box>
                <Box sx={{ justifySelf: "end" }}>
                  <Switch
                    checked={userValue?.isShow ? true : false}
                    onChange={() => update_state({ userEmail: oneYapabilen.userEmail, isShow: userValue?.isShow ? false : true })}
                  />
                </Box>
              </Box>
              <Divider></Divider>
            </React.Fragment>
          )

        })}


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