
import { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import MetrajHeader from '../../components/MetrajHeader'
import { BSON } from "realm-web"

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useGetPozlar, useGetPozlarMetraj } from '../../hooks/useMongo';

import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import { lightBlue } from '@mui/material/colors';



export default function P_Metraj() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedPozBaslik, setSelectedPozBaslik } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()
  useEffect(() => {
    !isProject && navigate("/projects")
  }, [])

  const RealmApp = useApp();

  const { data: pozlar } = useGetPozlar()
  // pozlar && console.log("pozlar", pozlar)
  const { data: pozlarMetraj } = useGetPozlarMetraj()
  // pozlar && console.log("pozlarMetraj", pozlarMetraj)


  const handleSelectPoz = (poz) => {
    setSelectedPoz(poz)
    setSelectedPozBaslik(false)
  }



  // aşağıda kullanılıyor
  let wbsCode = ""
  let wbsName = ""
  let cOunt = 0
  let count_
  let toplam
  let g_altBaslik



  const WbsHeader = styled('div')(({ index }) => ({
    marginTop: "1rem",
    // fontWeight: "bold",
    backgroundColor: "#FAEBD7",
    borderLeft: (index && index !== 0) ? null : "solid black 1px",
    borderRight: "solid black 1px",
    borderTop: "solid black 1px",
    borderBottom: "solid black 1px"
  }));

  const WbsItem = styled('div')(({ index }) => ({
    borderLeft: index == 0 ? "solid black 1px" : null,
    borderRight: "solid black 1px",
    borderBottom: "solid black 1px"
  }));

  const Bosluk = styled('div')(() => ({
    // backgroundColor: "lightblue"
    // borderLeft: index == 0 ? "solid black 1px" : null,
    // borderRight: "solid black 1px",
    // borderBottom: "solid black 1px"
  }));



  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


  const handle_selectBaslik = (oneBaslik) => {
    setSelectedPozBaslik(oneBaslik)
    setSelectedPoz()
    console.log("poz baslık secildi")
  }




  // const handle_input_onKey = async (event, oneBaslik) => {

  //   let oncesi = event.target.value.toString()
  //   let sonTus = event.key
  //   let yeni = oncesi + sonTus

  //   // sayı 
  //   if (oneBaslik.veriTuruId === "sayi") {

  //     if (sonTus.split(" ").length > 1) {
  //       console.log("boşluk bulundu ve durdu")
  //       return event.preventDefault()
  //     }

  //     let izinliTuslar = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape", "Enter", "Tab", "-", "."]

  //     if (!isNumeric(yeni) && !izinliTuslar.includes(sonTus)) {
  //       console.log("izinsiz tuşlara bastı ve durdu")
  //       return event.preventDefault()
  //     }

  //     if (sonTus == "-" && oncesi.split("").includes("-")) {
  //       console.log("zaten varken '-' kullanımı ve durdu")
  //       return event.preventDefault()
  //     }


  //     if (sonTus == "-" && yeni.split("")[0] !== ("-")) {
  //       console.log("event", event)
  //       console.log("başa gelmeyen '-' kullanımı ve durdu")
  //       return event.preventDefault()
  //     }


  //     if (sonTus == "." && oncesi.split("").includes(".")) {
  //       console.log("zaten varken '.' kullanımı ve durdu")
  //       return event.preventDefault()
  //     }

  //     if (isNumeric(sonTus) && yeni.split("").includes(".") && yeni.substring(yeni.indexOf(".") + 1, yeni.length).length > 3) {
  //       console.log("0 dan sonra 3 haneden fazla ve durdu")
  //       return event.preventDefault()
  //     }

  //   }

  // }



  // const handle_input_onChange = (event, oneBaslik, onePoz) => {

  //   setAutoFocus({ baslikId: oneBaslik.id, pozId: onePoz._id.toString() })

  //   // db ye kayıt yapılmışsa bu işlemi yapsın yoksa refresh yapsın
  //   const newBilgi = { pozId: onePoz._id, baslikId: oneBaslik.id, veri: event.target.value }

  //   if (oneBaslik.veriTuruId === "sayi" && !isNumeric(newBilgi.veri) && newBilgi.veri != "-" && newBilgi.veri.length != 0 && newBilgi.veri != ".") {
  //     return
  //   }


  //   setPozlar(pozlar => {
  //     // if (!pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler) {
  //     //   pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler = [newBilgi]
  //     //   return pozlar
  //     // }
  //     if (!pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id)) {
  //       pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.push(newBilgi)
  //       return pozlar
  //     }
  //     pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id).veri = newBilgi.veri
  //     return pozlar
  //   })


  //   setPozBilgiler_willBeSaved(pozBilgiler_willBeSaved => {
  //     let pozBilgiler_willBeSaved_ = [...pozBilgiler_willBeSaved]
  //     // console.log("mevcutBilgi",pozBilgiler_willBeSaved.find(item => item.pozId.toString() == onePoz._id.toString() && item.baslikId == oneBaslik.id))
  //     if (pozBilgiler_willBeSaved_.find(item => item.pozId == onePoz._id.toString() && item.baslikId == oneBaslik.id)) {
  //       pozBilgiler_willBeSaved_.find(item => item.pozId == onePoz._id.toString() && item.baslikId == oneBaslik.id).veri = newBilgi.veri
  //     } else {
  //       pozBilgiler_willBeSaved_ = [...pozBilgiler_willBeSaved_, { ...newBilgi }]
  //     }
  //     return pozBilgiler_willBeSaved_
  //   })


  // }

  const savePoz = async () => {
    console.log("pozBilgiler_willBeSaved", pozBilgiler_willBeSaved)

    // setPozBilgiler_willBeSaved([])
    const result = await RealmApp?.currentUser.callFunction("updatePozBilgiler", { _projectId: isProject?._id, pozBilgiler_willBeSaved });
    console.log("result", result)

    setEditPoz(false)
    setPozBilgiler_willBeSaved([])
    setSelectedPozBaslik(false)
  }


  const handle_selectPoz = ({ oneBaslik, onePoz }) => {
    console.log("obj", { oneBaslik, onePoz })
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




  let sutunGenislikleri = "5rem 5rem 5rem 2rem 5rem"
  let gridTemplateColumnsDegisken = "5rem 5rem"
  let totalWidthSabit = "25rem"
  let totalWidth = "25rem"



  return (

    <>

      <Grid item >
        <MetrajHeader setShow={setShow} editPoz={editPoz} setEditPoz={setEditPoz} savePoz={savePoz} />
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



      {show == "Main" && wbsArray?.length > 0 &&

        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr 0.5rem auto 0.5rem auto", maxWidth: "55rem", gridAutoFlow: "row", mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* SUTUN BAŞLIK BİLGİLERİ SATIRI */}
          <>
            <Box sx={{ fontWeight: "600", border: "1px solid black", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "lightGray" }}>Poz No</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "lightGray" }}>Poz İsmi</Box>
            <Box sx={{ fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", display: "grid", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray" }}>Birim</Box>
            <Box sx={{ fontWeight: "600", display: "grid", justifyContent: "center", px: "0.5rem", backgroundColor: "white", color: "white" }}>.</Box>
            <Box sx={{ fontWeight: "600", border: "1px solid black", display: "grid", px: "0.5rem", justifyContent: "center", backgroundColor: "lightGray" }}>Miktar</Box>
          </>

          {/* {console.log("isProject", isProject)} */}
          {/* WBS BAŞLIK BİLGİLERİ SATIRI */}

          {wbsArray?.map((oneWbs, index) => {
            return (
              <Fragment key={index}>

                {/* WBS BAŞLIKLARI */}
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", gridColumn: "1/3", display: "grid", justifyContent: "start", backgroundColor: "#FAEBD7" }}> {oneWbs.name} </Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>
                <Box sx={{ mt: "1rem", display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                <Box sx={{ border: "1px solid black", mt: "1rem", px: "0.5rem", display: "grid", justifyContent: "center", backgroundColor: "#FAEBD7" }}></Box>


                {/* POZ SATIRLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {
                  return (
                    <Fragment key={index}>
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.pozNo} </Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", borderLeft: "none", px: "0.5rem", display: "grid", justifyContent: "start" }}> {onePoz.name} </Box>
                      <Box sx={{ display: "grid", justifyContent: "center", backgroundColor: "white", color: "white" }}>.</Box>
                      <Box sx={{ border: "1px solid black", borderTop: "none", px: "0.5rem", display: "grid", justifyContent: "center" }}>{isProject.pozBirimleri.find(x => x.id == onePoz.birimId).name}</Box>
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

    </ >

  )

}
