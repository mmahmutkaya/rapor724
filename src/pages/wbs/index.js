
import { useState, useContext, useEffect, useMemo } from 'react'
import { StoreContext } from '../../components/store'
import { DialogAlert } from '../../components/general/DialogAlert'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetWbsNodes } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'

import FormWbsCreate from '../../components/FormWbsCreate'
import FormWbsUpdate from '../../components/FormWbsUpdate'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import { AppBar } from '@mui/material'
import { styled } from '@mui/material/styles'

import DeleteIcon from '@mui/icons-material/Delete'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'


// Düz listeyi ağaç sırasına dönüştür
function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === parentId)
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

function nodeColor(depth) {
  const palette = [
    { bg: "#8b0000", co: "#e6e6e6" },
    { bg: "#330066", co: "#e6e6e6" },
    { bg: "#005555", co: "#e6e6e6" },
    { bg: "#737373", co: "#e6e6e6" },
    { bg: "#8b008b", co: "#e6e6e6" },
    { bg: "#2929bc", co: "#e6e6e6" },
    { bg: "#00853E", co: "#e6e6e6" },
    { bg: "#4B5320", co: "#e6e6e6" },
  ]
  return palette[depth % palette.length]
}


const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28, height: 16, padding: 0, display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': { width: 15 },
    '& .MuiSwitch-switchBase.Mui-checked': { transform: 'translateX(9px)' },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)', color: '#fff',
      '& + .MuiSwitch-track': { opacity: 1, backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff' },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)', width: 12, height: 12, borderRadius: 6,
    transition: theme.transitions.create(['width'], { duration: 200 }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 8, opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}))


function HeaderWbs({
  selectedWbs, isPending,
  onDeselect, onTogglePoz, onMoveUp, onMoveDown, onMoveLeft, onMoveRight,
  onDelete, onAdd, onEdit
}) {
  const { drawerWidth, topBarHeight, subHeaderHeight } = useContext(StoreContext)

  return (
    <Paper>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: topBarHeight,
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "white"
        }}
      >
        <Grid
          container
          justifyContent="space-between"
          sx={{ alignItems: "center", padding: "0rem 0.25rem", height: subHeaderHeight }}
        >

          <Box sx={{ display: { xs: 'none', sm: "grid" }, gridAutoFlow: "column", alignItems: "center" }}>
            <Typography color="black" variant="h6" noWrap sx={{ ml: "0.5rem" }}>
              Poz Başlıkları (WBS)
            </Typography>
          </Box>

          <Grid item>
            <Grid container spacing={0} sx={{ alignItems: "center" }}>

              <Grid item>
                <IconButton onClick={onDeselect}>
                  <ClearOutlinedIcon sx={{ color: !selectedWbs ? "lightgray" : "red" }} />
                </IconButton>
              </Grid>

              {/* Poz açma/kapama switch */}
              <Grid item>
                <Grid container direction="column" alignItems="center" sx={{ mx: "0.25rem" }}>
                  <Grid item>
                    <Typography variant="caption" sx={{ color: !selectedWbs ? "lightgray" : "rgb(24,24,24)", lineHeight: 1 }}>
                      poz
                    </Typography>
                  </Grid>
                  <Grid item>
                    <AntSwitch
                      disabled={!selectedWbs || isPending}
                      checked={selectedWbs?.open_for_poz ? true : false}
                      onChange={onTogglePoz}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ mx: "0.5rem" }} color="#b3b3b3" orientation="vertical" flexItem />

              <Grid item>
                <IconButton onClick={onMoveUp} disabled={!selectedWbs || isPending}>
                  <KeyboardArrowUpIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveDown} disabled={!selectedWbs || isPending}>
                  <KeyboardArrowDownIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveLeft} disabled={!selectedWbs || isPending}>
                  <KeyboardArrowLeftIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveRight} disabled={!selectedWbs || isPending}>
                  <KeyboardArrowRightIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Divider sx={{ mx: "0.5rem" }} color="#b3b3b3" orientation="vertical" flexItem />

              <Grid item>
                <IconButton onClick={onEdit} disabled={!selectedWbs || isPending}>
                  <EditIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onDelete} disabled={!selectedWbs || isPending}>
                  <DeleteIcon sx={{ color: !selectedWbs ? "lightgray" : "rgb(139,0,0)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onAdd} disabled={isPending}>
                  <AddCircleOutlineIcon color="success" />
                </IconButton>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </AppBar>
    </Paper>
  )
}


