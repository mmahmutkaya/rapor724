import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { DialogAlert } from './general/DialogAlert';

import { StoreContext } from './store'


import AppBar from '@mui/material/AppBar';
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
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';


export default function HeaderMetrajOnaylaPozlar({ setShow, createVersiyon_metraj }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)

  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false)


  const showVersiyon = () => {
    setShowEminMisin_versiyon(true)
  }


  // const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  // const { onayNodeMetraj, setOnayNodeMetraj } = useContext(StoreContext)
  let editNodeMetraj = false
  let onayNodeMetraj = true

  const navigate = useNavigate()


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
              Metraj Onayla
            </Typography>
          </Grid>


          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container >



              <>

                {/* <Grid item onClick={() => toggleEdit()} sx={{ cursor: "pointer" }}>
                    <IconButton disabled={false} >
                      <EditIcon variant="contained" sx={{ color: editNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} />
                    </IconButton>
                  </Grid> */}

                {/* <Grid item sx={{ cursor: "pointer" }}>
                  <IconButton disabled={false} >
                    <FileDownloadDoneIcon variant="contained" sx={{ color: onayNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} />
                  </IconButton>
                </Grid> */}

                <Grid item >
                  <IconButton onClick={() => setShow("ShowMetrajYapabilenler")} disabled={false}>
                    <PersonIcon variant="contained" />
                  </IconButton>
                </Grid>

                <Grid item >
                  <IconButton onClick={() => showVersiyon()} disabled={false}>
                    <Avatar sx={{ height: "1.5rem", width: "1.5rem", fontSize: "0.7rem", fontWeight: 600, color: "black" }}>V</Avatar>
                  </IconButton>
                </Grid>



              </>


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
