
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import MetrajCetveliHeader from '../../components/MetrajCetveliHeader'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahaller, useGetMahalListesi, useGetHazirlananMetrajlar, useUpdateHazirlananMetraj, useUpdateOnaylananMetraj, useGetOnaylananMetraj } from '../../hooks/useMongo';

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
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function P_MetrajCetveli() {

  const queryClient = useQueryClient()

  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz_metraj, setSelectedPoz_metraj } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)
  const { detailMode, setDetailMode } = useContext(StoreContext)


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


  const navigate = useNavigate()
  useEffect(() => {
    !selectedNode && navigate("/metrajpozmahaller")
    load_hazirlananMetraj_state()
  }, [])



  const { data: mahalListesi } = useGetMahalListesi()

  const { data: hazirlananMetrajlar } = useGetHazirlananMetrajlar({ selectedNode })

  const { data: onaylananMetraj } = useGetOnaylananMetraj({ selectedNode })
  // onaylananMetraj && console.log("onaylananMetraj", onaylananMetraj)

  const { mutate: updateHazirlananMetraj } = useUpdateHazirlananMetraj()

  const { mutate: updateOnaylananMetraj } = useUpdateOnaylananMetraj()



  // Edit Metraj Sayfasının Fonksiyonu
  const load_hazirlananMetraj_state = () => {

    let userharf = selectedProje?.metrajYapabilenler.find(x => x.userEmail === RealmApp?.currentUser.customData.email).harf

    if (hazirlananMetrajlar?.length > 0) {
      let hazirlananMetraj = hazirlananMetrajlar?.find(x => x.userEmail === RealmApp?.currentUser.customData.email)

      if (hazirlananMetraj) {
        hazirlananMetraj = JSON.parse(JSON.stringify(hazirlananMetraj))
        hazirlananMetraj._userId = new BSON.ObjectId(hazirlananMetraj._userId)
        hazirlananMetraj.satirlar = hazirlananMetraj.satirlar.map(x => {
          x.sonGuncelleme = new Date(x.sonGuncelleme)
          return x
        })
        setHazirlananMetraj_state(hazirlananMetraj)
        // console.log("backend teki usermetraj şablonu yüklendi", hazirlananMetraj)
      } else {
        let satirlar = [
          { satirNo: userharf + 1, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: userharf + 2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: userharf + 3, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: userharf + 4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: userharf + 5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
        ]
        setHazirlananMetraj_state({ userEmail: RealmApp?.currentUser.customData.email, satirlar, metraj: 0 })
        // console.log("frontend teki usermetraj şablonu yüklendi", { _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
      }
    } else {
      let satirlar = [
        { satirNo: userharf + 1, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: userharf + 2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: userharf + 3, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: userharf + 4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: userharf + 5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
      ]
      setHazirlananMetraj_state({ userEmail: RealmApp?.currentUser.customData.email, satirlar, metraj: 0 })
      // console.log("frontend teki usermetraj şablonu yüklendi", { _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
    }

  }





  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = (event, satirNo, oneProperty) => {

    let hazirlananMetraj_state2 = { ...hazirlananMetraj_state }

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    hazirlananMetraj_state2["satirlar"] = hazirlananMetraj_state2["satirlar"].map(oneRow => {

      if (oneRow.satirNo == satirNo) {

        // önceki satır metrajını çıkartıyoruz, yeni değeri bulunca aşağıda ekleyeceğiz
        hazirlananMetraj_state2["metraj"] = Number(hazirlananMetraj_state2["metraj"]) - Number(oneRow["metraj"])

        oneRow[oneProperty] = event.target.value

        let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

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

    setIsChanged(true)
    setHazirlananMetraj_state(hazirlananMetraj_state2)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["metin1"] + oneRow["metin2"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_hazirlananMetraj_toDb = () => {
    if (isChanged) updateHazirlananMetraj({ selectedNode, hazirlananMetraj_state, setHazirlananMetraj_state })
    setShow("DugumMetrajlari")
    setIsChanged()
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
    backgroundColor: "lightgray", border: "1px solid black", display: "grid", alignItems: "center", justifyContent: "center"
  }

  const css_metrajCetveliBaslik = {
    mt: "1rem", border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", alignItems: "center", justifyContent: "center"
  }


  const gridTemplateColumns1 = 'auto auto 14rem repeat(5, auto) auto auto 1rem auto'

  pozBirim = selectedProje?.pozBirimleri.find(item => item.id == selectedPoz_metraj?.pozBirimId)?.name


  return (

    <>

      <Grid name="metrajCetveliHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <MetrajCetveliHeader
          show={show} setShow={setShow}
          save_hazirlananMetraj_toDb={save_hazirlananMetraj_toDb}
          load_hazirlananMetraj_state={load_hazirlananMetraj_state}
          setHazirlananMetraj_state={setHazirlananMetraj_state}
          setOnaylananMetraj_state={setOnaylananMetraj_state}
          isChanged={isChanged} setIsChanged={setIsChanged}
          approveMode={approveMode}
          setApproveMode={setApproveMode}
        />
      </Grid>


      {hazirlananMetraj_state && show === "EditMetraj" &&

        < Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns1, mt: subHeaderHeight, mb: "1rem", mx: "1rem" }}>


          {/* En Üst Başlık Satırı */}
          < React.Fragment >
            <Box sx={{ ...css_enUstBaslik }}>
              Sıra
            </Box>
            <Box sx={{ ...css_enUstBaslik }}>
              Kısa Açıklama
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
              Yükseklik
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

            <Box sx={{ ...css_metrajCetveliBaslik, gridColumn: "1/9", justifyContent: "end", pr: "1rem" }}>
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




          <React.Fragment>

            {/* {console.log("hazirlananMetraj_state.satirlar", hazirlananMetraj_state.satirlar)} */}
            {hazirlananMetraj_state.satirlar.map((oneRow, index) => {
              return (
                // < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 4rem", justifyContent: "start" }}>
                < React.Fragment>

                  {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                    let isCellEdit = (oneProperty === "satirNo" || oneProperty === "pozBirim" || oneProperty === "metraj") ? false : true
                    let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                    return (
                      <Box key={index} sx={{ display: "grid", alignItems: "center" }}>

                        <Input
                          // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={true}
                          autoComplete='off'
                          id={oneRow.satirNo + oneProperty}
                          name={oneRow.satirNo + oneProperty}
                          readOnly={!isCellEdit || oneRow.isApproved}
                          disableUnderline={true}
                          size="small"
                          type={oneProperty.includes("carpan") ? "number" : "text"}
                          // type={"text"}
                          // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                          // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                          onKeyDown={oneProperty.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                          onChange={(event) => handle_input_onChange(event, oneRow.satirNo, oneProperty)}
                          sx={{
                            border: "1px solid black",
                            width: "100%",
                            display: "grid",
                            alignItems: "center",
                            px: "0.3rem",
                            backgroundColor: isCellEdit && !oneRow.isApproved ? "rgba(255,255,0, 0.3)" : null,
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
                              height: "0.95rem",
                              // fontSize: "0.95rem",
                              // marginTop: "0.1rem",
                              // marginbottom: "0px",
                              paddingTop: "0.25rem",
                              // px:"0.3rem",
                              textAlign: oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : oneProperty.includes("metin") ? "start" : "center"
                            },
                          }}
                        />

                      </Box>

                    )

                  })}

                  <Box sx={{ border: "none" }}></Box>

                  <Box
                    sx={{
                      // backgroundColor: oneRow.isApproved ? null : "rgba(255,255,0, 0.3)",
                      // backgroundColor: "rgba(255,255,0, 0.3)",
                      cursor: "pointer",
                      display: "grid",
                      alignItems: "center",
                      justifyItems: "center",
                      px: "0.3rem",
                      border: "1px solid black"
                    }}>
                    {oneRow.isApproved &&
                      <CheckIcon variant="contained" sx={{ color: "rgba( 0, 128, 0, 0.7 )", fontSize: "1.5rem" }} />
                    }
                    {!oneRow.isApproved &&
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


