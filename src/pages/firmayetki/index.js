import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient, useQuery } from '@tanstack/react-query'

import { StoreContext } from '../../components/store'
import { supabase } from '../../lib/supabase'
import { DialogAlert } from '../../components/general/DialogAlert'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'


const PERMISSIONS = [
  { key: 'can_create_wbs',         label: 'WBS Oluşturma',        description: 'İş kırılım yapısı oluşturabilir' },
  { key: 'can_create_poz',         label: 'Poz Oluşturma',         description: 'Yeni poz (iş kalemi) ekleyebilir' },
  { key: 'can_enter_unit_price',   label: 'Birim Fiyat Girişi',    description: 'Birim fiyat girebilir ve düzenleyebilir' },
  { key: 'can_create_project',     label: 'Proje Oluşturma',       description: 'Firmaya yeni proje ekleyebilir' },
]


export default function P_FirmaYetki() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appUser, selectedFirma } = useContext(StoreContext)

  useEffect(() => {
    if (!selectedFirma) navigate('/firmalar')
  }, [selectedFirma, navigate])

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['firmaMembers', selectedFirma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firma_members')
        .select('*')
        .eq('firma_id', selectedFirma.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!selectedFirma && !!appUser,
    refetchOnWindowFocus: false,
  })

  const { data: permissions = [], isLoading: permsLoading } = useQuery({
    queryKey: ['firmaPermissions', selectedFirma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firma_permissions')
        .select('*')
        .eq('firma_id', selectedFirma.id)
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!selectedFirma && !!appUser,
    refetchOnWindowFocus: false,
  })

  const [dialogAlert, setDialogAlert] = useState()
  const [toggling, setToggling] = useState(null)  // `${memberId}_${permKey}` while saving


  function getPermRow(memberId) {
    return permissions.find(p => p.member_id === memberId) ?? {}
  }

  async function handleToggle(member, permKey) {
    const toggleId = `${member.id}_${permKey}`
    setToggling(toggleId)

    const existing = permissions.find(p => p.member_id === member.id)
    const currentVal = existing?.[permKey] ?? false
    const newVal = !currentVal

    let error
    if (existing) {
      ;({ error } = await supabase
        .from('firma_permissions')
        .update({ [permKey]: newVal })
        .eq('id', existing.id))
    } else {
      ;({ error } = await supabase
        .from('firma_permissions')
        .insert({
          firma_id: selectedFirma.id,
          member_id: member.id,
          email: member.email,
          [permKey]: newVal,
        }))
    }

    setToggling(null)

    if (error) {
      setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'İzin güncellenemedi.', detailText: error.message, onCloseAction: () => setDialogAlert() })
      return
    }

    queryClient.invalidateQueries(['firmaPermissions', selectedFirma.id])
  }


  const isLoading = membersLoading || permsLoading


  return (
    <Box>
      {dialogAlert && <DialogAlert {...dialogAlert} />}

      <Paper>
        <Box sx={{ px: '1rem', py: '0.75rem' }}>
          <Typography variant="h6" fontWeight="bold">Firma Yetkileri</Typography>
        </Box>
      </Paper>

      {isLoading && <LinearProgress />}

      <Box sx={{ m: '1rem' }}>

        {!isLoading && members.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mt: '0.5rem' }}>
            Henüz kadrodan aktif üye yok. Önce Kadro sayfasından kişileri onaylayın.
          </Typography>
        )}

        {members.length > 0 && (
          <Paper variant="outlined" sx={{ overflow: 'auto' }}>

            {/* ── BAŞLIK SATIRI ──────────────────────────── */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `1fr repeat(${PERMISSIONS.length}, 120px)`,
              alignItems: 'center',
              px: '1rem', py: '0.6rem',
              backgroundColor: 'rgba(0,0,0,0.03)',
              borderBottom: '1px solid', borderColor: 'divider',
              minWidth: '560px',
            }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                ÜYE
              </Typography>
              {PERMISSIONS.map(p => (
                <Tooltip key={p.key} title={p.description} placement="top">
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ textAlign: 'center', cursor: 'default', userSelect: 'none', lineHeight: 1.3 }}
                  >
                    {p.label}
                  </Typography>
                </Tooltip>
              ))}
            </Box>

            {/* ── ÜYE SATIRLARI ──────────────────────────── */}
            {members.map((member, idx) => {
              const permRow = getPermRow(member.id)
              return (
                <Box key={member.id}>
                  {idx > 0 && <Divider />}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: `1fr repeat(${PERMISSIONS.length}, 120px)`,
                    alignItems: 'center',
                    px: '1rem', py: '0.3rem',
                    minWidth: '560px',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
                  }}>
                    <Box>
                      <Typography variant="body2">{member.email}</Typography>
                      {member.title && (
                        <Typography variant="caption" color="text.secondary">{member.title}</Typography>
                      )}
                    </Box>
                    {PERMISSIONS.map(p => {
                      const toggleId = `${member.id}_${p.key}`
                      return (
                        <Box key={p.key} sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Checkbox
                            checked={!!permRow[p.key]}
                            onChange={() => handleToggle(member, p.key)}
                            disabled={toggling === toggleId}
                            size="small"
                            sx={{ p: '4px' }}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )
            })}

          </Paper>
        )}

        {/* ── İZİN AÇIKLAMALARI ──────────────────────── */}
        {members.length > 0 && (
          <Box sx={{ mt: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {PERMISSIONS.map(p => (
              <Typography key={p.key} variant="caption" color="text.disabled">
                <strong>{p.label}:</strong> {p.description}
              </Typography>
            ))}
          </Box>
        )}

      </Box>
    </Box>
  )
}
