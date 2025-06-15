
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";


import { StoreContext } from '../../components/store'
import { useGetFirmaPozlar } from '../../hooks/useMongo';

import FormFirmaPozCreate from '../../components/FormFirmaPozCreate'
import ShowFirmaPozBaslik from '../../components/ShowFirmaPozBaslik'
import HeaderFirmaPozlari from '../../components/HeaderFirmaPozlari'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_FirmaPozlari() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: pozlar } = useGetFirmaPozlar()
  // console.log("pozlar",pozlar)
  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedFirma } = useContext(StoreContext)

  // console.log("selectedFirma", selectedFirma)
  const pozBirimleri = selectedFirma?.pozBirimleri
  // console.log("pozBirimleri", pozBirimleri)

  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedFirma && navigate('/firmalar')
  }, [])

  const [basliklar, setBasliklar] = useState(RealmApp.currentUser.customData.customSettings.pages.firmapozlari.basliklar)

  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show

  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  const columns = `5rem 15rem 5rem${pozAciklamaShow ? " 1rem 10rem" : ""}${pozVersiyonShow ? " 1rem 5rem" : ""}`


  const enUstBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: myTema.renkler.baslik1,
    fontWeight: 600,
    border: "1px solid black",
    m: "-1px -1px 0 0"
  }

  const wbsBaslik_css = {
    gridColumn: "1 / span 3",
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    m: "-1px -1px 0 0"
  }

  const wbsBaslik_css2 = {
    backgroundColor: myTema.renkler.baslik2,
    border: "1px solid black",
    m: "-1px -1px 0 0"
  }

  const pozNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: "white",
    border: "1px solid black",
    m: "-1px -1px 0 0"
  }

  const bosluk_css = {
    backgroundColor: "white",
    borderLeft: "1px solid black"
  }

  let wbsCode
  let wbsName
  let cOunt

  return (
    <Box sx={{ m: "0rem" }}>

      {/* BAŞLIK */}
      <HeaderFirmaPozlari show={show} setShow={setShow} anyBaslikShow={anyBaslikShow} />


      {/* POZ OLUŞTURULACAKSA */}
      {show == "PozCreate" && <FormFirmaPozCreate setShow={setShow} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && <ShowFirmaPozBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />}


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {show == "Main" && !selectedFirma?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {show == "Main" && selectedFirma?.wbs?.find(x => x.openForPoz === true) && !pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Menüler yardımı ile poz oluşturmaya başlayabilirsiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {show == "Main" && selectedFirma?.wbs?.find(x => x.openForPoz === true) && pozlar?.length > 0 &&
        <Box sx={{ m: "1rem", maxWidth: "min-content" }}>


          {/*   EN ÜST BAŞLIK */}
          {/* <Box sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_enUstBaslik }}> */}
          <Box sx={{ display: "grid", gridTemplateColumns: columns }}>

            {/* BAŞLIK - POZ NO */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz No
            </Box>

            {/* BAŞLIK - POZ İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz İsmi
            </Box>


            {/* BAŞLIK - POZ BİRİM  */}
            <Box sx={{ ...enUstBaslik_css }}>
              Birim
            </Box>

            {/* BAŞLIK - POZ BİRİM  */}
            {pozAciklamaShow &&
              <>
                <Box sx={{ ...bosluk_css }}></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Açıklama
                </Box>
              </>
            }

            {/* BAŞLIK - VERSİYON */}
            {pozVersiyonShow &&
              <>
                <Box sx={{ ...bosluk_css }}></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Versiyon
                </Box>
              </>
            }

          </Box>





          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {selectedFirma?.wbs.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞI */}
                <Box sx={{ mt: "1rem", display: "grid", gridTemplateColumns: columns }}>

                  <Box sx={{ ...wbsBaslik_css }}>

                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = oneWbs.code.split(".").length}
                    </Box>

                    {
                      oneWbs.code.split(".").map((codePart, index) => {

                        if (index == 0 && cOunt == 1) {
                          wbsCode = codePart
                          wbsName = selectedFirma?.wbs?.find(item => item.code == wbsCode).name
                        }

                        if (index == 0 && cOunt !== 1) {
                          wbsCode = codePart
                          wbsName = selectedFirma?.wbs?.find(item => item.code == wbsCode).codeName
                        }

                        if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                          wbsCode = wbsCode + "." + codePart
                          wbsName = wbsName + " > " + selectedFirma?.wbs?.find(item => item.code == wbsCode).codeName
                        }

                        if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                          wbsCode = wbsCode + "." + codePart
                          wbsName = wbsName + " > " + selectedFirma?.wbs?.find(item => item.code == wbsCode).name
                        }

                      })
                    }

                    {/* wbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >

                      {wbsName.split(">").map((item, index) => (

                        <Box key={index} sx={{ display: "grid", gridAutoFlow: "column" }} >
                          {item}
                          {index + 1 !== wbsName.split(">").length &&
                            <Box sx={{ color: myTema.renkler.baslik2_ayrac, mx: "0.2rem" }} >{">"}</Box>
                          }
                        </Box>

                      ))}

                      {/* <Typography>{wbsName}</Typography> */}
                    </Box>

                  </Box>


                  {/* BAŞLIK - POZ BİRİM  */}
                  {pozAciklamaShow &&
                    <>
                      <Box sx={{ ...bosluk_css }}></Box>
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                  {/* BAŞLIK - VERSİYON */}
                  {pozVersiyonShow &&
                    <>
                      <Box sx={{ ...bosluk_css }} />
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                </Box>


                {/* WBS'İN POZLARI */}
                {pozlar?.filter(x => x.wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  return (
                    // <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_pozSatir }}>
                    <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns }}>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, pl: "0.5rem", justifyItems: "start" }}>
                        {onePoz.pozName}
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
                      </Box>

                      {/* BAŞLIK - POZ BİRİM  */}
                      {pozAciklamaShow &&
                        <>
                          <Box sx={{ ...bosluk_css }}></Box>
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.aciklama}
                          </Box>
                        </>
                      }

                      {/* BAŞLIK - VERSİYON */}
                      {pozVersiyonShow &&
                        <>
                          <Box sx={{ ...bosluk_css }} />
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.versiyon}
                          </Box>
                        </>
                      }

                    </Box>
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
