
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import _ from 'lodash';


import ShowMetrajYapabilenler from '../../components/ShowMetrajYapabilenler.js'
import HeaderMetrajOnayla from '../../components/HeaderMetrajOnayla.js'

import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahalListesi, useGetHazirlananMetrajlar, useUpdateOnaylananMetraj, useGetOnaylananMetraj } from '../../hooks/useMongo.js';


import { fontSize, fontWeight, styled } from '@mui/system';
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
import LockIcon from '@mui/icons-material/Lock';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


export default function P_MetrajOnay() {

  const queryClient = useQueryClient()

  const {
    RealmApp,
    subHeaderHeight, myTema,
    selectedProje, selectedPoz_metraj, selectedNode_metraj
  } = useContext(StoreContext)

  const { showMetrajYapabilenler, setShowMetrajYapabilenler } = useContext(StoreContext)
  const yetkililer = selectedProje?.yetki.yetkililer
  const metrajYapabilenler = selectedProje?.yetki.metrajYapabilenler


  const [dialogAlert, setDialogAlert] = useState()
  const [show, setShow] = useState("DugumMetrajlari")
  const [isChanged, setIsChanged] = useState()

  const [hazirlananMetrajlar_state, setHazirlananMetrajlar_state] = useState()
  const [hazirlananMetrajlar_backUp, setHazirlananMetrajlar_backUp] = useState()

  const [_pozId, set_pozId] = useState()


  let pozBirim
  let pozMetraj

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


  const { data: hazirlananMetrajlar } = useGetHazirlananMetrajlar()


  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode_metraj && navigate("/metrajpozmahaller")
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar))
    setHazirlananMetrajlar_backUp(_.cloneDeep(hazirlananMetrajlar))
    setIsChanged()
  }, [hazirlananMetrajlar])



  const handle_satirSec = ({ oneRow, hazirlayan }) => {

    if (!isChanged) {
      setIsChanged(true)
    }

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isSelected = true
            oneSatir.newSelected = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }







  const handle_satirIptal = ({ oneRow, hazirlayan }) => {

    if (!oneRow.newSelected) {
      return
    }

    if (!isChanged) {
      setIsChanged(true)
    }


    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            delete oneSatir.isSelected
            delete oneSatir.newSelected
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  const cancel = () => {
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar_backUp))
    setIsChanged()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save = async () => {

    if (isChanged) {

      try {
        // let newSelecteds = hazirlananMetrajlar_state.filter(x => x.newSelected)
        let hazirlananMetrajlar_selected = metrajYapabilenler.map(oneYapabilen => {
          let satirlar = hazirlananMetrajlar_state.find(x => x.userEmail === oneYapabilen.userEmail)?.satirlar.filter(x => x.newSelected)
          if (satirlar?.length > 0) {
            satirlar = satirlar.map(x => {
              delete x.newSelected
              return x
            })
            return { userEmail: oneYapabilen.userEmail, satirlar }
          }
        })
        hazirlananMetrajlar_selected = hazirlananMetrajlar_selected.filter(x => x)

        const results = await Promise.all(hazirlananMetrajlar_selected.map(async (oneHazirlanan) => {
          const result = await RealmApp?.currentUser.callFunction("update_hazirlananMetraj_selected", ({ _projeId: selectedProje._id, _dugumId: selectedNode_metraj._id, hazirlananMetraj_selected: oneHazirlanan }))
          return result
        }));

        console.log("results", results)

        // await RealmApp?.currentUser.callFunction("update_hazirlananMetraj_selected", ({ _projeId: selectedProje._id, _dugumId: selectedNode_metraj._id, hazirlananMetraj_selected }))

        queryClient.invalidateQueries(['onaylananMetraj', selectedNode_metraj?._id.toString()])
        queryClient.invalidateQueries(['hazirlananMetrajlar', selectedNode_metraj?._id.toString()])

        setShow("DugumMetrajlari")
        setIsChanged()
        return

      } catch (err) {

        console.log(err)

        let dialogIcon = "warning"
        let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
        let onCloseAction = () => setDialogAlert()

        if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
          let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
          let mesajBitis = err.message.indexOf("__mesajBitis__")
          dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
          dialogIcon = "info"
          onCloseAction = () => {
            setDialogAlert()
            queryClient.invalidateQueries(['hazirlananMetrajlar', selectedNode_metraj?._id.toString()])
          }
        }
        setDialogAlert({
          dialogIcon,
          dialogMessage,
          detailText: err?.message ? err.message : null,
          onCloseAction
        })

      }
    }

  }


  const toggleShow = ({ userEmail }) => {

    let showMetrajYapabilenler2 = _.cloneDeep(showMetrajYapabilenler)

    showMetrajYapabilenler2 = showMetrajYapabilenler2.map(oneYapabilen => {
      if (oneYapabilen.userEmail === userEmail) {
        oneYapabilen.isSelected = !oneYapabilen.isSelected
      }
      return oneYapabilen
    })

    setShowMetrajYapabilenler(showMetrajYapabilenler2)

  }


  // GENEL - bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`Number` alone does not do this)...
      !isNaN(Number(str)) // ...and ensure strings of whitespace fail
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
    if (oneProperty.includes("carpan")) return show !== "EditMetraj" ? ikiHane(oneRow[oneProperty]) : oneRow[oneProperty]
    if (oneProperty == "metraj") return ikiHane(oneRow[oneProperty])

    // yukarıdaki hiçbiri değilse
    return oneRow[oneProperty]

  }



  // CSS
  const css_enUstBaslik = {
    px: "0.3rem", border: "1px solid black", backgroundColor: "lightgray", display: "grid", alignItems: "center", justifyContent: "center"
  }


  const css_metrajCetveliBaslik = {
    mt: "1.5rem", px: "0.3rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliSatir = {
    px: "0.3rem", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajOnayBaslik = {
    mt: "2rem", px: "0.3rem", border: "1px solid black", fontWeight: "600", backgroundColor: myTema.renkler.metrajOnaylananBaslik, display: "grid", alignItems: "center", justifyContent: "center"
  }

  const gridTemplateColumns1 = 'max-content minmax(min-content, 5fr) repeat(7, minmax(min-content, 1fr)) 1rem max-content'

  pozBirim = selectedProje?.pozBirimleri.find(item => item.id == selectedPoz_metraj?.pozBirimId)?.name


  return (

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction}
        />
      }

      <Grid item sx={{ mt: (Number(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajOnayla
          show={show} setShow={setShow}
          save={save}
          cancel={cancel}
          isChanged={isChanged} setIsChanged={setIsChanged}
        />
      </Grid>


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowMetrajYapabilenler" &&
        <ShowMetrajYapabilenler
          setShow={setShow}
        />
      }



      {!metrajYapabilenler?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bu projede metraj yapabilecek bir kişi oluşturulmamış
          </Alert>
        </Stack>
      }


      {metrajYapabilenler?.length > 0 && !showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Metraj yapabilenlerin tümünü gösterime kapattınız.
          </Alert>
        </Stack>
      }



      {showMetrajYapabilenler?.filter(x => x.isShow).length > 0 &&


        < Box sx={{ width: "65rem", display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>

          <Box sx={{ mt: "0rem", mb: "1rem", gridColumn: "1/12", fontWeight: "600" }}>
            Hazırlanan Metrajlar
          </Box>

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




          {showMetrajYapabilenler?.filter(x => x.isShow).map((oneYapabilen, index) => {

            const oneHazirlanan = hazirlananMetrajlar_state?.find(x => x.userEmail === oneYapabilen.userEmail)

            let hazirlayan = yetkililer?.find(oneYetkili => oneYetkili.userEmail === oneYapabilen.userEmail)

            return (

              <React.Fragment key={index}>
                {/* Metraj Cetveli Başlık Satırı */}
                <React.Fragment>

                  <Box sx={{ ...css_metrajCetveliBaslik, gridColumn: "1/8", justifyContent: "start", pr: "1rem", display: "grid", gridTemplateColumns: "1fr max-content" }}>
                    <Box sx={{}}>
                      {hazirlayan?.isim + " " + hazirlayan?.soyisim}
                    </Box>
                    {oneYapabilen.isSelected &&
                      <ExpandLessIcon onClick={() => toggleShow({ userEmail: oneYapabilen.userEmail })} sx={{ cursor: "pointer" }} />
                    }
                    {!oneYapabilen.isSelected &&
                      <ExpandMoreIcon onClick={() => toggleShow({ userEmail: oneYapabilen.userEmail })} sx={{ cursor: "pointer" }} />
                    }
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: oneHazirlanan?.metraj < 0 ? "red" : null }}>
                    {oneHazirlanan?.metraj ? ikiHane(oneHazirlanan?.metraj) : ""}
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik }}>
                    {pozBirim}
                  </Box>

                  <Box></Box>

                  <Box sx={{ ...css_metrajCetveliBaslik }}>
                    Durum
                  </Box>

                </React.Fragment>




                {
                  oneHazirlanan?.satirlar.map((oneRow, index) => {

                    if (!oneYapabilen.isSelected) {
                      return
                    }
                    // console.log("oneHazirlanan",oneHazirlanan)


                    return (
                      < React.Fragment key={index}>

                        {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {

                          let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                          return (
                            <React.Fragment key={index}>

                              <Box
                                onClick={() => !oneRow?.isSelected ? handle_satirSec({ oneRow, hazirlayan }) : !oneRow?.isLock ? handle_satirIptal({ oneRow, hazirlayan }) : null}
                                sx={{
                                  ...css_metrajCetveliSatir,
                                  cursor: "pointer",
                                  backgroundColor: oneRow?.isSelected && myTema.renkler.inaktifGri,
                                  justifyContent: (oneProperty.includes("satirNo") || oneProperty.includes("aciklama")) ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
                                  minWidth: oneProperty.includes("carpan") ? "5rem" : oneProperty.includes("metraj") ? "5rem" : null,
                                  color: isMinha ? "red" : null
                                }}>
                                {metrajValue(oneRow, oneProperty, isMinha)}
                              </Box>

                            </React.Fragment>
                          )

                        })}

                        <Box></Box>

                        <Box
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
                          {oneRow?.isSelected && !oneRow?.newSelected &&
                            <LockIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                          }
                          {/* {!oneRow?.isSelected &&
                          <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                        } */}
                        </Box>

                      </React.Fragment>
                    )

                  })
                }

              </React.Fragment>

            )
          })}


          {/* ONAYLANAN METRAJ SATIRLARI GİZLENDİ */}
          {/* <React.Fragment>

            <React.Fragment>


              <Box sx={{ ...css_metrajOnayBaslik, gridColumn: "1/8", justifyContent: "end", pr: "1rem" }}>
                Onaylanan Metraj
              </Box>

              <Box sx={{ ...css_metrajOnayBaslik, justifyContent: "end", pr: "0.3rem", color: onaylananMetraj?.metraj < 0 ? "red" : null }}>
                {onaylananMetraj_state?.metraj ? ikiHane(onaylananMetraj_state?.metraj) : "0,00"}
              </Box>

              <Box sx={{ ...css_metrajOnayBaslik }}>
                {pozBirim}
              </Box>

              <Box></Box>

              <Box sx={{ ...css_metrajOnayBaslik }}>
                Durum
              </Box>

            </React.Fragment>


            {onaylananMetraj_state?.satirlar.filter(x => !x.isDeactive).map((oneRow, index) => {
              return (
                < React.Fragment key={index}>

                  {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {

                    let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                    return (
                      <React.Fragment key={index}>

                        <Box sx={{
                          ...css_metrajCetveliSatir,
                          backgroundColor: (oneRow?.isSelected && !oneRow?.isEdit) ? myTema.renkler.inaktifGri : oneRow?.isEdit ? "rgba(255, 255, 23, 0.12)" : null,
                          justifyContent: (oneProperty.includes("satirNo") || oneProperty.includes("aciklama")) ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
                          minWidth: oneProperty.includes("carpan") ? "5rem" : oneProperty.includes("metraj") ? "5rem" : null,
                          color: isMinha ? "red" : null
                        }}>
                          {metrajValue(oneRow, oneProperty, isMinha)}
                        </Box>

                      </React.Fragment>
                    )

                  })}

                  <Box></Box>

                  <Box
                    onClick={() => console.log("deneme")}
                    sx={{
                      cursor: "pointer",
                      display: "grid",
                      alignItems: "center",
                      justifyItems: "center",
                      px: "0.3rem",
                      border: "1px solid black"
                    }}>
                    {!oneRow.isEdit &&
                      <LockIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                    }
                    {oneRow.isEdit &&
                      <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                    }
                  </Box>

                </React.Fragment>
              )

            })}

          </React.Fragment> */}



        </Box >
      }





    </ >

  )

}


