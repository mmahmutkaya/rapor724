
import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import MetrajEditHeader from '../../components/MetrajEditHeader'


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

  let pozBirim
  let pozMetraj
  let mahal

  // const [pozToplam, setPozToplam] = useState()
  // const [pozBirim, setPozBirim] = useState()

  // setPozBirim(isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId).name)

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


  const saveMahal = (mahal) => {
    // setSelectedMahal(mahal)
    // setSelectedMahalBaslik(false)
  }

  const editNodeMetraj = (gelen) => {
    console.log(gelen)
  }


  return (

    <>

      {pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId).name}

      {pozMetraj = mahalListesi.filter(item => item._pozId.toString() == selectedPoz._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj)), 0)}
      {pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)}

      <Grid item >
        <MetrajEditHeader show={show} setShow={setShow} editMode_Metraj={editMode_Metraj} setEditMode_Metraj={setEditMode_Metraj} saveMahal={saveMahal} />
      </Grid>

      {show == "Main" && !selectedPoz &&
        <Stack sx={{ width: '100%', pl: "1rem", pr: "0.5rem", pt: "1rem", mt: subHeaderHeight }} spacing={2}>
          <Alert severity="info">
            Metraj girilmesi için poz seçmelisiniz
          </Alert>
        </Stack>
      }


      {show == "Main" && !selectedPoz &&
        navigate("/metraj")
      }

      {show == "Main" && selectedPoz &&

        <Box sx={{
          mt: subHeaderHeight, ml: "1rem", mr: "1rem", width: "63rem"
        }}>

          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(6, 5rem) 3rem", backgroundColor: "lightgray", justifyContent: "center" }}>
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
              <Box>
                Metraj
              </Box>
              <Box>
                {pozMetraj}
              </Box>
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              {pozBirim}
            </Box>
          </Grid >


          {
            mahalListesi.filter(item => item._pozId.toString() == selectedPoz._id.toString()).map((oneNode, index) => {

              { mahal = mahaller.find(item => item._id.toString() == oneNode._mahalId.toString()) }

              return (

                <Grid key={index}>

                  {/* Mahal Başlık */}
                  <Grid onClick={() => console.log("deneme")} sx={{ display: "grid", gridTemplateColumns: "6rem 49rem 5rem 3rem", justifyContent: "center", cursor: "pointer" }}>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "center" }}>
                      {mahal.kod}
                    </Box>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", pl:"0.5rem" }}>
                      {mahal.name}
                    </Box>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "center" }}>
                      {oneNode.metraj}
                    </Box>
                    <Box sx={{ backgroundColor: "rgba( 253, 197, 123 , 0.6 )", border: "1px solid black", display: "grid", justifyItems: "center" }}>
                      {pozBirim}
                    </Box>
                  </Grid>

                  {/* Metraj Başlık */}
                  {/* <Box sx={{ backgroundColor: "rgba(0, 0, 255, 0.1)", border: "1px solid black" }}>
                  Güncel Metraj
                </Box> */}

                  {/* Metraj Satırları*/}
                  {/* <Grid sx={{ display: "grid", gridTemplateColumns: "3rem 10rem 17rem repeat(6, 5rem) 3rem", justifyContent: "center" }}>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    1
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Mahal 1
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    mahal 2
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Benzer
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Adet
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Çarpan 1
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Çarpan 1
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Çarpan 1
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    Sonuç
                  </Box>
                  <Box sx={{ border: "1px solid black", borderTop: "none", display: "grid", alignItems: "center", textAlign: "center" }}>
                    {pozBirim}
                  </Box>
                </Grid> */}



                </Grid>
              )

            })
          }


        </Box >

      }

    </ >

  )

}


