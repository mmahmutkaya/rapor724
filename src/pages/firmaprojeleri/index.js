
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormProjectCreate from '../../components/FormProjectCreate'
import ProjectsHeader from '../../components/ProjectsHeader'
import { useNavigate } from "react-router-dom";
import { useGetFirmaProjeleriNames } from '../../hooks/useMongo';
import { DialogAlert } from '../../components/general/DialogAlert'


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';




export default function P_FirmaProjeleri() {


  const navigate = useNavigate()
  const { RealmApp, selectedProje, selectedFirma, setSelectedProje } = useContext(StoreContext)



  useEffect(() => {
    if (!selectedFirma) navigate('/firmalar')
  }, []);


  const [show, setShow] = useState("Main")
  const [dialogAlert, setDialogAlert] = useState()


  const { data: firmaProjeleriNames } = useGetFirmaProjeleriNames()
  // console.log("firmaProjeleriNames",firmaProjeleriNames)


  const handleProjeClick = async (oneProje) => {

    const project = await RealmApp.currentUser.callFunction("collection_projeler", { functionName: "getProject", _projeId: oneProje._id })

    if (!project._id) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Seçilen proje sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile irtibata geçiniz.",
      })
      return
    }

    console.log("project", project)
    setSelectedProje(project)

    // await RealmApp?.currentUser.refreshCustomData()


    // BURASI AKTİFDİ

    // const customProjectSettings = await RealmApp?.currentUser?.customData.customProjectSettings
    // console.log("customProjectSettings", customProjectSettings)

    // // console.log("oneProje._id",oneProje._id)
    // const customProjectSettings0 = customProjectSettings[0]
    // console.log("customProjectSettings0", customProjectSettings0)

    // const bsonId = customProjectSettings0._projectId
    // console.log("bsonId", bsonId)

    // const stringId = bsonId.$oid
    // const stringId = console.log(RealmApp.EJSON.parse(bsonId, { relaxed: false }));
    // console.log("stringId", stringId)

    // console.log("check", stringId == oneProje._id)

    // const customProjectSettings2 = customProjectSettings.find(x => x._projectId.toString() === oneProje._id.toString())
    // const customProjectSettings2 = customProjectSettings[0]._projectId.toString()
    // console.log("customProjectSettings2",customProjectSettings2)




    // BURASI AKTİFDİ

    // setSelectedProje(selectedProje => {
    //   let obj
    //   const customProjectSettings = RealmApp?.currentUser?.customData.customProjectSettings?.find(x => x._projectId.$oid === oneProje._id.toString())


    //   selectedProje.mahalBasliklari = selectedProje.mahalBasliklari.map(item => {

    //     obj = customProjectSettings?.mahalBasliklari?.find(x => x._id.$oid === item._id.toString())

    //     if (obj) {
    //       item.show = obj.show
    //     } else {
    //     }

    //     return (
    //       item
    //     )
    //   })

    //   selectedProje.pozBasliklari = selectedProje.pozBasliklari.map(item => {

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
    //     selectedProje
    //   )
    // })



    navigate('/dashboard')
  }


  return (
    <Box>

      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <ProjectsHeader setShow={setShow} />

      {show == "FormProjectCreate" &&
        <Box>
          <FormProjectCreate setShow={setShow} />
        </Box>
      }

      {show == "Main" && !firmaProjeleriNames?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "Main" && firmaProjeleriNames?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>
          {
            firmaProjeleriNames?.map((oneProje, index) => (

              <Box
                key={index}
                onClick={() => handleProjeClick(oneProje)}
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
                    {oneProje.name}
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


