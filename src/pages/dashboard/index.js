import { useState, useContext } from 'react';
import {StoreContext} from "../../components/store"
import { useNavigate } from "react-router-dom";

import { Typography } from '@mui/material'


export default function P_Dashboard() {

  const navigate = useNavigate()

  const { isProject } = useContext(StoreContext)
  // !isProject ? navigate('/projects') : null
  // !isProject ? navigate('/projects') : null

  return (
    <Typography p={2}>
      {isProject?.name} + " projesinin adı db den geldi"
    </Typography>
  )
}
