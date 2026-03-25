import React, { useState, useEffect, useContext } from "react";
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
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";

import ClearOutlined from "@mui/icons-material/ClearOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

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

export default function P_KesifButce() {
  const { appUser, selectedProje } = useContext(StoreContext);
  const navigate = useNavigate();

  const [show, setShow] = useState("Main");
  // formNodes: [{ id, name, isFixed, collapsed, rows: [{id, name, isWp, butce}] }]
  const [formNodes, setFormNodes] = useState([]);
  const [formAciklama, setFormAciklama] = useState("");

  const [versiyonlar, setVersiyonlar] = useState([]);
  const [versiyonlarLoading, setVersiyonlarLoading] = useState(false);

  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const { data: workPackages = [], isFetching: wpLoading } = useGetWorkPackages();

  const nextVNum =
    (versiyonlar.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1;

  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }
    loadVersiyonlar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      setVersiyonlar(data.map((r) => ({
        versiyonNumber: r.versiyon_number,
        aciklama: r.aciklama ?? "",
        tutar: r.total_butce_tutar,
        createdAt: r.created_at,
        olusturanEmail: r.created_by_email ?? null,
      })));
    }
  };

  const openForm = () => {
    setFormNodes([{
      id: "node_ispaketleri",
      name: "İş Paketleri",
      isFixed: true,
      collapsed: false,
      rows: workPackages.map((wp) => ({ id: wp.id, name: wp.name, isWp: true, butce: "" })),
    }]);
    setFormAciklama("");
    setShow("Form");
  };

  const cancelForm = () => { setFormNodes([]); setFormAciklama(""); setShow("Main"); };

  // ── Düğüm işlemleri ────────────────────────────────────────────────────────
  const toggleCollapse = (id) =>
    setFormNodes((p) => p.map((n) => n.id === id ? { ...n, collapsed: !n.collapsed } : n));

  const updateNodeName = (id, val) =>
    setFormNodes((p) => p.map((n) => n.id === id ? { ...n, name: val } : n));

  const addSiblingNode = () =>
    setFormNodes((p) => [...p, { id: "node_" + Date.now(), name: "Yeni Düğüm", isFixed: false, collapsed: false, rows: [] }]);

  const deleteNode = (id) =>
    setFormNodes((p) => p.filter((n) => n.id !== id));

  // ── Satır işlemleri ────────────────────────────────────────────────────────
  const addRow = (nodeId) =>
    setFormNodes((p) => p.map((n) =>
      n.id === nodeId
        ? { ...n, rows: [...n.rows, { id: "row_" + Date.now() + "_" + Math.random(), name: "", isWp: false, butce: "" }] }
        : n
    ));

  const updateRow = (nodeId, rowId, field, val) =>
    setFormNodes((p) => p.map((n) =>
      n.id === nodeId ? { ...n, rows: n.rows.map((r) => r.id === rowId ? { ...r, [field]: val } : r) } : n
    ));

  const deleteRow = (nodeId, rowId) =>
    setFormNodes((p) => p.map((n) =>
      n.id === nodeId ? { ...n, rows: n.rows.filter((r) => r.id !== rowId) } : n
    ));

  // ── Toplamlar ──────────────────────────────────────────────────────────────
  const nodeTotal = (node) => node.rows.reduce((s, r) => s + (Number(r.butce) || 0), 0);
  const grandTotal = formNodes.reduce((s, n) => s + nodeTotal(n), 0);
  const hasAnyButce = formNodes.some((n) => n.rows.some((r) => r.butce !== ""));

  // ── Kaydet ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("budget_versions").insert({
        project_id: selectedProje.id,
        versiyon_number: nextVNum,
        aciklama: formAciklama.trim() || null,
        total_kesif_tutar: null,
        total_butce_tutar: Math.round(grandTotal * 100) / 100 || null,
        is_paketler_satirlar: {
          nodes: formNodes.map((n) => ({
            nodeId: n.id, nodeName: n.name, isFixed: n.isFixed,
            rows: n.rows.map((r, i) => ({
              sira: i + 1, rowId: r.id, name: r.name, isWp: r.isWp,
              butce: r.butce !== "" ? Number(r.butce) || null : null,
            })),
            totalButce: Math.round(nodeTotal(n) * 100) / 100,
          })),
        },
        created_by: appUser.id,
      });
      if (error) throw new Error(error.message);
      await loadVersiyonlar();
      cancelForm();
    } catch (err) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: "Kayıt sırasında hata oluştu.", detailText: err?.message ?? null, onCloseAction: () => setDialogAlert() });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Yardımcı ───────────────────────────────────────────────────────────────
  const fmt = (v) => {
    if (v == null || v === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  };
  const formatTarih = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("tr-TR"); } catch { return "—"; }
  };

  const iconBtn_sx = { width: 40, height: 40 };
  const icon_sx = { fontSize: 24 };

  // Liste grid sütunları
  const listCols = "max-content max-content minmax(10rem, 1fr) max-content max-content";
  const css_lb = { display: "flex", alignItems: "center", px: "0.6rem", py: "0.3rem", backgroundColor: "#c8c8c8", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", borderBottom: "1px solid #aaa", whiteSpace: "nowrap" };
  const css_ls = { display: "flex", alignItems: "center", px: "0.6rem", py: "0.4rem", borderBottom: "1px solid #ddd", fontSize: "0.875rem", backgroundColor: "#f2f2f2" };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minWidth: "40rem" }}>
      {dialogAlert && (
        <DialogAlert dialogIcon={dialogAlert.dialogIcon} dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText} onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())} />
      )}

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
            </Typography>
          </Grid>
          <Grid item xs="auto">
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {show === "Form" ? (
                <>
                  <IconButton onClick={cancelForm} disabled={isSaving} sx={iconBtn_sx}>
                    <ClearOutlined sx={{ ...icon_sx, color: "red" }} />
                  </IconButton>
                  <IconButton onClick={handleSave} disabled={isSaving || !hasAnyButce} sx={iconBtn_sx}>
                    <SaveOutlined sx={{ ...icon_sx, color: (isSaving || !hasAnyButce) ? "#bbb" : "green" }} />
                  </IconButton>
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
            {/* ══ POZLAR WBS YAPISI ══
                Dış grid: [1rem siyah ray] [içerik]
                İçerik grid: [name 1fr] [bütçe 9rem] [aksiyonlar]
            */}
            <Box sx={{ width: "fit-content", minWidth: "34rem" }}>

              {/* Proje adı başlık — pozlar ile aynı siyah bar */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>
                <Box sx={{ backgroundColor: "black" }} />
                <Box sx={{ backgroundColor: "black", color: "white", pl: "6px", py: "2px", display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedProje?.name}
                  </Typography>
                </Box>
              </Box>

              {/* Sol siyah ray + ağaç içeriği */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1rem 1fr" }}>

                {/* Sürekli siyah sol ray — pozlar ile aynı */}
                <Box sx={{ backgroundColor: "black" }} />

                {/* İç içerik: name | bütçe | aksiyonlar */}
                <Box sx={{ display: "grid", gridTemplateColumns: "minmax(16rem, 1fr) 9rem max-content" }}>

                  {formNodes.map((node, nodeIdx) => {
                    const c = NODE_PALETTE[nodeIdx % NODE_PALETTE.length];
                    const total = nodeTotal(node);

                    return (
                      <React.Fragment key={node.id}>

                        {/* ── Düğüm başlık satırı ── */}

                        {/* col1: chevron + ad */}
                        <Box
                          onClick={() => toggleCollapse(node.id)}
                          sx={{
                            pl: "6px", py: "2px",
                            backgroundColor: c.bg, color: c.co,
                            cursor: "pointer", userSelect: "none",
                            display: "flex", alignItems: "center", gap: "0.4rem",
                            "&:hover": { filter: "brightness(1.18)" },
                          }}
                        >
                          <Box sx={{ fontSize: "0.65rem", flexShrink: 0, minWidth: "0.65rem" }}>
                            {node.collapsed ? "▶" : "▼"}
                          </Box>
                          {node.isFixed ? (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: c.co }}>
                              {node.name}
                            </Typography>
                          ) : (
                            <TextField
                              variant="standard" size="small"
                              value={node.name}
                              onChange={(e) => { e.stopPropagation(); updateNodeName(node.id, e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                              inputProps={{ style: { fontSize: "0.875rem", fontWeight: 700, color: c.co, minWidth: "12rem" } }}
                              sx={{
                                "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.25)" },
                                "& .MuiInput-underline:hover:before": { borderBottomColor: "rgba(255,255,255,0.6)" },
                                "& .MuiInput-underline:after": { borderBottomColor: "white" },
                              }}
                            />
                          )}
                        </Box>

                        {/* col2: ara toplam */}
                        <Box
                          onClick={() => toggleCollapse(node.id)}
                          sx={{
                            backgroundColor: c.bg, color: c.co,
                            display: "flex", alignItems: "center", justifyContent: "flex-end",
                            pr: "0.6rem", py: "2px",
                            cursor: "pointer", userSelect: "none",
                            "&:hover": { filter: "brightness(1.18)" },
                            fontSize: "0.8rem", fontWeight: 700,
                          }}
                        >
                          {total > 0 ? fmt(total) : ""}
                        </Box>

                        {/* col3: düğüm aksiyonları */}
                        <Box sx={{ backgroundColor: c.bg, display: "flex", alignItems: "center", px: "0.15rem" }}>
                          {!node.isFixed && (
                            <>
                              <IconButton size="small" onClick={() => addRow(node.id)} title="Satır ekle"
                                sx={{ color: c.co, opacity: 0.7, "&:hover": { opacity: 1 }, width: 26, height: 26 }}>
                                <AddIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => deleteNode(node.id)} title="Düğümü sil"
                                sx={{ color: c.co, opacity: 0.4, "&:hover": { opacity: 1, color: "#ff8a80" }, width: 26, height: 26 }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </>
                          )}
                        </Box>

                        {/* ── Satırlar ── */}
                        {!node.collapsed && (
                          <>
                            {/* Boş durum — sadece custom düğümler */}
                            {!node.isFixed && node.rows.length === 0 && (
                              <>
                                <Box sx={{ display: "flex", borderBottom: `2px solid ${c.bg}` }}>
                                  {/* Derinlik çubuğu — pozlar ile aynı renk */}
                                  <Box sx={{ width: "1rem", backgroundColor: c.bg, flexShrink: 0 }} />
                                  <Box sx={{ flex: 1, display: "flex", alignItems: "center", pl: "0.6rem", py: "0.4rem", backgroundColor: "#fafafa", color: "#bbb", fontSize: "0.8rem" }}>
                                    + satır ekle butonuna basın
                                  </Box>
                                </Box>
                                <Box sx={{ backgroundColor: "#fafafa", borderBottom: `2px solid ${c.bg}` }} />
                                <Box sx={{ backgroundColor: "#fafafa", borderBottom: `2px solid ${c.bg}` }} />
                              </>
                            )}

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
                                  {/* col1: derinlik çubuğu + ad */}
                                  <Box {...rh} sx={{ display: "flex", borderBottom: bb }}>
                                    {/* Derinlik çubuğu (1rem) — pozlar'daki repeat(depth, 1rem) ile aynı */}
                                    <Box sx={{ width: "1rem", backgroundColor: c.bg, flexShrink: 0 }} />
                                    <Box sx={{
                                      flex: 1, display: "flex", alignItems: "center",
                                      pl: "0.5rem", py: row.isWp ? "0.3rem" : "0.12rem",
                                      backgroundColor: rowBg,
                                    }}>
                                      {row.isWp ? (
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {row.name}
                                        </Typography>
                                      ) : (
                                        <TextField
                                          variant="standard" size="small"
                                          placeholder="Kalem adı"
                                          value={row.name}
                                          onChange={(e) => updateRow(node.id, row.id, "name", e.target.value)}
                                          autoComplete="off"
                                          inputProps={{ style: { fontSize: "0.875rem", minWidth: "13rem" } }}
                                        />
                                      )}
                                    </Box>
                                  </Box>

                                  {/* col2: bütçe input */}
                                  <Box {...rh} sx={{
                                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                                    pr: "0.3rem", py: "0.12rem",
                                    borderBottom: bb, backgroundColor: rowBg,
                                  }}>
                                    <TextField
                                      variant="standard" size="small"
                                      placeholder="—"
                                      value={row.butce}
                                      onChange={(e) => updateRow(node.id, row.id, "butce", e.target.value)}
                                      autoComplete="off"
                                      inputProps={{
                                        style: { fontSize: "0.875rem", textAlign: "right", width: "7rem" },
                                        inputMode: "decimal",
                                      }}
                                    />
                                  </Box>

                                  {/* col3: sil */}
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
                                </React.Fragment>
                              );
                            })}
                          </>
                        )}

                        {/* Düğümler arası ayraç */}
                        <Box sx={{ gridColumn: "1 / span 3", height: "0.3rem", backgroundColor: "#e0e0e0" }} />

                      </React.Fragment>
                    );
                  })}

                  {/* ── GENEL TOPLAM ── */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pr: "0.75rem", py: "0.4rem", backgroundColor: "#111", color: "white", fontWeight: 700, fontSize: "0.875rem", borderTop: "2px solid black" }}>
                    Genel Toplam Bütçe
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pr: "0.5rem", py: "0.4rem", backgroundColor: "#111", color: "white", fontWeight: 700, fontSize: "0.875rem", borderTop: "2px solid black" }}>
                    {grandTotal > 0 ? fmt(grandTotal) : "—"}
                  </Box>
                  <Box sx={{ backgroundColor: "#111", borderTop: "2px solid black" }} />

                </Box>
              </Box>

              {/* + Düğüm Ekle */}
              <Box
                onClick={addSiblingNode}
                sx={{
                  mt: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem",
                  cursor: "pointer", width: "fit-content", color: "#555",
                  py: "0.3rem", px: "0.5rem", borderRadius: "4px",
                  "&:hover": { backgroundColor: "#e8e8e8" },
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">Düğüm Ekle</Typography>
              </Box>

              {/* Açıklama */}
              <Box sx={{ mt: "1rem", maxWidth: "28rem" }}>
                <TextField
                  variant="outlined" label="Açıklama (isteğe bağlı)" size="small"
                  fullWidth value={formAciklama}
                  onChange={(e) => setFormAciklama(e.target.value)}
                  multiline rows={2}
                />
              </Box>
            </Box>
          </>
        )}

        {/* ── Versiyon listesi ── */}
        {show === "Main" && (
          <>
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
                {versiyonlar.map((v) => (
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
