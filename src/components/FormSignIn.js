import { useState, useContext } from 'react';
import { StoreContext } from './store.js'
import { DialogAlert } from './general/DialogAlert.js';
import { supabase } from '../lib/supabase.js'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import grayTheme from '../lib/muiTheme.js'

const theme = grayTheme

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())

export default function SignIn() {

  const { setLayout_Show } = useContext(StoreContext)

  const [emailValue, setEmailValue] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordError, setPasswordError] = useState()
  const [subtextError, setSubtextError] = useState()
  const [dialogAlert, setDialogAlert] = useState()
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleEmailChange(e) {
    const val = e.target.value
    setEmailValue(val)
    setEmailValid(validateEmail(val))
    setSubtextError()
    setPasswordError()
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Google ile giriş yapılamadı, lütfen tekrar deneyin.',
        detailText: error.message
      })
    }
  }

  async function handleMagicLink() {
    setLoading(true)
    const { error } = await supabase.functions.invoke('send-magic-link', {
      body: { email: emailValue }
    })
    setLoading(false)
    if (error) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Link gönderilemedi, lütfen tekrar deneyin.',
        detailText: error.message
      })
      return
    }
    setMagicLinkSent(true)
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (passwordValue.length < 8) {
      setPasswordError('En az 8 karakter olmalı')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: passwordValue
      })
      if (error) {
        if (error.message.toLowerCase().includes('invalid')) {
          setSubtextError(true)
        } else {
          throw error
        }
      }
    } catch (err) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Beklenmedik hata oluştu.',
        detailText: err?.message
      })
    }
    setLoading(false)
  }

  return (
    <ThemeProvider theme={theme}>

      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      )}

      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white' }}>

          <Typography
            onClick={() => setLayout_Show('landing')}
            sx={{ cursor: 'pointer', fontSize: '0.8rem', color: '#bbb', mb: 3, alignSelf: 'flex-start', '&:hover': { color: '#333' }, transition: 'color 0.15s' }}
          >
            ← Rapor7/24
          </Typography>

          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
            Giriş Yap
          </Typography>

          {/* Google */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            startIcon={
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
            }
            sx={{ textTransform: 'none', color: '#3c4043', borderColor: '#dadce0', bgcolor: '#fff', fontWeight: 500, fontSize: '0.9rem', '&:hover': { borderColor: '#aaa', bgcolor: '#f8f9fa' } }}
          >
            Google ile Giriş Yap
          </Button>

          <Divider sx={{ width: '100%', my: 2.5, fontSize: '0.75rem', color: '#aaa' }}>veya</Divider>

          {/* Email input */}
          <TextField
            fullWidth
            label="E-posta"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={emailValue}
            onChange={handleEmailChange}
            size="small"
          />

          {/* İki aksiyon butonu */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 1.5 }}>

            {magicLinkSent ? (
              <Box sx={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#3D4849', border: '1px solid #d0e8d0', bgcolor: '#f6fff6', p: 1.5, borderRadius: 1 }}>
                <Typography sx={{ fontSize: '0.85rem' }}>Giriş linki gönderildi — e-posta kutunuzu kontrol edin.</Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                disabled={!emailValid || loading}
                onClick={handleMagicLink}
                startIcon={<MailOutlineIcon style={{ color: emailValid ? '#0077B6' : undefined, fontSize: 17 }} />}
                sx={{ flex: 1, textTransform: 'none', color: '#3c4043', borderColor: '#dadce0', fontSize: '0.82rem', fontWeight: 500, '&:hover': { borderColor: '#0077B6', bgcolor: '#f0f7ff' }, '&:disabled': { borderColor: '#eee' } }}
              >
                E-posta linki gönder
              </Button>
            )}

            <Button
              variant="outlined"
              disabled={!emailValid}
              onClick={() => setShowPassword(v => !v)}
              startIcon={<LockOutlinedIcon style={{ color: emailValid ? '#3D4849' : undefined, fontSize: 17 }} />}
              sx={{ flex: 1, textTransform: 'none', color: '#3c4043', borderColor: showPassword ? '#3D4849' : '#dadce0', fontSize: '0.82rem', fontWeight: 500, bgcolor: showPassword ? '#f5f5f5' : '#fff', '&:hover': { borderColor: '#3D4849', bgcolor: '#f5f5f5' }, '&:disabled': { borderColor: '#eee' } }}
            >
              Şifre ile devam
            </Button>

          </Box>

          {/* Şifre alanı */}
          {showPassword && (
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ width: '100%', mt: 1.5 }}>

              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={passwordValue}
                onChange={(e) => { setPasswordValue(e.target.value); setPasswordError(); setSubtextError() }}
                error={!!passwordError || !!subtextError}
                helperText={
                  passwordError ? passwordError :
                  subtextError ? (
                    <span>
                      Şifre hatalı. <Link onClick={() => setLayout_Show('sifreYenileme')} href="#" sx={{ fontSize: '0.82rem' }}>Şifremi unuttum</Link>
                    </span>
                  ) : null
                }
                size="small"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 1.5, mb: 1, textTransform: 'none' }}
              >
                Giriş Yap
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link onClick={() => setLayout_Show('newUser')} href="#" variant="body2">
                  Yeni kullanıcı kaydı
                </Link>
              </Box>

            </Box>
          )}

        </Box>
      </Container>

    </ThemeProvider>
  )
}
