import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../components/store.js";

export default function useDeleteProjeAktifYetkiliKisi() {
  const { appUser, setAppUser } = useContext(StoreContext);
  const navigate = useNavigate();

  return async ({ projeId, aktifYetki, setDialogAlert, setShow, onOk }) => {
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
        if (onOk) onOk();
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
}
