import { useState, useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import * as XLSX from 'xlsx'

import { StoreContext } from '../../components/store'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DownloadIcon from '@mui/icons-material/Download'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function DurumChip({ status }) {
  if (status === 'active')
    return <Chip size="small" label="Aktif" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
  if (status === 'inactive')
    return <Chip size="small" label="Pasif" color="error" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
  if (status === 'invite_read')
    return <Chip size="small" label="Daveti Okudu" color="info" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
  if (status === 'pending')
    return <Chip size="small" label="Onay Bekliyor" color="warning" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
  return <Chip size="small" label="Davet Gönderildi" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px', color: 'text.disabled', borderColor: 'divider' }} />
}


export default function P_FirmaKadro() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUser, selectedFirma } = useContext(StoreContext)
  const fileInputRef = useRef()

  useEffect(() => {
    if (!selectedFirma) navigate('/firmalar')
  }, [selectedFirma, navigate])

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['firmaMembers', selectedFirma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firma_members')
        .select('*')
        .eq('firma_id', selectedFirma.id)
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!selectedFirma && !!appUser,
    refetchOnWindowFocus: false,
  })

  const [dialogAlert, setDialogAlert] = useState()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName]   = useState('')
  const [inviteTitle, setInviteTitle] = useState('')
  const [saving, setSaving] = useState(false)

  // satır düzenleme
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName]   = useState('')
  const [editTitle, setEditTitle] = useState('')

  const [importPreview, setImportPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const { data: changeRequests = [] } = useQuery({
    queryKey: ['firmaChangeRequests', selectedFirma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firma_member_change_requests')
        .select('*, firma_members(email)')
        .eq('firma_id', selectedFirma.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!selectedFirma && !!appUser,
    refetchOnWindowFocus: false,
  })

  const currentUserInList = members.some(m => m.email?.toLowerCase() === appUser?.email?.toLowerCase())


  // ── TEK DAVET ─────────────────────────────────────────
  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return
    setSaving(true)
    const { data: inserted, error } = await supabase
      .from('firma_members')
      .insert({
        firma_id: selectedFirma.id,
        email,
        name: inviteName.trim(),
        status: 'invited',
        invited_by: appUser.id,
        title: inviteTitle.trim(),
      })
      .select('invite_token, name')
      .single()
    setSaving(false)
    if (error) {
      if (error.code === '23505') {
        setDialogAlert({ dialogIcon: 'info', dialogMessage: 'Bu e-posta adresi zaten kadrodaki.', onCloseAction: () => setDialogAlert() })
      } else {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Davet gönderilemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      }
      return
    }
    setInviteEmail(''); setInviteName(''); setInviteTitle('')
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }


  // ── KENDİNİ LİSTEYE EKLE (yönetici) ──────────────────
  async function handleAddSelf() {
    setSaving(true)
    const { error } = await supabase.from('firma_members').insert({
      firma_id: selectedFirma.id,
      email: appUser.email,
      name: `${appUser.isim} ${appUser.soyisim}`.trim(),
      title: 'Firma Yöneticisi',
      status: 'active',
      invited_by: appUser.id,
      approved_by: appUser.id,
      approved_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Eklenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }


  // ── ONAY / RED ────────────────────────────────────────
  async function handleApprove(memberId) {
    setSaving(true)
    const { error } = await supabase
      .from('firma_members')
      .update({ status: 'active', approved_by: appUser.id, approved_at: new Date().toISOString() })
      .eq('id', memberId)
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Onaylanamadı.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }

  async function handleRemove(memberId) {
    setSaving(true)
    const { error } = await supabase.from('firma_members').delete().eq('id', memberId)
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İşlem başarısız.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }

  async function handleToggleActive(member) {
    const newStatus = member.status === 'inactive' ? 'active' : 'inactive'
    setSaving(true)
    const { error } = await supabase.from('firma_members').update({ status: newStatus }).eq('id', member.id)
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Durum güncellenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }


  // ── UNVAN/İSİM DÜZENLE ────────────────────────────────
  async function handleSaveEdit(memberId) {
    setSaving(true)
    const { error } = await supabase
      .from('firma_members')
      .update({ name: editName.trim(), title: editTitle.trim() })
      .eq('id', memberId)
    setSaving(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Kaydedilemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setEditingId(null)
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }


  // ── DEĞİŞİKLİK TALEBİ ONAYLA ─────────────────────────
  async function handleApproveChangeRequest(req) {
    setSaving(true)
    await supabase.from('firma_members')
      .update({ name: req.requested_name, title: req.requested_title })
      .eq('id', req.member_id)
    await supabase.from('firma_member_change_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: appUser.id })
      .eq('id', req.id)
    setSaving(false)
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
    queryClient.invalidateQueries(['firmaChangeRequests', selectedFirma.id])
  }

  async function handleRejectChangeRequest(reqId) {
    setSaving(true)
    await supabase.from('firma_member_change_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: appUser.id })
      .eq('id', reqId)
    setSaving(false)
    queryClient.invalidateQueries(['firmaChangeRequests', selectedFirma.id])
  }


  // ── EXCEL ŞABLON ──────────────────────────────────────
  function handleDownloadTemplate() {
    const wb = XLSX.utils.book_new()
    const wsData = [
      ['İsim Soyisim', 'E-posta', 'Unvan'],
      ['Ahmet Yılmaz', 'ahmet@ornek.com', 'İnşaat Mühendisi'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 30 }]
    const hStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'D9E1F2' } } }
    ;['A1', 'B1', 'C1'].forEach(cell => { if (ws[cell]) ws[cell].s = hStyle })
    const exStyle = { font: { color: { rgb: '999999' }, italic: true } }
    ;['A2', 'B2', 'C2'].forEach(cell => { if (ws[cell]) ws[cell].s = exStyle })
    XLSX.utils.book_append_sheet(wb, ws, 'Kadro')
    XLSX.writeFile(wb, `kadro_sablonu_${selectedFirma?.name ?? 'firma'}.xlsx`)
  }


  // ── EXCEL YÜKLE ───────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' })
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
        const existingEmails = new Set(members.map(m => m.email.toLowerCase()))

        const valid = [], invalid = []

        rows.forEach((row, idx) => {
          const emailKey = Object.keys(row).find(k => k.trim().toLowerCase().replace(/\s/g,'') === 'e-posta')
          const nameKey  = Object.keys(row).find(k => k.trim().toLowerCase().includes('isim'))
          const titleKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'unvan')

          const email = String(row[emailKey] ?? '').trim().toLowerCase()
          const name  = String(row[nameKey]  ?? '').trim()
          const title = String(row[titleKey] ?? '').trim()

          if (!email) {
            invalid.push({ rowNum: idx + 2, email: '(boş)', name, title, reason: 'E-posta boş' }); return
          }
          if (!EMAIL_RE.test(email)) {
            invalid.push({ rowNum: idx + 2, email, name, title, reason: 'Geçersiz e-posta' }); return
          }
          if (existingEmails.has(email)) {
            invalid.push({ rowNum: idx + 2, email, name, title, reason: 'Zaten kadrodaki' }); return
          }
          if (valid.find(v => v.email === email)) {
            invalid.push({ rowNum: idx + 2, email, name, title, reason: 'Dosyada tekrar eden e-posta' }); return
          }
          valid.push({ rowNum: idx + 2, email, name, title })
        })

        setImportPreview({ valid, invalid })
      } catch (err) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Dosya okunamadı.', detailText: err.message, onCloseAction: () => setDialogAlert() })
      }
    }
    reader.readAsArrayBuffer(file)
  }


  // ── EXCEL IMPORT ONAYLA ───────────────────────────────
  async function handleConfirmImport() {
    if (!importPreview?.valid?.length) return
    setImporting(true)
    const rows = importPreview.valid.map(v => ({
      firma_id:   selectedFirma.id,
      email:      v.email,
      name:       v.name,
      title:      v.title,
      status:     'invited',
      invited_by: appUser.id,
    }))
    const { data, error } = await supabase
      .from('firma_members')
      .insert(rows)
      .select('email, invite_token, name')
    setImporting(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İçe aktarma başarısız.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setImportPreview(null)
    setImportResult({ added: data?.length ?? rows.length, skipped: importPreview.invalid.length })
    queryClient.invalidateQueries(['firmaMembers', selectedFirma.id])
  }


  // ── TABLO HEADs ───────────────────────────────────────
  const thSx = { fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary', py: '0.5rem', whiteSpace: 'nowrap' }
  const tdSx = { fontSize: '0.82rem', py: '0.4rem' }


  return (
    <Box>
      {dialogAlert && <DialogAlert {...dialogAlert} />}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* BAŞLIK */}
      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Firma Kadrosu</Typography>
        </Box>
      </Paper>

      {isLoading && <LinearProgress />}

      <Box sx={{ m: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '56rem' }}>

        {/* ── YÖNETİCİ BANNER ─────────────────────────────── */}
        {!isLoading && !currentUserInList && (
          <Alert
            severity="info"
            icon={<AddAlertIcon />}
            action={
              <Button size="small" onClick={handleAddSelf} disabled={saving} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
                Listeye Ekle
              </Button>
            }
          >
            Siz kadro listesinde görünmüyorsunuz. Firma yöneticisi olarak eklenebilirsiniz.
          </Alert>
        )}

        {/* ── KADRO TABLOSU ────────────────────────────────── */}
        <Paper variant="outlined">
          {/* tablo başlık */}
          <Box sx={{ px: '1.25rem', py: '0.75rem', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
              Kadro
              {members.length > 0 && (
                <Box component="span" sx={{ ml: '0.5rem', fontSize: '0.72rem', color: 'white', backgroundColor: 'text.secondary', px: '0.4rem', py: '0.1rem', borderRadius: '10px' }}>
                  {members.length}
                </Box>
              )}
            </Typography>
          </Box>

          {members.length === 0 && !isLoading && (
            <Typography variant="body2" color="text.disabled" sx={{ p: '1.25rem', fontStyle: 'italic' }}>
              Kadro boş.
            </Typography>
          )}

          {members.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.025)' }}>
                  <TableCell sx={thSx}>E-posta</TableCell>
                  <TableCell sx={thSx}>İsim Soyisim</TableCell>
                  <TableCell sx={thSx}>Ünvan</TableCell>
                  <TableCell sx={thSx}>Durum</TableCell>
                  <TableCell sx={{ ...thSx, textAlign: 'right' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(m => {
                  const isEditing = editingId === m.id
                  return (
                    <TableRow key={m.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.015)' } }}>

                      {/* E-posta */}
                      <TableCell sx={tdSx}>{m.email}</TableCell>

                      {/* İsim Soyisim */}
                      <TableCell sx={tdSx}>
                        {isEditing
                          ? <TextField size="small" variant="standard" placeholder="İsim Soyisim"
                              value={editName} onChange={e => setEditName(e.target.value)}
                              disabled={saving} sx={{ minWidth: '150px' }} />
                          : <Typography variant="inherit" color={m.name ? 'text.primary' : 'text.disabled'} sx={{ fontStyle: m.name ? 'normal' : 'italic' }}>
                              {m.name || '—'}
                            </Typography>
                        }
                      </TableCell>

                      {/* Ünvan */}
                      <TableCell sx={tdSx}>
                        {isEditing
                          ? <TextField size="small" variant="standard" placeholder="Ünvan"
                              value={editTitle} onChange={e => setEditTitle(e.target.value)}
                              disabled={saving} sx={{ minWidth: '160px' }} />
                          : <Typography variant="inherit" color={m.title ? 'text.primary' : 'text.disabled'} sx={{ fontStyle: m.title ? 'normal' : 'italic' }}>
                              {m.title || '—'}
                            </Typography>
                        }
                      </TableCell>

                      {/* Durum */}
                      <TableCell sx={tdSx}>
                        <DurumChip status={m.status} />
                      </TableCell>

                      {/* İşlemler */}
                      <TableCell sx={{ ...tdSx, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <>
                            <Tooltip title="Kaydet">
                              <span>
                                <IconButton size="small" color="success" onClick={() => handleSaveEdit(m.id)} disabled={saving}>
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="İptal">
                              <span>
                                <IconButton size="small" onClick={() => setEditingId(null)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {m.status === 'pending' && (
                              <Tooltip title="Onayla">
                                <span>
                                  <IconButton size="small" color="success" onClick={() => handleApprove(m.id)} disabled={saving}>
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            <Tooltip title="Düzenle">
                              <IconButton size="small" onClick={() => { setEditingId(m.id); setEditName(m.name || ''); setEditTitle(m.title || '') }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {(m.status === 'active' || m.status === 'inactive') && (
                              <Tooltip title={m.status === 'inactive' ? 'Aktifleştir' : 'Pasifleştir'}>
                                <span>
                                  <IconButton size="small" color={m.status === 'inactive' ? 'success' : 'default'} onClick={() => handleToggleActive(m)} disabled={saving}>
                                    {m.status === 'inactive' ? <CheckCircleOutlineIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                            <Tooltip title={m.status === 'active' ? 'Kadrodan Çıkar' : 'Daveti İptal Et'}>
                              <span>
                                <IconButton size="small" onClick={() => handleRemove(m.id)} disabled={saving}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>

                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* ── DAVET GÖNDER ─────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: '1.25rem' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: '0.75rem' }}>
            E-posta ile Davet Gönder
          </Typography>
          <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              size="small" variant="standard" label="İsim Soyisim (opsiyonel)"
              value={inviteName} onChange={e => setInviteName(e.target.value)}
              disabled={saving} sx={{ minWidth: '180px' }}
            />
            <TextField
              size="small" variant="standard" label="Ünvan (opsiyonel)"
              value={inviteTitle} onChange={e => setInviteTitle(e.target.value)}
              disabled={saving} sx={{ minWidth: '160px' }}
            />
            <TextField
              size="small" variant="standard" label="E-posta adresi"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInvite() }}
              disabled={saving} sx={{ flex: 1, minWidth: '200px' }}
            />
            <Tooltip title="Davet Gönder">
              <span>
                <IconButton onClick={handleInvite} disabled={!inviteEmail.trim() || saving} size="small" color="primary">
                  <PersonAddIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ mt: '0.5rem', display: 'block' }}>
            Davet alan kişi firmaya katılma talebinde bulunur; talebini onaylayabilirsiniz.
          </Typography>
        </Paper>

        {/* ── EXCEL İÇE AKTAR ──────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: '1.25rem' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: '0.5rem' }}>
            Excel ile Toplu İçe Aktar
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mb: '1rem', display: 'block' }}>
            Şablonu indirin (İsim Soyisim / E-posta / Unvan), doldurun, ardından yükleyin.
          </Typography>
          <Box sx={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ textTransform: 'none' }}>
              Şablonu İndir (.xlsx)
            </Button>
            <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current?.click()} sx={{ textTransform: 'none' }}>
              Excel Yükle
            </Button>
          </Box>
        </Paper>

        {/* ── DEĞİŞİKLİK TALEPLERİ ────────────────────────── */}
        {changeRequests.length > 0 && (
          <Paper variant="outlined" sx={{ p: '1.25rem', borderColor: 'info.main' }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: '0.75rem', color: 'info.dark' }}>
              Bilgi Değişikliği Talepleri
              <Box component="span" sx={{ ml: '0.5rem', fontSize: '0.72rem', color: 'white', backgroundColor: 'info.main', px: '0.4rem', py: '0.1rem', borderRadius: '10px' }}>
                {changeRequests.length}
              </Box>
            </Typography>

            {changeRequests.map((req, idx) => (
              <Box key={req.id}>
                {idx > 0 && <Divider sx={{ my: '0.75rem' }} />}
                <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: '0.25rem' }}>
                      {req.firma_members?.email}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.disabled">Mevcut İsim</Typography>
                        <Typography variant="body2">{req.current_name || '—'}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: '0.25rem', display: 'block' }}>Mevcut Ünvan</Typography>
                        <Typography variant="body2">{req.current_title || '—'}</Typography>
                      </Box>
                      <Typography color="text.disabled" sx={{ fontSize: '1.2rem' }}>→</Typography>
                      <Box>
                        <Typography variant="caption" color="info.main">Talep Edilen İsim</Typography>
                        <Typography variant="body2" fontWeight="medium">{req.requested_name || '—'}</Typography>
                        <Typography variant="caption" color="info.main" sx={{ mt: '0.25rem', display: 'block' }}>Talep Edilen Ünvan</Typography>
                        <Typography variant="body2" fontWeight="medium">{req.requested_title || '—'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', pt: '0.25rem' }}>
                    <Tooltip title="Onayla">
                      <span>
                        <IconButton size="small" color="success" onClick={() => handleApproveChangeRequest(req)} disabled={saving}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Reddet">
                      <span>
                        <IconButton size="small" color="error" onClick={() => handleRejectChangeRequest(req.id)} disabled={saving}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        )}

      </Box>


      {/* ── ÖNIZLEME DİALOGU ─────────────────────────────── */}
      <Dialog open={!!importPreview} onClose={() => !importing && setImportPreview(null)} maxWidth="md" fullWidth>
        <DialogTitle>Excel İçe Aktarma — Önizleme</DialogTitle>
        <DialogContent dividers>
          {importing && <LinearProgress sx={{ mb: '1rem' }} />}

          {importPreview?.valid?.length > 0 && (
            <Box sx={{ mb: '1.25rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.5rem' }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="subtitle2" color="success.main">Eklenecekler ({importPreview.valid.length})</Typography>
              </Box>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Satır</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>İsim Soyisim</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>E-posta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Unvan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.valid.map(r => (
                      <TableRow key={r.email}>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>{r.rowNum}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: r.name ? 'text.primary' : 'text.disabled', fontStyle: r.name ? 'normal' : 'italic' }}>{r.name || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>{r.email}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: r.title ? 'text.primary' : 'text.disabled', fontStyle: r.title ? 'normal' : 'italic' }}>{r.title || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {importPreview?.invalid?.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.5rem' }}>
                <ErrorOutlineIcon color="warning" fontSize="small" />
                <Typography variant="subtitle2" color="warning.dark">Atlanacaklar ({importPreview.invalid.length})</Typography>
              </Box>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Satır</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>E-posta</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Neden</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.invalid.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>{r.rowNum}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{r.email}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'warning.dark' }}>{r.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {importPreview?.valid?.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mt: '0.5rem' }}>
              Eklenecek geçerli satır bulunamadı.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportPreview(null)} disabled={importing} sx={{ textTransform: 'none' }}>İptal</Button>
          <Button variant="contained" onClick={handleConfirmImport}
            disabled={!importPreview?.valid?.length || importing} sx={{ textTransform: 'none' }}>
            {importPreview?.valid?.length ? `${importPreview.valid.length} kişiyi ekle` : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ── SONUÇ DİALOGU ────────────────────────────────── */}
      <Dialog open={!!importResult} onClose={() => setImportResult(null)} maxWidth="xs" fullWidth>
        <DialogTitle>İçe Aktarma Tamamlandı</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', mt: '0.25rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircleOutlineIcon color="success" />
              <Typography variant="body2"><strong>{importResult?.added}</strong> kişi başarıyla eklendi.</Typography>
            </Box>
            {importResult?.skipped > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ErrorOutlineIcon color="warning" />
                <Typography variant="body2" color="text.secondary"><strong>{importResult?.skipped}</strong> satır atlandı.</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportResult(null)} sx={{ textTransform: 'none' }}>Tamam</Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}
