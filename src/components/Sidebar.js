import { useState, useContext, useEffect } from 'react';
import { StoreContext } from './store'
import { useApp } from "./useApp";
import { useNavigate, useLocation } from "react-router-dom";


//material
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';


export default function Sidebar({ setMobileOpen }) {

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { selectedProje, persons, selectedFirma } = useContext(StoreContext)

  return (
    <Grid container direction="column">


      {/* hiçbirşey seçilmemişken - sidebar menüsü görünümü*/}
      {!selectedProje && !persons && !selectedFirma &&
        <Grid item onClick={(() => setMobileOpen(false))}>
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
          >

            <ListItemButton
              onClick={() => navigate("/firmalar")}
              sx={{ backgroundColor: pathname == "/firmalar" ? "#f0f0f1" : null }}>
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Firmalar" />
            </ListItemButton>

          </List>
        </Grid>
      }



      {/* firma seçiminde - sidebar menüsü görünümü*/}
      {selectedFirma && !selectedProje &&
        <Grid item onClick={(() => setMobileOpen(false))}>
          <List>

            <ListItemButton
              onClick={() => navigate('/projeler')}
              sx={{ backgroundColor: pathname == "/projeler" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Projeler" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/firmawbs')}
              sx={{ backgroundColor: pathname == "/firmawbs" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Firma Poz Başlıkları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/firmapozlari')}
              sx={{ backgroundColor: pathname == "/firmapozlari" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Firma Pozları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/firmakadrosu')}
              sx={{ backgroundColor: pathname == "/firmakadrosu" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Kadro" />
            </ListItemButton>


          </List>
        </Grid>
      }





      {/* proje seçiminde - sidebar menüsü görünümü*/}
      {selectedProje &&
        <Grid item onClick={(() => setMobileOpen(false))}>
          <List>

            <ListItemButton
              onClick={() => navigate('/dashboard')}
              sx={{ backgroundColor: pathname == "/dashboard" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/pozhavuzu')}
              sx={{ backgroundColor: pathname == "/pozhavuzu" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Poz Havuzu" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/wbs')}
              sx={{ backgroundColor: pathname == "/wbs" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Poz Başlıkları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/pozlar')}
              sx={{ backgroundColor: pathname == "/pozlar" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Pozlar" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/lbs')}
              sx={{ backgroundColor: pathname == "/lbs" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahal Başlıkları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/mahaller')}
              sx={{ backgroundColor: pathname == "/mahaller" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahaller" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/mahallistesipozlar')}
              sx={{ backgroundColor: pathname.includes("/mahallistesi") ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahal Listesi" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/metrajpozlar')}
              sx={{ backgroundColor: pathname.includes("/metraj") ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Metraj" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/kisilerproject')}
              sx={{ backgroundColor: pathname == "/kisilerproject" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Proje Kişileri" />
            </ListItemButton>


            <ListItemButton
              onClick={() => navigate('/raporlar')}
              sx={{ backgroundColor: pathname == "/raporlar" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Raporlar" />
            </ListItemButton>


          </List>
        </Grid>
      }



    </Grid>
  );
}