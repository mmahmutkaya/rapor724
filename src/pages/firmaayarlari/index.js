import { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { useGetFirmaNameHistory } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'


function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}


export default function P_FirmaAyarlari() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { appUser, selectedFirma, setSelectedFirma } = useContext(StoreContext)

  const s = searchParams.get('s')
  const section = s === 'sil' ? 'sil' : 'profil'

  const { data: nameHistory = [], isLoading: historyLoading } = useGetFirmaNameHistory()

  const [dialogAlert, setDialogAlert] = useState()
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!selectedFirma) navigate('/firmalar')
  }, [selectedFirma, navigate])


  async function handleRename() {
    const newName = editName.trim().toUpperCase()
    if (!newName || newName === selectedFirma.name) { setEditingName(false); return }

    setRenaming(true)
    await supabase.from('firm_name_history').insert({
      firm_id: selectedFirma.id,
      old_name: selectedFirma.name,
      new_name: newName,
      changed_by_email: appUser?.email,
    })
    const { error } = await supabase.from('firms').update({ name: newName }).eq('id', selectedFirma.id)
    setRenaming(false)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İsim güncellenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSelectedFirma({ ...selectedFirma, name: newName })
    queryClient.invalidateQueries(['firmalar'])
    queryClient.invalidateQueries(['firmaNameHistory', selectedFirma.id])
    setEditingName(false)
  }


  async function handleDeleteFirma() {
    if (deleteInput !== selectedFirma.name) return
    setDeleting(true)
    const { error } = await supabase.from('firms').delete().eq('id', selectedFirma.id)
    setDeleting(false)
    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Firma silinemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }
    setSelectedFirma(null)
    queryClient.invalidateQueries(['firmalar'])
    navigate('/firmalar')
  }


  return (
    <Box sx={{ m: '0rem' }}>
      {dialogAlert &&
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={() => setDialogAlert()}
        />
      }

      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Firma Ayarları</Typography>
        </Box>
      </Paper>


      {/* ── PROFİL ────────────────────────────────────────────── */}
      {section === 'profil' &&
        <Box sx={{ m: '1rem' }}>

          <Paper variant="outlined" sx={{ p: '1.25rem', mb: '1rem', maxWidth: '36rem' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: '1rem' }}>Firma Bilgileri</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.75rem' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '130px' }}>Firma Adı</Typography>
              {editingName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TextField
                    size="small" value={editName}
                    onChange={e => setEditName(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus sx={{ minWidth: '200px' }}
                  />
                  <IconButton size="small" onClick={handleRename}
                    disabled={renaming || !editName.trim() || editName.trim().toUpperCase() === selectedFirma?.name}>
                    <CheckIcon fontSize="small" color="success" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setEditingName(false); setEditName('') }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Typography variant="body2" fontWeight={600}>{selectedFirma?.name}</Typography>
                  <IconButton size="small" onClick={() => { setEditingName(true); setEditName(selectedFirma?.name || '') }}>
                    <EditIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '130px' }}>Oluşturma Tarihi</Typography>
              <Typography variant="body2">{formatDate(selectedFirma?.created_at)}</Typography>
            </Box>
          </Paper>

          {/* İsim Değişiklik Geçmişi */}
          <Accordion disableGutters elevation={0}
            sx={{ maxWidth: '56rem', border: '1px solid', borderColor: 'divider', borderRadius: '4px !important', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />}
              sx={{ minHeight: '2.25rem', px: '1rem', '& .MuiAccordionSummary-content': { my: '0.4rem' } }}
            >
              <Typography variant="body2" color="text.secondary">
                İsim Değişiklik Geçmişi
                {nameHistory.length > 0 && (
                  <Box component="span" sx={{
                    ml: '0.5rem', fontSize: '0.72rem', color: 'text.disabled',
                    backgroundColor: 'rgba(0,0,0,0.06)', px: '0.4rem', py: '0.1rem', borderRadius: '10px'
                  }}>
                    {nameHistory.length}
                  </Box>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: '1rem', pt: 0, pb: '0.75rem', backgroundColor: 'rgba(0,0,0,0.015)' }}>
              {historyLoading && <LinearProgress />}
              {!historyLoading && nameHistory.length === 0 && (
                <Typography variant="caption" color="text.disabled">Henüz isim değişikliği yapılmamış.</Typography>
              )}
              {!historyLoading && nameHistory.length > 0 && (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: '2rem', pb: '0.3rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content' }}>
                    {['Eski Ad', 'Yeni Ad', 'Tarih', 'Kişi'].map(col => (
                      <Typography key={col} variant="caption" fontWeight={600} color="text.disabled" sx={{ minWidth: col === 'Kişi' ? 'auto' : '160px' }}>{col}</Typography>
                    ))}
                  </Box>
                  {nameHistory.map(log => (
                    <Box key={log.id} sx={{
                      display: 'flex', gap: '2rem', alignItems: 'center',
                      py: '0.35rem', borderBottom: '1px solid', borderColor: 'divider', minWidth: 'max-content',
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.35)', textDecoration: 'line-through' }}>{log.old_name}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }} fontWeight={600}>{log.new_name}</Typography>
                      <Typography variant="caption" sx={{ minWidth: '160px', whiteSpace: 'nowrap' }} color="text.secondary">{formatDate(log.changed_at)}</Typography>
                      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }} color="text.secondary">{log.changed_by_email ?? '—'}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      }


      {/* ── FİRMAYI SİL ───────────────────────────────────────── */}
      {section === 'sil' &&
        <Box sx={{ m: '1.5rem', maxWidth: '34rem' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '1.5rem' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, backgroundColor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteForeverIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>Firmayı Sil</Typography>
              <Typography variant="body2" color="text.secondary">Bu işlem geri alınamaz</Typography>
            </Box>
          </Box>

          <Paper variant="outlined" sx={{ p: '1rem', mb: '1.5rem', borderColor: 'warning.main', backgroundColor: '#fffdf5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.75rem' }}>
              <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
              <Typography variant="body2" fontWeight={600}>Silmeden önce dikkat:</Typography>
            </Box>
            {[
              'Firmaya ait tüm projeler silinmeden firma silinemez',
              'Firma kadrosu ve yetki tanımları silinir',
              'Bu veriler kurtarılamaz',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', mb: '0.25rem' }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'warning.main', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">{item}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: '1.5rem', borderColor: 'error.light' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: '0.4rem' }}>Devam etmek için firma adını yazın:</Typography>
            <Box sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', backgroundColor: 'grey.100', color: 'text.primary', px: '0.6rem', py: '0.3rem', borderRadius: 1, display: 'inline-block', mb: '1rem', border: '1px solid', borderColor: 'grey.300' }}>
              {selectedFirma?.name}
            </Box>
            <TextField fullWidth size="small" placeholder={selectedFirma?.name}
              value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
              disabled={deleting}
              error={deleteInput.length > 0 && deleteInput !== selectedFirma?.name}
              helperText={deleteInput.length > 0 && deleteInput !== selectedFirma?.name ? 'Firma adı eşleşmiyor' : ' '}
              sx={{ mb: '0.75rem' }}
            />
            <Button variant="contained" color="error" fullWidth
              disabled={deleteInput !== selectedFirma?.name || deleting}
              onClick={handleDeleteFirma}
              startIcon={<DeleteForeverIcon />}
              sx={{ py: '0.65rem', fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' }}
            >
              {deleting ? 'Siliniyor...' : `"${selectedFirma?.name}" firmasını kalıcı olarak sil`}
            </Button>
          </Paper>
        </Box>
      }
    </Box>
  )
}