export default function P_Wbs() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje, subHeaderHeight } = useContext(StoreContext)
  const { selectedWbs, setSelectedWbs } = useContext(StoreContext)

  const [show, setShow] = useState(null)       // null | 'FormCreate' | 'FormUpdate'
  const [isPending, setIsPending] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [dialogAlert, setDialogAlert] = useState()

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [])

  const { data: rawNodes = [], isLoading } = useGetWbsNodes()

  const flatNodes = useMemo(() => flattenTree(rawNodes), [rawNodes])

  // selectedWbs'yi güncel veri ile senkronize tut
  const selectedWbsLive = useMemo(() => {
    if (!selectedWbs) return null
    return rawNodes.find(n => n.id === selectedWbs.id) ?? null
  }, [selectedWbs, rawNodes])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wbsNodes', selectedProje?.id] })

  const showSnack = (msg) => { setSnackMsg(msg); setOpenSnack(true) }


  const handleTogglePoz = async (event) => {
    if (!selectedWbsLive) return
    const hasChildren = rawNodes.some(n => n.parent_id === selectedWbsLive.id)
    if (hasChildren) {
      showSnack('Alt başlığı bulunan başlıklar poz eklemeye açılamaz.')
      return
    }
    setIsPending(true)
    const { error } = await supabase
      .from('wbs_nodes')
      .update({ open_for_poz: event.target.checked })
      .eq('id', selectedWbsLive.id)
    setIsPending(false)
    if (error) { showSnack(error.message); return }
    invalidate()
  }

  const handleDelete = async () => {
    if (!selectedWbsLive) return
    if (rawNodes.some(n => n.parent_id === selectedWbsLive.id)) {
      showSnack('Alt başlığı bulunan başlıklar silinemez.')
      return
    }
    if (selectedWbsLive.open_for_poz) {
      showSnack('Poz eklemeye açık başlıklar silinemez.')
      return
    }
    setIsPending(true)
    const { error } = await supabase.from('wbs_nodes').delete().eq('id', selectedWbsLive.id)
    setIsPending(false)
    if (error) { showSnack(error.message); return }
    setSelectedWbs(null)
    invalidate()
  }

  const handleMoveUp = async () => {
    if (!selectedWbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedWbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedWbsLive.id)
    if (idx === 0) return
    const prev = siblings[idx - 1]
    setIsPending(true)
    await Promise.all([
      supabase.from('wbs_nodes').update({ order_index: prev.order_index }).eq('id', selectedWbsLive.id),
      supabase.from('wbs_nodes').update({ order_index: selectedWbsLive.order_index }).eq('id', prev.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveDown = async () => {
    if (!selectedWbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedWbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedWbsLive.id)
    if (idx === siblings.length - 1) return
    const next = siblings[idx + 1]
    setIsPending(true)
    await Promise.all([
      supabase.from('wbs_nodes').update({ order_index: next.order_index }).eq('id', selectedWbsLive.id),
      supabase.from('wbs_nodes').update({ order_index: selectedWbsLive.order_index }).eq('id', next.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveLeft = async () => {
    if (!selectedWbsLive || !selectedWbsLive.parent_id) return
    const parent = rawNodes.find(n => n.id === selectedWbsLive.parent_id)
    if (!parent) return
    const grandParentId = parent.parent_id ?? null
    const toShift = rawNodes.filter(n =>
      (n.parent_id ?? null) === grandParentId && n.order_index > parent.order_index
    )
    setIsPending(true)
    await Promise.all([
      ...toShift.map(n =>
        supabase.from('wbs_nodes').update({ order_index: n.order_index + 1 }).eq('id', n.id)
      ),
      supabase.from('wbs_nodes').update({
        parent_id: grandParentId,
        order_index: parent.order_index + 1
      }).eq('id', selectedWbsLive.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveRight = async () => {
    if (!selectedWbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedWbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedWbsLive.id)
    if (idx === 0) return
    const prevSibling = siblings[idx - 1]
    if (prevSibling.open_for_poz) {
      showSnack('Poz eklemeye açık başlıklara alt başlık eklenemez.')
      return
    }
    const prevChildren = rawNodes.filter(n => n.parent_id === prevSibling.id)
    const maxOrder = prevChildren.length ? Math.max(...prevChildren.map(n => n.order_index)) : 0
    setIsPending(true)
    await supabase.from('wbs_nodes').update({
      parent_id: prevSibling.id,
      order_index: maxOrder + 1
    }).eq('id', selectedWbsLive.id)
    setIsPending(false)
    invalidate()
  }

  const handleOpenAdd = () => {
    if (selectedWbsLive?.open_for_poz) {
      showSnack('Poz eklemeye açılan başlıklara alt başlık eklenemez.')
      return
    }
    setShow('FormCreate')
  }

  return (
    <Grid container direction="column" spacing={0} sx={{ mt: subHeaderHeight }}>

      {dialogAlert &&
        <DialogAlert {...dialogAlert} onCloseAction={() => setDialogAlert()} />
      }

      <Snackbar
        open={openSnack}
        autoHideDuration={5000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnack(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>

      <Grid item>
        <HeaderWbs
          selectedWbs={selectedWbsLive}
          isPending={isPending}
          onDeselect={() => setSelectedWbs(null)}
          onTogglePoz={handleTogglePoz}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onDelete={handleDelete}
          onAdd={handleOpenAdd}
          onEdit={() => setShow('FormUpdate')}
        />
      </Grid>

      {show === 'FormCreate' &&
        <Grid item>
          <FormWbsCreate
            setShow={setShow}
            rawNodes={rawNodes}
            selectedWbs={selectedWbsLive}
            setSelectedWbs={setSelectedWbs}
            invalidate={invalidate}
          />
        </Grid>
      }

      {show === 'FormUpdate' && selectedWbsLive &&
        <Grid item>
          <FormWbsUpdate
            setShow={setShow}
            selectedWbs={selectedWbsLive}
            setSelectedWbs={setSelectedWbs}
            invalidate={invalidate}
          />
        </Grid>
      }

      {isLoading &&
        <Box sx={{ m: "1rem" }}>
          <LinearProgress />
        </Box>
      }

      {!isLoading && flatNodes.length === 0 &&
        <Stack sx={{ width: '100%', padding: "0.5rem" }}>
          <Alert severity="info">
            Yukarıdaki "+" tuşuna basarak poz başlığı oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {flatNodes.length > 0 &&
        <Stack sx={{ maxWidth: "60rem", padding: "0.5rem" }} spacing={0}>

          {/* Proje başlık satırı */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black" }} />
            <Box sx={{ backgroundColor: "black", color: "white", pl: "4px", py: "2px" }}>
              <Typography variant="body2">{selectedProje?.name}</Typography>
            </Box>
          </Box>

          {/* Ağaç */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black" }} />
            <Box>
              {flatNodes.map(node => {
                const { depth } = node
                const isSelected = selectedWbs?.id === node.id
                const cols = depth === 0 ? "1fr" : `repeat(${depth}, 1rem) 1fr`
                const c = nodeColor(depth)

                return (
                  <Box key={node.id} sx={{ display: "grid", gridTemplateColumns: cols }}>

                    {Array.from({ length: depth }).map((_, i) => (
                      <Box key={i} sx={{ backgroundColor: nodeColor(i).bg, borderLeft: "1px solid gray" }} />
                    ))}

                    <Box
                      onClick={() => setSelectedWbs(isSelected ? null : node)}
                      sx={{
                        pl: "6px",
                        py: "1px",
                        borderBottom: "0.5px solid gray",
                        borderLeft: "1px solid gray",
                        backgroundColor: isSelected ? '#1a3a5c' : c.bg,
                        color: c.co,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        '&:hover': { filter: 'brightness(1.2)' }
                      }}
                    >
                      {/* Poz açık göstergesi (yeşil nokta) */}
                      {node.open_for_poz &&
                        <Box sx={{
                          width: "0.45rem", height: "0.45rem", borderRadius: "50%",
                          backgroundColor: "#65FF00", flexShrink: 0
                        }} />
                      }

                      <Typography variant="body2">
                        {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                      </Typography>

                      {/* Seçili göstergesi (sarı nokta) */}
                      {isSelected &&
                        <Box sx={{
                          ml: "0.3rem", width: "0.4rem", height: "0.4rem",
                          borderRadius: "50%", backgroundColor: "yellow"
                        }} />
                      }
                    </Box>

                  </Box>
                )
              })}
            </Box>
          </Box>

        </Stack>
      }

    </Grid>
  )
}
