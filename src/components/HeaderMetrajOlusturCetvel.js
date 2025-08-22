import React from 'react'

import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlignHorizontalLeftOutlinedIcon from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlinedIcon from '@mui/icons-material/AlignHorizontalRightOutlined';
import AlignHorizontalCenterOutlinedIcon from '@mui/icons-material/AlignHorizontalCenterOutlined';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';
import TuneIcon from '@mui/icons-material/Tune';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ForwardIcon from '@mui/icons-material/Forward';
import SaveIcon from '@mui/icons-material/Save';
import { useGetMahaller } from '../hooks/useMongo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Circle } from '@mui/icons-material';


export default function P_HeaderMetrajOlusturCetvel({
  mode_edit, setMode_edit, mode_ready, setMode_ready,
  isChanged_edit, cancel_edit, save_edit,
  isChanged_ready, cancel_ready, save_ready
}) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedPoz_metraj, selectedMahal_metraj } = useContext(StoreContext)

  const [showEminMisin_edit, setShowEminMisin_edit] = useState(false)
  const [showEminMisin_ready, setShowEminMisin_ready] = useState(false)


  return (
    <Paper >

      {showEminMisin_edit &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_edit()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_edit()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_edit()
            setShowEminMisin_edit()
          }}
        />
      }


      {showEminMisin_ready &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_ready()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_ready()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_ready()
            setShowEminMisin_ready()
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
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>

              <Box >
                <IconButton sx={{ m: 0, p: 0 }}
                  onClick={() => navigate("/metrajolusturpozmahaller")}>
                  <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>
              </Box>

              <Box>
                {selectedPoz_metraj?.pozName}
              </Box>

              <Box sx={{ color: "#8B0000", fontWeight: "600" }}>
                {" > "}
              </Box>

              <Box>
                {selectedMahal_metraj?.mahalName}
              </Box>

            </Box>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container>


              {!isChanged_edit && !isChanged_ready && !mode_ready &&
                <Grid item onClick={() => setMode_edit(x => !x)} sx={{ cursor: "pointer" }}>
                  <IconButton disabled={false} >
                    <EditIcon variant="contained" sx={{ color: mode_edit ? "black" : "gray" }} />
                  </IconButton>
                </Grid>
              }

              {!isChanged_edit && !isChanged_ready && !mode_edit &&
                <Grid item onClick={() => setMode_ready(x => !x)} sx={{ cursor: "pointer" }}>
                  <IconButton disabled={false} >
                    <CheckCircleIcon variant="contained" sx={{ color: mode_ready ? "black" : "gray" }} />
                  </IconButton>
                </Grid>
              }


              {isChanged_edit &&

                <>

                  <Grid item >
                    <IconButton onClick={() => setShowEminMisin_edit(true)}>
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => save_edit()} disabled={!isChanged_edit} >
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>

                </>
              }


              {isChanged_ready &&

                <>

                  <Grid item >
                    <IconButton onClick={() => setShowEminMisin_ready(true)}>
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => save_ready()} disabled={!isChanged_ready} >
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>

                </>
              }

            </Grid>

          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}
