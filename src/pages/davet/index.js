import { useState, useContext, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import { StoreContext } from '../../components/store'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import BusinessIcon from '@mui/icons-material/Business'


export default function P_Davet() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { appUser } = useContext(StoreContext)

  const urlToken = searchParams.get('token')

  const [member, setMember]       = useState(null)   // firma_members row (+ firms join)
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [done, setDone]           = useState(false)
  const [name, setName]           = useState('')
  const [title, setTitle]         = useState('')
  const [dialogAlert, setDialogAlert] = useState()


  // Token → sessionStorage'a kaydet (Layout, FormSignIn'i üst üste gösterse bile çalışır)
  useEffect(() => {
    const t = urlToken ?? sessionStorage.getItem('pendingInviteToken')
    if (t) sessionStorage.setItem('pendingInviteToken', t)
  }, [urlToken])


  // AppUser hazır olunca daveti yükle
  useEffect(() => {
    if (!appUser) return
    const t = urlToken ?? sessionStorage.getItem('pendingInviteToken')
    if (!t) return
    loadInvitation(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser])


  async function loadInvitation(token) {
    setLoading(true)
    const { data, error } = await supabase
      .from('firma_members')
      .select('*, firms(name)')
      .eq('invite_token', token)
      .single()
    setLoading(false)

    if (error || !data) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: 'Davet bağlantısı geçersiz veya süresi dolmuş.',
        onCloseAction: () => { setDialogAlert(); navigate('/') },
      })
      return
    }

    if (data.user_id) {
      const msg = data.user_id === appUser.id
        ? 'Bu daveti zaten kabul ettiniz.'
        : 'Bu davet bağlantısı daha önce kullanılmış.'
      setDialogAlert({
        dialogIcon: 'info',
        dialogMessage: msg,
        onCloseAction: () => { setDialogAlert(); navigate('/') },
      })
      return
    }

    if (data.email && data.email.toLowerCase() !== appUser.email.toLowerCase()) {
      setDialogAlert({
        dialogIcon: 'warning',
        dialogMessage: `Bu davet yalnızca ${data.email} adresine gönderilmiştir. Lütfen o hesapla giriş yapın.`,
        onCloseAction: () => { setDialogAlert(); navigate('/') },
      })
      return
    }

    setMember(data)
    setName(data.name  || `${appUser.isim ?? ''} ${appUser.soyisim ?? ''}`.trim())
    setTitle(data.title || '')
  }


  async function handleAccept() {
    if (!member) return
    setSaving(true)

    const origName  = member.name  ?? ''
    const origTitle = member.title ?? ''
    const nameChanged  = name.trim()  !== origName
    const titleChanged = title.trim() !== origTitle

    // Üyeyi firmaya bağla
    const { error } = await supabase
      .from('firma_members')
      .update({
        user_id:     appUser.id,
        status:      'active',
        approved_at: new Date().toISOString(),
        approved_by: appUser.id,
      })
      .eq('id', member.id)

    if (error) {
      setSaving(false)
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Davet kabul edilemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }

    // Bilgi değişikliği varsa → talep oluştur
    if (nameChanged || titleChanged) {
      await supabase.from('firma_member_change_requests').insert({
        firma_id:       member.firma_id,
        member_id:      member.id,
        current_name:   origName,
        current_title:  origTitle,
        requested_name:  name.trim(),
        requested_title: title.trim(),
        status: 'pending',
      })
    }

    setSaving(false)
    sessionStorage.removeItem('pendingInviteToken')
    setDone(true)
  }


  // ── Davet tamamlandı ──────────────────────────────────
  if (done) {
    return (
      <Box sx={{ m: '2rem', maxWidth: '28rem' }}>
        <Paper sx={{ p: '2rem', textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: '3rem', mb: '0.75rem' }} />
          <Typography variant="h6" fontWeight="bold">Hoş geldiniz!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: '0.5rem' }}>
            <strong>{member?.firms?.name}</strong> firması kadrosuna katıldınız.
          </Typography>
          {name !== (member?.name ?? '') && (
            <Alert severity="info" sx={{ mt: '1.25rem', textAlign: 'left', fontSize: '0.8rem' }}>
              Bilgi değişikliği talebiniz firma yöneticisine iletildi. Onaylanana kadar mevcut bilgilerinizle görünürsünüz.
            </Alert>
          )}
          <Button
            variant="contained" sx={{ mt: '1.5rem', textTransform: 'none' }}
            onClick={() => navigate('/')}
          >
            Uygulamaya Git
          </Button>
        </Paper>
      </Box>
    )
  }

  // ── Henüz giriş yapılmadı (Layout üstüne FormSignIn gösterir) ──
  if (!appUser) return null

  // ── Yükleniyor ────────────────────────────────────────
  if (loading) return <LinearProgress />

  // ── Token henüz yüklenmedi ────────────────────────────
  if (!member) {
    return (
      <Box sx={{ m: '2rem' }}>
        <Typography color="text.disabled">Davet bilgileri yükleniyor…</Typography>
      </Box>
    )
  }

  const origName  = member.name  ?? ''
  const origTitle = member.title ?? ''
  const hasChanges = name.trim() !== origName || title.trim() !== origTitle


  // ── Davet onay formu ──────────────────────────────────
  return (
    <Box sx={{ m: '2rem', maxWidth: '28rem' }}>
      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Paper sx={{ p: '2rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '1.25rem' }}>
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              Kadro Daveti
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.firms?.name}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: '1.5rem' }}>
          Aşağıdaki bilgilerinizi doğrulayın veya güncelleyin. Değişiklik talebiniz firma yöneticisinin onayına sunulur.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="İsim Soyisim" size="small" fullWidth
            value={name} onChange={e => setName(e.target.value)}
          />
          <TextField
            label="Ünvan" size="small" fullWidth
            value={title} onChange={e => setTitle(e.target.value)}
          />
        </Box>

        {hasChanges && (
          <Alert severity="info" sx={{ mt: '1rem', fontSize: '0.8rem' }}>
            Önerilen bilgileri değiştirdiniz. Onaylanana kadar mevcut bilgilerinizle görünürsünüz.
          </Alert>
        )}

        <Button
          variant="contained" fullWidth disabled={saving}
          sx={{ mt: '1.5rem', textTransform: 'none' }}
          onClick={handleAccept}
        >
          {saving ? 'Kaydediliyor…' : 'Daveti Kabul Et'}
        </Button>
      </Paper>
    </Box>
  )
}
