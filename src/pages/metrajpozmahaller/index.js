
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import HeaderMetrajPozMahaller from '../../components/HeaderMetrajPozMahaller'
import { BSON } from "realm-web"

import { useGetPozlar, useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { BorderBottom } from '@mui/icons-material';


export default function P_MetrajPozMahaller() {

  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedPoz_metraj } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal_metraj, setSelectedMahal_metraj } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const pozBirimName = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz_metraj?.pozBirimId)?.name


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



  let count

  let metrajyapabilen_sutunlar = selectedProje?.metrajYapabilenler.reduce((acc, x, index) => index == 0 ? "auto" : acc + " auto", "")

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

  const css_LbsBaslik = {
    border: "1px solid black", borderLeft: "none", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "start", backgroundColor: "#caf0f8"
  }

  const css_mahaller = {
    borderRight: "1px solid black", borderBottom: "1px solid black", px: "0.5rem", display: "grid", justifyContent: "start"
  }




  const gridTemplateColumns1 = `auto 1fr auto ${metrajyapabilen_sutunlar} 0.5rem auto`


  return (

    <>

      <Grid item >
        <HeaderMetrajPozMahaller show={show} setShow={setShow} />
      </Grid>


      {!openLbsArray?.length > 0 && <Box>henüz herhangi bir LBS mahal eklemeye açılmamış</Box>}

      {openLbsArray?.length > 0 &&

        <Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* EN ÜST BAŞLIĞIN ÜST SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "center" }}>
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
            <Box> </Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: index == 0 && "1px solid black", justifyContent: "center" }}>
                    {x._userId.toString().substr(x._userId.toString().length - 3)}
                  </Box>
                )
              })
            }
          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", gridColumn: "1/3", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik, }}>
              {ikiHane(selectedPoz_metraj?.onaylananMetraj)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirimName}
            </Box>
            <Box></Box>
            {
              selectedProje?.metrajYapabilenler.map((x, index) => {
                return (
                  <Box key={index} sx={{ ...css_enUstBaslik, borderLeft: index == 0 && "1px solid black" }}>
                    {ikiHane(selectedPoz_metraj.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)}
                  </Box>
                )
              })
            }
          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            const mahaller_byPoz_byLbs = mahaller_byPoz?.filter(x => x._lbsId.toString() === oneLbs._id.toString())

            return (
              <Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}> {getLbsName(oneLbs).name}</Box>
                <Box sx={{ ...css_LbsBaslik }}>  {"lbs miktar"} </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "center" }}> {pozBirimName} </Box>
                <Box></Box>
                {
                  selectedProje?.metrajYapabilenler.map((x, index) => {
                    return (
                      <Box key={index} sx={{ ...css_LbsBaslik, borderLeft: index == 0 && "1px solid black" }}></Box>
                    )
                  })
                }


                {/* MAHAL SATIRLARI */}
                {mahaller_byPoz_byLbs?.map((oneMahal, index) => {

                  let dugum

                  return (
                    <Fragment key={index} >
                      <Box sx={{ ...css_mahaller, borderLeft: "1px solid black" }}> {oneMahal.mahalNo} </Box>
                      <Box sx={{ ...css_mahaller }}> {oneMahal.mahalName} </Box>
                      <Box sx={{ ...css_mahaller }}> {ikiHane(dugum?.onaylananMetraj?.metraj)} </Box>
                      <Box sx={{ ...css_mahaller }}>{selectedPoz_metraj?.pozBirim}</Box>
                      <Box></Box>
                      {
                        selectedProje?.metrajYapabilenler.map((x, index2) => {
                          return (
                            <Box
                              key={index2}
                              onDoubleClick={() => handle_metrajEdit(oneMahal, dugum)}
                              sx={{ ...css_mahaller, borderLeft: index2 == 0 && "1px solid black" }}>
                              {ikiHane(dugum?.hazirlananMetrajlar?.find(y => y._userId.toString() === x._userId.toString())?.metraj)}
                            </Box>
                          )
                        })
                      }

                    </Fragment>
                  )
                })}

              </Fragment>
            )
          })
          }

        </Box >

      }
    </ >

  )

}

