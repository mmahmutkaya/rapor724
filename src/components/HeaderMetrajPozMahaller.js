import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

import { useApp } from "./useApp";
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

//icons
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
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


export default function HeaderMetrajPozMahaller() {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  // const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  // const { onayNodeMetraj, setOnayNodeMetraj } = useContext(StoreContext)

  let editNodeMetraj = false
  let onayNodeMetraj = false

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { setPozlar } = useContext(StoreContext)

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)

  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  const { selectedPoz_metrajBaslik, setSelectedPoz_metrajBaslik } = useContext(StoreContext)

  const [willBeUpdate_mahalBaslik, setWillBeUpdate_mahalBaslik] = useState(false)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")



  // const toggleEdit = () => {
  //   setEditNodeMetraj(editNodeMetraj => !editNodeMetraj)
  //   setOnayNodeMetraj()
  // }


  // const toggleOnay = () => {
  //   setOnayNodeMetraj(onayNodeMetraj => !onayNodeMetraj)
  //   setEditNodeMetraj()
  // }



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
          {/* <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              {selectedPoz_metraj?.pozName}
            </Typography>
          </Grid> */}

          <Grid item xs>
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>


              <IconButton sx={{ m: 0, py: "0.3rem" }}
                onClick={() => {
                  navigate("/metrajpozlar")
                  setSelectedPoz_metraj()
                }}
                aria-label="wbsUncliced">
                <ReplyIcon variant="contained"
                  // sx={{ color: "lightgray", "&:hover": { color: "gray" } }} />
                  sx={{ color: "gray" }} />
              </IconButton>

              <Box>
                {selectedPoz_metraj?.pozName}
              </Box>
              <Box sx={{ color: "#8B0000", fontWeight: "600" }}>
                {" > "}
              </Box>
              <Box>
                {"Mahal Listesinde Bu Poz İçin Açılmış Tüm Mahaller"}
              </Box>


            </Box>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container>


              {/* <Grid item onClick={() => toggleEdit()} sx={{ cursor: "pointer" }}>
                <IconButton disabled={false} >
                  <EditIcon variant="contained" sx={{ color: editNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} />
                </IconButton>
              </Grid> */}

              {/* <Grid item onClick={() => toggleOnay()} sx={{ cursor: "pointer" }}>
                <IconButton disabled={false} >
                  <FileDownloadDoneIcon variant="contained" sx={{ color: onayNodeMetraj ? "gray" : "lightgray", "&:hover": { color: "gray" } }} />
                </IconButton>
              </Grid> */}

              {/* <Grid item onClick={() => console.log("selectedPoz_metraj", selectedPoz_metraj)} sx={{ cursor: "pointer" }}>
                <IconButton aria-label="addPoz">
                  <VisibilityIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>
              </Grid> */}


            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper>
  )
}
