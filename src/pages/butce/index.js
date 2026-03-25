import React, { useState, useEffect, useRef, useContext } from "react";
import { StoreContext } from "../../components/store.js";
import { useNavigate } from "react-router-dom";
import { DialogAlert } from "../../components/general/DialogAlert.js";
import useRequestProjeAktifYetkiliKisi from "../../functions/requestProjeAktifYetkiliKisi.js";
import useDeleteProjeAktifYetkiliKisi from "../../functions/deleteProjeAktifYetkiliKisi.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import ClearOutlined from "@mui/icons-material/ClearOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function P_KesifButce() {
  const {
    appUser,
    setAppUser,
    selectedProje,
    setSelectedProje,
    mode_butceEdit,
    setMode_butceEdit,
    selectedButceVersiyon,
    setSelectedButceVersiyon,
    kesifWizardRows,
    setKesifWizardRows,
    kesifWizardAciklama,
    setKesifWizardAciklama,
    kesifWizardIsPaketVersiyonNumber,
    setKesifWizardIsPaketVersiyonNumber,
    setKesifWizardActiveIsPaketId,
    setSelectedIsPaket,
    setSelectedIsPaketVersiyon,
    setSelectedMetrajVersiyon,
    setSelectedBirimFiyatVersiyon,
  } = useContext(StoreContext);

  // "Main" → versiyon listesi | "Wizard" → yeni versiyon sihirbazı
  const [show, setShow] = useState(mode_butceEdit ? "Wizard" : "Main");
  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const requestProjeAktifYetkiliKisi = useRequestProjeAktifYetkiliKisi();
  const deleteProjeAktifYetkiliKisi = useDeleteProjeAktifYetkiliKisi();

  const abortControllersRef = useRef({});
  const navigate = useNavigate();

  const metrajVersiyonlar = selectedProje?.metrajVersiyonlar ?? [];
  const birimFiyatVersiyonlar = selectedProje?.birimFiyatVersiyonlar ?? [];
  const butceVersiyonlar = [...(selectedProje?.butceVersiyonlar ?? [])].sort(
    (a, b) => b.versiyonNumber - a.versiyonNumber
  );
  const hasIpVersions = (selectedProje?.isPaketVersiyonlar?.length ?? 0) > 0;

  const nextVersiyonNumber =
    (butceVersiyonlar.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1;

  const isPaketVersiyon = selectedProje?.isPaketVersiyonlar?.find(
    (v) => v.versiyonNumber === kesifWizardIsPaketVersiyonNumber
  );
  const isPaketList = (isPaketVersiyon?.isPaketler ?? []).filter((p) => p.isActive);

  // Abort fetch on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    };
  }, []);

  // Guard + returning from butcepozlar
  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }

    if (mode_butceEdit && kesifWizardIsPaketVersiyonNumber !== null) {
      // Returning from butcepozlar — recalculate rows that lost their kesifTutar
      Object.entries(kesifWizardRows).forEach(([isPaketId, row]) => {
        if (row.kesifTutar === null && !row.isCalculating && row.metrajVersiyonNumber != null && row.birimFiyatVersiyonNumber != null) {
          doCalculate(isPaketId, row.metrajVersiyonNumber, row.birimFiyatVersiyonNumber, kesifWizardIsPaketVersiyonNumber);
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getLatestMaxVN = (arr) =>
    (arr ?? []).reduce((acc, v) => Math.max(acc, v.versiyonNumber), 0) || null;

  const initEditRows = () => {
    const maxIpVN = getLatestMaxVN(selectedProje?.isPaketVersiyonlar);
    const maxMetrajVN = getLatestMaxVN(metrajVersiyonlar);
    const maxBirimFiyatVN = getLatestMaxVN(birimFiyatVersiyonlar);

    setKesifWizardIsPaketVersiyonNumber(maxIpVN);
    if (maxIpVN && maxMetrajVN && maxBirimFiyatVN) {
      const ipV = selectedProje?.isPaketVersiyonlar?.find((v) => v.versiyonNumber === maxIpVN);
      const activeList = (ipV?.isPaketler ?? []).filter((p) => p.isActive);
      const rowsInit = {};
      activeList.forEach((p) => {
        rowsInit[p._id] = {
          metrajVersiyonNumber: maxMetrajVN,
          birimFiyatVersiyonNumber: maxBirimFiyatVN,
          kesifTutar: null,
          butceTutar: "",
          isCalculating: false,
        };
      });
      setKesifWizardRows(rowsInit);
      activeList.forEach((p) => doCalculate(p._id, maxMetrajVN, maxBirimFiyatVN, maxIpVN));
    } else {
      setKesifWizardRows({});
    }
  };

  const handleEnterCreate = async () => {
    const checkAuth = await requestProjeAktifYetkiliKisi({
      projeId: selectedProje?._id,
      aktifYetki: "butceEdit",
      setDialogAlert,
      setShow: () => {},
    });
    if (checkAuth?.ok) {
      setKesifWizardAciklama("");
      initEditRows();
      setMode_butceEdit(true);
      setShow("Wizard");
    }
  };

  const handleCancelCreate = () => {
    deleteProjeAktifYetkiliKisi({
      projeId: selectedProje?._id,
      aktifYetki: "butceEdit",
      setDialogAlert,
      setShow: () => {},
      onOk: () => {
        Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
        abortControllersRef.current = {};
        setKesifWizardRows({});
        setKesifWizardIsPaketVersiyonNumber(null);
        setKesifWizardAciklama("");
        setMode_butceEdit(false);
        setShow("Main");
      },
    });
  };

  // ── Calculation ────────────────────────────────────────────────────────────

  const doCalculate = async (isPaketId, metrajVN, birimFiyatVN, ipVN) => {
    const resolvedIpVN = ipVN ?? kesifWizardIsPaketVersiyonNumber;
    if (abortControllersRef.current[isPaketId]) {
      abortControllersRef.current[isPaketId].abort();
    }
    const controller = new AbortController();
    abortControllersRef.current[isPaketId] = controller;

    setKesifWizardRows((prev) => ({
      ...prev,
      [isPaketId]: { ...prev[isPaketId], isCalculating: true, kesifTutar: null },
    }));

    try {
      const res = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/projeler/calculateispaketkesif",
        {
          method: "POST",
          headers: { email: appUser.email, token: appUser.token, "Content-Type": "application/json" },
          body: JSON.stringify({
            projeId: selectedProje._id,
            isPaketId,
            isPaketVersiyonNumber: Number(resolvedIpVN),
            metrajVersiyonNumber: Number(metrajVN),
            birimFiyatVersiyonNumber: Number(birimFiyatVN),
          }),
          signal: controller.signal,
        }
      );
      const json = await res.json();
      if (json.error) {
        if (json.error.includes("expired")) { setAppUser(); localStorage.removeItem("appUser"); navigate("/"); window.location.reload(); }
        throw new Error(json.error);
      }
      setKesifWizardRows((prev) => ({
        ...prev,
        [isPaketId]: { ...prev[isPaketId], isCalculating: false, kesifTutar: json.tutar },
      }));
    } catch (err) {
      if (err.name === "AbortError") return;
      setKesifWizardRows((prev) => ({
        ...prev,
        [isPaketId]: { ...prev[isPaketId], isCalculating: false, kesifTutar: null },
      }));
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Keşif tutarı hesaplanırken hata oluştu.",
        detailText: err?.message ?? null,
        onCloseAction: () => setDialogAlert(),
      });
    }
  };

  // ── Row change handlers ────────────────────────────────────────────────────

  const handleIpVersiyonChange = (newVN) => {
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    abortControllersRef.current = {};
    setKesifWizardIsPaketVersiyonNumber(newVN);

    const maxMetrajVN = getLatestMaxVN(metrajVersiyonlar);
    const maxBirimFiyatVN = getLatestMaxVN(birimFiyatVersiyonlar);

    if (newVN && maxMetrajVN && maxBirimFiyatVN) {
      const ipV = selectedProje?.isPaketVersiyonlar?.find((v) => v.versiyonNumber === newVN);
      const activeList = (ipV?.isPaketler ?? []).filter((p) => p.isActive);
      const rowsInit = {};
      activeList.forEach((p) => {
        rowsInit[p._id] = {
          metrajVersiyonNumber: maxMetrajVN,
          birimFiyatVersiyonNumber: maxBirimFiyatVN,
          kesifTutar: null,
          butceTutar: "",
          isCalculating: false,
        };
      });
      setKesifWizardRows(rowsInit);
      activeList.forEach((p) => doCalculate(p._id, maxMetrajVN, maxBirimFiyatVN, newVN));
    } else {
      setKesifWizardRows({});
    }
  };

  const handleMetrajVChange = (isPaketId, value) => {
    const existing = kesifWizardRows[isPaketId] || {};
    const updated = { ...existing, metrajVersiyonNumber: value !== "" ? Number(value) : null, kesifTutar: null, isCalculating: false };
    setKesifWizardRows((prev) => ({ ...prev, [isPaketId]: updated }));
    if (value !== "" && updated.birimFiyatVersiyonNumber != null) {
      doCalculate(isPaketId, Number(value), updated.birimFiyatVersiyonNumber);
    }
  };

  const handleBirimFiyatVChange = (isPaketId, value) => {
    const existing = kesifWizardRows[isPaketId] || {};
    const updated = { ...existing, birimFiyatVersiyonNumber: value !== "" ? Number(value) : null, kesifTutar: null, isCalculating: false };
    setKesifWizardRows((prev) => ({ ...prev, [isPaketId]: updated }));
    if (value !== "" && updated.metrajVersiyonNumber != null) {
      doCalculate(isPaketId, updated.metrajVersiyonNumber, Number(value));
    }
  };

  const handleButceTutarChange = (isPaketId, value) => {
    setKesifWizardRows((prev) => ({
      ...prev,
      [isPaketId]: { ...(prev[isPaketId] || {}), butceTutar: value },
    }));
  };

  const handleClickIsPaketInWizard = (onePaket) => {
    const row = kesifWizardRows[onePaket._id] || {};
    if (row.isCalculating) {
      setDialogAlert({ dialogIcon: "info", dialogMessage: "Keşif tutarı hesaplanıyor, lütfen bekleyin.", onCloseAction: () => setDialogAlert() });
      return;
    }
    if (row.kesifTutar == null || row.kesifTutar === 0) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: `"${onePaket.name}" iş paketinin bu versiyonda keşif tutarı bulunmuyor.`, onCloseAction: () => setDialogAlert() });
      return;
    }
    setSelectedIsPaket(onePaket);
    setSelectedIsPaketVersiyon(isPaketVersiyon);
    setKesifWizardActiveIsPaketId(onePaket._id);
    if (row.metrajVersiyonNumber != null) setSelectedMetrajVersiyon({ versiyonNumber: row.metrajVersiyonNumber });
    if (row.birimFiyatVersiyonNumber != null) setSelectedBirimFiyatVersiyon({ versiyonNumber: row.birimFiyatVersiyonNumber });
    navigate("/butcepozlar");
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const buildButceObject = () => {
    const isPaketlerSatirlar = isPaketList.map((p) => {
      const row = kesifWizardRows[p._id] || {};
      return {
        isPaketId: p._id,
        isPaketName: p.name,
        metrajVersiyonNumber: row.metrajVersiyonNumber ?? null,
        birimFiyatVersiyonNumber: row.birimFiyatVersiyonNumber ?? null,
        kesifTutar: row.kesifTutar ?? null,
        butceTutar: row.butceTutar !== undefined && row.butceTutar !== ""
          ? Number(row.butceTutar) || null : null,
      };
    });
    const totalKesifTutar = Math.round(isPaketlerSatirlar.reduce((s, r) => s + (r.kesifTutar ?? 0), 0) * 100) / 100;
    const totalButceTutar = Math.round(isPaketlerSatirlar.reduce((s, r) => s + (r.butceTutar ?? 0), 0) * 100) / 100;
    return { isPaketVersiyonNumber: kesifWizardIsPaketVersiyonNumber, isPaketlerSatirlar, totalKesifTutar, totalButceTutar };
  };

  const authFetch = async (path, body) => {
    const res = await fetch(process.env.REACT_APP_BASE_URL + path, {
      method: "POST",
      headers: { email: appUser.email, token: appUser.token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      if (json.error.includes("expired")) { setAppUser(); localStorage.removeItem("appUser"); navigate("/"); window.location.reload(); }
      throw new Error(json.error);
    }
    return json;
  };

  const handleSaveVersiyon = async () => {
    setIsSaving(true);
    try {
      const butce = buildButceObject();
      const json1 = await authFetch("/api/projeler/updatebutce", { projeId: selectedProje._id, butce });
      if (!json1.ok) throw new Error("Bütçe kaydı gerçekleşmedi.");
      const json2 = await authFetch("/api/versiyon/butce", {
        projeId: selectedProje._id,
        versiyonNumber: nextVersiyonNumber,
        aciklama: kesifWizardAciklama ?? "",
      });
      if (!json2.ok) throw new Error("Versiyon kayıt işlemi gerçekleşmedi.");
      const newVersiyon = json2.butceVersiyonlar.find((v) => v.versiyonNumber === nextVersiyonNumber)
        ?? [...json2.butceVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber)[0];
      setSelectedProje({ ...selectedProje, butce, butceVersiyonlar: json2.butceVersiyonlar });
      setSelectedButceVersiyon(newVersiyon);
      setKesifWizardRows({});
      setKesifWizardIsPaketVersiyonNumber(null);
      setKesifWizardAciklama("");
      setMode_butceEdit(false);
      setShow("Main");
    } catch (err) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: "Kayıt sırasında hata oluştu.", detailText: err?.message ?? null, onCloseAction: () => setDialogAlert() });
    } finally { setIsSaving(false); }
  };

  // ── Formatting ─────────────────────────────────────────────────────────────

  const formatTutar = (v) => {
    if (v == null || v === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  };

  const formatTarih = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR");
    } catch { return "—"; }
  };

  const totalKesif = isPaketList.reduce((s, p) => s + ((kesifWizardRows[p._id] || {}).kesifTutar ?? 0), 0);
  const totalButce = isPaketList.reduce((s, p) => s + (Number((kesifWizardRows[p._id] || {}).butceTutar) || 0), 0);
  const anyCalculating = isPaketList.some((p) => (kesifWizardRows[p._id] || {}).isCalculating);

  // ── CSS ────────────────────────────────────────────────────────────────────

  const css_list_baslik = {
    display: "flex",
    alignItems: "center",
    px: "0.6rem",
    py: "0.3rem",
    backgroundColor: "#c8c8c8",
    fontWeight: 700,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    borderBottom: "1px solid #aaa",
    whiteSpace: "nowrap",
  };

  const css_list_satir = {
    display: "flex",
    alignItems: "center",
    px: "0.6rem",
    py: "0.4rem",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f2f2f2",
    fontSize: "0.85rem",
  };

  const css_wizard_baslik = { display: "grid", px: "0.5rem", py: "3px", border: "1px solid black", alignItems: "center", backgroundColor: "lightgray", fontWeight: 700, marginLeft: "-1px", marginTop: "-1px" };
  const css_wizard_satir = { display: "grid", px: "0.5rem", border: "1px solid black", alignItems: "center", marginLeft: "-1px", marginTop: "-1px" };
  const css_wizard_toplam = { display: "grid", px: "0.5rem", py: "3px", border: "1px solid black", alignItems: "center", backgroundColor: "rgb(240,240,240)", fontWeight: 700, marginLeft: "-1px", marginTop: "-1px" };

  const iconBtn_sx = { width: 40, height: 40 };
  const icon_sx = { fontSize: 24 };
  const wizardGridCols = "max-content max-content max-content max-content max-content max-content";

  // Versiyon listesi sütunları: Versiyon | Bütçe Tutar | Açıklama | Onaylayan | Tarih
  const listGridCols = "max-content max-content minmax(8rem, 1fr) max-content max-content";

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
        <Grid container justifyContent="space-between" alignItems="center" sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}>
          <Grid item xs>
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                Keşif / Bütçe
              </Typography>
              {show === "Wizard" && (
                <Typography variant="body2" sx={{ color: "gray" }}>
                  — yeni versiyon
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", gap: "0.25rem" }}>

              {show === "Wizard" && (
                <>
                  {/* İP versiyon seçici */}
                  {hasIpVersions && (
                    <Select
                      size="small"
                      value={kesifWizardIsPaketVersiyonNumber ?? ""}
                      onChange={(e) => handleIpVersiyonChange(e.target.value)}
                      displayEmpty
                      sx={{ fontSize: "0.75rem" }}
                      MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}
                    >
                      {[...(selectedProje?.isPaketVersiyonlar ?? [])]
                        .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                        .map((v) => (
                          <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>
                            İP{v.versiyonNumber}
                          </MenuItem>
                        ))}
                    </Select>
                  )}

                  {/* İptal */}
                  <IconButton onClick={handleCancelCreate} disabled={isSaving} sx={iconBtn_sx}>
                    <ClearOutlined sx={{ ...icon_sx, color: "red" }} />
                  </IconButton>

                  {/* Versiyon kaydet butonu */}
                  <Box
                    onClick={!isSaving ? handleSaveVersiyon : undefined}
                    sx={{
                      cursor: !isSaving ? "pointer" : "default",
                      mx: "0.3rem", py: "0.2rem", px: "0.3rem",
                      border: isSaving ? "1px solid gray" : "1px solid red",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      backgroundColor: isSaving ? "#e0e0e0" : "yellow",
                    }}
                  >
                    v{nextVersiyonNumber}
                  </Box>
                </>
              )}

              {show === "Main" && (
                <IconButton sx={iconBtn_sx} onClick={handleEnterCreate}>
                  <AddCircleOutlineIcon color="success" sx={icon_sx} />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {/* İÇERİK */}
      <Box sx={{ p: "1rem", borderTop: show === "Wizard" ? "4px solid #e53935" : "4px solid transparent", transition: "border-color 0.3s ease" }}>

        {/* ── Ana liste görünümü ── */}
        {show === "Main" && (
          <>
            {butceVersiyonlar.length === 0 && (
              <Stack spacing={2}>
                <Alert severity="info">
                  Henüz bütçe versiyonu oluşturulmamış. (+) tuşuna basarak oluşturabilirsiniz.
                </Alert>
              </Stack>
            )}

            {butceVersiyonlar.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: listGridCols, width: "fit-content" }}>

                {/* Başlık */}
                <Box sx={{ ...css_list_baslik, justifyContent: "center" }}>Versiyon</Box>
                <Box sx={{ ...css_list_baslik, justifyContent: "right" }}>Tutar</Box>
                <Box sx={{ ...css_list_baslik }}>Açıklama</Box>
                <Box sx={{ ...css_list_baslik }}>Onaylayan</Box>
                <Box sx={{ ...css_list_baslik }}>Tarih</Box>

                {/* Satırlar */}
                {butceVersiyonlar.map((v) => {
                  const isHovered = hoveredRow === v.versiyonNumber;
                  const hoverBg = isHovered ? "#e8e8e8" : "#f2f2f2";
                  const rowHandlers = {
                    onMouseEnter: () => setHoveredRow(v.versiyonNumber),
                    onMouseLeave: () => setHoveredRow(null),
                  };
                  const tutar = v.butce?.totalButceTutar ?? v.butce?.totalKesifTutar ?? null;
                  const aciklama = v.aciklama ?? "";
                  const onaylayan = v.olusturanEmail ?? v.createdByEmail ?? v.olusturanIsim ?? "—";
                  const tarih = formatTarih(v.createdAt ?? v.olusturmaTarihi ?? null);

                  return (
                    <React.Fragment key={v.versiyonNumber}>
                      <Box {...rowHandlers} sx={{ ...css_list_satir, justifyContent: "center", fontWeight: 700, backgroundColor: hoverBg }}>
                        v{v.versiyonNumber}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_list_satir, justifyContent: "right", fontWeight: tutar ? 600 : 400, backgroundColor: hoverBg }}>
                        {formatTutar(tutar)}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_list_satir, backgroundColor: hoverBg, color: aciklama ? "inherit" : "gray" }}>
                        {aciklama || "—"}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_list_satir, backgroundColor: hoverBg }}>
                        {onaylayan}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_list_satir, backgroundColor: hoverBg }}>
                        {tarih}
                      </Box>
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
          </>
        )}

        {/* ── Yeni versiyon sihirbazı ── */}
        {show === "Wizard" && (
          <>
            {/* Açıklama alanı */}
            <Box sx={{ mb: "1rem", maxWidth: "32rem" }}>
              <TextField
                variant="standard"
                label="Açıklama"
                fullWidth
                value={kesifWizardAciklama ?? ""}
                onChange={(e) => setKesifWizardAciklama(e.target.value)}
                placeholder="Bu versiyona ait not (isteğe bağlı)"
              />
            </Box>

            {!hasIpVersions && (
              <Stack spacing={2}><Alert severity="info">Bu proje için henüz iş paketi versiyonu oluşturulmamış.</Alert></Stack>
            )}
            {hasIpVersions && isPaketList.length === 0 && (
              <Stack spacing={2}><Alert severity="info">Seçili iş paketi versiyonunda aktif iş paketi bulunmuyor.</Alert></Stack>
            )}
            {hasIpVersions && isPaketList.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: wizardGridCols, ml: "1px", pt: "1px" }}>
                <Box sx={css_wizard_baslik}>Sıra</Box>
                <Box sx={css_wizard_baslik}>İş Paketi</Box>
                <Box sx={{ ...css_wizard_baslik, textAlign: "center" }}>Metraj V.</Box>
                <Box sx={{ ...css_wizard_baslik, textAlign: "center" }}>B.Fiyat V.</Box>
                <Box sx={{ ...css_wizard_baslik, textAlign: "right" }}>Keşif Tutar</Box>
                <Box sx={{ ...css_wizard_baslik, textAlign: "right" }}>Bütçe Tutar</Box>

                {isPaketList.map((onePaket, index) => {
                  const row = kesifWizardRows[onePaket._id] || {};
                  const isHovered = hoveredRow === onePaket._id.toString();
                  const hoverSx = isHovered ? { textShadow: "0 0 0.7px black, 0 0 0.7px black" } : {};
                  const rowHandlers = {
                    onMouseEnter: () => setHoveredRow(onePaket._id.toString()),
                    onMouseLeave: () => setHoveredRow(null),
                  };
                  return (
                    <React.Fragment key={onePaket._id}>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, justifyContent: "center" }}>{index + 1}</Box>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, cursor: "pointer" }} onClick={() => handleClickIsPaketInWizard(onePaket)}>
                        {onePaket.name}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, py: "0.25rem" }}>
                        <Select variant="standard" size="small" displayEmpty value={row.metrajVersiyonNumber ?? ""} onChange={(e) => handleMetrajVChange(onePaket._id, e.target.value)} sx={{ fontSize: "0.875rem", minWidth: 60 }}>
                          <MenuItem value=""><em>—</em></MenuItem>
                          {[...metrajVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                            <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>M{v.versiyonNumber}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, py: "0.25rem" }}>
                        <Select variant="standard" size="small" displayEmpty value={row.birimFiyatVersiyonNumber ?? ""} onChange={(e) => handleBirimFiyatVChange(onePaket._id, e.target.value)} sx={{ fontSize: "0.875rem", minWidth: 60 }}>
                          <MenuItem value=""><em>—</em></MenuItem>
                          {[...birimFiyatVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                            <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>BF{v.versiyonNumber}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, justifyContent: "right", fontWeight: row.kesifTutar != null ? 700 : 400, color: row.isCalculating ? "gray" : "inherit" }}>
                        {row.isCalculating ? "..." : formatTutar(row.kesifTutar)}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_wizard_satir, ...hoverSx, py: "0.25rem" }}>
                        <TextField variant="standard" size="small" placeholder="—" value={row.butceTutar ?? ""} onChange={(e) => handleButceTutarChange(onePaket._id, e.target.value)} inputProps={{ style: { fontSize: "0.875rem", textAlign: "right" } }} sx={{ width: 100 }} />
                      </Box>
                    </React.Fragment>
                  );
                })}

                <Box sx={{ ...css_wizard_toplam, gridColumn: "1 / span 4", justifyContent: "right" }}>Toplam</Box>
                <Box sx={{ ...css_wizard_toplam, justifyContent: "right" }}>{anyCalculating ? "..." : formatTutar(totalKesif)}</Box>
                <Box sx={{ ...css_wizard_toplam, justifyContent: "right" }}>{totalButce > 0 ? formatTutar(totalButce) : "—"}</Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
