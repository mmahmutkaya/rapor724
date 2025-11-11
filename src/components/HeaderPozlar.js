import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { DialogAlert } from './general/DialogAlert';

import { StoreContext } from './store'


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
import Avatar from '@mui/material/Avatar';
import CurrencyLiraIcon from '@mui/icons-material/CurrencyLira';
import SaveIcon from '@mui/icons-material/Save';

export default function HeaderPozlar({
  show, setShow, anyBaslikShow,
  isChanged_para, setIsChangedPara, paraEdit, setParaEdit, save_para, cancel_para
}) {

  const { selectedProje } = useContext(StoreContext)
  const [showEminMisin_para, setShowEminMisin_para] = useState(false)

  const navigate = useNavigate()

  return (
    <Paper >

      {showEminMisin_para &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_para()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_para()}
          actionText2={"Onayla"}
          action2={() => {
            cancel_para()
            setShowEminMisin_para()
          }}
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
            Pozlar
          </Typography>
        </Grid>




        {/* sağ kısım - (tuşlar)*/}
        <Grid item xs="auto">
          <Grid container spacing={1} sx={{ alignItems: "center" }}>


            {!paraEdit &&
              <>
                {/* < Grid item >
                  <IconButton onClick={() => setShow("ShowPozParaBirimleri")} aria-label="wbsUncliced">
                    <CurrencyLiraIcon variant="contained" />
                  </IconButton>
                </Grid> */}

                <Grid item >
                  <IconButton onClick={() => setShow("ShowBaslik")} aria-label="wbsUncliced" disabled={!anyBaslikShow}>
                    <VisibilityIcon variant="contained" />
                  </IconButton>
                </Grid>

                <Grid item >
                  <IconButton onClick={() => setShow("PozCreate")} aria-label="wbsUncliced" disabled={!selectedProje?.wbs?.find(x => x.openForPoz === true)}>
                    <AddCircleOutlineIcon variant="contained" />
                  </IconButton>
                </Grid>
              </>
            }

            {paraEdit &&

              <>

                <Grid item >
                  <IconButton onClick={() => {
                    if (isChanged_para) {
                      setShowEminMisin_para(true)
                    } else {
                      setParaEdit()
                    }
                  }} aria-label="lbsUncliced">
                    <ClearOutlined variant="contained" sx={{ color: "red" }} />
                  </IconButton>
                </Grid>

                <Grid item >
                  <IconButton onClick={() => save_para()} disabled={!isChanged_para}>
                    <SaveIcon variant="contained" />
                  </IconButton>
                </Grid>

              </>
            }

          </Grid>
        </Grid>

      </Grid>

    </Paper >
  )
}
