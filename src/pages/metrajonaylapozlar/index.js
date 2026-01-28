
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { DialogVersiyonTip } from '../../components/general/DialogVersiyonTip.js';


import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';
import getWbsName from '../../functions/getWbsName';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import ShowMetrajOnaylaPozlarBaslik from '../../components/ShowMetrajOnaylaPozlarBaslik'


import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import { Check } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';



export default function P_MetrajOnaylaPozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedMetrajVersiyon, setSelectedMetrajVersiyon } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)


  let { data, error, isLoading } = useGetPozlar()
  let pozlar = data?.pozlar?.filter(x => x.hasDugum)
  // console.log("pozlar", pozlar)

  const { setSelectedProje, appUser, setAppUser, myTema } = useContext(StoreContext)
  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)
  const { mode_metrajOnayla, setMode_metrajOnayla } = useContext(StoreContext)

  let creatableMetrajVersiyon
  if (selectedProje?.anyVersiyonZero) {
    creatableMetrajVersiyon = true
  }
  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false)

  const metrajYapabilenler = selectedProje?.yetki?.metrajYapabilenler

  let editNodeMetraj = false
  let onayNodeMetraj = mode_metrajOnayla && showMetrajYapabilenler?.find(x => x.isShow) ? true : false

  // console.log("selectedProje", selectedProje)
  const pozBirimleri = selectedProje?.pozBirimleri
  // console.log("pozBirimleri", pozBirimleri)

  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setShowMetrajYapabilenler(appUser?.customSettings?.pages.metrajonayla.showMetrajYapabilenler)
    // console.log("showMetrajYapabilenler", appUser?.customSettings?.pages.metrajonayla.showMetrajYapabilenler)
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

  const [basliklar, setBasliklar] = useState(appUser?.customSettings?.pages.metrajonayla.basliklar)


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
    setSelectedPoz(onePoz)
  }

  const showMetrajYapabilenlerColumns = " 1rem repeat(" + showMetrajYapabilenler?.filter(x => x.isShow).length + ", max-content)"
  const columns = `max-content minmax(min-content, 3fr) max-content max-content${pozAciklamaShow ? " 0.5rem minmax(min-content, 2fr)" : ""}${pozVersiyonShow ? " 0.5rem min-content" : ""}${editNodeMetraj ? " 0.5rem max-content" : ""}${onayNodeMetraj ? showMetrajYapabilenlerColumns : ""}`





  const requestProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {

    try {

      setSelectedMetrajVersiyon()

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/requestprojeaktifyetkilikisi`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId, aktifYetki
        })
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


      if (responseJson.message) {
        setShow("Main")
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            queryClient.invalidateQueries(['dataPozlar'])
            setShow("Main")
            setDialogAlert()
          }
        })
      }


      if (responseJson.ok) {
        // setShow("Main")
        queryClient.invalidateQueries(['dataPozlar'])
        setMode_metrajOnayla(true)
      }

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }




  const deleteProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {

    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/deleteprojeaktifyetkilikisi`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId, aktifYetki
        })
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

      if (responseJson.message) {
        setShow("Main")
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            setDialogAlert()
          }
        })
      }

      if (responseJson.ok) {
        setShow("Main")
        setMode_metrajOnayla()
      }

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }



  const createVersiyon_metraj = async ({ fieldText }) => {

    const versiyonNumber = selectedMetrajVersiyon?.versiyonNumber + 1
    setSelectedMetrajVersiyon()

    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/versiyon/metraj`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId: selectedProje?._id,
          pozlar,
          versiyonNumber,
          aciklama: fieldText
        })
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

      if (responseJson.message) {
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            queryClient.invalidateQueries(['dataPozlar'])
            setDialogAlert()
          }
        })
        return
      }

      if (responseJson.ok) {
        queryClient.invalidateQueries(['dataPozlar'])
        setMode_metrajOnayla()
      } else {
        console.log("responseJson", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }






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


      {showEminMisin_versiyon &&
        <DialogVersiyonTip
          dialogBaslikText={`Mevcut metrajlar versiyon  (B${selectedMetrajVersiyon?.versiyonNumber + 1}) olarak kaydedilsin mi?`}
          aciklamaBaslikText={"Versiyon hakkında bilgi verebilirsiniz"}
          aprroveAction={({ fieldText }) => {
            setShowEminMisin_versiyon()
            createVersiyon_metraj({ fieldText })
          }}
          rejectAction={() => setShowEminMisin_versiyon()}
          onCloseAction={() => setShowEminMisin_versiyon()}
        />
      }


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
            Mahallistesi henüz boş.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Mahallistesi henüz boş.
          </Alert>
        </Stack>
      }



      {/* BAŞLIK */}
      <Paper >

        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "white",
            color: "black",
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: topBarHeight,
            // pt:"3rem",
            ml: { md: `${drawerWidth}px` }
          }}
        >

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
                Metraj Onayla
              </Typography>
            </Grid>


            {/* sağ kısım - (tuşlar)*/}
            <Grid item xs="auto">
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>

                {!mode_metrajOnayla && selectedMetrajVersiyon &&

                  <>
                    <Box>
                      <IconButton onClick={() => requestProjeAktifYetkiliKisi({ projeId: selectedProje?._id, aktifYetki: "metrajOnay" })}>
                        <EditIcon variant="contained" />
                      </IconButton>
                    </Box>


                    {selectedMetrajVersiyon &&

                      <Select
                        size='small'
                        value={selectedMetrajVersiyon?.versiyonNumber}
                        onClose={() => {
                          setTimeout(() => {
                            document.activeElement.blur();
                          }, 0);
                        }}
                        // onBlur={() => queryClient.resetQueries(['dataPozlar'])}
                        sx={{ fontSize: "0.75rem" }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: "15rem",
                              minWidth: "5rem"
                            },
                          },
                        }}
                      >

                        {selectedProje?.metrajVersiyonlar.sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((oneVersiyon, index) => {
                          let versiyonNumber = oneVersiyon?.versiyonNumber

                          return (
                            <MenuItem
                              onClick={() => {
                                setSelectedMetrajVersiyon(oneVersiyon)
                                setTimeout(() => {
                                  queryClient.resetQueries(['dataPozlar'])
                                }, 0);
                              }}
                              sx={{ fontSize: "0.75rem" }} key={index} value={versiyonNumber} > M{versiyonNumber}
                            </MenuItem>
                          )
                        })}

                      </Select>
                    }

                  </>
                }

                {mode_metrajOnayla && selectedMetrajVersiyon &&
                  <>

                    <Grid item >
                      <IconButton onClick={() => deleteProjeAktifYetkiliKisi({ projeId: selectedProje?._id, aktifYetki: "metrajOnay" })} aria-label="lbsUncliced">
                        <ClearOutlined variant="contained" sx={{ color: "red" }} />
                      </IconButton>
                    </Grid>


                    <Grid item >
                      <IconButton onClick={() => setShow("ShowMetrajYapabilenler")} disabled={false}>
                        <PersonIcon variant="contained" />
                      </IconButton>
                    </Grid>

                    <Box
                      onClick={() => creatableMetrajVersiyon && setShowEminMisin_versiyon(true)}
                      sx={{ cursor: creatableMetrajVersiyon && "pointer", mx: "0.3rem", py: "0.2rem", px: "0.3rem", border: creatableMetrajVersiyon ? "1px solid red" : "1px solid black", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: "600", backgroundColor: "yellow" }}
                    >
                      V{selectedMetrajVersiyon?.versiyonNumber + 1}
                    </Box>

                  </>
                }

              </Box>
            </Grid>

          </Grid>

        </AppBar>

      </Paper >




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

                  let hasVersiyonZero = onePoz?.hasVersiyonZero

                  let isSelected = false

                  if (selectedPoz?._id.toString() === onePoz._id.toString()) {
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
                      <Box onClick={() => hasOnaylananMetraj && goTo_MetrajPozmahaller(onePoz)} sx={{ ...pozNo_css, backgroundColor: mode_metrajOnayla && hasVersiyonZero && "rgba(255, 251, 0, 0.55)", cursor: hasOnaylananMetraj && "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": hasOnaylananMetraj && { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: mode_metrajOnayla && hasVersiyonZero && "rgba(255, 251, 0, 0.55)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {!mode_metrajOnayla ? ikiHane(onePoz?.metrajVersiyonlar?.metrajOnaylanan) : ikiHane(onePoz?.metrajOnaylanan)}
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


