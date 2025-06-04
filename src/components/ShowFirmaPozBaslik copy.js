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



  const baslikUpdate = async (oneBaslikId,) => {

    try {

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
        const result = RealmApp?.currentUser.callFunction("customSettings_update", ({ functionName: "sayfaBasliklari", sayfa: "firmapozlari", basliklar: basliklar3 }))
        RealmApp?.currentUser.refreshCustomData()
        console.log("result", result)

        return (
          basliklar2
        )
      })

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
            <Switch checked={oneBaslik.show} onChange={() => baslikUpdate(oneBaslik.id, !oneBaslik.show)} />
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