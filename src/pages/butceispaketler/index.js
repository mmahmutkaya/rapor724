import React, { useState, useEffect, useRef, useContext } from "react";
import { StoreContext } from "../../components/store.js";
import { useNavigate } from "react-router-dom";
import { DialogAlert } from "../../components/general/DialogAlert.js";

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

import ReplyIcon from "@mui/icons-material/Reply";
import SaveIcon from "@mui/icons-material/Save";

export default function P_IsPaketlerButce() {
  const {
    appUser,
    setAppUser,
    selectedProje,
    setSelectedProje,
    kesifWizardRows,
    setKesifWizardRows,
    kesifWizardName,
    setKesifWizardName,
    kesifWizardAciklama,
    setKesifWizardAciklama,
    kesifWizardIsPaketVersiyonNumber,
    setKesifWizardIsPaketVersiyonNumber,
    setKesifWizardActiveIsPaketId,
    setSelectedIsPaket,
    setSelectedIsPaketVersiyon,
  } = useContext(StoreContext);

  const [dialogAlert, setDialogAlert] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const abortControllersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProje) navigate("/projeler");
  }, []);

  // Abort all pending calculations on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    };
  }, []);

  const nextVersiyonNumber =
    (selectedProje?.butceVersiyonlar?.reduce(
      (acc, cur) => Math.max(acc, cur.versiyonNumber),
      0
    ) ?? 0) + 1;

  const isPaketVersiyon = selectedProje?.isPaketVersiyonlar?.find(
    (v) => v.versiyonNumber === kesifWizardIsPaketVersiyonNumber
  );
  const isPaketList = (isPaketVersiyon?.isPaketler ?? []).filter((p) => p.isActive);

  const metrajVersiyonlar = selectedProje?.metrajVersiyonlar ?? [];
  const birimFiyatVersiyonlar = selectedProje?.birimFiyatVersiyonlar ?? [];

  const handleIpVersiyonChange = (newVersiyonNumber) => {
    // Abort all pending calculations
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    abortControllersRef.current = {};
    setKesifWizardIsPaketVersiyonNumber(newVersiyonNumber);
    setKesifWizardRows({});
  };

  const doCalculate = async (isPaketId, metrajVN, birimFiyatVN) => {
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
          headers: {
            email: appUser.email,
            token: appUser.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projeId: selectedProje._id,
            isPaketId,
            isPaketVersiyonNumber: Number(kesifWizardIsPaketVersiyonNumber),
            metrajVersiyonNumber: Number(metrajVN),
            birimFiyatVersiyonNumber: Number(birimFiyatVN),
          }),
          signal: controller.signal,
        }
      );
      const json = await res.json();
      if (json.error) {
        if (json.error.includes("expired")) {
          setAppUser();
          localStorage.removeItem("appUser");
          navigate("/");
          window.location.reload();
        }
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

  const handleMetrajVChange = (isPaketId, value) => {
    const existingRow = kesifWizardRows[isPaketId] || {};
    const updatedRow = {
      ...existingRow,
      metrajVersiyonNumber: value !== "" ? Number(value) : null,
      kesifTutar: null,
      isCalculating: false,
    };
    setKesifWizardRows((prev) => ({ ...prev, [isPaketId]: updatedRow }));
    if (value !== "" && updatedRow.birimFiyatVersiyonNumber != null) {
      doCalculate(isPaketId, Number(value), updatedRow.birimFiyatVersiyonNumber);
    }
  };

  const handleBirimFiyatVChange = (isPaketId, value) => {
    const existingRow = kesifWizardRows[isPaketId] || {};
    const updatedRow = {
      ...existingRow,
      birimFiyatVersiyonNumber: value !== "" ? Number(value) : null,
      kesifTutar: null,
      isCalculating: false,
    };
    setKesifWizardRows((prev) => ({ ...prev, [isPaketId]: updatedRow }));
    if (value !== "" && updatedRow.metrajVersiyonNumber != null) {
      doCalculate(isPaketId, updatedRow.metrajVersiyonNumber, Number(value));
    }
  };

  const handleButceTutarChange = (isPaketId, value) => {
    setKesifWizardRows((prev) => ({
      ...prev,
      [isPaketId]: { ...(prev[isPaketId] || {}), butceTutar: value },
    }));
  };

  const handleClickIsPaket = (onePaket) => {
    setSelectedIsPaket(onePaket);
    setSelectedIsPaketVersiyon(isPaketVersiyon);
    setKesifWizardActiveIsPaketId(onePaket._id);
    navigate("/butcepozlar");
  };

  const handleSave = async () => {
    if (!kesifWizardName || kesifWizardName.trim().length === 0) {
      setNameError("Bütçe adı girilmemiş");
      return;
    }
    if (kesifWizardName.trim().length < 3) {
      setNameError("Bütçe adı çok kısa");
      return;
    }

    setIsSaving(true);
    try {
      const isPaketlerSatirlar = isPaketList.map((onePaket) => {
        const row = kesifWizardRows[onePaket._id] || {};
        return {
          isPaketId: onePaket._id,
          isPaketName: onePaket.name,
          metrajVersiyonNumber: row.metrajVersiyonNumber ?? null,
          birimFiyatVersiyonNumber: row.birimFiyatVersiyonNumber ?? null,
          kesifTutar: row.kesifTutar ?? null,
          butceTutar:
            row.butceTutar !== undefined && row.butceTutar !== ""
              ? Number(row.butceTutar) || null
              : null,
        };
      });

      const totalKesifTutar =
        Math.round(
          isPaketlerSatirlar.reduce((sum, r) => sum + (r.kesifTutar ?? 0), 0) * 100
        ) / 100;
      const totalButceTutar =
        Math.round(
          isPaketlerSatirlar.reduce((sum, r) => sum + (r.butceTutar ?? 0), 0) * 100
        ) / 100;

      const butce = {
        name: kesifWizardName.trim(),
        aciklama: kesifWizardAciklama.trim(),
        isPaketVersiyonNumber: kesifWizardIsPaketVersiyonNumber,
        isPaketlerSatirlar,
        totalKesifTutar,
        totalButceTutar,
      };

      const res1 = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/projeler/updatebutce",
        {
          method: "POST",
          headers: {
            email: appUser.email,
            token: appUser.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projeId: selectedProje._id, butce }),
        }
      );
      const json1 = await res1.json();
      if (json1.error) {
        if (json1.error.includes("expired")) {
          setAppUser();
          localStorage.removeItem("appUser");
          navigate("/");
          window.location.reload();
        }
        throw new Error(json1.error);
      }
      if (!json1.ok) throw new Error("Bütçe kaydı gerçekleşmedi.");

      const res2 = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/versiyon/butce",
        {
          method: "POST",
          headers: {
            email: appUser.email,
            token: appUser.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projeId: selectedProje._id,
            versiyonNumber: nextVersiyonNumber,
            aciklama: "",
          }),
        }
      );
      const json2 = await res2.json();
      if (json2.error) {
        if (json2.error.includes("expired")) {
          setAppUser();
          localStorage.removeItem("appUser");
          navigate("/");
          window.location.reload();
        }
        throw new Error(json2.error);
      }
      if (json2.ok) {
        setSelectedProje({
          ...selectedProje,
          butce,
          butceVersiyonlar: json2.butceVersiyonlar,
        });
        navigate("/butce");
      } else {
        throw new Error("Versiyon kayıt işlemi gerçekleşmedi.");
      }
    } catch (err) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage:
          "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.",
        detailText: err?.message ?? null,
        onCloseAction: () => setDialogAlert(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTutar = (tutar) => {
    if (tutar === null || tutar === undefined) return "—";
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(tutar);
  };

  const headerIconButton_sx = { width: 40, height: 40 };
  const headerIcon_sx = { fontSize: 24 };

  const css_baslik = {
    display: "grid",
    px: "0.5rem",
    border: "1px solid black",
    alignItems: "center",
    backgroundColor: "lightgray",
    fontWeight: 700,
    minHeight: "2.2rem",
    marginLeft: "-1px",
    marginTop: "-1px",
  };

  const css_satir = {
    display: "grid",
    px: "0.5rem",
    border: "1px solid black",
    alignItems: "center",
    minHeight: "2.2rem",
    marginLeft: "-1px",
    marginTop: "-1px",
  };

  const css_toplam = {
    display: "grid",
    px: "0.5rem",
    border: "1px solid black",
    alignItems: "center",
    backgroundColor: "rgb(240,240,240)",
    fontWeight: 700,
    minHeight: "2.2rem",
    marginLeft: "-1px",
    marginTop: "-1px",
  };

  // Totals
  const totalKesif = isPaketList.reduce((sum, p) => {
    const row = kesifWizardRows[p._id] || {};
    return sum + (row.kesifTutar ?? 0);
  }, 0);
  const totalButce = isPaketList.reduce((sum, p) => {
    const row = kesifWizardRows[p._id] || {};
    const bt = Number(row.butceTutar) || 0;
    return sum + bt;
  }, 0);
  const anyCalculating = isPaketList.some(
    (p) => (kesifWizardRows[p._id] || {}).isCalculating
  );

  const hasNoIpVersions = (selectedProje?.isPaketVersiyonlar?.length ?? 0) === 0;

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={
            dialogAlert.onCloseAction ? dialogAlert.onCloseAction : () => setDialogAlert()
          }
        />
      )}

      {/* BAŞLIK */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "white", color: "black", boxShadow: 4 }}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ padding: "0.5rem 1rem", maxHeight: "5rem" }}
        >
          {/* Sol */}
          <Grid item xs>
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconButton
                onClick={() => navigate("/butce")}
                sx={{ width: 40, height: 40, ml: "-0.5rem" }}
              >
                <ReplyIcon sx={headerIcon_sx} />
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                Keşif / Bütçe Oluştur
              </Typography>
              <TextField
                variant="standard"
                size="small"
                placeholder="Bütçe Adı *"
                value={kesifWizardName}
                onChange={(e) => { setKesifWizardName(e.target.value); setNameError(false); }}
                error={!!nameError}
                helperText={nameError || ""}
                inputProps={{ style: { fontSize: "0.875rem" } }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                variant="standard"
                size="small"
                placeholder="Açıklama"
                value={kesifWizardAciklama}
                onChange={(e) => setKesifWizardAciklama(e.target.value)}
                inputProps={{ style: { fontSize: "0.875rem" } }}
                sx={{ minWidth: 140 }}
              />
            </Box>
          </Grid>

          {/* Sağ */}
          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", gap: "0.25rem" }}>
              {!hasNoIpVersions && (
                <Select
                  size="small"
                  value={kesifWizardIsPaketVersiyonNumber ?? ""}
                  onChange={(e) => handleIpVersiyonChange(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: "0.75rem" }}
                  MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}
                >
                  {(selectedProje?.isPaketVersiyonlar ?? [])
                    .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                    .map((v) => (
                      <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>
                        İP{v.versiyonNumber}
                      </MenuItem>
                    ))}
                </Select>
              )}
              <IconButton onClick={handleSave} disabled={isSaving} sx={headerIconButton_sx}>
                <SaveIcon sx={headerIcon_sx} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {/* İÇERİK */}
      <Box sx={{ p: "1rem" }}>
        {hasNoIpVersions && (
          <Stack spacing={2}>
            <Alert severity="info">
              Bu proje için henüz iş paketi versiyonu oluşturulmamış.
            </Alert>
          </Stack>
        )}

        {!hasNoIpVersions && isPaketList.length === 0 && (
          <Stack spacing={2}>
            <Alert severity="info">
              Seçili iş paketi versiyonunda aktif iş paketi bulunmuyor.
            </Alert>
          </Stack>
        )}

        {!hasNoIpVersions && isPaketList.length > 0 && (
          <Box
            sx={{
              mt: "0.5rem",
              display: "grid",
              gridTemplateColumns:
                "max-content max-content max-content max-content max-content max-content",
              ml: "1px", // Adjust for overlapping borders
              pt: "1px", // Adjust for overlapping borders
            }}
          >
            {/* Başlık Satırı */}
            <Box sx={css_baslik}>Sıra</Box>
            <Box sx={css_baslik}>İş Paketi</Box>
            <Box sx={{ ...css_baslik, textAlign: "center" }}>Metraj V.</Box>
            <Box sx={{ ...css_baslik, textAlign: "center" }}>Birim Fiyat V.</Box>
            <Box sx={{ ...css_baslik, textAlign: "right" }}>Keşif Tutar</Box>
            <Box sx={{ ...css_baslik, textAlign: "right" }}>Bütçe Tutar</Box>

            {/* Veri Satırları */}
            {isPaketList.map((onePaket, index) => {
              const row = kesifWizardRows[onePaket._id] || {};
              return (
                <React.Fragment key={onePaket._id}>
                  <Box sx={{ ...css_satir, justifyContent: "center" }}>{index + 1}</Box>
                  <Box
                    sx={{ ...css_satir, cursor: "pointer", color: "darkblue", textDecoration: "underline" }}
                    onClick={() => handleClickIsPaket(onePaket)}
                  >
                    {onePaket.name}
                  </Box>
                  <Box sx={{ ...css_satir, py: "0.25rem" }}>
                    <Select
                      variant="standard"
                      size="small"
                      displayEmpty
                      value={row.metrajVersiyonNumber ?? ""}
                      onChange={(e) => handleMetrajVChange(onePaket._id, e.target.value)}
                      sx={{ fontSize: "0.875rem", minWidth: 60 }}
                    >
                      <MenuItem value=""><em>—</em></MenuItem>
                      {[...metrajVersiyonlar]
                        .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                        .map((v) => (
                          <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>
                            M{v.versiyonNumber}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                  <Box sx={{ ...css_satir, py: "0.25rem" }}>
                    <Select
                      variant="standard"
                      size="small"
                      displayEmpty
                      value={row.birimFiyatVersiyonNumber ?? ""}
                      onChange={(e) => handleBirimFiyatVChange(onePaket._id, e.target.value)}
                      sx={{ fontSize: "0.875rem", minWidth: 60 }}
                    >
                      <MenuItem value=""><em>—</em></MenuItem>
                      {[...birimFiyatVersiyonlar]
                        .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                        .map((v) => (
                          <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.875rem" }}>
                            BF{v.versiyonNumber}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                  <Box
                    sx={{
                      ...css_satir,
                      justifyContent: "right",
                      fontWeight: row.kesifTutar != null ? 700 : 400,
                      color: row.isCalculating ? "gray" : "inherit",
                    }}
                  >
                    {row.isCalculating ? "..." : formatTutar(row.kesifTutar)}
                  </Box>
                  <Box sx={{ ...css_satir, py: "0.25rem" }}>
                    <TextField
                      variant="standard"
                      size="small"
                      placeholder="—"
                      value={row.butceTutar ?? ""}
                      onChange={(e) => handleButceTutarChange(onePaket._id, e.target.value)}
                      inputProps={{ style: { fontSize: "0.875rem", textAlign: "right" } }}
                      sx={{ width: 100 }}
                    />
                  </Box>
                </React.Fragment>
              );
            })}

            {/* Toplam Satırı */}
            <Box sx={{ ...css_toplam, gridColumn: "1 / span 4", justifyContent: "right" }}>
              Toplam
            </Box>
            <Box sx={{ ...css_toplam, justifyContent: "right" }}>
              {anyCalculating ? "..." : formatTutar(totalKesif)}
            </Box>
            <Box sx={{ ...css_toplam, justifyContent: "right" }}>
              {totalButce > 0 ? formatTutar(totalButce) : "—"}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
