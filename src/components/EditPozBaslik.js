import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogWindow } from './general/DialogWindow.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';



export default function EditPozBaslik({ setShow }) {

  const { isProject, setIsProject } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  // const [checked, setChecked] = useState(true);

  // console.log("isProject", isProject)



  const handleChange = async (oneBaslik) => {

    const data = {
      _projectId: isProject._id,
      isProject_settings: "pozBasliklari",
      platform: "web",
      page: "pozlar",
      toggle: "show",
      baslikId: oneBaslik.id,
    }

    const result = await RealmApp.currentUser.callFunction("updateProject", data)

    setIsProject(isProject => {
      const isProject_ = { ...isProject }
      isProject_.pozBasliklari.find(item => item.id == oneBaslik.id).goster = !isProject_.pozBasliklari.find(item => item.id == oneBaslik.id).goster
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

        {isProject.pozBasliklari.find(item => !item.sabit) ?

          <>
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
            {isProject.pozBasliklari.filter(item => !item.sabit).map((oneBaslik, index) => {
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

          </>
          :
          <Box>
            Herhangi bir ilave başlık oluşturulmamış
          </Box>
        }
      </Dialog>
    </ >
  );



}