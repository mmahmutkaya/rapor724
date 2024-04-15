import { useApp } from "./useApp.js";
import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import deleteLastSpace from '../functions/deleteLastSpace.js';
import { DialogWindow } from './general/DialogWindow.js';


//mui
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MenuItem from '@mui/material/MenuItem';



export default function FormMetrajUpdate({ setShow, _pozId }) {

  const RealmApp = useApp();

  const { isProject, setIsProject } = useContext(StoreContext)
  const { mahaller, setMahaller } = useContext(StoreContext)
  const { mahalListesi, setMahalListesi } = useContext(StoreContext)
  const { pozMahalMetrajlar, setPozMahalMetrajlar } = useContext(StoreContext)

  // console.log("isProject", isProject)
  // console.log("_pozId", _pozId)

  let gridTemplateColumns_1 = "5rem 15rem repeat(8, 5rem)"
  let gridTemplateColumns_2 = "45rem repeat(3, 5rem)"

  
  const mahaller_fecth = async () => {
    if (!mahaller) {
      const result = await RealmApp?.currentUser.callFunction("getProjectMahaller", ({ projectId: isProject?._id }));
      setMahaller(result)
    }
  }
  mahaller_fecth()


  const mahalListesi_fecth = async () => {
    if (!mahalListesi) {
      const result = await RealmApp?.currentUser.callFunction("getMahalListesi", ({ projectId: isProject?._id }));
      setMahalListesi(result)
    }
  }
  mahalListesi_fecth()



  const pozMahalMetrajlar_fecth = async () => {
    if (!pozMahalMetrajlar) {
      const result = await RealmApp?.currentUser.callFunction("getPozMahalMetrajlar", ({ _projectId: isProject?._id, _pozId }));
      setPozMahalMetrajlar(result)
    }
  }
  pozMahalMetrajlar_fecth()



  const TopHeader = styled('div')(({ index }) => ({
    backgroundColor: "rgba( 56,56,56 , 0.9 )",
    color: "white",
    display: "grid",
    justifyContent: "center",
    p: "0.1rem 0.2rem",
    border: "0.1rem solid black",
    borderLeft: (index && index !== 0) ? null : "solid black 1px",
    borderRight: "solid black 1px",
    borderTop: "solid black 1px",
    borderBottom: "solid black 1px"
  }));


  const SubHeader = styled('div')(({ index }) => ({
    backgroundColor: "rgba(144,144,144,0.3)",
    display: "grid",
    justifyContent: "center",
    border: "0.1rem solid black",
  }));


  const Item = styled('div')(({ index }) => ({
    // backgroundColor: "rgba(144,144,144,0.3)",
    display: "grid",
    justifyContent: "center",
    p: "0.1rem 0.2rem",
    border: "0.1rem solid black",
    borderLeft: (index && index !== 0) ? null : "solid black 1px",
    borderRight: "solid black 1px",
    borderTop: "solid black 1px",
    borderBottom: "solid black 1px"
  }));





  return (
    <Box sx={{ m: "4.5rem 1rem 1rem 1rem" }}>

      <Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns_1, mb: "1rem" }}>
        <TopHeader>Açıklama</TopHeader>
        <TopHeader>Açıklama</TopHeader>
        <TopHeader>Benzer</TopHeader>
        <TopHeader>Adet</TopHeader>
        <TopHeader>En</TopHeader>
        <TopHeader>Boy</TopHeader>
        <TopHeader>Yükseklik</TopHeader>
        <TopHeader>Artan</TopHeader>
        <TopHeader>Azalan</TopHeader>
        <TopHeader>Toplam</TopHeader>
      </Box>

      {mahalListesi.filter(item => item._pozId.toString() == _pozId.toString()).map(({_mahalId,metraj}, index) => {
        // {console.log("_mahalId",_mahalId)}
        return (
          <Box key={index}>

            <Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns_2 }}>
              <SubHeader index={index} sx={{justifyContent: "start", paddingLeft:"0.5rem"}}>
                {mahaller?.find(item => item._id.toString() == _mahalId.toString()).name}
              </SubHeader>
              <SubHeader></SubHeader>
              <SubHeader></SubHeader>
              <SubHeader>{metraj}</SubHeader>
            </Box>


            {/* <Box sx={{ display: "grid", gridTemplateColumns: gridTemplateColumns_1, mb:"1rem" }}>
              <Item>Açıklama</Item>
              <Item>Açıklama</Item>
              <Item>Benzer</Item>
              <Item>Adet</Item>
              <Item>En</Item>
              <Item>Boy</Item>
              <Item>Yükseklik</Item>
              <Item>Artan</Item>
              <Item>Azalan</Item>
              <Item>Toplam</Item>
            </Box> */}

          </Box>
        )
      })}



    </Box>
  );

}