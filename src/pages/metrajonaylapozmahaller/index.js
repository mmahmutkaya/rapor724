
import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import _ from 'lodash';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import HeaderMetrajOnaylaPozMahaller from '../../components/HeaderMetrajOnaylaPozMahaller'


import { useGetPozlar, useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { BorderBottom, Check } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import CircleIcon from '@mui/icons-material/Circle';
import AddCircleIcon from '@mui/icons-material/AddCircle';


export default function P_MetrajOnaylaPozMahaller() {

  const { RealmApp, myTema } = useContext(StoreContext)

  const { selectedProje, selectedPoz_metraj } = useContext(StoreContext)
  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)

  const yetkililer = selectedProje?.yetki.yetkililer

  const { selectedNode_metraj, setSelectedNode_metraj } = useContext(StoreContext)
  const { selectedMahal_metraj, setSelectedMahal_metraj } = useContext(StoreContext)
  let editNodeMetraj = false
  let onayNodeMetraj = true

  const customData = RealmApp.currentUser.customData

  // useEffect(() => {
  //   setShowMetrajYapabilenler(RealmApp.currentUser.customData.customSettings.showMetrajYapabilenler)
  // }, [])



  const [show, setShow] = useState("Main")

  const [selectMode, setSelectMode] = useState(false)
  const [isChange_select, setIsChange_select] = useState(false)
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState()
  const [dugumler_byPoz_backUp, setDugumler_byPoz_backup] = useState()
  const [anySelectable, setAnySelectable] = useState()



  const [lbsMetrajlar, setLbsMetrajlar] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz_metraj?.pozBirimId)?.name


  const { data: mahaller } = useGetMahaller()
  const { data } = useGetDugumler_byPoz()


  const mahaller_byPoz = mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz_metraj && navigate('/metrajpozlar')
    setDugumler_byPoz_state(_.cloneDeep(data?.dugumler_byPoz))
    setDugumler_byPoz_backup(_.cloneDeep(data?.dugumler_byPoz))
    // console.log("dugumler_byPoz",data?.dugumler_byPoz)
    setLbsMetrajlar(_.cloneDeep(data?.lbsMetrajlar))
    setAnySelectable(data?.anySelectable)
    return () => {
      // setselectedPoz_metraj()
      // setDugumler_filtered()
    }
  }, [data])


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
    setSelectMode()
  }

  const save_select = () => {

    console.log("dugumler_byPoz_state", dugumler_byPoz_state)
    RealmApp?.currentUser.callFunction("update_hazirlananMetrajlar_selectedFull", ({}))

  }








  const goTo_MetrajOnaylaCetvel = ({ dugum, oneMahal }) => {
    setSelectedNode_metraj(dugum)
    setSelectedMahal_metraj(oneMahal)
    navigate('/metrajonaylacetvel')
  }




  const goTo_onayCetveli = ({ dugum, oneMahal, userEmail }) => {
    // console.log("userEmail", userEmail)
    setSelectedNode_metraj(dugum)
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

      <Grid item >
        <HeaderMetrajOnaylaPozMahaller
          setShow={setShow}
          anySelectable={anySelectable}
          setSelectMode={setSelectMode} selectMode={selectMode}
          isChange_select={isChange_select} setIsChange_select={setIsChange_select} cancel_select={cancel_select} save_select={save_select}
        />
      </Grid>


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }


      {!openLbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}


      {openLbsArray?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: gridTemplateColumns1 }}>

          {/* EN ÜST BAŞLIĞIN ÜST SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>

            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "start" }}>
              {selectedPoz_metraj.pozNo}
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              {selectedPoz_metraj.pozName}
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
              {ikiHane(selectedPoz_metraj?.metrajOnaylanan)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirim}
            </Box>

            {/* {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(selectedPoz_metraj?.hazirlananMetrajlar?.find(x => x.userEmail === customData.email)?.metraj)}
                </Box>
              </>
            } */}

            {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {
                  return (
                    <Box
                      onClick={() => selectMode && addNodes_select({ tip: "all", userEmail: oneYapabilen.userEmail })}
                      key={index}
                      sx={{ ...css_enUstBaslik, cursor: selectMode && "pointer", borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(selectedPoz_metraj.hazirlananMetrajlar.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajReady)}
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
                          onClick={() => selectMode && addNodes_select({ tip: "mahaller_byPoz_byLbs", mahaller: mahaller_byPoz_byLbs, userEmail: oneYapabilen.userEmail })}
                          key={index}
                          sx={{ ...css_LbsBaslik, cursor: selectMode && "pointer", borderLeft: "1px solid black", justifyContent: "end" }}
                        >
                          {ikiHane(lbsMetraj?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen.userEmail).metrajReady)}
                        </Box>
                      )
                    })}
                  </>
                }


                {/* MAHAL SATIRLARI */}
                {mahaller_byPoz_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz_state?.find(oneDugum => oneDugum._pozId.toString() === selectedPoz_metraj._id.toString() && oneDugum._mahalId.toString() === oneMahal._id.toString())
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

                      <Box onDoubleClick={() => hasOnaylananMetraj && !selectMode && goTo_MetrajOnaylaCetvel({ dugum, oneMahal })} sx={{ ...css_mahaller, cursor: hasOnaylananMetraj && !selectMode && "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1rem 1fr", backgroundColor: !hasOnaylananMetraj ? "lightgray" : !selectMode && "rgba(255, 251, 0, 0.55)", "&:hover": hasOnaylananMetraj && !selectMode && { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ backgroundColor: !hasOnaylananMetraj ? "lightgray" : !selectMode && "rgba(255, 251, 0, 0.55)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
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
                                //   selectMode && hasUnSelected && !hasSelectedFull_aday ? addNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                //     selectMode && hasUnSelected && hasSelectedFull_aday ? removeNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                //       !selectMode && clickAble && goTo_onayCetveli({ dugum, oneMahal, userEmail: oneYapabilen.userEmail })
                                // }
                                onClick={() =>
                                  selectMode && hasUnSelected ? addNodes_select({ tip: "mahal", mahal: oneMahal, userEmail: oneYapabilen.userEmail }) :
                                    !selectMode && clickAble && goTo_onayCetveli({ dugum, oneMahal, userEmail: oneYapabilen.userEmail })
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
                                    !selectMode && clickAble ? { "& .childClass": { color: "red" } } :
                                      selectMode && hasUnSelected && { "& .childClass": { color: "red" } }
                                }}
                              >

                                {/* {!selectMode &&
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

                                  </Box>
                                }

                                {selectMode && hasSelectedFull_aday &&
                                  <Box sx={{ display: "grid", alignItems: "center", justifyContent: "center" }}>
                                    <AddCircleIcon variant="contained" sx={{ mr: "0.3rem", fontSize: "0.80rem", color: "green" }} />
                                  </Box>
                                }

                                {/* {selectMode && hasSelected &&
                                  <Box sx={{ display: "grid", alignItems: "center", justifyContent: "center" }}>
                                    <CircleIcon variant="contained" sx={{ fontSize: "0.6rem", color: "gray", "&:hover": { color: "gray" } }} />
                                  </Box>
                                } */}
                                {/* {selectMode && hasReady && hasUnSelected && hasSelectedFull_aday &&
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

