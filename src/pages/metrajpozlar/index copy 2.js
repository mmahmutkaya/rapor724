
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import MetrajHeader from '../../components/MetrajHeader'
import { BSON } from "realm-web"

import { useGetPozlar, useGetMahalListesi, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


export default function P_MetrajPozlar() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedPozBaslik, setSelectedPozBaslik } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [mahallistesi_filtered, setMahallistesi_filtered] = useState()
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  useEffect(() => {
    !isProject && navigate("/projects")
    return () => {
      setSelectedPoz()
      setMahallistesi_filtered()
    }
  }, [])



  const RealmApp = useApp();

  const { data: pozlar } = useGetPozlar()
  // pozlar && console.log("pozlar", pozlar)
  const { data: mahaller } = useGetMahaller()
  const { data: mahalListesi } = useGetMahalListesi()
  // pozlar && console.log("pozlar", pozlar)
  // const { data: mahaller_birPoz } = useGetMahaller_BirPoz({ _pozId: selectedPoz?._id })
  // pozlar && console.log("pozlarMetraj", pozlarMetraj)





  const ikiHane = (value) => {
    if (!value) {
      return ""
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }



  let wbsArray = isProject?.wbs
    .filter(item => item.openForPoz === true)
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


  let lbsArray = isProject?.lbs
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



  let getWbsName = (oneWbs) => {

    let cOunt = oneWbs.code.split(".").length
    let name
    let code

    oneWbs.code.split(".").map((codePart, index) => {

      if (index == 0 && cOunt == 1) {
        code = codePart
        name = isProject?.wbs.find(item => item.code == code).name
      }

      if (index == 0 && cOunt !== 1) {
        code = codePart
        name = isProject?.wbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + isProject?.wbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + isProject?.wbs.find(item => item.code == code).name
      }

    })

    return { name, code }

  }



  let getLbsName = (oneLbs) => {

    let cOunt = oneLbs.code.split(".").length
    let name
    let code

    oneLbs.code.split(".").map((codePart, index) => {

      if (index == 0 && cOunt == 1) {
        code = codePart
        name = isProject?.lbs.find(item => item.code == code).name
      }

      if (index == 0 && cOunt !== 1) {
        code = codePart
        name = isProject?.lbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + isProject?.lbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + isProject?.lbs.find(item => item.code == code).name
      }

    })

    return { name, code }

  }



  const goToMahaller_birPoz = (onePoz) => {
    // console.log("mahalListesi", mahalListesi)
    // console.log("onePoz", onePoz)

    onePoz = { ...onePoz, pozBirim: isProject.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }

    // setSelectedPoz(selectedPoz => {
    //   selectedPoz = { ...selectedPoz, pozBirim: isProject.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }
    //   console.log("selectedPoz", selectedPoz)
    //   return selectedPoz
    // })

    setMahallistesi_filtered(mahalListesi.list.filter(x => x._pozId.toString() === onePoz._id.toString()))
    setSelectedPoz(onePoz)
    setShow("MahalListesi_BirPoz")
  }

  let metrajyapabilen_sutunlar = "0.5rem repeat(" + isProject?.metrajYapabilenler.length + " , auto)"
  // metrajyapabilen_sutunlar && console.log("metrajyapabilen_sutunlar", metrajyapabilen_sutunlar)


  return (

    <>

      <Grid item >
        <MetrajHeader show={show} setShow={setShow} />
      </Grid>

      {show == "FormPozCreate" &&
        <Grid item >
          <FormPozCreate isProject={isProject} setShow={setShow} />
        </Grid>
      }

      {show == "FormPozBaslikCreate" &&
        <Grid item >
          <FormPozBaslikCreate setShow={setShow} />
        </Grid>
      }

      {show == "EditPozBaslik" &&
        <Grid item >
          <EditPozBaslik setShow={setShow} />
        </Grid>
      }

      {show == "Main" && (wbsArray?.length == 0 || !wbsArray) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir poz başlığını poz eklemeye açmamış görünüyorsunumuz. "Poz Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }


      {show == "Main" && !wbsArray?.length > 0 && <Box>henüz herhangi bir WBS poz eklemeye açılmamış</Box>}

      {show == "Main" && wbsArray?.length > 0 &&

        <Box sx={{ display: "grid", gridTemplateColumns: `auto 1fr 0.5rem auto 0.5rem auto auto 0.5rem auto`, maxWidth: "70rem", mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* SUTUN BAŞLIK BİLGİLERİ SATIRI */}
          <>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", px: "0.5rem", display: "grid", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz No</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz İsmi</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", px: "0.5rem", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Birim</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", gridColumn: "6/8", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray", textAlign: "center" }}>
              <Box>Hazırlanan</Box>
              <Box sx={{ display: "grid", gridAutoFlow:"column" }}>
                <Box sx={{px:"0.5rem"}}>usevfdfvdfr1</Box>
                <Box sx={{px:"0.5rem"}}>user2</Box>
              </Box>
            </Box>

            {/* <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: "none", display: "grid", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray" }}>Miktar</Box> */}
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray", maxWidth: "7rem", textAlign: "center" }}>Onaylanan Miktar</Box>
          </>

          {/* {console.log("isProject", isProject)} */}
          {/* WBS BAŞLIK BİLGİLERİ SATIRI */}

          {wbsArray?.map((oneWbs, index) => {
            return (
              <Fragment key={index}>

                {/* WBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#FAEBD7" }}> {getWbsName(oneWbs).name} </Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                <Box sx={{ border: "1px solid black", borderLeft: "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>


                {/* POZ SATIRLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  return (
                    <Fragment key={index} >
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.pozNo} </Box>
                      <Box onDoubleClick={() => goToMahaller_birPoz(onePoz)} sx={{ cursor: "pointer", border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.name} </Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{isProject.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{onePoz.hazirlananMetrajlar} </Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{isProject.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}> {onePoz.onaylananMetraj} </Box>
                    </Fragment>
                  )
                })}

              </Fragment>
            )
          })}


        </Box >

      }






      {show == "MahalListesi_BirPoz" && selectedPoz && !lbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}

      {show == "MahalListesi_BirPoz" && selectedPoz && lbsArray?.length > 0 &&



        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr 0.5rem auto 0.5rem auto", maxWidth: "70rem", mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid", justifyContent: "start", backgroundColor: "#415a77", color: "#e0e1dd" }}> {selectedPoz.pozNo} </Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid", justifyContent: "start", backgroundColor: "#415a77", color: "#e0e1dd" }}> {selectedPoz.name}  </Box>
            <Box sx={{ fontWeight: "600", mb: "0rem", py: "0.2rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", py: "0.2rem", mb: "0rem", px: "1rem", display: "grid", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> Birim </Box>
            <Box sx={{ fontWeight: "600", mb: "0rem", display: "grid", py: "0.2rem", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", py: "0.2rem", mb: "0rem", pl: "1rem", pr: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}> Miktar </Box>
          </>

          {/* HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ py: "0.1rem", fontWeight: "600", gridColumn: "1/3", border: "1px solid black", mb: "0rem", px: "0.5rem", display: "grid", justifyContent: "end", backgroundColor: "#415a77", color: "#e0e1dd" }}> Toplam Metraj  </Box>
            <Box sx={{ py: "0.1rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ py: "0.1rem", fontWeight: "600", border: "1px solid black", mb: "0rem", px: "1rem", display: "grid", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{isProject.pozBirimleri.find(x => x.id == selectedPoz?.birimId)?.name}</Box>
            <Box sx={{ py: "0.1rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ py: "0.1rem", fontWeight: "600", border: "1px solid black", mb: "0rem", pl: "1rem", pr: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz?.onaylananMetraj)}</Box>
          </>



          {/* {console.log("isProject", isProject)} */}
          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {lbsArray?.map((oneLbs, index) => {

            return (
              <Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#caf0f8" }}> {getLbsName(oneLbs).name} </Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#caf0f8" }}></Box>
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




