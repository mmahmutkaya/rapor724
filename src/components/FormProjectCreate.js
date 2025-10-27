import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../components/store'
import { useQueryClient } from '@tanstack/react-query'
import { useGetProjectNames_firma } from '../hooks/useMongo';
import { DialogAlert } from '../../src/components/general/DialogAlert'


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





export default function P_FormProjectCreate({ setShow }) {

  const queryClient = useQueryClient()
  const { RealmApp, selectedFirma } = useContext(StoreContext)

  const [projectNameError, setProjectNameError] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()

  const [projectName, setProjectName] = useState("")

  const { data: projectNames_firma } = useGetProjectNames_firma()


  async function handleSubmit(event) {

    event.preventDefault();

    try {

      const data = new FormData(event.currentTarget);
      const projectName = data.get('projectName')

      let _firmaId = selectedFirma?._id


      // VALIDATE KONTROL
      let isError
      let projectNameError

      if (typeof projectName != "string" && !projectNameError) {
        setProjectNameError("Proje adı verisi 'yazı' türünde değil")
        projectNameError = true
        isError = true
      }

      if (projectName.length == 0 && !projectNameError) {
        setProjectNameError("Proje adı girilmemiş")
        projectNameError = true
        isError = true
      }

      if (projectName.length < 3 && !projectNameError) {
        setProjectNameError("Proje adı çok kısa")
        projectNameError = true
        isError = true
      }


      if (projectNames_firma?.length > 0 && !projectNameError) {
        projectNames_firma.map(proje => {
          if (proje.name == projectName && !projectNameError) {
            setProjectNameError("Firmanın bu isimde projesi mevcut")
            projectNameError = true
            isError = true
          }
        })
      }

      if (isError) {
        console.log("frontend de durdu alt satırda")
        return
      }

      // VALIDATE KONTROL -- SONU 


      const result = await RealmApp.currentUser.callFunction("collection_projects", { functionName: "createProject", _firmaId, projectName });

      if (result.errorObject) {
        setProjectNameError(result.errorObject.projectNameError)
        console.log("backend den dönen errorObject hata ile durdu")
        return
      }

      if (result.insertedId) {
        let newProjectName = {
          _id: result.insertedId,
          name: projectName
        }
        queryClient.setQueryData(['projectNames_firma', _firmaId.toString()], (firmaProjeleri) => [...firmaProjeleri, newProjectName])
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
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
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


            <Box onClick={() => setProjectNameError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="projectName"
                name="projectName"
                value={projectName}
                // onChange={(e) => console.log(e.target.value)}
                onChange={(e) => setProjectName(e.target.value)}
                error={projectNameError ? true : false}
                helperText={projectNameError ? projectNameError : ""}
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