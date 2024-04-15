
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import FormMahalBaslikCreate from '../../components/FormMahalBaslikCreate'
import MahalListesiHeader from '../../components/MahalListesiHeader'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_MahalListesi() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { mahalListesi, setMahalListesi } = useContext(StoreContext)
  const { pozlar, setPozlar } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editMode_MahalListesi, setEditMode_MahalListesi] = useState(false)
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, mahalId: null })



  // https://palettes.shecodes.io/palettes/1312#palette



  const router = useRouter();
  // !isProject ? router.push('/projects') : null
  !isProject ? window.location.href = "/projects" : null

  const RealmApp = useApp();

  const mahaller_fecth = async () => {
    if (!mahaller) {
      const result = await RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: isProject?._id }));
      setMahaller(result)
    }
  }
  mahaller_fecth()

  const pozlar_fecth = async () => {
    if (!pozlar) {
      const result = await RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id }));
      setPozlar(result)
    }
  }
  pozlar_fecth()


  const mahalListesi_fecth = async () => {
    if (!mahalListesi) {
      const result = await RealmApp?.currentUser.callFunction("getMahalListesi", ({ projectId: isProject?._id }));
      setMahalListesi(result)
      console.log("result_mahalListesi", result)
    }
  }
  mahalListesi_fecth()



  const handleSelectMahal = (mahal) => {
    setSelectedMahal(mahal)
    setSelectedMahalBaslik(false)
  }


  // aşağıda kullanılıyor
  let lbsCode = ""
  let lbsName = ""
  let nodeMahal
  let cOunt = 0
  let count_
  let toplam
  let g_altBaslik


  const _3_fixed_width_rem = "6rem 35rem 5rem"
  _3_fixed_width_rem.split(" ").map(item => {
    let gecici = Number(item.replace("rem", ""))
    toplam ? toplam = toplam + gecici : toplam = gecici
  })
  const total_fixed_width = toplam

  const one_bosluk_width = 2

  const one_mahal_width = 10


  // let basliklar = [
  //   { id: 1, isim: "No" },
  //   { id: 2, isim: "İsim" },
  //   { id: 3, isim: "bosluk" },
  //   { id: 3, isim: "Tarif" },
  //   { id: 4, isim: "Ölçü" },
  // ]

  /* padding - top | right | bottom | left */
  // const [basliklar, setBasliklar] = useState([
  //   { id: 1, sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, padding_M: "0px 1rem 0px 0px", yatayHiza: "end", name: "Mahal No", dataType: "number" },
  //   { id: 2, sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, padding_M: "0px 1rem 0px 0px", yatayHiza: "end", name: "Mahal İsmi", dataType: "string" },
  //   { id: 3, sira: 3, referans: "name", goster: true, sabit: false, genislik: 15, padding_M: "0px 0rem 0px 0px", yatayHiza: "center", name: "Zemin Alan", dataType: "date" },
  //   { id: 4, sira: 4, referans: "name", goster: true, sabit: false, genislik: 20, padding_M: "0px 0rem 0px 0px", yatayHiza: "center", name: "Fonksiyon", dataType: "date" },
  // ].sort((a, b) => a.sira - b.sira))

  // const [basliklar, setBasliklar] = useState(isProject?.mahalBasliklari?.filter(item => item.goster))


  let totalWidthSabit = isProject?.mahalBasliklari?.filter(item => item.sabit).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidthSabit = totalWidthSabit + 'rem'


  let totalWidthDegisken = pozlar?.length * 10
  totalWidthDegisken = totalWidthDegisken + 'rem'


  let totalWidth = (parseFloat(totalWidthSabit) + 2 + parseFloat(totalWidthDegisken)) + 'rem'


  let gridTemplateColumnsSabit = isProject?.mahalBasliklari?.filter(item => item.sabit).reduce(
    (ilkString, oneBilgi, index) => index != isProject?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )


  let gridTemplateColumnsDegisken = pozlar?.reduce(
    (ilkString, onePoz, index) => index != pozlar?.length ? ilkString + (10 + "rem ") : ilkString + (10 + "rem"),
    ""
  )

  let gridTemplateColumnsDegisken2 = isProject?.mahalBasliklari?.filter(item => !item.sabit && item.goster).reduce(
    (ilkString, oneBilgi, index) => index != isProject?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )


  let gridTemplateColumns_ = gridTemplateColumnsSabit + " 2rem " + gridTemplateColumnsDegisken


  const TableHeader = styled('div')(({ index }) => ({
    marginTop: "1rem",
    // backgroundColor: "rgba(242, 203, 150, 1)",
    // backgroundColor: "rgba(150, 236, 242 , 0.8 )",
    backgroundColor: "rgba( 56,56,56 , 0.15 )",
    borderLeft: (index && index !== 0) ? null : "solid black 1px",
    borderRight: "solid black 1px",
    borderTop: "solid black 1px",
    borderBottom: "solid black 1px"
  }));

  const TableItem = styled('div')(({ index }) => ({
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



  const handle_input_onKey = async (event, oneBaslik) => {

    let oncesi = event.target.value.toString()
    let sonTus = event.key
    let yeni = oncesi + sonTus

    // sayı 
    if (oneBaslik.veriTuruId === "sayi") {

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

  }



  const handle_input_onChange = (event, oneBaslik, oneMahal) => {

    setAutoFocus({ baslikId: oneBaslik.id, mahalId: oneMahal._id.toString() })

    // db ye kayıt yapılmışsa bu işlemi yapsın yoksa refresh yapsın
    const newBilgi = { mahalId: oneMahal._id, baslikId: oneBaslik.id, veri: event.target.value }

    if (oneBaslik.veriTuruId === "sayi" && !isNumeric(newBilgi.veri) && newBilgi.veri != "-" && newBilgi.veri.length != 0 && newBilgi.veri != ".") {
      return
    }


    setMahaller(mahaller => {
      // if (!mahaller.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler) {
      //   mahaller.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler = [newBilgi]
      //   return mahaller
      // }
      if (!mahaller.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id)) {
        mahaller.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler.push(newBilgi)
        return mahaller
      }
      mahaller.find(item => item._id.toString() == oneMahal._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id).veri = newBilgi.veri
      return mahaller
    })


    setMahalBilgiler_willBeSaved(mahalBilgiler_willBeSaved => {
      let mahalBilgiler_willBeSaved_ = [...mahalBilgiler_willBeSaved]
      if (mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id)) {
        mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id).veri = newBilgi.veri
      } else {
        mahalBilgiler_willBeSaved_ = [...mahalBilgiler_willBeSaved_, { ...newBilgi }]
      }
      return mahalBilgiler_willBeSaved_
    })

  }


  const toggleMahalPoz = async ({ _mahalId, _pozId, open }) => {

    const resultMahalPoz = await RealmApp?.currentUser.callFunction("toggleMahalPoz", ({ _projectId: isProject?._id, _mahalId, _pozId, open }));
    setMahalListesi(mahalListesi => {
      mahalListesi = mahalListesi.filter(item => !(item._mahalId.toString() == _mahalId.toString() && item._pozId == _pozId.toString()))
      if (open) {
        mahalListesi = [...mahalListesi, { ...resultMahalPoz }]
      } else {
        return mahalListesi
      }
    })
  }



  const saveMahal = async () => {
    // setMahalBilgiler_willBeSaved([])
    const result = await RealmApp?.currentUser.callFunction("updateMahalBilgiler", { _projectId: isProject?._id, mahalBilgiler_willBeSaved });
    setEditMode_MahalListesi(false)
    setSelectedMahalBaslik(false)
  }


  return (

    <>

      <Grid item >
        <MahalListesiHeader setShow={setShow} editMode_MahalListesi={editMode_MahalListesi} setEditMode_MahalListesi={setEditMode_MahalListesi} saveMahal={saveMahal} />
      </Grid>

      {show == "FormMahalCreate" &&
        <Grid item >
          <FormMahalCreate isProject={isProject} setShow={setShow} />
        </Grid>
      }

      {show == "FormMahalBaslikCreate" &&
        <Grid item >
          <FormMahalBaslikCreate setShow={setShow} />
        </Grid>
      }

      {show == "Main" && (isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !isProject?.lbs) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir mahal başlığını mahal eklemeye açmamış görünüyorsunumuz. "Mahal Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && isProject?.lbs?.filter(item => item.openForMahal).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* EN ÜST BAŞLIK ÜST SATIRI */}
          <Grid
            sx={{
              pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            {/* SOL KISIM SABİT EN ÜST MAHAL BAŞLIKLARI */}
            {/* HAYALET */}
            <Box sx={{ display: "none" }}>
              {count_ = isProject?.mahalBasliklari?.filter(item => item.sabit).length}
            </Box>
            {isProject?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
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
            {pozlar?.map((onePoz, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: editMode_MahalListesi ? "rgb( 110, 16, 16 , 1)" : "rgba( 56,56,56 , 0.9 )",
                    color: "white",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
                    display: "grid",
                    justifyContent: "center"
                  }}
                  onClick={() => handle_selectBaslik(onePoz)}
                  key={index}
                >
                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {index}
                  </Box>

                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {onePoz.name}
                  </Box>

                </Box>
              )
            })}

          </Grid>


          {/* SOL KISIMDAKİ SABİT KISIMDAKİ MAHAL BAŞLIKLARI ve SAĞ DEĞİŞKEN KISIMDA DEVAM EDEN BOŞ BAŞLIK HÜCRELERİ */}
          {/* SOL KISIMDAKİ SABİT KISIMDAKİ MAHAL BAŞLIĞI ALTINDAKİ MAHALLER ve SAĞ DEĞİŞKEN KISIMDA DEVAM EDEN BOŞ BAŞLIK HÜCRELERİ ALTINDA POZ HÜCRELERİ*/}
          {isProject?.lbs
            .filter(item => item.openForMahal === true)
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
            }).map((oneLbs, index) => {
              return (
                <Grid
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: totalWidthSabit + " 2rem " + gridTemplateColumnsDegisken,
                  }}
                >
                  {/* SOL TARAF - SABİT MAHAL BAŞLIĞI */}
                  <TableHeader>

                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = oneLbs.code.split(".").length}
                    </Box>

                    {
                      oneLbs.code.split(".").map((codePart, index) => {

                        if (index == 0 && cOunt == 1) {
                          lbsCode = codePart
                          lbsName = isProject?.lbs.find(item => item.code == lbsCode).name
                        }

                        if (index == 0 && cOunt !== 1) {
                          lbsCode = codePart
                          lbsName = isProject?.lbs.find(item => item.code == lbsCode).codeName
                        }

                        if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                          lbsCode = lbsCode + "." + codePart
                          lbsName = lbsName + " > " + isProject?.lbs.find(item => item.code == lbsCode).codeName
                        }

                        if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                          lbsCode = lbsCode + "." + codePart
                          lbsName = lbsName + " > " + isProject?.lbs.find(item => item.code == lbsCode).name
                        }

                      })
                    }


                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = lbsName.split(">").length}
                    </Box>

                    {/* GÖZÜKEN KOMPONENET - sabit kısımda - lbs başlığının yazdığı yer */}
                    {lbsName.split(">").map((item, index) => (

                      <Typography key={index} component={"span"} >
                        {item}
                        {index + 1 !== cOunt &&
                          <Typography component={"span"} sx={{ fontWeight: "600", color: "darkred" }}>{">"}</Typography>
                        }
                      </Typography>

                    ))}

                  </TableHeader>


                  <Bosluk ></Bosluk>


                  {/* SAĞ TARAF - DEĞİŞKEN MAHAL BAŞLIĞI - BOŞ */}
                  {/* burada başlık sıralamasına göre güvenerek haraket ediliyor (tüm mahalBaşlıkları map'lerde) */}
                  {
                    pozlar?.map((onePoz, index) => {
                      return (
                        <TableHeader key={index} index={index} count_={count_} sx={{ display: "grid", with: "100%", justifyContent: onePoz.yatayHiza }}>

                          {onePoz.veriTuruId == "sayi" && isNumeric(g_altBaslik) &&
                            <Box>

                            </Box>
                          }
                        </TableHeader>
                      )
                    })
                  }



                  {/* 1 SIRA MAHAL BAŞLIKLARI BİTİNCE  ALTINDAKİ MAHAL SATIRLARI - ONU DA YUKARIDAKİNE UYDURAN BİR GRİD ÖLÇÜLERİ İLE BAĞIMSIZ OLARAK YÖNETİYORUZ*/}

                  {/* HAYALET */}
                  {<Box sx={{ display: "none" }}>
                    {count_ = mahaller?.filter(item => item._lbsId.toString() == oneLbs._id.toString()).length}
                  </Box>}

                  <Box>

                    {/* MAHALLER */}
                    {mahaller?.filter(item => item._lbsId.toString() == oneLbs._id.toString()).map((oneMahal, index) => {
                      return (
                        <Grid
                          key={index}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplateColumns_,
                          }}
                        >
                          {
                            isProject?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  // onDoubleClick={() => handle_selectMahal(oneBaslik, oneMahal)}
                                  sx={{
                                    // userSelect:"none",
                                    cursor: "pointer",
                                    display: "grid",
                                    alignItems: "center",
                                    justifyItems: oneBaslik.yatayHiza,
                                    // backgroundColor: selectedMahal?._id.toString() == oneMahal._id.toString() ? "green" : null
                                  }}
                                >
                                  {oneMahal[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>

                          {pozlar?.map((onePoz, index) => {
                            { nodeMahal = mahalListesi?.find((item) => item._mahalId.toString() == oneMahal._id.toString() && item._pozId.toString() == onePoz._id.toString()) }

                            return nodeMahal?.open ?

                              <TableItem
                                key={index}
                                index={index}
                                count_={count_}
                                onClick={editMode_MahalListesi ? () => toggleMahalPoz({ _mahalId: oneMahal._id, _pozId: onePoz._id, open: false }) : null}
                                sx={{
                                  cursor: editMode_MahalListesi ? "pointer" : null,
                                  display: "grid",
                                  alignItems: "center",
                                  justifyItems: onePoz.yatayHiza,
                                  // backgroundColor: "rgba(150, 236, 242 ,0.4 )",
                                  backgroundColor: "rgba( 234, 193, 0 , 0.4 )",

                                }}
                              >
                                {/* {"0"} */}
                              </TableItem>

                              :

                              <TableItem
                                key={index}
                                index={index}
                                count_={count_}
                                onClick={editMode_MahalListesi ? () => toggleMahalPoz({ _mahalId: oneMahal._id, _pozId: onePoz._id, open: true }) : null}
                                sx={{
                                  cursor: editMode_MahalListesi ? "pointer" : null,
                                  display: "grid",
                                  alignItems: "center",
                                  justifyItems: onePoz.yatayHiza,
                                }}
                              >
                                {/* {"0"} */}
                              </TableItem>

                          })}

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


