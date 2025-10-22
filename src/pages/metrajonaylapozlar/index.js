
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';


import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';
import getWbsName from '../../functions/getWbsName';


import HeaderMetrajOnaylaPozlar from '../../components/HeaderMetrajOnaylaPozlar'
import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import ShowMetrajOnaylaPozlarBaslik from '../../components/ShowMetrajOnaylaPozlarBaslik'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import { Check } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';



export default function P_MetrajOnaylaPozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()

  let { data, error, isLoading } = useGetPozlar()
  let pozlar = data?.pozlar?.filter(x => x.hasDugum)
  // console.log("pozşar", pozlar)

  const { RealmApp, appUser, setAppUser, myTema } = useContext(StoreContext)
  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)

  // const { customData } = RealmApp?.currentUser

  const { selectedProje } = useContext(StoreContext)
  const metrajYapabilenler = selectedProje?.yetki?.metrajYapabilenler

  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  // const { editNodeMetraj, onayNodeMetraj } = useContext(StoreContext)
  let editNodeMetraj = false
  let onayNodeMetraj = showMetrajYapabilenler?.find(x => x.isShow) ? true : false

  // console.log("selectedProje", selectedProje)
  const pozBirimleri = selectedProje?.pozBirimleri
  // console.log("pozBirimleri", pozBirimleri)

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

  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.metrajOnayla.basliklar)


  // const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  // const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  const pozAciklamaShow = false
  const pozVersiyonShow = false

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
    border: "1px solid black",
    px: "0.7rem",
    display: "grid",
    alignItems: "center",
    justifyItems: "center"
  }



  const goTo_MetrajPozmahaller = (onePoz) => {
    navigate('/metrajonaylapozmahaller')
    setSelectedPoz_metraj(onePoz)
  }

  const showMetrajYapabilenlerColumns = " 1rem repeat(" + showMetrajYapabilenler?.filter(x => x.isShow).length + ", max-content)"
  const columns = `max-content minmax(min-content, 3fr) max-content max-content${pozAciklamaShow ? " 0.5rem minmax(min-content, 2fr)" : ""}${pozVersiyonShow ? " 0.5rem min-content" : ""}${editNodeMetraj ? " 0.5rem max-content" : ""}${onayNodeMetraj ? showMetrajYapabilenlerColumns : ""}`


  return (
    <Box sx={{ m: "0rem", maxWidth: "60rem" }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}
      <HeaderMetrajOnaylaPozlar
        show={show}
        setShow={setShow}
      />


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" &&
        <ShowMetrajOnaylaPozlarBaslik
          setShow={setShow}
          basliklar={basliklar} setBasliklar={setBasliklar}
        />
      }

      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }

      {isLoading &&
        <Box sx={{ mt: "5rem", ml: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {!isLoading && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Herhangi bir mahal, herhangi bir poz ile henüz eşleştirilmemiş, 'mahallistesi' menüsüne gidiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {!isLoading && show == "Main" && wbsArray_hasMahal && pozlar?.length > 0 &&

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
                  {appUser.userCode}
                </Box>
              </>
            }

            {onayNodeMetraj &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {

                  let yetkili = selectedProje?.yetkiliKisiler.find(oneYetkili => oneYetkili.email === oneYapabilen?.userEmail)

                  return (
                    <Box key={index} sx={{ ...enUstBaslik_css, borderLeft: "1px solid black", justifyContent: "center" }}>
                      {/* <Tooltip placement="bottom" title={yetkili.isim + " " + yetkili.soyisim}> */}
                      {/* <Box>
                          {yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen.userEmail).userCode}
                        </Box> */}
                      <Box sx={{ display: "grid", alignItems: "center", justifyItems: "center", fontSize: "0.75rem" }}>
                        <Box>
                          {yetkili.isim}
                        </Box>
                        <Box>
                          {yetkili.soyisim}
                        </Box>
                      </Box>
                      {/* </Tooltip> */}
                    </Box>
                  )
                })}
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
                      {getWbsName({ wbsArray: selectedProje?.wbs, oneWbs }).name}
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

                  {onayNodeMetraj &&
                    <>
                      <Box> </Box>
                      {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {
                        return (
                          <Box key={index} sx={{ ...wbsBaslik_css2, borderLeft: "1px solid black", justifyContent: "center" }}>

                          </Box>
                        )
                      })}
                    </>
                  }

                </>


                {/* WBS'İN POZLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  let hasOnaylananMetraj = onePoz?.hazirlananMetrajlar.find(x => x.hasSelected)

                  let isSelected = false

                  if (selectedPoz_metraj?._id.toString() === onePoz._id.toString()) {
                    isSelected = true
                  }

                  return (
                    <React.Fragment key={index} >
                      <Box sx={{ ...pozNo_css }} >
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, justifyItems: "start", pl: "0.5rem" }} >
                        {onePoz.pozName}
                      </Box>
                      <Box onClick={() => hasOnaylananMetraj && goTo_MetrajPozmahaller(onePoz)} sx={{ ...pozNo_css, backgroundColor: !hasOnaylananMetraj ? "lightgray" : "rgba(255, 251, 0, 0.55)", cursor: hasOnaylananMetraj && "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": hasOnaylananMetraj && { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: !hasOnaylananMetraj ? "lightgray" : "rgba(255, 251, 0, 0.55)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(onePoz?.metrajOnaylanan)}
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
                            {onePoz.aciklaam}
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
                      {/* {editNodeMetraj &&
                        <>
                          <Box />
                          <Box
                            onDoubleClick={() => goTo_MetrajPozmahaller(onePoz)}
                            sx={{
                              ...pozNo_css,
                              display: "grid", gridTemplateColumns: "1rem 1fr", justifyContent: "end", cursor: "pointer",
                              backgroundColor: "rgba(255, 251, 0, 0.55)",
                              "&:hover": { "& .childClass": { backgroundColor: "red" } }
                            }}>
                            <Box
                              className="childClass"
                              sx={{
                                ml: "-1rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%",
                                backgroundColor: "rgba(255, 251, 0, 0.55)",
                              }}>
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(onePoz?.hazirlananMetrajlar.find(x => x.userEmail === customData.email)?.metrajReady)}
                            </Box>
                          </Box>
                        </>
                      } */}

                      {onayNodeMetraj &&
                        <>
                          <Box> </Box>
                          {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {

                            let oneHazirlanan = onePoz.hazirlananMetrajlar.find(x => x.userEmail === oneYapabilen.userEmail)

                            let hasReady = oneHazirlanan?.hasReady
                            let hasSelected = oneHazirlanan?.hasSelected
                            let hasUnSelected = oneHazirlanan?.hasUnSelected
                            let metraj = oneHazirlanan?.metrajReady
                            let clickAble = hasUnSelected || hasSelected || hasReady ? true : false
                            let hasReadyUnSeen = oneHazirlanan?.hasReadyUnSeen
                            let allSelected = oneHazirlanan?.hasSelected && !oneHazirlanan?.hasUnSelected
                            let someSelected = oneHazirlanan?.hasSelected && oneHazirlanan?.hasUnSelected



                            return (
                              <Box
                                key={index}
                                onClick={() => clickAble && goTo_MetrajPozmahaller(onePoz)}
                                sx={{
                                  ...pozNo_css, display: "grid", gridTemplateColumns: "1rem 1fr", justifyContent: "end", cursor: clickAble && "pointer",
                                  backgroundColor: hasReadyUnSeen ? "rgba(255, 251, 0, 0.55)" : !clickAble && "lightgray",
                                  "&:hover": clickAble && { "& .childClass": { color: "red" } },
                                }}>
                                {/* <Box
                                  className="childClass"
                                  sx={{
                                    ml: "-1rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%",
                                    backgroundColor: hasSelected && hasUnSelected && "gray",
                                  }}>
                                </Box> */}

                                {someSelected &&
                                  <CircleIcon variant="contained" className="childClass"
                                    sx={{
                                      mr: "0.3rem", fontSize: "0.60rem",
                                      color: "gray"
                                    }} />
                                }

                                {allSelected &&
                                  <Check variant="contained" className="childClass"
                                    sx={{
                                      mr: "0.3rem", fontSize: "1rem",
                                      color: "black"
                                    }} />
                                }

                                {!someSelected && !allSelected && clickAble &&
                                  <CircleIcon variant="contained" className="childClass"
                                    sx={{
                                      mr: "0.3rem", fontSize: "0.6rem",
                                      color: hasReadyUnSeen ? "rgba(255, 251, 0, 0.55)" : "white"
                                    }} />
                                }

                                <Box sx={{ justifySelf: "end" }}>
                                  {ikiHane(metraj)}
                                </Box>

                              </Box>
                            )
                          })}
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


