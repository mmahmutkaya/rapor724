
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import MahalListesiHeader from '../../components/MahalListesiHeader'

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_Raporlar() {

  const { drawerWidth, topBarHeight } = useContext(StoreContext)

  const { isProject } = useContext(StoreContext)
  const { pozlar, setPozlar } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { mahalListesi, setMahalListesi } = useContext(StoreContext)

  const [show, setShow] = useState("Main")

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
    }
  }
  mahalListesi_fecth()



  const openMetraj = async ({ mahalId, pozId }) => {
    const openedMetraj = await RealmApp?.currentUser.callFunction("openMetraj", ({ projectId: isProject?._id, mahalId, pozId }));
    setMahalListesi(oldMahalListesi => [...oldMahalListesi, openedMetraj])
  }

  const closeMetraj = async ({ mahalId, pozId }) => {
    await RealmApp?.currentUser.callFunction("closeMetraj", ({ projectId: isProject?._id, mahalId, pozId }));
    // hata olmadı db den çıktı - o zaman çıkarıyoruz
    setMahalListesi(oldMahalListesi => oldMahalListesi.map(item => {
      if (item._mahalId.toString() === mahalId.toString() && item._pozId.toString() === pozId.toString()) {
        return { ...item, open: false }
      } else {
        return item
      }
    }))
    // setMahalListesi(oldMahalListesi => oldMahalListesi.map(item => {
    //   if (item._mahalId.toString() === mahalId.toString() && item._pozId.toString() === pozId.toString()) {
    //     return { ...item, open: false }
    //   } else {
    //     return item
    //   }
    // }))
  }

  // console.log("mahalListesi", mahalListesi)


  // aşağıda kullanılıyor
  let lbsCode = ""
  let lbsName = ""
  let cOunt = 0
  let toplam = 0


  let pozCount

  const _3_mahal_width_rem = "2rem 15rem 5rem"
  toplam = 0
  _3_mahal_width_rem.split(" ").map(item => {
    let gecici = Number(item.replace("rem", ""))
    toplam = toplam + gecici
  })
  const total_mahal_width = toplam

  const one_bosluk_width = 2

  const one_poz_width = 5


  return (
    <Grid container direction="column" spacing={0}>

      <Grid item >
        <MahalListesiHeader setShow={setShow} />
      </Grid>

      {show == "Main" && (isProject?.lbs?.filter(item => item.openForMahal).length == 0) && (
        <Stack sx={{ mt: topBarHeight, width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir mahal başlığını mahal eklemeye açmamış görünüyorsunumuz. "Mahal Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>)
      }

      {show == "Main" && (isProject?.lbs?.filter(item => item.openForMahal).length == 0 || !pozlar) && (
        <Stack sx={{ mt: topBarHeight, width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Henüz hiç bir mahal başlığını mahal eklemeye açmamış görünüyorsunumuz. "Mahal Başlıkları" menüsünden işlem yapabilirsiniz.
          </Alert>
        </Stack>)
      }

      {show == "Main" && isProject?.lbs?.filter(item => item.openForMahal).length > 0 && pozlar?.length > 0 && mahaller?.length > 0 &&
        <Stack sx={{ mt: topBarHeight, width: '100%', pl: "1rem" }} spacing={0}>


          {/* gridTemplateRows - baştaki ve sondaki "1rem"  padding yerine üstte ve altta dolu alan, yoksa sticky transparan problemi  */}
          <Grid sx={{
            display: "grid", gridTemplateRows: "1rem 3rem 1rem",
            position: "sticky", top: "7rem",
            zIndex: "10",
            backgroundColor: "white",
          }}>

            {/* padding yerine üstteki 1rem lik dolu alan, yoksa sticky transparan problemi */}
            <Box sx={{ backgroundColor: "white" }}>

            </Box>

            <Grid item sx={{}}>
              {/* Grid - En üst başlık */}
              <Grid sx={{
                display: "grid", gridAutoFlow: "column", gridTemplateColumns: (total_mahal_width + one_bosluk_width) + "rem " + (pozlar.length * one_poz_width) + "rem",

              }}>

                {/* 1/2 - (total_mahal_width + one_bosluk_width)*/}
                <Grid item sx={{ position: "sticky", left: { xs: 0, md: "240px" } }}>
                  {/* <Grid item sx={{}}> */}

                  {/* total_mahal_width */}
                  {/* en üst başlık */}
                  <Grid sx={{
                    // position: "fixed", display: "grid", gridAutoFlow: "column", gridTemplateRows: "3.2rem", gridTemplateColumns: _3_mahal_width_rem + " " + one_bosluk_width + "rem "
                    display: "grid", gridAutoFlow: "column", gridTemplateRows: "3.2rem", gridTemplateColumns: _3_mahal_width_rem + " " + one_bosluk_width + "rem "
                  }} >

                    {/* _3_mahal_width_rem -- 1 */}
                    <Grid item sx={{ border: "1px solid black", borderRight: "0", padding: "0.5rem 0rem", backgroundColor: "lightgray", width: "100%" }}>
                      <Grid sx={{ display: "grid", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <InfoIcon sx={{}} />
                      </Grid>
                    </Grid>

                    {/* _3_mahal_width_rem -- 2 */}
                    <Grid item sx={{ border: "1px solid black", borderRight: "0", padding: "0.5rem 0rem", backgroundColor: "lightgray", textAlign: "center", width: "100%" }}>
                      <Grid sx={{ display: "grid", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{}}>
                          Mahal Tanımı
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* _3_mahal_width_rem -- 3 */}
                    <Grid item sx={{ border: "1px solid black", padding: "0.5rem 0rem", backgroundColor: "lightgray", width: "100%" }}>
                      <Grid sx={{ display: "grid", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{}}>
                          Birim
                        </Typography>
                      </Grid>
                    </Grid>


                    {/* one_bosluk_width */}
                    <Grid item sx={{ border: "1px solid white", padding: "0.5rem 0rem", backgroundColor: "white", color: "white", width: "100%" }}>

                    </Grid>

                  </Grid>

                </Grid>



                {/* sadece cOunt tespiti için görünmez bir componenet */}
                <Box sx={{ display: "none" }}>
                  {pozCount = pozlar.length}
                </Box>


                {/* poz isimleri */}
                {/* 2/2 - (poz_width) */}
                <Grid item sx={{}}>
                  <Grid sx={{ display: "grid", gridTemplateRows: "3.2rem", gridTemplateColumns: "repeat(" + pozlar.length + ", " + one_poz_width + "rem)" }}>

                    {pozlar.map((onePoz, index) => {
                      return (
                        <Grid key={index} item sx={{ border: "1px solid black", borderRight: index + 1 == pozCount ? null : "0", padding: "0.5rem 0.5rem", backgroundColor: "lightgray", width: "100%", height: "100%" }}>
                          <Grid sx={{ display: "grid", width: "100%" }}>
                            <Typography sx={{ maxHeight: "2.2rem", overflow: "hidden", fontSize: "0.8rem" }} >
                              {onePoz.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      )
                    })}

                  </Grid>
                </Grid>

              </Grid>

            </Grid>


            {/* padding yerine alttaki 1rem dolu alan, yoksa sticky transparan problemi */}
            <Box sx={{ mt: "3px", backgroundColor: "white" }}>
              .
            </Box>

          </Grid>


          {/* lbs başlığı ve altındaki mahaller */}
          {
            isProject.lbs
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
              })
              .map(lbsOne => (

                // lbs başlığını ve altında varsa mahalleri bir component içine almak için
                <Grid key={lbsOne._id.toString()} sx={{ display: "grid", pb: "1rem", width: "100%" }}>

                  <Grid item key={lbsOne._id.toString()}>

                    {/* Grid - lbs başlığı ve boş mahal başlığı uzantısı  */}
                    <Grid

                      sx={{
                        display: "grid", gridAutoFlow: "column", gridTemplateColumns: (total_mahal_width + one_bosluk_width) + "rem " + (pozlar.length * one_poz_width) + "rem",
                        width: "100%"
                      }}

                    >

                      {/* 1/2 - (total_mahal_width + one_bosluk_width) - sabit kısım*/}
                      <Grid sx={{ position: "sticky", left: { xs: 0, md: drawerWidth + "px" } }}>

                        {/* Grid - lbs başlığı ve varsa altındaki mahaller */}
                        <Grid sx={{
                          display: "grid", gridAutoFlow: "column", gridTemplateColumns: total_mahal_width + "rem " + one_bosluk_width + "rem",

                        }}>

                          {/* 1/2 - total_mahal_width - lbs başlığı */}
                          <Grid item sx={{ width: "100%", backgroundColor: "#FAEBD7", border: "1px solid black" }}>

                            {/* sadece cOunt tespiti için görünmez bir componenet */}
                            <Box sx={{ display: "none" }}>
                              {cOunt = lbsOne.code.split(".").length}
                            </Box>

                            {
                              lbsOne.code.split(".").map((codePart, index) => {

                                if (index == 0 && cOunt == 1) {
                                  lbsCode = codePart
                                  lbsName = isProject.lbs.find(item => item.code == lbsCode).name
                                }

                                if (index == 0 && cOunt !== 1) {
                                  lbsCode = codePart
                                  lbsName = isProject.lbs.find(item => item.code == lbsCode).codeName
                                }

                                if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                                  lbsCode = lbsCode + "." + codePart
                                  lbsName = lbsName + " > " + isProject.lbs.find(item => item.code == lbsCode).codeName
                                }

                                if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                                  lbsCode = lbsCode + "." + codePart
                                  lbsName = lbsName + " > " + isProject.lbs.find(item => item.code == lbsCode).name
                                }

                              })
                            }



                            {/* sadece cOunt tespiti için görünmez bir componenet */}
                            <Box sx={{ display: "none" }}>
                              {cOunt = lbsName.split(">").length}
                            </Box>

                            {/* bu seviyede tek görünür grid item bu --> lbs başlığının yazdığı yer */}
                            {lbsName.split(">").map((item, index) => (

                              <Typography key={index} component={"span"} sx={{ ml: "0.3rem", fontWeight: "normal" }} >
                                {item}
                                {index + 1 !== cOunt &&
                                  <Typography component={"span"} sx={{ fontWeight: "600", color: "darkred" }}>{">"}</Typography>
                                }
                              </Typography>

                            ))}

                          </Grid>


                          {/* 2/2 - one_bosluk_width - 2rem boşluk*/}
                          <Grid item sx={{ backgroundColor: "white", color: "white", width: "100%" }}>
                            .
                          </Grid>


                        </Grid>

                      </Grid>



                      {/* 2/2 - (pozlar.length * one_poz_width) + "rem" - poz alanı genişliğinde dolgu boşluk*/}
                      <Grid item sx={{ border: "1px solid black", backgroundColor: "#FAEBD7", color: "#FAEBD7" }}>
                        ee
                      </Grid>

                    </Grid>

                  </Grid>

                  {/* lbs başlığı altındaki mahaller */}
                  < Box sx={{ display: "none" }}>
                    {cOunt = mahaller.filter(item => item._lbsId.toString() == lbsOne._id.toString()).length}
                  </Box>

                  {
                    mahaller?.filter(item => item._lbsId.toString() == lbsOne._id.toString()).map((mahalOne, index) => {

                      return (

                        <Grid item key={mahalOne._id.toString()}>

                          <Grid

                            sx={{
                              display: "grid", gridAutoFlow: "column", gridTemplateColumns: (total_mahal_width + one_bosluk_width) + "rem " + (pozlar.length * one_poz_width) + "rem",
                            }}

                          >

                            <Grid item sx={{ position: "sticky", left: { xs: 0, md: "240px" }, width: "100%" }}>

                              <Grid key={index} sx={{
                                cursor: "pointer",
                                display: "grid", gridAutoFlow: "column", gridTemplateColumns: _3_mahal_width_rem + " " + one_bosluk_width + "rem",
                                "&:hover .hoverTheLbs": {
                                  // display: "inline"
                                  visibility: "visible"
                                },
                              }}>

                                <Grid sx={{ backgroundColor: "white", border: "1px solid black", borderRight: "0", borderTop: "0", textAlign: "center" }}>
                                  <Typography>
                                    xx
                                  </Typography>
                                </Grid>

                                <Grid sx={{ backgroundColor: "white", border: "1px solid black", borderRight: "0", borderTop: "0" }}>

                                  <Grid container >

                                    <Grid item>
                                      <Typography sx={{ ml: "0.2rem" }}>
                                        {mahalOne.name}
                                      </Typography>
                                    </Grid>

                                    {/* <Grid item className='hoverTheLbs'
                                    sx={{
                                      ml: "0.5rem",
                                      visibility: selectedMahal?._id.toString() === item._id.toString() ? "visible" : "hidden",
                                    }}>
                                    <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                                      <Grid item >
                                        <Box sx={{
                                          backgroundColor: "red",
                                          borderRadius: "0.5rem",
                                          height: "0.5rem",
                                          width: "0.5rem",
                                        }}>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Grid> */}

                                  </Grid>

                                </Grid>

                                <Grid sx={{ backgroundColor: "white", border: "1px solid black", borderTop: "0", textAlign: "center" }}>
                                  <Typography >
                                    {mahalOne.unit}
                                  </Typography>
                                </Grid>

                                {/* one_bosluk_width --> boşluk*/}
                                <Grid item sx={{ backgroundColor: "white", color: "white", width: "100%" }}>
                                  .
                                </Grid>

                              </Grid>

                            </Grid>

                            <Grid item>

                              <Grid sx={{
                                display: "grid", gridTemplateColumns: "repeat(" + pozlar.length + ", " + one_poz_width + "rem)",
                              }}>

                                {/* sadece cOunt tespiti için görünmez bir componenet */}
                                <Box sx={{ display: "none" }}>
                                  {pozCount = pozlar.length}
                                </Box>

                                {pozlar.map((pozOne, index) => {
                                  return (
                                    <Grid key={index} onClick={() => openMetraj({ "mahalId": mahalOne._id, "pozId": pozOne._id })} sx={{ border: "1px solid black", borderTop: "0", borderRight: (index + 1) == pozCount ? null : "0", textAlign: "center", cursor: "pointer" }}>
                                      <Typography sx={{ height: "1.5rem", overflow: "hidden" }} >
                                        {mahalListesi?.find(item => item._mahalId.toString() === mahalOne._id.toString() && item._pozId.toString() === pozOne._id.toString()) ?
                                          "açık"
                                          : "kapalı"
                                        }
                                      </Typography>
                                    </Grid>
                                  )
                                })}


                              </Grid>

                            </Grid>

                          </Grid>

                        </Grid>

                      )

                    })
                  }




                </Grid>

              ))
          }



        </Stack >
      }

    </Grid >

  )

}
