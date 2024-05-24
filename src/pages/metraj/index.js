
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import MetrajHeader from '../../components/MetrajHeader'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_Metraj() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { mahalListesi, setMahalListesi } = useContext(StoreContext)
  const { pozlar, setPozlar } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editMode_Metraj, setEditMode_Metraj] = useState(false)
  const [_pozId, set_pozId] = useState()
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ pozId: null, mahalId: null })



  const navigate = useNavigate()
  // !isProject ? navigate('/projects') : null
  if (!isProject) window.location.href = "/projects"

  const RealmApp = useApp();

  const pozlar_fecth = async () => {
    if (!pozlar) {
      const result = await RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id }));
      setPozlar(result)
    }
  }
  pozlar_fecth()


  const mahaller_fecth = async () => {
    if (!mahaller) {
      const result = await RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: isProject?._id }));
      setMahaller(result)
    }
  }
  mahaller_fecth()


  const mahalListesi_fecth = async () => {
    if (!mahalListesi) {
      const result = await RealmApp?.currentUser.callFunction("getMahalListesi", ({ projectId: isProject?._id }));
      setMahalListesi(result)
    }
  }
  mahalListesi_fecth()



  const handleSelectMahal = (mahal) => {
    setSelectedMahal(mahal)
    setSelectedMahalBaslik(false)
  }


  // aşağıda kullanılıyor
  let wbsCode = ""
  let wbsName = ""
  let mahal
  let oneMetraj_
  let cOunt = 0
  let count_
  let toplam
  let g_altBaslik


  let totalWidthSabit = isProject?.pozBasliklari?.filter(item => item.sabit).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  ) + 'rem'


  let gridTemplateColumnsSabit = isProject?.pozBasliklari?.filter(item => item.sabit).reduce(
    (ilkString, oneBilgi, index) => index != isProject?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )

  let totalWidthDegisken = isProject?.metrajBasliklari?.filter(item => !item.sabit && item.goster).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  ) + 'rem'

  let gridTemplateColumnsDegisken = isProject?.metrajBasliklari?.filter(item => !item.sabit && item.goster).reduce(
    (ilkString, item, index) => index != isProject?.mahalBasliklari?.length ? ilkString + (item.genislik + "rem ") : ilkString + (item.genislik + "rem"),
    ""
  )

  let totalWidth = (parseFloat(totalWidthSabit) + 1 + parseFloat(totalWidthDegisken)) + 'rem'
  let gridTemplateColumns_ = gridTemplateColumnsSabit + " 1rem " + gridTemplateColumnsDegisken



  const TableHeader = styled('div')(({ index }) => ({
    marginTop: "1rem",
    // backgroundColor: "rgba(242, 203, 150, 1)",
    // backgroundColor: "rgba(150, 236, 242 , 0.8 )",
    // backgroundColor: "rgba( 56,56,56 , 0.4 )",
    backgroundColor: "rgba( 253, 197, 123 , 0.3 )",
    // backgroundColor: "#fdc57b",
    // color: "white",
    borderLeft: (index && index !== 0) ? null : "solid black 1px",
    borderRight: "solid black 1px",
    borderTop: "solid black 1px",
    borderBottom: "solid black 1px"
  }));


  const TableItem = styled('div')(({ index }) => ({
    // backgroundColor: "rgba( 56,56,56 , 0.15 )",
    borderTop: !custom?.pageMetraj_baslik1 ? "solid black 1px" : null,
    borderLeft: index == 0 ? "solid black 1px" : null,
    borderRight: "solid black 1px",
    borderBottom: "solid black 1px"
  }));

  const TableItem2 = styled('div')(({ index }) => ({
    // backgroundColor: "rgba( 255,255,0, 0.15 )",
    borderLeft: index == 0 ? "solid black 1px" : null,
    borderRight: "solid black 1px",
    borderBottom: "solid black 1px"
  }));

  const Bosluk = styled('div')(() => ({
    // backgroundColor: "lightblue"
    // borderLeft: index == 0 ? "solid black 1px" : null,
    // borderRight: "solid black 1px",
    // borderBottom: "solid black 1px"
  }));





  // FONKSİYONLAR


  const handle_selectBaslik = (oneBaslik) => {
    setSelectedMahalBaslik(oneBaslik)
    setSelectedMahal()
  }




  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  const saveMahal = async () => {
    // setMahalBilgiler_willBeSaved([])
    const result = await RealmApp?.currentUser.callFunction("updateMahalBilgiler", { _projectId: isProject?._id, mahalBilgiler_willBeSaved });
    setSelectedMahalBaslik(false)
  }

  const data = {
    type: "current",
    row1: {
      desc1: "KISA",
      desc2: "UZUN"
    }
  }



  const updateMetraj = async ({ _pozId }) => {

    const result = await RealmApp?.currentUser.callFunction("updateMetraj", { _projectId: isProject?._id, _pozId });
    return (
      console.log("result", { _projectId: isProject?._id, _pozId, data })
    )
  }






  const handle_input_onKey = async (event) => {

    let oncesi = event.target.value.toString()
    let sonTus = event.key
    let yeni = oncesi + sonTus

    if (sonTus.split(" ").length > 1) {
      console.log("boşluk bulundu ve durdu")
      return event.preventDefault()
    }

    let izinliTuslar = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape", "Enter", "Tab", "-", "."]

    if (!isNumeric(yeni) && !izinliTuslar.includes(sonTus)) {
      console.log("izinsiz tuşlara bastı ve durdu")
      return event.preventDefault()
    }

    if (sonTus == "-" && oncesi.split("").includes("-")) {
      console.log("zaten varken '-' kullanımı ve durdu")
      return event.preventDefault()
    }


    if (sonTus == "-" && yeni.split("")[0] !== ("-")) {
      console.log("event", event)
      console.log("başa gelmeyen '-' kullanımı ve durdu")
      return event.preventDefault()
    }


    if (sonTus == "." && oncesi.split("").includes(".")) {
      console.log("zaten varken '.' kullanımı ve durdu")
      return event.preventDefault()
    }

    if (isNumeric(sonTus) && yeni.split("").includes(".") && yeni.substring(yeni.indexOf(".") + 1, yeni.length).length > 3) {
      console.log("0 dan sonra 3 haneden fazla ve durdu")
      return event.preventDefault()
    }

  }



  const handle_input_onChange = (event, oneNode1) => {

    console.log("onChange Value", event.target.value)


    setAutoFocus({ pozId: oneNode1._pozId.toString(), mahalId: oneNode1._mahalId.toString() })

    // db ye kayıt yapılmışsa bu işlemi yapsın yoksa refresh yapsın
    const newBilgi = { mahalId: oneNode1._mahalId, pozId: oneNode1._pozId, metraj: event.target.value }

    if (!isNumeric(newBilgi.metraj) && newBilgi.metraj != "-" && newBilgi.metraj.length != 0 && newBilgi.metraj != ".") {
      return
    }


    setMahalListesi(mahalListesi => {
      // if (!mahalListesi.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler) {
      //   mahalListesi.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler = [newBilgi]
      //   return mahalListesi
      // }
      const node = mahalListesi.find(item => item._mahalId.toString() == oneNode1._mahalId.toString() && item._pozId.toString() == oneNode1._pozId.toString())
      if (node) {
        mahalListesi.find(item => item._mahalId.toString() == node._mahalId.toString() && item._pozId.toString() == node._pozId.toString()).metraj = newBilgi.metraj
        return mahalListesi
      } else {
        return [...mahalListesi, node]
      }
    })


    // setMahalBilgiler_willBeSaved(mahalBilgiler_willBeSaved => {
    //   let mahalBilgiler_willBeSaved_ = [...mahalBilgiler_willBeSaved]
    //   // console.log("mevcutBilgi",mahalBilgiler_willBeSaved.find(item => item.mahalId.toString() == oneMahal._id.toString() && item.baslikId == oneBaslik.id))
    //   if (mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id)) {
    //     mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id).metraj = newBilgi.metraj
    //   } else {
    //     mahalBilgiler_willBeSaved_ = [...mahalBilgiler_willBeSaved_, { ...newBilgi }]
    //   }
    //   return mahalBilgiler_willBeSaved_
    // })


  }



  return (

    <>

      <Grid item >
        <MetrajHeader show={show} setShow={setShow} editMode_Metraj={editMode_Metraj} setEditMode_Metraj={setEditMode_Metraj} saveMahal={saveMahal} />
      </Grid>

      {show == "FormMahalCreate" &&
        <Grid item >
          <FormMahalCreate isProject={isProject} setShow={setShow} />
        </Grid>
      }

      {show == "Main" && (isProject?.wbs?.filter(item => item.openForPoz).length == 0 || !isProject?.wbs) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir poz başlığını poz eklemeye açmamış görünüyorsunumuz. "Poz Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && isProject?.wbs?.filter(item => item.openForPoz).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* EN ÜST BAŞLIK ÜST SATIRI */}
          <Grid
            sx={{
              // pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            {/* SOL KISIM SABİT EN ÜST BAŞLIKLAR */}
            {/* HAYALET */}
            <Box sx={{ display: "none" }}>
              {count_ = isProject?.mahalBasliklari?.filter(item => item.sabit).length}
            </Box>
            {isProject?.pozBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "rgba( 56,56,56 , 0.9 )",
                    color: "white",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
                    display: "grid",
                    alignItems: "center",
                    justifyContent: oneBaslik.yatayHiza,
                    minHeight: "2rem"
                  }}
                  onClick={() => handle_selectBaslik(oneBaslik)}
                  key={index}
                >
                  {oneBaslik.name}
                </Box>
              )
            })}


            <Bosluk>
            </Bosluk>


            {/* SAĞ KISIM DEĞİŞKEN EN ÜST POZ BAŞLIKLARI */}
            {/* HAYALET KOMPONENT */}
            <Box sx={{ display: "none" }}>
              {count_ = pozlar?.length}
            </Box>
            {/* GÖZÜKEN KOMPONENT */}
            {isProject?.metrajBasliklari?.filter(item => !item.sabit && item.goster).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    // backgroundColor: editMode_Metraj ? "rgb( 110, 16, 16 , 1)" : "rgba( 56,56,56 , 0.9 )",
                    backgroundColor: "rgba( 56,56,56 , 0.9 )",
                    color: "white",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onClick={() => handle_selectBaslik(oneBaslik)}
                  key={index}
                >
                  {/* <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {index}
                  </Box> */}

                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {oneBaslik.name}
                  </Box>

                </Box>
              )
            })}

          </Grid>


          {/* SOL KISIMDAKİ (SABİT KISIMDAKİ) POZ BAŞLIKLARI ve SAĞ DEĞİŞKEN KISIMDA DEVAM EDEN BOŞ BAŞLIK HÜCRELERİ */}
          {/* ALTINDA DA GÖRÜNÜM AÇIKSA POZLARIN MAHAL KIRILIMI*/}
          {isProject?.wbs
            .filter(item => item.openForPoz === true)
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
            }).map((oneWbs, index) => {
              return (
                <Grid
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: totalWidthSabit + " 1rem " + gridTemplateColumnsDegisken,
                  }}
                >
                  {/* SOL TARAF - SABİT MAHAL BAŞLIĞI */}
                  <TableHeader sx={{ display: custom?.pageMetraj_baslik1 ? "block" : "none" }}>

                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = oneWbs.code.split(".").length}
                    </Box>

                    {
                      oneWbs.code.split(".").map((codePart, index) => {

                        if (index == 0 && cOunt == 1) {
                          wbsCode = codePart
                          wbsName = isProject?.wbs.find(item => item.code == wbsCode).name
                        }

                        if (index == 0 && cOunt !== 1) {
                          wbsCode = codePart
                          wbsName = isProject?.wbs.find(item => item.code == wbsCode).codeName
                        }

                        if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                          wbsCode = wbsCode + "." + codePart
                          wbsName = wbsName + " > " + isProject?.wbs.find(item => item.code == wbsCode).codeName
                        }

                        if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                          wbsCode = wbsCode + "." + codePart
                          wbsName = wbsName + " > " + isProject?.wbs.find(item => item.code == wbsCode).name
                        }

                      })
                    }


                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = wbsName.split(">").length}
                    </Box>

                    {/* GÖZÜKEN KOMPONENET - sabit kısımda - wbs başlığının yazdığı yer */}
                    {wbsName.split(">").map((item, index) => (

                      <Typography key={index} component={"span"} >
                        {item}
                        {index + 1 !== cOunt &&
                          <Typography component={"span"} sx={{ fontWeight: "600", color: "darkred" }}>{">"}</Typography>
                        }
                      </Typography>

                    ))}

                  </TableHeader>


                  <Bosluk sx={{ display: custom?.pageMetraj_baslik1 ? "block" : "none" }} ></Bosluk>


                  {/* SAĞ TARAF - DEĞİŞKEN MAHAL BAŞLIĞI - BOŞ */}
                  <TableHeader sx={{ display: custom?.pageMetraj_baslik1 ? "block" : "none" }} index={0}></TableHeader>
                  <TableHeader sx={{ display: custom?.pageMetraj_baslik1 ? "block" : "none" }} index={1}></TableHeader>




                  {/* 1 SIRA POZ BAŞLIKLARI BİTİNCE  ALTINDAKİ POZ SATIRLARI - BURADA VERDİĞİMİZ GRİD BOYUTLARI YUKARIDAKİ BAŞLIK İLE UYUMLU OLURSA TABLO OLUŞUR YOKSA SATURLAR ŞAŞIRIR*/}

                  {/* HAYALET */}
                  {<Box sx={{ display: "none" }}>
                    {count_ = pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).length}
                  </Box>}

                  <Box>

                    {/* POZLAR, wbs e göre filtreleniyor*/}
                    {pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).map((onePoz, index) => {

                      onePoz.birimName = isProject.pozBirimleri.find(item => item.id == onePoz.birimId).name

                      return (
                        <Grid
                          key={index}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplateColumns_,
                            cursor: "pointer"
                          }}
                          onClick={() => setSelectedPoz(onePoz)}
                        >

                          {
                            isProject?.pozBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  sx={{
                                    // userSelect:"none",
                                    display: "grid",
                                    alignItems: "center",
                                    justifyItems: oneBaslik.yatayHiza,
                                  }}
                                >
                                  {onePoz[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>

                          {/* metraj toplamının yazdığı yer */}
                          <TableItem
                            index={0}
                            sx={{ display: "grid", justifyContent: "end", pr: "0.4rem", position:"relative" }}
                          >
                            {mahalListesi?.filter(item => item._pozId.toString() == onePoz._id.toString() && item.open).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj)), 0)}

                            {selectedPoz?._id.toString() == onePoz._id.toString() &&
                              <Grid sx={{ position: "absolute", display: "grid", alignItems: "center", justifyContent: "start", width: "100%", height: "100%", pl: "0.3rem" }}>
                                <Box sx={{ backgroundColor: "rgba(255, 0, 0, 0.5)", borderRadius: "0.5rem", height: "0.5rem", width: "0.5rem" }}> </Box>
                              </Grid>
                            }
                          </TableItem>


                          {/* metraj biriminin yazdığı yer */}
                          <TableItem
                            index={1}
                            sx={{ display: "grid", justifyContent: "center" }}
                          >
                            {onePoz.birimName}
                          </TableItem>



                          {/* bu kodlar header da tuş kapandığı (dolayısı ile pageMetraj_baslik2 true yapılamadığı) için şu an istesek de gösterilemiyor*/}
                          {/* opsiyonel gösterim - POZ ALTINDAKİ MAHALLER - */}

                          {/* <Box sx={{ display: editMode_Metraj ? "block" : "none" }}> */}
                          {/* <Box sx={{ display: custom?.pageMetraj_baslik2 ? "block" : "none" }}>
                            {mahalListesi?.filter(item => item._pozId.toString() == onePoz._id.toString()).map((oneNode, index) => {

                              { mahal = mahaller?.find(item => item._id.toString() == oneNode._mahalId.toString()) }

                              return (
                                < Box key={index} sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns_ }}>
                                  <TableItem2
                                    index={0}
                                    sx={{ display: "grid", justifyContent: "center" }}
                                  >
                                    {mahal?.kod}
                                  </TableItem2>


                                  <TableItem2
                                    index={1}
                                    sx={{ display: "grid", justifyContent: "center" }}
                                  >
                                    {mahal?.name}
                                  </TableItem2>


                                  <Bosluk>
                                  </Bosluk>


                                  {editMode_Metraj &&
                                    <TableItem2
                                      index={0}
                                      sx={{ display: "grid", justifyContent: "center" }}
                                    >
                                      <Input
                                        autoFocus={autoFocus.mahalId == oneNode._mahalId.toString() && autoFocus.pozId == oneNode._pozId.toString()}
                                        disableUnderline={true}
                                        size="small"
                                        type='text'
                                        onKeyDown={(event) => handle_input_onKey(event)}
                                        onChange={(event) => handle_input_onChange(event, oneNode)}
                                        sx={{
                                          backgroundColor: editMode_Metraj ? "rgba( 255,255,0, 0.25 )" : null,
                                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                            display: "none",
                                          },
                                          "& input[type=number]": {
                                            MozAppearance: "textfield",
                                          },
                                        }}
                                        defaultValue={oneNode.metraj}
                                        inputProps={{
                                          style: {
                                            height: "1rem",
                                            fontSize: "0.95rem",
                                            marginTop: "0.1rem",
                                            marginRight: "0.4rem",
                                            paddingBottom: "0px",
                                            marginbottom: "0px",
                                            textAlign: "right"
                                          },
                                        }}
                                      />

                                    </TableItem2>
                                  }


                                  {!editMode_Metraj &&
                                    <TableItem2
                                      index={0}
                                      sx={{ display: "grid", justifyContent: "end", pr: "0.4rem", }}
                                    >
                                      {oneNode.metraj}
                                    </TableItem2>
                                  }


                                  <TableItem2
                                    index={1}
                                    sx={{ display: "grid", justifyContent: "center" }}
                                  >
                                    {onePoz.birimName}
                                  </TableItem2>

                                </Box>

                              )

                            })}
                          </Box> */}

                        </Grid>
                      )
                    })}
                  </Box>

                </Grid>
              )
            })
          }

        </Box>

      }

    </ >

  )

}


