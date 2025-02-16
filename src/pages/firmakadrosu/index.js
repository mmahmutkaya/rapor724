
import { useContext, useEffect, useState, Fragment } from 'react';
import { StoreContext } from '../../components/store'
import { useNavigate } from "react-router-dom";
import { useApp } from "../../components/useApp";
import { useGetNetworkUsers } from '../../hooks/useMongo';



import FormKisiBaglanti from '../../components/FormKisiBaglanti'


// MATERIAL UI
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



export default function P_FirmaKadrosu() {

  const navigate = useNavigate()

  const { isProject, setIsProject, RealmApp } = useContext(StoreContext)
  const [basliklar, setBasliklar] = useState(basliklarData)

  const { data: networkUsers } = useGetNetworkUsers()
  // networkUsers && console.log("networkUsers", networkUsers)

  const [show, setShow] = useState("Main")
  // isProject && console.log(isProject)

  // const basliklar = `
  //   'mail isim soyisim title . mahalBaslik mahal pozBaslik poz metraj metrajOnay'
  // `


  // const sutunAreas = basliklar.reduce((acc, x) => {
  //   return (
  //     acc + " " + x.id
  //   )
  // }, "")

  // const sutunGenislikler = basliklar.reduce((acc, x) => {
  //   return (
  //     acc + " " + x.width
  //   )
  // }, "")




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
        <Box sx={{ display: "grid", gridAutoFlow: "column", justifyContent: "end" }}>

          <IconButton onClick={() => console.log("networkUsers", networkUsers)}>
            <AddCircleOutlineIcon />
          </IconButton>

          <IconButton onClick={() => setShow("FormProjectKisiOlustur")}>
            <AddCircleOutlineIcon />
          </IconButton>

        </Box>

      </Box>




      {/* FORM - Kişi Bağlantı Kur */}
      {show == "FormProjectKisiOlustur" &&
        <FormKisiBaglanti setShow={setShow} />
      }


      {/* MAIN PAGE - Page Content */}
      {show == "Main" && (!networkUsers || networkUsers?.length < 1) &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Üst kısımdaki (+) tuşu ile ağınıza kişiler eklemeye başlayabilirsiniz.
          </Alert>
        </Stack>
      }


      {/* MAIN PAGE - Page Content */}
      {show == "Main" && networkUsers?.length > 0 &&
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: `repeat(${basliklar?.length}, minmax(min-content, max-content))` }}>


          {/* BAŞLIKLAR */}
          {basliklar.map((baslik, index) => {
            return (
              <Box
                key={index}
                sx={index === 0 ? { ...baslikLeft } : baslik.userProperty == "." ? { ...baslikBosluk } : { ...baslikNormal }}
              >
                {baslik.text}
              </Box>
            )
          })}



          {/* <Box sx={{ ...std }}>{y.isim}</Box> */}
          {/* {console.log("basliklar", basliklar)} */}
          {networkUsers.map((user) => {
            // { console.log("user", user) }
            return (
              <Fragment key={user._id}>
                {basliklar.map((baslik, index2) => {

                  let value = user[baslik.userProperty]
                  if (baslik.userProperty == ".") value = "."
                  if (baslik.userProperty == "status") value = user.status ? <div style={icon_checked}></div> : <div style={icon_waiting}></div>
                  if (baslik.userProperty == "otherStatus") value = user.otherStatus === false ? <div style={icon_rejected}>X</div> : user.otherStatus ? <div style={icon_checked}></div> : <div style={icon_waiting}></div>

                  return (
                    <div
                      key={user._id + "-" + index2}
                      style={index2 === 0 ? { ...stdLeft } : baslik.userProperty == "." ? { ...stdBosluk } : { ...stdNormal }}
                    >
                      {value}
                    </div>
                  )



                  // if (baslik.userProperty == ".") {
                  //   return (
                  //     <div
                  //       key={user._id + "-" + index2}
                  //       style={index2 === 0 ? { ...stdLeft } : baslik.userProperty == "." ? { ...stdBosluk } : { ...stdNormal }}
                  //     >
                  //       .
                  //     </div>
                  //   )
                  // }


                  // if (baslik.userProperty == "status") {
                  //   return (
                  //     <div
                  //       key={user._id + "-" + index2}
                  //       style={index2 === 0 ? { ...stdLeft } : baslik.userProperty == "." ? { ...stdBosluk } : { ...stdNormal }}
                  //     >
                  //       {user.status ? <div style={icon_checked}></div> : <div style={icon_waiting}></div>}
                  //     </div>
                  //   )
                  // }


                  // if (baslik.userProperty == "otherStatus") {
                  //   return (
                  //     <div
                  //       key={user._id + "-" + index2}
                  //       style={index2 === 0 ? { ...stdLeft } : baslik.userProperty == "." ? { ...stdBosluk } : { ...stdNormal }}
                  //     >
                  //       {user.otherStatus === false ? <div style={icon_rejected}>X</div> : user.otherStatus ? <div style={icon_checked}></div> : <div style={icon_waiting}></div>}
                  //     </div>
                  //   )
                  // }


                  // // yukarıdakilerin hiçbiri değilse
                  // return (
                  //   <div
                  //     key={user._id + "-" + index2}
                  //     style={index2 === 0 ? { ...stdLeft } : baslik.userProperty == "." ? { ...stdBosluk } : { ...stdNormal }}
                  //   >
                  //     {user[baslik.userProperty]}
                  //   </div>
                  // )


                })}
              </Fragment>
            )
          })}




          {/* KONU BAŞLIK */}
          {/* <Box sx={{ gridColumnStart: 1, gridColumnEnd: 4, mt: "1rem", mb: "0.5rem", fontWeight: "600", fontSize: "1.1rem" }}>
            Eşleşmiş Olduklarınız
          </Box>

          {!baglantiKurulanlar?.length ?
            <Alert severity="info" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              Üst kısımdaki (+) tuşu ile ağınıza kişiler eklemeye başlayabilirsiniz.
            </Alert>
            :
            baglantiKurulanlar.map((x, index) => {
              return (
                <Fragment key={index}>
                  <Box sx={{ ...stdLeft }}>{x._id}</Box>
                  <Box sx={{ ...std }}>{x.isim}</Box>
                  <Box sx={{ ...std }}>{x.soyisim}</Box>
                </Fragment>
              )
            })
          } */}




          {/* KONU BAŞLIK */}
          {/* <Box sx={{ gridColumnStart: 1, gridColumnEnd: 4, mt: "1rem", mb: "0.5rem", fontWeight: "600", fontSize: "1.1rem" }}>
            Sizden Onay Bekleyenler
          </Box>
          {!sizinOnayiniziBekleyenler?.length ?
            <Alert severity="info" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              Onayınızı bekleyen herhangi bir davet bulunamadı.
            </Alert>
            :
            sizinOnayiniziBekleyenler.map((x, index) => {
              return (
                <Fragment key={index}>
                  <Box sx={{ ...stdLeft }}>{x._id}</Box>
                  <Box sx={{ ...std }}>{x.isim}</Box>
                  <Box sx={{ ...std }}>{x.soyisim}</Box>
                </Fragment>
              )
            })
          } */}




          {/* KONU BAŞLIK */}
          {/* <Box sx={{ gridColumnStart: 1, gridColumnEnd: 4, mt: "1rem", mb: "0.5rem", fontWeight: "600", fontSize: "1.1rem" }}>
            Karşı Tarafın Onayı Beklenenler
          </Box>

          {!karsiOnayBekleyenler?.length ?
            <Alert severity="info" sx={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
              Onayınızı bekleyen herhangi bir davet bulunamadı.
            </Alert>
            :
            karsiOnayBekleyenler.map((x, index) => {
              return (
                <Fragment key={index}>
                  <Box sx={{ ...stdLeft }}>{x._id}</Box>
                  <Box sx={{ ...std }}>{x.isim}</Box>
                  <Box sx={{ ...std }}>{x.soyisim}</Box>
                </Fragment>
              )
            })
          } */}


        </Box>
      }

    </Box >
  )

}



