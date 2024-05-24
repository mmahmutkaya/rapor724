import { useState, useContext } from 'react';
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

  const [sayi, setSayi] = useState(50)

  const navigate = useNavigate()

  // const { isProject } = useContext(StoreContext)
  // !isProject ? navigate('/projects') : null
  // !isProject ? navigate('/projects') : null

  // return (
  //   <Typography p={2}>
  //     {isProject?.name} + " projesinin adı db den geldi"
  //   </Typography>
  // )




  return (
    <>
      {2+2 !== 4 &&
        <>
          goster
        </>
      }
      <button onClick={() => artir()}>artır</button>

      <button onClick={() => console.log(sayi)}>sayıyı göster</button>

      {sayi}

    </>
  )

}
