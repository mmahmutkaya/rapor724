import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import { useApp } from "../../components/useApp.js";
import FormPozCreate from '../../components/FormPozCreate.js'
import EditPozBaslik from '../../components/EditPozBaslik.js'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate.js'
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import _ from 'lodash';


import { useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo.js';


// import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler.js'
// import HeaderMetrajPozMahaller from '../../components/HeaderMetrajPozMahaller.js'
// import HeaderMahalListesiPozMahaller from '../../components/HeaderMahalListesiPozMahaller.js'


import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Check } from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import MenuItem from '@mui/material/MenuItem';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';


export default function P_IsPaketPozMahaller() {

  const queryClient = useQueryClient()

  const { appUser, setAppUser, myTema } = useContext(StoreContext)
  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedProje, selectedPoz } = useContext(StoreContext)


  const [showEminMisin, setShowEminMisin] = useState(false)
  const [dialogConfirmAction, setDialogConfirmAction] = useState(null)

  const [dialogAlert, setDialogAlert] = useState()


  const [show, setShow] = useState("Main")
  const [isChanged, setIsChanged] = useState()


  const [isChange_select, setIsChange_select] = useState(false)
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState()
  const [anySelectable, setAnySelectable] = useState()

  const [mahaller_state, setMahaller_state] = useState()
  const [menuState, setMenuState] = useState({ anchorEl: null, dugumId: null })

  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller()
  const { data: dataDugumler_byPoz, error: error2, isFetching: isFetching2 } = useGetDugumler_byPoz()

  // Guard: Redirect back to parent page if context values are not loaded (e.g., on page reload)
  useEffect(() => {
    if (!selectedProje || !selectedPoz) {
      navigate('/ispaketpozlar')
    }
  }, [selectedProje, selectedPoz, navigate])

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  // const mahaller = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    // Guard: Only proceed if we have all required context values
    if (!selectedProje || !selectedPoz) {
      return
    }

    setMahaller_state(_.cloneDeep(dataMahaller?.mahaller))
    setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz))
    // console.log("dataDugumler_byPoz?.dugumler_byPoz", dataDugumler_byPoz?.dugumler_byPoz)
    return () => {
      setMahaller_state()
    }
  }, [dataMahaller, dataDugumler_byPoz, selectedProje, selectedPoz])


  useEffect(() => {
    if (error1) {
      console.log("error", error1)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error1?.message ? error1.message : null
      })
    }
    if (error2) {
      console.log("error", error2)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error2?.message ? error2.message : null
      })
    }
  }, [error1, error2]);



  const ikiHane = (value) => {
    if (!value) {
      return ""
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }

  let openLbsArray = selectedProje?.lbs
    .filter(oneLbs => oneLbs.openForMahal)
    .sort(function (a, b) {
      var nums1 = a.code.split(".");
      var nums2 = b.code.split(".");

      for (var i = 0; i < nums1.length; i++) {
        if (nums2[i]) { // assuming 5..2 is invalid
          if (nums1[i] !== nums2[i]) {
            return nums1[i] - nums2[i];
          } // else continue
        } else {
          return 1; // no second number in b
        }
      }
      return -1; // was missing case b.len > a.len
    })




  let getLbsName = (oneLbs) => {

    let cOunt = oneLbs.code.split(".").length
    let name
    let code

    oneLbs.code.split(".").map((codePart, index) => {

      if (index == 0 && cOunt == 1) {
        code = codePart
        name = selectedProje?.lbs.find(item => item.code == code).name
      }

      if (index == 0 && cOunt !== 1) {
        code = codePart
        name = selectedProje?.lbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + selectedProje?.lbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + selectedProje?.lbs.find(item => item.code == code).name
      }

    })

    return { name, code }

  }




  const cancelChange = () => {
    setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz))
    setIsChanged(false)
  }


  const handleOpenMenu = (event, dugumId) => {
    setMenuState({ anchorEl: event.currentTarget, dugumId })
  }

  const handleCloseMenu = () => {
    setMenuState({ anchorEl: null, dugumId: null })
  }

  const handleAddIsPaket = (isPaketId) => {
    const dugumId = menuState.dugumId
    setDugumler_byPoz_state(prev => prev.map(d => {
      if (d._id.toString() === dugumId) {
        return { ...d, isPaketler: [{ _id: isPaketId }], newSelected: true }
      }
      return d
    }))
    setIsChanged(true)
    handleCloseMenu()
  }

  const handleRemoveIsPaket = (dugumId, isPaketId) => {
    setDugumler_byPoz_state(prev => prev.map(d => {
      if (d._id.toString() === dugumId) {
        const newIsPaketler = (d.isPaketler || []).filter(p => p._id.toString() !== isPaketId.toString())
        return { ...d, isPaketler: newIsPaketler, newSelected: true }
      }
      return d
    }))
    setIsChanged(true)
  }


  const handleBackClick = () => {
    if (isChanged) {
      setDialogConfirmAction(() => () => {
        cancelChange()
        navigate('/ispaketpozlar')
      })
      setShowEminMisin(true)
    } else {
      navigate('/ispaketpozlar')
    }
  }


  const saveChange = async () => {

    try {

      const originalDugumler = dataDugumler_byPoz?.dugumler_byPoz || []
      const changedDugumler = dugumler_byPoz_state.filter(x => x.newSelected)

      // Her değişen dugum için orijinal ile mevcut isPaketler farkını bul
      const changedIsPaketIds = new Set()
      changedDugumler.forEach(dugum => {
        const orig = originalDugumler.find(d => d._id.toString() === dugum._id.toString())
        const origIds = (orig?.isPaketler || []).map(ip => ip._id.toString())
        const currIds = (dugum.isPaketler || []).map(ip => ip._id.toString())
        currIds.filter(id => !origIds.includes(id)).forEach(id => changedIsPaketIds.add(id))
        origIds.filter(id => !currIds.includes(id)).forEach(id => changedIsPaketIds.add(id))
      })

      // Her eşsiz isPaket için bir API çağrısı yap
      for (const isPaketId of changedIsPaketIds) {
        const dugumlerForCall = changedDugumler.map(dugum => {
          const orig = originalDugumler.find(d => d._id.toString() === dugum._id.toString())
          const origIds = (orig?.isPaketler || []).map(ip => ip._id.toString())
          const currIds = (dugum.isPaketler || []).map(ip => ip._id.toString())
          const wasHere = origIds.includes(isPaketId)
          const isHere = currIds.includes(isPaketId)
          if (wasHere === isHere) return null
          return { _id: dugum._id, newSelectedValue: isHere }
        }).filter(Boolean)

        if (dugumlerForCall.length === 0) continue

        const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/dugumler/ispaketler`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            selectedIsPaket: { _id: isPaketId },
            dugumler: dugumlerForCall
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
          throw new Error(responseJson.error)
        }

        if (!responseJson.ok) {
          throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
        }
      }

      queryClient.invalidateQueries(['dataDugumler_byPoz'])
      setIsChanged()

    } catch (err) {

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz))
          setIsChanged()
          setDialogAlert()
        }
      })

    }
  }




  // CSS
  const css_enUstBaslik = {
    display: "grid",
    fontWeight: "600",
    border: "1px solid black",
    py: "0.05rem",
    px: "0.5rem",
    justifyContent: "start",
    alignItems: "center",
    backgroundColor: "#415a77",
    color: "#e0e1dd"
  }

  const css_LbsBaslik = {
    border: "1px solid black",
    borderRight: "1px solid black", // Restore right border for LBS header row
    mt: "1rem",
    px: "0.5rem",
    display: "grid",
    justifyContent: "start",
    backgroundColor: myTema.renkler.metrajOnaylananBaslik
  }

  const css_mahaller = {
    border: "1px solid black",
    borderTop: "1px solid black", // Ensure top border is visible
    borderRight: "1px solid black", // Ensure right border is visible
    px: "0.5rem",
    display: "grid",
    justifyContent: "start",
    alignItems: "center"
  }

  // used for centering content in third grid column
  const css_thirdCol = {
    justifyContent: "center",
    borderLeft: "1px solid black", // Ensure separation from column 2
    borderRight: "1px solid black",
    borderTop: "1px solid black",
    borderBottom: "1px solid black",
    paddingLeft: "1rem",
    marginLeft: "1rem"
  }

  let paraBirimiAdet = selectedProje?.paraBirimleri?.filter(x => x?.isActive).length

  const activeIsPaketler = selectedProje?.isPaketler || []

  const gridTemplateColumns1 = 'max-content minmax(min-content, 15rem) 1rem max-content'

  // console.log("paraBirimiAdet",paraBirimiAdet)


  return (

    <Box sx={{ m: "0rem" }}>

      {!selectedProje || !selectedPoz ? (
        null
      ) : (
        <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {showEminMisin &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin()}
          actionText2={"Onayla"}
          action2={() => {
            dialogConfirmAction?.()
            setShowEminMisin()
          }}
        />
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

            {/* left side (header) */}
            <Grid item xs>
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>

                <IconButton
                  sx={{ mx: 0, px: 0 }}
                  onClick={() => handleBackClick()} disabled={false}>
                  <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>

                <Box sx={{ fontWeight: "600", fontSize: "0.95rem" }}>
                  {selectedPoz.pozName}
                </Box>

              </Box>
            </Grid>

            {/* right side - (buttons)*/}
            <Grid item xs="auto">
              <Grid container spacing={1}>

                {isChanged &&
                  <>

                    <Grid item>
                      <IconButton
                        onClick={() => {
                          setDialogConfirmAction(() => () => cancelChange())
                          setShowEminMisin(true)
                        }}
                        disabled={!isChanged}
                      >
                        <ClearOutlined variant="contained" sx={{ color: "red" }} />
                      </IconButton>
                    </Grid>

                    <Grid item>
                      <IconButton
                        onClick={() => saveChange()}
                        disabled={!isChanged}
                      >
                        <FileDownloadDoneIcon variant="contained" sx={{ color: "green" }} />
                      </IconButton>
                    </Grid>

                  </>
                }

              </Grid>
            </Grid>

          </Grid>

        </AppBar>

      </Paper >


      {(isFetching1 || isFetching2) &&
        <Box sx={{ width: '100%', px: "1rem", mt: "5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }


      {!(isFetching1 || isFetching2) && !openLbsArray?.length > 0 &&
        <Box>
          Henüz herhangi bir başlık mahal eklemeye açılmamış
        </Box>
      }

      {!(isFetching1 || isFetching2) && !mahaller_state?.length > 0 &&
        <Box>
          Henüz herhangi bir mahal oluşturulmamış
        </Box>
      }


      {!(isFetching1 || isFetching2) && openLbsArray?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: gridTemplateColumns1 }}>

          {/* EN ÜST BAŞLIK */}
          <>

            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "start" }}>
              {selectedPoz.pozNo}
            </Box>

            <Box sx={{ ...css_enUstBaslik }}>
              MAHAL
            </Box>

            <Box />

            {activeIsPaketler.length > 0 && (
              <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "600",
                border: "1px solid black",
                py: "0.3rem",
                px: "0.5rem",
                backgroundColor: "#415a77",
                color: "#e0e1dd",
              }}>
                İŞ PAKETİ
              </Box>
            )}

          </>


          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            // console.log("oneLbs", oneLbs)
            // console.log("mahaller_state", mahaller_state)

            const mahaller_byLbs = mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            if (!mahaller_byLbs?.length > 0) {
              return
            }

            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black" }}>
                  {getLbsName(oneLbs).name}
                </Box>

                <Box sx={{ ...css_LbsBaslik }}>
                </Box>

                <Box />

                <Box sx={{ ...css_LbsBaslik }}>
                </Box>

                {/* MAHAL SATIRLARI */}
                {mahaller_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString())
                  if (!dugum) {
                    return
                  }

                  // let theMetraj = dugum.metrajOnaylanan

                  // const isPaketler = dugum.isPaketler || []

                  // let isPaketler = []
                  // if (selectedIsPaketVersiyon === 0) {
                  //   isPaketler = rawIsPaketler
                  // } else if (selectedIsPaketVersiyon?.versiyon !== undefined) {
                  //   const versiyonData = dugum.isPaketVersiyonlar?.find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon.versiyon)
                  //   isPaketler = versiyonData?.isPaketler || []
                  // }

                  return (
                    <React.Fragment key={index}>

                      <Box sx={{ ...css_mahaller, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box sx={{ ...css_mahaller }}>
                        {oneMahal.mahalName}
                      </Box>

                      <Box />

                      {(() => {
                        const isPaketRef = dugum.isPaketler?.[0]
                        const name = isPaketRef
                          ? activeIsPaketler.find(p => p._id.toString() === isPaketRef._id.toString())?.name || ""
                          : ""
                        return (
                          <Box
                            onClick={
                              isPaketRef
                                ? () => handleRemoveIsPaket(dugum._id.toString(), isPaketRef._id.toString())
                                : (e) => handleOpenMenu(e, dugum._id.toString())
                            }
                            sx={{
                              ...css_mahaller,
                              cursor: "pointer",
                              minWidth: "4rem",
                              ...(!isPaketRef && { backgroundColor: "#ffcdd2", display: "flex", justifyContent: "center", alignItems: "center" }),
                              ...(isPaketRef ? {
                                "&:hover": {
                                  backgroundColor: "#fde8e8",
                                  textDecoration: "line-through",
                                  color: "red"
                                }
                              } : {
                                "&:hover": {
                                  backgroundColor: "#e8f5e9",
                                },
                                "&:hover .add-icon": {
                                  opacity: 1,
                                  transform: "scale(1.15)"
                                }
                              })
                            }}
                          >
                            {name}
                            {!isPaketRef && (
                              <AddCircleOutlineIcon
                                className="add-icon"
                                sx={{
                                  fontSize: "1rem",
                                  color: "#388e3c",
                                  opacity: 0,
                                  transition: "opacity 0.18s ease, transform 0.18s ease",
                                  ml: "0.3rem",
                                  verticalAlign: "middle"
                                }}
                              />
                            )}
                          </Box>
                        )
                      })()}


                    </React.Fragment>
                  )
                })}

              </React.Fragment>
            )
          })
          }

        </Box >

      }

      </>
      )}

      <Popper
        open={Boolean(menuState.anchorEl)}
        anchorEl={menuState.anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <Paper elevation={8}>
          <ClickAwayListener onClickAway={handleCloseMenu}>
            <MenuList>
              {activeIsPaketler.map(p => (
                  <MenuItem key={p._id.toString()} onClick={() => handleAddIsPaket(p._id)}>
                    {p.name}
                  </MenuItem>
                ))
              }
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>

    </Box >

  )

}

