import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';
import ClearOutlined from '@mui/icons-material/ClearOutlined';


export default function HeaderMahalMetraj({ setShow, editMode_MahalListesi, setEditMode_MahalListesi, saveMahal, isChanged, handleCancel }) {

  const { RealmApp, drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { setMahaller } = useContext(StoreContext)

  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)


  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")



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
              {"Metraj"}
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>




              {/* {!editMode_MahalListesi &&
                <Grid item>
                  <IconButton onClick={() => saveMahal()} aria-label="addLbs" disabled={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? true : false}>
                    <EditIcon variant="contained" color={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              } */}

              {!editMode_MahalListesi &&
                <Grid item>
                  <IconButton onClick={() => setEditMode_MahalListesi(true)} aria-label="addLbs" disabled={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? true : false}>
                    <EditIcon variant="contained" color={(selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) ? " lightgray" : "success"} />
                  </IconButton>
                </Grid>
              }


              {editMode_MahalListesi &&
                <Grid item>
                  <IconButton
                    onClick={() => handleCancel()}
                  >
                    <ClearOutlined variant="contained" color={"warning"} />
                  </IconButton>
                </Grid>
              }

              {editMode_MahalListesi &&
                <Grid item>
                  <IconButton
                    onClick={() => saveMahal()}
                    disabled={!isChanged}
                  >
                    <FileDownloadDoneIcon variant="contained" color={isChanged ? "success" : "lightgray"} />
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
