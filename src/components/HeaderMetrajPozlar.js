import React from 'react'

import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';


export default function HeaderMetrajPozlar() {

  return (
    <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}>

      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: "0.5rem 1rem", minHeight: "3.5rem", maxHeight: "5rem" }}
      >

        {/* sol kısım (başlık) */}
        <Grid item xs>
          <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
            Metraj
          </Typography>
        </Grid>

        {/* sağ kısım - (tuşlar)*/}
        <Grid item xs="auto">
          <Grid container>
          </Grid>
        </Grid>

      </Grid>

    </AppBar>
  )
}
