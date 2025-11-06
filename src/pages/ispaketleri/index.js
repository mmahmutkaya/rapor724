
import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import FormIsPaketBaslikCreate from '../../components/FormIsPaketBaslikCreate'
import FormIsPaketCreate from '../../components/FormIsPaketCreate'
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
import LensIcon from '@mui/icons-material/Lens';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import InfoIcon from '@mui/icons-material/Info';



export default function P_IsPaketleri() {

  // const RealmApp = useApp();
  const { appUser, RealmApp } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedIsPaketBaslik, setSelectedIsPaketBaslik } = useContext(StoreContext)
  const { selectedIsPaket, setSelectedIsPaket } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.ispaketleri.basliklar)

  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedProje) navigate("/projeler")
  }, []);



  const [show, setShow] = useState("Main")

  // const { data: projelerNames_byFirma } = useGetProjelerNames_byFirma()
  const isPaketBasliklar = selectedProje?.isPaketVersiyonlar?.find(x => x.versiyon === 0).basliklar
  const aciklamaShow = basliklar?.find(x => x.id === "aciklama").show


  // const handleProjeClick = async (oneProje) => {
  //   // console.log("oneProje", oneProje)
  //   try {
  //     const proje = await RealmApp.currentUser.callFunction("getProje", { _projeId: oneProje._id })
  //     if (proje._id) {
  //       setSelectedProje(proje)
  //       navigate("/dashboard")
  //     }
  //   } catch (err) {
  //     console.log(err)
  //     setDialogAlert({
  //       dialogIcon: "warning",
  //       dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
  //       detailText: err?.message ? err.message : null
  //     })
  //   }
  // }




  const css_IsPaketleriBaslik = {
    display: "grid", px: "0.5rem", backgroundColor: "lightgray", fontWeight: 700, textWrap: "nowrap", border: "1px solid black"
  }

  const css_IsPaketleri = {
    display: "grid", px: "0.5rem", border: "1px solid black", alignItems: "center"
  }

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
  const columns = "max-content minmax(min-content, 20rem) repeat(5, max-content)"


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
      {show == "ShowBaslik" &&
        <ShowIsPaketBasliklar setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />
      }


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

              {selectedIsPaketBaslik &&
                <>
                  <Grid item>
                    <IconButton onClick={() => setSelectedIsPaketBaslik()} aria-label="addWbs">
                      <ClearOutlined variant="contained" color="error" />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                      <DeleteIcon
                        variant="contained" color="error"
                      />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton onClick={() => setShow("FormIsPaketCreate")} aria-label="addWbs">
                      <AddCircleOutlineIcon variant="contained" color="success" />
                    </IconButton>
                  </Grid>
                </>
              }

              {!selectedIsPaketBaslik &&
                <>
                  <Grid item >
                    <IconButton onClick={() => setShow("ShowBaslik")}>
                      <VisibilityIcon variant="contained" />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton onClick={() => setShow("FormIsPaketBaslikCreate")} aria-label="addWbs">
                      <AddCircleOutlineIcon variant="contained" color="success" />
                    </IconButton>
                  </Grid>
                </>
              }

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "FormIsPaketBaslikCreate" &&
        <Box>
          <FormIsPaketBaslikCreate setShow={setShow} />
        </Box>
      }

      {show == "FormIsPaketCreate" &&
        <Box>
          <FormIsPaketCreate setShow={setShow} />
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

          {/* iş paket başlığı adı - en üst satır*/}
          {isPaketBasliklar.map((oneBaslik, index) => {

            let isBaslikSelected
            if (oneBaslik._id.toString() === selectedIsPaketBaslik?._id.toString()) {
              isBaslikSelected = true
            }

            return (

              <React.Fragment key={index}>

                {/* AYRAÇ */}
                <Box sx={{ display: index === 0 && "none", gridColumn: "1/-1", mt: "1rem", backgroundColor: "darkred", height: "0.2rem" }}></Box>

                <React.Fragment >

                  <Box onClick={() => setSelectedIsPaketBaslik(oneBaslik)} sx={{ gridColumn: "1/-1", fontWeight: 700, cursor: "pointer", mt: index !== 0 && "1rem" }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "start" }}>
                      <Box>
                        {oneBaslik.name}
                      </Box>
                      {isBaslikSelected &&
                        <Box sx={{ display: "grid", alignItems: "center" }}>
                          <LensIcon sx={{ color: "darkred", fontSize: "0.9rem", ml: "0.5rem" }} />
                        </Box>
                      }
                    </Box>
                  </Box>

                  {
                    aciklamaShow &&
                    <Box sx={{ gridColumn: "1/8", display: "grid", alignItems: "center", color: "gray", mb: "0.3rem" }}>
                      {" - "} {oneBaslik.aciklama}
                    </Box>
                  }

                </React.Fragment>


                {/* iş paketleri henüz oluşturulmamış ise */}
                {!oneBaslik.isPaketleri.length > 0 &&
                  <Box onClick={() => setSelectedIsPaketBaslik(oneBaslik)} sx={{ gridColumn: "1/-1", cursor: "pointer", display: "grid", gridAutoFlow: "column", backgroundColor: "rgba(122, 217, 227, 0.28)", alignItems: "center", justifyContent: "start" }}>
                    <InfoIcon variant="contained" sx={{ color: "rgba(79, 141, 148, 1)", fontSize: "1.2rem", m: "0.3rem" }} />
                    <Box>
                      Bu başlık altında henüz iş paketi oluşturulmamış.
                    </Box>
                  </Box>
                }

                {oneBaslik.isPaketleri.length > 0 &&
                  <React.Fragment>

                    <Box sx={{ ...css_IsPaketleriBaslik, }}>
                      Sıra
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      İş Paketi
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      Keşif
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      Bütçe
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      İş Sonu
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      Gerçekleşen
                    </Box>

                    <Box sx={{ ...css_IsPaketleriBaslik }}>
                      Kalan
                    </Box>

                  </React.Fragment>
                }

                {/* iş paketleri verileri */}
                {oneBaslik.isPaketleri.length > 0 && oneBaslik.isPaketleri.map((onePaket, index) => {

                  return (

                    // iş paketleri başlığı
                    <React.Fragment key={index} >

                      <Box sx={{ ...css_IsPaketleri, justifyContent: "center" }}>
                        {index + 1}
                      </Box>

                      <Box sx={{ ...css_IsPaketleri }}>
                        {onePaket.name}
                      </Box>

                      <Box onClick={() => navigate("/ispaketleripozlar")} sx={{ ...css_IsPaketleri, cursor: "pointer" }}>
                        Keşif
                      </Box>

                      <Box sx={{ ...css_IsPaketleri }}>
                        Bütçe
                      </Box>

                      <Box sx={{ ...css_IsPaketleri }}>
                        İş Sonu
                      </Box>

                      <Box sx={{ ...css_IsPaketleri }}>
                        Gerçekleşen
                      </Box>

                      <Box sx={{ ...css_IsPaketleri }}>
                        Kalan
                      </Box>

                    </React.Fragment>
                  )

                })}

              </React.Fragment>

            )



          })}

        </Stack>
      }

    </Box >

  )

}


