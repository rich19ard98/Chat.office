
import React, { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { useDispatch } from "react-redux";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressBar } from "primereact/progressbar";
import { InputText } from 'primereact/inputtext';
import RepartitionTypeCredits from "./RepartitionTypeCreditsTerimbereAkaravyo";
export default function DashboardMelleurMembres({ dates, loading, setLoading, refresh }) {
    // const [tenMembres, setTenMembres] = useState([]);
    // const [filteredMembres, setFilteredMembres] = useState([]);
    // const [nbreCreditsParMembres, setNbreCreditsParMembres] = useState(0);
    // const [search, setSearch] = useState("");
    // const topTenMembres = useCallback(async () => {
    //     try {
    //         setLoading(true);
    //         const url = `/rapport/top10MembresActif/fetch?rows=1000000&`;
    //         const res = await fetchApi(url);
    //         const result = res.resultat;

    //         const membres = result.top10membres || [];
    //         setTenMembres(membres);
    //         setFilteredMembres(membres);
    //         setNbreCreditsParMembres(result.nbrAllCredits || 0);
    //     } catch (error) {
    //         console.log('Erreur lors du chargement des membres actifs:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [refresh]);

    // useEffect(() => {
    //     topTenMembres();
    // }, [refresh]);
    const [tenMembres, setTenMembres] = useState([]);
    const [filteredMembres, setFilteredMembres] = useState([]);
    const [nbreCreditsParMembres, setNbreCreditsParMembres] = useState(0);
    const [search, setSearch] = useState("");

    // Fonction pour récupérer les top 10 membres actifs
    const fetchTopTenMembres = useCallback(async () => {
        try {
            setLoading(true);

            const url = `/rapport/top10MembresActif/fetch?rows=1000000&`;
            const res = await fetchApi(url);
            const result = res.resultat;

            const membres = result.top10membres || [];

            // Mettre à jour le state
            setTenMembres(membres);
            setFilteredMembres(membres);
            setNbreCreditsParMembres(result.nbrAllCredits || 0);

            // Sauvegarder dans localStorage
            localStorage.setItem("dashboardTopMembres", JSON.stringify({
                membres,
                nbrAllCredits: result.nbrAllCredits || 0,
            }));

        } catch (error) {
            console.error("Erreur lors du chargement des membres actifs :", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // ⚡ 1. Charger depuis localStorage
        const cached = localStorage.getItem("dashboardTopMembres");
        if (cached) {
            const parsed = JSON.parse(cached);
            setTenMembres(parsed.membres || []);
            setFilteredMembres(parsed.membres || []);
            setNbreCreditsParMembres(parsed.nbrAllCredits || 0);
        }

        // ⚡ 2. Fetch depuis API en arrière-plan
        fetchTopTenMembres();

        // ⚡ 3. Synchro auto toutes les 2 minutes
        const interval = setInterval(fetchTopTenMembres, 120000);
        return () => clearInterval(interval);

    }, [refresh, fetchTopTenMembres]);

    // Exemple de filtre par recherche
    useEffect(() => {
        if (search.trim() === "") {
            setFilteredMembres(tenMembres);
        } else {
            setFilteredMembres(
                tenMembres.filter(m =>
                    m.NOM?.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, tenMembres]);


    // Filtrer par recherche
    useEffect(() => {
        if (!search.trim()) {
            setFilteredMembres(tenMembres);
        } else {
            const lower = search.toLowerCase();
            const filtered = tenMembres.filter(
                m =>
                    m?.NOM.toLowerCase().includes(lower) ||
                    (m?.PRENOM && m?.PRENOM.toLowerCase().includes(lower))
            );
            setFilteredMembres(filtered);
        }
    }, [search, tenMembres]);


    const [showAll, setShowAll] = React.useState(false);

    const membresAAfficher = showAll ? filteredMembres : filteredMembres.slice(0, 3);


  
    return (
        <div className="col-12 xl:col-5">
            <div className="card h-auto p-6">
                <div className="flex align-items-start justify-content-between mt-0">
                    <span className="font-semibold text-lg">Les 10 Membres les plus actifs</span>
                </div>
                {/* Tableau des membres */}
                <div style={{
                    maxHeight: '170px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#7B3F00 #f1f1f1',
                }}>
                    <table className="table w-full">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr>
                                <th className="text-left">Nom & Prénom</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembres.map((corp, index) => (
                                <tr key={index}>
                                    <td>
                                        {(corp?.NOM && corp?.PRENOM)
                                            ? `${corp?.NOM} ${corp?.PRENOM}`
                                            : "Nom inconnu"
                                        }
                                    </td>
                                </tr>
                            ))
                        
                            }
                          
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );



}


