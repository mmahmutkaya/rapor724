
import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import FormIsPaketBasligiCreate from '../../components/FormIsPaketBasligiCreate'
import { useNavigate } from "react-router-dom";
// import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from '../../components/general/DialogAlert'
import ShowIsPaketBasliklar from '../../components/ShowIsPaketBasliklar'


import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import FolderIcon from '@mui/icons-material/Folder';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';


export default function P_IsPaketleri() {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [basliklar, setBasliklar] = useState(RealmApp?.currentUser.customData.customSettings.pages.ispaketleri.basliklar)

  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedProje) navigate("/projeler")
  }, []);




  const [show, setShow] = useState("Main")

  // const { data: projelerNames_byFirma } = useGetProjelerNames_byFirma()
  const isPaketBasliklar = selectedProje?.isPaketBasliklar


  const handleProjeClick = async (oneProje) => {
    // console.log("oneProje", oneProje)
    try {
      const proje = await RealmApp.currentUser.callFunction("getProje", { _projeId: oneProje._id })
      if (proje._id) {
        setSelectedProje(proje)
        navigate("/dashboard")
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


  const aciklamaShow = basliklar?.find(x => x.id === "aciklama").show


  // const columns2 =
  //   `max-content 
  // minmax(min-content, 35rem) 
  // max-content
  // ${pozAciklamaShow ? " 0.4rem minmax(min-content, 10rem)" : ""}
  // ${pozVersiyonShow ? " 0.4rem max-content" : ""}
  // ${paraBirimiAdet === 1 ? " 0.4rem max-content" : paraBirimiAdet > 1 ? " 0.4rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
  //   `


  // iş paket başlığı - açıklama  
  // sıra - iş paketi - keşif - bütçe - güncel iş sonu - gerçekleşen - kalan 
  const columns = "repeat(7, max-content)"


  return (
    <Box>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && <ShowIsPaketBasliklar setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />}


      {/* BAŞLIK */}
      <Paper >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >

          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              İş Paketleri
            </Typography>
          </Grid>

          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>

              <Grid item>
                <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                  <DeleteIcon
                    variant="contained" color="error"
                  />
                </IconButton>
              </Grid>


              <Grid item >
                <IconButton onClick={() => setShow("ShowBaslik")}>
                  <VisibilityIcon variant="contained" />
                </IconButton>
              </Grid>


              <Grid item>
                <IconButton onClick={() => setShow("FormIsPaketBasligiCreate")} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "FormIsPaketBasligiCreate" &&
        <Box>
          <FormIsPaketBasligiCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !isPaketBasliklar?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bir iş paketi başlığı oluşturmak için (+) tuşuna basınız..
          </Alert>
        </Stack>
      }

      {show == "Main" && isPaketBasliklar?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem", display: "grid", gridTemplateColumns: columns }}>

          {/* iş paket başlığı */}
          {isPaketBasliklar.map((oneProje, index) => (

            <React.Fragment key={index}>
              <Box sx={{ gridColumn: "1/8", color: "black", fontWeight: 700 }}>
                {oneProje.name}
              </Box>

              {
                aciklamaShow &&
                <Box sx={{ gridColumn: "1/8", color: "gray" }}>
                  {oneProje.aciklama}
                </Box>
              }

            </React.Fragment>

            // iş paketleri

          ))}


        </Stack>
      }

    </Box>

  )

}


