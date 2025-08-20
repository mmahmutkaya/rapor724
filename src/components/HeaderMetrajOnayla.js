import React from 'react'

import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import { useApp } from "./useApp";
import { useGetMahaller } from '../hooks/useMongo';


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
import PersonIcon from '@mui/icons-material/Person';



export default function P_HeaderMetrajOnay({
  show, setShow,
  isChanged, cancel, save,
  isChanged_unReady, cancel_unReady, save_unReady, mode_unReady, setMode_unReady
}) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedPoz_metraj, selectedMahal_metraj } = useContext(StoreContext)

  const [showEminMisin, setShowEminMisin] = useState(false)

  const [showEminMisin_unReady, setShowEminMisin_unReady] = useState(false)


  return (
    <Paper >

      {showEminMisin &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin()}
          actionText2={"Onayla"}
          action2={() => {
            cancel()
            setShowEminMisin()
          }}
        />
      }


      {showEminMisin_unReady &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_unReady()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_unReady()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_unReady()
            setShowEminMisin_unReady()
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

              <IconButton
                sx={{ mx: 0, px: 0 }}
                onClick={() => {
                  navigate("/metrajonaylapozmahaller")
                }} aria-label="lbsUncliced">
                <ReplyIcon variant="contained" sx={{ color: "gray" }} />
              </IconButton>


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



              {!isChanged && !mode_unReady &&
                <>

                  <Grid item >
                    <IconButton onClick={() => setShow("ShowMetrajYapabilenler")} >
                      <PersonIcon variant="contained" />
                    </IconButton>
                  </Grid>

                  {/* <Grid item >
                    <IconButton onClick={() => console.log("mode_unReady", mode_unReady)}                    >
                      <TuneIcon variant="contained" sx={{ color: mode_unReady ? "red" : "lightpink" }} />
                    </IconButton>
                  </Grid> */}


                </>
              }


              {!isChanged && !isChanged_unReady &&
                < Grid item >
                  <IconButton onClick={() => setMode_unReady(x => !x)}                    >
                    <DeleteIcon variant="contained" sx={{ color: mode_unReady ? "red" : "lightpink" }} />
                  </IconButton>
                </Grid>
              }


              {isChanged_unReady &&
                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChanged_unReady) {
                        setShowEminMisin_unReady(true)
                      } else {
                        setMode_unReady()
                      }
                    }} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => { save_unReady() }} >
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>


                </>
              }



              {isChanged &&

                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChanged) {
                        setShowEminMisin(true)
                      } else {
                        setShow("Main")
                      }
                    }} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => {
                      save()
                    }} aria-label="lbsUncliced">
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
