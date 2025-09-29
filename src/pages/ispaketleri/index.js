
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import FormProjeCreate from '../../components/FormProjeCreate'
import { useNavigate } from "react-router-dom";
import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from '../../components/general/DialogAlert'


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


export default function P_IsPaketleri() {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedProje) navigate("/projeler")
  }, []);



  const [show, setShow] = useState("Main")

  const { data: projelerNames_byFirma } = useGetProjelerNames_byFirma()


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


  return (
    <Box>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
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
              Projeler
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

              <Grid item>
                <IconButton onClick={() => setShow("FormProjeCreate")} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "FormProjeCreate" &&
        <Box>
          <FormProjeCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !projelerNames_byFirma?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Firmaya ait proje oluşturmak için menüyü kullanabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && projelerNames_byFirma?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            projelerNames_byFirma.map((oneProje, index) => (

              <Box
                key={index}
                onClick={() => handleProjeClick(oneProje)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  "&:hover": {
                    color: "black",
                    "& .childClass": {
                      color: "black",
                    }
                  },
                  alignItems: "center",
                  padding: "0.2rem 1rem",
                  cursor: "pointer"
                }}
              >

                <Box className="childClass" sx={{ pr: "1rem", color: "gray" }}>
                  <FolderIcon />
                </Box>

                <Box className="childClass" sx={{ pr: "1rem", color: "gray" }}>
                  <Typography>
                    {oneProje.name}
                  </Typography>
                </Box>
                {/* 
                <Box className="childClass" sx={{ pr: "1rem", color: "gray" }}>
                  <Typography>
                    {oneProje.yetkiliKisiler.find(oneKisi => oneKisi.email === RealmApp.currentUser._profile.data.email && oneKisi.yetki === "owner") ? "sahip" : "diğer"}
                  </Typography>
                </Box> */}

              </Box>

            ))
          }


        </Stack>
      }

    </Box>

  )

}


