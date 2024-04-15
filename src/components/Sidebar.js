import { useState, useContext, useEffect } from 'react';
import { StoreContext } from './store'
import { useApp } from "./useApp";
import { Link, NavLink } from 'react-router-dom';

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


  // const router = useRouter();
  const router = "router"
  const { isProject } = useContext(StoreContext)
  const { persons } = useContext(StoreContext)

  return (
    <Grid container direction="column">

      {/* <Grid item sx={{ backgroundColor: "aquamarine" }}>
        <Typography >
          {header}
        </Typography>
      </Grid> */}


      {/* hiçbirşey seçilmemişken - sidebar menüsü görünümü*/}
      {!isProject && !persons &&
        <Grid item onClick={(() => setMobileOpen(false))}>
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
          >

            <ListItemButton>
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <NavLink to='/projects' style={{ textDecoration: 'none', color: "black" }}>
                <ListItemText primary="Projeler" />
              </NavLink>
            </ListItemButton>


            <ListItemButton>
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <NavLink to='/people' style={{ textDecoration: 'none', color: "black" }}>
                <ListItemText primary="Kişiler" />
              </NavLink>
            </ListItemButton>


            <ListItemButton         >
              <ListItemIcon  >
                <SendIcon />
              </ListItemIcon>
              <NavLink to='/companies' style={{ textDecoration: 'none', color: "black" }}>
                <ListItemText primary="Firmalar" />
              </NavLink>
            </ListItemButton>

          </List>
        </Grid>
      }



      {/* poz seçiminde - sidebar menüsü görünümü*/}
      {isProject &&
        <Grid item onClick={(() => setMobileOpen(false))}>
          <List>

            <ListItemButton
              onClick={() => router.push('/dashboard')}
              sx={{ backgroundColor: router?.asPath == "/dashboard" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/wbs')}
              sx={{ backgroundColor: router?.asPath == "/wbs" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Poz Başlıkları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/pozlar')}
              sx={{ backgroundColor: router?.asPath == "/pozlar" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Pozlar" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/lbs')}
              sx={{ backgroundColor: router?.asPath == "/lbs" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahal Başlıkları" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/mahaller')}
              sx={{ backgroundColor: router?.asPath == "/mahaller" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahaller" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/mahallistesi')}
              sx={{ backgroundColor: router?.asPath == "/mahallistesi" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Mahal Listesi" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/metraj')}
              sx={{ backgroundColor: router?.asPath == "/metraj" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Metraj" />
            </ListItemButton>


            <ListItemButton
              onClick={() => router.push('/raporlar')}
              sx={{ backgroundColor: router?.asPath == "/raporlar" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Raporlar" />
            </ListItemButton>

            <ListItemButton
              onClick={() => router.push('/grid')}
              sx={{ backgroundColor: router?.asPath == "/grid" ? "#f0f0f1" : null }}
            >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Grid" />
            </ListItemButton>

          </List>
        </Grid>
      }
    </Grid>
  );
}