
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormProjectCreate from '../../components/FormProjectCreate'
import ProjectsHeader from '../../components/ProjectsHeader'
import { useNavigate } from "react-router-dom";
import { useGetFirmaProjeleri } from '../../hooks/useMongo';


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';




export default function P_Projects() {


  const navigate = useNavigate()
  const { RealmApp, isProject, selectedFirma, setIsProject } = useContext(StoreContext)



  useEffect(() => {
    if (!selectedFirma) navigate('/firmalarim')
  }, [selectedFirma]);


  const [show, setShow] = useState("Main")


  const { data: firmaProjeleri } = useGetFirmaProjeleri()
  // console.log("firmaProjeleri",firmaProjeleri)


  const handleProjectClick = async (oneProject) => {

    // const project = await RealmApp.currentUser.callFunction("getProject", { projectId: oneProject._id })
    const project = await RealmApp.currentUser.callFunction("collection_projeler", { functionName: "getProject", _projectId:oneProject._id });

    
    setIsProject(project)

    // await RealmApp?.currentUser.refreshCustomData()


    // BURASI AKTİFDİ
    
    // const customProjectSettings = await RealmApp?.currentUser?.customData.customProjectSettings
    // console.log("customProjectSettings", customProjectSettings)

    // // console.log("oneProject._id",oneProject._id)
    // const customProjectSettings0 = customProjectSettings[0]
    // console.log("customProjectSettings0", customProjectSettings0)

    // const bsonId = customProjectSettings0._projectId
    // console.log("bsonId", bsonId)

    // const stringId = bsonId.$oid
    // const stringId = console.log(RealmApp.EJSON.parse(bsonId, { relaxed: false }));
    // console.log("stringId", stringId)

    // console.log("check", stringId == oneProject._id)

    // const customProjectSettings2 = customProjectSettings.find(x => x._projectId.toString() === oneProject._id.toString())
    // const customProjectSettings2 = customProjectSettings[0]._projectId.toString()
    // console.log("customProjectSettings2",customProjectSettings2)




    // BURASI AKTİFDİ

    // setIsProject(isProject => {
    //   let obj
    //   const customProjectSettings = RealmApp?.currentUser?.customData.customProjectSettings?.find(x => x._projectId.$oid === oneProject._id.toString())


    //   isProject.mahalBasliklari = isProject.mahalBasliklari.map(item => {

    //     obj = customProjectSettings?.mahalBasliklari?.find(x => x._id.$oid === item._id.toString())

    //     if (obj) {
    //       item.show = obj.show
    //     } else {
    //     }

    //     return (
    //       item
    //     )
    //   })

    //   isProject.pozBasliklari = isProject.pozBasliklari.map(item => {

    //     obj = customProjectSettings?.pozBasliklari?.find(x => x._id.$oid === item._id.toString())

    //     if (obj) {
    //       item.show = obj.show
    //     } else {
    //     }

    //     return (
    //       item
    //     )
    //   })

    //   return (
    //     isProject
    //   )
    // })



    navigate('/dashboard')
  }


  return (
    <Box>

      <ProjectsHeader setShow={setShow} />

      {show == "FormProjectCreate" &&
        <Box>
          <FormProjectCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !firmaProjeleri?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && firmaProjeleri?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            firmaProjeleri?.map((oneProject, index) => (

              <Box
                key={index}
                onClick={() => handleProjectClick(oneProject)}
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
                    {oneProject.name}
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


