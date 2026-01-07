
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';

import { DialogAlert } from '../../components/general/DialogAlert.js';
import HeaderMetrajOlusturCetvel from '../../components/HeaderMetrajOlusturCetvel.js'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { useGetMahaller, useGetMahalListesi, useGetHazirlananMetraj, useUpdateHazirlananMetraj, useUpdateOnaylananMetraj, useGetOnaylananMetraj } from '../../hooks/useMongo.js';


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import HourglassFullSharpIcon from '@mui/icons-material/HourglassFullSharp';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import ReplyIcon from '@mui/icons-material/Reply';
import { Circle, Visibility } from '@mui/icons-material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditIcon from '@mui/icons-material/Edit';


export default function P_MetrajOlusturCetvel() {

  const queryClient = useQueryClient()

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { appUser, setAppUser } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedMahal_metraj } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)
  const { detailMode, setDetailMode } = useContext(StoreContext)


  const [dialogAlert, setDialogAlert] = useState()
  const [hazirlananMetraj_state, setHazirlananMetraj_state] = useState()
  const [hazirlananMetraj_backUp, setHazirlananMetraj_backUp] = useState()


  const [isChanged_edit, setIsChanged_edit] = useState()
  const [isChanged_ready, setIsChanged_ready] = useState()

  const [mode_edit, setMode_edit] = useState()
  const [mode_ready, setMode_ready] = useState()


  const [_pozId] = useState()


  let pozBirim
  let pozMetraj


  let metrajCesitleri = [{ id: "guncel", name: "Güncel" }]

  // renkler

  const onaylananBaslik_color = "rgba( 253, 197, 123 , 0.6 )" // tarçın
  const onaylananSatir_color = "rgba(255,255,0, 0.3)" // açık sarı 

  // "rgba( 253, 197, 123 , 0.6 )" // tarçın
  // "rgba( 0, 255, 0, 0.2 )" // fosforlu yeşil 
  // "rgba( 128, 128, 128, 0.3 )" // gri 
  // "rgba(255,255,0, 0.3)" // sarı

  const hazirlananBaslik_color = "rgba( 253, 197, 123 , 0.6 )" // tarçın
  const hazirlananSatir_color = "rgba(255,255,0, 0.3)" // sarı 
  const hazirlananOnayliSatir_color = "rgba( 128, 128, 128, 0.2 )" // gri
  const hazirlananKilitliSatir_color = "rgba( 128, 128, 128, 0.3 )" // gri


  const { data: dataHazirlananMetraj } = useGetHazirlananMetraj()



  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode && navigate("/metrajpozmahaller")
    setHazirlananMetraj_state(_.cloneDeep(dataHazirlananMetraj?.hazirlananMetraj))
    setHazirlananMetraj_backUp(_.cloneDeep(dataHazirlananMetraj?.hazirlananMetraj))
  }, [dataHazirlananMetraj])




  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = (event, satirNo, oneProperty) => {

    if (!isChanged_edit) {
      setIsChanged_edit(true)
    }

    let hazirlananMetraj_state2 = { ...hazirlananMetraj_state }

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    hazirlananMetraj_state2["satirlar"] = hazirlananMetraj_state2["satirlar"].map(oneRow => {

      if (oneRow.satirNo == satirNo) {

        delete oneRow.isReadyBack
        oneRow.newSelected = true

        oneRow[oneProperty] = event.target.value

        let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

        // ya burdan dönüyor
        if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
          oneRow.metraj = ""
          return oneRow
        }

        const oneRowMetraj = (
          (oneRow.carpan1 == "" ? 1 : oneRow.carpan1) *
          (oneRow.carpan2 == "" ? 1 : oneRow.carpan2) *
          (oneRow.carpan3 == "" ? 1 : oneRow.carpan3) *
          (oneRow.carpan4 == "" ? 1 : oneRow.carpan4) *
          (oneRow.carpan5 == "" ? 1 : oneRow.carpan5)
        )

        // ya burdan ya da alttakinden dönüyor
        if (isMinha) {
          oneRow.metraj = oneRowMetraj * -1
          return oneRow
        } else {
          oneRow.metraj = oneRowMetraj
          return oneRow
        }

      }

      // işlenmeyecek bir satursa da burdan dönüyor
      return oneRow

    })

    let metrajPreparing = 0
    let metrajReady = 0
    hazirlananMetraj_state2.satirlar.map(oneSatir => {
      metrajPreparing += oneSatir.isPreparing ? Number(oneSatir.metraj) : 0
      metrajReady += oneSatir.isReady || oneSatir.isSelected || oneSatir.hasSelectedCopy ? Number(oneSatir.metraj) : 0
    })
    hazirlananMetraj_state2.metrajPreparing = metrajPreparing
    hazirlananMetraj_state2.metrajReady = metrajReady

    setHazirlananMetraj_state(hazirlananMetraj_state2)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["aciklama"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }


  const cancel_edit = () => {
    setHazirlananMetraj_state(_.cloneDeep(hazirlananMetraj_backUp))
    setIsChanged_edit()
    setMode_edit()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_edit = async () => {

    if (isChanged_edit || isChanged_ready) {
      try {

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetraj_preparing", ({ _dugumId: selectedNode._id, hazirlananMetraj_state }))
        const response = await fetch(`api/dugumler/updatehazirlananmetrajpreparing`, {
          method: 'POST',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dugumId: selectedNode._id,
            hazirlananMetraj_state
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

        if (!responseJson.ok) {
          console.log("responseJson", responseJson)
          throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
        }

        queryClient.invalidateQueries(['dataHazirlananMetraj'])
        setIsChanged_edit()
        setMode_edit()
        return

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setDialogAlert()
            setIsChanged_edit()
            setMode_edit()
            queryClient.invalidateQueries(['dataHazirlananMetraj'])
          }
        })
      }
    }

  }












  //  READY FONKSİYONLARI - ADD SATIR - REMOVE SATIR - CANCEL DB - SAVE DB




  const add_OneRow_ready_all = () => {

    let hazirlananMetraj_state2 = _.cloneDeep(hazirlananMetraj_state)

    let isIslemYapildi

    hazirlananMetraj_state2.satirlar = hazirlananMetraj_state2.satirlar.map(oneSatir => {
      if (!oneSatir.isReady && !oneSatir.isReadyBack) {
        oneSatir.isReady = true
        oneSatir.isReadyUnSeen = true
        oneSatir.newSelected = true
        isIslemYapildi = true
      }
      return oneSatir
    })


    if (!isIslemYapildi) {
      hazirlananMetraj_state2.satirlar = hazirlananMetraj_state2.satirlar.map(oneSatir => {
        if (oneSatir.isReady && oneSatir.newSelected) {
          delete oneSatir.isReady
          delete oneSatir.isReadyUnSeen
          delete oneSatir.newSelected
        }
        return oneSatir
      })
    }


    setIsChanged_ready()

    for (let j = 0; j < hazirlananMetraj_state2.satirlar?.length; j++) {
      let oneSatir = hazirlananMetraj_state2.satirlar[j]
      if (oneSatir.isReady && oneSatir.isReadyUnSeen) {
        setIsChanged_ready(true)
        break
      }
    }

    setHazirlananMetraj_state(hazirlananMetraj_state2)
  }



  const addRow_ready = (oneRow) => {

    let hazirlananMetraj_state2 = _.cloneDeep(hazirlananMetraj_state)
    hazirlananMetraj_state2.satirlar = hazirlananMetraj_state2.satirlar.map(oneSatir => {
      if (oneSatir.satirNo === oneRow.satirNo) {
        oneSatir.isReady = true
        oneSatir.isReadyUnSeen = true
        oneSatir.newSelected = true
      }
      return oneSatir
    })

    let metrajPreparing = 0
    let metrajReady = 0
    hazirlananMetraj_state2.satirlar.map(oneSatir => {
      metrajPreparing += oneSatir.isPreparing ? Number(oneSatir.metraj) : 0
      metrajReady += oneSatir.isReady || oneSatir.isSelected || oneSatir.hasSelectedCopy ? Number(oneSatir.metraj) : 0
    })
    hazirlananMetraj_state2.metrajPreparing = metrajPreparing
    hazirlananMetraj_state2.metrajReady = metrajReady

    hazirlananMetraj_state2.satirlar.find(x => x.newSelected) ? setIsChanged_ready(true) : setIsChanged_ready()
    setHazirlananMetraj_state(hazirlananMetraj_state2)
  }


  const removeRow_ready = (oneRow) => {

    let hazirlananMetraj_state2 = _.cloneDeep(hazirlananMetraj_state)
    hazirlananMetraj_state2.satirlar = hazirlananMetraj_state2.satirlar.map(oneSatir => {
      if (oneSatir.satirNo === oneRow.satirNo) {
        delete oneSatir.isReady
        delete oneSatir.isReadyUnSeen
        // oneSatir.newSelected ? delete oneSatir.newSelected : oneSatir.newSelected = true
        delete oneSatir.newSelected
      }
      return oneSatir
    })


    let metrajPreparing = 0
    let metrajReady = 0
    hazirlananMetraj_state2.satirlar.map(oneSatir => {
      metrajPreparing += oneSatir.isPreparing ? Number(oneSatir.metraj) : 0
      metrajReady += oneSatir.isReady || oneSatir.isSelected || oneSatir.hasSelectedCopy ? Number(oneSatir.metraj) : 0
    })
    hazirlananMetraj_state2.metrajPreparing = metrajPreparing
    hazirlananMetraj_state2.metrajReady = metrajReady

    hazirlananMetraj_state2.satirlar.find(x => x.newSelected) ? setIsChanged_ready(true) : setIsChanged_ready()
    setHazirlananMetraj_state(hazirlananMetraj_state2)
  }

  const cancel_ready = () => {
    setHazirlananMetraj_state(_.cloneDeep(hazirlananMetraj_backUp))
    setIsChanged_ready()
    setMode_ready()
  }


  const save_ready = async () => {
    try {

      // console.log("hazirlananMetraj_state",hazirlananMetraj_state)
      // await RealmApp?.currentUser.callFunction("update_hazirlananMetraj_ready", ({ _dugumId: selectedNode._id, hazirlananMetraj_state }))

      const response = await fetch(`api/dugumler/updatehazirlananmetrajready`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dugumId: selectedNode._id,
          hazirlananMetraj_state
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

      if (!responseJson.ok) {
        console.log("responseJson", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


      queryClient.invalidateQueries(['dataHazirlananMetraj'])
      setIsChanged_ready()
      setMode_ready()
      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          setIsChanged_ready()
          setMode_ready()
          queryClient.invalidateQueries(['dataHazirlananMetraj'])
        }
      })
    }
  }












  // GENEL - bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const ikiHane = (value) => {
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const metrajValue = (oneRow, oneProperty, isMinha) => {

    if (oneProperty == "pozBirim") return pozBirim
    if (oneProperty.includes("carpan")) return mode_edit && oneRow.isPreparing ? oneRow[oneProperty] : ikiHane(oneRow[oneProperty])
    if (oneProperty == "metraj") return ikiHane(oneRow[oneProperty])

    // yukarıdaki hiçbiri değilse
    return oneRow[oneProperty]

  }





  // CSS
  const css_enUstBaslik = {
    mb: "1rem", px: "0.3rem", border: "1px solid black", backgroundColor: "lightgray", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliBaslik = {
    px: "0.3rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliBaslik_Yayinlanan = {
    px: "0.3rem", border: "1px solid black", borderBottom: "3px solid black", backgroundColor: myTema.renkler.inaktifGri, display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliSatir = {
    px: "0.3rem", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
  }


  const gridTemplateColumns1 = 'max-content minmax(min-content, 5fr) repeat(7, minmax(min-content, 1fr)) 0.5rem max-content'

  pozBirim = selectedProje?.pozBirimleri.find(item => item.id == selectedPoz?.pozBirimId)?.name


  return (

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      <Grid name="metrajCetveliHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajOlusturCetvel

          mode_edit={mode_edit} setMode_edit={setMode_edit}
          mode_ready={mode_ready} setMode_ready={setMode_ready}

          save_edit={save_edit} cancel_edit={cancel_edit} isChanged_edit={isChanged_edit} setIsChanged_edit={setIsChanged_edit}
          save_ready={save_ready} cancel_ready={cancel_ready} isChanged_ready={isChanged_ready} setIsChanged_ready={setIsChanged_ready}
        />
      </Grid>


      {hazirlananMetraj_state &&

        < Box sx={{ width: "65rem", display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>


          {/* En Üst Başlık Satırı */}
          < React.Fragment >
            <Box sx={{ ...css_enUstBaslik }}>
              Sıra
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Açıklama
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Benzer
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Adet
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              En
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Boy
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Yük.
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Metraj
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Birim
            </Box>

            <Box>
            </Box>

            <Box>
            </Box>

          </React.Fragment >



          {/* Metraj Cetveli Başlık Satırı */}
          <React.Fragment>

            <Box sx={{ ...css_metrajCetveliBaslik, gridColumn: "1/8", justifyContent: "end", pr: "1rem" }}>
              Hazırlık Aşamasındaki Metraj
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: hazirlananMetraj_state["metraj"] < 0 ? "red" : null }}>
              {ikiHane(hazirlananMetraj_state["metrajPreparing"])}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
              {pozBirim}
            </Box>

            <Box></Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
            </Box>

          </React.Fragment>



          {/* Metraj Cetveli Başlık Satırı */}
          <React.Fragment>

            <Box sx={{ ...css_metrajCetveliBaslik_Yayinlanan, gridColumn: "1/8", justifyContent: "end", pr: "1rem" }}>
              Hazırlanmış Metraj
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik_Yayinlanan, justifyContent: "end", pr: "0.3rem", color: hazirlananMetraj_state["metraj"] < 0 ? "red" : null }}>
              {ikiHane(hazirlananMetraj_state["metrajReady"])}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik_Yayinlanan }}>
              {pozBirim}
            </Box>

            <Box></Box>


            {/* ALLTAKİ 4 TANEDEN BİRİ GÖSTERİLİYOR */}
            {!mode_ready &&
              <Box sx={{ ...css_metrajCetveliBaslik_Yayinlanan }}>
                Durum
              </Box>
            }

            {mode_ready &&
              <Box onClick={() => add_OneRow_ready_all()} sx={{ ...css_metrajCetveliBaslik_Yayinlanan, cursor: "pointer" }}>
                <CheckCircleIcon variant="contained" sx={{ minWidth: "3.05rem", color: "gray", fontSize: "1.1rem" }} />
              </Box>
            }



          </React.Fragment>


          {hazirlananMetraj_state.satirlar.sort((a, b) => a.satirNo.substring(a.satirNo.indexOf("-") + 1, a.satirNo.length) - b.satirNo.substring(b.satirNo.indexOf("-") + 1, b.satirNo.length)).map((oneRow, index) => {
            return (
              < React.Fragment key={index}>

                {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                  // let isCellEdit = (oneProperty === "satirNo" || oneProperty === "pozBirim" || oneProperty === "metraj") ? false : true
                  let isCellEdit = mode_edit && !oneRow.hasSelectedCopy && !oneRow.isSelected && !oneRow.isReady && (oneProperty.includes("aciklama") || oneProperty.includes("carpan")) ? true : false
                  let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                  return (
                    <React.Fragment key={index}>

                      {isCellEdit &&
                        <Box sx={{
                          ...css_metrajCetveliSatir,
                          backgroundColor: !oneRow.isSelected && oneProperty.includes("aciklama") ? "rgba(255,255,0, 0.3)" : !oneRow.isSelected && oneProperty.includes("carpan") ? "rgba(255,255,0, 0.3)" : null,
                          minWidth: oneProperty.includes("aciklama") ? "10rem" : oneProperty.includes("1") || oneProperty.includes("2") ? "4rem" : "6rem"
                        }}>
                          <Input
                            // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                            // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                            // autoFocus={true}
                            autoComplete='off'
                            id={oneRow.satirNo + oneProperty}
                            name={oneRow.satirNo + oneProperty}
                            readOnly={oneRow.isSelected}
                            disableUnderline={true}
                            // size="small"
                            type={oneProperty.includes("carpan") ? "number" : "text"}
                            // type={"text"}
                            // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                            // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                            onKeyDown={oneProperty.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                            onChange={(event) => handle_input_onChange(event, oneRow.satirNo, oneProperty)}
                            sx={{
                              // height: "100%",
                              // pt: "0.3rem",
                              color: isMinha ? "red" : null,
                              // justifyItems: oneBaslik.yatayHiza,
                              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                display: "none",
                              },
                              "& input[type=number]": {
                                MozAppearance: "textfield",
                              },
                            }}
                            // metrajValue={oneRow[oneProperty]}
                            // value={metrajValue(oneRow, oneProperty, isMinha)}
                            value={metrajValue(oneRow, oneProperty, isMinha)}
                            inputProps={{
                              style: {
                                width: "100%",
                                boxSizing: "border-box",
                                // mt: "0.5rem",
                                // height: "0.95rem",
                                // minWidth: oneProperty.includes("aciklama") ? "min-content" : "4rem",
                                // width: "min-content",
                                textAlign: oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : oneProperty.includes("aciklama") ? "start" : "center"
                              },
                              step: "0.1", lang: "en-US"
                            }}
                          />
                        </Box>
                      }

                      {!isCellEdit &&
                        <Box sx={{
                          ...css_metrajCetveliSatir,
                          backgroundColor: (oneRow.isReady || oneRow.isSelected || oneRow.hasSelectedCopy) ? myTema.renkler.inaktifGri : null,
                          // backgroundColor: oneRow.isPreparing && "rgba( 253, 197, 123 , 0.2 )",
                          justifyContent: oneProperty.includes("aciklama") ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
                          minWidth: oneProperty.includes("carpan") ? "5rem" : oneProperty.includes("metraj") ? "5rem" : null,
                          color: isMinha ? "red" : null
                        }}>
                          {metrajValue(oneRow, oneProperty, isMinha)}
                        </Box>
                      }

                    </React.Fragment>
                  )

                })}

                <Box></Box>

                <Box
                  onClick={() =>
                    mode_ready && !oneRow.isReadyBack && !oneRow.isSelected && !oneRow.isReady ? addRow_ready(oneRow) :
                      mode_ready && !oneRow.isSelected && oneRow.isReady && oneRow.newSelected && removeRow_ready(oneRow)

                  }
                  sx={{
                    // backgroundColor: oneRow.isSelected ? null : "rgba(255,255,0, 0.3)",
                    // backgroundColor: "rgba(255,255,0, 0.3)",
                    cursor: "pointer",
                    display: "grid",
                    alignItems: "center",
                    justifyItems: "center",
                    px: "0.3rem",
                    border: "1px solid black"
                  }}>
                  {oneRow.isSelected && !oneRow.hasSelectedCopy &&
                    <DoneAllIcon variant="contained" sx={{ color: "black", fontSize: "1.2rem" }} />
                  }
                  {oneRow.hasSelectedCopy &&
                    <DoneAllIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                  }
                  {oneRow.isReady && !oneRow.isReadyUnSeen &&
                    <Visibility variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                  }
                  {oneRow.isReady && !oneRow.isSelected && oneRow.isReadyUnSeen && oneRow.newSelected &&
                    <Circle variant="contained" sx={{ color: "gray", fontSize: "0.8rem" }} />
                  }
                  {oneRow.isReady && !oneRow.isSelected && oneRow.isReadyUnSeen && !oneRow.newSelected &&
                    <CheckIcon variant="contained" sx={{ color: "black", fontSize: "1.2rem" }} />
                  }
                  {oneRow.isPreparing && oneRow.isReadyBack &&
                    <ReplyIcon variant="contained" sx={{ color: "red", fontSize: "0.95rem" }} />
                  }
                  {/* {!oneRow.isSelected && oneRow.isReady && oneRow.newSelected &&
                    <CircleIcon variant="contained" sx={{ color: "rgba(15, 99, 7, 0.52)", fontSize: "0.70rem" }} />
                  }
                  {!oneRow.isSelected && !oneRow.isReady &&
                    <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                  } */}
                </Box>

              </React.Fragment>
            )

          })}


        </Box >
      }





    </ >

  )

}


