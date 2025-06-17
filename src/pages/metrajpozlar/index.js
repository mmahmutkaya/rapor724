
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import MetrajPozlarHeader from '../../components/MetrajPozlarHeader'
import { BSON } from "realm-web"

import { useGetPozlar, useGetMahalListesi, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


export default function P_MetrajPozlar() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  // const [editPoz, setEditPoz] = useState(false)
  const [mahallistesi_filtered, setMahallistesi_filtered] = useState()
  // const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  // const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()


  useEffect(() => {
    !selectedProje && navigate("/projects")
    return () => {
      // setSelectedPoz()
      // setMahallistesi_filtered()
    }
  }, [])



  // const RealmApp = useApp();
  // const { RealmApp } = useContext(StoreContext)

  const { data: pozlar } = useGetPozlar()
  // pozlar && console.log("pozlar", pozlar)
  // selectedProje && console.log("selectedProje", selectedProje)
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


  let wbsArray = selectedProje?.wbs
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



  let getWbsName = (oneWbs) => {

    let cOunt = oneWbs.code.split(".").length
    let name
    let code

    oneWbs.code.split(".").map((codePart, index) => {

      if (index == 0 && cOunt == 1) {
        code = codePart
        name = selectedProje?.wbs.find(item => item.code == code).name
      }

      if (index == 0 && cOunt !== 1) {
        code = codePart
        name = selectedProje?.wbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + selectedProje?.wbs.find(item => item.code == code).codeName
      }

      if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
        code = code + "." + codePart
        name = name + " > " + selectedProje?.wbs.find(item => item.code == code).name
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
  // console.log("miktarSirali", miktarSirali)




  const gridAreasPozlar = `
    'no isim . birim . ${users} . onay'
    'no isim . birim . ${userSirali} . onay'
  `



  const goToMahaller_birPoz = (onePoz) => {
    // console.log("mahalListesi", mahalListesi)
    // console.log("onePoz", onePoz)

    // onePoz = { ...onePoz, pozBirim: selectedProje.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }

    // setSelectedPoz(selectedPoz => {
    //   selectedPoz = { ...selectedPoz, pozBirim: selectedProje.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }
    //   console.log("selectedPoz", selectedPoz)
    //   return selectedPoz
    // })

    setSelectedPoz(onePoz)
    navigate('/metrajpozmahaller')
    // setShow("MahalListesi_BirPoz")
  }



  const handle_metrajEdit = (oneMahal, dugum) => {
    setSelectedMahal(oneMahal)
    setSelectedNode(dugum)
    navigate('/metrajedit')
  }




  return (

    <>

      <Grid item >
        <MetrajPozlarHeader show={show} setShow={setShow} />
      </Grid>

      {show == "FormPozCreate" &&
        <Grid item >
          <FormPozCreate selectedProje={selectedProje} setShow={setShow} />
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

        <Box sx={{ display: "grid", gridTemplateColumns: `auto 1fr 0.5rem auto 0.5rem ${metrajyapabilen_sutunlar} 0.5rem auto`, maxWidth: "70rem", gridTemplateAreas: gridAreasPozlar, mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* SUTUN BAŞLIK BİLGİLERİ SATIRI */}
          <>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", px: "0.5rem", display: "grid", gridArea: "no", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz No</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: "none", px: "0.5rem", display: "grid", gridArea: "isim", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz İsmi</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", gridRow: "1/3", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", gridRow: "1/3", px: "0.5rem", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Birim</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", gridRow: "1/3", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderBottom: "none", display: "grid", gridArea: "user", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray", textAlign: "center" }}>Hazırlanan</Box>
            {
              selectedProje?.metrajYapabilenler?.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `user${index + 1}`, px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray" }}>{x._userId.toString().substr(x._userId.toString().length - 3)}</Box>
                )
              })
            }
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", gridArea: "onay", px: "0.5rem", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray", maxWidth: "7rem", textAlign: "center" }}>Onaylanan Miktar</Box>
          </>

          {/* {console.log("selectedProje", selectedProje)} */}
          {/* WBS BAŞLIK BİLGİLERİ SATIRI */}

          {wbsArray?.map((oneWbs, index) => {
            return (
              <Fragment key={index}>

                {/* WBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#FAEBD7" }}> {getWbsName(oneWbs).name} </Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                {
                  selectedProje?.metrajYapabilenler?.map((x, index) => {
                    return (
                      <Box key={index} sx={{ border: "1px solid black", borderLeft: index !== 0 && "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                    )
                  })
                }
                {/* <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box> */}
                {/* <Box sx={{ border: "1px solid black", borderLeft: "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box> */}
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>


                {/* POZ SATIRLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  return (
                    <Fragment key={index} >
                      <Box sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.pozNo} </Box>
                      <Box onDoubleClick={() => onePoz.openMetraj && goToMahaller_birPoz(onePoz)} sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", cursor: onePoz.openMetraj && "pointer", border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.name} </Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{selectedProje.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <>
                        {
                          selectedProje?.metrajYapabilenler?.map((x, index2) => {
                            return (
                              <Box key={index2} sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", borderLeft: index2 !== 0 && "none", px: "0.5rem", display: "grid", justifyContent: "center" }}> {onePoz.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj} </Box>
                            )
                          })
                        }
                      </>
                      {/* <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{onePoz.hazirlananMetrajlar} </Box> */}
                      {/* <Box sx={{ border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{selectedProje.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box> */}
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}> {onePoz.onaylananMetraj} </Box>
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


const baslikA1 = {
  fontWeight: "600", border: "1px solid black", mb: "0rem", py: "0.2rem", px: "0.5rem", display: "grid"
}