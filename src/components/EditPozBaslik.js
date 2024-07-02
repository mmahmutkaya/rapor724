import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogWindow } from './general/DialogWindow.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';



export default function EditPozBaslik({ setShow }) {

  const RealmApp = useApp();

  const { isProject, setIsProject } = useContext(StoreContext)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")
  const [anyDataInDialog, setAnyDataInDialog] = useState(0)


  const handleChange = async (oneBaslik, switchValue) => {

    const data = {
      _projectId: isProject._id,
      functionName: "webPage_pozlar_show",
      _baslikId: oneBaslik._id,
    }

    
    if (!switchValue) {
      data.functionName = "webPage_pozlar_hide"
    }
    console.log("data",data)
    
    const result = await RealmApp.currentUser.callFunction("updateCustomSettings", data)
    console.log("result",result)

    // clientSide tarafındaki veri güncelleme

    if (switchValue) {
      setIsProject(isProject => {
        isProject.pozBasliklari = isProject.pozBasliklari.map(item => {
          if (item._id.toString() == oneBaslik._id.toString()) {
            if (Array.isArray(item.show)) {
              item.show.push("webPage_pozlar")
            } else {
              item.show = ["webPage_pozlar"]
            }
            return item
          } else {
            return item
          }
        })
        return isProject
      })
    }
    if (!switchValue) {
      setIsProject(isProject => {
        isProject.pozBasliklari = isProject.pozBasliklari.map(item => {
          if (item._id.toString() == oneBaslik._id.toString()) {
            item.show = item.show.filter(item => item !== "webPage_pozlar")
            return item
          } else {
            return item
          }
        })
        return isProject
      })
    }

    setAnyDataInDialog(prev => prev + 1)

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
              let switchValue = oneBaslik.show?.find(item => item == "webPage_pozlar") ? true : false
              return (
                <Grid key={index} sx={{ borderTop: index == 0 ? "solid 1px gray" : null, borderBottom: "solid 1px gray", display: "grid", justifyItems: "center", width: "100%", gridTemplateColumns: "5fr 2fr" }}>
                  <Box sx={{ alignSelf: "center", mb: "0.25rem", mt: "0.25rem", ml: "1rem" }}>
                    {oneBaslik.name}
                  </Box>
                  <Box sx={{ mb: "0.25rem", mt: "0.25rem", ml: "1rem" }}>
                    <Switch checked={switchValue} onChange={() => handleChange(oneBaslik, !switchValue)} />
                    {/* <Switch checked={oneBaslik.goster} onChange={() => console.log("deneme1")} /> */}
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