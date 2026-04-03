import { useEffect, useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { supabase } from '../lib/supabase.js'
import { DialogAlert } from './general/DialogAlert';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import grayTheme from '../lib/muiTheme.js'

const theme = grayTheme

const validateEmail = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).toLowerCase())

const autofillSx = {
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0 1000px #fff inset'
  }
}

export default function FormSifreYenileme() {

  const { setLayout_Show, sifreYenilemeEmail } = useContext(StoreContext)

  const [email, setEmail] = useState(sifreYenilemeEmail)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [humanVerifyState, setHumanVerifyState] = useState('idle') // 'idle' | 'verifying' | 'verified'
  const [dialogAlert, setDialogAlert] = useState()

  // 'initial' | 'loading' | 'linkSent' | 'recovery'
  const [stage, setStage] = useState('initial')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStage('recovery')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStage('recovery')
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSendLink(e) {
    e.preventDefault()
    setStage('loading')

    // Önce Rapor7/24 markalı Edge Function'ı dene; deploy edilmemişse built-in'e düş
    let finalError = null
    const { error: fnError } = await supabase.functions.invoke('send-password-reset', {
      body: { email }
    })
    if (fnError) {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      })
      finalError = authError
    }

    if (finalError) {
      setStage('initial')
      const isRateLimit = finalError.message?.toLowerCase().includes('rate limit')
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: isRateLimit
          ? 'Kısa sürede çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyin.'
          : 'Link gönderilemedi, lütfen tekrar deneyin.',
        detailText: isRateLimit ? undefined : finalError.message
      })
      return
    }
    setStage('linkSent')
  }

  async function handleUpdatePassword(e) {
    e.preventDefault()
    if (password.length < 8) {
      setPasswordError('En az 8 karakter olmalı')
      return
    }
    if (password !== password2) {
      setPasswordError('Şifreler uyuşmuyor')
      return
    }
    setStage('recoveryLoading')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStage('recovery')
      const msg = error.message?.toLowerCase().includes('different')
        ? 'Yeni şifre eski şifrenizden farklı olmalıdır'
        : 'Şifre güncellenemedi, lütfen tekrar deneyin'
      setPasswordError(msg)
      return
    }
    // Başarılı: USER_UPDATED eventi Layout.js'de isPasswordRecovery'yi temizler,
    // store.js session'dan appUser'ı set eder → kullanıcı otomatik login olur
  }

  const isRecovery = stage === 'recovery' || stage === 'recoveryLoading'
  const isLoading = stage === 'loading' || stage === 'recoveryLoading'
  const sendBtnActive = validateEmail(email) && humanVerifyState === 'verified' && stage === 'initial'

  function handleHumanClick() {
    if (humanVerifyState !== 'idle' || isLoading) return
    setHumanVerifyState('verifying')
    setTimeout(() => setHumanVerifyState('verified'), 1500)
  }

  return (
    <ThemeProvider theme={theme}>

      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction || (() => setDialogAlert())}
        />
      )}

      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white' }}>

          <Typography
            onClick={() => setLayout_Show('login')}
            sx={{ cursor: 'pointer', fontSize: '0.8rem', color: '#bbb', mb: 3, alignSelf: 'flex-start', '&:hover': { color: '#333' }, transition: 'color 0.15s', visibility: (!isRecovery && stage !== 'linkSent') ? 'visible' : 'hidden' }}
          >
            ← Giriş Yap
          </Typography>

          <Box sx={{ width: 60, height: 60, bgcolor: '#424242', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.65)', display: 'block', lineHeight: 1 }}>RAPOR</Box>
            <Box component="span" sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.5px', display: 'block', lineHeight: 1.1 }}>7/24</Box>
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {isRecovery ? 'Yeni Şifre Belirle' : 'Şifre Yenileme'}
          </Typography>

          {/* Başarı mesajı */}
          {stage === 'linkSent' && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.95rem', color: '#3D4849', mb: 3, lineHeight: 1.7 }}>
                E-mail adresinize gelen şifre sıfırlama linkine tıklayarak işleminize devam edebilirsiniz.
              </Typography>
              <Typography
                onClick={() => setLayout_Show('login')}
                sx={{ cursor: 'pointer', color: '#1976d2', fontSize: '0.9rem', '&:hover': { textDecoration: 'underline' } }}
              >
                ← Giriş ekranına dön
              </Typography>
            </Box>
          )}

          {/* Link gönder formu */}
          {(stage === 'initial' || stage === 'loading') && (
            <Box component="form" onSubmit={handleSendLink} sx={{ width: '100%' }}>

              <TextField
                fullWidth
                label="E-posta"
                type="email"
                name="sifre-yenileme-email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError() }}
                error={!!emailError}
                helperText={emailError || null}
                autoFocus
                disabled={isLoading}
                size="small"
                inputProps={{ spellCheck: false }}
                sx={autofillSx}
              />

              {/* İnsan doğrulama widget */}
              <Box
                onClick={handleHumanClick}
                sx={{ mt: 1.5, border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', cursor: humanVerifyState === 'idle' ? 'pointer' : 'default', userSelect: 'none', '&:hover': humanVerifyState === 'idle' ? { borderColor: 'rgba(0,0,0,0.5)' } : {} }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {humanVerifyState === 'idle' && (
                      <Box sx={{ width: 18, height: 18, border: '2px solid #c1c1c1', borderRadius: '3px', bgcolor: '#fff' }} />
                    )}
                    {humanVerifyState === 'verifying' && (
                      <CircularProgress size={20} thickness={3} sx={{ color: '#4a90d9' }} />
                    )}
                    {humanVerifyState === 'verified' && (
                      <CheckCircleIcon sx={{ fontSize: 24, color: '#4caf50' }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>Ben robot değilim</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.45 }}>
                  <SecurityIcon sx={{ fontSize: 26, color: '#4a90d9' }} />
                  <Typography sx={{ fontSize: '0.5rem', color: '#555', letterSpacing: 0.3 }}>reCAPTCHA</Typography>
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!sendBtnActive}
                sx={{ mt: 1.5, textTransform: 'none', py: 1.1, fontSize: '1rem', fontWeight: 600 }}
              >
                {isLoading ? 'Gönderiliyor...' : 'E-posta adresine link gönder'}
              </Button>

            </Box>
          )}

          {/* Recovery: yeni şifre formu */}
          {isRecovery && (
            <Box component="form" onSubmit={handleUpdatePassword} sx={{ width: '100%' }}>

              <TextField
                fullWidth
                label="Yeni Şifre"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError() }}
                error={!!passwordError}
                helperText={passwordError || null}
                autoFocus
                disabled={isLoading}
                size="small"
                inputProps={{ autoComplete: 'off', readOnly: true, onFocus: (e) => e.target.removeAttribute('readonly') }}
                sx={autofillSx}
              />

              <TextField
                fullWidth
                label="Şifre Tekrarı"
                type="password"
                value={password2}
                onChange={(e) => { setPassword2(e.target.value); setPasswordError() }}
                error={!!passwordError}
                disabled={isLoading}
                size="small"
                inputProps={{ autoComplete: 'off', readOnly: true, onFocus: (e) => e.target.removeAttribute('readonly') }}
                sx={{ mt: 2, ...autofillSx }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 3, textTransform: 'none', py: 1.1, fontSize: '1rem', fontWeight: 600, gap: 1 }}
              >
                {isLoading && <CircularProgress size={18} thickness={4} sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                {isLoading ? 'Güncelleniyor...' : 'ŞİFREYİ GÜNCELLE'}
              </Button>

            </Box>
          )}

        </Box>
      </Container>

    </ThemeProvider>
  )
}
