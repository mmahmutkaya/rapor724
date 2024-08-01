
import { useState, useContext, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormMahalCreate from '../../components/FormMahalCreate'
import MetrajEditHeader from '../../components/MetrajEditHeader'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';


export default function P_MetrajEdit() {

  const RealmApp = useApp();

  const { isProject, setIsProject } = useContext(StoreContext)
  const { custom, setCustom } = useContext(StoreContext)
  const { selectedMahal, setSelectedMahal } = useContext(StoreContext)
  const { selectedPoz, setSelectedPoz } = useContext(StoreContext)
  const { myTema, setMyTema } = useContext(StoreContext)
  const { selectedNode, setSelectedNode } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { mahalListesi, setMahalListesi } = useContext(StoreContext)
  const { pozlar, setPozlar } = useContext(StoreContext)
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)
  const { editNodeMetraj, setEditNodeMetraj } = useContext(StoreContext)
  const { showNodeMetraj, setShowNodeMetraj } = useContext(StoreContext)


  const [show, setShow] = useState("Main")
  const [nodeMetrajlar_state, setNodeMetrajlar_state] = useState("Main")
  const [metraj, setMetraj] = useState(0)
  const [_pozId, set_pozId] = useState()
  const [mahalBilgiler_willBeSaved, setMahalBilgiler_willBeSaved] = useState([])
  const [autoFocus, setAutoFocus] = useState({ pozId: null, mahalId: null })


  let pozBirim
  let pozMetraj
  let nodeMetrajGuncel = 13
  let mahal
  let metrajCesitleri = [{ id: "guncel", name: "Güncel" }]


  // const [pozToplam, setPozToplam] = useState()
  // const [pozBirim, setPozBirim] = useState()

  // setPozBirim(isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId).name)


  const navigate = useNavigate()
  // !isProject ? navigate('/projects') : null
  if (!isProject) window.location.href = "/projects"



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


  // const { data: nodeMetrajlar } = useQuery({
  const { data: nodeMetrajlar } = useQuery({
    queryKey: ['nodeMetrajlar', selectedNode?._id.toString()],
    queryFn: () => RealmApp?.currentUser.callFunction("getNodeMetrajlar", ({ _projectId: isProject?._id, _mahalId: selectedNode?._mahalId, _pozId: selectedNode?._pozId })),
    enabled: !editNodeMetraj && !!RealmApp && !!selectedNode && !!showNodeMetraj
  })



  const queryClient = useQueryClient()
  const updateNodeMetrajlar = (oneRow, oneData, newValue) => {
    let nodeMetrajlar2 = { ...nodeMetrajlar }
    nodeMetrajlar2["guncel"]["satirlar"] = nodeMetrajlar2["guncel"]["satirlar"].map(x => {
      if (x.satirNo == oneRow.satirNo) {
        x[oneData] = newValue
        return x
      } else {
        return x
      }
    })
    queryClient.setQueryData(['nodeMetrajlar', selectedNode?._id.toString()], nodeMetrajlar2)
    // console.log("nodeMetrajlar_update", nodeMetrajlar)
  }



  const mahalListesi_fecth = async () => {
    if (!mahalListesi) {
      const result = await RealmApp?.currentUser.callFunction("collectionDugumler", ({ functionName: "getMahalListesi", _projectId: isProject?._id }));
      setMahalListesi(result)
    }
  }
  mahalListesi_fecth()



  // bir string değerinin numerik olup olmadığının kontrolü
  function isNumeric(str) {
    if (str) {
      str.toString()
    }
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }



  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-") {
      // console.log("'e' - 'E' - '+' - '-' kullanılmasın")
      return event.preventDefault()
    }
  }




  const handle_input_onChange = (event, oneRow, oneData) => {
    event.preventDefault()
    updateNodeMetrajlar(oneRow, oneData, event.target.value)
    // alttaki kod sadece react component render yapılması için biyerde kullanılmıyor
    setMetraj(oneRow["metin1"] + oneRow["metin2"] + oneRow["carpan1"] + oneRow["carpan2"] + oneRow["carpan3"] + oneRow["carpan4"] + oneRow["carpan5"])
  }



  const saveMahal = (mahal) => {
    console.log("saveMahal")
    console.log("nodeMetrajlar", nodeMetrajlar)
    // kayıt başarılı ise
    setEditNodeMetraj()
  }


  const ikiHane = (value) => {
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }


  const defaultValue = (oneRow, oneData, isMinha) => {
    if (oneData == "pozBirim") return pozBirim
    if (oneData.includes("carpan")) return !editNodeMetraj ? ikiHane(oneRow[oneData]) : oneRow[oneData]
    if (oneData.includes("metraj")) {
      if (oneRow.carpan1 == "" && oneRow.carpan2 == "" && oneRow.carpan3 == "" && oneRow.carpan4 == "" && oneRow.carpan5 == "") {
        return ""
      }
      const value = (
        (oneRow.carpan1 == "" ? 1 : oneRow.carpan1) *
        (oneRow.carpan2 == "" ? 1 : oneRow.carpan2) *
        (oneRow.carpan3 == "" ? 1 : oneRow.carpan3) *
        (oneRow.carpan4 == "" ? 1 : oneRow.carpan4) *
        (oneRow.carpan5 == "" ? 1 : oneRow.carpan5)
      )
      if (isMinha) {
        return ikiHane(value * -1)
      }
      return ikiHane(value)
    }
    return oneRow[oneData]
  }


  return (

    <>
      {pozBirim = isProject?.pozBirimleri.find(item => item.id == selectedPoz?.birimId)?.name}

      {pozMetraj = mahalListesi?.filter(item => item._pozId.toString() == selectedPoz._id.toString()).reduce((accumulator, oneNode) => (isNaN(parseFloat(oneNode.metraj?.guncel)) ? accumulator + 0 : accumulator + parseFloat(oneNode.metraj?.guncel)), 0)}
      {pozMetraj = Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pozMetraj)}

      <Grid item >
        <MetrajEditHeader show={show} setShow={setShow} saveMahal={saveMahal} />
      </Grid>


      {show == "Main" && !selectedPoz &&
        navigate("/metraj")
      }


      {/* pozun mahalllerinin listelendiği ilk sayfa */}
      {show == "Main" && !showNodeMetraj &&

        < Box sx={{ mt: subHeaderHeight, ml: "1rem", mr: "1rem", width: "63rem" }}>

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



      {/* seçili poz ve mahalin metrajlarının gösterildiği ikinci sayfa gösterim */}

      {show == "Main" && showNodeMetraj && nodeMetrajlar &&

        < Box sx={{ mt: subHeaderHeight, ml: "1rem", mr: "1rem", width: "66rem" }}>

          {/* En Üst Başlık Satırı */}
          < Grid sx={{ mb: "0.5rem", display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", backgroundColor: "lightgray", justifyContent: "center" }}>
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
              Metraj
            </Box>
            <Box sx={{ border: "1px solid black", display: "grid", alignItems: "end", textAlign: "center" }}>
              Birim
            </Box>
          </Grid >


          {/* Metrajlar */}

          {metrajCesitleri?.map((oneCesit, index) => {

            return (

              <Box key={index}>

                <Grid sx={{ display: "grid", gridTemplateColumns: "55rem 8rem 3rem", justifyContent: "center", alignItems: "center" }}>
                  <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "end", alignItems: "center", pr: "1rem" }}>{oneCesit?.name}</Box>
                  <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>{nodeMetrajGuncel}</Box>
                  <Box sx={{ border: "1px solid black", backgroundColor: "rgba( 253, 197, 123 , 0.6 )", display: "grid", justifyContent: "center", alignItems: "center" }}>{pozBirim}</Box>
                </Grid>


                {nodeMetrajlar[oneCesit.id].satirlar.map((oneRow, index) => {
                  return (
                    < Grid key={index} sx={{ display: "grid", gridTemplateColumns: "6rem 10rem 14rem repeat(5, 5rem) 8rem 3rem", justifyContent: "center" }}>

                      {["satirNo", "metin1", "metin2", "carpan1", "carpan2", "carpan3", "carpan4", "carpan5", "metraj", "pozBirim"].map((oneData, index) => {
                        let isCellEdit = oneData === "satirNo" || oneData === "pozBirim" || oneData === "metraj" || !editNodeMetraj ? false : true
                        let isMinha = oneRow["metin1"].includes("minha") || oneRow["metin2"].includes("minha") ? true : false
                        return (
                          <Box key={index} sx={{ display: "grid", alignItems: "center" }}>
                            {!editNodeMetraj &&
                              <Input
                                // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                                // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                                // autoFocus={true}
                                readOnly={true}
                                disableUnderline={true}
                                size="small"
                                // type={editNodeMetraj && oneData.includes("carpan") ? "number" : "text"}
                                type="text"
                                // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                                // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                                // onKeyDown={oneData.includes("carpan") ? (event) => handle_input_onKey(event, oneData) : null}
                                // onChange={oneData.includes("carpan") ? (event) => handle_input_onChange(event, oneRow, oneData) : null}
                                sx={{
                                  border: "1px solid black",
                                  width: "100%",
                                  display: "grid",
                                  alignItems: "center",
                                  paddingLeft: "0.2rem",
                                  paddingRight: "0.2rem",
                                  backgroundColor: isCellEdit ? "yellow" : null,
                                  color: isMinha ? "red" : null,
                                  // justifyItems: oneBaslik.yatayHiza,
                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                    display: "none",
                                  },
                                  "& input[type=number]": {
                                    MozAppearance: "textfield",
                                  },
                                }}
                                // defaultValue={oneRow[oneData]}
                                value={defaultValue(oneRow, oneData)}
                                inputProps={{
                                  style: {
                                    height: "1.2rem",
                                    fontSize: "0.95rem",
                                    marginTop: "0.1rem",
                                    paddingBottom: "0px",
                                    marginbottom: "0px",
                                    textAlign: oneData.includes("carpan") || oneData.includes("metraj") ? "end" : oneData.includes("metin") ? "start" : "center"
                                  },
                                }}
                              />
                            }
                            {editNodeMetraj &&
                              <Input
                                // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                                // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                                // autoFocus={true}
                                readOnly={!isCellEdit}
                                disableUnderline={true}
                                size="small"
                                type={oneData.includes("carpan") ? "number" : "text"}
                                // type={"text"}
                                // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                                // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                                onKeyDown={oneData.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                                onChange={(event) => handle_input_onChange(event, oneRow, oneData)}
                                sx={{
                                  border: "1px solid black",
                                  width: "100%",
                                  display: "grid",
                                  alignItems: "center",
                                  paddingLeft: "0.2rem",
                                  paddingRight: "0.2rem",
                                  backgroundColor: isCellEdit ? "yellow" : null,
                                  color: isMinha ? "red" : null,
                                  // justifyItems: oneBaslik.yatayHiza,
                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                    display: "none",
                                  },
                                  "& input[type=number]": {
                                    MozAppearance: "textfield",
                                  },
                                }}
                                // defaultValue={oneRow[oneData]}
                                value={defaultValue(oneRow, oneData, isMinha)}
                                inputProps={{
                                  style: {
                                    height: "1.2rem",
                                    fontSize: "0.95rem",
                                    marginTop: "0.1rem",
                                    paddingBottom: "0px",
                                    marginbottom: "0px",
                                    textAlign: oneData.includes("carpan") || oneData.includes("metraj") ? "end" : oneData.includes("metin") ? "start" : "center"
                                  },
                                }}
                              />
                            }
                          </Box>
                        )
                      })}

                    </Grid >
                  )

                })}

              </Box>

            )

          })}



        </Box >

      }

    </ >

  )

}


