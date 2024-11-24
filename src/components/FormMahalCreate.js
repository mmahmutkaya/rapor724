import { useApp } from "./useApp.js";
import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from './general/DialogWindow';


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


export default function FormMahalCreate({setShow}) {


  const { isProject, setIsProject } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const [newMahalError, setNewMahalError] = useState(false)

  // form verilerinde kullanmak için oluşturulan useState() verileri
  // form ilk açıldığında önceden belirlenen birşeyin seçilmiş olması için alttaki satırdaki gibi yapılabiliyor
  // const [mahalTipi, setMahalTipi] = useState(isProject ? isProject.mahalTipleri.find(item => item.id === "direktMahalListesi") : "");
  const [lbsId, setLbsId] = useState();

  const RealmApp = useApp();

  // mahal oluşturma fonksiyonu
  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // formdan gelen text verilerini alma - (çoktan seçmeliler seçildiği anda useState() kısmında güncelleniyor)
      const data = new FormData(event.currentTarget);
      const mahalName = deleteLastSpace(data.get('mahalName'))
      const mahalKod = deleteLastSpace(data.get('mahalKod'))

      const newMahal = {
        projectId: isProject?._id,
        lbsId,
        mahalKod,
        mahalName,
      }

      // veri düzeltme
      console.log("newMahal", newMahal)

      ////// form validation - frontend

      let isFormError = false
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      if (typeof newMahal.projectId !== "object") {
        setDialogCase("error")
        setShowDialog("Mahal kaydı için gerekli olan  'projectId' verisinde hata tespit edildi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
        console.log("kayıt için gerekli olan 'projectId' verisinde hata olduğu için bu satırın altında durduruldu")
        return
      }

      // form alanına uyarı veren hatalar

      if (typeof newMahal.lbsId !== "object") {
        setNewMahalError(prev => ({ ...prev, lbsId: "Zorunlu" }))
        isFormError = true
      }


      if (typeof newMahal.mahalName !== "string") {
        setNewMahalError(prev => ({ ...prev, mahalName: "Zorunlu" }))
        isFormError = true
      }

      if (typeof newMahal.mahalName === "string") {
        if (newMahal.mahalName.length === 0) {
          setNewMahalError(prev => ({ ...prev, mahalName: "Zorunlu" }))
          isFormError = true
        }
      }

      if (typeof newMahal.mahalName === "string") {
        let minimumHaneSayisi = 3
        if (newMahal.mahalName.length > 0 && newMahal.mahalName.length < minimumHaneSayisi) {
          setNewMahalError(prev => ({ ...prev, mahalName: `${minimumHaneSayisi} haneden az olamaz` }))
          isFormError = true
        }
      }

      let mahalFinded = mahaller.find(item => item.kod == newMahal.mahalKod)
      if (mahalFinded) {
        setNewMahalError(prev => ({ ...prev, mahalKod: `'${mahalFinded.name}' isimli mahalde bu kod kullanılmış` }))
        isFormError = true
      }


      // form alanına uyarı veren hatalar olmuşsa burda durduralım
      if (isFormError) {
        console.log("form validation - hata - frontend")
        return
      }


      // form verileri kontrolden geçti - db ye göndermeyi deniyoruz
      const result = await RealmApp?.currentUser?.callFunction("createMahal", newMahal);
      console.log("result", result)

      // form validation - backend
      if (result.newMahalError) {
        setNewMahalError(result.newMahalError)
        console.log("result.newMahalError", result.newMahalError)
        console.log("form validation - hata - backend")
        return
      }
      console.log("form validation - hata yok - backend")

      if (!result.newMahal?._id) {
        throw new Error("db den -newMahal- ve onun da -_id-  property dönmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }

      if (!result.newProject?._id) {
        throw new Error("db den -newProject- ve onun da -_id-  property dönmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }

      setMahaller(oldMahaller => [...oldMahaller, result.newMahal])
      setIsProject(result.newProject)
      setShow("Main")

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.."

      // eğer çifte kayıt oluyorsa form içindeki mahal ismi girilen yere aşağıdaki mesaj gönderilir, fonksiyon durdurulur
      if (hataMesaj_.includes("duplicate key error")) {
        setNewMahalError(prev => ({ ...prev, mahalName: "Bu mahal ismi kullanılmış" }))
        console.log("Bu mahal ismi bu projede mevcut")
        return
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }

  }


  // form verilerini kullanıcıdan alıp react hafızasına yüklemek - onChange - sadece seçmeliler - yazma gibi şeyler formun submit olduğu anda yakalanıyor
  const handleChange_lbs = (event) => {
    setLbsId(isProject.lbs.find(item => item._id.toString() === event.target.value.toString())._id);
  };


  // aşağıda kullanılıyor
  let lbsCode
  let lbsName

  return (
    <div>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => {
          console.log("deneme")
          setShow("Main")
        }}
      >
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
              onClick={() => setNewMahalError(prevData => {
                const newData = { ...prevData }
                delete newData["lbsId"]
                return newData
              })}
              sx={{ minWidth: 120, marginBottom: "0rem" }}
            >

              <InputLabel
                error={newMahalError.lbsId ? true : false}
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
                error={newMahalError.lbsId ? true : false}
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
                  isProject?.lbs?.filter(item => item.openForMahal)
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

                        {lbsName.split(">").map((item, index) => (

                          <Box key={index} component={"span"} >
                            {item}
                            {index + 1 !== lbsName.split(">").length &&
                              <Box component={"span"} ml={0.1} mr={0.3}>{"--"}</Box>
                            }
                          </Box>

                        ))}

                      </MenuItem>
                    ))
                }

              </Select>

            </Box>



            {/* mahal kodunun yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setNewMahalError(prevData => {
                const newData = { ...prevData }
                delete newData["mahalKod"]
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
                id="mahalKod"
                name="mahalKod"
                // autoFocus
                error={newMahalError.mahalKod ? true : false}
                helperText={newMahalError.mahalKod}
                // margin="dense"
                label="Mahal Kod"
                type="text"
                fullWidth
              />
            </Box>


            {/* mahal isminin yazıldığı alan */}
            {/* tıklayınca setShowDialogError(false) çalışmasının sebebi -->  error vermişse yazmaya başlamak için tıklayınca error un silinmesi*/}
            <Box
              onClick={() => setNewMahalError(prevData => {
                const newData = { ...prevData }
                delete newData["mahalName"]
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
                id="mahalName"
                name="mahalName"
                // autoFocus
                error={newMahalError.mahalName ? true : false}
                helperText={newMahalError.mahalName}
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