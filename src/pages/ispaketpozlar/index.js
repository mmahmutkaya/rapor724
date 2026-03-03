
import React from 'react'
import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import { StoreContext } from '../../components/store.js'
import { useGetIsPaketPozlar } from '../../hooks/useMongo.js';
import getWbsName from '../../functions/getWbsName.js';
import { DialogAlert } from '../../components/general/DialogAlert.js';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import LinearProgress from '@mui/material/LinearProgress';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import Tooltip from '@mui/material/Tooltip';
import { Typography } from "@mui/material";




export default function P_isPaketPozlar() {

  const navigate = useNavigate()

  const { data: dataIsPaketPozlar, error: error2, isFetching: isFetching2 } = useGetIsPaketPozlar();

  const [dialogAlert, setDialogAlert] = useState()
  const [hoveredRow, setHoveredRow] = useState(null)
  const [openTooltip, setOpenTooltip] = useState(null)
  const tooltipTimerRef = useRef(null)

  const { myTema, drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedIsPaketVersiyon, setSelectedIsPaketVersiyon } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedIsPaket, mode_isPaketEdit, setMode_isPaketEdit } = useContext(StoreContext)

  useEffect(() => {
    if (selectedProje?.isPaketVersiyonlar?.length > 0 && !selectedIsPaketVersiyon) {
      const maxVersiyon = selectedProje.isPaketVersiyonlar.reduce((prev, current) =>
        (prev.versiyonNumber > current.versiyonNumber) ? prev : current
      )
      setSelectedIsPaketVersiyon(maxVersiyon)
    }
  }, [selectedProje, selectedIsPaketVersiyon, setSelectedIsPaketVersiyon])

  const wbsArray_state = selectedProje?.wbs?.filter(x => x.openForPoz === true)

  const pendingNavigationRef = useRef(null)

  useEffect(() => {
    setSelectedPoz(null)
  }, [])

  useEffect(() => {
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

  const maxIsPaketCount = dataIsPaketPozlar?.pozlar
    ? Math.max(0, ...dataIsPaketPozlar.pozlar.map(p => p.isPaketler?.length || 0))
    : 0

  const columns = `
    max-content
    minmax(min-content, 25rem)
    max-content
    0.5rem
    5.5rem
    ${maxIsPaketCount > 0 ? `0.5rem ${Array(maxIsPaketCount).fill('8rem').join(' ')}` : ''}
  `


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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.disabled",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "color 0.15s ease, font-weight 0.15s ease",
                    "&:hover": { color: "black", fontWeight: "bold" }
                  }}
                  onClick={() => navigate('/ispaketler')}
                >
                  İş Paketleri
                </Typography>
                <NavigateNextIcon sx={{ color: "text.disabled", fontSize: 22, mx: "0.1rem" }} />
                <Typography variant="h6" fontWeight="bold" sx={{ color: "black", whiteSpace: "nowrap" }}>
                  Pozlar
                </Typography>
              </Box>
            </Grid>


            {/* sağ kısım - (tuşlar)*/}
            <Grid item xs="auto">
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>

                {!mode_isPaketEdit &&
                  <IconButton
                    sx={{ width: 40, height: 40 }}
                    onClick={() => setMode_isPaketEdit(true)}>
                    <EditIcon color="success" sx={{ fontSize: 24 }} />
                  </IconButton>
                }

                {mode_isPaketEdit &&
                  <IconButton
                    sx={{ width: 40, height: 40 }}
                    onClick={() => setMode_isPaketEdit()}>
                    <ClearIcon sx={{ color: "red", fontSize: 24 }} />
                  </IconButton>
                }

                {!mode_isPaketEdit && selectedProje?.isPaketVersiyonlar?.length > 0 &&

                  <Select
                    size='small'
                    value={selectedIsPaketVersiyon?.versiyonNumber || ""}
                    onClose={() => {
                      setTimeout(() => {
                        document.activeElement.blur();
                      }, 0);
                    }}
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

                    {selectedProje?.isPaketVersiyonlar?.sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((oneVersiyon, index) => {
                      let versiyonNumber = oneVersiyon?.versiyonNumber
                      return (
                        <MenuItem
                          onClick={() => setSelectedIsPaketVersiyon(oneVersiyon)}
                          sx={{ fontSize: "0.75rem" }} key={index} value={versiyonNumber} > İP{versiyonNumber}
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


      {
        isFetching2 &&
        <Box sx={{ width: '100%', px: "1rem", mt: "3.5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {
        !isFetching2 && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {
        !isFetching2 && selectedProje?.wbs?.find(x => x.openForPoz === true) && !dataIsPaketPozlar?.pozlar?.length > 0 &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Herhangi bir mahal, herhangi bir poz ile henüz eşleştirilmemiş, 'mahallistesi' menüsüne gidiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {
        !isFetching2 && wbsArray_state?.length > 0 && dataIsPaketPozlar?.pozlar?.length > 0 &&

        <Box sx={{ p: "1rem", mt: "3.5rem", display: "grid", gridTemplateColumns: columns }}>

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
              Mahal
            </Box>

            {/* BAŞLIK - İŞ PAKETLERİ */}
            {maxIsPaketCount > 0 && (
              <>
                <Box />
                <Box sx={{ ...enUstBaslik_css, gridColumn: `span ${maxIsPaketCount}`, whiteSpace: "nowrap", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  İş Paketleri
                </Box>
              </>
            )}

          </>


          {/* EN ÜST BAŞLIK ALT SATIR - TOPLAM SATIRI */}
          <>

            <Box sx={{ ...enUstBaslik_css, gridColumn: "1/4", justifyItems: "start" }}>
            </Box>

            <Box />

            {(() => {
              const a = dataIsPaketPozlar?.pozlar?.reduce((sum, p) => sum + ((p.dugumler_totalCount || 0) - (p.isPaketler_empityArrayCounts || 0)), 0) || 0
              const b = dataIsPaketPozlar?.pozlar?.reduce((sum, p) => sum + (p.isPaketler_empityArrayCounts || 0), 0) || 0
              const total = dataIsPaketPozlar?.pozlar?.reduce((sum, p) => sum + (p.dugumler_totalCount || 0), 0) || 0
              return (
                <Box sx={{ ...enUstBaslik_css }}>
                  {total > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span>{a}</span>
                      {b > 0 && <span>{'\u202F/\u202F'}</span>}
                      {b > 0 && <Box component="span" sx={{ color: "#c0392b", fontWeight: 700 }}>{b}</Box>}
                    </Box>
                  )}
                </Box>
              )
            })()}

            {/* TOPLAM - İŞ PAKETLERİ */}
            {maxIsPaketCount > 0 && (
              <>
                <Box />
                {Array.from({ length: maxIsPaketCount }, (_, i) => (
                  <Box key={`ispaket-toplam-${i}`} sx={{ ...enUstBaslik_css }} />
                ))}
              </>
            )}

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

                  {(() => {
                    const wbsPozlar = dataIsPaketPozlar?.pozlar?.filter(p => p._wbsId.toString() === oneWbs._id.toString())
                    const a = wbsPozlar?.reduce((sum, p) => sum + ((p.dugumler_totalCount || 0) - (p.isPaketler_empityArrayCounts || 0)), 0) || 0
                    const b = wbsPozlar?.reduce((sum, p) => sum + (p.isPaketler_empityArrayCounts || 0), 0) || 0
                    const total = wbsPozlar?.reduce((sum, p) => sum + (p.dugumler_totalCount || 0), 0) || 0
                    return (
                      <Box sx={{ ...wbsBaslik_css2, justifyItems: "center" }}>
                        {total > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span>{a}</span>
                            {b > 0 && <span>{'\u202F/\u202F'}</span>}
                            {b > 0 && <Box component="span" sx={{ color: "#c0392b", fontWeight: 700 }}>{b}</Box>}
                          </Box>
                        )}
                      </Box>
                    )
                  })()}

                  {/* WBS - İŞ PAKETLERİ */}
                  {maxIsPaketCount > 0 && (
                    <>
                      <Box />
                      {Array.from({ length: maxIsPaketCount }, (_, i) => (
                        <Box key={`ispaket-wbs-${i}`} sx={{ ...wbsBaslik_css2 }} />
                      ))}
                    </>
                  )}

                </>


                {/* WBS'İN POZLARI */}
                {dataIsPaketPozlar?.pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  let pozBirim = selectedProje?.pozBirimleri.find(x => x.id == onePoz?.pozBirimId)?.name

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

                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...rowBaseSx, ...hoverSx, backgroundColor, cursor: "pointer", justifyContent: "center" }}>
                        {onePoz.dugumler_totalCount > 0 && (() => {
                          const va = (onePoz.dugumler_totalCount || 0) - (onePoz.isPaketler_empityArrayCounts || 0)
                          const vb = onePoz.isPaketler_empityArrayCounts || 0
                          return (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span>{va}</span>
                              {vb > 0 && <span>{'\u202F/\u202F'}</span>}
                              {vb > 0 && <Box component="span" sx={{ color: "#c0392b", fontWeight: 700 }}>{vb}</Box>}
                            </Box>
                          )
                        })()}
                      </Box>

                      {/* POZ - İŞ PAKETLERİ */}
                      {maxIsPaketCount > 0 && (() => {
                        return (
                          <>
                            <Box />
                            {Array.from({ length: maxIsPaketCount }, (_, i) => {
                              const isPaket = onePoz?.isPaketler?.[i]
                              const paketSource = mode_isPaketEdit
                                ? selectedProje.isPaketler
                                : (selectedIsPaketVersiyon?.isPaketler || selectedProje.isPaketler)
                              const name = paketSource.find(p => p._id.toString() === isPaket?._id.toString())?.name || ""
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


