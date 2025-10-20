import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import { administration_routes_items } from "../../routes/admin/administration_routes";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import etatTransfertColor from "../../helpers/etatTransfertColor";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import entete from "../../../public/images/nodebu.png";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
export default function Listes_Transferts_listes() {



    const [selectedCity, setSelectedCity] = useState(null);
    const [date, setDate] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const user = useSelector(userSelector);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [Transferts, setTransferts] = useState([]);
    const [details_modalUsers, setDetails_modalUsers] = useState(false);
    const [detail_users, setDetail_users] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const { ID_TRANSFERT_INTERNE: encodedId } = useParams();
    const ID_TRANSFERT_INTERNE = decodeId(encodedId); // Décoder pour obtenir l'ID réel

    const [dates, setDates] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);

    const [visibleStatut, setVisibleStatut] = useState(false);

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
            setSelectedItems(utilisateurs);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi(`/transferts/transfert/AnnulationTransfert/:id_transfert`,
                {
                    method: "POST",
                    body: form,
                }
            );


            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "Transfert Annulé",
                    detail: "Transfert Annulé avec succès",
                    life: 3000,
                })
            );
            //fetchUtilisateurs();
            setSelectAll(false);
            setSelectedItems(null);
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
        } finally {
            setGloabalLoading(false);
            FetchTransferts()
        }
    };

    const handleDeletePress = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();
        confirmDialog({
            headerStyle: { backgroundColor: "#ecc5c5", backgroundSize: "cover" },
            headerClassName: "text-black",
            header: "Annuler ?",
            message: (
                <div className="d-flex flex-column align-items-center">
                    {inViewMenuItem ? (
                        <>

                            <div className="font-bold text-center my-2">
                                {inViewMenuItem?.NOM} {inViewMenuItem?.NOM_CLIENT}
                            </div>
                            <div className="text-center">Voulez-vous vraiment Annuler ?</div>
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
    const FetchTransferts = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/transferts/transfert/fetch?rows=100000000000&`;
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
            if (ID_TRANSFERT_INTERNE) {
                url += `ID_TRANSFERT_INTERNE=${ID_TRANSFERT_INTERNE}&`;
            }
            const res = await fetchApi(url);

            setTransferts(res.result.data);
            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,
        startDate, ID_TRANSFERT_INTERNE,
        endDate,
        dates]);

    useEffect(() => {
        dispacth(
            setBreadCrumbItemsAction([administration_routes_items.Transferts])
        );
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    useEffect(() => {
        FetchTransferts();
    }, [lazyState,
        startDate, ID_TRANSFERT_INTERNE,
        endDate,
        dates]);
    /**
  * Permet Generer Pdf et excel
   * @param {express.Request} req 
  * @param {express.Response} res 
  * @author Richard <richardngendakumana10@gmail.com>
  * @date 04/07/2025
  */
    const exportPdf = () => {
        // 📄 Largeur d'une page A4 en mm
        const pageHeight = 297; // 📄 Hauteur d'une page A4 en mm
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(entete, "JPEG", 0, 0, 70, 30);
        // Titre principal
        doc.setFontSize(13);
        doc.text("Liste des Transferts", 80, 30);
        // const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });
        // Préparation des colonnes et des données
        const columns = [
            { header: "#", dataKey: "index" },
            { header: "Utilisateur", dataKey: "UTILISATEUR" },
            { header: "Ref Transfert", dataKey: "REFERENCE_TRANSFERT" },
            { header: "CompteSource", dataKey: "NOM_COMPTESOURSE" },
            { header: "CompteDestination", dataKey: "NOM_COMPTEDESTINATION" },
            { header: "M.transfert", dataKey: "MONTANT_TRANSFERE" },
            { header: "DESCRIPTION", dataKey: "DESCRIPTION" },
            { header: "ETAT", dataKey: "ETAT" },
            { header: "Date Transfert", dataKey: "DATE_TRANSFERT" },

        ];

        const rows = Transferts.map((item, idex) => ({
            index: idex + 1,

            UTILISATEUR: item.utilisateur ? item.utilisateur?.NOM + " " + item.utilisateur?.PRENOM : "-",
            REFERENCE_TRANSFERT: item?.REFERENCE_TRANSFERT || "-",
            NOM_COMPTESOURSE: item.CompteSource?.NOM || "-",
            NOM_COMPTEDESTINATION: item.CompteDestination?.NOM || "-",
            MONTANT_TRANSFERE: item?.MONTANT_TRANSFERE || "-",
            DESCRIPTION: item?.DESCRIPTION || "-",
            ETAT: item?.ETAT === 0
                ? "Annuler"
                : item?.ETAT === 1
                    ? "Reussi"
                    : "-",

            DATE_TRANSFERT: item?.DATE_TRANSFERT ? moment(item?.DATE_TRANSFERT).format("DD/MM/YYYY") : "-",

        }));
        doc.autoTable({
            columns,
            body: rows,
            startY: 40,
            styles: {
                fontSize: 7, // 🔽 Réduit la taille du texte
                cellPadding: 1.5, // 🔽 Moins de padding
                overflow: 'linebreak', // 🔁 Saut de ligne si texte trop long
            },
            headStyles: {
                fillColor: [251, 140, 140],
                fontSize: 8
            },
            theme: "grid",
            pageBreak: 'auto',
        });
        // ✅ Total du montant des crédits
        const finalY = doc.lastAutoTable.finalY || 0;
        const totalMontant = Transferts.reduce((acc, item) => acc + Number(item.MONTANT_TRANSFERE || 0), 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
            `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            pageWidth / 2,
            finalY + 8,
            { align: "center" }
        );
        // 🔽 Récupérer la position finale du tableau
        const footerY = doc.internal.pageSize.height - 20; // 20 unités au-dessus du bas de la page
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
        const filename = `Transferts${moment().format("YYYYMMDD_HHmmss")}.pdf`;
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

                const blob = exportPdf();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            },
        });
    };
    const exportExcel = () => {
        const titre = "Liste des membres";

        // Préparation des données, les montants sont en nombres purs (pas de string avec "Fbu")
        const data = Transferts.map((item, index) => ({
            "#": index + 1,
            "Utilisateur": item.utilisateur ? item.utilisateur?.NOM + " " + item.utilisateur?.PRENOM : "-",
            "Ref Transfert": item?.REFERENCE_TRANSFERT || "-",
            "Compte Source": item?.CompteSource?.NOM || "-",
            "Compte Destination": item?.CompteDestination?.NOM || "-",
            "MONTANT TRANSFERET": item?.MONTANT_TRANSFERE ? Number(item?.MONTANT_TRANSFERE) : "-",
            "DESCRIPTION": item?.DESCRIPTION || "-",

            "ETAT": item?.ETAT === 0
                ? "Annuler"
                : item?.ETAT === 1
                    ? "Reussi"
                    : "-",

            "Date transfert": item?.DATE_TRANSFERT ? moment(item?.DATE_TRANSFERT).format("DD/MM/YYYY") : "-",
        }));
        // Création de la feuille
        const worksheet = XLSX.utils.json_to_sheet(data, { origin: 1 });

        // Fusion du titre sur toute la largeur (de A1 à I1 par ex., ici 8 colonnes)
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
        XLSX.utils.sheet_add_aoa(worksheet, [[titre]], { origin: "A1" });

        // Largeur personnalisée colonnes (en caractères)
        worksheet["!cols"] = [
            { wch: 3 },  // #
            { wch: 30 }, // Nom et prenom
            { wch: 15 }, // Ref
            { wch: 20 }, // source
            { wch: 20 }, // destination
            { wch: 20 }, // montant
            { wch: 30 }, // description
            { wch: 20 }, // etat
            { wch: 20 }, // date Transfert
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
        }
        // 🔗 Fusion A1:G1 pour le titre
        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }
        ];
        // 🎨 Style titre (A1)
        worksheet["A1"].s = {
            font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "FF6384" } }
        };
        // Optionnel: appliquer un format Excel aux colonnes nombres et dates (format personnalisé)
        // Exemple pour Montant, Intérêt, etc., on peut définir un style (attention: XLSX-style requis pour styles avancés)
        // Ici on laisse simple, Excel appliquera un format standard.

        // Création du classeur
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Membres");

        // Génération fichier et téléchargement
        XLSX.writeFile(workbook, `Transferts_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    };
    const handleGeneraExcelTransferts = () => {


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

                exportExcel();

            },
        });
    };
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT

    const comptabilitePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COMPTABILITES)
    const compAcces = comptabilitePermission && (comptabilitePermission.CAN_READ || comptabilitePermission.CAN_WRITE)
    if (!compAcces && !IsGerant && !IsAdminAjoin) {
        return <NotFound />
    }

    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                {pdfUrl ? (
                    <>
                        <div className="mt-4">
                            <h1 className="mb-3">Transferts :</h1>
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
                            <h1 className="mb-3">Transferts</h1>
                            {comptabilitePermission && comptabilitePermission.CAN_WRITE ?
                                <Button
                                    label="Nouveau"
                                    icon="pi pi-plus"
                                    size="small"
                                    onClick={() => {

                                        navigate("/Transferts/new");
                                    }}
                                />
                                : null}
                        </div>
                        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex  align-items-center">
                                <div className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        type="search"
                                        placeholder="Recherche"
                                        autoFocus
                                        className="p-inputtext-sm"
                                        style={{ minWidth: 300 }}
                                        onInput={(e) =>
                                            setlazyState((s) => ({ ...s, search: e.target.value }))
                                        }
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
                                <div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                                    <div
                                        onClick={() => {
                                            if (Transferts.length === 0) return;
                                            handleGeneraPDF();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: Transferts.length === 0 ? "not-allowed" : "pointer",
                                            opacity: Transferts.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        PDF
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (Transferts.length === 0) return;
                                            handleGeneraExcelTransferts();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: Transferts.length === 0 ? "not-allowed" : "pointer",
                                            opacity: Transferts.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        XLS
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                                <DataTable
                                    lazy
                                    value={Transferts}
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    size="small"
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
                                    emptyMessage="Aucun Transfert trouvé"
                                    // paginatorLeft={paginatorLeft}
                                    // paginatorRight={paginatorRight}
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
                                // size="normal"
                                >

                                    <Column
                                        field="IMAGE"
                                        header="Auteur"
                                        sortable
                                        body={(item) => {
                                            const css = `
                                                .round-indicator .p-image-preview-indicator {
                                                    border-radius: 50%;
                                                }`;
                                            return (
                                                <>
                                                    <Link
                                                        id={`custom-tooltip-btn_demd-${item.ID_VENTE}`}
                                                        className=" text-decoration-none d-flex round-indicator"
                                                        style={{ color: "#399af2" }}
                                                        to={`/utilisateurs/${encodeId(
                                                            item?.utilisateur?.ID_UTILISATEUR
                                                        )}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        data-pr-position="bottom"
                                                    >
                                                        <div className="d-flex round-indicator">
                                                            {item?.utilisateur?.IMAGE ? (
                                                                <Image
                                                                    src={item?.utilisateur?.IMAGE}
                                                                    alt="Image"
                                                                    className="rounded-5"
                                                                    imageClassName="rounded-5 object-fit-cover"
                                                                    imageStyle={{ width: "25px", height: "25px" }}
                                                                    style={{ width: "25px", height: "25px" }}
                                                                    preview
                                                                />
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        width: "25px",
                                                                        height: "25px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "#ccc",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        color: "black",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                ></div>
                                                            )}

                                                            <div className="ml-2 mt-1">
                                                                <div className="font-bold">
                                                                    {item?.utilisateur?.USERNAME}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="MONTANT"
                                        header="Ref Transfert"
                                        sortable
                                        body={(item) => item.REFERENCE_TRANSFERT}
                                    />
                                    <Column
                                        field="COMPTE SOURCE"
                                        header=" Compte source"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.CompteSource?.NOM
                                                        ? item?.CompteSource?.NOM
                                                        : "-"}{" "}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="COMPTE DESTINATION"
                                        header="Compte destination"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.CompteDestination?.NOM
                                                        ? item?.CompteDestination.NOM
                                                        : "-"}{" "}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="MONTANT"
                                        header="Montant"
                                        sortable
                                        body={(item) => item.MONTANT_TRANSFERE}
                                    />
                                    <Column
                                        field="MOTIF"
                                        header="Description"
                                        sortable
                                        body={(item) => item.DESCRIPTION}
                                    />
                                    <Column
                                        field="ETAT "
                                        header="Etat"
                                        sortable
                                        body={(item) => {
                                            return item?.ETAT == "0" ? (
                                                <Button
                                                    className="btn-sm"
                                                    data-pr-tooltip="Annuler"
                                                    tooltip
                                                    tooltipOptions={{ position: "top" }}
                                                    style={{
                                                        width: 25,
                                                        height: 25,
                                                        backgroundColor: etatTransfertColor(item?.ETAT)
                                                            .backgroundColor,
                                                        color: etatTransfertColor(item.ETAT).textColor,
                                                        border: "none",
                                                    }}
                                                    icon={(options) => {
                                                        return (
                                                            <span
                                                                className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: etatTransfertColor(item.ETAT).icon,
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <Button
                                                    className="btn-sm"
                                                    data-pr-tooltip="Reussi"
                                                    tooltip
                                                    tooltipOptions={{ position: "top" }}
                                                    style={{
                                                        width: 25,
                                                        height: 25,
                                                        backgroundColor: etatTransfertColor(item.ETAT)
                                                            .backgroundColor,
                                                        color: etatTransfertColor(item.ETAT).textColor,
                                                        border: "none",
                                                    }}
                                                    icon={(options) => {
                                                        return (
                                                            <span
                                                                className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: etatTransfertColor(item.ETAT).icon,
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                />
                                            );
                                        }}
                                    />
                                    <Column
                                        field="DATE_TRANSFERT"
                                        header="Date de Transfert"
                                        sortable
                                        body={(item) => {
                                            return moment(item.DATE_TRANSFERT).format("DD/MM/YYYY HH:ss");
                                        }}
                                    />
                                    <Column
                                        field=""
                                        header=""
                                        alignFrozen="right"
                                        frozen
                                        body={(item) => {
                                            const items = [
                                                {
                                                    template: (deleteItem, options) => {
                                                        return (
                                                            <a
                                                                href="#"
                                                                className="p-menuitem-link text-danger"
                                                                onClick={(e) =>
                                                                    handleDeletePress(e, [
                                                                        inViewMenuItem.ID_TRANSFERT_INTERNE,
                                                                    ])
                                                                }
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-trash"
                                                                    viewBox="0 0 16 16"
                                                                    style={{ marginRight: "0.5rem" }}
                                                                >
                                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                                                </svg>
                                                                <span className="p-menuitem-text text-danger">
                                                                    Annuler
                                                                </span>
                                                            </a>
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
                                                        viewportHeight={70}
                                                        menuWidth={220}
                                                        onHide={() => {
                                                            setInViewMenuItem(null);
                                                        }}
                                                    />
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
                                                </>
                                            );
                                        }}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </>
                )}

            </div>
            <Outlet />
        </>
    );
}


