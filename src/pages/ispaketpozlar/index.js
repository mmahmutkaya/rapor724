
import React from 'react'
import { useState, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import { useGetIsPaketPozlar } from '../../hooks/useMongo.js';
import getWbsName from '../../functions/getWbsName.js';
import { DialogAlert } from '../../components/general/DialogAlert.js';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler.js'


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import CircleIcon from '@mui/icons-material/Circle';
import { Check } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import Tooltip from '@mui/material/Tooltip';




export default function P_isPaketPozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: dataIsPaketPozlar, error: error2, isFetching: isFetching2 } = useGetIsPaketPozlar();

  const [dialogAlert, setDialogAlert] = useState()
  const [hoveredRow, setHoveredRow] = useState(null)
  const [openTooltip, setOpenTooltip] = useState(null)
  const tooltipTimerRef = useRef(null)

  const { appUser, setAppUser, RealmApp, myTema, drawerWidth, topBarHeight } = useContext(StoreContext)
  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedMetrajVersiyon, setSelectedMetrajVersiyon } = useContext(StoreContext)
  const { selectedBirimFiyatVersiyon, setSelectedBirimFiyatVersiyon } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedIsPaket } = useContext(StoreContext)
  
  const wbsArray_state = selectedProje?.wbs?.filter(x => x.openForPoz === true)

  const versiyonlar = selectedProje?.versiyonlar?.metraj
  const pozBirimleri = selectedProje?.pozBirimleri
  const yetkililer = selectedProje?.yetkiliKisiler

  let onayNodeMetraj = false

  const [show, setShow] = useState("Main")

  const pendingNavigationRef = useRef(null)

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

  useEffect(() => {
    // If navigation was pending and context is now set, navigate
    if (pendingNavigationRef.current && selectedPoz?._id === pendingNavigationRef.current._id) {
      navigate('/ispaketpozmahaller')
      pendingNavigationRef.current = null
    }
  }, [selectedPoz, navigate])


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [selectedProje, navigate])


  useEffect(() => {
    if (error2) {
      console.log("error", error2)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error2?.message ? error2.message : null
      })
    }
  }, [error2]);


  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.ispaketler.basliklar)

  const pozAciklamaShow = false
  const pozVersiyonShow = false

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
    display: "grid",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }

  const wbsToplamBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    px: "0.7rem"
  }

  const wbsToplamBaslik_css2 = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: myTema.renkler.baslik2,
    border: "1px solid black",
    px: "0.7rem"
  }



  const pozNo_css = {
    border: "1px solid black",
    px: "0.7rem",
    display: "grid",
    alignItems: "center",
    justifyItems: "center"
  }



  const goTo_isPaketPozMahaller = (onePoz) => {
    pendingNavigationRef.current = onePoz
    setSelectedPoz(onePoz)
  }

  const handleTooltipEnterOrMove = (key) => {
    clearTimeout(tooltipTimerRef.current)
    setOpenTooltip(null)
    tooltipTimerRef.current = setTimeout(() => setOpenTooltip(key), 600)
  }

  const handleTooltipLeave = () => {
    clearTimeout(tooltipTimerRef.current)
    setOpenTooltip(null)
  }

  let paraBirimiAdet = selectedProje?.paraBirimleri?.filter(x => x?.isActive).length

  const maxIsPaketCount = dataIsPaketPozlar?.pozlar
    ? Math.max(0, ...dataIsPaketPozlar.pozlar.map(p => p.isPaketler?.length || 0))
    : 0

  const showMetrajYapabilenlerColumns = " 1rem repeat(" + showMetrajYapabilenler?.filter(x => x.isShow).length + ", max-content)"
  const columns = `
    max-content
    minmax(min-content, 25rem)
    max-content
    1rem
    max-content
    max-content
    ${maxIsPaketCount > 0 ? `1rem ${Array(maxIsPaketCount).fill('8rem').join(' ')}` : ''}
    ${pozAciklamaShow ? " 0.5rem minmax(min-content, 2fr)" : ""}
    ${pozVersiyonShow ? " 0.5rem min-content" : ""}
  `

  // console.log("columns",columns)

  let ayracRenk_siyah = "black"
  let ayracRenk_bordo = "rgba(194, 18, 18, 0.67)"


  return (
    <Box sx={{ m: "0rem" }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}
      <Box >

        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "white",
            color: "black",
            boxShadow: 4,
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
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>

                <IconButton
                  sx={{ mx: 0, px: 0 }}
                  onClick={() => navigate('/ispaketler')} disabled={false}>
                  <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>

                <Box>
                  {selectedIsPaket?.name}
                </Box>

                {/* <Box sx={{ color: "#8B0000", fontWeight: "600" }}>
                {" > "}
              </Box> */}

                <Box>
                  {/* {"Tüm Mahaller"} */}
                </Box>
              </Box>
            </Grid>


            {/* sağ kısım - (tuşlar)*/}
            <Grid item xs="auto">
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>

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

                {selectedBirimFiyatVersiyon &&

                  <Select
                    size='small'
                    value={selectedBirimFiyatVersiyon?.versiyonNumber}
                    onClose={() => {
                      setTimeout(() => {
                        document.activeElement.blur();
                      }, 0);
                    }}
                    // onBlur={() => queryClient.resetQueries(['dataPozlar'])}
                    sx={{ fontSize: "0.75rem", ml: "0.5rem" }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "15rem",
                          minWidth: "5rem"
                        },
                      },
                    }}
                  >

                    {selectedProje?.birimFiyatVersiyonlar.sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((oneVersiyon, index) => {
                      let versiyonNumber = oneVersiyon?.versiyonNumber

                      return (
                        <MenuItem
                          onClick={() => {
                            setSelectedBirimFiyatVersiyon(oneVersiyon)
                            setTimeout(() => {
                              queryClient.resetQueries(['dataPozlar'])
                            }, 0);
                          }}
                          sx={{ fontSize: "0.75rem" }} key={index} value={versiyonNumber} > B{versiyonNumber}
                        </MenuItem>
                      )

                    })}

                  </Select>
                }

              </Box>
            </Grid>

          </Grid>

        </AppBar>

      </Box >


      {/* BAŞLIK GÖSTER / GİZLE */}
      {
        show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }


      {
        (isFetching2) &&
        <Box sx={{ width: '100%', px: "1rem", mt: "5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }



      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {
        !(isFetching2) && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {
        !(isFetching2) && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !dataIsPaketPozlar?.pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Herhangi bir mahal, herhangi bir poz ile henüz eşleştirilmemiş, 'mahallistesi' menüsüne gidiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {
        !(isFetching2) && show == "Main" && wbsArray_state?.length > 0 && dataIsPaketPozlar?.pozlar?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: columns }}>

          {/*   EN ÜST BAŞLIK */}
          <>

            <Box sx={{ ...enUstBaslik_css }}>
              Poz No
            </Box>

            <Box sx={{ ...enUstBaslik_css }}>
              Poz İsmi
            </Box>

            <Box sx={{ ...enUstBaslik_css }}>
              Birim
            </Box>

            <Box />

            <Box sx={{ ...enUstBaslik_css }}>
              Açık Mahal
            </Box>

            <Box sx={{ ...enUstBaslik_css }}>
              Mükerrer
            </Box>

            {/* BAŞLIK - İŞ PAKETLERİ */}
            {maxIsPaketCount > 0 && (
              <>
                <Box />
                {Array.from({ length: maxIsPaketCount }, (_, i) => (
                  <Box key={`ispaket-baslik-${i}`} sx={{ ...enUstBaslik_css }}>
                    İP {i + 1}
                  </Box>
                ))}
              </>
            )}

            {/* BAŞLIK - AÇIKLAMA  */}
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


          </>


          {/* EN ÜST BAŞLIK ALT SATIR - TOPLAM SATIRI */}
          <>

            <Box sx={{ ...enUstBaslik_css, gridColumn: "1/4", justifyItems: "start" }}>
            </Box>

            <Box />

            <Box sx={{ ...enUstBaslik_css }}>
              {(() => {
                const t = dataIsPaketPozlar?.pozlar?.reduce((sum, p) => sum + (p.isPaketler_empityArrayCounts || 0), 0) || 0
                return t || ""
              })()}
            </Box>

            <Box sx={{ ...enUstBaslik_css }}>
              {(() => {
                const t = dataIsPaketPozlar?.pozlar?.reduce((sum, p) => sum + (p.isPaketler_mukerrerArrayCounts || 0), 0) || 0
                return t || ""
              })()}
            </Box>

            {/* TOPLAM - İŞ PAKETLERİ */}
            {maxIsPaketCount > 0 && (
              <>
                <Box />
                {Array.from({ length: maxIsPaketCount }, (_, i) => (
                  <Box key={`ispaket-toplam-${i}`} sx={{ ...enUstBaslik_css }} />
                ))}
              </>
            )}

            {pozAciklamaShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }} />
              </>
            }

            {pozVersiyonShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }} />
              </>
            }

          </>


          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {wbsArray_state?.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞININ OLDUĞU TÜM SATIR */}
                <>

                  {/* WBS BAŞLIĞI */}
                  <Box sx={{ ...wbsBaslik_css, gridColumn: "1/3" }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >
                      {getWbsName({ wbsArray: wbsArray_state, oneWbs }).name}
                    </Box>
                  </Box>


                  <Box sx={{ ...wbsBaslik_css2 }}>
                  </Box>

                  <Box />

                  <Box sx={{ ...wbsBaslik_css2, justifyItems: "center" }}>
                    {(() => {
                      const wbsPozlar = dataIsPaketPozlar?.pozlar?.filter(p => p._wbsId.toString() === oneWbs._id.toString())
                      const t = wbsPozlar?.reduce((sum, p) => sum + (p.toplamDugum || 0), 0) || 0
                      const s = wbsPozlar?.reduce((sum, p) => sum + (p.secilenDugum || 0), 0) || 0
                      return (t - s) || ""
                    })()}
                  </Box>

                  <Box sx={{ ...wbsBaslik_css2, justifyItems: "center" }}>
                    {(() => {
                      const wbsPozlar = dataIsPaketPozlar?.pozlar?.filter(p => p._wbsId.toString() === oneWbs._id.toString())
                      const t = wbsPozlar?.reduce((sum, p) => sum + (p.isPaketler_mukerrerArrayCounts || 0), 0) || 0
                      return t || ""
                    })()}
                  </Box>

                  {/* WBS - İŞ PAKETLERİ */}
                  {maxIsPaketCount > 0 && (
                    <>
                      <Box />
                      {Array.from({ length: maxIsPaketCount }, (_, i) => (
                        <Box key={`ispaket-wbs-${i}`} sx={{ ...wbsBaslik_css2 }} />
                      ))}
                    </>
                  )}

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

                </>


                {/* WBS'İN POZLARI */}
                {dataIsPaketPozlar?.pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  let pozBirim = selectedProje?.pozBirimleri.find(x => x.id == onePoz?.pozBirimId)?.name

                  let toplamDugum = onePoz.toplamDugum
                  let secilenDugum = onePoz.secilenDugum

                  // let paketPozMetraj = IsPaketPozMetrajlar_state
                  //   ?.find(x => x._id.toString() === onePoz._id.toString()).isPaketler_byVersiyon
                  //   ?.find(x => x._id.toString() === selectedIsPaket._id.toString())?.metrajOnaylanan

                  let isSelected = selectedPoz?._id.toString() === onePoz._id.toString()
                  const isHovered = hoveredRow === onePoz._id.toString()
                  const backgroundColor = "white"
                  const rowBaseSx = { transition: "text-shadow 0.2s ease" }
                  const hoverSx = (isHovered || isSelected) ? { textShadow: "0 0 0.7px black, 0 0 0.7px black" } : {}
                  const rowHandlers = {
                    onMouseEnter: () => setHoveredRow(onePoz._id.toString()),
                    onMouseLeave: () => setHoveredRow(null),
                    onClick: () => goTo_isPaketPozMahaller(onePoz),
                  }

                  return (
                    <React.Fragment key={index} > 

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor, cursor: "pointer", justifyContent: "center" }}>
                        {onePoz.pozNo}
                      </Box>

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor, cursor: "pointer", justifyItems: "start" }}>
                        {onePoz.pozName}
                      </Box>

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor, cursor: "pointer", justifyContent: "center" }}>
                        {pozBirim}
                      </Box>

                      <Box />

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor: onePoz.isPaketler_empityArrayCounts > 0 ? "#d4edda" : "white", cursor: "pointer", justifyContent: "center" }}>
                        {onePoz.isPaketler_empityArrayCounts || ""}
                      </Box>

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor: onePoz.isPaketler_mukerrerArrayCounts > 0 ? "#f8d7da" : "white", cursor: "pointer", justifyContent: "center" }}>
                        {onePoz.isPaketler_mukerrerArrayCounts || ""}
                      </Box>

                      {/* POZ - İŞ PAKETLERİ */}
                      {maxIsPaketCount > 0 && (() => {
                        // const dugumlerPoz = dataIsPaketPozlar?.pozlar?.find(p => p._id.toString() === onePoz._id.toString())
                        return (
                          <>
                            <Box />
                            {Array.from({ length: maxIsPaketCount }, (_, i) => {
                              const isPaket = onePoz?.isPaketler?.[i]
                              const name = selectedProje.isPaketler.find(p => p._id.toString() === isPaket?._id.toString())?.name || ""
                              const tooltipKey = `${onePoz._id}-${i}`
                              return (
                                <Tooltip
                                  key={tooltipKey}
                                  title={name}
                                  placement="top"
                                  open={openTooltip === tooltipKey}
                                  disableHoverListener
                                  disableFocusListener
                                  disableTouchListener
                                >
                                  <Box
                                    {...rowHandlers}
                                    onMouseEnter={() => { rowHandlers.onMouseEnter(); if (name) handleTooltipEnterOrMove(tooltipKey) }}
                                    onMouseMove={() => { if (name) handleTooltipEnterOrMove(tooltipKey) }}
                                    onMouseLeave={() => { rowHandlers.onMouseLeave(); handleTooltipLeave() }}
                                    sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                                  >
                                    <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                      {name}
                                    </Box>
                                  </Box>
                                </Tooltip>
                              )
                            })}
                          </>
                        )
                      })()}

                      {/* <Box sx={{ ...pozNo_css, justifyContent: "end" }}>
                        {ikiHane(onePoz?.metrajOnaylanan)}
                      </Box> */}


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



