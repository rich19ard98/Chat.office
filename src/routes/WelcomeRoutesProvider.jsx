import { Suspense, lazy } from "react";
import {
          Route,
          Routes
} from "react-router-dom";
import welcome_routes from "./welcome/welcome_routes";

// Lazy load si tu veux LoginPage aussi (optionnel)
const LoginPage = lazy(() => import("../pages/welcome/LoginPage"));

// import NotFound from "../pages/home/NotFound";

const NotFound = lazy(()=>import("../pages/home/NotFound"));
import SlimTopLoading from "../components/app/SlimTopLoading";

export default function WelcomeRoutesProvider () {
          return (
                    <Suspense fallback={<SlimTopLoading />}>
                              <Routes>
                                        <Route path="/" element={<LoginPage />} />
                                        {welcome_routes}
                                        <Route Component={NotFound} path="*" />
                              </Routes>
                    </Suspense>
          )
}