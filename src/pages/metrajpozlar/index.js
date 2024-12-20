
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

  const { isProject, setIsProject } = useContext(StoreContext)
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


  useEffect(() => {
    !isProject && navigate("/projects")
    return () => {
      // setSelectedPoz()
      // setMahallistesi_filtered()
    }
  }, [])



  const RealmApp = useApp();

  const { data: pozlar } = useGetPozlar()
  // pozlar && console.log("pozlar", pozlar)
  // isProject && console.log("isProject", isProject)
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



  let metrajyapabilen_sutunlar = "0.5rem repeat(" + isProject?.metrajYapabilenler.length + " , auto)"
  // metrajyapabilen_sutunlar && console.log("metrajyapabilen_sutunlar", metrajyapabilen_sutunlar)


  const gridAreasPozlar = `
    'no isim . birim . user user . onay'
    'no isim . birim . user1 user2 . onay'
  `
  const gridAreasMahaller = `
    'no isim . birimAd . hazir hazir . onay'
    'no isim . birimAd . user1 user2 . onay'
    'top top . birimBr . miktar1 miktar2 . miktar'
  `



  const goToMahaller_birPoz = (onePoz) => {
    // console.log("mahalListesi", mahalListesi)
    // console.log("onePoz", onePoz)

    // onePoz = { ...onePoz, pozBirim: isProject.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }

    // setSelectedPoz(selectedPoz => {
    //   selectedPoz = { ...selectedPoz, pozBirim: isProject.pozBirimleri.find(x => x.id == onePoz?.birimId)?.name }
    //   console.log("selectedPoz", selectedPoz)
    //   return selectedPoz
    // })

    setSelectedPoz(onePoz)
    navigate('/metrajmahaller')
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

        <Box sx={{ display: "grid", gridTemplateColumns: `auto 1fr 0.5rem auto ${metrajyapabilen_sutunlar} 0.5rem auto`, maxWidth: "70rem", gridTemplateAreas: gridAreasPozlar, mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* SUTUN BAŞLIK BİLGİLERİ SATIRI */}
          <>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", px: "0.5rem", display: "grid", gridArea: "no", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz No</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: "none", px: "0.5rem", display: "grid", gridArea: "isim", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Poz İsmi</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", gridRow: "1/3", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", gridRow: "1/3", px: "0.5rem", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray" }}>Birim</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", gridRow: "1/3", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderBottom: "none", display: "grid", gridArea: "user", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray", maxWidth: "7rem", textAlign: "center" }}>Hazırlanan</Box>
            {
              isProject?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `user${index + 1}`, px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray" }}>{x._userId.toString().substr(x._userId.toString().length - 3)}</Box>
                )
              })
            }
            <Box sx={{ mb: "0rem", fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ mb: "0rem", fontWeight: "600", border: "1px solid black", display: "grid", gridArea: "onay", px: "0.5rem", justifyContent: "center", alignItems: "center", backgroundColor: "lightGray", maxWidth: "7rem", textAlign: "center" }}>Onaylanan Miktar</Box>
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
                {
                  isProject?.metrajYapabilenler.map((x, index) => {
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
                      <Box sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{isProject.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <>
                        {
                          isProject?.metrajYapabilenler.map((x, index2) => {
                            return (
                              <Box key={index2} sx={{ backgroundColor: !onePoz.openMetraj && "lightgray", border: "1px solid black", borderTop: "none", borderLeft: index2 !== 0 && "none", px: "0.5rem", display: "grid", justifyContent: "center" }}> {onePoz.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj} </Box>
                            )
                          })
                        }
                      </>
                      {/* <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{onePoz.hazirlananMetrajlar} </Box> */}
                      {/* <Box sx={{ border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{isProject.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box> */}
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





      {show == "MahalListesi_BirPoz" && selectedPoz && !lbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}

      {show == "MahalListesi_BirPoz" && selectedPoz && lbsArray?.length > 0 &&



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
              isProject?.metrajYapabilenler.map((x, index) => {
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
            <Box sx={{ py: "0.2rem", fontWeight: "600", border: "1px solid black", mb: "0rem", px: "1rem", display: "grid", gridArea: "birimBr", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{isProject.pozBirimleri.find(x => x.id == selectedPoz?.birimId)?.name}</Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            {
              isProject?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ mb: "0rem", pl: "1rem", pr: "0.5rem", py: "0.2rem", fontWeight: "600", border: "1px solid black", borderLeft: index !== 0 && "none", display: "grid", gridArea: `miktar${index + 1}`, justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)}</Box>
                )
              })
            }
            <Box sx={{ py: "0.2rem", fontWeight: "600", mb: "0rem", display: "grid", justifyContent: "center", backgroundColor: "#e0e1dd", color: "white" }}>.</Box>
            <Box sx={{ py: "0.2rem", fontWeight: "600", border: "1px solid black", mb: "0rem", pl: "1rem", pr: "0.5rem", display: "grid", gridArea: "miktar", justifyContent: "center", backgroundColor: "#415a77", color: "#e0e1dd" }}>{ikiHane(selectedPoz?.onaylananMetraj)}</Box>
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
                {
                  isProject?.metrajYapabilenler.map((x, index) => {
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
                          isProject?.metrajYapabilenler.map((x, index2) => {
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

