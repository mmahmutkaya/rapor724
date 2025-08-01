
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import _ from 'lodash';


import { DialogAlert } from '../../components/general/DialogAlert.js';
import HeaderMetrajCetveliOnaylanan from '../../components/HeaderMetrajOnaylaCetvel.js'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetOnaylananMetraj } from '../../hooks/useMongo.js';


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
import StarIcon from '@mui/icons-material/Star';
import ReplyIcon from '@mui/icons-material/Reply';



export default function P_MetrajCetveliOnaylanan() {

  const queryClient = useQueryClient()

  const { RealmApp, myTema, subHeaderHeight } = useContext(StoreContext)
  const { selectedProje, selectedPoz_metraj, selectedNode_metraj } = useContext(StoreContext)
  const yetkililer = selectedProje?.yetki.yetkililer

  const [dialogAlert, setDialogAlert] = useState()
  const [show, setShow] = useState("Main")
  const [showDeActive, setShowDeActive] = useState()
  const [isChanged, setIsChanged] = useState()
  const [onaylananMetraj_state, setOnaylananMetraj_state] = useState()
  const [onaylananMetraj_backUp, setOnaylananMetraj_backUp] = useState()
  const [hasDeActive, setHasDeActive] = useState()
  const [_pozId] = useState()
  const [isChanged_revize, setIsChanged_revize] = useState()
  const [revizeIptalSatirNolar, setRevizeIptalSatirNolar] = useState([])
  const [deActiveIptalSatirNolar, setDeActiveIptalSatirNolar] = useState([])
  // const [isHovered, setIsHovered] = useState(false);


  let pozBirim


  // const { data: onaylananMetraj } = useGetOnaylananMetraj()
  const { data: onaylananMetraj } = useGetOnaylananMetraj()

  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode_metraj && navigate("/metrajonaylapozlar")
    setOnaylananMetraj_state(_.cloneDeep(onaylananMetraj))
    setOnaylananMetraj_backUp(_.cloneDeep(onaylananMetraj))
    setHasDeActive(onaylananMetraj?.satirlar.find(x => x.isDeactive) ? true : false)
  }, [onaylananMetraj])







  // METRAJ REVİZE ETME FONKSİYONLARI

  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = (event, oneSatir, oneProperty) => {

    if (!isChanged) {
      setIsChanged(true)
    }

    let onaylananMetraj_state2 = _.cloneDeep(onaylananMetraj_state)
    // console.log("onaylananMetraj_state2", onaylananMetraj_state2)


    // bu değişim orjinal satırdan gelmişse, satırın kopyasını oluşturacağız, öncelikle satır no revizesi, sonra yoksa oluşturma
    let originalSatirNo
    if (!oneSatir.isEdit) {
      originalSatirNo = oneSatir.satirNo
      oneSatir.satirNo = oneSatir.satirNo + ".1"
    }
    if (!onaylananMetraj_state2.satirlar.find(x => x.satirNo === oneSatir.satirNo)) {
      onaylananMetraj_state2.satirlar = [...onaylananMetraj_state2.satirlar, { ...oneSatir, isEdit: true }]
    }

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    onaylananMetraj_state2["satirlar"] = onaylananMetraj_state2["satirlar"].map(oneRow => {

      if (oneRow.satirNo === originalSatirNo) {

        // onaylılar kısmında deactive ediyoruz çünkü revize oldu artık, hesaba katılmıyor, sadece yapılan revizeyi görmek için istenince gri olarak gösterilecek
        oneRow.isDeactive = true

      }

      if (oneRow.satirNo === oneSatir.satirNo) {

        // önceki satır metrajını çıkartıyoruz, yeni değeri bulunca aşağıda ekleyeceğiz
        onaylananMetraj_state2["metraj"] = Number(onaylananMetraj_state2["metraj"]) - Number(oneRow["metraj"])

        oneRow[oneProperty] = event.target.value

        let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

        if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
          oneRow.metraj = ""
          // onaylananMetraj_state2["metraj"] ı güncelleyecek bir durum yok, önceki değeri yukarıda çıkarmıştık, yenisi zaten sıfır çıktı
          return oneRow
        }

        const oneRowMetraj = (
          (oneRow.carpan1 == "" ? 1 : oneRow.carpan1) *
          (oneRow.carpan2 == "" ? 1 : oneRow.carpan2) *
          (oneRow.carpan3 == "" ? 1 : oneRow.carpan3) *
          (oneRow.carpan4 == "" ? 1 : oneRow.carpan4) *
          (oneRow.carpan5 == "" ? 1 : oneRow.carpan5)
        )

        if (isMinha) {
          oneRow.metraj = oneRowMetraj * -1
          onaylananMetraj_state2["metraj"] = onaylananMetraj_state2["metraj"] + Number(oneRow.metraj)
          // metraj = oneRowMetraj > 0 ? Number(metraj) - Number(oneRowMetraj) : Number(metraj)
          return oneRow
        } else {
          oneRow.metraj = oneRowMetraj
          // metraj = Number(oneRowMetraj) > 0 ? Number(metraj) + Number(oneRowMetraj) : Number(metraj)
          onaylananMetraj_state2["metraj"] = onaylananMetraj_state2["metraj"] + Number(oneRow.metraj)
          return oneRow
        }

      }

      return oneRow

    })

    setOnaylananMetraj_state(onaylananMetraj_state2)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["aciklama"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }





  const save = async () => {

    if (isChanged) {
      try {
        // db deki 'hazırlananMetrajlar' isimli 'collection' daki ilgili 'document' içinde ilgil satırlarda revize olduğunu belirtiyoruz, onaylılardan kaldırılamasın, kitlemek için veri opluyoruz - changed olmuş ve used ise 
        let deActiveSatirlar = onaylananMetraj_state.satirlar.filter(x => x.isDeactive)
        let revizeEdilenler

        if (deActiveSatirlar.length > 0) {

          deActiveSatirlar.map(oneRow => {

            let userCode = oneRow.satirNo.substring(0, oneRow.satirNo.indexOf("-"))
            let userEmail = yetkililer.find(x => x.userCode === userCode).userEmail

            // db ye göndereeğimiz 'revizeEdilenler' henüz hiç oluşmamışsa
            if (!revizeEdilenler) {
              revizeEdilenler = [{ userEmail, satirNolar: [oneRow.satirNo] }]

              //  db ye göndereeğimiz 'revizeEdilenler' - oluşmuşsa ve oluşturan kullanıcı da varsa
            } else if (revizeEdilenler?.find(x => x.userEmail === userEmail)) {
              revizeEdilenler = revizeEdilenler.map(oneRevizeEdilen => {
                if (oneRevizeEdilen.userEmail === userEmail) {
                  oneRevizeEdilen.satirNolar = [...oneRevizeEdilen.satirNolar, oneRow.satirNo]
                }
                return oneRevizeEdilen
              })

              //  db ye göndereeğimiz 'revizeEdilenler' - oluşmuşsa fakat kullanıcınınki henüz yoksa
            } else {
              revizeEdilenler = [...revizeEdilenler, { userEmail, satirNolar: [oneRow.satirNo] }]
            }
          })

        }

        await RealmApp?.currentUser.callFunction("update_onaylananMetrajCetveli", ({ _dugumId: selectedNode_metraj._id, onaylananMetraj_state, revizeEdilenler }))
        setShow("Main")
        queryClient.invalidateQueries(['onaylananMetrajlar', selectedNode_metraj?._id.toString()])
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



  const cancel = () => {
    // queryClient.invalidateQueries(['onaylananMetraj'])
    setOnaylananMetraj_state(_.cloneDeep(onaylananMetraj_backUp))
    setIsChanged()
    setShow("Main")
  }









  // REVİZELERİ GERİ ALMA FONKSİYONLARI

  const update_state_revizeGeri = (iptalRow) => {
    if (!isChanged_revize) {
      setIsChanged_revize(true)
    }

    let onaylananMetraj_state2 = _.cloneDeep(onaylananMetraj_state)

    onaylananMetraj_state2["metraj"] = Number(onaylananMetraj_state2["metraj"]) - Number(iptalRow["metraj"])

    onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.filter(x => x.satirNo !== iptalRow.satirNo)


    let aktifEdilecekSatirNo = iptalRow.satirNo.substring(0, iptalRow.satirNo.indexOf("."))
    onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.map(oneRow => {
      if (oneRow.satirNo === aktifEdilecekSatirNo) {
        oneRow.isDeactive = false
        onaylananMetraj_state2["metraj"] = Number(onaylananMetraj_state2["metraj"]) + Number(oneRow["metraj"])
      }
      return oneRow
    })


    // db ye hazırlık - save_revize fonksiyonunda kullanılacak
    setDeActiveIptalSatirNolar(satirNolar => {
      if (!satirNolar?.find(x => x === aktifEdilecekSatirNo)) {
        satirNolar = [...satirNolar, aktifEdilecekSatirNo]
      }
      return satirNolar
    })

    setHasDeActive(onaylananMetraj_state2?.satirlar.find(x => x.isDeactive) ? true : false)
    setOnaylananMetraj_state(onaylananMetraj_state2)

  }


  const cancel_revize = () => {
    setOnaylananMetraj_state(_.cloneDeep(onaylananMetraj_backUp))
    setHasDeActive(onaylananMetraj_state?.satirlar.find(x => x.isDeactive) ? true : false)
    setIsChanged_revize()
    setShow("Main")
  }


  const save_revize = async () => {


    try {

      // db deki 'hazırlananMetrajlar' isimli 'collection' daki ilgili 'document' içinde ilgil satırlarda revizenin iptal olduğunu belirtiyoruz, onaylılardan artık kaldırılabilir, kilitli değil

      let revizeEdilenler
      if (deActiveIptalSatirNolar.length > 0) {

        deActiveIptalSatirNolar.map(satirNo => {

          let userCode = satirNo.substring(0, satirNo.indexOf("-"))
          let userEmail = yetkililer.find(x => x.userCode === userCode).userEmail
          // db ye göndereeğimiz 'revizeEdilenler' henüz hiç oluşmamışsa
          if (!revizeEdilenler) {
            revizeEdilenler = [{ userEmail, satirNolar: [satirNo] }]

            //  db ye göndereeğimiz 'revizeEdilenler' - oluşmuşsa ve oluşturan kullanıcı da varsa
          } else if (revizeEdilenler?.find(x => x.userEmail === userEmail)) {
            revizeEdilenler = revizeEdilenler.map(oneActiveEdilen => {
              if (oneActiveEdilen.userEmail === userEmail) {
                oneActiveEdilen.satirNolar = [...oneActiveEdilen.satirNolar, satirNo]
              }
              return oneActiveEdilen
            })

            //  db ye göndereeğimiz 'revizeEdilenler' - oluşmuşsa fakat kullanıcınınki henüz yoksa
          } else {
            revizeEdilenler = [...revizeEdilenler, { userEmail, satirNolar: [satirNo] }]
          }
        })

      }

      await RealmApp?.currentUser.callFunction("update_onaylananMetraj_revizeIptal", ({ _dugumId: selectedNode_metraj._id, onaylananMetraj_state, revizeEdilenler }))
      setShow("Main")
      queryClient.invalidateQueries(['onaylananMetrajlar', selectedNode_metraj?._id.toString()])
      setIsChanged_revize()
      return

    } catch (error) {

      console.log(error)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })

    }

    setHasDeActive(onaylananMetraj_state?.satirlar.find(x => x.isDeactive) ? true : false)
    setIsChanged_revize()
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

  const css_metrajCetveliBaslik = {
    mt: "1rem", px: "0.3rem", border: "1px solid black", backgroundColor: myTema.renkler.metrajOnaylananBaslik, display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliSatir = {
    px: "0.3rem", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
  }


  const gridTemplateColumns1 = 'max-content minmax(min-content, 5fr) repeat(7, minmax(min-content, 1fr)) 0.5rem max-content'

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

      <Grid name="metrajCetveliHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajCetveliOnaylanan
          show={show} setShow={setShow}
          showDeActive={showDeActive} setShowDeActive={setShowDeActive}

          save={save} cancel={cancel}
          isChanged={isChanged} setIsChanged={setIsChanged}

          hasDeActive={hasDeActive}
          onaylananMetraj_state={onaylananMetraj_state}
          save_revize={save_revize} cancel_revize={cancel_revize}
          isChanged_revize={isChanged_revize} setIsChanged_revize={setIsChanged_revize}
        />
      </Grid>


      {onaylananMetraj_state &&

        < Box sx={{ maxWidth: "65rem", display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>


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
              {"Onaylanan Metraj"}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: onaylananMetraj_state["metraj"] < 0 ? "red" : null }}>
              {ikiHane(onaylananMetraj_state["metraj"])}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
              {pozBirim}
            </Box>

            <Box></Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
              Durum
            </Box>

          </React.Fragment>


          {onaylananMetraj_state.satirlar.filter(x => showDeActive ? x : !x.isDeactive).sort((a, b) => a.siraNo - b.siraNo).map((oneRow, index) => {
            return (
              < React.Fragment key={index}>

                {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                  // let isCellEdit = (oneProperty === "satirNo" || oneProperty === "pozBirim" || oneProperty === "metraj") ? false : true
                  // let isCellEdit = show === "EditMetraj" && !oneRow.isUsed && (oneProperty.includes("aciklama") || oneProperty.includes("carpan")) ? true : false
                  let isCellEdit = show === "EditMetraj" && (oneProperty.includes("aciklama") || oneProperty.includes("carpan")) ? true : false
                  let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                  return (
                    <React.Fragment key={index}>

                      {isCellEdit &&
                        <Box sx={{
                          ...css_metrajCetveliSatir,
                          backgroundColor: oneRow.isEdit && (oneProperty.includes("aciklama") || oneProperty.includes("carpan")) ? "rgba(255,255,0, 0.3)" : "rgba(255,255,0, 0.1)",
                          minWidth: oneProperty.includes("aciklama") ? "10rem" : oneProperty.includes("1") || oneProperty.includes("2") ? "4rem" : "6rem"
                        }}>
                          <Input
                            // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                            // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                            // autoFocus={true}
                            autoComplete='off'
                            id={oneRow.satirNo + oneProperty}
                            name={oneRow.satirNo + oneProperty}
                            // readOnly={oneRow.isUsed}
                            disableUnderline={true}
                            // size="small"
                            type={oneProperty.includes("carpan") ? "number" : "text"}
                            // type={"text"}
                            // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                            // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                            onKeyDown={oneProperty.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                            onChange={(event) => handle_input_onChange(event, oneRow, oneProperty)}
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
                                boxSizing: "border-box",
                                fontWeight: oneProperty === "metraj" && "700",
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
                          backgroundColor: showDeActive && oneRow?.isUsed && !oneRow.isEdit && myTema.renkler.inaktifGri,
                          justifyContent: (oneProperty.includes("satirNo") || oneProperty.includes("aciklama")) ? "start" : oneProperty.includes("carpan") ? "end" : oneProperty.includes("metraj") ? "end" : "center",
                          minWidth: oneProperty.includes("carpan") ? "5rem" : oneProperty.includes("metraj") ? "5rem" : null,
                          color: isMinha ? "red" : null,
                          fontWeight: oneProperty === "metraj" && "700",
                        }}>
                          {metrajValue(oneRow, oneProperty, isMinha)}
                        </Box>
                      }

                    </React.Fragment>
                  )

                })}

                <Box></Box>

                <Box
                  onClick={() => showDeActive && oneRow.isEdit && update_state_revizeGeri(oneRow)}
                  // onMouseEnter={() => showDeActive && setIsHovered(true)}
                  // onMouseLeave={() => showDeActive && setIsHovered(false)}
                  sx={{
                    // backgroundColor: oneRow.isUsed ? null : "rgba(255,255,0, 0.3)",
                    // backgroundColor: "rgba(255,255,0, 0.3)",
                    cursor: "pointer",
                    display: "grid",
                    alignItems: "center",
                    justifyItems: "center",
                    px: "0.3rem",
                    border: "1px solid black",
                  }}
                >
                  {oneRow.isUsed && !oneRow.isEdit &&
                    <LockIcon
                      variant="contained"
                      sx={{ color: oneRow.isDeactive ? "rgba(255, 132, 0, 1)" : "gray", fontSize: "0.9rem" }} />
                  }
                  {!showDeActive && oneRow.isEdit &&
                    <StarIcon variant="contained" sx={{ color: "rgba(255, 132, 0, 1)", fontSize: "0.9rem" }} />
                  }
                  {showDeActive && oneRow.isEdit &&
                    <ReplyIcon variant="contained" sx={{ color: "rgba(255, 132, 0, 1)", fontSize: "0.9rem" }} />
                  }
                </Box>

              </React.Fragment>
            )

          })}


        </Box >
      }





    </ >

  )

}


