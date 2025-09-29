import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
// import { useGetIsPaketBasliklari } from '../hooks/useMongo';
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





export default function Form_IsPaketBasligi_Create({ setShow }) {

  const queryClient = useQueryClient()
  const { RealmApp, selectedProje } = useContext(StoreContext)

  const [baslikName, setBaslikName] = useState("")

  const [baslikNameError, setBaslikNameError] = useState(false)

  const [dialogAlert, setDialogAlert] = useState()


  const isPaketBasliklari = selectedProje?.isPaketBasliklari


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // const data = new FormData(event.currentTarget);
      // const baslikName = deleteLastSpace(data.get('baslikName')).toUpperCase()

      let _projeId = selectedProje?._id


      // VALIDATE KONTROL
      let isError
      let baslikNameError

      if (typeof baslikName != "string" && !baslikNameError) {
        setBaslikNameError("Başlık 'yazı' türünde değil")
        baslikNameError = true
        isError = true
      }

      if (baslikName.length == 0 && !baslikNameError) {
        setBaslikNameError("Başlık adı girilmemiş")
        baslikNameError = true
        isError = true
      }

      if (baslikName.length < 3 && !baslikNameError) {
        setBaslikNameError("Başlık adı çok kısa")
        baslikNameError = true
        isError = true
      }


      if (isPaketBasliklari?.length > 0 && !baslikNameError) {
        kesiflerNames_byProje.map(oneKesif => {
          if (oneKesif.name == baslikName) {
            setBaslikNameError("Bu projede bu keşif ismi kullanılmış")
            baslikNameError = true
            isError = true
          }
        })
      }

      if (isError) {
        console.log("frontend de durdu alt satırda")
        return
      }

      // VALIDATE KONTROL -- SONU

      // console.log(_firmaId, baslikName)


      const result_newKesif = await RealmApp.currentUser.callFunction("createKesif", { _projeId, baslikName });

      if (result_newKesif.errorObject) {
        setBaslikNameError(result_newKesif.errorObject.baslikNameError)
        console.log("backend den dönen errorObject hata ile durdu")
        return
      }

      if (result_newKesif._id) {
        queryClient.setQueryData(['kesiflerNames_byProje'], (kesifler) => [...kesifler, result_newKesif])
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
              Keşif Oluştur
              {/* </Typography> */}
            </DialogContentText>


            <Box onClick={() => setBaslikNameError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="baslikName"
                name="baslikName"
                onChange={(e) => setBaslikName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={baslikName}
                error={baslikNameError ? true : false}
                helperText={baslikNameError ? baslikNameError : ""}
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