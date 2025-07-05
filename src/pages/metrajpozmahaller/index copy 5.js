
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import HeaderMetrajPozMahaller from '../../components/HeaderMetrajPozMahaller'
import { BSON } from "realm-web"

import { useGetPozlar, useGetDugumler, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


export default function P_MetrajPozMahaller() {

  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedPoz_metraj } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal_metraj, setSelectedMahal_metraj } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [dugumler_filtered, setDugumler_filtered] = useState()
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()



  // pozlar && console.log("pozlar", pozlar)
  // selectedProje && console.log("selectedProje", selectedProje)
  const { data: mahaller } = useGetMahaller()
  const { data: dugumler } = useGetDugumler()
  // pozlar && console.log("pozlar", pozlar)
  // const { data: mahaller_birPoz } = useGetMahaller_BirPoz({ _pozId: selectedPoz_metraj?._id })
  // pozlar && console.log("pozlarMetraj", pozlarMetraj)



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
    .filter(item => item.openForMahal === true)
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



  let count

  let metrajyapabilen_sutunlar = selectedProje?.metrajYapabilenler.reduce((acc, x, index) => index == 0 ? "auto" : acc + " auto", "")
  let users = selectedProje?.metrajYapabilenler.reduce((acc, x, index) => index == 0 ? "user" : acc + " user", "")
  let hazirs = selectedProje?.metrajYapabilenler.reduce((acc, x, index) => index == 0 ? "hazir" : acc + " hazir", "")

  count = 0
  let userSirali = "user"
  selectedProje?.metrajYapabilenler.map((x, index) => {
    count = count + 1
    return (
      userSirali = index == 0 ? userSirali + count : userSirali + " user" + count
    )
  })


  count = 0
  let miktarSirali = "miktar"
  selectedProje?.metrajYapabilenler.map((x, index) => {
    count = count + 1
    return (
      miktarSirali = index == 0 ? miktarSirali + count : miktarSirali + " miktar" + count
    )
  })



  const gridAreasMahaller = `
    'no isim onay birimAd . ${userSirali}'
    'top top miktar birimBr . ${miktarSirali}'
  `





  const handle_metrajEdit = (oneMahal, dugum) => {
    setSelectedMahal_metraj(oneMahal)
    setSelectedNode(dugum)
    navigate('/metrajedit')
  }

  const css_enUstBaslik = {
    display: "grid",
    fontWeight: "600",
    border: "1px solid black",
    borderLeft: "none",
    mb: "0rem",
    py: "0.2rem",
    px: "0.5rem",
    justifyContent: "start",
    alignItems: "center",
    backgroundColor: "#415a77",
    color: "#e0e1dd"
  }
  const css_bosluk = {
    backgroundColor: "#e0e1dd", color: "#e0e1dd"
  }


  return (

    <>

      <Grid item >
        <HeaderMetrajPozMahaller show={show} setShow={setShow} />
      </Grid>


      {!openLbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}

      {openLbsArray?.length > 0 &&

        <Box sx={{ display: "grid", gridTemplateColumns: `auto 1fr auto ${metrajyapabilen_sutunlar} 0.5rem auto`, maxWidth: "70rem", gridTemplateAreas: gridAreasMahaller, mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, gridArea: "no", borderLeft: "1px solid black", justifyContent: "center" }}>
              {selectedPoz_metraj.pozNo}
            </Box>
            <Box sx={{ ...css_enUstBaslik, gridArea: "isim" }}>
              {selectedPoz_metraj.pozName}
            </Box>
            <Box sx={{ ...css_enUstBaslik, gridArea: "onay", justifyContent: "center" }}>
              Miktar
            </Box>
            <Box sx={{ ...css_enUstBaslik, gridArea: "birimAd", justifyContent: "center" }}>
              Birim
            </Box>
            <Box sx={{ ...css_bosluk }}>
              .
            </Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `user${index + 1}`, px: "0.5rem", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{x._userId.toString().substr(x._userId.toString().length - 3)}</Box>
                )
              })
            }
          </>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, gridArea: "top", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik, gridArea: "miktar" }}>
              {ikiHane(selectedPoz_metraj?.onaylananMetraj)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, gridArea: "birimBr", justifyContent: "center" }}>
              {selectedProje.pozBirimleri.find(x => x.id == selectedPoz_metraj?.pozBirimId)?.name}
            </Box>
            <Box sx={{ ...css_bosluk }}>.</Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", pl: "1rem", pr: "0.5rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `miktar${index + 1}`, justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz_metraj.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)}</Box>
                )
              })
            }
          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            let mahaller_filtered = mahaller?.filter(x => x._lbsId.toString() === oneLbs._id.toString())

            return (
              <Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#caf0f8" }}> {getLbsName(oneLbs).name} </Box>
                {/* <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box> */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#caf0f8" }}></Box>
                {/* <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box> */}
                {
                  selectedProje?.metrajYapabilenler.map((x, index) => {
                    return (
                      <Box key={index} sx={{ border: "1px solid black", borderLeft: index !== 0 && "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#caf0f8" }}></Box>
                    )
                  })
                }
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#caf0f8" }}></Box>


                {/* MAHAL SATIRLARI */}
                {mahaller_filtered?.map((oneMahal, index) => {

                  let dugum

                  return (
                    <Fragment key={index} >
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {oneMahal.mahalNo} </Box>
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {oneMahal.mahalName} </Box>
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "end" }}> {ikiHane(dugum?.onaylananMetraj?.metraj)} </Box>
                      {/* <Box sx={{ backgroundColor: "white", display: "grid", justifyContent: "center", color: "white" }}>.</Box> */}
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{selectedPoz_metraj?.pozBirim}</Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <>
                        {
                          selectedProje?.metrajYapabilenler.map((x, index2) => {
                            return (
                              <Box key={index2} onDoubleClick={() => handle_metrajEdit(oneMahal, dugum)} sx={{ border: "1px solid black", borderTop: "none", borderLeft: index2 !== 0 && "none", pl: "1rem", pr: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)" }}> {ikiHane(dugum?.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)} </Box>
                            )
                          })
                        }
                      </>
                      {/* <Box sx={{ backgroundColor: "white", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box> */}
                    </Fragment>
                  )
                })}

              </Fragment>
            )
          })}


        </Box >

      }
    </ >

  )

}

