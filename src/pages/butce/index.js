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

export default function P_KesifButce() {
  const {
    appUser,
    selectedProje,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [show, setShow] = useState("Main");

  const [formRows, setFormRows] = useState({});
  const [formAciklama, setFormAciklama] = useState("");

  // Ekstra gruplar: [{ id, name, rows: [{id, name, butceTutar}] }]
  const [customGroups, setCustomGroups] = useState([]);

  const [versiyonlar, setVersiyonlar] = useState([]);
  const [versiyonlarLoading, setVersiyonlarLoading] = useState(false);

  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const { data: workPackages = [], isFetching: wpLoading } = useGetWorkPackages();

  const nextVersiyonNumber =
    (versiyonlar.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1;

  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }
    loadVersiyonlar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVersiyonlar = async () => {
    if (!selectedProje?.id) {
      const fromStore = [...(selectedProje?.butceVersiyonlar ?? [])].sort(
        (a, b) => b.versiyonNumber - a.versiyonNumber
      );
      setVersiyonlar(fromStore);
      return;
    }
    setVersiyonlarLoading(true);
    const { data, error } = await supabase
      .from("budget_versions")
      .select("*")
      .eq("project_id", selectedProje.id)
      .order("versiyon_number", { ascending: false });
    setVersiyonlarLoading(false);
    if (!error && data) {
      setVersiyonlar(
        data.map((row) => ({
          versiyonNumber: row.versiyon_number,
          aciklama: row.aciklama ?? "",
          tutar: row.total_butce_tutar,
          createdAt: row.created_at,
          olusturanEmail: row.created_by_email ?? null,
        }))
      );
    }
  };

  const openForm = () => {
    const initial = {};
    workPackages.forEach((wp) => {
      initial[wp.id] = { kesifTutar: null, butceTutar: "" };
    });
    setFormRows(initial);
    setFormAciklama("");
    setCustomGroups([
      { id: "grp_" + Date.now(), name: "Diğer Kalemler", rows: [] },
    ]);
    setShow("Form");
  };

  const cancelForm = () => {
    setFormRows({});
    setFormAciklama("");
    setCustomGroups([]);
    setShow("Main");
  };

  const handleButceTutarChange = (id, value) => {
    setFormRows((prev) => ({ ...prev, [id]: { ...prev[id], butceTutar: value } }));
  };

  // ── Custom grup yönetimi ────────────────────────────────────────────────────

  const updateGroupName = (groupId, value) => {
    setCustomGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: value } : g))
    );
  };

  const addRowToGroup = (groupId) => {
    setCustomGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, rows: [...g.rows, { id: "row_" + Date.now() + Math.random(), name: "", butceTutar: "" }] }
          : g
      )
    );
  };

  const updateGroupRow = (groupId, rowId, field, value) => {
    setCustomGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, rows: g.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)) }
          : g
      )
    );
  };

  const removeGroupRow = (groupId, rowId) => {
    setCustomGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, rows: g.rows.filter((r) => r.id !== rowId) } : g
      )
    );
  };

  // ── Toplamlar ──────────────────────────────────────────────────────────────

  const totalKesif = workPackages.reduce(
    (s, wp) => s + (formRows[wp.id]?.kesifTutar ?? 0), 0
  );
  const totalIsPaketButce = workPackages.reduce(
    (s, wp) => s + (Number(formRows[wp.id]?.butceTutar) || 0), 0
  );

  const groupTotals = customGroups.map((g) => ({
    id: g.id,
    total: g.rows.reduce((s, r) => s + (Number(r.butceTutar) || 0), 0),
  }));

  const totalCustomAll = groupTotals.reduce((s, gt) => s + gt.total, 0);
  const grandTotal = totalIsPaketButce + totalCustomAll;

  const hasAnyButce =
    workPackages.some((wp) => (formRows[wp.id]?.butceTutar ?? "") !== "") ||
    customGroups.some((g) => g.rows.some((r) => (r.butceTutar ?? "") !== ""));

  // ── Kaydet ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isPaketlerSatirlar = workPackages.map((wp) => {
        const row = formRows[wp.id] ?? {};
        return {
          isPaketId: wp.id,
          isPaketName: wp.name,
          kesifTutar: row.kesifTutar ?? null,
          butceTutar: row.butceTutar !== "" ? Number(row.butceTutar) || null : null,
        };
      });

      const customGroupsSatirlar = customGroups.map((g) => ({
        grupId: g.id,
        grupName: g.name,
        rows: g.rows.map((r, i) => ({
          sira: i + 1,
          name: r.name,
          butceTutar: r.butceTutar !== "" ? Number(r.butceTutar) || null : null,
        })),
        totalButceTutar: Math.round(
          g.rows.reduce((s, r) => s + (Number(r.butceTutar) || 0), 0) * 100
        ) / 100,
      }));

      const totalKesifTutar = Math.round(
        isPaketlerSatirlar.reduce((s, r) => s + (r.kesifTutar ?? 0), 0) * 100
      ) / 100;
      const totalButceTutar = Math.round(grandTotal * 100) / 100;

      const { error } = await supabase
        .from("budget_versions")
        .insert({
          project_id: selectedProje.id,
          versiyon_number: nextVersiyonNumber,
          aciklama: formAciklama.trim() || null,
          total_kesif_tutar: totalKesifTutar || null,
          total_butce_tutar: totalButceTutar || null,
          is_paketler_satirlar: {
            isPaketler: isPaketlerSatirlar,
            customGroups: customGroupsSatirlar,
          },
          created_by: appUser.id,
        });

      if (error) throw new Error(error.message);

      await loadVersiyonlar();
      cancelForm();
    } catch (err) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Kayıt sırasında hata oluştu.",
        detailText: err?.message ?? null,
        onCloseAction: () => setDialogAlert(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Yardımcı ───────────────────────────────────────────────────────────────

  const fmt = (v) => {
    if (v == null || v === 0) return "—";
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  };

  const formatTarih = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("tr-TR"); }
    catch { return "—"; }
  };

  // ── CSS ────────────────────────────────────────────────────────────────────

  const css_baslik = {
    display: "flex", alignItems: "center",
    px: "0.6rem", py: "0.3rem",
    backgroundColor: "#c8c8c8",
    fontWeight: 700, fontSize: "0.8rem",
    textTransform: "uppercase",
    borderBottom: "1px solid #aaa",
    whiteSpace: "nowrap",
  };
  const css_grupBaslik = {
    display: "flex", alignItems: "center",
    px: "0.6rem", py: "0.35rem",
    backgroundColor: "#9e9e9e",
    fontWeight: 700, fontSize: "0.8rem",
    textTransform: "uppercase",
    borderBottom: "1px solid #888",
    color: "white",
    whiteSpace: "nowrap",
  };
  const css_satir = {
    display: "flex", alignItems: "center",
    px: "0.6rem", py: "0.4rem",
    borderBottom: "1px solid #ddd",
    fontSize: "0.875rem",
  };
  const css_araToplam = {
    display: "flex", alignItems: "center",
    px: "0.6rem", py: "0.4rem",
    borderBottom: "1px solid #aaa",
    backgroundColor: "#e0e0e0",
    fontWeight: 600, fontSize: "0.875rem",
  };
  const css_toplam = {
    display: "flex", alignItems: "center",
    px: "0.6rem", py: "0.5rem",
    borderTop: "2px solid #888",
    borderBottom: "2px solid #888",
    backgroundColor: "#c8c8c8",
    fontWeight: 700, fontSize: "0.875rem",
  };

  const iconBtn_sx = { width: 40, height: 40 };
  const icon_sx = { fontSize: 24 };

  // Tek ortak grid — tüm bölümler aynı sütun genişliklerini paylaşır
  // col1: Sıra | col2: İş Paketi/Kalem Adı | col3: Açıklama | col4: Keşif | col5: Bütçe | col6: Aksiyon
  const formCols = "max-content minmax(12rem, max-content) minmax(8rem, 1fr) max-content max-content max-content";

  // Liste grid
  const listCols = "max-content max-content minmax(10rem, 1fr) max-content max-content";

  // ── Render ─────────────────────────────────────────────────────────────────

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

      {/* APP BAR */}
      <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center"
          sx={{ px: "1rem", py: "0.25rem", minHeight: "3.5rem" }}>
          <Grid item xs>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Keşif / Bütçe
              {show === "Form" && (
                <Typography component="span" variant="body2" sx={{ ml: "0.5rem", color: "gray" }}>
                  — v{nextVersiyonNumber} oluştur
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
                  <IconButton
                    onClick={handleSave}
                    disabled={isSaving || !hasAnyButce}
                    sx={iconBtn_sx}
                    title="Versiyonu kaydet"
                  >
                    <SaveOutlined
                      sx={{ ...icon_sx, color: (isSaving || !hasAnyButce) ? "#bbb" : "green" }}
                    />
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

      {(show === "Form" && wpLoading) && <LinearProgress />}

      {/* İÇERİK */}
      <Box sx={{ p: "1rem" }}>

        {/* ── Yeni versiyon formu ── */}
        {show === "Form" && !wpLoading && (
          <>
            {workPackages.length === 0 && (
              <Stack spacing={2}>
                <Alert severity="info">
                  Bu projede henüz iş paketi tanımlanmamış.
                </Alert>
              </Stack>
            )}

            {workPackages.length > 0 && (
              <>
                {/* ══ TEK ORTAK GRİD — tüm bölümler bu grid içinde ══ */}
                <Box sx={{ display: "grid", gridTemplateColumns: formCols, width: "fit-content" }}>

                  {/* ── İŞ PAKETLERİ grup başlığı ── */}
                  <Box sx={{ ...css_grupBaslik, gridColumn: "1 / span 6" }}>
                    İş Paketleri
                  </Box>

                  {/* Sütun başlıkları */}
                  <Box sx={{ ...css_baslik, justifyContent: "center" }}>Sıra</Box>
                  <Box sx={{ ...css_baslik }}>İş Paketi</Box>
                  <Box sx={{ ...css_baslik }}>Açıklama</Box>
                  <Box sx={{ ...css_baslik, justifyContent: "right" }}>Keşif</Box>
                  <Box sx={{ ...css_baslik, justifyContent: "right" }}>Bütçe</Box>
                  <Box sx={{ ...css_baslik }}></Box>

                  {/* İş paketi satırları */}
                  {workPackages.map((wp, index) => {
                    const row = formRows[wp.id] ?? {};
                    const isHovered = hoveredRow === wp.id;
                    const bg = isHovered ? "#e8e8e8" : "#f2f2f2";
                    const rh = {
                      onMouseEnter: () => setHoveredRow(wp.id),
                      onMouseLeave: () => setHoveredRow(null),
                    };
                    return (
                      <React.Fragment key={wp.id}>
                        <Box {...rh} sx={{ ...css_satir, justifyContent: "center", backgroundColor: bg }}>
                          {index + 1}
                        </Box>
                        <Box {...rh} sx={{ ...css_satir, fontWeight: 500, backgroundColor: bg }}>
                          {wp.name}
                        </Box>
                        <Box {...rh} sx={{ ...css_satir, color: "gray", backgroundColor: bg }}>
                          {wp.description ?? ""}
                        </Box>
                        <Box {...rh} sx={{ ...css_satir, justifyContent: "right", color: "gray", backgroundColor: bg }}>
                          {fmt(row.kesifTutar)}
                        </Box>
                        <Box {...rh} sx={{ ...css_satir, py: "0.2rem", backgroundColor: bg }}>
                          <TextField
                            variant="standard"
                            size="small"
                            placeholder="—"
                            value={row.butceTutar ?? ""}
                            onChange={(e) => handleButceTutarChange(wp.id, e.target.value)}
                            autoComplete="off"
                            inputProps={{
                              style: { fontSize: "0.875rem", textAlign: "right", width: "7rem" },
                              inputMode: "decimal",
                            }}
                          />
                        </Box>
                        <Box {...rh} sx={{ ...css_satir, backgroundColor: bg }}></Box>
                      </React.Fragment>
                    );
                  })}

                  {/* İş Paketleri ara toplam */}
                  <Box sx={{ ...css_araToplam, gridColumn: "1 / span 3", justifyContent: "flex-end" }}>
                    İş Paketleri Toplamı
                  </Box>
                  <Box sx={{ ...css_araToplam, justifyContent: "right" }}>
                    {fmt(totalKesif)}
                  </Box>
                  <Box sx={{ ...css_araToplam, justifyContent: "right" }}>
                    {totalIsPaketButce > 0 ? fmt(totalIsPaketButce) : "—"}
                  </Box>
                  <Box sx={{ ...css_araToplam }}></Box>

                  {/* ── Bölümler arası ayraç ── */}
                  <Box sx={{ gridColumn: "1 / span 6", height: "0.5rem", backgroundColor: "#f0f0f0" }} />

                  {/* ── CUSTOM GRUPLAR ── */}
                  {customGroups.map((group) => {
                    const grpTotal = groupTotals.find((gt) => gt.id === group.id)?.total ?? 0;
                    return (
                      <React.Fragment key={group.id}>

                        {/* Grup başlığı: col1-5 = düzenlenebilir ad, col6 = + butonu */}
                        <Box sx={{ ...css_grupBaslik, gridColumn: "1 / span 5" }}>
                          <TextField
                            variant="standard"
                            size="small"
                            value={group.name}
                            onChange={(e) => updateGroupName(group.id, e.target.value)}
                            autoComplete="off"
                            inputProps={{
                              style: {
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "white",
                                width: "16rem",
                              },
                            }}
                            sx={{
                              "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.3)" },
                              "& .MuiInput-underline:hover:before": { borderBottomColor: "rgba(255,255,255,0.7)" },
                              "& .MuiInput-underline:after": { borderBottomColor: "white" },
                            }}
                          />
                        </Box>
                        <Box sx={{ ...css_grupBaslik, justifyContent: "center", px: "0.25rem" }}>
                          <IconButton
                            size="small"
                            onClick={() => addRowToGroup(group.id)}
                            title="Satır ekle"
                            sx={{ color: "white", width: 28, height: 28 }}
                          >
                            <AddIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>

                        {/* Sütun başlıkları — col2-3 birleşik "Kalem Adı", col4 boş */}
                        <Box sx={{ ...css_baslik, justifyContent: "center" }}>Sıra</Box>
                        <Box sx={{ ...css_baslik, gridColumn: "2 / span 2" }}>Kalem Adı</Box>
                        {/* col3 col2/span2 tarafından kaplıyor, col4 boş */}
                        <Box sx={{ ...css_baslik }}></Box>
                        <Box sx={{ ...css_baslik, justifyContent: "right" }}>Bütçe</Box>
                        <Box sx={{ ...css_baslik }}></Box>

                        {/* Boş durum */}
                        {group.rows.length === 0 && (
                          <Box sx={{
                            ...css_satir,
                            gridColumn: "1 / span 6",
                            color: "#aaa",
                            backgroundColor: "#f2f2f2",
                            justifyContent: "center",
                          }}>
                            Satır eklemek için + tuşuna basın
                          </Box>
                        )}

                        {/* Grup satırları */}
                        {group.rows.map((row, idx) => {
                          const isHovered = hoveredRow === row.id;
                          const bg = isHovered ? "#e8e8e8" : "#f2f2f2";
                          const rh = {
                            onMouseEnter: () => setHoveredRow(row.id),
                            onMouseLeave: () => setHoveredRow(null),
                          };
                          return (
                            <React.Fragment key={row.id}>
                              {/* col1: sıra */}
                              <Box {...rh} sx={{ ...css_satir, justifyContent: "center", backgroundColor: bg }}>
                                {idx + 1}
                              </Box>
                              {/* col2-3: kalem adı input */}
                              <Box {...rh} sx={{ ...css_satir, gridColumn: "2 / span 2", py: "0.2rem", backgroundColor: bg }}>
                                <TextField
                                  variant="standard"
                                  size="small"
                                  placeholder="Kalem adı"
                                  value={row.name}
                                  onChange={(e) => updateGroupRow(group.id, row.id, "name", e.target.value)}
                                  autoComplete="off"
                                  inputProps={{
                                    style: { fontSize: "0.875rem", width: "18rem" },
                                  }}
                                />
                              </Box>
                              {/* col4: boş (keşif) */}
                              <Box {...rh} sx={{ ...css_satir, backgroundColor: bg }}></Box>
                              {/* col5: bütçe */}
                              <Box {...rh} sx={{ ...css_satir, py: "0.2rem", backgroundColor: bg }}>
                                <TextField
                                  variant="standard"
                                  size="small"
                                  placeholder="—"
                                  value={row.butceTutar}
                                  onChange={(e) => updateGroupRow(group.id, row.id, "butceTutar", e.target.value)}
                                  autoComplete="off"
                                  inputProps={{
                                    style: { fontSize: "0.875rem", textAlign: "right", width: "7rem" },
                                    inputMode: "decimal",
                                  }}
                                />
                              </Box>
                              {/* col6: sil */}
                              <Box {...rh} sx={{ ...css_satir, py: "0.1rem", px: "0.25rem", backgroundColor: bg }}>
                                <IconButton
                                  size="small"
                                  onClick={() => removeGroupRow(group.id, row.id)}
                                  sx={{ color: "#ccc", "&:hover": { color: "red" }, width: 28, height: 28 }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                            </React.Fragment>
                          );
                        })}

                        {/* Grup ara toplam — col1-4 etiket, col5 bütçe, col6 boş */}
                        <Box sx={{ ...css_araToplam, gridColumn: "1 / span 4", justifyContent: "flex-end" }}>
                          {group.name} Toplamı
                        </Box>
                        <Box sx={{ ...css_araToplam, justifyContent: "right" }}>
                          {grpTotal > 0 ? fmt(grpTotal) : "—"}
                        </Box>
                        <Box sx={{ ...css_araToplam }}></Box>

                        {/* Bölümler arası ayraç */}
                        <Box sx={{ gridColumn: "1 / span 6", height: "0.5rem", backgroundColor: "#f0f0f0" }} />

                      </React.Fragment>
                    );
                  })}

                  {/* ── GENEL TOPLAM — col1-4 etiket, col5 değer (Bütçe sütunu ile hizalı) ── */}
                  <Box sx={{ ...css_toplam, gridColumn: "1 / span 4", justifyContent: "flex-end" }}>
                    Genel Toplam Bütçe
                  </Box>
                  <Box sx={{ ...css_toplam, justifyContent: "right" }}>
                    {grandTotal > 0 ? fmt(grandTotal) : "—"}
                  </Box>
                  <Box sx={{ ...css_toplam }}></Box>

                </Box>
                {/* ══ Grid sonu ══ */}

                {/* Açıklama */}
                <Box sx={{ mt: "1.25rem", maxWidth: "28rem" }}>
                  <TextField
                    variant="outlined"
                    label="Açıklama (isteğe bağlı)"
                    size="small"
                    fullWidth
                    value={formAciklama}
                    onChange={(e) => setFormAciklama(e.target.value)}
                    multiline
                    rows={2}
                  />
                </Box>
              </>
            )}
          </>
        )}

        {/* ── Versiyon listesi ── */}
        {show === "Main" && (
          <>
            {versiyonlarLoading && <LinearProgress />}

            {!versiyonlarLoading && versiyonlar.length === 0 && (
              <Stack spacing={2}>
                <Alert severity="info">
                  Henüz bütçe versiyonu oluşturulmamış. (+) tuşuna basarak oluşturabilirsiniz.
                </Alert>
              </Stack>
            )}

            {!versiyonlarLoading && versiyonlar.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: listCols, width: "fit-content" }}>
                <Box sx={{ ...css_baslik, justifyContent: "center" }}>Versiyon</Box>
                <Box sx={{ ...css_baslik, justifyContent: "right" }}>Tutar</Box>
                <Box sx={{ ...css_baslik }}>Açıklama</Box>
                <Box sx={{ ...css_baslik }}>Onaylayan</Box>
                <Box sx={{ ...css_baslik }}>Tarih</Box>

                {versiyonlar.map((v) => {
                  const isHovered = hoveredRow === v.versiyonNumber;
                  const bg = isHovered ? "#e8e8e8" : "#f2f2f2";
                  const rh = {
                    onMouseEnter: () => setHoveredRow(v.versiyonNumber),
                    onMouseLeave: () => setHoveredRow(null),
                  };
                  const tutar = v.tutar ?? v.butce?.totalButceTutar ?? null;
                  const aciklama = v.aciklama ?? "";
                  const onaylayan = v.olusturanEmail ?? "—";
                  const tarih = formatTarih(v.createdAt ?? null);

                  return (
                    <React.Fragment key={v.versiyonNumber}>
                      <Box {...rh} sx={{ ...css_satir, justifyContent: "center", fontWeight: 700, backgroundColor: bg }}>
                        v{v.versiyonNumber}
                      </Box>
                      <Box {...rh} sx={{ ...css_satir, justifyContent: "right", fontWeight: tutar ? 600 : 400, backgroundColor: bg }}>
                        {fmt(tutar)}
                      </Box>
                      <Box {...rh} sx={{ ...css_satir, backgroundColor: bg, color: aciklama ? "inherit" : "#aaa" }}>
                        {aciklama || "—"}
                      </Box>
                      <Box {...rh} sx={{ ...css_satir, backgroundColor: bg }}>
                        {onaylayan}
                      </Box>
                      <Box {...rh} sx={{ ...css_satir, backgroundColor: bg }}>
                        {tarih}
                      </Box>
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
