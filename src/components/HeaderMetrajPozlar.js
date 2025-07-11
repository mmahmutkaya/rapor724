import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { StoreContext } from './store'


import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlignHorizontalLeftOutlinedIcon from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlinedIcon from '@mui/icons-material/AlignHorizontalRightOutlined';
import AlignHorizontalCenterOutlinedIcon from '@mui/icons-material/AlignHorizontalCenterOutlined';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';


export default function HeaderPozlar({ show, setShow }) {

  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  const navigate = useNavigate()

  return (
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
            Metraj
          </Typography>
        </Grid>


        {/* sağ kısım - (tuşlar)*/}
        <Grid item xs="auto">
          <Grid container spacing={1}>


            <Grid item >

              {!selectedPoz_metraj &&
                <>
                  {/* <IconButton onClick={() => setShow("ShowBaslik")} >
                    <Chip label="Hazırlanan" sx={{ m: "0rem", p: "0rem" }} />
                  </IconButton> */}

                  <IconButton onClick={() => setShow("ShowBaslik")} disabled={false}>
                    <VisibilityIcon variant="contained" />
                  </IconButton>
                </>
              }

              {selectedPoz_metraj &&
                <>
                  <IconButton onClick={() => setSelectedPoz_metraj()}>
                    <ClearOutlined variant="contained" sx={{ color: "red" }} />
                  </IconButton>

                  <IconButton onClick={() => navigate('/metrajpozmahaller')}>
                    <AdsClickIcon variant="contained" />
                  </IconButton>
                </>
              }


            </Grid>


          </Grid>
        </Grid>

      </Grid>

    </Paper>
  )
}
