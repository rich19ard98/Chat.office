import { useEffect } from "react";
import { useSelector } from "react-redux";
import { userSelector } from "../store/selectors/userSelector";
import PROFILS from "../constants/PROFILS";
export default function PushListener({ toast }) {
  const user = useSelector(userSelector);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event) => {
      if (event.data?.type === "PUSH_RECEIVED") {
        const payload = event.data.payload;
        // 0 = demande de crédit (admin), 1 = approbation (membre), 2 = globale
        const isAdminUser = user.ID_PROFIL === PROFILS.ADMIN;
        const shouldShow = (payload) => {
          if (isAdminUser) {
            // Admin voit toutes les demandes (0) et notifications globales (2)
            return payload.isAdmin === 0 || payload.isAdmin === 2;
          } else {
            // Membre voit les approbations (1) et notifications globales qui le concernent (2)
            return payload.isAdmin === 1 || (payload.isAdmin === 2 && payload.ID_UTILISATEUR === user.ID_UTILISATEUR);
          }
        };
        if (!shouldShow(payload)) return; // ignore notification si non concerné
        toast?.current?.show({
          severity: "info",
          summary: payload.title,
          detail: payload.message,
          life: 5000,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);
}
