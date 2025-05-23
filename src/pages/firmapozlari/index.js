
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useGetFirmaPozlar } from '../../hooks/useMongo';

import FormFirmaPozCreate from '../../components/FormFirmaPozCreate'
import EditPozBaslik from '../../components/EditPozBaslik'
import FormPozBaslikCreate from '../../components/FormPozBaslikCreate'
import FirmaPozlariHeader from '../../components/FirmaPozlariHeader'


import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Button, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';



export default function P_FirmaPozlari() {

  const navigate = useNavigate()
  const { data: pozlar } = useGetFirmaPozlar()
  const { selectedFirma } = useContext(StoreContext)
  const [show, setShow] = useState("Main")

  useEffect(() => {
    !selectedFirma && navigate('/firmalarim')
  }, [])

  // pozlar && console.log("pozlar", pozlar)

  return (
    <Box sx={{ mt: "0rem" }}>

      {/* BAŞLIK */}
      <FirmaPozlariHeader show={show} setShow={setShow} />

      {show == "PozCreate" && <FormFirmaPozCreate setShow={setShow} />}

      {/* ANA SAYFA */}
      <Box>
        deneme
      </Box>
    </Box>
  )

}
