import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import jsPDF from "jspdf";
import LZString from "lz-string";
import "jspdf-autotable";
import { decodeId } from "../../utils/IdEncryption";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import entete from "../../../public/images/nodebu.png";

import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import socket from "../../utils/socket";
import { userSelector } from "../../store/selectors/userSelector";
import "jspdf-autotable"; // ⚠️ Ce fichier étend jsPDF avec .autoTable
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import Credits_add_page from "./Credits_add_page";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
import PROFILS from "../../constants/PROFILS";
import STATUT_ECRITURE_COMPTABLE from "../../constants/STATUT_ECRITURE_COMPTABLE";
export default function Credits_liste_page() {
    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [credits, setCredits] = useState([]);
    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const user = useSelector(userSelector);
    const agence = user?.agence?.ID_AGENCE

    const [inViewMenuItem, setInViewMenuItem] = useState(null);
    const [modeBackend, setModeBackend] = useState(true); // 👉 toggle ici
    const { ID_OCTROI_CREDIT: encodedId } = useParams();
    const ID_OCTROI_CREDIT = decodeId(encodedId); // Décoder pour obtenir l'ID réel
    const location = useLocation();
    const [globalLoading, setGloabalLoading] = useState(false);
    const [membredata, setmembredata] = useState([]);
    const [statusdata, setstatusdata] = useState([]);
    const [auteurselect, setAuteurselect] = useState(null);
    const [statutselect, setStatuselect] = useState(null);
    const [commandesdata, setCommandedata] = useState([]);
    const [isLoadingStatut, setIsLoadingStatut] = useState(true);
    const [membres, setmembres] = useState();
    const [employe, setemploye] = useState();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedMembre, setSelectedMembre] = useState(null);
    const [selectedstatus, setSelectedstatus] = useState(null);
    const { connectedMembre, setconnectedMembre } = useState({})
    const [montantTotal, setMontantTotal] = useState(0);
    const navigate = useNavigate();
    const [activeButton, setActiveButton] = useState(1);
    const [dates, setDates] = useState(null);
    const ismembre = user.ID_PROFIL
    const Agence = user?.agence?.ID_AGENCE
    console.log({ Agence });

    const [detail_users, setDetail_users] = useState(null);
    const [descriptionText, setDescriptionText] = useState("");
    const [descriptionVisible, setDescriptionVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);


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
    const Ismembre = user.ID_PROFIL
    const dispacth = useDispatch();
    const handleVisibility = (e) => {
        setIsVisible(!isVisible);
    };
    const calculateTotals = useCallback(() => {
        if (credits.length > 0) {

            const filteredcredits = selectedstatus?.name
                ? credits.filter((e) => e.TYPE_OPERATION === selectedstatus.name)
                : credits;


            const total = filteredcredits.reduce(
                (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
                0
            );
            setMontantTotal(total);

        } else {

            setMontantTotal(0);

        }
    }, [selectedstatus?.name, credits]);


    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);
    //const connectedMembre=(membre)=>{set}
    // 🔹 Filtre → on remet toujours à la première page
    const onFilter = (event) => {
        setlazyState((prev) => ({
            ...prev,
            ...event,
            first: 0, // reset à la première page
        }));
    };

    // 🔹 Pagination → on garde les autres infos (tri, filtre, etc.)
    const onPage = (event) => {
        setlazyState((prev) => ({
            ...prev,
            ...event,
        }));
    };

    // 🔹 Tri → on remet à la première page aussi (souvent logique)
    const onSort = (event) => {
        setlazyState((prev) => ({
            ...prev,
            ...event,
            first: 0, // revenir au début après un tri
        }));
    };

    const membresSelected = (membre) => {
        setSelectedMembre(membre);
    };
    const statusSelected = (status) => {
        setSelectedstatus(status);
    };

    const membresid = async (c) => {
        setmembres(c);
    };
    const emploiteID = async (c) => {
        setemploye(c);
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
    const fetchstatus = useCallback(async () => {
        try {
            var url = `/parametre/statutscredit/fetchstatutcredit?`
            const res = await fetchApi(url);
            setstatusdata(
                res.result.data.map((util) => {
                    return {
                        name: `${util.DESCRIPTION}`,
                        code: util.ID_STATUTS_CREDIT,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchstatus();
    }, []);



    const fetchmembres = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?rows=10000&membre=${PROFILS.MEMBRE}`
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

    const CACHE_NAME = "CreditsCache";

    // 🔑 Construction clé unique cache
    const buildCacheKey = () => {
        return `${CACHE_NAME}?${new URLSearchParams({
            ...lazyState,
            membre: selectedMembre?.code || "",
            status: selectedstatus?.code || "",
            startDate: dates?.[0]?.toISOString() || "",
            endDate: dates?.[1]?.toISOString() || "",
            creditId: ID_OCTROI_CREDIT || "",
        }).toString()}`;
    };

    // 📡 Fetch côté backend uniquement
    // const fetchCredit = useCallback(async (silent = false, forceRefresh = false) => {
    //     try {
    //         if (!silent) setLoading(true);

    //         let url = `/credits/credits/fetch?rows=1000000&`;

    //         for (let key in lazyState) {
    //             const value = lazyState[key];
    //             if (value) {
    //                 url += `${key}=${typeof value === "object" ? JSON.stringify(value) : value
    //                     }&`;
    //             }
    //         }

    //         if (selectedMembre?.code) { url += `membresmicro=${selectedMembre.code}&` }
    //         if (selectedstatus?.code) url += `statutscre=${selectedstatus.code}&`;

    //         if (dates) {
    //             const [startDate, endDate] = dates;
    //             if (startDate) url += `startDate=${startDate.toISOString()}&`;
    //             if (endDate) url += `endDate=${endDate.toISOString()}&`;
    //         }

    //         if (ID_OCTROI_CREDIT) url += `ID_OCTROI_CREDIT=${ID_OCTROI_CREDIT}&`;

    //         // 🔹 Appel API
    //         const res = await fetchApi(url);
    //         const allcredits = res.result.data;
    //         // 👉 Backend gère pagination + filtres
    //         setCredits(allcredits);
    //         setTotalRecords(res.result.totalRecords);

    //         // 💾 Sauvegarde compressée en cache
    //         const compressed = LZString.compressToUTF16(
    //             JSON.stringify({
    //                 data: allcredits,
    //                 totalRecords: res.result.totalRecords,
    //                 timestamp: Date.now(),
    //             })
    //         );

    //         const sizeKB = (compressed.length * 2) / 1024;
    //         if (sizeKB <= 51200) {
    //             const cache = await caches.open(CACHE_NAME);
    //             const response = new Response(compressed, {
    //                 headers: { "Content-Type": "text/plain" },
    //             });
    //             await cache.put(buildCacheKey(), response);
    //         }
    //     } finally {
    //         if (!silent) setLoading(false);
    //     }
    // }, [lazyState, selectedMembre, selectedstatus, dates, ID_OCTROI_CREDIT]);

    // // 💾 Chargement depuis cache si disponible
    // useEffect(() => {
    //     const loadFromCache = async () => {
    //         const cache = await caches.open(CACHE_NAME);
    //         const cachedResponse = await cache.match(buildCacheKey());

    //         if (cachedResponse) {
    //             const compressed = await cachedResponse.text();
    //             const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

    //             const isExpired = Date.now() - parsed.timestamp > 3600000; // 1h
    //             if (!isExpired) {
    //                 console.log("✅ Chargé depuis cache");
    //                 setCredits(parsed.data);
    //                 setTotalRecords(parsed.totalRecords);
    //                 setLoading(false);
    //                 return true;
    //             } else {
    //                 await cache.delete(buildCacheKey());
    //             }
    //         }
    //         return false;
    //     };

    //     const init = async () => {
    //         const hasCache = await loadFromCache();
    //         if (!hasCache) await fetchCredit();
    //     };
    //     init();

    //     // refresh auto toutes les 2 min
    //     const interval = setInterval(() => fetchCredit(true, true), 120000);
    //     return () => clearInterval(interval);
    // }, [lazyState, selectedMembre, selectedstatus, dates, ID_OCTROI_CREDIT]);






    const fetchCredit = useCallback(
        async (silent = false, forceRefresh = false) => {
            try {
                if (!silent) setLoading(true);
                const profils = [user.ID_UTILISATEUR, user.agence.ID_AGENCE];
                // const res = await fetchApi(`/administration/utilisateurs/fetch?rows=100000&Profiles=${JSON.stringify(profils)}`);


                let url = `/credits/credits/fetch?&rows=1000000&`;

                for (let key in lazyState) {
                    const value = lazyState[key];
                    if (value) {
                        url += `${key}=${typeof value === "object" ? JSON.stringify(value) : value}&`;
                    }
                }

                if (selectedMembre?.code) url += `membresmicro=${selectedMembre.code}&`;
                if (selectedstatus?.code) url += `statutscre=${selectedstatus.code}&`;

                if (dates) {
                    const [startDate, endDate] = dates;
                    if (startDate) url += `startDate=${startDate.toISOString()}&`;
                    if (endDate) url += `endDate=${endDate.toISOString()}&`;
                }
                if (agence) url += `agence=${agence}&`;

                if (ID_OCTROI_CREDIT) url += `ID_OCTROI_CREDIT=${ID_OCTROI_CREDIT}&`;

                // 🚨 si forceRefresh → ne pas lire le cache, API direct
                const res = await fetchApi(url);
                const allcredits = res.result.data ?? [];

                setCredits(allcredits);
                setTotalRecords(res.result.totalRecords);

                // 💾 Sauvegarde compressée avec expiration courte (ex: 2 min)
                const compressed = LZString.compressToUTF16(
                    JSON.stringify({
                        data: allcredits,
                        totalRecords: res.result.totalRecords,
                        expiresAt: Date.now() + 120000, // 2 min
                    })
                );

                const sizeKB = (compressed.length * 2) / 1024;
                if (sizeKB <= 51200) {
                    const cache = await caches.open(CACHE_NAME);
                    const response = new Response(compressed, {
                        headers: { "Content-Type": "text/plain" },
                    });
                    await cache.put(buildCacheKey(), response);
                }
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [lazyState, selectedMembre, selectedstatus, dates, agence, ID_OCTROI_CREDIT]
    );

    // 💾 Chargement depuis cache si disponible
    useEffect(() => {
        const loadFromCache = async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(buildCacheKey());

            if (cachedResponse) {
                const compressed = await cachedResponse.text();
                const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

                if (Date.now() <= parsed.expiresAt) {
                    console.log("✅ Chargé depuis cache");
                    setCredits(parsed.data);
                    setTotalRecords(parsed.totalRecords);
                    return true;
                } else {
                    await cache.delete(buildCacheKey());
                }
            }
            return false;
        };

        const init = async () => {
            const hasCache = await loadFromCache();
            if (!hasCache) await fetchCredit();
        };
        init();

        const interval = setInterval(() => fetchCredit(true, true), 120000);
        return () => clearInterval(interval);
    }, [fetchCredit]);



    // Ref pour les écritures
    // --- ref qui pointe toujours sur la dernière version de fetchEcritures
    const fetchCreditRef = useRef((silent = false, forceRefresh = false) => { });
    // garde la ref à jour quand fetchEcritures change
    useEffect(() => {
        fetchCreditRef.current = (silent = false, forceRefresh = false) =>
            fetchCredit(silent, forceRefresh);

    }, [fetchCredit]);


    // ref pour timer debounce WS
    const wsCoalesceRef = useRef(null);

    useEffect(() => {
        const handler = (payload) => {

            if (!payload || !payload.type || !payload.action) return;

            const rawType = String(payload.type).trim().toLowerCase();
            const rawAction = String(payload.action).trim().toLowerCase();

            // on ne traite que approuve & valide et annuler
            if (!["approuvecredit", "demandecredit", "validecredit", "annulercredit"].includes(rawType)) {
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
                fetchCreditRef.current?.(true, true);
                wsCoalesceRef.current = null;
            }, 300);
        };

        socket.on("new_data", handler);

        return () => {
            socket.off("new_data", handler);
            if (wsCoalesceRef.current) clearTimeout(wsCoalesceRef.current);
        };
    }, []);

    // ✅ A chaque navigation vers cette page → recharge les données
    useEffect(() => {
        if (location.state?.refresh) {
            fetchCredit(true, true);

            // Nettoyer le state pour éviter un fetch répété
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);
    useEffect(() => {
        document.title = "Liste des crédits"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'credits',
                name: 'Crédits'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    const ID_STATUTS_CREDIT = {
        ANNULE: 1,
        APPROUVE: 2,
        EN_ATTENTE_D_APPROBATION: 3,
        EN_COURS: 4,
        EN_RETARD: 5,
        REMBOURSE: 6,
        REMBOURSEMENT_PRECOCE: 7
    };
    const totalMontant = credits?.reduce((total, item) => {
        if (!item.statutscre || typeof item.statutscre.ID_STATUTS_CREDIT !== 'number') {
            return total;
        }
        if (
            item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.APPROUVE ||
            item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_RETARD ||
            item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.REMBOURSE ||
            item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_COURS
        ) {
            const Montant = parseFloat(item.MONTANT_DEMANDE) || 0;
            return total + Montant;
        }
        return total;
    }, 0)

    /**
* Permet Generer Pdf et excel
* @param {express.Request} req 
* @param {express.Response} res 
* @author Richard <richardngendakumana10@gmail.com>
* @date 03/07/2025
*/

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
    const exportPdf = () => {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();  // 297 mm en paysage
        const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm en paysage

        // 🖼️ En-tête
        doc.addImage(entete, "JPEG", 0, 0, 70, 25);

        // 🏷️ Titre centré
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Liste des crédits", pageWidth / 2, 30, { align: "center" });

        // 🕒 Date à droite
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
            align: "right",
        });

        // 📊 Colonnes
        const columns = [
            { header: "Réf Crédit", dataKey: "REFERENCE_CREDIT" },

            { header: "Approbateur", dataKey: "APPROBATEUR" },
            { header: "Membre", dataKey: "MEMBRE" },
            { header: "Montant", dataKey: "MONTANT_DEMANDE" },
            { header: "Durée", dataKey: "DUREE" },
            { header: "Intérêt", dataKey: "INTERET_TOTAL" },
            { header: "Commission", dataKey: "COMMISSION" },
            { header: "Sociale", dataKey: "CAISSE_SOCIALE" },
            { header: "D.Demande", dataKey: "DATE_DEMANDE" },
            { header: "Approbation", dataKey: "DATE_APPROBATION" },
            { header: "Échéance", dataKey: "DATE_ECHEANCE" },
        ];

        // 📄 Lignes
        const rows = credits.map((item) => ({
            REFERENCE_CREDIT: item.REFERENCE_CREDIT,

            APPROBATEUR: item.utilisateurapprouve?.USERNAME || "-",
            MEMBRE: item.membresmicro ? `${item.membresmicro.NOM} ${item.membresmicro.PRENOM}` : "-",
            MONTANT_DEMANDE: `${Number(item.MONTANT_DEMANDE || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            DUREE: `${item.DUREE} mois`,
            INTERET_TOTAL: `${Number(item.INTERET_TOTAL || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            COMMISSION: `${Number(item.COMMISSION || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            CAISSE_SOCIALE: `${Number(item.CAISSE_SOCIALE || 0).toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            DATE_DEMANDE: item.DATE_DEMANDE ? moment(item.DATE_DEMANDE).format("DD/MM/YYYY") : "-",
            DATE_APPROBATION: item.DATE_APPROBATION ? moment(item.DATE_APPROBATION).format("DD/MM/YYYY") : "-",
            DATE_ECHEANCE: item.DATE_ECHEANCE ? moment(item.DATE_ECHEANCE).format("DD/MM/YYYY") : "-",
        }));

        // 📋 Tableau
        doc.autoTable({
            columns,
            body: rows,
            startY: 40,
            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                overflow: 'linebreak',
                cellWidth: 'wrap', // ✅ Ajustement automatique
            },
            headStyles: {
                fillColor: [251, 140, 140],
                fontSize: 8
            },
            theme: "grid",
            pageBreak: 'auto',
            // ❌ Supprimer columnStyles pour permettre le wrap automatique
        });
        // ✅ Total du montant des crédits
        const finalY = doc.lastAutoTable.finalY || 0;
        const totalMontant = credits.reduce((acc, item) => acc + Number(item.MONTANT_DEMANDE || 0), 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
            `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
            pageWidth / 2,
            finalY + 8,
            { align: "center" }
        );




        const footerY = pageHeight - 25;

        // ➕ Ajouter nouvelle page si déborde
        if (finalY + 30 > footerY) {
            doc.addPage();
        }
        // ✍️ Signatures
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Effectué par : ${user.NOM} ${user.PRENOM} ....................................`, 10, footerY);
        doc.text("Approuvé par : ..................................", pageWidth / 2 + 10, footerY);

        // 💾 Téléchargement
        const filename = `credits_${moment().format("YYYYMMDD_HHmmss")}.pdf`;
        return doc.output("blob", filename);
    };

    const exportExcel = () => {
        const titre = "Liste des crédits";

        // Préparation des données, les montants sont en nombres purs (pas de string avec "Fbu")
        const data = credits.map((item, index) => ({
            "#": index + 1,
            "Réf Crédit": item.REFERENCE_CREDIT,
            "Caissier": item.utilisateur?.USERNAME || "-",
            "Validateur": item.utilisateurvalidee?.USERNAME || "-",
            "Approbateur": item.utilisateurapprouve?.USERNAME || "-",
            "Membre": item.membresmicro
                ? `${item.membresmicro.NOM} ${item.membresmicro.PRENOM}`
                : "-",
            "Montant": item.MONTANT_DEMANDE ? Number(item.MONTANT_DEMANDE) : 0,
            "Taux (%)": item.TAUX_INTERET ? Number(item.TAUX_INTERET) : 0,
            "Durée (mois)": item.DUREE ? Number(item.DUREE) : 0,
            "Intérêt": item.INTERET_TOTAL ? Number(item.INTERET_TOTAL) : 0,
            "Commission": item.COMMISSION ? Number(item.COMMISSION) : 0,
            "Sociale": item.CAISSE_SOCIALE ? Number(item.CAISSE_SOCIALE) : 0,
            "Statut": item.statutscre?.DESCRIPTION || "-",
            "Opération": item.typesopera?.NOM_OPERATION || "-",
            "Date Demande": item.DATE_DEMANDE ? moment(item.DATE_DEMANDE).format("DD/MM/YYYY") : "-",
            "Approbation": item.DATE_APPROBATION ? moment(item.DATE_APPROBATION).format("DD/MM/YYYY") : "-",
            "Échéance": item.DATE_ECHEANCE ? moment(item.DATE_ECHEANCE).format("DD/MM/YYYY") : ""
        }));

        // Création de la feuille
        const worksheet = XLSX.utils.json_to_sheet(data, { origin: 1 });

        // Fusion du titre sur toute la largeur (de A1 à Q1 par ex., ici 17 colonnes)
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }];
        XLSX.utils.sheet_add_aoa(worksheet, [[titre]], { origin: "A1" });

        // Largeur personnalisée colonnes (en caractères)
        worksheet["!cols"] = [
            { wch: 5 },  // #
            { wch: 15 }, // Réf Crédit
            { wch: 15 }, // Caissier
            { wch: 15 }, // Validateur
            { wch: 15 }, // Approbateur
            { wch: 20 }, // Membre
            { wch: 15 }, // Montant
            { wch: 10 }, // Taux
            { wch: 10 }, // Durée
            { wch: 15 }, // Intérêt
            { wch: 15 }, // Commission
            { wch: 15 }, // Sociale
            { wch: 20 }, // Statut
            { wch: 20 }, // Opération
            { wch: 15 }, // Date Demande
            { wch: 15 }, // Approbation
            { wch: 15 }  // Échéance
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
            { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Crédits");

        // Génération fichier et téléchargement
        XLSX.writeFile(workbook, `Credits_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
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
    const creditPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.CREDIT)
    const creditAcces = creditPermission && (creditPermission.CAN_READ || creditPermission.CAN_WRITE)
    // if (!creditAcces) {
    //     return <NotFound/>
    // }
    const deleteItems = async (itemsIds) => {
        try {
            setGloabalLoading(true);
            const form = new FormData();
            form.append("ids", JSON.stringify(itemsIds));
            const res = await fetchApi(`/credits/credits/Annuler/${itemsIds}`, {
                method: "POST",
                body: form,
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: "types operations comptables supprimé",
                    detail: "types operations comptables a été supprimé avec succès",
                    life: 3000,
                })
            );
            fetchCredit();
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

    const handleAnnulerItems = async (id, motif) => {
        try {
            const res = await fetchApi(`/credits/credits/annulercredits/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ motif }), // <--- ici on envoie le motif
            });
            dispacth(
                setToastAction({
                    severity: "success",
                    summary: 'Annuler du crédit ',
                    detail: "L'annulation du crédit a bien été fait avec succès",
                    life: 3000,
                })
            );
            fetchCredit()


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

    const handleAnnuler = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        let motif = ""; // variable pour stocker le texte du textarea

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Annuler le Credit ",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mb-3">
                        Veuillez saisir le motif d'annulation :
                    </div>
                    <textarea
                        className="p-inputtext p-component"
                        style={{ width: '100%', minHeight: '80px' }}
                        onChange={(e) => {
                            motif = e.target.value;
                        }}
                    />
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                if (!motif.trim()) {
                    dispacth(
                        setToastAction({
                            severity: "warn",
                            summary: "Erreur lors d'annulation",
                            detail: "Le motif d'annulation est obligatoire",
                            life: 3000,
                        })
                    );
                    return;
                }
                handleAnnulerItems(itemsIds, motif);
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
                            <h1 className="mb-3">Listes Des Credits :</h1>
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
                            <h1 className="mb-3">Crédits </h1 >
                            {/* {creditPermission && creditPermission.CAN_WRITE ? */}
                            {Ismembre === PROFILS.GERANT || ismembre === PROFILS.ADMIN_ADJOINT || ismembre === PROFILS.ADMIN
                                ? null : (
                                    <Button
                                        className="mt-3 ml-3 button-mobile"
                                        size="small"
                                        onClick={() => {
                                            navigate("/credits/add")

                                        }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                        </svg>
                                        <span className="ml-1" style={{ fontWeight: 'bold' }}>Nouveau</span>
                                    </Button>
                                )}

                            {/* : null} */}
                        </div >
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
                                        onInput={(e) => setlazyState((s) => ({ ...s, search: e.target.value }))}
                                    />
                                </div>
                                {Ismembre === 2 ? null : (
                                    <div className="d-flex flex-column mx-5">
                                        <Dropdown
                                            value={selectedMembre}
                                            onChange={(e) => membresSelected(e.value)}
                                            options={membredata}
                                            filter
                                            filterBy="name"
                                            optionLabel="name"
                                            placeholder="Membre"
                                            className="w-full md:w-10rem no-p"
                                            showClear
                                        />
                                    </div>)}



                                {/* Dropdown Status */}
                                <div className="d-flex flex-column mx-3">
                                    <Dropdown
                                        value={selectedstatus}
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


                                {/* Date début */}
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

                                <div className="d-flex flex-column mx-3">Montant Total
                                    <span className="badge bg-danger ml-2" style={{
                                        display: 'flex',
                                        alignItems: 'center', gap: '8px'
                                    }}>
                                        <span>{totalMontant.toLocaleString("fr-FR")} Fbu</span>
                                    </span>
                                </div>
                                {ismembre === 2 ? null : (
                                    <div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                                        <div
                                            onClick={() => {
                                                if (credits.length === 0) return;
                                                handleGeneraPDF();
                                            }}
                                            style={{
                                                background: "#143c8c",
                                                padding: "0.5rem 1rem",
                                                borderRadius: "5px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "white",
                                                cursor: credits.length === 0 ? "not-allowed" : "pointer",
                                                opacity: credits.length === 0 ? 0.6 : 1,
                                            }}
                                        >
                                            {/* Ton SVG ici */}
                                            PDF
                                        </div>

                                        <div
                                            onClick={() => {
                                                if (credits.length === 0) return;
                                                handleGeneraExcel();
                                            }}
                                            style={{
                                                background: "#143c8c",
                                                padding: "0.5rem 1rem",
                                                borderRadius: "5px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "white",
                                                cursor: credits.length === 0 ? "not-allowed" : "pointer",
                                                opacity: credits.length === 0 ? 0.6 : 1,
                                            }}
                                        >
                                            {/* Ton SVG ici */}
                                            XLS
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                                <DataTable
                                    lazy
                                    size={'small'}
                                    value={credits}
                                    // showGridlines
                                    tableStyle={{ minWidth: "50rem" }}
                                    className=""
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={` {first} à {last} dans ${totalRecords} éléments`}

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
                                    {ismembre === 2 ? null : (<Column
                                        field="IMAGE"
                                        header="Réf Crédit"
                                        sortable
                                        body={(item) => {
                                            const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                                            return (

                                                <>

                                                    <Link
                                                        id={`Nocmnde-${item.ID_OCTROI_CREDIT}`}
                                                        className="text-decoration-none d-flex round-indicator"
                                                        style={{ color: '#399af2' }}
                                                        to={`/credits/credits/${encodeId(item?.ID_OCTROI_CREDIT)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        data-pr-position="bottom"
                                                    >
                                                        <span>{item.REFERENCE_CREDIT}</span>
                                                    </Link>
                                                </>
                                            );
                                        }}
                                    />)}


                                    <Column
                                        field="IMAGE"
                                        header="Caissier"
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
                                        field="IMAGE"
                                        header="Validateur"
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.utilisateurvalidee ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.utilisateurvalidee?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateurvalidee.IMAGE ? (
                                                                    <Image
                                                                        src={item?.utilisateurvalidee?.IMAGE}
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
                                                                        {item?.utilisateurvalidee?.NOM.charAt(0)}{item?.utilisateurvalidee?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2 mt-1">
                                                                    <div className="font-bold">
                                                                        {item?.utilisateurvalidee?.USERNAME}
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
                                        header="Approbateur"
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.utilisateurapprouve ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.utilisateurapprouve?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateurapprouve.IMAGE ? (
                                                                    <Image
                                                                        src={item?.utilisateurapprouve?.IMAGE}
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
                                                                        {item?.utilisateurapprouve?.NOM.charAt(0)}{item?.utilisateurapprouve?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2 mt-1">
                                                                    <div className="font-bold">
                                                                        {item?.utilisateurapprouve?.USERNAME}
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
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.membresmicro ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.membresmicro?.ID_UTILISATEUR)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.membresmicro.IMAGE ? (
                                                                    <Image
                                                                        src={item?.membresmicro?.IMAGE}
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
                                                                        {item?.membresmicro?.NOM.charAt(0)}{item?.membresmicro?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2 mt-1">
                                                                    <div className="font-bold">
                                                                        {item?.membresmicro?.USERNAME}
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
                                        field="MONTANT_DEMANDE"
                                        header="Montant"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>{item.MONTANT_DEMANDE ? parseInt(item.MONTANT_DEMANDE).toLocaleString('fr-FR') : 0} Fbu</span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="STATUT "
                                        header="Statut"
                                        sortable
                                        body={(item) => {
                                            return (
                                                item.statutscre ?
                                                    <Button className="btn-sm"
                                                        data-pr-tooltip={item.statutscre ? item.statutscre?.DESCRIPTION : item.statutscre?.ID_STATUTS_CREDIT === 1 ? item?.MOTIF : "-"}
                                                        tooltip tooltipOptions={{ position: 'top' }}
                                                        style={{
                                                            width: 30, height: 30, backgroundColor: statutCreditsColor(
                                                                item.statutscre.ID_STATUTS_CREDIT).backgroundColor,
                                                            color: statutCreditsColor(item.statutscre.ID_STATUTS_CREDIT
                                                            ).textColor, border: "none"
                                                        }}
                                                        icon={options => {
                                                            return <span className="mb-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: statutCreditsColor(
                                                                        item.statutscre.ID_STATUTS_CREDIT).icon
                                                                }} />
                                                        }} />
                                                    : '-'
                                            );


                                        }}
                                    />
                                    <Column
                                        field="DESCRIPTION"
                                        header="Voir Tous"
                                        sortable
                                        body={(item) => (
                                            <span
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setSelectedItem(item); // stocke le texte
                                                    setDescriptionVisible(true);           // affiche le modal
                                                }}
                                                title="Voir la description complète"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="25"
                                                    height="25"
                                                    fill="red"
                                                    className="bi bi-eye text-secondary"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 
          5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 
          1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                                </svg>
                                            </span>
                                        )}
                                    />
                                    {ismembre === PROFILS.ADMIN || PROFILS.GERANT
                                        ?
                                        (<Column
                                            field=""
                                            header=""
                                            alignFrozen="right"
                                            frozen
                                            body={(item) => {
                                                if (item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.ANNULE ||
                                                    item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_ATTENTE_D_APPROBATION ||
                                                    item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.REMBOURSEMENT_PRECOCE
                                                    || item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_COURS ||
                                                    item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_RETARD ||
                                                    item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.REMBOURSE ||
                                                    ismembre === PROFILS.ADMIN_ADJOINT || ismembre === PROFILS.MEMBRE
                                                ) return null;
                                                const items = [
                                                    {
                                                        template: (deleteItem, options) => {
                                                            return (
                                                                <a
                                                                    href="#"
                                                                    className="p-menuitem-link text-danger"
                                                                    onClick={(e) =>
                                                                        handleAnnuler(e, [
                                                                            inViewMenuItem.ID_OCTROI_CREDIT,
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
                                                                        Annuller
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
                                                            viewportHeight={50}
                                                            menuWidth={200}
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
                                                                setDetail_users(item)
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
                                        />) : null
                                    }


                                </DataTable>
                                {/* Dialog pour la description */}
                                <Dialog
                                    header="Description complète"
                                    visible={descriptionVisible}
                                    style={{ width: '70vw' }}
                                    modal
                                    onHide={() => setDescriptionVisible(false)}

                                >
                                    {selectedItem && (
                                        <DataTable
                                            value={[selectedItem]}
                                            responsiveLayout="scroll"
                                            style={{ width: "100%", fontSize: "1.1rem" }} // largeur + taille texte
                                            scrollable
                                            scrollHeight="400px" // hauteur du tableau
                                        >

                                            <Column
                                                field="INTERET_TOTAL"
                                                header="Interet total"
                                                body={(item) =>
                                                    item.INTERET_TOTAL
                                                        ? parseInt(item.INTERET_TOTAL).toLocaleString("fr-FR") + " Fbu"
                                                        : "0 Fbu"
                                                }
                                                style={{ minWidth: "120px", padding: "10px" }}
                                            />
                                            <Column
                                                field="TAUX_INTERET"
                                                header="Taux"
                                                body={(item) =>
                                                    item.TAUX_INTERET
                                                        ? parseInt(item.TAUX_INTERET).toLocaleString("fr-FR") + " %"
                                                        : "0 %"
                                                }
                                                style={{ minWidth: "100px", padding: "10px" }}
                                            />
                                            <Column
                                                field="DUREE"
                                                header="Durée"
                                                body={(item) => (item.DUREE ? item.DUREE + " mois" : "-")}
                                                style={{ minWidth: "100px", padding: "10px" }}
                                            />

                                            <Column
                                                field="CAISSE_SOCIALE"
                                                header="Sociale"
                                                body={(item) =>
                                                    item.CAISSE_SOCIALE
                                                        ? parseInt(item.CAISSE_SOCIALE).toLocaleString("fr-FR") + " Fbu"
                                                        : "0 Fbu"
                                                }
                                                style={{ minWidth: "120px", padding: "10px" }}
                                            />
                                            <Column
                                                field="COMMISSION"
                                                header="Commission"
                                                sortable
                                                body={(item) => {
                                                    return (
                                                        <span>{item.COMMISSION ? parseInt(item.COMMISSION).toLocaleString('fr-FR') : 0} Fbu</span>
                                                    );
                                                }}
                                            />

                                            <Column
                                                field="NOM_OPERATION"
                                                frozen
                                                header="Opération"
                                                sortable
                                                body={(item) => (
                                                    <span>
                                                        {item?.typesopera?.NOM_OPERATION || "-"}
                                                    </span>
                                                )}
                                            />

                                            <Column
                                                field="DATE_DEMANDE "
                                                header="Date "
                                                sortable
                                                body={(item) => {
                                                    return moment(item.DATE_DEMANDE).format("DD/MM/YYYY");

                                                }}
                                            />
                                            <Column
                                                field="DATE_APPROBATION"
                                                header="Approbation"
                                                sortable
                                                body={(item) =>
                                                    item.DATE_APPROBATION ? moment(item.DATE_APPROBATION).format("DD/MM/YYYY")
                                                        : "-"
                                                }
                                            />
                                            <Column
                                                field="DATE_ECHEANCE "
                                                header="Echéance"
                                                sortable
                                                body={(item) => {
                                                    return moment(item.DATE_ECHEANCE).format("DD/MM/YYYY");

                                                }}
                                            />
                                        </DataTable>
                                    )}


                                </Dialog>

                            </div>
                        </div >
                    </>)}
                {/* Boutons de génération */}

            </div >
            <Outlet />
            {/* </>
            )
            } */}

        </>
    );
}