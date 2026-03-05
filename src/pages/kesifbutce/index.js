import React, { useEffect, useContext } from "react";
import { StoreContext } from "../../components/store.js";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function P_KesifButce() {
  const { selectedProje } = useContext(StoreContext);
  const {
    setKesifWizardRows,
    setKesifWizardName,
    setKesifWizardAciklama,
    setKesifWizardIsPaketVersiyonNumber,
    setKesifWizardActiveIsPaketId,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProje) navigate("/projeler");
  }, []);

  const handlePlusClick = () => {
    setKesifWizardRows({});
    setKesifWizardName("");
    setKesifWizardAciklama("");
    setKesifWizardActiveIsPaketId(null);
    const maxV =
      selectedProje?.isPaketVersiyonlar?.reduce(
        (acc, cur) => Math.max(acc, cur.versiyonNumber),
        0
      ) ?? null;
    setKesifWizardIsPaketVersiyonNumber(maxV > 0 ? maxV : null);
    navigate("/ispaketlerbutce");
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

  const css_satir = {
    display: "grid",
    px: "0.5rem",
    border: "1px solid black",
    alignItems: "center",
    minHeight: "2.2rem",
  };

  const css_baslik = {
    ...css_satir,
    mt: "0.1rem",
    backgroundColor: "lightgray",
    fontWeight: 700,
  };

  const hasVersions = (selectedProje?.butceVersiyonlar?.length ?? 0) > 0;

  return (
    <Box>
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
          <Grid item xs>
            <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              Keşif / Bütçe
            </Typography>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: "grid", gridAutoFlow: "column", alignItems: "center" }}>
              <IconButton onClick={handlePlusClick} sx={headerIconButton_sx}>
                <AddCircleOutlineIcon sx={headerIcon_sx} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {/* İÇERİK */}
      <Box sx={{ p: "1rem" }}>
        {!hasVersions && (
          <Stack spacing={2}>
            <Alert severity="info">
              Henüz bütçe versiyonu oluşturulmamış. + tuşuna basarak oluşturabilirsiniz.
            </Alert>
          </Stack>
        )}

        {hasVersions && (
          <Box
            sx={{
              mt: "0.5rem",
              display: "grid",
              gridTemplateColumns:
                "max-content max-content max-content max-content max-content max-content max-content",
            }}
          >
            <Box sx={css_baslik}>Versiyon</Box>
            <Box sx={css_baslik}>Bütçe Adı</Box>
            <Box sx={css_baslik}>Açıklama</Box>
            <Box sx={{ ...css_baslik, ml: "0.1rem", textAlign: "center" }}>İş Paketi V.</Box>
            <Box sx={{ ...css_baslik, ml: "0.1rem", textAlign: "center" }}>Metraj V.</Box>
            <Box sx={{ ...css_baslik, ml: "0.1rem", textAlign: "center" }}>Birim Fiyat V.</Box>
            <Box sx={{ ...css_baslik, ml: "0.1rem", textAlign: "right" }}>Tutar</Box>

            {[...(selectedProje?.butceVersiyonlar ?? [])]
              .sort((a, b) => b.versiyonNumber - a.versiyonNumber)
              .map((v) => (
                <React.Fragment key={v.versiyonNumber}>
                  <Box sx={css_satir}>
                    <Box sx={{ fontWeight: 700 }}>B{v.versiyonNumber}</Box>
                    {v.aciklama && (
                      <Box sx={{ fontSize: "0.75rem", color: "gray" }}>{v.aciklama}</Box>
                    )}
                    {v.createdAt && (
                      <Box sx={{ fontSize: "0.75rem", color: "gray" }}>
                        {new Date(v.createdAt).toLocaleDateString("tr-TR")}
                      </Box>
                    )}
                  </Box>
                  <Box sx={css_satir}>{v.butce?.name ?? "—"}</Box>
                  <Box sx={css_satir}>{v.butce?.aciklama ?? "—"}</Box>
                  <Box sx={{ ...css_satir, ml: "0.1rem", justifyContent: "center" }}>
                    {v.butce?.isPaketVersiyonNumber != null
                      ? `İP${v.butce.isPaketVersiyonNumber}`
                      : "—"}
                  </Box>
                  <Box sx={{ ...css_satir, ml: "0.1rem", justifyContent: "center" }}>
                    {v.butce?.metrajVersiyonNumber != null
                      ? `M${v.butce.metrajVersiyonNumber}`
                      : "—"}
                  </Box>
                  <Box sx={{ ...css_satir, ml: "0.1rem", justifyContent: "center" }}>
                    {v.butce?.birimFiyatVersiyonNumber != null
                      ? `BF${v.butce.birimFiyatVersiyonNumber}`
                      : "—"}
                  </Box>
                  <Box
                    sx={{
                      ...css_satir,
                      ml: "0.1rem",
                      justifyContent: "right",
                      fontWeight: 700,
                    }}
                  >
                    {formatTutar(v.butce?.totalKesifTutar ?? v.butce?.tutar)}
                  </Box>
                </React.Fragment>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
