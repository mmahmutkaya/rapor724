
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormFirmaCreate from '../../components/FormFirmaCreate'
// import FirmalarHeader from '../../components/FirmalarHeader'
import { useNavigate } from "react-router-dom";
import { useGetFirmalarimNames } from '../../hooks/useMongo';


import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import FolderIcon from '@mui/icons-material/Folder';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';




export default function P_Firmalarim() {

  // const RealmApp = useApp();
  const { RealmApp } = useContext(StoreContext)
  const { selectedFirma, setSelectedFirma } = useContext(StoreContext)
  const navigate = useNavigate()

  const [show, setShow] = useState("Main")


  const { data: firmalarNames } = useGetFirmalarimNames()


  const handleProjectClick = (oneFirma) => {
    setSelectedFirma(oneFirma)
    navigate("/firmaprojeleri")
  }

  // const handleProjectClick = async (prj) => {

  //   const project = await RealmApp.currentUser.callFunction("getProject", { projectId: prj._id })

  //   await RealmApp?.currentUser.refreshCustomData()


  //   // const customProjectSettings = await RealmApp?.currentUser?.customData.customProjectSettings
  //   // console.log("customProjectSettings", customProjectSettings)

  //   // // console.log("prj._id",prj._id)
  //   // const customProjectSettings0 = customProjectSettings[0]
  //   // console.log("customProjectSettings0", customProjectSettings0)

  //   // const bsonId = customProjectSettings0._projectId
  //   // console.log("bsonId", bsonId)

  //   // const stringId = bsonId.$oid
  //   // const stringId = console.log(RealmApp.EJSON.parse(bsonId, { relaxed: false }));
  //   // console.log("stringId", stringId)

  //   // console.log("check", stringId == prj._id)

  //   // const customProjectSettings2 = customProjectSettings.find(x => x._projectId.toString() === prj._id.toString())
  //   // const customProjectSettings2 = customProjectSettings[0]._projectId.toString()
  //   // console.log("customProjectSettings2",customProjectSettings2)

  //   setIsProject(isProject => {
  //     let obj
  //     const customProjectSettings = RealmApp?.currentUser?.customData.customProjectSettings?.find(x => x._projectId.$oid === prj._id.toString())


  //     isProject.mahalBasliklari = isProject.mahalBasliklari.map(item => {

  //       obj = customProjectSettings?.mahalBasliklari?.find(x => x._id.$oid === item._id.toString())

  //       if (obj) {
  //         item.show = obj.show
  //       } else {
  //       }

  //       return (
  //         item
  //       )
  //     })

  //     isProject.pozBasliklari = isProject.pozBasliklari.map(item => {

  //       obj = customProjectSettings?.pozBasliklari?.find(x => x._id.$oid === item._id.toString())

  //       if (obj) {
  //         item.show = obj.show
  //       } else {
  //       }

  //       return (
  //         item
  //       )
  //     })

  //     return (
  //       isProject
  //     )
  //   })

  //   navigate('/dashboard')
  // }


  return (
    <Box>

      {/* BAŞLIK */}
      <Paper >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >

          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              Firmalarım
            </Typography>
          </Grid>


          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Grid container spacing={1}>

              <Grid item>
                <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                  <DeleteIcon
                    variant="contained" color="error"
                  />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={() => setShow("FormFirmaCreate")} aria-label="addWbs">
                  <AddCircleOutlineIcon variant="contained" color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Paper>



      {show == "FormFirmaCreate" &&
        <Box>
          <FormFirmaCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !firmalarNames?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir firma bulunamadı, menüler yardımı ile oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && firmalarNames?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            firmalarNames.map((oneFirma, index) => (

              <Box
                key={index}
                onClick={() => handleProjectClick(oneFirma)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  "&:hover": {
                    color: "black",
                    "& .childClass": {
                      color: "black",
                    }
                  },
                  alignItems: "center",
                  padding: "0.2rem 1rem",
                  cursor: "pointer"
                }}
              >

                <Box className="childClass" sx={{ pr: "1rem", color: "gray" }}>
                  <FolderIcon />
                </Box>

                <Box>
                  <Typography>
                    {oneFirma.name}
                  </Typography>
                </Box>

              </Box>

            ))
          }


        </Stack>
      }

    </Box>

  )

}


