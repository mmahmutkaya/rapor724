import HeaderMahalListesiPozMahaller from '../../components/HeaderMahalListesiPozMahaller.js'

import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import getLbsName from '../../functions/getLbsName.js';

import { DialogAlert } from '../../components/general/DialogAlert.js';

import { StoreContext } from '../../components/store.js'
import { useGetPozlar, useGetMahalListesi_mahaller_byPoz } from '../../hooks/useMongo.js';




import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';



export default function P_MahalListesiPozMahaller() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: pozlar } = useGetPozlar()
  const { data: mahaller } = useGetMahalListesi_mahaller_byPoz()

  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz_mahalListesi } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [show, setShow] = useState("Main")
  const [editMode, setEditMode] = useState()
  const [isChanged, setIsChanged] = useState()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
  }, [])



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


  const lbsBaslik_css = {
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

  const lbsBaslik_css2 = {
    backgroundColor: myTema.renkler.baslik2,
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem"
  }



  const mahalNo_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    border: "1px solid black",
    px: "0.7rem"
  }




  const handleEdit = (oneMahal) => {
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
          onCloseAction={() => setDialogAlert()}
        />
      }

      {/* BAŞLIK */}

      <Grid item >
        <HeaderMahalListesiPozMahaller
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
              Mahal No
            </Box>

            {/* BAŞLIK - POZ İSMİ */}
            <Box sx={{ ...enUstBaslik_css }}>
              Mahal İsmi
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



          {/* LBS BAŞLIĞI ve ALTINDA POZLARI*/}

          {selectedProje?.lbs.filter(x => x.openForMahal).map((oneLbs, index) => {

            return (

              <React.Fragment key={index}>

                {/* LBS BAŞLIĞININ OLDUĞU TÜM SATIR */}
                <>
                  {/* LBS BAŞLIĞI */}
                  <Box sx={{ ...lbsBaslik_css }}>
                    <Box sx={{ display: "grid", gridAutoFlow: "column" }} >
                      {getLbsName({ lbsArray: selectedProje?.lbs, oneLbs }).name}
                    </Box>
                  </Box>

                  {/* METRAJ DÜZENLEME AÇIKSA */}
                  {editMode &&
                    <>
                      <Box />
                      <Box sx={{ ...lbsBaslik_css2 }} />
                    </>
                  }

                </>


                {/* LBS'İN POZLARI */}
                {/* {mahaller?.filter(x => x._lbsId.toString() === oneLbs._id.toString()).map((oneMahal, index) => { */}
                {mahaller?.map((oneMahal, index) => {

                  // let isSelected = false

                  // if (selectedPoz_mahalListesi?._id.toString() === oneMahal._id.toString()) {
                  //   isSelected = true
                  // }

                  let hasDugum = oneMahal.hasDugum
                  let { inactiveGray } = myTema.renkler

                  return (
                    // <Box key={index} onDoubleClick={() => navigate('/metrajpozmahaller')} onClick={() => setSelectedPoz_metraj(oneMahal)} sx={{ "&:hover": { "& .childClass": { display: "block" } }, cursor: "pointer", display: "grid", }}>
                    <React.Fragment key={index} >
                      <Box sx={{ ...mahalNo_css, backgroundColor: !hasDugum && inactiveGray }} >
                        {oneMahal.mahalNo}
                      </Box>
                      <Box sx={{ ...mahalNo_css, justifyItems: "start", pl: "0.5rem", backgroundColor: !hasDugum && inactiveGray }} >
                        {oneMahal.mahalName}
                      </Box>
                      <Box onDoubleClick={() => console.log("onaylı metraja tıklandı")} sx={{ ...mahalNo_css, cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", backgroundColor: !hasDugum && inactiveGray, "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box className="childClass" sx={{ ml: "-1rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                        <Box sx={{ justifySelf: "end" }}>
                          {ikiHane(oneMahal?.onaylananMetraj)}
                        </Box>
                      </Box>
                      <Box sx={{ ...mahalNo_css, backgroundColor: !hasDugum && inactiveGray }}>
                        {selectedProje?.pozBirimleri.find(x => x.id === selectedPoz_mahalListesi.pozBirimId).name}
                      </Box>


                      {/* METRAJ DÜZENLEME AÇIKSA - KİŞİNİN HAZIRLADIĞI TOPLAM POZ METRAJ*/}
                      {
                        editMode &&
                        <>
                          <Box />
                          <Box onDoubleClick={() => handleEdit(oneMahal)} sx={{ ...mahalNo_css, justifyContent: "end", cursor: "pointer", backgroundColor: "yellow", cursor: "pointer", display: "grid", gridTemplateColumns: "1rem 1fr", "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                            <Box className="childClass" sx={{ ml: "-1rem", backgroundColor: "yellow", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                            </Box>
                            <Box sx={{ justifySelf: "end" }}>
                              {ikiHane(oneMahal?.hazirlananMetrajlar?.find(x => x.userEmail === RealmApp?.currentUser.customData.email)?.metraj)}
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


