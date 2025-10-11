import React, { useState, useContext } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
import { useGetFirmalar } from '../hooks/useMongo';
import { DialogAlert } from '../../src/components/general/DialogAlert'
import deleteLastSpace from '../functions/deleteLastSpace'
import _ from 'lodash';



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

  const { appUser } = useContext(StoreContext)

  const [firmaName, setFirmaName] = useState("")

  const [firmaNameError, setFirmaNameError] = useState()

  const [dialogAlert, setDialogAlert] = useState()

  const { data: queryData } = useGetFirmalar()

  async function handleSubmit(event) {

    event.preventDefault();

    try {

      const data = new FormData(event.currentTarget);
      const firmaName = deleteLastSpace(data.get('firmaName'))


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


      if (queryData?.firmalar?.length > 0 && !firmaNameError) {
        let filteredFirmalar = queryData?.firmalar?.filter(oneFirma => oneFirma.yetkiliKisiler?.find(oneKisi => oneKisi.email === appUser.email && oneKisi.yetkiler.find(x => x.name == "owner")))
        filteredFirmalar.map(oneFirma => {
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

      const response = await fetch(`/api/firmalar`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firmaName })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }

      if (responseJson.errorObject) {
        setFirmaNameError(responseJson.errorObject.firmaNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }

      if (responseJson.newFirma) {
        let queryData2 = _.cloneDeep(queryData)
        queryData2.firmalar = [...queryData2?.firmalar, responseJson.newFirma]
        queryClient.setQueryData(['firmalar'], queryData2)
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
                helperText={firmaNameError ? firmaNameError : " "}
                // margin="dense"
                label="Firma Adı"
                type="text"
                fullWidth
              />
            </Box>


          </DialogContent>

          <DialogActions sx={{ pr: "1.25rem", pb:"1.25rem" }}>
            <Button onClick={() => setShow("Main")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog >


    </div >
  );


}