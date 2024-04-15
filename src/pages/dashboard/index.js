import { useState, useEffect, useContext } from 'react';
import {StoreContext} from "../../components/store"
import { useRouter } from 'next/router';

import { Typography } from '@mui/material'


export default function P_Dashboard() {

  const { isProject } = useContext(StoreContext)
  const router = useRouter();
  // !isProject ? router.push('/projects') : null
  !isProject ? window.location.href = "/projects" : null

  return (
    <Typography p={2}>
      {isProject?.name} + " projesinin adı db den geldi"
    </Typography>
  )
}
