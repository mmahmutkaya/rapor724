import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

import { StoreContext } from '../../components/store.js'
import { supabase } from '../../lib/supabase.js'
import { useGetPozUnits } from '../../hooks/useMongo.js'
import { DialogAlert } from '../../components/general/DialogAlert.js'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ReplyIcon from '@mui/icons-material/Reply'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import BlockIcon from '@mui/icons-material/Block'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import DoneAllIcon from '@mui/icons-material/DoneAll'


// ─── YARDIMCI HESAPLAMALAR ────────────────────────────────────────────────────

function calcMetraj(line) {
  if (!line) return 0
  const vals = [
    // multiplier=1 is the neutral default (shown as blank in UI), treat as not-set
    (Number(line.multiplier) === 1 ? null : line.multiplier),
    line.count, line.length, line.width, line.height,
  ]
    .map(v => (v != null && v !== '' ? parseFloat(v) : null))
    .filter(v => v !== null && !isNaN(v))
  if (vals.length === 0) return null
  return vals.reduce((prod, v) => prod * v, 1)
}

function ikiHane(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}


// ─── STİL SABİTLERİ ───────────────────────────────────────────────────────────

const LINE_STATUS_COLORS = {
  pending:  { bg: 'rgba(255,243,224,0.7)', border: '#FFB300', dot: '#FF8F00',  label: 'Bekliyor',   chip: { backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 600 } },
  rejected: { bg: 'rgba(255,235,238,0.7)', border: '#E53935', dot: '#C62828',  label: 'Reddedildi', chip: { backgroundColor: '#FFEBEE', color: '#B71C1C', fontWeight: 600 } },
  ignored:  { bg: 'rgba(236,239,241,0.7)', border: '#90A4AE', dot: '#607D8B',  label: 'Ignore',     chip: { backgroundColor: '#ECEFF1', color: '#455A64', fontWeight: 600 } },
  approved: { bg: 'rgba(232,245,233,0.7)', border: '#43A047', dot: '#2E7D32',  label: 'Onaylı',     chip: { backgroundColor: '#E8F5E9', color: '#1B5E20', fontWeight: 600 } },
}

const KISI_CARD_HEADER = { backgroundColor: '#415a77', color: '#e0e1dd' }
const ONAY_CARD_HEADER = { backgroundColor: '#1b5e20', color: '#fff' }

const css_tableHeader = {
  display: 'grid', fontSize: '0.75rem', fontWeight: 600,
  backgroundColor: '#415a77', color: '#e0e1dd',
}
const css_headerCell = {
  px: '4px', py: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
}
const css_tableHeaderCell = {
  px: '4px', py: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRight: '1px solid rgba(255,255,255,0.15)',
  fontSize: '0.75rem', fontWeight: 600,
  backgroundColor: '#415a77', color: '#e0e1dd',
}
const css_dataRow = { display: 'grid', borderBottom: '1px solid #e0e0e0' }
const css_dataCell = {
  px: '4px', py: '3px', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center',
  borderRight: '1px solid #eeeeee', overflow: 'hidden',
}

// Kişi kartı: sütun yapısı — sıra | açıklama | çarpan | adet | boy | en | yük | metraj | aksiyonlar
const KISI_GRID = 'max-content 1fr 65px 65px 65px 65px 65px 80px 96px'
// Onay kartı: aynı + hazırlayan | onaylayan | aksiyonlar
const ONAY_GRID = 'max-content 1fr 65px 65px 65px 65px 65px 80px 100px 100px 64px'

const NUM_FIELDS  = ['multiplier', 'count', 'length', 'width', 'height']
const NUM_LABELS  = ['Çarpan', 'Adet', 'Boy', 'En', 'Yük']


// ─── AĞAÇ İNŞASI ──────────────────────────────────────────────────────────────

/**
 * Onay Kartı için ağaç yapısı:
 *   Kök: parent_line_id IS NULL AND status = 'approved'
 *   Çocuk: parent_line_id IS NOT NULL (tüm alt satırlar, herhangi bir durumda)
 *
 * Her öğeye siraNo ve depth eklenir.
 */
