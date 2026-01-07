
import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import HeaderMetrajOlusturPozMahaller from '../../components/HeaderMetrajOlusturPozMahaller'

import _ from 'lodash';
import { DialogAlert } from '../../components/general/DialogAlert.js';


import { useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { BorderBottom } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { Check } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';


export default function P_MetrajOlusturPozMahaller() {

  const { appUser, myTema } = useContext(StoreContext)
  const [dialogAlert, setDialogAlert] = useState()


  const { selectedProje, selectedPoz } = useContext(StoreContext)
  const metrajYapabilenler = selectedProje?.yetki?.metrajYapabilenler
  let editNodeMetraj = true

  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal_metraj, setSelectedMahal_metraj } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const [dugumler_byPoz, setDugumler_byPoz] = useState()
  const [lbsMetrajlar, setLbsMetrajlar] = useState([])
  const [showMetrajOnaylanan, setShowMetrajOnaylanan] = useState(false)

  const navigate = useNavigate()

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  const { data: dataMahaller, error: error1, isLoading: isLoading1 } = useGetMahaller()
  const { data: dataDugumlerByPoz, error: error2, isLoading: isLoading2 } = useGetDugumler_byPoz()

  const mahaller_byPoz = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz && navigate('/metrajpozlar')
    setDugumler_byPoz(_.cloneDeep(dataDugumlerByPoz?.dugumler_byPoz))
    setLbsMetrajlar(_.cloneDeep(dataDugumlerByPoz?.lbsMetrajlar))
    return () => {
      // setselectedPoz_metraj()
      // setDugumler_filtered()
    }
  }, [dataMahaller, dataDugumlerByPoz])


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
    setSelectedNode(dugum)
    setSelectedMahal_metraj(oneMahal)
    navigate('/metrajolusturcetvel')
  }



  const goTo_onayCetveli = ({ dugum, oneMahal }) => {
    setSelectedNode(dugum)
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


  const metrajYapabilenlerColumns = " 1rem repeat(" + metrajYapabilenler?.length + ", max-content)"
  // const gridTemplateColumns1 = `max-content minmax(min-content, 1fr) max-content max-content${editNodeMetraj ? " 1rem max-content" : ""}${onayNodeMetraj ? metrajYapabilenlerColumns : ""}`
  const gridTemplateColumns1 = `max-content minmax(min-content, 1fr)${showMetrajOnaylanan ? " max-content" : ""} max-content${editNodeMetraj ? " 1rem max-content max-content" : ""}`


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
        <HeaderMetrajOlusturPozMahaller show={show} setShow={setShow} />
      </Grid>


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

            {showMetrajOnaylanan &&
              <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
                Miktar
              </Box>
            }
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Birim
            </Box>

            {editNodeMetraj &&
              <>
                <Box> </Box>

                <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
                  Hazırlanıyor
                </Box>

                <Box sx={{ ...css_enUstBaslik, minWidth: "6rem", justifyContent: "center" }}>
                  Hazır
                </Box>

              </>
            }

            {/* {onayNodeMetraj &&
              <>
                <Box> </Box>
                {metrajYapabilenler.map((oneYapabilen, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
                      {yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen.userEmail).userCode}
                    </Box>
                  )
                })}
              </>
            } */}

          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", gridColumn: "1/3", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>

            {showMetrajOnaylanan &&
              <Box sx={{ ...css_enUstBaslik, justifyContent: "end" }}>
                {ikiHane(dataDugumlerByPoz?.metrajOnaylanan)}
              </Box>
            }

            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirim}
            </Box>

            {editNodeMetraj &&
              <>
                <Box> </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(dataDugumlerByPoz?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)?.metrajPreparing)}
                </Box>
                <Box sx={{ ...css_enUstBaslik, justifyContent: "end", borderLeft: "1px solid black" }}>
                  {ikiHane(dataDugumlerByPoz?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)?.metrajReady)}
                </Box>
              </>
            }

            {/* {onayNodeMetraj &&
              <>
                <Box> </Box>
                {metrajYapabilenler.map((oneYapabilen, index) => {
                  return (
                    <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(selectedPoz.hazirlananMetrajlar.find(x => x.userEmail === oneYapabilen.userEmail)?.metraj)}
                    </Box>
                  )
                })}

              </>
            } */}

          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            const mahaller_byPoz_byLbs = mahaller_byPoz?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            const lbsMetraj = lbsMetrajlar.find(x => x._id.toString() === oneLbs._id.toString())

            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}> {getLbsName(oneLbs).name}</Box>

                {showMetrajOnaylanan &&
                  <Box sx={{ ...css_LbsBaslik, justifyContent: "end" }}>
                    {ikiHane(lbsMetraj?.metrajOnaylanan)}
                  </Box>
                }

                <Box sx={{ ...css_LbsBaslik, justifyContent: "center" }}> {pozBirim} </Box>

                {editNodeMetraj &&
                  <>
                    <Box> </Box>
                    <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(lbsMetraj?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)?.metrajPreparing)}
                    </Box>
                    <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>
                      {ikiHane(lbsMetraj?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)?.metrajReady)}
                    </Box>
                  </>
                }

                {/* {onayNodeMetraj &&
                  <>
                    <Box> </Box>
                    {metrajYapabilenler.map((oneYapabilen, index) => {
                      return (
                        <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", justifyContent: "end" }}>

                        </Box>
                      )
                    })}
                  </>
                } */}


                {/* MAHAL SATIRLARI */}
                {mahaller_byPoz_byLbs?.map((oneMahal, index) => {

                  let dugum = dugumler_byPoz?.find(oneDugum => oneDugum._pozId.toString() === selectedPoz._id.toString() && oneDugum._mahalId.toString() === oneMahal._id.toString())
                  let oneHazirlanan = dugum?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)


                  return (
                    <React.Fragment key={index}>

                      <Box sx={{ ...css_mahaller, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box sx={{ ...css_mahaller }}>
                        {oneMahal.mahalName}
                      </Box>

                      {/* <Box onDoubleClick={() => goTo_onaylananMetrajDugum(dugum)} sx={{ ...css_mahaller, cursor: "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ backgroundColor: "white", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(dugum?.onaylananMetraj)}
                        </Box>
                      </Box> */}


                      {showMetrajOnaylanan &&
                        <Box sx={{ ...css_mahaller, justifyContent: "end" }}>
                          {ikiHane(dugum?.metrajOnaylanan)}
                        </Box>
                      }

                      <Box sx={{ ...css_mahaller, justifyContent: "center" }}>
                        {pozBirim}
                      </Box>



                      {editNodeMetraj &&
                        <>
                          <Box />

                          <Box
                            onClick={() => goto_metrajOlusturCetvel(dugum, oneMahal)}
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
                              {ikiHane(oneHazirlanan?.metrajPreparing)}
                            </Box>
                          </Box>




                          <Box sx={{ ...css_mahaller, justifyContent: "end", backgroundColor: oneHazirlanan?.hasReady && "rgba(255, 255, 0, 0.24)" }}>
                            {ikiHane(oneHazirlanan?.metrajReady)}
                          </Box>


                          {/* <Box
                            // onDoubleClick={() => goto_metrajOlusturCetvel(dugum, oneMahal)}
                            sx={{
                              ...css_mahaller,
                              display: "grid",
                              gridTemplateColumns: "auto 1fr",
                              alignItems: "center",
                              // justifyContent: "end",
                              // cursor: "pointer",
                              // backgroundColor: "rgba(66, 66, 66, 0.12)",
                              // "&:hover": { "& .childClass": { backgroundColor: "red" } }
                            }}>
                            <Box sx={{ ml: "-0.2rem", pr: "0.4rem", mb: "-0.3rem" }}>
                              <Check sx={{ color: "black", fontSize: "0.95rem" }} />
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === appUser.email)?.metrajReady)}
                            </Box>
                          </Box> */}

                        </>
                      }

                      {/* {onayNodeMetraj &&
                        <>
                          <Box> </Box>
                          {metrajYapabilenler.map((oneYapabilen, index) => {
                            return (
                              <Box key={index} onDoubleClick={() => goTo_onayCetveli({ dugum, oneMahal })} sx={{ ...css_mahaller, justifyContent: "end", cursor: "pointer", backgroundColor: "rgb(143,206,0,0.3)", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                                <Box className="childClass" sx={{ color: "rgb(143,206,0,0.3)", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                                </Box>
                                <Box sx={{ justifySelf: "end" }}>
                                  {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen.userEmail)?.metraj)}
                                </Box>
                              </Box>
                              // <Box key={index} sx={{ ...css_mahaller, backgroundColor: "rgb(143,206,0,0.3)", borderLeft: "1px solid black", justifyContent: "end" }}>
                              //   {ikiHane(dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneYapabilen.userEmail)?.metraj)}
                              // </Box>
                            )
                          })}
                        </>
                      } */}

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

