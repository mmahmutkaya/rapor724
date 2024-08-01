
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormPozCreate from '../../components/FormPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import PozHeader from '../../components/PozHeader'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_Pozlar() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { selectedPozBaslik, setSelectedPozBaslik } = useContext(StoreContext)
  const { pozlar, setPozlar } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editPoz, setEditPoz] = useState(false)
  const [pozBilgiler_willBeSaved, setPozBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, pozId: null })

  const navigate = useNavigate()
  const RealmApp = useApp()


  useEffect(() => {
    if (!isProject) {
      return (
        navigate('/projects')
      )
    }
  })



  const pozlar_fecth = async () => {
    if (!pozlar) {
      const result = await RealmApp?.currentUser.callFunction("getProjectPozlar", ({ projectId: isProject?._id }));
      setPozlar(result)
    }
  }
  pozlar_fecth()


  const handleSelectPoz = (poz) => {
    setSelectedPoz(poz)
    setSelectedPozBaslik(false)
  }


  // aşağıda kullanılıyor
  let wbsCode = ""
  let wbsName = ""
  let cOunt = 0
  let count_
  let toplam
  let g_altBaslik
  let isSecili


  const _3_fixed_width_rem = "6rem 35rem 5rem"
  _3_fixed_width_rem.split(" ").map(item => {
    let gecici = Number(item.replace("rem", ""))
    toplam ? toplam = toplam + gecici : toplam = gecici
  })
  const total_fixed_width = toplam

  const one_bosluk_width = 2

  const one_poz_width = 10


  // let basliklar = [
  //   { id: 1, isim: "No" },
  //   { id: 2, isim: "İsim" },
  //   { id: 3, isim: "bosluk" },
  //   { id: 3, isim: "Tarif" },
  //   { id: 4, isim: "Ölçü" },
  // ]

  /* padding - top | right | bottom | left */
  // const [basliklar, setBasliklar] = useState([
  //   { id: 1, sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, padding_M: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz No", dataType: "number" },
  //   { id: 2, sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, padding_M: "0px 1rem 0px 0px", yatayHiza: "end", name: "Poz İsmi", dataType: "string" },
  //   { id: 3, sira: 3, referans: "name", goster: true, sabit: false, genislik: 15, padding_M: "0px 0rem 0px 0px", yatayHiza: "center", name: "Zemin Alan", dataType: "date" },
  //   { id: 4, sira: 4, referans: "name", goster: true, sabit: false, genislik: 20, padding_M: "0px 0rem 0px 0px", yatayHiza: "center", name: "Fonksiyon", dataType: "date" },
  // ].sort((a, b) => a.sira - b.sira))

  // const [basliklar, setBasliklar] = useState(isProject?.pozBasliklari.filter(item => item.goster))


  let totalWidthSabit = isProject?.pozBasliklari.filter(item => item.sabit).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidthSabit = totalWidthSabit + 'rem'
  // console.log("totalWidthSabit", totalWidthSabit)


  let totalWidthDegisken = isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidthDegisken = totalWidthDegisken + 'rem'
  // console.log("totalWidthDegisken", totalWidthDegisken)


  let totalWidth = isProject?.pozBasliklari.reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidth = (totalWidth + 2) + 'rem'
  // console.log("totalWidth", totalWidth)


  let gridTemplateColumnsSabit = isProject?.pozBasliklari.filter(item => item.sabit).reduce(
    (ilkString, oneBilgi, index) => index != isProject?.pozBasliklari.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )
  // console.log("gridTemplateColumnsSabit", gridTemplateColumnsSabit)


  let gridTemplateColumnsDegisken = isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).reduce(
    (ilkString, oneBilgi, index) => index != isProject?.pozBasliklari.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )
  // console.log("gridTemplateColumnsDegisken", gridTemplateColumnsDegisken)


  let gridTemplateColumns_ = gridTemplateColumnsSabit + " 2rem " + gridTemplateColumnsDegisken
  // console.log("gridTemplateColumns_", gridTemplateColumns_)


  const TableHeader = styled('div')(({ index }) => ({
    marginTop: "1rem",
    // fontWeight: "bold",
    backgroundColor: "#FAEBD7",
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



  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


  const handle_selectBaslik = (oneBaslik) => {
    // setSelectedPozBaslik(oneBaslik)
    // setSelectedPoz()
    console.log(oneBaslik)
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



  const handle_input_onChange = (event, oneBaslik, onePoz) => {

    setAutoFocus({ baslikId: oneBaslik.id, pozId: onePoz._id.toString() })

    // db ye kayıt yapılmışsa bu işlemi yapsın yoksa refresh yapsın
    const newBilgi = { pozId: onePoz._id, baslikId: oneBaslik.id, veri: event.target.value }

    if (oneBaslik.veriTuruId === "sayi" && !isNumeric(newBilgi.veri) && newBilgi.veri != "-" && newBilgi.veri.length != 0 && newBilgi.veri != ".") {
      return
    }


    setPozlar(pozlar => {
      // if (!pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler) {
      //   pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler = [newBilgi]
      //   return pozlar
      // }
      if (!pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id)) {
        pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.push(newBilgi)
        return pozlar
      }
      pozlar.find(item => item._id.toString() == onePoz._id.toString()).ilaveBilgiler.find(item => item.baslikId == oneBaslik.id).veri = newBilgi.veri
      return pozlar
    })


    setPozBilgiler_willBeSaved(pozBilgiler_willBeSaved => {
      let pozBilgiler_willBeSaved_ = [...pozBilgiler_willBeSaved]
      // console.log("mevcutBilgi",pozBilgiler_willBeSaved.find(item => item.pozId.toString() == onePoz._id.toString() && item.baslikId == oneBaslik.id))
      if (pozBilgiler_willBeSaved_.find(item => item.pozId == onePoz._id.toString() && item.baslikId == oneBaslik.id)) {
        pozBilgiler_willBeSaved_.find(item => item.pozId == onePoz._id.toString() && item.baslikId == oneBaslik.id).veri = newBilgi.veri
      } else {
        pozBilgiler_willBeSaved_ = [...pozBilgiler_willBeSaved_, { ...newBilgi }]
      }
      return pozBilgiler_willBeSaved_
    })


  }

  const savePoz = async () => {
    console.log("pozBilgiler_willBeSaved", pozBilgiler_willBeSaved)

    // setPozBilgiler_willBeSaved([])
    const result = await RealmApp?.currentUser.callFunction("updatePozBilgiler", { _projectId: isProject?._id, pozBilgiler_willBeSaved });
    console.log("result", result)

    setEditPoz(false)
    setPozBilgiler_willBeSaved([])
    setSelectedPozBaslik(false)
  }



  return (

    <>

      <Grid item >
        <PozHeader setShow={setShow} editPoz={editPoz} setEditPoz={setEditPoz} savePoz={savePoz} />
      </Grid>

      {show == "FormPozCreate" &&
        <Grid item >
          <FormPozCreate isProject={isProject} setShow={setShow} />
        </Grid>
      }

      {show == "FormPozBaslikCreate" &&
        <Grid item >
          <FormPozBaslikCreate setShow={setShow} />
        </Grid>
      }

      {show == "EditPozBaslik" &&
        <Grid item >
          <EditPozBaslik setShow={setShow} />
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
              pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            {/* HAYALET */}
            <Box sx={{ display: "none" }}>
              {count_ = isProject?.pozBasliklari.filter(item => item.sabit).length}
            </Box>
            {isProject?.pozBasliklari.filter(item => item.sabit).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selectedPozBaslik?.id == oneBaslik.id ? "rgba(120, 120, 120, 0.7)" : "rgb(120, 120, 120, 0.4)",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
                    height: "100%",
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


            {/* HAYALET KOMPONENT */}
            <Box sx={{ display: "none" }}>
              {count_ = isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).length}
            </Box>
            {/* GÖZÜKEN KOMPONENT */}
            {isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selectedPozBaslik?.id == oneBaslik.id ? "rgba(120, 120, 120, 0.7)" : "rgb(120, 120, 120, 0.4)",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    alignItems: "center",
                    justifyContent: oneBaslik.yatayHiza
                  }}
                  onClick={() => handle_selectBaslik(oneBaslik)}
                  key={index}
                >
                  <Box sx={{ display: "grid", justifyContent: oneBaslik.yatayHiza }}>
                    {oneBaslik.name}
                  </Box>

                  {oneBaslik.veriTuruId == "sayi" &&
                    <Box sx={{ display: "grid", justifyContent: oneBaslik.yatayHiza }}>

                      {/* HAYALET KOMPONENT */}
                      <Box sx={{ display: "none" }}>
                        {g_altBaslik = pozlar?.reduce((mergeArray, { ilaveBilgiler }) => [...mergeArray, ...ilaveBilgiler], []).filter(item => item.baslikId == oneBaslik.id).reduce((toplam, oneBilgi) => toplam + parseFloat(oneBilgi.veri), 0)}
                      </Box>
                      {/* GÖZÜKEN KOMPONENT */}
                      {isNumeric(g_altBaslik) &&
                        <Box>
                          {g_altBaslik}
                        </Box>
                      }
                    </Box>
                  }

                </Box>
              )
            })}

          </Grid>


          {/* POZ BAŞLIKLARI ve POZLAR */}
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
                    gridTemplateColumns: totalWidthSabit + " 2rem " + gridTemplateColumnsDegisken,
                  }}
                >
                  <TableHeader>

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

                    {/* sol tarafta - sabit kısımda - wbs başlığının yazdığı yer */}
                    {wbsName.split(">").map((item, index) => (

                      <Typography key={index} component={"span"} >
                        {item}
                        {index + 1 !== cOunt &&
                          <Typography component={"span"} sx={{ fontWeight: "600", color: "darkred" }}>{">"}</Typography>
                        }
                      </Typography>

                    ))}

                  </TableHeader>

                  <Bosluk ></Bosluk>

                  {/* burada başlık sıralamasına göre güvenerek haraket ediliyor (tüm pozBaşlıkları map'lerde) */}
                  {
                    isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).map((oneBaslik, index) => {
                      return (
                        <TableHeader key={index} index={index} count_={count_} sx={{ display: "grid", with: "100%", justifyContent: oneBaslik.yatayHiza }}>

                          {/* HAYALET KOMPONENT */}
                          <Box sx={{ display: "none" }}>
                            {g_altBaslik = pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).reduce((mergeArray, { ilaveBilgiler }) => [...mergeArray, ...ilaveBilgiler], []).filter(item => item.baslikId == oneBaslik.id).reduce((toplam, oneBilgi) => toplam + Number(oneBilgi.veri), 0)}
                          </Box>
                          {/* GÖZÜKEN */}
                          {oneBaslik.veriTuruId == "sayi" && isNumeric(g_altBaslik) && g_altBaslik > 0 &&
                            <Box>
                              {g_altBaslik}
                            </Box>
                          }
                        </TableHeader>
                      )
                    })
                  }


                  {/* HAYALET */}
                  {<Box sx={{ display: "none" }}>
                    {count_ = pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).length}
                  </Box>}

                  <Grid
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: totalWidth,
                    }}
                  >

                    {/* POZLAR */}
                    {pozlar?.filter(item => item._wbsId.toString() == oneWbs._id.toString()).map((onePoz, index) => {
                      return (
                        <Grid
                          key={index}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplateColumns_,
                          }}
                          onClick={() => setSelectedPoz(onePoz)}
                        >
                          {/* HAYALET */}
                          {<Box sx={{ display: "none" }}>
                            {isSecili = selectedPoz?._id.toString() == onePoz._id.toString()}
                          </Box>}

                          {
                            isProject?.pozBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  // onDoubleClick={() => handle_selectPoz(oneBaslik, onePoz)}
                                  sx={{
                                    // userSelect:"none",
                                    cursor: "pointer",
                                    display: "grid",
                                    alignItems: "center",
                                    justifyItems: oneBaslik.yatayHiza,
                                    position: "relative"
                                    // backgroundColor: selectedPoz?._id.toString() == onePoz._id.toString() ? "green" : null
                                  }}
                                >

                                  {onePoz[oneBaslik.referans]}

                                  {isSecili && oneBaslik.referans == "name" &&
                                    <Grid sx={{ position: "absolute", display: "grid", alignItems: "center", justifyContent: "end", width: "100%", height: "100%", pr: "0.3rem" }}>
                                      <Box sx={{ backgroundColor: "rgba(255, 0, 0, 0.5)", borderRadius: "0.5rem", height: "0.5rem", width: "0.5rem" }}> </Box>
                                    </Grid>
                                  }

                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>

                          {
                            isProject?.pozBasliklari.filter(item => !item.sabit && item.show?.find((item2) => item2 == "webPage_pozlar")).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  // onDoubleClick={() => setEditPoz(oneBaslik.id)}
                                  sx={{
                                    cursor: "text",
                                    display: "grid",
                                    alignItems: "center",
                                    justifyItems: oneBaslik.yatayHiza,
                                    backgroundColor: editPoz == oneBaslik.id ? "rgba(255, 255, 0, 0.5)" : null,
                                  }}
                                >
                                  {editPoz !== oneBaslik.id &&
                                    <Box>
                                      {onePoz.ilaveBilgiler?.find(item => item.baslikId == oneBaslik.id)?.veri}
                                    </Box>
                                  }

                                  {editPoz == oneBaslik.id &&
                                    <Input
                                      // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.pozId == onePoz._id.toString()}
                                      autoFocus={autoFocus.pozId == onePoz._id.toString()}
                                      // autoFocus={true}
                                      disableUnderline={true}
                                      size="small"
                                      type='text'
                                      // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                                      onKeyDown={(event) => handle_input_onKey(event, oneBaslik)}
                                      onChange={(event) => handle_input_onChange(event, oneBaslik, onePoz)}
                                      sx={{
                                        border: "none",
                                        width: "100%",
                                        display: "grid",
                                        alignItems: "center",
                                        justifyItems: oneBaslik.yatayHiza,
                                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                          display: "none",
                                        },
                                        "& input[type=number]": {
                                          MozAppearance: "textfield",
                                        },
                                      }}
                                      defaultValue={onePoz.ilaveBilgiler?.find(item => item.baslikId == oneBaslik.id)?.veri}
                                      inputProps={{
                                        style: {
                                          height: "1rem",
                                          fontSize: "0.95rem",
                                          marginTop: "0.1rem",
                                          paddingBottom: "0px",
                                          marginbottom: "0px",
                                          textAlign: oneBaslik.yatayHiza == "start" ? "left" : oneBaslik.yatayHiza == "end" ? "right" : "center"
                                          // // textAlign: oneBaslik.yatayHiza == "center" ? "center" : null
                                        },
                                      }}
                                    />
                                  }
                                </TableItem>
                              )
                            })
                          }
                        </Grid>
                      )
                    })}
                  </Grid>

                </Grid>
              )
            })
          }

        </Box>

      }

    </ >

  )

}
