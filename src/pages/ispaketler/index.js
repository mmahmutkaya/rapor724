import React, { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../components/store.js";
// import FormIsPaketBaslikCreate from '../../components/FormIsPaketBaslikCreate'
import FormIsPaketCreate from "../../components/FormIsPaketCreate.js";
import { useNavigate } from "react-router-dom";
// import { useGetProjelerNames_byFirma } from '../../hooks/useMongo';
import { DialogAlert } from "../../components/general/DialogAlert.js";
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
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import FolderIcon from "@mui/icons-material/Folder";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ClearOutlined from "@mui/icons-material/ClearOutlined";
import InfoIcon from "@mui/icons-material/Info";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import AdjustIcon from '@mui/icons-material/Adjust';

export default function P_IsPaketler() {
  const queryClient = useQueryClient();

  const { appUser, setAppUser } = useContext(StoreContext);
  const { selectedProje, setSelectedProje } = useContext(StoreContext);

  // console.log("selectedProje",selectedProje)
  const { selectedIsPaket, setSelectedIsPaket } = useContext(StoreContext);

  const requestProjeAktifYetkiliKisi = useRequestProjeAktifYetkiliKisi();
  const deleteProjeAktifYetkiliKisi = useDeleteProjeAktifYetkiliKisi();

  // console.log("selectedProje",selectedProje)

  const [dialogAlert, setDialogAlert] = useState();
  const [isPaketler, setIsPaketler] = useState([]);

  // const { data, error, isFetching } = useGetisPaketler()
  // console.log("isPaketler",isPaketler)

  const [basliklar, setBasliklar] = useState(
    appUser.customSettings.pages.ispaketler.basliklar,
  );

  const { data: dataIsPaketPozlar } = useGetIsPaketPozlar();

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

  // const { data: projelerNames_byFirma } = useGetProjelerNames_byFirma()
  // const aciklamaShow = basliklar?.find(x => x.id === "aciklama").show
  const pasifShow = basliklar?.find((x) => x.id === "pasif")?.show;

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
    "max-content minmax(min-content, 20rem) max-content max-content";

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
                        setDialogAlert,
                        setShow,
                      })
                    }
                    sx={headerIconButton_sx}
                  >
                    <EditIcon variant="contained" sx={headerIcon_sx} />
                  </IconButton>
                </Box>

              </>


              {!selectedIsPaket && (
                <>
                  <Grid item>
                    <IconButton
                      onClick={() => {
                        deleteProjeAktifYetkiliKisi({
                          projeId: selectedProje?._id,
                          aktifYetki: "isPaketEdit",
                          setDialogAlert,
                          setShow,
                        });
                      }}
                      sx={headerIconButton_sx}
                    >
                      <ClearOutlined variant="contained" color="error" sx={headerIcon_sx} />
                    </IconButton>
                  </Grid>

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

                <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "1rem" }}>Poz Sayısı</Box>

                <Box sx={{ ...css_IsPaketlerBaslik }}>
                  Mahal Sayısı
                </Box>
              </React.Fragment>

              {/* iş paketleri verileri */}
              {isPaketler.length > 0 &&
                isPaketler.map((onePaket, index) => {
                  const pozSayisi =
                    dataIsPaketPozlar?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";

                  return (
                    // iş paketleri başlığı
                    <React.Fragment key={index}>
                      <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                        {index + 1}
                      </Box>

                      <Box sx={{ ...css_IsPaketler }}>
                        {onePaket.name}
                      </Box>

                      <Box sx={{ ...css_IsPaketler, justifyContent: "center", marginLeft: "1rem" }}>
                        {pozSayisi}
                      </Box>

                      <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                        {dataIsPaketPozlar?.isPaketCounts?.[onePaket._id.toString()] ?? ""}
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

                    <Box sx={{ ...css_IsPaketlerBaslik, marginLeft: "1rem" }}>Poz Sayısı</Box>

                    <Box sx={{ ...css_IsPaketlerBaslik }}>Mahal Sayısı</Box>
                  </React.Fragment>

                  {/* iş paketleri verileri */}
                  {isPaketler.length > 0 &&
                    isPaketler.map((onePaket, index) => {
                      const pozSayisi =
                        dataIsPaketPozlar?.isPaketPozSayisi?.[onePaket._id.toString()] ?? "";

                      return (
                        // iş paketleri başlığı
                        <React.Fragment key={index}>
                          <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                            {index + 1}
                          </Box>

                          <Box sx={{ ...css_IsPaketler }}>
                            {onePaket.name}
                          </Box>

                          <Box sx={{ ...css_IsPaketler, justifyContent: "center", marginLeft: "1rem" }}>
                            {pozSayisi}
                          </Box>

                          <Box sx={{ ...css_IsPaketler, justifyContent: "center" }}>
                            {dataIsPaketPozlar?.isPaketCounts?.[onePaket._id.toString()] ?? ""}
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
