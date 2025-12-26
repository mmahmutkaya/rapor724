
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';
import _ from 'lodash';


import { StoreContext } from '../../components/store.js'
import { useGetPozlar } from '../../hooks/useMongo.js';

import FormPozCreate from '../../components/FormPozCreate.js'
import ShowHideBaslik from '../../components/ShowHideBaslik.js'
import ShowPozParaBirimleri from '../../components/ShowPozParaBirimleri.js'


import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
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





export default function P_BirimFiyat() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()
  const [showEminMisin_para, setShowEminMisin_para] = useState(false)

  const { data: dataPozlar, error, isLoading } = useGetPozlar()
  const { myTema, appUser, setAppUser } = useContext(StoreContext)
  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  const pozBirimleri = selectedProje?.pozBirimleri
  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false)



  const [show, setShow] = useState("Main")
  const [pozlar_state, setPozlar_state] = useState()
  const [pozlar_backUp, setPozlar_backUp] = useState()

  const [usedParaIds, setUsedParaIds] = useState([])

  const [paraEdit, setParaEdit] = useState(false)
  const [isChanged_para, setIsChanged_para] = useState()



  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setPozlar_state(_.cloneDeep(dataPozlar?.pozlar))
    setPozlar_backUp(_.cloneDeep(dataPozlar?.pozlar))
  }, [dataPozlar])


  useEffect(() => {
    if (error) {
      console.log("error", error)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ? error.message : null
      })
    }
  }, [error]);


  const [basliklar, setBasliklar] = useState(appUser.customSettings.pages.birimfiyat.basliklar)

  const [paraBirimleri, setParaBirimleri] = useState(previousData => {
    let paraBirimleri = selectedProje?.paraBirimleri
    let userCustomParabirimleri = appUser.customSettings.pages.birimfiyat.paraBirimleri

    // kullanıcının firma tarafından yeni eklenen para birimlerinden haberdar olması için, kullnıcı özellikle gizlememişse para birimi görülsün
    paraBirimleri = paraBirimleri?.map(oneBirim => {
      oneBirim.isShow = true
      let oneBirim2 = userCustomParabirimleri.length > 0 && userCustomParabirimleri.find(x => x.id === oneBirim.id)
      if (oneBirim2) {
        if (oneBirim2.isShow === false) {
          oneBirim.isShow = false
        }
      }
      return oneBirim
    })
    return paraBirimleri
  })

  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  let paraBirimiAdet = paraBirimleri?.filter(x => x?.isShow).length

  const columns = `
    max-content
    minmax(min-content, 35rem) 
    max-content
    ${pozAciklamaShow ? " 0.4rem minmax(min-content, 10rem)" : ""}
    ${pozVersiyonShow ? " 0.4rem max-content" : ""}
    ${paraBirimiAdet === 1 ? " 0.4rem max-content" : paraBirimiAdet > 1 ? " 0.4rem repeat(" + paraBirimiAdet + ", max-content)" : ""}
  `


  // Edit Poz Para Birimi Input Fonksiyonu
  const handle_input_onKey = async (event) => {
    if (event.key == "e" || event.key == "E" || event.key == "+" || event.key == "-" || event.keyCode == "38" || event.keyCode == "40") {
      // console.log("'e' - 'E' - '+' - '-' - 'up' - 'down' - kullanılmasın")
      return event.preventDefault()
    }
  }



  // Edit Metraj Sayfasının Fonksiyonu
  const handle_input_onChange = ({ birimFiyat, _onePozId, paraBirimiId }) => {

    if (!isChanged_para) {
      setIsChanged_para(true)
    }

    let pozlar_state2 = _.cloneDeep(pozlar_state)

    // map ile tarayarak, state kısmındaki datanın ilgili satırını güncelliyoruz, ayrıca tüm satırların toplam metrajını, önce önceki değeri çıkartıp yeni değeri ekleyerek
    pozlar_state2.map(onePoz => {

      if (onePoz._id.toString() === _onePozId) {
        onePoz.newSelected_para = true
        onePoz.birimFiyatlar = onePoz.birimFiyatlar?.filter(x => x.id !== paraBirimiId)
        onePoz.birimFiyatlar = [...onePoz.birimFiyatlar, { id: paraBirimiId, fiyat: birimFiyat }]
      }
      return onePoz

    })

    let usedParaIds2 = _.cloneDeep(usedParaIds)
    usedParaIds2 = usedParaIds2.filter(x => x !== paraBirimiId)
    usedParaIds2 = [...usedParaIds2, paraBirimiId]
    setUsedParaIds(usedParaIds2)

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

        let paraBirimleri = _.cloneDeep(selectedProje.paraBirimleri)

        let isProjeUpdate
        usedParaIds.map(paraId => {
          paraBirimleri = paraBirimleri.map(onePara => {
            if (onePara.id === paraId && !onePara.isActive) {
              onePara.isActive = true
              isProjeUpdate = true
            }
            return onePara
          })
        })


        let pozlar_newPara = pozlar_state.map(onePoz => {
          if (onePoz.newSelected_para) {
            return { _id: onePoz._id, birimFiyatlar: onePoz.birimFiyatlar }
          }
        })
        // undefined olanları temizliyoruz
        pozlar_newPara = pozlar_newPara.filter(x => x)
        // console.log("pozlar_newPara", pozlar_newPara)

        // await RealmApp?.currentUser.callFunction("update_pozlar_para", ({ pozlar_newPara }))

        const response = await fetch(`/api/pozlar/birimfiyatlar`, {
          method: 'PATCH',
          headers: {
            email: appUser.email,
            token: appUser.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pozlar_newPara,
            projeId: selectedProje._id,
            paraBirimleri: isProjeUpdate ? paraBirimleri : null
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

        if (!responseJson.ok) {
          throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
        }

        queryClient.invalidateQueries(['dataPozlar'])
        setUsedParaIds([])
        setIsChanged_para()
        setParaEdit()

        if (isProjeUpdate) {
          let proje2 = _.cloneDeep(selectedProje)
          proje2.paraBirimleri = paraBirimleri
          setSelectedProje(proje2)
        }
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





  const createVersiyon_birimFiyat = async () => {

    try {

      const response = await fetch(`api/versiyon/birimfiyat`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId: selectedProje?._id
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

      if (responseJson.proje) {
        queryClient.invalidateQueries(['dataPozlar'])
        setSelectedProje(responseJson.proje)
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
            cancel_para()
            setShowEminMisin_para()
          }}
        />
      }

      {showEminMisin_versiyon &&
        <DialogAlert
          dialogIcon={"none"}
          dialogMessage={"Mevcut birim fiyatlar yeni versiyon olarak kaydedilsin mi?"}
          onCloseAction={() => setShowEminMisin_versiyon()}
          actionText1={"İptal"}
          action1={() => setShowEminMisin_versiyon()}
          actionText2={"Onayla"}
          action2={() => {
            createVersiyon_birimFiyat()
            setShowEminMisin_versiyon()
          }}
        />
      }


      {/* POZ OLUŞTURULACAKSA */}
      {show == "PozCreate" && <FormPozCreate setShow={setShow} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowHideBaslik" && <ShowHideBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} pageName={"birimfiyat"} dataName={"basliklar"} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowPozParaBirimleri" && <ShowPozParaBirimleri setShow={setShow} paraBirimleri={paraBirimleri} setParaBirimleri={setParaBirimleri} paraEdit={paraEdit} setParaEdit={setParaEdit} />}



      {/* BAŞLIK */}
      <Paper >

        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
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

              {!paraEdit &&
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

                  <Box>
                    <IconButton onClick={() => setShowEminMisin_versiyon(true)}>
                      <Avatar sx={{ height: "1.7rem", width: "1.7rem", fontSize: "0.8rem", fontWeight: 600, color: "black" }}>
                        V
                      </Avatar>
                    </IconButton>
                  </Box>

                  <Box>
                    <IconButton onClick={() => setShowEminMisin_versiyon(true)}>
                      <Avatar sx={{ height: "1.7rem", width: "1.7rem", fontSize: "0.8rem", fontWeight: 600, color: "black" }}>
                        V
                      </Avatar>
                    </IconButton>
                  </Box>


                  {paraBirimiAdet > 0 &&
                    <Box>
                      <IconButton onClick={() => setParaEdit(x => {
                        setShow("Main")
                        return !x
                      })}>
                        <EditIcon variant="contained" />
                      </IconButton>
                    </Box>
                  }

                </>
              }

              {paraEdit &&

                <>

                  <Grid item >
                    <IconButton onClick={() => {
                      if (isChanged_para) {
                        setShowEminMisin_para(true)
                      } else {
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

                </>
              }

            </Box>
          </Grid>

        </Grid>

      </Paper >



      {/* SAYFA İÇERİĞİ - ALTERNATİF-1 */}
      {isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }


      {/* SAYFA İÇERİĞİ - ALTERNATİF-2 */}
      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {!isLoading && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmalı.
          </Alert>
        </Stack>
      }


      {/* SAYFA İÇERİĞİ - ALTERNATİF-3 */}
      {/* EĞER POZ YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar_state?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmalı.
          </Alert>
        </Stack>
      }



      {/* SAYFA İÇERİĞİ - ALTERNATİF-4 */}
      {/* ANA SAYFA - POZLAR VARSA */}

      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && pozlar_state?.length > 0 &&
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
            {pozAciklamaShow &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  Açıklama
                </Box>
              </>
            }

            {/* BAŞLIK - VERSİYON */}
            {pozVersiyonShow &&
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
                {pozAciklamaShow &&
                  <>
                    <Box></Box>
                    <Box sx={{ ...wbsBaslik_css }} />
                  </>
                }

                {/* BAŞLIK - VERSİYON */}
                {pozVersiyonShow &&
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
                      {pozAciklamaShow &&
                        <>
                          <Box></Box>
                          <Box sx={{ ...pozNo_css }}>
                            {onePoz.aciklama}
                          </Box>
                        </>
                      }

                      {/* BAŞLIK - VERSİYON */}
                      {pozVersiyonShow &&
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

                            if (!paraEdit) {
                              return (
                                <Box key={index} sx={{ ...pozNo_css, justifyContent: "end", minWidth: "6rem" }}>
                                  {ikiHane(onePoz.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat)}
                                </Box>
                              )
                            } else {
                              return (
                                <Box key={onePoz._id.toString() + index} sx={{ ...pozNo_css, width: "8rem", backgroundColor: "rgba(255,255,0, 0.3)" }}>

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
                                    value={onePoz.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat ? onePoz.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat : ""}
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
