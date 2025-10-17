
import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import { DialogAlert } from '../../components/general/DialogAlert.js';
import _ from 'lodash';


import { StoreContext } from '../../components/store'
import { useGetPozlar } from '../../hooks/useMongo';

import FormPozCreate from '../../components/FormPozCreate'
import ShowPozBaslik from '../../components/ShowPozBaslik'
import ShowPozParaBirimleri from '../../components/ShowPozParaBirimleri'
import HeaderPozlar from '../../components/HeaderPozlar'


import { borderLeft, fontWeight, grid, styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';




export default function P_Pozlar() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogAlert, setDialogAlert] = useState()

  const { data, error, isLoading } = useGetPozlar()
  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)

  const pozBirimleri = selectedProje?.pozBirimleri


  const [show, setShow] = useState("Main")
  const [pozlar_state, setPozlar_state] = useState()
  const [pozlar_backUp, setPozlar_backUp] = useState()

  const [paraEdit, setParaEdit] = useState(false)
  const [isChanged_para, setIsChanged_para] = useState()



  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setPozlar_state(_.cloneDeep(data?.pozlar))
    setPozlar_backUp(_.cloneDeep(data?.pozlar))
  }, [data])


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




  const [basliklar, setBasliklar] = useState(RealmApp?.currentUser.customData.customSettings.pages.pozlar.basliklar)

  const [paraBirimleri, setParaBirimleri] = useState(previousData => {
    let paraBirimleri = selectedProje?.paraBirimleri
    let paraBirimleri2 = RealmApp?.currentUser.customData.customSettings.pages.pozlar.paraBirimleri
    paraBirimleri = paraBirimleri?.map(oneBirim => {
      let showValue = paraBirimleri2?.find(x => x.id === oneBirim.id)?.show
      if (showValue) {
        oneBirim.show = true
      }
      return oneBirim
    })
    return paraBirimleri
  })

  // sayfadaki "visibility" tuşunun aktif olup olmamasını ayarlamak için
  const anyBaslikShow = basliklar?.find(x => x.visible) ? true : false

  const pozAciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pozVersiyonShow = basliklar?.find(x => x.id === "versiyon").show

  let paraBirimiAdet = paraBirimleri?.filter(x => x?.show).length

  const columns =
    `min-content
  minmax(min-content, 40rem) 
  min-content
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
        // console.log("pozlar_newPara", pozlar_newPara)

        await RealmApp?.currentUser.callFunction("update_pozlar_para", ({ pozlar_newPara }))

        queryClient.invalidateQueries(['pozlar'])
        setIsChanged_para()
        setParaEdit()
        return

      } catch (err) {

        console.log(err)

        let dialogIcon = "warning"
        let dialogMessage = "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.."
        let onCloseAction = () => {
          setDialogAlert()
          setIsChanged_para()
          setParaEdit()
          queryClient.invalidateQueries(['pozlar'])
        }
        if (err.message.includes("__mesajBaslangic__") && err.message.includes("__mesajBitis__")) {
          let mesajBaslangic = err.message.indexOf("__mesajBaslangic__") + "__mesajBaslangic__".length
          let mesajBitis = err.message.indexOf("__mesajBitis__")
          dialogMessage = err.message.slice(mesajBaslangic, mesajBitis)
          dialogIcon = "info"
        }
        setDialogAlert({
          dialogIcon,
          dialogMessage,
          detailText: err?.message ? err.message : null,
          onCloseAction
        })
      }
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
          onCloseAction={dialogAlert.onCloseAction}
        />
      }

      {/* BAŞLIK */}
      <HeaderPozlar show={show} setShow={setShow} anyBaslikShow={anyBaslikShow} paraEdit={paraEdit} setParaEdit={setParaEdit} save_para={save_para} cancel_para={cancel_para} isChanged_para={isChanged_para} setIsChanged_para={setIsChanged_para} />


      {/* POZ OLUŞTURULACAKSA */}
      {show == "PozCreate" && <FormPozCreate setShow={setShow} />}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && <ShowPozBaslik setShow={setShow} basliklar={basliklar} setBasliklar={setBasliklar} />}

      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowPozParaBirimleri" && <ShowPozParaBirimleri setShow={setShow} paraBirimleri={paraBirimleri} setParaBirimleri={setParaBirimleri} paraEdit={paraEdit} setParaEdit={setParaEdit} />}



      {isLoading &&
        <Box sx={{ m: "1rem", color: 'gray' }}>
          <LinearProgress color='inherit' />
        </Box>
      }

      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {!isLoading && show == "Main" && !selectedProje?.wbs?.find(x => x.openForPoz === true) &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }


      {/* EĞER POZ YOKSA */}
      {!isLoading && show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && !pozlar_state?.length > 0 &&
        <Stack sx={{ width: '100%', m: "0rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Menüler yardımı ile poz oluşturmaya başlayabilirsiniz.
          </Alert>
        </Stack>
      }


      {/* ANA SAYFA - POZLAR VARSA */}

      {show == "Main" && selectedProje?.wbs?.find(x => x.openForPoz === true) && pozlar_state?.length > 0 &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>


          {/*   EN ÜST BAŞLIK */}
          {/* <Box sx={{ display: "grid", gridTemplateColumns: columns, gridTemplateAreas: gridAreas_enUstBaslik }}> */}
          <React.Fragment >

            {/* BAŞLIK - POZ NO */}
            <Box sx={{ ...enUstBaslik_css, textWrap: "nowrap" }}>
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
                {paraBirimleri?.filter(x => x.show).map((oneBirim, index) => {
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

                  {/* {wbsName.split(">").map((item, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{}}>{item}</Box>
                      {index + 1 !== wbsName.split(">").length &&
                        <Box sx={{ color: myTema.renkler.baslik2_ayrac }} >{">"}</Box>
                      }
                    </React.Fragment>                    
                  ))} */}

                  <Box>deneme</Box>
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
                    {paraBirimleri?.filter(x => x.show).map((oneBirim, index) => {
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
                          {paraBirimleri?.filter(x => x.show).map((oneBirim, index) => {

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
                                    value={onePoz.birimFiyatlar?.find(x => x.id === oneBirim.id)?.fiyat}
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
