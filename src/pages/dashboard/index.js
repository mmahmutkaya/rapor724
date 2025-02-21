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

  const { isProject, setIsProject } = useContext(StoreContext)

  useEffect(() => {
    if (!isProject) navigate('/firmaprojeleri')
  }, [isProject]);

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

  {
    isProject &&
    <>
      {isProject.name}
    </>
  }

}
