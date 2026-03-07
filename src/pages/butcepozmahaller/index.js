import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import { keyframes } from "@emotion/react";

import { StoreContext } from '../../components/store.js';
import { DialogAlert } from '../../components/general/DialogAlert.js';
import { useGetDugumler_byPoz, useGetMahaller } from '../../hooks/useMongo.js';

import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ReplyIcon from '@mui/icons-material/Reply';
import CheckIcon from '@mui/icons-material/Check';

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
    myTema,
  } = useContext(StoreContext);

  const [dialogAlert, setDialogAlert] = useState();
  const [dugumler_byPoz_state, setDugumler_byPoz_state] = useState();
  const [mahaller_state, setMahaller_state] = useState();

  const { data: dataMahaller, error: error1, isFetching: isFetching1 } = useGetMahaller();
  const { data: dataDugumler_byPoz, error: error2, isFetching: isFetching2 } = useGetDugumler_byPoz();

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
  const css_center = {
    border: "1px solid black", px: "0.5rem",
    display: "grid", justifyContent: "center", alignItems: "center", minHeight: "1.8rem",
  };

  const gridCols = "max-content minmax(min-content, 15rem) max-content";
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
          <Box sx={{ ...css_enUstBaslik, justifyContent: "center" }}>
            {selectedIsPaket?.name ?? "İş Paketi"}
          </Box>

          {/* LBS grupları */}
          {openLbsArray.map((oneLbs, lbsIndex) => {
            const mahaller_byLbs = mahaller_state?.filter(
              (x) => x._lbsId?.toString() === oneLbs._id?.toString()
            );
            if (!mahaller_byLbs?.length) return null;

            // Only show LBS if at least one mahal has a dugum for this poz
            const hasDugum = mahaller_byLbs.some((m) =>
              dugumler_byPoz_state?.find((d) => d._mahalId?.toString() === m._id?.toString())
            );
            if (!hasDugum) return null;

            return (
              <React.Fragment key={lbsIndex}>
                {/* LBS Başlığı */}
                <Box sx={{ ...css_LbsBaslik, borderLeft: "1px solid black" }}>
                  {getLbsName(oneLbs).name}
                </Box>
                <Box sx={css_LbsBaslik} />
                <Box sx={css_LbsBaslik} />

                {/* Mahal satırları */}
                {mahaller_byLbs.map((oneMahal, mahalIndex) => {
                  const dugum = dugumler_byPoz_state?.find(
                    (d) => d._mahalId?.toString() === oneMahal._id?.toString()
                  );
                  if (!dugum) return null;

                  const assigned = isDugumAssigned(dugum);

                  return (
                    <React.Fragment key={mahalIndex}>
                      <Box sx={{ ...css_mahal, borderLeft: "1px solid black" }}>
                        {oneMahal.mahalNo}
                      </Box>
                      <Box sx={css_mahal}>{oneMahal.mahalName}</Box>
                      <Box sx={css_center}>
                        {assigned && <CheckIcon sx={{ fontSize: 18, color: "green" }} />}
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
