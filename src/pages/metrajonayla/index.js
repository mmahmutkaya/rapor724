
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../components/store.js'
import { useGetWorkPackages } from '../../hooks/useMongo.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'


export default function P_MetrajOnayla() {
  const navigate = useNavigate()
  const { selectedProje, setSelectedIsPaket } = useContext(StoreContext)
  const [dialogAlert, setDialogAlert] = useState()

  const { data: isPaketler = [], isFetching, error } = useGetWorkPackages()

  useEffect(() => {
    setSelectedIsPaket(null)
    if (!selectedProje) navigate('/projeler')
  }, [])

  const css_baslik = {
    display: 'flex',
    alignItems: 'center',
    px: '0.6rem',
    py: '0.3rem',
    backgroundColor: '#e0e0e0',
    fontWeight: 700,
    fontSize: '0.8rem',
    borderBottom: '1px solid #bbb',
    whiteSpace: 'nowrap',
  }

  const columns = 'max-content minmax(18rem, max-content) minmax(14rem, auto)'

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

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
                Metraj Onayla
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
            Bu projede henüz iş paketi oluşturulmamış.
          </Alert>
        </Stack>
      )}

      {isPaketler.length > 0 && (
        <Box sx={{ padding: '1rem', maxWidth: '60rem' }}>

          {/* Başlık satırı */}
          <Box sx={{ display: 'grid', gridTemplateColumns: columns }}>
            <Box sx={{ ...css_baslik, justifyContent: 'center' }}>Sıra</Box>
            <Box sx={{ ...css_baslik }}>İş Paketi</Box>
            <Box sx={{ ...css_baslik }}>Açıklama</Box>
          </Box>

          {/* Veri satırları */}
          {isPaketler.map((paket, index) => (
            <Box
              key={paket.id}
              sx={{ display: 'grid', gridTemplateColumns: columns }}
            >
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  px: '0.6rem', py: '0.4rem',
                  borderBottom: '1px solid #eee',
                  fontSize: '0.85rem', color: '#888',
                }}
              >
                {index + 1}
              </Box>

              <Box
                sx={{
                  display: 'flex', alignItems: 'center',
                  px: '0.6rem', py: '0.4rem',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  gap: '0.5rem',
                  '&:hover': { backgroundColor: '#f0f7ff' },
                }}
                onClick={() => {
                  setSelectedIsPaket(paket)
                  navigate('/metrajonaylapozlar')
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {paket.name}
                </Typography>
                {paket.code && (
                  <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
                    {paket.code}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex', alignItems: 'center',
                  px: '0.6rem', py: '0.4rem',
                  borderBottom: '1px solid #eee',
                  fontSize: '0.85rem', color: '#555',
                }}
              >
                {paket.description ?? ''}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
