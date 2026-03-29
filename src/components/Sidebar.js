import { useContext } from 'react';
import { StoreContext } from './store'
import { useNavigate, useLocation } from "react-router-dom";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SendIcon from '@mui/icons-material/Send';


export default function Sidebar({ setMobileOpen }) {

  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const {
    selectedFirma,
    selectedProje,
    setSelectedIsPaket
  } = useContext(StoreContext)

  let seciliSayfaRengi = "rgba(0, 0, 0, 0.14)"

  return (
    <Grid container direction="column">

      {/* Firma seçilmemişken */}
      {!selectedFirma && !selectedProje &&
        <Grid item onClick={() => setMobileOpen(false)}>
          <List>
            <ListItemButton
              onClick={() => navigate('/firmalar')}
              sx={{ backgroundColor: pathname === '/firmalar' ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Firmalar" />
            </ListItemButton>
          </List>
        </Grid>
      }

      {/* Firma seçili, proje seçilmemişken */}
      {selectedFirma && !selectedProje &&
        <Grid item onClick={() => setMobileOpen(false)}>
          <List>
            <ListItemButton
              onClick={() => navigate('/projeler')}
              sx={{ backgroundColor: pathname === '/projeler' ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Projeler" />
            </ListItemButton>
          </List>
        </Grid>
      }

      {/* Proje seçiliyken */}
      {selectedProje &&
        <Grid item onClick={() => setMobileOpen(false)}>
          <List>

            <ListItemButton
              onClick={() => navigate('/pozlar')}
              sx={{ backgroundColor: pathname === '/pozlar' ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Pozlar" />
            </ListItemButton>

            <ListItemButton
              onClick={() => navigate('/mahaller')}
              sx={{ backgroundColor: pathname === '/mahaller' ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Mahaller" />
            </ListItemButton>

            <ListItemButton
              onClick={() => { navigate('/ispaketler'); setSelectedIsPaket() }}
              sx={{ backgroundColor: pathname.includes('/ispaketler') ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="İş Paketleri" />
            </ListItemButton>

            <ListItemButton
              onClick={() => navigate('/metraj')}
              sx={{ backgroundColor: pathname.includes('/metraj') ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Metraj" />
            </ListItemButton>

            <ListItemButton
              onClick={() => navigate('/butce')}
              sx={{ backgroundColor: pathname.includes('/butce') ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Keşif / Bütçe" />
            </ListItemButton>

            <ListItemButton
              onClick={() => navigate('/proje-ayarlari')}
              sx={{ backgroundColor: pathname.includes('/proje-ayarlari') ? seciliSayfaRengi : null, '&:hover': { backgroundColor: seciliSayfaRengi } }}
            >
              <ListItemIcon><SendIcon /></ListItemIcon>
              <ListItemText primary="Proje Ayarları" />
            </ListItemButton>

            {pathname.includes('/proje-ayarlari') && (() => {
              const subItems = [
                { label: 'Profil',         route: '/proje-ayarlari',                  active: !search.includes('s=')  },
                { label: 'Para Birimleri', route: '/proje-ayarlari?s=parabirimleri',  active: search.includes('s=parabirimleri') },
                { label: 'Poz Birimleri',  route: '/proje-ayarlari?s=birimler',       active: search.includes('s=birimler') },
                { label: 'Projeyi Sil',    route: '/proje-ayarlari?s=sil',            active: search.includes('s=sil'), danger: true },
              ]
              return (
                <Box sx={{ mb: '0.25rem', mx: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {subItems.map(item => (
                    <ListItemButton key={item.label} onClick={() => navigate(item.route)} sx={{
                      py: '0.35rem', pl: '2rem', pr: '0.75rem', borderRadius: 0,
                      backgroundColor: 'rgba(0,0,0,0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        '& .MuiSvgIcon-root': { color: 'rgba(0,0,0,0.7)' },
                        '& .MuiListItemText-primary': { fontWeight: '700 !important' },
                      },
                    }}>
                      <ListItemIcon sx={{ minWidth: '36px' }}>
                        <SendIcon sx={{
                          fontSize: '0.75rem',
                          color: item.active ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)',
                          transition: 'color 0.15s ease',
                        }} />
                      </ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: item.active ? 700 : 400,
                        color: item.danger ? 'error.main' : 'text.secondary',
                        sx: {
                          '&::before': {
                            content: `"${item.label}"`,
                            display: 'block', height: 0,
                            overflow: 'hidden', fontWeight: 700, visibility: 'hidden',
                          }
                        }
                      }} />
                    </ListItemButton>
                  ))}
                </Box>
              )
            })()}

          </List>
        </Grid>
      }

    </Grid>
  );
}
