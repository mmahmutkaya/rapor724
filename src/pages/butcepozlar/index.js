import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";

import { StoreContext } from "../../components/store";
import { useGetPozlar, useGetIsPaketPozlar } from "../../hooks/useMongo";
import getWbsName from "../../functions/getWbsName";
import { DialogAlert } from "../../components/general/DialogAlert.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import ClearOutlined from "@mui/icons-material/ClearOutlined";

const progressSweep = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export default function P_KesifButcePozlar() {
  const navigate = useNavigate();

  const {
    selectedProje,
    selectedIsPaket,
    selectedButceVersiyon,
    setSelectedButceVersiyon,
    mode_butceEdit,
    setMode_butceEdit,
    selectedMetrajVersiyon,
    setSelectedMetrajVersiyon,
    selectedBirimFiyatVersiyon,
    setSelectedBirimFiyatVersiyon,
    selectedIsPaketVersiyon,
    setSelectedIsPaketVersiyon,
    setSelectedPoz,
    kesifWizardRows,
    setKesifWizardRows,
    kesifWizardIsPaketVersiyonNumber,
    kesifWizardActiveIsPaketId,
    myTema,
  } = useContext(StoreContext);

  const { data, error, isFetching, refetch } = useGetPozlar();
  const { data: isPaketPozlarData } = useGetIsPaketPozlar();
  const pozlar = data?.pozlar?.filter((x) =>
    x.hasDugum && (selectedIsPaket ? (x.secilenDugum ?? 0) > 0 : true)
  );

  const [dialogAlert, setDialogAlert] = useState();
  const [hoveredRow, setHoveredRow] = useState(null);

  const pozBirimleri = selectedProje?.pozBirimleri ?? [];
  const projeParaBirimleri = selectedProje?.paraBirimleri ?? [];

  const paraBirimiLabel = (birimFiyatlar) => {
    const unique = [...new Set((birimFiyatlar ?? []).map((bf) => bf.id))];
    return unique
      .map((id) => projeParaBirimleri.find((x) => x.id === id)?.sembol ?? id)
      .join("+");
  };

  const userInitiatedVersionChangeRef = useRef(false);
  const versionKey = `${selectedMetrajVersiyon?.versiyonNumber ?? ""}-${selectedBirimFiyatVersiyon?.versiyonNumber ?? ""}`;

  // On mount: guard + initialize versions from wizard state
  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }
    if (!selectedIsPaket) { navigate("/butce"); return; }

    if (kesifWizardIsPaketVersiyonNumber != null) {
      const ipv = selectedProje?.isPaketVersiyonlar?.find(
        (v) => v.versiyonNumber === kesifWizardIsPaketVersiyonNumber
      );
      if (ipv) setSelectedIsPaketVersiyon(ipv);
    }

    if (mode_butceEdit && kesifWizardActiveIsPaketId) {
      const row = kesifWizardRows[kesifWizardActiveIsPaketId] || {};
      setSelectedMetrajVersiyon(
        row.metrajVersiyonNumber != null ? { versiyonNumber: row.metrajVersiyonNumber } : null
      );
      setSelectedBirimFiyatVersiyon(
        row.birimFiyatVersiyonNumber != null ? { versiyonNumber: row.birimFiyatVersiyonNumber } : null
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when user changes a version
  useEffect(() => {
    if (userInitiatedVersionChangeRef.current) {
      userInitiatedVersionChangeRef.current = false;
      refetch();
    }
  }, [versionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.",
        detailText: error?.message ?? null,
      });
    }
  }, [error]);

  // Sync server auto-selected versions → wizard rows
  useEffect(() => {
    if (!mode_butceEdit) return;
    if (!data || !kesifWizardActiveIsPaketId) return;
    const row = kesifWizardRows[kesifWizardActiveIsPaketId] || {};

    if (row.metrajVersiyonNumber != null || row.birimFiyatVersiyonNumber != null) {
      const serverMVN = data.selectedMetrajVersiyon?.versiyonNumber ?? null;
      const serverBFVN = data.selectedBirimFiyatVersiyon?.versiyonNumber ?? null;
      const mismatch =
        (row.metrajVersiyonNumber != null && row.metrajVersiyonNumber !== serverMVN) ||
        (row.birimFiyatVersiyonNumber != null && row.birimFiyatVersiyonNumber !== serverBFVN);
      if (row.metrajVersiyonNumber != null) setSelectedMetrajVersiyon({ versiyonNumber: row.metrajVersiyonNumber });
      if (row.birimFiyatVersiyonNumber != null) setSelectedBirimFiyatVersiyon({ versiyonNumber: row.birimFiyatVersiyonNumber });
      if (mismatch) userInitiatedVersionChangeRef.current = true;
      return;
    }

    const resolvedMVN = data.selectedMetrajVersiyon?.versiyonNumber ?? null;
    const resolvedBFVN = data.selectedBirimFiyatVersiyon?.versiyonNumber ?? null;
    if (resolvedMVN === null && resolvedBFVN === null) return;
    setKesifWizardRows((prev) => {
      const r = prev[kesifWizardActiveIsPaketId] || {};
      if (r.metrajVersiyonNumber !== null || r.birimFiyatVersiyonNumber !== null) return prev;
      return {
        ...prev,
        [kesifWizardActiveIsPaketId]: { ...r, metrajVersiyonNumber: resolvedMVN, birimFiyatVersiyonNumber: resolvedBFVN, kesifTutar: null, isCalculating: false },
      };
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickPoz = (onePoz) => {
    setSelectedPoz(onePoz);
    navigate("/butcepozmahaller");
  };

  const handleExitEditMode = () => {
    const satir = selectedButceVersiyon?.butce?.isPaketlerSatirlar?.find(
      (s) => s.isPaketId?.toString() === kesifWizardActiveIsPaketId?.toString()
    );
    if (satir) {
      if (satir.metrajVersiyonNumber != null) {
        userInitiatedVersionChangeRef.current = true;
        setSelectedMetrajVersiyon({ versiyonNumber: satir.metrajVersiyonNumber });
      }
      if (satir.birimFiyatVersiyonNumber != null) {
        setSelectedBirimFiyatVersiyon({ versiyonNumber: satir.birimFiyatVersiyonNumber });
      }
    }
    setMode_butceEdit(false);
  };

  const handleMetrajVChange = (newVN) => {
    userInitiatedVersionChangeRef.current = true;
    setSelectedMetrajVersiyon({ versiyonNumber: newVN });
    if (kesifWizardActiveIsPaketId) {
      setKesifWizardRows((prev) => ({
        ...prev,
        [kesifWizardActiveIsPaketId]: { ...(prev[kesifWizardActiveIsPaketId] || {}), metrajVersiyonNumber: newVN, kesifTutar: null, isCalculating: false },
      }));
    }
  };

  const handleBirimFiyatVChange = (newVN) => {
    userInitiatedVersionChangeRef.current = true;
    setSelectedBirimFiyatVersiyon({ versiyonNumber: newVN });
    if (kesifWizardActiveIsPaketId) {
      setKesifWizardRows((prev) => ({
        ...prev,
        [kesifWizardActiveIsPaketId]: { ...(prev[kesifWizardActiveIsPaketId] || {}), birimFiyatVersiyonNumber: newVN, kesifTutar: null, isCalculating: false },
      }));
    }
  };

  const wbsArray_hasMahal = selectedProje?.wbs?.filter((oneWbs) =>
    pozlar?.find((onePoz) => onePoz._wbsId?.toString() === oneWbs._id?.toString())
  );

  const ikiHane = (value) => {
    if (value == null || value === "" || value === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  // Per-poz version-aware assignment check using useGetIsPaketPozlar
  const assignedPozIds = (() => {
    if (!mode_butceEdit || !selectedIsPaket) return null;
    const set = new Set();
    (isPaketPozlarData?.pozlar ?? []).forEach((p) => {
      if (p.isPaketler?.some((ip) => ip._id?.toString() === selectedIsPaket._id?.toString())) {
        set.add(p._id?.toString());
      }
    });
    return set;
  })();
  const isPozAssigned = (pozId) => assignedPozIds === null || assignedPozIds.has(pozId?.toString());

  const toplamTutar = pozlar?.reduce((sum, onePoz) => {
    if (!isPozAssigned(onePoz._id)) return sum;
    const metrajOnaylanan = onePoz?.metrajOnaylananSecilen ?? onePoz?.metrajVersiyonlar?.metrajOnaylanan ?? null;
    const birimFiyatlar = onePoz?.birimFiyatVersiyonlar?.birimFiyatlar ?? [];
    const birimFiyatToplam = birimFiyatlar.length > 0 ? birimFiyatlar.reduce((s, bf) => s + (Number(bf.fiyat) || 0), 0) : null;
    return sum + (metrajOnaylanan != null && birimFiyatToplam != null ? metrajOnaylanan * birimFiyatToplam : 0);
  }, 0) ?? 0;

  const metrajVersiyonlar = data?.metrajVersiyonlar ?? selectedProje?.metrajVersiyonlar ?? [];
  const birimFiyatVersiyonlar = data?.birimFiyatVersiyonlar ?? selectedProje?.birimFiyatVersiyonlar ?? [];
  const butceVersiyonlar = [...(selectedProje?.butceVersiyonlar ?? [])].sort((a, b) => b.versiyonNumber - a.versiyonNumber);
  const hasButceVersiyonlar = butceVersiyonlar.length > 0;

  // CSS
  const enUstBaslik_css = { display: "grid", alignItems: "center", justifyItems: "center", backgroundColor: myTema.renkler.baslik1, fontWeight: 600, border: "1px solid black", px: "0.7rem" };
  const wbsBaslik_css = { gridColumn: "1 / span 5", display: "grid", alignItems: "center", backgroundColor: myTema.renkler.baslik2, fontWeight: 600, pl: "0.5rem", border: "1px solid black", mt: "1rem", px: "0.7rem" };
  const pozNo_css = { border: "1px solid black", px: "0.7rem", display: "grid", alignItems: "center", justifyItems: "center" };
  const columns = `max-content minmax(20rem, max-content) max-content max-content max-content minmax(5rem, max-content)`;
  const headerIconButton_sx = { width: 40, height: 40 };
  const headerIcon_sx = { fontSize: 24 };

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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate("/butce")} sx={{ ...headerIconButton_sx, mr: "0.25rem", ml: "-0.5rem" }}>
                <ReplyIcon sx={headerIcon_sx} />
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                Bütçe &rsaquo; {selectedIsPaket?.name ?? "Pozlar"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", gap: "0.25rem" }}>
              {!mode_butceEdit && hasButceVersiyonlar && (
                <Select size="small" displayEmpty value={selectedButceVersiyon?.versiyonNumber ?? ""} onChange={(e) => { const v = butceVersiyonlar.find((x) => x.versiyonNumber === e.target.value); setSelectedButceVersiyon(v ?? null); }} sx={{ fontSize: "0.75rem" }} MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}>
                  {butceVersiyonlar.map((v) => (
                    <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>BU{v.versiyonNumber}</MenuItem>
                  ))}
                </Select>
              )}
              {mode_butceEdit && metrajVersiyonlar.length > 0 && (
                <Select size="small" displayEmpty value={selectedMetrajVersiyon?.versiyonNumber ?? ""} onChange={(e) => handleMetrajVChange(e.target.value)} sx={{ fontSize: "0.75rem" }} renderValue={(v) => v !== "" ? `M${v}` : "Metraj V."} MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}>
                  {[...metrajVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                    <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>M{v.versiyonNumber}</MenuItem>
                  ))}
                </Select>
              )}
              {mode_butceEdit && birimFiyatVersiyonlar.length > 0 && (
                <Select size="small" displayEmpty value={selectedBirimFiyatVersiyon?.versiyonNumber ?? ""} onChange={(e) => handleBirimFiyatVChange(e.target.value)} sx={{ fontSize: "0.75rem" }} renderValue={(v) => v !== "" ? `BF${v}` : "BF V."} MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}>
                  {[...birimFiyatVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                    <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>BF{v.versiyonNumber}</MenuItem>
                  ))}
                </Select>
              )}
              {mode_butceEdit ? (
                <IconButton onClick={handleExitEditMode} sx={{ width: 40, height: 40 }}>
                  <ClearOutlined sx={{ fontSize: 24, color: "red" }} />
                </IconButton>
              ) : (
                <IconButton onClick={() => setMode_butceEdit(true)} sx={{ width: 40, height: 40 }}>
                  <EditIcon sx={{ fontSize: 24 }} />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>
      <Box sx={isFetching ? {
        height: 4,
        background: "linear-gradient(90deg, transparent 25%, #e53935 50%, transparent 75%)",
        backgroundSize: "200% 100%",
        animation: `${progressSweep} 1.5s infinite linear`,
      } : {
        height: 4,
        backgroundColor: mode_butceEdit ? "#e53935" : "transparent",
        transition: "background-color 0.3s ease",
      }} />
      <Box>

      {!isFetching && !pozlar?.length && (
        <Stack sx={{ width: "100%", p: "1rem" }} spacing={2}>
          <Alert severity="info">Bu iş paketinde görüntülenecek poz bulunmuyor.</Alert>
        </Stack>
      )}

      {wbsArray_hasMahal && pozlar?.length > 0 && (
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>
          <>
            <Box sx={enUstBaslik_css}>Poz No</Box>
            <Box sx={enUstBaslik_css}>Poz İsmi</Box>
            <Box sx={enUstBaslik_css}>Birim</Box>
            <Box sx={enUstBaslik_css}>Metraj</Box>
            <Box sx={enUstBaslik_css}>B.Fiyat</Box>
            <Box sx={enUstBaslik_css}>Tutar</Box>
          </>

          {/* Toplam */}
          <Box sx={{ gridColumn: "1 / span 5", border: "1px solid black", display: "grid", alignItems: "center", justifyItems: "end", px: "0.7rem", py: "0.1rem", fontWeight: 700, backgroundColor: myTema.renkler.baslik1 }} />
          <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", justifyItems: "end", px: "0.7rem", py: "0.1rem", fontWeight: 700, backgroundColor: myTema.renkler.baslik1 }}>
            {(() => {
              const allBf = pozlar?.flatMap((p) => p?.birimFiyatVersiyonlar?.birimFiyatlar ?? []) ?? [];
              const label = paraBirimiLabel(allBf);
              return toplamTutar ? `${ikiHane(toplamTutar)} ${label}` : ikiHane(null);
            })()}
          </Box>

          {wbsArray_hasMahal?.filter((x) => x.openForPoz).map((oneWbs, index) => {
            const wbsPozlar = pozlar?.filter((x) => x._wbsId?.toString() === oneWbs._id?.toString() && isPozAssigned(x._id));
            if (!wbsPozlar?.length) return null;

            const wbsToplam = wbsPozlar.reduce((sum, onePoz) => {
              if (!isPozAssigned(onePoz._id)) return sum;
              const m = onePoz?.metrajOnaylananSecilen ?? onePoz?.metrajVersiyonlar?.metrajOnaylanan ?? null;
              const bflar = onePoz?.birimFiyatVersiyonlar?.birimFiyatlar ?? [];
              const bf = bflar.length > 0 ? bflar.reduce((s, x) => s + (Number(x.fiyat) || 0), 0) : null;
              return sum + (m != null && bf != null ? m * bf : 0);
            }, 0);

            return (
              <React.Fragment key={index}>
                <Box sx={wbsBaslik_css}>{getWbsName({ wbsArray: wbsArray_hasMahal, oneWbs }).name}</Box>
                <Box sx={{ display: "grid", alignItems: "center", justifyItems: "end", backgroundColor: myTema.renkler.baslik2, fontWeight: 600, border: "1px solid black", mt: "1rem", px: "0.7rem" }}>
                  {(() => {
                    const allBf = wbsPozlar.flatMap((p) => p?.birimFiyatVersiyonlar?.birimFiyatlar ?? []);
                    const label = paraBirimiLabel(allBf);
                    return wbsToplam ? `${ikiHane(wbsToplam)} ${label}` : ikiHane(null);
                  })()}
                </Box>

                {wbsPozlar.map((onePoz, pIndex) => {
                  const metrajOnaylanan = onePoz?.metrajOnaylananSecilen ?? onePoz?.metrajVersiyonlar?.metrajOnaylanan ?? null;
                  const birimFiyatlar = onePoz?.birimFiyatVersiyonlar?.birimFiyatlar ?? [];
                  const birimFiyatToplam = birimFiyatlar.length > 0 ? birimFiyatlar.reduce((sum, bf) => sum + (Number(bf.fiyat) || 0), 0) : null;
                  const tutar = isPozAssigned(onePoz._id) && metrajOnaylanan != null && birimFiyatToplam != null ? metrajOnaylanan * birimFiyatToplam : null;
                  const birimAdi = pozBirimleri.find((x) => x.id === onePoz.pozBirimId)?.name ?? "";
                  const isHovered = hoveredRow === onePoz._id.toString();
                  const hoverSx = isHovered ? { textShadow: "0 0 0.7px black, 0 0 0.7px black" } : {};
                  const rowHandlers = {
                    onMouseEnter: () => setHoveredRow(onePoz._id.toString()),
                    onMouseLeave: () => setHoveredRow(null),
                  };

                  return (
                    <React.Fragment key={pIndex}>
                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...hoverSx }}>{onePoz.pozNo}</Box>
                      <Box
                        {...rowHandlers}
                        sx={{ ...pozNo_css, ...hoverSx, justifyItems: "start", pl: "0.5rem", cursor: "pointer" }}
                        onClick={() => handleClickPoz(onePoz)}
                      >
                        {onePoz.pozName}
                      </Box>
                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...hoverSx }}>{birimAdi}</Box>
                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...hoverSx, justifyItems: "end" }}>{ikiHane(metrajOnaylanan)}</Box>
                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...hoverSx, justifyItems: "end" }}>{ikiHane(birimFiyatToplam)}</Box>
                      <Box {...rowHandlers} sx={{ ...pozNo_css, ...hoverSx, justifyItems: "end", fontWeight: 700 }}>
                        {tutar != null ? `${ikiHane(tutar)} ${paraBirimiLabel(birimFiyatlar)}` : ikiHane(null)}
                      </Box>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Box>
      )}
      </Box>
    </Box>
  );
}
