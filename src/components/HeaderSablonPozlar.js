import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import { useApp } from "./useApp";
import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';
import ClearOutlined from '@mui/icons-material/ClearOutlined';


export default function HeaderMahalListesi({ editMode, setEditMode, isChanged, cancelChange, saveChange }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const [showEminMisin, setShowEminMisin] = useState(false)


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
            cancelChange()
            setShowEminMisin()
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
              {"Başlık"}
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container>


              {!isChanged &&
                <Grid item>
                  <IconButton onClick={() => setEditMode(editMode => !editMode)} disabled={false}>
                    <EditIcon variant="contained" sx={{ color: "gray" }} />
                  </IconButton>
                </Grid>
              }


              {isChanged &&
                <>

                  <Grid item>
                    <IconButton
                      onClick={() => setShowEminMisin(true)}
                      disabled={!isChanged}
                    >
                      <ClearOutlined variant="contained" sx={{ color: isChanged ? "red" : "lightgray" }} />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton
                      onClick={() => saveChange()}
                      disabled={!isChanged}
                    >
                      <FileDownloadDoneIcon variant="contained" sx={{ color: isChanged ? "green" : "lightgray" }} />
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
