
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import FormProjeCreate from '../../components/FormProjeCreate'
import { useNavigate } from "react-router-dom";
import { useGetProjeler_byFirma } from '../../hooks/useMongo';
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
import LinearProgress from '@mui/material/LinearProgress';



export default function P_Projeler() {

  const { appUser, setAppUser } = useContext(StoreContext)
  const { selectedFirma, setSelectedProje } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const navigate = useNavigate()

  const [show, setShow] = useState("Main")

  const { data, error, isLoading } = useGetProjeler_byFirma()


  useEffect(() => {

    if (!selectedFirma) navigate("/firmalar")

    setSelectedProje()

    if (error) {
      console.log("error", error)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })

    }

  }, [error]);





  const handleProjeClick = async (oneProje) => {
    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/${oneProje._id.toString()}`, {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.proje) {
        setSelectedProje(responseJson.proje)
        navigate("/wbs")
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
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
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

      {isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }

      {!isLoading && show == "Main" && !data?.projeler?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Firmaya ait proje oluşturmak için menüyü kullanabilirsiniz.
          </Alert>
        </Stack>
      }

      {!isLoading && show == "Main" && data?.projeler?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            data?.projeler.map((oneProje, index) => (

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


              </Box>

            ))
          }


        </Stack>
      }

    </Box>

  )

}


