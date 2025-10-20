import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { welcome_routes_items } from "../../routes/welcome/welcome_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import { userSelector } from "../../store/selectors/userSelector";
import moment from "moment";
import jsPDF from "jspdf";
import { Calendar } from "primereact/calendar";
import "jspdf-autotable";
import { Tooltip } from 'primereact/tooltip';
import LZString from "lz-string";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import entete from "../../../public/images/nodebu.png";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from "primereact/dropdown";
import { encodeId } from "../../utils/IdEncryption";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import StatutEcritureComptableColor from "../../helpers/StatutEcritureComptableColor";
export default function Amortissements_liste_page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [amortissements, setAmortissements] = useState([]);
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const user = useSelector(userSelector);
  const [Montant, setMontant] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dates, setDates] = useState(null);
  const [Echeancesretard, setEcheancesretard] = useState(null)
  const [statutamort, setstatutamort] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [visibleStatut, setVisibleStatut] = useState(false);
  const navigate = useNavigate();
  const [backendIsDown, setBackendIsDown] = useState(false);

  const [etatamort, setetatamort] = useState(false)

  const { connectedMembre, setconnectedMembre } = useState({})
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
  const statusSelected = (status) => {
    setstatutamort(status);
  };
  const onSelectAllChange = (event) => {
    const selectAll = event.checked;

    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(accessoires);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };
  const [statusdata, setstatusdata] = useState([
    {
      code: 0,
      name: "En attente"
    },
    {
      code: 1,
      name: "Payé"
    },
    {
      code: 2,
      name: "Retard"
    }

  ]);
  const etatSelected = (etat) => {
    setetatamort(etat);
  };

  const CACHE_NAME = "AmortissementsCache";

  // 🔑 Clé cache unique selon filtres
  const buildCacheKey = () => {
    return `${CACHE_NAME}?${new URLSearchParams({
      ...lazyState,
      statutamort: statutamort?.code || "",
      etatamort: etatamort?.code || "",
      startDate: dates?.[0]?.toISOString() || "",
      endDate: dates?.[1]?.toISOString() || "",
      connectedMembre: connectedMembre || "",
    }).toString()}`;
  };

  const fetchAmortissements = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        let url = `/credits/amortissements/fetch?rows=100000&`;

        // Pagination et filtres
        for (let key in lazyState) {
          const value = lazyState[key];
          if (value) {
            url += `${key}=${typeof value === "object" ? JSON.stringify(value) : value
              }&`;
          }
        }
        if (dates) {
          const [startDate, endDate] = dates;
          if (startDate) url += `startDate=${startDate.toISOString()}&`;
          if (endDate) url += `endDate=${endDate.toISOString()}&`;
        }
        if (statutamort?.code != null) url += `statutamort=${statutamort.code}&`;
        if (etatamort?.code != null) url += `etatamort=${etatamort.code}&`;
        if (connectedMembre) url += `connectedMembre=${connectedMembre}&`;

        // 🔹 Fetch API
        const res = await fetchApi(url);
        const Data = res.result?.data || [];

        // 👉 Mise à jour state
        setAmortissements(Data);
        setTotalRecords(res.result.totalRecords);

        const total = Data.reduce(
          (acc, cur) => acc + Number(cur.MONTANT_REMBOURSEMENT || 0),
          0
        );
        setMontant(total);

        const EcheancesEnRetard = Data.filter(e => e.STATUT === 2);
        setEcheancesretard(EcheancesEnRetard.length);

        // ✅ Sauvegarde dans cache
        const cache = await caches.open(CACHE_NAME);
        const compressed = LZString.compressToUTF16(
          JSON.stringify({
            data: Data,
            montant: total,
            totalRecords: res.result.totalRecords,
            timestamp: Date.now(),
          })
        );
        await cache.put(
          buildCacheKey(),
          new Response(compressed, { headers: { "Content-Type": "text/plain" } })
        );

        setBackendIsDown(false);
      } catch (error) {
        console.error("❌ Erreur fetchAmortissements :", error);
        setBackendIsDown(true);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [lazyState, dates, statutamort, connectedMembre, etatamort]
  );

  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(buildCacheKey());

        if (cachedResponse) {
          const compressed = await cachedResponse.text();
          const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

          const isExpired = Date.now() - parsed.timestamp > 3600000; // 1h
          if (!isExpired) {
            // 👉 Affichage immédiat
            setAmortissements(parsed.data);
            setTotalRecords(parsed.totalRecords);
            setMontant(parsed.montant);

            const EcheancesEnRetard = parsed.data.filter(e => e.STATUT === 2);
            setEcheancesretard(EcheancesEnRetard.length);

            setLoading(false);

            // 👉 Et on recharge en arrière-plan sans bloquer l’UI
            fetchAmortissements(false);
            return;
          } else {

            await cache.delete(buildCacheKey());
          }
        }

        // 🚀 Pas de cache → API avec loading
        fetchAmortissements(true);
      } catch (err) {
        console.warn("⚠️ Erreur lecture cache :", err);
        fetchAmortissements(true);
      }
    };

    loadFromCache();

    // 🔄 Auto refresh toutes les 2 minutes (background)
    const interval = setInterval(() => fetchAmortissements(false), 120000);
    return () => clearInterval(interval);
  }, [lazyState, fetchAmortissements, backendIsDown]);


  useEffect(() => {
    document.title = "Amortissements"
    dispacth(setBreadCrumbItemsAction([administration_routes_items.amortissements]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  /**
* Permet Generer Pdf et excel
 * @param {express.Request} req 
* @param {express.Response} res 
* @author Richard <richardngendakumana10@gmail.com>
* @date 02/07/2025
*/

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

    // 🖼️ En-tête image
    doc.addImage(entete, "JPEG", 0, 0, 70, 25);

    // 🏷️ Titre centré
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Liste des Échéances - Semaine en cours", pageWidth / 2, 30, { align: "center" });

    // 📅 Date à droite
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
      align: "right",
    });

    // 📊 Colonnes
    const columns = [
      { header: "#", dataKey: "index" },
      { header: "Membre", dataKey: "membre" },
      { header: "Réf Crédit", dataKey: "reference_credit" },
      { header: "N° échéance", dataKey: "numero_echeance" },
      { header: "Montant total", dataKey: "montant_remboursement" },
      { header: "Capital", dataKey: "montant_initial" },
      { header: "Intérêt", dataKey: "interet" },
      { header: "Penalite", dataKey: "Penalite" },
      { header: "Date échéance", dataKey: "date_echeance" },
      { header: "Statut", dataKey: "statut" },
    ];

    // 📄 Lignes item.EST_AKARAVYO ? item.NUMERO_ECHEANCE +  " Mois" : item.NUMERO_ECHEANCE + " semaine",

    const rows = amortissements.map((item, idx) => ({
      index: idx + 1,
      membre: `${item.creditss?.membresmicro?.NOM ?? ""} ${item.creditss?.membresmicro?.PRENOM ?? ""}`.trim(),
      reference_credit: item.creditss?.REFERENCE_CREDIT ?? "",
      numero_echeance: `${item.EST_AKARAVYO ? item.NUMERO_ECHEANCE + " Mois" : item.NUMERO_ECHEANCE + " semaine"}`,
      montant_remboursement: `${parseFloat(item.MONTANT_REMBOURSEMENT || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      montant_initial: `${parseFloat(item.MONTANT_INITIAL || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      interet: `${parseFloat(item.INTERET || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      Penalite: `${parseFloat(item.PENALITE || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,

      date_echeance: item.DATE_ECHEANCE ? moment(item.DATE_ECHEANCE).format("DD/MM/YYYY") : "-",
      statut:
        item.STATUT === 0 ? "En attente" :
          item.STATUT === 1 ? "Payé" :
            item.STATUT === 2 ? "En retard" : "-",
    }));

    // ➕ Total
    const totalMontant = amortissements.reduce((acc, cur) => acc + parseFloat(cur.MONTANT_REMBOURSEMENT || 0), 0);

    // 📋 Tableau
    doc.autoTable({
      columns,
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [251, 140, 140],
        fontSize: 8,
      },

      theme: "grid",
      pageBreak: "auto",
    });
    // ✅ Total du montant des crédits
    const finalY = doc.lastAutoTable.finalY || 0;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      pageWidth / 2,
      finalY + 8,
      { align: "center" }
    );


    const footerY = pageHeight - 25;

    // ➕ Nouvelle page si nécessaire
    if (finalY + 20 > footerY) {
      doc.addPage();
    }

    // ✍️ Signatures
    const utilisateur = `${user.NOM} ${user.PRENOM}`;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Effectué par : ${utilisateur} ....................................`, 10, footerY);
    doc.text("Approuvé par : ..................................", pageWidth / 2 + 10, footerY);

    // 💾 Téléchargement
    const filename = `echeances_${moment().format("YYYYMMDD_HHmmss")}.pdf`;
    return doc.output("blob", filename);
  };




  ////Excel
  const exportExcel = () => {
    const titre = "Liste des échéances";

    // 📊 Transformation des données   numero_echeance: `${ item.EST_AKARAVYO ? item.NUMERO_ECHEANCE +  " Mois" : item.NUMERO_ECHEANCE + " semaine"}`,

    const data = amortissements.map((item, idx) => ({
      "#": idx + 1,
      "Membre": `${item.creditss?.membresmicro?.NOM ?? ""} ${item.creditss?.membresmicro?.PRENOM ?? ""}`.trim(),
      "Réf Crédit": item.creditss?.REFERENCE_CREDIT ?? "",
      "N° échéance": `${item.EST_AKARAVYO ? item.NUMERO_ECHEANCE + " Mois" : item.NUMERO_ECHEANCE + " semaine"}`,
      "Montant total": parseFloat(item.MONTANT_REMBOURSEMENT || 0),
      "Capital": parseFloat(item.MONTANT_INITIAL || 0),
      "Intérêt": parseFloat(item.INTERET || 0),
      "Penalite": parseFloat(item.PENALITE || 0),
      "Date échéance": item.DATE_ECHEANCE
        ? new Date(item.DATE_ECHEANCE).toLocaleDateString("fr-FR")
        : "",
      "Statut":
        item.STATUT === 0 ? "En attente" :
          item.STATUT === 1 ? "Payé" :
            item.STATUT === 2 ? "En retard" : "-"
    }));

    // ➕ Ligne vide + TOTAL
    const totalMontant = amortissements.reduce(
      (acc, cur) => acc + parseFloat(cur.MONTANT_REMBOURSEMENT || 0),
      0
    );

    data.push({}); // ligne vide
    data.push({
      "#": "",
      "Membre": "",
      "Réf Crédit": "",
      "N° échéance": "TOTAL",
      "Montant total": totalMontant,
      "Capital": "",
      "Intérêt": "",
      "Date échéance": "",
      "Statut": ""
    });

    const worksheet = XLSX.utils.json_to_sheet([], { cellStyles: true });

    // ➕ Titre A1
    XLSX.utils.sheet_add_aoa(worksheet, [[titre]], { origin: "A1" });

    // ➕ Données à partir de A3
    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: false });

    // 📏 Largeurs colonnes
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
    ];

    // 🔗 Fusion A1:I1 pour le titre
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }
    ];

    // 🎨 Style titre (A1)
    worksheet["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "FF6384" } }
    };

    // 📌 Format numérique des colonnes montant (Montant total, Capital, Intérêt)
    const montantCols = [4, 5, 6]; // Colonnes E, F, G
    for (let i = 0; i < data.length; i++) {
      montantCols.forEach(col => {
        const cellRef = XLSX.utils.encode_cell({ r: i + 2, c: col }); // A3 = r=2
        const cell = worksheet[cellRef];
        if (cell && typeof cell.v === "number") {
          cell.t = "n";
          cell.z = '#,##0.00';
        }
      });
    }

    // 📘 Création du workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Échéances");

    // 📥 Génération du fichier Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true // important si tu veux appliquer les styles avec xlsx-style
    });

    // 💾 Sauvegarde
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fileName = `${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}_Listes_Echeances_Semaine_encours.xlsx`;
    saveAs(blob, fileName);
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
  const handleGeneraExcel = () => {

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Génerer Document Excel",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment générer Document Excel ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        exportExcel()
      },
    });
  };
  const [EtatAmortissement, setEtatAmortissement] = useState([
    {
      code: 0,
      name: "Reussi"
    },
    {
      code: 1,
      name: "Annuler"
    },


  ]);

  return (
    <>

      {globalLoading && <Loading />}

      <div className="px-4 py-3 main_content">
        {pdfUrl ? (
          <>
            <div className="mt-4">
              <h1 className="mb-3">Amortissemes:</h1>
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
                type="submit"
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
            {/* Titre + bouton export */}
            <div className="d-flex align-items-center justify-content-between">
              <h1 className="mb-3">Amortissements</h1>

            </div>

            {/* Filtres */}
            <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="p-input-icon-left mt-1">
                  <i className="pi pi-search" />
                  <InputText
                    type="search"
                    placeholder="Recherche"
                    className="p-inputtext-sm"
                    style={{ minWidth: 300 }}
                    onInput={(e) => setlazyState((s) => ({ ...s, search: e.target.value }))}
                  />
                </div>
                {/* Dropdown Status */}
                <div className="d-flex flex-column mx-3">
                  <Dropdown
                    value={statutamort}
                    onChange={(e) => statusSelected(e.value)}
                    options={statusdata}
                    filter
                    filterBy="name"
                    optionLabel="name"
                    placeholder="Status"
                    className="w-full md:w-10rem no-p"
                    showClear
                  />
                </div>


                <div className="d-flex flex-column mt-1 mx-2">
                  <Calendar
                    value={dates}
                    onChange={(e) => setDates(e.value)}
                    selectionMode="range"
                    readOnlyInput
                    placeholder="Filtre par période"
                    inputStyle={{ padding: "9px 0.75rem" }}
                    showButtonBar
                    dateFormat="dd/mm/yy"
                    className="w-full md:w-14rem no-p"
                    style={{ minWidth: 100 }}
                  />
                </div>
                <div className="d-flex flex-column mx-1">
                  <Dropdown
                    value={etatamort}
                    onChange={(e) => etatSelected(e.value)}
                    options={EtatAmortissement}
                    filter
                    filterBy="name"
                    optionLabel="name"
                    placeholder="Etat amortissement"
                    className="w-full md:w-10rem mx-3 no-p"
                    showClear
                  />
                </div>
                <div className="d-flex flex-column mx-2">
                  <label htmlFor="compteCredit" className="ms-5 mb-0" style={{ color: "black", fontSize: "0.3rem" }}>Montant Total</label>

                </div>
                <div className="d-flex flex-column mx-2">
                  <label htmlFor="compteCredit" className="ms-5 mb-0" style={{ color: "black", fontSize: "0.3rem" }}></label>
                  <InputText
                    id="compteCredit"
                    value={Montant?.toLocaleString("fr-FR")}
                    disabled
                    className="p-inputtext-sm"
                    style={{ color: "blue", fontWeight: "bold", width: "150px" }}
                  />
                </div>



                <>
                  <div className="position-relative d-inline-block mx-2 notif-bell">
                    {/* Icône de cloche SVG Bootstrap */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24" // Taille équivalente à fs-4
                      height="24"
                      fill="currentColor"
                      className="bi bi-bell"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                    </svg>

                    {Echeancesretard > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {Echeancesretard}
                      </span>
                    )}
                  </div>

                  <Tooltip target=".notif-bell" content="Échéances en retard" />
                </>


                <div className="d-flex align-items-center justify-content-end ml-5 gap-5">

                  <div
                    onClick={() => {
                      if (amortissements.length === 0) return;
                      handleGeneraPDF();
                    }}
                    style={{
                      background: "#143c8c",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "white",
                      cursor: amortissements.length === 0 ? "not-allowed" : "pointer",
                      opacity: amortissements.length === 0 ? 0.6 : 1,
                    }}
                  >
                    {/* Ton SVG ici */}
                    PDF
                  </div>


                  <div
                    onClick={() => {
                      if (amortissements.length === 0) return;
                      handleGeneraExcel();
                    }}
                    style={{
                      background: "#143c8c",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "white",
                      cursor: amortissements.length === 0 ? "not-allowed" : "pointer",
                      opacity: amortissements.length === 0 ? 0.6 : 1,
                    }}
                  >
                    {/* Ton SVG ici */}
                    XLS
                  </div>
                </div>
              </div>

            </div>

            {/* Table */}
            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
              <DataTable
                lazy
                value={amortissements}
                tableStyle={{ minWidth: "50rem" }}
                size="small"
                paginator
                rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 500, 1000]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate={` {first} - {last} dans ${totalRecords} éléments`}
                emptyMessage="Aucun élément trouvé"
                first={lazyState.first}
                rows={lazyState.rows}
                totalRecords={totalRecords}
                onPage={onPage}
                onSort={onSort}
                sortField={lazyState.sortField}
                sortOrder={lazyState.sortOrder}
                onFilter={onFilter}
                filters={lazyState.filters}
                loading={loading}
                selection={selectedItems}
                onSelectionChange={onSelectionChange}
                selectAll={selectAll}
                onSelectAllChange={onSelectAllChange}
                reorderableColumns
                resizableColumns
                columnResizeMode="expand"
                scrollable
              >
                <Column
                  field="NOM"
                  frozen
                  header="Membre"
                  sortable
                  body={(item) => {
                    return (
                      <div className="d-flex round-indicator">

                        {item?.creditss?.membresmicro?.IMAGE ? (
                          <Image
                            src={item?.creditss?.membresmicro?.IMAGE}
                            alt="Image"
                            className="rounded-5"
                            imageClassName="rounded-5 object-fit-cover"
                            imageStyle={{ width: "30px", height: "30px" }}
                            style={{ width: "30px", height: "30px" }}
                            preview
                          />
                        ) : (
                          <div style={{
                            width: '30px', height: '30px',
                            borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                            justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                          }}>
                            {item?.creditss?.membresmicro?.NOM.charAt(0)}{item?.creditss?.membresmicro?.PRENOM.charAt(0)}
                          </div>
                        )}
                        <div className="ml-2 mt-1">
                          <div className="font-bold">
                            {item?.creditss?.membresmicro?.NOM} {item?.creditss?.membresmicro?.PRENOM}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                <Column
                  field="REFERENCE_CREDIT"
                  header="Ref Crédit"
                  sortable
                  body={(item) => (
                    <Link
                      className="text-decoration-none d-flex round-indicator"
                      style={{ color: '#399af2' }}
                      to={`/credits/credits/${encodeId(item?.creditss?.ID_OCTROI_CREDIT)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item?.creditss?.REFERENCE_CREDIT}
                    </Link>
                  )}
                />
                <Column
                  field="NUMERO_ECHEANCE"
                  header="N. Échéance"
                  sortable
                  body={(item) => (
                    <span>
                      {item.NUMERO_ECHEANCE + "mois"}
                    </span>
                  )}
                />
                <Column
                  field="MONTANT_INITIAL"
                  header="Capital"
                  sortable
                  body={(item) => item.MONTANT_INITIAL}
                />
                <Column
                  field="INTERET"
                  header="Intérêt"
                  sortable
                  body={(item) => item?.INTERET}
                />
                <Column
                  field="PENALITE"
                  header="Penalite"
                  sortable
                  body={(item) => item?.PENALITE}
                />
                <Column
                  field="MONTANT_REMBOURSEMENT"
                  header="Montant total"
                  sortable
                  body={(item) => item?.MONTANT_REMBOURSEMENT}

                />
                <Column
                  field="DATE_ECHEANCE"
                  header="Date échéance"
                  sortable
                  body={(item) => {
                    const date = new Date(item.DATE_ECHEANCE);
                    return date.toLocaleDateString('fr-FR');
                  }}
                />
                <Column
                  field="STATUT"
                  frozen
                  header="Statut"
                  sortable
                  body={(item) => {
                    return (
                      <>
                        {item?.STATUT == 0 ? (
                          <Button className="btn-sm"
                            data-pr-tooltip='en attente'
                            tooltip tooltipOptions={{ position: 'top' }}
                            style={{
                              width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                              color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                            }}
                            icon={options => {
                              return (
                                <span className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: statutAmortissementsColor(item.STATUT).icon
                                  }} />
                              );
                            }} />
                        ) : item?.STATUT == 1 ? (
                          <Button className="btn-sm"
                            data-pr-tooltip='payé'
                            tooltip tooltipOptions={{ position: 'top' }}
                            style={{
                              width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                              color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                            }}

                            icon={options => {
                              return (
                                <span className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: statutAmortissementsColor(item.STATUT).icon
                                  }} />
                              );
                            }} />
                        ) : (
                          <Button className="btn-sm"
                            data-pr-tooltip='En Retard'
                            tooltip tooltipOptions={{ position: 'top' }}
                            style={{
                              width: 25, height: 25, backgroundColor: statutAmortissementsColor(item.STATUT).backgroundColor,
                              color: statutAmortissementsColor(item.STATUT).textColor, border: "none"
                            }}
                            icon={options => {
                              return (
                                <span className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: statutAmortissementsColor(item.STATUT).icon
                                  }} />
                              );
                            }} />
                        )}
                      </>
                    );
                  }}
                />
                <Column
                  field="STATUT"
                  frozen
                  header="Etat"
                  sortable
                  body={(item) => {
                    return (
                      <>
                        {item?.ETAT == 0 ? (
                          <Button className="btn-sm"
                            data-pr-tooltip='Reussi'
                            tooltip tooltipOptions={{ position: 'top' }}
                            style={{
                              width: 25, height: 25, backgroundColor: StatutEcritureComptableColor(item.ETAT).backgroundColor,
                              color: StatutEcritureComptableColor(item.ETAT).textColor, border: "none"
                            }}
                            icon={options => {
                              return (
                                <span className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: StatutEcritureComptableColor(item.ETAT).icon
                                  }} />
                              );
                            }} />
                        ) : item?.ETAT == 1 ? (
                          <Button className="btn-sm"
                            data-pr-tooltip={item?.DESCRIPTION || "Annulé"}
                            tooltip tooltipOptions={{ position: 'top' }}
                            style={{
                              width: 25, height: 25, backgroundColor: StatutEcritureComptableColor(item.ETAT).backgroundColor,
                              color: StatutEcritureComptableColor(item.ETAT).textColor, border: "none"
                            }}

                            icon={options => {
                              return (
                                <span className="mb-1"
                                  dangerouslySetInnerHTML={{
                                    __html: StatutEcritureComptableColor(item.ETAT).icon
                                  }} />
                              );
                            }} />
                        )
                          :
                          (
                            <Button className="btn-sm"
                            />
                          )
                        }
                      </>
                    );
                  }}
                />
              </DataTable>
            </div>

          </>
        )}


      </div>
      <Outlet />
    </>
  );
}