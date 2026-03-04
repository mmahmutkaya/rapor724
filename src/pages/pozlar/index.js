
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';
import _ from 'lodash';


import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';

import FormPozCreate from '../../components/FormPozCreate'
import ShowPozBaslik from '../../components/ShowPozBaslik'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
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
import CurrencyLiraIcon from '@mui/icons-material/CurrencyLira';
import SaveIcon from '@mui/icons-material/Save';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';




function HeaderPozlar({
  show, setShow, anyBaslikShow
}) {

  const { selectedProje } = useContext(StoreContext)

  const navigate = useNavigate()

  return (
    <Paper >

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

              <>
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

          </Grid>
        </Grid>

      </Grid>

    </Paper >
  )
}

export default function P_Pozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()

  const { data: dataPozlar, error, isLoading } = useGetPozlar()
  const { myTema, appUser, setAppUser } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)


  const [show, setShow] = useState("Main")
  const [pozlar_state, setPozlar_state] = useState()
  const [pozlar_backUp, setPozlar_backUp] = useState()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setPozlar_state(_.cloneDeep(dataPozlar?.pozlar))
    setPozlar_backUp(_.cloneDeep(dataPozlar?.pozlar))
  }, [dataPozlar])


  useEffect(() => {
    if (error) {
      console.log("error", error)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })
    }
  }, [error]);


  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.pozlar.basliklar)


  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show


  const columns = `
    max-content
    minmax(min-content, 35rem) 
    max-content
    ${pozAciklamaShow ? " 0.4rem minmax(min-content, 10rem)" : ""}
    ${pozVersiyonShow ? " 0.4rem max-content" : ""}
  `



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
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1.5rem",
  }

  const pozNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: "white",
    border: "1px solid black",
    px: "0.7rem"
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const ikiHane = (value) => {
    if (!value || value === "") {
      return value
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }



  let wbsCode
  let wbsName
  let cOunt

  return (
    <Box sx={{ m: "0rem" }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
          actionText1={dialogAlert.actionText1 ? dialogAlert.actionText1 : null}
          action1={dialogAlert.action1 ? dialogAlert.action1 : null}
          actionText2={dialogAlert.actionText2 ? dialogAlert.actionText2 : null}
          action2={dialogAlert.action2 ? dialogAlert.action2 : null}
        />
      }



      {/* BAŞLIK */}
      <HeaderPozlar show={show} setShow={setShow} anyBaslikShow={anyBaslikShow} />


      {/* POZ OLUŞTURULACAKSA */}
      {show == "PozCreate" && <FormPozCreate setShow={setShow} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && <ShowPozBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />}



      {isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {!isLoading && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar_state?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Menüler yardımı ile poz oluşturmaya başlayabilirsiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && pozlar_state?.length > 0 &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>


          {/*   EN ÜST BAŞLIK */}
          {/* <Box sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_enUstBaslik }}> */}
          <React.Fragment >

            {/* BAŞLIK - POZ NO */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz No
            </Box>

            {/* BAŞLIK - POZ İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz İsmi
            </Box>


            {/* BAŞLIK - POZ BİRİM  */}
            <Box sx={{ ...enUstBaslik_css, textWrap: "nowrap" }}>
              Birim
            </Box>

            {/* BAŞLIK - POZ BİRİM  */}
            {pozAciklamaShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Açıklama
                </Box>
              </>
            }

            {/* BAŞLIK - VERSİYON */}
            {pozVersiyonShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Versiyon
                </Box>
              </>
            }

          </React.Fragment >





          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {selectedProje?.wbs.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞI */}



                {/* HAYALET */}
                <Box sx={{ display: "none" }}>
                  {cOunt = oneWbs.code.split(".").length}
                </Box>

                {
                  oneWbs.code.split(".").map((codePart, index) => {

                    if (index == 0 && cOunt == 1) {
                      wbsCode = codePart
                      wbsName = selectedProje?.wbs?.find(item => item.code == wbsCode).name
                    }

                    if (index == 0 && cOunt !== 1) {
                      wbsCode = codePart
                      wbsName = selectedProje?.wbs?.find(item => item.code == wbsCode).codeName
                    }

                    if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                      wbsCode = wbsCode + "." + codePart
                      wbsName = wbsName + " > " + selectedProje?.wbs?.find(item => item.code == wbsCode).codeName
                    }

                    if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                      wbsCode = wbsCode + "." + codePart
                      wbsName = wbsName + " > " + selectedProje?.wbs?.find(item => item.code == wbsCode).name
                    }

                  })
                }

                {/* wbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                <Box sx={{ gridColumn: "1/4", ...wbsBaslik_css, display: "grid", gridAutoFlow: "column", justifyContent: "start", columnGap: "0.2rem", textWrap: "nowrap", pr: "1rem" }} >

                  {wbsName.split(">").map((item, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{}}>{item}</Box>
                      {index + 1 !== wbsName.split(">").length &&
                        <Box sx={{ color: myTema.renkler.baslik2_ayrac }} >{">"}</Box>
                      }
                    </React.Fragment>
                  ))}

                  {/* <Box>deneme</Box> */}
                  {/* <Typography>{wbsName}</Typography> */}
                </Box>




                {/* BAŞLIK - AÇIKLAMA  */}
                {pozAciklamaShow &&
                  <>
                    <Box></Box>
                    <Box sx={{ ...wbsBaslik_css }} />
                  </>
                }

                {/* BAŞLIK - VERSİYON */}
                {pozVersiyonShow &&
                  <>
                    <Box />
                    <Box sx={{ ...wbsBaslik_css }} />
                  </>
                }


                {/* WBS'İN POZLARI */}
                {pozlar_state?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {


                  return (
                    // <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_pozSatir }}>
                    <React.Fragment key={index}>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, pl: "0.5rem", justifyItems: "start" }}>
                        {onePoz.pozName}
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {selectedProje.pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
                      </Box>

                      {/* BAŞLIK - POZ BİRİM  */}
                      {pozAciklamaShow &&
                        <>
                          <Box></Box>
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.aciklama}
                          </Box>
                        </>
                      }

                      {/* BAŞLIK - VERSİYON */}
                      {pozVersiyonShow &&
                        <>
                          <Box />
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.versiyon}
                          </Box>
                        </>
                      }

                    </React.Fragment>
                  )
                })}


              </React.Fragment>


            )
          })}







        </Box>
      }

    </Box >

  )

}
