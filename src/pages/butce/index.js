import React, { useState, useEffect, useContext, useMemo } from "react";
import { StoreContext } from "../../components/store.js";
import { useNavigate } from "react-router-dom";
import { useGetWorkPackages } from "../../hooks/useMongo.js";
import { supabase } from "../../lib/supabase.js";
import { DialogAlert } from "../../components/general/DialogAlert.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";

import ClearOutlined from "@mui/icons-material/ClearOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

const CURRENCIES = ["TRY", "USD", "EUR"];
const CURRENCY_SYMBOL = { TRY: "₺", USD: "$", EUR: "€" };

// pozlar/index.js ile birebir aynı palet
const NODE_PALETTE = [
  { bg: "#8b0000", co: "#e6e6e6" },
  { bg: "#330066", co: "#e6e6e6" },
  { bg: "#005555", co: "#e6e6e6" },
  { bg: "#737373", co: "#e6e6e6" },
  { bg: "#8b008b", co: "#e6e6e6" },
  { bg: "#2929bc", co: "#e6e6e6" },
  { bg: "#00853E", co: "#e6e6e6" },
  { bg: "#4B5320", co: "#e6e6e6" },
];

// pozlar/index.js ile aynı yardımcılar
function flattenTree(nodes, parentId = null, depth = 0) {
  return nodes
    .filter(n => (n.parent_id ?? null) === (parentId ?? null))
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(n => [{ ...n, depth }, ...flattenTree(nodes, n.id, depth + 1)]);
}

function nodeColor(depth) {
  return NODE_PALETTE[depth % NODE_PALETTE.length];
}

function emptyRow(overrides = {}) {
  return { butceTRY: "", butceUSD: "", butceEUR: "", ...overrides };
}

