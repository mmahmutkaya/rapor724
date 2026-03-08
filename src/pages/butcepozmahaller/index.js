import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import { keyframes } from "@emotion/react";

import { StoreContext } from '../../components/store.js';
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useGetDugumler_byPoz, useGetMahaller, useGetPozlar } from '../../hooks/useMongo.js';

import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import ClearOutlined from '@mui/icons-material/ClearOutlined';

const progressSweep = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export default function P_KesifButcePozMahaller() {
  const navigate = useNavigate();

  const {
    selectedProje,
    selectedPoz,
    selectedIsPaket,
    selectedIsPaketVersiyon,
    mode_butceEdit,
    setMode_butceEdit,
    selectedButceVersiyon,
    setSelectedButceVersiyon,
    selectedMetrajVersiyon,
    setSelectedMetrajVersiyon,
    selectedBirimFiyatVersiyon,
    setSelectedBirimFiyatVersiyon,
    myTema,
  } = useContext(StoreContext);

  const [dialogAlert, setDialogAlert] = useState();
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState();
  const [mahaller_state, setMahaller_state] = useState();

  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller();
  const { data: dataDugumler_byPoz, error: error2, isFetching: isFetching2, refetch: refetchDugumler } = useGetDugumler_byPoz();
  const { data: dataPozlar, refetch: refetchPozlar } = useGetPozlar();

  const userInitiatedVersionChangeRef = useRef(false);
  const versionKey = `${selectedMetrajVersiyon?.versiyonNumber ?? ""}-${selectedBirimFiyatVersiyon?.versiyonNumber ?? ""}`;

  useEffect(() => {
    if (userInitiatedVersionChangeRef.current) {
      userInitiatedVersionChangeRef.current = false;
      refetchDugumler();
      refetchPozlar();
    }
  }, [versionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guards
  useEffect(() => {
    if (!selectedProje || !selectedPoz) {
      navigate('/butcepozlar');
    }
  }, [selectedProje, selectedPoz, navigate]);

  // Data initialization
  useEffect(() => {
    if (!selectedProje || !selectedPoz) return;
    setMahaller_state(_.cloneDeep(dataMahaller?.mahaller));
    setDugumler_byPoz_state(_.cloneDeep(dataDugumler_byPoz?.dugumler_byPoz));
  }, [dataMahaller, dataDugumler_byPoz, selectedProje, selectedPoz]);

  // Error handling
  useEffect(() => {
    if (error1 || error2) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz.",
        detailText: (error1 ?? error2)?.message ?? null,
      });
    }
  }, [error1, error2]);

  // LBS structure from project, sorted by code
  const butceVersiyonlar = [...(selectedProje?.butceVersiyonlar ?? [])].sort((a, b) => b.versiyonNumber - a.versiyonNumber);
  const hasButceVersiyonlar = butceVersiyonlar.length > 0;
  const metrajVersiyonlar = [...(selectedProje?.metrajVersiyonlar ?? [])];
  const birimFiyatVersiyonlar = [...(selectedProje?.birimFiyatVersiyonlar ?? [])];

  const handleExitEditMode = () => {
    const satir = selectedButceVersiyon?.butce?.isPaketlerSatirlar?.find(
      (s) => s.isPaketId?.toString() === selectedIsPaket?._id?.toString()
    );
    if (satir) {
      if (satir.metrajVersiyonNumber != null) {
        setSelectedMetrajVersiyon({ versiyonNumber: satir.metrajVersiyonNumber });
      }
      if (satir.birimFiyatVersiyonNumber != null) {
        setSelectedBirimFiyatVersiyon({ versiyonNumber: satir.birimFiyatVersiyonNumber });
      }
    }
    setMode_butceEdit(false);
  };

  const openLbsArray = (selectedProje?.lbs ?? [])
    .filter((oneLbs) => oneLbs.openForMahal)
    .sort((a, b) => {
      const n1 = a.code.split(".");
      const n2 = b.code.split(".");
      for (let i = 0; i < n1.length; i++) {
        if (n2[i]) { if (n1[i] !== n2[i]) return n1[i] - n2[i]; }
        else return 1;
      }
      return -1;
    });

  const getLbsName = (oneLbs) => {
    let name;
    oneLbs.code.split(".").forEach((codePart, index) => {
      const lbsItem = selectedProje?.lbs?.find((x) => {
        const parts = x.code.split(".");
        return parts[index] === codePart && parts.length === index + 1;
      });
      if (lbsItem) name = lbsItem.name;
    });
    return { name: name ?? oneLbs.name ?? oneLbs.code };
  };

  // Check if a dugum has the selectedIsPaket assigned (respects edit vs view mode)
  const isDugumAssigned = (dugum) => {
    if (!selectedIsPaket) return false;
    const selectedId = selectedIsPaket._id?.toString();
    if (mode_butceEdit) {
      return !!(dugum.isPaketler?.find((p) => p._id?.toString() === selectedId));
    }
    const versioned = dugum.isPaketVersiyonlar
      ?.find((v) => v.versiyonNumber === selectedIsPaketVersiyon?.versiyonNumber)
      ?.isPaketler?.find((p) => p._id?.toString() === selectedId);
    return !!(versioned ?? dugum.isPaketler?.find((p) => p._id?.toString() === selectedId));
  };

  // birimFiyat from selectedPoz — prefer fresh dataPozlar after version change
  const projeParaBirimleri = selectedProje?.paraBirimleri ?? [];
  const currentPozData = dataPozlar?.pozlar?.find((p) => p._id?.toString() === selectedPoz?._id?.toString());
  const birimFiyatlar = (currentPozData ?? selectedPoz)?.birimFiyatVersiyonlar?.birimFiyatlar ?? [];
  const birimFiyatToplam = birimFiyatlar.length > 0
    ? birimFiyatlar.reduce((s, bf) => s + (Number(bf.fiyat) || 0), 0)
    : null;
  const paraBirimiLabel = (() => {
    const unique = [...new Set(birimFiyatlar.map((bf) => bf.id))];
    return unique.map((id) => projeParaBirimleri.find((x) => x.id === id)?.sembol ?? id).join("+");
  })();

  const ikiHane = (value) => {
    if (value == null || value === "" || value === 0) return "—";
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  // Total assigned keşif across all dugumler
  const totalTutar = (dugumler_byPoz_state ?? []).reduce((sum, dugum) => {
    if (!isDugumAssigned(dugum)) return sum;
    const m = dugum.metrajOnaylanan ?? null;
    return sum + (m != null && birimFiyatToplam != null ? m * birimFiyatToplam : 0);
  }, 0);

  // CSS
  const css_enUstBaslik = {
    display: "grid", fontWeight: "600", border: "1px solid black",
    py: "0.3rem", px: "0.5rem", justifyContent: "start", alignItems: "center",
    backgroundColor: "#415a77", color: "#e0e1dd",
  };
  const css_LbsBaslik = {
    border: "1px solid black", mt: "0.5rem", px: "0.5rem",
    display: "grid", justifyContent: "start", alignItems: "center",
    backgroundColor: myTema.renkler.metrajOnaylananBaslik, minHeight: "1.8rem",
  };
  const css_mahal = {
    border: "1px solid black", px: "0.5rem",
    display: "grid", justifyContent: "start", alignItems: "center", minHeight: "1.8rem",
  };
  const css_sayi = {
    border: "1px solid black", px: "0.5rem",
    display: "grid", justifyContent: "end", alignItems: "center", minHeight: "1.8rem",
  };

  const gridCols = "max-content minmax(min-content, 15rem) max-content max-content max-content";
  const isFetching = isFetching1 || isFetching2;

  if (!selectedProje || !selectedPoz) return null;

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
              <IconButton onClick={() => navigate("/butcepozlar")} sx={{ width: 40, height: 40, mr: "0.25rem", ml: "-0.5rem" }}>
                <ReplyIcon sx={{ fontSize: 24 }} />
              </IconButton>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "32rem" }}
              >
                Bütçe &rsaquo; {selectedIsPaket?.name ?? "İş Paketi"} &rsaquo;{" "}
                {selectedPoz?.pozNo}{selectedPoz?.pozName ? ` · ${selectedPoz.pozName}` : ""}
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
                <Select size="small" displayEmpty value={selectedMetrajVersiyon?.versiyonNumber ?? ""} onChange={(e) => { userInitiatedVersionChangeRef.current = true; setSelectedMetrajVersiyon(e.target.value !== "" ? { versiyonNumber: e.target.value } : null); }} sx={{ fontSize: "0.75rem" }} renderValue={(v) => v !== "" ? `M${v}` : "Metraj V."} MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}>
                  {[...metrajVersiyonlar].sort((a, b) => b.versiyonNumber - a.versiyonNumber).map((v) => (
                    <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>M{v.versiyonNumber}</MenuItem>
                  ))}
                </Select>
              )}
              {mode_butceEdit && birimFiyatVersiyonlar.length > 0 && (
                <Select size="small" displayEmpty value={selectedBirimFiyatVersiyon?.versiyonNumber ?? ""} onChange={(e) => { userInitiatedVersionChangeRef.current = true; setSelectedBirimFiyatVersiyon(e.target.value !== "" ? { versiyonNumber: e.target.value } : null); }} sx={{ fontSize: "0.75rem" }} renderValue={(v) => v !== "" ? `BF${v}` : "BF V."} MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}>
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

      {!isFetching && openLbsArray?.length > 0 && (
        <Box sx={{ p: "1rem", display: "grid", gridTemplateColumns: gridCols }}>
          {/* Başlık satırı */}
          <Box sx={{ ...css_enUstBaslik, borderLeft: "1px solid black" }}>
            {selectedPoz?.pozNo}
          </Box>
          <Box sx={css_enUstBaslik}>MAHAL</Box>
          <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>METRAJ</Box>
          <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>B.FİYAT</Box>
          <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>K.TUTARI</Box>

          {/* Toplam satırı */}
          <Box sx={{ gridColumn: "1 / span 4", border: "1px solid black", display: "grid", alignItems: "center", justifyItems: "end", px: "0.7rem", py: "0.1rem", fontWeight: 700, backgroundColor: "#415a77" }} />
          <Box sx={{ border: "1px solid black", display: "grid", alignItems: "center", justifyItems: "end", px: "0.7rem", py: "0.1rem", fontWeight: 700, backgroundColor: "#415a77", color: "#e0e1dd" }}>
            {totalTutar ? `${ikiHane(totalTutar)} ${paraBirimiLabel}` : ikiHane(null)}
          </Box>

          {/* LBS grupları */}
          {openLbsArray.map((oneLbs, lbsIndex) => {
            const mahaller_byLbs = mahaller_state?.filter(
              (x) => x._lbsId?.toString() === oneLbs._id?.toString()
            );
            if (!mahaller_byLbs?.length) return null;

            // Only show LBS if at least one assigned dugum exists
            const hasAssignedDugum = mahaller_byLbs.some((m) => {
              const dugum = dugumler_byPoz_state?.find((d) => d._mahalId?.toString() === m._id?.toString());
              return dugum && isDugumAssigned(dugum);
            });
            if (!hasAssignedDugum) return null;

            // LBS subtotal
            const lbsTutar = mahaller_byLbs.reduce((sum, m) => {
              const dugum = dugumler_byPoz_state?.find((d) => d._mahalId?.toString() === m._id?.toString());
              if (!dugum || !isDugumAssigned(dugum)) return sum;
              const metraj = dugum.metrajOnaylanan ?? null;
              return sum + (metraj != null && birimFiyatToplam != null ? metraj * birimFiyatToplam : 0);
            }, 0);

            return (
              <React.Fragment key={lbsIndex}>
                {/* LBS Başlığı */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black", gridColumn: "1 / span 4" }}>
                  {getLbsName(oneLbs).name}
                </Box>
                <Box sx={{ ...css_LbsBaslik, justifyContent: "end", fontWeight: 600 }}>
                  {lbsTutar ? `${ikiHane(lbsTutar)} ${paraBirimiLabel}` : ikiHane(null)}
                </Box>

                {/* Mahal satırları */}
                {mahaller_byLbs.map((oneMahal, mahalIndex) => {
                  const dugum = dugumler_byPoz_state?.find(
                    (d) => d._mahalId?.toString() === oneMahal._id?.toString()
                  );
                  if (!dugum || !isDugumAssigned(dugum)) return null;

                  const metraj = dugum.metrajOnaylanan ?? null;
                  const tutar = metraj != null && birimFiyatToplam != null
                    ? metraj * birimFiyatToplam
                    : null;

                  return (
                    <React.Fragment key={mahalIndex}>
                      <Box sx={{ ...css_mahal, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>
                      <Box sx={css_mahal}>{oneMahal.mahalName}</Box>
                      <Box sx={css_sayi}>{ikiHane(metraj)}</Box>
                      <Box sx={css_sayi}>{ikiHane(birimFiyatToplam)}</Box>
                      <Box sx={{ ...css_sayi, fontWeight: 700 }}>
                        {tutar != null ? `${ikiHane(tutar)} ${paraBirimiLabel}` : ikiHane(null)}
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
