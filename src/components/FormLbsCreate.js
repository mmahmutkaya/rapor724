import { useState } from 'react';
import { useApp } from "./useApp.js";
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from '../components/general/DialogWindow';


//mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { Typography } from '@mui/material';


export default function P_FormLbsCreate({ setShow, isProject, setIsProject, selectedLbs, setSelectedLbs }) {

  // proje ve _id si yoksa lbs oluşturma formunu göstermenin bir anlamı yok, hata vererek durduruyoruz
  if (!isProject?._id) {
    throw new Error("Lbs oluşturulacak projenin database kaydı için ProjeId belirtilmemiş, sayfayı yeniden yükleyin, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const [error_for_lbsName, setError_for_lbsName] = useState(false)
  const [errorText_for_lbsName, setErrorText_for_lbsName] = useState()

  const [error_for_lbsCodeName, setError_for_lbsCodeName] = useState(false)
  const [errorText_for_lbsCodeName, setErrorText_for_lbsCodeName] = useState()

  const RealmApp = useApp();

  const callBack_m = () => setShow()



  async function handleSubmit(event) {

    event.preventDefault();
    let isError = false

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const lbsName = deleteLastSpace(data.get('lbsName'))
      const lbsCodeName = deleteLastSpace(data.get('lbsCodeName'))

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsName) {
        setError_for_lbsName(true);
        setErrorText_for_lbsName("Zorunlu")
        isError = true
        console.log("lbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsCodeName) {
        setError_for_lbsCodeName(true);
        setErrorText_for_lbsCodeName("Zorunlu")
        isError = true
        console.log("lbsCodeName", "yok -- error")
      }

      if (lbsCodeName.includes(" ") ) {
        setError_for_lbsCodeName(true);
        setErrorText_for_lbsCodeName("Boşluk kullanmayınız")
        isError = true
        console.log("lbsCodeName", "yok -- error")
      }

      // ilgili hatalar yukarıda ilgili form alanlarına yazılmış olmalı
      // db ye sorgu yapılıp db meşgul edilmesin diye burada durduruyoruz
      // frontendden geçse bile db den errorFormObject kontrolü yapılıyor aşağıda
      if (isError) {
        console.log("bu satırın altında fonksiyon --return-- ile durduruldu")
        return
      }



      const newLbsItem = {
        projectId: isProject._id,
        upLbsId: selectedLbs ? selectedLbs._id : "0",
        newLbsName: lbsName,
        newLbsCodeName: lbsCodeName
      }

      const resultProject = await RealmApp.currentUser.callFunction("createLbs", newLbsItem);

      // eğer gönderilen form verilerinde hata varsa db den gelen form validation mesajları form içindeki ilgili alanlarda gösterilir ve fonksiyon durdurulur
      // yukarıda da frontend kontrolü yapılmıştı
      if (resultProject.errorFormObj) {

        const errorFormObj = resultProject.errorFormObj

        console.log("errorFormObj", errorFormObj)

        // başka form alanları olsaydı onlarınkini de ekleyecektik aşağıdaki returnden önce, onlarda da hata uyarılarını görecektik
        if (errorFormObj.newLbsName) {
          setError_for_lbsName(true);
          setErrorText_for_lbsName(errorFormObj.newLbsName)
          isError = true
        }

        // başka form alanları olsaydı onlarınkini de ekleyecektik aşağıdaki returnden önce, onlarda da hata uyarılarını görecektik
        if (errorFormObj.newLbsCodeName) {
          setError_for_lbsCodeName(true);
          setErrorText_for_lbsCodeName(errorFormObj.newLbsCodeName)
          isError = true
        }

        return
      }


      // _id yoksa istediğimiz proje verisi değil demekki, hata ile durduruyoruz
      if (!resultProject._id) {
        throw new Error("db den Proje olarak beklenen verinin _id property yok, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


      // yukarıdaki yapılan _id kontrolü tamamsa bu veri db de kaydolmuş demektir, refetch() yapıp db yi yormaya gerek yok
      setIsProject(resultProject)

      // sorgu işleminden önce seçilen lbs varsa, temizliyoruz, en büyük gerekçe seçilen lbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedLbs(null)

      setShow()

      return

      // setShowDialogSuccess("Lbs kaydı başarı ile gerçekleşti")

    } catch (err) {

      console.log(err)
      let hataMesaj_ = err?.message ? err.message : "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."

      let text1 = "__mesajBaslangic__"
      let text2 = "__mesajBitis__"
      let mesajBaslangic = hataMesaj_.includes(text1) ? hataMesaj_.indexOf(text1) + text1.length : 0
      let mesajBitis = hataMesaj_.includes(text2) ? hataMesaj_.indexOf(text2) : hataMesaj_.length
      // console.log(hataMesaj_.slice(mesajBaslangic + "mesajBaslangic:".length, mesajBitis))
      hataMesaj_ = hataMesaj_.slice(mesajBaslangic, mesajBitis)
      console.log(hataMesaj_)

      // eğer çifte kayıt oluyorsa form içindeki mahal ismi girilen yere aşağıdaki mesaj gönderilir, fonksiyon durdurulur
      // form sayfası kapanmadan hata gösterimi
      if (hataMesaj_.includes("duplicate key error")) {
        setError_for_lbsName(true);
        setErrorText_for_lbsName("Aynı seviyede, aynı isimde lbs olamaz")
        console.log("Aynı seviyede, aynı isimde lbs olamaz")
        return
      }

      setDialogCase("error")
      setShowDialog(hataMesaj_)

    }

  }


  return (
    <div>

      {showDialog &&
        <DialogWindow dialogCase={dialogCase} showDialog={showDialog} setShowDialog={setShowDialog} afterDone={callBack_m} />
      }

      <Dialog
        PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
        open={true}
        onClose={() => setShow()} >
        {/* <DialogTitle>Subscribe</DialogTitle> */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

          <DialogContent>

            <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
              {/* <Typography sx> */}
              Lbs Oluştur
              {/* </Typography> */}
            </DialogContentText>

            {selectedLbs &&
              <>
                <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                  {selectedLbs.code} {"-->"} {selectedLbs.name}
                </DialogContentText>
                <Typography >
                  başlığı altına yeni bir Lbs eklemek üzeresiniz.
                </Typography>
              </>
            }

            {!selectedLbs &&
              <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                {/* <Typography > */}
                En üst düzeye yeni bir Lbs eklemek üzeresiniz.
                {/* </Typography> */}
              </DialogContentText>
            }

            <Box onClick={() => setError_for_lbsName(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}

                margin="normal"
                id="lbsName"
                name="lbsName"
                autoFocus
                error={error_for_lbsName}
                helperText={error_for_lbsName ? errorText_for_lbsName : ""}
                // margin="dense"
                label="Lbs Adı"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setError_for_lbsCodeName(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}

                margin="normal"
                id="lbsCodeName"
                name="lbsCodeName"
                // autoFocus
                error={error_for_lbsCodeName}
                helperText={error_for_lbsCodeName ? errorText_for_lbsCodeName : "Örnek : KABA İNŞAAT --> KAB"}
                // margin="dense"
                label="Lbs Kod Adı"
                type="text"
                fullWidth
              />
            </Box>

          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow()}>İptal</Button>
            <Button type="submit">Oluştur</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div >
  );


}