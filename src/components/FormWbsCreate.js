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


export default function P_FormWbsCreate({ setShow, selectedWbs, setSelectedWbs }) {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  if (!selectedProje?._id) {
    throw new Error("Wbs oluşturulacak projenin database kaydı için _projeId belirtilmemiş, sayfayı yeniden yükleyin, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
  }

  const [dialogAlert, setDialogAlert] = useState(false)

  const [wbsName, setWbsName] = useState()
  const [wbsCodeName, setWbsCodeName] = useState()

  const [wbsNameError, setWbsNameError] = useState()
  const [wbsCodeNameError, setWbsCodeNameError] = useState()

  const RealmApp = useApp();

  async function handleSubmit(event) {

    event.preventDefault();

    try {

      // girilen verileri alma ve sonlarındaki boşlukları kaldırma
      const data = new FormData(event.currentTarget);
      const wbsName = deleteLastSpace(data.get('wbsName'))
      const wbsCodeName = deleteLastSpace(data.get('wbsCodeName'))


      let isError = false

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsName) {
        setWbsNameError("Zorunlu")
        isError = true
        console.log("wbsName", "yok -- error")
      }

      // bu kısımda frontend kısmında form validation hatalarını ilgili alanlarda gösterme işlemleri yapılır, aşağıda backend de
      if (!wbsCodeName) {
        setWbsCodeNameError("Zorunlu")
        isError = true
        console.log("wbsCodeName", "yok -- error")
      }

      if (wbsCodeName.includes(" ")) {
        ;
        setWbsCodeNameError("Boşluk kullanmayınız")
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
        _projeId: selectedProje._id,
        upWbsId: selectedWbs ? selectedWbs._id : "0",
        newWbsName: wbsName,
        newWbsCodeName: wbsCodeName
      }

      const result = await RealmApp.currentUser.callFunction("collection_projeler__wbs", { functionName: "createWbs", ...newWbsItem });

      // console.log("result", result)
      if (result.errorObject) {
        setWbsNameError(result.errorObject.wbsNameError)
        setWbsCodeNameError(result.errorObject.wbsCodeNameError)
        console.log("backend den gelen hata ile durdu")
        return
      }


      if (result.wbs) {
        setSelectedProje(proje => {
          proje.wbs = result.wbs
          return proje
        })
      }

      // sorgu işleminden önce seçilen wbs varsa, temizliyoruz, en büyük gerekçe seçilen wbs silinmiş olabilir, onunla işlem db de hata verir
      setSelectedWbs(null)

      setShow()

      return

      // setShowDialogSuccess("Wbs kaydı başarı ile gerçekleşti")

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
              Wbs Oluştur
              {/* </Typography> */}
            </DialogContentText>

            {selectedWbs &&
              <>
                <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                  {selectedWbs.code} {"-->"} {selectedWbs.name}
                </DialogContentText>
                <Typography >
                  başlığı altına yeni bir Wbs eklemek üzeresiniz.
                </Typography>
              </>
            }

            {!selectedWbs &&
              <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                {/* <Typography > */}
                En üst düzeye yeni bir Wbs eklemek üzeresiniz.
                {/* </Typography> */}
              </DialogContentText>
            }


            <Box onClick={() => setWbsCodeNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                onChange={(e) => setWbsCodeName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={wbsCodeName}
                margin="normal"
                id="wbsCodeName"
                name="wbsCodeName"
                // autoFocus
                error={wbsCodeNameError ? true : false}
                helperText={wbsCodeNameError ? wbsCodeNameError : "Örnek : KABA İNŞAAT --> KAB"}
                // margin="dense"
                label="Wbs Kod Adı"
                type="text"
                fullWidth
              />
            </Box>


            <Box onClick={() => setWbsNameError(false)}>
              <TextField
                variant="standard"
                // InputProps={{ sx: { height:"2rem", fontSize: "1.5rem" } }}
                onChange={(e) => setWbsName(() => e.target.value.replace("i", "İ").toUpperCase())}
                value={wbsName}
                margin="normal"
                id="wbsName"
                name="wbsName"
                autoFocus
                error={wbsNameError ? true : false}
                helperText={wbsNameError ? wbsNameError : ""}
                // margin="dense"
                label="Wbs Adı"
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