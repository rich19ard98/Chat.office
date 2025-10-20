
import { Suspense, lazy } from "react";
import {
  Route,
  Routes
} from "react-router-dom";
// import RootPage from "../pages/home/RootPage";
const NotFound = lazy(() => import("../pages/home/NotFound"));
import SlimTopLoading from "../components/app/SlimTopLoading";
import administration_routes from "./admin/administration_routes";
import comptabilite_routes from "./admin/comptabilite_routes";
// import Tableaudebord from "../pages/dashboard/Tableaudebord";
const Tableaudebord = lazy(() => import("../pages/dashbaord/Tableaudebord"));
export default function RoutesProvider() {
  return (
    <Suspense fallback={<SlimTopLoading />}>
      <Routes>
        {/* <Route path="/" element={<RootPage />}></Route> */}
        <Route path="/" element={<Tableaudebord />}></Route>
        {administration_routes},
        {comptabilite_routes}
        <Route Component={NotFound} path="*" />
      </Routes>
    </Suspense>
  )
}

