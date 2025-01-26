import React from 'react'

import { useContext } from 'react';
import { StoreContext } from '../components/store'

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { styled } from '@mui/material/styles';




export default function ProjectHeader({ setShow }) {


  const handleTry = () => {
    // return isProject ? setIsProject(isProject.name) : null
  }

  let header = "Projeler"
  // isProject?.name ? header = isProject?.name : null



  // const Item = styled(Paper)(({ theme }) => ({
  //   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  //   ...theme.typography.body2,
  //   padding: theme.spacing(1),
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary,
  // }));



  return (
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
            onClick={() => handleTry()}
            // nowrap={true}
            variant="h6"
            fontWeight="bold"
          >
            {header}
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
              <IconButton onClick={() => setShow("FormProjectCreate")} aria-label="addWbs">
                <AddCircleOutlineIcon variant="contained" color="success" />
              </IconButton>
            </Grid>

          </Grid>
        </Grid>

      </Grid>


      {/* <Grid container spacing={3}>
        <Grid item xs="auto">
          <Item>variable width content</Item>
        </Grid>
        <Grid item xs={6}>
          <Item>xs=6</Item>
        </Grid>
        <Grid item xs>
          <Item>xs</Item>
        </Grid>
      </Grid> */}

    </Paper>
  )
}
