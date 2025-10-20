
import React, { useCallback, useEffect, useState, useRef } from "react";
import fetchApi from "../../helpers/fetchApi";
import { Dialog } from 'primereact/dialog';
import { useDispatch } from "react-redux";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressBar } from "primereact/progressbar";
import InteretTotalEstimeRecu from "./InteretTotalEstimeRecu";
import { useDashboardTrigger } from "./DashboardProvider";

export default function DashboardPerformancesMansuelles({ dates, loading, setLoading, refresh }) {
  const { updateTrigger } = useDashboardTrigger();
  // const [medicatsVendus, setMedicatsVendus] = useState([])

  // const [montantTOtCreditsAccordes, setmontantTOtCreditsAccordes] = useState(null)
  // const [montantTotCreditsInterets, setmontantTotCreditsInterets] = useState(null);
  // const [montantTotCreditsRembourse, setmontantTotCreditsRembourse] = useState(null);
  // const [montantTotalDepensesCemois, setmontantTotalDepensesCemois] = useState(null);

  // // 10 meilleurs medicaments
  // const CreditsMoisEnCours = useCallback(async () => {

  //   try {
  //     setLoading(true)
  //     var url = `/rapport/NombreCreditsMoisEnCours/fetch?`;
  //     if (dates) {
  //       const startDate = dates;
  //       if (startDate) {
  //         url += `startDate= ${startDate.toString()}&`;
  //       }
  //     }
  //     const res = await fetchApi(url);
  //     const result = res.result;


  //     setmontantTOtCreditsAccordes(Number(res.result?.nombreCreditsAccordes));
  //     setmontantTotCreditsRembourse(Number(res.result.nombreCreditsRembourse));
  //     setmontantTotCreditsInterets(Number(res.result?.LesInteretsRecuCemoisencours));
  //     setmontantTotalDepensesCemois(Number(res.result?.totalChargeDepenses));
  //     // setNbreCommandeParProduits(result.nbrAllCommndes);
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // }, [dates, refresh]);



  // useEffect(() => {
  //   CreditsMoisEnCours()

  // }, [dates, refresh]);
  const [montantTOtCreditsAccordes, setmontantTOtCreditsAccordes] = useState(null);
  const [montantTotCreditsInterets, setmontantTotCreditsInterets] = useState(null);
  const [montantTotCreditsRembourse, setmontantTotCreditsRembourse] = useState(null);
  const [montantTotalDepensesCemois, setmontantTotalDepensesCemois] = useState(null);

  // Fonction de récupération
  const fetchCreditsMoisEnCours = useCallback(async () => {
    try {
      setLoading(true);

      let url = `/rapport/NombreCreditsMoisEnCours/fetch?`;
      if (dates) {
        url += `startDate=${dates.toString()}&`;
      }

      const res = await fetchApi(url);
      const newData = {
        montantTOtCreditsAccordes: Number(res.result?.nombreCreditsAccordes) || 0,
        montantTotCreditsRembourse: Number(res.result?.nombreCreditsRembourse) || 0,
        montantTotCreditsInterets: Number(res.result?.LesInteretsRecuCemoisencours) || 0,
        montantTotalDepensesCemois: Number(res.result?.totalChargeDepenses) || 0,
      };

      // Mise à jour du state
      setmontantTOtCreditsAccordes(newData.montantTOtCreditsAccordes);
      setmontantTotCreditsRembourse(newData.montantTotCreditsRembourse);
      setmontantTotCreditsInterets(newData.montantTotCreditsInterets);
      setmontantTotalDepensesCemois(newData.montantTotalDepensesCemois);

      // Sauvegarde dans localStorage
      localStorage.setItem("dashboardCreditsMois", JSON.stringify(newData));

    } catch (error) {
      console.error("Erreur lors du chargement des crédits du mois :", error);
    } finally {
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    // ⚡ 1. Charger depuis cache si dispo
    const cached = localStorage.getItem("dashboardCreditsMois");
    if (cached) {
      const parsed = JSON.parse(cached);
      setmontantTOtCreditsAccordes(parsed.montantTOtCreditsAccordes);
      setmontantTotCreditsRembourse(parsed.montantTotCreditsRembourse);
      setmontantTotCreditsInterets(parsed.montantTotCreditsInterets);
      setmontantTotalDepensesCemois(parsed.montantTotalDepensesCemois);
    }

    // ⚡ 2. Récupération API en arrière-plan
    fetchCreditsMoisEnCours();

    // ⚡ 3. Synchro auto toutes les 2 minutes
    const interval = setInterval(fetchCreditsMoisEnCours, 120000);
    return () => clearInterval(interval);

  }, [dates, refresh, fetchCreditsMoisEnCours]);

  useEffect(() => {
    fetchCreditsMoisEnCours(); // ou autre fetch spécifique
  }, [updateTrigger, dates, refresh]);

  return (
    <>
      <div className=" col-12 md:col-6 xl:col-7 ">
        <div className="card h-auto p-4">
          <div className="flex align-items-start justify-content-between mb-4" style={{ marginBottom: '2.8rem' }}>
            <span className="font-semibold text-lg">
              Performances mensuelles
            </span>
          </div>

          {/* Première ligne */}
          <div className="row g-3">
            <div className="col-12 md:col-6">
              <div
                className="card h-full text-light p-3"
                style={{ background: "linear-gradient(to bottom,rgb(30, 30, 30),rgb(8, 8, 8))" }}
              >
                <span className="fs-5 fw-semibold">
                  Crédits octroyés ce mois
                </span>
                <div className="flex justify-content-between align-items-center mt-2">
                  <h6
                    className="mb-0 coutmobile"
                    style={{ fontSize: "2rem" }}
                  >
                    {montantTOtCreditsAccordes ? montantTOtCreditsAccordes?.toLocaleString("fr") : 0} FBU
                  </h6>
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div
                className="card h-full text-light p-3"
                style={{ background: "linear-gradient(to bottom,rgb(14, 14, 14),rgb(14, 15, 14))" }}
              >
                <span className="fs-5 fw-semibold">
                  Remboursements ce mois
                </span>
                <div className="flex justify-content-between align-items-center mt-2">
                  <h6
                    className="mb-0 coutmobile"
                    style={{ fontSize: "2rem" }}
                  >
                    {montantTotCreditsRembourse ? montantTotCreditsRembourse?.toLocaleString("fr") : 0} FBU
                  </h6>
                </div>
              </div>
            </div>
          </div>

          {/* Deuxième ligne */}
          <div className="col-12 md:col-6">
            <div
              className="card h-full text-light p-3"
              style={{ background: "linear-gradient(to bottom,rgb(11, 11, 11),rgb(10, 10, 10))" }}
            >
              <span className="fs-5 fw-semibold">
                Intérêts perçus ce mois
              </span>
              <div className="flex justify-content-between align-items-center mt-2">
                <h6 className="mb-0 coutmobile" style={{ fontSize: "2rem" }}>
                  {(montantTotCreditsInterets ? montantTotCreditsInterets : 0).toLocaleString("fr")} FBU
                </h6>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Ton élément suivant, par ex.: CreditRembourseImpaye */}
      <InteretTotalEstimeRecu dates={dates} loading={loading} setLoading={setLoading} refresh={refresh} />
    </>
  );

}

