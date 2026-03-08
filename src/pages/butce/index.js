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

import EditIcon from "@mui/icons-material/Edit";
import ClearOutlined from "@mui/icons-material/ClearOutlined";
import SaveIcon from "@mui/icons-material/Save";

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
    kesifWizardIsPaketVersiyonNumber,
    setKesifWizardIsPaketVersiyonNumber,
    setKesifWizardActiveIsPaketId,
    setSelectedIsPaket,
    setSelectedIsPaketVersiyon,
    setSelectedMetrajVersiyon,
    setSelectedBirimFiyatVersiyon,
  } = useContext(StoreContext);

  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

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
  const hasButceVersiyonlar = butceVersiyonlar.length > 0;

  const nextVersiyonNumber =
    (butceVersiyonlar.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1;

  const isPaketVersiyon = selectedProje?.isPaketVersiyonlar?.find(
    (v) => v.versiyonNumber === kesifWizardIsPaketVersiyonNumber
  );
  const isPaketList = (isPaketVersiyon?.isPaketler ?? []).filter((p) => p.isActive);

  // View mode data
  const viewButce = selectedButceVersiyon?.butce ?? null;
  const viewIsPaketList = viewButce?.isPaketlerSatirlar ?? [];

  // Abort fetch on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    };
  }, []);

  // On mount: guard + initialize
  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }

    if (!mode_butceEdit) {
      if (!selectedButceVersiyon && hasButceVersiyonlar) {
        setSelectedButceVersiyon(butceVersiyonlar[0]);
      }
    } else {
      // Coming back from butcepozlar — wizard already initialized
      if (kesifWizardIsPaketVersiyonNumber !== null) {
        // Recalculate any rows where version was changed but kesifTutar was cleared
        Object.entries(kesifWizardRows).forEach(([isPaketId, row]) => {
          if (row.kesifTutar === null && !row.isCalculating && row.metrajVersiyonNumber != null && row.birimFiyatVersiyonNumber != null) {
            doCalculate(isPaketId, row.metrajVersiyonNumber, row.birimFiyatVersiyonNumber, kesifWizardIsPaketVersiyonNumber);
          }
        });
        return;
      }
      initEditRows();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getLatestMaxVN = (arr) =>
    (arr ?? []).reduce((acc, v) => Math.max(acc, v.versiyonNumber), 0) || null;

  const initEditRows = () => {
    const butce = selectedProje?.butce;
    const maxIpVN = getLatestMaxVN(selectedProje?.isPaketVersiyonlar);
    const maxMetrajVN = getLatestMaxVN(metrajVersiyonlar);
    const maxBirimFiyatVN = getLatestMaxVN(birimFiyatVersiyonlar);

    if (butce?.isPaketVersiyonNumber != null && (butce.isPaketlerSatirlar?.length ?? 0) > 0) {
      setKesifWizardIsPaketVersiyonNumber(butce.isPaketVersiyonNumber);
      const rowsInit = {};
      (butce.isPaketlerSatirlar ?? []).forEach((s) => {
        rowsInit[s.isPaketId] = {
          metrajVersiyonNumber: s.metrajVersiyonNumber ?? null,
          birimFiyatVersiyonNumber: s.birimFiyatVersiyonNumber ?? null,
          kesifTutar: s.kesifTutar ?? null,
          butceTutar: s.butceTutar != null ? String(s.butceTutar) : "",
          isCalculating: false,
        };
      });
      setKesifWizardRows(rowsInit);
    } else {
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
    }
  };

  const handleEnterEdit = async () => {
    const checkAuth = await requestProjeAktifYetkiliKisi({
      projeId: selectedProje?._id,
      aktifYetki: "butceEdit",
      setDialogAlert,
      setShow: () => {},
    });
    if (checkAuth?.ok) {
      initEditRows();
      setMode_butceEdit(true);
      setIsChanged(false);
    }
  };

  const handleCancelEdit = () => {
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
        setMode_butceEdit(false);
        setIsChanged(false);
        if (!selectedButceVersiyon && hasButceVersiyonlar) {
          setSelectedButceVersiyon(butceVersiyonlar[0]);
        }
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
    setIsChanged(true);

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
    setIsChanged(true);
    if (value !== "" && updated.birimFiyatVersiyonNumber != null) {
      doCalculate(isPaketId, Number(value), updated.birimFiyatVersiyonNumber);
    }
  };

  const handleBirimFiyatVChange = (isPaketId, value) => {
    const existing = kesifWizardRows[isPaketId] || {};
    const updated = { ...existing, birimFiyatVersiyonNumber: value !== "" ? Number(value) : null, kesifTutar: null, isCalculating: false };
    setKesifWizardRows((prev) => ({ ...prev, [isPaketId]: updated }));
    setIsChanged(true);
    if (value !== "" && updated.metrajVersiyonNumber != null) {
      doCalculate(isPaketId, updated.metrajVersiyonNumber, Number(value));
    }
  };

  const handleButceTutarChange = (isPaketId, value) => {
    setKesifWizardRows((prev) => ({
      ...prev,
      [isPaketId]: { ...(prev[isPaketId] || {}), butceTutar: value },
    }));
    setIsChanged(true);
  };

  const handleClickIsPaketEdit = (onePaket) => {
    const row = kesifWizardRows[onePaket._id] || {};
    if (row.isCalculating) {
      setDialogAlert({ dialogIcon: "info", dialogMessage: "Keşif tutarı hesaplanıyor, lütfen bekleyin." });
      return;
    }
    if (row.kesifTutar == null || row.kesifTutar === 0) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: `"${onePaket.name}" iş paketinin bu versiyonda keşif tutarı bulunmuyor.` });
      return;
    }
    setSelectedIsPaket(onePaket);
    setSelectedIsPaketVersiyon(isPaketVersiyon);
    setKesifWizardActiveIsPaketId(onePaket._id);
    if (row.metrajVersiyonNumber != null) setSelectedMetrajVersiyon({ versiyonNumber: row.metrajVersiyonNumber });
    if (row.birimFiyatVersiyonNumber != null) setSelectedBirimFiyatVersiyon({ versiyonNumber: row.birimFiyatVersiyonNumber });
    navigate("/butcepozlar");
  };

  const handleClickIsPaketView = (satir) => {
    const ipV = selectedProje?.isPaketVersiyonlar?.find(
      (v) => v.versiyonNumber === viewButce?.isPaketVersiyonNumber
    );
    const paketObj = ipV?.isPaketler?.find(
      (p) => p._id?.toString() === satir.isPaketId?.toString()
    );
    setSelectedIsPaket(paketObj ?? { _id: satir.isPaketId, name: satir.isPaketName });
    setSelectedIsPaketVersiyon(ipV ?? null);
    setKesifWizardActiveIsPaketId(satir.isPaketId);
    if (satir.metrajVersiyonNumber != null) setSelectedMetrajVersiyon({ versiyonNumber: satir.metrajVersiyonNumber });
    if (satir.birimFiyatVersiyonNumber != null) setSelectedBirimFiyatVersiyon({ versiyonNumber: satir.birimFiyatVersiyonNumber });
    navigate("/butcepozlar");
  };

  // ── Save handlers ──────────────────────────────────────────────────────────

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

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const butce = buildButceObject();
      const json = await authFetch("/api/projeler/updatebutce", { projeId: selectedProje._id, butce });
      if (!json.ok) throw new Error("Bütçe kaydı gerçekleşmedi.");
      setSelectedProje({ ...selectedProje, butce });
      setIsChanged(false);
    } catch (err) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: "Kayıt sırasında hata oluştu.", detailText: err?.message ?? null, onCloseAction: () => setDialogAlert() });
    } finally { setIsSaving(false); }
  };

  const handleSaveVersiyon = async () => {
    setIsSaving(true);
    try {
      const butce = buildButceObject();
      const json1 = await authFetch("/api/projeler/updatebutce", { projeId: selectedProje._id, butce });
      if (!json1.ok) throw new Error("Bütçe kaydı gerçekleşmedi.");
      const json2 = await authFetch("/api/versiyon/butce", { projeId: selectedProje._id, versiyonNumber: nextVersiyonNumber, aciklama: "" });
      if (!json2.ok) throw new Error("Versiyon kayıt işlemi gerçekleşmedi.");
      const newVersiyon = json2.butceVersiyonlar.find((v) => v.versiyonNumber === nextVersiyonNumber)
        ?? [...json2.butceVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber)[0];
      setSelectedProje({ ...selectedProje, butce, butceVersiyonlar: json2.butceVersiyonlar });
      setSelectedButceVersiyon(newVersiyon);
      setMode_butceEdit(false);
      setKesifWizardRows({});
      setKesifWizardIsPaketVersiyonNumber(null);
    } catch (err) {
      setDialogAlert({ dialogIcon: "warning", dialogMessage: "Kayıt sırasında hata oluştu.", detailText: err?.message ?? null, onCloseAction: () => setDialogAlert() });
    } finally { setIsSaving(false); }
  };

  // ── Formatting / totals ────────────────────────────────────────────────────

  const formatTutar = (v) => {
    if (v == null || v === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  };

  const totalKesif = isPaketList.reduce((s, p) => s + ((kesifWizardRows[p._id] || {}).kesifTutar ?? 0), 0);
  const totalButce = isPaketList.reduce((s, p) => s + (Number((kesifWizardRows[p._id] || {}).butceTutar) || 0), 0);
  const anyCalculating = isPaketList.some((p) => (kesifWizardRows[p._id] || {}).isCalculating);

  const totalViewKesif = viewIsPaketList.reduce((s, r) => s + (r.kesifTutar ?? 0), 0);
  const totalViewButce = viewIsPaketList.reduce((s, r) => s + (r.butceTutar ?? 0), 0);

  // ── CSS helpers ────────────────────────────────────────────────────────────

  const css_baslik = { display: "grid", px: "0.5rem", py: "3px", border: "1px solid black", alignItems: "center", backgroundColor: "lightgray", fontWeight: 700, marginLeft: "-1px", marginTop: "-1px" };
  const css_satir = { display: "grid", px: "0.5rem", border: "1px solid black", alignItems: "center", marginLeft: "-1px", marginTop: "-1px" };
  const css_toplam = { display: "grid", px: "0.5rem", py: "3px", border: "1px solid black", alignItems: "center", backgroundColor: "rgb(240,240,240)", fontWeight: 700, marginLeft: "-1px", marginTop: "-1px" };
  const iconBtn_sx = { width: 40, height: 40 };
  const icon_sx = { fontSize: 24 };
  const gridCols = "max-content max-content max-content max-content max-content max-content";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* APP BAR */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}
      >
        <Grid container justifyContent="space-between" alignItems="center" sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}>
          <Grid item xs>
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap"}}>
                Bütçe
              </Typography>
            </Box>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", gap: "0.25rem" }}>

              {/* View mode: bütçe versiyon seçici */}
              {!mode_butceEdit && hasButceVersiyonlar && (
                <Select
                  size="small"
                  value={selectedButceVersiyon?.versiyonNumber ?? ""}
                  onChange={(e) => {
                    const v = butceVersiyonlar.find((x) => x.versiyonNumber === e.target.value);
                    setSelectedButceVersiyon(v ?? null);
                  }}
                  displayEmpty
                  sx={{ fontSize: "0.75rem" }}
                  MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}
                >
                  {butceVersiyonlar.map((v) => (
                    <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>
                      BU{v.versiyonNumber}
                    </MenuItem>
                  ))}
                </Select>
              )}

              {/* Edit mode: iş paketi versiyon seçici */}
              {mode_butceEdit && hasIpVersions && (
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

              {mode_butceEdit ? (
                <>
                  <IconButton onClick={handleCancelEdit} disabled={isSaving} sx={iconBtn_sx}>
                    <ClearOutlined sx={{ ...icon_sx, color: "red" }} />
                  </IconButton>
                  <IconButton onClick={handleSaveDraft} disabled={isSaving || !isChanged} sx={iconBtn_sx} title="Taslak Kaydet">
                    <SaveIcon sx={icon_sx} />
                  </IconButton>
                  <Box
                    onClick={(!isSaving && !isChanged) ? handleSaveVersiyon : undefined}
                    sx={{
                      cursor: (!isSaving && !isChanged) ? "pointer" : "default",
                      mx: "0.3rem", py: "0.2rem", px: "0.3rem",
                      border: (isSaving || isChanged) ? "1px solid gray" : "1px solid red",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      backgroundColor: (isSaving || isChanged) ? "#e0e0e0" : "yellow",
                    }}
                  >
                    BU{nextVersiyonNumber}
                  </Box>
                </>
              ) : (
                <IconButton onClick={handleEnterEdit} sx={iconBtn_sx}>
                  <EditIcon sx={icon_sx} />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {/* İÇERİK */}
      <Box sx={{ p: "1rem", borderTop: mode_butceEdit ? "4px solid #e53935" : "4px solid transparent", transition: "border-color 0.3s ease" }}>

        {/* ── Düzenleme modu ── */}
        {mode_butceEdit && (
          <>
            {!hasIpVersions && (
              <Stack spacing={2}><Alert severity="info">Bu proje için henüz iş paketi versiyonu oluşturulmamış.</Alert></Stack>
            )}
            {hasIpVersions && isPaketList.length === 0 && (
              <Stack spacing={2}><Alert severity="info">Seçili iş paketi versiyonunda aktif iş paketi bulunmuyor.</Alert></Stack>
            )}
            {hasIpVersions && isPaketList.length > 0 && (
              <Box sx={{ mt: "0.5rem", display: "grid", gridTemplateColumns: gridCols, ml: "1px", pt: "1px" }}>
                <Box sx={css_baslik}>Sıra</Box>
                <Box sx={css_baslik}>İş Paketi</Box>
                <Box sx={{ ...css_baslik, textAlign: "center" }}>Metraj V.</Box>
                <Box sx={{ ...css_baslik, textAlign: "center" }}>B.Fiyat V.</Box>
                <Box sx={{ ...css_baslik, textAlign: "right" }}>Keşif Tutar</Box>
                <Box sx={{ ...css_baslik, textAlign: "right" }}>Bütçe Tutar</Box>

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
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "center" }}>{index + 1}</Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, cursor: "pointer" }} onClick={() => handleClickIsPaketEdit(onePaket)}>
                        {onePaket.name}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, py: "0.25rem" }}>
                        <Select variant="standard" size="small" displayEmpty value={row.metrajVersiyonNumber ?? ""} onChange={(e) => handleMetrajVChange(onePaket._id, e.target.value)} sx={{ fontSize: "0.875rem", minWidth: 60 }}>
                          <MenuItem value=""><em>—</em></MenuItem>
                          {[...metrajVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                            <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>M{v.versiyonNumber}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, py: "0.25rem" }}>
                        <Select variant="standard" size="small" displayEmpty value={row.birimFiyatVersiyonNumber ?? ""} onChange={(e) => handleBirimFiyatVChange(onePaket._id, e.target.value)} sx={{ fontSize: "0.875rem", minWidth: 60 }}>
                          <MenuItem value=""><em>—</em></MenuItem>
                          {[...birimFiyatVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                            <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>BF{v.versiyonNumber}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "right", fontWeight: row.kesifTutar != null ? 700 : 400, color: row.isCalculating ? "gray" : "inherit" }}>
                        {row.isCalculating ? "..." : formatTutar(row.kesifTutar)}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, py: "0.25rem" }}>
                        <TextField variant="standard" size="small" placeholder="—" value={row.butceTutar ?? ""} onChange={(e) => handleButceTutarChange(onePaket._id, e.target.value)} inputProps={{ style: { fontSize: "0.875rem", textAlign: "right" } }} sx={{ width: 100 }} />
                      </Box>
                    </React.Fragment>
                  );
                })}

                <Box sx={{ ...css_toplam, gridColumn: "1 / span 4", justifyContent: "right" }}>Toplam</Box>
                <Box sx={{ ...css_toplam, justifyContent: "right" }}>{anyCalculating ? "..." : formatTutar(totalKesif)}</Box>
                <Box sx={{ ...css_toplam, justifyContent: "right" }}>{totalButce > 0 ? formatTutar(totalButce) : "—"}</Box>
              </Box>
            )}
          </>
        )}

        {/* ── Görüntüleme modu ── */}
        {!mode_butceEdit && (
          <>
            {!hasButceVersiyonlar && (
              <Stack spacing={2}><Alert severity="info">Henüz bütçe versiyonu oluşturulmamış. Düzenle tuşuna basarak oluşturabilirsiniz.</Alert></Stack>
            )}
            {hasButceVersiyonlar && !viewButce && (
              <Stack spacing={2}><Alert severity="info">Görüntülenecek versiyon bulunamadı.</Alert></Stack>
            )}
            {hasButceVersiyonlar && viewButce && (
              <Box sx={{ mt: "0.5rem", display: "grid", gridTemplateColumns: gridCols, ml: "1px", pt: "1px" }}>
                <Box sx={css_baslik}>Sıra</Box>
                <Box sx={css_baslik}>İş Paketi</Box>
                <Box sx={{ ...css_baslik, textAlign: "center" }}>Metraj V.</Box>
                <Box sx={{ ...css_baslik, textAlign: "center" }}>B.Fiyat V.</Box>
                <Box sx={{ ...css_baslik, textAlign: "right" }}>Keşif Tutar</Box>
                <Box sx={{ ...css_baslik, textAlign: "right" }}>Bütçe Tutar</Box>

                {viewIsPaketList.map((satir, index) => {
                  const isHovered = hoveredRow === (satir.isPaketId ?? String(index));
                  const hoverSx = isHovered ? { textShadow: "0 0 0.7px black, 0 0 0.7px black" } : {};
                  const rowHandlers = {
                    onMouseEnter: () => setHoveredRow(satir.isPaketId ?? String(index)),
                    onMouseLeave: () => setHoveredRow(null),
                  };
                  return (
                    <React.Fragment key={satir.isPaketId ?? index}>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "center" }}>{index + 1}</Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, cursor: "pointer" }} onClick={() => handleClickIsPaketView(satir)}>
                        {satir.isPaketName ?? "—"}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "center" }}>
                        {satir.metrajVersiyonNumber != null ? `M${satir.metrajVersiyonNumber}` : "—"}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "center" }}>
                        {satir.birimFiyatVersiyonNumber != null ? `BF${satir.birimFiyatVersiyonNumber}` : "—"}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "right", fontWeight: satir.kesifTutar != null ? 700 : 400 }}>
                        {formatTutar(satir.kesifTutar)}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...css_satir, ...hoverSx, justifyContent: "right" }}>
                        {formatTutar(satir.butceTutar)}
                      </Box>
                    </React.Fragment>
                  );
                })}

                <Box sx={{ ...css_toplam, gridColumn: "1 / span 4", justifyContent: "right" }}>Toplam</Box>
                <Box sx={{ ...css_toplam, justifyContent: "right" }}>{formatTutar(totalViewKesif)}</Box>
                <Box sx={{ ...css_toplam, justifyContent: "right" }}>{totalViewButce > 0 ? formatTutar(totalViewButce) : "—"}</Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
