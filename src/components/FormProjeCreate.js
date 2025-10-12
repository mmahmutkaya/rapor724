import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
import { useGetProjeler_byFirma } from '../hooks/useMongo';
import { DialogAlert } from './general/DialogAlert'
import deleteLastSpace from '../functions/deleteLastSpace'


//mui
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';





export default function P_FormProjeCreate({ setShow }) {

  const queryClient = useQueryClient()

  const { appUser, selectedFirma } = useContext(StoreContext)

  const [projeName, setProjeName] = useState("")

  const [projeNameError, setProjeNameError] = useState(false)

  const [dialogAlert, setDialogAlert] = useState()


  const { queryData } = useGetProjeler_byFirma()


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // VALIDATE KONTROL
      let isError
      let projeNameError

      if (typeof projeName != "string" && !projeNameError) {
        setProjeNameError("Proje adı verisi 'yazı' türünde değil")
        projeNameError = true
        isError = true
      }

      if (projeName.length == 0 && !projeNameError) {
        setProjeNameError("Proje adı girilmemiş")
        projeNameError = true
        isError = true
      }

      if (projeName.length < 3 && !projeNameError) {
        setProjeNameError("Proje adı çok kısa")
        projeNameError = true
        isError = true
      }


      if (queryData?.projeler_byFirma?.find(oneProje => oneProje.name === projeName) && !projeNameError) {
        queryData?.projeler_byFirma.map(proje => {
          setProjeNameError("Firmanın bu isimde projesi mevcut")
          projeNameError = true
          isError = true
        })
      }

      if (isError) {
        console.log("frontend de durdu alt satırda")
        return
      }

      // VALIDATE KONTROL -- SONU

      // console.log(_firmaId, projeName)

      // const result_newProje = await RealmApp.currentUser.callFunction("createProje", { _firmaId, projeName })
      const response = await fetch(`/api/projeler`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
      })
      // body: JSON.stringify({ firmaId: selectedFirma._id.toString(), projeName })


      const responseJson = await response.json()
      console.log("responseJson", responseJson)
      

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }

      if (responseJson.errorObject) {
        setProjeNameError(responseJson.errorObject.projeNameError)
        return
      }


      // if (result_newProje._id) {
      //   queryClient.setQueryData(['projeler'], (firmaProjeleri) => [...firmaProjeleri, result_newProje])
      //   setShow("Main")
      //   return
      // }


    } catch (error) {

      console.log("error", error)
      
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message.includes("is not valid JSON") ? "Server hatası" : 
        error.message ? error.message : null
      })

    }

  }


  return (
    <div>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("Main")}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent sx={{ display: "grid", overflow: "visible" }}>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Proje Oluştur
              {/* </Typography> */}
            </DialogContentText>


            <Box onClick={() => setProjeNameError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="projeName"
                name="projeName"
                onChange={(e) => setProjeName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={projeName}
                error={projeNameError ? true : false}
                helperText={projeNameError ? projeNameError : ""}
                // margin="dense"
                label="Proje Adı"
                type="text"
                fullWidth
              />
            </Box>



            {/* Bu alan özel tasarlanmış olup, tıklanınca aşağıdaki çoktan seçmeli Dialog penceresini açmaktadır.  */}
            {/* <Box onClick={() => setDialogShow(2)} sx={{ mt: "2rem", borderBottom: "1px solid gray", cursor: "pointer", "&:hover": { borderBottom: "2px solid black" } }}>

              <Box sx={{ fontSize: "0.75rem", mb: "0.1rem", color: "gray" }}>
                Ait olduğu firma
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1rem", mb: "0.2rem" }}>
                <Box sx={{ pr: "1rem" }}>
                  {firmaId ? firmaProjeleri.find(x => x._id.toString() == firmaId).name : "Seçiniz"}
                </Box>
                <Box sx={{ display: "grid", alignItems: "center" }}>
                  <PlayArrowIcon sx={{ color: "gray", transform: "rotate(90deg)", fontSize: "1.3rem" }} />
                </Box>
              </Box>

            </Box> */}


          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("Main")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog >




      {/* FİRMA SEÇİMİNDE AÇILAN PENCERE */}
      {/* < Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", maxHeight: "40rem" } }
        }
        open={dialogShow === 2}
        onClose={() => setDialogShow(1)}
      >

        <DialogTitle sx={{ fontWeight: "600" }}>Proje Sahibi</DialogTitle>

        <DialogContent dividers>
          <RadioGroup
            // aria-labelledby="demo-radio-buttons-group-label"
            value={firmaId}
            name="radio-buttons-group"
            onChange={(e) => setFirmaId(e.target.value)}
          >

            {firmaProjeleri?.map((firma, index) => {
              return (
                <FormControlLabel key={index} value={firma._id.toString()} control={<Radio />} label={firma.name} />
              )
            })}

          </RadioGroup>
        </DialogContent>

        <DialogActions sx={{ fontWeight: "700" }}>
          <Button onClick={() => setDialogShow(1)}>Seç</Button>
        </DialogActions>

      </Dialog > */}

    </div >
  );


}