
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useGetFirmaPozlar } from '../../hooks/useMongo';

import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'


import { DialogAlert } from '../../components/general/DialogAlert'

import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import ClearOutlined from '@mui/icons-material/ClearOutlined';



function PozHavuzuHeader() {
  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const [dialogAlert_header, setDialogAlert_header] = useState()
  return (
    <Paper >
      {dialogAlert_header &&
        <DialogAlert
          dialogIcon={dialogAlert_header.dialogIcon}
          dialogMessage={dialogAlert_header.dialogMessage}
          detailText={dialogAlert_header.detailText}
          onCloseAction={dialogAlert_header.onCloseAction ? dialogAlert_header.onCloseAction : () => setDialogAlert_header()}
        />
      }
      <Grid container justifyContent="space-between" alignItems="center" sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}>
        <Grid item xs>
          <Typography variant="h6" fontWeight="bold">
            PozHavuzu
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Grid container spacing={1}>
            <>
              <Grid item >
                <IconButton onClick={() => console.log("deneme")} aria-label="wbsUncliced">
                  <ClearOutlined variant="contained" sx={{ color: "red" }} />
                </IconButton>
              </Grid>
            </>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default function P_PozHavuzu() {

  const navigate = useNavigate()
  const { data: pozlar } = useGetFirmaPozlar()
  const { selectedFirma } = useContext(StoreContext)

  useEffect(() => {
    !selectedFirma && navigate('/firmalar')
  }, [])

  // pozlar && console.log("pozlar", pozlar)

  return (
    <Box sx={{ mt: "0rem" }}>

      {/* BAŞLIK */}
      <PozHavuzuHeader />

      {/* ANA SAYFA */}
      <Box>

        deneme

      </Box>
    </Box>
  )

}
