
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../components/store'
import { useApp } from "../../components/useApp";
import { useQuery } from '@tanstack/react-query'
import FormProjectCreate from '../../components/FormProjectCreate'


import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';




function ProjectsHeader({ setShow }) {
  const handleTry = () => {}
  let header = "Projeler"
  return (
    <Paper >
      <Grid container justifyContent="space-between" alignItems="center" sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}>
        <Grid item xs>
          <Typography onClick={() => handleTry()} variant="h6" fontWeight="bold">
            {header}
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Grid container spacing={1}>
            <Grid item>
              <IconButton onClick={() => console.log("deleted clicked")} aria-label="addWbs">
                <DeleteIcon variant="contained" color="error" />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setShow("FormProjectCreate")} aria-label="addWbs">
                <AddCircleOutlineIcon variant="contained" color="success" />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default function P_Projects() {

  const { selectedProje, setSelectedProje } = useContext(StoreContext)
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
  //   setSelectedProje(project)
  //   console.log(project)
  //   navigate('/dashboard')
  // }

  const handleProjectClick = async (prj) => {
    const project = await RealmApp.currentUser.callFunction("getProject",{projectId:prj._id})
    setSelectedProje(project)
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


