
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import entete from "../../../public/images/nodebu.png";
import Loading from "../../components/app/Loading";
import Loadingspiner from "../../components/app/Loadingspiner"
import { useNavigate, useParams } from "react-router-dom";
import filligramme from "../../../public/images/filigrammeNodebu.png"
import { InputMask } from "primereact/inputmask";
import { Tooltip } from 'primereact/tooltip';
import { Image } from "primereact/image";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import { userSelector } from "../../store/selectors/userSelector";
import STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import PROFILS from "../../constants/PROFILS";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const initialForm = {


};
export default function Credit_approuve_Page() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const idrls = decodeId(id)
  const [pdfUrl, setPdfUrl] = useState(null);
  const { ID_OCTROI_CREDIT: encodedStr } = useParams();
  const ID_OCTROI_CREDIT = decodeId(encodedStr)
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const user = useSelector(userSelector)
  const [selectAccessoire_stock, setSelectAccessoire_stock] = useState([]);
  const [selectAccessoire_stockEdit, setSelectAccessoire_stockEdit] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [amortissements, setAmortissements] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [total, setTotal] = useState(0);
  const [modes, setModes] = useState([])
  const IsGerant = user.ID_PROFIL === PROFILS.GERANT

  const [iconVisibledate, setIconVisibledate] = useState(true);
  const [iconVisibleFactureProf, setIconVisibleFactureProf] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingspiner, setLoadingspiner] = useState(true);

  const [ldetails, setLdetails] = useState([])
  const [visible, setVisible] = useState(false);
  const [codes, setCodes] = useState(null);
  const [montantrestant, setmontantrestant] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [visibleRejet, setVisibleRejet] = useState(true);
  const [creditId, setcreditId] = useState(true);
  const [iconVisible, setIconVisible] = useState(true);
  const [dropdownVisibleFourni, setDropdownVisibleFourni] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPrixUnitaire, setSelectedPrixUnitaire] = useState(null);
  const [selectedQuantite, setSelectedQuantite] = useState(null);
  const [selectedPrixVenteUnitaire, setSelectedPrixVenteUnitaire] = useState(null);
  const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
  const [MontantDemande, setMontantDemande] = useState(null);
  const [typesoperation, setTypeOperation] = useState([]);
  const [approuveTermine, setApprouveTermine] = useState(false);

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
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError, } = useFormErrorsHandle({ ...data, selectedProduct },
    {


    }
  );

  useEffect(() => {
    document.title = "Détail crédit"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'credits',
        name: 'Crédit'
      },
      {
        path: 'commande_detail_pagedetail',
        name: 'Détail crédit'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  // liste deroulante des types operations
  const fetchOperation = useCallback(async () => {
    try {
      const res = await fetchApi(`/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`);
      // Filtrer uniquement "Octroi d’un crédit bancaire" et "Octroi d’un crédit en espèce"
      const filtered = res.result.data.filter((tyop) =>
        tyop.NOM_OPERATION === "Octroi d'un crédit (Bancaire)" ||
        tyop.NOM_OPERATION === "Octroi d'un crédit en espèce"
      );
      // Mapper les données filtrées
      setTypeOperation(
        filtered.map((tyop) => ({
          name: tyop.NOM_OPERATION,
          code: tyop.ID_TYPES_OPERATIONS,
        }))
      );
      setCodes(res); // Tu peux aussi filtrer ici si nécessaire
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchOperation();
  }, []);


  //liste les data listes credits
  const FindOneCreidit = useCallback(async () => {
    try {
      const baseurl = idrls ? `/credits/credits/findOnecrediteId/${idrls}` : `/credits/credits/findOnecrediteId/${ID_OCTROI_CREDIT}`;
      var url = await fetchApi(baseurl);
      const res = url


      const cmde = res.result;
      const MontantDemande = cmde.MONTANT_DEMANDE
      //console.log({MontantDemande},'MontantDemandeMontantDemandeMontantDemandeMontantDemandeMontantDemandeMontantDemande');
      setMontantDemande(MontantDemande)
      setModes(cmde);
      const creditId = cmde.ID_OCTROI_CREDIT;
      setcreditId(creditId); // Mettre à jour l'état


      setData({
        MEMBRE_ID: { name: cmde.membresmicro.NOM, code: cmde.membresmicro.MEMBRE_ID },
        REFERENCE_CREDIT: cmde.REFERENCE_CREDIT
      });
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }, [idrls,]);

  useEffect(() => {
    FindOneCreidit()
  }, [idrls,])
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setVisibleRejet(!visibleRejet);
  };
  const toggleDropdownFourni = () => {
    setDropdownVisibleFourni(!dropdownVisibleFourni);
    setIconVisible(false);
  };
  const annuler = () => {
    setDropdownVisibleFourni(false);
    setIconVisible(true);
  };
  // Liste déroulante des membres
  const fetchMembre = useCallback(async () => {
    try {
      const res = await fetchApi("/cotisation/membres_microfinance/fetch?rows=1000000&");
      const updatedFournisseurs = res.result.data.map((catg) => ({
        name: catg.NOM,
        code: catg.MEMBRE_ID,
      }));
      setFournisseurs(updatedFournisseurs);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchMembre();
  }, []);



  const Approuvecredit = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    const montantTotalCompteInterne = parseFloat(MontantCompteInterne);
    const montantDemande = parseFloat(MontantDemande); // Assure-toi que c'est un nombre
    if (montantTotalCompteInterne < montantDemande) {
      dispacth(
        setToastAction({
          severity: "warn",
          summary: "Montant insuffisant",
          detail: "Le compte interne ne couvre pas le montant demandé.",
          life: 3000,
        })
      );
      return; // 👈 Empêche la suite si le montant est insuffisant
    }

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Terminer l'approbation",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment approuver le crédit ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        ApprouvecreditItems(itemsIds);
      },
    });
  };

  const handleApprouver = (e) => {
    Approuvecredit(e, ID_OCTROI_CREDIT ?? idrls);
    setApprouveTermine(true); // ⛔️ Masque les boutons
  };

  const ApprouvecreditItems = async (id) => {
    setLoading(true); // 🚀 active le spinner
    try {
      const res = await fetchApi(`/credits/credits/approuveCredit/${id}`, {
        method: "get",
      });


      dispacth(
        setToastAction({
          severity: "success",
          summary: "Terminer l'Approbation avec succès ",
          detail: "L'Approbation a bien été terminee succès",
          life: 3000,
        })
      );
      FindOneCreidit()
      fetchAmortissements()


    } catch (error) {
      console.log(error);
      if (error.httpStatus === 400) {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur lors de l'approbation du credis",
            detail: 'Credits déjà approuvé ou Annuler .',

            life: 5000,
          })
        )

        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        const mainContent = document.querySelector(".main_content");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            mainContent.scrollY -
            headerHeight;
          mainContent.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else if (error.httpStatus === "UNAUTHORIZED") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur",
            detail: "Connectez-vous avec un compte autorisé pour accéder à cette fonctionnalité ou contacter votre administrateur.",
            life: 5000,
          })
        )

        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        const mainContent = document.querySelector(".main_content");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            mainContent.scrollY -
            headerHeight;
          mainContent.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else
      if (error.httpStatus === 409) {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur lors de l'approbation du credis",
            detail: '❌ Solde insuffisant dans la caisse sélectionnée Alimenter la caisse pour continuer.',

            life: 5000,
          })
        )

        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        const mainContent = document.querySelector(".main_content");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            mainContent.scrollY -
            headerHeight;
          mainContent.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
      else {

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
      setLoading(false); // 🚀 désactive le spinner
    }
  };
  //api d'approbation credit
  const fetchMontantTotalCredits = useCallback(async () => {
    try {
      setLoading(true);

      let url = "/rapport/findCoutRevenuCredits/fetch?";


      const res = await fetchApi(url);


      // Mise à jour selon la structure du backend corrigé

      setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))



    } catch (error) {
      console.error("Erreur lors de la récupération des crédits :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMontantTotalCredits();
  }, []);
  // fonction pour valider crédit
  const handleValider = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Valider le crédit",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment valider le crédit ?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        handleValiderItems(itemsIds);
      },
    });
  };


  const handleValiderItems = async (id) => {
    const operation = data.TYPE_OPERATION_ID?.code;
    //  Vérification : champ obligatoire
    if (!operation) {
      dispacth(setToastAction({
        severity: "warn",
        summary: "Type d'opération manquant",
        detail: "Veuillez sélectionner le type d'opération avant de valider.",
        life: 3000,
      }));
      return; // Arrêter l'exécution ici
    }
    // console.log(operation, 'TYPE_OPERATION_ID envoyé');

    try {
      const res = await fetchApi(`/credits/credits/validerCredit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TYPE_OPERATION_ID: operation,
        }),
      });

      setModes(prev => ({
        ...prev,
        TYPE_OPERATION_ID: operation,
      }));

      dispacth(setToastAction({
        severity: "success",
        summary: 'Crédit validé',
        detail: "La validation du crédit a bien été faite avec succès",
        life: 3000,
      }));

      FindOneCreidit();
    } catch (error) {
      console.error(error);
      dispacth(setToastAction({
        severity: "error",
        summary: "Erreur du système",
        detail: "Erreur du système, réessayez plus tard",
        life: 3000,
      }));
    }
  };



  // fonction pour l'annulation dùun crédit
  const handleAnnuler = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Annuler le crédit",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment annuler le crédit ?
          </div>
        </div>
      ),

      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        handleAnnulerItems(itemsIds);
      },
    });
  };


  const handleAnnulerItems = async (id) => {
    try {
      const res = await fetchApi(`/credits/credits/annulationCredit/${id}`, {
        method: "get",
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Annuler du crédit ',
          detail: "L'annulation du crédit a bien été fait succès",
          life: 3000,
        })
      );
      FindOneCreidit()


    } catch (error) {
      console.log(error);
      dispacth(
        setToastAction({
          severity: "error",
          summary: "Erreur du système",
          detail: "Erreur du système, réessayez plus tard",
          life: 3000,
        })
      );
    }
  };
  const fetchAmortissements = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/credits/credits/fetchAmort/${ID_OCTROI_CREDIT}&`;

      const res = await fetchApi(baseurl)
      console.log({ res });


      setAmortissements(res.result);
      const results = res.result
      const Somme = results?.MONTANT_RESTANT
      console.log("📦 Données tableau : ", res);

      const montantDejaPayesCapital = results.reduce((total, item) => {
        return total + parseFloat(item?.MONTANT_RESTANT || 0);
      }, 0);
      setmontantrestant(montantDejaPayesCapital)

      setTotalRecords(res.result.totalRecords);
      setTotal(res.total)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);
  useEffect(() => {
    fetchAmortissements();
  }, [lazyState])
  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(ldetails ? value.length === ldetails.length : false);
  };



  const onSelectAllChange = (event) => {
    const selectAll = event.checked;
    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(ldetails);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100" id="loadingmobile">
        <div className="spinner-border" role="status" />
      </div>
    );
  }


  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const startY = 30;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fonction formatage monétaire
    const formatMoney = (val) =>
      val ? parseFloat(val).toLocaleString("fr-FR").replace(/\s/g, " ") + " Fbu" : "0 Fbu";

    // --- Fonction pour ajouter entête ---
    const addHeader = () => {
      doc.addImage(entete, "JPEG", 0, 0, 70, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, { align: "right" });
    };

    addHeader(); // Entête première page

    // --- TITRE ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Calendrier de paiement", pageWidth / 2, startY, { align: "center" });

    // --- INFOS MEMBRE ---
    const membre = `${modes?.membresmicro?.NOM || ""} ${modes?.membresmicro?.PRENOM || "-"}`;
    const montantDemande = formatMoney(modes?.MONTANT_DEMANDE);
    const interetTotal = formatMoney(modes?.INTERET_TOTAL);
    const duree = modes?.DUREE ? `${parseInt(modes.DUREE)} mois` : "0 mois";
    const Reference = modes?.REFERENCE_CREDIT;
    const dateApprobation = iconVisibledate && modes?.DATE_APPROBATION
      ? moment(modes.DATE_APPROBATION).format("DD/MM/YYYY")
      : "-";

    const infos = [
      ["Membre", membre],
      ["Montant demandé", montantDemande],
      ["Intérêt total", interetTotal],
      ["Durée", duree],
      ["Reference", Reference],
      ["Date approbation", dateApprobation],
    ];

    let y = startY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    infos.forEach(([label, value], index) => {
      const colX = index % 2 === 0 ? 12 : 110;
      const valX = colX === 12 ? 50 : 160;

      doc.text(`${label} :`, colX, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, valX, y);
      doc.setFont("helvetica", "normal");

      if (index % 2 === 1) y += lineHeight;
    });

    // --- TABLEAU ---
    const tableData = amortissements.map((item) => [
      item.EST_AKARAVYO ? item.NUMERO_ECHEANCE + " Mois" : item.NUMERO_ECHEANCE + " semaine",
      formatMoney(item.MONTANT_INITIAL),
      formatMoney(item.INTERET),
      formatMoney(item.PENALITE),
      formatMoney(item.MONTANT_REMBOURSEMENT),
      formatMoney(item.MONTANT_RESTANT),
      item.DATE_DEBUT ? new Date(item.DATE_DEBUT).toLocaleDateString("fr-FR") : "-",
      item.DATE_ECHEANCE ? new Date(item.DATE_ECHEANCE).toLocaleDateString("fr-FR") : "-",
      item.DATE_PAIEMENT_EFFECTIF ? new Date(item.DATE_PAIEMENT_EFFECTIF).toLocaleDateString("fr-FR") : "-",
      item.STATUT === 0 ? "En attente" : item.STATUT === 1 ? "Payé" : "En retard"
    ]);

    const headers = [[
      "N° Échéance", "Montant capital", "Intérêt", "Pénalité",
      "Montant à Rembourser", "Reste à Payer", "Date Début",
      "Date Échéance", "Date Paiement", "Statut"
    ]];

    autoTable(doc, {
      startY: y + 5,
      head: headers,
      body: tableData,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [251, 140, 140] },

      // 🔹 En-tête et filigrane sur chaque page
      didDrawPage: () => {
        addHeader();

        // --- FILIGRANE NODEBU ---
        doc.saveGraphicsState();
        doc.setFont("helvetica", "italic");
        doc.setFontSize(60);
        doc.setTextColor(150);
        doc.setGState(new doc.GState({ opacity: 0.3 }));
        doc.text("NODEBU", pageWidth / 2, pageHeight / 2, { align: "center", angle: 30 });
        doc.restoreGraphicsState();
      }
    });

    // --- Calcul des totaux ---
    const totalCapital = amortissements.reduce((acc, item) => acc + parseFloat(item.MONTANT_INITIAL || 0), 0);
    const totalInteret = amortissements.reduce((acc, item) => acc + parseFloat(item.INTERET || 0), 0);
    const totalPenalite = amortissements.reduce((acc, item) => acc + parseFloat(item.PENALITE || 0), 0);
    const totalRembourse = amortissements.reduce((acc, item) => acc + parseFloat(item.MONTANT_REMBOURSEMENT || 0), 0);
    const totalRestant = amortissements.reduce((acc, item) => acc + parseFloat(item.MONTANT_RESTANT || 0), 0);

    let totalsY = doc.autoTable.previous.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Totaux :", 12, totalsY);
    doc.setFont("helvetica", "normal");
    doc.text(`Capital: ${formatMoney(totalCapital)}`, 30, totalsY);
    doc.text(`Interet:  ${formatMoney(totalInteret)}`, 75, totalsY);
    doc.text(`Penalite:  ${formatMoney(totalPenalite)}`, 115, totalsY);
    doc.text(`Total à rembourser  ${formatMoney(totalRembourse)}`, 155, totalsY);
    doc.text(`Reste à payer  ${formatMoney(totalRestant)}`, 230, totalsY);

    // --- Signatures ---
    const footerY = doc.internal.pageSize.height - 20;
    const utilisateur = `${user.NOM} ${user.PRENOM}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Descendre un peu plus en ajoutant +5 ou +10
    doc.text(`Bénéficiaire : ${membre} ....................................`, 10, footerY + 5);
    doc.text(`Effectué par : ${utilisateur} ....................................`, 10, footerY + 10);
    doc.text("Approuvé par : ..................................", pageWidth / 2 + 10, footerY + 10);
    // --- Pagination ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 10, 290, { align: "right" });
    }

    return doc.output("blob", `amortissements-${moment().format("YYYYMMDD_HHmmss")}.pdf`);
  };

  const handleGeneraPDF = () => {


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
        exportPdf()
        const blob = exportPdf();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      },
    });
  };

  const formatServerDate = (raw) => {
    if (!raw) return "-";

    // Créer une date locale en remplaçant l'espace par 'T'
    const date = new Date(raw.replace(' ', 'T')); // "2025-10-04 00:00:00" → "2025-10-04T00:00:00"

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };






  return (
    <>
      {isSubmitting && <Loading />}

      <div className="px-4 py-3 main_content bg-white has_footer">
        {pdfUrl ? (
          <>
            <div className="mt-4">
              <h1 className="mb-3">Liste des echeances:</h1>
              <iframe
                src={pdfUrl}
                width="100%"
                height="800px"
                style={{ border: "1px solid #ccc" }}
                title="Facture PDF"
              />
            </div>

            <div className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white" style={{ position: "absolute", bottom: 0, right: 0 }}>
              <Button
                className="mt-3 ml-3 button-mobile"
                size="small"
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg>
                <span className="ml-1" style={{ fontWeight: 'bold' }}>Fermer PDF</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="row">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="card is-mobile d-flex round-indicator hide-on-mobile" style={{ padding: 0 }}>
                    <Image
                      alt="Image"
                      imageClassName="rounded-4 object-fit-cover hide-on-mobile"
                      imageStyle={{ width: "150px", height: "150px" }}
                    />
                  </div>


                  <div className="row">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="card is-mobile d-flex round-indicator hide-on-mobile" style={{ padding: 0 }}>
                        <Image
                          //src={commande}r
                          alt="Image"
                          imageClassName="rounded-4 object-fit-cover hide-on-mobile"
                          imageStyle={{ width: "150px", height: "150px" }}
                        />
                      </div>

                      <div className="col-sm ml-4" id="no-margin-left">

                        <div className="row d-flex align-items-center">
                          <div className="col-md-3">
                            <label className="label mb-1">Réf&nbsp;</label>
                          </div>
                          <div className="col-sm ms-4 d-flex align-items-center">
                            :&nbsp;
                            {modes?.REFERENCE_CREDIT ? (
                              <span className="font-bold">{modes.REFERENCE_CREDIT}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </div>

                        <div className="row d-flex align-items-cente">
                          <div className="col-md-3">
                            <label className="label mb-1">Cassier&nbsp;</label>
                          </div>
                          <div className="col-sm ms-4 d-flex align-items-center">
                            :&nbsp;
                            {modes?.utilisateur?.NOM && modes?.utilisateur?.PRENOM ? (
                              <span className="font-bold">
                                {modes.utilisateur.NOM} {modes.utilisateur.PRENOM}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>

                        </div>

                        <div className="row d-flex align-items-cente">
                          <div className="col-md-3">
                            <label className="label mb-1">Validateur&nbsp;</label>
                          </div>
                          <div className="col-sm ms-4 d-flex align-items-center">
                            :&nbsp;
                            {modes?.utilisateurvalidee?.NOM && modes?.utilisateurvalidee?.PRENOM ? (
                              <span className="font-bold">
                                {modes.utilisateurvalidee.NOM} {modes.utilisateurvalidee.PRENOM}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>

                        </div>
                        <div className="row d-flex align-items-cente">
                          <div className="col-md-3">
                            <label className="label mb-1">Approbateur&nbsp;</label>
                          </div>
                          <div className="col-sm ms-4 d-flex align-items-center">
                            :&nbsp;
                            {modes?.utilisateurapprouve?.NOM && modes?.utilisateurapprouve?.PRENOM ? (
                              <span className="font-bold">
                                {modes.utilisateurapprouve.NOM} {modes.utilisateurapprouve.PRENOM}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                </div>
              </div>

              <Button
                className="mt-3 ml-3 button-mobile px-2 py-1"
                label="Retour"
                size="small"
                onClick={() => navigate("/credits")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-code" viewBox="0 0 16 16">
                  <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                </svg>
              </Button>
            </div>

            {/* Statut section */}
            <div className="col-sm ml-4" id="no-margin-left">
              <div className="row mt-4">
                <div className="d-flex align-items-center justify-content-between w-100">
                  {modes?.statutscre && (
                    <div className="d-flex align-items-center ">
                      <label className="label ms-0 mr-4">Statut :</label>
                      <div
                        className="d-flex align-items-center py-1 ms-4 px-2 rounded text-center w-max"
                        style={{
                          backgroundColor: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).backgroundColor,
                          color: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).textColor,
                        }}
                      >
                        <span
                          className="mb-1"
                          dangerouslySetInnerHTML={{
                            __html: statutCreditsColor(modes.statutscre?.ID_STATUTS_CREDIT).icon,
                          }}
                        />
                        <span className="ml-1" style={{ fontSize: 13 }}>
                          {modes.statutscre.DESCRIPTION || "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="container-fluid px-3 mt-3">
              {/* Group 1: Member and Requested Amount */}
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Membre</label>
                    </div>
                    <div className="col-sm ms-2">:
                      <span className="font-bold">
                        {modes?.membresmicro?.NOM} {modes?.membresmicro?.PRENOM || '-'}
                      </span>
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Montant demandé</label>
                    </div>
                    <div className="col-sm ms-2">:
                      <span className="font-bold">
                        {modes?.MONTANT_DEMANDE ? parseInt(modes.MONTANT_DEMANDE).toLocaleString('fr-FR') : 0} Fbu
                      </span>
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
              </div>

              {/* Group 2: Total Interest and Duration */}
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Intérêt Total</label>
                    </div>
                    <div className="col-sm ms-2">:
                      <span className="font-bold">
                        {modes?.INTERET_TOTAL ? parseInt(modes.INTERET_TOTAL).toLocaleString('fr-FR') : 0} Fbu
                      </span>
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Durée</label>
                    </div>
                    <div className="col-sm ms-2">:
                      <span className="font-bold">
                        {modes?.DUREE ? parseInt(modes.DUREE).toLocaleString('fr-FR') : 0} mois
                      </span>
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
              </div>

              {/* Group 3: Remaining Amount and Date */}
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Montant reste à Rembourser</label>
                    </div>
                    <div className="col-sm ms-2">:
                      <span className="font-bold">
                        {montantrestant ? parseFloat(montantrestant).toLocaleString('fr-FR') : 0} Fbu
                      </span>
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
                <div className="col-md-6">
                  <div className="d-flex ms-1 align-items-center py-1">
                    <div className="col-md-5">
                      <label className="label">Date</label>
                    </div>
                    <div className="col-sm ms-2">:
                      {iconVisibledate && (
                        <span className="font-bold">
                          {modes?.DATE_APPROBATION ? moment(modes.DATE_APPROBATION).format("DD/MM/YYYY") : '-'}
                        </span>
                      )}
                    </div>
                  </div>
                  <hr className="my-1" />
                </div>
              </div>
            </div>

            {modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.EN_ATTENTE_DE_VALIDATION && (
              <form className="form w-80 mt-5">
                <div className="form-group col-sm">
                  <div className="row w-50">
                    <div className="col-md-2">
                      <label htmlFor="TYPE_OPERATION_ID" className="label">Opération</label>
                    </div>
                    <div className="col-sm">
                      <Dropdown
                        value={data.TYPE_OPERATION_ID}
                        options={typesoperation}
                        autoFocus
                        onChange={(e) => setValue("TYPE_OPERATION_ID", e.value)}
                        optionLabel="name"
                        id="TYPE_OPERATION_ID"
                        filter
                        filterBy="name"
                        placeholder="Sélectionner le type d'opération"
                        emptyFilterMessage="Aucun élément trouvé"
                        emptyMessage="Aucun élément trouvé"
                        name="TYPE_OPERATION_ID"
                        onHide={() => checkFieldData({ target: { name: "TYPE_OPERATION_ID" } })}
                        className={`w-100 ${hasError("TYPE_OPERATION_ID") ? "p-invalid" : ""}`}
                        showClear
                      />
                      <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                        {hasError("TYPE_OPERATION_ID") ? getError("TYPE_OPERATION_ID") : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.EN_ATTENTE_DE_VALIDATION && (
              <div className="rounded my-2 pr-1 bg-white ms-2">
                <h6 className="ms-2">Calendrier du paiement</h6>
                <DataTable
                  value={amortissements}
                  editMode="row"
                  size="small"
                  dataKey="ID_AMORTISSEMENTS"
                  selection={selectedItems}
                  onSelectionChange={onSelectionChange}
                  selectAll={selectAll}
                  onSelectAllChange={onSelectAllChange}
                  emptyMessage="Aucun élément trouvé"
                  resizableColumns
                >
                  <Column
                    field="NUMERO_ECHEANCE"
                    header="N. échéance"
                    sortable
                    body={(item) => (
                      <span>
                        {item.NUMERO_ECHEANCE + ' mois '}
                      </span>
                    )}
                  />
                  <Column
                    field="MONTANT_INITIAL"
                    header="M.capital"
                    sortable body={(item) =>
                      <span>{`${parseFloat(item.MONTANT_INITIAL).toLocaleString('fr-FR')} Fbu`}
                      </span>}
                  />
                  <Column
                    field="INTERET"
                    header="Intérêt"
                    sortable
                    body={(item) =>
                      <span>{`${parseFloat(item.INTERET).toLocaleString('fr-FR')} Fbu`}
                      </span>}
                  />
                  <Column
                    field="PENALITE"
                    header="Pénalité"
                    sortable
                    body={(item) =>
                      <span>{`${parseFloat(item.PENALITE).toLocaleString('fr-FR')} Fbu`}

                      </span>}
                  />
                  <Column
                    field="MONTANT_REMBOURSEMENT"
                    header="M. à Rembourser"
                    sortable
                    body={(item) =>
                      <span>{`${parseFloat(item.MONTANT_REMBOURSEMENT).toLocaleString('fr-FR')} Fbu`}
                      </span>}
                  />
                  <Column
                    field="reste_a_payer"
                    header="Reste à payer"
                    sortable body={(item) =>
                      <span>{`${parseFloat(item.MONTANT_RESTANT).toLocaleString('fr-FR')} Fbu`}
                      </span>}
                  />
                  <Column
                    field="INTERET_COMPOSE"
                    header="Interets compose"
                    sortable body={(item) =>
                      <span>{`${parseFloat(item.INTERET_COMPOSE || 0).toLocaleString('fr-FR')} Fbu`}
                      </span>}
                  />

                  <Column
                    field="DATE_DEBUT"
                    header="Date début"
                    sortable
                    body={(item) => formatServerDate(item.DATE_DEBUT)}
                  />

                  <Column
                    field="DATE_ECHEANCE"
                    header="Date échéance"
                    sortable
                    body={(item) => formatServerDate(item.DATE_ECHEANCE)}
                  />


                  <Column
                    field="STATUT"
                    header="Statut"
                    sortable
                    body={(item) => (
                      <Button className="btn-sm"
                        data-pr-tooltip={item.STATUT === 0 ? "En attente" : item.STATUT === 1 ? "Payé" : item.STATUT === 2 ? "En retard" : "-"}
                        tooltip tooltipOptions={{ position: 'top' }}
                        style={{
                          width: 25, height: 25,
                          backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                          color: statutAmortissementsColor(item.STATUT).textColor,
                          border: "none"
                        }}
                        icon={(options) => (
                          <span className="mb-1"
                            dangerouslySetInnerHTML={{ __html: statutAmortissementsColor(item.STATUT).icon }} />
                        )}
                      />
                    )}
                  />
                  <Column field="DATE_PAIEMENT_EFFECTIF" header="Date de paiement" sortable body={(item) => {
                    const datePaiement = item.DATE_PAIEMENT_EFFECTIF ? new Date(item.DATE_PAIEMENT_EFFECTIF) : "-";
                    return datePaiement && !isNaN(datePaiement) ? datePaiement.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : "-";
                  }} />
                  <Column rowEditor headerStyle={{ width: "1%", minWidth: "2rem" }} bodyStyle={{ textAlign: "center" }} body={(rowData, options) => (
                    <>
                      {options.rowEditor?.editing ? (
                        <>
                          <Button
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>}
                            className="p-button-text  mr-1 p-button-outlined"
                            style={{ padding: "2px" }}
                            onClick={(e) => options.rowEditor?.onCancelClick && options.rowEditor.onCancelClick(e)}
                            severity="warning"
                          />
                        </>
                      ) : null}
                    </>
                  )} />
                </DataTable>
              </div>
            )}

            <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
              {modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.EN_ATTENTE_DE_VALIDATION && !IsGerant ? (
                <Button
                  label="Valider"
                  type="submit"
                  className="mt-3 ml-3"
                  size="small"
                  onClick={(e) => handleValider(e, ID_OCTROI_CREDIT ?? idrls)}
                />
              ) : (
                modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.APPROUVE &&
                (user.PROFIL?.ID_PROFIL === PROFILS.ADMIN || user.PROFIL?.ID_PROFIL === PROFILS.SUPER_ADMIN) &&
                modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.EN_COURS &&
                !approuveTermine &&
                modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.REMBOURSE &&
                modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.EN_RETARD &&
                modes.statutscre?.ID_STATUTS_CREDIT !== STATUTS_CREDIT.ANNULE && (
                  <>
                    <Button
                      label="Approuver"
                      className="mt-3 ml-3 button-mobile"
                      size="small"
                      onClick={handleApprouver}
                    />
                    <Button
                      label="Annuler"
                      className="mt-3 ml-3 button-mobile"
                      size="small"
                      onClick={(e) => handleAnnuler(e, ID_OCTROI_CREDIT ?? idrls)}
                    />
                  </>
                )
              )}
            </div>

            {modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.APPROUVE ||
              modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.EN_COURS ||
              modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.EN_RETARD ||
              modes.statutscre?.ID_STATUTS_CREDIT === STATUTS_CREDIT.REMBOURSE ? (
              <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                <Button
                  className="mt-3 ml-3 button-mobile"
                  size="small"
                  type="button" // Changed to "button" to avoid form submission
                  onClick={(e) => handleGeneraPDF()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                    <path d="M9.293 0H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5.707L9.293 0zM5 1h4a1 1 0 0 1 1 1v3H5V1zm0 4h5v1H5V5zm0 2h5v1H5V7zm0 2h5v1H5v-1zm0 2h5v1H5v-1z" />
                  </svg>
                  <span className="ml-1" style={{ fontWeight: 'bold' }}>Générer PDF</span>
                </Button>

              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}