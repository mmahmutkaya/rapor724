
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

  let { data: pozlar } = useGetPozlar()
  pozlar = pozlar?.filter(x => x.hasDugum)

  const { RealmApp, myTema } = useContext(StoreContext)
  const { customData } = RealmApp.currentUser
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)

  // console.log("selectedProje", selectedProje)
  const pozBirimleri = selectedProje?.pozBirimleri
  // console.log("pozBirimleri", pozBirimleri)

  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedProje && navigate('/projeler')
    selectedPoz_metraj && navigate('/metrajpozmahaller')
  }, [])

  const [basliklar, setBasliklar] = useState(RealmApp.currentUser.customData.customSettings.pages.metrajpozlar.basliklar)


  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  const wbsArray_hasMahal = selectedProje?.wbs.filter(oneWbs => pozlar?.find(onePoz => onePoz._wbsId.toString() === oneWbs._id.toString()))



  const ikiHane = (value) => {
    if (!value) {
      return ""
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
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
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    border: "1px solid black",
    px: "0.7rem"
  }



  const goTo_MetrajPozmahaller = (onePoz) => {
    navigate('/metrajpozmahaller')
    setSelectedPoz_metraj(onePoz)
  }


  const columns = `auto 1fr auto auto${pozAciklamaShow ? " 1rem 10rem" : ""}${pozVersiyonShow ? " 1rem auto" : ""}${editNodeMetraj ? " 1rem auto" : ""}`


  return (
    <Box sx={{ m: "0rem", maxWidth: "60rem" }}>

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
        />
      }


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Herhangi bir mahal, herhangi bir poz ile henüz eşleştirilmemiş, 'mahallistesi' menüsüne gidiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {show == "Main" && wbsArray_hasMahal && pozlar?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: columns }}>

          {/*   EN ÜST BAŞLIK */}
          <>

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

            {/* METRAJ DÜZENLEME AÇIKSA */}
            {editNodeMetraj &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  {customData.isim}
                </Box>
              </>
            }

          </>



          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {wbsArray_hasMahal?.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞININ OLDUĞU TÜM SATIR */}
                <>
                  {/* WBS BAŞLIĞI */}
                  <Box sx={{ ...wbsBaslik_css }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >
                      {getWbsName({ wbsArray: wbsArray_hasMahal, oneWbs }).name}
                    </Box>
                  </Box>


                  {/* BAŞLIK - AÇIKLAMA  */}
                  {pozAciklamaShow &&
                    <>
                      <Box></Box>
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                  {/* BAŞLIK - VERSİYON */}
                  {pozVersiyonShow &&
                    <>
                      <Box />
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                  {/* METRAJ DÜZENLEME AÇIKSA */}
                  {editNodeMetraj &&
                    <>
                      <Box />
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                </>


                {/* WBS'İN POZLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  let isSelected = false

                  if (selectedPoz_metraj?._id.toString() === onePoz._id.toString()) {
                    isSelected = true
                  }

                  return (
                    // <Box key={index} onDoubleClick={() => navigate('/metrajpozmahaller')} onClick={() => setSelectedPoz_metraj(onePoz)} sx={{ "&:hover": { "& .childClass": { display: "block" } }, cursor: "pointer", display: "grid", }}>
                    <React.Fragment key={index} >
                      <Box sx={{ ...pozNo_css }} >
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, justifyItems: "start", pl: "0.5rem" }} >
                        {onePoz.pozName}
                      </Box>
                      <Box onDoubleClick={() => goTo_MetrajPozmahaller(onePoz)} sx={{ ...pozNo_css, cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: "white", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(onePoz?.onaylananMetraj)}
                        </Box>
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
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

                      {/* METRAJ DÜZENLEME AÇIKSA - KİŞİNİN HAZIRLADIĞI TOPLAM POZ METRAJ*/}
                      {editNodeMetraj &&
                        <>
                          <Box />
                          <Box onDoubleClick={() => goTo_MetrajPozmahaller(onePoz)} sx={{ ...pozNo_css, justifyContent: "end", cursor: "pointer", backgroundColor: "yellow", cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                            <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: "yellow", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(onePoz?.hazirlananMetrajlar.find(x => x.userEmail === customData.email).metraj)}
                            </Box>
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


