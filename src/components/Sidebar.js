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

            {pathname.includes('/proje-ayarlari') &&
              <Box sx={{ mb: '0.25rem', borderLeft: '2px solid rgba(0,0,0,0.12)', ml: '2.75rem' }}>
                <ListItemButton
                  onClick={() => navigate('/proje-ayarlari')}
                  sx={{
                    pl: '1rem', py: '0.3rem', borderRadius: '0 6px 6px 0',
                    backgroundColor: !search.includes('s=sil') ? 'rgba(0,0,0,0.08)' : null,
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                  }}
                >
                  <ListItemText primary="Birimler" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: !search.includes('s=sil') ? 600 : 400 }} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => navigate('/proje-ayarlari?s=sil')}
                  sx={{
                    pl: '1rem', py: '0.3rem', borderRadius: '0 6px 6px 0',
                    backgroundColor: search.includes('s=sil') ? 'rgba(211,47,47,0.08)' : null,
                    '&:hover': { backgroundColor: 'rgba(211,47,47,0.08)' }
                  }}
                >
                  <ListItemText primary="Projeyi Sil" primaryTypographyProps={{ fontSize: '0.82rem', color: 'error.main', fontWeight: search.includes('s=sil') ? 600 : 400 }} />
                </ListItemButton>
              </Box>
            }

          </List>
        </Grid>
      }

    </Grid>
  );
}
