import React, { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { useDispatch } from "react-redux";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";

export default function DashboardCreditsDixDerniersActivites({ refresh }) {
    // const [isLoading, setIsLoading] = useState(true);
    // const [lastCredits, setLastCredits] = useState([]);

    // const lastTenCredits = useCallback(async () => {
    //     try {
    //         setIsLoading(true);
    //         const res = await fetchApi("/rapport/dixDerniersCreditsEffectuees/fetch");

    //         setLastCredits(res.resultat || []);

    //     } catch (err) {
    //         console.error("Erreur chargement crédits :", err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [refresh]);

    // useEffect(() => {
    //     lastTenCredits();
    // }, [refresh]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastCredits, setLastCredits] = useState([]);

    // Fonction pour récupérer les 10 derniers crédits
    const fetchLastTenCredits = useCallback(async () => {
        try {
            setIsLoading(true);

            // Appel API
            const res = await fetchApi("/rapport/dixDerniersCreditsEffectuees/fetch");
            const newData = res.resultat || [];

            // Met à jour le state
            setLastCredits(newData);

            // Sauvegarde dans localStorage
            localStorage.setItem("dashboardLastCredits", JSON.stringify(newData));
        } catch (err) {
            console.error("Erreur chargement crédits :", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // ⚡ 1. Charger les données du cache en priorité
        const cached = localStorage.getItem("dashboardLastCredits");
        if (cached) {
            setLastCredits(JSON.parse(cached));
            setIsLoading(false); // comme on a déjà des données
        }

        // ⚡ 2. Fetch depuis l’API en arrière-plan
        fetchLastTenCredits();

        // ⚡ 3. Synchro auto toutes les 2 minutes
        const interval = setInterval(fetchLastTenCredits, 120000);
        return () => clearInterval(interval);

    }, [refresh, fetchLastTenCredits]);
    

    return (
        <>
            <div className="col-12 xl:col-6">
                <div className="card h-auto">
                    <h5 className="font-semibold mb-4">Crédits : 10 dernières activités</h5>

                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} height="2rem" className="mb-2" />
                        ))
                    ) : lastCredits.length === 0 ? (
                        <p className="text-sm text-muted">Aucune activité récente.</p>
                    ) : (
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',       // Firefox
                            scrollbarColor: '#7B3F00 #BC6B6A', // Firefox

                        }}>
                            <table className="table w-full">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr>
                                        <th className="text-left">Nom & Prénom</th>
                                        <th className="text-right">Montant(FBu)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastCredits.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {(item?.nom && item?.prenom)
                                                    ? `${item?.nom} ${item?.prenom}`
                                                    : "Nom inconnu"}
                                            </td>
                                            <td className="text-right">
                                                {item?.montant_demande
                                                    ? parseFloat(item.montant_demande).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );




}
