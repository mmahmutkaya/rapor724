import React from 'react'
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query'
import { useState, useContext } from 'react';
import { StoreContext } from './store'
import { DialogAlert } from './general/DialogAlert';

import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


export default function P_HeaderMetrajOlusturCetvel({
  mode_edit, setMode_edit, mode_ready, setMode_ready,
  isChanged_edit, cancel_edit, save_edit,
  isChanged_ready, cancel_ready, save_ready
}) {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()
  const { appUser, setAppUser } = useContext(StoreContext)
  const { selectedPoz, selectedMahal_metraj, selectedNode } = useContext(StoreContext)
  const [showEminMisin_edit, setShowEminMisin_edit] = useState(false)
  const [showEminMisin_ready, setShowEminMisin_ready] = useState(false)

  const headerIconButton_sx = { width: 40, height: 40 }
  const headerIcon_sx = { fontSize: 24 }

  const satirEkle = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/dugumler/addmetrajsatiri`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dugumId: selectedNode._id })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.ok) {
        queryClient.invalidateQueries(['dataHazirlananMetraj'])
      } else {
        throw new Error("Kayıt işleminde hata oluştu, sayfayı yenileyiniz, sorun devam ederse, Rapor7/24 ile iletişime geçiniz.")
      }

    } catch (err) {
      console.log(err)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['hazirlananMetraj', selectedNode?._id.toString()])
        }
      })
    }
  }

  return (
    <>
      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {showEminMisin_edit &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_edit()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_edit()}
          actionText2={"Onayla"}
          action2={() => { cancel_edit(); setShowEminMisin_edit() }}
        />
      }

      {showEminMisin_ready &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_ready()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_ready()}
          actionText2={"Onayla"}
          action2={() => { cancel_ready(); setShowEminMisin_ready() }}
        />
      }

      <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}>

        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", minHeight: "3.5rem", maxHeight: "5rem" }}
        >

          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Box sx={{ display: "flex", alignItems: "center", columnGap: "0.5rem" }}>

              <IconButton sx={headerIconButton_sx} onClick={() => navigate("/metrajolusturpozmahaller")}>
                <ReplyIcon sx={{ ...headerIcon_sx, color: "gray" }} />
              </IconButton>

              <Box sx={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                {selectedPoz?.pozName}
              </Box>
              <Box sx={{ color: "#8B0000", fontWeight: 600 }}>{">"}</Box>
              <Box sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                {selectedMahal_metraj?.mahalName}
              </Box>

            </Box>
          </Grid>

          {/* sağ kısım - (tuşlar) */}
          <Grid item xs="auto">
            <Grid container>

              {!isChanged_edit && !isChanged_ready && !mode_ready &&
                <Grid item onClick={() => setMode_edit(x => !x)} sx={{ cursor: "pointer" }}>
                  <IconButton sx={headerIconButton_sx}>
                    <EditIcon sx={{ ...headerIcon_sx, color: mode_edit ? "black" : "gray" }} />
                  </IconButton>
                </Grid>
              }

              {!isChanged_edit && !isChanged_ready && !mode_edit &&
                <Grid item onClick={() => setMode_ready(x => !x)} sx={{ cursor: "pointer" }}>
                  <IconButton sx={headerIconButton_sx}>
                    <CheckCircleIcon sx={{ ...headerIcon_sx, color: mode_ready ? "black" : "gray" }} />
                  </IconButton>
                </Grid>
              }

              {!isChanged_edit && !isChanged_ready && mode_edit &&
                <Grid item onClick={() => satirEkle()} sx={{ cursor: "pointer" }}>
                  <IconButton sx={headerIconButton_sx}>
                    <AddCircleOutlineIcon sx={{ ...headerIcon_sx, color: mode_ready ? "black" : "gray" }} />
                  </IconButton>
                </Grid>
              }

              {isChanged_edit &&
                <>
                  <Grid item>
                    <IconButton sx={headerIconButton_sx} onClick={() => setShowEminMisin_edit(true)}>
                      <ClearOutlined sx={{ ...headerIcon_sx, color: "red" }} />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton sx={headerIconButton_sx} onClick={() => save_edit()} disabled={!isChanged_edit}>
                      <SaveIcon sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>
                </>
              }

              {isChanged_ready &&
                <>
                  <Grid item>
                    <IconButton sx={headerIconButton_sx} onClick={() => setShowEminMisin_ready(true)}>
                      <ClearOutlined sx={{ ...headerIcon_sx, color: "red" }} />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton sx={headerIconButton_sx} onClick={() => save_ready()} disabled={!isChanged_ready}>
                      <SaveIcon sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>
                </>
              }

            </Grid>
          </Grid>

        </Grid>

      </AppBar>
    </>
  )
}
