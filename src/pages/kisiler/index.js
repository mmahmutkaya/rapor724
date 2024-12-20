
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../components/store'
import { useNavigate } from "react-router-dom";
import { useApp } from "../../components/useApp";

// 
import FormKisiOlustur from '../../components/FormKisiOlustur'

// MATERIAL UI
import Box from '@mui/material/Box';
import { IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function P_Kisiler() {

  const RealmApp = useApp();
  const navigate = useNavigate()

  const { isProject, setIsProject } = useContext(StoreContext)


  const [show, setShow] = useState("Main")
  // isProject && console.log(isProject)

  useEffect(() => {
    !isProject && navigate("/projects")
  }, [])


  return (
    <Box sx={{}}>

      {/* Page Header */}
      <Box
        sx={{
          boxShadow: "0px 5px 5px lightgray",
          display: "grid",
          gridAutoFlow: "column",
          alignItems: "center",
          p: "0.5rem"
        }}>

        {/* SOL TARAF */}
        <Box sx={{ fontSize: "1.3rem", fontWeight: "600", pl: "0.25rem" }}>
          Kişiler
        </Box>


        {/* SAĞ TARAF */}
        <Box sx={{ display: "grid", justifyContent: "end" }}>

          <IconButton onClick={() => setShow("FormKisiOlustur")}>
            <AddCircleOutlineIcon />
          </IconButton>

        </Box>

      </Box>



      {/* Kişi Create */}
      {show == "FormKisiOlustur" &&
        <FormKisiOlustur setShow={setShow} />
      }





      {/* Page Content */}
      {show == "Main" &&
        <Box sx={{ mt: "1rem", display: "grid" }}>

          {isProject?.members.map((x, index) => {

            return (
              <Box key={index}>
                {x.toString()}
              </Box>
            )

          })}

        </Box>
      }





    </Box>
  )

}
