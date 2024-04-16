import { useState, useContext } from 'react';
import { StoreContext } from '../components/store'
import { useApp } from "./useApp.js";


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Typography } from '@mui/material';


export default function P_FormProjectCreate({ setShow, refetch_projects }) {

  const [showDialogError, setShowDialogError] = useState(false)
  const [hataMesaj, setHataMesaj] = useState("")
  const { setProjectNames } = useContext(StoreContext)

  const RealmApp = useApp();

  async function handleSubmit(event) {

    event.preventDefault();

    try {

      const data = new FormData(event.currentTarget);
      const projectName = data.get('projectName')

      let newProject = { name: projectName }

      const resultProject = await RealmApp.currentUser.callFunction("createProject", newProject);
      newProject._id = resultProject.insertedId
      console.log("resultProject", resultProject)


      setProjectNames(oldProjects => [...oldProjects, newProject])
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



  return (
    <div>

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("ProjectMain")} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Proje Oluştur
              {/* </Typography> */}
            </DialogContentText>


            <Box onClick={() => setShowDialogError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}

                margin="normal"
                id="projectName"
                name="projectName"
                // autoFocus
                error={showDialogError}
                helperText={showDialogError ? hataMesaj : ""}
                // margin="dense"
                label="Proje Adı"
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
      </Dialog>
    </div >
  );


}