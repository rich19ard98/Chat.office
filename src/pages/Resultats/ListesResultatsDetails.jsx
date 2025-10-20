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
import { useParams } from "react-router-dom";
import entete from "../../../public/images/nodebu.png";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { Image } from "primereact/image";
import { userSelector } from "../../store/selectors/userSelector";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { decodeId, encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import jsPDF from "jspdf";
import { useSearchParams } from 'react-router-dom';
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
export default function ListesResultatsDetails() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(1);
    const user = useSelector(userSelector);
    const [Comptes, setComptes] = useState([]);
    const [searchParams] = useSearchParams();
    const encodedId = searchParams.get("id"); // récupère "MTc"
    const [decodedId, setDecodedId] = useState(null);
    const [ResultatsID, setResultatsID] = useState(parseInt(decodedId));
    const [IDresultats, setIDresultats] = useState([]);
    const [Statut, setStatut] = useState(null);
    const [Etat, setEtat] = useState(null);

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
    const [membredata, setmembredata] = useState([]);
    const [profiledata, setProfiledata] = useState([])
    const [Resultats, setResultats] = useState(null)
    const [ResultatsDetails, setResultatsDetails] = useState(null)

    const navigate = useNavigate();
    const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError, } = useFormErrorsHandle({},
        {


        }
    );
    useEffect(() => {
        if (encodedId) {
            // ta fonction de décodage ici
            const id = decodeId(encodedId)
            setDecodedId(id);
        }
    }, [encodedId]);
    useEffect(() => {
        if (decodedId !== null) {
            const idParsed = parseInt(decodedId);
            if (!isNaN(idParsed)) {
                setResultatsID(idParsed);
            }
        }
    }, [decodedId]);

    useEffect(() => {
        if (encodedId) {
            const id = decodeId(encodedId);
            setDecodedId(id); // ce déclenche la requête de fetch
            setResultatsID(id)
            setIDresultats(id)
        }

    }, [encodedId]);
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
    }
    const handleApprouver = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Terminer l'approbation",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment approuver le Resultat ?
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
    const HandleAttribution = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Terminer l'attribution",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment attribuer le Resultat ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                AttributionMontant(itemsIds);
            },
        });
    };


    const AttributionMontant = async () => {
        try {
            const res = await fetchApi(`/Resultats/Resultats/Attribution`, {
                method: "get",
            });


            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "Terminer l'Approbation avec succès ",
                    detail: "L'attribution a bien été terminee succès",
                    life: 3000,
                })
            );
            FetchResultatsapprouve()
        } catch (error) {
            console.log(error);
            if (error.httpStatus === 400) {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de l'approbation du resultat",
                        detail: 'Montant non disponible .',
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
        }
    };

    const ApprouvecreditItems = async () => {
        try {
            const res = await fetchApi(`/Resultats/Resultats/update/${IDresultats}`, {
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
            FetchResultatsapprouve()
        } catch (error) {
            console.log(error);
            if (error.httpStatus === 400) {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de l'approbation du resultat",
                        detail: 'Montant non disponible .',
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
        }
    };



    const FetchResultatsapprouve = useCallback(async () => {
        try {

            const res = await fetchApi(`/Resultats/Resultats/Find/${IDresultats}?`);
            const Statut = res.result.data
            setStatut(Statut.STATUT)
            setEtat(Statut.ETAT)
            console.log(res);


            //setmodes(res.result.data)
            setResultats(res.result.data)
            setResultatsDetails(res.result.detail)


        } catch (error) {
            console.error("Erreur lors de la récupération des comptes :", error);
        }
    }, [IDresultats, decodedId]);

    useEffect(() => {
        FetchResultatsapprouve();
    }, [IDresultats, decodedId]);

    useEffect(() => {
        document.title = "Compte"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Comptes',
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
    const exportExcelComptes = (Comptes) => {
        if (!Array.isArray(Comptes)) {
            console.error("La variable Comptes n'est pas un tableau :", Comptes);
            return;
        }

        const titre = [["Liste des Comptes"]];
        const headers = [
            "#",
            "Membres",
            "CODE",
            "SOLDE",
            "CLASSE",
            "Date creation"
        ];

        const data = Comptes.map((item, index) => ([
            index + 1,

            item.membre ? `${item.membre.NOM} ${item.membre.PRENOM}` : "-",
            item.CODE || "-",
            parseFloat(item?.SOLDE || 0), // Montant en nombre
            item.classe_comptable.NOM_CLASSE || "-",


            item.DATE_CREATION ? moment(item.DATE_CREATION).format("DD/MM/YYYY") : "-"
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Comptes");

        const filename = `Comptes${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
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

                exportExcelComptes(Comptes)
            },
        });
    };
    const exportPdfComptes = (Comptes) => {
        const pageHeight = 297;
        if (!Array.isArray(Comptes)) {
            console.error("La variable Comptes2 n'est pas un tableau :", Comptes);
            return;
        }
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        doc.addImage(entete, "JPEG", 0, 0, 70, 30);
        doc.setFontSize(13);
        doc.text("Liste des Comptes", 80, 30);
        doc.setFontSize(13);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(` ${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });
        const columns = [
            { header: "#", dataKey: "index" },
            { header: "Membre", dataKey: "MEMBRE" },
            { header: "Solde", dataKey: "SOLDE" },
            { header: "Code", dataKey: "CODE" },
            { header: "Classe", dataKey: "CLASSE" },
            { header: "Date", dataKey: "DATE_CREATION" },
        ];

        const rows = Comptes.map((item, index) => ({
            index: index + 1,

            MEMBRE: item.membre ? `${item.membre.NOM} ${item.membre.PRENOM}` : "-",
            SOLDE: parseFloat(item.SOLDE || 0).toLocaleString("fr-FR").replace(/\s/g, " ") + " Fbu",
            CODE: item.CODE,

            CLASSE: item.classe_comptable.NOM_CLASSE || "-",
            DATE_CREATION: item.DATE_CREATION ? moment(item.DATE_CREATION).format("DD/MM/YYYY") : "-",
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
        const filename = `Listes_Comptes${moment().format("YYYYMMDD_HHmmss")}.pdf`;
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
                exportPdfComptes(Comptes)
                const blob = exportPdfComptes(Comptes);
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            },
        });
    };
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
                        name: `${util.membre.NOM} ${util.membre.PRENOM}`,
                        code: util.membre.ID_MEMBRES_MICROFINANCE,
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
    const IsAdminAjoin = user.ID_PROFIL === PROFILS.ADMIN_ADJOINT
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT

    const cotisationPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COTISATION)
    const cotisAcces = cotisationPermission && (cotisationPermission.CAN_READ || cotisationPermission.CAN_WRITE)
    if (!cotisAcces && !IsAdminAjoin && !IsGerant) {
        return <NotFound />
    }
    return (
        <>


            <div className="px-4 py-3 main_content bg-white has_footer">
                <div>
                    <h1 className="mb-3">Résultats</h1>
                    <hr className="w-100" />
                </div>

                <form className="form w-100 mzt-5">
                    <div className="grid">
                        <div className="col-12 w-100 md:col-3">
                            <div className="card bg-dark shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Valeur Nette</h5>
                                <p className="text-center text-white text-xl font-semibold">
                                    {new Intl.NumberFormat('fr-FR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(Resultats?.MONTANT || 0)}{" "}
                                    Fbu
                                </p>
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div className="card bg-dark  shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Réserve générale</h5>
                                <p className="text-center text-white text-xl font-semibold">80%</p>
                            </div>
                            <div className="form-group col-sm">
                                <InputText
                                    type="text"
                                    disabled
                                    placeholder="Montant"
                                    id="RESERVE_GENERAL"
                                    name="RESERVE_GENERAL"
                                    value={
                                        (ResultatsDetails?.RESERVE_GENERAL
                                            ? Number(ResultatsDetails.RESERVE_GENERAL).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0") + " FBU"
                                    } className="w-100 text-black font-bold"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div className="card bg-dark  shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Prime administrative</h5>
                                <p className="text-center text-white text-xl font-semibold">5%</p>
                            </div>
                            <div className="form-group col-sm">
                                <InputText
                                    disabled
                                    type="text"
                                    placeholder="Montant"
                                    id="PRIME_ADMINISTRATION"
                                    name="PRIME_ADMINISTRATION"
                                    value={
                                        (ResultatsDetails?.PRIME_ADMINISTRATION
                                            ? Number(ResultatsDetails.PRIME_ADMINISTRATION).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0") + " FBU"
                                    }
                                    className="w-100 text-black font-bold"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div className="card bg-dark  shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Dividende à payer</h5>
                                <p className="text-center text-white text-xl font-semibold">15%</p>
                            </div>
                            <div className="form-group text-black  col-sm" style={{ color: 'red' }}>
                                <InputText
                                    type="text"
                                    placeholder="Montant"
                                    id="DIVIDENTE_PAYER"
                                    name="DIVIDENTE_PAYER"
                                    disabled
                                    value={
                                        (ResultatsDetails?.DIVIDENTE_PAYER
                                            ? Number(ResultatsDetails.DIVIDENTE_PAYER).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            })
                                            : "0") + " FBU"
                                    }

                                    className="w-100 text-black font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    {Statut === 1 && Etat === 0 ?
                        <div
                            style={{ position: "absolute", bottom: 0, right: 0 }}
                            className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                        >
                            <Button
                                label="Attribue"
                                type="submit"
                                className="mt-3 ml-3"
                                size="small"
                                onClick={(e) => HandleAttribution(e)}
                            />

                        </div>
                        : null}
                    {Statut === 0 && Etat === 0 ? (
                        <div
                            style={{ position: "absolute", bottom: 0, right: 0 }}
                            className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                        >
                            <Button
                                label="Approuve"
                                type="submit"
                                className="mt-3 ml-3"
                                size="small"
                                onClick={(e) => handleApprouver(e)}
                            />

                        </div>
                    ) : null}



                </form>
            </div>


        </>
    );
}
