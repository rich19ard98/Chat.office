import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import entete from "../../../public/images/nodebu.png";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { userSelector } from "../../store/selectors/userSelector";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
export default function Penalites_Retard_Listes() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const user = useSelector(userSelector);
  const [frais, setFrais] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(1)
  const [afficheCotisation, setAfficheCotisation] = useState(1)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dates, setDates] = useState(null);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [profiledata, setProfiledata] = useState([])
  const [montant, setMontant] = useState(null)
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [detail_users, setDetail_users] = useState(null);

  const navigate = useNavigate();


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
      setSelectedItems(credits);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };
  const membresSelected = (membre) => {
    setSelectedMembre(membre);
  };
  const handleDeletePress = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { background: 'linear-gradient(rgba(226, 211, 239, 0.9), rgba(18 ,9 ,117, 0.30))', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Supprimer ?",
      message: (
        <div className="d-flex flex-column align-items-center">

          {inViewMenuItem ? (
            <>


              <div className="font-bold text-center my-2">
                {inViewMenuItem?.NOM} {inViewMenuItem?.PRENOM}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer ?
              </div>
            </>
          ) : (
            <>
              <div className="text-muted">
                {selectedItems ? selectedItems.length : "0"} selectionné
                {selectedItems?.length > 1 && "s"}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer les éléments selectionnés ?
              </div>
            </>
          )}
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        deleteItems(itemsIds);
      },
    });
  };
  //fonction pour lister les cotisation
  const fetchPenalites = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/presence/Penalite_retard/fetch?`;

      var url = baseurl;
      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          if (typeof value == "object") {
            url += `${key}=${JSON.stringify(value)}&`;
          } else {
            url += `${key}=${value}&`;
          }
        }
      }


      const res = await fetchApi(url)

      setFrais(res.result.data);
      setTotalRecords(res.result.totalRecords);
      const total = res.result.data.reduce((acc, cur) => acc + Number(cur.MONTANT || 0), 0);
      setMontant(total)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);

  useEffect(() => {
    fetchPenalites();
  }, [lazyState]);

  useEffect(() => {
    document.title = "Penalite_retard"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Penalite_retard',
        name: 'Liste'
      },
    ]));
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
  const exportExcelFrais = (frais) => {
    if (!Array.isArray(frais)) {
      console.error("La variable frais n'est pas un tableau :", frais);
      return;
    }

    const titre = [["Liste des Cotisations"]];
    const headers = [
      "#",
      "Caissier",
      "Membre",
      "Montant",
      "Mode Paiement",
      "Opération",
      "Date"
    ];

    const data = frais.map((item, index) => ([
      index + 1,
      item.utilisateur?.USERNAME || "-",
      item.membres ? `${item.membres.NOM} ${item.membres.PRENOM}` : "-",
      parseFloat(item.MONTANT || 0), // Montant en nombre
      item.MODE_PAIEMENT === 0 ? "Espèce" :
        item.MODE_PAIEMENT === 1 ? "Virement" : "Versement",
      item.operations?.NOM_OPERATION || "-",
      item.DATE_PAIEMENT ? moment(item.DATE_PAIEMENT).format("DD/MM/YYYY") : "-"
    ]));

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, titre, { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A3" });
    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A4" });
    // 👉 Définir les largeurs (nombre de caractères visibles par colonne)
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 20 },  // Caissier
      { wch: 25 },  // Membre
      { wch: 15 },  // Montant
      { wch: 20 },  // Mode Paiement
      { wch: 35 },  // Opération
      { wch: 15 },  // Date
    ];
    // Ajout du style (facultatif, améliore l'apparence)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "399AF2" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      },
      alignment: { horizontal: "center" }
    };
    // 🔗 Fusion A1:G1 pour le titre
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
    ];
    // 🎨 Style titre (A1)
    worksheet["A1"].s = {
      font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "FF6384" } }
    };
    for (let col = 0; col < headers.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ c: col, r: 1 }); // Ligne 2 (A2, B2, ...)
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].s = headerStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frais");

    const filename = `Cotisations_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };
  const handleGeneraExcel = () => {


    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Génerer fichier Excel",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment générer le Excel ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {

        exportExcelFrais(frais)
      },
    });
  };
  const exportPdfFrais = (frais) => {
    const pageHeight = 297;
    if (!Array.isArray(frais)) {
      console.error("La variable frais2 n'est pas un tableau :", frais);
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.addImage(entete, "JPEG", 0, 0, 70, 30);
    doc.setFontSize(13);
    doc.text("Liste des Cotisations", 80, 30);
    doc.setFontSize(13);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(` ${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
      align: "right",
    });
    const columns = [
      { header: "#", dataKey: "index" },
      { header: "Caissier", dataKey: "CAISSIER" },
      { header: "Membre", dataKey: "MEMBRE" },
      { header: "Montant", dataKey: "MONTANT" },
      { header: "Mode Paiement", dataKey: "MODE_PAIEMENT" },
      { header: "Opération", dataKey: "OPERATION" },
      { header: "Date", dataKey: "DATE" },
    ];

    const rows = frais.map((item, index) => ({
      index: index + 1,
      CAISSIER: item.utilisateur?.USERNAME || "-",
      MEMBRE: item.membres ? `${item.membres.NOM} ${item.membres.PRENOM}` : "-",
      MONTANT: parseFloat(item.MONTANT || 0).toLocaleString("fr-FR").replace(/\s/g, " ") + " Fbu",
      MODE_PAIEMENT: item.MODE_PAIEMENT === 0
        ? "Espèce"
        : item.MODE_PAIEMENT === 1
          ? "Virement"
          : "Versement",
      OPERATION: item.operations?.NOM_OPERATION || "-",
      DATE: item.DATE_PAIEMENT ? moment(item.DATE_PAIEMENT).format("DD/MM/YYYY") : "-",
    }));

    doc.autoTable({
      columns,
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [251, 140, 140],
        textColor: 255,
        fontSize: 9
      },
      theme: "grid",
      pageBreak: 'auto',
    });
    // ✅ Total du montant des crédits
    const finalY = doc.lastAutoTable.finalY || 0;
    const totalMontant = frais.reduce((acc, item) => acc + Number(item.MONTANT || 0), 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      pageWidth / 2,
      finalY + 8,
      { align: "center" }
    );
    // 🔽 Récupérer la position finale du tableau

    const footerY = pageHeight - 20;

    // ➕ Ajouter une nouvelle page si trop bas
    if (finalY + 20 > footerY) {
      doc.addPage();
    }
    // ✍️ Signatures
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const effectuéPar = `Effectué par :${user.NOM} ${user.PRENOM}....................................`;
    const approuvéPar = "Approuvé par : ..................................";

    doc.text(effectuéPar, 10, footerY - 10);
    doc.text(approuvéPar, 125, footerY - 10);
    const filename = `Listes_Cotisations${moment().format("YYYYMMDD_HHmmss")}.pdf`;
    return doc.output("blob", filename);
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
        exportPdfFrais(frais)
        const blob = exportPdfFrais(frais);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      },
    });
  };
  const [membredata, setmembredata] = useState([]);
  const fetchmembres = useCallback(async () => {
    try {
      var url = `/administration/utilisateurs/fetch?rows=10000&`
      if (profiledata) {
        url += `profil=2`;
      }
      const res = await fetchApi(url);


      setmembredata(
        res.result.data.map((util) => {
          return {
            name: `${util.NOM} ${util.PRENOM}`,
            code: util.ID_UTILISATEUR,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchmembres();
  }, []);
  const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

  const cotisationPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COTISATION)
  const cotisAcces = cotisationPermission && (cotisationPermission.CAN_READ || cotisationPermission.CAN_WRITE)
  if (!cotisAcces && !IsGerant && !IsAdminAjoin) {
    return <NotFound />
  }
  return (
    <>

      {globalLoading && <Loading />}

      <div className="px-4 py-3 main_content">
        {pdfUrl ? (
          
          <>
            <div className="mt-4">
              <h1 className="mb-3">Listes Des cotisations :</h1>
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
            <div className="d-flex align-items-center justify-content-between">
              <h1 className="mb-3">Penalites retard</h1>
              {user?.PROFIL.ID_PROFIL === PROFILS.ADMIN || user.PROFIL.ID_PROFIL === PROFILS.SUPER_ADMIN && cotisationPermission && cotisationPermission.CAN_WRITE ?
                <Button
                  className="mt-3 ml-3 button-mobile"
                  size="small"
                  onClick={() => {
                    navigate("/Penalite_retard/new");

                  }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                  </svg>
                  <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                </Button>
                : null}
            </div>
            <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
              <div className="d-flex  align-items-center">
              </div>


            </div>
            <div className="content">
              <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                <DataTable
                  lazy
                  size={'small'}
                  value={frais}
                  // showGridlines
                  tableStyle={{ minWidth: "50rem" }}
                  className=""
                  paginator
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate={`{first} à {last} dans ${totalRecords} éléments`}
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
                  paginatorClassName="rounded"
                  scrollable
                >
                  <Column
                    field="IMAGE"
                    header="Auteur"
                    frozen
                    sortable
                    body={(item) => {
                      const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                      return (
                        <>

                          {item?.utilisateur ?
                            <Link

                              className=" text-decoration-none d-flex round-indicator"
                              style={{ color: '#399af2' }}
                              to={`/utilisateurs/${encodeId(item?.utilisateur?.ID_UTILISATEUR)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              data-pr-position="bottom"
                            >

                              <div className="d-flex round-indicator">

                                {item?.utilisateur.IMAGE ? (
                                  <Image
                                    src={item?.utilisateur?.IMAGE}
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
                                    {item?.utilisateur?.NOM.charAt(0)}{item?.utilisateur?.PRENOM.charAt(0)}
                                  </div>
                                )}
                                <div className="ml-2 mt-1">
                                  <div className="font-bold">
                                    {item?.utilisateur?.USERNAME}
                                  </div>
                                </div>
                              </div>


                            </Link>
                            : '-'}
                          <style>{css}</style>
                        </>
                      );
                    }}
                  />

                  <Column
                    field="NOM"
                    header="Type penalite"
                    sortable
                    body={(item) => {
                      return (
                        <span>{item.N_PENALITE_RETARD == 0 ? "Retard" : "Absent"}</span>
                      );
                    }}
                  />
                  <Column
                    field="MONTANT"
                    header="Montant"
                    sortable
                    body={(item) => {
                      return (
                        <span>{item.MONTANT ? parseInt(item.MONTANT).toLocaleString('fr-FR') : 0} Fbu</span>
                      );
                    }}
                  />
                  <Column
                    field="DATE_MISE_A_JOUR "
                    header="Date "
                    sortable
                    body={(item) => {
                      return moment(item.DATE_MISE_A_JOUR).format("DD/MM/YYYY");

                    }}
                  />
                  <Column
                    field=""
                    header=""
                    alignFrozen="right"
                    frozen
                    body={(item) => {
                      // Assure-toi que 'user' et 'cotisationPermission' sont accessibles ici
                      const canEdit =
                        (user?.PROFIL?.ID_PROFIL === PROFILS.ADMIN || user?.PROFIL?.ID_PROFIL === PROFILS.SUPER_ADMIN) &&
                        cotisationPermission?.CAN_WRITE;

                      const items = [
                        {
                          template: () => {
                            if (!canEdit) return null;

                            return (
                              <Link
                                to={`/Penalite_retard/edit/${encodeId(item.ID_PENALITE_RETARD)}`}
                                className="p-menuitem-link"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-pencil-square"
                                  viewBox="0 0 16 16"
                                  style={{ marginRight: "0.5rem" }}
                                >
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                  />
                                </svg>
                                <span className="p-menuitem-text">Modifier</span>
                              </Link>
                            );
                          },
                        },
                      ];

                      return (
                        <>
                          <SlideMenu
                            ref={menu}
                            model={items}
                            popup
                            viewportHeight={45}
                            menuWidth={200}
                            onHide={() => setInViewMenuItem(null)}
                          />
                          {canEdit && (
                            <Button
                              rounded
                              severity="secondary"
                              text
                              aria-label="Menu"
                              size="small"
                              className="mx-1"
                              onClick={(event) => {
                                setInViewMenuItem(item);
                                setDetail_users(item);
                                menu.current.toggle(event);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-three-dots"
                                viewBox="0 0 16 16"
                              >
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                              </svg>
                            </Button>
                          )}
                        </>
                      );
                    }}
                  />


                </DataTable>
              </div>
            </div >
          </>
        )}

      </div >
      <Outlet />
      {/* </>)
        } */}

    </>
  );
}
