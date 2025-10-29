
import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useQuery, useQueryClient } from '@tanstack/react-query'

import _ from 'lodash';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler'
import HeaderMetrajPozMahaller from '../../components/HeaderMetrajPozMahaller'
import HeaderMahalListesiPozMahaller from '../../components/HeaderMahalListesiPozMahaller.js'



import { useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Check } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import CircleIcon from '@mui/icons-material/Circle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LinearProgress from '@mui/material/LinearProgress';


export default function P_MehalListesiPozMahaller() {

  const queryClient = useQueryClient()

  const { appUser, setAppUser, RealmApp, myTema } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const { selectedProje } = useContext(StoreContext)
  let showMetrajYapabilenler

  const yetkililer = selectedProje?.yetkiliKisiler

  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)



  const [show, setShow] = useState("Main")
  const [isChanged, setIsChanged] = useState()


  const [isChange_select, setIsChange_select] = useState(false)
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState()
  const [dugumler_byPoz_backUp, setDugumler_byPoz_backup] = useState()
  const [anySelectable, setAnySelectable] = useState()

  const [mahaller_state, setMahaller_state] = useState()

  const [lbsMetrajlar, setLbsMetrajlar] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()

  const pozBirim = selectedProje?.pozBirimleri.find(x => x.id == selectedPoz?.pozBirimId)?.name


  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller()
  const { data: dataGetDugumler_byPoz, error: error2, isFetching: isFetching2 } = useGetDugumler_byPoz()


  // const mahaller = dataMahaller?.mahaller?.filter(oneMahal => dugumler_byPoz_state?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString()))

  useEffect(() => {
    !selectedPoz && navigate('/mahallistesipozlar')
    setMahaller_state(_.cloneDeep(dataMahaller?.mahaller))
    return () => {
      setMahaller_state()
    }
  }, [dataMahaller])


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
    .filter(oneLbs => oneLbs.openForMahal)
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




  // const handleDugumToggle = ({ oneMahal, toggleValue }) => {

  //   // console.log("oneMahal",oneMahal)
  //   // let dugumler_byPoz_state2 = _.cloneDeep(dugumler_byPoz_state)
  //   console.log("oneMahal", oneMahal)
  //   console.log("toggleValue", toggleValue)

  // }




  const handleDugumToggle = ({ oneMahal, toggleValue }) => {

    // console.log("oneMahal",oneMahal)
    let mahaller_state2 = _.cloneDeep(mahaller_state)

    mahaller_state2 = mahaller_state2.map(oneMahal2 => {
      if (oneMahal2._id.toString() === oneMahal._id.toString()) {
        oneMahal2.newSelected = true
        oneMahal2.hasDugum = toggleValue
      }
      return oneMahal2
    })
    setIsChanged(true)
    setMahaller_state(mahaller_state2)
  }



  const cancelChange = () => {
    setMahaller_state(dataMahaller?.mahaller)
    setIsChanged()
  }


  const saveChange = async () => {

    try {

      const mahaller = mahaller_state.filter(x => x.newSelected)

      // const result = await RealmApp.currentUser.callFunction("updateDugumler_openMetraj", { functionName: "mahaller_byPozId", _projeId: selectedProje._id, mahaller, _pozId: selectedPoz._id });


      const response = await fetch(`/api/dugumler`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId: selectedProje._id,
          pozId: selectedPoz._id,
          mahaller
        })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.ok) {
        queryClient.invalidateQueries(['dataMahaller'])
        queryClient.invalidateQueries(['dataMahalListesi_byPoz'])
        setIsChanged()
      } else {
        console.log("result", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


    } catch (err) {

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          queryClient.invalidateQueries(['dataMahaller'])
          queryClient.invalidateQueries(['dataMahalListesi_byPoz'])
          setIsChanged()
          setDialogAlert()
        }
      })

    }
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

  const gridTemplateColumns1 = `max-content minmax(min-content, 1fr) max-content max-content}`


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
        <HeaderMahalListesiPozMahaller
          show={show} setShow={setShow}
          isChanged={isChanged}
          cancelChange={cancelChange}
          saveChange={saveChange}
        />
      </Grid>


      {/* BAŞLIK GÖSTER / GİZLE
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      } */}


      {(isFetching1 || isFetching2) &&
        <Box sx={{ width: '100%', px: "1rem", mt: "5rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box >
      }


      {!(isFetching1 || isFetching2) && !openLbsArray?.length > 0 &&
        <Box>
          Henüz herhangi bir başlık mahal eklemeye açılmamış
        </Box>
      }

      {!(isFetching1 || isFetching2) && !mahaller_state?.length > 0 &&
        <Box>
          Henüz herhangi bir mahal oluşturulmamış
        </Box>
      }


      {!(isFetching1 || isFetching2) && openLbsArray?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: gridTemplateColumns1 }}>

          {/* EN ÜST BAŞLIĞIN ÜST SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>

            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", justifyContent: "start" }}>
              {selectedPoz.pozNo}
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              {selectedPoz.pozName}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Miktar
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              Birim
            </Box>

          </>


          {/* EN ÜST BAŞLIĞIN ALT SATIRI - HANGİ POZ İLE İŞLEM YAPILIYORSA - POZ İSMİ VE TOPLAM METRAJI */}
          <>
            <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black", gridColumn: "1/3", justifyContent: "end", borderLeft: "1px solid black" }}>
              Toplam Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "end" }}>
              {ikiHane(selectedPoz?.metrajOnaylanan)}
            </Box>
            <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
              {pozBirim}
            </Box>

          </>




          {/* LBS BAŞLIK BİLGİLERİ SATIRI */}

          {openLbsArray?.map((oneLbs, index) => {

            const mahaller_byLbs = mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString())
            if (!mahaller_byLbs.length > 0) {
              return
            }

            const lbsMetraj = dataGetDugumler_byPoz?.lbsMetrajlar?.find(x => x._id.toString() === oneLbs._id.toString())

            return (
              <React.Fragment key={index}>

                {/* LBS BAŞLIKLARI */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1/3" }}>
                  {getLbsName(oneLbs).name}
                </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "end" }}>
                  {ikiHane(lbsMetraj?.metrajOnaylanan)}
                </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "center" }}>
                  {pozBirim}
                </Box>


                {/* MAHAL SATIRLARI */}
                {mahaller_byLbs?.map((oneMahal, index) => {

                  let dugum = dataGetDugumler_byPoz?.dugumler_byPoz?.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString())
                  if (!oneMahal.newSelected && dugum) {
                    oneMahal.hasDugum = true
                  }

                  return (
                    <React.Fragment key={index}>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !oneMahal.hasDugum })} sx={{ ...css_mahaller, backgroundColor: !oneMahal.hasDugum ? "lightgray" : null, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !oneMahal.hasDugum })} sx={{ ...css_mahaller, backgroundColor: !oneMahal.hasDugum ? "lightgray" : null, cursor: "pointer", display: "grid", alignItems: "center", gridTemplateColumns: "1fr 1rem", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box sx={{ justifySelf: "start" }}>
                          {oneMahal.mahalName}
                        </Box>
                        <Box className="childClass" sx={{ height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !oneMahal.hasDugum })} sx={{ ...css_mahaller, backgroundColor: !oneMahal.hasDugum ? "lightgray" : null, justifyContent: "end" }}>
                        {ikiHane(dugum?.metrajOnaylanan)}
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !oneMahal.hasDugum })} sx={{ ...css_mahaller, backgroundColor: !oneMahal.hasDugum ? "lightgray" : null, justifyContent: "center" }}>
                        {pozBirim}
                      </Box>

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

