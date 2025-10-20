
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert';



import { StoreContext } from '../../components/store'
import { useGetMahaller } from '../../hooks/useMongo';

import FormMahalCreate from '../../components/FormMahalCreate'
import ShowMahalBaslik from '../../components/ShowMahalBaslik'
import HeaderMahaller from '../../components/HeaderMahaller'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import LinearProgress from '@mui/material/LinearProgress';



export default function P_Mahaller() {

  const navigate = useNavigate()

  const [dialogAlert, setDialogAlert] = useState()

  const { data: dataMahaller, error, isLoading } = useGetMahaller()

  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)

  // console.log("selectedProje", selectedProje)

  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])

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

  const [basliklar, setBasliklar] = useState(RealmApp?.currentUser.customData.customSettings.pages.mahaller.basliklar)

  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const mahalAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const mahalVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  const columns = `
    min-content
    minmax(min-content, 45rem) 
    ${mahalAciklamaShow ? " 1rem minmax(min-content, 10rem)" : ""}
    ${mahalVersiyonShow ? " 1rem max-content" : ""}
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

  const lbsBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1.5rem"
  }


  const mahalNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: "white",
    border: "1px solid black",
    px: "0.7rem"
  }


  let lbsCode
  let lbsName
  let cOunt

  return (
    <Box sx={{ m: "0rem" }}>


      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }


      {/* BAŞLIK */}
      <HeaderMahaller show={show} setShow={setShow} anyBaslikShow={anyBaslikShow} />


      {/* MAHAL OLUŞTURULACAKSA */}
      {show == "MahalCreate" && <FormMahalCreate setShow={setShow} dialogAlert={dialogAlert} setDialogAlert={setDialogAlert} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && <ShowMahalBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />}


      {isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }


      {/* EĞER MAHAL BAŞLIĞI YOKSA */}
      {!isLoading && show == "Main" && !selectedProje?.lbs?.find(x => x.openForMahal === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle mahal oluşturmaya açık mahal başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER MAHAL YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.lbs?.find(x => x.openForMahal === true) && !dataMahaller?.mahaller?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Menüler yardımı ile mahal oluşturmaya başlayabilirsiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - MAHALLAR VARSA */}

      {!isLoading && show == "Main" && selectedProje?.lbs?.find(x => x.openForMahal === true) && dataMahaller?.mahaller?.length > 0 &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>


          {/*   EN ÜST BAŞLIK */}
          {/* <Box sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_enUstBaslik }}> */}
          <React.Fragment >

            {/* BAŞLIK - MAHAL NO */}
            <Box sx={{ ...enUstBaslik_css, textWrap: "nowrap" }}>
              Mahal No
            </Box>

            {/* BAŞLIK - MAHAL İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Mahal İsmi
            </Box>



            {/* BAŞLIK - MAHAL AÇIKLAMA  */}
            {mahalAciklamaShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Açıklama
                </Box>
              </>
            }

            {/* BAŞLIK - VERSİYON */}
            {mahalVersiyonShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Versiyon
                </Box>
              </>
            }

          </React.Fragment>





          {/* LBS BAŞLIĞI ve ALTINDA MAHALLERİ*/}

          {selectedProje?.lbs.filter(x => x.openForMahal).map((oneLbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* LBS BAŞLIĞI */}
                <React.Fragment>



                  {/* HAYALET */}
                  <Box sx={{ display: "none" }}>
                    {cOunt = oneLbs.code.split(".").length}
                  </Box>

                  {
                    oneLbs.code.split(".").map((codePart, index) => {

                      if (index == 0 && cOunt == 1) {
                        lbsCode = codePart
                        lbsName = selectedProje?.lbs?.find(item => item.code == lbsCode).name
                      }

                      if (index == 0 && cOunt !== 1) {
                        lbsCode = codePart
                        lbsName = selectedProje?.lbs?.find(item => item.code == lbsCode).codeName
                      }

                      if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                        lbsCode = lbsCode + "." + codePart
                        lbsName = lbsName + " > " + selectedProje?.lbs?.find(item => item.code == lbsCode).codeName
                      }

                      if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                        lbsCode = lbsCode + "." + codePart
                        lbsName = lbsName + " > " + selectedProje?.lbs?.find(item => item.code == lbsCode).name
                      }

                    })
                  }

                  {/* lbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                  <Box sx={{ gridColumn: "1/3", ...lbsBaslik_css, display: "grid", gridAutoFlow: "column", justifyContent: "start", columnGap: "0.2rem", textWrap: "nowrap", pr: "1rem" }} >

                    {lbsName.split(">").map((item, index) => (
                      <React.Fragment key={index}>
                        <Box sx={{}}>{item}</Box>
                        {index + 1 !== lbsName.split(">").length &&
                          <Box sx={{ color: myTema.renkler.baslik2_ayrac }} >{">"}</Box>
                        }
                      </React.Fragment>
                    ))}

                    {/* <Typography>{lbsName}</Typography> */}
                  </Box>



                  {/* BAŞLIK - AÇIKLAMA  */}
                  {mahalAciklamaShow &&
                    <>
                      <Box></Box>
                      <Box sx={{ ...lbsBaslik_css }} />
                    </>
                  }

                  {/* BAŞLIK - VERSİYON */}
                  {mahalVersiyonShow &&
                    <>
                      <Box />
                      <Box sx={{ ...lbsBaslik_css }} />
                    </>
                  }

                </React.Fragment>


                {/* LBS'İN MAHALLERİ */}
                {dataMahaller?.mahaller?.filter(x => x._lbsId?.toString() === oneLbs._id?.toString()).map((oneMahal, index) => {

                  return (
                    // <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_mahalSatir }}>
                    <React.Fragment key={index} >

                      <Box sx={{ ...mahalNo_css }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box sx={{ ...mahalNo_css, pl: "0.5rem", justifyItems: "start" }}>
                        {oneMahal.mahalName}
                      </Box>


                      {/* BAŞLIK - AÇIKLAMA  */}
                      {mahalAciklamaShow &&
                        <>
                          <Box></Box>
                          <Box sx={{ ...mahalNo_css }}>
                            {oneMahal.aciklama}
                          </Box>
                        </>
                      }

                      {/* BAŞLIK - VERSİYON */}
                      {mahalVersiyonShow &&
                        <>
                          <Box />
                          <Box sx={{ ...mahalNo_css }}>
                            {oneMahal.versiyon}
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

    </Box>

  )

}
