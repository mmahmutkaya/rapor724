
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { DialogSelectTip } from '../../components/general/DialogSelectTip.js';
import { DialogVersiyonTip } from '../../components/general/DialogVersiyonTip.js';
import _ from 'lodash';


import { StoreContext } from '../../components/store.js'
import { useGetPozlar } from '../../hooks/useMongo.js';

import FormPozCreate from '../../components/FormPozCreate.js'
import ShowHideBaslik from '../../components/ShowHideBaslik.js'
import ShowPozParaBirimleri from '../../components/ShowPozParaBirimleri.js'


import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

import CurrencyLiraIcon from '@mui/icons-material/CurrencyLira';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';




export default function P_BirimFiyat() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()
  const [showEminMisin_para, setShowEminMisin_para] = useState(false)


  const { data: dataPozlar, error, isLoading } = useGetPozlar()
  const { myTema, appUser, setAppUser } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)
  const { selectedBirimFiyatVersiyon, setSelectedBirimFiyatVersiyon } = useContext(StoreContext)

  console.log("selectedProje",selectedProje)
  const pozBirimleri = selectedProje?.pozBirimleri
  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false)


  const [show, setShow] = useState("Main")
  const [pozlar_state, setPozlar_state] = useState()
  const [pozlar_backUp, setPozlar_backUp] = useState()


  const [paraEdit, setParaEdit] = useState(false)
  const [isChanged_para, setIsChanged_para] = useState()

  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.birimfiyat.basliklar)

  const [paraBirimleri, setParaBirimleri] = useState()


  // yetkiler
  const [birimFiyatEditable, setBirimFiyatEditable] = useState()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setPozlar_state(_.cloneDeep(dataPozlar?.pozlar))
    setPozlar_backUp(_.cloneDeep(dataPozlar?.pozlar))
  }, [dataPozlar])



  // selectedProje değiştiğinde yetki modu değişsin
  // selectedProje değiştiğinde paraBirimleri değişsin
  useEffect(() => {

    setBirimFiyatEditable(selectedProje?.yetkiliKisiler.find(x => x.email == appUser.email).yetkiler.find(x => x.name === "birimFiyatEdit" || "owner"))

    setParaBirimleri(previousData => {
      let paraBirimleri = selectedProje?.paraBirimleri
      let userCustomParabirimleri = appUser.customSettings.pages.birimfiyat.paraBirimleri

      // kullanıcının firma tarafından yeni eklenen para birimlerinden haberdar olması için, kullnıcı özellikle gizlememişse para birimi görülsün
      paraBirimleri = paraBirimleri?.map(oneBirim => {
        oneBirim.isShow = true
        let oneBirim2 = userCustomParabirimleri.length > 0 && userCustomParabirimleri.find(x => x.id === oneBirim.id)
        if (oneBirim2) {
          if (!oneBirim.isActive && oneBirim2.isShow === false) {
            oneBirim.isShow = false
          }
        }
        return oneBirim
      })
      return paraBirimleri
    })

  }, [selectedProje])


  useEffect(() => {
    if (error) {
      console.log("error", error)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })
    }
  }, [error])


  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const show_aciklama = basliklar?.find(x => x.id === "aciklama").show
  const show_versiyon = basliklar?.find(x => x.id === "versiyon").show
  const show_versiyonAciklama = basliklar?.find(x => x.id === "versiyonAciklama").show
  const show_versiyondakiDegisimler = basliklar?.find(x => x.id === "versiyondakiDegisimler").show

  let paraBirimiAdet = paraBirimleri?.filter(x => x?.isShow).length

  const columns = `
    max-content
    minmax(min-content, 35rem) 
    max-content
    ${show_aciklama ? " 0.4rem minmax(min-content, 10rem)" : ""}
    ${show_versiyon ? " 0.4rem max-content" : ""}
    ${paraBirimiAdet === 1 ? " 0.4rem max-content" : paraBirimiAdet > 1 ? " 0.4rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
  `


  const requestProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {

    try {

      setSelectedBirimFiyatVersiyon()

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/requestprojeaktifyetkilikisi`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId, aktifYetki
        })
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


      if (responseJson.message) {
        setShow("Main")
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            queryClient.invalidateQueries(['dataPozlar'])
            setShow("Main")
            setDialogAlert()
          }
        })
      }


      if (responseJson.ok) {
        setShow("Main")
        queryClient.invalidateQueries(['dataPozlar'])
        setParaEdit(true)
      }

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }




  const deleteProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {

    try {

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/projeler/deleteprojeaktifyetkilikisi`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId, aktifYetki
        })
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

      if (responseJson.message) {
        setShow("Main")
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            setDialogAlert()
          }
        })
      }

      if (responseJson.ok) {
        setShow("Main")
        setParaEdit()
      }

    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }




  // Edit Poz Para Birimi Input Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = ({ birimFiyat, _onePozId, paraBirimiId }) => {

    let pozlar_state2 = _.cloneDeep(pozlar_state)

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    pozlar_state2.map(onePoz => {

      if (onePoz._id.toString() === _onePozId) {

        let theBirimFiyat = _.cloneDeep(onePoz.birimFiyatlar?.find(x => x.id === paraBirimiId))

        if (theBirimFiyat) {

          // yeni bir birim fiyat girilmemişse fonksiyon iptal
          if (Number(theBirimFiyat.fiyat) === Number(birimFiyat)) {

            return

          } else {

            // demekki yeni kayıt yapılacak, önce eskiyi kaldıralım
            onePoz.birimFiyatlar = onePoz.birimFiyatlar?.filter(x => x.id !== paraBirimiId)

            if (theBirimFiyat.hasOwnProperty("eskiFiyat")) {

              // yeniden kayıtlı son versiyondaki fiyata dönülmüşse isProgress kaldırılıyor, yoksa yeni kayıt yapılıyor ve db ye kaydedilecek
              if (Number(theBirimFiyat.eskiFiyat) === Number(birimFiyat)) {
                onePoz.birimFiyatlar = [...onePoz.birimFiyatlar, { id: paraBirimiId, fiyat: birimFiyat }]
              } else {
                onePoz.birimFiyatlar = [...onePoz.birimFiyatlar, { id: paraBirimiId, fiyat: birimFiyat, eskiFiyat: theBirimFiyat.eskiFiyat, isProgress: true }]
              }

            } else {
              onePoz.birimFiyatlar = [...onePoz.birimFiyatlar, { id: paraBirimiId, fiyat: birimFiyat, eskiFiyat: theBirimFiyat.fiyat, isProgress: true }]
            }

          }


        } else {
          onePoz.birimFiyatlar = [...onePoz.birimFiyatlar, { id: paraBirimiId, fiyat: birimFiyat, eskiFiyat: "", isProgress: true }]
        }

        onePoz.newSelected_para = true

        if (!isChanged_para) {
          setIsChanged_para(true)
        }

        // para birimi ilk defa kullanılıyorsa aktif edilecek, firma kullanıma kapatsa bile bu projede kullanılmaya devam edecek 
        let paraBirimleri2 = _.cloneDeep(paraBirimleri)
        paraBirimleri2 = paraBirimleri2.map(onePara => {
          if (onePara.id === paraBirimiId && !onePara.isActive) {
            onePara.isActive = true
            onePara.isChanged = true
          }
          return onePara
        })
        if (paraBirimleri2.find(onePara => onePara.isChanged)) {
          setParaBirimleri(paraBirimleri2)
        }

      }
      return onePoz

    })


    setPozlar_state(pozlar_state2)
  }


  const cancel_para = () => {
    setPozlar_state(_.cloneDeep(pozlar_backUp))
    setIsChanged_para()
    setParaEdit()
  }


  // Edit Metraj Sayfasının Fonksiyonu
  const save_para = async () => {

    if (isChanged_para) {
      try {

        let pozlar_newPara = pozlar_state.map(onePoz => {
          if (onePoz.newSelected_para) {
            return { _id: onePoz._id, birimFiyatlar: onePoz.birimFiyatlar }
          }
        })
        // undefined olanları temizliyoruz
        pozlar_newPara = pozlar_newPara.filter(x => x)

        const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/pozlar/birimfiyatlar`, {
          method: 'PATCH',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pozlar_newPara,
            projeId: selectedProje?._id,
            paraBirimleri: paraBirimleri.find(onePara => onePara.isChanged) ? paraBirimleri : null,
            birimFiyatVersiyon_isProgress: selectedProje.birimFiyatVersiyon_isProgress
          })
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


        if (responseJson.message) {
          setDialogAlert({
            dialogIcon: "info",
            dialogMessage: responseJson.message,
            onCloseAction: () => {
              queryClient.invalidateQueries(['dataPozlar'])
              setIsChanged_para()
              setParaEdit()
              setDialogAlert()
            }
          })
          return
        }


        if (!responseJson.ok) {
          throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
        }

        queryClient.invalidateQueries(['dataPozlar'])
        setIsChanged_para()
        // setParaEdit()

        return

      } catch (err) {

        console.log(err)

        setDialogAlert({
          dialogIcon: "warning",
          dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
          detailText: err?.message ? err.message : null,
          onCloseAction: () => {
            setDialogAlert()
          }
        })
      }
    }

  }





  const createVersiyon_birimFiyat = async ({ fieldText }) => {

    try {

      setSelectedBirimFiyatVersiyon()

      let pozlar_birimFiyat = pozlar_state.map(onePoz => {
        if (onePoz.birimFiyatlar.length > 0) {
          return { _id: onePoz._id, birimFiyatlar: onePoz.birimFiyatlar }
        }
      })
      // undefined olanları temizliyoruz
      pozlar_birimFiyat = pozlar_birimFiyat.filter(x => x)
      // console.log("pozlar_birimFiyat", pozlar_birimFiyat)

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/versiyon/birimfiyat`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId: selectedProje?._id,
          pozlar_birimFiyat,
          versiyonNumber: selectedBirimFiyatVersiyon?.versiyonNumber + 1,
          aciklama: fieldText
        })
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

      if (responseJson.message) {
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            queryClient.invalidateQueries(['dataPozlar'])
            setDialogAlert()
          }
        })
        return
      }

      if (responseJson.ok) {
        queryClient.invalidateQueries(['dataPozlar'])
        setParaEdit()
      } else {
        console.log("responseJson", responseJson)
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..")
      }


    } catch (err) {

      console.log(err)

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert()
          queryClient.invalidateQueries(['dataPozlar'])
        }
      })
    }
  }




  const enUstBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: myTema.renkler.baslik1,
    fontWeight: 600,
    border: "1px solid black",
    px: "0.7rem"
  }

  const wbsBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1.5rem",
  }

  const pozNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: "white",
    border: "1px solid black",
    px: "0.7rem"
  }



  // GENEL - bir fonksiyon, ortak kullanılıyor olabilir
  const ikiHane = (value) => {
    if (!value || value === "") {
      return value
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }


  let creatableBirimFiyatVersiyon
  if (pozlar_state?.length > 0 && !isChanged_para && selectedProje?.birimFiyatVersiyon_isProgress === true) {
    creatableBirimFiyatVersiyon = true
  }

  let wbsCode
  let wbsName
  let cOunt


  return (
    <Box sx={{ m: "0rem" }}>


      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
          actionText1={dialogAlert.actionText1 ? dialogAlert.actionText1 : null}
          action1={dialogAlert.action1 ? dialogAlert.action1 : null}
          actionText2={dialogAlert.actionText2 ? dialogAlert.actionText2 : null}
          action2={dialogAlert.action2 ? dialogAlert.action2 : null}
        />
      }


      {showEminMisin_para &&
        <DialogAlert
          dialogIcon={"warning"}
          dialogMessage={"Yaptığınız değişiklikleri kaybedeceksiniz ?"}
          onCloseAction={() => setShowEminMisin_para()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_para()}
          actionText2={"Onayla"}
          action2={() => {
            deleteProjeAktifYetkiliKisi({ projeId: selectedProje?._id, aktifYetki: "birimFiyatEdit" })
            cancel_para()
            setShowEminMisin_para()
          }}
        />
      }


      {showEminMisin_versiyon &&
        <DialogVersiyonTip
          dialogBaslikText={`Mevcut birim fiyatlar versiyon  (V${selectedBirimFiyatVersiyon?.versiyonNumber + 1}) olarak kaydedilsin mi?`}
          aciklamaBaslikText={"Versiyon hakkında bilgi verebilirsiniz"}
          aprroveAction={({ fieldText }) => {
            setShowEminMisin_versiyon()
            createVersiyon_birimFiyat({ fieldText })
          }}
          rejectAction={() => setShowEminMisin_versiyon()}
          onCloseAction={() => setShowEminMisin_versiyon()}
        />
      }


      {/* POZ OLUŞTURULACAKSA */}
      {show == "PozCreate" && <FormPozCreate setShow={setShow} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowHideBaslik" && <ShowHideBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} pageName={"birimfiyat"} dataName={"basliklar"} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowPozParaBirimleri" && <ShowPozParaBirimleri setShow={setShow} paraBirimleri={paraBirimleri} setParaBirimleri={setParaBirimleri} />}



      {/* BAŞLIK */}
      <Paper >

        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", minHeight: "3.5rem" }}
        >

          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              Pozlar
            </Typography>
          </Grid>


          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>

              {!paraEdit && selectedBirimFiyatVersiyon &&
                <>

                  <Box>
                    <IconButton onClick={() => setShow("ShowPozParaBirimleri")}>
                      <CurrencyLiraIcon variant="contained" />
                    </IconButton>
                  </Box>

                  <Box>
                    <IconButton onClick={() => setShow("ShowHideBaslik")} disabled={!anyBaslikShow}>
                      <VisibilityIcon variant="contained" />
                    </IconButton>
                  </Box>

                  {paraBirimiAdet > 0 && birimFiyatEditable && !paraEdit &&
                    <Box>
                      <IconButton onClick={() => requestProjeAktifYetkiliKisi({ projeId: selectedProje?._id, aktifYetki: "birimFiyatEdit" })}>
                        <EditIcon variant="contained" />
                      </IconButton>
                    </Box>
                  }

                  <Select
                    size='small'
                    value={selectedBirimFiyatVersiyon?.versiyonNumber}
                    onClose={() => {
                      setTimeout(() => {
                        document.activeElement.blur();
                      }, 0);
                    }}
                    // onBlur={() => queryClient.resetQueries(['dataPozlar'])}
                    sx={{ fontSize: "0.75rem" }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "15rem",
                          minWidth: "5rem"
                        },
                      },
                    }}
                  >

                    {selectedProje?.birimFiyatVersiyonlar.sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((oneVersiyon, index) => {
                      let versiyonNumber = oneVersiyon.versiyonNumber
                      return (
                        // <MenuItem sx={{ fontSize: "0.8rem" }} key={index} onClick={() => setSelectedBirimFiyatVersiyon(oneVersiyon)} value={versiyonNumber} > V{versiyonNumber} </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSelectedBirimFiyatVersiyon(oneVersiyon)
                            setTimeout(() => {
                              queryClient.resetQueries(['dataPozlar'])
                            }, 0);
                          }}
                          sx={{ fontSize: "0.75rem" }} key={index} value={versiyonNumber} > V{versiyonNumber}
                        </MenuItem>
                      )
                    })}

                  </Select>

                </>
              }

              {paraEdit && selectedBirimFiyatVersiyon &&

                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChanged_para) {
                        setShowEminMisin_para(true)
                      } else {
                        deleteProjeAktifYetkiliKisi({ projeId: selectedProje?._id, aktifYetki: "birimFiyatEdit" })
                        setParaEdit()
                      }
                    }} aria-label="lbsUncliced">
                      <ClearOutlined variant="contained" sx={{ color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Grid item >
                    <IconButton onClick={() => save_para()} disabled={!isChanged_para}>
                      <SaveIcon variant="contained" />
                    </IconButton>
                  </Grid>

                  <Box
                    onClick={() => creatableBirimFiyatVersiyon && setShowEminMisin_versiyon(true)}
                    sx={{ cursor: creatableBirimFiyatVersiyon && "pointer", mx: "0.3rem", py: "0.2rem", px: "0.3rem", border: creatableBirimFiyatVersiyon ? "1px solid red" : "1px solid black", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: "600", backgroundColor: "yellow" }}
                  >
                    V{selectedBirimFiyatVersiyon?.versiyonNumber + 1}
                  </Box>

                </>
              }

            </Box>
          </Grid>

        </Grid>

      </Paper >



      {/* SAYFA İÇERİĞİ - ALTERNATİF-1 */}
      {
        isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }


      {/* SAYFA İÇERİĞİ - ALTERNATİF-2 */}
      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {
        !isLoading && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmalı.
          </Alert>
        </Stack>
      }


      {/* SAYFA İÇERİĞİ - ALTERNATİF-3 */}
      {/* EĞER POZ YOKSA */}
      {
        !isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar_state?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmalı.
          </Alert>
        </Stack>
      }



      {/* SAYFA İÇERİĞİ - ALTERNATİF-4 */}
      {/* ANA SAYFA - POZLAR VARSA */}

      {
        !isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && pozlar_state?.length > 0 &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>


          {/*   EN ÜST BAŞLIK */}
          {/* <Box sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_enUstBaslik }}> */}
          <React.Fragment >

            {/* BAŞLIK - POZ NO */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz No
            </Box>

            {/* BAŞLIK - POZ İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz İsmi
            </Box>

            {/* BAŞLIK - POZ BİRİM  */}
            <Box sx={{ ...enUstBaslik_css, textWrap: "nowrap" }}>
              Birim
            </Box>

            {/* BAŞLIK - POZ BİRİM  */}
            {show_aciklama &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Açıklama
                </Box>
              </>
            }

            {/* BAŞLIK - VERSİYON */}
            {show_versiyon &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Versiyon
                </Box>
              </>
            }

            {/* PARA BİRİMLERİ */}
            {paraBirimiAdet > 0 &&
              <>
                <Box></Box>
                {paraBirimleri?.filter(x => x.isShow).map((oneBirim, index) => {
                  return (
                    <Box key={index} sx={{ ...enUstBaslik_css }}>
                      {oneBirim.id}
                    </Box>
                  )
                })}
              </>
            }

          </React.Fragment >





          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {selectedProje?.wbs.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞI */}



                {/* HAYALET */}
                <Box sx={{ display: "none" }}>
                  {cOunt = oneWbs.code.split(".").length}
                </Box>

                {
                  oneWbs.code.split(".").map((codePart, index) => {

                    if (index == 0 && cOunt == 1) {
                      wbsCode = codePart
                      wbsName = selectedProje?.wbs?.find(item => item.code == wbsCode).name
                    }

                    if (index == 0 && cOunt !== 1) {
                      wbsCode = codePart
                      wbsName = selectedProje?.wbs?.find(item => item.code == wbsCode).codeName
                    }

                    if (index !== 0 && index + 1 !== cOunt && cOunt !== 1) {
                      wbsCode = wbsCode + "." + codePart
                      wbsName = wbsName + " > " + selectedProje?.wbs?.find(item => item.code == wbsCode).codeName
                    }

                    if (index !== 0 && index + 1 == cOunt && cOunt !== 1) {
                      wbsCode = wbsCode + "." + codePart
                      wbsName = wbsName + " > " + selectedProje?.wbs?.find(item => item.code == wbsCode).name
                    }

                  })
                }

                {/* wbsName hazır aslında ama aralarındaki ok işaretini kırmızıya boyamak için */}
                <Box sx={{ gridColumn: "1/4", ...wbsBaslik_css, display: "grid", gridAutoFlow: "column", justifyContent: "start", columnGap: "0.2rem", textWrap: "nowrap", pr: "1rem" }} >

                  {wbsName.split(">").map((item, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{}}>{item}</Box>
                      {index + 1 !== wbsName.split(">").length &&
                        <Box sx={{ color: myTema.renkler.baslik2_ayrac }} >{">"}</Box>
                      }
                    </React.Fragment>
                  ))}

                  {/* <Box>deneme</Box> */}
                  {/* <Typography>{wbsName}</Typography> */}
                </Box>




                {/* BAŞLIK - AÇIKLAMA  */}
                {show_aciklama &&
                  <>
                    <Box></Box>
                    <Box sx={{ ...wbsBaslik_css }} />
                  </>
                }

                {/* BAŞLIK - VERSİYON */}
                {show_versiyon &&
                  <>
                    <Box />
                    <Box sx={{ ...wbsBaslik_css }} />
                  </>
                }

                {/* PARA BİRİMLERİ */}
                {paraBirimiAdet > 0 &&
                  <>
                    <Box></Box>
                    {paraBirimleri?.filter(x => x.isShow).map((oneBirim, index) => {
                      return (
                        <Box key={index} sx={{ ...wbsBaslik_css }}>

                        </Box>
                      )
                    })}
                  </>
                }



                {/* WBS'İN POZLARI */}
                {pozlar_state?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  return (
                    // <Box key={index} sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_pozSatir }}>
                    <React.Fragment key={index}>
                      <Box sx={{ ...pozNo_css }}>
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, pl: "0.5rem", justifyItems: "start" }}>
                        {onePoz.pozName}
                      </Box>
                      <Box sx={{ ...pozNo_css }}>
                        {pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
                      </Box>

                      {/* BAŞLIK - POZ BİRİM  */}
                      {show_aciklama &&
                        <>
                          <Box></Box>
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.aciklama}
                          </Box>
                        </>
                      }

                      {/* BAŞLIK - VERSİYON */}
                      {show_versiyon &&
                        <>
                          <Box />
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.versiyon}
                          </Box>
                        </>
                      }

                      {/* PARA BİRİMLERİ */}
                      {paraBirimiAdet > 0 &&
                        <>
                          <Box></Box>
                          {paraBirimleri?.filter(x => x.isShow).map((oneBirim, index) => {

                            let theBirimFiyat
                            if (!paraEdit) {
                              theBirimFiyat = onePoz.birimFiyatVersiyonlar.birimFiyatlar?.find(x => x.id === oneBirim.id)
                            } else {
                              theBirimFiyat = onePoz.birimFiyatlar?.find(x => x.id === oneBirim.id)
                            }

                            if (!paraEdit) {
                              return (
                                <Box key={index} sx={{ ...pozNo_css, justifyContent: "end", minWidth: "6rem", backgroundColor: show_versiyondakiDegisimler && theBirimFiyat?.isProgress && "rgba(217, 255, 0, 0.33)" }}>
                                  {ikiHane(theBirimFiyat?.fiyat)}
                                </Box>
                              )
                            } else {
                              return (
                                <Box key={onePoz._id.toString() + index} sx={{ ...pozNo_css, width: "8rem", backgroundColor: theBirimFiyat?.isProgress ? "yellow" : "rgba(255,255,0, 0.3)" }}>

                                  <Input
                                    // autoFocus={autoFocus.baslikId == oneBaslik.id && autoFocus.mahalId == oneMahal._id.toString()}
                                    // autoFocus={autoFocus.mahalId == oneMahal._id.toString()}
                                    // autoFocus={true}
                                    autoComplete='off'
                                    id={onePoz._id.toString() + index}
                                    name={onePoz._id.toString() + index}
                                    // readOnly={oneRow.isSelected}
                                    disableUnderline={true}
                                    // size="small"
                                    type={"number"}
                                    // type={"text"}
                                    // onChange={(e) => parseFloat(e.target.value).toFixed(1)}
                                    // onKeyDown={(evt) => ilaveYasaklilar.some(elem => evt.target.value.includes(elem)) && ilaveYasaklilar.find(item => item == evt.key) && evt.preventDefault()}
                                    // onKeyDown={oneProperty.includes("carpan") ? (event) => handle_input_onKey(event) : null}
                                    onKeyDown={(event) => handle_input_onKey(event)}
                                    onChange={(event) => handle_input_onChange({ birimFiyat: event.target.value, _onePozId: onePoz._id.toString(), paraBirimiId: oneBirim.id })}
                                    sx={{
                                      // height: "100%",
                                      // pt: "0.3rem",
                                      // color: isMinha ? "red" : null,
                                      // justifyItems: oneBaslik.yatayHiza,
                                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                                        display: "none",
                                      },
                                      "& input[type=number]": {
                                        MozAppearance: "textfield",
                                      },
                                    }}
                                    value={theBirimFiyat?.fiyat ? theBirimFiyat?.fiyat : ""}
                                    inputProps={{
                                      style: {
                                        boxSizing: "border-box",
                                        // width: "min-content",
                                        // fontWeight: oneProperty === "metraj" && "700",
                                        // mt: "0.5rem",
                                        // height: "0.95rem",
                                        // minWidth: oneProperty.includes("aciklama") ? "min-content" : "4rem",
                                        textAlign: "end"
                                      },
                                      step: "0.1", lang: "en-US"
                                    }}
                                  />
                                </Box>
                              )
                            }

                          })}
                        </>
                      }



                    </React.Fragment>
                  )
                })}


              </React.Fragment>


            )
          })}







        </Box>
      }

    </Box >

  )

}
