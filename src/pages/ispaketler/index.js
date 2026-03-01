import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../components/store.js";
// import FormIsPaketBaslikCreate from '../../components/FormIsPaketBaslikCreate'
import FormIsPaketCreate from "../../components/FormIsPaketCreate.js";
import { useNavigate } from "react-router-dom";
// import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from "../../components/general/DialogAlert.js";
import { DialogVersiyonTip } from "../../components/general/DialogVersiyonTip.js";
import ShowIsPaketBasliklar from "../../components/ShowIsPaketBasliklar.js";
import { useQueryClient } from "@tanstack/react-query";

import { useGetIsPaketPozlar } from "../../hooks/useMongo.js";
import useRequestProjeAktifYetkiliKisi from "../../functions/requestProjeAktifYetkiliKisi.js";
import useDeleteProjeAktifYetkiliKisi from "../../functions/deleteProjeAktifYetkiliKisi.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AdjustIcon from '@mui/icons-material/Adjust';
import ClearOutlined from '@mui/icons-material/ClearOutlined';

export default function P_IsPaketler() {
  const queryClient = useQueryClient();

  const { appUser, setAppUser } = useContext(StoreContext);
  const { selectedProje, setSelectedProje } = useContext(StoreContext);
  const { selectedIsPaket, setSelectedIsPaket } = useContext(StoreContext);
  const { mode_isPaketEdit, setMode_isPaketEdit } = useContext(StoreContext);
  const { selectedIsPaketVersiyon, setSelectedIsPaketVersiyon } = useContext(StoreContext);

  const requestProjeAktifYetkiliKisi = useRequestProjeAktifYetkiliKisi();
  const deleteProjeAktifYetkiliKisi = useDeleteProjeAktifYetkiliKisi();

  // console.log("selectedProje",selectedProje)

  const [dialogAlert, setDialogAlert] = useState();
  const [isPaketler, setIsPaketler] = useState([]);
  const [showEminMisin_versiyon, setShowEminMisin_versiyon] = useState(false);

  // const { data, error, isFetching } = useGetisPaketler()
  // console.log("isPaketler",isPaketler)

  const { data: dataIsPaketPozlar } = useGetIsPaketPozlar()
  const toplamAciktaKalanDugum = dataIsPaketPozlar?.toplamAciktaKalanDugum

  const navigate = useNavigate();


  useEffect(() => {
    setSelectedIsPaket(null);
    if (!selectedProje) navigate("/projeler");
  }, []);

  useEffect(() => {
    if (selectedProje) {
      setIsPaketler(selectedProje?.isPaketler);
    }
  }, [selectedProje]);

  const [show, setShow] = useState("Main");
  const [basliklar, setBasliklar] = useState(() => {
    const existing = appUser.customSettings.pages.ispaketler.basliklar;
    if (!existing?.find((x) => x.id === "pozSayisi")) {
      return [...(existing || []), { id: "pozSayisi", baslikName: "Poz Sayısı", show: true, visible: true }];
    }
    return existing;
  });
  const showAciklama = basliklar?.find((x) => x.id === "aciklama")?.show;
  const showPozSayisi = basliklar?.find((x) => x.id === "pozSayisi")?.show;

  const goto_isPaketPozlar = () => {
    navigate("/ispaketpozlar");
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

  const headerIconButton_sx = { width: 40, height: 40 };
  const headerIcon_sx = { fontSize: 24 };

  const columns =
    `max-content minmax(min-content, 20rem)${showPozSayisi ? " minmax(5rem, max-content)" : ""} max-content${showAciklama ? " minmax(min-content, 20rem)" : ""}`;

  const nextVersiyonNumber = (selectedProje?.isPaketVersiyonlar?.reduce((acc, cur) => Math.max(acc, cur.versiyonNumber), 0) ?? 0) + 1

  const createVersiyon_isPaket = async ({ fieldText }) => {
    try {
      setSelectedIsPaketVersiyon()

      const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/versiyon/ispaket`, {
        method: 'POST',
        headers: {
          email: appUser.email,
          token: appUser.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projeId: selectedProje?._id,
          versiyonNumber: nextVersiyonNumber,
          aciklama: fieldText
        })
      })

      const responseJson = await response.json()

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser()
          localStorage.removeItem('appUser')
          navigate('/')
          window.location.reload()
        }
        throw new Error(responseJson.error)
      }

      if (responseJson.message) {
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => setDialogAlert()
        })
        return
      }

      if (responseJson.ok) {
        const newVersiyon = { versiyonNumber: nextVersiyonNumber, isPaketler, aciklama: fieldText }
        setSelectedIsPaketVersiyon(newVersiyon)
        const proje2 = { ...selectedProje, isPaketVersiyonlar: responseJson.isPaketVersiyonlar }
        setSelectedProje(proje2)
        setMode_isPaketEdit()
      } else {
        throw new Error("Kayıt işlemi gerçekleşmedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
      }

    } catch (err) {
      console.log(err)
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => setDialogAlert()
      })
    }
  }

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

      {showEminMisin_versiyon && (
        <DialogVersiyonTip
          dialogBaslikText={`Mevcut iş paket atamaları versiyon (İP${nextVersiyonNumber}) olarak kaydedilsin mi?`}
          aciklamaBaslikText={"Versiyon hakkında bilgi verebilirsiniz"}
          aprroveAction={({ fieldText }) => {
            setShowEminMisin_versiyon(false)
            createVersiyon_isPaket({ fieldText })
          }}
          rejectAction={() => setShowEminMisin_versiyon(false)}
          onCloseAction={() => setShowEminMisin_versiyon(false)}
        />
      )}


      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && (
        <ShowIsPaketBasliklar
          setShow={setShow}
          basliklar={basliklar.filter((x) => x.id !== "pasif")}
          setBasliklar={setBasliklar}
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
          {/* sol kısım (başlık) */}
          <Grid item xs>
            <Typography
              // nowrap={true}
              variant="h6"
              fontWeight="bold"
            >
              İş Paketleri
            </Typography>
          </Grid>

          {/* sağ kısım - (tuşlar)*/}
          <Grid item xs="auto">
            <Box
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                alignItems: "center",
              }}
            >

              {!mode_isPaketEdit && (
                <Box>
                  <IconButton onClick={() => setShow("ShowBaslik")} sx={headerIconButton_sx}>
                    <VisibilityIcon variant="contained" sx={headerIcon_sx} />
                  </IconButton>
                </Box>
              )}

              {!selectedIsPaket && !mode_isPaketEdit && (
                <>
                  <Box>
                    <IconButton
                      onClick={() => goto_isPaketPozlar()}
                      sx={headerIconButton_sx}
                    >
                      <AdjustIcon
                        variant="contained"
                        color="success"
                        sx={headerIcon_sx}
                      />
                    </IconButton>
                  </Box>

                  <Box>
                    <IconButton
                      onClick={async () => {
                        const checkAuth = await requestProjeAktifYetkiliKisi({
                          projeId: selectedProje?._id,
                          aktifYetki: "isPaketEdit",
                          setDialogAlert,
                          setShow,
                        })
                        if (checkAuth?.ok) {
                          setMode_isPaketEdit(true)
                          setShow("FormIsPaketCreate")
                        } else {
                          setShow("Main")
                        }
                      }}
                      sx={headerIconButton_sx}
                    >
                      <AddCircleOutlineIcon
                        variant="contained"
                        color="success"
                        sx={headerIcon_sx}
                      />
                    </IconButton>
                  </Box>
                </>
              )}

              {!selectedIsPaket && mode_isPaketEdit && (
                <>
                  <Grid item>
                    <IconButton
                      onClick={() => {
                        deleteProjeAktifYetkiliKisi({
                          projeId: selectedProje?._id,
                          aktifYetki: "isPaketEdit",
                          setDialogAlert,
                          setShow,
                          onOk: () => setMode_isPaketEdit(),
                        })
                      }}
                      sx={headerIconButton_sx}
                    >
                      <ClearOutlined variant="contained" sx={{ ...headerIcon_sx, color: "red" }} />
                    </IconButton>
                  </Grid>

                  <Box>
                    <IconButton
                      onClick={() => setShow("FormIsPaketCreate")}
                      sx={headerIconButton_sx}
                    >
                      <AddCircleOutlineIcon
                        variant="contained"
                        color="success"
                        sx={headerIcon_sx}
                      />
                    </IconButton>
                  </Box>

                  <Box
                    onClick={() => isPaketler?.length > 0 && setShowEminMisin_versiyon(true)}
                    sx={{
                      cursor: isPaketler?.length > 0 ? "pointer" : "default",
                      mx: "0.3rem", py: "0.2rem", px: "0.3rem",
                      border: isPaketler?.length > 0 ? "1px solid red" : "1px solid black",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      backgroundColor: "yellow"
                    }}
                  >
                    İP{nextVersiyonNumber}
                  </Box>
                </>
              )}

              {selectedIsPaket && (
                <>
                  <Grid item>
                    <IconButton
                      onClick={() => console.log("deleted clicked")}
                      aria-label="addWbs"
                      sx={headerIconButton_sx}
                    >
                      <DeleteIcon variant="contained" color="error" sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {show == "FormIsPaketCreate" && (
        <Box>
          <FormIsPaketCreate
            setShow={setShow}
          />
        </Box>
      )}

      {show == "Main" && !isPaketler?.length > 0 && (
        <Stack sx={{ width: "100%", padding: "1rem" }} spacing={2}>
          <Alert severity="info">
            Bir iş paketi oluşturmak için (+) tuşuna basınız..
          </Alert>
        </Stack>
      )}

      {show == "Main" && isPaketler?.length > 0 && (
        <Stack
          sx={{
            width: "100%",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: columns,
          }}
        >
          {/* iş paketleri başlık satırı */}
          <React.Fragment>
            <Box sx={{ ...css_IsPaketlerBaslik }}>Sıra</Box>

            <Box sx={{ ...css_IsPaketlerBaslik }}>İş Paketi</Box>

            {showPozSayisi && (
              <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "0.5rem", textAlign: "center" }}>Poz</Box>
            )}

            <Box sx={{ ...css_IsPaketlerBaslik, display: "flex", alignItems: "center" }}>
              Mahal
              {toplamAciktaKalanDugum > 0 && (
                <Box component="span" sx={{ color: "#800020", fontSize: "0.85em", marginLeft: "0.3rem" }}>
                  ({toplamAciktaKalanDugum})
                </Box>
              )}
            </Box>

            {showAciklama && (
              <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "0.5rem" }}>Açıklama</Box>
            )}
          </React.Fragment>

          {/* iş paketleri verileri */}
          {isPaketler.map((onePaket, index) => {
            const pozSayisi =
              dataIsPaketPozlar?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";

            return (
              <React.Fragment key={index}>
                <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                  {index + 1}
                </Box>

                <Box sx={{ ...css_IsPaketler }}>
                  {onePaket.name}
                </Box>

                {showPozSayisi && (
                  <Box sx={{ ...css_IsPaketler, justifyContent: "center", marginLeft: "0.5rem" }}>
                    {pozSayisi}
                  </Box>
                )}

                <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                  {dataIsPaketPozlar?.isPaketDugumSayisi?.[onePaket._id.toString()] ?? ""}
                </Box>

                {showAciklama && (
                  <Box sx={{ ...css_IsPaketler, marginLeft: "0.5rem" }}>
                    {onePaket.aciklama ?? ""}
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
