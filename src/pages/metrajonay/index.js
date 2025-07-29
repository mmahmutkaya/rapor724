
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import _ from 'lodash';


import { DialogAlert } from '../../components/general/DialogAlert.js';
import HeaderMetrajOnay from '../../components/HeaderMetrajOnay'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahalListesi, useGetHazirlananMetrajlar, useUpdateOnaylananMetraj, useGetOnaylananMetraj } from '../../hooks/useMongo';


import { fontWeight, styled } from '@mui/system';
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

export default function P_MetrajOnay() {

  const queryClient = useQueryClient()

  const {
    RealmApp,
    subHeaderHeight, myTema,
    selectedProje, selectedPoz_metraj, selectedNode_metraj
  } = useContext(StoreContext)

  const yetkililer = selectedProje?.yetki.yetkililer


  const [dialogAlert, setDialogAlert] = useState()
  const [show, setShow] = useState("DugumMetrajlari")
  const [approveMode, setApproveMode] = useState()
  const [isChanged, setIsChanged] = useState()

  const [hazirlananMetrajlar_state, setHazirlananMetrajlar_state] = useState()
  const [onaylananMetraj_state, setOnaylananMetraj_state] = useState()

  const [hazirlananMetrajlar_backUp, setHazirlananMetrajlar_backUp] = useState()
  const [onaylananMetraj_backUp, setOnaylananMetraj_backUp] = useState()

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
  const { data: onaylananMetraj } = useGetOnaylananMetraj()


  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode_metraj && navigate("/metrajpozmahaller")
    setHazirlananMetrajlar_state(_.cloneDeep(hazirlananMetrajlar))
    setOnaylananMetraj_state(_.cloneDeep(onaylananMetraj))
  }, [hazirlananMetrajlar, onaylananMetraj])



  const handle_satirOnayla = ({ oneRow, hazirlayan }) => {

    if (!isChanged) {
      setHazirlananMetrajlar_backUp(_.cloneDeep(hazirlananMetrajlar_state))
      setOnaylananMetraj_backUp(_.cloneDeep(onaylananMetraj_state))
      setIsChanged(true)
    }

    let onaylananMetraj_state2 = _.cloneDeep(onaylananMetraj_state)
    let maxNumber = 0
    onaylananMetraj_state2.satirlar.map(x => {
      if (x?.siraNo > maxNumber) {
        maxNumber = x.siraNo
      }
    })
    onaylananMetraj_state2.satirlar = [...onaylananMetraj_state2.satirlar, { ...oneRow, isUsed: true, siraNo: maxNumber + 1 }]

    if (oneRow.metraj > 0 || oneRow.metraj < 0) {
      onaylananMetraj_state2.metraj = parseFloat(onaylananMetraj_state2.metraj) + parseFloat(oneRow.metraj)
    }
    setOnaylananMetraj_state(onaylananMetraj_state2)

    // hazirlanan metrajlar güncelleme alanı
    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isUsed = true
            oneSatir.isChanged = true
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })
    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }




  const handle_satirIptal = ({ oneRow, hazirlayan }) => {

    if (!isChanged) {
      setHazirlananMetrajlar_backUp(_.cloneDeep(hazirlananMetrajlar_state))
      setOnaylananMetraj_backUp(_.cloneDeep(onaylananMetraj_state))
      setIsChanged(true)
    }

    let onaylananMetraj_state2 = _.cloneDeep(onaylananMetraj_state)
    onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.filter(x => x.satirNo !== oneRow.satirNo)
    let count = 1
    onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.sort((a, b) => a.siraNo - b.siraNo).map(x => {
      x.siraNo = count
      count = count + 1
      return x
    })
    if (oneRow.metraj > 0 || oneRow.metraj < 0) {
      onaylananMetraj_state2.metraj = parseFloat(onaylananMetraj_state2.metraj) - parseFloat(oneRow.metraj)
    }
    setOnaylananMetraj_state(onaylananMetraj_state2)

    let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
    hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {
      if (oneHazirlanan.userEmail === hazirlayan.userEmail) {
        oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === oneRow.satirNo) {
            oneSatir.isUsed = false
            oneSatir.isChanged = true
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
    setOnaylananMetraj_state(_.cloneDeep(onaylananMetraj_backUp))
    setIsChanged()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save = async () => {

    if (isChanged) {
      try {

        let hazirlananlar_used
        let hazirlananlar_unUsed

        let hazirlananMetrajlar_state2 = _.cloneDeep(hazirlananMetrajlar_state)
        hazirlananMetrajlar_state2 = hazirlananMetrajlar_state2.map(oneHazirlanan => {

          if (oneHazirlanan.satirlar.find(x => x.isChanged)) {
            oneHazirlanan.satirlar = oneHazirlanan.satirlar.map(oneRow => {

              // changed olmuş ve used ise
              if (oneRow.isChanged && oneRow.isUsed) {

                //  db ye göndereeğimiz 'hazirlananlar_used' henüz hiç oluşmamışsa
                if (!hazirlananlar_used) {
                  hazirlananlar_used = [{ userEmail: oneHazirlanan.userEmail, satirNolar: [oneRow.satirNo] }]

                  //  db ye göndereeğimiz 'hazirlananlar_used' - oluşmuşsa ve oluşturan kullanıcı da varsa
                } else if (hazirlananlar_used?.find(x => x.userEmail === oneHazirlanan.userEmail)) {
                  hazirlananlar_used = hazirlananlar_used.map(oneUsedSatir => {
                    if (oneUsedSatir.userEmail === oneHazirlanan.userEmail) {
                      oneUsedSatir.satirNolar = [...oneUsedSatir.satirNolar, oneRow.satirNo]
                    }
                    return oneUsedSatir
                  })

                  //  db ye göndereeğimiz 'hazirlananlar_used' - oluşmuşsa fakat kullanıcınınki henüz yoksa
                } else {
                  hazirlananlar_used = [...hazirlananlar_used, { userEmail: oneHazirlanan.userEmail, satirNolar: [oneRow.satirNo] }]
                }

              }

              // changed olmuş ve unUsed ise
              if (oneRow.isChanged && !oneRow.isUsed) {

                //  db ye göndereeğimiz 'hazirlananlar_unUsed' henüz hiç oluşmamışsa
                if (!hazirlananlar_unUsed) {
                  hazirlananlar_unUsed = [{ userEmail: oneHazirlanan.userEmail, satirNolar: [oneRow.satirNo] }]

                  //  db ye göndereeğimiz 'hazirlananlar_unUsed' - oluşmuşsa ve oluşturan kullanıcı da varsa
                } else if (hazirlananlar_unUsed?.find(x => x.userEmail === oneHazirlanan.userEmail)) {
                  hazirlananlar_unUsed = hazirlananlar_unUsed.map(oneUsedSatir => {
                    if (oneUsedSatir.userEmail === oneHazirlanan.userEmail) {
                      oneUsedSatir.satirNolar = [...oneUsedSatir.satirNolar, oneRow.satirNo]
                    }
                    return oneUsedSatir
                  })

                  //  db ye göndereeğimiz 'hazirlananlar_unUsed' - oluşmuşsa fakat kullanıcınınki henüz yoksa
                } else {
                  hazirlananlar_unUsed = [...hazirlananlar_unUsed, { userEmail: oneHazirlanan.userEmail, satirNolar: [oneRow.satirNo] }]
                }

              }

              // frontend de görünen state deki veri de ye göndermek için ayıklandığı için isChanged ler false yapıyoruz, birdahaki db kaydetmesinde tekrar gönderilmesin 
              oneRow.isChanged = false
              return oneRow
            })
          }

          return oneHazirlanan
        })

        setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

        // console.log("hazirlananlar_used", hazirlananlar_used)
        // console.log("hazirlananlar_unUsed", hazirlananlar_unUsed)

        await RealmApp?.currentUser.callFunction("update_onaylananMetraj", ({ _dugumId: selectedNode_metraj._id, onaylananMetraj_state, hazirlananlar_used, hazirlananlar_unUsed }))

        queryClient.invalidateQueries(['onaylananMetraj', selectedNode_metraj?._id.toString()])
        queryClient.invalidateQueries(['hazirlananMetrajlar', selectedNode_metraj?._id.toString()])

        setShow("DugumMetrajlari")
        setIsChanged()
        return

      } catch (error) {

        console.log(error)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
          detailText: error?.message ? error.message : null
        })

      }
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
    if (oneProperty.includes("carpan")) return show !== "EditMetraj" ? ikiHane(oneRow[oneProperty]) : oneRow[oneProperty]
    if (oneProperty == "metraj") return ikiHane(oneRow[oneProperty])

    // yukarıdaki hiçbiri değilse
    return oneRow[oneProperty]

  }



  // CSS
  const css_enUstBaslik = {
    px: "0.3rem", border: "1px solid black", backgroundColor: "lightgray", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajOnayBaslik = {
    mt: "2rem", px: "0.3rem", border: "1px solid black", fontWeight: "600", backgroundColor: myTema.renkler.metrajOnaylananBaslik, display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliBaslik = {
    mt: "2rem", px: "0.3rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliSatir = {
    px: "0.3rem", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
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
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Grid item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajOnay
          show={show} setShow={setShow}
          save={save}
          cancel={cancel}
          isChanged={isChanged} setIsChanged={setIsChanged}
        />
      </Grid>


      {!hazirlananMetrajlar?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bu mahalde, bu poza ait henüz herhangi bir metraj oluşturulmamış.
          </Alert>
        </Stack>
      }


      {hazirlananMetrajlar_state?.length &&

        < Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>


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



          <Box sx={{ mt: "0.7rem", mb: "-1rem", gridColumn: "1/5", fontWeight: "600" }}>
            Hazırlanan Metrajlar
          </Box>


          {hazirlananMetrajlar_state.map((oneHazirlanan, index) => {

            let hazirlayan = yetkililer.find(oneYetkili => oneYetkili.userEmail === oneHazirlanan.userEmail)

            return (

              <React.Fragment key={index}>
                {/* Metraj Cetveli Başlık Satırı */}
                <React.Fragment>

                  <Box sx={{ ...css_metrajCetveliBaslik, gridColumn: "1/8", justifyContent: "start", pr: "1rem" }}>
                    {hazirlayan.isim + " " + hazirlayan.soyisim}
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: oneHazirlanan?.metraj < 0 ? "red" : null }}>
                    {ikiHane(oneHazirlanan?.metraj)}
                  </Box>

                  <Box sx={{ ...css_metrajCetveliBaslik }}>
                    {pozBirim}
                  </Box>

                  <Box></Box>

                  <Box sx={{ ...css_metrajCetveliBaslik }}>
                    Durum
                  </Box>

                </React.Fragment>


                {oneHazirlanan.satirlar.map((oneRow, index) => {

                  return (
                    < React.Fragment key={index}>

                      {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {

                        let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                        return (
                          <React.Fragment key={index}>

                            <Box
                              onClick={() => !oneRow?.isUsed ? handle_satirOnayla({ oneRow, hazirlayan }) : handle_satirIptal({ oneRow, hazirlayan })}
                              sx={{
                                ...css_metrajCetveliSatir,
                                cursor: "pointer",
                                backgroundColor: oneRow?.isUsed && myTema.renkler.inaktifGri,
                                justifyContent: oneProperty.includes("aciklama") ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
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
                          // backgroundColor: oneRow.isUsed ? null : "rgba(255,255,0, 0.3)",
                          // backgroundColor: "rgba(255,255,0, 0.3)",
                          cursor: "pointer",
                          display: "grid",
                          alignItems: "center",
                          justifyItems: "center",
                          px: "0.3rem",
                          border: "1px solid black"
                        }}>
                        {oneRow?.isUsed &&
                          <LockIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                        }
                        {/* {!oneRow?.isUsed &&
                          <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                        } */}
                      </Box>

                    </React.Fragment>
                  )

                })}

              </React.Fragment>

            )
          })}






          <React.Fragment>
            {/* Onaylanan Metraj Başlık Satırı */}
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
                          justifyContent: oneProperty.includes("aciklama") ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
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
                      // backgroundColor: oneRow.isUsed ? null : "rgba(255,255,0, 0.3)",
                      // backgroundColor: "rgba(255,255,0, 0.3)",
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

          </React.Fragment>

        </Box >
      }





    </ >

  )

}


