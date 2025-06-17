import { useApp } from "./useApp.js";
import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from './general/DialogWindow.js';


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



export default function FormPozBaslikCreate({ setShow }) {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const [errorObj, setErrorObj] = useState(false)

  const [veriTuruId, setveriTuruId] = useState("metin")
  const [haneSayisiId, sethaneSayisiId] = useState("0,00")

  const RealmApp = useApp();



  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // formdan gelen text verilerini alma - (çoktan seçmeliler seçildiği anda useState() kısmında güncelleniyor)
      const data = new FormData(event.currentTarget);
      const name = deleteLastSpace(data.get('name'))
      const veriTuruId = deleteLastSpace(data.get('veriTuruId'))
      const birim = deleteLastSpace(data.get('birim'))
      const haneSayisiId = deleteLastSpace(data.get('haneSayisiId'))
      const _projectId = selectedProje?._id


      // form validation - frontend


      // aşağıda kontroller başlıyor, hata varsa bunu true yapıcaz ve db ye göndermeyi engellicez ve formda uyarıları göstericez
      let isFormError = false


      // validation control - poz başlık - projeId bilgisi
      if (typeof _projectId !== "object") {
        setDialogCase("error")
        setShowDialog("Poz başlığı kaydı için gerekli olan  '_projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
        console.log("kayıt için gerekli olan '_projectId' verisinde hata olduğu için bu satırın altında durduruldu")
        return
      }



      // validation control - poz başlık - isim
      if (typeof name !== "string") {
        setErrorObj(prev => ({ ...prev, name: "Zorunlu" }))
        isFormError = true
        console.log(1)
      }

      if (typeof name === "string") {
        if (name.length === 0) {
          setErrorObj(prev => ({ ...prev, name: "Zorunlu" }))
          isFormError = true
          console.log(2)
        }
      }

      if (typeof name === "string") {
        let minimumHaneSayisi = 3
        if (name.length > 0 && name.length < minimumHaneSayisi) {
          setErrorObj(prev => ({ ...prev, name: `${minimumHaneSayisi} haneden az olamaz` }))
          isFormError = true
          console.log(3)
        }
      }

      if (typeof name === "string") {
        if (selectedProje.pozBasliklari.find(item => item.name == name)) {
          setErrorObj(prev => ({ ...prev, name: `Bu başlık kullanılmış` }))
          isFormError = true
          console.log(3)
        }
      }



      // validation control - poz başlık - birim
      if (typeof birim !== "string") {
        setDialogCase("error")
        setShowDialog("Poz başlığı kaydı için gerekli olan  'birim' verisinin metin olmadığı tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
        console.log("kayıt için gerekli olan 'birim' verisinde hata olduğu için fonksiyon bu satırın altında durduruldu")
        return
      }


      if (typeof birim === "string") {
        let maximumHaneSayisi = 10
        if (birim.length > 0 && birim.length > maximumHaneSayisi) {
          setErrorObj(prev => ({ ...prev, birim: `${maximumHaneSayisi} haneden fazla olamaz` }))
          isFormError = true
        }
      }


      // form alanına uyarı veren hatalar olmuşsa db ye göndermeden burda durduralım
      if (isFormError) {
        console.log("errorObj", errorObj)
        console.log("form validation - hata tespit edildi - frontend")
        return
      }

      const pozBilgi = {
        name: name,
        veriTuruId: veriTuruId,
        birim: birim,
        haneSayisiId: haneSayisiId,
      }

      console.log("typeof pozBilgi.birim", typeof pozBilgi.birim)
      console.log("pozBilgi", pozBilgi)



      // form verileri kontrolden geçti - db ye göndermeyi deniyoruz
      const result = await RealmApp?.currentUser?.callFunction("createPozBaslik", pozBilgi, selectedProje?._id);
      console.log("result", result)


      // form validation - backend
      if (result.errorObj) {
        setErrorObj(result.errorObj)
        console.log("result.errorObj", result.errorObj)
        console.log("form validation - hata var - backend")
        return
      }
      console.log("form validation - hata yok - backend")


      setSelectedProje(selectedProje => {
        let selectedProje_ = { ...selectedProje }
        selectedProje_.pozBasliklari.push(result)
        return selectedProje_
      })
      setShow("Main")

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      // eğer çifte kayıt oluyorsa form içindeki poz ismi girilen yere aşağıdaki mesaj gönderilir, fonksiyon durdurulur
      if (hataMesaj_.includes("duplicate key error")) {
        setErrorObj(prev => ({ ...prev, pozBilgisiName: "Bu poz bilgisi ismi kullanılmış" }))
        console.log("Bu poz ismi bu projede mevcut")
        return
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }

  }


  const handleChange_veriTuruId = (event) => {
    console.log("event.target.value", event.target.value)
    setveriTuruId(selectedProje.veriTurleri?.find(item => item.id === event.target.value).id);
  };


  const handleChange_haneSayisiId = (event) => {
    console.log("event.target.value", event.target.value)
    sethaneSayisiId(selectedProje.haneSayilari?.find(item => item.id === event.target.value).id);
  };

  console.log("selectedProje", selectedProje)

  return (
    <div>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow("Main")}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", marginBottom: "2rem" }}>
              {/* <Typography sx> */}
              Poz Bilgisi Oluştur
              {/* </Typography> */}
            </DialogContentText>


            {/* poz bilgisi isminin yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setErrorObj(prevData => {
                const newData = { ...prevData }
                delete newData["name"]
                return newData
              })}
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
                id="name"
                name="name"
                autoComplete="off"
                // autoFocus
                error={errorObj.name ? true : false}
                helperText={errorObj.name ? errorObj.name : 'Örn: "Poz Tipi" veya "Zemin Alanı"'}
                // margin="dense"
                label="Başlık"
                type="text"
                fullWidth
              />
            </Box>


            {/* poz bilgi veri türü seçimi */}
            <Box
              onClick={() => setErrorObj(prevData => {
                const errorObj = { ...prevData }
                delete errorObj["veriTuruId"]
                return errorObj
              })}
              sx={{ minWidth: 120, marginTop: "2rem", marginBottom: "1rem" }}
            >

              <InputLabel
                error={errorObj.veriTuruId ? true : false}
                id="veriTuruId"
              >
                <Grid container justifyContent="space-between">
                  <Grid item> Veri Türü </Grid>
                </Grid>
              </InputLabel>

              <Select
                error={errorObj.veriTuruId ? true : false}
                variant="standard"
                fullWidth
                labelId="veriTuruId"
                id="select-verıTuruId"
                value={veriTuruId ? veriTuruId : ""}
                label="Poz için tip seçiniz"
                onChange={handleChange_veriTuruId}
                required
                name="veriTuruId"
              // disabled={true}
              >
                {
                  selectedProje?.veriTurleri?.map((oneVeriTuru, index) => (
                    <MenuItem key={index} value={oneVeriTuru.id}>
                      {/* {console.log(oneVeriTuru)} */}
                      {oneVeriTuru.name}
                    </MenuItem>
                  ))
                }
              </Select>

            </Box>


            {/* sayı verisi girince biriminin yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setErrorObj(prevData => {
                const newData = { ...prevData }
                delete newData["birim"]
                return newData
              })}
              sx={{ display: veriTuruId == "sayi" ? "block" : "none", minWidth: 120 }}
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
                id="birim"
                name="birim"
                autoComplete="off"
                // autoFocus
                error={errorObj.birim ? true : false}
                helperText={errorObj.birim ? errorObj.birim : 'Örn:  m2 - TL - Gün - Ad.'}
                // margin="dense"
                label="Birim"
                type="text"
                fullWidth
              />
            </Box>



            {/* virgülden sonra gösterilecek hane sayısı seçimi*/}
            <Box
              onClick={() => setErrorObj(prevData => {
                const errorObj = { ...prevData }
                delete errorObj["haneSayisiId"]
                return errorObj
              })}
              sx={{ display: veriTuruId == "sayi" ? "block" : "none", minWidth: 120, marginTop: "2rem", marginBottom: "1rem" }}
            >

              <InputLabel
                error={errorObj.haneSayisiId ? true : false}
                id="haneSayisiId"
              >
                <Grid container justifyContent="space-between">
                  <Grid item> Hane Sayısı </Grid>
                </Grid>
              </InputLabel>

              <Select
                error={errorObj.haneSayisiId ? true : false}
                variant="standard"
                fullWidth
                labelId="haneSayisiId"
                id="select-hanesayisiId"
                value={haneSayisiId ? haneSayisiId : ""}
                label="Gösterilecek hane sayısını seçiniz"
                onChange={handleChange_haneSayisiId}
                required
                name="haneSayisiId"
              // disabled={true}
              >
                {
                  selectedProje?.haneSayilari?.map((oneHaneSayisi, index) => (
                    <MenuItem key={index} value={oneHaneSayisi.id}>
                      {/* {console.log(oneHaneSayisi)} */}
                      {oneHaneSayisi.name}
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