import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../components/store.js";
import _ from "lodash";

export default function useRequestProjeAktifYetkiliKisi() {
  const { appUser, setAppUser, selectedProje, setSelectedProje } = useContext(StoreContext);
  const navigate = useNavigate();

  return async ({ projeId, aktifYetki, setDialogAlert, setShow }) => {
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
        let proje2 = _.cloneDeep(selectedProje);
        proje2.isPaketler = responseJson.proje.isPaketler;
        setSelectedProje(proje2);
        return { ok: true };
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
