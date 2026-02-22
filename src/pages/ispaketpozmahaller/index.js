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
import Tooltip from '@mui/material/Tooltip';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import CircleIcon from '@mui/icons-material/Circle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';


export default function P_IsPaketPozMahaller() {

  const queryClient = useQueryClient()

  const { appUser, setAppUser, myTema } = useContext(StoreContext)
  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedProje, selectedIsPaketVersiyon, selectedIsPaket, selectedPoz } = useContext(StoreContext)
  const { mode_isPaketEdit } = useContext(StoreContext)


  const [showEminMisin, setShowEminMisin] = useState(false)


  const [dialogAlert, setDialogAlert] = useState()


  const [show, setShow] = useState("Main")
  const [isChanged, setIsChanged] = useState()


  const [isChange_select, setIsChange_select] = useState(false)
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState()
  const [anySelectable, setAnySelectable] = useState()

  const [mahaller_state, setMahaller_state] = useState()

  const [lbsMetrajlar, setLbsMetrajlar] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller()
  const { data: dataDugumler_byPoz, error: error2, isFetching: isFetching2 } = useGetDugumler_byPoz()

  // Guard: Redirect back to parent page if context values are not loaded (e.g., on page reload)
  useEffect(() => {
    if (!selectedProje || !selectedPoz || !selectedIsPaket || !selectedIsPaketVersiyon) {
      navigate('/ispaketpozlar')
    }
  }, [selectedProje, selectedPoz, selectedIsPaket, selectedIsPaketVersiyon, navigate])

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  // const mahaller = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    // Guard: Only proceed if we have all required context values
    if (!selectedProje || !selectedPoz || !selectedIsPaket || !selectedIsPaketVersiyon) {
      return
    }

    setMahaller_state(_.cloneDeep(dataMahaller?.mahaller))
    setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz))
    // console.log("dataDugumler_byPoz?.dugumler_byPoz", dataDugumler_byPoz?.dugumler_byPoz)
    return () => {
      setMahaller_state()
    }
  }, [dataMahaller, dataDugumler_byPoz, selectedProje, selectedPoz, selectedIsPaket, selectedIsPaketVersiyon])


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




  const handleDugumToggle = ({ dugum, toggleValue }) => {

    let dugumler_byPoz_state2 = _.cloneDeep(dugumler_byPoz_state)

    dugumler_byPoz_state2 = dugumler_byPoz_state2.map(oneDugum2 => {

      if (oneDugum2._id.toString() === dugum._id.toString()) {

        // Ensure isPaketler is always an array
        const currentPaketler = Array.isArray(oneDugum2.isPaketler) ? oneDugum2.isPaketler : []
        
        // Check if selectedIsPaket is already in the array
        const alreadySelected = currentPaketler.find(x => x._id.toString() === selectedIsPaket._id.toString())

        if (toggleValue && !alreadySelected) {
          // TRUE: Add selectedIsPaket to isPaketler array
          oneDugum2.isPaketler = [...currentPaketler, { _id: selectedIsPaket._id }]
          oneDugum2.newSelected = true
          oneDugum2.newSelectedValue = true
        } else if (!toggleValue && alreadySelected) {
          // FALSE: Remove selectedIsPaket from isPaketler array
          oneDugum2.isPaketler = currentPaketler.filter(x => x._id.toString() !== selectedIsPaket._id.toString())
          oneDugum2.newSelected = true
          oneDugum2.newSelectedValue = false
        }
      }

      return oneDugum2

    })

    setIsChanged(true)
    // console.log("dugumler_byPoz_state2", dugumler_byPoz_state2)
    setDugumler_byPoz_state(dugumler_byPoz_state2)

  }



  const cancelChange = () => {
    setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz))
    setIsChanged(false)
  }


  const saveChange = async () => {

    try {

      const dugumler = dugumler_byPoz_state.filter(x => x.newSelected)

      // const result = await RealmApp.currentUser.callFunction("updateDugumler_openMetraj", { functionName: "mahaller_byPozId", _projeId: selectedProje._id, mahaller, _pozId: selectedPoz._id });

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/dugumler/ispaketler`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedIsPaket,
          dugumler
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

      if (responseJson.ok) {
        queryClient.invalidateQueries(['dataDugumler_byPoz'])
        setIsChanged()
      } else {
        console.log("result", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


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

  // console.log("selectedProje?.paraBirimleri", selectedProje?.paraBirimleri)
  // console.log("paraBirimiAdet", paraBirimiAdet)


  const gridTemplateColumns1 = `
    max-content
    minmax(min-content, 15rem)
    max-content
  `

  // console.log("paraBirimiAdet",paraBirimiAdet)

  let ayracRenk_siyah = "black"
  let ayracRenk_bordo = "rgba(194, 18, 18, 0.67)"
  let color_selectedThis = "rgba(98, 210, 96, 0.22)"
  let color_selectedOther = "rgba(0, 0, 0, 0.18)"
  let color_selectedMany = "rgb(194, 18, 18)"


  let isPaketSelectedPozMetraj = 0

  if (selectedIsPaketVersiyon !== undefined && selectedIsPaket && dugumler_byPoz_state) {
    if (selectedIsPaketVersiyon === 0 || typeof selectedIsPaketVersiyon === 'number') {
      isPaketSelectedPozMetraj = dugumler_byPoz_state
        ?.filter(oneDugum => oneDugum.isPaketler?.find(onePaket => onePaket?._id.toString() === selectedIsPaket._id.toString())
        ).reduce((accumulator, oneDugum) => oneDugum.metrajOnaylanan ? accumulator + oneDugum.metrajOnaylanan : accumulator, 0)
    } else if (selectedIsPaketVersiyon?.versiyon !== undefined) {
      isPaketSelectedPozMetraj = dugumler_byPoz_state
        ?.filter(dugum => {
          const versiyonData = dugum.isPaketVersiyonlar?.find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon.versiyon)
          return versiyonData?.isPaketler?.find(onePaket => onePaket?._id.toString() === selectedIsPaket._id.toString())
        }).reduce((accumulator, oneDugum) => oneDugum.metrajOnaylanan ? accumulator + oneDugum.metrajOnaylanan : accumulator, 0)
    }
  }


  return (

    <Box sx={{ m: "0rem" }}>

      {!selectedProje || !selectedPoz || !selectedIsPaket || !selectedIsPaketVersiyon ? (
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
            cancelChange()
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
                  onClick={() => navigate('/ispaketpozlar')} disabled={false}>
                  <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>

                <Box>
                  (V{selectedIsPaketVersiyon?.versiyonNumber}) - {selectedIsPaket?.name}
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
                        onClick={() => setShowEminMisin(true)}
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
              {selectedPoz.pozName}
            </Box>

            <Box sx={{ ...css_enUstBaslik, ...css_thirdCol }}>
              İş Paket
            </Box>

          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI */}
          <>
            <Box sx={{ ...css_enUstBaslik }}></Box>

            <Box sx={{ ...css_enUstBaslik }}>
            </Box>

            <Box sx={{ ...css_enUstBaslik, ...css_thirdCol }}>
            </Box>

          </>


          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            // console.log("oneLbs", oneLbs)
            // console.log("mahaller_state", mahaller_state)

            const mahaller_byLbs = mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            if (!mahaller_byLbs?.length > 0) {
              return
            }

            const lbsMetraj = dataDugumler_byPoz?.lbsMetrajlar?.find(x => x._id.toString() === oneLbs._id.toString())

            let lbsMetrajSecili = 0
            if (selectedIsPaketVersiyon === 0) {
              lbsMetrajSecili = dugumler_byPoz_state
                ?.filter(x => mahaller_byLbs.find(y => y._id.toString() === x._mahalId.toString()))
                ?.filter(oneDugum => oneDugum.isPaketler?.find(onePaket => onePaket._id.toString() === selectedIsPaket._id.toString())
                ).reduce((accumulator, oneDugum) => oneDugum.metrajOnaylanan ? accumulator + oneDugum.metrajOnaylanan : accumulator, 0)
            } else if (selectedIsPaketVersiyon?.versiyon !== undefined) {
              lbsMetrajSecili = dugumler_byPoz_state
                ?.filter(x => mahaller_byLbs.find(y => y._id.toString() === x._mahalId.toString()))
                ?.filter(oneDugum => {
                  const versiyonData = oneDugum.isPaketVersiyonlar?.find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon.versiyon)
                  return versiyonData?.isPaketler?.find(onePaket => onePaket._id.toString() === selectedIsPaket._id.toString())
                }).reduce((accumulator, oneDugum) => oneDugum.metrajOnaylanan ? accumulator + oneDugum.metrajOnaylanan : accumulator, 0)
            }


            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black" }}>
                  {getLbsName(oneLbs).name}
                </Box>

                <Box sx={{ ...css_LbsBaslik }}>
                </Box>

                <Box sx={{ ...css_LbsBaslik, ...css_thirdCol }}>
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

                  let isSelectedThis = dugum?.isPaketler?.find(onePaket => onePaket._id.toString() === selectedIsPaket._id.toString())

                  // When in paket-edit mode, determine "other" selection from the raw dugum.isPaketler
                  // so items that belong to other paketler (but not the selected one) appear grey.
                  let isSelectedOther = dugum?.isPaketler?.filter(onePaket => onePaket._id.toString() !== selectedIsPaket._id.toString()).length > 0

                  let tip1_backgroundColor = isSelectedThis ? color_selectedThis : isSelectedOther ? color_selectedOther : "white"


                  return (
                    <React.Fragment key={index}>

                      <Box onClick={() => handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: tip1_backgroundColor, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box onClick={() => handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: tip1_backgroundColor, cursor: "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1fr auto", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>

                        <Box sx={{ justifySelf: "start", display: "grid", gridAutoFlow: "column", alignItems: "center" }}>
                          <Box>
                            {oneMahal.mahalName}
                          </Box>
                          <Box className="childClass" sx={{ ml: "0.5rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                          </Box>
                        </Box>

                        <Box sx={{ display: isSelectedThis && isSelectedOther ? "grid" : "none", alignItems: "center" }}>
                          <ReportProblemIcon sx={{ color: ayracRenk_bordo, fontSize: "1rem" }} />
                        </Box>

                      </Box>

                      <Box onClick={() => handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: tip1_backgroundColor, cursor: "pointer", ...css_thirdCol }}>
                        {mode_isPaketEdit 
                          ? (dugum.isPaketler?.length || "")
                          : (isSelectedThis ? selectedIsPaket.name : "")
                        }
                      </Box>


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
    </Box >

  )

}

