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
import moment from "moment";
import jsPDF from "jspdf";
import { userSelector } from "../../store/selectors/userSelector";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import entete from "../../../public/images/nodebu.png";
import { Badge } from 'primereact/badge'
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { encodeId } from "../../utils/IdEncryption";
import { Dropdown } from "primereact/dropdown";
import PROFILS from "../../constants/PROFILS";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";

export default function Membre_microfinance_list_page() {
    const [selectedCity, setSelectedCity] = useState(null);
    const [date, setDate] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [details_modalUsers, setDetails_modalUsers] = useState(false);
    const [detail_users, setDetail_users] = useState(null);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const user = useSelector(userSelector);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [visibleStatut, setVisibleStatut] = useState(false);
    const [membre, setMembre] = useState(null)
    const [profiledata, setProfiledata] = useState([])
    const [membredata, setMembredata] = useState([])
    const [membres_microfinance, setMembres_microfinance] = useState(null);

    const [activeButton, setActiveButton] = useState(1)
    const [afficheMembre, setAfficheMembre] = useState(1)
    const navigate = useNavigate();
    const [sexemembres, setSexemembre] = useState(null);
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
    const ismembre = user.ID_PROFIL

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
            setSelectedItems(membres_microfinance);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };


    const sexemembreSelected = async (sexefiltre) => {
        setSexemembre(sexefiltre);
    };

    //Suppression
    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi("/cotisation/membres_microfinance/delete_membre", {
                method: "POST",
                body: form,
            });

            dispacth(
                setToastAction({
                    severity: "success",
                    summary: " membre_microfinance supprimé",
                    detail: "Le'membre_microfinance a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchmembre_microfinance();
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
        }
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


    const [sexefiltre, setSexe] = useState([
        {
            code: 0,
            name: 'Homme'
        },
        {
            code: 1,
            name: 'Femme'
        },
        {
            code: 2,
            name: 'Autres'
        },
        // {
        //     code: 3,
        //     name: "Tous"
        // }
    ])
    //lister des menbres du microfinance
    const fetchmembre_microfinance = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/administration/utilisateurs/fetch?rows=10000000&profile=${PROFILS.MEMBRE}`;

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

            if (sexemembres) {
                url += `sexemembres=${sexemembres.code}&`;
            }
            if (connectedMembre) {
                url += `connectedMembre=${connectedMembre.toISOString()}&`
            }
            // console.log('url',url);

            const res = await fetchApi(url);

            setMembres_microfinance(res.result.data);
            setTotalRecords(res.result.totalRecords);



        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, sexemembres, connectedMembre]);
    useEffect(() => {
        fetchmembre_microfinance();
    }, [lazyState, sexemembres, connectedMembre]
    );
    useEffect(() => {
        document.title = "Membre du microfinance"
        dispacth(setBreadCrumbItemsAction([administration_routes_items.membre_microfinance]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    const [showEditPage, setShowEditPage] = useState(false);
    const [editItem, setEditItem] = useState(null); // Pour passer le membre à modifier
    /**
  * Permet Generer Pdf et excel
   * @param {express.Request} req 
  * @param {express.Response} res 
  * @author Richard <richardngendakumana10@gmail.com>
  * @date 02/07/2025
  */
    const exportPdf = () => {
        const pageWidth = 210; // 📄 Largeur d'une page A4 en mm
        const pageHeight = 297; // 📄 Hauteur d'une page A4 en mm
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.addImage(entete, "JPEG", 0, 0, 70, 30);
        // Titre principal
        doc.setFontSize(13);
        doc.text("Liste des Membres", 80, 30);

        doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });
        // Préparation des colonnes et des données
        const columns = [
            { header: "#", dataKey: "index" },
            { header: "Nom et Prenom", dataKey: "NOM_PRENOM" },
            { header: "Telephone", dataKey: "TELEPHONE" },
            { header: "Email", dataKey: "EMAIL" },
            { header: "Adresse", dataKey: "ADRESSE" },
            { header: "CNI", dataKey: "CNI_NUMERO" },
            { header: "SEXE", dataKey: "SEXE" },
            { header: "Lieu_naissance", dataKey: "LIEU_NAISSANCE" },
            { header: "Date_naissance", dataKey: "DATE_NAISSANCE" },

        ];

        const rows = membres_microfinance.map((item, idex) => ({
            index: idex + 1,
            NOM_PRENOM: item.membre?.NOM + " " + item.membre?.PRENOM || "-",
            TELEPHONE: item.membre?.TELEPHONE || "-",
            EMAIL: item.membre?.EMAIL || "-",
            ADRESSE: item.membre?.ADRESSE || "-",
            CNI_NUMERO: item.membre?.CNI_NUMERO || "-",
            SEXE: item.membre?.SEXE === 0
                ? "Homme"
                : item.membre?.SEXE === 1
                    ? "Femme"
                    : "Autres",
            LIEU_NAISSANCE: item.membre?.LIEU_NAISSANCE || "-",
            DATE_NAISSANCE: item.membre?.DATE_NAISSANCE ? moment(item.membre?.DATE_NAISSANCE).format("DD/MM/YYYY") : "-",

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

        // 🔽 Récupérer la position finale du tableau
        const finalY = doc.autoTable.previous.finalY || 0;
        const footerY = doc.internal.pageSize.height - 20; // 20 unités au-dessus du bas de la page

        // ➕ Ajouter une nouvelle page si trop bas
        if (finalY + 20 > footerY) {
            doc.addPage();
        }
        // ✍️ Signatures
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const effectuéPar = `Effectué par :${user.NOM} ${user.PRENOM}  ....................................`;
        const approuvéPar = "Approuvé par : ..................................";

        doc.text(effectuéPar, 10, footerY - 10);
        doc.text(approuvéPar, 125, footerY - 10);

        const filename = `Membres_${moment().format("YYYYMMDD_HHmmss")}.pdf`;
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
        const data = membres_microfinance.map((item, index) => ({
            "#": index + 1,
            "Nom et prenom": item.membre?.NOM + " " + item.membre?.PRENOM || "-",
            "Telephone": item.membre?.TELEPHONE || "-",
            "Email": item.membre?.EMAIL || "-",
            "Adresse": item.membre?.ADRESSE || "-",
            "CNI": item.membre?.CNI_NUMERO || "-",
            "Sexe": item.membre?.SEXE === 0
                ? "Homme"
                : item.membre?.SEXE === 1
                    ? "Femme"
                    : "Autres",
            "Lieu_naissance": item.membre?.LIEU_NAISSANCE || "-",
            "Date_naissance": item.membre?.DATE_NAISSANCE ? moment(item.membre?.DATE_NAISSANCE).format("DD/MM/YYYY") : "-",
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
            { wch: 15 }, // Telephone
            { wch: 40 }, // Email
            { wch: 30 }, // Adresse
            { wch: 20 }, // Cni
            { wch: 10 }, // sexe
            { wch: 20 }, // lieu naissance
            { wch: 20 }, // date naissance

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
        // 🎨 Style titre (A1)
        worksheet["A1"].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
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
        XLSX.writeFile(workbook, `Membres_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    };
    const handleGeneraExcelMembres = () => {
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

    const cotisationPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COTISATION)
    const cotisAcces = cotisationPermission && (cotisationPermission.CAN_READ || cotisationPermission.CAN_WRITE)
    // if (!cotisAcces) {
    //     return <NotFound />
    // }
    return (
        <>
            {globalLoading && <Loading />}
            <div className="px-4 py-3 main_content">
                {pdfUrl ? (
                    <>
                        <div className="mt-4">
                            <h1 className="mb-3">Liste des membres :</h1>
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
                            <h1 className="mb-3"></h1 >
                            {cotisationPermission && cotisationPermission.CAN_WRITE || IsGerant ?
                               
                            <Button
                                className="mt-3 ml-3 button-mobile"
                                size="small"
                                onClick={() => {
                                    navigate("/membre_microfinance/new")
                                }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                </svg>
                                <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                            </Button>
                                : null}
                        </div >
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
                                {ismembre === 2 ? null : (<div className="p-input-icon-left ml-1">
                                    <Dropdown
                                        value={sexemembres}
                                        onChange={(e) => {
                                            sexemembreSelected(e.value)
                                        }}
                                        options={sexefiltre}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Genre"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>)}

                                {ismembre === 2 ? null : (<div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                                    <div
                                        onClick={() => {
                                            if (!Array.isArray(membres_microfinance) || membres_microfinance.length === 0) return;
                                            handleGeneraPDF();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: Array.isArray(membres_microfinance) && membres_microfinance.length > 0 ? "pointer" : "not-allowed",
                                            opacity: Array.isArray(membres_microfinance) && membres_microfinance.length > 0 ? 1 : 0.6,
                                        }}
                                    >
                                        PDF
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (!Array.isArray(membres_microfinance) || membres_microfinance.length === 0) return;
                                            handleGeneraExcelMembres();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: Array.isArray(membres_microfinance) && membres_microfinance.length > 0 ? "pointer" : "not-allowed",
                                            opacity: Array.isArray(membres_microfinance) && membres_microfinance.length > 0 ? 1 : 0.6,
                                        }}
                                    >
                                        XLS
                                    </div>

                                </div>)}




                            </div>
                            {cotisationPermission && cotisationPermission.CAN_WRITE ?
                                <div className="selection-actions d-flex align-items-center ml-3">
                                    <div className="text-muted mx-3">
                                        {selectedItems ? selectedItems.length : "0"} selectionné
                                        {selectedItems?.length > 1 && "s"}
                                    </div>
                                    <a
                                        href="#"
                                        className={`p-menuitem-link link-dark text-decoration-none ${(!selectedItems || selectedItems?.length == 0) &&
                                            "opacity-50 pointer-events-none"
                                            }`}
                                        style={{}}
                                        onClick={(e) =>
                                            handleDeletePress(
                                                e,
                                                selectedItems.map((item) => item.ID_MEMBRE)
                                            )
                                        }
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-trash"
                                            viewBox="0 0 16 16"
                                            style={{ marginRight: "0.3rem" }}
                                        >
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                        </svg>
                                        <span className="p-menuitem-text">Supprimer</span>
                                    </a>

                                </div>
                                : null}
                        </div>
                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                                <DataTable
                                    lazy
                                    value={membres_microfinance}
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    paginator
                                    size="small"
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 300, 500, 1000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={`{first} - {last} dans ${totalRecords} éléments`}
                                    emptyMessage="Aucun element trouvé"
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
                                    {cotisationPermission && cotisationPermission.CAN_WRITE ?
                                        <Column
                                            selectionMode="multiple"
                                            frozen
                                            headerStyle={{ width: "3rem" }}
                                        /> : null}
                                    <Column
                                        field="PHOTO_PASSPORT"
                                        header="Membre"
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                        .round-indicator .p-image-preview-indicator {
                                               border-radius: 50%;
                                               }
                                             `;

                                            return (
                                                <>
                                                    <Link
                                                        id={`Nocmnde-${item.ID_UTILISATEUR}`}
                                                        className="text-decoration-none d-flex align-items-center round-indicator"
                                                        to={`/membre_microfinance/Details?ID=${encodeId(item?.ID_UTILISATEUR)}`}
                                                        style={{ color: '#399af2' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        data-pr-position="bottom"
                                                    >
                                                        {/* Image ou initiales du membre */}
                                                        {item?.membre?.PHOTO_PASSPORT ? (
                                                            <Image
                                                                src={item.membre?.PHOTO_PASSPORT}
                                                                alt="Membre"
                                                                className="rounded-5"
                                                                imageClassName="rounded-5 object-fit-cover"
                                                                imageStyle={{ width: "30px", height: "30px" }}
                                                                style={{ width: "30px", height: "30px" }}
                                                                preview
                                                            />
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#ccc',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    color: 'black',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            >
                                                                {(item?.membre?.NOM?.charAt(0) || '') + (item?.membre?.PRENOM?.charAt(0) || '')}
                                                            </div>
                                                        )}

                                                        {/* Nom, Email, Téléphone */}
                                                        <div className="ml-2">
                                                            <div className="font-bold">
                                                                {item?.membre?.NOM} {item?.membre?.PRENOM}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                                                {item?.membre?.EMAIL}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                                                {item?.membre?.TELEPHONE}
                                                            </div>
                                                        </div>
                                                    </Link>

                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />

                                    <Column
                                        field="ADRESSE"
                                        header="Adresse"
                                        sortable
                                        body={(item) => item.membre?.ADRESSE}
                                    />


                                    <Column
                                        field="PHOTO_CNI"
                                        header="CNI"
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                          .round-indicator .p-image-preview-indicator {
                                          border-radius: 50%
                                          }`;
                                            return (
                                                <>
                                                    <div className="d-flex round-indicator">
                                                        {item.membre?.PHOTO_CNI ? (
                                                            <Image
                                                                src={item.membre?.PHOTO_CNI}
                                                                alt="Image"
                                                                className="rounded-5"
                                                                imageClassName="rounded-5 object-fit-cover"
                                                                imageStyle={{ width: "30px", height: "30px" }}
                                                                style={{ width: "30px", height: "30px" }}
                                                                preview
                                                            />
                                                        )
                                                            :
                                                            (
                                                                <div style={{
                                                                    width: '30px', height: '30px',
                                                                    borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                    justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                }}>

                                                                </div>
                                                            )
                                                        }


                                                    </div>
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />

                                    <Column
                                        field="CNI_NUMERO"
                                        header="Numero"
                                        sortable
                                        body={(item) => item.membre?.CNI_NUMERO}
                                    />

                                    <Column
                                        field="SEXE"
                                        header="Genre"
                                        sortable
                                        body={(item) => {
                                            const sexe = parseInt((item.membre?.SEXE ?? "").toString().trim());

                                            // Mapping des genres avec Badge et icônes à l'intérieur
                                            const genreMap = {
                                                0: {
                                                    badge: (
                                                        <Badge
                                                            value={
                                                                <div className="flex align-items-center gap-1">
                                                                    <i className="pi pi-user" style={{ fontSize: '1rem', color: '#2196F22' }}></i>
                                                                    Homme
                                                                </div>
                                                            }
                                                            severity="info" // couleur bleu
                                                        />
                                                    ),
                                                    label: "Homme",
                                                },
                                                1: {
                                                    badge: (
                                                        <Badge
                                                            value={
                                                                <div className="flex align-items-center gap-1">
                                                                    <i className="pi pi-user-plus" style={{ fontSize: '1rem', color: '#2196F22' }}></i>
                                                                    Femme
                                                                </div>
                                                            }
                                                            severity="success" // couleur vert
                                                        />
                                                    ),
                                                    label: "Femme",
                                                },
                                            };

                                            // Gestion du cas "Autres"
                                            const genre = genreMap[sexe] || {
                                                badge: (
                                                    <Badge
                                                        value={
                                                            <div className="flex align-items-center gap-1">
                                                                <i className="pi pi-question" style={{ fontSize: '1rem', color: '#2196F22' }}></i>
                                                                Autres
                                                            </div>
                                                        }
                                                        severity="warning" // couleur orange
                                                    />
                                                ),
                                                label: "Autres",
                                            };

                                            return (
                                                <div className="p-2" style={{ width: 'fit-content' }}>
                                                    <div
                                                        className="flex align-items-center gap-2 border-round p-2"
                                                        style={{

                                                            minWidth: '120px',
                                                            padding: '8px 12px',
                                                            borderRadius: '2px',
                                                        }}
                                                    >
                                                        {/* Affichage du Badge et de l'icône */}
                                                        {genre.badge}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="LIEU_NAISSANCE"
                                        header="Lieu de naissance"
                                        sortable
                                        body={(item) => item.membre?.LIEU_NAISSANCE}
                                    />
                                    <Column
                                        field="DATE_NAISSANCE"
                                        header="Date de naissance"
                                        sortable
                                        body={(item) => {
                                            return moment(item.membre?.DATE_NAISSANCE).format("DD/MM/YYYY HH:mm");
                                        }}
                                    />
                                    {cotisationPermission && cotisationPermission.CAN_WRITE ?
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
                                                                <Link
                                                                    to={`/membre_microfinance/Edit/${encodeId(inViewMenuItem?.ID_MEMBRE)}`}
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
                                                    {
                                                        template: (deleteItem, options) => {
                                                            return (
                                                                <a
                                                                    href="#"
                                                                    className="p-menuitem-link text-danger"
                                                                    onClick={(e) =>
                                                                        handleDeletePress(e, [inViewMenuItem?.ID_MEMBRE])
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
                                                                    <span className="p-menuitem-text text-danger">Supprimer</span>
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
                                                            viewportHeight={110}
                                                            menuWidth={200}
                                                            onHide={() => setInViewMenuItem(null)}
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
                                        : null}

                                </DataTable>
                            </div>
                        </div>
                    </>)}

            </div>

        </>
    )
}



<Outlet />
