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


export default function P_MetrajOlustur() {
  const navigate = useNavigate()

  const { selectedProje, setSelectedIsPaket } = useContext(StoreContext)

  const [dialogAlert, setDialogAlert] = useState()

  const { data: isPaketler = [], isFetching, error } = useGetWorkPackages()

  useEffect(() => {
    setSelectedIsPaket(null)
    if (!selectedProje) navigate('/projeler')
  }, [])

  const css_baslik = {
    display: 'grid',
    alignItems: 'center',
    mt: '0.1rem',
    px: '0.5rem',
    backgroundColor: 'lightgray',
    fontWeight: 700,
    textWrap: 'nowrap',
    border: '1px solid black',
  }

  const css_satir = {
    display: 'grid',
    px: '0.5rem',
    border: '1px solid black',
    alignItems: 'center',
  }

  const columns = 'max-content minmax(20rem, max-content) max-content'

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
        </Grid>
      </AppBar>

      {isFetching && <LinearProgress />}

      {error && (
        <Stack sx={{ width: '100%', padding: '1rem' }}>
          <Alert severity="error">Veri alınırken hata: {error.message}</Alert>
        </Stack>
      )}

      {!isFetching && isPaketler.length === 0 && (
        <Stack sx={{ width: '100%', padding: '1rem' }}>
          <Alert severity="info">
            Henüz iş paketi oluşturulmamış. İş Paketleri sayfasından ekleyebilirsiniz.
          </Alert>
        </Stack>
      )}

      {isPaketler.length > 0 && (
        <Box sx={{ padding: '1rem', display: 'grid', gridTemplateColumns: columns }}>

          {/* Başlık satırı */}
          <Box sx={{ ...css_baslik, justifyContent: 'center' }}>Sıra</Box>
          <Box sx={{ ...css_baslik }}>İş Paketi</Box>
          <Box sx={{ ...css_baslik }}>Açıklama</Box>

          {/* Veri satırları */}
          {isPaketler.map((paket, index) => (
            <React.Fragment key={paket.id}>

              <Box sx={{ ...css_satir, justifyContent: 'center' }}>
                {index + 1}
              </Box>

              <Box
                sx={{
                  ...css_satir,
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                onClick={() => {
                  setSelectedIsPaket(paket)
                  navigate('/metrajolusturpozlar')
                }}
              >
                {paket.name}
              </Box>

              <Box sx={{ ...css_satir }}>
                {paket.description ?? ''}
              </Box>

            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  )
}
