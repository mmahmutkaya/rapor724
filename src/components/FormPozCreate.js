import { useApp } from "./useApp.js";
import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogAlert } from './general/DialogAlert.js';
import { useGetPozlar } from '../hooks/useMongo.js';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import _ from 'lodash';



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




export default function FormPozCreate({ setShow }) {

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { appUser, setAppUser, myTema } = useContext(StoreContext)

  const { selectedFirma, selectedProje } = useContext(StoreContext)
  const { data } = useGetPozlar()

  const [dialogAlert, setDialogAlert] = useState()

  const [wbsIdError, setWbsIdError] = useState()
  const [pozNameError, setPozNameError] = useState()
  const [pozNoError, setPozNoError] = useState()
  const [pozBirimIdError, setPozBirimIdError] = useState()
  const [pozMetrajTipIdError, setPozMetrajTipIdError] = useState()

  // form verilerinde kullanmak için oluşturulan useState() verileri
  // form ilk açıldığında önceden belirlenen birşeyin seçilmiş olması için alttaki satırdaki gibi yapılabiliyor
  const [pozMetrajTipId, setPozMetrajTipId] = useState("standartMetrajSayfasi");
  const [wbsId, setWbsId] = useState();
  const [pozBirimId, setPozBirimId] = useState();
  const [pozBirimDisabled, setPozBirimDisabled] = useState(false);


  // poz oluşturma fonksiyonu
  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // formdan gelen text verilerini alma - (çoktan seçmeliler seçildiği anda useState() kısmında güncelleniyor)
      const formData = new FormData(event.currentTarget);
      const pozName = deleteLastSpace(formData.get('pozName'))
      const pozNo = deleteLastSpace(formData.get('pozNo'))

      let newPoz = {
        _firmaId: selectedFirma._id,
        _projeId: selectedProje._id,
        _wbsId: wbsId,
        pozName,
        pozNo,
        pozBirimId,
        pozMetrajTipId
      }

      // veri düzeltme
      if (newPoz.pozMetrajTipId === "insaatDemiri") {
        newPoz.pozBirimId = "ton"
      }

      ////// form validation - frontend

      let wbsIdError
      let pozNameError
      let pozNoError
      let pozBirimIdError
      let pozMetrajTipIdError
      let isFormError = false


      // form alanına uyarı veren hatalar

      if (!newPoz._wbsId && !wbsIdError) {
        setWbsIdError("Zorunlu")
        wbsIdError = true
        isFormError = true
      }


      if (typeof newPoz.pozName !== "string" && !pozNameError) {
        setPozNameError("Zorunlu")
        pozNameError = true
        isFormError = true
      }

      if (typeof newPoz.pozName === "string" && !pozNameError) {
        if (newPoz.pozName.length === 0) {
          setPozNameError("Zorunlu")
          pozNameError = true
          isFormError = true
        }
      }

      if (typeof newPoz.pozName === "string" && !pozNameError) {
        let minimumHaneSayisi = 3
        if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
          setPozNameError(`${minimumHaneSayisi} haneden az olamaz`)
          pozNameError = true
          isFormError = true
        }
      }

      if (data?.pozlar?.length > 0 && data?.pozlar.find(x => x.pozName === newPoz.pozName) && !pozNameError) {
        setPozNameError(`Bu poz ismi kullanılmış`)
        pozNameError = true
        isFormError = true
      }


      if (!newPoz.pozNo && !pozNoError) {
        setPozNoError(`Zorunlu`)
        pozNoError = true
        isFormError = true
      }

      let pozFinded
      if (data?.pozlar?.length > 0) {
        pozFinded = data?.pozlar.find(x => x.pozNo === newPoz.pozNo)
      }
      if (pozFinded && !pozNoError) {
        setPozNoError(`Bu poz numarası kullanılmış`)
        pozNoError = true
        isFormError = true
      }


      if (!newPoz.pozBirimId && !pozBirimIdError) {
        setPozBirimIdError(`Zorunlu`)
        pozBirimIdError = true
        isFormError = true
      }


      if (!selectedProje.pozMetrajTipleri.find(x => x.id == newPoz.pozMetrajTipId) && !pozMetrajTipIdError) {
        setPozMetrajTipIdError(`Zorunlu`)
        pozMetrajTipIdError = true
        isFormError = true
      }


      // form alanına uyarı veren hatalar olmuşsa burda durduralım
      if (isFormError) {
        // console.log("form validation - hata - frontend")
        return
      }

      // console.log("newPoz", newPoz)
      // return
      // form verileri kontrolden geçti - db ye göndermeyi deniyoruz

      const response = await fetch(`/api/pozlar`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPoz })
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
        setWbsIdError(responseJson.errorObject.wbsIdError)
        setPozNameError(responseJson.errorObject.pozNameError)
        setPozNoError(responseJson.errorObject.pozNoError)
        setPozBirimIdError(responseJson.errorObject.pozBirimIdError)
        setPozMetrajTipIdError(responseJson.errorObject.pozMetrajTipIdError)
        console.log("responseJson.errorObject", responseJson.errorObject)
        console.log("alt satırda backend den gelen hata ile durdu")
        return
      }


      if (!responseJson.newPoz) {
        console.log("responseJson", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }

      // {pozlar} ile data içindeki object pozlar veriis alınıyor
      let data2 = _.cloneDeep(data)
      data2.pozlar = [...data2.pozlar, { ...responseJson.newPoz }]
      queryClient.setQueryData(['dataPozlar'], data2)

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
  const handleChange_wbs = (event) => {
    setWbsId(selectedProje.wbs.find(item => item._id.toString() === event.target.value.toString())._id);
  };

  const handleChange_pozMetrajTipId = (event) => {

    setPozMetrajTipId(event.target.value);
    setPozBirimDisabled(false)

    if (event.target.value === "insaatDemiri") {
      setPozBirimId("ton")
      setPozBirimDisabled(true)
      setPozBirimIdError()
    }

  };

  const handleChange_pozBirimId = (event) => {
    setPozBirimId(selectedProje.pozBirimleri.find(item => item.id === event.target.value).id);
  };


  // aşağıda kullanılıyor
  let wbsCode
  let wbsName



  return (
    <div>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }


      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("Main")} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", marginBottom: "2rem" }}>
              {/* <Typography sx> */}
              Poz Oluştur
              {/* </Typography> */}
            </DialogContentText>


            {/* wbs adı seçme - çoktan seçmeli - poz başlığı için*/}
            <Box
              onClick={() => setWbsIdError()}
              sx={{ minWidth: 120, marginBottom: "0rem" }}
            >

              <InputLabel
                error={wbsIdError ? true : false}
                id="select-wbs-label"
              >
                <Grid container justifyContent="space-between">

                  <Grid item>Poz Başlığı Seçiniz</Grid>

                  <Grid item onClick={() => console.log("poz create component wbs tıklandı")} >
                    wbs
                    <ArrowForwardIcon sx={{ fontSize: 15, verticalAlign: "middle" }} />
                  </Grid>

                </Grid>

              </InputLabel>

              <Select
                error={wbsIdError ? true : false}
                variant="standard"
                fullWidth
                labelId="select-wbs-label"
                id="select-wbs"
                value={wbsId ? wbsId : ""}
                // label="Poz için başlık seçiniz"
                // label="Poz"
                onChange={handleChange_wbs}
                required
                name="wbsId"
              >
                {
                  selectedProje?.wbs?.filter(item => item.openForPoz)
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
                    .map(wbsOne => (
                      // console.log(wbs)
                      <MenuItem key={wbsOne._id} value={wbsOne._id}>

                        {
                          wbsOne.code.split(".").map((codePart, index) => {

                            let cOunt = wbsOne.code.split(".").length

                            // console.log(cOunt)
                            // console.log(index + 1)
                            // console.log("---")

                            if (index == 0 && cOunt == 1) {
                              wbsCode = codePart
                              wbsName = selectedProje.wbs.find(item => item.code == wbsCode).name
                            }

                            if (index == 0 && cOunt !== 1) {
                              wbsCode = codePart
                              wbsName = selectedProje.wbs.find(item => item.code == wbsCode).codeName
                            }

                            if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                              wbsCode = wbsCode + "." + codePart
                              wbsName = wbsName + " > " + selectedProje.wbs.find(item => item.code == wbsCode).codeName
                            }

                            if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                              wbsCode = wbsCode + "." + codePart
                              wbsName = wbsName + " > " + selectedProje.wbs.find(item => item.code == wbsCode).name
                            }

                          })
                        }

                        {/* wbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                        <Box sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "start" }} >

                          {wbsName.split(">").map((item, index) => (

                            <Box key={index} sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "start" }} >
                              {item}
                              {index + 1 !== wbsName.split(">").length &&
                                <Box sx={{ color: myTema.renkler.baslik2_ayrac, mx: "0.2rem" }} >{">"}</Box>
                              }
                            </Box>

                          ))}

                          {/* <Typography>{wbsName}</Typography> */}
                        </Box>

                      </MenuItem>
                    ))
                }

              </Select>

            </Box>



            {/* poz numarasının yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setPozNoError()}
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
                id="pozNo"
                name="pozNo"
                // autoFocus
                error={pozNoError ? true : false}
                helperText={pozNoError}
                // margin="dense"
                label="Poz No"
                type="text"
                fullWidth
              />
            </Box>




            {/* poz isminin yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setPozNameError()}
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
                id="pozName"
                name="pozName"
                // autoFocus
                error={pozNameError ? true : false}
                helperText={pozNameError}
                // margin="dense"
                label="Poz Adi"
                type="text"
                fullWidth
              />
            </Box>


            {/* poz Tip seçme - çoktan seçmeli*/}
            <Box
              onClick={() => setPozMetrajTipIdError()}
              sx={{ minWidth: 120, marginBottom: "0rem" }}
            >
              <InputLabel
                error={pozMetrajTipIdError ? true : false}
                id="select-pozMetrajTip-label"
              >
                <Grid container justifyContent="space-between">
                  <Grid item>Metraj Tipi Seçiniz</Grid>
                </Grid>
              </InputLabel>

              <Select
                error={pozMetrajTipIdError ? true : false}
                variant="standard"
                fullWidth
                labelId="select-pozMetrajTip-label"
                id="select-pozMetrajTip"
                value={pozMetrajTipId ? pozMetrajTipId : ""}
                label="Poz için tip seçiniz"
                onChange={handleChange_pozMetrajTipId}
                required
                name="pozMetrajTipId"
              >
                {
                  selectedProje?.pozMetrajTipleri.map((onePozMetrajTipi, index) => (
                    // console.log(wbs)
                    <MenuItem key={index} value={onePozMetrajTipi.id}>
                      {onePozMetrajTipi.name}
                    </MenuItem>
                  ))
                }

              </Select>

            </Box>



            {/* poz biriminin seçildiği alan */}
            <Box
              onClick={() => setPozBirimIdError()}
              sx={{ minWidth: 120, marginTop: "2rem" }}
            >
              <InputLabel
                error={pozBirimIdError ? true : false}
                id="select-newPozBirim-label"
              >
                <Grid container justifyContent="space-between">
                  <Grid item>Poz Birim Seçiniz</Grid>
                </Grid>
              </InputLabel>

              <Select
                error={pozBirimIdError ? true : false}
                variant="standard"
                fullWidth
                labelId="select-newPozBirim-label"
                id="select-newPozBirim"
                value={pozBirimId ? pozBirimId : ""}
                label="Poz için tip seçiniz"
                onChange={handleChange_pozBirimId}
                required
                name="pozBirimId"
                disabled={pozBirimDisabled}
              >
                {
                  selectedProje?.pozBirimleri.map((onePozBirim, index) => (
                    <MenuItem key={index} value={onePozBirim.id}>
                      {/* {console.log(onePozBirim)} */}
                      {onePozBirim.name}
                    </MenuItem>
                  ))
                }

              </Select>

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