const baslikLeft = {
  border: "1px solid black",
  px: "1rem",
  py: "0.2rem",
  backgroundColor: "#BEBEBE",
  fontWeight: "550",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const baslikNormal = {
  border: "1px solid black",
  borderLeft: "none",
  px: "1rem",
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
  paddingInline: "1rem",
  paddingBlock: "0.2rem",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const stdNormal = {
  border: "1px solid black",
  borderLeft: "none",
  paddingInline: "1rem",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const stdBosluk = {
  borderTop: "none",
  borderBottom: "none",
  borderRight: "1px solid black",
  paddingInline: "0.25rem",
  color: "white",
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"
}

const icon_checked = {
  height: "1rem",
  width: "0.5rem",
  borderBottom: "0.2rem solid green",
  borderRight: "0.2rem solid green",
  transform: "rotate(45deg)",
}



const icon_waiting = {
  height: "0.9rem",
  width: "0.9rem",
  backgroundColor: "yellow",
  borderRadius: "50%",
  border: "0.5px solid gray",
  display: "inlineBlock"
}


const icon_rejected = {
  color: "red",
  fontSize: "1.1rem",
  fontWeight: "600"
}




let basliklarData = [
  { userProperty: "_id", text: "Email" },
  { userProperty: "isim", text: "İsim" },
  { userProperty: "soyisim", text: "Soyisim" },
  { userProperty: ".", text: "" },
  { userProperty: "status", text: "Sizin Onay" },
  { userProperty: "otherStatus", text: "Karşı Onay" },
]
