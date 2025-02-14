import React, { useState, useContext } from 'react';
import { StoreContext } from './store'
import { useQueryClient } from '@tanstack/react-query'
// import { useGetFirmalarNames } from '../hooks/useMongo';


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

  const [firmaNameError, setFirmaNameError] = useState(false)

  const [dialogShow, setDialogShow] = useState(1)


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      const data = new FormData(event.currentTarget);
      const firmaName = data.get('firmaName')

      const result = await RealmApp.currentUser.callFunction("collection_firmalar", { functionName: "createFirma", firmaName: firmaName });
      console.log("result", result)

      if (result.insertedId) {
        let newFirma = {
          _id: result.insertedId,
          name: firmaName
        }
        queryClient.setQueryData(['firmalarNames', RealmApp.currentUser._profile.data.email], (firmalarNames) => [...firmalarNames, newFirma])
      }

      setShow("Main")

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("duplicate key error")) {
        hataMesaj_ = "Bu firma ismi sistemde kayıtlı"
      }

      if (hataMesaj_.includes("çok kısa")) {
        hataMesaj_ = "Bu Çok kısa"
      }

      // setHataMesaj(hataMesaj_)
      // setDialogShow(true)

    }

  }


  return (
    <div>

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={dialogShow === 1}
        onClose={() => setShow("ProjectMain")}
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
                // value={firmaName}
                // onChange={(e) => console.log(e.target.value)}
                // onChange={(e) => setFirmaNameError(e.target.value)}
                error={firmaNameError}
                helperText={firmaNameError ? firmaNameError : ""}
                // margin="dense"
                label="Firma Adı"
                type="text"
                fullWidth
              />
            </Box>


          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("ProjectMain")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog >


    </div >
  );


}