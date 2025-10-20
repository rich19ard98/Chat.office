import { Card } from "primereact/card";
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useCallback, useEffect, useState } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
import { useDispatch } from "react-redux";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import DashboardMelleurMembres from "./DashboardMelleurMembres";
import { useDashboardTrigger } from "./DashboardProvider";

export default function DashboardEcheance({ dates, refresh, setLoading, loading }) {

  // const [NombreEcheancesEnAttente, setNombreEcheancesEnAttente] = useState([]);
  // const [NombreEcheancesEnRetard, setNombreEcheancesEnRetard] = useState([]);
  // const [totalRecords, setTotalRecords] = useState(0);
  // const [lazyState, setLazyState] = useState({});
  // const [nombTotalEcheanceSemaine, setnombTotalEcheanceSemaine] = useState([]);
  // const dispatch = useDispatch();
  // const toEcheance = useCallback(async () => {

  //   try {
  //     setLoading(true)
  //     var url = `/rapport/NombreEcheancesSemaineEnCours/fetch?`;
  //     if (dates) {
  //       const startDate = dates;
  //       if (startDate) {
  //         url += `startDate= ${startDate.toString()}&`;
  //       }
  //     }
  //     const res = await fetchApi(url);

  //     const result = res.resultat;
  //     setNombreEcheancesEnAttente(Number(res.result?.nombreEcheanceSemaineEnCours));
  //     setNombreEcheancesEnRetard(Number(res.result.totalRetard));
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // }, [dates, refresh]);



  // useEffect(() => {
  //   toEcheance();
  // }, [dates, refresh]);
  const [NombreEcheancesEnAttente, setNombreEcheancesEnAttente] = useState(0);
  const [NombreEcheancesEnRetard, setNombreEcheancesEnRetard] = useState(0);
  const [nombTotalEcheanceSemaine, setnombTotalEcheanceSemaine] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setLazyState] = useState({});
  const { updateTrigger } = useDashboardTrigger();

  const dispatch = useDispatch();

  // Fonction pour récupérer les échéances
  const fetchEcheances = useCallback(async () => {
    try {
      setLoading(true);

      // Construction URL
      let url = `/rapport/NombreEcheancesSemaineEnCours/fetch?`;
      if (dates) {
        const startDate = dates;
        if (startDate) {
          url += `startDate=${startDate.toString()}&`;
        }
      }

      // API call
      const res = await fetchApi(url);

      const newData = {
        NombreEcheancesEnAttente: Number(res.result?.nombreEcheanceSemaineEnCours) || 0,
        NombreEcheancesEnRetard: Number(res.result?.totalRetard) || 0,
        nombTotalEcheanceSemaine: Number(res.result?.totalSemaine) || 0,
      };

      // Mettre à jour le state
      setNombreEcheancesEnAttente(newData.NombreEcheancesEnAttente);
      setNombreEcheancesEnRetard(newData.NombreEcheancesEnRetard);
      setnombTotalEcheanceSemaine(newData.nombTotalEcheanceSemaine);

      // Sauvegarder dans localStorage
      localStorage.setItem("dashboardEcheances", JSON.stringify(newData));

    } catch (error) {
      console.error("Erreur lors du chargement des échéances :", error);
    } finally {
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    // ⚡ 1. Charger depuis localStorage si dispo
    const cached = localStorage.getItem("dashboardEcheances");
    if (cached) {
      const parsed = JSON.parse(cached);
      setNombreEcheancesEnAttente(parsed.NombreEcheancesEnAttente);
      setNombreEcheancesEnRetard(parsed.NombreEcheancesEnRetard);
      setnombTotalEcheanceSemaine(parsed.nombTotalEcheanceSemaine);
    }

    // ⚡ 2. Fetch depuis API en arrière-plan
    fetchEcheances();

    // ⚡ 3. Synchro auto toutes les 2 minutes
    const interval = setInterval(fetchEcheances, 120000);
    return () => clearInterval(interval);

  }, [dates, refresh, fetchEcheances]);

  useEffect(() => {
    fetchEcheances(); // ou autre fetch spécifique
  }, [updateTrigger, dates, refresh]);




  return (
    <>
      <div className="col-12 xl:col-7 p-3">
        <div className="card h-auto p-4" style={{ backgroundColor: "#BC6B6A" }}>

          {/* 1ère ligne */}
          <div className="flex flex-wrap align-items-center gap-4 mb-4">
            {/* Cadre */}
            <div className="flex-1 min-w-[150px]">
              <div
                className="card h-full text-light p-3 flex align-items-center justify-content-center"
                style={{ background: "linear-gradient(to bottom,rgb(11, 11, 11),rgb(10, 10, 10))" }}
              >
                <h6
                  className="mb-0 dashboard-title coutmobile"
                  style={{ fontSize: "2rem" }}
                >
                  {NombreEcheancesEnAttente ? NombreEcheancesEnAttente.toLocaleString("fr") : 0}
                </h6>
              </div>
            </div>

            {/* Titre */}
            <div className="flex-1 min-w-[200px]">
              <span className="font-bold text-2xl text-center text-gray-100">
                Échéances dues semaine en cours
              </span>
            </div>
          </div>

          {/* 2ème ligne */}
          <div className="flex flex-wrap align-items-center gap-4">
            {/* Cadre */}
            <div className="flex-1 min-w-[150px]">
              <div
                className="card h-full text-light p-3 flex align-items-center justify-content-center"
                style={{ background: "linear-gradient(to bottom,rgb(11, 11, 11),rgb(10, 10, 10))" }}
              >
                <h6
                  className="mb-0 dashboard-title coutmobile"
                  style={{ fontSize: "2rem" }}
                >
                  {NombreEcheancesEnRetard ? NombreEcheancesEnRetard.toLocaleString("fr") : 0}
                </h6>
              </div>
            </div>

            {/* Titre */}
            <div className="flex-1 min-w-[200px]">
              <span className="font-bold text-2xl text-center text-gray-100">
                Retards de paiement détectés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Autre élément */}
      <DashboardMelleurMembres dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
    </>
  );




}

