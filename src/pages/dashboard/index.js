import { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../components/store'
// import { StoreContext } from "../../components/store"
import { useNavigate } from "react-router-dom";
// import Box from '@mui/material/Box';

// import { Typography } from '@mui/material'


const artir = function () {
  console.log("de")
  // setSayi(onceki => onceki + 2)
  // setSayi(onceki => onceki + 1)
}


export default function P_Dashboard() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje]);

  const [sayi, setSayi] = useState(50)

  const navigate = useNavigate()

  {
    selectedProje &&
      <>
        {selectedProje.name}
      </>
  }

}
