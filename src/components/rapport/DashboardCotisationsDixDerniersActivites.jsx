import React, { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDashboardTrigger } from "./DashboardProvider";
import { useDispatch } from "react-redux";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressBar } from "primereact/progressbar";
import DashboardCreditsDixDerniersActivites from "./DashboardCreditsDixDerniersActivites";



// export default function DashboardCotisationsDixDerniersActivites({ dates, loading, setLoading, refresh }) {
//     const [cotisations, setCotisations] = useState([]);

//     const fetchCotisations = async () => {
//         try {
//             setLoading(true);
//             const res = await fetchApi('/rapport/dixDerniersCotisationsEffectuees/fetch');
//             setCotisations(res.resultat);
//         } catch (error) {
//             console.error('Erreur lors du chargement des cotisations:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCotisations();
//     }, [refresh]);

export default function DashboardCotisationsDixDerniersActivites({ dates, loading, setLoading, refresh }) {
  const [cotisations, setCotisations] = useState([]);
    const { updateTrigger } = useDashboardTrigger();

  // 🔄 Fonction de récupération des cotisations
  const fetchCotisations = useCallback(async () => {
    try {
      setLoading(true);

      // Requête API
      const res = await fetchApi('/rapport/dixDerniersCotisationsEffectuees/fetch');
      const newData = res.resultat || [];

      // Mise à jour du state
      setCotisations(newData);

      // Sauvegarde dans localStorage
      localStorage.setItem("dashboardCotisations", JSON.stringify(newData));
    } catch (error) {
      console.error('Erreur lors du chargement des cotisations:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    // ⚡ 1. Charger depuis localStorage au démarrage
    const cached = localStorage.getItem("dashboardCotisations");
    if (cached) {
      setCotisations(JSON.parse(cached));
    }

    // ⚡ 2. Récupération depuis l’API (rafraîchit en arrière-plan)
    fetchCotisations();

    // ⚡ 3. Synchro auto toutes les 2 minutes
    const interval = setInterval(fetchCotisations, 120000);
    return () => clearInterval(interval);

  }, [refresh, fetchCotisations]);
  
 useEffect(() => {
    fetchCotisations(); // ou autre fetch spécifique
  }, [updateTrigger, dates, refresh]);


  return (
    <>
      <div className="col-12 xl:col-6">
        <div className="card h-auto">
          <div className="flex align-items-start justify-content-between mb-4">
            <span className="font-semibold text-lg">Cotisation:10 Dernières cotisations</span>
          </div>

          {cotisations.length === 0 && !loading ? (
            <p className="text-sm text-muted">Aucune cotisation récente.</p>
          ) : (
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',       // Firefox
                scrollbarColor: '#7B3F00 #BC6B6A', // Firefox
              }}
            // Pour scrollbar sur Chrome, Edge, Safari il faut CSS global, inline ne gère pas ::-webkit-scrollbar
            >
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Nom & Prénom</th>
                    <th className="text-right">Montant (FBu)</th>
                  </tr>
                </thead>
                <tbody>
                  {cotisations.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {(item?.nom && item?.prenom)
                          ? `${item?.nom} ${item?.prenom}`
                          : 'Nom inconnu'}
                      </td>
                      <td className="text-right">
                        {item?.montant ? parseFloat(item?.montant).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DashboardCreditsDixDerniersActivites
        dates={dates}
        loading={loading}
        setLoading={setLoading}
        refresh={refresh}
      />
    </>
  );


}

