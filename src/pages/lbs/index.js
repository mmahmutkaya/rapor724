
import { useState, useContext, useEffect, useMemo } from 'react'
import { StoreContext } from '../../components/store'
import { DialogAlert } from '../../components/general/DialogAlert'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetLbsNodes } from '../../hooks/useMongo'
import { supabase } from '../../lib/supabase'

import FormLbsCreate from '../../components/FormLbsCreate'
import FormLbsUpdate from '../../components/FormLbsUpdate'

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
import { AppBar } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'


function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === parentId)
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)])
}

function nodeColor(depth) {
  const palette = [
    { bg: "#7a3333", co: "#e6e6e6" },
    { bg: "#2d5c3a", co: "#e6e6e6" },
    { bg: "#2d4f80", co: "#e6e6e6" },
    { bg: "#6b5a2a", co: "#e6e6e6" },
    { bg: "#2d6060", co: "#e6e6e6" },
    { bg: "#4a2d7a", co: "#e6e6e6" },
    { bg: "#6b2d50", co: "#e6e6e6" },
    { bg: "#505050", co: "#e6e6e6" },
  ]
  return palette[depth % palette.length]
}


function HeaderLbs({
  selectedLbs, isPending,
  onDeselect, onMoveUp, onMoveDown, onMoveLeft, onMoveRight,
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
              Mahal Başlıkları (LBS)
            </Typography>
          </Box>

          <Grid item>
            <Grid container spacing={0} sx={{ alignItems: "center" }}>

              <Grid item>
                <IconButton onClick={onDeselect}>
                  <ClearOutlinedIcon sx={{ color: !selectedLbs ? "lightgray" : "red" }} />
                </IconButton>
              </Grid>

              <Divider sx={{ mx: "0.5rem" }} color="#b3b3b3" orientation="vertical" flexItem />

              <Grid item>
                <IconButton onClick={onMoveUp} disabled={!selectedLbs || isPending}>
                  <KeyboardArrowUpIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveDown} disabled={!selectedLbs || isPending}>
                  <KeyboardArrowDownIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveLeft} disabled={!selectedLbs || isPending}>
                  <KeyboardArrowLeftIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onMoveRight} disabled={!selectedLbs || isPending}>
                  <KeyboardArrowRightIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Divider sx={{ mx: "0.5rem" }} color="#b3b3b3" orientation="vertical" flexItem />

              <Grid item>
                <IconButton onClick={onEdit} disabled={!selectedLbs || isPending}>
                  <EditIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(100,100,100)" }} />
                </IconButton>
              </Grid>

              <Grid item>
                <IconButton onClick={onDelete} disabled={!selectedLbs || isPending}>
                  <DeleteIcon sx={{ color: !selectedLbs ? "lightgray" : "rgb(139,0,0)" }} />
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


