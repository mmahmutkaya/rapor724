
import React from 'react'
import Grid from '@mui/material/Grid';



import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';


export const DialogWindow = ({ dialogCase, showDialog, setShowDialog, afterDone }) => {

  let hataMesaj
  if (typeof showDialog !== "string") {
    hataMesaj = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
  } else {
    hataMesaj = showDialog
  }


  const DilogIcon = () => {
    switch (dialogCase) {
      case "error":
        return <WarningIcon variant="contained" color="error" pr={3} />
      case "succsess":
        return <CheckCircleIcon variant="contained" color="success" pr={3} />
      default:
        <InfoIcon variant="contained" color="info" pr={3} />
    }
  }

  const onClose = () => {
    setShowDialog(false)
    if(afterDone) afterDone()
  }


  return (
    <div>

      <Dialog
        PaperProps={{ sx: { position: "fixed", top: "10rem", margin: { xs: '2rem' } } }}
        open={true}
        onClose={onClose}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <DialogContent>

          <Grid container spacing={1}>

            <Grid item>
              <DilogIcon />
            </Grid>

            <Grid item>
              <DialogContentText>
                {hataMesaj}
              </DialogContentText>
            </Grid>

          </Grid>

        </DialogContent>

      </Dialog>

    </div >
  );

}


