import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';


import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
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


export default function HeaderMetrajPozlar({ createVersiyon_metraj }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)

  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false)

  const navigate = useNavigate()


  const showVersiyon = () => {
    setShowEminMisin_versiyon(true)
  }


  return (
    <Paper >

      {showEminMisin_versiyon &&
        <DialogAlert
          dialogIcon={"none"}
          dialogMessage={"Mevcut metrajlar yeni versiyon olarak kaydedilsin mi?"}
          onCloseAction={() => setShowEminMisin_versiyon()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_versiyon()}
          actionText2={"Onayla"}
          action2={() => {
            createVersiyon_metraj()
            setShowEminMisin_versiyon()
          }}
        />
      }

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          color: "black",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: topBarHeight,
          // pt:"3rem",
          ml: { md: `${drawerWidth}px` }
        }}
      >

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
            <Grid container >




              <Grid item onClick={() => showVersiyon()} sx={{ cursor: "pointer" }}>
                {/* <EditIcon variant="contained" sx={{ color: editNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} /> */}
                <Avatar sx={{ height: "1.7rem", width: "1.7rem", fontSize: "0.8rem", fontWeight: 600, color: "black" }}>V</Avatar>
              </Grid>

              {/* <Grid item onClick={() => toggleOnay()} sx={{ cursor: "pointer" }}>
                <IconButton disabled={false} >
                  <FileDownloadDoneIcon variant="contained" sx={{ color: onayNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} />
                </IconButton>
              </Grid> */}

              {/* <Grid item >
                <IconButton onClick={() => setShow("ShowBaslik")} disabled={false}>
                  <VisibilityIcon variant="contained" />
                </IconButton>
              </Grid> */}



              {/* {selectedPoz &&
                <>
                  <Grid item >
                    <IconButton onClick={() => setSelectedPoz()}>
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => navigate('/metrajpozmahaller')}>
                      <AdsClickIcon variant="contained" />
                    </IconButton>
                  </Grid>

                </>
              } */}



            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}
