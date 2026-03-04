import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import ReplyIcon from '@mui/icons-material/Reply';

import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';
import getWbsName from '../../functions/getWbsName';
import { DialogAlert } from '../../components/general/DialogAlert.js';

import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from '@mui/material';


export default function P_KesifButcePozlar() {

  const navigate = useNavigate()

  let { data, error, isFetching } = useGetPozlar()
  let pozlar = data?.pozlar?.filter(x => x.hasDugum)

  const [dialogAlert, setDialogAlert] = useState()

  const { appUser, myTema } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedIsPaket } = useContext(StoreContext)

  const pozBirimleri = selectedProje?.pozBirimleri

  let onayNodeMetraj = false

  const [show, setShow] = useState("Main")

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
    if (!selectedIsPaket) navigate('/kesifbutce')
  }, [])

  useEffect(() => {
    if (error) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })
    }
  }, [error]);

  const wbsArray_hasMahal = selectedProje?.wbs.filter(oneWbs => pozlar?.find(onePoz => onePoz._wbsId.toString() === oneWbs._id.toString()))

  const ikiHane = (value) => {
    if (!value) return ""
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    }
    return value
  }

  // CSS
  const enUstBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: myTema.renkler.baslik1,
    fontWeight: 600,
    border: "1px solid black",
    px: "0.7rem"
  }

  const wbsBaslik_css = {
    gridColumn: "1 / span 4",
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }

  const wbsBaslik_css2 = {
    backgroundColor: myTema.renkler.baslik2,
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }

  const pozNo_css = {
    border: "1px solid black",
    px: "0.7rem",
    display: "grid",
    alignItems: "center",
    justifyItems: "center"
  }

  const goTo_MetrajPozmahaller = (onePoz) => {
    navigate('/metrajpozmahaller')
    setSelectedPoz(onePoz)
  }

  const columns = `max-content minmax(min-content, 30rem) max-content max-content`


  return (
    <Box>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >
          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => navigate('/kesifbutce', { state: { keepIsPaket: true } })}
                sx={{ width: 40, height: 40, mr: "0.25rem", ml: "-0.5rem" }}
              >
                <ReplyIcon sx={{ fontSize: 24 }} />
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                {selectedIsPaket?.name ?? "Pozlar"}
              </Typography>
            </Box>
          </Grid>

          {/* sağ kısım - (tuşlar) */}
          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }} />
          </Grid>
        </Grid>
      </AppBar>


      {isFetching &&
        <Box sx={{ width: '100%', px: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }

      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {!isFetching && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Mahallistesi henüz boş.
          </Alert>
        </Stack>
      }

      {/* EĞER POZ YOKSA */}
      {!isFetching && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Mahallistesi henüz boş.
          </Alert>
        </Stack>
      }

      {/* ANA SAYFA - POZLAR VARSA */}
      {!isFetching && show == "Main" && wbsArray_hasMahal && pozlar?.length > 0 &&

        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>

          {/* EN ÜST BAŞLIK */}
          <>
            <Box sx={{ ...enUstBaslik_css }}>Poz No</Box>
            <Box sx={{ ...enUstBaslik_css }}>Poz İsmi</Box>
            <Box sx={{ ...enUstBaslik_css }}>Miktar</Box>
            <Box sx={{ ...enUstBaslik_css }}>Birim</Box>
          </>


          {/* WBS BAŞLIĞI ve ALTINDA POZLARI */}
          {wbsArray_hasMahal?.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (
              <React.Fragment key={index}>

                {/* WBS BAŞLIĞI */}
                <Box sx={{ ...wbsBaslik_css }}>
                  <Box sx={{ display: "grid", gridAutoFlow: "column" }}>
                    {getWbsName({ wbsArray: wbsArray_hasMahal, oneWbs }).name}
                  </Box>
                </Box>

                {/* WBS'İN POZLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  let hasOnaylananMetraj = onePoz?.hazirlananMetrajlar.find(x => x.hasSelected)

                  return (
                    <React.Fragment key={index}>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, justifyItems: "start", pl: "0.5rem" }}>
                        {onePoz.pozName}
                      </Box>
                      <Box
                        onClick={() => hasOnaylananMetraj && goTo_MetrajPozmahaller(onePoz)}
                        sx={{
                          ...pozNo_css,
                          cursor: hasOnaylananMetraj ? "pointer" : "default",
                          display: "grid",
                          gridTemplateColumns: "1rem 1fr",
                          "&:hover": hasOnaylananMetraj && { "& .childClass": { backgroundColor: "red" } }
                        }}
                      >
                        <Box
                          className="childClass"
                          sx={{ ml: "-1rem", backgroundColor: "white", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}
                        />
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(onePoz?.metrajVersiyonlar?.metrajOnaylanan)}
                        </Box>
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
                      </Box>
                    </React.Fragment>
                  )
                })}

              </React.Fragment>
            )
          })}

        </Box>
      }

    </Box>
  )
}
