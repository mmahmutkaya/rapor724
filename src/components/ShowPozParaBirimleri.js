import React from 'react'
import { useEffect, useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { DialogTitle, Typography } from '@mui/material';



export default function ShowPozParaBirimleri({ setShow, paraBirimleri, setParaBirimleri, paraEdit, setParaEdit }) {


  const RealmApp = useApp();
  const { selectedFirma } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)


  const [dialogAlert, setDialogAlert] = useState()
  // const [showEminMisin, setShowEminMisin] = useState(false)

  const baslikUpdate = async ({ oneBirim, showValue }) => {

    let baslikId = oneBirim.id

    try {

      const paraBirimleri2 = paraBirimleri.map(oneBirim2 => {
        if (oneBirim2.id === baslikId) {
          oneBirim2.show = showValue
        }
        return oneBirim2
      })

      // önce frontend deki veri güncelleme
      setParaBirimleri(paraBirimleri2)

      // db ye gönderme işlemi
      await RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "paraBirimiBasliklari", sayfaName: "pozlar", baslikId, showValue }))
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

      {!paraBirimleri.length &&
        <DialogAlert
          dialogIcon={"info"}
          dialogMessage={"Firma ayarlarından para birimi eklenmesi gerekmekte"}
          onCloseAction={() => {
            // setShowEminMisin()
            setShow("Main")
          }}
          actionText1={"OK"}
          action1={() => {
            // setShowEminMisin()
            setShow("Main")
          }}
        />
      }


      {paraBirimleri.length &&

        <Dialog
          PaperProps={{ sx: { maxWidth: "30rem", minWidth: "20rem", position: "fixed", top: "10rem", p: "1.5rem" } }}
          open={true}
          onClose={() => setShow("Main")}
        >

          <Box sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "1fr max-content", columnGap: "2rem", alignItems: "center" }} spacing={0}>

            <Typography variant="subtitle1" sx={{ mb: "0.5rem", fontWeight: "600" }}>
              Para Birimleri
            </Typography>

            <Box onClick={() => setParaEdit(x => !x)} sx={{ justifySelf: "end", color: paraEdit ? "rgba(0, 0, 0, 0.81)" : "rgba(0, 0, 0, 0.4)", mr: "0.5rem", cursor: "pointer" }}>
              {/* <IconButton onClick={() => setParaEdit(true)} disabled={false}> */}
              <EditIcon variant="contained" />
              {/* </IconButton> */}
            </Box>


          </Box>

          <Divider></Divider>

          <Box sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "max-content max-content max-content", columnGap: "2rem", alignItems: "center" }} spacing={0}>

            {paraBirimleri?.map((oneBirim, index) => {

              return (
                <React.Fragment key={index}>

                  <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.id}</Box>

                  <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBirim.name}</Box>

                  <Box sx={{ justifySelf: "end" }}><Switch checked={oneBirim.show} onChange={() => baslikUpdate({ oneBirim, showValue: !oneBirim.show })} /></Box>

                </React.Fragment>
              )

            })}


          </Box>

        </Dialog>

      }

    </ >
  );



}