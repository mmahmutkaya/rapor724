
import { useState, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import _ from 'lodash';


import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';

import { useGetMahaller } from '../hooks/useMongo.js';



//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MenuItem from '@mui/material/MenuItem';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';





export default function FormMahalCreate({ setShow, setDialogAlert }) {

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { appUser, setAppUser, myTema } = useContext(StoreContext)

  const { selectedFirma, selectedProje } = useContext(StoreContext)
  const { data: dataMahaller } = useGetMahaller()

  const [lbsIdError, setLbsIdError] = useState()
  const [mahalNameError, setMahalNameError] = useState()
  const [mahalNoError, setMahalNoError] = useState()

  const [lbsId, setLbsId] = useState();


  // mahal oluşturma fonksiyonu
  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // formdan gelen text verilerini alma - (çoktan seçmeliler seçildiği anda useState() kısmında güncelleniyor)
      const formData = new FormData(event.currentTarget);
      const mahalName = deleteLastSpace(formData.get('mahalName'))
      const mahalNo = deleteLastSpace(formData.get('mahalNo'))

      const newMahal = {
        _firmaId: selectedFirma._id,
        _projeId: selectedProje._id,
        _lbsId: lbsId,
        mahalName,
        mahalNo,
      }


      ////// form validation - frontend

      let lbsIdError
      let mahalNameError
      let mahalNoError
      let isFormError = false


      // form alanına uyarı veren hatalar

      if (!newMahal._lbsId && !lbsIdError) {
        setLbsIdError("Zorunlu")
        lbsIdError = true
        isFormError = true
      }


      if (typeof newMahal.mahalName !== "string" && !mahalNameError) {
        setMahalNameError("Zorunlu")
        mahalNameError = true
        isFormError = true
      }

      if (typeof newMahal.mahalName === "string" && !mahalNameError) {
        if (newMahal.mahalName.length === 0) {
          setMahalNameError("Zorunlu")
          mahalNameError = true
          isFormError = true
        }
      }

      if (typeof newMahal.mahalName === "string" && !mahalNameError) {
        let minimumHaneSayisi = 3
        if (newMahal.mahalName.length > 0 && newMahal.mahalName.length < minimumHaneSayisi) {
          setMahalNameError(`${minimumHaneSayisi} haneden az olamaz`)
          mahalNameError = true
          isFormError = true
        }
      }

      if (dataMahaller?.mahaller?.find(x => x.mahalName === newMahal.mahalName) && !mahalNameError) {
        setMahalNameError(`Bu mahal ismi kullanılmış`)
        mahalNameError = true
        isFormError = true
      }


      if (!newMahal.mahalNo && !mahalNoError) {
        setMahalNoError(`Zorunlu`)
        mahalNoError = true
        isFormError = true
      }

      let mahalFinded = dataMahaller?.mahaller?.find(x => x.mahalNo === newMahal.mahalNo)
      if (mahalFinded && !mahalNoError) {
        setMahalNoError(`Bu mahal numarası kullanılmış`)
        mahalNoError = true
        isFormError = true
      }



      // form alanına uyarı veren hatalar olmuşsa burda durduralım
      if (isFormError) {
        // console.log("form validation - hata - frontend")
        return
      }

      // console.log("newMahal", newMahal)
      // return
      // form verileri kontrolden geçti - db ye göndermeyi deniyoruz

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/mahaller`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newMahal })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error);
      }

      // form validation - backend
      if (responseJson.errorObject) {
        setLbsIdError(responseJson.errorObject.lbsIdError)
        setMahalNameError(responseJson.errorObject.mahalNameError)
        setMahalNoError(responseJson.errorObject.mahalNoError)
        console.log("responseJson.errorObject", responseJson.errorObject)
        console.log("alt satırda backend den gelen hata ile durdu")
        return
      }


      if (!responseJson.newMahal) {
        console.log("result", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


      let dataMahaller2 = _.cloneDeep(dataMahaller)
      dataMahaller2.mahaller = [...dataMahaller2.mahaller, { ...responseJson.newMahal }]
      queryClient.setQueryData(['dataMahaller'], dataMahaller2)

      setShow("Main")

      return

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }

  }


  // form verilerini kullanıcıdan alıp react hafızasına yüklemek - onChange - sadece seçmeliler - yazma gibi şeyler formun submit olduğu anda yakalanıyor
  const handleChange_lbs = (event) => {
    setLbsId(selectedProje.lbs.find(item => item._id.toString() === event.target.value.toString())._id);
  };




  // aşağıda kullanılıyor
  let lbsCode
  let lbsName



  return (
    <div>

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("Main")} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", marginBottom: "2rem" }}>
              {/* <Typography sx> */}
              Mahal Oluştur
              {/* </Typography> */}
            </DialogContentText>


            {/* lbs adı seçme - çoktan seçmeli - mahal başlığı için*/}
            <Box
              onClick={() => setLbsIdError()}
              sx={{ minWidth: 120, marginBottom: "0rem" }}
            >

              <InputLabel
                error={lbsIdError ? true : false}
                id="select-lbs-label"
              >
                <Grid container justifyContent="space-between">

                  <Grid item>Mahal Başlığı Seçiniz</Grid>

                  <Grid item onClick={() => console.log("mahal create component lbs tıklandı")} >
                    lbs
                    <ArrowForwardIcon sx={{ fontSize: 15, verticalAlign: "middle" }} />
                  </Grid>

                </Grid>

              </InputLabel>

              <Select
                error={lbsIdError ? true : false}
                variant="standard"
                fullWidth
                labelId="select-lbs-label"
                id="select-lbs"
                value={lbsId ? lbsId : ""}
                // label="Mahal için başlık seçiniz"
                // label="Mahal"
                onChange={handleChange_lbs}
                required
                name="lbsId"
              >
                {
                  selectedProje?.lbs?.filter(item => item.openForMahal)
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
                      // console.log(lbs)
                      <MenuItem key={lbsOne._id} value={lbsOne._id}>

                        {
                          lbsOne.code.split(".").map((codePart, index) => {

                            let cOunt = lbsOne.code.split(".").length

                            // console.log(cOunt)
                            // console.log(index + 1)
                            // console.log("---")

                            if (index == 0 && cOunt == 1) {
                              lbsCode = codePart
                              lbsName = selectedProje.lbs.find(item => item.code == lbsCode).name
                            }

                            if (index == 0 && cOunt !== 1) {
                              lbsCode = codePart
                              lbsName = selectedProje.lbs.find(item => item.code == lbsCode).codeName
                            }

                            if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                              lbsCode = lbsCode + "." + codePart
                              lbsName = lbsName + " > " + selectedProje.lbs.find(item => item.code == lbsCode).codeName
                            }

                            if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                              lbsCode = lbsCode + "." + codePart
                              lbsName = lbsName + " > " + selectedProje.lbs.find(item => item.code == lbsCode).name
                            }

                          })
                        }

                        {/* lbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                        <Box sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "start" }} >

                          {lbsName.split(">").map((item, index) => (

                            <Box key={index} sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "start" }} >
                              {item}
                              {index + 1 !== lbsName.split(">").length &&
                                <Box sx={{ color: myTema.renkler.baslik2_ayrac, mx: "0.2rem" }} >{">"}</Box>
                              }
                            </Box>

                          ))}

                          {/* <Typography>{lbsName}</Typography> */}
                        </Box>

                      </MenuItem>
                    ))
                }

              </Select>

            </Box>



            {/* mahal numarasının yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setMahalNoError()}
              sx={{ minWidth: 120, my: "1rem" }}
            >
              <TextField
                sx={{
                  "& input:-webkit-autofill:focus": {
                    transition: "background-color 600000s 0s, color 600000s 0s"
                  },
                  "& input:-webkit-autofill": {
                    transition: "background-color 600000s 0s, color 600000s 0s"
                  },
                }}
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                margin="normal"
                id="mahalNo"
                name="mahalNo"
                // autoFocus
                error={mahalNoError ? true : false}
                helperText={mahalNoError}
                // margin="dense"
                label="Mahal No"
                type="text"
                fullWidth
              />
            </Box>




            {/* mahal isminin yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setMahalNameError()}
              sx={{ minWidth: 120, marginBottom: "2rem" }}
            >
              <TextField
                sx={{
                  "& input:-webkit-autofill:focus": {
                    transition: "background-color 600000s 0s, color 600000s 0s"
                  },
                  "& input:-webkit-autofill": {
                    transition: "background-color 600000s 0s, color 600000s 0s"
                  },
                }}
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                margin="normal"
                id="mahalName"
                name="mahalName"
                // autoFocus
                error={mahalNameError ? true : false}
                helperText={mahalNameError}
                // margin="dense"
                label="Mahal Adi"
                type="text"
                fullWidth
              />
            </Box>


          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow("Main")}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div >
  );



}
