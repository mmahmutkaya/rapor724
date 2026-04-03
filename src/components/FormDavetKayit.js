import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { DialogAlert } from './general/DialogAlert.js'
import { ThemeProvider } from '@mui/material/styles'
import grayTheme from '../lib/muiTheme.js'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import BusinessIcon from '@mui/icons-material/Business'


export default function FormDavetKayit() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState('loading') // loading | form | magicSent | confirmSent | invalid
  const [email, setEmail] = useState('')
  const [firmaName, setFirmaName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dialogAlert, setDialogAlert] = useState()

  useEffect(() => {
    // URL'den oku (race condition yok), fallback olarak sessionStorage
    const token = searchParams.get('token') || sessionStorage.getItem('pendingInviteToken')
    if (!token) { setStep('invalid'); return }
    // İlerideki sayfa yenileme için kaydet
    sessionStorage.setItem('pendingInviteToken', token)

    supabase.functions.invoke('get-invite-info', { body: { token } })
      .then(({ data, error }) => {
        if (error || data?.error) { setStep('invalid'); return }
        setEmail(data.email ?? '')
        setFirmaName(data.firma_name ?? '')
        setStep('form')
      })
  }, [])

  async function handlePasswordSubmit() {
    if (password.length < 8) { setPasswordError('En az 8 karakter olmalı'); return }
    if (password !== confirmPassword) { setPasswordError('Şifreler eşleşmiyor'); return }

    setSaving(true)

    // Önce giriş yapmayı dene (zaten hesabı varsa)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (!signInErr) { setSaving(false); return } // onAuthStateChange appUser'ı set eder

    // Hesap yoksa kayıt ol
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
    setSaving(false)

    if (signUpErr) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Hesap oluşturulamadı, lütfen tekrar deneyin.',
        detailText: signUpErr.message,
        onCloseAction: () => setDialogAlert(),
      })
      return
    }

    if (!data.session) {
      // Supabase e-posta onayı gerektiriyor → onay maili gönderildi
      setStep('confirmSent')
    }
    // session varsa → onAuthStateChange appUser'ı set eder → Layout normal akışa geçer
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/davet' },
    })
    if (error) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Google ile giriş yapılamadı, lütfen tekrar deneyin.',
        detailText: error.message,
        onCloseAction: () => setDialogAlert(),
      })
    }
  }

  async function handleMagicLink() {
    setSaving(true)
    const { error } = await supabase.functions.invoke('send-magic-link', {
      body: { email },
    })
    setSaving(false)
    if (error) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Link gönderilemedi, lütfen tekrar deneyin.',
        detailText: error.message,
        onCloseAction: () => setDialogAlert(),
      })
      return
    }
    setStep('magicSent')
  }


  if (step === 'loading') return <LinearProgress sx={{ mt: 1 }} />

  if (step === 'invalid') {
    return (
      <Box sx={{ m: 4 }}>
        <Typography color="error" variant="body2">
          Davet bağlantısı geçersiz veya süresi dolmuş.
        </Typography>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={grayTheme}>
      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white' }}>

          {/* Logo */}
          <Box sx={{ width: 60, height: 60, bgcolor: '#424242', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.65)', display: 'block', lineHeight: 1 }}>RAPOR</Box>
            <Box component="span" sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.5px', display: 'block', lineHeight: 1.1 }}>7/24</Box>
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 0.5, fontWeight: 500 }}>
            Kadro Daveti
          </Typography>

          {firmaName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
              <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{firmaName}</Typography>
            </Box>
          )}

          {step === 'magicSent' ? (
            <Box sx={{ width: '100%', textAlign: 'center', border: '1px solid #d0e8d0', bgcolor: '#f6fff6', p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#3D4849' }}>
                <strong>{email}</strong> adresine giriş linki gönderildi.<br />
                Linke tıkladığınızda giriş yapılmış olacaktır.
              </Typography>
            </Box>
          ) : step === 'confirmSent' ? (
            <Box sx={{ width: '100%', textAlign: 'center', border: '1px solid #d0e8d0', bgcolor: '#f6fff6', p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#3D4849' }}>
                Hesabınız oluşturuldu.<br />
                <strong>{email}</strong> adresine doğrulama linki gönderildi.<br />
                Onayladıktan sonra davet bağlantısını tekrar açın.
              </Typography>
            </Box>
          ) : (
            <>
              {/* E-posta — readonly */}
              <TextField
                fullWidth
                label="E-posta"
                value={email}
                size="small"
                inputProps={{ readOnly: true, spellCheck: false }}
                sx={{ mb: 1.5 }}
              />

              {/* Şifre */}
              <TextField
                fullWidth
                label="Şifre belirle"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                error={!!passwordError}
                size="small"
                sx={{ mb: 1.5 }}
                inputProps={{ autoComplete: 'off', readOnly: true, onFocus: e => e.target.removeAttribute('readonly') }}
              />

              {/* Şifre tekrar */}
              <TextField
                fullWidth
                label="Şifre tekrar"
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPasswordError('') }}
                error={!!passwordError}
                helperText={passwordError || null}
                size="small"
                sx={{ mb: 1.5 }}
                inputProps={{ autoComplete: 'off', readOnly: true, onFocus: e => e.target.removeAttribute('readonly') }}
              />

              <Button
                fullWidth
                variant="contained"
                disabled={saving || !password}
                onClick={handlePasswordSubmit}
                sx={{ mb: 1, textTransform: 'none' }}
              >
                {saving ? 'Giriş yapılıyor…' : 'Giriş Yap / Kayıt Ol'}
              </Button>

              <Divider sx={{ width: '100%', my: 2, fontSize: '0.75rem', color: '#aaa' }}>veya</Divider>

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
                sx={{ textTransform: 'none', color: '#3c4043', borderColor: '#dadce0', bgcolor: '#fff', fontWeight: 500, fontSize: '0.9rem', mb: 1.5, '&:hover': { borderColor: '#aaa', bgcolor: '#f8f9fa' } }}
              >
                Google ile Giriş Yap
              </Button>

              {/* Magic link */}
              <Button
                fullWidth
                variant="outlined"
                disabled={saving}
                onClick={handleMagicLink}
                startIcon={<MailOutlineIcon style={{ color: '#0077B6', fontSize: 17 }} />}
                sx={{ textTransform: 'none', color: '#3c4043', borderColor: '#dadce0', fontSize: '0.9rem', fontWeight: 500, '&:hover': { borderColor: '#0077B6', bgcolor: '#f0f7ff' } }}
              >
                E-Posta Link ile Giriş Yap
              </Button>
            </>
          )}

        </Box>
      </Container>
    </ThemeProvider>
  )
}
