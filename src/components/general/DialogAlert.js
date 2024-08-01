
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


export const DialogAlert = ({ dialogIcon, dialogMessage, setDialogAgree, setShowDialog }) => {

  const [open, setOpen] = useState(false);

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

  const onClose = () => {
    setShowDialog(false)
  }

  return (
    <div>

      <Dialog
        PaperProps={{ sx: { position: "fixed", top: "10rem", p:"0.5rem",  } }}
        open={true}
        onClose={onClose}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <DialogContent>

          <DilogIcon />

          <DialogContentText sx={{mt:"0.5rem"}}>
            {dialogMessage}
          </DialogContentText>

          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>İptal</Button>
            <Button onClick={() => setDialogAgree(true)}> Onayla </Button>
          </DialogActions>

        </DialogContent>

      </Dialog>

    </div >
  );

}


