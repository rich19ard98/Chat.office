import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
// import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
// import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
//import statutComdeMedicaColor from "../../helpers/statutComdeAccessColor";
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
// import Frais_adhesion_add_page from "./Frais_adhesion_add_page";
import { userSelector } from "../../store/selectors/userSelector";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
// import { isValid } from "js-base64";
import wait from "../../helpers/wait";
import { useForm } from "../../hooks/useForm";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/nodebu.png";
import moment from "moment";



export default function Bilans_reel_page() {

  const initialForm = {
    TYPE: null,
    PARIODE: null,
    DESCRIPTION: '',
    PERIODE_NUMERIQUE: "",
    DATE_BILAN: null

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
  const [afficheFrais, setAfficheFrais] = useState(1)
  // const [periode, setPeriode] = useState(null)
  const navigate = useNavigate();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [totalvaleurAmortissement, setTotalvaleurAmortissement] = useState(null)
  const [totalActif, setTotalActif] = useState(null)
  const [creance, setCreance] = useState(null)
  console.log({creance});
  
  const [banque, setBanque] = useState(null)
  const [caisse, setCaisse] = useState(null)
  const [valeurbrute, setValeur_brutte] = useState(null)
  const [totalresultant, setTotalresultant] = useState(null)
  const [valeurnette, setValeur_nette] = useState(null)
  const [totalcaisse_social, setTotalcaisse_social] = useState(null)
  const [total_passif, setTotal_passif] = useState(null)
  const [montResiduel, setMontResiduel] = useState(null)
  const [totalCapital, setTotalCapital] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null);
  const [type, setType] = useState([
    {
      code: 0,
      name: "Ouverture"
    },
    {
      code: 1,
      name: "Clôture"
    },

  ])
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

    TYPE: {
      required: false,
    },
    DESCRIPTION: {
      required: false,
    },
    PERIODE: {
      required: false,
    },
    PERIODE_NUMERIQUE: {
      required: false,
      number: true
    },
  },
    {
      PERIODE_NUMERIQUE: {
        required: "Ce champ est obligatoire",
        number: "Il faut mettre un nombre entier"
      },
      DATE_BILAN: {
        required: "Ce champ est obligatoire",

      },
      TYPE: {
        required: "Ce champ est obligatoire",

      },
      PERIODE: {
        required: "Ce champ est obligatoire",

      },
      DESCRIPTION: {
        required: "Ce champ est obligatoire",
      },



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






  //fonction pour lister les frais d'adhesion
  const fetchBilan = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/bilan/bilan/fetchTempsreel?`;

      var url = baseurl;


      const res = await fetchApi(url);
      setTotalvaleurAmortissement(res.result.totalvaleurAmortissement);
      setTotalRecords(res.result.totalRecords);
      // console.log(bilans,"list")

      setTotalCapital(res.result.totalCapital)
      setMontResiduel(res.result.montResiduel)
      setTotalresultant(res.result.totalresultant)
      setCreance(res.result.creances)
      setBanque(res.result.banque)
      setCaisse(res.result.caisse)
      setValeur_brutte(res.result.totalvaleurbrutte)
      setTotalcaisse_social(res.result.totalcaisse_social)
      setValeur_nette(res.result.totalvaleurnette)
      setTotalActif(res.result.totalActif)
      setTotal_passif(res.result.total_passif)


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, type, periode]);
  // console.log(creance,"kjdkkdk")

  useEffect(() => {
    fetchBilan();
  }, [lazyState, type, periode]);

  // console.log(bilans, "Liste")

  useEffect(() => {
    document.title = "Frais adhesion"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'frais_adh',
        name: 'Liste'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  // const [type, settype] = useState([
  //   {
  //     code: 0,
  //     name: "Ouverture"
  //   },
  //   {
  //     code: 1,
  //     name: "Fermeture"
  //   },
  // ])
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
  const handleSubmit = async (e) => {
    try {
      //   e.preventDefault();
      if (isValidate()) {
        // setIsSubmitting(true);
        const form = new FormData();
        form.append("TYPE", data.TYPE.code);
        // form.append("DATE_BILAN", data.DATE_BILAN);
        form.append("CREANCE", creance);
        form.append("CAISSE", caisse);
        form.append("BANQUE", banque);
        form.append("VALEUR_BRUTTE", valeurbrute);
        // form.append("PERIODE_NUMERIQUE", data.PERIODE_NUMERIQUE);
        form.append("DATE_BILAN", Date());
        form.append("VALEUR_NETTE", valeurnette);
        form.append("AMORTISSEMENT", totalvaleurAmortissement);
        form.append("PERIODE", data.PERIODE.code);
        form.append("VALEUR_RESIDUEL", montResiduel);
        form.append("CAPITAL", totalCapital);
        // form.append("PERIODE_NUMERIQUE",montResiduel);
        form.append("CAISSE_SOCIAL", totalcaisse_social);
        form.append("RESULTANT", totalresultant);
        form.append("TOTAL_ACTIF", totalActif);
        form.append("TOTAL_PASSIF", total_passif);


        const res = await fetchApi(`/bilan/bilan/create`, {
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
        navigate(`/bilan_liste`);
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
  const exportPdf = () => {
    const pageWidth = 210;
    const pageHeight = 297;
    const doc = new jsPDF({ orientation: "paysage", unit: "mm", format: 'a4' });

    // Ajouter l'image importée
    doc.addImage(entete, "JPEG", 0, 2, 70, 30);

    // Titre sous l'image
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Bilan en Temps Réel - ${moment(Date()).format("DD/MM/YYYY")}`, 100, 40, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Définir les colonnes pour les actifs
    const actifColumns = [
        { title: "N° Compte", dataKey: "numeroCompte" },
        { title: "Libelle", dataKey: "libelle" },
        { title: "Valeur Brute", dataKey: "valeurBrute" },
        { title: "Valeur Résiduelle", dataKey: "valeurResiduelle" },
        { title: "Amortissement", dataKey: "amortissement" },
        { title: "Valeur Nette", dataKey: "valeurNette" },
    ];

    // Données pour les actifs
    const actifData = [
        {
            numeroCompte: "223",
            libelle: "Équipements/Matériel",
            valeurBrute: `${(valeurbrute)} FBu`,
            valeurResiduelle: `${(montResiduel)} FBu`,
            amortissement: `${(totalvaleurAmortissement)} FBu`,
            valeurNette: `${(valeurnette)} FBu`,
        },
        {
            numeroCompte: "202",
            libelle: "Créance",
            valeurBrute: `${(creance)} FBu`,
            valeurResiduelle: "",
            amortissement: "",
            valeurNette: `${(creance)} FBu`,
        },
        {
            numeroCompte: "201",
            libelle: "Banque",
            valeurBrute: `${(banque)} FBu`,
            valeurResiduelle: "",
            amortissement: "",
            valeurNette: `${(banque)} FBu`,
        },
        {
            numeroCompte: "401",
            libelle: "Caisse",
            valeurBrute: `${(caisse)} FBu`,
            valeurResiduelle: "",
            amortissement: "",
            valeurNette: `${(caisse)} FBu`,
        },
    ];

    // Ajout des actifs au PDF
    doc.autoTable({
        startY: 45,
        head: [actifColumns.map(col => col.title)],
        body: actifData.map(item => [
            item.numeroCompte,
            item.libelle,
            item.valeurBrute,
            item.valeurResiduelle,
            item.amortissement,
            item.valeurNette,
        ]),
        margin: { top: 10, left: 5, right: 5 },
        styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
        },
        headStyles: {
            fillColor: [251, 140, 140], // Couleur de fond pour l'en-tête
        },
    });

    // Ajouter les passifs de manière similaire
    const passifColumns = [
        { title: "N° Compte", dataKey: "numeroCompte" },
        { title: "Libelle", dataKey: "libelle" },
        { title: "Montant", dataKey: "montant" },
    ];

    // Données pour les passifs
    const passifData = [
        {
            numeroCompte: "300",
            libelle: "Capital",
            montant: `${(totalCapital)} FBu`,
        },
        {
            numeroCompte: "303",
            libelle: "Resultant",
            montant: `${(totalresultant)} FBu`,
        },
        {
            numeroCompte: "402",
            libelle: "Caisse Social",
            montant: `${(totalcaisse_social)} FBu`,
        },
    ];

    // Ajout des passifs au PDF
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10, // Démarre après les actifs
        head: [passifColumns.map(col => col.title)],
        body: passifData.map(item => [
            item.numeroCompte,
            item.libelle,
            item.montant,
        ]),
        margin: { top: 10, left: 5, right: 5 },
        styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
        },
        headStyles: {
            fillColor: [251, 140, 140], // Couleur de fond pour l'en-tête
        },
    });


    // Vérifier la position finale
    const finalY = doc.autoTable.previous.finalY || 0;

    // Ajouter une nouvelle page si le contenu dépasse la zone
    const footerYPosition = pageHeight - 20;
    if (finalY + 20 > footerYPosition) {
        doc.addPage();
    }

    // Positionnement du texte pour le footer
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Ajouter ici le texte du footer si nécessaire
     const totalY = doc.autoTable.previous.finalY + 10; // Positionner sous le tableau de charges
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Total actif", 5, totalY);
    doc.text("Total passif", 100, totalY);
   

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalActif} Fbu`, 5, totalY + 10);
    doc.text(`${total_passif} Fbu`, 100, totalY + 10);


    return doc.output("blob");
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
                const blob = exportPdf();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
              },
            });
          };
  

  return (
    <>
     
      {globalLoading && <Loading />}
        {pdfUrl ? (
          <>
            <div className="mt-4">
              <h1 className="mb-3">Dépense générée :</h1>
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
                height: 50px;
            }
            td {
                padding: 2px;
                text-align: center; /* Centrer les valeurs */
            }
        `}</style>

      <div className="px-4 py-3 main_content">
        <div className="d-flex align-items-center justify-content-center">
          <h1 className="mb-3">Bilan en Temps Réel</h1>
        </div>
           <div className="selection-actions d-flex align-items-center ml-3">
                <Button
              className=" mt-3 ml-3 button-mobile "
              size="small"
              type="submit"
              onClick={(e) => {
                handleGenerateFacture(e)

              }}
               data-pr-tooltip="Générer le PDF"  // Ajout du tooltip
    tooltipOptions={{ position: 'top' }} // Options pour la position du tooltip
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194 1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43 9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513 4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z"/></svg>
            
            </Button>
              </div>
        <div className="row d-flex bg-light">
          <table className="table w-s100 col-8" style={{ border: "4px solid #fb8c8c" }}>
            <tr className="">
              <td style={{ backgroundColor: "#143d8f", color: "white" }} className="font-bold bordesr borders-3 border-dark " colSpan={6}>Actif</td>
            </tr>
            <tr>
              <td className="p-smd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>N° Compte</td>
              <td className="p-msd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Libelle</td>
              <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Brute</td>
              <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Résiduelle</td>
              <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Amortissement</td>
              <td className="p-mjd-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Valeur Nette</td>
            </tr>
            <tr>
              <td style={{ borderRight: "none" }} className="font-bold">I Valeur Immobilisée</td>
            </tr>
            <tr>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>223</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Équipements/Matériel</td>
              <td className="p-md-0 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(valeurbrute)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(montResiduel)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(totalvaleurAmortissement)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(valeurnette)} FBu`}</td>
            </tr>
            <tr>
              <td style={{ borderRight: "none" }} className="font-bold">II Valeur d'exploitation</td>
            </tr>
            <tr>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>202</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Créance</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(creance)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(creance)} FBu`}</td>
            </tr>
            <tr>
              <td style={{ borderRight: "none", backgroundColor: "teaxl" }} className="font-bold">III Valeur disponible</td>
            </tr>
            <tr>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>201</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Banque</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(banque)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(banque)} FBu`}</td>

            </tr>
            <tr>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>401</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Caisse</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(caisse)} FBu`}</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(caisse)} FBu`}</td>
            </tr>
            <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
              <td className="font-bold" style={{ width: "50px", fontSize: '20px' }} colSpan={6}>
                Total actif:{`${new Intl.NumberFormat('fr-FR').format(totalActif)} FBu`}
              </td>
            </tr>
          </table>
          <table style={{ border: "4px solid #fb8c8c" }} className="table w-s100  col-4">
            <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
              <td className="font-bold  " colSpan={6}>Passif</td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>N° Compte</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Libelle</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Montant</td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>300</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Capital</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(totalCapital)} FBu`}</td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>303</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Resultant</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(totalresultant)} FBu`}</td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>402</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>Caisse Social</td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}>{`${new Intl.NumberFormat('fr-FR').format(totalcaisse_social)} FBu`}</td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
            </tr>
            <tr style={{ height: '50px' }}>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
              <td className="p-md-2 font-bold " style={{ border: "2px solid #fb8c8c" }}></td>
            </tr>
            <tr style={{ height: '50px', backgroundColor: "#143d8f", color: "white" }}>
              <td className="font-bold" style={{ width: "50px", fontSize: '20px' }} colSpan={6}>
                Total Passif:{`${new Intl.NumberFormat('fr-FR').format(total_passif)} FBu`}
              </td>
            </tr>
          </table>
        </div>
        <div className="d-flex flex-column">
          {!isVisible && (
            <button
              onClick={handleToggle}
              style={{ backgroundColor: "#143d8f", marginBottom: "10px" }}
              className="btn btn-secondary btn-md"
            >
              {isVisible ? "Afficher les éléments" : "Conserve le bilan"}
            </button>
          )}

          {isVisible && (
            <div className="form-contaianer mt-5">
              <div className="d-flex flex-row">
                <div className="row w-100">

                  <div className="col-md-4">
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
                  </div>
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
                          Enregiste le bilan
                        </button>

                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="">
      <div className="row">
        <div className="col-md-2">
          <label htmlFor="PERIODE" className="label mb-1">Periode</label>
        </div>
        <div className="col-md-5">
          <Dropdown
            value={data.PERIODE}
            options={periode}
            onChange={(e) => setValue("PERIODE", e.value)}
            optionLabel="name"
            id="PERIODE"
            filter
            placeholder="Sélectionner la periode d'opération"
            className={`w-100 ${hasError("PERIODE") ? "p-invalid" : ""}`}
            showClear
          />
          <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
            {hasError("PERIODE") ? getError("PERIODE") : ""}
          </div>
        </div>
      </div>
    </div> */}
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