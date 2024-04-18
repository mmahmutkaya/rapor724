
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import { useQuery } from '@tanstack/react-query'
import FormProjectCreate from '../../components/FormProjectCreate'
import ProjectsHeader from '../../components/ProjectsHeader'


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';

import FolderIcon from '@mui/icons-material/Folder';




export default function P_Projects() {

  const { isProject, setIsProject } = useContext(StoreContext)
  const [show, setShow] = useState("ProjectMain")

  const navigate = useNavigate()

  const RealmApp = useApp();
  const { isLoading, isError, data: projectNames, error, refetch: refetch_projects } = useQuery({
    queryKey: ['projectNames'],
    // queryFn: deneme,
    queryFn: async () => await RealmApp.currentUser.callFunction("getProjectNames"),
    refetchOnWindowFocus: false,
    enabled: !!RealmApp?.currentUser,
    // staleTime: 5 * 1000, // 1000 milisecond --> 1 second
  })



  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;


  // const handleProjectClick = async (project) => {
  //   // const project = await RealmApp.currentUser.callFunction("getProject")
  //   setIsProject(project)
  //   console.log(project)
  //   navigate('/dashboard')
  // }

  const handleProjectClick = async (prj) => {
    const project = await RealmApp.currentUser.callFunction("getProject",{projectId:prj._id})
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
          <FormProjectCreate setShow={setShow} refetch_projects={refetch_projects} />
        </Grid>
      }

      {show == "ProjectMain" && projectNames.empty &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Dahil olduğunuz herhangi bir proje bulunamadı, menüler yardımı ile yeni bir proje oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {show == "ProjectMain" && !projectNames.empty &&
        <Stack sx={{ width: '100%', padding: "1rem" }} spacing={0}>

          {
            projectNames.map(project => (

              <Grid
                key={project._id}
                container spacing={2}
                onClick={() => handleProjectClick(project)}
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
                    {project.name}
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


