import { useApp } from "./useApp.js";
import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from './general/DialogWindow.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MenuItem from '@mui/material/MenuItem';



// export default function FormMahalCreate({ setShow, isProject, refetch_mahaller }) {
export default function EditMahalBaslik({ setShow }) {

  const { isProject, setIsProject } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  // const [checked, setChecked] = useState(true);

  // console.log("isProject", isProject)

  const handleChange = (oneBaslik) => {
    setIsProject(isProject => {
      const isProject_ = { ...isProject }
      isProject_.mahalBasliklari.find(item => item.id == oneBaslik.id).goster = !isProject_.mahalBasliklari.find(item => item.id == oneBaslik.id).goster
      return isProject_
    })
  }


  return (

    <>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem", p: "1.5rem" } }}
        open={true}
        onClose={() => setShow("Main")}
      >

        {/* <Box sx={{ pb: "1rem", display: "grid", width: "100%", justifyItems: "center", fontWeight: "bold" }}>
          Mahal Başlık Görünüm Ayarları
        </Box> */}

        {/* TABLO BAŞLIK */}
        <Grid sx={{ display: "grid", justifyItems: "center", gridTemplateColumns: "5fr 2fr", fontWeight: "bold" }}>
          <Box sx={{ mb: "1rem", ml: "1rem" }}>
            Başlık Adı
          </Box>
          <Box sx={{ mb: "1rem", ml: "1rem" }}>
            Göster / Gizle
          </Box>
        </Grid>

        {/* TABLO */}
        {isProject.mahalBasliklari.filter(item => !item.sabit).map((oneBaslik, index) => {
          return (
            <Grid key={index} sx={{ borderTop: index == 0 ? "solid 1px gray" : null, borderBottom: "solid 1px gray", display: "grid", justifyItems: "center", width: "100%", gridTemplateColumns: "5fr 2fr" }}>
              <Box sx={{ alignSelf: "center", mb: "0.25rem", mt: "0.25rem", ml: "1rem" }}>
                {oneBaslik.name}
              </Box>
              <Box sx={{ mb: "0.25rem", mt: "0.25rem", ml: "1rem" }}>
                <Switch checked={oneBaslik.goster} onChange={() => handleChange(oneBaslik)} />
              </Box>
            </Grid>
          )
        })}

      </Dialog>
    </ >
  );



}