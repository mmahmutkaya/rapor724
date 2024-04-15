import React from 'react'

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

export default function P_Grid() {



  return (
    <Grid sx={{
      display: "grid",
      gridTemplateColumns: "repeat(4, auto)",
      backgroundColor: "yellowgreen",
      gap: "1rem",
      justifyContent:"center",
      justifyItems:"center"
    }} >

      {true &&
        [...Array(10)].map((item, index) => {
          return (
            <Box sx={{backgroundColor:"yellow"}} key={index+1}>
              {index+1}
            </Box>
          )
        })
      }
    </Grid>
  )
}


      // <Box sx={{ border: "1px solid black" }}> 1 </Box>
      // <Box sx={{ border: "1px solid black" }}> 2 </Box>
      // <Box sx={{ border: "1px solid black" }}> 3 </Box>
      // <Box sx={{ border: "1px solid black" }}> 4 </Box>
      // <Box sx={{ border: "1px solid black" }}> 5 </Box>
      // <Box sx={{ border: "1px solid black" }}> 6 </Box>