function buildApprovalTree(allLines, sessions, userMap) {
  const rootLines = allLines.filter(l => !l.parent_line_id && l.status === 'approved')
  const childrenOf = {}
  allLines.filter(l => l.parent_line_id).forEach(l => {
    if (!childrenOf[l.parent_line_id]) childrenOf[l.parent_line_id] = []
    childrenOf[l.parent_line_id].push(l)
  })

  const sessionMap = {}
  sessions.forEach(s => { sessionMap[s.id] = s })

  function enrich(line, siraNo, depth) {
    const sess = sessionMap[line.session_id]
    const hazırlayan = userMap[sess?.created_by] ?? '?'
    const onaylayan  = line.approved_by
      ? (userMap[line.approved_by] ?? '?')
      : line.status === 'pending' ? '(bekliyor)' : null
    const kids = (childrenOf[line.id] ?? [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    return {
      ...line, siraNo, depth, hazırlayan, onaylayan,
      children: kids.map((c, i) => enrich(c, `${siraNo}.${i + 1}`, depth + 1)),
    }
  }

  return rootLines
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((l, i) => enrich(l, `${i + 1}`, 0))
}

/** Ağaç düğümlerini depth-first düzlüğe çıkar */
function flattenTree(nodes) {
  const result = []
  function visit(node) { result.push(node); node.children?.forEach(visit) }
  nodes.forEach(visit)
  return result
}

/**
 * Kişi grupları:
 *   Her kişi için kendi session'larından gelen kök (parent yok) NON-approved satırlar.
 *   parent_line_id olan satırlar (revize talepleri) Onay Kartına gittiğinden dahil edilmez.
 */
function buildKisiGroups(sessions, allLines, userMap) {
  const groups = {}
  sessions.forEach(s => {
    if (!groups[s.created_by]) {
      groups[s.created_by] = {
        userId: s.created_by, userName: userMap[s.created_by] ?? '?',
        pending: [], rejected: [], ignored: [], approved: [],
      }
    }
  })

  const sessionMap = {}
  sessions.forEach(s => { sessionMap[s.id] = s })

  allLines.forEach(line => {
    if (line.parent_line_id) return            // Onay Kartına gider
    const sess = sessionMap[line.session_id]
    if (!sess) return
    const g = groups[sess.created_by]
    if (!g) return
    if (line.status === 'pending')  g.pending.push(line)
    if (line.status === 'rejected') g.rejected.push(line)
    if (line.status === 'ignored')  g.ignored.push(line)
    if (line.status === 'approved') g.approved.push(line)
  })

  return Object.values(groups).filter(
    g => g.pending.length + g.rejected.length + g.ignored.length + g.approved.length > 0
  )
}


// ─── ANA SAYFA BİLEŞENİ ───────────────────────────────────────────────────────

export default function P_MetrajOnaylaCetvel() {
  const navigate = useNavigate()
  const { selectedProje, selectedIsPaket, selectedPoz, selectedMahal_metraj } = useContext(StoreContext)
  const { data: pozUnits = [] } = useGetPozUnits()

  const wpAreaId = selectedMahal_metraj?.wpAreaId

  const unitsMap = useMemo(() => {
    const m = {}; pozUnits.forEach(u => { m[u.id] = u.name }); return m
  }, [pozUnits])
  const pozBirim = unitsMap[selectedPoz?.unit_id] ?? ''

  // ── State ────────────────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(true)
  const [sessions, setSessions]         = useState([])
  const [lines, setLines]               = useState([])
  const [userMap, setUserMap]           = useState({})
  const [userEmailMap, setUserEmailMap] = useState({})
  const [currentUserId, setCurrentUserId] = useState(null)
  const [dialogAlert, setDialogAlert]   = useState()

  // Onay kartındaki her kök satır için genişlet/daralt durumu
  const [expandedLines, setExpandedLines] = useState({})   // { lineId: boolean }
  // Orijinal (revize edilmiş, hesaba katılmayan) satırları gizle
  const [hideOriginals, setHideOriginals] = useState(true)

  // Görünürlük dialog ve kart görünürlük state'leri
  const [openVisibilityDialog, setOpenVisibilityDialog] = useState(false)
  const [visibleOnayKarti, setVisibleOnayKarti]         = useState(true)
  const [visibleKisiCards, setVisibleKisiCards]         = useState({}) // { userId: boolean }

  // ── Veri Yükleme ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProje || !selectedIsPaket) { navigate('/metrajonayla'); return }
    if (!selectedPoz)                        { navigate('/metrajonaylapozlar'); return }
    if (!wpAreaId)                           { navigate('/metrajonaylapozmahaller'); return }
  }, [])

  useEffect(() => {
    if (!wpAreaId) return
    ;(async () => {
      setLoading(true)

      // Mevcut oturum kullanıcı ID'si
      const { data: { session: authSess } } = await supabase.auth.getSession()
      setCurrentUserId(authSess?.user?.id ?? null)

      // Session'lar
      const { data: sessData, error: sessErr } = await supabase
        .from('measurement_sessions')
        .select('id, status, total_quantity, created_by')
        .eq('work_package_poz_area_id', wpAreaId)

      if (sessErr) {
        setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Veriler yüklenirken hata oluştu.', detailText: sessErr.message, onCloseAction: () => setDialogAlert() })
        setLoading(false); return
      }

      const sessionIds = (sessData ?? []).map(s => s.id)

      // Satırlar
      let linesData = []
      if (sessionIds.length > 0) {
        const { data: ld, error: lErr } = await supabase
          .from('measurement_lines')
          .select('id, session_id, order_index, line_type, description, multiplier, count, length, width, height, parent_line_id, status, approved_by, approved_at')
          .in('session_id', sessionIds)
          .order('order_index')
        if (lErr) {
          setDialogAlert({ dialogIcon: 'warning', dialogMessage: 'Satırlar yüklenirken hata.', detailText: lErr.message, onCloseAction: () => setDialogAlert() })
          setLoading(false); return
        }
        linesData = ld ?? []
      }

      // Kullanıcı adları
      const allUserIds = [...new Set([
        ...(sessData ?? []).map(s => s.created_by),
        ...linesData.map(l => l.approved_by),
      ].filter(Boolean))]
      let nameMap = {}
      let emailMap = {}
      if (allUserIds.length > 0) {
        const { data: nameRows } = await supabase.rpc('get_user_display_names', { user_ids: allUserIds })
        if (nameRows) nameRows.forEach(r => {
          nameMap[r.id] = r.display_name || r.id
          if (r.email) emailMap[r.id] = r.email
        })
      }

      setSessions(sessData ?? [])
      setLines(linesData)
      setUserMap(nameMap)
      setUserEmailMap(emailMap)
      // Yeni yüklenen session sahipleri için görünürlüğü true olarak başlat
      setVisibleKisiCards(prev => {
        const next = { ...prev }
        const uniqueUsers = [...new Set((sessData ?? []).map(s => s.created_by))]
        uniqueUsers.forEach(uid => { if (next[uid] === undefined) next[uid] = true })
        return next
      })
      setLoading(false)
    })()
  }, [wpAreaId])


  // ── Türetilmiş Veri ───────────────────────────────────────────────────────────

  const kisiGroups   = useMemo(() => buildKisiGroups(sessions, lines, userMap),  [sessions, lines, userMap])
  const approvalTree = useMemo(() => buildApprovalTree(lines, sessions, userMap), [lines, sessions, userMap])
  const flatTree     = useMemo(() => flattenTree(approvalTree), [approvalTree])

  // Revize satırı olan tüm node ID'leri (header'daki global toggle için)
  const nodesWithChildren = useMemo(() =>
    flatTree.filter(n => (n.children?.length ?? 0) > 0).map(n => n.id),
  [flatTree])

  const toggleHideOriginals = () => {
    setHideOriginals(prev => {
      if (prev) {
        // Orijinaller tekrar gösterilince hepsini genişlet
        setExpandedLines(curr => {
          const next = { ...curr }
          nodesWithChildren.forEach(id => { next[id] = true })
          return next
        })
      }
      return !prev
    })
  }

  const onayKartiTotal = useMemo(() => {
    // Tüm yaprak-benzeri = child'ı OLMAYAN approved satırların toplamı
    const hasChildSet = new Set(lines.filter(l => l.parent_line_id).map(l => l.parent_line_id))
    return lines
      .filter(l => l.status === 'approved' && !hasChildSet.has(l.id))
      .reduce((s, l) => s + (calcMetraj(l) ?? 0), 0)
  }, [lines])


  // ── Aksiyonlar ────────────────────────────────────────────────────────────────

  const showErr = useCallback((msg, detail) => {
    setDialogAlert({ dialogIcon: 'warning', dialogMessage: msg, detailText: detail, onCloseAction: () => setDialogAlert() })
  }, [])

  const approveLine = async (lineId) => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('measurement_lines')
      .update({ status: 'approved', approved_by: currentUserId, approved_at: now })
      .eq('id', lineId)
    if (error) { showErr('Onaylama sırasında hata.', error.message); return }
    setLines(prev => prev.map(l =>
      l.id === lineId ? { ...l, status: 'approved', approved_by: currentUserId, approved_at: now } : l
    ))
    setUserMap(prev => {
      if (currentUserId && !prev[currentUserId]) {
        // Kendi adımızı da userMap'e ekle (zaten mevcut olmalı ama güvence için)
        return prev
      }
      return prev
    })
  }

  const rejectLine = async (lineId) => {
    const { error } = await supabase
      .from('measurement_lines').update({ status: 'rejected' }).eq('id', lineId)
    if (error) { showErr('Reddetme sırasında hata.', error.message); return }
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, status: 'rejected' } : l))
  }

  const ignoreLine = async (lineId) => {
    const { error } = await supabase
      .from('measurement_lines').update({ status: 'ignored' }).eq('id', lineId)
    if (error) { showErr('Ignore sırasında hata.', error.message); return }
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, status: 'ignored' } : l))
  }

  const toggleExpand = (lineId) => {
    setExpandedLines(prev => ({ ...prev, [lineId]: !prev[lineId] }))
  }


  // ── RENDER YARDIMCILARI ───────────────────────────────────────────────────────

  const StatusDot = ({ status }) => (
    <Box sx={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      backgroundColor: LINE_STATUS_COLORS[status]?.dot ?? '#90A4AE',
    }} />
  )


  // ── KİŞİ KARTI TABLO SATIRI ───────────────────────────────────────────────────

  const KisiLineRow = ({ line, rowBg }) => {
    const metraj = calcMetraj(line)
    const isPending = line.status === 'pending'
    const cellBg = { backgroundColor: rowBg, borderBottom: '1px solid #e0e0e0', ...(metraj < 0 && { color: '#c62828' }) }
    return (
      <>
        <Box sx={{ ...css_dataCell, ...cellBg, justifyContent: 'center', color: '#888' }}>
          {line.order_index ?? 1}
        </Box>
        <Box sx={{ ...css_dataCell, ...cellBg }}>{line.description ?? ''}</Box>
        {NUM_FIELDS.map(f => (
          <Box key={f} sx={{ ...css_dataCell, ...cellBg, justifyContent: 'flex-end' }}>
            {f === 'multiplier' && Number(line[f]) === 1 ? '' : (line[f] != null ? ikiHane(line[f]) : '')}
          </Box>
        ))}
        <Box sx={{ ...css_dataCell, ...cellBg, justifyContent: 'flex-end', fontWeight: 700 }}>
          {ikiHane(metraj)}
          {pozBirim && <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: '#888' }}>{pozBirim}</Box>}
        </Box>
        <Box sx={{ ...css_dataCell, ...cellBg, justifyContent: 'center', gap: '2px' }}>
          {isPending ? (
            <>
              <Tooltip title="Onayla">
                <IconButton size="small" sx={{ p: '2px' }} onClick={() => approveLine(line.id)}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ignore">
                <IconButton size="small" sx={{ p: '2px' }} onClick={() => ignoreLine(line.id)}>
                  <BlockIcon sx={{ fontSize: 18, color: '#607d8b' }} />
                </IconButton>
              </Tooltip>
            </>
          ) : line.status === 'approved' ? (
            <Tooltip title="Onaylandı">
              <DoneAllIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
            </Tooltip>
          ) : line.status === 'ignored' ? (
            <Tooltip title="Ignore edildi">
              <DoneAllIcon sx={{ fontSize: 18, color: '#90A4AE' }} />
            </Tooltip>
          ) : null}
        </Box>
      </>
    )
  }


  // ── ONAY KARTI TABLO SATIRI ───────────────────────────────────────────────────

  const OnayLineRow = ({ node }) => {
    const metraj      = calcMetraj(node)
    const hasChildren = (node.children?.length ?? 0) > 0
    const isRevized   = node.status === 'approved' && hasChildren

    const rowBg = node.status === 'pending'  ? '#FFCC80' :
                  node.status === 'rejected' ? 'rgba(255,235,238,0.5)' :
                  node.status === 'ignored'  ? 'rgba(236,239,241,0.5)' :
                  isRevized                  ? 'rgba(224,224,224,0.5)' :
                  node.depth > 0             ? 'rgba(187,222,251,0.25)' : 'white'

    const onaylayanText = node.status === 'pending'  ? '(bekliyor)' :
                          node.status === 'rejected' ? '(reddedildi)' :
                          node.status === 'ignored'  ? '(ignore)' :
                          node.onaylayan ?? ''

    const cellBg = { backgroundColor: rowBg, borderBottom: '1px solid #e0e0e0', ...(metraj < 0 && { color: '#c62828' }) }

    if (hideOriginals && isRevized) {
      return <>{node.children.map(child => <OnayLineRow key={child.id} node={child} />)}</>
    }

    return (
      <>
        <Box sx={{ ...css_dataCell, ...cellBg, justifyContent: 'flex-start', pl: '0.5rem', color: node.depth > 0 ? '#1565c0' : '#555' }}>
          {node.siraNo}
        </Box>
        <Box sx={{ ...css_dataCell, ...cellBg }}>{node.description ?? ''}</Box>
        {NUM_FIELDS.map(f => (
          <Box key={f} sx={{ ...css_dataCell, ...cellBg, justifyContent: 'flex-end' }}>
            {f === 'multiplier' && Number(node[f]) === 1 ? '' : (node[f] != null ? ikiHane(node[f]) : '')}
          </Box>
        ))}
        <Box sx={{ ...css_dataCell, ...cellBg, justifyContent: 'flex-end', fontWeight: 700, opacity: isRevized ? 0.45 : 1, textDecoration: isRevized ? 'line-through' : 'none' }}>
          {ikiHane(metraj)}
          {pozBirim && !hasChildren && (
            <Box component="span" sx={{ ml: '3px', fontWeight: 400, fontSize: '0.72rem', color: '#888' }}>{pozBirim}</Box>
          )}
        </Box>
        <Box sx={{ ...css_dataCell, ...cellBg, fontSize: '0.78rem', color: '#455a64' }}>{node.hazırlayan}</Box>
        <Box sx={{ ...css_dataCell, ...cellBg, fontSize: '0.78rem',
          color: node.status === 'pending' ? '#e65100' : node.status === 'rejected' ? '#b71c1c' : node.status === 'ignored' ? '#607d8b' : '#1b5e20',
        }}>
          {onaylayanText}
        </Box>
        <Box sx={{ ...css_dataCell, ...cellBg }} />

        {/* Alt satırlar — parent grid içinde flat */}
        {hasChildren && node.children.map(child => <OnayLineRow key={child.id} node={child} />)}
      </>
    )
  }




  // ── RENDER ────────────────────────────────────────────────────────────────────

  const pozLabel = selectedPoz?.code
    ? `${selectedPoz.code} · ${selectedPoz.short_desc}`
    : selectedPoz?.short_desc

  return (
    <Box>

      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          actionText1={dialogAlert.actionText1}
          action1={dialogAlert.action1}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* GÖRÜNÜRLÜK DİALOGU */}
      <Dialog open={openVisibilityDialog} onClose={() => setOpenVisibilityDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>Kart Görünürlüğü</DialogTitle>
        <DialogContent sx={{ pt: '0 !important', px: 2, pb: 2 }}>
          <List dense disablePadding>
            {/* Onaylanan Metraj — sabit üstte */}
            <ListItem
              disableGutters
              sx={{ cursor: 'pointer', borderRadius: 1, px: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
              onClick={() => setVisibleOnayKarti(v => !v)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {visibleOnayKarti
                  ? <VisibilityIcon sx={{ fontSize: 20, color: '#1b5e20' }} />
                  : <VisibilityOffIcon sx={{ fontSize: 20, color: '#90a4ae' }} />}
              </ListItemIcon>
              <ListItemText
                primary="Onaylanan Metraj"
                primaryTypographyProps={{ fontWeight: 700, color: '#1b5e20', fontSize: '0.9rem' }}
              />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Kişi listesi */}
            {kisiGroups.length === 0 && (
              <ListItem disableGutters sx={{ px: 1 }}>
                <ListItemText
                  primary="Henüz metraj hazırlayan yok"
                  primaryTypographyProps={{ fontSize: '0.85rem', color: '#9e9e9e', fontStyle: 'italic' }}
                />
              </ListItem>
            )}
            {kisiGroups.map(group => {
              const isVisible = visibleKisiCards[group.userId] ?? true
              const label = userEmailMap[group.userId] || group.userName
              return (
                <ListItem
                  key={group.userId}
                  disableGutters
                  sx={{ cursor: 'pointer', borderRadius: 1, px: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  onClick={() => setVisibleKisiCards(prev => ({ ...prev, [group.userId]: !isVisible }))}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isVisible
                      ? <VisibilityIcon sx={{ fontSize: 20, color: '#415a77' }} />
                      : <VisibilityOffIcon sx={{ fontSize: 20, color: '#90a4ae' }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: '0.88rem',
                      color: isVisible ? '#263238' : '#9e9e9e',
                      sx: { textDecoration: isVisible ? 'none' : 'line-through' },
                    }}
                  />
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* BAŞLIK */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 4 }}>
        <Grid container alignItems="center" sx={{ px: '1rem', py: '0.5rem' }}>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <IconButton sx={{ m: 0, p: 0 }} onClick={() => navigate('/metrajonaylapozmahaller')}>
                <ReplyIcon sx={{ color: 'gray' }} />
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonayla')}>
                Metraj Onayla
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.4, cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonaylapozlar')}>
                {selectedIsPaket?.name}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.6, cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { opacity: 0.9 } }}
                onClick={() => navigate('/metrajonaylapozmahaller')}>
                {pozLabel}
              </Typography>
              <NavigateNextIcon sx={{ opacity: 0.4, fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {selectedMahal_metraj?.name ?? 'Mahal'}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Tooltip title="Kart görünürlüğü">
              <IconButton onClick={() => setOpenVisibilityDialog(true)}>
                <VisibilityIcon sx={{ color: '#455a64' }} />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </AppBar>

      {loading && <LinearProgress />}

      {!loading && sessions.length === 0 && (
        <Stack sx={{ width: '100%', p: '1rem' }}>
          <Alert severity="info">Bu mahal için henüz metraj hazırlanmamış.</Alert>
        </Stack>
      )}

      {!loading && sessions.length > 0 && (
        <Box sx={{ p: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px' }}>

          {/* ── KİŞİ KARTLARI ───────────────────────────────────────────── */}
          {kisiGroups.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: '0.5rem', color: '#37474f', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Hazırlanan Metrajlar
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {kisiGroups.filter(group => visibleKisiCards[group.userId] ?? true).map(group => {
                  const allLines = [...group.pending, ...group.rejected, ...group.ignored, ...group.approved]
                    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                  return (
                    <Box key={group.userId} sx={{ border: '1px solid #B0BEC5', overflow: 'hidden', boxShadow: 1 }}>
                      {/* Kart başlığı */}
                      <Box sx={{
                        ...KISI_CARD_HEADER, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        px: '1rem', py: '0.5rem',
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                          {group.userName}
                        </Typography>
                      </Box>

                      {/* Tablo */}
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: KISI_GRID, minWidth: 'max-content' }}>
                          <Box sx={{ ...css_tableHeaderCell }}>Sıra</Box>
                          <Box sx={{ ...css_tableHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                          {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_tableHeaderCell }}>{lbl}</Box>)}
                          <Box sx={{ ...css_tableHeaderCell }}>Metraj</Box>
                          <Box sx={{ ...css_tableHeaderCell }}>İşlem</Box>

                          {allLines.map(line => (
                            <KisiLineRow key={line.id} line={line}
                              rowBg={LINE_STATUS_COLORS[line.status]?.bg ?? 'white'}
                            />
                          ))}

                          <Box sx={{ gridColumn: '1/8', px: '8px', py: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#455a64', backgroundColor: '#ECEFF1', borderTop: '2px solid #B0BEC5' }}>
                            Toplam hazırlanan
                          </Box>
                          <Box sx={{ px: '8px', py: '4px', fontWeight: 700, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#ECEFF1', borderTop: '2px solid #B0BEC5' }}>
                            {ikiHane(allLines.reduce((s, l) => s + (calcMetraj(l) ?? 0), 0))}
                            {pozBirim && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.8rem' }}>{pozBirim}</Box>}
                          </Box>
                          <Box sx={{ backgroundColor: '#ECEFF1', borderTop: '2px solid #B0BEC5' }} />
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* ── ONAY KARTI ──────────────────────────────────────────────── */}
          {visibleOnayKarti && flatTree.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: '0.5rem', color: '#1b5e20', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Onaylanan Metraj
              </Typography>

              <Box sx={{ border: '2px solid #43A047', overflow: 'hidden', boxShadow: 2 }}>
                {/* Kart başlığı */}
                <Box sx={{
                  ...ONAY_CARD_HEADER, display: 'flex', alignItems: 'center', gap: '0.5rem',
                  px: '1rem', py: '0.6rem',
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Onaylı Metraj
                  </Typography>
                  {nodesWithChildren.length > 0 && (
                    <Tooltip title={hideOriginals ? 'Orijinalleri Göster' : 'Orijinalleri Gizle'}>
                      <Chip
                        size="small"
                        icon={hideOriginals ? <ExpandMoreIcon sx={{ fontSize: '16px !important', color: '#a5d6a7 !important' }} /> : <ExpandLessIcon sx={{ fontSize: '16px !important', color: '#a5d6a7 !important' }} />}
                        label={hideOriginals ? 'Orijinalleri Göster' : 'Orijinalleri Gizle'}
                        onClick={toggleHideOriginals}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 500, fontSize: '0.72rem', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' } }}
                      />
                    </Tooltip>
                  )}
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Toplam: <strong>{ikiHane(onayKartiTotal)}</strong>
                    {pozBirim && ` ${pozBirim}`}
                  </Typography>
                </Box>

                {/* Tablo */}
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: ONAY_GRID, minWidth: 'max-content' }}>
                    <Box sx={{ ...css_tableHeaderCell }}>Sıra</Box>
                    <Box sx={{ ...css_tableHeaderCell, justifyContent: 'flex-start' }}>Açıklama</Box>
                    {NUM_LABELS.map(lbl => <Box key={lbl} sx={{ ...css_tableHeaderCell }}>{lbl}</Box>)}
                    <Box sx={{ ...css_tableHeaderCell }}>Metraj</Box>
                    <Box sx={{ ...css_tableHeaderCell }}>Hazırlayan</Box>
                    <Box sx={{ ...css_tableHeaderCell }}>Onaylayan</Box>
                    <Box sx={{ ...css_tableHeaderCell }}></Box>

                    {approvalTree.map(rootNode => (
                      <OnayLineRow key={rootNode.id} node={rootNode} />
                    ))}

                    <Box sx={{ gridColumn: '1/8', px: '8px', py: '5px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#1b5e20', backgroundColor: '#E8F5E9', borderTop: '2px solid #43A047' }}>
                      Onaylanan Toplam
                    </Box>
                    <Box sx={{ px: '8px', py: '5px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#1b5e20', backgroundColor: '#E8F5E9', borderTop: '2px solid #43A047' }}>
                      {ikiHane(onayKartiTotal)}
                      {pozBirim && <Box component="span" sx={{ ml: '4px', fontWeight: 400, fontSize: '0.8rem' }}>{pozBirim}</Box>}
                    </Box>
                    <Box sx={{ backgroundColor: '#E8F5E9', borderTop: '2px solid #43A047' }} />
                    <Box sx={{ backgroundColor: '#E8F5E9', borderTop: '2px solid #43A047' }} />
                    <Box sx={{ backgroundColor: '#E8F5E9', borderTop: '2px solid #43A047' }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Hiç onaylı satır yokken kişi kartı da yoksa */}
          {kisiGroups.length === 0 && flatTree.length === 0 && (
            <Alert severity="info">Bu mahal için henüz onaya hazır veya onaylanmış metraj satırı bulunmuyor.</Alert>
          )}

        </Box>
      )}
    </Box>
  )
}
