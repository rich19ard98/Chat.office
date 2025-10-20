import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { welcome_routes_items } from "../../routes/welcome/welcome_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { Calendar } from "primereact/calendar";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from "primereact/dropdown";
import { encodeId } from "../../utils/IdEncryption";
import entete from "../../../public/images/nodebu.png";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import { hr } from "date-fns/locale";
export default function Paiements_semaine_encours() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(1);
  const [amortissements, setAmortissements] = useState([]);
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [visibleStatut, setVisibleStatut] = useState(false);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dates, setDates] = useState(null);

  const [Montant, setMontant] = useState();
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
  const fetchAmortissements = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/credits/amortissements/fetch?`;
      let url = baseurl;

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          if (typeof value === "object") {
            url += `${key}=${JSON.stringify(value)}&`;
          } else {
            url += `${key}=${value}&`;
          }
        }
      }
      if (dates) {
        const [startDate, endDate] = dates;
        if (startDate) {
          url += `startDate=${startDate.toISOString()}&`;
        }
        if (endDate) {
          url += `endDate=${endDate.toISOString()}&`;
        }
      }
      if (!dates || (dates && (!dates[0] || !dates[1]))) {
        // Active le filtre semaine uniquement si aucune date explicite
        url += `filtreSemaine=true&`;
      }
      const res = await fetchApi(url);
      console.log(res);

      setAmortissements(res.result.data);
      const total = res.result.data.reduce((acc, cur) => acc + Number(cur.MONTANT_REMBOURSEMENT || 0), 0);
      setMontant(total)

      setTotalRecords(res.result.totalRecords);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, startDate,
    endDate,
    dates
    //dates
  ]);
  useEffect(() => {
    dispacth(setBreadCrumbItemsAction([administration_routes_items.Paiementsemaine_en_cours]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  useEffect(() => {

    fetchAmortissements();

  }, [startDate,
    endDate,
    dates,
    lazyState]);

  /**
* Permet d'afficher les commande
 * @param {express.Request} req 
* @param {express.Response} res 
* @author Richard <richardngendakumana10@gmail.com>
* @date 02/07/2025
*/




  const exportPdf = () => {
    const pageWidth = 210; // 📄 Largeur d'une page A4 en mm
    const pageHeight = 297; // 📄 Hauteur d'une page A4 en mm

    // 📘 Création du document PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 🖼️ Insertion de l'image d'en-tête (logo ou bannière)
    doc.addImage(entete, "JPEG", 0, 2, 70, 30);

    // 📝 Titre placé à droite de l'image
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Liste des Échéances de la semaine en cours", 80, 15);

    // 📅 Date d'exportation (à droite du titre)
    const today = new Date();
    const dateExport = today.toLocaleDateString("fr-FR");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date d'export : ${dateExport}`, 80, 21);

    // 📊 Définition des colonnes
    const columns = [
      { title: "#", dataKey: "index" },
      { title: "Membre", dataKey: "membre" },
      { title: "Réf Crédit", dataKey: "reference_credit" },
      { title: "N° échéance", dataKey: "numero_echeance" },
      { title: "Montant total", dataKey: "montant_remboursement" },
      { title: "Capital", dataKey: "montant_initial" },
      { title: "Intérêt", dataKey: "interet" },
      { title: "Date échéance", dataKey: "date_echeance" },
      { title: "Statut", dataKey: "statut" },
    ];

    // 🧾 Construction des données
    const body = amortissements.map((item, idx) => ({
      index: idx + 1,
      membre: `${item.creditss?.membresmicro?.NOM ?? ""} ${item.creditss?.membresmicro?.PRENOM ?? ""}`.trim(),
      reference_credit: item.creditss?.REFERENCE_CREDIT ?? "",
      numero_echeance: `${item.NUMERO_ECHEANCE ?? ""} semaine`,
      montant_remboursement: `${parseFloat(item.MONTANT_REMBOURSEMENT || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      montant_initial: `${parseFloat(item.MONTANT_INITIAL || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      interet: `${parseFloat(item.INTERET || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      date_echeance: item.DATE_ECHEANCE ? new Date(item.DATE_ECHEANCE).toLocaleDateString("fr-FR") : "",
      statut:
        item.STATUT === 0 ? "En attente" :
          item.STATUT === 1 ? "Payé" :
            item.STATUT === 2 ? "En retard" : "-"
    }));

    // ➕ Total des montants
    const totalMontant = amortissements.reduce(
      (acc, cur) => acc + parseFloat(cur.MONTANT_REMBOURSEMENT || 0),
      0
    );

    // 📋 Génération du tableau
    doc.autoTable({
      startY: 50,
      head: [columns.map(col => col.title)],
      body: body.map(row => columns.map(col => row[col.dataKey])),
      margin: { top: 10, left: 10, right: 10 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "left",
        valign: "middle"
      },
      headStyles: {
        fillColor: [251, 140, 140],
        halign: "center"
      },
      columnStyles: {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 40 },  // Membre
        2: { cellWidth: 25 },  // Réf Crédit
        3: { cellWidth: 20 },  // N° échéance
        4: { cellWidth: 20 },  // Montant total
        5: { cellWidth: 20 },  // Capital
        6: { cellWidth: 20 },  // Intérêt
        7: { cellWidth: 20 },  // Date échéance
        8: { cellWidth: 20 },  // Statut
      },
      foot: [
        [
          { content: "Total", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
          { content: `${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`, colSpan: 5, styles: { fontStyle: "bold" } }
        ]
      ],
    });

    // 🔽 Récupérer la position finale du tableau
    const finalY = doc.autoTable.previous.finalY || 0;
    const footerY = pageHeight - 20;

    // ➕ Ajouter une nouvelle page si trop bas
    if (finalY + 20 > footerY) {
      doc.addPage();
    }

    // ✍️ Signatures
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const effectuéPar = "Effectué par : ....................................";
    const approuvéPar = "Approuvé par : ..................................";

    doc.text(effectuéPar, 10, footerY - 10);
    doc.text(approuvéPar, 125, footerY - 10);

    // 📤 Export final
    return doc.output("blob", "Echeances");
  };








  const exportExcel = () => {
    // 🏷️ Titre principal du document Excel
    const titre = "Liste des échéances de la semaine en cours";

    // 🧾 Transformation des données d’amortissements en tableau lisible
    const data = amortissements.map((item, idx) => ({
      "#": idx + 1, // Numéro de ligne
      "Membre": `${item.creditss?.membresmicro?.NOM ?? ""} ${item.creditss?.membresmicro?.PRENOM ?? ""}`.trim(), // Nom complet du membre
      "Réf Crédit": item.creditss?.REFERENCE_CREDIT ?? "", // Référence du crédit
      "N° échéance": `${item.NUMERO_ECHEANCE ?? ""} semaine`, // Numéro de l’échéance
      "Montant total": `${parseFloat(item.MONTANT_REMBOURSEMENT || 0).toLocaleString("fr-FR")} Fbu`, // Montant à rembourser
      "Capital": `${parseFloat(item.MONTANT_INITIAL || 0).toLocaleString("fr-FR")} Fbu`, // Montant du capital
      "Intérêt": `${parseFloat(item.INTERET || 0).toLocaleString("fr-FR")} Fbu`, // Montant des intérêts
      "Date échéance": item.DATE_ECHEANCE
        ? new Date(item.DATE_ECHEANCE).toLocaleDateString("fr-FR") // Date au format FR
        : "",
      "Statut":  // Statut de l’échéance
        item.STATUT === 0 ? "En attente" :
          item.STATUT === 1 ? "Payé" :
            item.STATUT === 2 ? "En retard" : "-"
    }));

    // 🔢 Calcul du total des montants remboursés
    const totalMontant = amortissements.reduce(
      (acc, cur) => acc + parseFloat(cur.MONTANT_REMBOURSEMENT || 0),
      0
    );

    // ➕ Ligne vide
    data.push({});

    // ➕ Ligne "TOTAL" avec formatage et total général
    data.push({
      "#": "",
      "Membre": "",
      "Réf Crédit": "",
      "N° échéance": "TOTAL",
      "Montant total": `${totalMontant.toLocaleString("fr-FR")} Fbu`,
      "Capital": "",
      "Intérêt": "",
      "Date échéance": "",
      "Statut": ""
    });

    // 📄 Création de la feuille Excel vide
    const worksheet = XLSX.utils.json_to_sheet([]);

    // 🧩 Ajout du titre dans la cellule A1
    XLSX.utils.sheet_add_aoa(worksheet, [[titre]], { origin: "A1" });

    // 🧩 Insertion des données à partir de la ligne 3 (A3)
    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: false });

    // 📏 Définition de la largeur des colonnes (wch = "width in characters")
    worksheet["!cols"] = [
      { wch: 5 },   // Colonne "#"
      { wch: 30 },  // Colonne "Membre"
      { wch: 15 },  // Colonne "Réf Crédit"
      { wch: 15 },  // Colonne "N° échéance"
      { wch: 20 },  // Colonne "Montant total"
      { wch: 15 },  // Colonne "Capital"
      { wch: 12 },  // Colonne "Intérêt"
      { wch: 18 },  // Colonne "Date échéance"
      { wch: 15 },  // Colonne "Statut"
    ];

    // 🔗 Fusion de cellules : fusionner A1 à I1 pour le titre
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } } // de A1 (r=0,c=0) à I1 (r=0,c=8)
    ];

    // 🎨 Style du titre (A1) : fond rose, texte blanc, centré, en gras
    worksheet["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "143d8f" } }, // texte blanc, taille 14, gras
      alignment: { horizontal: "center", vertical: "center" }, // centré
      fill: { fgColor: { rgb: "FF6384" } } // fond rose
    };

    // 📚 Création du classeur Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Échéances");

    // 🧵 Génération du fichier Excel avec les styles (optionnel selon la lib utilisée)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true // nécessaire pour appliquer les styles si on utilise xlsx-style
    });

    // 📦 Création d’un blob pour le téléchargement
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // 📝 Génération du nom du fichier avec la date du jour
    const fileName = `${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}_Listes_Echeances_Semaine_encours.xlsx`;

    // 💾 Téléchargement du fichier
    saveAs(blob, fileName);
  };



  const handleGeneraPDF = (e, itemsIds) => {
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
        exportPdf()
        const blob = exportPdf();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      },
    });
  };
  const handleGeneraExcel = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

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



  return (
    <>

      {globalLoading && <Loading />}

      <div className="px-4 py-3 main_content">
        {pdfUrl ? (
          <>
            <div className="mt-4">
              <h1 className="mb-3">Listes Des Echeances du semaines encours :</h1>
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
              <h1 className="mb-3">Remboursement de la semaine en cours</h1>

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
                  field="NUMERO_ECHEANCE"
                  header="Membre"
                  sortable
                  frozen
                  body={(item) => (
                    <span>{item?.creditss?.membresmicro?.NOM} {item?.creditss?.membresmicro?.PRENOM}</span>
                  )}
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
                  body={(item) => `${item.NUMERO_ECHEANCE} semaine`}
                />
                <Column
                  field="MONTANT_REMBOURSEMENT"
                  header="Montant total"
                  sortable
                  body={(item) => item?.MONTANT_REMBOURSEMENT}

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
              </DataTable>
            </div>

          </>
        )}

        {/* Boutons de génération */}
        {!pdfUrl && (
          <div className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
            style={{ position: "absolute", bottom: 0, right: 0 }}>
            <Button className="mt-3 ml-3 button-mobile"
              size="small"
              onClick={handleGeneraExcel}>
              <i className="pi pi-file-excel"
                style={{ fontSize: "1.2rem" }}></i>
              <span className="ml-1 font-bold">Générer Excel</span>
            </Button>
            <Button className="mt-3 ml-3 button-mobile" size="small"
              onClick={handleGeneraPDF}>
              <i className="pi pi-file-pdf"
                style={{ fontSize: "1.2rem" }}></i>
              <span className="ml-1 font-bold">Générer PDF</span>
            </Button>
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}