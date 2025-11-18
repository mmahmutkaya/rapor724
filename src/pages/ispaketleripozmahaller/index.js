
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



export default function P_IsPaketleriPozMahaller() {

  const queryClient = useQueryClient()

  const { appUser, setAppUser, selectedProje, selectedPoz, myTema } = useContext(StoreContext)
  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { selectedIsPaketVersiyon, selectedIsPaketBaslik, selectedIsPaket } = useContext(StoreContext)


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

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller()
  const { data: dataGetDugumler_byPoz, error: error2, isFetching: isFetching2 } = useGetDugumler_byPoz()


  // const mahaller = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz && navigate('/ispaketleripozlar')
    !((selectedIsPaketVersiyon === 0 || selectedIsPaketVersiyon > 0) && selectedIsPaketBaslik && selectedIsPaket) && navigate('/ispaketleri')
    setMahaller_state(_.cloneDeep(dataMahaller?.mahaller))
    setDugumler_byPoz_state(_.cloneDeep(dataGetDugumler_byPoz?.dugumler_byPoz))
    return () => {
      setMahaller_state()
    }
  }, [dataGetDugumler_byPoz])


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

        oneDugum2.newSelected = true
        oneDugum2.newSelectedValue = toggleValue

        oneDugum2.isPaketVersiyonlar.map(oneVersiyon => {
          if (oneVersiyon.versiyon === selectedIsPaketVersiyon) {
            oneVersiyon.basliklar.map(oneBaslik => {
              if (oneBaslik._id.toString() === selectedIsPaketBaslik._id.toString()) {
                oneBaslik.paketId = toggleValue ? selectedIsPaket._id : null
                return oneBaslik
              }
            })
            return oneVersiyon
          }
        })
      }

      return oneDugum2

    })

    setIsChanged(true)
    setDugumler_byPoz_state(dugumler_byPoz_state2)

  }



  const cancelChange = () => {
    setDugumler_byPoz_state(_.cloneDeep(dataGetDugumler_byPoz?.dugumler_byPoz))
    setIsChanged()
  }


  const saveChange = async () => {

    try {

      const dugumler = dugumler_byPoz_state.filter(x => x.newSelected)

      // const result = await RealmApp.currentUser.callFunction("updateDugumler_openMetraj", { functionName: "mahaller_byPozId", _projeId: selectedProje._id, mahaller, _pozId: selectedPoz._id });

      const response = await fetch(`/api/dugumler/ispaketleri`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedIsPaketVersiyon,
          selectedIsPaketBaslik,
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
        queryClient.invalidateQueries(['dataMahalListesi_byPoz'])
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
          setDugumler_byPoz_state(_.cloneDeep(dataGetDugumler_byPoz?.dugumler_byPoz))
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
    borderLeft: "none",
    py: "0.05rem",
    px: "0.5rem",
    justifyContent: "start",
    alignItems: "center",
    backgroundColor: "#415a77",
    color: "#e0e1dd"
  }

  const css_LbsBaslik = {
    border: "1px solid black", borderLeft: "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "start", backgroundColor: myTema.renkler.metrajOnaylananBaslik
  }

  const css_mahaller = {
    border: "1px solid black", px: "0.5rem", display: "grid", justifyContent: "start", alignItems: "center"
  }

  let paraBirimiAdet = selectedProje?.paraBirimleri?.filter(x => x?.isActive).length

  // console.log("selectedProje?.paraBirimleri", selectedProje?.paraBirimleri)
  // console.log("paraBirimiAdet", paraBirimiAdet)

  
  const gridTemplateColumns1 = `
    max-content
    minmax(min-content, 30rem)
    0.5rem
    max-content
    0.3rem
    max-content
    ${paraBirimiAdet === 1 ? " 0.5rem max-content" : paraBirimiAdet > 1 ? " 0.5rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
    ${paraBirimiAdet === 1 ? " 0.5rem max-content" : paraBirimiAdet > 1 ? " 0.5rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
    ${paraBirimiAdet === 1 ? " 0.3rem max-content" : paraBirimiAdet > 1 ? " 0.3rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
  `

  let ayracRengi = "rgba(194, 18, 18, 0.67)"

  let selectedPozVersiyonPaketMetraj = dugumler_byPoz_state
    ?.filter(dugum =>
      dugum.isPaketVersiyonlar
        .find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon).basliklar
        .find(oneBaslik => oneBaslik._id.toString() === selectedIsPaketBaslik._id.toString())
        .paketId === selectedIsPaket._id.toString()
    ).reduce((accumulator, oneDugum) => accumulator + oneDugum.metrajOnaylanan, 0)


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

            {/* sol kısım (başlık) */}
            <Grid item xs>
              <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "start", columnGap: "0.5rem" }}>

                <IconButton
                  sx={{ mx: 0, px: 0 }}
                  onClick={() => navigate('/ispaketleripozlar')} disabled={false}>
                  <ReplyIcon variant="contained" sx={{ color: "gray" }} />
                </IconButton>

                <Box sx={{ fontSize: "1rem" }}>
                  (V{selectedIsPaketVersiyon}) - {selectedIsPaketBaslik?.name} / {selectedIsPaket?.name}
                </Box>

              </Box>
            </Grid>

            {/* sağ kısım - (tuşlar)*/}
            <Grid item xs="auto">
              <Grid container>

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

          {/* EN ÜST BAŞLIĞIN ÜST SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>

            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "start" }}>
              {selectedPoz.pozNo}
            </Box>

            <Box sx={{ ...css_enUstBaslik }}>
              {selectedPoz.pozName}
            </Box>

            <Box>
            </Box>

            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Miktar
            </Box>

            <Box sx={{ backgroundColor: ayracRengi }}>
            </Box>

            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              İş Paketi
            </Box>

            {paraBirimiAdet > 0 &&
              <>
                <Box></Box>

                <Box sx={{ ...css_enUstBaslik, gridColumn: `span ${paraBirimiAdet}` }}>
                  Birim Fiyat
                </Box>

              </>
            }

            {paraBirimiAdet > 0 &&
              <>
                <Box></Box>

                <Box sx={{ ...css_enUstBaslik, gridColumn: `span ${paraBirimiAdet}`, justifyContent: "center" }}>
                  İş Sonu Tutar
                </Box>

              </>
            }

            {paraBirimiAdet > 0 &&
              <>
                <Box sx={{ backgroundColor: ayracRengi }}></Box>

                <Box sx={{ ...css_enUstBaslik, gridColumn: `span ${paraBirimiAdet}`, justifyContent: "center" }}>
                  İş Paket Tutar
                </Box>

              </>
            }

          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", gridColumn: "1/3", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>

            <Box>
            </Box>

            <Box sx={{ ...css_enUstBaslik, justifyContent: "end" }}>
              {ikiHane(selectedPoz?.metrajOnaylanan)} {selectedPoz?.metrajOnaylanan > 0 && pozBirim}
            </Box>

            <Box sx={{ backgroundColor: ayracRengi }}>
            </Box>

            <Box sx={{ ...css_enUstBaslik, justifyContent: "end" }}>
              {ikiHane(selectedPozVersiyonPaketMetraj)} {selectedPozVersiyonPaketMetraj > 0 && pozBirim}
            </Box>

            {paraBirimiAdet > 0 &&
              <>
                <Box></Box>
                {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik }}>
                      {oneBirim.id}
                    </Box>
                  )
                })}
              </>
            }

            {paraBirimiAdet > 0 &&
              <>
                <Box></Box>
                {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik }}>
                      {oneBirim.id}
                    </Box>
                  )
                })}
              </>
            }

            {paraBirimiAdet > 0 &&
              <>
                <Box sx={{ backgroundColor: ayracRengi }}></Box>
                {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik }}>
                      {oneBirim.id}
                    </Box>
                  )
                })}
              </>
            }

          </>


          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            // console.log("oneLbs", oneLbs)
            // console.log("mahaller_state", mahaller_state)

            const mahaller_byLbs = mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            if (!mahaller_byLbs?.length > 0) {
              return
            }

            const lbsMetraj = dataGetDugumler_byPoz?.lbsMetrajlar?.find(x => x._id.toString() === oneLbs._id.toString())
            const lbsMetrajSecili = dugumler_byPoz_state
              ?.filter(x => mahaller_byLbs.find(y => y._id.toString() === x._mahalId.toString()))
              ?.filter(dugum =>
                dugum.isPaketVersiyonlar
                  .find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon).basliklar
                  .find(oneBaslik => oneBaslik._id.toString() === selectedIsPaketBaslik._id.toString()).isPaketleri
                  ?.paketId === selectedIsPaket._id.toString()
              ).reduce((accumulator, oneDugum) => accumulator + oneDugum.metrajOnaylanan, 0)


            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}>
                  {getLbsName(oneLbs).name}
                </Box>

                <Box>
                </Box>

                <Box sx={{ ...css_LbsBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(lbsMetraj?.metrajOnaylanan)} {lbsMetraj?.metrajOnaylanan > 0 && pozBirim}
                </Box>

                <Box sx={{ ...css_LbsBaslik, backgroundColor: ayracRengi }}>
                </Box>

                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>
                  {ikiHane(lbsMetrajSecili)} {lbsMetrajSecili > 0 && pozBirim}
                </Box>

                {paraBirimiAdet > 0 &&
                  <>
                    <Box></Box>
                    {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                      return (
                        <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: index === 0 && "1px solid black" }}>
                          {oneBirim.id}
                        </Box>
                      )
                    })}
                  </>
                }

                {paraBirimiAdet > 0 &&
                  <>
                    <Box></Box>
                    {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                      return (
                        <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: index === 0 && "1px solid black" }}>
                          {oneBirim.id}
                        </Box>
                      )
                    })}
                  </>
                }

                {paraBirimiAdet > 0 &&
                  <>
                    <Box sx={{ ...css_LbsBaslik, backgroundColor: ayracRengi }}></Box>
                    {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                      return (
                        <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: index === 0 && "1px solid black" }}>
                          {oneBirim.id}
                        </Box>
                      )
                    })}
                  </>
                }

                {/* MAHAL SATIRLARI */}
                {mahaller_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString())
                  if (!dugum) {
                    return
                  }

                  let paketId = dugum.isPaketVersiyonlar
                    .find(oneVersiyon => oneVersiyon.versiyon === selectedIsPaketVersiyon).basliklar
                    .find(oneBaslik => oneBaslik._id.toString() === selectedIsPaketBaslik._id.toString()).paketId

                  let isSelectable = !paketId
                  let isSelectedOther = paketId && paketId.toString() !== selectedIsPaket._id.toString()
                  let isSelectedThis = paketId && paketId.toString() === selectedIsPaket._id.toString()

                  let selectedThisPaketColor = "rgba(98, 210, 96, 0.44)"


                  return (
                    <React.Fragment key={index}>

                      <Box onClick={() => !isSelectedOther && handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: isSelectedOther ? "lightgray" : isSelectedThis && selectedThisPaketColor, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box onClick={() => !isSelectedOther && handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: isSelectedOther ? "lightgray" : isSelectedThis && selectedThisPaketColor, cursor: !isSelectedOther && "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1fr 1rem", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box sx={{ justifySelf: "start" }}>
                          {oneMahal.mahalName}
                        </Box>
                        <Box className="childClass" sx={{ display: isSelectedOther && "none", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                      </Box>

                      <Box>
                      </Box>

                      <Box onClick={() => !isSelectedOther && handleDugumToggle({ dugum, toggleValue: !isSelectedThis, dugum })} sx={{ ...css_mahaller, backgroundColor: isSelectedOther ? "lightgray" : isSelectedThis && selectedThisPaketColor, justifyContent: "end" }}>
                        {dugum?.metrajOnaylanan && ikiHane(dugum?.metrajOnaylanan)} {dugum?.metrajOnaylanan && pozBirim}
                      </Box>

                      <Box sx={{ backgroundColor: ayracRengi }}>
                      </Box>

                      <Box onClick={() => !isSelectedOther && handleDugumToggle({ dugum, toggleValue: !isSelectedThis })} sx={{ ...css_mahaller, backgroundColor: isSelectedOther ? "lightgray" : isSelectedThis && selectedThisPaketColor, justifyContent: "end" }}>
                        {isSelectedThis && dugum?.metrajOnaylanan && ikiHane(dugum?.metrajOnaylanan)} {isSelectedThis && dugum?.metrajOnaylanan && pozBirim}
                      </Box>

                      {paraBirimiAdet > 0 &&
                        <>
                          <Box></Box>
                          {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                            return (
                              <Box key={index} sx={{ ...css_mahaller }}>
                                {ikiHane(selectedPoz?.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat)}
                              </Box>
                            )
                          })}
                        </>
                      }

                      {paraBirimiAdet > 0 &&
                        <>
                          <Box></Box>
                          {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                            return (
                              <Box key={index} sx={{ ...css_mahaller }}>
                                {ikiHane(selectedPoz?.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat)}
                              </Box>
                            )
                          })}
                        </>
                      }

                      {paraBirimiAdet > 0 &&
                        <>
                          <Box sx={{ backgroundColor: ayracRengi }}></Box>
                          {selectedProje?.paraBirimleri?.filter(x => x.isActive).map((oneBirim, index) => {
                            return (
                              <Box key={index} sx={{ ...css_mahaller }}>
                                {ikiHane(selectedPoz?.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat)}
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
          })
          }

        </Box >

      }
    </Box >

  )

}

