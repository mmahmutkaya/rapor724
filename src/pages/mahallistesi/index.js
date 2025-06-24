
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import FormMahalBaslikCreate from '../../components/FormMahalBaslikCreate'
import MahalListesiHeader from '../../components/MahalListesiHeader'
import { useGetMahaller, useGetMahalListesi, useToggleOpenMetrajDugum, useGetPozlar } from '../../hooks/useMongo';


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


  const { selectedProje, setMahalListesi_wbsIds, setMahalListesi_lbsIds } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedMahalBaslik, setSelectedMahalBaslik } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)


  const [show, setShow] = useState("Main")
  const [editMode_MahalListesi, setEditMode_MahalListesi] = useState(false)
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ baslikId: null, mahalId: null })


  const navigate = useNavigate()
  // !selectedProje ? navigate('/projects') : null
  if (!selectedProje) window.location.href = "/projects"

  const RealmApp = useApp();

  const { data: pozlar } = useGetPozlar()

  const { data: mahaller } = useGetMahaller()

  const { data: mahalListesi } = useGetMahalListesi()

  const { mutate: toggleMahalPoz } = useToggleOpenMetrajDugum()


  const handleSelectMahal = (mahal) => {
    setSelectedMahal(mahal)
    setSelectedMahalBaslik(false)
  }


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
    const result = await RealmApp?.currentUser.callFunction("updateMahalBilgiler", { _projectId: selectedProje?._id, mahalBilgiler_willBeSaved });
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

      {show == "Main" && mahalListesi && selectedProje?.lbs?.filter(item => item.openForMahal).length > 0 &&

        <Box sx={{ mt: subHeaderHeight, pt: "1rem", pl: "1rem", pr: "1rem" }}>

          {/* {console.log("mahalListesi", mahalListesi)} */}

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
                    height: "3rem",
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
                            <Box>

                            </Box>
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
                                  {oneMahal[oneBaslik.referans]}
                                </TableItem>
                              )
                            })
                          }

                          <Bosluk>
                          </Bosluk>
                          {pozlar?.map((onePoz, index) => {

                            let theDugum = mahalListesi.list?.find((item) => item._mahalId.toString() == oneMahal._id.toString() && item._pozId.toString() == onePoz._id.toString())

                            return theDugum?.openMetraj ?

                              <TableItem
                                key={index}
                                index={index}
                                count_={count_}
                                onClick={editMode_MahalListesi ? () => toggleMahalPoz({
                                  _mahalId: oneMahal._id,
                                  _pozId: onePoz._id,
                                  switchValue: false
                                }) : null}
                                sx={{
                                  cursor: editMode_MahalListesi ? "pointer" : null,
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
                                onClick={editMode_MahalListesi ? () => toggleMahalPoz({
                                  _mahalId: oneMahal._id,
                                  _pozId: onePoz._id,
                                  switchValue: true
                                }) : null}
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


