
import { useContext, useEffect, useState, Fragment } from 'react';
import { StoreContext } from '../../components/store'
import { useNavigate } from "react-router-dom";
import { useApp } from "../../components/useApp";


import FormKisiBaglanti from '../../components/FormKisiBaglanti'


// MATERIAL UI
import Box from '@mui/material/Box';
import { IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



export default function P_Kisiler() {

  const RealmApp = useApp();
  const navigate = useNavigate()

  const { isProject, setIsProject } = useContext(StoreContext)
  const [sutunlar, setSutunlar] = useState(myArray)

  const [show, setShow] = useState("Main")
  // isProject && console.log(isProject)

  // const sutunlar = `
  //   'mail isim soyisim title . mahalBaslik mahal pozBaslik poz metraj metrajOnay'
  // `


  const sutunAreas = sutunlar.reduce((acc, x) => {
    return (
      acc + " " + x.name
    )
  }, "")

  const sutunGenislikler = sutunlar.reduce((acc, x) => {
    return (
      acc + " " + x.width
    )
  }, "")




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
          Bağlantı Kurulan Kişiler
        </Box>


        {/* SAĞ TARAF */}
        <Box sx={{ display: "grid", justifyContent: "end" }}>

          <IconButton onClick={() => setShow("FormProjectKisiOlustur")}>
            <AddCircleOutlineIcon />
          </IconButton>

        </Box>

      </Box>



      {/* Kişi Bağlantı Kur */}
      {show == "FormProjectKisiOlustur" &&
        <FormKisiBaglanti setShow={setShow} />
      }




      {/* Page Content */}
      {show == "Main" &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: sutunGenislikler, gridTemplateAreas: sutunAreas }}>


          {/* BAŞLIKLAR */}
          {sutunlar.map((x, index) => {
            return (
              <Box
                key={index}
                sx={index === 0 ? { ...baslikLeft } : x.name == "." ? { ...baslikBosluk } : { ...baslik }}
              >
                {x.name.replace("_", " ")}
              </Box>
            )

          })}



          {isProject?.members.map((x, index) => {

            return (
              <Fragment key={index}>
                <Box sx={{ ...stdLeft }}>{x.toString()}</Box>
                <Box sx={{ ...std }}>mahmut</Box>
                <Box sx={{ ...std }}>kaya</Box>
                <Box sx={{ ...std }}>Teknik Ofis şefi</Box>
                <Box sx={{ ...stdBosluk }}> . </Box>
                <Box sx={{ ...std }}>mahal başlık</Box>
                <Box sx={{ ...std }}>mahal</Box>
                <Box sx={{ ...std }}>poz başlık</Box>

              </Fragment>
            )

          })}

        </Box>
      }

    </Box >
  )

}



const baslikLeft = {
  border: "1px solid black",
  px: "0.5rem",
  backgroundColor: "#BEBEBE",
  fontWeight: "550",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const baslik = {
  border: "1px solid black",
  borderLeft: "none",
  px: "0.5rem",
  backgroundColor: "#BEBEBE",
  fontWeight: "550",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const baslikBosluk = {
  borderRight: "1px solid black",
  color: "white"
}




const stdLeft = {
  border: "1px solid black",
  px: "0.5rem",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const std = {
  border: "1px solid black",
  borderLeft: "none",
  px: "0.5rem",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const stdBosluk = {
  borderTop: "none",
  borderBottom: "none",
  borderRight: "1px solid black",
  px: "0.5rem",
  color: "white",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}



let myArray = [
  { name: "Email", width: "auto" },
  { name: "İsim", width: "auto" },
  { name: "Soyisim", width: "auto" },
  { name: ".", width: "1rem" },
  { name: "Durum", width: "auto" },
]
