
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
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import HourglassFullSharpIcon from '@mui/icons-material/HourglassFullSharp';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';

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
  const { detailMode, setDetailMode } = useContext(StoreContext)


  const [show, setShow] = useState("PozMahalMetrajlari")
  const [approveMode, setApproveMode] = useState()
  const [isChanged, setIsChanged] = useState(0)
  const [userMetraj_state, setUserMetraj_state] = useState()
  const [dugumMetraj_state, setDugumMetraj_state] = useState()
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
  // !isProject ? navigate('/projects') : null
  if (!isProject) window.location.href = "/projects"



  const { data: mahaller } = useGetMahaller()

  const { data: mahalListesi } = useGetMahalListesi()

  const { data: dugumMetraj } = useGetDugumMetraj({ selectedNode })

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


  const toggleReadyHazirlananMetraj = ({ oneRow }) => {

    let userMetraj_state2 = { ...userMetraj_state }

    userMetraj_state2["satirlar"] = userMetraj_state2["satirlar"].map(x => {
      if (x.satirNo == oneRow.satirNo) {
        x.isHazirlananOnay = !x.isHazirlananOnay ? x.isHazirlananOnay = true : x.isHazirlananOnay = false
        return x
      } else {
        return x
      }
    })

    setIsChanged(true)
    setUserMetraj_state(userMetraj_state2)
  }



  const saveUserMetraj_toDb = () => {
    if (isChanged) updateUserMetraj({ selectedNode, payload: userMetraj_state["satirlar"], userMetraj_state, setUserMetraj_state })
    setShow("PozMahalMetrajlari")
    setIsChanged()
  }

  const loadMetraj_ToState = () => {

    if (dugumMetraj?.hazirlananMetrajlar.length > 0) {
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

  const loadDugumMetraj_ToState = () => {
    setDugumMetraj_state({ ...dugumMetraj })
  }



  const saveOnaylananMetraj_toDb = () => {
    // updateOnaylananMetraj({ selectedNode, payload: dugumMetraj_state.onaylananMetrajlar, userMetraj_state, setUserMetraj_state })
    // setOnayMode(true)
    console.log("dugumMetraj_state", dugumMetraj_state)
    // setShow("PozMahalMetrajlari")
  }



  const approveMetrajRow = ({ oneRow, oneMetraj }) => {
    // console.log("oneMetraj", oneMetraj)
    // console.log("dugumMetraj_state", dugumMetraj_state)
    // console.log("dugumMetraj_state2", dugumMetraj_state2)
    let dugumMetraj_state2 = { ...dugumMetraj_state }
    dugumMetraj_state2.hazirlananMetrajlar = dugumMetraj_state2.hazirlananMetrajlar.map(oneMetraj2 => {
      if (oneMetraj2._userId.toString() === oneMetraj._userId.toString()) {
        oneMetraj2.satirlar = oneMetraj2.satirlar.map(oneRow2 => {
          if (oneRow2.satirNo === oneRow.satirNo) {
            oneRow2.isApproved = true
            dugumMetraj_state2.onaylananMetrajlar.satirlar = [...dugumMetraj_state2.onaylananMetrajlar.satirlar.filter(x => x.hazirlayanId + x.satirNo !== oneMetraj._userId.toString() + oneRow.satirNo), { ...oneRow2, hazirlayanId: oneMetraj._userId.toString(), onaylayanId: RealmApp?.currentUser.id }].sort((a, b) => a.satirNo - b.satirNo)
            dugumMetraj_state2.onaylananMetrajlar.sonGuncelleme = new Date()
            return oneRow2
          } else {
            return oneRow2
          }
        })
        return oneMetraj2
      } else {
        return oneMetraj2
      }
    })
    setDugumMetraj_state(dugumMetraj_state2)
  }


  const delete_approvedMetrajRow = ({ oneRow }) => {
    // console.log("oneRow", oneRow)
    // console.log("dugumMetraj_state", dugumMetraj_state)
    // console.log("dugumMetraj_state2", dugumMetraj_state2)

    let dugumMetraj_state2 = { ...dugumMetraj_state }
    dugumMetraj_state2.hazirlananMetrajlar = dugumMetraj_state2.hazirlananMetrajlar.map(oneMetraj2 => {
      if (oneMetraj2._userId.toString() === oneRow.hazirlayanId) {
        oneMetraj2.satirlar = oneMetraj2.satirlar.map(oneRow2 => {
          if (oneRow2.satirNo === oneRow.satirNo) {
            oneRow2.isApproved = false
            dugumMetraj_state2.onaylananMetrajlar.satirlar = [...dugumMetraj_state2.onaylananMetrajlar.satirlar.filter(x => x.hazirlayanId + x.satirNo !== oneRow.hazirlayanId + oneRow.satirNo)].sort((a, b) => a.satirNo - b.satirNo)
            dugumMetraj_state2.onaylananMetrajlar.sonGuncelleme = new Date()
            return oneRow2
          } else {
            return oneRow2
          }
        })
        return oneMetraj2
      } else {
        return oneMetraj2
      }
    })
    setDugumMetraj_state(dugumMetraj_state2)
  }



  pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId)?.name
  pozMetraj = mahalListesi?.filter(item => item._pozId.toString() == selectedPoz._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj?.guncel)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj?.guncel)), 0)
  pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)



  !selectedPoz &&
    navigate("/metraj")


  return (

    <>

      <Grid name="metrajEditHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <MetrajEditHeader
          show={show} setShow={setShow}
          saveUserMetraj_toDb={saveUserMetraj_toDb}
          loadMetraj_ToState={loadMetraj_ToState}
          setUserMetraj_state={setUserMetraj_state}
          isChanged={isChanged} setIsChanged={setIsChanged}
          saveOnaylananMetraj_toDb={saveOnaylananMetraj_toDb}
          loadDugumMetraj_ToState={loadDugumMetraj_ToState}
          approveMode={approveMode}
          setApproveMode={setApproveMode}
        />
      </Grid>


      {/* PAGE - POZUN MAHALLERİNİN LİSTELENDİĞİ İLK SAYFA
      {show == "PozMahalleri" &&

        < Box name="Main" sx={{ ml: "1rem", mr: "1rem", width: "63rem" }}>

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

      } */}

      {/* < Box name="Main" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}> */}


      {/* En Üst Başlık Satırı */}
      {/* < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", backgroundColor: "lightgray", justifyContent: "start" }}> */}







      {/* PAGE -> ONAYLI VE HAZIRLANAN METRAJLARI GÖSTERİMİ */}
      {show == "PozMahalMetrajlari" &&

        < Box name="Main" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}>


          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", backgroundColor: "lightgray", justifyContent: "start" }}>
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

            {/* <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}>

            </Box> */}
            {/* <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Tarih
            </Box> */}

          </Grid >



          {/* ONAYLI METRAJLAR BAŞLIK */}
          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Onaylanan Metrajlar
          </Typography>


          {/* ONAYLI METRAJLAR YOKSA */}
          {!dugumMetraj?.onaylananMetrajlar?.length > 0 &&
            <Box sx={{ width: '66rem', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="primary">
                {"Henüz onaylanmış metraj bulunmuyor, yukarıdaki 'onay' işaretine tıklayarak hazırlanan metrajlardan onay verebilirsiniz."}
              </Alert>
            </Box>
          }


          {/* ONAYLI METRAJLAR VARSA */}
          {dugumMetraj?.onaylananMetrajlar?.length > 0 &&
            dugumMetraj.onaylananMetrajlar.map((oneMetraj, index) => {

              // let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
                      <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                        <Box sx={{
                          // display: isOwnUser ? "block" : "none",
                          display: "none",
                          mr: "0.7rem",
                          backgroundColor: "red",
                          borderRadius: "0.5rem",
                          height: "0.5rem",
                          width: "0.5rem",
                        }}>
                        </Box>
                        {oneMetraj.hasOwnProperty("sonGuncelleme") ?
                          <Box>
                            {oneMetraj.sonGuncelleme.getMonth() < 9 ?
                              oneMetraj.sonGuncelleme.getDate() + "." + "0" + (oneMetraj.sonGuncelleme.getMonth() + 1) + "." + oneMetraj.sonGuncelleme.getUTCFullYear() :
                              oneMetraj.sonGuncelleme.getDate() + "." + (oneMetraj.sonGuncelleme.getMonth() + 1) + "." + oneMetraj.sonGuncelleme.getUTCFullYear()
                            }
                          </Box>
                          :
                          <Box sx={{ color: "rgba( 253, 197, 123 , 0.6 )" }}>
                            .
                          </Box>
                        }
                      </Box>
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: oneMetraj["metraj"] < 0 ? "red" : null }}>
                      {ikiHane(oneMetraj["metraj"])}
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      {pozBirim}
                    </Box>
                    <Box sx={{ border: "none", backgroundColor: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>

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


                        {detailMode &&
                          <>
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
                            </Box>

                          </>}

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
          {!dugumMetraj?.hazirlananMetrajlar?.length > 0 &&
            <Box sx={{ width: '100%', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz hazırlanmış metraj bulunmuyor, yukarıdaki 'kalem' işaretine tıklayarak metraj girişi yapabilirsiniz."}
              </Alert>
            </Box>
          }


          {/* HAZIRLANAN METRAJ VARSA */}
          {dugumMetraj?.hazirlananMetrajlar.length > 0 &&

            dugumMetraj.hazirlananMetrajlar.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 4rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
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

                    <Box sx={{ border: "none", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}></Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>Durum</Box>


                    {detailMode &&
                      <>
                        <Box sx={{ border: "none", backgroundColor: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>

                        </Box>
                        <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>
                          Tarih
                        </Box>
                      </>
                    }

                  </Grid>

                  {/* hazirlananMetraj - Metraj Satırları */}
                  {oneMetraj?.satirlar.map((oneRow, index) => {

                    return (
                      < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 4rem 1rem 7rem", justifyContent: "start" }}>

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



                        <Box sx={{ border: "none" }}></Box>

                        <Box
                          sx={{
                            display: "grid",
                            alignItems: "center",
                            justifyItems: "center",
                            px: "0.3rem",
                            border: "1px solid black"
                          }}>
                          {oneRow.isHazirlananOnay &&
                            <CheckIcon variant="contained" sx={{ color: "rgba( 0, 128, 0, 0.7 )", fontSize: "1.5rem" }} />
                          }
                          {!oneRow.isHazirlananOnay &&
                            <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                          }
                        </Box>


                        {detailMode &&
                          <>
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
                          </>
                        }

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

        < Box name="Main" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}>


          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridAutoFlow: "column", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", backgroundColor: "lightgray" }}>
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

          </Grid >




          <Box>

            {/* Metraj Başlık Satırı */}
            <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 4rem", justifyContent: "start", alignItems: "center" }}>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>{"name"}</Box>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: userMetraj_state["metraj"] < 0 ? "red" : null }}>
                {ikiHane(userMetraj_state["metraj"])}
              </Box>

              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>{pozBirim}</Box>

              <Box sx={{ border: "none", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}></Box>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>Durum</Box>

            </Grid>

            {userMetraj_state.satirlar.map((oneRow, index) => {
              return (
                < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 4rem", justifyContent: "start" }}>

                  {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                    let isCellEdit = oneData === "satirNo" || oneData === "pozBirim" || oneData === "metraj" ? false : true
                    let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                    return (
                      <Box key={index} sx={{ display: "grid", alignItems: "center" }}>

                        <Input
                          // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                          // autoFocus={true}
                          readOnly={!isCellEdit || oneRow.isHazirlananOnay}
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
                            backgroundColor: isCellEdit && !oneRow.isHazirlananOnay ? "rgba(255,255,0, 0.3)" : null,
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

                  <Box sx={{ border: "none" }}></Box>

                  <Box
                    onClick={() => toggleReadyHazirlananMetraj({ oneRow })}
                    sx={{
                      // backgroundColor: oneRow.isHazirlananOnay ? null : "rgba(255,255,0, 0.3)",
                      backgroundColor: "rgba(255,255,0, 0.3)",
                      cursor: "pointer",
                      display: "grid",
                      alignItems: "center",
                      justifyItems: "center",
                      px: "0.3rem",
                      border: "1px solid black"
                    }}>
                    {oneRow.isHazirlananOnay &&
                      <CheckIcon variant="contained" sx={{ color: "rgba( 0, 128, 0, 0.7 )", fontSize: "1.5rem" }} />
                    }
                    {!oneRow.isHazirlananOnay &&
                      <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                    }
                  </Box>

                </Grid >
              )

            })}

          </Box>



        </Box >

      }














      {/* PAGE -> METRAJ ONAY */}
      {
        show == "MetrajOnay" &&

        < Box name="Main" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}>


          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", backgroundColor: "lightgray", justifyContent: "start" }}>
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
            {/* <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}></Box> */}
            {/* <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}></Box> */}
            {/* <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}></Box> */}
          </Grid >



          {/* ONAYLI METRAJLAR BAŞLIK */}
          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Onaylanan Metrajlar
          </Typography>


          {/* ONAYLI METRAJLAR YOKSA */}
          {!dugumMetraj_state?.onaylananMetrajlar.satirlar.length > 0 &&
            <Box sx={{ width: '100%', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="primary">
                {"Henüz onaylanmış metraj bulunmuyor, aşağıdaki hazırlanmış metrajlardan satır seçerek onay verebilirsiniz."}
              </Alert>
            </Box>
          }


          {/* ONAYLI METRAJLAR VARSA */}
          {dugumMetraj_state?.onaylananMetrajlar.satirlar.length > 0 &&

            // let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

            <Box sx={{ mb: "2rem" }}>

              {/* hazirlananMetraj - Başlık Satırı */}
              <Grid sx={{ display: "grid", gridTemplateColumns: detailMode ? "55rem 8rem 3rem 1rem 7rem 3rem 1rem 7rem 3rem" : "55rem 8rem 3rem", justifyContent: "start", alignItems: "center", backgroundColor: onaylananBaslik_color }}>
                <Box sx={{ width: "55rem", border: "1px solid black", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
                  <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                    <Box sx={{
                      // display: isOwnUser ? "block" : "none",
                      display: "none",
                      mr: "0.7rem",
                      backgroundColor: "red",
                      borderRadius: "0.5rem",
                      height: "0.5rem",
                      width: "0.5rem",
                    }}>
                    </Box>
                    {"Son Güncelleme - "}
                    {dugumMetraj_state.hasOwnProperty("sonGuncelleme") ?
                      <Box>
                        {dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getMonth() < 9 ?
                          dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getDate() + "." + "0" + (dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getMonth() + 1) + "." + dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getUTCFullYear() :
                          dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getDate() + "." + (dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getMonth() + 1) + "." + dugumMetraj_state?.onaylananMetrajlar.sonGuncelleme.getUTCFullYear()
                        }
                      </Box>
                      :
                      <Box sx={{ color: onaylananBaslik_color }}>
                        .
                      </Box>
                    }
                  </Box>
                </Box>
                <Box sx={{ width: "8rem", border: "1px solid black", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem" }}>
                  {ikiHane(dugumMetraj_state?.onaylananMetrajlar["metraj"])}
                </Box>
                <Box sx={{ width: "3rem", border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                  {pozBirim}
                </Box>


                {detailMode &&
                  <>
                    <Box sx={{ width: "1rem", backgroundColor: "white", color: "white", border: "1px solid white" }}>
                      .
                    </Box>
                    <Box sx={{ width: "7rem", border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Hazırlayan
                    </Box>
                    <Box sx={{ width: "3rem", border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Sıra
                    </Box>

                  </>
                }

                {detailMode &&
                  <>

                    <Box sx={{ width: "1rem", backgroundColor: "white", color: "white", border: "1px solid white" }}>
                      .
                    </Box>
                    <Box sx={{ width: "7rem", border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Onaylayan
                    </Box>
                    <Box sx={{ width: "3rem", border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Tarih
                    </Box>

                  </>
                }


              </Grid>

              {/* metraj Satırları */}
              {dugumMetraj_state?.onaylananMetrajlar.satirlar.sort((a, b) => a.satirNo - b.satirNo).map((oneRow, index) => {

                return (
                  < Grid key={index} onClick={() => delete_approvedMetrajRow({ oneRow })} sx={{ display: "grid", gridTemplateColumns: detailMode ? "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem 3rem 1rem 7rem 3rem" : "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", justifyContent: "start", cursor: "pointer", backgroundColor: onaylananSatir_color }}>

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


                    {detailMode &&
                      <>
                        <Box sx={{ backgroundColor: "white", color: "white", border: "1px solid white" }}>
                          .
                        </Box>
                        <Box sx={{ border: "1px solid black", overflow: "hidden" }}>
                          {oneRow.hazirlayanId.toString()}
                        </Box>
                        <Box sx={{ border: "1px solid black", display: "grid", justifyItems: "center" }}>
                          {oneRow.satirNo}
                        </Box>
                      </>
                    }



                    {detailMode &&
                      <>
                        <Box sx={{ backgroundColor: "white", color: "white", border: "1px solid white" }}>
                          .
                        </Box>
                        <Box sx={{ border: "1px solid black", overflow: "hidden" }}>
                          {oneRow.onaylayanId.toString()}
                        </Box>
                        <Box sx={{ border: "1px solid black", display: "grid", justifyItems: "center" }}>
                          {oneRow.satirNo}
                        </Box>
                      </>
                    }

                  </Grid >
                )
              })}

            </Box>





          }






          {/* HAZIRLANAN METRAJLAR GÖSTERİMİ */}

          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Hazırlanan Metrajlar
          </Typography>



          {/* HAZIRLANAN METRAJ YOKSA */}
          {!dugumMetraj_state?.hazirlananMetrajlar?.length > 0 &&
            <Box sx={{ width: '100%', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz hazırlanmış metraj bulunmuyor, yukarıdaki 'kalem' işaretine tıklayarak metraj girişi yapabilirsiniz."}
              </Alert>
            </Box>
          }


          {/* HAZIRLANAN METRAJ VARSA */}
          {dugumMetraj_state?.hazirlananMetrajlar.length > 0 &&

            dugumMetraj_state.hazirlananMetrajlar.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: detailMode ? "55rem 8rem 3rem 1rem 7rem" : "55rem 8rem 3rem", justifyContent: "start", alignItems: "center", backgroundColor: hazirlananBaslik_color }}>

                    <Box sx={{ border: "1px solid black", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
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

                    <Box sx={{ border: "1px solid black", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: oneMetraj["metraj"] < 0 ? "red" : null }}>
                      {ikiHane(oneMetraj["metraj"])}
                    </Box>

                    <Box sx={{ border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      {pozBirim}
                    </Box>

                    {detailMode &&
                      <>
                        <Box sx={{ backgroundColor: "white", color: "white", border: "1px solid white" }}>
                          .
                        </Box>

                        <Box sx={{ border: "1px solid black", display: "grid", justifyContent: "center", alignItems: "center" }}>
                          Tarih
                        </Box>
                      </>
                    }

                  </Grid>

                  {/* hazirlananMetraj - Metraj Satırları */}
                  {oneMetraj?.satirlar.map((oneRow, index) => {

                    return (
                      < Grid key={index} onClick={() => approveMetrajRow({ oneMetraj, oneRow })} sx={{ display: "grid", gridTemplateColumns: detailMode ? "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 7rem" : "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", justifyContent: "start", cursor: (oneRow.isApproved || oneRow.isLocked) ? "defaılt" : "pointer", backgroundColor: oneRow.isApproved ? hazirlananOnayliSatir_color : oneRow.isLocked ? hazirlananKilitliSatir_color : hazirlananSatir_color }}>

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneData.includes("metin") ? "start" : oneData.includes("carpan") || oneData.includes("metraj") ? "end" : "center",
                                // backgroundColor: oneRow.isApproved && hazirlananOnayliSatir_color,
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneData, isMinha)}
                            </Box>
                          )
                        })}

                        {detailMode &&
                          <>
                            <Box sx={{ backgroundColor: "white", color: "white", border: "1px solid white" }}>
                              .
                            </Box>

                            <Box
                              sx={{
                                display: "grid",
                                justifyItems: "center",
                                px: "0.3rem",
                                border: "1px solid black",
                                // backgroundColor: oneRow.isApproved && hazirlananOnayliSatir_color
                              }}>
                              {oneRow["sonGuncelleme"].getMonth() < 9 ?
                                oneRow["sonGuncelleme"].getDate() + "." + "0" + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear() :
                                oneRow["sonGuncelleme"].getDate() + "." + (oneRow["sonGuncelleme"].getMonth() + 1) + "." + oneRow["sonGuncelleme"].getUTCFullYear()
                              }
                            </Box>
                          </>
                        }

                      </Grid >
                    )
                  })}

                </Box>

              )

            })
          }


        </Box >

      }






    </ >

  )

}


