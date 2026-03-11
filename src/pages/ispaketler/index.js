import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { StoreContext } from "../../components/store.js";
import { useGetWorkPackages, useGetUserSettings } from "../../hooks/useMongo.js";
import { supabase } from "../../lib/supabase.js";
import FormIsPaketCreate from "../../components/FormIsPaketCreate.js";
import { DialogAlert } from "../../components/general/DialogAlert.js";

import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";


// Sayfa ayarlarının varsayılan değerleri
const PAGE_KEY = "ispaketler";
const DEFAULT_PAGE_SETTINGS = {
  showAciklama: true,
  showOlusturan: false,
};


export default function P_IsPaketler() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { appUser, selectedProje, selectedIsPaket, setSelectedIsPaket } = useContext(StoreContext);

  const [show, setShow] = useState("Main");
  const [dialogAlert, setDialogAlert] = useState();
  const [selectMode, setSelectMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Düzenleme state'i
  const [editPaket, setEditPaket] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAciklama, setEditAciklama] = useState("");
  const [editNameError, setEditNameError] = useState(false);

  const { data: isPaketler = [], isFetching, error } = useGetWorkPackages();
  const { data: userSettings = {} } = useGetUserSettings();

  // Bu sayfaya ait ayarları çöz
  const pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...(userSettings[PAGE_KEY] ?? {}) };

  useEffect(() => {
    setSelectedIsPaket(null);
    if (!selectedProje) navigate("/projeler");
  }, []);

  // ── Ayar kaydetme ──────────────────────────────────────
  const savePageSetting = async (key, value) => {
    const newPageSettings = { ...pageSettings, [key]: value };
    const newSettings = { ...userSettings, [PAGE_KEY]: newPageSettings };

    // Anlık güncelleme (optimistic)
    queryClient.setQueryData(["userSettings", appUser?.id], newSettings);

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: appUser.id, settings: newSettings, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) {
      // Hata durumunda optimistic güncellemeyi geri al
      queryClient.setQueryData(["userSettings", appUser?.id], userSettings);
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Ayar kaydedilemedi.",
        detailText: error.message,
        onCloseAction: () => setDialogAlert(),
      });
    }
  };

  // ── Select modu ────────────────────────────────────────
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = isPaketler.length > 0 && selectedIds.size === isPaketler.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(isPaketler.map((p) => p.id)));
  };

  // ── Silme ──────────────────────────────────────────────
  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    setDialogAlert({
      dialogIcon: "warning",
      dialogMessage: `Seçili ${count} iş paketi silinsin mi?`,
      actionText1: "Sil",
      action1: async () => {
        setDialogAlert();
        try {
          const { error } = await supabase
            .from("work_packages")
            .delete()
            .in("id", [...selectedIds]);

          if (error) throw new Error(error.message);

          exitSelectMode();
          queryClient.invalidateQueries(["workPackages", selectedProje.id]);
        } catch (err) {
          setDialogAlert({
            dialogIcon: "warning",
            dialogMessage: "Silme işlemi sırasında hata oluştu.",
            detailText: err?.message ?? null,
            onCloseAction: () => setDialogAlert(),
          });
        }
      },
      onCloseAction: () => setDialogAlert(),
    });
  };

  // ── Düzenleme ──────────────────────────────────────────
  const openEdit = (paket) => {
    setEditPaket(paket);
    setEditName(paket.name);
    setEditAciklama(paket.description ?? "");
    setEditNameError(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editName.trim().length < 3) {
      setEditNameError("İş paketi adı en az 3 karakter olmalıdır");
      return;
    }
    try {
      const { error } = await supabase
        .from("work_packages")
        .update({ name: editName.trim(), description: editAciklama.trim() || null })
        .eq("id", editPaket.id);

      if (error) throw new Error(error.message);

      setEditPaket(null);
      setEditMode(false);
      exitSelectMode();
      queryClient.invalidateQueries(["workPackages", selectedProje.id]);
    } catch (err) {
      setDialogAlert({
        dialogIcon: "warning",
        dialogMessage: "Güncelleme sırasında hata oluştu.",
        detailText: err?.message ?? null,
        onCloseAction: () => setDialogAlert(),
      });
    }
  };

  // ── CSS ────────────────────────────────────────────────
  const css_baslik = {
    display: "flex",
    alignItems: "center",
    px: "0.6rem",
    py: "0.3rem",
    backgroundColor: "#c8c8c8",
    fontWeight: 700,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    borderBottom: "1px solid #aaa",
    whiteSpace: "nowrap",
  };

  const css_satir = {
    display: "flex",
    alignItems: "center",
    px: "0.6rem",
    py: "0.4rem",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f2f2f2",
    fontSize: "0.85rem",
  };

  // Dinamik sütun tanımı
  const columns = [
    selectMode ? "max-content" : null,  // checkbox
    "max-content",                       // sıra
    "minmax(20rem, max-content)",        // isim
    pageSettings.showAciklama  ? "max-content" : null,  // açıklama
    pageSettings.showOlusturan ? "max-content" : null,  // oluşturan
  ].filter(Boolean).join(" ");

  const headerIconButton_sx = { width: 40, height: 40 };
  const headerIcon_sx = { fontSize: 24 };

  const olusturanAd = (paket) => {
    const o = paket.olusturan;
    if (!o) return "—";
    return [o.first_name, o.last_name].filter(Boolean).join(" ") || "—";
  };

  return (
    <Box>
      {dialogAlert && (
        <DialogAlert
          dialogIcon={dialogAlert.dialogIcon}
          dialogMessage={dialogAlert.dialogMessage}
          detailText={dialogAlert.detailText}
          actionText1={dialogAlert.actionText1}
          action1={dialogAlert.action1}
          onCloseAction={dialogAlert.onCloseAction ?? (() => setDialogAlert())}
        />
      )}

      {/* ── Görünüm Ayarları Dialog'u ── */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} PaperProps={{ sx: { position: "fixed", top: "10rem" } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Görünüm Ayarları</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: "0 !important" }}>
          <List disablePadding>
            <ListItem
              secondaryAction={
                <Switch
                  checked={pageSettings.showAciklama}
                  onChange={(e) => savePageSetting("showAciklama", e.target.checked)}
                />
              }
            >
              <ListItemText primary="Açıklama sütunu" />
            </ListItem>
            <ListItem
              secondaryAction={
                <Switch
                  checked={pageSettings.showOlusturan}
                  onChange={(e) => savePageSetting("showOlusturan", e.target.checked)}
                />
              }
            >
              <ListItemText primary="Oluşturan kişi sütunu" />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>

      {/* ── Düzenleme Dialog'u ── */}
      {editPaket && (
        <Dialog
          PaperProps={{ sx: { width: "80%", position: "fixed", top: "10rem" } }}
          open={true}
          onClose={() => setEditPaket(null)}
        >
          <Box component="form" onSubmit={handleEditSubmit} noValidate sx={{ mt: 1 }}>
            <DialogContent sx={{ display: "grid", overflow: "visible" }}>
              <DialogContentText sx={{ fontWeight: "bold", paddingBottom: "1rem" }}>
                İş Paketi Düzenle
              </DialogContentText>
              <Box onClick={() => setEditNameError(false)}>
                <TextField
                  variant="standard"
                  margin="normal"
                  label="İş Paketi Adı"
                  type="text"
                  fullWidth
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.replace(/^i/, "İ").toUpperCase())}
                  error={Boolean(editNameError)}
                  helperText={editNameError || ""}
                />
              </Box>
              <TextField
                multiline
                variant="standard"
                margin="normal"
                label="Açıklama"
                type="text"
                fullWidth
                value={editAciklama}
                onChange={(e) => setEditAciklama(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ padding: "1.5rem" }}>
              <Button onClick={() => setEditPaket(null)}>İptal</Button>
              <Button type="submit">Kaydet</Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* ── BAŞLIK ── */}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                İş Paketleri
              </Typography>
              {editMode && (
                <Typography variant="body2" sx={{ color: "gray", whiteSpace: "nowrap" }}>
                  — düzenlenecek satıra tıklayın
                </Typography>
              )}
              {selectMode && (
                <Typography variant="body2" sx={{ color: "gray", whiteSpace: "nowrap" }}>
                  — silinecekleri seçin
                </Typography>
              )}
              {!selectMode && !editMode && (
                <>
                  <NavigateNextIcon sx={{ opacity: 0.3, fontSize: 18, mx: "0.1rem" }} />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      opacity: 0.3,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                      "&:hover": { opacity: 0.75 },
                    }}
                    onClick={() => {
                      if (!isPaketler.length) {
                        setDialogAlert({
                          dialogIcon: "info",
                          dialogMessage: "Pozlar sayfasına geçmek için önce en az bir iş paketi oluşturulmalıdır.",
                          onCloseAction: () => setDialogAlert(),
                        });
                        return;
                      }
                      if (!selectedIsPaket) {
                        setDialogAlert({
                          dialogIcon: "info",
                          dialogMessage: "Bir iş paketi satırına tıklayarak pozlarını görüntüleyebilirsiniz.",
                          onCloseAction: () => setDialogAlert(),
                        });
                        return;
                      }
                      navigate("/ispaketpozlar");
                    }}
                  >
                    Pozlar
                  </Typography>
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs="auto">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!selectMode && !editMode && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={() => setSettingsOpen(true)}>
                    <VisibilityIcon sx={headerIcon_sx} />
                  </IconButton>
                  <IconButton
                    sx={headerIconButton_sx}
                    onClick={() => setEditMode(true)}
                    disabled={isPaketler.length === 0}
                  >
                    <EditIcon sx={headerIcon_sx} />
                  </IconButton>
                  <IconButton
                    sx={headerIconButton_sx}
                    onClick={() => setSelectMode(true)}
                    disabled={isPaketler.length === 0}
                  >
                    <DeleteIcon sx={headerIcon_sx} />
                  </IconButton>
                  <IconButton
                    sx={headerIconButton_sx}
                    onClick={() => setShow("FormIsPaketCreate")}
                  >
                    <AddCircleOutlineIcon color="success" sx={headerIcon_sx} />
                  </IconButton>
                </>
              )}

              {editMode && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={() => setEditMode(false)}>
                    <CloseIcon sx={headerIcon_sx} />
                  </IconButton>
                </>
              )}

              {selectMode && (
                <>
                  <IconButton sx={headerIconButton_sx} onClick={exitSelectMode}>
                    <CloseIcon sx={headerIcon_sx} />
                  </IconButton>
                  <IconButton
                    sx={headerIconButton_sx}
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                  >
                    <DeleteIcon
                      color={selectedIds.size > 0 ? "error" : "disabled"}
                      sx={headerIcon_sx}
                    />
                  </IconButton>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </AppBar>

      {isFetching && <LinearProgress />}

      {error && (
        <Stack sx={{ width: "100%", padding: "1rem" }}>
          <Alert severity="error">Veri alınırken hata: {error.message}</Alert>
        </Stack>
      )}

      {show === "FormIsPaketCreate" && (
        <FormIsPaketCreate onClose={() => setShow("Main")} />
      )}

      {show === "Main" && !isFetching && isPaketler.length === 0 && (
        <Stack sx={{ width: "100%", padding: "1rem" }}>
          <Alert severity="info">
            Henüz iş paketi oluşturulmamış. (+) tuşuna basarak ekleyebilirsiniz.
          </Alert>
        </Stack>
      )}

      {show === "Main" && isPaketler.length > 0 && (
        <Box sx={{ padding: "1rem", display: "grid", gridTemplateColumns: columns }}>

          {/* ── Başlık satırı ── */}
          {selectMode && (
            <Box sx={{ ...css_baslik, justifyContent: "center" }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selectedIds.size > 0 && !allSelected}
                onChange={toggleSelectAll}
                sx={{ p: "2px" }}
              />
            </Box>
          )}
          <Box sx={{ ...css_baslik, justifyContent: "center" }}>Sıra</Box>
          <Box sx={{ ...css_baslik }}>İş Paketi</Box>
          {pageSettings.showAciklama  && <Box sx={{ ...css_baslik }}>Açıklama</Box>}
          {pageSettings.showOlusturan && <Box sx={{ ...css_baslik }}>Oluşturan</Box>}

          {/* ── Veri satırları ── */}
          {isPaketler.map((paket, index) => {
            const isChecked = selectedIds.has(paket.id);
            const secilenBg = isChecked ? { backgroundColor: "#e3f2fd" } : {};
            return (
              <React.Fragment key={paket.id}>
                {selectMode && (
                  <Box sx={{ ...css_satir, justifyContent: "center", ...secilenBg }}>
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={() => toggleSelect(paket.id)}
                      sx={{ p: "2px" }}
                    />
                  </Box>
                )}

                <Box sx={{ ...css_satir, justifyContent: "center", ...secilenBg }}>
                  {index + 1}
                </Box>

                <Box
                  sx={{
                    ...css_satir,
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": { backgroundColor: isChecked ? "#d0e8fb" : "#f5f5f5" },
                    ...secilenBg,
                    ...(editMode && { "&:hover": { backgroundColor: "#fff9c4" } }),
                  }}
                  onClick={() => {
                    if (editMode)       return openEdit(paket);
                    if (selectMode)     return toggleSelect(paket.id);
                    setSelectedIsPaket(paket);
                    navigate("/ispaketpozlar");
                  }}
                >
                  {paket.name}
                </Box>

                {pageSettings.showAciklama && (
                  <Box
                    sx={{
                      ...css_satir,
                      cursor: (selectMode || editMode) ? "pointer" : "default",
                      ...secilenBg,
                      ...(editMode && { "&:hover": { backgroundColor: "#fff9c4" } }),
                    }}
                    onClick={() => {
                      if (editMode)   return openEdit(paket);
                      if (selectMode) return toggleSelect(paket.id);
                    }}
                  >
                    {paket.description ?? ""}
                  </Box>
                )}

                {pageSettings.showOlusturan && (
                  <Box
                    sx={{
                      ...css_satir,
                      cursor: (selectMode || editMode) ? "pointer" : "default",
                      ...secilenBg,
                      ...(editMode && { "&:hover": { backgroundColor: "#fff9c4" } }),
                    }}
                    onClick={() => {
                      if (editMode)   return openEdit(paket);
                      if (selectMode) return toggleSelect(paket.id);
                    }}
                  >
                    {olusturanAd(paket)}
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
