import React from 'react'

import { useState, useContext, useEffect } from 'react';
import { StoreContext } from './store'
import { DialogWindow } from './general/DialogWindow';

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
import { DialogAlert } from './general/DialogAlert';


export default function PozHeader({ setShow, editPoz, setEditPoz, savePoz }) {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()
 
  return (
    <Paper >

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }


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
              PozHavuzu
            </Typography>
          </Grid>




          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>


              <>

                {/* seçimleri temizle */}

                <Grid item >
                  <IconButton onClick={() => console.log("deneme")} aria-label="wbsUncliced">
                    <ClearOutlined variant="contained"
                      sx={{ color: "red" }} />
                  </IconButton>
                </Grid>


              </>


            </Grid>
          </Grid>

        </Grid>

    </Paper>
  )
}
