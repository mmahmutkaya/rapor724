import HeaderMahalListesiPozMahaller from '../../components/HeaderMahalListesiPozMahaller.js'

import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from "react-router-dom";
import getLbsName from '../../functions/getLbsName.js';
import _ from 'lodash';

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

  const { data: mahaller_query } = useGetMahalListesi_mahaller_byPoz()
  const [mahaller_state, setMahaller_state] = useState()

  const { RealmApp, myTema } = useContext(StoreContext)
  const { selectedProje } = useContext(StoreContext)
  const { selectedPoz_mahalListesi } = useContext(StoreContext)
  const { selectedMahal_mahalListesi, setSelectedMahal_mahalListesi } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const [show, setShow] = useState("Main")
  const [isChanged, setIsChanged] = useState()


  useEffect(() => {
    !selectedProje && navigate('/projeler')
    setMahaller_state(_.cloneDeep(mahaller_query))
  }, [mahaller_query])



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
    px: "0.7rem",
    cursor: "pointer"
  }




  const handleDugumToggle = ({ oneMahal, toggleValue }) => {
    // console.log("oneMahal",oneMahal)
    let mahaller2 = mahaller_state
    mahaller2 = mahaller2.map(oneMahal2 => {
      if (oneMahal2._id.toString() === oneMahal._id.toString()) {
        oneMahal2.isChanged = true
        oneMahal2.hasDugum = toggleValue
      }
      return oneMahal2
    })
    setIsChanged(true)
    setMahaller_state(mahaller2)
  }



  const cancelChange = () => {
    queryClient.invalidateQueries(['mahalListesi_mahaller_byPoz'])
    setIsChanged()
  }


  const saveChange = async () => {

    try {

      const mahaller = mahaller_state.filter(x => x.isChanged)
      const result = await RealmApp.currentUser.callFunction("updateDugumler_openMetraj", { functionName: "mahaller_byPozId", _projeId: selectedProje._id, mahaller, _pozId: selectedPoz_mahalListesi._id });

      if (result.ok) {
        queryClient.invalidateQueries(['mahalListesi_mahaller_byPoz'])
      }

      setIsChanged()

    } catch (err) {

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null
      })

    }
  }



  const handleEdit = (oneMahal) => {
    setSelectedMahal_mahalListesi(oneMahal)

  }




  // const columns = `auto 1fr auto auto${editNodeMetraj ? " 1rem auto" : ""}`
  const columns = `max-content minmax(min-content, 1fr) max-content max-content`


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

      {show == "Main" && mahaller_state?.length > 0 &&

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

                </>


                {/* LBS'İN POZLARI */}
                {/* {mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString()).map((oneMahal, index) => { */}
                {mahaller_state?.filter(x => x._lbsId.toString() === oneLbs._id.toString()).map((oneMahal, index) => {


                  // let isSelected = false

                  // if (selectedPoz_mahalListesi?._id.toString() === oneMahal._id.toString()) {
                  //   isSelected = true
                  // }

                  let hasDugum = oneMahal.hasDugum
                  let { inactiveGray } = myTema.renkler

                  return (
                    // <Box key={index} onDoubleClick={() => navigate('/metrajpozmahaller')} onClick={() => setSelectedPoz_metraj(oneMahal)} sx={{ "&:hover": { "& .childClass": { display: "block" } }, cursor: "pointer", display: "grid", }}>
                    <React.Fragment key={index} >

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !hasDugum })} sx={{ ...mahalNo_css, backgroundColor: !hasDugum && inactiveGray }} >
                        {oneMahal.mahalNo}
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !hasDugum })} sx={{ ...mahalNo_css, cursor: "pointer", display: "grid", gridAutoFlow: "column", justifyContent: "start", backgroundColor: !hasDugum && inactiveGray, "&:hover": { "& .childClass": { backgroundColor: "red" } } }}>
                        <Box sx={{ justifySelf: "start" }}>
                          {oneMahal.mahalName}
                        </Box>
                        <Box className="childClass" sx={{ ml: "1rem", height: "0.5rem", width: "0.5rem", borderRadius: "50%" }}>
                        </Box>
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !hasDugum })} sx={{ ...mahalNo_css, justifyItems: "start", pl: "0.5rem", backgroundColor: !hasDugum && inactiveGray }} >
                        {ikiHane(oneMahal?.onaylananMetraj)}
                      </Box>

                      <Box onClick={() => handleDugumToggle({ oneMahal, toggleValue: !hasDugum })} sx={{ ...mahalNo_css, backgroundColor: !hasDugum && inactiveGray }}>
                        {selectedProje?.pozBirimleri.find(x => x.id === selectedPoz_mahalListesi.pozBirimId).name}
                      </Box>


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


