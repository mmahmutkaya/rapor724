
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import MetrajMahallerHeader from '../../components/MetrajMahallerHeader'
import { BSON } from "realm-web"

import { useGetPozlar, useGetMahalListesi, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


export default function P_MetrajMahaller() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [mahallistesi_filtered, setMahallistesi_filtered] = useState()
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()



  const RealmApp = useApp();


  // pozlar && console.log("pozlar", pozlar)
  // selectedProje && console.log("selectedProje", selectedProje)
  const { data: mahaller } = useGetMahaller()
  const { data: mahalListesi } = useGetMahalListesi()
  // pozlar && console.log("pozlar", pozlar)
  // const { data: mahaller_birPoz } = useGetMahaller_BirPoz({ _pozId: selectedPoz?._id })
  // pozlar && console.log("pozlarMetraj", pozlarMetraj)



  useEffect(() => {
    !selectedProje && navigate("/projects")
    selectedPoz && mahalListesi && goToMahaller_birPoz()
    return () => {
      // setSelectedPoz()
      // setMahallistesi_filtered()
    }
  }, [selectedPoz, mahalListesi])




  const ikiHane = (value) => {
    if (!value) {
      return ""
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }



  let lbsArray = selectedProje?.lbs
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



  let metrajyapabilen_sutunlar = "0.5rem repeat(" + selectedProje?.metrajYapabilenler.length + " , auto)"
  // metrajyapabilen_sutunlar && console.log("metrajyapabilen_sutunlar", metrajyapabilen_sutunlar)



  const gridAreasMahaller = `
    'no isim . birimAd . hazir hazir . onay'
    'no isim . birimAd . user1 user2 . onay'
    'top top . birimBr . miktar1 miktar2 . miktar'
  `



  const goToMahaller_birPoz = () => {
    setMahallistesi_filtered(mahalListesi.list.filter(x => x._pozId.toString() === selectedPoz._id.toString()))
  }



  const handle_metrajEdit = (oneMahal, dugum) => {
    setSelectedMahal(oneMahal)
    setSelectedNode(dugum)
    navigate('/metrajedit')
  }




  return (

    <>

      <Grid item >
        <MetrajMahallerHeader show={show} setShow={setShow} />
      </Grid>


      {!lbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}

      {lbsArray?.length > 0 &&



        <Box sx={{ display: "grid", gridTemplateColumns: `auto 1fr 0.5rem auto ${metrajyapabilen_sutunlar} 0.5rem auto`, maxWidth: "70rem", gridTemplateAreas: gridAreasMahaller, mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid", gridArea: "no", justifyContent: "start", alignItems: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> {selectedPoz.pozNo} </Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid", gridArea: "isim", justifyContent: "start", alignItems: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> {selectedPoz.name}  </Box>
            <Box sx={{ fontWeight: "600", mb: "0rem", py: "0.2rem", display: "grid", gridRow: "1/3", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", py: "0.2rem", mb: "0rem", px: "1rem", display: "grid", gridArea: "birimAd", justifyContent: "center", alignItems: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> Birim </Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", gridRow: "1/3", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", px: "0.5rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderBottom: "none", display: "grid", gridArea: "hazir", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd", textAlign: "center" }}>Hazırlanan</Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `user${index + 1}`, px: "0.5rem", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{x._userId.toString().substr(x._userId.toString().length - 3)}</Box>
                )
              })
            }
            <Box sx={{ fontWeight: "600", mb: "0rem", display: "grid", py: "0.2rem", justifyContent: "center", backgroundColor: "#e0e1dd", color: "#e0e1dd" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid", gridArea: "onay", justifyContent: "center", alignItems: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> Miktar </Box>
          </>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ py: "0.2rem", fontWeight: "600", gridArea: "top", border: "1px solid black", mb: "0rem", px: "0.5rem", display: "grid", justifyContent: "end", backgroundColor: "#415a77", color: "#e0e1dd" }}> Toplam Metraj  </Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", border: "1px solid black", mb: "0rem", px: "1rem", display: "grid", gridArea: "birimBr", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{selectedProje.pozBirimleri.find(x => x.id == selectedPoz?.birimId)?.name}</Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", pl: "1rem", pr: "0.5rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `miktar${index + 1}`, justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)}</Box>
                )
              })
            }
            <Box sx={{ py: "0.2rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", border: "1px solid black", mb: "0rem", pl: "1rem", pr: "0.5rem", display: "grid", gridArea: "miktar", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz?.onaylananMetraj)}</Box>
          </>



          {/* {console.log("selectedProje", selectedProje)} */}
          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {lbsArray?.map((oneLbs, index) => {

            return (
              <Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#caf0f8" }}> {getLbsName(oneLbs).name} </Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#caf0f8" }}></Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
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
                {mahaller?.filter(x => x._lbsId.toString() === oneLbs._id.toString()).map((oneMahal, index) => {
                  let dugum = mahallistesi_filtered?.find(x => x._mahalId.toString() === oneMahal._id.toString())
                  return (
                    <Fragment key={index} >
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {oneMahal.kod} </Box>
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {oneMahal.name} </Box>
                      <Box sx={{ backgroundColor: "white", display: "grid", justifyContent: "center", color: "white" }}>.</Box>
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{selectedPoz?.pozBirim}</Box>
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
                      <Box sx={{ backgroundColor: "white", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ backgroundColor: !dugum && "rgba(211, 211, 211, 0.6)", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "end" }}> {ikiHane(dugum?.onaylananMetraj?.metraj)} </Box>
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

