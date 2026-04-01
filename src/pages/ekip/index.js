import { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetProjectMembers, useGetWorkPackages, useGetIhaleInvitations } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'


function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}


export default function P_Ekip() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { appUser, selectedProje } = useContext(StoreContext)

  const s = searchParams.get('s') ?? ''
  const section = s === 'is-paketleri' ? 'is-paketleri' : s === 'ihale' ? 'ihale' : 'yetkililer'

  const { data: members = [], isLoading: membersLoading } = useGetProjectMembers()
  const { data: workPackages = [], isLoading: wpsLoading } = useGetWorkPackages()
  const { data: invitations = [], isLoading: invitationsLoading } = useGetIhaleInvitations()

  const [dialogAlert, setDialogAlert] = useState()
  const [addEmails, setAddEmails] = useState({})   // key: `${role}_${wpId ?? 'null'}`
  const [saving, setSaving] = useState(false)
  const [selectedWpId, setSelectedWpId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteWpId, setInviteWpId] = useState('')
  const [copiedToken, setCopiedToken] = useState(null)

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [selectedProje, navigate])


  function membersFor(role, wpId) {
    return members.filter(m =>
      m.role === role &&
      (wpId == null ? !m.work_package_id : m.work_package_id === wpId)
    )
  }

  function emailVal(role, wpId) {
    return addEmails[`${role}_${wpId ?? 'null'}`] ?? ''
  }

  function setEmailVal(role, wpId, val) {
    setAddEmails(prev => ({ ...prev, [`${role}_${wpId ?? 'null'}`]: val }))
  }


  async function handleAddMember(role, wpId) {
    const email = emailVal(role, wpId).trim().toLowerCase()
    if (!email) return

    setSaving(true)

    const { data: userMatch } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()

    const { error } = await supabase.from('project_members').insert({
      project_id: selectedProje.id,
      email,
      role,
      work_package_id: wpId ?? null,
      user_id: userMatch?.user_id ?? null,
      invited_by: appUser.id,
    })

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        setDialogAlert({ dialogIcon: 'info', dialogMessage: 'Bu kişi zaten bu role sahip.', onCloseAction: () => setDialogAlert() })
      } else {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Eklenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      }
      return
    }

    setEmailVal(role, wpId, '')
    queryClient.invalidateQueries(['projectMembers', selectedProje.id])
  }


  async function handleRemoveMember(memberId) {
    const target = members.find(m => m.id === memberId)
    if (target?.role === 'admin' && !target?.work_package_id) {
      const adminCount = members.filter(m => m.role === 'admin' && !m.work_package_id).length
      if (adminCount <= 1) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'En az bir "Proje Yöneticisi" bulunmalıdır.', onCloseAction: () => setDialogAlert() })
        return
      }
    }
    const { error } = await supabase.from('project_members').delete().eq('id', memberId)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kaldırılamadı.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['projectMembers', selectedProje.id])
  }


  async function handleSendIhaleInvite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !inviteWpId) return

    setSaving(true)
    const { error } = await supabase.from('ihale_invitations').insert({
      work_package_id: inviteWpId,
      email,
      invited_by: appUser.id,
    })
    setSaving(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Davet oluşturulamadı.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }

    setInviteEmail('')
    setInviteWpId('')
    queryClient.invalidateQueries(['ihaleInvitations', selectedProje.id])
  }


  function handleCopyLink(token) {
    const link = `${window.location.origin}/ihale/davet/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }


  function RoleCard({ role, wpId, title }) {
    const list = membersFor(role, wpId ?? null)
    return (
      <Paper variant="outlined" sx={{ p: '1.25rem', mb: '1rem', maxWidth: '40rem' }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: '0.75rem', color: 'text.secondary' }}>
          {title}
        </Typography>

        {list.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ mb: '0.5rem', fontStyle: 'italic' }}>
            Henüz kimse eklenmedi.
          </Typography>
        )}

        {list.map(m => (
          <Box key={m.id} sx={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            py: '0.3rem', borderBottom: '1px solid', borderColor: 'divider'
          }}>
            <Typography variant="body2" sx={{ flex: 1 }}>{m.email}</Typography>
            {m.user_id
              ? <Chip size="small" label="Kayıtlı" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
              : <Chip size="small" label="Davetli" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px', color: 'text.disabled', borderColor: 'divider' }} />
            }
            <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', minWidth: '130px', textAlign: 'right' }}>
              {formatDate(m.created_at)}
            </Typography>
            <IconButton size="small" onClick={() => handleRemoveMember(m.id)} disabled={saving}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mt: '0.75rem' }}>
          <TextField
            size="small" variant="standard"
            label="E-posta ile ekle"
            value={emailVal(role, wpId ?? null)}
            onChange={e => setEmailVal(role, wpId ?? null, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddMember(role, wpId ?? null) }}
            disabled={saving}
            sx={{ flex: 1 }}
          />
          <IconButton
            onClick={() => handleAddMember(role, wpId ?? null)}
            disabled={!emailVal(role, wpId ?? null).trim() || saving}
            size="small"
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      </Paper>
    )
  }


  return (
    <Box sx={{ m: '0rem' }}>
      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Ekip / Yetki</Typography>
        </Box>
      </Paper>

      {(membersLoading || wpsLoading) && <LinearProgress />}

      {/* ── PROJE YETKİLİLERİ ──────────────────────────────── */}
      {section === 'yetkililer' &&
        <Box sx={{ m: '1rem' }}>
          <RoleCard role="admin" wpId={null} title="Proje Yöneticileri" />
          <RoleCard role="metraj_hazirlayan" wpId={null} title="Metraj Hazırlayanlar (Proje Geneli)" />
          <RoleCard role="metraj_onaylayan" wpId={null} title="Metraj Onaylayanlar (Proje Geneli)" />
        </Box>
      }

      {/* ── İŞ PAKETİ ROLLERİ ─────────────────────────────── */}
      {section === 'is-paketleri' &&
        <Box sx={{ m: '1rem' }}>
          <Paper variant="outlined" sx={{ p: '1rem', mb: '1.25rem', maxWidth: '40rem' }}>
            <FormControl size="small" fullWidth>
              <InputLabel>İş Paketi Seç</InputLabel>
              <Select
                value={selectedWpId}
                label="İş Paketi Seç"
                onChange={e => setSelectedWpId(e.target.value)}
              >
                {workPackages.map(wp => (
                  <MenuItem key={wp.id} value={wp.id}>{wp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {selectedWpId && <>
            <RoleCard role="metraj_hazirlayan" wpId={selectedWpId} title="Metraj Hazırlayanlar (Bu İş Paketi)" />
            <RoleCard role="metraj_onaylayan" wpId={selectedWpId} title="Metraj Onaylayanlar (Bu İş Paketi)" />
          </>}

          {!selectedWpId &&
            <Typography variant="body2" color="text.disabled" sx={{ ml: '0.25rem' }}>
              Rol atamak için bir iş paketi seçin.
            </Typography>
          }
        </Box>
      }

      {/* ── İHALE DAVETLERİ ───────────────────────────────── */}
      {section === 'ihale' &&
        <Box sx={{ m: '1rem' }}>

          <Paper variant="outlined" sx={{ p: '1.25rem', mb: '1.25rem', maxWidth: '40rem' }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: '1rem', color: 'text.secondary' }}>
              Yeni İhale Daveti
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <TextField
                size="small" label="E-posta adresi"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                disabled={saving}
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel>İş Paketi</InputLabel>
                <Select
                  value={inviteWpId}
                  label="İş Paketi"
                  onChange={e => setInviteWpId(e.target.value)}
                  disabled={saving}
                >
                  {workPackages.map(wp => (
                    <MenuItem key={wp.id} value={wp.id}>{wp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained" size="small"
                onClick={handleSendIhaleInvite}
                disabled={!inviteEmail.trim() || !inviteWpId || saving}
                sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
              >
                Davet Linki Oluştur
              </Button>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ maxWidth: '64rem' }}>
            <Box sx={{ px: '1.25rem', py: '0.75rem', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                Gönderilen Davetler
                {invitations.length > 0 && (
                  <Box component="span" sx={{
                    ml: '0.5rem', fontSize: '0.72rem', color: 'white',
                    backgroundColor: 'text.secondary', px: '0.4rem', py: '0.1rem', borderRadius: '10px'
                  }}>
                    {invitations.length}
                  </Box>
                )}
              </Typography>
            </Box>

            {invitationsLoading && <LinearProgress />}

            {!invitationsLoading && invitations.length === 0 &&
              <Typography variant="body2" color="text.disabled" sx={{ p: '1.25rem', fontStyle: 'italic' }}>
                Henüz davet oluşturulmadı.
              </Typography>
            }

            {invitations.map(inv => (
              <Box key={inv.id} sx={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                px: '1.25rem', py: '0.6rem',
                borderBottom: '1px solid', borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Typography variant="body2" sx={{ minWidth: '200px' }}>{inv.email}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {inv.work_packages?.name ?? '—'}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                  {formatDate(inv.created_at)}
                </Typography>
                {inv.accepted_at
                  ? <Chip
                      size="small" icon={<CheckCircleOutlineIcon />}
                      label="Kabul edildi" color="success" variant="outlined"
                      sx={{ fontSize: '0.72rem', height: '22px' }}
                    />
                  : <Chip
                      size="small" icon={<HourglassEmptyIcon />}
                      label="Bekliyor" variant="outlined"
                      sx={{ fontSize: '0.72rem', height: '22px', color: 'text.disabled', borderColor: 'divider' }}
                    />
                }
                <Tooltip title={copiedToken === inv.token ? 'Kopyalandı!' : 'Linki Kopyala'}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyLink(inv.token)}
                      disabled={!!inv.accepted_at}
                    >
                      <ContentCopyIcon fontSize="small" sx={{ color: copiedToken === inv.token ? 'success.main' : undefined }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </Paper>

        </Box>
      }

    </Box>
  )
}
