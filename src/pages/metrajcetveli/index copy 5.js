
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import MetrajCetveliHeader from '../../components/MetrajCetveliHeader'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { BSON } from "realm-web"
import { useGetMahaller, useGetMahalListesi, useGetHazirlananMetrajlar, useUpdateHazirlananMetraj, useUpdateOnaylananMetrajlar, useGetOnaylananMetraj } from '../../hooks/useMongo';

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


  const [show, setShow] = useState("DugumMetrajlari")
  const [approveMode, setApproveMode] = useState()
  const [isChanged, setIsChanged] = useState(0)
  const [hazirlananMetraj_state, setHazirlananMetraj_state] = useState()
  const [hazirlananMetrajlar_state, setHazirlananMetrajlar_state] = useState()
  const [onaylananMetrajUsers_state, setOnaylananMetrajUsers_state] = useState()
  const [dugumMetraj_state, setDugumMetraj_state] = useState()
  const [onaylananMetraj_state, setOnaylananMetraj_state] = useState()
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
    !selectedNode && navigate("/mahalmetraj")
    !isProject && navigate("/projects")
  }, [])



  const { data: mahalListesi } = useGetMahalListesi()

  const { data: hazirlananMetrajlar } = useGetHazirlananMetrajlar({ selectedNode })
  // hazirlananMetrajlar && console.log("hazirlananMetrajlar", hazirlananMetrajlar)

  const { data: onaylananMetraj } = useGetOnaylananMetraj({ selectedNode })

  const { mutate: updateHazirlananMetraj } = useUpdateHazirlananMetraj()

  const { mutate: updateOnaylananMetraj } = useUpdateOnaylananMetrajlar()



  // Edit Metraj Sayfasının Fonksiyonu
  const load_hazirlananMetraj_state = () => {

    let userharf = isProject?.metrajYapabilenler.find(x => x._userId.toString() == RealmApp?.currentUser.id).harf

    if (hazirlananMetrajlar?.length > 0) {
      let hazirlananMetraj = hazirlananMetrajlar?.find(x => x._userId.toString() == RealmApp?.currentUser.id)

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
        setHazirlananMetraj_state({ _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar, metraj: 0 })
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
      setHazirlananMetraj_state({ _userId: new BSON.ObjectId(RealmApp?.currentUser.id), satirlar, metraj: 0 })
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





  // Metraj Onay Sayfasının Fonksiyonu

  const load_hazirlananVeOnaylananMetrajlar_state = () => {


    let onaylananMetraj2 = JSON.parse(JSON.stringify(onaylananMetraj))
    if (onaylananMetraj2?.satirlar.length) {
      onaylananMetraj2.satirlar = onaylananMetraj2.satirlar.map(x => {
        x._hazirlayanId = new BSON.ObjectId(x._hazirlayanId)
        x._onaylayanId = new BSON.ObjectId(x._onaylayanId)
        x.onaylanmaTarihi = new Date(x.onaylanmaTarihi)
        x.hazirlanmaTarihi = new Date(x.hazirlanmaTarihi)
        return x
      })
    }
    setOnaylananMetraj_state(onaylananMetraj2)


    let hazirlananMetrajlar2 = JSON.parse(JSON.stringify(hazirlananMetrajlar))
    if (hazirlananMetrajlar2.length) {
      hazirlananMetrajlar2 = hazirlananMetrajlar2.map(x => {
        x._userId = new BSON.ObjectId(x._userId)
        x.satirlar = x.satirlar.map(y => {
          y.sonGuncelleme = new Date(y.sonGuncelleme)
          return y
        })
        return x
      })
    }
    setHazirlananMetrajlar_state(hazirlananMetrajlar2)

  }



  // Metraj Onay Sayfasının Fonksiyonu
  const metrajOnayla_state = ({ userId, satirNo }) => {

    setIsChanged(true)

    let onaylananMetraj_state2 = { ...onaylananMetraj_state }
    let sonSatir = 0
    if (onaylananMetraj_state2?.satirlar?.length) {
      onaylananMetraj_state2.satirlar.map(x => {
        if (x?.satirNo > sonSatir) sonSatir = x.satirNo
      })
    }

    let hazirlananMetrajlar_state2 = hazirlananMetrajlar_state.map(oneHazirlanan => {
      if (oneHazirlanan._userId.toString() === userId) {

        oneHazirlanan.satirlar = oneHazirlanan.satirlar.map(oneSatir => {
          if (oneSatir.satirNo === satirNo) {

            if (!oneSatir.isApproved) {
              oneSatir.isApproved = true

              if (!oneHazirlanan.onaylananMetraj) oneHazirlanan.onaylananMetraj = 0
              oneHazirlanan.onaylananMetraj = oneHazirlanan.onaylananMetraj + oneSatir.metraj

              if (!onaylananMetraj_state2.metraj) onaylananMetraj_state2.metraj = 0
              if (!onaylananMetraj_state2.satirlar) onaylananMetraj_state2.satirlar = []
              onaylananMetraj_state2.metraj = onaylananMetraj_state2.metraj + Number(oneSatir.metraj)

              let satirObj = {
                ...oneSatir,
                _hazirlayanId: oneHazirlanan._userId,
                hazirlanmaTarihi: oneSatir.sonGuncelleme,
                _onaylayanId: new BSON.ObjectId(RealmApp?.currentUser.id),
                onaylanmaTarihi: new Date(),
              }
              delete satirObj.isApproved
              delete satirObj.sonGuncelleme

              onaylananMetraj_state2.satirlar = [...onaylananMetraj_state2.satirlar, satirObj]
              onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.sort((a, b) => a.satirNo.localeCompare(b.satirNo))

            } else {
              oneSatir.isApproved = false
              oneHazirlanan.onaylananMetraj = Number(oneHazirlanan.onaylananMetraj) - Number(oneSatir.metraj)
              onaylananMetraj_state2.metraj = Number(onaylananMetraj_state2.metraj) - Number(oneSatir.metraj)
              onaylananMetraj_state2.satirlar = onaylananMetraj_state2.satirlar.filter(x => x.satirNo !== satirNo)
            }
          }
          return oneSatir
        })
      }
      return oneHazirlanan
    })

    setOnaylananMetraj_state(onaylananMetraj_state2)

    setHazirlananMetrajlar_state(hazirlananMetrajlar_state2)

  }



  // Metraj Onay Sayfasının Fonksiyonu
  const saveOnaylananMetraj_toDb = () => {
    if (isChanged) console.log("değişecek")
    // if (isChanged) updateOnaylananMetraj({ selectedNode, hazirlananMetraj_state, setHazirlananMetraj_state })
    setShow("DugumMetrajlari")
    setIsChanged()
  }





  // Metraj Onay Sayfasının Fonksiyonu
  const delete_approvedMetrajRow = ({ oneRow }) => {
    // console.log("oneRow", oneRow)
    // console.log("dugumMetraj_state", dugumMetraj_state)
    // console.log("dugumMetraj_state2", dugumMetraj_state2)

    let dugumMetraj_state2 = { ...dugumMetraj_state }
    dugumMetraj_state2.satirlar = dugumMetraj_state2.satirlar.map(oneMetraj2 => {
      if (oneMetraj2._userId.toString() === oneRow.hazirlayanId) {
        oneMetraj2.satirlar = oneMetraj2.satirlar.map(oneRow2 => {
          if (oneRow2.satirNo === oneRow.satirNo) {
            oneRow2.isApproved = false
            dugumMetraj_state2.metrajSatirlari.satirlar = [...dugumMetraj_state2.metrajSatirlari.satirlar.filter(x => x.hazirlayanId + x.satirNo !== oneRow.hazirlayanId + oneRow.satirNo)].sort((a, b) => a.satirNo - b.satirNo)
            dugumMetraj_state2.metrajSatirlari.sonGuncelleme = new Date()
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




  pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId)?.name
  pozMetraj = mahalListesi?.list.filter(item => item._pozId.toString() == selectedPoz?._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj?.guncel)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj?.guncel)), 0)
  pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)



  return (

    <>

      <Grid name="metrajCetveliHeader" item sx={{ mt: (parseFloat(subHeaderHeight) + 1) + "rem", }}>
        <MetrajCetveliHeader
          show={show} setShow={setShow}
          save_hazirlananMetraj_toDb={save_hazirlananMetraj_toDb}
          load_hazirlananMetraj_state={load_hazirlananMetraj_state}
          load_hazirlananVeOnaylananMetrajlar_state={load_hazirlananVeOnaylananMetrajlar_state}
          setHazirlananMetraj_state={setHazirlananMetraj_state}
          isChanged={isChanged} setIsChanged={setIsChanged}
          saveOnaylananMetraj_toDb={saveOnaylananMetraj_toDb}
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




      {/* PAGE -> ONAYLI VE HAZIRLANAN METRAJLARIN GÖSTERİMİ */}
      {show == "DugumMetrajlari" &&

        < Box name="DugumMetrajlari" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}>


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
          {!hazirlananMetrajlar?.metrajSatirlari?.length > 0 &&
            <Box sx={{ width: '66rem', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="primary">
                {"Henüz onaylanmış metraj bulunmuyor, yukarıdaki 'onay' işaretine tıklayarak hazırlanan metrajlardan onay verebilirsiniz."}
              </Alert>
            </Box>
          }


          {/* ONAYLI METRAJLAR VARSA */}
          {hazirlananMetrajlar?.metrajSatirlari?.length > 0 &&
            hazirlananMetrajlar.metrajSatirlari.map((oneMetraj, index) => {

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

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneProperty.includes("metin") ? "start" : oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : "center",
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneProperty, isMinha)}
                            </Box>
                          )
                        })}


                        {detailMode && oneRow.sonGuncelleme &&
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
          {!hazirlananMetrajlar?.length > 0 &&
            <Box sx={{ width: '66rem', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz hazırlanmış metraj bulunmuyor, yukarıdaki 'kalem' işaretine tıklayarak metraj girişi yapabilirsiniz."}
              </Alert>
            </Box>
          }


          {/* HAZIRLANAN METRAJ VARSA */}
          {hazirlananMetrajlar?.length > 0 &&

            hazirlananMetrajlar?.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* ONAYLANAN METRAJLAR BAŞLIK SATIRI */}
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


                  {/* HAZIRLANAN METRAJLAR BAŞLIK SATIRI */}
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

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneProperty.includes("metin") ? "start" : oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : "center",
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneProperty, isMinha)}
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


                        {detailMode && oneRow.sonGuncelleme &&
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

        < Box name="EditMetraj" sx={{ display: "grid", mt: subHeaderHeight, ml: "1rem", mr: "1rem", justifyItems: "start" }}>


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
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: hazirlananMetraj_state["metraj"] < 0 ? "red" : null }}>
                {ikiHane(hazirlananMetraj_state["metraj"])}
              </Box>

              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>{pozBirim}</Box>

              <Box sx={{ border: "none", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}></Box>
              <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>Durum</Box>

            </Grid>
            {/* {console.log("hazirlananMetraj_state.satirlar", hazirlananMetraj_state.satirlar)} */}
            {hazirlananMetraj_state.satirlar.map((oneRow, index) => {
              return (
                < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 4rem", justifyContent: "start" }}>

                  {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                    let isCellEdit = oneProperty === "satirNo" || oneProperty === "pozBirim" || oneProperty === "metraj" ? false : true
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
                          readOnly={!isCellEdit || oneRow.isHazirlananOnay}
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

            {/* <Box sx={{ border: "none", display: "grid", alignItems: "end", textAlign: "center", backgroundColor: "white" }}>

            </Box> */}
            {/* <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Tarih
            </Box> */}

          </Grid >




          {/* HAZIRLANAN METRAJLAR GÖSTERİMİ */}

          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Hazırlanan Metrajlar
          </Typography>



          {/* HAZIRLANAN METRAJ YOKSA */}
          {!hazirlananMetrajlar?.length > 0 &&
            <Box sx={{ width: '66rem', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="warning">
                {"Henüz hazırlanmış metraj bulunmuyor, yukarıdaki 'kalem' işaretine tıklayarak metraj girişi yapabilirsiniz."}
              </Alert>
            </Box>
          }



          {/* HAZIRLANAN METRAJ VARSA */}
          {hazirlananMetrajlar_state?.length > 0 &&

            hazirlananMetrajlar_state?.map((oneMetraj, index) => {

              let isOwnUser = oneMetraj?._userId.toString() == RealmApp?.currentUser.id

              return (

                <Box key={index} sx={{ mb: "2rem" }}>

                  {/* hazirlananMetraj - Başlık Satırı */}
                  <Box>{oneMetraj?._userId.toString()}</Box>

                  {/* onaylananMetraj - Başlık Satırı */}
                  <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 4rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
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
                        <Box> Onaylanan Metrajlar </Box>
                      </Box>
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem", color: oneMetraj["metraj"] < 0 ? "red" : null }}>
                      {oneMetraj["onaylananMetraj"] ? ikiHane(oneMetraj["onaylananMetraj"]) : "0,00"}
                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      {pozBirim}
                    </Box>

                    <Box sx={{ border: "none", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "center", alignItems: "center" }}></Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "center", alignItems: "center" }}>Durum</Box>


                    {detailMode &&
                      <>
                        <Box sx={{ border: "none", backgroundColor: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>

                        </Box>
                        <Box sx={{ border: "1px solid black", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "center", alignItems: "center" }}>
                          Tarih
                        </Box>
                      </>
                    }

                  </Grid>



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
                        <Box> Hazırlanan Metrajlar </Box>
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

                        {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                          let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                          return (
                            <Box key={index}
                              sx={{
                                display: "grid",
                                justifyItems: oneProperty.includes("metin") ? "start" : oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : "center",
                                color: isMinha ? "red" : null,
                                px: "0.3rem",
                                border: "1px solid black"
                              }}>
                              {metrajValue(oneRow, oneProperty, isMinha)}
                            </Box>
                          )
                        })}


                        <Box sx={{ border: "none" }}></Box>

                        <Box
                          onClick={() => metrajOnayla_state({ userId: oneMetraj._userId.toString(), satirNo: oneRow.satirNo })}
                          sx={{
                            display: "grid",
                            alignItems: "center",
                            justifyItems: "center",
                            px: "0.3rem",
                            border: "1px solid black",
                            backgroundColor: "yellow",
                            cursor: "pointer"
                          }}
                        >
                          {oneRow.isApproved &&
                            <CheckIcon variant="contained" sx={{ color: "rgba( 0, 128, 0, 0.7 )", fontSize: "1.5rem" }} />
                          }
                          {!oneRow.isApproved &&
                            <HourglassFullSharpIcon variant="contained" sx={{ color: "rgba( 255,165,0, 1 )", fontSize: "0.95rem" }} />
                          }
                        </Box>

                        {detailMode && oneRow["sonGuncelleme"] &&
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





          {/* ONAYLI METRAJLAR BAŞLIK */}
          <Typography sx={{ fontWeight: "600", mb: "0.5rem" }} variant="h6" component="h5">
            Onaylanan Metraj
          </Typography>


          {/* ONAYLI METRAJLAR YOKSA */}
          {!onaylananMetraj_state?.satirlar?.length > 0 &&
            <Box sx={{ width: '66rem', mb: "0.5rem" }} spacing={2}>
              <Alert severity="success" color="primary">
                {"Henüz onaylanmış metraj bulunmuyor, yukarıdaki 'onay' işaretine tıklayarak hazırlanan metrajlardan onay verebilirsiniz."}
              </Alert>
            </Box>
          }


          {/* {console.log("onaylananMetraj_state", onaylananMetraj_state)} */}
          {/* ONAYLI METRAJLAR VARSA */}
          {onaylananMetraj_state?.satirlar?.length > 0 &&

            <Box sx={{ mb: "2rem" }}>

              {/* hazirlananMetraj - Başlık Satırı */}
              <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem 1rem 4rem 1rem 7rem", justifyContent: "start", alignItems: "center" }}>
                <Box sx={{ border: "1px solid black", backgroundColor: "green", color: "white", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>
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

                    <Box sx={{ border: "none" }}></Box>

                    {onaylananMetraj_state.hasOwnProperty("onaylanmaTarihi") ?
                      <Box>
                        {onaylananMetraj_state.onaylanmaTarihi.getMonth() < 9 ?
                          onaylananMetraj_state.onaylanmaTarihi.getDate() + "." + "0" + (onaylananMetraj_state.onaylanmaTarihi.getMonth() + 1) + "." + onaylananMetraj_state.onaylanmaTarihi.getUTCFullYear() :
                          onaylananMetraj_state.onaylanmaTarihi.getDate() + "." + (onaylananMetraj_state.onaylanmaTarihi.getMonth() + 1) + "." + onaylananMetraj_state.onaylanmaTarihi.getUTCFullYear()
                        }
                      </Box>
                      :
                      <Box sx={{ color: "green" }}>
                        .
                      </Box>
                    }
                  </Box>
                </Box>
                <Box sx={{ border: "1px solid black", backgroundColor: "green", color: "white", display: "grid", justifyContent: "end", alignItems: "center", pr: "0.3rem" }}>
                  {ikiHane(onaylananMetraj_state["metraj"])}
                </Box>
                <Box sx={{ border: "1px solid black", backgroundColor: "green", color: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>
                  {pozBirim}
                </Box>

                <Box sx={{ border: "none", backgroundColor: "rgba(127, 255, 212, 0.6)", display: "grid", justifyContent: "center", alignItems: "center" }}></Box>
                <Box sx={{ border: "1px solid black", backgroundColor: "green", color: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>Durum</Box>


                {detailMode &&
                  <>
                    <Box sx={{ border: "none", backgroundColor: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>

                    </Box>
                    <Box sx={{ border: "1px solid black", backgroundColor: "green", color: "white", display: "grid", justifyContent: "center", alignItems: "center" }}>
                      Tarih
                    </Box>
                  </>
                }


              </Grid>

              {/* hazirlananMetraj - Metraj Satırları */}
              {onaylananMetraj_state?.satirlar.map((oneRow, index) => {

                return (
                  < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem 1rem 4rem 1rem 7rem", justifyContent: "start" }}>

                    {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneProperty, index) => {
                      let isMinha = oneRow["metin1"].replace("İ", "i").toLowerCase().includes("minha") || oneRow["metin2"].replace("İ", "i").toLowerCase().includes("minha") ? true : false
                      return (
                        <Box key={index}
                          sx={{
                            display: "grid",
                            justifyItems: oneProperty.includes("metin") ? "start" : oneProperty.includes("carpan") || oneProperty.includes("metraj") ? "end" : "center",
                            color: isMinha ? "red" : null,
                            px: "0.3rem",
                            border: "1px solid black"
                          }}>
                          {metrajValue(oneRow, oneProperty, isMinha)}
                        </Box>
                      )
                    })}

                    <Box sx={{ border: "none" }}></Box>

                    <Box
                      // onClick={() => metrajOnayla_state({ userId: oneMetraj._userId.toString(), satirNo: oneRow.satirNo })}
                      sx={{
                        display: "grid",
                        alignItems: "center",
                        justifyItems: "center",
                        px: "0.3rem",
                        border: "1px solid black",
                        // backgroundColor: oneRow.isHazirlananOnay && "yellow",
                        cursor: "pointer"
                      }}
                    >
                      <DoneAllIcon variant="contained" sx={{ color: "rgba( 0, 128, 0, 0.7 )", fontSize: "1.5rem" }} />

                    </Box>



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
                          {oneRow.onaylanmaTarihi.getMonth() < 9 ?
                            oneRow.onaylanmaTarihi.getDate() + "." + "0" + (oneRow.onaylanmaTarihi.getMonth() + 1) + "." + oneRow.onaylanmaTarihi.getUTCFullYear() :
                            oneRow.onaylanmaTarihi.getDate() + "." + (oneRow.onaylanmaTarihi.getMonth() + 1) + "." + oneRow.onaylanmaTarihi.getUTCFullYear()
                          }
                        </Box>

                      </>}

                  </Grid >
                )
              })}


            </Box>


          }



        </Box >


      }


    </ >

  )

}

