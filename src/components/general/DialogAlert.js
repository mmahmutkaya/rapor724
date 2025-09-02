
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
export const DialogAlert = ({ dialogIcon, dialogMessage, onCloseAction, actionText1, action1, actionText2, action2, detailText }) => {

  const DilogIcon = () => {
    switch (dialogIcon) {
      case "warning":
        return <WarningIcon variant="contained" color="error" pr={3} />
      case "succsess":
        return <CheckCircleIcon variant="contained" color="success" pr={3} />
      case "info":
        return <InfoIcon variant="contained" color="info" pr={3} />
      case "none":
        return
      default:
        return <InfoIcon variant="contained" color="info" pr={3} />
    }
  }

  const [showDetail, setShowDetail] = useState(false)

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
        PaperProps={{ sx: { position: "fixed", top: "10rem", p: "0.5rem", width: "80%" } }}
        open={true}
        onClose={() => onCloseAction()}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <DialogContent>

          <DilogIcon />

          <DialogContentText sx={{ mt: "0.5rem" }}>
            {dialogMessage}
          </DialogContentText>


          {!detailText &&
            <DialogActions>
              {actionText1 && <Button onClick={() => action1()}>{actionText1}</Button>}
              {actionText2 && <Button onClick={() => action2()}> {actionText2} </Button>}
            </DialogActions>
          }

          {detailText &&
            <DialogActions >
              <Button onClick={() => setShowDetail(value => !value)}>{!showDetail ? "Ayrıntıları Göster" : "Ayrıntıları Gizle"}</Button>
            </DialogActions>
          }

          {showDetail &&
            <DialogContentText >
              {detailText}
            </DialogContentText>
          }

        </DialogContent>

      </Dialog>

    </div >
  );

}


