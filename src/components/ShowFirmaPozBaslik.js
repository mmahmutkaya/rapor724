import { useState, useContext } from 'react';
import { useApp } from "./useApp.js";
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';



export default function ShowFirmaPozBaslik({ setShow, basliklar, setBasliklar }) {

  const RealmApp = useApp();
  const [dialogAlert, setDialogAlert] = useState()


  const handleChange = async (oneBaslik, switchValue) => {

    const updateData = {
      // functionName: switchValue ? "pushItem" : "pullItem",
      // upProperty: "pozBasliklari",
      // propertyName:"show",
      // propertyValue:"webPage_pozlar",
      // _projectId: firmaProject._id,
      // _baslikId: oneBaslik._id
    }


    try {

      // clientSide tarafındaki veri güncelleme

      if (switchValue) {
        // setFirmaProject(firmaProject => {
        //   firmaProject.pozBasliklari = firmaProject.pozBasliklari.map(item => {
        //     if (item._id.toString() == oneBaslik._id.toString()) {
        //       if (Array.isArray(item.show)) {
        //         item.show.push("webPage_pozlar")
        //       } else {
        //         item.show = ["webPage_pozlar"]
        //       }
        //       return item
        //     } else {
        //       return item
        //     }
        //   })
        //   return firmaProject
        // })
      }
      if (!switchValue) {
        // setFirmaProject(firmaProject => {
        //   firmaProject.pozBasliklari = firmaProject.pozBasliklari.map(item => {
        //     if (item._id.toString() == oneBaslik._id.toString()) {
        //       item.show = item.show.filter(item => item.indexOf("webPage_pozlar"))
        //       return item
        //     } else {
        //       return item
        //     }
        //   })
        //   return firmaProject
        // })
      }


      await RealmApp.currentUser.callFunction("updateCustomProjectSettings", updateData)

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }


  }


  const baslikUpdate = async (oneBaslik) => {

    setBasliklar(basliklar => {

      const basliklar2 = basliklar.map(oneBaslik2 => {
        if (oneBaslik2.id === oneBaslik.id) {
          oneBaslik2.show = !oneBaslik.show
          return oneBaslik2
        }
        return oneBaslik2
      })

      const basliklar3 = basliklar2.map(x => {
        delete x.baslikName
        return x
      })
      const result = RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "sayfaBasliklari", basliklar: basliklar3 }))
      RealmApp?.currentUser.refreshCustomData()
      console.log("result", result)
      
      return (
        basliklar2
      )
    })
  }


  return (

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Dialog
        PaperProps={{ sx: { width: "30rem", position: "fixed", top: "10rem", p: "1.5rem" } }}
        open={true}
        onClose={() => setShow("Main")}
      >

        {basliklar.filter(x => x.visible).map((oneBaslik, index) =>
          <Box key={index} sx={{ display: "grid", gridTemplateColumns: "1fr 5rem", alignItems: "center", justifyItems: "center" }}>
            <Box>{oneBaslik.baslikName}</Box>
            <Switch checked={oneBaslik.show} onChange={() => baslikUpdate(oneBaslik)} />
          </Box>
        )}



        {/* <Switch checked={oneBaslik.goster} onChange={() => console.log("deneme1")} /> */}

        {/* <Box>
          Herhangi bir ilave başlık oluşturulmamış
        </Box> */}

      </Dialog>
    </ >
  );



}