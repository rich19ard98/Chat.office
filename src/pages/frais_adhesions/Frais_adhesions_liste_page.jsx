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
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import jsPDF from "jspdf";
import entete from "../../../public/images/nodebu.png";
import { Calendar } from "primereact/calendar";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
//import statutComdeMedicaColor from "../../helpers/statutComdeAccessColor";
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import Frais_adhesion_add_page from "./Frais_adhesion_add_page";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
import { decodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
export default function Frais_adhesions_liste_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [frais, setFrais] = useState([]);
    const { ID_FRAIS_ADHESIONS: encodedId } = useParams();
    const ID_FRAIS_ADHESIONS = decodeId(encodedId); // Décoder pour obtenir l'ID réel

    const [pdfUrl, setPdfUrl] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dates, setDates] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheFrais, setAfficheFrais] = useState(1)

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
    //fonction pour lister les frais d'adhesion
    const fetchFraisAdhesion = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/fraisAdhesions/frais_adhesions/fetch?rows=100000000000&`;

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
            if (dates) {
                const [startDate, endDate] = dates;
                if (startDate) {
                    url += `startDate=${startDate.toISOString()}&`;
                }
                if (endDate) {
                    url += `endDate=${endDate.toISOString()}&`;
                }
            }
            if (ID_FRAIS_ADHESIONS) {
                url += `ID_FRAIS_ADHESIONS=${ID_FRAIS_ADHESIONS}&`;
            }

            const res = await fetchApi(url);
            
            setFrais(res.result.data);
            setTotalRecords(res.result.totalRecords);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, startDate,ID_FRAIS_ADHESIONS, endDate, dates]);

    useEffect(() => {
        fetchFraisAdhesion();
    }, [lazyState, startDate,ID_FRAIS_ADHESIONS, endDate, dates]);



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

    /**
* Permet Generer Pdf et excel
 * @param {express.Request} req 
* @param {express.Response} res 
* @author Richard <richardngendakumana10@gmail.com>
* @date 03/07/2025
*/

    const exportPdfFrais = () => {
        const pageHeight = 297;

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.setFontSize(16);
        doc.text("Liste des frais d'adhesions ", 80, 30);
        doc.addImage(entete, "JPEG", 0, 0, 70, 30);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });
        const columns = [
            { header: "#", dataKey: "index" },
            { header: "Caissier", dataKey: "caissier" },
            { header: "Membre", dataKey: "membre" },
            { header: "Montant", dataKey: "montant" },
            { header: "Mode Paiement", dataKey: "modePaiement" },
            { header: "Opération", dataKey: "operation" },
            { header: "Date", dataKey: "date" },
        ];

        const rows = frais.map((item, index) => ({
            index: index + 1,
            caissier: item.utilisateur
                ? `${item.utilisateur?.USERNAME}`
                : "-",
            membre: item.membres
                ? `${item.membres.NOM} ${item.membres.PRENOM}`
                : "-",
            montant: parseFloat(item.MONTANT || 0).toLocaleString("fr-FR").replace(/\s/g, " ") + " Fbu",
            modePaiement:
                item.MODE_PAIEMENT === 0
                    ? "Espèce"
                    : item.MODE_PAIEMENT === 1
                        ? "Bancaire"
                        : "Virement",
            operation: item.operations?.NOM_OPERATION || "-",
            date: item.DATE_PAIEMENT
                ? moment(item.DATE_PAIEMENT).format("DD/MM/YYYY")
                : "-",
        }));

        doc.autoTable({
            startY: 40,
            columns,
            body: rows,
            theme: "grid",
            headStyles: {
                fillColor: [251, 140, 140],//57, 154, 242
                textColor: 255,
                fontSize: 9
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
        });
        // 🔽 Récupérer la position finale du tableau
        const finalY = doc.autoTable.previous.finalY || 0;
        const footerY = doc.internal.pageSize.height - 20; // 20 unités au-dessus du bas de la page
        // ✅ Total du montant des crédits

        const totalMontant = frais.reduce((acc, item) => acc + Number(item.MONTANT || 0), 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
            `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            pageWidth / 2,
            finalY + 8,
            { align: "center" }
        );
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
        const filename = `Frais_Adhesion${moment().format("YYYYMMDD_HHmmss")}.pdf`;

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
                const blob = exportPdfFrais();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);

            },
        });
    };
    const exportExcelFrais = () => {


        const headers = [
            "#", "Caissier", "Membre", "Montant",
            "Mode Paiement", "Opération", "Date"
        ];

        const rows = frais.map((item, index) => ({
            "#": index + 1,
            "Caissier": item.utilisateur?.USERNAME || "-",
            "Membre": item.membres ? `${item.membres.NOM} ${item.membres.PRENOM}` : "-",
            "Montant": parseFloat(item.MONTANT || 0),
            "Mode Paiement":
                item.MODE_PAIEMENT === 0
                    ? "Espèce"
                    : item.MODE_PAIEMENT === 1
                        ? "Bancaire"
                        : "Virement",
            "Opération": item.operations?.NOM_OPERATION || "-",
            "Date": item.DATE_PAIEMENT ? moment(item.DATE_PAIEMENT).format("DD/MM/YYYY") : "-",
        }));

        // Convertir les données en feuille Excel
        const worksheet = XLSX.utils.json_to_sheet(rows, { origin: 'A3' });

        // Ajouter le titre
        const titre = [["Liste des frais"]];
        XLSX.utils.sheet_add_aoa(worksheet, titre, { origin: "A1" });

        // Style du titre
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

        // Fusion des colonnes pour le titre
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

        // Largeurs des colonnes
        worksheet["!cols"] = [
            { wch: 5 },   // #
            { wch: 20 },  // Caissier
            { wch: 25 },  // Membre
            { wch: 15 },  // Montant
            { wch: 18 },  // Mode Paiement
            { wch: 30 },  // Opération
            { wch: 18 }   // Date
        ];

        // Style des en-têtes (ligne 2)
        headers.forEach((_, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIndex });
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = {
                    font: { bold: true },
                    alignment: { horizontal: "center" },
                    fill: {
                        fgColor: { rgb: "399AF2" }
                    },
                    border: {
                        top: { style: "thin", color: { auto: 1 } },
                        bottom: { style: "thin", color: { auto: 1 } },
                        left: { style: "thin", color: { auto: 1 } },
                        right: { style: "thin", color: { auto: 1 } },
                    }
                };
            }
        });

        // Création du classeur
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Frais");

        // Export du fichier
        XLSX.writeFile(workbook, `frais_adhesion_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);

    };



    const handleGeneraExcel = () => {


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
                exportExcelFrais()

            },
        });
    };
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const fraisadhesionPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.FRAISADHESION)
    const fraisadhesionAcces = fraisadhesionPermission && (fraisadhesionPermission.CAN_READ || fraisadhesionPermission.CAN_WRITE)
    if (!fraisadhesionAcces && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }
    return (
        <>

            {globalLoading && <Loading />}

            <div className="px-4 py-3 main_content">
                {pdfUrl ? (
                    <>
                        <div className="mt-4">
                            <h1 className="mb-3">Listes Des Frais d'adhesions :</h1>
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
                            <h1 className="mb-3">Frais d'adhésion</h1>
                            {fraisadhesionPermission && fraisadhesionPermission.CAN_WRITE ?
                                <Button
                                    className="mt-3 ml-3 button-mobile"
                                    size="small"

                                    onClick={() => {
                                        navigate("/frais_adh/new");
                                        // handlAddPageFrais
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
                                <div className="p-input-icon-left">

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                    </svg>
                                    <InputText
                                        type="search"
                                        placeholder="Recherche"
                                        className="p-inputtext-sm"
                                        style={{ minWidth: 300 }}
                                        onInput={(e) =>
                                            setlazyState((s) => ({ ...s, search: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="d-flex w-100 flex-column mt-1 mx-2">
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
                                <div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                                    <div
                                        onClick={() => {
                                            if (frais.length === 0) return;
                                            handleGeneraPDF();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: frais.length === 0 ? "not-allowed" : "pointer",
                                            opacity: frais.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        PDF
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (frais.length === 0) return;
                                            handleGeneraExcel();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: frais.length === 0 ? "not-allowed" : "pointer",
                                            opacity: frais.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        XLS
                                    </div>
                                </div>

                            </div>
                            {/* <div className="p-input-icon-left ml-3">

                     
                    </div> */}
                        </div>
                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white">
                                <DataTable
                                    lazy
                                    size={'small'}
                                    value={frais}
                                    // showGridlines
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
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
                                        header="Caissier"
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    <Link
                                                        //id={`custom-tooltip-btn_demd-${item.ID_REQUISITION}`}
                                                        className=" text-decoration-none d-flex round-indicator"
                                                        style={{ color: '#399af2' }}
                                                        to={`/utilisateurs/${encodeId(item?.utilisateur?.ID_UTILISATEUR)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        data-pr-position="bottom"
                                                    >
                                                        {item?.utilisateur ?

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateur ? (
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
                                                            : '-'}


                                                    </Link>
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />



                                    <Column
                                        field="NOM"
                                        frozen
                                        header="Membre"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item.membres?.NOM}  {item.membres?.PRENOM}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="MONTANT"
                                        header="Reference"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>{item?.REFERENCE_FRAIS || "-"}</span>
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
                                        field="MODE_PAIEMENT"
                                        frozen
                                        header="M.paye"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <>
                                                    {item?.MODE_PAIEMENT == 0 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='Espèce'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                                color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : item?.MODE_PAIEMENT == 1 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='Bancaire'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                                color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip='Virement'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: modePaiementDetailColor(item.MODE_PAIEMENT).backgroundColor,
                                                                color: modePaiementDetailColor(item.MODE_PAIEMENT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: modePaiementDetailColor(item.MODE_PAIEMENT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    )}
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="NOM_OPERATION "
                                        frozen
                                        header="Opération"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item.operations?.NOM_OPERATION}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="DATE_PAIEMENT "
                                        header="Date "
                                        sortable
                                        body={(item) => {
                                            return moment(item.DATE_PAIEMENT).format("DD/MM/YYYY");

                                        }}
                                    />


                                </DataTable>
                            </div>
                        </div >
                    </>
                )}

            </div >
            <Outlet />


        </>
    );
}
