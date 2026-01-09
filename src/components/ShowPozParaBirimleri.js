import React from 'react'
import { useEffect, useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import _ from 'lodash';
import { useNavigate } from "react-router-dom";


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { DialogTitle, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';





export default function ShowPozParaBirimleri({ setShow, paraBirimleri, setParaBirimleri }) {

  const navigate = useNavigate()

  const { appUser, setAppUser } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()


  let isDone
  useEffect(() => {
    if (!isDone) {
      deActiveParaBirimiRemove()
    }
    isDone = true
  }, [])


  const deActiveParaBirimiRemove = async () => {

    try {

      let hasDeactiveParaBirimi
      let userCustomParabirimleri = appUser.customSettings.pages.birimfiyat.paraBirimleri
      userCustomParabirimleri.map(oneBirim => {
        if (!paraBirimleri.find(x => x.id === oneBirim.id)) {
          hasDeactiveParaBirimi = true
        }
      })

      if (!hasDeactiveParaBirimi) {
        return
      }

      let paraBirimleri2 = _.cloneDeep(paraBirimleri)

      let pageName = "birimfiyat"
      let dataName = "paraBirimleri"
      let setData = paraBirimleri2

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/user/customsettingspagessetdata`, {
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

        // frontend deki veri güncelleme
        setParaBirimleri(paraBirimleri2)

        let appUser2 = _.cloneDeep(appUser)
        appUser2.customSettings.pages[pageName][dataName] = setData
        setAppUser(appUser2)
        localStorage.setItem('appUser', JSON.stringify(appUser2))
        return

      } else {
        throw new Error("Kayıt gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
      }


    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }

  }


  const baslikUpdate = async ({ oneBirim, showValue }) => {

    console.log("başlık update")

    let baslikId = oneBirim.id

    try {

      let paraBirimleri2 = _.cloneDeep(paraBirimleri)
      paraBirimleri2 = paraBirimleri2.map(oneBirim2 => {
        if (oneBirim2.id === baslikId) {
          oneBirim2.isShow = showValue
        }
        return oneBirim2
      })

      // db ye gönderme işlemi
      // await RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "paraBirimiBasliklari", sayfaName: "pozlar", baslikId, showValue }))
      // await RealmApp?.currentUser.refreshCustomData()

      let pageName = "birimfiyat"
      let dataName = "paraBirimleri"
      let setData = paraBirimleri2

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/user/customsettingspagessetdata`, {
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

        // frontend deki veri güncelleme
        setParaBirimleri(paraBirimleri2)

        let appUser2 = _.cloneDeep(appUser)
        appUser2.customSettings.pages[pageName][dataName] = setData
        setAppUser(appUser2)
        localStorage.setItem('appUser', JSON.stringify(appUser2))
        return

      } else {
        throw new Error("Kayıt gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
      }


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


      {!paraBirimleri.length > 0 &&
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


      {paraBirimleri.length > 0 &&

        <Dialog
          PaperProps={{ sx: { maxWidth: "30rem", minWidth: "20rem", position: "fixed", top: "10rem", p: "1.5rem" } }}
          open={true}
          onClose={() => setShow("Main")}
        >

          <Box sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "1fr max-content max-content", alignItems: "center" }} spacing={0}>

            <Typography variant="subtitle1" sx={{ fontWeight: "600" }}>
              Para Birimleri
            </Typography>

            {/* <Box
              onClick={() => setParaEdit(x => {
                setShow("Main")
                return !x
              })}
              sx={{ mr: "0.5rem", cursor: "pointer" }}
            >
              <Avatar sx={{ height:"2rem", width:"2rem", mr:"0.5rem",fontSize: "0.9rem", fontWeight: 600, color: "black" }}>V</Avatar>
            </Box> */}

            {/* <Box
              onClick={() => setParaEdit(x => {
                setShow("Main")
                return !x
              })}
              sx={{ cursor: "pointer", mt:"0.2rem" }}
            >
              <EditIcon variant="contained" />
            </Box> */}


          </Box>

          <Divider></Divider>

          <Box sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: "max-content max-content max-content", columnGap: "2rem", alignItems: "center" }} spacing={0}>

            {paraBirimleri?.map((oneBirim, index) => {

              return (
                <React.Fragment key={index}>

                  <Box sx={{ my: "0.2rem", justifySelf: "start", color: oneBirim.isActive && "gray" }}>{oneBirim.id}</Box>

                  <Box sx={{ my: "0.2rem", justifySelf: "start", color: oneBirim.isActive && "gray" }}>{oneBirim.name}</Box>

                  <Box sx={{ justifySelf: "end" }}>
                    <Switch checked={oneBirim.isShow} disabled={oneBirim.isActive} onChange={() => baslikUpdate({ oneBirim, showValue: !oneBirim.isShow })} />
                  </Box>

                </React.Fragment>
              )

            })}


          </Box>

        </Dialog>

      }

    </ >
  );


}