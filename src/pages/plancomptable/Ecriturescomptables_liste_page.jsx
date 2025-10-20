import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { useNavigate } from "react-router-dom";
import { setBreadCrumbItemsAction } from "../../store/actions/appActions";
import { userSelector } from "../../store/selectors/userSelector";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import LZString from "lz-string";
import { io } from "socket.io-client";
import entete from "../../../public/images/nodebu.png";
import { Image } from "primereact/image";
import fetchApi from "../../helpers/fetchApi";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { encodeId } from "../../utils/IdEncryption";
import PROFILS from "../../constants/PROFILS";
import FraisAdhesion from "../../pages/frais_adhesions/Frais_adhesions_liste_page"
import Cotisations from "../../pages/cotisations/Cotisation_liste_page"
import Credits from "../../pages/credits/Credits_liste_page"
import StatutEcritureComptableColor from "../../helpers/StatutEcritureComptableColor";
import STATUT_ECRITURE_COMPTABLE from "../../constants/STATUT_ECRITURE_COMPTABLE";
import socket from "../../utils/socket";


/**
 * Récupérer toutes les Comptes comptables
 * @date  15/04/2025
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author rosine <gahimbarerosine9@gmail.com>
 */
export default function EcrituresComptablesListePage() {
    const [loading, setLoading] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [ecritures, setEcritures] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [utilisateurdata, setutilisateurdata] = useState([]);
    const [membredata, setmembredata] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [comptedebitdata, setcomptedebitdata] = useState([]);
    const [comptecreditdata, setcomptecreditdata] = useState([]);
    const [operationdata, setoperationdata] = useState([]);
    const user = useSelector(userSelector);
    const [profiledata, setProfiledata] = useState([])
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [selectedUtilisateur, setSelectedUtilisateur] = useState([null]);
    const [selectedMembre, setSelectedMembre] = useState(null);
    const [selectedcomptedebit, setSelectedcomptedebit] = useState(null);
    const [selectedcomptecredit, setSelectedcomptecredit] = useState(null);
    const [Selectedoperation, setSelecteoperation] = useState(null);
    const [montantTotal, setMontantTotal] = useState(0);
    const [montantTotalDebit, setMontantTotalDebit] = useState(0);
    const [montantTotalCredit, setMontantTotalCredit] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [statut, setstatut] = useState(null);
    const [AuthorUser, setAuthorUser] = useState([]);  // ✅ toujours [] par défaut, pas null
    const [refreshing, setRefreshing] = useState(false); // Pour indiquer mise à jour background

    const [dates, setDates] = useState(null);
    const [lazyState, setLazyState] = useState({
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

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const calculateTotals = useCallback(() => {
        if (ecritures.length > 0) {

            const filteredEcritures = Selectedoperation?.name
                ? ecritures.filter((e) => e.TYPE_OPERATION === Selectedoperation.name)
                : ecritures;

            const totalDebit = filteredEcritures
                .filter(item => item.STATUT === 0)  // ou 'reussi' selon ton format
                .reduce(
                    (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
                    0
                );
            const totalCredit = filteredEcritures
                .filter(item => item.STATUT === 0)  // ou 'reussi' selon ton format
                .reduce(
                    (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
                    0
                );

            // const totalCredit = filteredEcritures.reduce(
            //     (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
            //     0
            // );



            setMontantTotalDebit(totalDebit);
            setMontantTotalCredit(totalCredit);
        } else {

            setMontantTotalDebit(0);
            setMontantTotalCredit(0);
        }
    }, [Selectedoperation?.name, ecritures]);


    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedItems(value);
        setSelectAll(value.length === totalRecords);
    };

    const onSelectAllChange = (event) => {
        const selectAll = event.checked;

        if (selectAll) {
            setSelectAll(true);
            setSelectedItems(ecritures);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const utilisateursSelected = (utilisateur) => {
        setSelectedUtilisateur(utilisateur);
    };
    const membresSelected = (membre) => {
        setSelectedMembre(membre);
    };

    const operationSelected = (operation) => {
        setSelecteoperation(operation);
    };
    const statusSelected = (status) => {
        setstatut(status);
    };
    const [statutEcriture, setstatutEcriture] = useState([
        {
            code: 0,
            name: "Reussi"
        },
        {
            code: 1,
            name: "Annuler"
        },


    ]);
    const fetchUtilisateurs = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?rows=100000&selectedCaissier=${PROFILS.CAISSIER}`
            const res = await fetchApi(url);
            console.log(res);

            setutilisateurdata(
                res.result.data.map((util) => {
                    return {
                        name: `${util?.NOM} ${util?.PRENOM}`,
                        code: util?.ID_UTILISATEUR
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchUtilisateurs();
    }, []);
    // const [membredata, setmembredata] = useState([]);
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
                        name: `${util?.NOM} ${util?.PRENOM}`,
                        code: util?.ID_UTILISATEUR,
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
    const fetchcomptecredit = useCallback(async () => {
        try {
            var url = `/plancomptable/comptescomptables/fetch?rows=10000&`
            const res = await fetchApi(url);


            setcomptecreditdata(
                res.result.data.map((util) => {
                    return {
                        name: util?.NOM,
                        code: util.ID_COMPTES_COMPTABLES,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchcomptecredit();
    }, []);
    const fetchcopmtedebit = useCallback(async () => {
        try {
            var url = `/plancomptable/comptescomptables/fetch?`
            const res = await fetchApi(url);

            setcomptedebitdata(
                res.result.data.map((util) => {
                    return {
                        name: util?.NOM,
                        code: util.ID_COMPTES_COMPTABLES,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchcopmtedebit();
    }, []);

    const fetchtypeoperation = useCallback(async () => {
        try {
            var url = `/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`
            const res = await fetchApi(url);
            setoperationdata(
                res.result.data.map((util) => {
                    return {
                        name: util?.NOM_OPERATION,
                        code: util.ID_TYPES_OPERATIONS,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchtypeoperation();
    }, []);

    const CACHE_NAME = "ecritures-cache";

    // helper pour construire la clé de cache
    const buildCacheKey = () => {
        let url = `/plancomptable/ecriturecomptable/fetch?rows=10000000000&`;
        for (let key in lazyState) {
            const value = lazyState[key];
            if (value !== null && value !== undefined) {
                url += `${key}=${encodeURIComponent(
                    typeof value === "object" ? JSON.stringify(value) : value
                )}&`;
            }
        }
        if (dates) {
            const [startDate, endDate] = dates;
            if (startDate) url += `startDate=${startDate.toISOString()}&`;
            if (endDate) url += `endDate=${endDate.toISOString()}&`;
        }

        if (selectedUtilisateur?.code)
            url += `utilisateurs=${selectedUtilisateur.code}&`;
        if (selectedMembre?.code)
            url += `membres_microfinance=${selectedMembre.code}&`;
        if (Selectedoperation?.name)
            url += `TYPE_OPERATION=${Selectedoperation.name}&`;
        if (selectedcomptedebit)
            url += `compte_debit=${selectedcomptedebit.code}&`;
        if (selectedcomptecredit)
            url += `compte_credit=${selectedcomptecredit.code}&`;
        if (statut?.code != null) url += `statut=${statut.code}&`;

        return url;
    };

    // const fetchEcritures = useCallback(
    //     async (silent = false, forceRefresh = false) => {
    //         try {
    //             if (!silent) setLoading(true);
    //             const url = buildCacheKey();

    //             // 🔹 Vérifier d'abord dans le cache
    //             const cache = await caches.open(CACHE_NAME);
    //             const cachedResponse = await cache.match(url);

    //             if (cachedResponse) {
    //                 const compressed = await cachedResponse.text();
    //                 const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

    //                 if (Date.now() <= parsed.expiresAt) {
    //                     console.log("✅ Chargé depuis le cache");

    //                     setEcritures(parsed.data);
    //                     setTotalRecords(parsed.totalRecords);
    //                     setMontantTotal(parsed.totalMontant);
    //                     setAuthorUser(parsed.uniqueUsers);

    //                     if (!silent) setLoading(false); // 🔹 loader seulement si pas silent
    //                     return; // pas besoin d’aller sur le serveur
    //                 } else {
    //                     await cache.delete(url);
    //                 }
    //             }

    //             // 🔹 Pas dans le cache ou expiré → appel API
    //             const res = await fetchApi(url);
    //             const allEcritures = res.result.data ?? [];

    //             const users = allEcritures
    //                 .map(util => ({
    //                     name: `${util.utilisateurs?.NOM ?? ""} ${util.utilisateurs?.PRENOM ?? ""
    //                         }`.trim(),
    //                     code: util.utilisateurs?.ID_UTILISATEUR,
    //                 }))
    //                 .filter(u => u.code);

    //             const uniqueUsers = Array.from(new Map(users.map(u => [u.code, u])).values());

    //             setAuthorUser(uniqueUsers);

    //             const totalMontant = allEcritures
    //                 .filter(
    //                     item => item?.STATUT !== STATUT_ECRITURE_COMPTABLE.ANNULER
    //                 )
    //                 .reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);

    //             setEcritures(allEcritures);
    //             setTotalRecords(res.result.totalRecords);
    //             setMontantTotal(totalMontant);

    //             // 🔹 Sauvegarder dans le cache (compressé)
    //             const compressed = LZString.compressToUTF16(
    //                 JSON.stringify({
    //                     data: allEcritures,
    //                     totalRecords: res.result.totalRecords,
    //                     totalMontant,
    //                     uniqueUsers,
    //                     expiresAt: Date.now() + 120000, // 2 min
    //                 })
    //             );

    //             const response = new Response(compressed, {
    //                 headers: { "Content-Type": "text/plain" },
    //             });
    //             await cache.put(url, response);

    //         } catch (error) {
    //             console.error("Erreur lors du chargement des écritures comptables :", error);
    //         } finally {
    //             if (!silent) setLoading(false); // 🔹 éviter de bloquer le loader en silent
    //         }
    //     }, [
    //     lazyState,
    //     selectedUtilisateur,
    //     selectedMembre,
    //     Selectedoperation,
    //     selectedcomptecredit,
    //     selectedcomptedebit,
    //     dates,
    //     statut,
    // ]);


    const fetchEcritures = useCallback(
        async (silent = false, forceRefresh = false) => {
            try {
                if (!silent) setLoading(true);
                const url = buildCacheKey();

                const cache = await caches.open(CACHE_NAME);

                // 🚨 si pas forceRefresh → vérifier le cache
                if (!forceRefresh) {
                    const cachedResponse = await cache.match(url);
                    if (cachedResponse) {
                        const compressed = await cachedResponse.text();
                        const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

                        if (Date.now() <= parsed.expiresAt) {
                            console.log("✅ Chargé depuis le cache");
                            setEcritures(parsed.data);
                            setTotalRecords(parsed.totalRecords);
                            setMontantTotal(parsed.totalMontant);
                            setAuthorUser(parsed.uniqueUsers);
                            if (!silent) setLoading(false);
                            return;
                        } else {
                            await cache.delete(url);
                        }
                    }
                }

                // 🔹 API → données fraîches
                const res = await fetchApi(url);
                const allEcritures = res.result.data ?? [];
console.log({allEcritures});

                const users = allEcritures
                    .map(util => ({
                        name: `${util.utilisateurs?.NOM ?? ""} ${util.utilisateurs?.PRENOM ?? ""}`.trim(),
                        code: util.utilisateurs?.ID_UTILISATEUR,
                    }))
                    .filter(u => u.code);

                const uniqueUsers = Array.from(new Map(users.map(u => [u.code, u])).values());

                setAuthorUser(uniqueUsers);

                const totalMontant = allEcritures
                    .filter(item => item?.STATUT !== STATUT_ECRITURE_COMPTABLE.ANNULER)
                    .reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);

                setEcritures(allEcritures);
                setTotalRecords(res.result.totalRecords);
                setMontantTotal(totalMontant);

                // 🔹 Sauvegarde dans le cache
                const compressed = LZString.compressToUTF16(
                    JSON.stringify({
                        data: allEcritures,
                        totalRecords: res.result.totalRecords,
                        totalMontant,
                        uniqueUsers,
                        expiresAt: Date.now() + 120000, // 2 min
                    })
                );

                const response = new Response(compressed, {
                    headers: { "Content-Type": "text/plain" },
                });
                await cache.put(url, response);

            } catch (error) {
                console.error("Erreur lors du chargement des écritures comptables :", error);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [lazyState, selectedUtilisateur, selectedMembre, Selectedoperation, selectedcomptecredit, selectedcomptedebit, dates, statut]
    );

    useEffect(() => {
        fetchEcritures();

        // rafraîchissement auto toutes les 2 min
        const interval = setInterval(() => {
            fetchEcritures(false);
        }, 120000);

        return () => clearInterval(interval);
    }, [
        lazyState.first,
        lazyState.rows,
        selectedUtilisateur,
        selectedMembre,
        Selectedoperation,
        selectedcomptecredit,
        selectedcomptedebit,
        dates,
        statut,
    ]);


    useEffect(() => {
        setLazyState((s) => ({ ...s, first: 0 }));
    }, [
        selectedUtilisateur,
        selectedMembre,
        Selectedoperation,
        selectedcomptedebit,
        selectedcomptecredit,
        dates,
        statut,
    ]);
    // Ref pour les écritures
    // --- ref qui pointe toujours sur la dernière version de fetchEcritures
    const fetchEcrituresRef = useRef((silent = false, forceRefresh = false) => { });
    // garde la ref à jour quand fetchEcritures change
    useEffect(() => {
        fetchEcrituresRef.current = (silent = false, forceRefresh = false) =>
            fetchEcritures(silent, forceRefresh);

    }, [fetchEcritures]);


    // ref pour timer debounce WS
    const wsCoalesceRef = useRef(null);

    useEffect(() => {
        const handler = (payload) => {

            if (!payload || !payload.type || !payload.action) return;

            const rawType = String(payload.type).trim().toLowerCase();
            const rawAction = String(payload.action).trim().toLowerCase();

            // on ne traite que ecriturecomptable & anticipe
            if (!["ecriturecomptable", "ecriturecomptableanticipe", "remboursementecriturecomptable", "reemboursementprecoceecriturecomptable", "approuvecredit", "fraisadhesion", "fichedepenseecriturecomptable"].includes(rawType)) {
                return;
            }


            // actions intéressantes
            if (!["ajout", "update", "delete"].includes(rawAction)) {
                return;
            }

            // coalescer les WS → 1 seul fetch max toutes les 300ms
            if (wsCoalesceRef.current) clearTimeout(wsCoalesceRef.current);
            wsCoalesceRef.current = setTimeout(() => {
                // ⚡ silent refresh + forcer bypass cache
                fetchEcrituresRef.current?.(true, true);
                wsCoalesceRef.current = null;
            }, 300);
        };

        socket.on("new_data", handler);

        return () => {
            socket.off("new_data", handler);
            if (wsCoalesceRef.current) clearTimeout(wsCoalesceRef.current);
        };
    }, []);



    useEffect(() => {
        document.title = "Écritures comptables";
        dispatch(setBreadCrumbItemsAction([
            {
                path: 'Ecritures comptables',
                name: 'Écritures comptables'
            }
        ]));

        return () => dispatch(setBreadCrumbItemsAction([]));
    }, []);
    const onPage = (event) => {

        setLazyState((prev) => ({
            ...prev,
            first: event.first,
            rows: event.rows,
            page: event.page,   // ⚡ obligatoire !
        }));
    };
    const onSort = (event) => {

        setLazyState((prev) => ({
            ...prev,
            sortField: event.sortField,
            sortOrder: event.sortOrder,
        }));
    };

    const onFilter = (event) => {

        setLazyState((prev) => ({
            ...prev,
            first: 0, // retour première page
            filters: event.filters,
        }));
    };


    /**
    * Permet Generer Pdf et excel
    * @param {express.Request} req 
    * @param {express.Response} res 
    * @author Richard <richardngendakumana10@gmail.com>
    * @date 03/07/2025
    */

    const exportPdfEcritures = () => {
        const pageHeight = 297;

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

        doc.addImage(entete, "JPEG", 0, 0, 70, 30);
        // Titre du document
        doc.setFontSize(16);
        doc.text("Liste des écritures comptables", 80, 30);
        doc.setFontSize(15);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });
        // Définition des colonnes (avec dataKey = clé dans les objets rows)
        const columns = [
            { header: "#", dataKey: "index" },
            { header: "Membre", dataKey: "MEMBRE" },
            { header: "Date d'opération", dataKey: "DATE_OPERATION" },
            { header: "Libellé", dataKey: "LIBELLE" },
            { header: "Compte Débit", dataKey: "COMPTE_DEBIT" },
            { header: "Compte Crédit", dataKey: "COMPTE_CREDIT" },
            { header: "Montant", dataKey: "MONTANT" },
        ];

        // Construction des données formatées (rows)
        const rows = ecritures.map((item, idx) => ({
            index: idx + 1,

            MEMBRE: item.membres_microfinance
                ? `${item.membres_microfinance?.NOM} ${item.membres_microfinance?.PRENOM}`
                : "-",
            DATE_OPERATION: item.DATE_OPERATION
                ? moment(item.DATE_OPERATION).format("DD/MM/YYYY")
                : "-",
            LIBELLE: item.LIBELLE || "-",
            COMPTE_DEBIT: item.comptedebit
                ? `${item.comptedebit.CODE}-${item.comptedebit?.NOM}`
                : "-",
            COMPTE_CREDIT: item.comptecredit
                ? `${item.comptecredit.CODE}-${item.comptecredit?.NOM}`
                : "-",
            MONTANT: item.MONTANT
                ? parseFloat(item.MONTANT).toLocaleString("fr-FR").replace(/\s/g, " ") + " Fbu"
                : "0 Fbu",

        }));

        doc.autoTable({
            columns,
            body: rows,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: "linebreak",
            },
            headStyles: {
                fillColor: [251, 140, 140],
                textColor: 255,
                fontSize: 9,
            },
            theme: "grid",
            pageBreak: "auto",
        });
        // ✅ Total du montant des crédits
        const finalY = doc.lastAutoTable.finalY || 0;
        const totalMontant = ecritures.reduce((acc, item) => acc + Number(item.MONTANT || 0), 0);
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
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const effectuéPar = `Effectué par :${user?.NOM} ${user?.PRENOM}....................................`;
        const approuvéPar = "Approuvé par : ..................................";

        doc.text(effectuéPar, 10, footerY - 10);
        doc.text(approuvéPar, 125, footerY - 10);
        const filename = `ecritures_${moment().format("YYYYMMDD_HHmmss")}.pdf`;

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

                exportPdfEcritures()
                const blob = exportPdfEcritures();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);

            },
        });
    };

    const exportExcelEcritures = () => {
        // 1. Colonnes (en-têtes visibles)
        const headers = [
            ["#", "Caissier", "Membre", "Date d'opération", "Libellé",
                "Compte Débit", "Compte Crédit", "Montant", "Type d'opération"]
        ];

        // 2. Données des lignes
        const rows = ecritures.map((item, index) => ([
            index + 1,
            item.utilisateurs
                ? `${item.utilisateurs?.NOM} ${item.utilisateurs?.PRENOM}`
                : "-",
            item.membres_microfinance
                ? `${item.membres_microfinance?.NOM} ${item.membres_microfinance?.PRENOM}`
                : "-",
            item.DATE_OPERATION
                ? moment(item.DATE_OPERATION).format("DD/MM/YYYY")
                : "-",
            item.LIBELLE || "-",
            item.comptedebit
                ? `${item.comptedebit.CODE}-${item.comptedebit?.NOM}`
                : "-",
            item.comptecredit
                ? `${item.comptecredit.CODE}-${item.comptecredit?.NOM}`
                : "-",
            parseFloat(item.MONTANT || 0), // 🔢 Nombre, pas string
            item.TYPE_OPERATION || "-"
        ]));

        // 3. Création de la feuille à partir des lignes (titre + espace + en-têtes + données)
        const data = [
            ["Liste des écritures comptables"], // Ligne 1
            [],                                 // Ligne vide
            ...headers,                         // Ligne des en-têtes
            ...rows                             // Lignes de données
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // 4. Fusion du titre (ligne 1)
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers[0].length - 1 } }];

        // 5. Style du titre
        worksheet["A1"].s = {
            font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "FF6384" } }
        };

        // 6. Style des en-têtes (ligne 3 => r = 2)
        headers[0].forEach((_, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: 2, c: colIndex });
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = {
                    font: { bold: true },
                    alignment: { horizontal: "center" },
                    fill: { fgColor: { rgb: "399AF2" } },
                    border: {
                        top: { style: "thin", color: { auto: 1 } },
                        bottom: { style: "thin", color: { auto: 1 } },
                        left: { style: "thin", color: { auto: 1 } },
                        right: { style: "thin", color: { auto: 1 } }
                    }
                };
            }
        });

        // 7. Largeur des colonnes
        worksheet["!cols"] = [
            { wch: 5 },   // #
            { wch: 30 },  // Caissier
            { wch: 30 },  // Membre
            { wch: 18 },  // Date
            { wch: 30 },  // Libellé
            { wch: 25 },  // Compte Débit
            { wch: 25 },  // Compte Crédit
            { wch: 15 },  // Montant
            { wch: 30 }   // Type
        ];

        // 8. Génération et téléchargement
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Écritures");
        XLSX.writeFile(workbook, `Écritures${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    };

    const handleGeneraExcel = () => {


        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Génerer fichier Excel",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment générer Excel ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                exportExcelEcritures()

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
                            <h1 className="mb-3">Ecritures comptables PDF:</h1>
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
                            <h1 className="mb-3"></h1>

                        </div>
                        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                {/* Recherche */}
                                <div className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        type="search"
                                        placeholder="Recherche"
                                        autoFocus
                                        className="p-inputtext-sm"
                                        style={{ minWidth: 100 }}
                                        onInput={(e) => setLazyState((s) => ({ ...s, search: e.target.value }))}
                                    />
                                </div>

                                {/* Dropdown Membre */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={selectedUtilisateur}
                                        onChange={(e) => {
                                            utilisateursSelected(e.value);
                                        }}
                                        options={AuthorUser}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Caissier"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>

                                {/* Dropdown membre */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={selectedMembre}
                                        onChange={(e) => { membresSelected(e.value); }}
                                        options={membredata}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Membre"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>
                                {/* */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={Selectedoperation}
                                        onChange={(e) => operationSelected(e.value)}
                                        options={operationdata}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Type opération"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>
                                {/* */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={statut}
                                        onChange={(e) => statusSelected(e.value)}
                                        options={statutEcriture}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Statut"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>
                                <div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                                    <div
                                        onClick={() => {
                                            if (ecritures.length === 0) return;
                                            handleGeneraPDF();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: ecritures.length === 0 ? "not-allowed" : "pointer",
                                            opacity: ecritures.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        PDF
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (ecritures.length === 0) return;
                                            handleGeneraExcel();
                                        }}
                                        style={{
                                            background: "#143c8c",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "5px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            color: "white",
                                            cursor: ecritures.length === 0 ? "not-allowed" : "pointer",
                                            opacity: ecritures.length === 0 ? 0.6 : 1,
                                        }}
                                    >
                                        {/* Ton SVG ici */}
                                        XLS
                                    </div>
                                </div>


                            </div>

                        </div>

                        <div className="shadow my-2 bg-white p-1 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">

                                <div className="d-flex flex-column mx-1">
                                    <label htmlFor="compteDebit" style={{ color: "black", fontSize: "0.700rem" }}>Montant Total Débit</label>
                                    <InputText
                                        id="compteDebit"
                                        value={montantTotalDebit.toLocaleString("fr-FR")}
                                        disabled
                                        className="p-inputtext-sm"
                                        style={{ color: "blue", fontWeight: "bold", width: "150px" }}
                                    />
                                </div>


                                <div className="d-flex flex-column mx-1">
                                    <label htmlFor="compteCredit" style={{ color: "black", fontSize: "0.700rem" }}>Montant Total Crédit</label>
                                    <InputText
                                        id="compteCredit"
                                        value={montantTotalCredit.toLocaleString("fr-FR")}
                                        disabled
                                        className="p-inputtext-sm"
                                        style={{ color: "blue", fontWeight: "bold", width: "150px" }}
                                    />
                                </div>
                                {/* Date début */}
                                <div className="d-flex flex-column mt-4 mx-2">
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


                            </div>


                            {/* Date début */}
                            <div className="d-flex flex-column mx-0">

                            </div>


                        </div>

                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                                <DataTable
                                    lazy
                                    value={ecritures}
                                    size="small"
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 8000, 10000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={`{first} à {last} sur ${totalRecords} écritures`}
                                    emptyMessage="Aucune écriture trouvée"
                                    first={lazyState.first}
                                    rows={lazyState.rows}
                                    totalRecords={totalRecords}
                                    onPage={onPage}
                                    onSort={onSort}
                                    onFilter={onFilter}
                                    selection={selectedItems}
                                    onSelectionChange={onSelectionChange}
                                    onSelectAllChange={onSelectAllChange}
                                    sortField={lazyState.sortField}
                                    sortOrder={lazyState.sortOrder}
                                    filters={lazyState.filters}
                                    loading={loading}
                                    scrollable
                                    tableStyle={{ minWidth: "60rem" }}
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

                                                    {item?.utilisateurs ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.utilisateurs?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateurs.IMAGE ? (
                                                                    <Image
                                                                        src={item?.utilisateurs?.IMAGE}
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
                                                                        {item?.utilisateurs?.NOM.charAt(0)}{item?.utilisateurs?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2">
                                                                    <div className="font-bold text-sm">
                                                                        {item?.utilisateurs?.USERNAME}
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
                                        field="IMAGE"
                                        header="Membre"
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.membres_microfinance ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/membres_microfinance/${encodeId(item?.membres_microfinance?.UTILISATEUR_ID)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.membres_microfinance.IMAGE ? (
                                                                    <Image
                                                                        src={item?.membres_microfinance?.IMAGE}
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
                                                                        {item?.membres_microfinance?.NOM.charAt(0)}{item?.membres_microfinance?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2">
                                                                    <div className="font-bold text-sm">
                                                                        {item?.membres_microfinance?.NOM} {item?.membres_microfinance?.PRENOM}
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
                                        field="DATE_OPERATION"
                                        header="Date d'opération"
                                        sortable
                                        body={(item) => moment(item.DATE_OPERATION).format("DD/MM/YYYY")}
                                    />
                                    <Column
                                        field="LIBELLE"
                                        header="Libellé"
                                        sortable
                                    />
                                    <Column
                                        field="REFERENCE"
                                        header="Réference"
                                        sortable
                                        body={(item) => {
                                            const reference = item?.REFERENCE; // On récupère la référence de l'élément (ex : "C/1/20250710")
                                            let to = "#"; // Lien par défaut (inutile si aucune condition ne correspond)

                                            // Vérifie si la référence commence par "F/" (frais d'adhésion)
                                            if (reference?.startsWith("F/")) {
                                                // Cherche l'objet correspondant dans la liste des frais
                                                // Si trouvé, construit l'URL avec l'ID encodé
                                                const idFraisadhesion = reference?.split("/")[1];
                                                to = `/frais_adh/${encodeId(idFraisadhesion)}`;


                                            }

                                            // Vérifie si la référence commence par "C/" (crédit)
                                            else if (reference?.startsWith("C/")) {
                                                // Navigue avec la référence incluse dans l'URL
                                                const idCredit = reference?.split("/")[1];
                                                to = `/credits/${encodeId(idCredit)}`;

                                            }


                                            // Vérifie si la référence commence par "CO/" (cotisation)
                                            else if (reference?.startsWith("CO/")) {


                                                const idCotisation = reference?.split("/")[1];
                                                to = `/cotisation/${encodeId(idCotisation)}`;


                                            }
                                            // Vérifie si la référence commence par "CO/" (cotisation)
                                            else if (reference?.startsWith("R/")) {
                                                const idRemboursement = reference?.split("/")[1];
                                                to = `/remboursement_credit/${encodeId(idRemboursement)}`;

                                            }
                                            // Vérifie si la référence commence par "CO/" (cotisation)
                                            else if (reference?.startsWith("T/")) {

                                                const idTransfert = reference?.split("/")[1];
                                                to = `/Transferts/${encodeId(idTransfert)}`;

                                            }
                                            // Vérifie si la référence commence par "CO/" (cotisation)
                                            else if (reference?.startsWith("FD/")) {

                                                const Fichedep = reference?.split("/")[1];
                                                to = `/fiche_depenses/${encodeId(Fichedep)}`;

                                            }
                                            else if (reference?.startsWith("AE/")) {

                                                const AchatEquipement = reference?.split("/")[1];
                                                to = `/achats_equipements/${encodeId(AchatEquipement)}`;

                                            }
                                            else if (reference?.startsWith("EQ/")) {

                                                const Equipement = reference?.split("/")[1];
                                                to = `/equipements/${encodeId(Equipement)}`;

                                            }
                                            else if (reference?.startsWith("IN/")) {

                                                const Initilalisation = reference?.split("/")[1];
                                                to = `/initialisation/${encodeId(Initilalisation)}`;

                                            }
                                            else if (reference?.startsWith("RES/")) {


                                                const Resultats = reference?.split("/")[1];
                                                to = `/Listes/${encodeId(Resultats)}`;

                                            }
                                            else if (reference?.startsWith("DI/")) {

                                                const Dividende = reference?.split("/")[1];
                                                to = `/dividende/${encodeId(Dividende)}`;


                                            }
                                            else if (reference?.startsWith("AC/")) {
                                                const Caissesocail = reference?.split("/")[1];
                                                to = `/caisseSocialliste/${encodeId(Caissesocail)}`;

                                            }
                                            //ALIM/20251014-0019
                                               else if (reference?.startsWith("ALIM/")) {
                                                const Alimentation = reference?.split("/")[1];
                                                to = `/Alimentation/${encodeId(Alimentation)}`;

                                            }
                                            // On vérifie si une route valide a été définie (sinon, on bloque la navigation)
                                            const isNavigable = to !== "#";

                                            return (
                                                <Link
                                                    id={`ref-${reference}`}
                                                    className="text-decoration-none d-flex round-indicator"
                                                    style={{
                                                        color: isNavigable ? "#399af2" : "gray", // Grise si non cliquable
                                                        cursor: isNavigable ? "pointer" : "not-allowed"
                                                    }}
                                                    to={to}
                                                    onClick={(e) => {
                                                        if (!isNavigable) {
                                                            e.preventDefault(); // Empêche la navigation
                                                            e.stopPropagation(); // Empêche l'ouverture de détails si dans un DataTable expandable
                                                        }
                                                    }}
                                                >
                                                    <span>{reference}</span>
                                                </Link>
                                            );
                                        }}
                                    />


                                    <Column
                                        field="COMPTE_DEBIT"
                                        header="Compte Débit"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.comptedebit?.CODE}-{item.comptedebit?.NOM}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="COMPTE_CREDIT"
                                        header="Compte Crédit"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.comptecredit?.CODE}-{item.comptecredit?.NOM}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="MONTANT"
                                        header="Montant"
                                        sortable
                                        body={(item) => `${parseFloat(item.MONTANT).toLocaleString('fr-FR')} Fbu`}
                                    />
                                    <Column
                                        field="TYPE_OPERATION"
                                        header="Type d'opération"
                                        sortable
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
                                                            data-pr-tooltip='Reussi'
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: StatutEcritureComptableColor(item.STATUT).backgroundColor,
                                                                color: StatutEcritureComptableColor(item.STATUT).textColor, border: "none"
                                                            }}
                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: StatutEcritureComptableColor(item.STATUT).icon
                                                                        }} />
                                                                );
                                                            }} />
                                                    ) : item?.STATUT == 1 ? (
                                                        <Button className="btn-sm"
                                                            data-pr-tooltip={item?.DESCRIPTION || "Aucun motif"}
                                                            tooltip tooltipOptions={{ position: 'top' }}
                                                            style={{
                                                                width: 25, height: 25, backgroundColor: StatutEcritureComptableColor(item.STATUT).backgroundColor,
                                                                color: StatutEcritureComptableColor(item.STATUT).textColor, border: "none"
                                                            }}

                                                            icon={options => {
                                                                return (
                                                                    <span className="mb-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: StatutEcritureComptableColor(item.STATUT).icon
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
                        </div>
                    </>
                )}

            </div>
        </>
    );
}