export default function P_KesifButce() {
  const { appUser, selectedProje } = useContext(StoreContext);
  const navigate = useNavigate();

  const [show, setShow] = useState("Main");
  // formNodes: [{ id, parent_id, name, isFixed, order_index, rows: [{id, name, isWp, butceTRY, butceUSD, butceEUR}] }]
  const [formNodes, setFormNodes] = useState([]);
  const [formAciklama, setFormAciklama] = useState("");
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [draftInfo, setDraftInfo] = useState(null);
  const [viewMode, setViewMode] = useState("wbsPoz");

  const [visibleCurrencies, setVisibleCurrencies] = useState({ TRY: true, USD: false, EUR: false });
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);

  const draftKey = selectedProje ? `butce_draft_${selectedProje.id}` : null;

  const [versiyonlar, setVersiyonlar] = useState([]);
  const [versiyonlarLoading, setVersiyonlarLoading] = useState(false);

  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogAciklama, setSaveDialogAciklama] = useState("");

  const { data: workPackages = [], isFetching: wpLoading } = useGetWorkPackages();

  const nextVNum =
    (versiyonlar.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1;

  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }
    if (draftKey) {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) setDraftInfo({ savedAt: JSON.parse(saved).savedAt });
      } catch {}
    }
    loadVersiyonlar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (show !== "Form" || !draftKey || formNodes.length === 0) return;
    const timer = setTimeout(() => {
      const draft = { formNodes, formAciklama, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setDraftInfo({ savedAt: draft.savedAt });
    }, 600);
    return () => clearTimeout(timer);
  }, [formNodes, formAciklama, show, draftKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tree hesaplamaları ──────────────────────────────────────────────────────
  const flatNodes = useMemo(() => flattenTree(formNodes), [formNodes]);

  const isLeafSet = useMemo(() => {
    const s = new Set();
    formNodes.forEach(n => {
      if (!formNodes.some(c => c.parent_id === n.id)) s.add(n.id);
    });
    return s;
  }, [formNodes]);

  const maxLeafDepth = useMemo(() => {
    const leaves = flatNodes.filter(n => isLeafSet.has(n.id));
    return leaves.length > 0 ? Math.max(...leaves.map(n => n.depth)) : 0;
  }, [flatNodes, isLeafSet]);

  const visibleCurrencyList = useMemo(
    () => CURRENCIES.filter(c => visibleCurrencies[c]),
    [visibleCurrencies]
  );

  const totalDepthCols = maxLeafDepth + 1;
  const treeGridCols = useMemo(() => {
    const budgetCols = visibleCurrencyList.length > 0
      ? visibleCurrencyList.map(() => "9rem").join(" ") + " "
      : "";
    return `repeat(${totalDepthCols}, 1rem) minmax(16rem, max-content) 0.5rem ${budgetCols}max-content minmax(0, 1fr)`;
  }, [totalDepthCols, visibleCurrencyList]);

  // ── Seçili düğüm / taşıma ──────────────────────────────────────────────────
  const activeNode = useMemo(
    () => formNodes.find(n => n.id === activeNodeId) ?? null,
    [formNodes, activeNodeId]
  );

  const nodeSiblings = useMemo(() => {
    if (!activeNode) return [];
    return formNodes
      .filter(n => (n.parent_id ?? null) === (activeNode.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index);
  }, [formNodes, activeNode]);

  const sibIdx = useMemo(
    () => nodeSiblings.findIndex(n => n.id === activeNodeId),
    [nodeSiblings, activeNodeId]
  );

  const canMoveUp    = !!activeNode && !activeNode.isFixed && sibIdx > 0;
  const canMoveDown  = !!activeNode && !activeNode.isFixed && sibIdx < nodeSiblings.length - 1;
  const canMoveLeft  = !!activeNode && !activeNode.isFixed && activeNode.parent_id != null;
  const canMoveRight = !!activeNode && !activeNode.isFixed && sibIdx > 0;

  const handleMoveUp = () => {
    if (!canMoveUp) return;
    const prev = nodeSiblings[sibIdx - 1];
    setFormNodes(p => p.map(n => {
      if (n.id === activeNode.id) return { ...n, order_index: prev.order_index };
      if (n.id === prev.id)       return { ...n, order_index: activeNode.order_index };
      return n;
    }));
  };

  const handleMoveDown = () => {
    if (!canMoveDown) return;
    const next = nodeSiblings[sibIdx + 1];
    setFormNodes(p => p.map(n => {
      if (n.id === activeNode.id) return { ...n, order_index: next.order_index };
      if (n.id === next.id)       return { ...n, order_index: activeNode.order_index };
      return n;
    }));
  };

  const handleMoveLeft = () => {
    if (!canMoveLeft) return;
    const parent = formNodes.find(n => n.id === activeNode.parent_id);
    const grandparentId = parent?.parent_id ?? null;
    const parentSiblings = formNodes
      .filter(n => (n.parent_id ?? null) === (grandparentId ?? null))
      .sort((a, b) => a.order_index - b.order_index);
    const parentIdx = parentSiblings.findIndex(n => n.id === parent.id);
    const toShift = parentSiblings.filter((_, i) => i > parentIdx);
    setFormNodes(p => p.map(n => {
      if (n.id === activeNode.id) return { ...n, parent_id: grandparentId, order_index: parent.order_index + 1 };
      if (toShift.some(s => s.id === n.id)) return { ...n, order_index: n.order_index + 1 };
      return n;
    }));
  };

  const handleMoveRight = () => {
    if (!canMoveRight) return;
    const newParent = nodeSiblings[sibIdx - 1];
    const newChildren = formNodes.filter(n => n.parent_id === newParent.id);
    const newOrder = newChildren.length > 0 ? Math.max(...newChildren.map(n => n.order_index)) + 1 : 0;
    setFormNodes(p => p.map(n =>
      n.id === activeNode.id ? { ...n, parent_id: newParent.id, order_index: newOrder } : n
    ));
    setCollapsedIds(prev => { const next = new Set(prev); next.delete(newParent.id); return next; });
  };

  // ── Versiyonlar ─────────────────────────────────────────────────────────────
  const loadVersiyonlar = async () => {
    if (!selectedProje?.id) {
      setVersiyonlar(
        [...(selectedProje?.butceVersiyonlar ?? [])].sort((a, b) => b.versiyonNumber - a.versiyonNumber)
      );
      return;
    }
    setVersiyonlarLoading(true);
    const { data, error } = await supabase
      .from("budget_versions").select("*")
      .eq("project_id", selectedProje.id)
      .order("versiyon_number", { ascending: false });
    setVersiyonlarLoading(false);
    if (!error && data) {
      setVersiyonlar(data.map(r => ({
        versiyonNumber: r.versiyon_number,
        aciklama: r.aciklama ?? "",
        tutar: r.total_butce_tutar,
        createdAt: r.created_at,
        olusturanEmail: null,
      })));
    }
  };

  const openForm = () => {
    const buildWpRows = (draftFixedNode) =>
      workPackages.map(wp => {
        const prev = draftFixedNode?.rows.find(r => r.id === wp.id);
        return {
          id: wp.id, name: wp.name, isWp: true,
          butceTRY: prev?.butceTRY ?? "",
          butceUSD: prev?.butceUSD ?? "",
          butceEUR: prev?.butceEUR ?? "",
        };
      });

    let nodes = null;
    let savedAciklama = "";

    if (draftKey) {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          const draft = JSON.parse(saved);
          const draftFixedNode = draft.formNodes?.find(n => n.isFixed);
          nodes = draft.formNodes.map(n =>
            n.isFixed ? { ...n, rows: buildWpRows(draftFixedNode) } : n
          );
          savedAciklama = draft.formAciklama || "";
        }
      } catch {}
    }

    if (!nodes) {
      nodes = [{
        id: "node_ispaketleri",
        parent_id: null,
        name: "İş Paketleri",
        isFixed: true,
        order_index: 0,
        rows: buildWpRows(null),
      }];
    }

    setFormNodes(nodes);
    setFormAciklama(savedAciklama);
    setActiveNodeId(null);
    setCollapsedIds(new Set());
    setShow("Form");
  };

  const cancelForm = () => {
    setFormNodes([]);
    setFormAciklama("");
    setActiveNodeId(null);
    setCollapsedIds(new Set());
    setShow("Main");
  };

  const discardDraft = () => {
    if (draftKey) localStorage.removeItem(draftKey);
    setDraftInfo(null);
  };

  // ── Collapse ────────────────────────────────────────────────────────────────
  const toggleCollapse = id =>
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  function isHiddenByAncestor(node) {
    let parentId = node.parent_id;
    while (parentId) {
      if (collapsedIds.has(parentId)) return true;
      const parent = formNodes.find(n => n.id === parentId);
      parentId = parent?.parent_id ?? null;
    }
    return false;
  }

  // ── Düğüm işlemleri ─────────────────────────────────────────────────────────
  const updateNodeName = (id, val) =>
    setFormNodes(p => p.map(n => n.id === id ? { ...n, name: val } : n));

  const addRootNode = () => {
    const roots = formNodes.filter(n => n.parent_id == null);
    const maxOrder = roots.length > 0 ? Math.max(...roots.map(n => n.order_index)) : -1;
    const newNode = {
      id: "node_" + Date.now(),
      parent_id: null,
      name: "Yeni Düğüm",
      isFixed: false,
      order_index: maxOrder + 1,
      rows: [],
    };
    setFormNodes(p => [...p, newNode]);
    setActiveNodeId(newNode.id);
  };

  const addChildNode = parentId => {
    const parent = formNodes.find(n => n.id === parentId);
    if (parent?.rows?.length > 0) return;
    const siblings = formNodes.filter(n => n.parent_id === parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(n => n.order_index)) : -1;
    const newNode = {
      id: "node_" + Date.now(),
      parent_id: parentId,
      name: "Yeni Alt Düğüm",
      isFixed: false,
      order_index: maxOrder + 1,
      rows: [],
    };
    setFormNodes(p => [...p, newNode]);
    setCollapsedIds(prev => { const next = new Set(prev); next.delete(parentId); return next; });
    setActiveNodeId(newNode.id);
  };

  const deleteNodeRecursive = id => {
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      formNodes.forEach(n => {
        if (n.parent_id && toDelete.has(n.parent_id) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          changed = true;
        }
      });
    }
    setFormNodes(p => p.filter(n => !toDelete.has(n.id)));
    if (toDelete.has(activeNodeId)) setActiveNodeId(null);
  };

  // ── Satır işlemleri ─────────────────────────────────────────────────────────
  const addRow = nodeId =>
    setFormNodes(p => p.map(n =>
      n.id === nodeId
        ? { ...n, rows: [...n.rows, emptyRow({ id: "row_" + Date.now() + "_" + Math.random(), name: "", isWp: false }) ] }
        : n
    ));

  const updateRow = (nodeId, rowId, field, val) =>
    setFormNodes(p => p.map(n =>
      n.id === nodeId ? { ...n, rows: n.rows.map(r => r.id === rowId ? { ...r, [field]: val } : r) } : n
    ));

  const deleteRow = (nodeId, rowId) =>
    setFormNodes(p => p.map(n =>
      n.id === nodeId ? { ...n, rows: n.rows.filter(r => r.id !== rowId) } : n
    ));

  // ── Toplamlar (per-currency) ─────────────────────────────────────────────────
  const nodeRowTotal = (node, cur) =>
    node.rows.reduce((s, r) => s + (Number(r[`butce${cur}`]) || 0), 0);

  const subtreeTotal = (nodeId, cur) => {
    const node = formNodes.find(n => n.id === nodeId);
    if (!node) return 0;
    return nodeRowTotal(node, cur) + formNodes
      .filter(n => n.parent_id === nodeId)
      .reduce((s, child) => s + subtreeTotal(child.id, cur), 0);
  };

  const grandTotal = useMemo(() =>
    Object.fromEntries(CURRENCIES.map(c => [
      c, formNodes.filter(n => n.parent_id == null).reduce((s, n) => s + subtreeTotal(n.id, c), 0)
    ])),
    [formNodes] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const hasAnyButce = formNodes.some(n =>
    n.rows.some(r => CURRENCIES.some(c => r[`butce${c}`] !== ""))
  );

  // ── Kaydet ──────────────────────────────────────────────────────────────────
  const handleSaveClick = () => {
    setSaveDialogAciklama(formAciklama);
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    setShowSaveDialog(false);
    setIsSaving(true);
    try {
      const { error } = await supabase.from("budget_versions").insert({
        project_id: selectedProje.id,
        versiyon_number: nextVNum,
        aciklama: saveDialogAciklama.trim() || null,
        total_kesif_tutar: null,
        total_butce_tutar: Math.round((grandTotal["TRY"] ?? 0) * 100) / 100 || null,
        is_paketler_satirlar: {
          nodes: formNodes.map(n => ({
            nodeId: n.id, nodeName: n.name, isFixed: n.isFixed,
            parentId: n.parent_id, orderIndex: n.order_index,
            rows: n.rows.map((r, i) => ({
              sira: i + 1, rowId: r.id, name: r.name, isWp: r.isWp,
              butceTRY: r.butceTRY !== "" ? Number(r.butceTRY) || null : null,
              butceUSD: r.butceUSD !== "" ? Number(r.butceUSD) || null : null,
              butceEUR: r.butceEUR !== "" ? Number(r.butceEUR) || null : null,
            })),
            totalButceTRY: Math.round(nodeRowTotal(n, "TRY") * 100) / 100,
          })),
        },
        created_by: appUser.id,
      });
      if (error) throw new Error(error.message);
      if (draftKey) localStorage.removeItem(draftKey);
      setDraftInfo(null);
      await loadVersiyonlar();
      cancelForm();
    } catch (err) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: "Kayıt sırasında hata oluştu.", detailText: err?.message ?? null, onCloseAction: () => setDialogAlert() });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Yardımcı formatter'lar ──────────────────────────────────────────────────
  const fmt = v => {
    if (v == null || v === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  };
  const formatTarih = d => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("tr-TR"); } catch { return "—"; }
  };

  const iconBtn_sx = { width: 40, height: 40 };
  const icon_sx = { fontSize: 24 };

  const listCols = "max-content max-content minmax(10rem, 1fr) max-content max-content";
  const css_lb = { display: "flex", alignItems: "center", px: "0.6rem", py: "0.3rem", backgroundColor: "#c8c8c8", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", borderBottom: "1px solid #aaa", whiteSpace: "nowrap" };
  const css_ls = { display: "flex", alignItems: "center", px: "0.6rem", py: "0.4rem", borderBottom: "1px solid #ddd", fontSize: "0.875rem", backgroundColor: "#f2f2f2" };

  // ── Akıllı + butonu ────────────────────────────────────────────────────────
  const activeIsLeaf = activeNodeId ? isLeafSet.has(activeNodeId) : false;
  const activeHasRows = (activeNode?.rows?.length ?? 0) > 0;

  let addLabel, addDisabled = false;
  if (viewMode === "wbsOnly") {
    if (!activeNodeId)       addLabel = "Kök başlık ekle";
    else if (activeHasRows)  { addLabel = "Satırı olan düğüme alt başlık eklenemez"; addDisabled = true; }
    else                     addLabel = "Alt başlık ekle";
  } else {
    if (!activeNodeId)           { addLabel = "Bir düğüm seçin"; addDisabled = true; }
    else if (!activeIsLeaf) {
      if (activeHasRows)         { addLabel = "Satırı olan düğüme alt başlık eklenemez"; addDisabled = true; }
      else                       addLabel = "Alt başlık ekle";
    } else {
      if (activeNode?.isFixed)   { addLabel = "Bu düğümün satırları otomatik gelir"; addDisabled = true; }
      else                       addLabel = "Bütçe satırı ekle";
    }
  }

  const handleSmartAdd = () => {
    if (viewMode === "wbsOnly") {
      if (!activeNodeId) { addRootNode(); return; }
      if (activeHasRows) {
        setDialogAlert({ dialogIcon: "warning", dialogMessage: "Bu düğümün altında bütçe satırları olduğundan alt başlık eklenemez.", detailText: "Bütçe satırları yalnızca yaprak düğümlere bağlıdır.", onCloseAction: () => setDialogAlert() });
        return;
      }
      addChildNode(activeNodeId);
    } else {
      if (!activeNodeId) return;
      if (!activeIsLeaf) {
        if (activeHasRows) {
          setDialogAlert({ dialogIcon: "warning", dialogMessage: "Bu düğümün altında bütçe satırları olduğundan alt başlık eklenemez.", detailText: "Bütçe satırları yalnızca yaprak düğümlere bağlıdır.", onCloseAction: () => setDialogAlert() });
          return;
        }
        addChildNode(activeNodeId);
      } else {
        if (activeNode?.isFixed) return;
        addRow(activeNodeId);
      }
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minWidth: "40rem" }}>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* Kaydet dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: "0.5rem" }}>
          Versiyonu Kaydet <Typography component="span" variant="body2" sx={{ color: "gray" }}>— v{nextVNum}</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            variant="outlined"
            label="Açıklama (isteğe bağlı)"
            fullWidth
            size="small"
            value={saveDialogAciklama}
            onChange={e => setSaveDialogAciklama(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: "0.5rem" }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveConfirm(); } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: "1.5rem", pb: "1rem" }}>
          <Button onClick={() => setShowSaveDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveConfirm} disabled={isSaving}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Para birimi dialog */}
      <Dialog open={showCurrencyDialog} onClose={() => setShowCurrencyDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: "0.5rem" }}>Görünüm Ayarları</DialogTitle>
        <DialogContent>
          {CURRENCIES.map(c => (
            <Box key={c} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: "0.4rem" }}>
              <Typography variant="body2">{c} bütçe sütunu</Typography>
              <Switch
                size="small"
                checked={visibleCurrencies[c]}
                onChange={e => setVisibleCurrencies(prev => ({ ...prev, [c]: e.target.checked }))}
              />
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* APP BAR */}
      <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ px: "1rem", py: "0.25rem", minHeight: "3.5rem" }}>
          <Grid item xs>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Keşif / Bütçe
              {show === "Form" && (
                <Typography component="span" variant="body2" sx={{ ml: "0.5rem", color: "gray" }}>
                  — v{nextVNum} oluştur
                </Typography>
              )}
              {show === "Form" && draftInfo && (
                <Typography component="span" variant="caption" sx={{ ml: "0.75rem", color: "#bbb" }}>
                  • taslak kaydedildi
                </Typography>
              )}
            </Typography>
          </Grid>
          <Grid item xs="auto">
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {show === "Form" ? (
                <>
                  {activeNodeId && (
                    <>
                      <Tooltip title="Yukarı taşı"><span>
                        <IconButton size="small" onClick={handleMoveUp} disabled={!canMoveUp}>
                          <KeyboardArrowUpIcon />
                        </IconButton>
                      </span></Tooltip>
                      <Tooltip title="Aşağı taşı"><span>
                        <IconButton size="small" onClick={handleMoveDown} disabled={!canMoveDown}>
                          <KeyboardArrowDownIcon />
                        </IconButton>
                      </span></Tooltip>
                      <Tooltip title="Sol'a taşı (üst seviyeye)"><span>
                        <IconButton size="small" onClick={handleMoveLeft} disabled={!canMoveLeft}>
                          <KeyboardArrowLeftIcon />
                        </IconButton>
                      </span></Tooltip>
                      <Tooltip title="Sağ'a taşı (bir üst kardeşin altına)"><span>
                        <IconButton size="small" onClick={handleMoveRight} disabled={!canMoveRight}>
                          <KeyboardArrowRightIcon />
                        </IconButton>
                      </span></Tooltip>
                    </>
                  )}

                  <Tooltip title={addLabel}><span>
                    <IconButton onClick={handleSmartAdd} disabled={addDisabled} sx={iconBtn_sx}>
                      <AddCircleOutlineIcon color={addDisabled ? "disabled" : "success"} sx={icon_sx} />
                    </IconButton>
                  </span></Tooltip>

                  <IconButton onClick={cancelForm} disabled={isSaving} sx={iconBtn_sx}>
                    <ClearOutlined sx={{ ...icon_sx, color: "red" }} />
                  </IconButton>
                  <IconButton onClick={handleSaveClick} disabled={isSaving || !hasAnyButce} sx={iconBtn_sx}>
                    <SaveOutlined sx={{ ...icon_sx, color: (isSaving || !hasAnyButce) ? "#bbb" : "green" }} />
                  </IconButton>

                  {/* Görünüm modu toggle */}
                  <Tooltip title={`Görünüm: ${viewMode === "wbsOnly" ? "WBS" : "W+B"} (tıkla: değiştir)`}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setViewMode(v => v === "wbsOnly" ? "wbsPoz" : "wbsOnly")}
                      startIcon={<ViewAgendaIcon />}
                      sx={{
                        textTransform: "none",
                        minWidth: "5.25rem",
                        px: "0.5rem",
                        color: "text.secondary",
                        borderColor: "grey.400",
                        "&:hover": { borderColor: "grey.600", backgroundColor: "grey.100" },
                      }}
                    >
                      {viewMode === "wbsOnly" ? "WBS" : "W+B"}
                    </Button>
                  </Tooltip>

                  {/* Para birimi sütun ayarları */}
                  <Tooltip title="Para birimi sütunları">
                    <IconButton size="small" onClick={() => setShowCurrencyDialog(true)} sx={{ ml: "0.25rem", color: visibleCurrencyList.length > 0 ? "#1565c0" : "inherit" }}>
                      <CurrencyExchangeIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <IconButton onClick={openForm} sx={iconBtn_sx}>
                  <AddCircleOutlineIcon color="success" sx={icon_sx} />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {show === "Form" && wpLoading && <LinearProgress />}

      <Box sx={{ p: "1rem" }}>

        {/* ── Yeni versiyon formu ── */}
        {show === "Form" && !wpLoading && (
          <>
            <Box sx={{ width: "fit-content", minWidth: "34rem" }}>

              {/* Sol siyah ray + ağaç içeriği */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
                <Box sx={{ backgroundColor: "black" }} />

                {/* Dinamik grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: treeGridCols }}>

                  {/* ── Satır 1: sütun başlıkları ── */}
                  <Box sx={{ gridColumn: `1 / span ${totalDepthCols + 1}`, backgroundColor: "black" }} />
                  <Box sx={{ backgroundColor: "white" }} />
                  {visibleCurrencyList.length === 0 ? (
                    <Box sx={{ gridColumn: "span 2", backgroundColor: "#1e1e1e" }} />
                  ) : (
                    <>
                      {visibleCurrencyList.map(c => (
                        <Box key={c} sx={{
                          backgroundColor: "#1e1e1e", color: "#e0e0e0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexDirection: "column", px: "0.5rem", py: "0.15rem", gap: 0,
                        }}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.2, opacity: 0.6 }}>
                            Bütçe
                          </Typography>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, lineHeight: 1.2 }}>
                            {c}
                          </Typography>
                        </Box>
                      ))}
                      <Box sx={{ gridColumn: "span 2", backgroundColor: "#1e1e1e" }} />
                    </>
                  )}

                  {/* ── Satır 2: Proje adı (sol) + grand totals (sağ) ── */}
                  <Box sx={{
                    gridColumn: `1 / span ${totalDepthCols + 1}`,
                    backgroundColor: "black", color: "white",
                    pl: "6px", py: "2px",
                    display: "flex", alignItems: "center",
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedProje?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: "white" }} />
                  {visibleCurrencyList.length === 0 ? (
                    <Box sx={{ gridColumn: "span 2", backgroundColor: "#1e1e1e" }} />
                  ) : (
                    <>
                      {visibleCurrencyList.map(c => (
                        <Box key={c} sx={{
                          backgroundColor: "#1e1e1e", color: "#e0e0e0",
                          display: "flex", alignItems: "center", gap: "0.25rem",
                          pl: "0.3rem", pr: "0.25rem", py: "2px",
                        }}>
                          <Box sx={{ flex: 1, textAlign: "right", fontWeight: 700, fontSize: "0.8rem" }}>
                            {grandTotal[c] > 0 ? fmt(grandTotal[c]) : "—"}
                          </Box>
                          <Typography sx={{ fontSize: "0.68rem", color: "#e0e0e0", opacity: 0.55, fontWeight: 600, flexShrink: 0 }}>
                            {CURRENCY_SYMBOL[c] ?? c}
                          </Typography>
                        </Box>
                      ))}
                      <Box sx={{ gridColumn: "span 2", backgroundColor: "#1e1e1e" }} />
                    </>
                  )}

                  {flatNodes.map(node => {
                    if (isHiddenByAncestor(node)) return null;
                    const { depth } = node;
                    const isLeaf = isLeafSet.has(node.id);
                    const isSelected = activeNodeId === node.id;
                    const isCollapsed = collapsedIds.has(node.id);
                    const c = nodeColor(depth);

                    return (
                      <React.Fragment key={node.id}>

                        {/* Derinlik çubukları */}
                        {Array.from({ length: depth }).map((_, i) => (
                          <Box key={i} sx={{ backgroundColor: nodeColor(i).bg }} />
                        ))}

                        {/* Düğüm başlık SOL */}
                        <Box
                          onClick={() => { if (!isLeaf) toggleCollapse(node.id); }}
                          sx={{
                            gridColumn: `span ${totalDepthCols - depth + 1}`,
                            pl: "6px", py: "2px",
                            backgroundColor: c.bg,
                            color: c.co,
                            cursor: isLeaf ? "default" : "pointer",
                            display: "flex", alignItems: "center", gap: "0.4rem",
                            userSelect: "none",
                            "&:hover": isLeaf ? {} : { filter: "brightness(1.2)" },
                          }}
                        >
                          {!isLeaf && (
                            <Box sx={{ fontSize: "0.7rem", flexShrink: 0 }}>
                              {isCollapsed ? "▶" : "▼"}
                            </Box>
                          )}
                          {isLeaf && (
                            <Box sx={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", backgroundColor: viewMode === "wbsOnly" && node.rows.length === 0 ? "rgba(255,255,255,0.25)" : "#65FF00", flexShrink: 0 }} />
                          )}

                          {node.isFixed ? (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: c.co, flex: 1, textTransform: "uppercase" }}>
                              {node.name}
                            </Typography>
                          ) : (
                            <TextField
                              variant="standard" size="small"
                              value={node.name}
                              onChange={(e) => { e.stopPropagation(); updateNodeName(node.id, e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                              inputProps={{ style: { fontSize: "0.875rem", fontWeight: 700, color: c.co, minWidth: "12rem", textTransform: "uppercase" } }}
                              sx={{
                                flex: 1,
                                "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.25)" },
                                "& .MuiInput-underline:hover:before": { borderBottomColor: "rgba(255,255,255,0.6)" },
                                "& .MuiInput-underline:after": { borderBottomColor: "white" },
                              }}
                            />
                          )}
                        </Box>

                        {/* Gap sütunu */}
                        <Box sx={{ backgroundColor: "white" }} />

                        {/* Düğüm subtotal — per visible currency */}
                        {visibleCurrencyList.length === 0 ? (
                          <Box
                            onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                            sx={{
                              gridColumn: "span 2", py: "2px", px: "0.4rem",
                              backgroundColor: c.bg, color: c.co,
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem",
                              userSelect: "none", "&:hover": { filter: "brightness(1.2)" },
                            }}
                          >
                            {isSelected && (
                              <Box sx={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", backgroundColor: "yellow", flexShrink: 0 }} />
                            )}
                            {!node.isFixed && (
                              <Box onClick={e => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                                <IconButton size="small" onClick={() => deleteNodeRecursive(node.id)}
                                  sx={{ color: c.co, opacity: 0.35, "&:hover": { opacity: 1, color: "#ff8a80" }, width: 22, height: 22 }}>
                                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <>
                            {visibleCurrencyList.map(cur => {
                              const total = subtreeTotal(node.id, cur);
                              return (
                                <Box
                                  key={cur}
                                  onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                                  sx={{
                                    py: "2px", pl: "0.3rem", pr: "0.25rem",
                                    backgroundColor: c.bg, color: c.co,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "0.25rem",
                                    userSelect: "none",
                                    "&:hover": { filter: "brightness(1.2)" },
                                  }}
                                >
                                  <Box sx={{ flex: 1, textAlign: "right", fontSize: "0.8rem", fontWeight: 700 }}>
                                    {total > 0 ? fmt(total) : "—"}
                                  </Box>
                                  <Typography sx={{ fontSize: "0.68rem", color: c.co, opacity: 0.55, fontWeight: 600, flexShrink: 0 }}>
                                    {CURRENCY_SYMBOL[cur] ?? cur}
                                  </Typography>
                                </Box>
                              );
                            })}
                            {/* actions cell: selection dot + delete */}
                            <Box
                              onClick={() => setActiveNodeId(prev => prev === node.id ? null : node.id)}
                              sx={{
                                gridColumn: "span 2",
                                py: "2px", px: "0.4rem",
                                backgroundColor: c.bg, color: c.co,
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem",
                                userSelect: "none",
                                "&:hover": { filter: "brightness(1.2)" },
                              }}
                            >
                              {isSelected && (
                                <Box sx={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", backgroundColor: "yellow", flexShrink: 0 }} />
                              )}
                              {!node.isFixed && (
                                <Box onClick={e => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                                  <IconButton size="small" onClick={() => deleteNodeRecursive(node.id)}
                                    sx={{ color: c.co, opacity: 0.35, "&:hover": { opacity: 1, color: "#ff8a80" }, width: 22, height: 22 }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </>
                        )}

                        {/* ── Satırlar ── */}
                        {isLeaf && !isCollapsed && viewMode === "wbsPoz" && (
                          <>
                            {node.rows.map((row, rowIdx) => {
                              const isLast = rowIdx === node.rows.length - 1;
                              const bb = isLast ? `2px solid ${c.bg}` : "1px solid #e8e8e8";
                              const rowBg = hoveredRowId === row.id ? "#e8e8e8" : "#f5f5f5";
                              const rh = {
                                onMouseEnter: () => setHoveredRowId(row.id),
                                onMouseLeave: () => setHoveredRowId(null),
                              };

                              return (
                                <React.Fragment key={row.id}>
                                  {Array.from({ length: totalDepthCols }).map((_, i) => (
                                    <Box key={i} {...rh} sx={{
                                      backgroundColor: i <= depth ? nodeColor(i).bg : "transparent",
                                      borderBottom: bb,
                                    }} />
                                  ))}

                                  {/* ad */}
                                  <Box {...rh} sx={{
                                    display: "flex", alignItems: "center",
                                    pl: "0.5rem", py: row.isWp ? "0.3rem" : "0.12rem",
                                    backgroundColor: rowBg, borderBottom: bb,
                                  }}>
                                    {row.isWp ? (
                                      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: "uppercase" }}>
                                        {row.name}
                                      </Typography>
                                    ) : (
                                      <TextField
                                        variant="standard" size="small"
                                        placeholder="Kalem adı"
                                        value={row.name}
                                        onChange={(e) => updateRow(node.id, row.id, "name", e.target.value)}
                                        autoComplete="off"
                                        inputProps={{ style: { fontSize: "0.875rem", minWidth: "13rem", textTransform: "uppercase" } }}
                                      />
                                    )}
                                  </Box>

                                  {/* gap */}
                                  <Box {...rh} sx={{ borderBottom: bb, backgroundColor: "white" }} />

                                  {/* per-currency budget inputs */}
                                  {visibleCurrencyList.map(cur => (
                                      <Box key={cur} {...rh} sx={{
                                        display: "flex", alignItems: "center",
                                        pl: "0.3rem", pr: "0.25rem", py: "0.12rem",
                                        borderBottom: bb, backgroundColor: rowBg,
                                        borderLeft: "2px solid #555",
                                        gap: "0.25rem",
                                      }}>
                                        <TextField
                                          variant="standard" size="small"
                                          placeholder="—"
                                          value={row[`butce${cur}`] ?? ""}
                                          onChange={(e) => updateRow(node.id, row.id, `butce${cur}`, e.target.value)}
                                          autoComplete="off"
                                          inputProps={{
                                            style: { fontSize: "0.875rem", textAlign: "right" },
                                            inputMode: "decimal",
                                          }}
                                          sx={{ flex: 1, minWidth: 0 }}
                                        />
                                        <Typography sx={{ fontSize: "0.68rem", color: "#888", fontWeight: 600, flexShrink: 0 }}>
                                          {CURRENCY_SYMBOL[cur] ?? cur}
                                        </Typography>
                                      </Box>
                                    ))
                                  }

                                  {/* sil */}
                                  <Box {...rh} sx={{
                                    display: "flex", alignItems: "center",
                                    px: "0.2rem", py: "0.1rem",
                                    borderBottom: bb, backgroundColor: rowBg,
                                  }}>
                                    {!row.isWp && (
                                      <IconButton size="small" onClick={() => deleteRow(node.id, row.id)}
                                        sx={{ color: "#ccc", "&:hover": { color: "red" }, width: 26, height: 26 }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    )}
                                  </Box>

                                  {/* fill */}
                                  <Box {...rh} sx={{ borderBottom: bb, backgroundColor: rowBg }} />
                                </React.Fragment>
                              );
                            })}
                          </>
                        )}

                      </React.Fragment>
                    );
                  })}

                </Box>
              </Box>

            </Box>
          </>
        )}

        {/* ── Versiyon listesi ── */}
        {show === "Main" && (
          <>
            {draftInfo && !versiyonlarLoading && (
              <Box sx={{
                mb: "1rem", p: "0.6rem 1rem",
                backgroundColor: "#fff8e1", border: "1px solid #ffe082",
                borderRadius: "6px",
                display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
              }}>
                <Typography variant="body2" sx={{ color: "#795548", flex: 1 }}>
                  ✏️ Kaydedilmemiş taslak var
                  {draftInfo.savedAt && (
                    <Typography component="span" variant="caption" sx={{ ml: "0.5rem", color: "#aaa" }}>
                      ({new Date(draftInfo.savedAt).toLocaleTimeString("tr-TR")})
                    </Typography>
                  )}
                </Typography>
                <Box
                  onClick={openForm}
                  sx={{ px: "0.75rem", py: "0.25rem", borderRadius: "4px", border: "1px solid #ffa000", color: "#e65100", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, "&:hover": { backgroundColor: "#ffe082" } }}
                >
                  Devam Et
                </Box>
                <Box
                  onClick={discardDraft}
                  sx={{ px: "0.75rem", py: "0.25rem", borderRadius: "4px", border: "1px solid #e0e0e0", color: "#999", cursor: "pointer", fontSize: "0.8rem", "&:hover": { backgroundColor: "#fbe9e7", color: "red" } }}
                >
                  Sil
                </Box>
              </Box>
            )}
            {versiyonlarLoading && <LinearProgress />}
            {!versiyonlarLoading && versiyonlar.length === 0 && (
              <Stack spacing={2}>
                <Alert severity="info">Henüz bütçe versiyonu oluşturulmamış. (+) tuşuna basarak oluşturabilirsiniz.</Alert>
              </Stack>
            )}
            {!versiyonlarLoading && versiyonlar.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: listCols, width: "fit-content" }}>
                <Box sx={{ ...css_lb, justifyContent: "center" }}>Versiyon</Box>
                <Box sx={{ ...css_lb, justifyContent: "right" }}>Tutar</Box>
                <Box sx={{ ...css_lb }}>Açıklama</Box>
                <Box sx={{ ...css_lb }}>Onaylayan</Box>
                <Box sx={{ ...css_lb }}>Tarih</Box>
                {versiyonlar.map(v => (
                  <React.Fragment key={v.versiyonNumber}>
                    <Box sx={{ ...css_ls, justifyContent: "center", fontWeight: 700 }}>v{v.versiyonNumber}</Box>
                    <Box sx={{ ...css_ls, justifyContent: "right", fontWeight: v.tutar ? 600 : 400 }}>{fmt(v.tutar)}</Box>
                    <Box sx={{ ...css_ls, color: v.aciklama ? "inherit" : "#aaa" }}>{v.aciklama || "—"}</Box>
                    <Box sx={{ ...css_ls }}>{v.olusturanEmail ?? "—"}</Box>
                    <Box sx={{ ...css_ls }}>{formatTarih(v.createdAt)}</Box>
                  </React.Fragment>
                ))}
              </Box>
            )}
          </>
        )}

      </Box>
    </Box>
  );
}
