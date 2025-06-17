import React, { useState, useContext } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
import { useGetFirmalarNames_byUser } from '../hooks/useMongo';
import { DialogAlert } from '../../src/components/general/DialogAlert'
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





export default function P_FormFirmaCreate({ setShow }) {

  const queryClient = useQueryClient()

  const { RealmApp } = useContext(StoreContext)
  const RealmUserEmail = RealmApp.currentUser._profile.data.email

  const [firmaName, setFirmaName] = useState("")
  const [firmaNameError, setFirmaNameError] = useState()

  const [dialogAlert, setDialogAlert] = useState()

  const { data: firmalarNames_byUser } = useGetFirmalarNames_byUser()


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // const data = new FormData(event.currentTarget);
      // setFirmaName(firmaName => deleteLastSpace(firmaName).toUpperCase())

      
      // VALIDATE KONTROL
      let isError
      let firmaNameError

      if (typeof firmaName != "string" && !firmaNameError) {
        setFirmaNameError("Firma adı verisi 'yazı' türünde değil")
        firmaNameError = true
        isError = true
      }

      if (firmaName.length == 0 && !firmaNameError) {
        setFirmaNameError("Firma adı girilmemiş")
        firmaNameError = true
        isError = true
      }

      if (firmaName.length < 3 && !firmaNameError) {
        setFirmaNameError("Firma adı çok kısa")
        firmaNameError = true
        isError = true
      }


      if (firmalarNames_byUser?.length > 0 && !firmaNameError) {
        firmalarNames_byUser?.filter(oneFirma => oneFirma.yetkiliKisiler?.find(oneKisi => oneKisi.email === RealmUserEmail && oneKisi.yetki == "owner")).map(oneFirma => {
          if (oneFirma.name == firmaName && !firmaNameError) {
            setFirmaNameError("Bu isimde firmanız mevcut")
            firmaNameError = true
            isError = true
          }
        })
      }


      if (isError) {
        console.log("frontend de durdu alt satırda")
        return
      }

      // VALIDATE KONTROL -- SONU 

      const result_newFirma = await RealmApp.currentUser.callFunction("createFirma", { firmaName });


      if (result_newFirma.errorObject) {
        setFirmaNameError(result_newFirma.errorObject.firmaNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }

      if (result_newFirma._id) {
        queryClient.setQueryData(['firmalarNames_byUser', RealmUserEmail], (firmalarNames) => [...firmalarNames, result_newFirma])
        setShow("Main")
        return
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
              Firma Oluştur
              {/* </Typography> */}
            </DialogContentText>


            <Box onClick={() => setFirmaNameError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="firmaName"
                name="firmaName"
                onChange={(e) => setFirmaName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={firmaName}
                // onChange={(e) => console.log(e.target.value)}
                // onChange={(e) => setFirmaNameError(e.target.value)}
                error={firmaNameError ? true : false}
                helperText={firmaNameError ? firmaNameError : ""}
                // margin="dense"
                label="Firma Adı"
                type="text"
                fullWidth
              />
            </Box>


          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("Main")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog >


    </div >
  );


}