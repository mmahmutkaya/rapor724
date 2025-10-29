import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';
import { useNavigate } from "react-router-dom";

import AppBar from '@mui/material/AppBar';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EditIcon from '@mui/icons-material/Edit';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import ReplyIcon from '@mui/icons-material/Reply';


export default function HeaderMahalListesi({ isChanged, cancelChange, saveChange }) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedPoz } = useContext(StoreContext)

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
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>

              <IconButton
                sx={{ mx: 0, px: 0 }}
                onClick={() => navigate('/mahallistesipozlar')} disabled={false}>
                <ReplyIcon variant="contained" sx={{ color: "gray" }} />
              </IconButton>

              <Box>
                {selectedPoz?.pozName}
              </Box>
              {/* <Box sx={{ color: "#8B0000", fontWeight: "600" }}>
                {" > "}
              </Box> */}
              <Box>
                {/* {"Tüm Mahaller"} */}
              </Box>
            </Box>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container>


              {/* {!isChanged &&
                <>

                  <Grid item>
                    <IconButton onClick={() => navigate('/mahallistesipozlar')} disabled={false}>
                      <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                    </IconButton>
                  </Grid>

                </>
              } */}


              {isChanged &&
                <>

                  <Grid item>
                    <IconButton
                      onClick={() => setShowEminMisin(true)}
                      disabled={!isChanged}
                    >
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton
                      onClick={() => saveChange()}
                      disabled={!isChanged}
                    >
                      <FileDownloadDoneIcon variant="contained" sx={{ color: "green" }} />
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
