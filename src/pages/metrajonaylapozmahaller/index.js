
import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useQuery, useQueryClient } from '@tanstack/react-query'

import _ from 'lodash';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import HeaderMetrajOnaylaPozMahaller from '../../components/HeaderMetrajOnaylaPozMahaller'


import { useGetPozlar, useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

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


export default function P_MetrajOnaylaPozMahaller() {

  const queryClient = useQueryClient()

  const { appUser, setAppUser, myTema } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const { selectedProje, selectedPoz } = useContext(StoreContext)
  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)

  const yetkililer = selectedProje?.yetkiliKisiler

  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal_metraj, setSelectedMahal_metraj } = useContext(StoreContext)


  let editNodeMetraj = false
  let onayNodeMetraj = true

  // useEffect(() => {
  //   setShowMetrajYapabilenler(RealmApp.currentUser.customData.customSettings.showMetrajYapabilenler)
  // }, [])




  const [show, setShow] = useState("Main")

  const [mode_select, setMode_select] = useState(false)
  const [isChange_select, setIsChange_select] = useState(false)
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState()
  const [dugumler_byPoz_backUp, setDugumler_byPoz_backup] = useState()
  const [anySelectable, setAnySelectable] = useState()



  const [lbsMetrajlar, setLbsMetrajlar] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  const { data: dataMahaller, error: error1, isFetching: isLoading1 } = useGetMahaller()
  const { data: dataMahalListesi_byPoz, error: error2, isFetching: isLoading2 } = useGetDugumler_byPoz()


  const mahaller_byPoz = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz && navigate('/metrajpozlar')
    setDugumler_byPoz_state(_.cloneDeep(dataMahalListesi_byPoz?.dugumler_byPoz))
    setDugumler_byPoz_backup(_.cloneDeep(dataMahalListesi_byPoz?.dugumler_byPoz))
    // console.log("dugumler_byPoz",dataMahalListesi_byPoz?.dugumler_byPoz)
    setLbsMetrajlar(_.cloneDeep(dataMahalListesi_byPoz?.lbsMetrajlar))
    setAnySelectable(dataMahalListesi_byPoz?.anySelectable)
    return () => {
      // setselectedPoz_metraj()
      // setDugumler_filtered()
    }
  }, [dataMahalListesi_byPoz])


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
    .filter(oneLbs => mahaller_byPoz?.find(oneMahal => oneMahal._lbsId.toString() === oneLbs._id.toString()))
    .sort(function (a, b) {
      var nums1 = a.code.split(".");
      var nums2 = b.code.split(".");

      for (var i = 0; i < nums1.length; i++) {
        if (nums2[i]) {
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







  //  SELECTED FULL - FONKSİYONLARI - ADD - REMOVE - CANCEL - SAVE

  const addNodes_select = ({ tip, mahaller, mahal, userEmail }) => {

    let dugumler_byPoz_state2 = _.cloneDeep(dugumler_byPoz_state)


    if (tip === "all") {


      // içinde seçilmemiş varsa hepsini seçiçez - önce bir tarayalım
      let isAllSelected = true
      outerLoop: for (let i = 0; i < dugumler_byPoz_state2.length; i++) {
        let oneDugum = dugumler_byPoz_state2[i]
        for (let j = 0; j < oneDugum?.hazirlananMetrajlar.length; j++) {
          let oneHazirlanan = oneDugum?.hazirlananMetrajlar[j]
          if (!(oneHazirlanan?.userEmail === userEmail && oneHazirlanan?.hasUnSelected)) {
            continue
          }
          if (!oneHazirlanan.hasSelectedFull_aday) {
            isAllSelected = false
            break outerLoop; // Exits both loops
          }
        }
      }


      if (!isAllSelected) {

        dugumler_byPoz_state2 = dugumler_byPoz_state2?.map(oneDugum => {
          oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
            if (oneHazirlanan.userEmail === userEmail && oneHazirlanan.hasUnSelected) {
              oneHazirlanan.hasSelectedFull_aday = true
            }
            return oneHazirlanan
          })
          return oneDugum
        })

      } else {

        dugumler_byPoz_state2 = dugumler_byPoz_state2?.map(oneDugum => {
          oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
            if (oneHazirlanan.userEmail === userEmail && oneHazirlanan.hasSelectedFull_aday) {
              delete oneHazirlanan.hasSelectedFull_aday
            }
            return oneHazirlanan
          })
          return oneDugum
        })

      }

    }


    if (tip === "mahaller_byPoz_byLbs") {


      // içinde seçilmemiş varsa hepsini seçiçez - önce bir tarayalım
      let isAllSelected = true
      outerLoop: for (let i = 0; i < dugumler_byPoz_state2.length; i++) {
        let oneDugum = dugumler_byPoz_state2[i]
        if (!mahaller.find(x => x._id.toString() === oneDugum._mahalId.toString())) {
          continue
        }
        for (let j = 0; j < oneDugum?.hazirlananMetrajlar.length; j++) {
          let oneHazirlanan = oneDugum?.hazirlananMetrajlar[j]
          if (!(oneHazirlanan?.userEmail === userEmail && oneHazirlanan?.hasUnSelected)) {
            continue
          }
          if (!oneHazirlanan.hasSelectedFull_aday) {
            isAllSelected = false
            break outerLoop; // Exits both loops
          }
        }
      }


      if (!isAllSelected) {

        dugumler_byPoz_state2 = dugumler_byPoz_state2?.map(oneDugum => {
          if (!mahaller.find(x => x._id.toString() === oneDugum._mahalId.toString())) {
            return oneDugum
          }
          oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
            if (oneHazirlanan.userEmail === userEmail && oneHazirlanan.hasUnSelected) {
              oneHazirlanan.hasSelectedFull_aday = true
            }
            return oneHazirlanan
          })
          return oneDugum
        })

      } else {

        dugumler_byPoz_state2 = dugumler_byPoz_state2?.map(oneDugum => {
          if (!mahaller.find(x => x._id.toString() === oneDugum._mahalId.toString())) {
            return oneDugum
          }
          oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
            if (oneHazirlanan.userEmail === userEmail && oneHazirlanan.hasSelectedFull_aday) {
              delete oneHazirlanan.hasSelectedFull_aday
            }
            return oneHazirlanan
          })
          return oneDugum
        })

      }

    }


    if (tip === "mahal") {

      dugumler_byPoz_state2 = dugumler_byPoz_state2?.map(oneDugum => {
        if (mahal?._id?.toString() !== oneDugum?._mahalId?.toString()) {
          return oneDugum
        }
        oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
          if (!(oneHazirlanan.userEmail === userEmail && oneHazirlanan.hasUnSelected)) {
            return oneHazirlanan
          }
          if (!oneHazirlanan.hasSelectedFull_aday) {
            oneHazirlanan.hasSelectedFull_aday = true
          } else {
            delete oneHazirlanan.hasSelectedFull_aday
          }
          return oneHazirlanan
        })
        return oneDugum
      })


    }

    setIsChange_select(false)
    outerLoop: for (let i = 0; i < dugumler_byPoz_state2.length; i++) {
      let oneDugum = dugumler_byPoz_state2[i]
      for (let j = 0; j < oneDugum.hazirlananMetrajlar.length; j++) {
        let oneHazirlanan = oneDugum.hazirlananMetrajlar[j]
        if (oneHazirlanan?.hasSelectedFull_aday) {
          setIsChange_select(true)
          break outerLoop; // Exits both loops
        }
      }
    }

    setDugumler_byPoz_state(dugumler_byPoz_state2)

  }


  const cancel_select = () => {
    setDugumler_byPoz_state(_.cloneDeep(dugumler_byPoz_backUp))
    setIsChange_select()
    setMode_select()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_select = async () => {

    if (isChange_select) {

      try {

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetrajlar_selectedFull", ({ dugumler_byPoz_state }))

        const response = await fetch(`/api/dugumler/updatehazirlananmetrajlarselectedfull`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dugumler_byPoz_state
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
          setShow("Main")
          setIsChange_select()
          setMode_select()
          queryClient.invalidateQueries(['dataMahalListesi_byPoz'])
        } else {
          throw new Error("Kayıt işleminde hata oluştu, sayfayı yenileyiniz, sorun devam ederse, Rapor7/24 ile iletişime geçiniz.")
        }

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setShow("Main")
            setIsChange_select()
            setMode_select()
            queryClient.invalidateQueries(['dataMahalListesi_byPoz'])
            setDialogAlert()
          }
        })

      }
    }

  }










  const goTo_MetrajOnaylaCetvel = ({ dugum, oneMahal }) => {
    setSelectedNode(dugum)
    setSelectedMahal_metraj(oneMahal)
    navigate('/metrajonaylacetvel')
  }




  const goTo_onayCetveli = ({ dugum, oneMahal, userEmail }) => {
    // console.log("userEmail", userEmail)
    setSelectedNode(dugum)
    setSelectedMahal_metraj(oneMahal)

    let showMetrajYapabilenler2 = _.cloneDeep(showMetrajYapabilenler)

    showMetrajYapabilenler2 = showMetrajYapabilenler2.map(oneYapabilen => {
      if (oneYapabilen.userEmail === userEmail) {
        oneYapabilen.isSelected = true
      } else {
        oneYapabilen.isSelected = false
      }
      return oneYapabilen
    })

    setShowMetrajYapabilenler(showMetrajYapabilenler2)

    navigate('/metrajonayla')
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

  const showMetrajYapabilenlerColumns = " 1rem repeat(" + showMetrajYapabilenler?.filter(x => x.isShow).length + ", max-content)"
  const gridTemplateColumns1 = `max-content minmax(min-content, 1fr) max-content max-content${showMetrajYapabilenler?.filter(x => x.isShow).length > 0 ? showMetrajYapabilenlerColumns : ""}`


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

      <Grid item >
        <HeaderMetrajOnaylaPozMahaller
          setShow={setShow}
          anySelectable={anySelectable}
          setMode_select={setMode_select} mode_select={mode_select}
          isChange_select={isChange_select} setIsChange_select={setIsChange_select} cancel_select={cancel_select} save_select={save_select}
        />
      </Grid>


      {/* BAŞLIK GÖSTER / GİZLE DIALOG PENCERESİ*/}
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }


      {(isLoading1 || isLoading2) &&
        <Box sx={{ width: '100%', px: "1rem", mt: "5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }

      {!(isLoading1 || isLoading2) && !openLbsArray?.length > 0 &&
        <Box>
          henüz herhangi bir LBS mahal eklemeye açılmamış
        </Box>
      }


      {!(isLoading1 || isLoading2) && openLbsArray?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: gridTemplateColumns1 }}>

          {/* EN ÜST BAŞLIĞIN ÜST SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>

            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "start" }}>
              {selectedPoz.pozNo}
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              {selectedPoz.pozName}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Miktar
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Birim
            </Box>

            {/* {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
                  {yetkililer?.find(oneYetkili => oneYetkili.userEmail === customData.email).userCode}
                </Box>
              </>
            } */}

            {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {
                  let yetkili = yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen.userEmail)
                  return (
                    // <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                    //   <Tooltip placement="top" title={yetkili.isim + " " + yetkili.soyisim}>
                    //     <Box>
                    //       {yetkili.userCode}
                    //     </Box>
                    //   </Tooltip>
                    // </Box>
                    <Box
                      key={index}
                      sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                      <Box sx={{ display: "grid", alignItems: "center", justifyItems: "center", fontSize: "0.75rem" }}>
                        <Box>
                          {yetkili.isim}
                        </Box>
                        <Box>
                          {yetkili.soyisim}
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </>
            }

          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", gridColumn: "1/3", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "end" }}>
              {ikiHane(dataMahalListesi_byPoz?.metrajOnaylanan)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirim}
            </Box>

            {/* {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(selectedPoz?.hazirlananMetrajlar?.find(x => x.userEmail === customData.email)?.metraj)}
                </Box>
              </>
            } */}

            {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {
                  return (
                    <Box
                      onClick={() => mode_select && addNodes_select({ tip: "all", userEmail: oneYapabilen.userEmail })}
                      key={index}
                      sx={{ ...css_enUstBaslik, cursor: mode_select && "pointer", borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(dataMahalListesi_byPoz?.hazirlananMetrajlar.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajReady)}
                    </Box>
                  )
                })}

              </>
            }
          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            const mahaller_byPoz_byLbs = mahaller_byPoz?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            const lbsMetraj = lbsMetrajlar.find(x => x._id.toString() === oneLbs._id.toString())

            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}>
                  {getLbsName(oneLbs).name}
                </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "end" }}>
                  {ikiHane(lbsMetraj?.metrajOnaylanan)}
                </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "center" }}> {pozBirim} </Box>

                {/* {editNodeMetraj &&
                  <>
                    <Box> </Box>
                    <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                      {"deneme"}
                    </Box>
                  </>
                } */}

                {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
                  <>
                    <Box> </Box>
                    {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {
                      return (
                        <Box
                          onClick={() => mode_select && addNodes_select({ tip: "mahaller_byPoz_byLbs", mahaller: mahaller_byPoz_byLbs, userEmail: oneYapabilen.userEmail })}
                          key={index}
                          sx={{ ...css_LbsBaslik, cursor: mode_select && "pointer", borderLeft: "1px solid black", justifyContent: "end" }}
                        >
                          {ikiHane(lbsMetraj?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen.userEmail).metrajReady)}
                        </Box>
                      )
                    })}
                  </>
                }


                {/* MAHAL SATIRLARI */}
                {mahaller_byPoz_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz_state?.find(oneDugum => oneDugum._pozId.toString() === selectedPoz._id.toString() && oneDugum._mahalId.toString() === oneMahal._id.toString())
                  if (!dugum) {
                    // console.log("olmayan dugum tespit edildi ve return oldu hata olmaması için")
                    return
                  }

                  let hasOnaylananMetraj = dugum?.hazirlananMetrajlar?.find(x => x.hasSelected)

                  return (
                    <React.Fragment key={index}>

                      <Box sx={{ ...css_mahaller, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box sx={{ ...css_mahaller }}>
                        {oneMahal.mahalName}
                      </Box>

                      <Box onClick={() => hasOnaylananMetraj && !mode_select && goTo_MetrajOnaylaCetvel({ dugum, oneMahal })} sx={{ ...css_mahaller, cursor: hasOnaylananMetraj && !mode_select && "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1rem 1fr", backgroundColor: !hasOnaylananMetraj ? "lightgray" : !mode_select && "rgba(255, 251, 0, 0.55)", "&:hover": hasOnaylananMetraj && !mode_select && { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ backgroundColor: !hasOnaylananMetraj ? "lightgray" : !mode_select && "rgba(255, 251, 0, 0.55)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(dugum?.metrajOnaylanan)}
                        </Box>
                      </Box>

                      <Box sx={{ ...css_mahaller, justifyContent: "center" }}>
                        {pozBirim}
                      </Box>

                      {/* {editNodeMetraj &&
                        <>
                          <Box />
                          <Box
                            onDoubleClick={() => goto_metrajOlusturCetvel(dugum, oneMahal)}
                            sx={{
                              ...css_mahaller,
                              display: "grid",
                              gridTemplateColumns: "1rem 1fr",
                              alignItems: "center",
                              justifyContent: "end",
                              cursor: "pointer",
                              backgroundColor: "yellow",
                              "&:hover": { "& .childClass": { backgroundColor: "red" } }
                            }}>
                            <Box className="childClass" sx={{ backgroundColor: "yellow", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === customData.email)?.metraj)}
                            </Box>
                          </Box>
                        </>
                      } */}

                      {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&

                        <>
                          <Box> </Box>
                          {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {

                            let oneHazirlanan = dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen.userEmail)
                            // let hasReadyUnSeen = oneHazirlanan?.hasReadyUnSeen
                            // let hasSelected = oneHazirlanan?.hasSelected
                            let hasUnSelected = oneHazirlanan?.hasUnSelected
                            let metrajReady = oneHazirlanan?.metrajReady
                            let clickAble = oneHazirlanan?.hasReady || oneHazirlanan?.hasSelected || oneHazirlanan?.hasUnSelected
                            let allSelected = oneHazirlanan?.hasSelected && !oneHazirlanan?.hasUnSelected
                            let someSelected = oneHazirlanan?.hasSelected && oneHazirlanan?.hasUnSelected
                            let hasReadyUnSeen = oneHazirlanan?.hasReadyUnSeen
                            let hasSelectedFull_aday = oneHazirlanan?.hasSelectedFull_aday

                            return (

                              <Box
                                key={index}
                                // onClick={() =>
                                //   mode_select && hasUnSelected && !hasSelectedFull_aday ? addNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                //     mode_select && hasUnSelected && hasSelectedFull_aday ? removeNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                //       !mode_select && clickAble && goTo_onayCetveli({ dugum, oneMahal, userEmail: oneYapabilen.userEmail })
                                // }
                                onClick={() =>
                                  mode_select && hasUnSelected ? addNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                    !mode_select && clickAble && goTo_onayCetveli({ dugum, oneMahal, userEmail: oneYapabilen.userEmail })
                                }
                                sx={{
                                  ...css_mahaller,
                                  justifyContent: "end",
                                  cursor: clickAble && "pointer",
                                  // backgroundColor: !hasUnSelected ? "lightgray" : "rgba(255, 251, 0, 0.55)",
                                  backgroundColor: hasReadyUnSeen ? "rgba(255, 251, 0, 0.55)" : !clickAble && "lightgray",
                                  display: "grid",
                                  gridTemplateColumns: "1rem 1fr",
                                  "&:hover":
                                    !mode_select && clickAble ? { "& .childClass": { color: "red" } } :
                                      mode_select && hasUnSelected && { "& .childClass": { color: "red" } }
                                }}
                              >

                                {/* {!mode_select &&
                                  <Box
                                    className="childClass"
                                    sx={{
                                      // backgroundColor: !hasUnSelected ? "lightgray" : hasSelected ? "gray" : "rgba(255, 251, 0, 0.55)",
                                      backgroundColor: hasSelected && hasUnSelected && "gray",
                                      height: "0.5rem", width: "0.5rem",
                                      borderRadius: "50%"
                                    }}>
                                  </Box>
                                } */}


                                {/* metrajın solundaki ikon */}
                                {!hasSelectedFull_aday &&
                                  <Box sx={{ px: "0.5rem", display: "grid", alignItems: "center", justifyContent: "center" }}>

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

                                  </Box>
                                }

                                {mode_select && hasSelectedFull_aday &&
                                  <Box sx={{ display: "grid", alignItems: "center", justifyContent: "center" }}>
                                    <AddCircleIcon variant="contained" sx={{ mr: "0.3rem", fontSize: "0.80rem", color: "green" }} />
                                  </Box>
                                }

                                {/* {mode_select && hasSelected &&
                                  <Box sx={{ display: "grid", alignItems: "center", justifyContent: "center" }}>
                                    <CircleIcon variant="contained" sx={{ fontSize: "0.6rem", color: "gray", "&:hover": { color: "gray" } }} />
                                  </Box>
                                } */}
                                {/* {mode_select && hasReady && hasUnSelected && hasSelectedFull_aday &&
                                  <Box sx={{ display: "grid", alignItems: "center", justifyContent: "center" }}>
                                    <AddCircleIcon variant="contained" sx={{ fontSize: "0.90rem", color: "green", "&:hover": { color: "green" } }} />
                                  </Box>
                                } */}

                                <Box sx={{ justifySelf: "end" }}>
                                  {ikiHane(metrajReady)}
                                </Box>
                              </Box>
                              // <Box key={index} sx={{ ...css_mahaller, backgroundColor: "rgb(143,206,0,0.3)", borderLeft: "1px solid black", justifyContent: "end" }}>
                              //   {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen)?.metraj)}
                              // </Box>
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

