import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export default function DialogForm({ setShow }) {

  const handleSubmit = (e) => {
  }

  return (
    <div>

      <Dialog open={open} onClose={() => setShow("ProjectMain")}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Proje ismini giriniz.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow("ProjectMain")}>Cancel</Button>
          <Button onClick={handleSubmit()}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}