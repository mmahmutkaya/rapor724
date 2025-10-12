
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormFirmaCreate from '../../components/FormFirmaCreate'
import { useNavigate } from "react-router-dom";
import { useGetFirmalar } from '../../hooks/useMongo';
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




export default function P_Firmalar() {

  const { appUser } = useContext(StoreContext)
  const { setSelectedFirma } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()


  useEffect(() => {
    setSelectedFirma()
  }, []);

  const navigate = useNavigate()

  const [show, setShow] = useState("Main")


  const onSuccess = (err) => {
    console.log("err", err)
  }
  const onError = (err) => {
    console.log("err", err)
  }
  const { data } = useGetFirmalar(onSuccess, onError)


  const handleFirmaClick = async (oneFirma) => {

    try {

      // const firma = await RealmApp.currentUser.callFunction("getFirma", { _firmaId: oneFirma._id })

      const response = await fetch(`/api/firmalar/${oneFirma._id.toString()}`, {
        method: 'GET',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify({ firmaName })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }

      // if (responseJson.errorObject) {
      //   setFirmaNameError(responseJson.errorObject.firmaNameError)
      //   console.log("backend den gelen hata ile durdu")
      //   return
      // }

      if (responseJson.firma) {
        setSelectedFirma(responseJson.firma)
        navigate("/projeler")
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
              Firmalar
            </Typography>
          </Grid>


          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>

              {/* <Grid item>
                <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                  <DeleteIcon
                    variant="contained" color="error"
                  />
                </IconButton>
              </Grid> */}

              <Grid item>
                <IconButton onClick={() => setShow("FormFirmaCreate")} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "FormFirmaCreate" &&
        <Box>
          <FormFirmaCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !data?.firmalar?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir firma bulunamadı, menüler yardımı ile oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && data?.firmalar?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            data.firmalar.map((oneFirma, index) => (

              <Box
                key={index}
                onClick={() => handleFirmaClick(oneFirma)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr",
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
                    {oneFirma.name}
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


