import { Card } from "primereact/card";
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useCallback, useEffect, useState } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
  import LZString from "lz-string";
import { io } from "socket.io-client";
import socket from '../../utils/socket';

import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
export default function InteretTotalEstimeRecu({ dates, refresh, setLoading }) {
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  // const [filteredMontantTotalInteretsRecu, setfilteredMontantTotalInteretsRecu] = useState(0);
  // const [filteredMontantTotlInteretEstime, setfilteredMontantTotlInteretEstime] = useState(0);
  // const [credits, setCredits] = useState([]);
  // const [ecritures, setEcritures] = useState([]);

  // // Récupération des crédits et calcul des intérêts estimés
  // const fetchCredit = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     let url = `/credits/credits/fetch?rows=100000`;
  //     const res = await fetchApi(url);
  //     const all = res.result.data || [];

  //     // const totalInteretEstime = all.reduce((total, credit) => {
  //     //   return total + parseFloat(credit.INTERET_TOTAL || 0);
  //     // }, 0);
  //     const totalInteretEstime = all
  //       .filter(credit => parseInt(credit.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE)
  //       .reduce((total, credit) => {
  //         return total + parseFloat(credit.INTERET_TOTAL || 0);
  //       }, 0);

  //     setfilteredMontantTotlInteretEstime(totalInteretEstime);
  //     setCredits(all);
  //   } catch (error) {
  //     console.error("❌ Erreur dans fetchCredit :", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);


  // // Récupération des écritures et calcul des intérêts réellement reçus
  // const fetchEcritures = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     let url = `/plancomptable/ecriturecomptable/fetch?rows=100000000&`;
  //     if (dates) {
  //       const [startDate, endDate] = dates;
  //       if (startDate) url += `startDate=${startDate.toISOString()}&`;
  //       if (endDate) url += `endDate=${endDate.toISOString()}&`;
  //     }

  //     const res = await fetchApi(url);
  //     const all = res.result.data || [];
  //     const totalMontantCredit6 = all
  //       .filter(ecriture => ecriture?.COMPTE_CREDIT === 6 && ecriture?.STATUT === 0)
  //       .reduce((total, ecriture) => total + parseFloat(ecriture.MONTANT || 0), 0);

  //     setfilteredMontantTotalInteretsRecu(totalMontantCredit6);
  //     setEcritures(all);
  //   } catch (error) {
  //     console.error("❌ Erreur dans fetchEcritures :", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [dates]);

  // useEffect(() => {
  //   const fetchAll = async () => {
  //     try {
  //       setLoading(true);
  //       await fetchCredit();
  //       await fetchEcritures();
  //     } catch (e) {
  //       console.error("Erreur fetchAll", e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAll();
  // }, [dates]);
  const [startDate, setStartDate] = useState(null);

  const [endDate, setEndDate] = useState(null);

  const [filteredMontantTotalInteretsRecu, setfilteredMontantTotalInteretsRecu] = useState(0);
  const [filteredMontantTotlInteretEstime, setfilteredMontantTotlInteretEstime] = useState(0);

  const [credits, setCredits] = useState([]);
  const [ecritures, setEcritures] = useState([]);


const CACHE_CREDITS = "dashboainteretsestime_cache";
const CACHE_ECRITURES = "dashboardEcritures_cache";

// Construire une clé dynamique pour les dates
const buildCacheKey = (prefix) => {
  if (!dates) return prefix;
  const [startDate, endDate] = dates;
  return `${prefix}_${startDate?.toISOString() || ""}_${endDate?.toISOString() || ""}`;
};

/**
 * 🔹 Fetch des crédits pour calculer les intérêts estimés
 */
const fetchCredit = useCallback(async () => {
  try {
    setLoading(true);

    let url = `/credits/credits/fetch?rows=100000`;
    const res = await fetchApi(url);
    const all = res.result?.data || [];

    const totalInteretEstime = all
      .filter(c => parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE)
      .reduce((total, c) => total + parseFloat(c.INTERET_TOTAL || 0), 0);

    setfilteredMontantTotlInteretEstime(totalInteretEstime);
    setCredits(all);

    // 💾 Sauvegarde compressée dans Cache Storage (expire 2 min)
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_CREDITS);
        const compressed = LZString.compressToUTF16(JSON.stringify({
          credits: all,
          totalInteretEstime,
          expiresAt: Date.now() + 120000,
        }));
        const response = new Response(compressed, { headers: { "Content-Type": "text/plain" } });
        await cache.put(buildCacheKey(CACHE_CREDITS), response);
      } catch (err) {
        console.warn("Erreur cache fetchCredit :", err);
      }
    }

  } catch (error) {
    console.error("❌ Erreur dans fetchCredit :", error);
  } finally {
    setLoading(false);
  }
}, [dates, setLoading]);

