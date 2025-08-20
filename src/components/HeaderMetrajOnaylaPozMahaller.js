import React from 'react'

import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

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
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';


export default function HeaderMetrajOnaylaPozMahaller({
  setShow, anySelectable,
  selectMode, setSelectMode, isChange_select, setIsChange_select, save_select, cancel_select
}) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)

  const [showEminMisin_select, setShowEminMisin_select] = useState(false)


  return (
    <Paper >

      {showEminMisin_select &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_select()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_select()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_select()
            setShowEminMisin_select()
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

              <IconButton sx={{ m: 0, p: 0 }}
                onClick={() => {
                  navigate("/metrajonaylapozlar")
                  setSelectedPoz_metraj()
                }}
                aria-label="wbsUncliced">
                <ReplyIcon variant="contained"
                  sx={{ color: "gray" }} />
              </IconButton>

              <Box>
                {selectedPoz_metraj?.pozName}
              </Box>
              <Box sx={{ color: "#8B0000", fontWeight: "600" }}>
                {" > "}
              </Box>
              <Box>
                {"(Poza Açık Tüm Mahaller)"}
              </Box>
            </Box>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container>


              {/* {!selectMode &&
                <Grid item >
                  <IconButton
                    onClick={() => {
                      navigate("/metrajonaylapozlar")
                      setSelectedPoz_metraj()
                    }}
                    aria-label="wbsUncliced">
                    <ReplyIcon variant="contained"
                      sx={{ color: "gray" }} />
                  </IconButton>
                </Grid>
              } */}

              {!selectMode &&
                <Grid item sx={{ cursor: "pointer" }}>
                  <IconButton onClick={() => setSelectMode(x => !x)} disabled={!anySelectable}>
                    <GroupWorkIcon variant="contained" sx={{ color: anySelectable ? "gray" : "lightgray" }} />
                  </IconButton>
                </Grid>
              }

              {!selectMode &&
                <Grid item >
                  <IconButton onClick={() => setShow("ShowMetrajYapabilenler")} disabled={false}>
                    <PersonIcon variant="contained" />
                  </IconButton>
                </Grid>
              }


              {selectMode &&

                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChange_select) {
                        setShowEminMisin_select(true)
                      } else {
                        cancel_select()
                      }
                    }} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton
                      onClick={() => {
                        save_select()
                      }}
                      aria-label="lbsUncliced"
                      disabled={!isChange_select}
                    >
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>

                </>
              }


            </Grid>
          </Grid>

        </Grid>

      </AppBar>

    </Paper>
  )
}
