
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetMahaller, useGetDugumler, useUpdateHazirlananMetrajShort, useGetPozlar } from '../../hooks/useMongo';

import FormMahalCreate from '../../components/FormMahalCreate'
import FormMahalBaslikCreate from '../../components/FormMahalBaslikCreate'
import HeaderMahalListesi from '../../components/HeaderMahalListesi'
import { DialogAlert } from '../../components/general/DialogAlert.js';



import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import { BSON } from 'realm-web';



export default function P_MahalListesi() {

  const queryClient = useQueryClient()

  const { RealmApp, selectedProje } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const [dialogAlert, setDialogAlert] = useState()


  const [show, setShow] = useState("Main")
  const [isChanged, setIsChanged] = useState(0)
  const [dugumler_state, setDugumler_state] = useState()
  const [editMode_Dugumler, setEditMode_Dugumler] = useState(false)


  const navigate = useNavigate()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])


  const { data: pozlar } = useGetPozlar()

  const { data: mahaller } = useGetMahaller()

  const { data: dugumler } = useGetDugumler()
  // console.log("dugumler", dugumler)


  // const { mutate: updateMahalMetraj } = useUpdateHazirlananMetrajShort()



  useEffect(() => {
    setDugumler_state(dugumler)
  }, [dugumler])



  // aşağıda kullanılıyor
  let lbsCode = ""
  let lbsName = ""
  let theDugum
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


  let totalWidthDegisken = pozlar?.length * 10
  totalWidthDegisken = totalWidthDegisken + 'rem'


  let totalWidth = (parseFloat(totalWidthSabit) + 2 + parseFloat(totalWidthDegisken)) + 'rem'


  let gridTemplateColumnsSabit = selectedProje?.mahalBasliklari?.filter(item => item.sabit).reduce(
    (ilkString, oneBilgi, index) => index != selectedProje?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
    ""
  )


  let gridTemplateColumnsDegisken = pozlar?.reduce(
    (ilkString, onePoz, index) => index != pozlar?.length ? ilkString + (10 + "rem ") : ilkString + (10 + "rem"),
    ""
  )

  let gridTemplateColumnsDegisken2 = selectedProje?.mahalBasliklari?.filter(item => !item.sabit && item.goster).reduce(
    (ilkString, oneBilgi, index) => index != selectedProje?.mahalBasliklari?.length ? ilkString + (oneBilgi.genislik + "rem ") : ilkString + (oneBilgi.genislik + "rem"),
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
  }))

  const Bosluk = styled('div')(() => ({
    // backgroundColor: "lightblue"
    // borderLeft: index == 0 ? "solid black 1px" : null,
    // borderRight: "solid black 1px",
    // borderBottom: "solid black 1px"
  }));


  // const handle_selectBaslik = (oneBaslik) => {
  //   setSelectedMahalBaslik(oneBaslik)
  //   setSelectedMahal()
  // }


  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  const handle_input_onChange = ({ event, theDugum }) => {

    // console.log("event.target.value", event.target.value)
    // console.log("theDugumId", theDugum._id.toString())

    // setDugumler_state(dugumler => {
    //   console.log("dugumler", dugumler)
    //   dugumler = dugumler.map(x => {
    //     if (x._id.toString() === theDugum._id.toString()) {
    //       x.metraj = event.target.value
    //     }
    //     return x
    //   })
    //   // console.log("dugumler", dugumler)
    //   return dugumler
    // })

    setIsChanged(true)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor -- (sonra bunada gerek kalmadı)
    // setMetraj(oneRow["metin1"] + oneRow["metin2"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }


  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  const handleCancel = () => {
    setDugumler_state(dugumler)
    setEditMode_Dugumler()
    setIsChanged()
  }


  const saveMahal = async () => {

    if (isChanged) {
      try {

        let dugumler_state_filtered = dugumler_state.filter(x => x.isChanged)
        console.log("dugumler_state_filtered", dugumler_state_filtered)

        const result = await RealmApp?.currentUser.callFunction("updateDugumler_openMetraj", ({ _projeId: selectedProje._id, dugumler_state_filtered }))
        console.log("result", result)
        if (result.dugumler) {
          queryClient.setQueryData(['dugumler', selectedProje?._id.toString()], result.dugumler)
        }
        setEditMode_Dugumler()
        setIsChanged()
        return

      } catch (error) {

        console.log(error)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
          detailText: error?.message ? error.message : null
        })

      }
    }


    setEditMode_Dugumler()
    setIsChanged()
    setDugumler_state([])

  }




  const updateDugumler_state = ({ _mahalId, _pozId, switchValue }) => {

    let dugumler_state2 = dugumler_state
    let isFound

    dugumler_state2 = dugumler_state2.map(x => {
      if (x._mahalId.toString() === _mahalId.toString() && x._pozId.toString() === _pozId.toString()) {
        x.openMetraj = switchValue
        x.isChanged = true
        isFound = true
      }
      return x
    })

    if (isFound) {
      setDugumler_state(dugumler_state2)
    } else {
      setDugumler_state([...dugumler_state, { _mahalId, _pozId, openMetraj: switchValue, isChanged: true }])
    }

    setIsChanged(true)

    return

  }



  const metrajValue = (metrajValue) => {

    // if (oneData == "pozBirim") return pozBirim
    // if (oneData.includes("carpan")) return show !== "EditMetraj" ? ikiHane(oneRow[oneData]) : oneRow[oneData]
    // if (oneData == "metraj") return ikiHane(oneRow[oneData])

    // yukarıdaki hiçbiri değilse
    metrajValue = metrajValue * 1
    return metrajValue

  }


  return (

    <>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Grid item >
        <HeaderMahalListesi handleCancel={handleCancel} editMode_Dugumler={editMode_Dugumler} setEditMode_Dugumler={setEditMode_Dugumler} saveMahal={saveMahal} isChanged={isChanged} />
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

      {show == "Main" && (selectedProje?.lbs?.filter(item => item.openForMahal).length == 0 || !selectedProje?.lbs) &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir mahal başlığını mahal eklemeye açmamış görünüyorsunumuz. "Mahal Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && dugumler_state && selectedProje?.lbs?.filter(item => item.openForMahal).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* EN ÜST BAŞLIK ÜST SATIRI */}
          <Grid
            sx={{
              // pb: "1rem",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns_,
            }}
          >
            {/* SOL KISIM SABİT EN ÜST MAHAL BAŞLIKLARI */}
            {/* HAYALET */}
            <Box sx={{ display: "none" }}>
              {count_ = selectedProje?.mahalBasliklari?.filter(item => item.sabit).length}
            </Box>

            {selectedProje?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "rgba( 56,56,56 , 0.9 )",
                    color: "white",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    height: "3rem",
                    width: "100%",
                    display: "grid",
                    alignItems: "center",
                    justifyContent: oneBaslik.yatayHiza,
                  }}
                  // onClick={() => handle_selectBaslik(oneBaslik)}
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
                    backgroundColor: editMode_Dugumler ? "rgb( 110, 16, 16 , 1)" : "rgba( 56,56,56 , 0.9 )", color: "white",
                    fontWeight: "bold",
                    border: "solid black 1px",
                    borderRight: index + 1 == count_ ? "solid black 1px" : "0px",
                    height: "3rem",
                    width: "100%",
                    display: "grid",
                    justifyContent: "center"
                  }}
                  // onClick={() => handle_selectBaslik(onePoz)}
                  key={index}
                >
                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {onePoz.pozNo}
                  </Box>

                  <Box sx={{ display: "grid", justifyContent: "center" }}>
                    {onePoz.pozName}
                  </Box>

                </Box>
              )
            })}

          </Grid>


          {/* SOL KISIMDAKİ SABİT KISIMDAKİ MAHAL BAŞLIKLARI ve SAĞ DEĞİŞKEN KISIMDA DEVAM EDEN BOŞ BAŞLIK HÜCRELERİ */}
          {/* SOL KISIMDAKİ SABİT KISIMDAKİ MAHAL BAŞLIĞI ALTINDAKİ MAHALLER ve SAĞ DEĞİŞKEN KISIMDA DEVAM EDEN BOŞ BAŞLIK HÜCRELERİ ALTINDA POZ HÜCRELERİ*/}
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


                  {/* SAĞ TARAF - DEĞİŞKEN MAHAL BAŞLIĞI - BOŞ */}
                  {/* burada başlık sıralamasına göre güvenerek haraket ediliyor (tüm mahalBaşlıkları map'lerde) */}
                  {
                    pozlar?.map((onePoz, index) => {
                      return (
                        <TableHeader key={index} index={index} count_={count_} sx={{ display: "grid", with: "100%", justifyContent: onePoz.yatayHiza }}>
                          {onePoz.veriTuruId == "sayi" && isNumeric(g_altBaslik) &&
                            <Box>{g_altBaslik}</Box>
                          }
                        </TableHeader>
                      )
                    })
                  }



                  {/* YUKARIDA YAZILAN MAHAL BAŞLIĞI ALTINDAKİ MAHAL SATIRLARI - ONU DA YUKARIDAKİNE UYDURAN BİR GRİD ÖLÇÜLERİ İLE BAĞIMSIZ OLARAK YÖNETİYORUZ*/}

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
                            selectedProje?.mahalBasliklari?.filter(item => item.sabit).map((oneBaslik, index) => {
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
                                  {/* {oneMahal[oneBaslik.referans]} */}
                                  {oneMahal[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>

                          {/* HAYALET */}
                          {<Box sx={{ display: "none" }}>
                            {count_ = pozlar?.length}
                          </Box>}

                          {pozlar?.map((onePoz, index) => {

                            let theDugum = dugumler_state?.find((item) => item._pozId.toString() == onePoz._id.toString() && item._mahalId.toString() == oneMahal._id.toString() && item.openMetraj)


                            return theDugum?.openMetraj ?

                              <TableItem
                                key={index}
                                index={index}
                                count_={count_}
                                onClick={editMode_Dugumler ? () => updateDugumler_state({
                                  _mahalId: oneMahal._id,
                                  _pozId: onePoz._id,
                                  switchValue: false
                                }) : null}
                                sx={{
                                  cursor: editMode_Dugumler ? "pointer" : null,
                                  display: "grid",
                                  alignItems: "center",
                                  justifyItems: onePoz.yatayHiza,
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
                                onClick={editMode_Dugumler ? () => updateDugumler_state({
                                  _mahalId: oneMahal._id,
                                  _pozId: onePoz._id,
                                  switchValue: true
                                }) : null}
                                sx={{
                                  cursor: editMode_Dugumler ? "pointer" : null,
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


