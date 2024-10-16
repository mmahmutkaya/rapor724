import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';
import { useNavigate } from "react-router-dom";

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
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ForwardIcon from '@mui/icons-material/Forward';
import ReplyIcon from '@mui/icons-material/Reply';



export default function P_MetrajHeader() {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { pageMetraj_show, pageMetraj_setShow } = useContext(StoreContext)
  

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { subHeaderHeight } = useContext(StoreContext)
  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")



  const kimler = [
    {
      name: "suleyman",
    }
  ]


  return (
    <Paper>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
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
          sx={{ padding: "0.5rem 1rem", height: subHeaderHeight, maxHeight: "5rem" }}
        >


          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              {selectedPoz ? selectedPoz.name : "Metraj"}
            </Typography>
          </Grid>



          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>


              {pageMetraj_show == "Pozlar" && !selectedPoz &&
                <Grid item>
                  <IconButton onClick={() => setCustom(custom => ({ ...custom, pageMetraj_baslik1: !custom?.pageMetraj_baslik1 }))} aria-label="addLbs" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <VisibilityIcon variant="contained" sx={{ color: "black" }} />
                  </IconButton>
                </Grid>
              }

              {pageMetraj_show == "Pozlar" && selectedPoz &&
                <Grid item >
                  <IconButton onClick={() => {
                    setSelectedPoz()
                  }

                  } aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{
                      color: !selectedPoz ? "lightgray" : "red",
                    }} />
                  </IconButton>
                </Grid>
              }


              {pageMetraj_show == "Pozlar" && selectedPoz &&
                <Grid item>
                  <IconButton onClick={() => {
                    pageMetraj_setShow("PozMahalleri")
                    setSelectedNode()
                  }}
                    aria-label="addLbs">
                    <ForwardIcon variant="contained" color={!selectedPoz ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }




              {pageMetraj_show == "PozMahalleri" && !selectedNode &&
                <Grid item >
                  <IconButton onClick={() => {
                    pageMetraj_setShow("Pozlar")
                    setSelectedNode()
                  }} aria-label="lbsUncliced">
                    <ReplyIcon variant="contained" sx={{ color: !selectedPoz ? "lightgray" : "red" }} />
                  </IconButton>
                </Grid>
              }

              {pageMetraj_show == "PozMahalleri" && selectedNode &&
                <Grid item>
                  <IconButton onClick={() => {
                    setSelectedNode()
                  }}
                    aria-label="addLbs">
                    <ClearOutlined variant="contained" sx={{
                      color: !selectedPoz ? "lightgray" : "red",
                    }} />
                  </IconButton>
                </Grid>
              }

              {pageMetraj_show == "PozMahalleri" && selectedNode &&
                <Grid item>
                  <IconButton onClick={() => {
                    navigate("/metrajedit")
                    // setSelectedNode()
                  }}
                    aria-label="addLbs">
                    <ForwardIcon variant="contained" color={!selectedPoz ? " lightgray" : "success"} />
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
