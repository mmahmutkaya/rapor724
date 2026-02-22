import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../components/store.js";
// import FormIsPaketBaslikCreate from '../../components/FormIsPaketBaslikCreate'
import FormIsPaketCreate from "../../components/FormIsPaketCreate.js";
import { useNavigate } from "react-router-dom";
// import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from "../../components/general/DialogAlert.js";
import ShowIsPaketBasliklar from "../../components/ShowIsPaketBasliklar.js";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";

import { useGetisPaketler } from "../../hooks/useMongo.js";
import { useGetIsPaketlerDugumler } from "../../hooks/useMongo.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import FolderIcon from "@mui/icons-material/Folder";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LensIcon from "@mui/icons-material/Lens";
import ClearOutlined from "@mui/icons-material/ClearOutlined";
import InfoIcon from "@mui/icons-material/Info";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";

export default function P_IsPaketler() {
  const queryClient = useQueryClient();

  const { appUser, setAppUser } = useContext(StoreContext);
  const { selectedProje, setSelectedProje } = useContext(StoreContext);

  // console.log("selectedProje",selectedProje)
  const { selectedIsPaketVersiyon, setSelectedIsPaketVersiyon } =
    useContext(StoreContext);
  const { selectedIsPaket, setSelectedIsPaket } = useContext(StoreContext);
  const { mode_isPaketEdit, setMode_isPaketEdit } = useContext(StoreContext);

  // console.log("selectedProje",selectedProje)

  const [dialogAlert, setDialogAlert] = useState();
  const [isPaketler, setIsPaketler] = useState([]);

  // const { data, error, isFetching } = useGetisPaketler()
  // console.log("isPaketler",isPaketler)

  const [basliklar, setBasliklar] = useState(
    appUser.customSettings.pages.ispaketler.basliklar,
  );

  const { data: dataIsPaketlerDugumler } = useGetIsPaketlerDugumler();

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProje) navigate("/projeler");

    if (selectedProje && !selectedIsPaketVersiyon) {
      let isPaketVersiyon = selectedProje?.isPaketVersiyonlar.reduce(
        (acc, cur) => (cur.versiyonNumber >= acc.versiyonNumber ? cur : acc),
        { versiyonNumber: 0, isPaketler: [] },
      );
      setSelectedIsPaketVersiyon(isPaketVersiyon);
    }
  }, []);

  useEffect(() => {
    if (selectedProje && selectedIsPaketVersiyon) {
      if (mode_isPaketEdit) {
        setIsPaketler(selectedProje?.isPaketler);
      } else {
        let isPaketler2 = selectedProje?.isPaketVersiyonlar.find(
          (x) => x.versiyonNumber === selectedIsPaketVersiyon?.versiyonNumber,
        ).isPaketler;
        setIsPaketler(isPaketler2);
      }
    }
  }, [mode_isPaketEdit, selectedIsPaketVersiyon, selectedProje]);

  const [show, setShow] = useState("Main");

  // const { data: projelerNames_byFirma } = useGetProjelerNames_byFirma()
  // const aciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pasifShow = basliklar?.find((x) => x.id === "pasif")?.show;

  const goto_isPaketPozlar = ({ onePaket }) => {
    setSelectedIsPaket(onePaket);
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
    "max-content minmax(min-content, 20rem) max-content max-content";

  const requestProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BASE_URL +
          `/api/projeler/requestprojeaktifyetkilikisi`,
        {
          method: "POST",
          headers: {
            email: appUser.email,
            token: appUser.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projeId,
            aktifYetki,
          }),
        },
      );

      const responseJson = await response.json();

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser();
          localStorage.removeItem("appUser");
          navigate("/");
          window.location.reload();
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.message) {
        setShow("Main");
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            setShow("Main");
            setDialogAlert();
          },
        });
      }

      if (responseJson.ok) {
        setShow("Main");
        let proje2 = _.cloneDeep(selectedProje);
        proje2.isPaketler = responseJson.proje.isPaketler;
        setSelectedProje(proje2);
        setMode_isPaketEdit(true);
      }
    } catch (err) {
      console.log(err);

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage:
          "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert();
        },
      });
    }
  };

  const deleteProjeAktifYetkiliKisi = async ({ projeId, aktifYetki }) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BASE_URL +
          `/api/projeler/deleteprojeaktifyetkilikisi`,
        {
          method: "POST",
          headers: {
            email: appUser.email,
            token: appUser.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projeId,
            aktifYetki,
          }),
        },
      );

      const responseJson = await response.json();

      if (responseJson.error) {
        if (responseJson.error.includes("expired")) {
          setAppUser();
          localStorage.removeItem("appUser");
          navigate("/");
          window.location.reload();
        }
        throw new Error(responseJson.error);
      }

      if (responseJson.message) {
        setShow("Main");
        setDialogAlert({
          dialogIcon: "info",
          dialogMessage: responseJson.message,
          onCloseAction: () => {
            setDialogAlert();
          },
        });
      }

      if (responseJson.ok) {
        setShow("Main");
        setMode_isPaketEdit();
      }
    } catch (err) {
      console.log(err);

      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage:
          "Beklenmedik hata, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz..",
        detailText: err?.message ? err.message : null,
        onCloseAction: () => {
          setDialogAlert();
          queryClient.invalidateQueries(["dataPozlar"]);
        },
      });
    }
  };

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

      {/* BAŞLIK GÖSTER / GİZLE */}
      {show == "ShowBaslik" && (
        <ShowIsPaketBasliklar
          setShow={setShow}
          basliklar={basliklar}
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
              {!selectedIsPaket && !mode_isPaketEdit && (
                <>
                  <Box>
                    <IconButton onClick={() => setShow("ShowBaslik")} sx={headerIconButton_sx}>
                      <VisibilityIcon variant="contained" sx={headerIcon_sx} />
                    </IconButton>
                  </Box>

                  <Box>
                    <IconButton
                      onClick={() =>
                        requestProjeAktifYetkiliKisi({
                          projeId: selectedProje?._id,
                          aktifYetki: "isPaketEdit",
                        })
                      }
                      sx={headerIconButton_sx}
                    >
                      <EditIcon variant="contained" sx={headerIcon_sx} />
                    </IconButton>
                  </Box>

                  {selectedIsPaketVersiyon && (
                    <Select
                      size="small"
                      value={selectedIsPaketVersiyon?.versiyonNumber}
                      onClose={() => {
                        setTimeout(() => {
                          document.activeElement.blur();
                        }, 0);
                      }}
                      // onBlur={() => queryClient.resetQueries(['dataPozlar'])}
                      sx={{ fontSize: "0.75rem" }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: "15rem",
                            minWidth: "5rem",
                          },
                        },
                      }}
                    >
                      {selectedProje?.isPaketVersiyonlar
                        ?.sort((a, b) => b.versiyonNumber - a.versiyonNumber)
                        .map((oneVersiyon, index) => {
                          let versiyonNumber = oneVersiyon.versiyonNumber;
                          return (
                            // <MenuItem sx={{ fontSize: "0.8rem" }} key={index} onClick={() => setSelectedBirimFiyatVersiyon(oneVersiyon)} value={versiyonNumber} > V{versiyonNumber} </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSelectedIsPaketVersiyon(oneVersiyon);
                              }}
                              sx={{ fontSize: "0.75rem" }}
                              key={index}
                              value={versiyonNumber}
                            >
                              {" "}
                              İP{versiyonNumber}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  )}
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
                        });
                      }}
                      sx={headerIconButton_sx}
                    >
                      <ClearOutlined variant="contained" color="error" sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>

                  <Box>
                    <IconButton
                      onClick={() => setShow("FormIsPaketCreate")}
                      aria-label="addWbs"
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

              {selectedIsPaket && (
                <>
                  <Grid item>
                    <IconButton
                      onClick={() => {
                        setSelectedIsPaket();
                      }}
                      aria-label="addWbs"
                      sx={headerIconButton_sx}
                    >
                      <ClearOutlined variant="contained" color="error" sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>

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
          <FormIsPaketCreate setShow={setShow} />
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
          {/* AKTİF İŞ PAKETLERİ */}

          {/* iş paket başlığı adı - en üst satır*/}
          <Box sx={{ gridColumn: "1/-1", fontWeight: 700, cursor: "pointer" }}>
            AKTİF İŞ PAKETLERİ
          </Box>

          {/* iş paketleri henüz oluşturulmamış ise */}
          {!isPaketler?.filter((x) => x.isActive)?.length > 0 && (
            <Box
              sx={{
                gridColumn: "1/-1",
                py: "0.5rem",
                mt: "0.2rem",
                cursor: "pointer",
                display: "grid",
                gridAutoFlow: "column",
                backgroundColor: "rgba(227, 143, 122, 0.15)",
                alignItems: "center",
                justifyContent: "start",
              }}
            >
              <InfoIcon
                variant="contained"
                sx={{
                  color: "rgba(223, 123, 98, 1)",
                  fontSize: "1.2rem",
                  m: "0.3rem",
                }}
              />
              <Box>Bu başlık altında henüz iş paketi bulunmuyor.</Box>
            </Box>
          )}

          {isPaketler?.filter((x) => x.isActive).length > 0 && (
            <React.Fragment>
              {/* iş paketleri varsa */}
              <React.Fragment>
                <Box sx={{ ...css_IsPaketlerBaslik }}>Sıra</Box>

                <Box sx={{ ...css_IsPaketlerBaslik }}>İş Paketi</Box>

                <Box sx={{ ...css_IsPaketlerBaslik }}>Poz Sayısı</Box>

                <Box sx={{ ...css_IsPaketlerBaslik }}>
                  Seçilen Düğüm
                </Box>
              </React.Fragment>

              {/* iş paketleri verileri */}
              {isPaketler.length > 0 &&
                isPaketler.map((onePaket, index) => {
                  let isPaketSelected;
                  if (
                    onePaket._id.toString() === selectedIsPaket?._id.toString()
                  ) {
                    isPaketSelected = true;
                  }

                  const pozSayisi =
                    dataIsPaketlerDugumler?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";

                  return (
                    // iş paketleri başlığı
                    <React.Fragment key={index}>
                      <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                        {index + 1}
                      </Box>

                      <Box
                        onClick={() => {
                          setSelectedIsPaket(onePaket);
                        }}
                        sx={{ ...css_IsPaketler, cursor: "pointer" }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridAutoFlow: "column",
                            gridTemplateColumns: "1fr auto",
                          }}
                        >
                          <Box>{onePaket.name}</Box>
                          {isPaketSelected && (
                            <Box sx={{ display: "grid", alignItems: "center" }}>
                              <LensIcon
                                sx={{
                                  color: "darkred",
                                  fontSize: "0.6rem",
                                  ml: "0.5rem",
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>

                    <Box
                        onClick={() => goto_isPaketPozlar({ onePaket })}
                        sx={{ ...css_IsPaketler, cursor: "pointer", justifyContent: "center" }}
                      >
                        {pozSayisi}
                      </Box>

                    <Box
                        onClick={() => goto_isPaketPozlar({ onePaket })}
                        sx={{ ...css_IsPaketler, cursor: "pointer", justifyContent: "center" }}
                      >
                        {dataIsPaketlerDugumler?.isPaketCounts?.[onePaket._id.toString()] ?? ""}
                      </Box>
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          )}

          {/* PASİF İŞ PAKETLERİ */}

          {pasifShow && (
            <>
              {/* YATAY AYRAÇ */}
              <Box
                sx={{
                  gridColumn: "1/-1",
                  mt: "1rem",
                  backgroundColor: "darkred",
                  height: "0.2rem",
                }}
              ></Box>

              {/* iş paket başlığı adı - en üst satır*/}
              <Box
                sx={{
                  gridColumn: "1/-1",
                  fontWeight: 700,
                  cursor: "pointer",
                  mt: "1rem",
                }}
              >
                PASİF İŞ PAKETLERİ
              </Box>

              {/* iş paketleri henüz oluşturulmamış ise */}
              {!isPaketler.filter((x) => !x.isActive).length > 0 && (
                <Box
                  sx={{
                    gridColumn: "1/-1",
                    py: "0.5rem",
                    mt: "0.2rem",
                    cursor: "pointer",
                    display: "grid",
                    gridAutoFlow: "column",
                    backgroundColor: "rgba(227, 143, 122, 0.15)",
                    alignItems: "center",
                    justifyContent: "start",
                  }}
                >
                  <InfoIcon
                    variant="contained"
                    sx={{
                      color: "rgba(223, 123, 98, 1)",
                      fontSize: "1.2rem",
                      m: "0.3rem",
                    }}
                  />
                  <Box>Bu başlık altında henüz iş paketi bulunmuyor.</Box>
                </Box>
              )}

              {isPaketler.filter((x) => !x.isActive).length > 0 && (
                <React.Fragment>
                  {/* iş paketleri varsa */}
                  <React.Fragment>
                    <Box sx={{ ...css_IsPaketlerBaslik }}>Sıra</Box>

                    <Box sx={{ ...css_IsPaketlerBaslik }}>İş Paketi</Box>

                    <Box sx={{ ...css_IsPaketlerBaslik }}>Poz Sayısı</Box>

                    <Box sx={{ ...css_IsPaketlerBaslik }}>Seçilen Düğüm</Box>
                  </React.Fragment>

                  {/* iş paketleri verileri */}
                  {isPaketler.length > 0 &&
                    isPaketler.map((onePaket, index) => {
                      let isPaketSelected;
                      if (
                        onePaket?._id.toString() ===
                        selectedIsPaket?._id.toString()
                      ) {
                        isPaketSelected = true;
                      }

                      const pozSayisi =
                        dataIsPaketlerDugumler?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";

                      return (
                        // iş paketleri başlığı
                        <React.Fragment key={index}>
                          <Box
                            sx={{ ...css_IsPaketler, justifyContent: "center" }}
                          >
                            {index + 1}
                          </Box>

                          <Box
                            onClick={() => {
                              setSelectedIsPaket(onePaket);
                            }}
                            sx={{ ...css_IsPaketler, cursor: "pointer" }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                                gridAutoFlow: "column",
                                gridTemplateColumns: "1fr auto",
                              }}
                            >
                              <Box>{onePaket.name}</Box>
                              {isPaketSelected && (
                                <Box
                                  sx={{ display: "grid", alignItems: "center" }}
                                >
                                  <LensIcon
                                    sx={{
                                      color: "darkred",
                                      fontSize: "0.6rem",
                                      ml: "0.5rem",
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Box>

                          <Box
                            onClick={() => goto_isPaketPozlar({ onePaket })}
                            sx={{ ...css_IsPaketler, cursor: "pointer", justifyContent: "center" }}
                          >
                            {pozSayisi}
                          </Box>

                          <Box
                            onClick={() => goto_isPaketPozlar({ onePaket })}
                            sx={{ ...css_IsPaketler, cursor: "pointer", justifyContent: "center" }}
                          >
                            {dataIsPaketlerDugumler?.isPaketCounts?.[onePaket._id.toString()] ?? ""}
                          </Box>
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              )}
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}
