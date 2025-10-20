

import { Card } from "primereact/card";

import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { useDispatch } from "react-redux";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import socket from '../../utils/socket';
import { useDashboardTrigger } from "./DashboardProvider";
import { io } from "socket.io-client";
import { useSelector } from "react-redux"
import { userSelector } from "../../store/selectors/userSelector";
import { ProgressBar } from "primereact/progressbar";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import Loading from "../app/Loading";
import Dashboardpartieun from "./Dashboardpartieun";
import DashboardPerformancesMansuelles from "./DashboardPerformancesMansuelles";
import DashboardEcheance from "./DashboardEcheance";
import DashboardCotisationsDixDerniersActivites from "./DashboardCotisationsDixDerniersActivites";
export default function Dashboard({ dates, loading, setLoading, refresh }) {
    const [CapitalCreditAccordeTotal, setCapitalCreditAccordeTotal] = useState(null);//MontantTotalsCreditsAccordes
    const [MontantTotalCreditsAccordes, setMontantTotalCreditsAccordes] = useState(null);
    const [interetTotalCreditsAccorde, setinteretTotalCreditsAccorde] = useState(null);
    const [CapitalTotCreditRembourse, setCapitalTotCreditRembourse] = useState(null);
    const [interetTotalCreditRembourse, setInteretTotalCreditRembourse] = useState(null);
    const [MontantTatalCreditsRembourses, setMontantTatalCreditsRembourses] = useState(null);
    const [CapitalTotalRestantdu, setCapitalTotalRestantdu] = useState(null);
    const [InteretTotalCapitalRestantDu, setInteretTotalCapitalRestantDu] = useState(null);
    const [MontantToatalCapitalRestantDu, setMontantToatalCapitalRestantDu] = useState(null);
    const [Intérêts, setIntérêts] = useState(null);
    const [Pénalités, setPénalités] = useState(null);
    const { updateTrigger } = useDashboardTrigger();

    const user = useSelector(userSelector);
    const isMembre = user.ID_PROFIL
    const [CaisseSocialSoldedisponible, setCaisseSocialSoldedisponible] = useState(null);
    const [CaisseSocial, setCaisseSocial] = useState(null);
    const [Montantcaisse, setMontantcaisse] = useState(null);
    const [MontantDepenses, setMontantDepenses] = useState(null);
    const [Montantbancaire, setMontantbancaire] = useState(null);
    const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
    const [CapitalTotalCotisationsMembres, setCapitalTotalCotisationsMembres] = useState(null);
    const [CapitalTotalFraisAdhions, setCapitalTotalFraisAdhions] = useState(null);//FraisAdhions
    const [CapitalTotalCommissionRemboursement, setCapitalTotalCommissionRemboursement] = useState(null);
    const [InteretsReel, setInteretsReel] = useState(null);
    const [InteretsEstimatif, setInteretsEstimatif] = useState(null);
    const [dashboard, setDashboard] = useState({
        CapitalCreditAccordeTotal: null,
        MontantTotalCreditsAccordes: null,
        interetTotalCreditsAccorde: null,
        CapitalTotCreditRembourse: null,
        interetTotalCreditRembourse: null,
        MontantTatalCreditsRembourses: null,
        CapitalTotalRestantdu: null,
        InteretTotalCapitalRestantDu: null,
        MontantToatalCapitalRestantDu: null,
        Interets: null,
        Pénalités: null,
        Montantcaisse: null,
        Montantbancaire: null,
        MontantCompteInterne: null,
        CapitalTotalCotisationsMembres: null,
        CapitalTotalFraisAdhions: null,
        CapitalTotalCommissionRemboursement: null,
        InteretsReel: null,
        InteretsEstimatif: null,
        CaisseSocial: null,
        CaisseSocialSoldedisponible: null,
    });

    // const fetchMontantTotalCredits = useCallback(async () => {
    //     try {
    //         setLoading(true);

    //         let url = "/rapport/findCoutRevenuCredits/fetch?";
    //         if (dates) {
    //             const formattedDate = moment(dates).format("YYYY-MM-DD");
    //             url += `startDate=${formattedDate}`;
    //         }
    //         const res = await fetchApi(url);


    //         // Mise à jour selon la structure du backend corrigé
    //         setCapitalCreditAccordeTotal(Number(res.result?.CapitalCreditAccorde) || 0);
    //         setMontantTotalCreditsAccordes(Number(res.result?.MontantTotalsCreditsAccordes))
    //         setinteretTotalCreditsAccorde(Number(res.result?.interetCreditAccordereel))
    //         setCapitalTotCreditRembourse(Number(res.result?.CapitalTotRembourse))
    //         setInteretTotalCreditRembourse(Number(res.result?.interetCreditRembourse))
    //         setMontantTatalCreditsRembourses(Number(res.result?.MontantTotalCreditsRembourse))
    //         setCapitalTotalRestantdu(Number(res.result?.CapitalRestantDu))
    //         setInteretTotalCapitalRestantDu(Number(res.result?.InteretCapitalRestantDu))
    //         setMontantToatalCapitalRestantDu(Number(res.result?.MontantCapitalRestantDu))
    //         setIntérêts(Number(res.result?.InteretTotdejapaye))
    //         setPénalités(Number(res.result?.CapitalTotPenalite))
    //         setMontantcaisse(Number(res.result?.MontantTOtalCraiditDebitCaisse))
    //         setMontantbancaire(Number(res.result?.MontantTOtalCraiditDebitBancaire))
    //         setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))
    //         setCapitalTotalCotisationsMembres(Number(res.result?.CapitalCotisationsMembres))
    //         setCapitalTotalFraisAdhions(Number(res.result?.CapitalFraisAdhions))
    //         setCapitalTotalCommissionRemboursement(Number(res.result?.CapitalCommissionRemboursement))
    //         setMontantDepenses(Number(res?.result?.Depenses))
    //         setInteretsReel(Number(res.result?.Interetsreel))
    //         setInteretsEstimatif(Number(res.result?.interetCreditAccordereel))
    //         setCaisseSocial(Number(res.result?.MontantTotalcaissesocial))
    //         setCaisseSocialSoldedisponible(Number(res.result.SoldeDisponibleCaisseSocial))
    //     } catch (error) {
    //         console.error("Erreur lors de la récupération des crédits :", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [dates, refresh, setLoading]);

    // useEffect(() => {
    //     fetchMontantTotalCredits();
    // }, [dates, refresh, setLoading]);

    // rgb(26 131 3 / 90%),
    // Mapping des setters
    // 1️⃣ Mapping entre les clés de données et leurs setters React (useState)
    const stateUpdaters = {
        CapitalCreditAccordeTotal: setCapitalCreditAccordeTotal,
        MontantTotalCreditsAccordes: setMontantTotalCreditsAccordes,
        interetTotalCreditsAccorde: setinteretTotalCreditsAccorde,
        CapitalTotCreditRembourse: setCapitalTotCreditRembourse,
        InteretTotalCreditRembourse: setInteretTotalCreditRembourse,
        MontantTotalCreditsRembourses: setMontantTatalCreditsRembourses, // setter ancien nom → renommer setter aussi
        CapitalTotalRestantdu: setCapitalTotalRestantdu,
        InteretTotalCapitalRestantDu: setInteretTotalCapitalRestantDu,
        MontantTotalCapitalRestantDu: setMontantToatalCapitalRestantDu, // idem renommer setter
        Interets: setIntérêts, // renommer setter en Interets pour uniformité
        Penalites: setPénalités, // idem
        MontantCaisse: setMontantcaisse,
        MontantBancaire: setMontantbancaire,
        MontantCompteInterne: setMontantCompteInterne,
        CapitalTotalCotisationsMembres: setCapitalTotalCotisationsMembres,
        CapitalTotalFraisAdhesion: setCapitalTotalFraisAdhions, // uniformiser
        CapitalTotalCommissionRemboursement: setCapitalTotalCommissionRemboursement,
        MontantDepenses: setMontantDepenses,
        InteretsReel: setInteretsReel,
        InteretsEstimatif: setInteretsEstimatif,
        CaisseSocial: setCaisseSocial,
        CaisseSocialSoldeDisponible: setCaisseSocialSoldedisponible, // uniformiser
    };

    const CACHE_NAME = "dashboard-cache";
    const CACHE_KEY = "dashboardData";

    // Fonction pour lire le cache
    async function readCache() {
        if (!("caches" in window)) return null;

        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(CACHE_KEY);
        if (!response) return null;

        try {
            const data = await response.json();
            return data;
        } catch {
            return null;
        }
    }

    // Fonction pour écrire dans le cache
    async function writeCache(data) {
        if (!("caches" in window)) return;
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
        await cache.put(CACHE_KEY, response);
    }

    // Fetch des données avec cache Storage
    const fetchMontantTotalCredits = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            // Lecture du cache
            const cached = await readCache();
            if (cached) {
                Object.entries(cached).forEach(([key, value]) => {
                    stateUpdaters[key]?.(value);
                });
            }

            // Construction de l’URL
            let url = "/rapport/findCoutRevenuCredits/fetch?";
            if (dates) {
                const formattedDate = moment(dates).format("YYYY-MM-DD");
                url += `startDate=${formattedDate}`;
            }

            // Requête API
            const res = await fetchApi(url);
            // Formatage des données
          const newData = {
  CapitalCreditAccordeTotal: Number(res.result?.CapitalCreditAccorde) || 0,
  MontantTotalCreditsAccordes: Number(res.result?.MontantTotalsCreditsAccordes) || 0,
  interetTotalCreditsAccorde: Number(res.result?.interetCreditAccordereel) || 0,
  CapitalTotCreditRembourse: Number(res.result?.CapitalTotRembourse) || 0,
  InteretTotalCreditRembourse: Number(res.result?.interetCreditRembourse) || 0,
  MontantTotalCreditsRembourses: Number(res.result?.MontantTotalCreditsRembourse) || 0,
  CapitalTotalRestantdu: Number(res.result?.CapitalRestantDu) || 0,
  InteretTotalCapitalRestantDu: Number(res.result?.InteretCapitalRestantDu) || 0,
  MontantTotalCapitalRestantDu: Number(res.result?.MontantCapitalRestantDu) || 0,
  Interets: Number(res.result?.InteretTotdejapaye) || 0,
  Penalites: Number(res.result?.CapitalTotPenalite) || 0,
  MontantCaisse: Number(res.result?.MontantTOtalCraiditDebitCaisse) || 0,
  MontantBancaire: Number(res.result?.MontantTOtalCraiditDebitBancaire) || 0,
  MontantCompteInterne: Number(res.result?.MontantTotalCompteInterne) || 0,
  CapitalTotalCotisationsMembres: Number(res.result?.CapitalCotisationsMembres) || 0,
  CapitalTotalFraisAdhesion: Number(res.result?.CapitalFraisAdhions) || 0,
  CapitalTotalCommissionRemboursement: Number(res.result?.CapitalCommissionRemboursement) || 0,
  MontantDepenses: Number(res.result?.Depenses) || 0,
  InteretsReel: Number(res.result?.Interetsreel) || 0,
  InteretsEstimatif: Number(res.result?.InteretsEstimatif) || 0,
  CaisseSocial: Number(res.result?.MontantTotalcaissesocial) || 0,
  CaisseSocialSoldeDisponible: Number(res.result?.SoldeDisponibleCaisseSocial) || 0,
};


            // Mise à jour des states React
            Object.entries(newData).forEach(([key, value]) => {
                stateUpdaters[key]?.(value);
            });

            // Sauvegarde dans Cache Storage
            await writeCache(newData);

        } catch (error) {
            console.error("Erreur lors de la récupération des crédits :", error);
        } finally {
            setLoading(false);
        }
    }, [dates, refresh, setLoading]);

    // ⚡ Hook global WS
    useEffect(() => {
        console.log("🔥 useEffect déclenché avec updateTrigger=", updateTrigger, "dates=", dates, "refresh=", refresh);
        fetchMontantTotalCredits();
    }, [updateTrigger, dates, refresh]);



    return (
        <>
            {isMembre === 2 ? null : (

                <div className="layout-content">
                    <div className="grid ">
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                //     background: linear-gradient(rgb(239 137 130 / 80%), rgba(241, 49, 83, 0.3));
                                // }
                                style={{ background: 'linear-gradient(rgba(239 137 130 / 80%), rgba(231, 33, 69, 0.3))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Crédits accordés</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/nodebu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="img-mobile" width="50px" height="40px" viewBox="0 0 24 24"><path fill="white" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h4c.55 0 1-.45 1-1s-.45-1-1-1H4v-6h18V6c0-1.1-.9-2-2-2m0 4H4V6h16zm-5.07 11.17l-2.12-2.12a.996.996 0 1 0-1.41 1.41l2.83 2.83c.39.39 1.02.39 1.41 0l5.66-5.66a.996.996 0 1 0-1.41-1.41z" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{MontantTotalCreditsAccordes?.toLocaleString('fr') ?? 0} Fbu</h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                                20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                                40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                                    8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                                    82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                                    100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>

                                <div className="d-flex  align-items-center " style={{ fontSize: 13 }}>
                                    <div className="cursor-pointer z-2" >
                                        Capital : <span style={{ fontWeight: 'bold' }}>
                                            {CapitalCreditAccordeTotal !== null ? CapitalCreditAccordeTotal.toLocaleString('fr') : 0} Fbu
                                        </span>
                                    </div>
                                    <span className="mx-1">|</span>
                                    <div className="">
                                        Intérêt : <span style={{ fontWeight: 'bold' }}>
                                            {interetTotalCreditsAccorde !== null ? interetTotalCreditsAccorde.toLocaleString('fr') : 0} Fbu

                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(233 123 147), rgba(218, 39, 22, 0.30))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Montant Remboursé</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/bif bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="img-mobile" width="50" height="40" viewBox="0 0 512 512"><path fill="white" d="M298.9 24.31c-14.9.3-25.6 3.2-32.7 8.4l-97.3 52.1l-54.1 73.59c-11.4 17.6-3.3 51.6 32.3 29.8l39-51.4c49.5-42.69 150.5-23.1 102.6 62.6c-23.5 49.6-12.5 73.8 17.8 84l13.8-46.4c23.9-53.8 68.5-63.5 66.7-106.9l107.2 7.7l-1-112.09zM244.8 127.7c-17.4-.3-34.5 6.9-46.9 17.3l-39.1 51.4c10.7 8.5 21.5 3.9 32.2-6.4c12.6 6.4 22.4-3.5 30.4-23.3c3.3-13.5 8.2-23 23.4-39m-79.6 96c-.4 0-.9 0-1.3.1c-3.3.7-7.2 4.2-9.8 12.2c-2.7 8-3.3 19.4-.9 31.6c2.4 12.1 7.4 22.4 13 28.8c5.4 6.3 10.4 8.1 13.7 7.4c3.4-.6 7.2-4.2 9.8-12.1c2.7-8 3.4-19.5 1-31.6c-2.5-12.2-7.5-22.5-13-28.8c-4.8-5.6-9.2-7.6-12.5-7.6m82.6 106.8c-7.9.1-17.8 2.6-27.5 7.3c-11.1 5.5-19.8 13.1-24.5 20.1c-4.7 6.9-5.1 12.1-3.6 15.2c1.5 3 5.9 5.9 14.3 6.3c8.4.5 19.7-1.8 30.8-7.3s19.8-13 24.5-20c4.7-6.9 5.1-12.2 3.6-15.2c-1.5-3.1-5.9-5.9-14.3-6.3c-1.1-.1-2.1-.1-3.3-.1m-97.6 95.6c-4.7.1-9 .8-12.8 1.9c-8.5 2.5-13.4 7-15 12.3c-1.7 5.4 0 11.8 5.7 18.7c5.8 6.8 15.5 13.3 27.5 16.9c11.9 3.6 23.5 3.5 32.1.9c8.6-2.5 13.5-7 15.1-12.3c1.6-5.4 0-11.8-5.8-18.7c-5.7-6.8-15.4-13.3-27.4-16.9c-6.8-2-13.4-2.9-19.4-2.8" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{MontantTatalCreditsRembourses !== null ? MontantTatalCreditsRembourses.toLocaleString('fr') : 0} Fbu</h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 35.6498L2.24444 32.4319C3.48889 29.214 5.97778 22.7782 8.46667 20.3627C10.9556 17.9473 13.4444 19.5522 15.9333 21.7663C18.4222 23.9803 20.9111 26.8035 23.4 30.6606C25.8889 34.5176 28.3778 39.4085 30.8667 37.2137C33.3556 35.0189 35.8444 25.7383 38.3333 26.3765C40.8222 27.0146 43.3111 37.5714 45.8 38.9013C48.2889 40.2311 50.7778 32.3341 53.2667 31.692C55.7556 31.0499 58.2444 37.6628 60.7333 39.4617C63.2222 41.2607 65.7111 38.2458 68.2 34.9205C70.6889 31.5953 73.1778 27.9597 75.6667 23.5955C78.1556 19.2313 80.6444 14.1385 83.1333 13.8875C85.6222 13.6365 88.1111 18.2272 90.6 20.2425C93.0889 22.2578 95.5778 21.6977 98.0667 18.8159C100.556 15.9341 103.044 10.7306 105.533 7.37432C108.022 4.01806 110.511 2.50903 111.756 1.75451L113 1"
                                                style={{ strokeWidth: '3px', stroke: 'var(--primary-color)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>

                                <div className="d-flex  align-items-center " style={{ fontSize: 13 }}>
                                    <div className="cursor-pointer z-2">
                                        Capital : <span style={{ fontWeight: 'bold' }}>
                                            {CapitalTotCreditRembourse !== null ? CapitalTotCreditRembourse.toLocaleString('fr') : 0} Fbu
                                        </span>
                                    </div>
                                    <span className="mx-1">|</span>
                                    <div className="">
                                        Intérêt : <span style={{ fontWeight: 'bold' }}>
                                            {Intérêts !== null ? Intérêts.toLocaleString('fr') : 0} Fbu

                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(125 122 118 / 90%), rgba(18 ,9 ,117, 0.30))' }}>

                                <span className="font-semibold text-lg mobilecolotitre">Capital Restant dû</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/userclient.png" alt="" className="img-mobile" style={{ height: '30px', width: '30px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="img-mobile" width="50" height="40" viewBox="0 0 24 24"><path fill="white" d="M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25l2-4H5.375zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">
                                            {MontantToatalCapitalRestantDu !== null ? MontantToatalCapitalRestantDu.toLocaleString('fr') : 0} Fbu

                                        </h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                                style={{ strokeWidth: '3px', stroke: 'var(--pink-500)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="d-flex  align-items-center " style={{ fontSize: 13 }}>
                                    <div className="cursor-pointer z-2" >
                                        Capital : <span style={{ fontWeight: 'bold' }}>
                                            {CapitalTotalRestantdu !== null ? CapitalTotalRestantdu.toLocaleString('fr') : 0} Fbu
                                        </span>
                                    </div>
                                    <span className="mx-1">|</span>
                                    <div className="">
                                        Intérêt : <span style={{ fontWeight: 'bold' }}>
                                            {InteretTotalCapitalRestantDu !== null ? InteretTotalCapitalRestantDu.toLocaleString('fr') : 0} Fbu

                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(24 37 36 / 90%), rgba(18 ,9 ,117, 0.30))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Compte Interne</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/userclient.png" alt="" className="img-mobile" style={{ height: '30px', width: '30px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="img-mobile" width="50" height="40" viewBox="0 0 24 24"><g fill="white" fill-rule="evenodd" clip-rule="evenodd"><path d="M13.29 4.654c-.07-.22-.17-.42-.24-.64a4.5 4.5 0 0 1-.17-.83a.28.28 0 0 0-.27-.31a.29.29 0 0 0-.3.27a4.4 4.4 0 0 0 0 2q.137.555.39 1.069c.12.26.22.26.36.43s.69.19.72-.15c-.13-.55-.1-.61-.27-1.16c-.06-.26-.14-.47-.22-.68m3.808-1.638a.3.3 0 0 0-.4.08a5.6 5.6 0 0 0-1 1.619q-.19.488-.31 1a2.7 2.7 0 0 0-.18.909c0 .42.39.44.77.18c.2-.286.358-.6.47-.93q.186-.49.31-1a8 8 0 0 1 .43-1.469a.3.3 0 0 0-.09-.39" /><path d="M11.41 6.063a9 9 0 0 1-1.918-1.47a2.88 2.88 0 0 1-.76-2.118q0-.441.1-.87c.05-.2.1-.41.26-.5a.58.58 0 0 1 .54 0q.58.277 1.079.68a2.54 2.54 0 0 0 1.08.51a1.2 1.2 0 0 0 .769-.15c.312-.195.595-.434.84-.71c.14-.14.27-.31.45-.33c.263-.028.529.003.779.09c.743.409 1.54.709 2.369.89q.345.017.68-.07c.64-.17 1.179-.69 1.869-.76a2 2 0 0 1 .42 0q.186.01.36.08c.4.15.629.28.689.48a.6.6 0 0 1-.14.46c-.52.81-1.82 1.67-2.249 2.279q-.582.9-1.06 1.859c-.25.45.44.44.67 0c.44-.56.57-.9 1-1.47a17 17 0 0 1 1.649-1.449c.46-.373.807-.868 1-1.429c.13-.58-.1-1.2-1.2-1.68a2.3 2.3 0 0 0-.63-.17a4 4 0 0 0-.61 0a7 7 0 0 0-1.828.7a1.3 1.3 0 0 1-.55.09c-.84-.06-1.38-.6-2.07-.84A2.9 2.9 0 0 0 13.72.017a1.54 1.54 0 0 0-.72.3c-.25.19-.489.46-.739.69s-.23.26-.39.24a1.7 1.7 0 0 1-.6-.31a6.6 6.6 0 0 0-1.269-.76a1.53 1.53 0 0 0-1.4.11a1.4 1.4 0 0 0-.549.73c-.15.478-.217.978-.2 1.479a3.65 3.65 0 0 0 1.08 2.599a8.4 8.4 0 0 0 2.359 1.459c.35.14.54-.2.12-.49" /><path d="M11.92 7.682a15 15 0 0 0 1.6.43q.496.086.999.11q.5.037 1 0c.45 0 3.048-.49 2.858-1a.3.3 0 0 0-.38-.27c-1.728.33-3.501.35-5.237.06q-.735-.14-1.48-.2a5.15 5.15 0 0 0-3.088.06a7.3 7.3 0 0 0-1.859 1c-.82.59-1.55 1.32-2.319 2h-.01q-.405.04-.8.14q-.447.135-.87.339c-.57.28-1.07.683-1.468 1.18a2.4 2.4 0 0 0-.51 1.299a.91.91 0 0 0 .87 1a3.64 3.64 0 0 0 1.929-.45q.269-.175.5-.4q.247-.203.45-.45q.374-.425.629-.93a3.8 3.8 0 0 0 .32-1a.31.31 0 0 0-.24-.379a.3.3 0 0 0-.14 0c.74-.49 1.48-1 2.229-1.46a12 12 0 0 1 1.669-.869a5.7 5.7 0 0 1 1.949-.46c.478-.012.954.073 1.4.25m-7.496 2.769c-.078.29-.2.566-.36.82a2.9 2.9 0 0 1-.58.68q-.194.177-.41.329q-.21.162-.45.28a3.2 3.2 0 0 1-.719.2a4 4 0 0 1-.45.07a1.52 1.52 0 0 1 .39-.89a3.7 3.7 0 0 1 .88-.85a5 5 0 0 1 .71-.4q.35-.162.73-.24a.35.35 0 0 0 .259-.06l.07-.049s-.06.06-.07.11" /><path d="M23.205 15.938c-.68-1.4-2-2.609-2.879-3.898a8.8 8.8 0 0 1-.93-1.839c-.35-.89-.599-1.46-.889-2.359c-.1-.23-.68.09-.5.36c.27.89.39 1.37.71 2.259c.265.698.6 1.368 1 1.999c.69 1.1 1.739 2.139 2.428 3.288a3.52 3.52 0 0 1 .6 2.31c-.33 2.598-2.419 3.997-4.998 4.577c-2.241.457-4.562.34-6.746-.34a9.1 9.1 0 0 1-3.848-2.159a4.4 4.4 0 0 1-1.24-2.898a10.6 10.6 0 0 1 1.26-4.998c.415-.806.933-1.555 1.539-2.229a15 15 0 0 1 1.879-1.859c.38-.54 0-.63-.54-.36q-.991.826-1.849 1.79a12.2 12.2 0 0 0-1.7 2.358a11.3 11.3 0 0 0-1.498 5.338a5.3 5.3 0 0 0 1.439 3.568a9.9 9.9 0 0 0 4.248 2.499c2.356.733 4.86.853 7.276.35c2.999-.68 5.338-2.48 5.668-5.528a4.23 4.23 0 0 0-.43-2.229" /><path d="M9.881 10.57a5 5 0 0 0-.13 1.15a6.3 6.3 0 0 0 .39 2.43a2.6 2.6 0 0 0-.48 1.279c-.045.51.041 1.022.25 1.489c.22.47.517.899.88 1.27c.223.212.505.351.81.399a1.12 1.12 0 0 0 1.169-.8l.15-.62q.015-.213 0-.43a6 6 0 0 0-.07-.569a5 5 0 0 0-.14-.62a3.6 3.6 0 0 0-.27-.6a3 3 0 0 0-.52-.619c-.26-.24-.55-.45-.84-.68a.3.3 0 0 0-.34 0a8 8 0 0 1 .09-2.159c.09-.54.2-1.07.34-1.599q.19-.964.55-1.879c0-.38-.4-.3-.65 0c-.35.439-.645.919-.879 1.43a6 6 0 0 0-.31 1.129m.72 3.999a.31.31 0 0 0 .2-.24q.28.25.53.53a2.3 2.3 0 0 1 .32.49q.087.212.13.44q.028.24 0 .48v.739l-.08.29c-.12.23 0 .22-.29 0a3.9 3.9 0 0 1-.74-.87a2.2 2.2 0 0 1-.34-1c.017-.304.11-.6.27-.86" /></g></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">
                                            {MontantCompteInterne !== null ? MontantCompteInterne.toLocaleString('fr') : 0} Fbu
                                        </h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                                style={{ strokeWidth: '3px', stroke: 'var(--pink-500)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="d-flex  align-items-center " style={{ fontSize: 13 }}>
                                    <div className="cursor-pointer z-2">
                                        Caisse : <span style={{ fontWeight: 'bold' }}>
                                            {Montantcaisse !== null ? Montantcaisse.toLocaleString('fr') : 0} Fbu
                                        </span>
                                    </div>
                                    <span className="mx-1">|</span>
                                    <div className="">
                                        Bancaire : <span style={{ fontWeight: 'bold' }}>
                                            {Montantbancaire !== null ? Montantbancaire.toLocaleString('fr') : 0} Fbu

                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(125 126 31 / 90%), rgba(18 ,9 ,117, 0.30))' }}>

                                <span className="font-semibold text-lg mobilecolotitre">Cotisations</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/userclient.png" alt="" className="img-mobile" style={{ height: '30px', width: '30px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 24 24">
                                        <g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                            <path d="M15 11v.01M5.173 8.378a3 3 0 1 1 4.656-1.377" />
                                            <path d="M16 4v3.803A6.02 6.02 0 0 1 18.658 11h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1.342c-.336.95-.907 1.8-1.658 2.473V19.5a1.5 1.5 0 0 1-3 0v-.583a6 6 0 0 1-1 .083h-4a6 6 0 0 1-1-.083v.583a1.5 1.5 0 0 1-3 0v-2.027A6 6 0 0 1 8.999 7h2.5z" />
                                        </g>
                                    </svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">
                                            {CapitalTotalCotisationsMembres !== null ? CapitalTotalCotisationsMembres.toLocaleString('fr') : 0} Fbu

                                        </h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                                style={{ strokeWidth: '3px', stroke: 'var(--pink-500)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(145 130 143 / 90%), rgba(18 ,9 ,117, 0.30))' }}>

                                <span className="font-semibold text-lg mobilecolotitre">Pénalités</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/userclient.png" alt="" className="img-mobile" style={{ height: '30px', width: '30px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 24 24"><g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M22 18H6a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2" /><path d="M17 14V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v10" /><rect width="13" height="8" x="8" y="6" rx="1" /><circle cx="18" cy="20" r="2" /><circle cx="9" cy="20" r="2" /></g></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">
                                            {Pénalités !== null ? Pénalités.toLocaleString('fr') : 0} Fbu
                                        </h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                                style={{ strokeWidth: '3px', stroke: 'var(--pink-500)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(196 171 87 / 90%), rgba(241, 49, 83, 0.30))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Frais d’adhésion</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/billet bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 24 24"><path fill="white" d="M4 13v2h16v-2zM4 2h16q.825 0 1.413.588T22 4v11q0 .825-.587 1.413T20 17h-4v5l-4-2l-4 2v-5H4q-.825 0-1.412-.587T2 15V4q0-.825.588-1.412T4 2m0 8h16V4H4zm0 5V4z" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{CapitalTotalFraisAdhions !== null ? CapitalTotalFraisAdhions.toLocaleString('fr') : 0} Fbu </h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                                    20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                                    40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                                        8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                                        82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                                        100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>


                            </div>
                        </div>



                        <div className="col-12 md:col-6 xl:col-3 mobilecolo ">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(244 120 194 / 90%), rgba(241, 49, 83, 0.30))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Commission</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/billet bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 48 48"><rect width="30.304" height="19.602" x="8.867" y="15.444" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx="2.91" ry="2.91" transform="rotate(-15.009 24.02 25.245)" stroke-width="1" /><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" d="M15.1 15.2c-.398-1.49.475-3 1.96-3.4l6.57-1.76c1.48-.398 3 .479 3.39 1.97" stroke-width="1" /><rect width="5.871" height="4.45" x="12.354" y="23.729" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx=".649" ry=".649" transform="rotate(-15.009 15.289 25.954)" stroke-width="1" /><path fill="none" stroke="white" stroke-dasharray="0 0 5 3" stroke-linecap="round" stroke-linejoin="round" d="m14.7 31.4l20-5.37" stroke-width="1" /><circle cx="24" cy="24" r="21.5" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{CapitalTotalCommissionRemboursement !== null ? CapitalTotalCommissionRemboursement.toLocaleString('fr') : 0} Fbu  </h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                  20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                  40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                    8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                    82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                    100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6 xl:col-3 mobilecolo ">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(245 125 194 / 90%), rgba(143, 165, 18, 0.8))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Depenses</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/billet bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 48 48"><rect width="30.304" height="19.602" x="8.867" y="15.444" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx="2.91" ry="2.91" transform="rotate(-15.009 24.02 25.245)" stroke-width="1" /><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" d="M15.1 15.2c-.398-1.49.475-3 1.96-3.4l6.57-1.76c1.48-.398 3 .479 3.39 1.97" stroke-width="1" /><rect width="5.871" height="4.45" x="12.354" y="23.729" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx=".649" ry=".649" transform="rotate(-15.009 15.289 25.954)" stroke-width="1" /><path fill="none" stroke="white" stroke-dasharray="0 0 5 3" stroke-linecap="round" stroke-linejoin="round" d="m14.7 31.4l20-5.37" stroke-width="1" /><circle cx="24" cy="24" r="21.5" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{MontantDepenses !== null ? MontantDepenses.toLocaleString('fr') : 0} Fbu  </h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                  20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                  40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                    8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                    82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                    100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo ">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(245 125 194 / 90%), rgba(21, 163, 75, 0.8))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Intérêts Estimatif</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/billet bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 48 48"><rect width="30.304" height="19.602" x="8.867" y="15.444" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx="2.91" ry="2.91" transform="rotate(-15.009 24.02 25.245)" stroke-width="1" /><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" d="M15.1 15.2c-.398-1.49.475-3 1.96-3.4l6.57-1.76c1.48-.398 3 .479 3.39 1.97" stroke-width="1" /><rect width="5.871" height="4.45" x="12.354" y="23.729" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx=".649" ry=".649" transform="rotate(-15.009 15.289 25.954)" stroke-width="1" /><path fill="none" stroke="white" stroke-dasharray="0 0 5 3" stroke-linecap="round" stroke-linejoin="round" d="m14.7 31.4l20-5.37" stroke-width="1" /><circle cx="24" cy="24" r="21.5" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{InteretsEstimatif !== null ? InteretsEstimatif.toLocaleString('fr') : 0} Fbu  </h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                  20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                  40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                    8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                    82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                    100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className="col-12 md:col-6 xl:col-3 mobilecolo ">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(245 125 194 / 100%), rgba(115, 83, 233, 0.8))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Intérêts reél</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/billet bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="40" viewBox="0 0 48 48"><rect width="30.304" height="19.602" x="8.867" y="15.444" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx="2.91" ry="2.91" transform="rotate(-15.009 24.02 25.245)" stroke-width="1" /><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" d="M15.1 15.2c-.398-1.49.475-3 1.96-3.4l6.57-1.76c1.48-.398 3 .479 3.39 1.97" stroke-width="1" /><rect width="5.871" height="4.45" x="12.354" y="23.729" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" rx=".649" ry=".649" transform="rotate(-15.009 15.289 25.954)" stroke-width="1" /><path fill="none" stroke="white" stroke-dasharray="0 0 5 3" stroke-linecap="round" stroke-linejoin="round" d="m14.7 31.4l20-5.37" stroke-width="1" /><circle cx="24" cy="24" r="21.5" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{InteretsReel !== null ? InteretsReel.toLocaleString('fr') : 0} Fbu  </h4>
                                    </div>
                                    <div className="w-3" >
                                        <svg width="100%" viewBox="0 0 103 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 
                  20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002
                  40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083
                    8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 
                    82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 
                    100.59 7.6798L102 8.23734"  style={{ strokeWidth: '3px', stroke: "#6366F1" }} ></path>
                                        </svg>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="col-12 md:col-6 xl:col-3 mobilecolo">
                            <div className="card h-full text-light"
                                style={{ background: 'linear-gradient(rgba(233 123 147), rgba(253, 2, 2, 0.3))' }}>
                                <span className="font-semibold text-lg mobilecolotitre">Total Caisse social</span>
                                <div className="flex justify-content-between align-items-start mt-3">
                                    {/* <img src="../images/bif bleu.png" alt="" className="img-mobile" style={{ height: '40px', width: '40px' }} /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="img-mobile" width="50" height="40" viewBox="0 0 512 512"><path fill="white" d="M298.9 24.31c-14.9.3-25.6 3.2-32.7 8.4l-97.3 52.1l-54.1 73.59c-11.4 17.6-3.3 51.6 32.3 29.8l39-51.4c49.5-42.69 150.5-23.1 102.6 62.6c-23.5 49.6-12.5 73.8 17.8 84l13.8-46.4c23.9-53.8 68.5-63.5 66.7-106.9l107.2 7.7l-1-112.09zM244.8 127.7c-17.4-.3-34.5 6.9-46.9 17.3l-39.1 51.4c10.7 8.5 21.5 3.9 32.2-6.4c12.6 6.4 22.4-3.5 30.4-23.3c3.3-13.5 8.2-23 23.4-39m-79.6 96c-.4 0-.9 0-1.3.1c-3.3.7-7.2 4.2-9.8 12.2c-2.7 8-3.3 19.4-.9 31.6c2.4 12.1 7.4 22.4 13 28.8c5.4 6.3 10.4 8.1 13.7 7.4c3.4-.6 7.2-4.2 9.8-12.1c2.7-8 3.4-19.5 1-31.6c-2.5-12.2-7.5-22.5-13-28.8c-4.8-5.6-9.2-7.6-12.5-7.6m82.6 106.8c-7.9.1-17.8 2.6-27.5 7.3c-11.1 5.5-19.8 13.1-24.5 20.1c-4.7 6.9-5.1 12.1-3.6 15.2c1.5 3 5.9 5.9 14.3 6.3c8.4.5 19.7-1.8 30.8-7.3s19.8-13 24.5-20c4.7-6.9 5.1-12.2 3.6-15.2c-1.5-3.1-5.9-5.9-14.3-6.3c-1.1-.1-2.1-.1-3.3-.1m-97.6 95.6c-4.7.1-9 .8-12.8 1.9c-8.5 2.5-13.4 7-15 12.3c-1.7 5.4 0 11.8 5.7 18.7c5.8 6.8 15.5 13.3 27.5 16.9c11.9 3.6 23.5 3.5 32.1.9c8.6-2.5 13.5-7 15.1-12.3c1.6-5.4 0-11.8-5.8-18.7c-5.7-6.8-15.4-13.3-27.4-16.9c-6.8-2-13.4-2.9-19.4-2.8" /></svg>
                                    <div className="w-6">
                                        <h4 className="ml-0 mb-0 dashboard-title coutmobile">{CaisseSocial !== null ? CaisseSocial.toLocaleString('fr') : 0} Fbu  </h4>
                                    </div>
                                    <div className="w-4">
                                        <svg width="100%" viewBox="0 0 115 41" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 35.6498L2.24444 32.4319C3.48889 29.214 5.97778 22.7782 8.46667 20.3627C10.9556 17.9473 13.4444 19.5522 15.9333 21.7663C18.4222 23.9803 20.9111 26.8035 23.4 30.6606C25.8889 34.5176 28.3778 39.4085 30.8667 37.2137C33.3556 35.0189 35.8444 25.7383 38.3333 26.3765C40.8222 27.0146 43.3111 37.5714 45.8 38.9013C48.2889 40.2311 50.7778 32.3341 53.2667 31.692C55.7556 31.0499 58.2444 37.6628 60.7333 39.4617C63.2222 41.2607 65.7111 38.2458 68.2 34.9205C70.6889 31.5953 73.1778 27.9597 75.6667 23.5955C78.1556 19.2313 80.6444 14.1385 83.1333 13.8875C85.6222 13.6365 88.1111 18.2272 90.6 20.2425C93.0889 22.2578 95.5778 21.6977 98.0667 18.8159C100.556 15.9341 103.044 10.7306 105.533 7.37432C108.022 4.01806 110.511 2.50903 111.756 1.75451L113 1"
                                                style={{ strokeWidth: '3px', stroke: 'var(--primary-color)' }}>
                                            </path>
                                        </svg>
                                    </div>
                                </div>

                                <div className="d-flex  align-items-center " style={{ fontSize: 13 }}>
                                    <div className="cursor-pointer z-2">
                                        Solde disponible : <span style={{ fontWeight: 'bold' }}>
                                            {CaisseSocialSoldedisponible !== null ? CaisseSocialSoldedisponible.toLocaleString('fr') : 0} Fbu
                                        </span>
                                    </div>
                                    <span className="mx-1"></span>

                                </div>
                            </div>
                        </div>



                        <Dashboardpartieun dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                        <DashboardPerformancesMansuelles dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                        <DashboardEcheance dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                        <DashboardCotisationsDixDerniersActivites dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
                    </div>

                </div>

            )}
        </>
    )
}







