import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { StoreContext } from "../../components/store";
import { useGetPozlar } from "../../hooks/useMongo";
import getWbsName from "../../functions/getWbsName";
import { DialogAlert } from "../../components/general/DialogAlert.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import ReplyIcon from "@mui/icons-material/Reply";

export default function P_KesifButcePozlar() {
  const navigate = useNavigate();

  const {
    selectedProje,
    selectedIsPaket,
    selectedMetrajVersiyon,
    setSelectedMetrajVersiyon,
    selectedBirimFiyatVersiyon,
    setSelectedBirimFiyatVersiyon,
    selectedIsPaketVersiyon,
    setSelectedIsPaketVersiyon,
    kesifWizardRows,
    setKesifWizardRows,
    kesifWizardIsPaketVersiyonNumber,
    kesifWizardActiveIsPaketId,
    myTema,
  } = useContext(StoreContext);

  const { data, error, isFetching, refetch } = useGetPozlar();
  const pozlar = data?.pozlar?.filter((x) =>
    x.hasDugum && (selectedIsPaket ? (x.secilenDugum ?? 0) > 0 : true)
  );

  const [dialogAlert, setDialogAlert] = useState();

  const pozBirimleri = selectedProje?.pozBirimleri ?? [];

  // Track last version key for detecting changes
  const prevVersionKeyRef = useRef(null);
  const versionKey = `${selectedMetrajVersiyon?.versiyonNumber ?? ""}-${selectedBirimFiyatVersiyon?.versiyonNumber ?? ""}`;

  // On mount: initialize version context from wizard state
  useEffect(() => {
    if (!selectedProje) { navigate("/projeler"); return; }
    if (!selectedIsPaket) { navigate("/ispaketlerbutce"); return; }

    // Set IP version from wizard
    if (kesifWizardIsPaketVersiyonNumber != null) {
      const ipv = selectedProje?.isPaketVersiyonlar?.find(
        (v) => v.versiyonNumber === kesifWizardIsPaketVersiyonNumber
      );
      if (ipv) setSelectedIsPaketVersiyon(ipv);
    }

    // Set M and BF versions from wizard state
    if (kesifWizardActiveIsPaketId) {
      const row = kesifWizardRows[kesifWizardActiveIsPaketId] || {};
      if (row.metrajVersiyonNumber != null) {
        setSelectedMetrajVersiyon({ versiyonNumber: row.metrajVersiyonNumber });
      }
      if (row.birimFiyatVersiyonNumber != null) {
        setSelectedBirimFiyatVersiyon({ versiyonNumber: row.birimFiyatVersiyonNumber });
      }
    }
  }, []);

  // Trigger refetch when version changes (not on initial mount)
  useEffect(() => {
    if (prevVersionKeyRef.current !== null && prevVersionKeyRef.current !== versionKey) {
      refetch();
    }
    prevVersionKeyRef.current = versionKey;
  }, [versionKey]);

  useEffect(() => {
    if (error) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, Rapor7/24 ile irtibata geçiniz..",
        detailText: error?.message ?? null,
      });
    }
  }, [error]);

  const handleMetrajVChange = (newVN) => {
    setSelectedMetrajVersiyon({ versiyonNumber: newVN });
    if (kesifWizardActiveIsPaketId) {
      setKesifWizardRows((prev) => ({
        ...prev,
        [kesifWizardActiveIsPaketId]: {
          ...(prev[kesifWizardActiveIsPaketId] || {}),
          metrajVersiyonNumber: newVN,
          kesifTutar: null,
          isCalculating: false,
        },
      }));
    }
  };

  const handleBirimFiyatVChange = (newVN) => {
    setSelectedBirimFiyatVersiyon({ versiyonNumber: newVN });
    if (kesifWizardActiveIsPaketId) {
      setKesifWizardRows((prev) => ({
        ...prev,
        [kesifWizardActiveIsPaketId]: {
          ...(prev[kesifWizardActiveIsPaketId] || {}),
          birimFiyatVersiyonNumber: newVN,
          kesifTutar: null,
          isCalculating: false,
        },
      }));
    }
  };

  const wbsArray_hasMahal = selectedProje?.wbs?.filter((oneWbs) =>
    pozlar?.find((onePoz) => onePoz._wbsId?.toString() === oneWbs._id?.toString())
  );

  const ikiHane = (value) => {
    if (value == null || value === "") return "—";
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const metrajVersiyonlar = data?.metrajVersiyonlar ?? selectedProje?.metrajVersiyonlar ?? [];
  const birimFiyatVersiyonlar = data?.birimFiyatVersiyonlar ?? selectedProje?.birimFiyatVersiyonlar ?? [];

  // CSS
  const enUstBaslik_css = {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    backgroundColor: myTema.renkler.baslik1,
    fontWeight: 600,
    border: "1px solid black",
    px: "0.7rem",
  };

  const wbsBaslik_css = {
    gridColumn: "1 / span 6",
    display: "grid",
    alignItems: "center",
    backgroundColor: myTema.renkler.baslik2,
    fontWeight: 600,
    pl: "0.5rem",
    border: "1px solid black",
    mt: "1rem",
    px: "0.7rem",
  };

  const pozNo_css = {
    border: "1px solid black",
    px: "0.7rem",
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
  };

  const columns = `max-content minmax(min-content, 30rem) max-content max-content max-content max-content`;

  const headerIconButton_sx = { width: 40, height: 40 };
  const headerIcon_sx = { fontSize: 24 };

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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => navigate("/ispaketlerbutce")}
                sx={{ ...headerIconButton_sx, mr: "0.25rem", ml: "-0.5rem" }}
              >
                <ReplyIcon sx={headerIcon_sx} />
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                {selectedIsPaket?.name ?? "Pozlar"}
              </Typography>
            </Box>
          </Grid>

          {/* Sağ - Versiyon Seçiciler */}
          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center", gap: "0.25rem" }}>
              {metrajVersiyonlar.length > 0 && (
                <Select
                  size="small"
                  displayEmpty
                  value={selectedMetrajVersiyon?.versiyonNumber ?? ""}
                  onChange={(e) => handleMetrajVChange(e.target.value)}
                  sx={{ fontSize: "0.75rem" }}
                  renderValue={(v) => v !== "" ? `M${v}` : "Metraj V."}
                  MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}
                >
                  {[...metrajVersiyonlar]
                    .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                    .map((v) => (
                      <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>
                        M{v.versiyonNumber}
                      </MenuItem>
                    ))}
                </Select>
              )}
              {birimFiyatVersiyonlar.length > 0 && (
                <Select
                  size="small"
                  displayEmpty
                  value={selectedBirimFiyatVersiyon?.versiyonNumber ?? ""}
                  onChange={(e) => handleBirimFiyatVChange(e.target.value)}
                  sx={{ fontSize: "0.75rem" }}
                  renderValue={(v) => v !== "" ? `BF${v}` : "BF V."}
                  MenuProps={{ PaperProps: { style: { maxHeight: "15rem" } } }}
                >
                  {[...birimFiyatVersiyonlar]
                    .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                    .map((v) => (
                      <MenuItem key={v.versiyonNumber} value={v.versiyonNumber} sx={{ fontSize: "0.75rem" }}>
                        BF{v.versiyonNumber}
                      </MenuItem>
                    ))}
                </Select>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {isFetching && (
        <Box sx={{ width: "100%", px: "1rem", color: "gray" }}>
          <LinearProgress color="inherit" />
        </Box>
      )}

      {!isFetching && !pozlar?.length && (
        <Stack sx={{ width: "100%", p: "1rem" }} spacing={2}>
          <Alert severity="info">Bu iş paketinde görüntülenecek poz bulunmuyor.</Alert>
        </Stack>
      )}

      {wbsArray_hasMahal && pozlar?.length > 0 && (
        <Box sx={{ m: "1rem", display: "grid", gridTemplateColumns: columns }}>

          {/* Başlık */}
          <>
            <Box sx={{ ...enUstBaslik_css }}>Poz No</Box>
            <Box sx={{ ...enUstBaslik_css }}>Poz İsmi</Box>
            <Box sx={{ ...enUstBaslik_css }}>Birim</Box>
            <Box sx={{ ...enUstBaslik_css }}>Metraj</Box>
            <Box sx={{ ...enUstBaslik_css }}>Birim Fiyat</Box>
            <Box sx={{ ...enUstBaslik_css }}>Tutar</Box>
          </>

          {/* WBS grupları */}
          {wbsArray_hasMahal
            ?.filter((x) => x.openForPoz)
            .map((oneWbs, index) => {
              const wbsPozlar = pozlar?.filter(
                (x) => x._wbsId?.toString() === oneWbs._id?.toString()
              );
              if (!wbsPozlar?.length) return null;

              return (
                <React.Fragment key={index}>
                  {/* WBS Başlığı */}
                  <Box sx={{ ...wbsBaslik_css }}>
                    {getWbsName({ wbsArray: wbsArray_hasMahal, oneWbs }).name}
                  </Box>

                  {/* Pozlar */}
                  {wbsPozlar.map((onePoz, pIndex) => {
                    const metrajOnaylanan = onePoz?.metrajOnaylananSecilen ?? onePoz?.metrajVersiyonlar?.metrajOnaylanan ?? null;
                    const birimFiyatlar = onePoz?.birimFiyatVersiyonlar?.birimFiyatlar ?? [];
                    const birimFiyatToplam =
                      birimFiyatlar.length > 0
                        ? birimFiyatlar.reduce(
                            (sum, bf) => sum + (Number(bf.fiyat) || 0),
                            0
                          )
                        : null;
                    const tutar =
                      metrajOnaylanan != null && birimFiyatToplam != null
                        ? metrajOnaylanan * birimFiyatToplam
                        : null;

                    const birimAdi =
                      pozBirimleri.find((x) => x.id === onePoz.pozBirimId)?.name ?? "";

                    return (
                      <React.Fragment key={pIndex}>
                        <Box sx={{ ...pozNo_css }}>{onePoz.pozNo}</Box>
                        <Box sx={{ ...pozNo_css, justifyItems: "start", pl: "0.5rem" }}>
                          {onePoz.pozName}
                        </Box>
                        <Box sx={{ ...pozNo_css }}>{birimAdi}</Box>
                        <Box sx={{ ...pozNo_css, justifyItems: "end" }}>
                          {ikiHane(metrajOnaylanan)}
                        </Box>
                        <Box sx={{ ...pozNo_css, justifyItems: "end" }}>
                          {ikiHane(birimFiyatToplam)}
                        </Box>
                        <Box sx={{ ...pozNo_css, justifyItems: "end", fontWeight: 700 }}>
                          {ikiHane(tutar)}
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
  );
}
