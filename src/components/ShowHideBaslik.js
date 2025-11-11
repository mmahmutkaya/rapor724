import React from 'react'
import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import { useNavigate } from "react-router-dom";


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import { DialogTitle, Typography } from '@mui/material';



export default function ShowPozBaslik({ setShow, basliklar, setBasliklar, pageName, dataName }) {

  const navigate = useNavigate()

  const { appUser, setAppUser } = useContext(StoreContext)
  const [dialogAlert, setDialogAlert] = useState()


  const baslikUpdate = async ({ baslikId, showValue }) => {

    try {

      const basliklar2 = basliklar.map(oneBaslik => {
        if (oneBaslik.id === baslikId) {
          oneBaslik.show = showValue
        }
        return oneBaslik
      })

      // db ye gönderme işlemi

      let setData = basliklar2

      const response = await fetch(`/api/user/customsettingspagessetdata`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageName,
          dataName,
          setData
        })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.ok) {

        // önce frontend deki veri güncelleme
        setBasliklar(basliklar2)

        let appUser2 = _.cloneDeep(appUser)
        appUser2.customSettings.pages[pageName][dataName] = setData
        setAppUser(appUser2)
        localStorage.setItem('appUser', JSON.stringify(appUser2))
        return

      } else {
        throw new Error("Kayıt gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
      }

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
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
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
              <Box sx={{ justifySelf: "end" }}><Switch checked={oneBaslik.show} onChange={() => baslikUpdate({ baslikId: oneBaslik.id, showValue: !oneBaslik.show })} /></Box>
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