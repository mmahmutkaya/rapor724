import { useContext } from 'react'
import { StoreContext } from './store.js'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function LandingPage() {
  const { setLayout_Show } = useContext(StoreContext)

  const goToApp = () => {
    if (window.location.hostname === 'localhost' && window.location.port !== '3000') {
      window.location.href = 'http://localhost:3000'
    } else {
      setLayout_Show('login')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 6 },
          py: 3,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#111',
            userSelect: 'none',
          }}
        >
          Rapor<span style={{ color: '#aaa', fontWeight: 400 }}>7/24</span>
        </Typography>

        <Typography
          onClick={() => goToApp()}
          sx={{
            fontSize: '0.85rem',
            color: '#666',
            cursor: 'pointer',
            transition: 'color 0.15s',
            '&:hover': { color: '#111' },
          }}
        >
          Giriş Yap
        </Typography>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          py: 8,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#aaa',
            fontWeight: 500,
            mb: 4,
          }}
        >
          İnşaat Proje Yönetimi
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#111',
            mb: 4,
          }}
        >
          Projelerinizi
          <br />
          <span style={{ color: '#bbb' }}>kontrol altına alın.</span>
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: '#888',
            maxWidth: 500,
            lineHeight: 1.8,
            mb: 6,
          }}
        >
          Poz tanımları, metraj iş akışları, mahal yönetimi,
          iş paketleri ve bütçe takibi — tek platformda.
        </Typography>

        {/* The portal */}
        <Button
          onClick={() => goToApp()}
          disableElevation
          disableRipple
          sx={{
            bgcolor: '#111',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            px: 6,
            py: 1.75,
            borderRadius: '2px',
            textTransform: 'none',
            transition: 'background 0.2s',
            '&:hover': { bgcolor: '#333' },
            mb: 2.5,
          }}
        >
          Uygulamaya Gir
        </Button>

        <Typography
          onClick={() => setLayout_Show('newUser')}
          sx={{
            fontSize: '0.82rem',
            color: '#bbb',
            cursor: 'pointer',
            transition: 'color 0.15s',
            '&:hover': { color: '#555' },
          }}
        >
          Hesabınız yok mu?{' '}
          <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Üye olun
          </span>
        </Typography>
      </Box>

      {/* Feature strip */}
      <Box
        sx={{
          borderTop: '1px solid #f0f0f0',
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {[
          { label: 'Metraj', desc: 'Hazırla, onayla, takip et' },
          { label: 'İş Paketi', desc: 'Poz bazlı bütçe yönetimi' },
          { label: 'WBS & LBS', desc: 'Yapı kırılım hiyerarşisi' },
          { label: 'Çoklu Kullanıcı', desc: 'Ekip bazlı iş akışı' },
        ].map((item, i) => (
          <Box
            key={item.label}
            sx={{
              px: 4,
              py: 3,
              borderRight: { md: i < 3 ? '1px solid #f0f0f0' : 'none' },
              borderBottom: { xs: i < 2 ? '1px solid #f0f0f0' : 'none', md: 'none' },
            }}
          >
            <Typography
              sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#222', mb: 0.5 }}
            >
              {item.label}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#aaa' }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
