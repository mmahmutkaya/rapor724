import React from 'react'
import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import Divider from '@mui/material/Divider';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import { DialogTitle, Typography } from '@mui/material';



export default function ShowPozParaBirimleri({ setShow, setBasliklar }) {

  console.log("deneme")

  const RealmApp = useApp();
  const { selectedFirma } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  const [paraBirimleri, setParaBirimleri] = useState(selectedFirma?.paraBirimleri)


  const [dialogAlert, setDialogAlert] = useState()



  const baslikUpdate = async ({ baslikId, paraBirimiName, showValue }) => {


    try {

      const paraBirimleri2 = paraBirimleri.map(oneBirim => {
        if (oneBirim.id === baslikId) {
          oneBirim.isActive = showValue
        }
        return oneBirim
      })

      // önce frontend deki veri güncelleme
      setParaBirimleri(paraBirimleri2)

      // db ye gönderme işlemi
      await RealmApp?.currentUser.callFunction("update_firma_paraBirimleri", ({ _firmaId: selectedFirma._id, paraBirimiId: baslikId, paraBirimiName, showValue }))
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
          Para Birimleri
        </Typography>

        <Divider></Divider>

        <Box sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "max-content max-content max-content", columnGap: "2rem", alignItems: "center" }} spacing={0}>

          {paraBirimleri.filter(x => x.isActive).map((oneBirim, index) => {

            return (
              <React.Fragment key={index}>
                <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.id}</Box>
                <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.name}</Box>
                <Box sx={{ justifySelf: "end" }}><Switch checked={oneBirim.isActive} onChange={() => baslikUpdate({ baslikId: oneBirim.id, paraBirimiName: oneBirim.name, showValue: !oneBirim.isActive })} /></Box>
              </React.Fragment>
            )

          })}


        </Box>

      </Dialog>
    </ >
  );



}