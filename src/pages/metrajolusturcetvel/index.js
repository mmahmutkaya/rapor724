
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store.js'
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';

import { DialogAlert } from '../../components/general/DialogAlert.js';
import HeaderMetrajOlusturCetvel from '../../components/HeaderMetrajOlusturCetvel.js'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
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

export default function P_MetrajOlusturCetvel() {

  const queryClient = useQueryClient()

  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)
  const { customData } = RealmApp.currentUser
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  const { selectedMahal_metraj } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedNode_metraj, setSelectedNode_metraj } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)
  const { detailMode, setDetailMode } = useContext(StoreContext)


  const [dialogAlert, setDialogAlert] = useState()
  const [show, setShow] = useState("DugumMetrajlari")
  const [approveMode, setApproveMode] = useState()
  const [isChanged, setIsChanged] = useState(0)
  const [hazirlananMetraj_state, setHazirlananMetraj_state] = useState()
  const [hazirlananMetrajlar_state, setHazirlananMetrajlar_state] = useState()
  const [onaylananMetraj_state, setOnaylananMetraj_state] = useState()
  const [onaylananMetrajUsers_state, setOnaylananMetrajUsers_state] = useState()
  const [dugumMetraj_state, setDugumMetraj_state] = useState()
  const [metraj, setMetraj] = useState()
  const [_pozId, set_pozId] = useState()
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ pozId: null, mahalId: null })
  const [satirlarToplam, setSatirlarToplam] = useState()

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


  const { data: hazirlananMetraj } = useGetHazirlananMetraj()


  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode_metraj && navigate("/metrajpozmahaller")
    setHazirlananMetraj_state(hazirlananMetraj)
  }, [hazirlananMetraj])



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = (event, satirNo, oneProperty) => {

    if (!isChanged) {
      setIsChanged(true)
    }

    let hazirlananMetraj_state2 = { ...hazirlananMetraj_state }

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    hazirlananMetraj_state2["satirlar"] = hazirlananMetraj_state2["satirlar"].map(oneRow => {

      if (oneRow.satirNo == satirNo) {

        // önceki satır metrajını çıkartıyoruz, yeni değeri bulunca aşağıda ekleyeceğiz
        hazirlananMetraj_state2["metraj"] = Number(hazirlananMetraj_state2["metraj"]) - Number(oneRow["metraj"])

        oneRow[oneProperty] = event.target.value

        let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

        if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
          oneRow.metraj = ""
          // hazirlananMetraj_state2["metraj"] ı güncelleyecek bir durum yok, önceki değeri yukarıda çıkarmıştık, yenisi zaten sıfır çıktı
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
          hazirlananMetraj_state2["metraj"] = hazirlananMetraj_state2["metraj"] + Number(oneRow.metraj)
          // metraj = oneRowMetraj > 0 ? Number(metraj) - Number(oneRowMetraj) : Number(metraj)
          return oneRow
        } else {
          oneRow.metraj = oneRowMetraj
          // metraj = Number(oneRowMetraj) > 0 ? Number(metraj) + Number(oneRowMetraj) : Number(metraj)
          hazirlananMetraj_state2["metraj"] = hazirlananMetraj_state2["metraj"] + Number(oneRow.metraj)
          return oneRow
        }

      }

      return oneRow

    })

    setHazirlananMetraj_state(hazirlananMetraj_state2)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["aciklama"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save = async () => {

    if (isChanged) {
      try {

        await RealmApp?.currentUser.callFunction("update_hazirlananMetraj_new", ({ _dugumId: selectedNode_metraj._id, hazirlananMetraj_new: hazirlananMetraj_state }))

        queryClient.invalidateQueries(['hazirlananMetraj', selectedNode_metraj?._id.toString()])
        setIsChanged()
        setShow("DugumMetrajlari")
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
            setIsChanged()
            setShow("DugumMetrajlari")
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


  const cancel = () => {
    queryClient.invalidateQueries(['hazirlananMetraj'])
    setIsChanged()
    setShow("DugumMetrajlari")
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
    mt: "1rem", px: "0.3rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
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
          onCloseAction={dialogAlert.onCloseAction}
        />
      }

      <Grid name="metrajCetveliHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <HeaderMetrajOlusturCetvel
          show={show} setShow={setShow}
          save={save}
          cancel={cancel}
          isChanged={isChanged} setIsChanged={setIsChanged}
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
              {"name gelecek"}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik, justifyContent: "end", pr: "0.3rem", color: hazirlananMetraj_state["metraj"] < 0 ? "red" : null }}>
              {ikiHane(hazirlananMetraj_state["metraj"])}
            </Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
              {pozBirim}
            </Box>

            <Box></Box>

            <Box sx={{ ...css_metrajCetveliBaslik }}>
              Durum
            </Box>

          </React.Fragment>


          {hazirlananMetraj_state.satirlar.map((oneRow, index) => {
            return (
              < React.Fragment key={index}>

                {["satirNo", "aciklama", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                  // let isCellEdit = (oneProperty === "satirNo" || oneProperty === "pozBirim" || oneProperty === "metraj") ? false : true
                  let isCellEdit = show === "EditMetraj" && !oneRow.isSelected && (oneProperty.includes("aciklama") || oneProperty.includes("carpan")) ? true : false
                  let isMinha = oneRow["aciklama"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

                  return (
                    <React.Fragment key={index}>

                      {isCellEdit &&
                        <Box sx={{
                          ...css_metrajCetveliSatir,
                          backgroundColor: !oneRow.isSelected && oneProperty.includes("aciklama") ? "rgba(255,255,0, 0.2)" : !oneRow.isSelected && oneProperty.includes("carpan") ? "rgba(255,255,0, 0.3)" : null,
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
                          backgroundColor: oneRow?.isSelected && myTema.renkler.inaktifGri,
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

                <Box sx={{
                  // backgroundColor: oneRow.isSelected ? null : "rgba(255,255,0, 0.3)",
                  // backgroundColor: "rgba(255,255,0, 0.3)",
                  cursor: "pointer",
                  display: "grid",
                  alignItems: "center",
                  justifyItems: "center",
                  px: "0.3rem",
                  border: "1px solid black"
                }}>
                  {oneRow.isSelected &&
                    <Tooltip placement="top" title="Onaylı Metraj Kısmında Kullanıldı">
                      <LockIcon variant="contained" sx={{ color: "gray", fontSize: "1rem" }} />
                    </Tooltip>
                  }
                  {/* {!oneRow.isSelected &&
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


