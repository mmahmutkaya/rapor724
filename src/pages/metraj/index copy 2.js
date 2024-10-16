
import { useState, useContext, useEffect } from 'react';
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
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'



export default function P_Metraj() {

  const RealmApp = useApp();

  const page = "metraj"

  const { isProject, setIsProject } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  // const { mahaller, setMahaller } = useContext(StoreContext)
  // const { pozlar, setPozlar } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  // const { mahalListesi, setMahalListesi } = useContext(StoreContext)

  const [show, setShow] = useState("Pozlar")
  const [editMode_Metraj, setEditMode_Metraj] = useState(false)
  const [_pozId, set_pozId] = useState()
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ pozId: null, mahalId: null })


  const navigate = useNavigate()
  // !isProject ? navigate('/projects') : null
  // if (!isProject) window.location.href = "/projects"


  useEffect(() => {
    if (!isProject) navigate('/projects')
    // // Update the document title using the browser API
    // document.title = `You clicked ${count} times`;
  }, [isProject]);


  // const pozlar_fecth = async () => {
  //   if (!pozlar) {
  //     const result = await RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id }));
  //     setPozlar(result)
  //   }
  // }
  // pozlar_fecth()


  const { data: pozlar } = useQuery({
    queryKey: ['pozlar', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject
  })


  const { data: mahaller } = useQuery({
    queryKey: ['mahaller', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject
  })


  const { data: mahalListesi } = useQuery({
    queryKey: ['mahalListesi', isProject?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getMahalListesi", _projectId: isProject?._id })),
    enabled: !!RealmApp && !!isProject
  })


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

  let totalWidthDegisken = isProject?.metrajBasliklari?.filter(item => !item.sabit).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  ) + 'rem'
  // console.log("isProject?.metrajBasliklari?", isProject?.metrajBasliklari)
  // console.log("totalWidthDegisken", totalWidthDegisken)

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


  let pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId)?.name
  let pozMetraj = selectedPoz ? mahalListesi?.filter(item => item._pozId.toString() == selectedPoz._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj?.guncel)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj?.guncel)), 0) : 22
  pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)
  let nodeMetrajGuncel = 13



  return (

    <>

      <Grid item >
        <MetrajHeader show={show} setShow={setShow} />
      </Grid>

      {show == "FormMahalCreate" &&
        <Grid item >
          <FormMahalCreate isProject={isProject} setShow={setShow} />
        </Grid>
      }

      {show == "Pozlar" && (isProject?.wbs?.filter(item => item.openForPoz).length == 0 || !isProject?.wbs) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir poz başlığını poz eklemeye açmamış görünüyorsunumuz. "Poz Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }


      {show == "Pozlar" && isProject?.wbs?.filter(item => item.openForPoz).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>


          {/* EN ÜST BAŞLIK ÜST SATIRI */}
          <Grid
            sx={{
              // pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_
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
                  {oneBaslik?.name}
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
            {isProject?.metrajBasliklari?.filter(item => !item.sabit).map((oneBaslik, index) => {
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

                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {oneBaslik?.name}
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
                  {
                    isProject?.metrajBasliklari?.filter(item => !item.sabit).map((oneBaslik, index) => {
                      return (
                        <TableHeader
                          key={index}
                          index={index}
                          count_={count_}
                          sx={{
                            // userSelect:"none",
                            display: custom?.pageMetraj_baslik1 ? "block" : "none",
                            alignItems: "center",
                            justifyItems: oneBaslik.yatayHiza,
                          }}
                        >

                        </TableHeader>
                      )
                    })
                  }

                  {/* 1 SIRA POZ BAŞLIKLARI BİTİNCE  ALTINDAKİ POZ SATIRLARI - BURADA VERDİĞİMİZ GRİD BOYUTLARI YUKARIDAKİ BAŞLIK İLE UYUMLU OLURSA TABLO OLUŞUR YOKSA SATURLAR ŞAŞIRIR*/}

                  {/* HAYALET */}
                  {<Box sx={{ display: "none" }}>
                    {count_ = pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).length}
                  </Box>}

                  <Box>

                    {/* POZLAR, wbs e göre filtreleniyor*/}
                    {pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).map((onePoz, index) => {

                      onePoz.birimName = isProject.pozBirimleri.find(item => item.id == onePoz.birimId).name
                      let isAnyMahal_for_poz

                      isAnyMahal_for_poz = mahalListesi?.find(x => x._pozId.toString() == onePoz._id.toString() && x.openMetraj) !== undefined

                      return (
                        <Grid
                          key={index}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplateColumns_,
                            cursor: isAnyMahal_for_poz ? "pointer" : "not-allowed"
                          }}
                          onClick={isAnyMahal_for_poz ? () => { setSelectedPoz(onePoz) } : null}
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
                                    backgroundColor: isAnyMahal_for_poz ? selectedPoz?._id.toString() == onePoz._id.toString() ? "yellow" : null : "lightgray"
                                  }}
                                >
                                  {onePoz[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>


                          {
                            isProject?.metrajBasliklari?.filter(item => !item.sabit).map((oneBaslik, index) => {
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
                                    backgroundColor: isAnyMahal_for_poz ? selectedPoz?._id.toString() == onePoz._id.toString() ? "yellow" : null : "lightgray"
                                  }}
                                >
                                  {onePoz[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

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



      {/* PAGE - POZUN MAHALLERİNİN LİSTELENDİĞİ İLK SAYFA */}
      {show == "PozMahalleri" &&

        < Box name="Main" sx={{ mt: parseFloat(subHeaderHeight) + 1 + "rem", ml: "1rem", mr: "1rem", width: "63rem" }}>

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

    </ >

  )

}


