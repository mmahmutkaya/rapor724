
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import MetrajEditHeader from '../../components/MetrajEditHeader'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahaller, useGetMahalListesi, useGetDugumMetraj, useUpdateUserMetraj } from '../../hooks/useMongo';

import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';

export default function P_MetrajEdit() {

  const queryClient = useQueryClient()
  const RealmApp = useApp();

  const { isProject, setIsProject } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)


  const [show, setShow] = useState("PozMahalleri")
  const [onayMode, setOnayMode] = useState()
  const [isChanged, setIsChanged] = useState(0)
  const [userMetraj_state, setUserMetraj_state] = useState()
  const [dugumMetraj_state, setdugumMetraj_state] = useState()
  const [metraj, setMetraj] = useState()
  const [_pozId, set_pozId] = useState()
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ pozId: null, mahalId: null })
  const [satirlarToplam, setSatirlarToplam] = useState()

  let pozBirim
  let pozMetraj
  let nodeMetrajGuncel = 13
  let mahal

  let metrajCesitleri = [{ id: "guncel", name: "Güncel" }]


  const navigate = useNavigate()
  // !isProject ? navigate('/projects') : null
  if (!isProject) window.location.href = "/projects"



  const { data: mahaller } = useGetMahaller()

  const { data: mahalListesi } = useGetMahalListesi()

  const { data: dugumMetraj } = useGetDugumMetraj({selectedNode})

  const { mutate: updateUserMetraj } = useUpdateUserMetraj()


  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }


  const handle_input_onChange = (event, oneRow, oneData) => {

    let userMetraj_state2 = { ...userMetraj_state }

    userMetraj_state2["satirlar"] = userMetraj_state2["satirlar"].map(x => {
      if (x.satirNo == oneRow.satirNo) {
        x[oneData] = event.target.value
        // carpanlar.push(x[oneData])
        return x
      } else {
        // carpanlar.push(x[oneData])
        return x
      }
    })

    let metraj = 0

    userMetraj_state2["satirlar"] = userMetraj_state2["satirlar"].map(oneRow => {

      let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false

      if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
        oneRow.metraj = ""
        return oneRow
      }
      const value = (
        (oneRow.carpan1 == "" ? 1 : oneRow.carpan1) *
        (oneRow.carpan2 == "" ? 1 : oneRow.carpan2) *
        (oneRow.carpan3 == "" ? 1 : oneRow.carpan3) *
        (oneRow.carpan4 == "" ? 1 : oneRow.carpan4) *
        (oneRow.carpan5 == "" ? 1 : oneRow.carpan5)
      )
      if (isMinha) {
        oneRow.metraj = value * -1
        metraj = value > 0 ? Number(metraj) - Number(value) : Number(metraj)
        return oneRow
      } else {
        oneRow.metraj = value
        metraj = Number(value) > 0 ? Number(metraj) + Number(value) : Number(metraj)
        return oneRow
      }
    })

    userMetraj_state2["metraj"] = metraj
    setIsChanged(true)
    setUserMetraj_state(userMetraj_state2)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["metin1"] + oneRow["metin2"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }



  const saveMetraj_ToDb = () => {
    if (isChanged) updateUserMetraj({ selectedNode, payload: userMetraj_state["satirlar"], userMetraj_state, setUserMetraj_state })
    setShow("PozMahalMetrajlari")
    setIsChanged()
  }

  const loadMetraj_ToState = () => {

    if (dugumMetraj && dugumMetraj.hazirlananMetrajlar.length > 0) {
      let userMetraj = dugumMetraj.hazirlananMetrajlar.find(x => x._userId.toString() == RealmApp?.currentUser.id)
      if (userMetraj) {
        // console.log("backend teki usermetraj şablonu yüklendi", userMetraj)
        setUserMetraj_state({ ...userMetraj })
      } else {
        let satirlar = [
          { satirNo: 1, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: 2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: 3, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: 4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
          { satirNo: 5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
        ]
        setUserMetraj_state({ _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
        // console.log("frontend teki usermetraj şablonu yüklendi", { _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
      }
    } else {
      let satirlar = [
        { satirNo: 1, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: 2, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: 3, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: 4, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" },
        { satirNo: 5, metin1: "", metin2: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "" }
      ]
      setUserMetraj_state({ _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
      // console.log("frontend teki usermetraj şablonu yüklendi", { _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar })
    }

  }


  const ikiHane = (value) => {
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }


  const metrajValue = (oneRow, oneData, isMinha) => {

    if (oneData == "pozBirim") return pozBirim
    if (oneData.includes("carpan")) return show !== "EditMetraj" ? ikiHane(oneRow[oneData]) : oneRow[oneData]
    if (oneData == "metraj") return ikiHane(oneRow[oneData])

    // yukarıdaki hiçbiri değilse
    return oneRow[oneData]

  }


  const handleMetrajOnay = () => {
    setOnayMode(true)
    setdugumMetraj_state(dugumMetraj)
    console.log("deneme")
  }


  pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId)?.name
  pozMetraj = mahalListesi?.filter(item => item._pozId.toString() == selectedPoz._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj?.guncel)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj?.guncel)), 0)
  pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)


  return (

    <>


      {!selectedPoz &&
        navigate("/metraj")
      }


      <Grid name="metrajEditHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <MetrajEditHeader show={show} setShow={setShow} saveMetraj_ToDb={saveMetraj_ToDb} loadMetraj_ToState={loadMetraj_ToState} setUserMetraj_state={setUserMetraj_state} isChanged={isChanged} setIsChanged={setIsChanged} handleMetrajOnay={handleMetrajOnay} />
      </Grid>



      {/* PAGE - POZUN MAHALLERİNİN LİSTELENDİĞİ İLK SAYFA */}
      {show == "PozMahalleri" &&

        < Box name="Main" sx={{ ml: "1rem", mr: "1rem", width: "63rem" }}>

          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 49rem 5rem 3rem", backgroundColor: "lightgray", justifyContent: "center" }}>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              <Box>
                Mahal
              </Box>
              <Box>
                Kodu
              </Box>
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", justifyItems: "start", pl: "0.5rem" }}>
              Mahal Adı
            </Box>
            <Box sx={{ border: "1px solid black" }}>
              <Box sx={{ display: "grid", alignItems: "center", justifyItems: "end", pr: "0.5rem" }}>
                Metraj
              </Box>
              <Box sx={{ display: "grid", alignItems: "center", justifyItems: "end", pr: "0.5rem" }}>
                {pozMetraj}
              </Box>
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", justifyItems: "center" }}>
              {pozBirim}
            </Box>
          </Grid >


          {
            mahalListesi?.filter(item => item._pozId.toString() == selectedPoz._id.toString() && item.openMetraj).map((oneNode, index) => {

              { mahal = mahaller?.find(item => item._id.toString() == oneNode._mahalId.toString()) }
              { nodeMetrajGuncel = oneNode?.metraj?.guncel ? oneNode?.metraj?.guncel : 0 }
              { nodeMetrajGuncel = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(nodeMetrajGuncel) }

              return (

                <Grid key={index}>

                  {/* Mahal Başlık */}
                  <Grid onClick={() => setSelectedNode(oneNode)} sx={{ display: "grid", gridTemplateColumns: "6rem 49rem 5rem 3rem", cursor: "pointer" }}>

                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "center" }}>
                      {mahal?.kod}
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1rem", alignItems: "center", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", pl: "0.5rem" }}>
                      <Box>{mahal?.name}</Box>
                      {selectedNode && selectedNode._mahalId.toString() == oneNode._mahalId.toString() && selectedNode._pozId.toString() == oneNode._pozId.toString() &&
                        <Grid >
                          <Box sx={{ backgroundColor: "rgba(255, 0, 0, 1)", borderRadius: "0.5rem", height: "0.5rem", width: "0.5rem" }}> </Box>
                        </Grid>
                      }
                    </Box>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "end", pr: "0.5rem" }}>
                      {nodeMetrajGuncel > 0 ? nodeMetrajGuncel : ""}
                    </Box>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "end", pr: "0.5rem" }}>
                      {pozBirim}
                    </Box>
                  </Grid>

                </Grid>
              )

            })
          }

        </Box >

      }



      {/* PAGE -> ONAYLI VE HAZIRLANAN METRAJLARI GÖSTERİMİ - hazirlanan metraj varmı kontrolü yeterli*/}
      {show == "PozMahalMetrajlari" &&

        < Box name="Main" sx={{ mt: subHeaderHeight, ml: "1rem", mr: "1rem", width: "74rem", justifyItems: "start" }}>


          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem", backgroundColor: "lightgray", justifyContent: "start" }}>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Sıra
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Kısa Açıklama
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Açıklama
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Benzer
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Adet
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              En
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Boy
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Yükseklik
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Metraj
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Birim
            </Box>
            <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}>

            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Tarih
            </Box>
          </Grid >



          {/* ONAYLI METRAJLAR BAŞLIK */}
          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Onaylanan Metrajlar
          </Typography>


          {/* ONAYLI METRAJLAR YOKSA */}
          {dugumMetraj && !dugumMetraj.onaylananMetrajlar?.length > 0 &&
            <Box sx={{ width: '100%', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz onaylanmış metraj bulunmuyor, yukarıdaki 'onay' işaretine tıklayarak hazırlanan metrajlardan onay verebilirsiniz."}
              </Alert>
            </Box>
          }


          {/* ONAYLI METRAJLAR VARSA */}
          {dugumMetraj && dugumMetraj.onaylananMetrajlar?.length > 0 &&
            dugumMetraj.onaylananMetrajlar.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
                      <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        <Box sx={{
                          display: isOwnUser ? "block" : "none",
                          mr: "0.7rem",
                          backgroundColor: "red",
                          borderRadius: "0.5rem",
                          height: "0.5rem",
                          width: "0.5rem",
                        }}>
                        </Box>
                        <Box>{oneMetraj?._userId.toString()}</Box>
                      </Box>
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: oneMetraj["metraj"] < 0 ? "red" : null }}>
                      {ikiHane(oneMetraj["metraj"])}
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      {pozBirim}
                    </Box>
                    <Box sx={{ border: "none", backgroundColor: "rgba( 255, 255, 255 , 1 )", display: "grid", justifyContent: "center", alignItems: "center" }}>

                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Tarih
                    </Box>
                  </Grid>

                  {/* hazirlananMetraj - Metraj Satırları */}
                  {oneMetraj?.satirlar.map((oneRow, index) => {

                    return (
                      < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem", justifyContent: "start" }}>

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneData.includes("metin") ? "start" : oneData.includes("carpan") || oneData.includes("metraj") ? "end" : "center",
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneData, isMinha)}
                            </Box>
                          )
                        })}

                        {/* boşluk */}
                        <Box sx={{ border: "none" }}></Box>

                        <Box
                          sx={{
                            display: "grid",
                            justifyItems: "center",
                            px: "0.3rem",
                            border: "1px solid black"
                          }}>
                          {oneRow["sonGuncelleme"].getMonth() < 9 ?
                            oneRow["sonGuncelleme"].getDate() + "." + "0" + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear() :
                            oneRow["sonGuncelleme"].getDate() + "." + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear()
                          }
                          {/* {console.log("oneRow",oneRow)} */}
                        </Box>

                      </Grid >
                    )
                  })}


                </Box>

              )

            })

          }






          {/* HAZIRLANAN METRAJLAR GÖSTERİMİ */}

          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Hazırlanan Metrajlar
          </Typography>



          {/* HAZIRLANAN METRAJ YOKSA */}
          {dugumMetraj && !dugumMetraj.hazirlananMetrajlar?.length > 0 &&
            <Box sx={{ width: '100%', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz hazırlanmış metraj bulunmuyor, yukarıdaki 'kalem' işaretine tıklayarak metraj girişi yapabilirsiniz."}
              </Alert>
            </Box>
          }


          {/* HAZIRLANAN METRAJ VARSA */}
          {dugumMetraj && dugumMetraj.hazirlananMetrajlar.length > 0 &&

            dugumMetraj.hazirlananMetrajlar.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
                      <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        <Box sx={{
                          display: isOwnUser ? "block" : "none",
                          mr: "0.7rem",
                          backgroundColor: "red",
                          borderRadius: "0.5rem",
                          height: "0.5rem",
                          width: "0.5rem",
                        }}>
                        </Box>
                        <Box>{oneMetraj?._userId.toString()}</Box>
                      </Box>
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: oneMetraj["metraj"] < 0 ? "red" : null }}>
                      {ikiHane(oneMetraj["metraj"])}
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      {pozBirim}
                    </Box>
                    <Box sx={{ border: "none", backgroundColor: "rgba( 255, 255, 255 , 1 )", display: "grid", justifyContent: "center", alignItems: "center" }}>

                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Tarih
                    </Box>
                  </Grid>

                  {/* hazirlananMetraj - Metraj Satırları */}
                  {oneMetraj?.satirlar.map((oneRow, index) => {

                    return (
                      < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem", justifyContent: "start" }}>

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneData.includes("metin") ? "start" : oneData.includes("carpan") || oneData.includes("metraj") ? "end" : "center",
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneData, isMinha)}
                            </Box>
                          )
                        })}

                        {/* boşluk */}
                        <Box sx={{ border: "none" }}></Box>

                        <Box
                          sx={{
                            display: "grid",
                            justifyItems: "center",
                            px: "0.3rem",
                            border: "1px solid black"
                          }}>
                          {oneRow["sonGuncelleme"].getMonth() < 9 ?
                            oneRow["sonGuncelleme"].getDate() + "." + "0" + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear() :
                            oneRow["sonGuncelleme"].getDate() + "." + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear()
                          }
                          {/* {console.log("oneRow",oneRow)} */}
                        </Box>

                      </Grid >
                    )
                  })}

                </Box>

              )

            })
          }


        </Box >

      }




      {/* PAGE -> EDİT METRAJ*/}
      {show == "EditMetraj" &&

        < Box name="Main" sx={{ mt: subHeaderHeight, ml: "1rem", mr: "1rem", width: "74rem", justifyItems: "start" }}>


          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem", backgroundColor: "lightgray", justifyContent: "start" }}>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Sıra
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Kısa Açıklama
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Açıklama
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Benzer
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Adet
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              En
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Boy
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Yükseklik
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", textAlign: "center" }}>
              Metraj
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Birim
            </Box>
            <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}>

            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Tarih
            </Box>
          </Grid >




          <Box>

            <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem", justifyContent: "start", alignItems: "center" }}>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>{"name"}</Box>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: userMetraj_state["metraj"] < 0 ? "red" : null }}>
                {ikiHane(userMetraj_state["metraj"])}
              </Box>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>{pozBirim}</Box>
            </Grid>

            {userMetraj_state.satirlar.map((oneRow, index) => {
              return (
                < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", justifyContent: "start" }}>

                  {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                    let isCellEdit = oneData === "satirNo" || oneData === "pozBirim" || oneData === "metraj" ? false : true
                    let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                    return (
                      <Box key={index} sx={{ display: "grid", alignItems: "center" }}>

                        <Input
                          // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={true}
                          readOnly={!isCellEdit}
                          disableUnderline={true}
                          size="small"
                          type={oneData.includes("carpan") ? "number" : "text"}
                          // type={"text"}
                          // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                          // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                          onKeyDown={oneData.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                          onChange={(event) => handle_input_onChange(event, oneRow, oneData)}
                          sx={{
                            border: "1px solid black",
                            width: "100%",
                            display: "grid",
                            alignItems: "center",
                            px: "0.3rem",
                            backgroundColor: isCellEdit ? "#ffffd1" : null,
                            color: isMinha ? "red" : null,
                            // justifyItems: oneBaslik.yatayHiza,
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                              display: "none",
                            },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                          // metrajValue={oneRow[oneData]}
                          // value={metrajValue(oneRow, oneData, isMinha)}
                          value={metrajValue(oneRow, oneData, isMinha)}
                          inputProps={{
                            style: {
                              height: "0.95rem",
                              // fontSize: "0.95rem",
                              // marginTop: "0.1rem",
                              // marginbottom: "0px",
                              paddingTop: "0.25rem",
                              // px:"0.3rem",
                              textAlign: oneData.includes("carpan") || oneData.includes("metraj") ? "end" : oneData.includes("metin") ? "start" : "center"
                            },
                          }}
                        />

                      </Box>
                    )
                  })}

                </Grid >
              )

            })}

          </Box>



        </Box >

      }




    </ >

  )

}


