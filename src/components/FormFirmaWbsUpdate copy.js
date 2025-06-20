import { useState, useContext } from 'react';
import { StoreContext } from '../components/store.js'
import { useApp } from "./useApp.js";
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from './general/DialogWindow.js';


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


export default function P_FormWbsEdit({ setShow, selectedWbs, setSelectedWbs }) {

  const { selectedFirma, setSelectedFirma } = useContext(StoreContext)


  // proje ve _id si yoksa wbs oluşturma formunu göstermenin bir anlamı yok, hata vererek durduruyoruz
  if (!selectedFirma?._id) {
    throw new Error("Wbs oluşturulacak projenin database kaydı için ProjeId belirtilmemiş, sayfayı yeniden yükleyin, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  const [showDialog, setShowDialog] = useState(false)
  const [dialogCase, setDialogCase] = useState("")

  const [error_for_wbsName, setError_for_wbsName] = useState(false)
  const [errorText_for_wbsName, setErrorText_for_wbsName] = useState()

  const [error_for_wbsCodeName, setError_for_wbsCodeName] = useState(false)
  const [errorText_for_wbsCodeName, setErrorText_for_wbsCodeName] = useState()

  const RealmApp = useApp();

  const callBack_m = () => setShow()



  async function handleSubmit(event) {

    event.preventDefault();
    let isError = false

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const wbsName = deleteLastSpace(data.get('wbsName'))
      const wbsCodeName = deleteLastSpace(data.get('wbsCodeName'))

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsName) {
        setError_for_wbsName(true);
        setErrorText_for_wbsName("Zorunlu")
        isError = true
        console.log("wbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsCodeName) {
        setError_for_wbsCodeName(true);
        setErrorText_for_wbsCodeName("Zorunlu")
        isError = true
        console.log("wbsCodeName", "yok -- error")
      }

      if (wbsCodeName.includes(" ") ) {
        setError_for_wbsCodeName(true);
        setErrorText_for_wbsCodeName("Boşluk kullanmayınız")
        isError = true
        console.log("wbsCodeName", "yok -- error")
      }

      // ilgili hatalar yukarıda ilgili form alanlarına yazılmış olmalı
      // db ye sorgu yapılıp db meşgul edilmesin diye burada durduruyoruz
      // frontendden geçse bile db den errorFormObject kontrolü yapılıyor aşağıda
      if (isError) {
        console.log("bu satırın altında fonksiyon --return-- ile durduruldu")
        return
      }



      // yukarıdaki yapılan _id kontrolü tamamsa bu veri db de kaydolmuş demektir, refetch_pozlar() yapıp db yi yormaya gerek yok
      // useQuery ile oluşturduğumuz pozlar cash datamızı güncelliyoruz
      // sorgudan wbs datası güncellenmiş proje dödürüp, gelen data ile aşağıda react useContext deki projeyi update ediyoruz
      const newWbsItem = {
        projectId: selectedFirma._id,
        wbsId:selectedWbs._id,
        newWbsName: wbsName,
        newWbsCodeName: wbsCodeName
      }

      const result = await RealmApp.currentUser.callFunction("updateWbs", newWbsItem);

      // eğer gönderilen form verilerinde hata varsa db den gelen form validation mesajları form içindeki ilgili alanlarda gösterilir ve fonksiyon durdurulur
      // yukarıda da frontend kontrolü yapılmıştı
      if (result.errorFormObj) {

        const errorFormObj = result.errorFormObj

        console.log("errorFormObj", errorFormObj)

        // başka form alanları olsaydı onlarınkini de ekleyecektik aşağıdaki returnden önce, onlarda da hata uyarılarını görecektik
        if (errorFormObj.newWbsName) {
          setError_for_wbsName(true);
          setErrorText_for_wbsName(errorFormObj.newWbsName)
          isError = true
        }

        // başka form alanları olsaydı onlarınkini de ekleyecektik aşağıdaki returnden önce, onlarda da hata uyarılarını görecektik
        if (errorFormObj.newWbsCodeName) {
          setError_for_wbsCodeName(true);
          setErrorText_for_wbsCodeName(errorFormObj.newWbsCodeName)
          isError = true
        }

        return
      }


      // _id yoksa istediğimiz proje verisi değil demekki, hata ile durduruyoruz
      if (!result.project._id) {
        throw new Error("db den Proje olarak beklenen verinin _id property yok, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


      // yukarıdaki yapılan _id kontrolü tamamsa bu veri db de kaydolmuş demektir, refetch_pozlar() yapıp db yi yormaya gerek yok
      // useQuery ile oluşturduğumuz pozlar cash datamızı güncelliyoruz
      setSelectedFirma(result.project)

      // sorgu işleminden önce seçilen wbs varsa, temizliyoruz, en büyük gerekçe seçilen wbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedWbs(null)

      setShow()

      return

      // setShowDialogSuccess("Wbs kaydı başarı ile gerçekleşti")

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

      // eğer çifte kayıt oluyorsa form içindeki poz ismi girilen yere aşağıdaki mesaj gönderilir, fonksiyon durdurulur
      // form sayfası kapanmadan hata gösterimi
      if (hataMesaj_.includes("duplicate key error")) {
        setError_for_wbsName(true);
        setErrorText_for_wbsName("Aynı seviyede, aynı isimde wbs olamaz")
        console.log("Aynı seviyede, aynı isimde wbs olamaz")
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
              Wbs Güncele
              {/* </Typography> */}
            </DialogContentText>

            {/* {selectedWbs &&
              <>
                <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                  {selectedWbs.code} {"-->"} {selectedWbs.name}
                </DialogContentText>
                <Typography >
                  başlığı altına yeni bir Wbs eklemek üzeresiniz.
                </Typography>
              </>
            } */}

            {/* {!selectedWbs &&
              <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                En üst düzeye yeni bir Wbs eklemek üzeresiniz.
              </DialogContentText>
            } */}

            <Box onClick={() => setError_for_wbsName(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                defaultValue={selectedWbs.name}
                margin="normal"
                id="wbsName"
                name="wbsName"
                autoFocus
                error={error_for_wbsName}
                helperText={error_for_wbsName ? errorText_for_wbsName : ""}
                // margin="dense"
                label="Wbs Adı"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setError_for_wbsCodeName(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}

                defaultValue={selectedWbs.codeName}
                margin="normal"
                id="wbsCodeName"
                name="wbsCodeName"
                // autoFocus
                error={error_for_wbsCodeName}
                helperText={error_for_wbsCodeName ? errorText_for_wbsCodeName : "Örnek : KABA İNŞAAT --> KAB"}
                // margin="dense"
                label="Wbs Kod Adı"
                type="text"
                fullWidth
              />
            </Box>

          </DialogContent>

          <DialogActions sx={{ padding: "1.5rem" }}>
            <Button onClick={() => setShow()}>İptal</Button>
            <Button type="submit">Güncelle</Button>
          </DialogActions>

        </Box>
      </Dialog>
    </div >
  );


}