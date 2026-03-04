import React from 'react'
import { useContext } from 'react';
import { StoreContext } from './store'
import { useNavigate } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ReplyIcon from '@mui/icons-material/Reply';


export default function HeaderMetrajOlusturPozMahaller() {

  const navigate = useNavigate()
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)

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
          <Box sx={{ display: "flex", alignItems: "center", columnGap: "0.5rem" }}>

            <IconButton
              sx={{ width: 40, height: 40 }}
              onClick={() => {
                navigate("/metrajolusturpozlar")
                setSelectedPoz()
              }}
            >
              <ReplyIcon sx={{ color: "gray", fontSize: 24 }} />
            </IconButton>

            <Box sx={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap" }}>
              {selectedPoz?.pozName}
            </Box>
            <Box sx={{ color: "#8B0000", fontWeight: 600 }}>{">"}</Box>
            <Box sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {"Tüm Açık Mahaller"}
            </Box>

          </Box>
        </Grid>

        {/* sağ kısım - (tuşlar) */}
        <Grid item xs="auto">
          <Grid container>
          </Grid>
        </Grid>

      </Grid>

    </AppBar>
  )
}
