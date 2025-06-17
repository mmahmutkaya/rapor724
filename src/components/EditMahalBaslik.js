import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogWindow } from './general/DialogWindow.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';



export default function EditMahalBaslik({ setShow }) {

  const RealmApp = useApp();

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")
  const [anyDataInDialog, setAnyDataInDialog] = useState(0)


  const handleChange = async (oneBaslik, switchValue) => {


    const updateData = {
      functionName: switchValue ? "pushItem" : "pullItem",
      upProperty: "mahalBasliklari",
      propertyName: "show",
      propertyValue: "webPage_mahaller",
      _projectId: selectedProje._id,
      _baslikId: oneBaslik._id
    }

    const result = await RealmApp.currentUser.callFunction("updateCustomProjectSettings", updateData)

    // clientSide tarafındaki veri güncelleme

    if (switchValue) {
      setSelectedProje(selectedProje => {
        selectedProje.mahalBasliklari = selectedProje.mahalBasliklari.map(item => {
          if (item._id.toString() == oneBaslik._id.toString()) {
            if (Array.isArray(item.show)) {
              item.show.push("webPage_mahaller")
            } else {
              item.show = ["webPage_mahaller"]
            }
            return item
          } else {
            return item
          }
        })
        return selectedProje
      })
    }
    if (!switchValue) {
      setSelectedProje(selectedProje => {
        selectedProje.mahalBasliklari = selectedProje.mahalBasliklari.map(item => {
          if (item._id.toString() == oneBaslik._id.toString()) {
            item.show = item.show.filter(item => item.indexOf("webPage_mahaller"))
            return item
          } else {
            return item
          }
        })
        return selectedProje
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

        {selectedProje.mahalBasliklari.find(item => !item.sabit) ?

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
            {selectedProje.mahalBasliklari.filter(item => !item.sabit).map((oneBaslik, index) => {
              let switchValue = oneBaslik.show?.find(item => item.indexOf("webPage_mahaller") > -1) ? true : false
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
            Gösterebileceğiniz herhangi bir ilave mahal bilgisi bulamadı
          </Box>
        }
      </Dialog>
    </ >
  );



}