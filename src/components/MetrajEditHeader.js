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



export default function P_MetrajEditHeader({
  show, setShow,
  save_hazirlananMetraj_toDb,
  setHazirlananMetraj_state,
  setOnaylananMetraj_state,
  isChanged, setIsChanged,
}) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)
  const { detailMode, setDetailMode } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)


  const { data: mahaller } = useGetMahaller()


  const cancelDialog = () => {
    setShowDialog(false)
  }


  const approveDialog = () => {
    setShowDialog(false)
    setHazirlananMetraj_state()
    setIsChanged()
    navigate("/metrajpozmahaller")
  }



  return (
    <Paper >

      {showDialog &&
        <DialogAlert 
        dialogIcon={"warning"} 
        dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"} 
        onCloseAction={cancelDialog} 
        actionText1={"İptal"}
        action1={cancelDialog} 
        actionText2={"Onayla"}
        action2={approveDialog} 
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
              {selectedPoz?.name} {" > "}

              <Typography variant="h6" fontWeight="bold" component={"span"} sx={{ color: "darkred" }}>{mahaller?.find(item => item._id.toString() == selectedNode?._mahalId.toString())?.name}</Typography>

            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>



              {show == "EditMetraj" &&
                <Grid item >
                  <IconButton onClick={() => {
                    if (isChanged) {
                      setShowDialog(true)
                    } else {
                      navigate("/metrajpozmahaller")
                    }
                  }} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{ color: "red" }} />
                  </IconButton>
                </Grid>
              }



              {show == "EditMetraj" &&
                <Grid item >
                  <IconButton onClick={() => {
                    save_hazirlananMetraj_toDb()
                  }} aria-label="lbsUncliced">
                    <SaveIcon variant="contained" />
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