/**
 * 🔹 Fetch des écritures comptables pour calculer les intérêts réellement encaissés
 */
const fetchEcritures = useCallback(async () => {
  try {
    setLoading(true);

    let url = `/plancomptable/ecriturecomptable/fetch?rows=100000000&`;
    if (dates) {
      const [startDate, endDate] = dates;
      if (startDate) url += `startDate=${startDate.toISOString()}&`;
      if (endDate) url += `endDate=${endDate.toISOString()}&`;
    }

    const res = await fetchApi(url);
    const all = res.result?.data || [];

    const totalMontantCredit6 = all
      .filter(e => e?.COMPTE_CREDIT === 6 && e?.STATUT === 0)
      .reduce((total, e) => total + parseFloat(e.MONTANT || 0), 0);

    setfilteredMontantTotalInteretsRecu(totalMontantCredit6);
    setEcritures(all);

    // 💾 Sauvegarde compressée dans Cache Storage (expire 2 min)
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_ECRITURES);
        const compressed = LZString.compressToUTF16(JSON.stringify({
          ecritures: all,
          totalInteretRecu: totalMontantCredit6,
          expiresAt: Date.now() + 120000,
        }));
        const response = new Response(compressed, { headers: { "Content-Type": "text/plain" } });
        await cache.put(buildCacheKey(CACHE_ECRITURES), response);
      } catch (err) {
        console.warn("Erreur cache fetchEcritures :", err);
      }
    }

  } catch (error) {
    console.error("❌ Erreur dans fetchEcritures :", error);
  } finally {
    setLoading(false);
  }
}, [dates, setLoading]);

/**
 * 🔹 useEffect global
 * - Charger cache compressé si disponible
 * - Sinon fetch API
 * - Rafraîchit toutes les 2 minutes
 */
useEffect(() => {
  const loadFromCache = async (cacheName, setDataFn, setTotalFn, totalKey) => {
    if (!("caches" in window)) return false;

    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(buildCacheKey(cacheName));
      if (!cachedResponse) return false;

      const compressed = await cachedResponse.text();
      const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

      if (Date.now() <= parsed.expiresAt) {
        setDataFn(parsed[cacheName === CACHE_CREDITS ? "credits" : "ecritures"] || []);
        setTotalFn(parsed[totalKey] || 0);
        return true;
      } else {
        await cache.delete(buildCacheKey(cacheName));
      }
    } catch (err) {
      console.warn("Erreur chargement cache :", err);
    }
    return false;
  };

  const init = async () => {
    const hasCacheCredits = await loadFromCache(CACHE_CREDITS, setCredits, setfilteredMontantTotlInteretEstime, "totalInteretEstime");
    const hasCacheEcritures = await loadFromCache(CACHE_ECRITURES, setEcritures, setfilteredMontantTotalInteretsRecu, "totalInteretRecu");

    if (!hasCacheCredits || !hasCacheEcritures) {
      await Promise.all([fetchCredit(), fetchEcritures()]);
    }
  };

  init();

  const interval = setInterval(() => Promise.all([fetchCredit(), fetchEcritures()]), 120000);
  return () => clearInterval(interval);

}, [dates, fetchCredit, fetchEcritures]);


  // Calculs des pourcentages
  let Pourcentage = 100
  const total = parseInt(filteredMontantTotlInteretEstime)
  const pourcentageRecu = total > 0 ? parseInt(filteredMontantTotalInteretsRecu * Pourcentage) / total : 0;
  const pourcentageEstime = total > 0 ? (Pourcentage - pourcentageRecu) : 0;

  const chartData = [
    { name: "Intérêt reçu", y: parseFloat(pourcentageRecu.toFixed(2)), color: '#3F51B5' },
    { name: "Intérêt estimé", y: parseFloat(pourcentageEstime.toFixed(2)), color: '#dc3545' },
  ];


  const optionsPie = {
    chart: {
      type: 'pie',
      options2d: {
        enabled: true,
        alpha: 45
      },
      height: 220,
    },
    title: {
      text: '',
    },
    plotOptions: {
      pie: {
        innerSize: 90,
        size: '80%',
        depth: 350
      }
    },
    tooltip: {
      pointFormat: '<b>{point.y:.2f}%</b>'
    }
    ,

    series: [{
      name: 'Répartition',
      data: chartData,
      cursor: 'pointer',
      point: {
        events: {
          click: (e) => handleEtatStockPress(e)
        }
      },
    },
    ],
  };

  return (
    <div className="col-12 md:col-6 xl:col-5" style={{ height: "370px" }}>
      <div className="card h-full p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Crédits : Intérêts estimés / reçus
        </h2>
        <div className="d-flex ms-2 justify-content-center">
          <HighchartsReact
            highcharts={Highcharts}
            options={optionsPie}
            containerProps={{ style: { width: "100%" } }}
          />
        </div>
      </div>
    </div>
  );
}