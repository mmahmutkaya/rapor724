
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import EditMahalBaslik from '../../components/EditMahalBaslik'
import FormMahalBaslikCreate from '../../components/FormMahalBaslikCreate'
import MahalHeader from '../../components/MahalHeader'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_Mahaller() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  const [show, setShow] = useState("Main")
  const [editMahal, setEditMahal] = useState(false)
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, mahalId: null })

  const navigate = useNavigate()
  // !selectedProje ? navigate('/projects') : null
  if (!selectedProje) window.location.href = "/projects"

  const RealmApp = useApp();


  const mahaller_fecth = async () => {
    if (!mahaller) {
      const result = await RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: selectedProje?._id }));
      setMahaller(result)
    }
  }
  mahaller_fecth()



  // aşağıda kullanılıyor
  let lbsCode = ""
  let lbsName = ""
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


  let totalWidthSabit = selectedProje?.mahalBasliklari?.filter(item => item.sabit).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidthSabit = totalWidthSabit + 'rem'
  // console.log("totalWidthSabit", totalWidthSabit)


  let totalWidthDegisken = selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidthDegisken = totalWidthDegisken + 'rem'
  // console.log("selectedProje?.mahalBasliklari", selectedProje?.mahalBasliklari)
  // console.log("totalWidthDegisken", totalWidthDegisken)


  let totalWidth = selectedProje?.mahalBasliklari?.reduce(
    (accumulator, oneBilgi) => accumulator + oneBilgi.genislik,
    0
  )
  totalWidth = (totalWidth + 2) + 'rem'
  // console.log("totalWidth", totalWidth)


  let gridTemplateColumnsSabit = selectedProje?.mahalBasliklari?.filter(item => item.sabit).reduce(
    (ilkString, oneBilgi, index) => index != selectedProje?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )
  // console.log("gridTemplateColumnsSabit", gridTemplateColumnsSabit)


  let gridTemplateColumnsDegisken = selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).reduce(
    (ilkString, oneBilgi, index) => index != selectedProje?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
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
    setSelectedMahalBaslik(oneBaslik)
    setSelectedMahal()
    console.log("oneBaslik", oneBaslik)
  }

  const handle_selectMahal = ({oneBaslik, oneMahal}) => {
    setSelectedMahal(oneMahal)
    setSelectedMahalBaslik()
    console.log("oneMahal", oneMahal)
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
      // console.log("mevcutBilgi",mahalBilgiler_willBeSaved.find(item => item.mahalId.toString() == oneMahal._id.toString() && item.baslikId == oneBaslik.id))
      if (mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id)) {
        mahalBilgiler_willBeSaved_.find(item => item.mahalId == oneMahal._id.toString() && item.baslikId == oneBaslik.id).veri = newBilgi.veri
      } else {
        mahalBilgiler_willBeSaved_ = [...mahalBilgiler_willBeSaved_, { ...newBilgi }]
      }
      return mahalBilgiler_willBeSaved_
    })


  }

  const saveMahal = async () => {
    console.log("mahalBilgiler_willBeSaved", mahalBilgiler_willBeSaved)

    // setMahalBilgiler_willBeSaved([])
    const result = await RealmApp?.currentUser.callFunction("updateMahalBilgiler", { _projectId: selectedProje?._id, mahalBilgiler_willBeSaved });
    console.log("result", result)

    setEditMahal(false)
    setMahalBilgiler_willBeSaved([])
    setSelectedMahalBaslik(false)
  }




  return (

    <>

      <Grid item >
        <MahalHeader setShow={setShow} editMahal={editMahal} setEditMahal={setEditMahal} saveMahal={saveMahal} />
      </Grid>

      {show == "FormMahalCreate" &&
        <Grid item >
          <FormMahalCreate selectedProje={selectedProje} setShow={setShow} />
        </Grid>
      }

      {show == "FormMahalBaslikCreate" &&
        <Grid item >
          <FormMahalBaslikCreate setShow={setShow} />
        </Grid>
      }

      {show == "EditMahalBaslik" &&
        <Grid item >
          <EditMahalBaslik setShow={setShow} />
        </Grid>
      }


      {show == "Main" && (selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir mahal başlığını mahal eklemeye açmamış görünüyorsunumuz. "Mahal Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }


      {show == "Main" && selectedProje?.lbs?.filter(item => item.openForMahal).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* EN ÜST BAŞLIK ÜST SATIRI */}
          <Grid
            sx={{
              // pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            {/* HAYALET */}
            <Box sx={{ display: "none" }}>
              {count_ = selectedProje?.mahalBasliklari?.filter(item => item.sabit).length}
            </Box>
            {selectedProje?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selectedMahalBaslik?.id == oneBaslik.id ? "rgba(120, 120, 120, 0.7)" : "rgb(120, 120, 120, 0.4)",
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


            {/* HAYALET KOMPONENT */}
            <Box sx={{ display: "none" }}>
              {count_ = selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).length}
            </Box>
            {/* GÖZÜKEN KOMPONENT */}
            {selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: selectedMahalBaslik?.id == oneBaslik.id ? "rgba(120, 120, 120, 0.7)" : "rgb(120, 120, 120, 0.4)",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    width: "100%",
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
                  <Box sx={{ display: "grid", justifyContent: oneBaslik.yatayHiza }}>

                    {/* HAYALET KOMPONENT */}
                    <Box sx={{ display: "none" }}>
                      {g_altBaslik = mahaller?.reduce((mergeArray, { ilaveBilgiler }) => [...mergeArray, ...ilaveBilgiler], []).filter(item => item.baslikId == oneBaslik.id).reduce((toplam, oneBilgi) => toplam + parseFloat(oneBilgi.veri), 0)}
                    </Box>
                    {/* GÖZÜKEN KOMPONENT */}
                    {oneBaslik.veriTuruId == "sayi" && isNumeric(g_altBaslik) &&
                      <Box>
                        {g_altBaslik}
                      </Box>
                    }
                    {oneBaslik.veriTuruId == "sayi" && !isNumeric(g_altBaslik) &&
                      <Box sx={{ color: selectedMahalBaslik?.id == oneBaslik.id ? "rgba(120, 120, 120, 0.7)" : "rgb(120, 120, 120, 0.4)" }}>
                        .
                      </Box>
                    }
                  </Box>
                </Box>
              )
            })}

          </Grid>


          {/* MAHAL BAŞLIKLARI ve MAHALLER */}
          {selectedProje?.lbs
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
                  <TableHeader>

                    {/* HAYALET */}
                    <Box sx={{ display: "none" }}>
                      {cOunt = oneLbs.code.split(".").length}
                    </Box>

                    {
                      oneLbs.code.split(".").map((codePart, index) => {

                        if (index == 0 && cOunt == 1) {
                          lbsCode = codePart
                          lbsName = selectedProje?.lbs.find(item => item.code == lbsCode).name
                        }

                        if (index == 0 && cOunt !== 1) {
                          lbsCode = codePart
                          lbsName = selectedProje?.lbs.find(item => item.code == lbsCode).codeName
                        }

                        if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                          lbsCode = lbsCode + "." + codePart
                          lbsName = lbsName + " > " + selectedProje?.lbs.find(item => item.code == lbsCode).codeName
                        }

                        if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                          lbsCode = lbsCode + "." + codePart
                          lbsName = lbsName + " > " + selectedProje?.lbs.find(item => item.code == lbsCode).name
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

                  {/* burada başlık sıralamasına göre güvenerek haraket ediliyor (tüm mahalBaşlıkları map'lerde) */}
                  {
                    selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).map((oneBaslik, index) => {
                      return (
                        <TableHeader key={index} index={index} count_={count_} sx={{ display: "grid", with: "100%", justifyContent: oneBaslik.yatayHiza }}>

                          {/* HAYALET KOMPONENT */}
                          <Box sx={{ display: "none" }}>
                            {g_altBaslik = mahaller?.filter(item => item._lbsId.toString() == oneLbs._id.toString()).reduce((mergeArray, { ilaveBilgiler }) => [...mergeArray, ...ilaveBilgiler], []).filter(item => item.baslikId == oneBaslik.id).reduce((toplam, oneBilgi) => toplam + Number(oneBilgi.veri), 0)}
                          </Box>
                          {/* GÖZÜKEN */}
                          {oneBaslik.veriTuruId == "sayi" && isNumeric(g_altBaslik) &&
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
                    {count_ = mahaller?.filter(item => item._lbsId.toString() == oneLbs._id.toString()).length}
                  </Box>}

                  <Grid
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: totalWidth,
                    }}
                  >

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
                            selectedProje?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  onClick={() => handle_selectMahal({oneBaslik, oneMahal})}
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

                          {
                            selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.show?.find(item => item.indexOf("webPage_mahaller") > -1)).map((oneBaslik, index) => {
                              return (
                                <TableItem
                                  key={index}
                                  index={index}
                                  count_={count_}
                                  // onDoubleClick={() => setEditMahal(oneBaslik.id)}
                                  sx={{
                                    cursor: "text",
                                    display: "grid",
                                    alignItems: "center",
                                    justifyItems: oneBaslik.yatayHiza,
                                    backgroundColor: editMahal == oneBaslik.id ? "rgba(255, 255, 0, 0.5)" : null,
                                  }}
                                >
                                  {editMahal !== oneBaslik.id &&
                                    <Box>
                                      {oneMahal.ilaveBilgiler?.find(item => item.baslikId == oneBaslik.id)?.veri}
                                    </Box>
                                  }

                                  {editMahal == oneBaslik.id &&
                                    <Input
                                      // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                                      autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                                      // autoFocus={true}
                                      disableUnderline={true}
                                      size="small"
                                      type='text'
                                      // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                                      onKeyDown={(event) => handle_input_onKey(event, oneBaslik)}
                                      onChange={(event) => handle_input_onChange(event, oneBaslik, oneMahal)}
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
                                      defaultValue={oneMahal.ilaveBilgiler?.find(item => item.baslikId == oneBaslik.id)?.veri}
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
