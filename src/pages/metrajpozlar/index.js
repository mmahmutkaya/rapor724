
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";


import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';
import getWbsName from '../../functions/getWbsName';


import ShowMetrajPozlarBaslik from '../../components/ShowMetrajPozlarBaslik'
import HeaderMetrajPozlar from '../../components/HeaderMetrajPozlar'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_MetrajPozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: pozlar } = useGetPozlar()
  const pozlar_hasMahal = pozlar?.filter(onePoz => onePoz.hasMahal)


  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)

  // console.log("selectedProje", selectedProje)
  const pozBirimleri = selectedProje?.pozBirimleri
  // console.log("pozBirimleri", pozBirimleri)

  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedProje && navigate('/projeler')
    selectedPoz_metraj && navigate('/metrajpozmahaller')
  }, [])

  const [basliklar, setBasliklar] = useState(RealmApp.currentUser.customData.customSettings.pages.metrajpozlar.basliklar)
  // console.log("dd",RealmApp.currentUser.customData.customSettings.pages.metrajpozlar.showHasMahal)
  const [showHasMahal, setShowHasMahal] = useState(RealmApp.currentUser.customData.customSettings.pages.metrajpozlar.showHasMahal)


  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  const columns = `5rem 15rem 5rem 5rem${pozAciklamaShow ? " 1rem 10rem" : ""}${pozVersiyonShow ? " 1rem 5rem" : ""}`

  const wbsArray_hasMahal = selectedProje?.wbs.filter(oneWbs => pozlar_hasMahal?.find(onePoz => onePoz._wbsId.toString() === oneWbs._id.toString()))


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
    gridColumn: "1 / span 4",
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
    border: "1px solid black",
    m: "-1px -1px 0 0"
  }

  const bosluk_css = {
    backgroundColor: "white",
    borderLeft: "1px solid black"
  }


  return (
    <Box sx={{ m: "0rem" }}>

      {/* BAŞLIK */}
      <HeaderMetrajPozlar
        show={show}
        setShow={setShow}
      />


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" &&
        <ShowMetrajPozlarBaslik
          setShow={setShow}
          basliklar={basliklar} setBasliklar={setBasliklar}
          showHasMahal={showHasMahal} setShowHasMahal={setShowHasMahal}
        />
      }


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar_hasMahal?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Herhangi bir mahal, herhangi bir poz ile henüz eşleştirilmemiş, 'mahallistesi' menüsüne gidiniz.  
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {show == "Main" && wbsArray_hasMahal && pozlar_hasMahal?.length > 0 &&

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
              Miktar
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

          {wbsArray_hasMahal?.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞININ OLDUĞU TÜM SATIR */}
                <Box sx={{ mt: "1rem", display: "grid", gridTemplateColumns: columns }}>

                  {/* WBS BAŞLIĞI */}
                  <Box sx={{ ...wbsBaslik_css }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >
                      {getWbsName({ wbsArray: wbsArray_hasMahal, oneWbs }).name}
                    </Box>
                  </Box>


                  {/* BAŞLIK - AÇIKLAMA  */}
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
                {pozlar_hasMahal?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  let isSelected = false

                  if (!showHasMahal && !onePoz.hasMahal) {
                    return
                  }

                  if (selectedPoz_metraj?._id.toString() === onePoz._id.toString()) {
                    isSelected = true
                  }

                  return (
                    // <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_pozSatir }}>
                    <Box key={index} onDoubleClick={() => navigate('/metrajpozmahaller')} onClick={() => setSelectedPoz_metraj(onePoz)} sx={{ "&:hover": { "& .childClass": { display: "block" } }, cursor: "pointer", display: "grid", gridTemplateColumns: columns, backgroundColor: !onePoz.hasMahal && "lightgray" }}>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, pl: "0.5rem", justifyItems: "start", display: "grid", gridTemplateColumns: "1fr 1rem" }}>
                        <Box sx={{}}>
                          {onePoz.pozName}
                        </Box>
                        <Box className="childClass" sx={{ display: isSelected ? "block" : "none", backgroundColor: isSelected ? "black" : "red", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                          { }
                        </Box>
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz?.miktar}
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


