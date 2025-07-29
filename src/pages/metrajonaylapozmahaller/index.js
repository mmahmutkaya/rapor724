
import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'

import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import HeaderMetrajOnaylaPozMahaller from '../../components/HeaderMetrajOnaylaPozMahaller'


import { useGetPozlar, useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { BorderBottom } from '@mui/icons-material';


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

  useEffect(() => {
    setShowMetrajYapabilenler(RealmApp.currentUser.customData.customSettings.showMetrajYapabilenler)
  }, [])



  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz_metraj?.pozBirimId)?.name


  const { data: mahaller } = useGetMahaller()
  const { data: dugumler_byPoz } = useGetDugumler_byPoz()

  const mahaller_byPoz = mahaller?.filter(oneMahal => dugumler_byPoz?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz_metraj && navigate('/metrajpozlar')
    return () => {
      // setselectedPoz_metraj()
      // setDugumler_filtered()
    }
  }, [selectedPoz_metraj])


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


  const goto_metrajOlusturCetvel = (dugum, oneMahal) => {
    setSelectedNode_metraj(dugum)
    setSelectedMahal_metraj(oneMahal)
    navigate('/metrajolusturcetvel')
  }



  const goTo_onaylananMetrajDugum = (dugum) => {
    console.log("dugum", dugum)
    // setSelectedNode_metraj(dugum)
    // setSelectedMahal_metraj(oneMahal)
    // navigate('/metrajcetvelihazirlanan')
  }



  const goTo_onayCetveli = ({ dugum, oneMahal }) => {
    setSelectedNode_metraj(dugum)
    setSelectedMahal_metraj(oneMahal)
    navigate('/metrajonay')
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

  const showMetrajYapabilenlerColumns = " 1rem repeat(" + showMetrajYapabilenler?.length + ", max-content)"
  const gridTemplateColumns1 = `max-content minmax(min-content, 1fr) max-content max-content${editNodeMetraj ? " 1rem max-content" : ""}${onayNodeMetraj ? showMetrajYapabilenlerColumns : ""}`


  return (

    <Box sx={{ m: "0rem", maxWidth: "60rem" }}>

      <Grid item >
        <HeaderMetrajOnaylaPozMahaller show={show} setShow={setShow} />
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

            {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
                  {yetkililer?.find(oneYetkili => oneYetkili.userEmail === customData.email).userCode}
                </Box>
              </>
            }

            {onayNodeMetraj &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.map((oneYapabilen, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                      {yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen).userCode}
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
              {ikiHane(selectedPoz_metraj?.onaylananMetraj)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirim}
            </Box>

            {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(selectedPoz_metraj?.hazirlananMetrajlar?.find(x => x.userEmail === customData.email)?.metraj)}
                </Box>
              </>
            }

            {onayNodeMetraj &&
              <>
                <Box> </Box>
                {showMetrajYapabilenler?.map((oneYapabilen, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(selectedPoz_metraj.hazirlananMetrajlar.find(x => x.userEmail === oneYapabilen)?.metraj)}
                    </Box>
                  )
                })}

              </>
            }
          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            const mahaller_byPoz_byLbs = mahaller_byPoz?.filter(x => x._lbsId.toString() === oneLbs._id.toString())

            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}> {getLbsName(oneLbs).name}</Box>
                <Box sx={{ ...css_LbsBaslik }}>  {"lbs miktar"} </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "center" }}> {pozBirim} </Box>

                {editNodeMetraj &&
                  <>
                    <Box> </Box>
                    <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                      {"deneme"}
                    </Box>
                  </>
                }

                {onayNodeMetraj &&
                  <>
                    <Box> </Box>
                    {showMetrajYapabilenler?.map((oneYapabilen, index) => {
                      return (
                        <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>

                        </Box>
                      )
                    })}
                  </>
                }


                {/* MAHAL SATIRLARI */}
                {mahaller_byPoz_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz?.find(oneDugum => oneDugum._pozId.toString() === selectedPoz_metraj._id.toString() && oneDugum._mahalId.toString() === oneMahal._id.toString())

                  return (
                    <React.Fragment key={index}>

                      <Box sx={{ ...css_mahaller, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box sx={{ ...css_mahaller }}>
                        {oneMahal.mahalName}
                      </Box>

                      <Box onDoubleClick={() => goTo_onaylananMetrajDugum(dugum)} sx={{ ...css_mahaller, cursor: "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ backgroundColor: "white", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(dugum?.onaylananMetraj)}
                        </Box>
                      </Box>

                      <Box sx={{ ...css_mahaller, justifyContent: "center" }}>
                        {pozBirim}
                      </Box>

                      {editNodeMetraj &&
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
                      }

                      {onayNodeMetraj &&
                        <>
                          <Box> </Box>
                          {showMetrajYapabilenler?.map((oneYapabilen, index) => {
                            return (
                              <Box key={index} onDoubleClick={() => goTo_onayCetveli({ dugum, oneMahal })} sx={{ ...css_mahaller, justifyContent: "end", cursor: "pointer", backgroundColor: "rgb(143,206,0,0.3)", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                                <Box className="childClass" sx={{ color: "rgb(143,206,0,0.3)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                                </Box>
                                <Box sx={{ justifySelf: "end" }}>
                                  {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen)?.metraj)}
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

