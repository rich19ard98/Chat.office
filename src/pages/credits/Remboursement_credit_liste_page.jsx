
import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
// import { administration_routes_items } from "../../routes/admin/administration_routes";
import { welcome_routes_items } from "../../routes/welcome/welcome_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import { io } from "socket.io-client";
// Remboursement_credit_list_page.jsx
import { useLocation } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import jsPDF from "jspdf";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { decodeId } from "../../utils/IdEncryption";
import LZString from "lz-string";
import { useParams } from "react-router-dom";
import "jspdf-autotable";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import autoTable from "jspdf-autotable";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { encodeId } from "../../utils/IdEncryption";
import { Dropdown } from "primereact/dropdown";
import entete from "../../../public/images/nodebu.png";
import { openDB } from "../../services/indexedDB"; // À créer si pas encore
import modePaiementDetailColor from "../../helpers/modePaiementRemboursementColor";
import Remboursement_credit_add_page from "./Remboursement_credit_add_page";
import { userSelector } from "../../store/selectors/userSelector";
import IDS_ROLES from "../../constants/IDS_ROLES";
import PROFILS from "../../constants/PROFILS";
import socket from "../../utils/socket";
import NotFound from "../home/NotFound";
import statutAmortissementsColor from "../../helpers/statutAmortissementsColor";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import statutRemboursementColor from "../../helpers/statutRemboursementColor";
import STATUT_REMBOURESEMENT from "../../constants/STATUT_REMBOURESEMENT";
export default function Remboursement_credit_liste_page() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useSelector(userSelector);
  const location = useLocation();
  const [allRemboursements, setAllRemboursements] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [remboursement_credit, setRemboursement_credit] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dates, setDates] = useState(null);
  const [statut, setstatut] = useState(null);
  const { ID_REMBOURSEMENT_CREDIT: encodedId } = useParams();
  const ID_REMBOURSEMENT_CREDIT = decodeId(encodedId); // Décoder pour obtenir l'ID réel
  const [modeBackend, setModeBackend] = useState(true); // 👉 toggle ici

  const [totalMontant, settotalMontant] = useState(0);
  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [visibleStatut, setVisibleStatut] = useState(false);
  const navigate = useNavigate();
  const [utilisateurdata, setutilisateurdata] = useState([]);

  const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
  const [selectedCaissier, setSelectedCaissier] = useState(null);

  const [selectedMembres, setselectedMembres] = useState(null);
  const [selectedmembresdata, setselectedmembresdata] = useState([]);
  const ismembre = user.ID_PROFIL
  const IsAdmin = user.ID_PROFIL === PROFILS.ADMIN
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
  const statusSelected = (status) => {
    setstatut(status);
  };
  const dispacth = useDispatch();
  const handleVisibility = (e) => {
    setIsVisible(!isVisible);
  };
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

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAll = event.checked;

    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(remboursement_credit);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };
  const utilisateursSelected = (utilisateur) => {
    setSelectedUtilisateur(utilisateur);
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
                {inViewMenuItem?.MONTANT_CAPITAL}
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

  const fetchUtilisateurs = useCallback(async () => {
    try {
      // Construction de l'URL avec les deux profils (caissiers et membres)
      const url = `/administration/utilisateurs/fetch?rows=100000&selectedCaissier=${PROFILS.CAISSIER},${PROFILS.ADMIN}`;

      // const url = `/administration/utilisateurs/fetch?rows=100000&selectedCaissier=${PROFILS.CAISSIER}`
      // Appel de l'API
      const res = await fetchApi(url);
      console.log(res);

      // Vérification des données reçues
      const data = res.result?.data || [];

      // Formatage des utilisateurs classiques (caissiers)
      const formatted = data.map((util) => ({
        name: `${util.NOM} ${util.PRENOM}`,
        code: util.ID_UTILISATEUR // Doit être unique, utilisé comme valeur de sélection
      }));


      // Mise à jour des états
      setutilisateurdata(formatted);


    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
  }, [selectedCaissier]);

  useEffect(() => {
    fetchUtilisateurs();
  }, [selectedCaissier]);
  const fetchUtilisateursmembres = useCallback(async () => {
    try {
      // Construction de l'URL avec les deux profils (caissiers et membres)
      const url = `/administration/utilisateurs/fetch?rows=100000&selectedMembres=${PROFILS.MEMBRE}`;

      // Appel de l'API
      const res = await fetchApi(url);

      // Vérification des données reçues
      const data = res.result?.data || [];
      // Formatage des membres liés aux crédits (assurez-vous que la relation existe dans les données)
      const membres = data
        .filter((util) => util.membre) // S'assurer que la relation existe
        .map((util) => ({
          name: `${util?.membre?.NOM} ${util.membre?.PRENOM}`,
          code: util.ID_UTILISATEUR
        }));
      // Mise à jour des états
      setselectedmembresdata(membres);



    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
  }, []);

  useEffect(() => {
    fetchUtilisateursmembres();
  }, []);




  const CACHE_NAME = "RemboursementsCache";



  const paginate = (data) => {
    const start = lazyState.first || 0;
    const end = start + (lazyState.rows || 10);
    return data.slice(start, end);
  };

  const buildCacheKey = () => {
    return `${CACHE_NAME}?${new URLSearchParams({
      ...lazyState,
      caissier: selectedCaissier || "",
      membre: selectedMembres || "",
      statut: statut?.code || "",
      startDate: dates?.[0]?.toISOString() || "",
      endDate: dates?.[1]?.toISOString() || "",
      remboursementId: ID_REMBOURSEMENT_CREDIT || "",
    }).toString()}`;
  };

  // const fetchRemboursement_credit = useCallback(async (silent = false, forceRefresh = false) => {
  //   try {
  //     if (!silent) setLoading(true);

  //     let baseurl = `/credits/remboursement_credit/fetch?rows=1000000&`;
  //     let url = baseurl;

  //     for (let key in lazyState) {
  //       const value = lazyState[key];
  //       if (value) {
  //         url += `${key}=${encodeURIComponent(
  //           typeof value === "object" ? JSON.stringify(value) : value
  //         )}&`;
  //       }
  //     }

  //     if (dates) {
  //       const [startDate, endDate] = dates;
  //       if (startDate) url += `startDate=${startDate.toISOString()}&`;
  //       if (endDate) url += `endDate=${endDate.toISOString()}&`;
  //     }
  //     if (selectedCaissier) url += `selectedCaissier=${selectedCaissier}&`;
  //     if (selectedMembres) url += `selectedMembres=${selectedMembres}&`;
  //     if (statut?.code != null) url += `statut=${statut.code}&`;
  //     if (ID_REMBOURSEMENT_CREDIT) url += `ID_REMBOURSEMENT_CREDIT=${ID_REMBOURSEMENT_CREDIT}&`;

  //     // 🌐 Fetch API
  //     const res = await fetchApi(url);
  //     const allData = res.result.data || [];

  //     const totalMontant = allData.reduce(
  //       (sum, c) => sum + parseFloat(c.MONTANT_CAPITAL || 0),
  //       0
  //     );

  //     setAllRemboursements(allData);
  //     setRemboursement_credit(allData); // 👉 direct sans filtre local
  //     setTotalRecords(res.result.totalRecords || allData.length);
  //     settotalMontant(totalMontant);

  //     // 💾 Sauvegarde cache compressé
  //     const compressed = LZString.compressToUTF16(
  //       JSON.stringify({
  //         data: allData,
  //         totalMontant,
  //         totalRecords: res.result.totalRecords,
  //         expiresAt: Date.now() + 120000, // 2 minutes
  //       })
  //     );
  //     const response = new Response(compressed, {
  //       headers: { "Content-Type": "text/plain" },
  //     });
  //     const cache = await caches.open(CACHE_NAME);
  //     await cache.put(buildCacheKey(), response);
  //   } catch (error) {
  //     console.error("Erreur fetchRemboursement_credit", error);
  //   } finally {
  //     if (!silent) setLoading(true);
  //   }
  // }, [lazyState, dates, selectedCaissier, selectedMembres, statut, ID_REMBOURSEMENT_CREDIT]);
  const fetchRemboursement_credit = useCallback(
    async (silent = false, forceRefresh = false) => {
      try {
        if (!silent) setLoading(true);

        const cache = await caches.open(CACHE_NAME);
        const cacheKey = buildCacheKey();

        // 🔹 si pas forceRefresh, tenter de charger depuis cache
        if (!forceRefresh) {
          const cachedResponse = await cache.match(cacheKey);
          if (cachedResponse) {
            const compressed = await cachedResponse.text();
            const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

            if (Date.now() <= parsed.expiresAt) {
              console.log("✅ Chargé depuis cache");
              setAllRemboursements(parsed.data);
              setRemboursement_credit(parsed.data);
              setTotalRecords(parsed.totalRecords);
              settotalMontant(parsed.totalMontant);
              return; // ⚡ on ne fait pas fetch API
            } else {
              await cache.delete(cacheKey); // cache expiré
            }
          }
        }

        // 🔹 sinon fetch API
        let url = `/credits/remboursement_credit/fetch?rows=1000000&`;

        // lazyState params
        for (let key in lazyState) {
          const value = lazyState[key];
          if (value) {
            url += `${key}=${encodeURIComponent(
              typeof value === "object" ? JSON.stringify(value) : value
            )}&`;
          }
        }

        // Dates
        if (dates) {
          const [startDate, endDate] = dates;
          if (startDate) url += `startDate=${startDate.toISOString()}&`;
          if (endDate) url += `endDate=${endDate.toISOString()}&`;
        }

        // Sélections
        if (selectedCaissier) url += `selectedCaissier=${encodeURIComponent(selectedCaissier)}&`;
        if (selectedMembres) url += `selectedMembres=${encodeURIComponent(selectedMembres)}&`;
        if (statut?.code != null) url += `statut=${encodeURIComponent(statut.code)}&`;
        if (ID_REMBOURSEMENT_CREDIT) url += `ID_REMBOURSEMENT_CREDIT=${encodeURIComponent(ID_REMBOURSEMENT_CREDIT)}&`;

        // Fetch API
        const res = await fetchApi(url);

        const allData = res.result.data || [];
        const AllPenalites = res.result.Penalites

        const totalMontant = allData
          .filter(c => c.STATUT === 0) // ou "reussi" selon ta valeur réelle
          .reduce((sum, c) => sum + parseFloat(c.MONTANT_CAPITAL || 0), 0);
        const totalPenalites = allData.filter(c => c.STATUT === 0)

        setAllRemboursements(allData);
        setRemboursement_credit(allData);
        setTotalRecords(res.result.totalRecords || allData.length);
        settotalMontant(totalMontant);

        // 💾 Sauvegarde cache compressé
        const compressed = LZString.compressToUTF16(
          JSON.stringify({
            data: allData,
            totalMontant,
            totalRecords: res.result.totalRecords,
            expiresAt: Date.now() + 120000, // 2 minutes
          })
        );
        const response = new Response(compressed, {
          headers: { "Content-Type": "text/plain" },
        });
        await cache.put(cacheKey, response);
      } catch (error) {
        console.error("Erreur fetchRemboursement_credit", error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [lazyState, dates, selectedCaissier, selectedMembres, statut, ID_REMBOURSEMENT_CREDIT]
  );


  const loadFromCache = async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(buildCacheKey());

    if (cachedResponse) {
      try {
        const compressed = await cachedResponse.text();
        const parsed = JSON.parse(LZString.decompressFromUTF16(compressed));

        if (Date.now() <= parsed.expiresAt) {
          setAllRemboursements(parsed.data);
          setRemboursement_credit(parsed.data); // 👉 direct
          setTotalRecords(parsed.totalRecords || parsed.data.length);
          settotalMontant(parsed.totalMontant || 0);

          setLoading(false);
          return true;
        } else {
          await cache.delete(buildCacheKey());
        }
      } catch (e) {
        console.warn("Cache remboursement corrompu, suppression", e);
        await cache.delete(buildCacheKey());
      }
    }
    return false;
  };


  useEffect(() => {
    const init = async () => {
      const hasCache = await loadFromCache();
      if (!hasCache) {
        // 👉 que si pas de cache on montre loading et on fetch API
        await fetchRemboursement_credit();
      }
      else {
        console.log('🚀 si cache trouvé → couper le loading');

        // 🚀 si cache trouvé → couper le loading
        setLoading(false);
      }
    };
    init();

    const interval = setInterval(() => fetchRemboursement_credit(true, true), 120000);
    return () => clearInterval(interval);
  }, [lazyState, dates, selectedCaissier, selectedMembres, statut, ID_REMBOURSEMENT_CREDIT]);
  // Ref pour les écritures
  // --- ref qui pointe toujours sur la dernière version de fetchEcritures
  const fetchRemboursement_creditRef = useRef((silent = false, forceRefresh = false) => { });
  // garde la ref à jour quand fetchEcritures change
  useEffect(() => {
    fetchRemboursement_creditRef.current = (silent = false, forceRefresh = false) =>
      fetchRemboursement_credit(silent, forceRefresh);

  }, [fetchRemboursement_credit]);


  // ref pour timer debounce WS
  const wsCoalesceRef = useRef(null);

  useEffect(() => {
    const handler = (payload) => {

      if (!payload || !payload.type || !payload.action) return;

      const rawType = String(payload.type).trim().toLowerCase();
      const rawAction = String(payload.action).trim().toLowerCase();

      // on ne traite que approuve & valide et annuler
      if (!["remboursementprecoce", "remboursement"].includes(rawType)) {
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
        fetchRemboursement_creditRef.current?.(true, true);
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
    if (location.state?.refresh) {
      fetchRemboursement_credit(true, true);

      // Nettoyer le state pour éviter un fetch répété
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  useEffect(() => {
    document.title = "Remboursement crédits"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Remboursement_credit',
        name: 'Remboursement crédits'
      }
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  const renderModePaiement = (item) => {
    const mapping = {
      0: "Espèce",
      1: "Virement",
      2: "Versement",
    };
    return mapping[item?.MODE_PAIEMENT] || "Inconnu";
  };
  /**
* Permet Generer Pdf et excel
 * @param {express.Request} req 
* @param {express.Response} res 
* @author Richard <richardngendakumana10@gmail.com>
* @date 03/07/2025
*/

  const generatePdfDocument = (doc, remboursement_credit) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    const formatMontant = (val) =>
      `${parseFloat(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Fbu`;

    // 1. Titre et logo (ton image entête est appelée 'entete' ici)
    doc.addImage(entete, "PNG", 10, 10, 30, 20);
    doc.setFontSize(14);
    doc.text("LISTE DES REMBOURSEMENTS DE CRÉDIT", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(`Généré le : ${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
      align: "right",
    });

    // 2. Contenu du tableau
    const columns = [
      { header: "#", dataKey: "index" },
      { header: "Ref Crédit", dataKey: "credit" },
      { header: "Ref Remboursement", dataKey: "remb" },
      { header: "Montant", dataKey: "montant" },
      { header: "Caissier", dataKey: "caissier" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Date", dataKey: "date" },
    ];

    const rows = remboursement_credit.map((item, idx) => ({
      index: idx + 1,
      credit: item?.Credits?.REFERENCE_CREDIT || "-",
      remb: item?.REFERENCE_REMBOURSEMENT || "-",
      montant: formatMontant(item?.MONTANT_CAPITAL || 0),
      caissier: item?.utilisateur?.USERNAME || "-",
      type: item?.Types_operations_comptables?.NOM_OPERATION || "-",
      mode:
        item.MODE_PAIEMENT === 0
          ? "Espèce"
          : item.MODE_PAIEMENT === 1
            ? "Virement"
            : "Versement",
      date: moment(item.DATE_ENREGISTREMENT).format("DD/MM/YYYY HH:mm"),

    }));

    doc.autoTable({
      startY: 35,
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [251, 140, 140], textColor: 255 },
    });

    // 3. Totaux
    const totalCapital = remboursement_credit.reduce(
      (acc, item) => acc + parseFloat(item.MONTANT_CAPITAL || 0),
      0
    );

    const afterTableY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text(
      `Total capital remboursé : ${formatMontant(totalCapital)}`,
      pageWidth - 10,
      afterTableY,
      { align: "right" }
    );

    // 4. Signatures
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Effectué par............... ${remboursement_credit?.utilisateur?.NOM}`, 20, afterTableY + 100);
    doc.text("Approuvé par...................", pageWidth - 60, afterTableY + 100);



    // 5. Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Microfinance App - Exportation PDF", pageWidth / 2, 290, {
      align: "center",
    });


    return doc.output("blob", "Remboursements");
  };
  const exportPdf = () => {
    //const pageWidth = 210; // 📄 Largeur d'une page A4 en mm
    const pageHeight = 297; // 📄 Hauteur d'une page A4 en mm
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.addImage(entete, "JPEG", 0, 0, 70, 30);
    // Titre principal
    doc.setFontSize(15);
    doc.text("Liste des remboursements", 70, 30);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(`${moment().format("DD/MM/YYYY HH:mm")}`, pageWidth - 10, 10, {
      align: "right",
    });
    // Préparation des colonnes et des données
    // 2. Contenu du tableau Credits.membresmicro
    const columns = [
      { header: "#", dataKey: "index" },
      { header: "Ref Crédit", dataKey: "credit" },
      { header: "Ref Remboursement", dataKey: "remb" },
      { header: "Membre", dataKey: "Membre" },
      { header: "Montant", dataKey: "montant" },
      { header: "Caissier", dataKey: "caissier" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Date", dataKey: "date" },
    ];


    const rows = remboursement_credit.map((item, idx) => ({
      index: idx + 1,
      credit: item?.Credits?.REFERENCE_CREDIT || "-",
      remb: item?.REFERENCE_REMBOURSEMENT || "-",
      Membre: item.Credits.membresmicro ? `${item.Credits.membresmicro.NOM} ${item.Credits.membresmicro.PRENOM}` : "-",
      montant: Number(item?.MONTANT_CAPITAL || 0),
      caissier: item?.utilisateur?.USERNAME || "-",
      type: item?.Types_operations_comptables?.NOM_OPERATION || "-",
      mode:
        item.MODE_PAIEMENT === 0
          ? "Espèce"
          : item.MODE_PAIEMENT === 1
            ? "Virement"
            : "Versement",
      date: moment(item.DATE_ENREGISTREMENT).format("DD/MM/YYYY HH:mm"),

    }));
    autoTable(doc, {
      columns,
      body: rows,
      startY: 40,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [251, 140, 140],
        fontSize: 8,
      },
      theme: "grid",
      pageBreak: "auto",
      margin: { top: 40 }, // ✅ espace pour l'en-tête
      didDrawPage: (data) => {
        //addHeader();

        // --- ✅ FILIGRANE NODEBU ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.3 })); // ✅ Plus discret
        doc.setFont("helvetica", "bold");
        doc.setFontSize(70);
        doc.setTextColor(200);
        doc.text("NODEBU", pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 30,
        });
        doc.restoreGraphicsState();
      },
    });


    // 🔽 Récupérer la position finale du tableau
    let finalY = doc.autoTable.previous.finalY || 0;
    const totalMontant = remboursement_credit
      .filter(item => item.STATUT === 0) // ou 'reussi' selon ta base
      .reduce((acc, item) => acc + Number(item.MONTANT_CAPITAL || 0), 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Montant total : ${totalMontant.toLocaleString("fr-FR").replace(/\s/g, " ")} Fbu`,
      pageWidth / 2,
      finalY + 8,
      { align: "center" }
    );
    const footerY = doc.internal.pageSize.height - 20; // 20 unités au-dessus du bas de la page

    // ➕ Ajouter une nouvelle page si trop bas
    if (finalY + 20 > footerY) {
      doc.addPage();
      finalY = 20; // Remet le curseur plus haut pour la nouvelle page
    }

    const signatureY = finalY + 10;
    // ✍️ Signatures
    const utilisateur = `${user.NOM} ${user.PRENOM}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Effectué par : ${utilisateur} ....................................`, 10, footerY);
    doc.text("Approuvé par : ..................................", pageWidth / 2 + 10, footerY);
    const filename = `Remboursemetnts-${moment().format("YYYYMMDD_HHmmss")}.pdf`;
    return doc.output("blob", filename);
  };
  const HandleexportPdf = (itemsIds) => {
    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF.default("p", "mm", "a4");

        const filteredData = Array.isArray(itemsIds)
          ? remboursement_credit.filter(item => itemsIds.includes(item.ID_REMBOURSEMENT))
          : remboursement_credit;

        confirmDialog({
          headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
          headerClassName: "text-black",
          header: "Générer Document PDF",
          message: (
            <div className="d-flex flex-column align-items-center">
              <div className="text-center mt-5">
                Voulez-vous vraiment générer le document PDF ?
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
      });
    });
  };




  const ExportExcelRemboursement = () => {
    const titre = "Listes des Remboursments"
    const rows = remboursement_credit.map(item => ({
      "Référence Crédit": item?.Credits?.REFERENCE_CREDIT || "-",
      "Référence Remboursement": item?.REFERENCE_REMBOURSEMENT || "-",
      "Membre": item.Credits.membresmicro ? `${item.Credits.membresmicro.NOM}
       ${item.Credits.membresmicro.PRENOM}` : "-",
      "Montant Remboursé": parseFloat(item?.MONTANT_CAPITAL || 0), // 🔹 Garder en nombre
      "Caissier": item?.utilisateur?.USERNAME || "-",
      "Type Opération": item?.Types_operations_comptables?.NOM_OPERATION || "-",
      "Mode Paiement":
        item.MODE_PAIEMENT === 0
          ? "Espèce"
          : item.MODE_PAIEMENT === 1
            ? "Virement"
            : "Versement",
      "Date Enregistrement": moment(item.DATE_ENREGISTREMENT).format("DD/MM/YYYY HH:mm"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { origin: "A2" });

    // Ajouter un titre dans A1
    XLSX.utils.sheet_add_aoa(worksheet, [[titre]], { origin: "A1" });

    // Largeurs colonnes
    worksheet["!cols"] = [
      { wch: 20 }, { wch: 25 }, { wch: 18 },
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 }
    ];

    // Fusion pour le titre sur toute la ligne
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // A1:G1
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
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
    ];
    // 🎨 Style titre (A1)
    worksheet["A1"].s = {
      font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "FF6384" } }
    };
    // Ajout de format numérique à la colonne "Montant Remboursé"
    const montantColIndex = 2; // 0-based (C)
    for (let i = 0; i < rows.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: i + 2, c: montantColIndex }); // A2 = r:1, c:0
      if (!worksheet[cellRef]) continue;
      worksheet[cellRef].t = 'n'; // type number
      worksheet[cellRef].z = '#,##0.00'; // format Excel
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Remboursements");

    const filename = `remboursements_credit_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }


  const HandlexportExcel = (itemsIds) => {
    const titre = "Liste des échéances de la semaine en cours";

    import("xlsx").then(XLSX => {
      const filteredData = Array.isArray(itemsIds)
        ? remboursement_credit.filter(item => itemsIds.includes(item.ID_REMBOURSEMENT))
        : remboursement_credit;

      confirmDialog({
        headerStyle: { backgroundColor: '#c5e8ec', backgroundSize: 'cover' },
        headerClassName: "text-black",
        header: "Générer Fichier Excel",
        message: (
          <div className="d-flex flex-column align-items-center">
            <div className="text-center mt-5">
              Voulez-vous vraiment générer le fichier Excel ?
            </div>
          </div>
        ),
        acceptClassName: "p-button-danger",
        acceptLabel: "Oui",
        rejectLabel: "Non",
        accept: () => {
          ExportExcelRemboursement()
        }
      });
    });
  };

  const creditPermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.CREDIT)
  const creditAcces = creditPermission && (creditPermission.CAN_READ || creditPermission.CAN_WRITE)
  // if (!creditAcces) {
  //   return <NotFound />
  // }


  const handleAnnulerItems = async (id, motif) => {
    try {
      const res = await fetchApi(`/credits/remboursement_credit/detele_remboursement_credit/${id}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motif }), // <--- ici on envoie le motif
      });

      dispacth(
        setToastAction({
          severity: "success",
          summary: 'Annulation du remboursement',
          detail: "L'annulation d'un remboursement a bien été faite",
          life: 3000,
        })
      );
      fetchRemboursement_credit();

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
      header: "Annuler le Remboursement",
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

  const [statutRemboursement, setstatutRemboursement] = useState([
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
              <h1 className="mb-3">Liste des remboursements :</h1>
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
              <h1 className="mb-3">Remboursement</h1>
              {IsAdmin 
                //creditPermission && creditPermission.CAN_WRITE

                ? null :
                <Button
                  label="Nouveau"
                  icon="pi pi-plus"
                  size="small"

                  onClick={() => {
                    navigate("/remboursement_credit/add");
                  }}
                />
                }
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

                    onInput={(e) =>
                      setlazyState((s) => ({ ...s, search: e.target.value }))
                    }
                  />
                </div>
                {ismembre === 2 ? null : (
                  <>
                    {/* Dropdown caissier */}
                    <div className="d-flex flex-column mx-1">
                      <Dropdown
                        value={selectedCaissier} // 👈 Doit être un ID
                        options={utilisateurdata}
                        optionLabel="name"
                        optionValue="code" // 👈 Important : ici, "code" = ID_UTILISATEUR
                        placeholder="Sélectionner un caissier"
                        onChange={(e) => setSelectedCaissier(e.value)} // 👈 .value doit être un ID
                        showClear
                        filter
                        style={{ minWidth: 150 }}
                      />
                    </div>
                    <div className="d-flex flex-column mx-2">
                      <Dropdown
                        value={selectedMembres} // 👈 Doit être un ID
                        options={selectedmembresdata}
                        optionLabel="name"
                        optionValue="code" // 👈 Important : ici, "code" = ID_UTILISATEUR
                        placeholder="Sélectionner un Membre"
                        onChange={(e) => setselectedMembres(e.value)

                        } // 👈 .value doit être un ID
                        showClear
                        filter
                        style={{ minWidth: 200 }}
                      />


                    </div>
                  </>
                )}


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
                    className="w-full md:w-10rem no-p"
                    style={{ minWidth: 200 }}
                  />
                </div>
                <div className="d-flex flex-column mx-1">
                  <Dropdown
                    value={statut}
                    onChange={(e) => statusSelected(e.value)}
                    options={statutRemboursement}
                    filter
                    filterBy="name"
                    optionLabel="name"
                    placeholder="Statut"
                    className="w-full md:w-10rem mx-1 no-p"
                    showClear
                  />
                </div>
                <div className="d-flex  flex-column mx-3">Montant Total
                  <span className="badge bg-danger  ml-2" style={{
                    display: 'flex',
                    alignItems: 'center', gap: '8px'
                  }}>
                    <span>{totalMontant ? totalMontant.toLocaleString("fr-FR") : 0} Fbu</span>
                  </span>
                </div>
              </div>
              {ismembre === 2 ? null : (
                <div className="flex bg-white align-items-center ml-5 justify-content-end gap-5">

                  <div
                    onClick={() => {
                      if (remboursement_credit.length === 0) return;
                      HandleexportPdf();
                    }}
                    style={{
                      background: "#143c8c",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "white",
                      cursor: remboursement_credit.length === 0 ? "not-allowed" : "pointer",
                      opacity: remboursement_credit.length === 0 ? 0.6 : 1,
                    }}
                  >
                    {/* Ton SVG ici */}
                    PDF
                  </div>

                  <div
                    onClick={() => {
                      if (remboursement_credit.length === 0) return;
                      HandlexportExcel();
                    }}
                    style={{
                      background: "#143c8c",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      display: "inline-flex",
                      alignItems: "center",
                      color: "white",
                      cursor: remboursement_credit.length === 0 ? "not-allowed" : "pointer",
                      opacity: remboursement_credit.length === 0 ? 0.6 : 1,
                    }}
                  >
                    {/* Ton SVG ici */}
                    XLS
                  </div>
                </div>
              )}

            </div>
            <div className="content">
              <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                <DataTable
                  lazy
                  value={remboursement_credit}
                  tableStyle={{ minWidth: "50rem" }}
                  className=""
                  paginator
                  size="small"
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 500, 1000]}
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
                  <Column
                    field="IMAGE"
                    header="Ref Credits"
                    frozen
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
                            to={`/credits/credits/${encodeId(item?.Credits?.ID_OCTROI_CREDIT)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            data-pr-position="bottom"
                          >
                            <span>{item?.Credits?.REFERENCE_CREDIT}</span>
                          </Link>
                        </>
                      );
                    }}
                  />
                  <Column
                    field="IMAGE"
                    header="Ref Remboursment"
                    frozen
                    sortable
                    body={(item) => {
                      const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                      return (

                        <>

                          <Link
                            id={`Nocmnde-${item.ID_REMBOURSEMENT_CREDIT}`}
                            className="text-decoration-none d-flex round-indicator"
                            style={{ color: '#399af2' }}
                            to={`/remboursement_credit/detail/${encodeId(item?.ID_REMBOURSEMENT_CREDIT)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            data-pr-position="bottom"
                          >
                            <span>{item?.REFERENCE_REMBOURSEMENT}</span>
                          </Link>
                        </>
                      );
                    }}
                  />



                  <Column
                    field="MONTANT_CAPITAL"
                    header="Montant capital"
                    sortable
                    body={(item) => `${parseFloat(item.MONTANT_CAPITAL).toLocaleString('fr-FR')} Fbu`}

                  />



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

                          {item?.Credits.membresmicro ?
                            <Link

                              className=" text-decoration-none d-flex round-indicator"
                              style={{ color: '#399af2' }}
                              to={`/utilisateurs/${encodeId(item?.Credits.membresmicro?.ID_UTILISATEUR)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              data-pr-position="bottom"
                            >
                              <div className="d-flex round-indicator">

                                {item?.Credits.membresmicro?.PHOTO_PASSPORT ? (
                                  <Image
                                    src={item?.Credits.membresmicro?.PHOTO_PASSPORT}
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
                                    {item?.Credits.membresmicro?.NOM.charAt(0)}{item?.Credits.membresmicro?.PRENOM.charAt(0)}
                                  </div>
                                )}
                                <div className="ml-2 mt-1">
                                  <div className="font-bold">
                                    {item?.Credits.membresmicro?.USERNAME}
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
                    field="TYPE_OPERATION_ID"
                    header="Type operation"
                    sortable
                    body={(item) => item.Types_operations_comptables?.NOM_OPERATION}
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
                          ) : (
                            <Button className="btn-sm"
                              data-pr-tooltip='Versement'
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
                                width: 25, height: 25, backgroundColor: statutRemboursementColor(item.STATUT).backgroundColor,
                                color: statutRemboursementColor(item.STATUT).textColor, border: "none"
                              }}
                              icon={options => {
                                return (
                                  <span className="mb-1"
                                    dangerouslySetInnerHTML={{
                                      __html: statutRemboursementColor(item.STATUT).icon
                                    }} />
                                );
                              }} />
                          )
                            : item?.STATUT == 1 ? (
                              <Button className="btn-sm"
                                data-pr-tooltip={item?.DESCRIPTION || "Aucun motif"}
                                tooltip tooltipOptions={{ position: 'top' }}
                                style={{
                                  width: 25, height: 25, backgroundColor: statutRemboursementColor(item.STATUT).backgroundColor,
                                  color: statutRemboursementColor(item.STATUT).textColor, border: "none"
                                }}

                                icon={options => {
                                  return (
                                    <span className="mb-1"
                                      dangerouslySetInnerHTML={{
                                        __html: statutRemboursementColor(item.STATUT).icon
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
                  <Column
                    field="DATE_ENREGISTREMENT"
                    header="Date d'enregistrement"
                    sortable
                    body={(item) => {
                      return moment(item.DATE_ENREGISTREMENT).format("DD/MM/YYYY HH:mm");
                    }}
                  />

                  {ismembre === PROFILS.ADMIN || PROFILS.GERANT ? (
                    <Column
                      field=""
                      header=""
                      alignFrozen="right"
                      frozen
                      body={(item) => {
                        // Si le remboursement est déjà annulé (STATUT === 1), ne pas afficher le menu
                        if (
                          item?.STATUT === 1 || ismembre === PROFILS.MEMBRE ||
                          item?.TYPE_REMBOURSEMENT !== 0 ||
                          ismembre === PROFILS.ADMIN_ADJOINT ||
                          new Date(item.DATE_ENREGISTREMENT) < new Date('2025-08-18')
                        ) {
                          return null;
                        }

                        const items = [
                          {
                            template: (deleteItem, options) => {
                              return (
                                <a
                                  href="#"
                                  className="p-menuitem-link text-danger"
                                  onClick={(e) =>
                                    handleAnnuler(e, [inViewMenuItem?.ID_REMBOURSEMENT_CREDIT])
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
                  ) : null}


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
