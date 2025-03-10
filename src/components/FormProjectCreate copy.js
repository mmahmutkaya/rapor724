import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../components/store'
import { useQueryClient } from '@tanstack/react-query'


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

  const [projectNameError, setShowDialogError] = useState(false)
  const [hataMesaj, setHataMesaj] = useState("")
  // const RealmApp = useApp();
  const { RealmApp, setProjectNames } = useContext(StoreContext)

  const [dialogShow, setDialogShow] = useState(1)
  const [projeAdi, setProjeAdi] = useState("")
  const [firmaId, setFirmaId] = useState(0)



  async function handleSubmit(event) {

    event.preventDefault();

    try {

      const data = new FormData(event.currentTarget);
      const projectName = data.get('projectName')

      let newProject = {
        name: projectName,
        yetkiliKullanicilar: [
          {
            email: RealmApp.currentUser._profile.data.email,
            yetki: firmaId == 0 ? "owner" : "firma"
          }
        ],
        yetkiliFirmalar: firmaId !== 0 ?
          [
            {
              firmaId: firmaId,
              yetki: "owner"
            }
          ] :
          []
      }


      const resultProject = await RealmApp.currentUser.callFunction("createProject", newProject);
      newProject._id = resultProject.insertedId
      // console.log("resultProject", resultProject)

      queryClient.setQueryData(['projectNames', RealmApp.currentUser._profile.data.email], (projectNames) => [...projectNames, { _id: newProject._id, name: newProject.name }])
      // setProjectNames(oldProjects => [...oldProjects, newProject])
      setShow("ProjectMain")

    } catch (err) {

      console.log(err)
      // err?.message ? setHataMesaj(err.message) : setHataMesaj("Beklenmedik bir hata oluştu, lütfen Rapor7/24 ile irtibata geçiniz..")
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      if (hataMesaj_.includes("duplicate key error")) {
        hataMesaj_ = "Sistemde kayıtlı"
      }

      if (hataMesaj_.includes("çok kısa")) {
        hataMesaj_ = "Çok kısa"
      }

      setHataMesaj(hataMesaj_)
      setShowDialogError(true)

    }

  }




  const firmalar = [
    { id: 1, name: "ADL YAPI iNŞAAT YATIRIM ORTAKLIK HAYVANCILIK MADEN RIHTIM LİMAN RESTORAN" },
    { id: 2, name: "ADL YAPI" },
    { id: 3, name: "ADL YAPI2" },
    { id: 4, name: "ADL YAPI3" },
    { id: 5, name: "ADL YAPI4" },
    { id: 6, name: "ADL YAPI5" },
    { id: 7, name: "ADL YAPI" },
    { id: 8, name: "ADL YAPI" },
    { id: 9, name: "ADL YAPI" },
    { id: 10, name: "ADL YAPI" },
    { id: 11, name: "ADL YAPI" },
    { id: 12, name: "ADL YAPI" },
    { id: 13, name: "ADL YAPI" },
    { id: 14, name: "ADL YAPI" },
    { id: 15, name: "ADL YAPI" },
  ]


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
              Proje Oluştur
              {/* </Typography> */}
            </DialogContentText>


            <Box onClick={() => setShowDialogError(false)}>
              <TextField
                variant="standard"
                margin="normal"
                id="projectName"
                name="projectName"
                value={projeAdi}
                // onChange={(e) => console.log(e.target.value)}
                onChange={(e) => setProjeAdi(e.target.value)}
                error={projectNameError}
                helperText={projectNameError ? projectNameError : ""}
                // margin="dense"
                label="Proje Adı"
                type="text"
                fullWidth
              />
            </Box>


            <Box onClick={() => setDialogShow(2)} sx={{ mt: "2rem", borderBottom: "1px solid gray", cursor: "pointer", "&:hover": { borderBottom: "2px solid black" } }}>

              <Box sx={{ fontSize: "0.75rem", mb: "0.1rem", color: "gray" }}>
                Proje Sahibi
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1rem", mb: "0.2rem" }}>
                <Box sx={{ pr: "1rem" }}>
                  {firmaId == 0 ? "Şahsi Projem" : firmalar.find(x => x.id == firmaId).name}
                </Box>
                <Box sx={{ display: "grid", alignItems: "center" }}>
                  <PlayArrowIcon sx={{ color: "gray", transform: "rotate(90deg)", fontSize: "1.3rem" }} />
                </Box>
              </Box>

            </Box>


          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("ProjectMain")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog >




      {/* FİRMA SEÇİMİNDE AÇILAN PENCERE */}
      < Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", maxHeight: "40rem" } }
        }
        open={dialogShow === 2}
        onClose={() => setDialogShow(1)}
      >

        <DialogTitle sx={{ fontWeight: "600" }}>Proje Sahibi</DialogTitle>

        <DialogContent dividers>
          {/* <FormLabel id="demo-radio-buttons-group-label">Proje Yetkilisi</FormLabel> */}
          <RadioGroup
            // aria-labelledby="demo-radio-buttons-group-label"
            value={firmaId}
            name="radio-buttons-group"
            onChange={(e) => setFirmaId(e.target.value)}
          >
            <FormControlLabel value={0} control={<Radio />} label="Şahsi Projem" />

            <Box sx={{ border: "1px solid lightgray", mb: "0.5rem" }}></Box>

            {firmalar.map((firma, index) => {
              return (
                <FormControlLabel key={index} value={firma.id} control={<Radio />} label={firma.name} />
              )
            })}

          </RadioGroup>
        </DialogContent>

        <DialogActions sx={{ fontWeight: "700" }}>
          {/* <Button onClick={() => setShow("ProjectMain")}>İptal</Button> */}
          <Button onClick={() => setDialogShow(1)}>Seç</Button>
        </DialogActions>

      </Dialog >

    </div >
  );


}