import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../components/store.js";
import { useNavigate, useLocation } from "react-router-dom";
import { DialogAlert } from "../../components/general/DialogAlert.js";

import { useGetIsPaketPozlar } from "../../hooks/useMongo.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import InfoIcon from "@mui/icons-material/Info";

export default function P_KesifButce() {
  const { selectedProje } = useContext(StoreContext);
  const { setSelectedIsPaket } = useContext(StoreContext);

  const [dialogAlert, setDialogAlert] = useState();
  const [isPaketler, setIsPaketler] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const { data: dataIsPaketPozlar } = useGetIsPaketPozlar();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.keepIsPaket) {
      setSelectedIsPaket(null);
    }
    if (!selectedProje) navigate("/projeler");
  }, []);

  useEffect(() => {
    if (selectedProje) {
      setIsPaketler(selectedProje?.isPaketler);
    }
  }, [selectedProje]);

  const goto_kesifButcePozlar = (onePaket) => {
    setSelectedIsPaket(onePaket);
    navigate("/kesifbutcepozlar");
  };

  const css_IsPaketlerBaslik = {
    display: "grid",
    mt: "0.1rem",
    px: "0.5rem",
    backgroundColor: "lightgray",
    fontWeight: 700,
    textWrap: "nowrap",
    border: "1px solid black",
  };

  const css_IsPaketler = {
    display: "grid",
    px: "0.5rem",
    border: "1px solid black",
    alignItems: "center",
  };

  const columns =
    "max-content minmax(min-content, 20rem) max-content max-content";

  const renderIsPaketRows = (paketler) =>
    paketler.map((onePaket, index) => {
      const pozSayisi =
        dataIsPaketPozlar?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";
      const isHovered = hoveredRow === onePaket._id.toString();
      const rowBaseSx = { transition: "text-shadow 0.2s ease", cursor: "pointer" };
      const hoverSx = isHovered
        ? { textShadow: "0 0 0.7px black, 0 0 0.7px black" }
        : {};
      const rowHandlers = {
        onMouseEnter: () => setHoveredRow(onePaket._id.toString()),
        onMouseLeave: () => setHoveredRow(null),
        onClick: () => goto_kesifButcePozlar(onePaket),
      };

      return (
        <React.Fragment key={onePaket._id.toString()}>
          <Box {...rowHandlers} sx={{ ...css_IsPaketler, ...rowBaseSx, ...hoverSx, justifyContent: "center" }}>
            {index + 1}
          </Box>
          <Box {...rowHandlers} sx={{ ...css_IsPaketler, ...rowBaseSx, ...hoverSx }}>
            {onePaket.name}
          </Box>
          <Box {...rowHandlers} sx={{ ...css_IsPaketler, ...rowBaseSx, ...hoverSx, justifyContent: "center", marginLeft: "0.5rem" }}>
            {pozSayisi}
          </Box>
          <Box {...rowHandlers} sx={{ ...css_IsPaketler, ...rowBaseSx, ...hoverSx, justifyContent: "center" }}>
            {dataIsPaketPozlar?.isPaketDugumSayisi?.[onePaket._id.toString()] ?? ""}
          </Box>
        </React.Fragment>
      );
    });

  const aktifPaketler = isPaketler?.filter((x) => x.isActive) ?? [];
  const pasifPaketler = isPaketler?.filter((x) => !x.isActive) ?? [];

  const emptySection = (
    <Box
      sx={{
        gridColumn: "1/-1",
        py: "0.5rem",
        mt: "0.2rem",
        display: "grid",
        gridAutoFlow: "column",
        backgroundColor: "rgba(227, 143, 122, 0.15)",
        alignItems: "center",
        justifyContent: "start",
      }}
    >
      <InfoIcon sx={{ color: "rgba(223, 123, 98, 1)", fontSize: "1.2rem", m: "0.3rem" }} />
      <Box>Bu başlık altında henüz iş paketi bulunmuyor.</Box>
    </Box>
  );

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          onCloseAction={
            dialogAlert.onCloseAction
              ? dialogAlert.onCloseAction
              : () => setDialogAlert()
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
          <Grid item xs>
            <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              Keşif / Bütçe
            </Typography>
          </Grid>
        </Grid>
      </AppBar>

      {!isPaketler?.length > 0 && (
        <Stack sx={{ width: "100%", padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bir iş paketi oluşturmak için (+) tuşuna basınız..
          </Alert>
        </Stack>
      )}

      {isPaketler?.length > 0 && (
        <Stack
          sx={{
            width: "100%",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: columns,
          }}
        >
          {/* AKTİF İŞ PAKETLERİ */}
          <Box sx={{ gridColumn: "1/-1", fontWeight: 700 }}>
            AKTİF İŞ PAKETLERİ
          </Box>

          {aktifPaketler.length === 0 && emptySection}

          {aktifPaketler.length > 0 && (
            <React.Fragment>
              <Box sx={{ ...css_IsPaketlerBaslik }}>Sıra</Box>
              <Box sx={{ ...css_IsPaketlerBaslik }}>İş Paketi</Box>
              <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "0.5rem" }}>Poz Sayısı</Box>
              <Box sx={{ ...css_IsPaketlerBaslik }}>Mahal Sayısı</Box>
              {renderIsPaketRows(aktifPaketler)}
            </React.Fragment>
          )}

          {/* AYRAÇ */}
          <Box sx={{ gridColumn: "1/-1", mt: "1rem", backgroundColor: "darkred", height: "0.2rem" }} />

          {/* PASİF İŞ PAKETLERİ */}
          <Box sx={{ gridColumn: "1/-1", fontWeight: 700, mt: "1rem" }}>
            PASİF İŞ PAKETLERİ
          </Box>

          {pasifPaketler.length === 0 && emptySection}

          {pasifPaketler.length > 0 && (
            <React.Fragment>
              <Box sx={{ ...css_IsPaketlerBaslik }}>Sıra</Box>
              <Box sx={{ ...css_IsPaketlerBaslik }}>İş Paketi</Box>
              <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "0.5rem" }}>Poz Sayısı</Box>
              <Box sx={{ ...css_IsPaketlerBaslik }}>Mahal Sayısı</Box>
              {renderIsPaketRows(pasifPaketler)}
            </React.Fragment>
          )}
        </Stack>
      )}
    </Box>
  );
}
