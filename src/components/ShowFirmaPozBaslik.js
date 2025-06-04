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



export default function ShowFirmaPozBaslik({ setShow, basliklar, setBasliklar }) {

  const RealmApp = useApp();
  const [dialogAlert, setDialogAlert] = useState()


  const handleChange = async (oneBaslik, switchValue) => {

    const updateData = {
      // functionName: switchValue ? "pushItem" : "pullItem",
      // upProperty: "pozBasliklari",
      // propertyName:"show",
      // propertyValue:"webPage_pozlar",
      // _projectId: firmaProject._id,
      // _baslikId: oneBaslik._id
    }


    try {

      await RealmApp.currentUser.callFunction("updateCustomProjectSettings", updateData)

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }


  }


  const baslikUpdate = async (oneBaslik) => {

    setBasliklar(basliklar => {

      // setBasliklar için
      const basliklar2 = basliklar.map(oneBaslik2 => {
        if (oneBaslik2.id === oneBaslik.id) {
          oneBaslik2.show = !oneBaslik.show
          return oneBaslik2
        }
        return oneBaslik2
      })

      // db deki güncelleme için / veri azaltılıyor
      const basliklar3 = basliklar2.map(x => {
        delete x.baslikName
        return x
      })

      // db ye gönderme işlemi
      const result = RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "sayfaBasliklari", page: "firmapozlari", basliklar: basliklar3 }))
      RealmApp?.currentUser.refreshCustomData()

      // sorun çıkmadı frontend deki veri güncelleme
      return (
        basliklar2
      )
    })
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
          Sütunlar
        </Typography>

        <Divider></Divider>

        {basliklar.filter(x => x.visible).map((oneBaslik, index) =>
          <React.Fragment key={index}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5rem", alignItems: "center" }}>
              <Box sx={{ my: "0.2rem", justifySelf: "start" }}>{oneBaslik.baslikName}</Box>
              <Box sx={{ justifySelf: "end" }}><Switch checked={oneBaslik.show} onChange={() => baslikUpdate(oneBaslik)} /></Box>
            </Box>
            <Divider></Divider>
          </React.Fragment>
        )}


        {/* <Switch checked={oneBaslik.goster} onChange={() => console.log("deneme1")} /> */}

        {/* <Box>
          Herhangi bir ilave başlık oluşturulmamış
        </Box> */}

      </Dialog>
    </ >
  );



}