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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
import Tooltip from '@mui/material/Tooltip';
import ShowMetrajYapabilenler from './ShowMetrajYapabilenler';



export default function P_HeaderMetrajCetvel({
  show, setShow,
  isChanged, cancel, save,
  copySelectedRow,
  hasSelectedCopySatirlar,
  mode_sil, setMode_sil,
  isChanged_sil, cancel_sil, save_sil
}) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { detailMode, setDetailMode } = useContext(StoreContext)

  const { selectedPoz, selectedMahal_metraj } = useContext(StoreContext)

  const [showEminMisin, setShowEminMisin] = useState(false)

  const [showEminMisin_sil, setShowEminMisin_sil] = useState(false)


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



      {showEminMisin_sil &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_sil()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_sil()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_sil()
            setShowEminMisin_sil()
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

              <IconButton sx={{ m: 0, p: 0 }}
                onClick={() => {
                  navigate("/metrajpozmahaller")
                }} aria-label="lbsUncliced">
                <ReplyIcon variant="contained" sx={{ color: "gray" }} />
              </IconButton>

              <Box>
                {selectedPoz?.pozName}
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


              {/* {show !== "EditMetraj" && !mode_sil &&
                <Grid item >
                  <IconButton onClick={() => {
                    setShow("EditMetraj")
                    setMode_sil()
                  }} aria-label="lbsUncliced">
                    <EditIcon variant="contained" />
                  </IconButton>
                </Grid>
              } */}

              {!isChanged_sil && show !== "EditMetraj" &&
                <Grid item >
                  <IconButton onClick={() => setMode_sil(x => !x)} >
                    <VisibilityIcon variant="contained" sx={{ color: mode_sil ? "gray" : "lightgray" }} />
                  </IconButton>
                </Grid>
              }

              {/* {!isChanged_sil && show !== "EditMetraj" && !mode_sil &&
                <Grid item >
                  <IconButton onClick={() => setMode_sil(x => !x)} >
                    <DeleteIcon variant="contained" sx={{ color: "rgba(209, 17, 17, 0.31)" }} />
                  </IconButton>
                </Grid>
              } */}



              {show == "EditMetraj" &&

                <>

                  <Grid item >
                    <IconButton
                      disabled={!hasSelectedCopySatirlar}
                      onClick={() => {
                        copySelectedRow()
                      }} aria-label="lbsUncliced">
                      <AddCircleOutlineIcon variant="contained" sx={{ color: "rgba(70, 140, 55, 0.6)" }} />
                    </IconButton>
                  </Grid>

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
                    <IconButton onClick={() => save()} disabled={!isChanged}>
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>

                </>
              }



              {isChanged_sil &&

                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChanged_sil) {
                        setShowEminMisin_sil(true)
                      } else {
                        setShow("Main")
                      }
                    }} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => save_sil()} disabled={!isChanged_sil}>
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
