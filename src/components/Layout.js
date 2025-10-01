import { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../components/store'
import PropTypes from 'prop-types';
// import { useApp } from "../components/useApp.js";
import { useNavigate } from "react-router-dom";


//material
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';
import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase';
import UndoIcon from '@mui/icons-material/Undo';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';


import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';

import FormSignIn from "./FormSignIn.js"
import FormSignUp from "./FormSignUp.js"
import FormSifreYenileme from "./FormSifreYenileme.js"
import FormMailTeyit from "./FormMailTeyit.js"
import FormNewUserNecessaryData from "./FormNewUserNecessaryData.js"
import FormProfileUpdate from "./FormProfileUpdate.js"




export default function Layout({ window, children }) {

  const navigate = useNavigate()

  const { drawerWidth, topBarHeight } = useContext(StoreContext)
  const { Layout_Show, setLayout_Show } = useContext(StoreContext)

  const { RealmApp, selectedFirma, selectedProje, setSelectedProje } = useContext(StoreContext)

  const { setSelectedFirma, setSelectedLbs, setSelectedMahal, setSelectedMahalBaslik, setSelectedWbs, setSelectedPoz, setSelectedPozBaslik, setSelectedNode, pageMetraj_setShow } = useContext(StoreContext)


  // bu seçenekler var (başka da olabilir sen yine de bak) - Page / Dialog
  const [show, setShow] = useState("RootPage")

  const [began, setBegan] = useState(false)


  const [isSidebar, setIsSidebar] = useState(false)

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);




  if (!RealmApp) {
    return (
      <div>Üzgünüz, bir problem var (RealmApp yok), sayfayı yenilemeyi deneyiniz, problem devam ederse lütfen bizi bilgilendiriniz... Hata (COMPONENT:Layout - MESSAGE:RealmApp yok)</div>
    )
  }

  if (!RealmApp?.currentUser && Layout_Show === "login") {
    console.log("RealmApp", RealmApp)
    return (
      <FormSignIn />
    )
  }

  if (!RealmApp?.currentUser && Layout_Show === "newUser") {
    return (
      <FormSignUp />
    )
  }


  if (!RealmApp?.currentUser && Layout_Show === "sifreYenileme") {
    return (
      <FormSifreYenileme />
    )
  }



  // mongo realm bu fonksiyonu name değeri yoksa bile name:$undefined:true gibi birşey oluşturuyor sonuçta $undefined:true olarak döndürüyor
  if (!RealmApp?.currentUser?.customData?.mailTeyit) {
    return (
      <FormMailTeyit />
    )
  }


  // mongo realm bu fonksiyonu name değeri yoksa bile name:$undefined:true gibi birşey oluşturuyor sonuçta $undefined:true olarak döndürüyor
  if (
    !RealmApp?.currentUser?.customData?.isim ||
    !RealmApp?.currentUser?.customData?.soyisim
  ) {
    return (
      <FormNewUserNecessaryData />
    )
  }



  // // mongo realm bu fonksiyonu name değeri yoksa bile name:$undefined:true gibi birşey oluşturuyor sonuçta $undefined:true olarak döndürüyor
  // const isName = typeof RealmApp?.currentUser?.customData?.name === "string" && RealmApp?.currentUser?.customData?.name.length > 0
  // // const mailTeyit = typeof RealmApp?.currentUser.customData.mailTeyit === true
  // if (!isName) {
  //   return (
  //     <>
  //       kullanıcı var, adı yok
  //       {/* {<FormProfile />} */}
  //     </>
  //   )
  // }



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleProfilim = () => {
    setShow("FormNewUserNecessaryDataUpdate")
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const clickLogOut = async () => {
    setAnchorEl(null);
    handleMobileMenuClose();
    await RealmApp?.currentUser.logOut()
    setBegan(prev => !prev)
  }

  const container = window !== undefined ? () => window().document.body : undefined;

  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));


  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
  }));


  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfilim}>{RealmApp.currentUser._profile.data.email}</MenuItem>
      {/* <MenuItem onClick={handleMenuClose}>My account</MenuItem> */}
      <MenuItem onClick={clickLogOut}>Çıkış Yap</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );


  const clearSelectedFirma = () => {
    setSelectedFirma()
    navigate("/firmalar")
  };

  const clearSelectedProject = () => {
    setSelectedLbs()
    setSelectedMahal()
    setSelectedMahalBaslik()
    setSelectedWbs()
    setSelectedPoz()
    setSelectedPozBaslik()
    setSelectedNode()
    setSelectedProje()
    pageMetraj_setShow("Pozlar")
    navigate("/projeler")
  };


  return (

    <Box sx={{ display: 'flex' }}>
      <CssBaseline />


      {/* AppBar */}
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "#3D4849",
            // width: { md: `calc(100% - ${drawerWidth}px)` },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` }
          }}
        >

          <Grid sx={{ alignItems: "center", padding: "0rem 1rem", height: topBarHeight, display: "grid", gridTemplateColumns: "auto auto 1fr auto" }}>

            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Grid>


            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={(selectedFirma && !selectedProje) ? () => clearSelectedFirma() : selectedProje ? () => clearSelectedProject() : null}
                sx={{ display: (selectedFirma || selectedProje) ? "block" : "none" }}
              >
                <UndoIcon />
              </IconButton>
            </Grid>


            {/* <Grid item>
              <Typography
                // onClick={() => selectedProje ? null : navigate('/')}
                onClick={() => navigate("/")}
                variant="h6"
                noWrap
                component="div"
                sx={{ cursor: "pointer", display: { xs: 'none', md: 'block' } }}
              >
                {selectedProje ? selectedProje.name : selectedFirma ? selectedFirma.name : "Rapor7/24"}
              </Typography>
            </Grid> */}


            <Box >

              {!selectedFirma && !selectedProje &&
                <Typography>
                  Rapor7/24
                </Typography>
              }

              {selectedFirma &&
                <Typography sx={{ fontSize: selectedProje && "0.6rem", color: selectedProje && "lightgray" }}>
                  {selectedFirma.name}
                </Typography>
              }

              {selectedProje &&
                <Typography sx={{ fontSize: "1.1rem" }}>
                  {selectedProje.name}
                </Typography>
              }

            </Box>





            <Grid item>
              {/* toolbardaki bildirim ikonları */}
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>

                <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                  <Badge badgeContent={4} color="error">
                    <MailIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  size="large"
                  aria-label="show 17 new notifications"
                  color="inherit"
                >
                  <Badge badgeContent={17} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>

              </Box>

              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </Box>

            </Grid>



          </Grid>
          {/* </Toolbar> */}
        </AppBar>

        {renderMobileMenu}
        {renderMenu}
      </Box>



      {/* drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menu"
      >

        {/* drawer */}
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Sidebar RealmApp={RealmApp} setMobileOpen={setMobileOpen} />
          {/* {drawer} */}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Sidebar setMobileOpen={setMobileOpen} />
          {/* {drawer} */}
        </Drawer>
      </Box>


      {/* index page -- main */}
      {
        show === "FormNewUserNecessaryDataUpdate" &&
        <FormProfileUpdate setShow={setShow} />
      }

      {/* index page -- main */}
      {
        show === "RootPage" &&
        <Box
          component="main"
          name="Tanimalama_Main"
          sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: topBarHeight }}
        >
          {/* ToolBar koymamızın sebebi --> AppBAr kadar aşağı margin olması için dolgu */}
          {/* Yukarıda mt:topBarHeight ile çözdük */}
          {/* <Toolbar variant='dense'></Toolbar> */}
          {children}
        </Box>
      }


      {/* <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Typography paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
          enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
          imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
          Convallis convallis tellus id interdum velit laoreet id donec ultrices.
          Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
          adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
          nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
          leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
          feugiat vivamus at augue. At augue eget arcu dictum varius duis at
          consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
          sapien faucibus et molestie ac.
        </Typography>
        <Typography paragraph>
          Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
          eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
          neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
          tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
          sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
          tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
          gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
          et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
          tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
          eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
          posuere sollicitudin aliquam ultrices sagittis orci a.
        </Typography>
      </Box> */}


    </Box >
  );
}

// Layout.propTypes = {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */
//   window: PropTypes.func,
// };

