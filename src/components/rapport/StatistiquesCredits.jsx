import React, { useRef, useState, useEffect, useCallback } from "react";
import Highcharts, { setOptions } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import fetchApi from "../../helpers/fetchApi";
import { io } from "socket.io-client";
import socket from '../../utils/socket';
import { useDashboardTrigger } from "./DashboardProvider";

// function formatAbregeMontant(value) {
//     if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
//     if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
//     if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
//     return value.toString();
// }
// export default function StatistiquesCredits({ dates, setLoading, refresh }) {
//     const [optionsMois, setOptionsMois] = useState({});
//     const [totalInteret, setTotalInteret] = useState(0);
//     const [revenuMoisData, setRevenuMoisData] = useState(null);

//     const fetchCredit = useCallback(async () => {
//         try {
//             setLoading(true);
//             const res = await fetchApi(`/credits/credits/fetch`);
//             const allcredits = res.result.data;
//             // Tu n'utilises pas encore `allcredits`, donc tu peux supprimer cette fonction si elle est inutile
//         } catch (error) {
//             console.log(error);
//         } finally {
//             setLoading(false);
//         }
//     }, [setLoading]);

//     useEffect(() => {
//         fetchCredit();
//     }, [fetchCredit]);

//     const fetchrapportparMois = useCallback(async () => {
//         try {
//             setLoading(true);
//             let url = '/rapport/rapportCreditsParMois/fetch?';
//             if (dates) {
//                 const startDate = new Date(dates).toISOString().split("T")[0];
//                 url += `startDate=${startDate}`;
//             }

//             const res = await fetchApi(url);
//             const result = res.result;

//             const categories = result?.moisReturn || [];
//             const dataParMois = result?.MontantTotal.map(mt => mt?.montantTotalData || 0);

//             // Calcule du total général
//             const somme = dataParMois.reduce((Montant, Total) => Montant + Total, 0);
//             setTotalInteret(somme);



//             // Options Highcharts avec formatage
//             const chartOptions = {
//                 chart: {
//                     type: "spline",
//                     height: 250
//                 },
//                 title: { text: null },
//                 xAxis: { categories },
//                 yAxis: {
//                     title: {
//                         data: dataParMois,
//                         text: "Montant (Fbu)",
//                     },
//                     labels: {
//                         formatter: function () {
//                             return formatAbregeMontant(this.value) + ' FBU';
//                         }
//                     }

//                 },
//                 series: [{
//                     name: "Intérêt total",
//                     color: '#43A047',
//                     data: dataParMois
//                 }],
//                 tooltip: {
//                     pointFormat: 'Montant : <b>{point.y:,.2f} FBU</b>'
//                 },
//                 credits: { enabled: false }
//             };

//             setOptionsMois(chartOptions);
//             setRevenuMoisData(result);
//         } catch (error) {
//             console.error("Erreur lors de la récupération du rapport par mois :", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [dates, refresh, setLoading]);

//     useEffect(() => {
//         fetchrapportparMois();
//     }, [fetchrapportparMois]);
// 🔹 petite fonction utilitaire pour formatter les montants
function formatAbregeMontant(value) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return value.toString();
}

export default function StatistiquesCredits({ dates, setLoading, refresh }) {
    const [optionsMois, setOptionsMois] = useState({});
    const [totalInteret, setTotalInteret] = useState(0);
          const { updateTrigger } = useDashboardTrigger();
        

    // 🔹 Fetch API principal
    const fetchrapportparMois = useCallback(async () => {
        try {
            setLoading(true); // ✅ on active le spinner global

            let url = "/rapport/rapportCreditsParMois/fetch?";
            if (dates) {
                const startDate = new Date(dates).toISOString().split("T")[0];
                url += `startDate=${startDate}`;
            }

            const res = await fetchApi(url);
            const result = res.result;

            const categories = result?.moisReturn || [];
            const dataParMois = result?.MontantTotal.map(mt => mt?.montantTotalData || 0);

            // ✅ somme totale
            const somme = dataParMois.reduce((a, b) => a + b, 0);
            setTotalInteret(somme);

            // ✅ options Highcharts
            const chartOptions = {
                chart: { type: "spline", height: 250 },
                title: { text: null },
                xAxis: { categories },
                yAxis: {
                    title: { text: "Montant (Fbu)" },
                    labels: {
                        formatter: function () {
                            return formatAbregeMontant(this.value) + " FBU";
                        }
                    }
                },
                series: [{
                    name: "Intérêt total",
                    color: "#43A047",
                    data: dataParMois
                }],
                tooltip: { pointFormat: "Montant : <b>{point.y:,.2f} FBU</b>" },
                credits: { enabled: false }
            };

            setOptionsMois(chartOptions);
            // ✅ Sauvegarder en cache
            localStorage.setItem("StatistiquesCreditsCache", JSON.stringify({
                totalInteret: somme,
                optionsMois: chartOptions,
                lastUpdate: new Date().toISOString()
            }));
        } catch (error) {
            console.error("❌ Erreur lors du fetch :", error);
        } finally {
            setLoading(false); // ✅ on coupe le spinner global
        }
    }, [dates, refresh, setLoading]);

    useEffect(() => {
        // ⚡ Charger depuis cache au premier rendu
        const cached = localStorage.getItem("StatistiquesCreditsCache");

        if (cached) {
            const parsed = JSON.parse(cached);
            setTotalInteret(parsed.totalInteret || 0);
            setOptionsMois(parsed.optionsMois || {});
        }

        // ⚡ Fetch immédiat en arrière-plan
        fetchrapportparMois();

        // ⏱️ Rafraîchissement automatique toutes les 2 minutes (120000 ms)
        const interval = setInterval(() => {
            fetchrapportparMois();
        }, 120000);

        // Nettoyage de l’intervalle quand le composant est démonté
        return () => clearInterval(interval);
    }, [fetchrapportparMois]);
 useEffect(() => {
    fetchrapportparMois(); // ou autre fetch spécifique
  }, [updateTrigger, dates, refresh]);


    return (
        <div className="w-100">
            <h2 className="text-lg font-semibold">Statistiques des intérêts mensuels</h2>
            <div className="d-flex justify-content-between align-items-start mt-3">
                <span className="font-bold">Montant total d’intérêt + Penalités :</span>
                <span>
                    {totalInteret
                        ? totalInteret.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                        : '0,00'} BIF
                </span>
            </div>

            {optionsMois && (
                <HighchartsReact highcharts={Highcharts} options={optionsMois} />
            )}
        </div>
    );
}
