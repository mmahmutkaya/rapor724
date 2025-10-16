
import { useState, useContext, useEffect } from 'react'
import { StoreContext } from '../../components/store'
import { useNavigate } from 'react-router-dom'

import FormWbsCreate from '../../components/FormWbsCreate'
import FormWbsUpdate from '../../components/FormWbsUpdate'
import HeaderWbs from '../../components/HeaderWbs'


import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert';


export default function P_Wbs() {

  const navigate = useNavigate()

  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState("")

  const { subHeaderHeight } = useContext(StoreContext)

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedWbs, setSelectedWbs } = useContext(StoreContext)

  const [show, setShow] = useState()
  const [nameMode, setNameMode] = useState(false)
  const [codeMode, setCodeMode] = useState(true)


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])


  const handleSelectWbs = (wbs) => {
    setSelectedWbs(wbs)
  }

  let level


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  //   const [openSnackBar, setOpenSnackBar] = useState(false)
  // const [snackBarMessage, setSnackBarMessage] = useState("")



  return (
    <Grid container direction="column" spacing={0} sx={{ mt: subHeaderHeight }}>

      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>


      <Grid item  >
        <HeaderWbs
          setShow={setShow}
          nameMode={nameMode} setNameMode={setNameMode}
          codeMode={codeMode} setCodeMode={setCodeMode}
          openSnackBar={openSnackBar} setOpenSnackBar={setOpenSnackBar}
          snackBarMessage={snackBarMessage} setSnackBarMessage={setSnackBarMessage}
        />
      </Grid>


      {show == "FormWbsCreate" &&
        <Grid item >
          <FormWbsCreate
            setShow={setShow}
            selectedProje={selectedProje} setSelectedProje={setSelectedProje}
            selectedWbs={selectedWbs} setSelectedWbs={setSelectedWbs}
            openSnackBar={openSnackBar} setOpenSnackBar={setOpenSnackBar}
            snackBarMessage={snackBarMessage} setSnackBarMessage={setSnackBarMessage}
          />
        </Grid>
      }

      {show == "FormWbsUpdate" &&
        <Grid item >
          <FormWbsUpdate setShow={setShow} selectedProje={selectedProje} setSelectedProje={setSelectedProje} selectedWbs={selectedWbs} setSelectedWbs={setSelectedWbs} />
        </Grid>
      }


      {!selectedProje?.wbs?.length &&
        <Stack sx={{ width: '100%', padding: "0.5rem" }} spacing={2}>
          <Alert severity="info">
            Yukarıdaki "+" tuşuna basarak "Poz Başlığı" oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {selectedProje?.wbs?.length > 0 &&
        < Stack sx={{ width: '60rem', padding: "0.5rem" }} spacing={0}>

          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black", color: "white" }}>

            </Box>
            <Box sx={{ backgroundColor: "black", color: "white" }}>
              {selectedProje.name}
            </Box>
          </Box>


          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>

            <Box sx={{ backgroundColor: "black" }}>

            </Box>

            {/* {console.log("selectedProje?.wbs?.length", selectedProje?.wbs?.length)} */}
            <Box display="grid">

              {
                selectedProje.wbs.sort(function (a, b) {
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
                }).map((theWbs, index) => {

                  // theWbs = { _id, code, name }

                  level = theWbs?.code?.split(".").length

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: (level - 1) == 0 ? "1rem 1fr" : "1rem repeat(" + (level - 1) + ", 1rem) 1fr", // baştaki poz var mı yok mu için
                        "&:hover .hoverTheWbsLeft": {
                          visibility: "visible",
                          color: "red",
                        },

                      }}>

                      {Array.from({ length: (level - 1) > -1 ? (level - 1) : 0 }).map((_item, index) => {
                        return (
                          // <Box sx={{ backgroundColor: color(index + 1).bg, borderLeft: "1px solid " + color("border") }}></Box>
                          <Box key={index} sx={{ backgroundColor: color(index + 1).bg, borderLeft: "1px solid " + color("border") }}></Box>
                        )
                      })}


                      <Box sx={{ position: "relative", backgroundColor: color(level)?.bg, borderLeft: "1px solid " + color("border") }}>

                        {theWbs.openForPoz &&
                          // wbs poza açıksa - var olan mevcut kutunun içinde beliren sarı kutu
                          <Grid container sx={{ position: "absolute", borderRadius: "10%", backgroundColor: "#65FF00", top: "20%", left: "30%", width: "0.7rem", height: "0.7rem" }}>

                            {/* poz kayıtlı ise sarı kutunun içinde beliren siyah nokta */}
                            {theWbs.includesPoz &&
                              <Grid item sx={{ position: "relative", width: "100%", height: "100%" }}>

                                <Box sx={{ position: "absolute", borderRadius: "50%", backgroundColor: "red", top: "25%", left: "25%", width: "50%", height: "50%" }}>

                                </Box>

                              </Grid>
                            }


                          </Grid>
                        }

                      </Box>


                      <Box
                        onClick={() => handleSelectWbs(theWbs)}
                        sx={{

                          pl: "2px",

                          borderBottom: "0.5px solid " + color("border"),

                          // önce hepsini bu şekilde sonra seçilmişi aşağıda değiştiriyoruz
                          backgroundColor: color(level).bg,
                          color: color(level).co,

                          "&:hover .hoverTheWbs": {
                            // display: "inline"
                            visibility: "visible"
                          },

                          cursor: "pointer",

                        }}
                      >

                        <Grid container sx={{ display: "grid", gridTemplateColumns: "1fr 2rem" }}>

                          {/* theWbs isminin yazılı olduğu kısım */}
                          <Grid item>

                            <Grid container sx={{ color: "#cccccc" }}>

                              {codeMode === null && //kısa
                                <Grid item sx={{ ml: "0.2rem" }}>
                                  {theWbs.code.split(".")[level - 1] + " - "}
                                </Grid>
                              }

                              {codeMode === false && //tam
                                <Grid item sx={{ ml: "0.2rem" }}>
                                  {theWbs.code + " - "}
                                </Grid>
                              }

                              {/* codeMode === true && //yok */}

                              {nameMode === null &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  {"(" + theWbs.codeName + ")" + " - " + theWbs.name}
                                </Grid>
                              }

                              {nameMode === false &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  {theWbs.name}
                                </Grid>
                              }

                              {nameMode === true &&
                                <Grid item sx={{ ml: "0.3rem" }}>
                                  ({theWbs.codeName})
                                </Grid>
                              }

                              <Grid item className='hoverTheWbs'
                                sx={{
                                  ml: "0.5rem",
                                  visibility: selectedWbs?._id.toString() === theWbs._id.toString() ? "visible" : "hidden",
                                }}>

                                <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                                  <Grid item >
                                    <Box sx={{
                                      backgroundColor: "yellow",
                                      borderRadius: "0.5rem",
                                      height: "0.5rem",
                                      width: "0.5rem",

                                    }}>
                                    </Box>
                                  </Grid>
                                </Grid>

                              </Grid>

                            </Grid>
                          </Grid>

                        </Grid>

                      </Box>



                    </Box>
                  )

                })

              }

            </Box>

          </Box>

        </Stack>
      }

    </Grid >

  )

}



function color(index) {
  switch (index) {
    case 0:
      return { bg: "#202020", co: "#e6e6e6" }
    case 1:
      return { bg: "#8b0000", co: "#e6e6e6" }
    case 2:
      return { bg: "#330066", co: "#e6e6e6" }
    case 3:
      return { bg: "#005555", co: "#e6e6e6" }
    case 4:
      return { bg: "#737373", co: "#e6e6e6" }
    case 5:
      return { bg: "#8b008b", co: "#e6e6e6" }
    case 6:
      return { bg: "#2929bc", co: "#e6e6e6" }
    case 7:
      return { bg: "#00853E", co: "#e6e6e6" }
    case 8:
      return { bg: "#4B5320", co: "#e6e6e6" }
    case "border":
      return "gray"
    case "font":
      return "#e6e6e6"
  }
}
