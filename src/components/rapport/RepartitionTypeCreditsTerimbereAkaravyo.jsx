import { Card } from "primereact/card";
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import moment from "moment";
import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import LZString from "lz-string";
import { io } from "socket.io-client";

export default function RepartitionTypeCreditsTerimbereAkaravyo({ dates, loading, setLoading, refresh }) {
  // const [filteredCreditsAkaravyo, setfilteredCreditsAkaravyo] = useState([]);
  // const [filteredCreditsTerimbere, setfilteredCreditsTerimbere] = useState([]);
  // const [filteredCreditsAkaravyoNombre, setfilteredCreditsAkaravyoNombre] = useState([]);
  // const [filteredCreditsTerimbereNombre, setfilteredCreditsTerimbereNombre] = useState([]);
  // const [allcredits, setallcredits] = useState([]);
  // const [allcreditsnombre, setallcreditsnombre] = useState([]);
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);

  // const fetchCredit = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     // Construction de l'URL avec paramètres de lazyState
  //     let url = `/credits/credits/fetch?rows=100000`;
  //     const res = await fetchApi(url);
  //     const all = res.result.data || [];
  //     // Mise à jour de l'état général
  //     setallcredits(all);
  //     setallcreditsnombre(all.length);

  //     // Filtrage selon le type de crédit
  //     const terimbere = all.filter(
  //       c => parseInt(c.ID_TYPES_CREDIT) === 1 
  //       && parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
  //     );

  //     const akaravyo = all.filter(
  //       c => parseInt(c.ID_TYPES_CREDIT) === 2 
  //       && parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
  //     );

  //     // const terimbere = all.filter(c => parseInt(c.ID_TYPES_CREDIT) === 1);
  //     // const akaravyo = all.filter(c => parseInt(c.ID_TYPES_CREDIT) === 2);

  //     setfilteredCreditsTerimbere(terimbere);
  //     setfilteredCreditsAkaravyo(akaravyo);

  //     setfilteredCreditsTerimbereNombre(terimbere.length);
  //     setfilteredCreditsAkaravyoNombre(akaravyo.length);
  //     // Application du filtre par date si nécessaire
  //     let filtered = all;
  //     if (startDate && endDate) {
  //       const start = moment(startDate).startOf("day");
  //       const end = moment(endDate).endOf("day");

  //       filtered = all.filter((credit) => {
  //         const dateDemande = moment(credit.DATE_DEMANDE);
  //         return dateDemande.isBetween(start, end, null, "[]");
  //       });
  //     }



  //   } catch (error) {
  //     console.error("❌ Erreur dans fetchCredit :", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [startDate, endDate,]);

  // useEffect(() => {
  //   fetchCredit();
  // }, [fetchCredit]);

  const [filteredCreditsAkaravyo, setfilteredCreditsAkaravyo] = useState([]);
  const [filteredCreditsTerimbere, setfilteredCreditsTerimbere] = useState([]);
  const [filteredCreditsAkaravyoNombre, setfilteredCreditsAkaravyoNombre] = useState(0);
  const [filteredCreditsTerimbereNombre, setfilteredCreditsTerimbereNombre] = useState(0);
  const [allcredits, setallcredits] = useState([]);
  const [allcreditsnombre, setallcreditsnombre] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fonction de récupération
  // const fetchCredit = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     let url = `/credits/credits/fetch?rows=100000`;
  //     const res = await fetchApi(url);

  //     const all = res.result?.data || [];

  //     // Mise à jour état général
  //     setallcredits(all);
  //     setallcreditsnombre(all.length);

  //     // Séparation par type
  //     const terimbere = all.filter(
  //       c => parseInt(c.ID_TYPES_CREDIT) === 1 &&
  //         parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
  //     );

  //     const akaravyo = all.filter(
  //       c => parseInt(c.ID_TYPES_CREDIT) === 2 &&
  //         parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
  //     );

  //     setfilteredCreditsTerimbere(terimbere);
  //     setfilteredCreditsAkaravyo(akaravyo);
  //     setfilteredCreditsTerimbereNombre(terimbere.length);
  //     setfilteredCreditsAkaravyoNombre(akaravyo.length);

  //     // Application filtre par date
  //     let filtered = all;
  //     if (startDate && endDate) {
  //       const start = moment(startDate).startOf("day");
  //       const end = moment(endDate).endOf("day");

  //       filtered = all.filter(credit => {
  //         const dateDemande = moment(credit.DATE_DEMANDE);
  //         return dateDemande.isBetween(start, end, null, "[]");
  //       });

  //       // si besoin tu peux remplacer l’état "allcredits" par les filtrés
  //       setallcredits(filtered);
  //       setallcreditsnombre(filtered.length);
  //     }

  //     // Sauvegarde dans localStorage
  //     localStorage.setItem("dashboardCredits", JSON.stringify({
  //       all,
  //       terimbere,
  //       akaravyo,
  //     }));

  //   } catch (error) {
  //     console.error("❌ Erreur dans fetchCredit :", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [startDate, endDate]);

  // useEffect(() => {
  //   // ⚡ 1. Charger depuis localStorage
  //   const cached = localStorage.getItem("dashboardCredits");
  //   if (cached) {
  //     const parsed = JSON.parse(cached);
  //     setallcredits(parsed.all || []);
  //     setallcreditsnombre(parsed.all?.length || 0);
  //     setfilteredCreditsTerimbere(parsed.terimbere || []);
  //     setfilteredCreditsAkaravyo(parsed.akaravyo || []);
  //     setfilteredCreditsTerimbereNombre(parsed.terimbere?.length || 0);
  //     setfilteredCreditsAkaravyoNombre(parsed.akaravyo?.length || 0);
  //   }

  //   // ⚡ 2. Fetch API en arrière-plan
  //   fetchCredit();

  //   // ⚡ 3. Synchro auto toutes les 2 minutes
  //   const interval = setInterval(fetchCredit, 120000);
  //   return () => clearInterval(interval);

  // }, [fetchCredit]);

  const CACHE_NAME = "credits_cache";

  // Construire une clé unique pour le cache
  const buildCacheKey = () => {
    let key = "dashboardCredits_";
    if (startDate && endDate) key += `${startDate.toISOString()}_${endDate.toISOString()}_`;
    return key;
  };

  const fetchCredit = useCallback(async () => {
    try {
      setLoading(true);

      // ⚡ 1. Construire l'URL
      let url = `/credits/credits/fetch?rows=100000`;
      const res = await fetchApi(url);
      const all = res.result?.data || [];

      // ⚡ 2. Séparer par type
      const terimbere = all.filter(
        c => parseInt(c.ID_TYPES_CREDIT) === 1 &&
          parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
      );
      const akaravyo = all.filter(
        c => parseInt(c.ID_TYPES_CREDIT) === 2 &&
          parseInt(c.ID_STATUTS_CREDIT) !== ID_STATUTS_CREDIT.ANNULE
      );

      // ⚡ 3. Filtre par date
      let filtered = all;
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day");
        const end = moment(endDate).endOf("day");
        filtered = all.filter(c => {
          const dateDemande = moment(c.DATE_DEMANDE);
          return dateDemande.isBetween(start, end, null, "[]");
        });
      }

      // ⚡ 4. Mettre à jour les états
      setallcredits(filtered);
      setallcreditsnombre(filtered.length);
      setfilteredCreditsTerimbere(terimbere);
      setfilteredCreditsAkaravyo(akaravyo);
      setfilteredCreditsTerimbereNombre(terimbere.length);
      setfilteredCreditsAkaravyoNombre(akaravyo.length);

      // ⚡ 5. Sauvegarder dans Cache Storage compressé
      if ("caches" in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const compressed = LZString.compressToUTF16(
            JSON.stringify({ all, terimbere, akaravyo, expiresAt: Date.now() + 120000 })
          );
          const response = new Response(compressed, { headers: { "Content-Type": "text/plain" } });
          await cache.put(buildCacheKey(), response);
        } catch (err) {
          console.warn("Erreur sauvegarde cache :", err);
        }
      }

    } catch (error) {
      console.error("❌ Erreur dans fetchCredit :", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const loadFromCache = async () => {
      if (!("caches" in window)) return false;

      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(buildCacheKey());
        if (!cachedResponse) return false;

        const compressed = await cachedResponse.text();
        const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

        if (Date.now() <= parsed.expiresAt) {
          console.log("✅ Chargé depuis cache");
          setallcredits(parsed.all || []);
          setallcreditsnombre(parsed.all?.length || 0);
          setfilteredCreditsTerimbere(parsed.terimbere || []);
          setfilteredCreditsAkaravyo(parsed.akaravyo || []);
          setfilteredCreditsTerimbereNombre(parsed.terimbere?.length || 0);
          setfilteredCreditsAkaravyoNombre(parsed.akaravyo?.length || 0);
          return true;
        } else {
          await cache.delete(buildCacheKey());
        }
      } catch (err) {
        console.warn("Erreur chargement cache :", err);
      }
      return false;
    };

    const init = async () => {
      const hasCache = await loadFromCache();
      if (!hasCache) await fetchCredit();
    };

    init();

    const interval = setInterval(() => fetchCredit(), 120000); // sync auto toutes les 2 min
    return () => clearInterval(interval);
  }, [fetchCredit]);

  // Calculs
  const pourcent = 100;
  const total = filteredCreditsTerimbereNombre + filteredCreditsAkaravyoNombre;
  const pourcentageTerimbere = total > 0 ? (filteredCreditsTerimbereNombre * pourcent) / total : 0;
  const pourcentageAkaravyo = total > 0 ? (filteredCreditsAkaravyoNombre * pourcent) / total : 0;
  // Configuration du graphique

  const chartData = [
    { name: "Crédit Terimbere", y: pourcentageTerimbere, color: '#3F51B5' },
    { name: "Crédit Akaravyo", y: pourcentageAkaravyo, color: '#dc3545' },
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
        depth: 350,
        dataLabels: {
          enabled: true // Désactiver les étiquettes de données si souhaité
        },
        tooltip: {
          pointFormat: '{point.name}: <b>{point.y:.2f}%</b>' // Affiche le nom et le pourcentage
        }
      }
    },
    series: [{
      name: 'Types de crédit',
      data: chartData,
      cursor: 'pointer',
    }],
  };

  return (
    <>
      <span className="font-semibold text-lg">Répartitions des types des crédits</span>
      <HighchartsReact
        highcharts={Highcharts}
        options={optionsPie}
      />
    </>

  );
}













