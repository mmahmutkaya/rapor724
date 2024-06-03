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


export default function P_Metraj({ show, setShow, editMode_Metraj, setEditMode_Metraj, saveMahal }) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)

  const RealmApp = useApp();

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")



  const kimler = [
    {
      name: "suleyman",
    }
  ]



  const deneme = async () => {
    const result = await RealmApp?.currentUser.callFunction("getProjectNames");
    console.log("result", result)
  }

  
  // const deneme = async () => {
  //   const collection = RealmApp.currentUser.mongoClient("mongodb-atlas").db("rapor724_v2").collection("collection")
  //   await collection.updateOne(
  //     { userId: RealmApp.currentUser.id }, // Query for the user object of the logged in user
  //     { $set: { favoriteColor: "purple" } } // Set the logged in user's favorite color to purple
  //   )
  // }


  let header = "Metraj"

  return (
    <Paper >

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
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >



          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              {header}
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>


              <Grid item >
                <IconButton onClick={() => {
                  deneme()
                }} aria-label="lbsUncliced">
                  <VisibilityIcon variant="contained" sx={{
                    color: !selectedPoz ? "yellow" : "yellow",
                  }} />
                </IconButton>
              </Grid>





              {!editMode_Metraj &&
                <Grid item>
                  <IconButton onClick={() => setCustom(custom => ({ ...custom, pageMetraj_baslik1: !custom?.pageMetraj_baslik1 }))} aria-label="addLbs" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <VisibilityIcon variant="contained" />
                  </IconButton>
                </Grid>
              }


              {/* bu tuş ile pozların hangi mahallerden geldiğini görüyorduk fakat kafa karıştırır diye burda göstermeyelim oldu */}
              {/* {!editMode_Metraj &&
                <Grid item>
                  <IconButton onClick={() => setCustom(custom => ({ ...custom, pageMetraj_baslik2: !custom?.pageMetraj_baslik2 }))} aria-label="addLbs" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <VisibilityIcon variant="contained" />
                  </IconButton>
                </Grid>
              } */}


              {selectedPoz &&
                <Grid item >
                  <IconButton onClick={() => setSelectedPoz()} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{
                      color: !selectedPoz ? "lightgray" : "red",
                    }} />
                  </IconButton>
                </Grid>
              }


              {selectedPoz &&
                <Grid item>
                  <IconButton onClick={() => {
                    navigate("/metrajedit")
                  }}
                    aria-label="addLbs">
                    <EditIcon variant="contained" color={!selectedPoz ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }

              {/* {!selectedPoz &&
                <Grid item>
                  <IconButton onClick={() => setEditMode_Metraj(false)} aria-label="addLbs" disabled={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? true : false}>
                    <FileDownloadDoneIcon variant="contained" color={(isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              } */}


              {/* updateMetraj({ _pozId: onePoz._id } */}

            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper >
  )
}
