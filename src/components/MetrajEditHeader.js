import React from 'react'

import { useNavigate } from "react-router-dom";

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
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




export default function P_MetrajEditHeader({ show, setShow, saveMetraj_ToDb, loadMetraj_ToState, setUserMetraj_state, isChanged, setIsChanged, handleMetrajOnay }) {


  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)

  let header = "Metraj"



  const cancelDialog = () => {
    setShowDialog(false)
  }

  const approveDialog = () => {
    setShowDialog(false)
    setUserMetraj_state()
    setIsChanged()
    setShow("PozMahalMetrajlari")
  }



  return (
    <Paper >

      {showDialog &&
        <DialogAlert dialogIcon={"warning"} dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"} cancelDialog={cancelDialog} approveDialog={approveDialog} />
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
              {header} {" > "}

              <Typography variant="h6" fontWeight="bold" component={"span"} sx={{ color: "darkred" }}>{selectedPoz?.name}</Typography>

            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>




              {show == "PozMahalleri" && !selectedNode &&
                <Grid item >
                  <IconButton onClick={() => {
                    navigate("/metraj")
                    setSelectedNode()
                  }} aria-label="lbsUncliced">
                    <ReplyIcon variant="contained" sx={{
                      color: !selectedPoz ? "lightgray" : "red"
                    }} />
                  </IconButton>
                </Grid>
              }


              {show == "PozMahalleri" && selectedNode &&
                <Grid item >
                  <IconButton onClick={() => {
                    setSelectedNode()
                  }} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{
                      color: !selectedNode ? "lightgray" : "red",
                    }} />
                  </IconButton>
                </Grid>
              }


              {show == "PozMahalleri" && selectedNode &&
                <Grid item >
                  <IconButton onClick={() => {
                    setShow("PozMahalMetrajlari")
                  }} aria-label="lbsUncliced">
                    <ForwardIcon variant="contained" sx={{
                      color: "green",
                    }} />
                  </IconButton>
                </Grid>
              }









              {show == "PozMahalMetrajlari" &&
                <Grid item >
                  <IconButton onClick={() => {
                    setShow("PozMahalleri")
                  }} aria-label="lbsUncliced">
                    <ReplyIcon variant="contained" sx={{
                      color: !selectedPoz ? "lightgray" : "red",
                    }} />
                  </IconButton>
                </Grid>
              }


              {show == "PozMahalMetrajlari" &&
                <Grid item >
                  <IconButton onClick={() => {
                    loadMetraj_ToState()
                    setShow("EditMetraj")
                  }} aria-label="lbsUncliced">
                    <EditIcon variant="contained" />
                  </IconButton>
                </Grid>
              }


              {show == "PozMahalMetrajlari" &&
                <Grid item >
                  <IconButton
                    onClick={() => {
                      setShow("OnayMetraj")
                    }}
                    aria-label="lbsUncliced">
                    <TaskAltIcon variant="contained" />
                  </IconButton>
                </Grid>
              }



              {show == "EditMetraj" &&
                <Grid item >
                  <IconButton onClick={() => {
                    if (isChanged) {
                      setShowDialog(true)
                    } else {
                      setShow("PozMahalMetrajlari")
                    }
                  }} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{ color: "red" }} />
                  </IconButton>
                </Grid>
              }



              {show == "EditMetraj" &&
                <Grid item >
                  <IconButton onClick={() => {
                    saveMetraj_ToDb()
                  }} aria-label="lbsUncliced">
                    <FileDownloadDoneIcon variant="contained" />
                  </IconButton>
                </Grid>
              }



              {show == "MetrajOnay" &&
                <Grid item >
                  <IconButton onClick={() => {
                    if (isChanged) {
                      setShowDialog(true)
                    } else {
                      setShow("PozMahalMetrajlari")
                    }
                  }} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{ color: "red" }} />
                  </IconButton>
                </Grid>
              }



              {show == "MetrajOnay" &&
                <Grid item >
                  <IconButton onClick={() => {
                    saveMetraj_ToDb()
                  }} aria-label="lbsUncliced">
                    <FileDownloadDoneIcon variant="contained" />
                  </IconButton>
                </Grid>
              }




            </Grid>

          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}
