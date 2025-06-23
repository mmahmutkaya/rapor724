import { useState, useContext } from 'react';
import { StoreContext } from '../components/store.js'
import { useApp } from "./useApp.js";
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogAlert } from './general/DialogAlert.js'


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


export default function P_FormLbsCreate({ setShow, selectedLbs, setSelectedLbs }) {

  const { RealmApp, selectedProje, setSelectedProje } = useContext(StoreContext)

  if (!selectedProje?._id) {
    throw new Error("Lbs oluşturulacak projenin database kaydı için _projeId belirtilmemiş, sayfayı yeniden yükleyin, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  const [dialogAlert, setDialogAlert] = useState(false)

  const [lbsName, setLbsName] = useState()
  const [lbsCodeName, setLbsCodeName] = useState()

  const [lbsNameError, setLbsNameError] = useState()
  const [lbsCodeNameError, setLbsCodeNameError] = useState()

  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const lbsName = deleteLastSpace(data.get('lbsName'))
      const lbsCodeName = deleteLastSpace(data.get('lbsCodeName'))


      let isError = false

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsName) {
        setLbsNameError("Zorunlu")
        isError = true
        console.log("lbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!lbsCodeName) {
        setLbsCodeNameError("Zorunlu")
        isError = true
        console.log("lbsCodeName", "yok -- error")
      }

      if (lbsCodeName.includes(" ")) {
        ;
        setLbsCodeNameError("Boşluk kullanmayınız")
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
        _projeId: selectedProje._id,
        upLbsId: selectedLbs ? selectedLbs._id : "0",
        newLbsName: lbsName,
        newLbsCodeName: lbsCodeName
      }

      const result = await RealmApp.currentUser.callFunction("collection_projeler__lbs", { functionName: "createLbs", ...newLbsItem });

      // console.log("result", result)
      if (result.errorObject) {
        setLbsNameError(result.errorObject.lbsNameError)
        setLbsCodeNameError(result.errorObject.lbsCodeNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }


      if (result.lbs) {
        setSelectedProje(proje => {
          proje.lbs = result.lbs
          return proje
        })
      }

      // sorgu işleminden önce seçilen lbs varsa, temizliyoruz, en büyük gerekçe seçilen lbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedLbs(null)

      setShow()

      return

      // setShowDialogSuccess("Lbs kaydı başarı ile gerçekleşti")

    } catch (err) {

      console.log(err)

      let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
      if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
        let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
        let mesajBitis = err.message.indexOf("__mesajBitis__")
        dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
      }

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage,
        detailText: err?.message ? err.message : null
      })

      return

    }

  }


  return (
    <div>


      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
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

            <Box onClick={() => setLbsNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                onChange={(e) => setLbsName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={lbsName}
                margin="normal"
                id="lbsName"
                name="lbsName"
                autoFocus
                error={lbsNameError ? true : false}
                helperText={lbsNameError ? lbsNameError : ""}
                // margin="dense"
                label="Lbs Adı"
                type="text"
                fullWidth
              />
            </Box>

            <Box onClick={() => setLbsCodeNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                onChange={(e) => setLbsCodeName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={lbsCodeName}
                margin="normal"
                id="lbsCodeName"
                name="lbsCodeName"
                // autoFocus
                error={lbsCodeNameError ? true : false}
                helperText={lbsCodeNameError ? lbsCodeNameError : "Örnek : KABA İNŞAAT --> KAB"}
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