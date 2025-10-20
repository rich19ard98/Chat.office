import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import fetchApi from "../../helpers/fetchApi";
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import { userSelector } from "../../store/selectors/userSelector";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import wait from "../../helpers/wait";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/nodebu.png";
import moment from "moment";



export default function Rapport_Finnancier() {

  const initialForm = {
    //TYPE: null,
    //PARIODE: null,
    //DESCRIPTION: '',
    //PERIODE_NUMERIQUE: "",
    //DATE_BILAN: null

  };

  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const user = useSelector(userSelector);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(1);
  const [bilans, setBilan] = useState([]);
  // const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  // const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(1)
  const [Montancommission, setMontancommission] = useState(null)
  const [totalvaleurAmortissementMaintenant, settotalvaleurAmortissementMaintenant] = useState(null)
  const [dates, setDates] = useState(null);


  const navigate = useNavigate();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [totalvaleurAmortissement, setTotalvaleurAmortissement] = useState(null)
  const [totalActif, setTotalActif] = useState(null)
  const [creance, setCreance] = useState(null)

  const [banque, setBanque] = useState(null)
  const [caisse, setCaisse] = useState(null)
  const [valeurbrute, setValeur_brutte] = useState(null)
  const [totalresultant, setTotalresultant] = useState(null)
  const [CapitalCreditAccordepaspayes, setCapitalCreditAccordepaspayes] = useState(null)
  const [valeurnette, setValeur_nette] = useState(null)

  const [totalcaisse_social, setTotalcaisse_social] = useState(null)
  const [total_passif, setTotal_passif] = useState(null)
  const [montResiduel, setMontResiduel] = useState(null)
  const [totalCapital, setTotalCapital] = useState(null)
  const [TotalCharges, setTotalCharges] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null);
  const [MontantReserveGenerale, setMontantReserveGenerale] = useState(null);

  const [InteretsurcotisationAnticipe, setInteretsurcotisationAnticipe] = useState(null);
  const [MontantTotalCapital, setMontantTotalCapital] = useState(null);

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
  const [IntérêtsRapport, setIntérêtsRapport] = useState(null);
  const [cotisationAnticipe, setcotisationAnticipe] = useState(null);
  const [Fondspropres, setFondspropres] = useState(null);
  const [PénalitésRapport, setPénalitésRapport] = useState(null);
  const [Pénalités, setPénalités] = useState(null);
  const [Commission, setCommission] = useState(null);

  const [TotalMontantAmortissementAvecFiltreParPeriode, setTotalMontantAmortissementAvecFiltreParPeriode] = useState(null);

  const isMembre = user.ID_PROFIL
  const [CaisseSocialSoldedisponible, setCaisseSocialSoldedisponible] = useState(null);
  const [CaisseSocial, setCaisseSocial] = useState(null);
  const [Montantcaisse, setMontantcaisse] = useState(null);
  const [MontantDepenses, setMontantDepenses] = useState(null);
  const [Montantbancaire, setMontantbancaire] = useState(null);
  const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
  const [Interetsanticipe, setInteretsanticipe] = useState(null);

  const [CapitalTotalCotisationsMembres, setCapitalTotalCotisationsMembres] = useState(null);
  const [CapitalCotisationsMembresanticipecaissesocial, setCapitalCotisationsMembresanticipecaissesocial] = useState(null);

  const [CapitalTotalFraisAdhions, setCapitalTotalFraisAdhions] = useState(null);//FraisAdhions
  const [CapitalTotalCommissionRemboursement, setCapitalTotalCommissionRemboursement] = useState(null);
  const [InteretsReel, setInteretsReel] = useState(null);
  const [InteretsEstimatif, setInteretsEstimatif] = useState(null);
  const [Resultat, setResultat] = useState(null);
  const [TotalActive, setTotalActive] = useState();
  const [MontanPenalitesPayes, setMontanPenalitesPayes] = useState(null)
  const [periode, setPeriode] = useState([
    {
      code: 0,
      name: 'Mensuel'
    },
    {
      code: 1,
      name: 'Trimestriel'
    },
    {
      code: 2,
      name: 'Annuel'
    },

  ]);
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
    filters: {
      name: { value: "", matchMode: "contains" },
      "country.name": { value: "", matchMode: "contains" },
      company: { value: "", matchMode: "contains" },
      "representative.name": { value: "", matchMode: "contains" },
    },
  });

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {

    //   TYPE: {
    //     required: false,
    //   },
    //   DESCRIPTION: {
    //     required: false,
    //   },
    //   PERIODE: {
    //     required: false,
    //   },
    //   PERIODE_NUMERIQUE: {
    //     required: false,
    //     number: true
    //   },
    // },
    //   {
    //     PERIODE_NUMERIQUE: {
    //       required: "Ce champ est obligatoire",
    //       number: "Il faut mettre un nombre entier"
    //     },
    //     DATE_BILAN: {
    //       required: "Ce champ est obligatoire",

    //     },
    //     TYPE: {
    //       required: "Ce champ est obligatoire",

    //     },
    //     PERIODE: {
    //       required: "Ce champ est obligatoire",

    //     },
    //     DESCRIPTION: {
    //       required: "Ce champ est obligatoire",
    //     },
  });

  const dispacth = useDispatch();
  const handleVisibility = (e) => {
    setIsVisible(!isVisible);
  };
  const onPage = (event) => {
    setlazyState(event);
  };

  const onSort = (event) => {
    setlazyState(event);
  };

  const onFilter = (event) => {
    event["first"] = 0;
    setlazyState(event);
  };

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAll = event.checked;

    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(credits);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };
  const DebiteursDiverses = InteretsurcotisationAnticipe
  const Resultas = IntérêtsRapport + Interetsanticipe + Montancommission +
    InteretsurcotisationAnticipe -
    totalvaleurAmortissementMaintenant -
    TotalCharges + MontanPenalitesPayes
  const TotalActif = CapitalCreditAccordepaspayes + MontantCompteInterne + valeurnette + DebiteursDiverses
  const ProduitsInterets = IntérêtsRapport + InteretsurcotisationAnticipe + Commission + PénalitésRapport
  const TotalProduits = IntérêtsRapport + Interetsanticipe + InteretsurcotisationAnticipe + MontanPenalitesPayes + Montancommission
  const MontantTotalCharges = totalvaleurAmortissementMaintenant + TotalCharges + Resultas

  const MontantCapital = MontantTotalCapital - cotisationAnticipe - CapitalCotisationsMembresanticipecaissesocial

  const FondsPropres = MontantCapital + Resultas
  const TotalPassif = cotisationAnticipe + FondsPropres
  const fetchMontantTotalCredits = useCallback(async () => {
    try {
      setLoading(true);

      let url = "/RapportFinancier/findCoutRevenuCredits/fetch?";
      if (dates) {
        const [startDate, endDate] = dates;
        if (startDate) {
          url += `startDate=${startDate.toISOString()}&`;
        }
        if (endDate) {
          url += `endDate=${endDate.toISOString()}&`;
        }
      }
      const res = await fetchApi(url);

      // Mise à jour selon la structure du backend corrigé
      setCapitalCreditAccordeTotal(Number(res.result?.CapitalCreditAccorde) || 0);
      setMontantTotalCreditsAccordes(Number(res.result?.MontantTotalsCreditsAccordes))
      setinteretTotalCreditsAccorde(Number(res.result?.interetCreditAccordereel))
      setCapitalTotCreditRembourse(Number(res.result?.CapitalTotRembourse))
      setInteretTotalCreditRembourse(Number(res.result?.interetCreditRembourse))
      setMontantTatalCreditsRembourses(Number(res.result?.MontantTotalCreditsRembourse))
      setCapitalTotalRestantdu(Number(res.result?.CapitalRestantDu))
      setInteretTotalCapitalRestantDu(Number(res.result?.InteretCapitalRestantDu))
      setMontantToatalCapitalRestantDu(Number(res.result?.MontantCapitalRestantDu))
      setIntérêts(Number(res.result?.InteretTotdejapaye))
      setMontancommission(isNaN(Number(res.result?.Montancommission)) ? 0 : Number(res.result?.Montancommission)
      );
      setMontanPenalitesPayes(
        isNaN(Number(res.result?.MontanPenalitesPayes))
          ? 0
          : Number(res.result?.MontanPenalitesPayes)
      );
      setcotisationAnticipe(Number(res.result.CapitalCotisationsMembresanticipe))
      setCapitalCreditAccordepaspayes(Number(res.result.CapitalCreditAccordepaspayes))
      setPénalités(Number(res.result?.CapitalTotPenalite))
      setMontantcaisse(Number(res.result?.MontantTOtalCraiditDebitCaisse))
      setMontantbancaire(Number(res.result?.MontantTOtalCraiditDebitBancaire))
      setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))
      setCapitalTotalFraisAdhions(Number(res.result?.CapitalFraisAdhions))
      setInteretsurcotisationAnticipe(Number(res.result.InteretsurcotisationAnticipe))
      setCapitalTotalCommissionRemboursement(Number(res.result?.CapitalCommissionRemboursement))
      setMontantDepenses(Number(res?.result?.Depenses))
      setMontantTotalCapital(Number(res?.result?.CapitalCotisationsMembres))
      setInteretsReel(Number(res.result?.Interetsreel))
      setInteretsEstimatif(Number(res.result?.interetCreditAccordereel))
      setCaisseSocial(Number(res.result?.MontantTotalcaissesocial))
      setCaisseSocialSoldedisponible(Number(res.result.SoldeDisponibleCaisseSocial))
    } catch (error) {
      console.error("Erreur lors de la récupération des crédits :", error);
    } finally {
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    fetchMontantTotalCredits();
  }, [dates]);
  //fonction pour lister les frais d'adhesion
  const fetchBilan = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/RapportFinancier/Bilantempsreel/fetchTempsreel?`;

      var url = baseurl;
      if (dates) {
        const [startDate, endDate] = dates;
        if (startDate) {
          url += `startDate=${startDate.toISOString()}&`;
        }
        if (endDate) {
          url += `endDate=${endDate.toISOString()}&`;
        }
      }

      const res = await fetchApi(url);
      setTotalvaleurAmortissement(res.result.totalvaleurAmortissement);
      setTotalActive(res.result.TotalcreditAccordeValeurNette)
      setTotalCharges(res.result?.totalChargeDepenses)
      setTotalRecords(res.result.totalRecords);
      setTotalCapital(res.result.totalCapital)
      setMontResiduel(res.result.montResiduel)
      setTotalresultant(res.result.totalresultant)
      setCreance(res.result.creances)
      setBanque(res.result.banque)
      setMontantReserveGenerale(Number(res.result.MontantReservegenerale))
      setFondspropres(Number(res?.result?.Fonds_propres))
      setCapitalTotalCotisationsMembres(Number(res?.result?.Cotisationmembres))
      setCapitalCotisationsMembresanticipecaissesocial(Number(res.result.CapitalCotisationsMembresanticipecaissesocial))
      setTotalMontantAmortissementAvecFiltreParPeriode(Number(res.result.TotalMontantAmortissementAvecFiltreParPeriode))
      setInteretsanticipe(Number(res.result.MontantProduitsFixeAutresProduits))
      setPénalitésRapport(Number(res.result.PenalitesMontantsurcreditsretards))
      setCommission(Number(res.result.CommissionMontant))
      setIntérêtsRapport(Number(res.result.InteretTotdejapaye))
      setCaisse(res.result.caisse)
      setValeur_brutte(res.result.totalvaleurbrutte)
      setTotalcaisse_social(res.result.totalcaisse_social)
      setValeur_nette(res.result.totalvaleurnetteMaintenant)
      setTotalActif(res.result.totalActif)
      setTotal_passif(res.result.total_passif)
      settotalvaleurAmortissementMaintenant(Number(res.result.totalvaleurAmortissementMaintenant))


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, dates]);

  useEffect(() => {
    fetchBilan();
  }, [lazyState, dates]);


  useEffect(() => {
    document.title = "BILAN ET RESULTAT"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Rapport',
        name: 'Rapport Financière'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  const [period, setPeriod] = useState([
    {
      code: 0,
      name: "Mensuel"
    },
    {
      code: 1,
      name: "Trimestriel"
    },
    {
      code: 2,
      name: "Annuel"
    },
  ])


  // const [isVisiblee, setIsVisiblee] = useState(true);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const periodesSelected = async (periode) => {
    setPeriode(periode);

  };
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === "string") {
      value = value.replace(',', '.'); // remplace virgule par point
    }
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num.toFixed(2);
  };

  const handleSubmit = async (e) => {
    try {
      //   e.preventDefault();

      if (isValidate()) {
        const form = new FormData();

        form.append("BANK_N", formatNumber(MontantCompteInterne));
        form.append("BANK_N_1", 0);
        form.append("IMMOBILISATIONS_N", formatNumber(TotalMontantAmortissementAvecFiltreParPeriode));
        form.append("COTISATION_MEMBRES_N", formatNumber(cotisationAnticipe));
        form.append("CREDITEURS_DIVERS_N", 0);
        form.append("FONDS_PROPRES_N", formatNumber(FondsPropres));
        form.append("CAPITAL_N", formatNumber(MontantCapital));
        form.append("RESULTAS_N", formatNumber(Resultas));
        form.append("TOTAL_ACTIF_N", formatNumber(TotalActif));
        form.append("CREDITS_ACCORDE_N_1", 0);
        form.append("DIBITEUR_DIVERS_N_1", 0);
        form.append("IMMOBILISATIONS_N_1", 0);
        form.append("COTISATION_MEMBRES_N_1", 0);
        form.append("CREDITEURS_DIVERS_N_1", 0);
        form.append("FONDS_PROPRES_N_1", 0);
        form.append("CAPITAL_N_1", 0);
        form.append("REPORT_NOUVEAU_N_1", 0);
        form.append("REPORT_NOUVEAU_N", formatNumber(MontantReserveGenerale));
        form.append("RESULTAS_N_1", 0);
        form.append("TOTAL_PASSIF_N_1", 0);
        form.append("TOTAL_ACTIF_N_1", 0);
        form.append("PRODUIT_INTERET_N", formatNumber(ProduitsInterets));
        form.append("AUTRE_CHARGE_N", formatNumber(TotalMontantAmortissementAvecFiltreParPeriode));
        form.append("AUTRE_PRODUIT_N", formatNumber(InteretsurcotisationAnticipe));
        form.append("RESULTAT_DEFICITAIRE_N", Resultas < 0 ? formatNumber(Resultas) : 0);
        form.append("TOTAL_PRODUIT_N", formatNumber(TotalProduits));
        form.append("FRAIS_FONCTIONNEMENT_N_1", 0);
        form.append("CREDITS_ACCORDE_N", formatNumber(CapitalCreditAccordepaspayes));
        form.append("DIBITEUR_DIVERS_N", formatNumber(InteretsurcotisationAnticipe));
        form.append("AUTRE_CHARGE_N_1", 0);
        form.append("AUTRE_PRODUIT_N_1", 0);
        form.append("FRAIS_FONCTIONNEMENT_N", formatNumber(TotalCharges));
        form.append("RESULTAT_BENEFICIAIRE_N_1", 0);
        form.append("RESULTAT_BENEFICIAIRE_N", Resultas > 0 ? formatNumber(Resultas) : 0);
        form.append("RESULTAT_DEFICITAIRE_N_1", 0);
        form.append("TOTAL_CHARGE_N_1", 0);
        form.append("TOTAL_CHARGE_N", formatNumber(MontantTotalCharges));
        form.append("TOTAL_PRODUIT_N_1", 0);
        form.append("TOTAL_PASSIF_N", formatNumber(TotalPassif));





        const res = await fetchApi(`/bilan/rapportFinanciere/createRapport`, {
          method: "POST",
          body: form,
        });


        dispacth(
          setToastAction({
            severity: "success",
            summary: "bilan enregistré",
            detail: "Bilan a été enregistré avec succès",
            life: 3000,
          })
        );

        const resultant = res.result
        navigate(`/Rapport`);
        //setShowAddPageFrais(true)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      //   setIsSubmitting(false);
    }
  };


  const generateRapportFinancierPDF = () => {
    const formatMontant = (valeur) => {
      // Convertit en nombre et formate en BIF français
      const montant = Number(valeur) || 0;
      return montant.toLocaleString("fr-FR") + " FBU";
    };

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const startY = 30;

    // --- En-tête ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport Financier NODEBU", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`BILAN EN DATE DU : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 25, { align: "center" });

    // --- Filigrane ---
    doc.saveGraphicsState();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(60);
    doc.setTextColor(150);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text("NODEBU", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
    doc.restoreGraphicsState();

    // --- TABLEAU BILAN ---
    const bilanBody = [
      ["Avoir en banque", formatMontant(MontantCompteInterne), "-", "Cotisations des membres", formatMontant(cotisationAnticipe), "-"],
      ["Crédits accordés aux membres", formatMontant(CapitalCreditAccordepaspayes), "-", "Créditeurs divers", "-", "-"],
      ["Débiteurs divers", formatMontant(DebiteursDiverses), "-", "-", "-", "-"],
      ["Immobilisations", formatMontant(valeurnette), "-", "Fonds propres", formatMontant(FondsPropres), "-"],
      ["", "-", "-", "Capital", formatMontant(MontantCapital), "-"],
      ["-", "-", "-", "Report à nouveau", formatMontant(MontantReserveGenerale), "-"],
      ["-", "-", "-", "Résultats", formatMontant(Resultas), "-"],
      ["Total actif", formatMontant(TotalActif), "-", "Total passif", formatMontant(TotalPassif), "-"]
    ];

    doc.autoTable({
      startY: startY + 5,
      head: [["Actif", "Montant en BIF N", "Montant en BIF N-1", "Passif", "Montant en BIF N", "Montant en BIF N-1"]],
      body: bilanBody,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [251, 140, 140] },
      theme: "grid",
    });

    // --- COMPTE DE RESULTAT ---
    const resultStartY = doc.autoTable.previous.finalY + 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COMPTE DE RESULTAT AU : " + new Date().toLocaleDateString('fr-FR'), 14, resultStartY);

    const compteResultatBody = [
      ["Frais de fonctionnement", formatMontant(TotalCharges), "-", "Produits d'intérêts", formatMontant(ProduitsInterets), "-"],
      ["Autres charges", formatMontant(totalvaleurAmortissementMaintenant), "-", "Autres produits", formatMontant(InteretsurcotisationAnticipe), "-"],
      ["Résultat Bénéficiaire", Resultas > 0 ? Resultas : "-", "-", "Résultat Déficitaire", Resultas < 0 ? formatMontant(Resultas) : "-", "-"],
      ["Total charges", formatMontant(MontantTotalCharges), "-", "Total produits", TotalProduits, "-"]
    ];

    doc.autoTable({
      startY: resultStartY + 5,
      head: [["Charges", "Montant en BIF N", "Montant en BIF N-1", "Produits", "Montant en BIF N", "Montant en BIF N-1"]],
      body: compteResultatBody,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [251, 140, 140] },
      theme: "grid"
    });

    // --- SIGNATURES ---
    const footerY = doc.internal.pageSize.height - 25;
    doc.setFontSize(10);
    doc.text(`Effectué par : ${user?.NOM || ""} ${user?.PRENOM || ""} ....................................`, 14, footerY + 5);
    doc.text("Approuvé par : ..................................", pageWidth / 2 + 10, footerY + 5);

    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    }

    doc.save(`RapportFinancier_NODEBU_${moment().format("YYYYMMDD")}.pdf`);
  };




  const handleGenerateFacture = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Génerer fichier PDF",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment générer le PDF ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        const blob = generateRapportFinancierPDF();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      },
    });
  };

  // ✅ Contenu principal quand !loading
  return (
    <>

      {globalLoading && <Loading />}
      {pdfUrl ? (
        <>
          <div className="mt-4">
            <h1 className="mb-3">Rapport Financier :</h1>
            <iframe
              src={pdfUrl}
              width="100%"
              height="800px"
              style={{ border: "1px solid #ccc" }}
              title="Facture PDF"
            />
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
            <Button
              className=" mt-3 ml-3 button-mobile "
              size="small"
              type="submit"
              onClick={() => {
                URL.revokeObjectURL(pdfUrl); // Libère l'ancien URL
                setPdfUrl(null);             // Cache l'iframe
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
              <span className="ml-1" style={{ fontWeight: 'bold' }}>Fermer PDF</span>
            </Button>
          </div>
        </>

      ) : (
        <>
          <style>{`
            tr {
                height: 20px;
            }
            td {
                padding: 2px;
                text-align: center; /* Centrer les valeurs */
            }
        `}</style>

          <div className="px-4 py-3 main_content">
            <div className="d-flex align-items-center justify-content-center">
              <h3 className="mb-2" style={{ color: "#143d8f" }}>RAPPORT FINANCIER</h3>


            </div>
            <div className="selection-actions d-flex align-items-center justify-content-end">
              {/* Date début */}
              <div className="d-flex flex-column mt-1 mx-2">
                <Calendar
                  value={dates}
                  onChange={(e) => setDates(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Filtre par periode "
                  inputStyle={{ padding: "9px 0.75rem" }}
                  showButtonBar
                  dateFormat="dd/mm/yy"
                  className="w-full md:w-14rem no-p"
                  style={{ minWidth: 200 }}
                />
              </div>
              <div >
                <Button
                  className="mt-2 button-mobile d-flex align-items-center justify-content-end gap-5 mx-5 "
                  size="small"
                  type="submit"
                  onClick={(e) => {
                    handleGenerateFacture(e)
                  }}
                  data-pr-tooltip="Générer le PDF"  // Ajout du tooltip
                  tooltipOptions={{ position: 'top' }} // Options pour la position du tooltip
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739
                 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194
                  1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43
                   9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4
                    1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513
                     4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z" /></svg>
                </Button>
              </div>

              <div>
                <Button
                  className="mt-2 button-mobile d-flex align-items-center justify-content-end gap-5 "
                  size="small"
                  type="submit"
                  onClick={(e) => {
                    handleGenerateFacture(e)

                  }}
                  data-pr-tooltip="Générer le PDF"  // Ajout du tooltip
                  tooltipOptions={{ position: 'top' }} // Options pour la position du tooltip
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46
                 0 0 0-.12-.298L12.901.134A.4.4 
                0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076
                 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 
                0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 
                1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0
                 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 
                 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3
                  14.232v-6h1.918q1.09 
                0 1.42.09q.51.135.853.588q.343.451.343 
                1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 
                0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 
                0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 
                0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739
                 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194
                  1.418q0 .741-.182 1.277q-.223.655-.634
                   1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43
                    9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 
                    1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513
                     4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z" /></svg>

                </Button>
              </div>
            </div>

            <div className="row d-flex bg-light table-responsive"
              style={{
                maxWidth: "1300px",    // largeur max du tableau
                overflowX: "auto",     // scroll horizontal si dépasse
                border: "1px solid #ccc",
                margin: "0 auto"       // centrer le tableau
              }}>
              <h5 style={{ color: "#143d8f" }}> BILAN EN DATE DU : {new Date().toLocaleDateString('fr-FR')}
              </h5>
              <div>
                <table
                  className="table  w-s100 col-12"
                  style={{ border: "4px solid #fb8c8c", minWidth: "1000px" }}>
                  {/* Actif */}
                  <tr>
                    <td className="p-smd-1 text-black font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Actif</td>
                    <td className="p-msd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N-1</td>

                    {/* Passif */}
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>  Passif</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N-1</td>
                  </tr>

                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Avoir en banque</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{MontantCompteInterne > 0
                        ? Number(MontantCompteInterne).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }) + " FBU" : "-"} </td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Cotisations des membres</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{cotisationAnticipe ?
                        Number(cotisationAnticipe).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Crédits accordés aux membres</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{CapitalCreditAccordepaspayes
                        ? Number(CapitalCreditAccordepaspayes).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Créditeurs divers</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Débiteurs divers</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{DebiteursDiverses ? (DebiteursDiverses.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      })) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}></td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Immobilisations</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{valeurnette ? (valeurnette).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }) + " FBU" : "-"} </td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Fonds propres</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{FondsPropres ? (FondsPropres).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}></td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}></td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}></td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Capital</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{MontantCapital ?
                        (MontantCapital).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0, maximumFractionDigits: 2
                        }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}></td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Report à nouveau</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{MontantReserveGenerale ? (MontantReserveGenerale).toLocaleString("fr-FR",
                        { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#f0b1b1ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Resultats</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{Resultas ? ((Resultas).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Total actif</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>
                      {TotalActif ? (TotalActif).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Total passif</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>{
                        TotalPassif ? (TotalPassif).toLocaleString("fr-FR",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                          }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>-</td>
                  </tr>
                </table>
              </div>
              <h5 style={{ color: "#143d8f" }}>COMPTE DE RESULTAT AU :  {new Date().toLocaleDateString('fr-FR')}</h5>
              <div>
                <table style={{ border: "3px solid #fb8c8c", minWidth: "1000px" }}
                  className="table w-s100 col-12">
                  <tr>
                    <td className="p-smd-1 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Charges</td>
                    <td className="p-msd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N-1</td>

                    {/* Passif */}
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>  Produits</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N</td>
                    <td className="p-mjd-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Montant en BIF N-1</td>
                  </tr>

                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Frais de fonctionnement</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>
                      {TotalCharges ? Number(TotalCharges).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + " FBU" : "-"}

                    </td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Produits d'intérêts</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{ProduitsInterets ?
                        (ProduitsInterets).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0
                          , maximumFractionDigits: 2
                        }) + " FBU" : "-"} </td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Autres charges</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{totalvaleurAmortissementMaintenant ? (totalvaleurAmortissementMaintenant).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Autres produits</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{InteretsurcotisationAnticipe ? (InteretsurcotisationAnticipe).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Résultat Bénéficiaire</td>
                    <td
                      className="p-md-2 font-bold"
                      style={{ border: "2px solid #fb8c8c" }}
                    >
                      {Resultas > 0
                        ? (Resultas).toLocaleString("fr-FR", {
                          minimumFractionDigits: 0, maximumFractionDigits: 2
                        }) + " FBU"
                        : "-"
                      }
                    </td>

                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Résultat Déficitaire</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>{Resultas < 0 ? (Resultas.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      })) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>-</td>

                  </tr>
                  <tr>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Total charges</td>
                    <td className="p-md-2 font-bold  "
                      data-pr-tooltip='en attente'
                      style={{
                        border: "2px solid #fb8c8c", cursor: 'pointer',
                        backgroundColor: "#abc3f5ff"
                      }}>
                      {MontantTotalCharges ? (MontantTotalCharges).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + "FBU" : "-"} </td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>-</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c" }}>Total produits</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>
                      {TotalProduits ? (TotalProduits).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0, maximumFractionDigits: 2
                      }) + " FBU" : "-"}</td>
                    <td className="p-md-2 font-bold "
                      style={{ border: "2px solid #fb8c8c", backgroundColor: "#abc3f5ff" }}>-</td>

                  </tr>

                </table>
              </div>
            </div>



            <div className="d-flex flex-column">
              {!isVisible && (
                <button
                  onClick={handleToggle}
                  style={{ backgroundColor: "#143d8f", marginBottom: "10px" }}
                  className="btn btn-secondary btn-md"
                >
                  {isVisible ? "Afficher les éléments" : "Conserve le Rapport"}
                </button>
              )}

              {isVisible && (
                <div className="form-contaianer mt-5">
                  <div className="d-flex flex-row">
                    <div className="row w-100">

                      {/* <div className="col-md-4">
                        <div className="row">
                          <div className="col-md-2">
                            <label htmlFor="TYPE" className="label mt-2 font-bold ">Type</label>
                          </div>
                          <div className="col-md-10">
                            <Dropdown
                              value={data.TYPE}
                              options={type}
                              onChange={(e) => setValue("TYPE", e.value)}
                              optionLabel="name"
                              id="TYPE"
                              filter
                              placeholder="Sélectionner le type du bilan"
                              className={`w-100 ${hasError("TYPE") ? "p-invalid" : ""}`}
                              showClear
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                              {hasError("TYPE") ? getError("TYPE") : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="row">
                          <div className="col-md-2">
                            <label htmlFor="PERIODE" className="label mb-1 font-bold mt-2">Periode</label>
                          </div>
                          <div className="col-md-10">
                            <Dropdown
                              value={data.PERIODE}
                              options={period}
                              onChange={(e) => setValue("PERIODE", e.value)}
                              optionLabel="name"
                              id="PERIODE"
                              filter
                              placeholder="Sélectionner la periode du bilan"
                              className={`w-100 ${hasError("PERIODE") ? "p-invalid" : ""}`}
                              showClear
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                              {hasError("PERIODE") ? getError("PERIODE") : ""}
                            </div>
                          </div>
                        </div>
                      </div> */}
                      <div className="col-md-4">
                        <div className="row">
                          <div className="col-md-4">
                            {/* <label htmlFor="TYPE" className="label mb-1 font-bold">Type</label> */}
                          </div>




                          <div className="col-md-8">
                            <button
                              onClick={handleSubmit}
                              style={{ backgroundColor: "#143d8f", marginTop: "15px" }}
                              className="btn btn-primary btn-md"
                            >
                              Enregiste le Rapport
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}
            </div>




          </div>
        </>
      )}

      <Outlet />
    </>
  );


}