export default function P_Lbs() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectedProje, subHeaderHeight } = useContext(StoreContext)
  const { selectedLbs, setSelectedLbs } = useContext(StoreContext)

  const [show, setShow] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [dialogAlert, setDialogAlert] = useState()
  const pageMinWidth = '40rem'

  useEffect(() => {
    if (!selectedProje) navigate('/projeler')
  }, [])

  const { data: rawNodes = [], isLoading } = useGetLbsNodes()

  const flatNodes = useMemo(() => flattenTree(rawNodes), [rawNodes])

  const selectedLbsLive = useMemo(() => {
    if (!selectedLbs) return null
    return rawNodes.find(n => n.id === selectedLbs.id) ?? null
  }, [selectedLbs, rawNodes])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lbsNodes', selectedProje?.id] })

  const showSnack = (msg) => { setSnackMsg(msg); setOpenSnack(true) }


  const handleDelete = async () => {
    if (!selectedLbsLive) return
    if (rawNodes.some(n => n.parent_id === selectedLbsLive.id)) {
      showSnack('Alt başlığı bulunan başlıklar silinemez.')
      return
    }
    setIsPending(true)
    const { error } = await supabase.from('lbs_nodes').delete().eq('id', selectedLbsLive.id)
    setIsPending(false)
    if (error) { showSnack(error.message); return }
    setSelectedLbs(null)
    invalidate()
  }

  const handleMoveUp = async () => {
    if (!selectedLbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedLbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedLbsLive.id)
    if (idx === 0) return
    const prev = siblings[idx - 1]
    setIsPending(true)
    await Promise.all([
      supabase.from('lbs_nodes').update({ order_index: prev.order_index }).eq('id', selectedLbsLive.id),
      supabase.from('lbs_nodes').update({ order_index: selectedLbsLive.order_index }).eq('id', prev.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveDown = async () => {
    if (!selectedLbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedLbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedLbsLive.id)
    if (idx === siblings.length - 1) return
    const next = siblings[idx + 1]
    setIsPending(true)
    await Promise.all([
      supabase.from('lbs_nodes').update({ order_index: next.order_index }).eq('id', selectedLbsLive.id),
      supabase.from('lbs_nodes').update({ order_index: selectedLbsLive.order_index }).eq('id', next.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveLeft = async () => {
    if (!selectedLbsLive || !selectedLbsLive.parent_id) return
    const parent = rawNodes.find(n => n.id === selectedLbsLive.parent_id)
    if (!parent) return
    const grandParentId = parent.parent_id ?? null
    const toShift = rawNodes.filter(n =>
      (n.parent_id ?? null) === grandParentId && n.order_index > parent.order_index
    )
    setIsPending(true)
    await Promise.all([
      ...toShift.map(n =>
        supabase.from('lbs_nodes').update({ order_index: n.order_index + 1 }).eq('id', n.id)
      ),
      supabase.from('lbs_nodes').update({
        parent_id: grandParentId,
        order_index: parent.order_index + 1
      }).eq('id', selectedLbsLive.id)
    ])
    setIsPending(false)
    invalidate()
  }

  const handleMoveRight = async () => {
    if (!selectedLbsLive) return
    const siblings = rawNodes
      .filter(n => (n.parent_id ?? null) === (selectedLbsLive.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index)
    const idx = siblings.findIndex(n => n.id === selectedLbsLive.id)
    if (idx === 0) return
    const prevSibling = siblings[idx - 1]
    const prevChildren = rawNodes.filter(n => n.parent_id === prevSibling.id)
    const maxOrder = prevChildren.length ? Math.max(...prevChildren.map(n => n.order_index)) : 0
    setIsPending(true)
    await supabase.from('lbs_nodes').update({
      parent_id: prevSibling.id,
      order_index: maxOrder + 1
    }).eq('id', selectedLbsLive.id)
    setIsPending(false)
    invalidate()
  }

  return (
    <Grid container direction="column" spacing={0} sx={{ mt: subHeaderHeight, overflowX: 'auto' }}>

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
        <HeaderLbs
          selectedLbs={selectedLbsLive}
          isPending={isPending}
          onDeselect={() => setSelectedLbs(null)}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onDelete={handleDelete}
          onAdd={() => setShow('FormCreate')}
          onEdit={() => setShow('FormUpdate')}
        />
      </Grid>

      {show === 'FormCreate' &&
        <Grid item>
          <FormLbsCreate
            setShow={setShow}
            rawNodes={rawNodes}
            selectedLbs={selectedLbsLive}
            setSelectedLbs={setSelectedLbs}
            invalidate={invalidate}
          />
        </Grid>
      }

      {show === 'FormUpdate' && selectedLbsLive &&
        <Grid item>
          <FormLbsUpdate
            setShow={setShow}
            selectedLbs={selectedLbsLive}
            setSelectedLbs={setSelectedLbs}
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
            Yukarıdaki "+" tuşuna basarak mahal başlığı oluşturabilirsiniz.
          </Alert>
        </Stack>
      }

      {flatNodes.length > 0 &&
        <Stack sx={{ maxWidth: "60rem", minWidth: pageMinWidth, padding: "0.5rem", width: 'fit-content' }} spacing={0}>

          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black" }} />
            <Box sx={{ backgroundColor: "black", color: "white", pl: "4px", py: "2px" }}>
              <Typography variant="body2">{selectedProje?.name}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
            <Box sx={{ backgroundColor: "black" }} />
            <Box>
              {flatNodes.map(node => {
                const { depth } = node
                const isSelected = selectedLbs?.id === node.id
                const isLeaf = !rawNodes.some(n => n.parent_id === node.id)
                const cols = depth === 0 ? "1fr" : `repeat(${depth}, 1rem) 1fr`
                const c = nodeColor(depth)

                return (
                  <Box key={node.id} sx={{ display: "grid", gridTemplateColumns: cols }}>

                    {Array.from({ length: depth }).map((_, i) => (
                      <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                    ))}

                    <Box
                      onClick={() => setSelectedLbs(isSelected ? null : node)}
                      sx={{
                        pl: "6px",
                        py: "1px",
                        backgroundColor: isSelected ? '#3a1a00' : c.bg,
                        color: c.co,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        '&:hover': { filter: 'brightness(1.2)' }
                      }}
                    >
                      {isLeaf &&
                        <Box sx={{
                          width: "0.45rem", height: "0.45rem", borderRadius: "50%",
                          backgroundColor: "#65FF00", flexShrink: 0
                        }} />
                      }

                      <Typography variant="body2">
                        {node.code_name ? `(${node.code_name}) ` : ''}{node.name}
                      </Typography>

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
