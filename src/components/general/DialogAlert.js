
import React from 'react'
import { useState } from 'react';
import Grid from '@mui/material/Grid';


import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';


// export const DialogAlert = ({ dialogIcon, dialogMessage, setShowDialog, saveMetraj_ToDb }) => {
export const DialogAlert = ({ dialogIcon, dialogMessage, approveDialog, cancelDialog }) => {

  const DilogIcon = () => {
    switch (dialogIcon) {
      case "warning":
        return <WarningIcon variant="contained" color="error" pr={3} />
      case "succsess":
        return <CheckCircleIcon variant="contained" color="success" pr={3} />
      case "info":
        return <InfoIcon variant="contained" color="info" pr={3} />
      default:
        return <InfoIcon variant="contained" color="info" pr={3} />
    }
  }

  // const cancelDialog = () => {
  //   setShowDialog(false)
  // }

  // const approveDialog = () => {
  //   setShowDialog(false)
  //   saveMetraj_ToDb(false)
  // }

  

  return (
    <div>

      <Dialog
        PaperProps={{ sx: { position: "fixed", top: "10rem", p: "0.5rem", } }}
        open={true}
        onClose={() => cancelDialog()}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <DialogContent>

          <DilogIcon />

          <DialogContentText sx={{ mt: "0.5rem" }}>
            {dialogMessage}
          </DialogContentText>

          <DialogActions>
            <Button onClick={() => cancelDialog()}>İptal</Button>
            <Button onClick={() => approveDialog()}> Onayla </Button>
          </DialogActions>

        </DialogContent>

      </Dialog>

    </div >
  );

}


