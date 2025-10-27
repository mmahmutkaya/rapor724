import HeaderMahalListesi from '../../components/HeaderMahalListesiPozlar.js'

import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import getWbsName from '../../functions/getWbsName.js';

import { DialogAlert } from '../../components/general/DialogAlert.js';

import { StoreContext } from '../../components/store.js'
import { useGetMahalListesi_pozlar } from '../../hooks/useMongo.js';




import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';



export default function P_MahalListesi() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: pozlar, error } = useGetMahalListesi_pozlar()

  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz_metraj, setSelected_metraj } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [show, setShow] = useState("Main")
  const [editMode, setEditMode] = useState()
  const [isChanged, setIsChanged] = useState()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])


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



  const ikiHane = (value) => {
    if (!value) {
      return ""
    }
    if (value != "") {
      return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value)
    }
    return value
  }


  // CSS
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
    gridColumn: "1 / 5",
    display: "grid",
    alignItems: "center",
    justifyItems: "start",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }

  const wbsBaslik_css2 = {
    backgroundColor: myTema.renkler.baslik2,
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }



  const pozNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    border: "1px solid black",
    px: "0.7rem"
  }




  const handleEdit = (onePoz) => {
    console.log("değişiklik oldu")
    setIsChanged(true)
  }


  const cancelChange = () => {
    console.log("son kayıtlar geri alındı")
    setIsChanged()
  }

  const saveChange = () => {
    console.log("son kayıtlar kaydedildi")
    setIsChanged()
  }



  // const columns = `auto 1fr auto auto${editNodeMetraj ? " 1rem auto" : ""}`
  const columns = `max-content minmax(min-content, 1fr) max-content max-content${editMode ? " 1rem max-content" : ""}}`


  return (
    <Box sx={{ m: "0rem", maxWidth: "60rem" }}>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}

      <Grid item >
        <HeaderMahalListesi
          show={show} setShow={setShow}
          editMode={editMode} setEditMode={setEditMode}
          isChanged={isChanged}
          cancelChange={cancelChange}
          saveChange={saveChange}
        />
      </Grid>


      {/* EĞER POZ BAŞLIĞI YOKSA */}
      {show == "Main" && false &&
        <Stack sx={{ width: '100%', mt: "3.5rem", p: "1rem" }} spacing={2}>
          <Alert severity="info">
            Öncelikle poz oluşturmaya açık poz başlığı oluşturmalısınız.
          </Alert>
        </Stack>
      }



      {/* ANA SAYFA - POZLAR VARSA */}

      {show == "Main" && pozlar?.length > 0 &&

        <Box sx={{ m: "1rem", mt: "4.5rem", display: "grid", gridTemplateColumns: columns }}>

          {/*   EN ÜST BAŞLIK */}
          <>

            {/* BAŞLIK - POZ NO */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz No
            </Box>

            {/* BAŞLIK - POZ İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Poz İsmi
            </Box>

            {/* BAŞLIK - POZ BİRİM  */}
            <Box sx={{ ...enUstBaslik_css }}>
              Miktar
            </Box>


            {/* BAŞLIK - POZ BİRİM  */}
            <Box sx={{ ...enUstBaslik_css }}>
              Birim
            </Box>

            {/* METRAJ DÜZENLEME AÇIKSA */}
            {editMode &&
              <>
                <Box></Box>
                <Box sx={{ ...enUstBaslik_css }}>
                  {"deneme"}
                </Box>
              </>
            }

          </>



          {/* WBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {selectedProje?.wbs.filter(x => x.openForPoz).map((oneWbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* WBS BAŞLIĞININ OLDUĞU TÜM SATIR */}
                <>
                  {/* WBS BAŞLIĞI */}
                  <Box sx={{ ...wbsBaslik_css }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >
                      {getWbsName({ wbsArray: selectedProje?.wbs, oneWbs }).name}
                    </Box>
                  </Box>

                  {/* METRAJ DÜZENLEME AÇIKSA */}
                  {editMode &&
                    <>
                      <Box />
                      <Box sx={{ ...wbsBaslik_css2 }} />
                    </>
                  }

                </>


                {/* WBS'İN POZLARI */}
                {pozlar?.filter(x => x._wbsId.toString() === oneWbs._id.toString()).map((onePoz, index) => {

                  // let isSelected = false

                  // if (selectedPoz_metraj?._id.toString() === onePoz._id.toString()) {
                  //   isSelected = true
                  // }

                  let hasMahal = onePoz.hasDugum
                  let { inactiveGray } = myTema.renkler

                  return (
                    // <Box key={index} onDoubleClick={() => navigate('/metrajpozmahaller')} onClick={() => setSelectedPoz_metraj(onePoz)} sx={{ "&:hover": { "& .childClass": { display: "block" } }, cursor: "pointer", display: "grid", }}>
                    <React.Fragment key={index} >
                      <Box sx={{ ...pozNo_css, backgroundColor: !hasMahal && inactiveGray }} >
                        {onePoz.pozNo}
                      </Box>
                      <Box sx={{ ...pozNo_css, justifyItems: "start", pl: "0.5rem", backgroundColor: !hasMahal && inactiveGray }} >
                        {onePoz.pozName}
                      </Box>
                      <Box onDoubleClick={() => console.log("onaylı metraja tıklandı")} sx={{ ...pozNo_css, cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", backgroundColor: !hasMahal && inactiveGray, "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ ml: "-1rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(onePoz?.onaylananMetraj)}
                        </Box>
                      </Box>
                      <Box sx={{ ...pozNo_css, backgroundColor: !hasMahal && inactiveGray }}>
                        {selectedProje?.pozBirimleri.find(x => x.id === onePoz.pozBirimId).name}
                      </Box>


                      {/* METRAJ DÜZENLEME AÇIKSA - KİŞİNİN HAZIRLADIĞI TOPLAM POZ METRAJ*/}
                      {
                        editMode &&
                        <>
                          <Box />
                          <Box onDoubleClick={() => handleEdit(onePoz)} sx={{ ...pozNo_css, justifyContent: "end", cursor: "pointer", backgroundColor: "yellow", cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                            <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: "yellow", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(onePoz?.hazirlananMetrajlar?.find(x => x.userEmail === RealmApp?.currentUser.customData.email)?.metraj)}
                            </Box>
                          </Box>
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


