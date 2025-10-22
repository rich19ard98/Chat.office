import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import socket from "./utils/socket"; // ✅ initialise le socket

// ✅ Thèmes et styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "/node_modules/primeflex/primeflex.css";
import "./styles/app/style.css";

// ✅ Composants principaux
import { AutoComplete } from "primereact/autocomplete";
import { Toast } from "primereact/toast";
import SideBar from "./components/app/SideBar";
import Header from "./components/app/Header";
import RoutesProvider from "./routes/RoutesProvider";
import WelcomeRoutesProvider from "./routes/WelcomeRoutesProvider";
import PushNotification from "./components/PushNotification";
import PushListener from "./components/PushListener";
import Loading from "./components/app/Loading";

// ✅ Redux
import { useDispatch, useSelector } from "react-redux";
import { toastSelector } from "./store/selectors/appSelectors";
import { setToastAction } from "./store/actions/appActions";
import { userSelector } from "./store/selectors/userSelector";
import { setUserAction } from "./store/actions/userActions";

// ✅ Hooks utilitaires
import useSessionCheck from "./utils/useSessionCheck";

function App() {
  const toast = useRef(null);
  const appToast = useSelector(toastSelector);
  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  // ✅ Gestion des toasts
  useEffect(() => {
    if (appToast && toast.current) {
      toast.current.show(appToast);
    }
  }, [appToast]); // ❗ ne pas inclure toast.current dans le tableau

  // ✅ Récupération utilisateur au chargement
  useLayoutEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        dispatch(setUserAction(JSON.parse(storedUser)));
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur :", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // ✅ Optionnel : vérification session côté serveur
  // useSessionCheck();

  // ✅ Loading screen
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* ✅ Toast global */}
      <Toast
        ref={toast}
        position="top-center"
        onHide={() => dispatch(setToastAction(null))}
      />

      {/* ✅ Si l’utilisateur n’est pas connecté → routes publiques */}
      {!user ? (
        <WelcomeRoutesProvider />
      ) : (
        // ✅ Si connecté → application principale
        <div className="d-flex w-100">
          <div id="desktop-sidebar" style={{ zIndex: 2 }}>
            <SideBar />
          </div>

          {/* ✅ Zone principale */}
          <div className="main flex-1">
            <Header />
            <RoutesProvider />
            <PushNotification />
            <PushListener toast={toast} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
