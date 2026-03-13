import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { StoreContext } from '../../components/store.js'
import { useGetMyWorkPackages, useGetUserSettings } from '../../hooks/useMongo.js'
import { supabase } from '../../lib/supabase.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import VisibilityIcon from '@mui/icons-material/Visibility'


const PAGE_KEY = 'metrajolustur'
const DEFAULT_PAGE_SETTINGS = {
  showAciklama: true,
}


export default function P_MetrajOlustur() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { appUser, selectedProje, setSelectedIsPaket } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoveredRowId, setHoveredRowId] = useState(null)

  const { data: isPaketler = [], isFetching, error } = useGetMyWorkPackages()
  const { data: userSettings = {} } = useGetUserSettings()

  const pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...(userSettings[PAGE_KEY] ?? {}) }

  useEffect(() => {
    setSelectedIsPaket(null)
    if (!selectedProje) navigate('/projeler')
  }, [])

  const savePageSetting = async (key, value) => {
    const newPageSettings = { ...pageSettings, [key]: value }
    const newSettings = { ...userSettings, [PAGE_KEY]: newPageSettings }

    queryClient.setQueryData(['userSettings', appUser?.id], newSettings)

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: appUser.id, settings: newSettings, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (error) {
      queryClient.setQueryData(['userSettings', appUser?.id], userSettings)
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Ayar kaydedilemedi.',
        detailText: error.message,
        onCloseAction: () => setDialogAlert(),
      })
    }
  }

  const columns = [
    'max-content',
    'minmax(18rem, max-content)',
    pageSettings.showAciklama ? 'minmax(14rem, max-content)' : null,
  ].filter(Boolean).join(' ')

  const css_baslik = {
    display: 'flex',
    alignItems: 'center',
    px: '0.6rem',
    py: '0.3rem',
    backgroundColor: '#c8c8c8',
    fontWeight: 700,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    borderBottom: '1px solid #aaa',
    whiteSpace: 'nowrap',
  }

  const css_satir_bg = '#f2f2f2'

  return (
    <Box sx={{ minWidth: '40rem' }}>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* Görünüm Ayarları Dialog'u */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} PaperProps={{ sx: { position: 'fixed', top: '10rem' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Görünüm Ayarları</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: '0 !important' }}>
          <List disablePadding>
            <ListItem
              secondaryAction={
                <Switch
                  checked={pageSettings.showAciklama}
                  onChange={(e) => savePageSetting('showAciklama', e.target.checked)}
                />
              }
            >
              <ListItemText primary="Açıklama sütunu" />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>

      {/* BAŞLIK */}
      <AppBar
        position="static"
        sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: '0.5rem 1rem', maxHeight: '5rem' }}
        >
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Metraj Oluştur
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 18, mx: '0.1rem' }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, opacity: 0.3, whiteSpace: 'nowrap' }}
              >
                İş Paketi Seçin
              </Typography>
            </Box>
          </Grid>

          <Grid item xs="auto">
            <IconButton sx={{ width: 40, height: 40 }} onClick={() => setSettingsOpen(true)}>
              <VisibilityIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>

      {isFetching && <LinearProgress />}

      {error && (
        <Stack sx={{ width: '100%', padding: '1rem' }}>
          <Alert severity="error">Veri alınırken hata: {error.message}</Alert>
        </Stack>
      )}

      {!isFetching && !error && isPaketler.length === 0 && (
        <Stack sx={{ width: '100%', padding: '1rem' }}>
          <Alert severity="info">
            Metraj yapabileceğiniz iş paketi bulunmuyor. Proje yöneticisi sizi bir iş paketine üye etmelidir.
          </Alert>
        </Stack>
      )}

      {isPaketler.length > 0 && (
        <Box sx={{ padding: '1rem', width: 'fit-content', minWidth: '40rem', maxWidth: '60rem' }}>
          {/* Tek grid konteyneri — başlık + tüm satırlar hizalı */}
          <Box sx={{ display: 'grid', gridTemplateColumns: columns }}>

            {/* Başlık hücreleri */}
            <Box sx={{ ...css_baslik, justifyContent: 'center' }}>Sıra</Box>
            <Box sx={{ ...css_baslik }}>İş Paketi</Box>
            {pageSettings.showAciklama && <Box sx={{ ...css_baslik }}>Açıklama</Box>}

            {/* Veri satırları */}
            {isPaketler.map((paket, index) => {
              const isHovered = hoveredRowId === paket.id
              const rowBg = isHovered ? '#e0ecff' : css_satir_bg
              const rowHandlers = {
                onMouseEnter: () => setHoveredRowId(paket.id),
                onMouseLeave: () => setHoveredRowId(null),
              }

              return (
                <React.Fragment key={paket.id}>
                  <Box
                    {...rowHandlers}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      px: '0.6rem', py: '0.4rem',
                      borderBottom: '1px solid #ddd',
                      backgroundColor: rowBg,
                      fontSize: '0.85rem', color: '#888',
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Box
                    {...rowHandlers}
                    sx={{
                      display: 'flex', alignItems: 'center',
                      px: '0.6rem', py: '0.4rem',
                      borderBottom: '1px solid #ddd',
                      backgroundColor: rowBg,
                      cursor: 'pointer',
                      gap: '0.5rem',
                    }}
                    onClick={() => {
                      setSelectedIsPaket(paket)
                      navigate('/metrajolusturpozlar')
                    }}
                  >
                    <Typography variant="body2">
                      {paket.name}
                    </Typography>
                    {paket.code && (
                      <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
                        {paket.code}
                      </Typography>
                    )}
                  </Box>

                  {pageSettings.showAciklama && (
                    <Box
                      {...rowHandlers}
                      sx={{
                        display: 'flex', alignItems: 'center',
                        px: '0.6rem', py: '0.4rem',
                        borderBottom: '1px solid #ddd',
                        backgroundColor: rowBg,
                        fontSize: '0.85rem', color: '#555',
                      }}
                    >
                      {paket.description ?? ''}
                    </Box>
                  )}
                </React.Fragment>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}
