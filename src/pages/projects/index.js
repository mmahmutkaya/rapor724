
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import FormProjectCreate from '../../components/FormProjectCreate'
import ProjectsHeader from '../../components/ProjectsHeader'
import { useNavigate } from "react-router-dom";


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';

import FolderIcon from '@mui/icons-material/Folder';




export default function P_Projects() {


  const RealmApp = useApp();
  const navigate = useNavigate()

  const { isProject, setIsProject } = useContext(StoreContext)
  const { projectNames, setProjectNames } = useContext(StoreContext)
  const [show, setShow] = useState("ProjectMain")


  const projectNames_fecth = async () => {
    if (!projectNames) {
      const result = await RealmApp?.currentUser.callFunction("getProjectNames");
      console.log("result",result)
      // const result = [{ _id: 1, name: "Proje 1" }, { _id: 2, name: "Proje 2" }]
      setProjectNames(result)
    }
  }
  projectNames_fecth()




  const handleProjectClick = async (prj) => {
    const project = await RealmApp.currentUser.callFunction("getProject", { projectId: prj._id })
    setIsProject(project)
    navigate('/dashboard')
  }


  return (
    <Grid container direction="column" spacing={1}>

      <Grid item >
        <ProjectsHeader setShow={setShow} />
      </Grid>

      {show == "FormProjectCreate" &&
        <Grid item >
          <FormProjectCreate setShow={setShow} />
        </Grid>
      }

      {show == "ProjectMain" && !projectNames?.length > 0 &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "ProjectMain" && projectNames?.length &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>

          {
            projectNames.map((oneProject, index) => (

              <Grid
                key={index}
                container spacing={2}
                onClick={() => handleProjectClick(oneProject)}
                sx={{
                  "&:hover": {
                    color: "red",
                  },
                  padding: "0.2rem 1rem",
                  cursor: "pointer"
                }}
              >

                <Grid item>
                  <FolderIcon
                    sx={{
                      // "&:hover": {
                      //   color: "red",
                      // },
                      color: "#757575"
                    }} />
                </Grid>

                <Grid item>
                  <Typography sx={{ fontWeight: "normal" }}>
                    {oneProject.name}
                  </Typography>
                </Grid>

              </Grid>


            ))
          }


        </Stack>
      }

    </Grid>

  )

}


