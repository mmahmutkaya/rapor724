
import React from 'react'
import { useState } from 'react';
import Grid from '@mui/material/Grid';



import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';


export const DialogVersiyonTip = ({ dialogBaslikText, aciklamaBaslikText, aprroveAction, rejectAction }) => {

  const [fieldText, setFieldText] = useState("");

  return (
    <div>

      <Dialog
        PaperProps={{ sx: { position: "fixed", top: "10rem", p: "0.5rem", width: "80%" } }}
        open={true}
        onClose={() => rejectAction()}
      >
        {/* <DialogTitle>Subscribe</DialogTitle> */}

        <DialogContent>

          <DialogContentText sx={{ mt: "0.5rem" }}>
            {dialogBaslikText}
          </DialogContentText>

          <Box sx={{ mt: "0.5rem" }}>
            <TextField
              variant="standard"
              margin="normal"
              // id="isPaketName"
              // name="isPaketName"
              onChange={(e) => setFieldText(e.target.value)}
              value={fieldText}
              // error={isPaketNameError ? true : false}
              // helperText={isPaketNameError ? isPaketNameError : ""}
              // margin="dense"
              autoFocus={true}
              label="Versiyon Hakkında Bilgilendirme"
              type="text"
              fullWidth
            />
          </Box>

          <DialogActions>
            {<Button onClick={() => rejectAction()}> İptal </Button>}
            {<Button onClick={() => aprroveAction({ fieldText })}> Onay </Button>}
          </DialogActions>

        </DialogContent>

      </Dialog>

    </div >
  );

}


