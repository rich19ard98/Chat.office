import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import { userSelector } from "../../store/selectors/userSelector";

import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import etatCreditsColor from "../../helpers/etatCreditsColor";

import STATUT_ECRITURE_COMPTABLE from "../../constants/STATUT_ECRITURE_COMPTABLE";
import { ListBox } from 'primereact/listbox';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tooltip } from 'primereact/tooltip';
import { Image } from "primereact/image";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { encodeId } from "../../utils/IdEncryption";
import { decodeId } from "../../utils/IdEncryption";
import { useSearchParams } from 'react-router-dom';


const initialForm = {
  ID_TYPES_CHARGES: null,
  PU: "",
  DESCRIPTION: "",
  LIBELLE: "",
  QTE: null,
  IMAGE: null,
  ID_COMPTE: null,
  NOTE: null,
}
export default function Detail_Membres_pages() {
  const dispacth = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const user = useSelector(userSelector);
  const [ecritures, setEcritures] = useState([]);
  const [Selectedoperation, setSelecteoperation] = useState(null);
  const [totalRecords, setTotalRecords] = useState(1);
  const [dates, setDates] = useState(null);
  const [TransanctionNombre, setTransanctionNombre] = useState(null);
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("ID"); // récupère "MTc"
  const [decodedId, setDecodedId] = useState(null);
  const [membreId, setMembreId] = useState(parseInt(decodedId));
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [currentDecodedId, setCurrentDecodedId] = useState(null);
  const [membres_microfinance, setMembres_microfinance] = useState(null);
  const [membre, setMembre] = useState(null)
  const { id: encodedStr } = useParams()
  const [Cotisation, setCotisation] = useState([]);
  const [formattedNbCredits, setFormattedNbCredits] = useState();
  const [formattedNbCreditsEncours, setFormattedNbCreditsEncours] = useState();
  const [FormattedNbCreditsRembouse, setFormattedNbCreditsRembouse] = useState();
  const [FormattedNbCreditsEttente, setFormattedNbCreditsEttente] = useState();
  const [membredata, setmembredata] = useState([]);
  const [Montant, setMontant] = useState([]);
  const [listItems, setListItems] = useState([]); // État pour stocker les éléments à afficher
  const [CreditTotaux, setCreditTotaux] = useState([]);
  const [CreditEncours, setCreditEncours] = useState([]);
  const [CreditsEnattente, setCreditsEnattente] = useState([]);
  const [CreditsRembourse, setCreditsRembourse] = useState([]);
  const [remboursementsDuMembre, setremboursementsDuMembre] = useState();
  const [Transaction, setTransaction] = useState([]);
  const [modepaiement, setmodepaiement] = useState();
  const [montantTotal, setmontantTotal] = useState(0);
  const [operationdata, setoperationdata] = useState([]);
  const [nombre, setnombre] = useState([]);
  const [Achats_equipements, setAchats_equipements] = useState([]);
  const [retardCredits, setRetardCredits] = useState([]);
  const [amortissements, setAmortissements] = useState([]);
  const [remboursement_credit, setRemboursement_credit] = useState([]);
  const [creditsMembre, setCreditsMembre] = useState([]);
  const [MontantTotalAmortissements, setMontantTotalAmortissements] = useState();
  const [MontantTotal, setMontantTotal] = useState([]);
  const membres = urlParams.get('membre');
  const [searchTerm, setSearchTerm] = useState('');
  const [MontantantTotalCredits, setMontantantTotalCredits] = useState(0);
  const ids = decodeId(encodedStr)
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [compte, setcompte] = useState([]);
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState(4);
  const [loading, setLoading] = useState(false);
  const [visibleTotal, setVisibleTotal] = useState(false);
  const [visibleEncours, setVisibleEncours] = useState(false);
  const [visibleRembourse, setVisibleRembourse] = useState(false);
  const [visiblePenalite, setVisiblePenalite] = useState(false);
  const [visibleAttente, setVisibleAttente] = useState(false);
  const [visible, setVisible] = useState(false);
  const Ismembre = user.ID_PROFIL

  const [modes, setModes] = useState([])
  const [Credits, setCredits] = useState([])
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


  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError, } = useFormErrorsHandle(data,
    {
    },
    {
    })
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
        setMembreId(idParsed);
      }
    }
  }, [decodedId]);

  useEffect(() => {
    document.title = "Detail Credits"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Membre/detail',
        name: 'Detail Membre'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  useEffect(() => {
    if (encodedId) {
      const id = decodeId(encodedId);
      setDecodedId(id); // ce déclenche la requête de fetch
      setMembreId(id)
      setCurrentDecodedId(id)
    }

  }, [encodedId]);
  const operationSelected = (operation) => {
    setSelecteoperation(operation);
  };
  //Fetch Amortissements lie au credits 
  const fetchAmortissements = useCallback(async () => {
    try {
      if (!membreId) return; // évite fetch si pas de membreId
      setLoading(true);

      let url = `/credits/amortissements/fetch?rows=10000000`;

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "object" && Object.keys(value).length > 0) {
            url += `${key}=${encodeURIComponent(JSON.stringify(value))}&`;
          } else if (typeof value !== "object") {
            url += `${key}=${encodeURIComponent(value)}&`;
          }
        }
      }

      const res = await fetchApi(url);

      if (!res || !res.result || !Array.isArray(res.result.data)) {
        throw new Error("Réponse API invalide ou vide");
      }

      const AllAmo = res.result.data;


      const AmortissementsMembre = AllAmo.filter((credit) => {
        const membreIdInCredit = credit?.creditss?.MEMBRE_ID;
        const statutCredit = credit?.creditss?.ID_STATUTS_CREDIT

        return (membreIdInCredit && parseInt(membreIdInCredit) === parseInt(membreId) && statutCredit !== ID_STATUTS_CREDIT.ANNULE);
      });

      const totalMontant = AmortissementsMembre.reduce((sum, c) => {
        return sum + parseFloat(c.MONTANT_RESTANT || 0);
      }, 0);

      setMontantTotalAmortissements(totalMontant);
      setAmortissements(AllAmo);

      setTimeout(() => {
        setLoading(false);
      }, 100);

    } catch (error) {
      console.error("❌ Erreur lors du fetch des amortissements :", error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [lazyState, membreId]);

  // Met à jour membreId quand membre change
  useEffect(() => {
    if (membre && membre.ID_UTILISATEUR) {
      setMembreId(membre.ID_UTILISATEUR);
    }
  }, [membre]);

  // Appelle fetchAmortissements dès que membreId est défini
  useEffect(() => {
    if (membreId) {
      fetchAmortissements();
    }
  }, [membreId, fetchAmortissements]);

  useEffect(() => {
    if (!membre) return; // pas encore chargé
    const id = membre.ID || membre.id || membre.ID_UTILISATEUR;
    if (id) {
      setMembreId(id);

      fetchAmortissements();
    }
  }, [membre]);

  useEffect(() => {
    const idNum = parseInt(membreId);
    if (activeButton === 4 && idNum) {

      fetchCredit();
    }
  }, [activeButton, membreId]);


  const fetchCredit = useCallback(async () => {
    const idNum = parseInt(membreId);
    if (!idNum) {
      console.warn('❌ membreId invalide, fetch annulé');
      return;
    }


    if (!membreId) return; // évite fetch si pas de membreId

    try {
      setLoading(true);
      let url = `/credits/credits/fetch?rows=10000000`;
      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          url += `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}&`;
        }
      }

      const res = await fetchApi(url);


      if (!res || !res.result) throw new Error('Réponse invalide du serveur.');
      const allCredits = res.result.data || [];


      // ✅ On vérifie ici que les crédits sont bien filtrés
      const creditsMembre = allCredits.filter(
        (credit) => parseInt(credit?.MEMBRE_ID) === parseInt(membreId)
      );


      // ➕ suite inchangée...
      setCredits(creditsMembre);
      setFormattedNbCredits(creditsMembre.length.toLocaleString('fr-FR'));
      setMontantantTotalCredits(
        creditsMembre.reduce((total, amortissement) => {
          const montant = parseFloat(amortissement.MONTANT_DEMANDE);
          const interet = parseFloat(amortissement.INTERET_TOTAL);
          // Vérifiez si le crédit n'est pas remboursé
          const estRembourse = amortissement.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.REMBOURSE; // Vérifiez si le statut est "REMBOURSE"

          if (isNaN(montant) || estRembourse) {
            return total; // Ignorer les crédits remboursés ou invalides
          }
          return total + montant + interet; // Ajouter le montant et l'intérêt
        }, 0)
      );
      const filteredCredits = creditsMembre.filter(c => parseInt(c.ID_STATUTS_CREDIT) === ID_STATUTS_CREDIT.EN_COURS);

      const CreditRetards = creditsMembre.filter(c => parseInt(c.ID_STATUTS_CREDIT) === (ID_STATUTS_CREDIT.EN_RETARD))
      setRetardCredits(CreditRetards);
      setnombre(CreditRetards.length); // Doit être 0 si aucun crédit n'est trouvé


      setCreditsMembre(filteredCredits);
      setFormattedNbCreditsEncours(filteredCredits.length.toLocaleString('fr-FR'));
      const filteredCreditsRembourse = creditsMembre.filter(c => parseInt(c.ID_STATUTS_CREDIT) === ID_STATUTS_CREDIT.REMBOURSE);

      setFormattedNbCreditsRembouse(filteredCreditsRembourse.length.toLocaleString('fr-FR'));
      const filteredCreditsEnettente = creditsMembre.filter(c => parseInt(c.ID_STATUTS_CREDIT) === ID_STATUTS_CREDIT.EN_ATTENTE_D_APPROBATION);
      setFormattedNbCreditsEttente(filteredCreditsEnettente.length.toLocaleString('fr-FR'));
      setCreditTotaux(creditsMembre);
      setCreditsEnattente(filteredCreditsEnettente);
      setCreditEncours(filteredCredits);
      setCreditsRembourse(filteredCreditsRembourse);
      const totalMontant = creditsMembre.reduce((sum, c) => {
        return sum + parseFloat(c.MONTANT_DEMANDE || 0);
      }, 0);
      setMontantTotal(totalMontant);
      // ✅ Laisse le temps au rendu de React avant de désactiver le loading
      setTimeout(() => {
        setLoading(false);
      }, 100);

    } catch (error) {
      console.error('❌ Erreur fetchCredit :', error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, membreId]);
  useEffect(() => {

    if (!membre || !membre.ID_UTILISATEUR) return;
    fetchCredit();
  }, [lazyState, membreId]);

  let pourcentageRemboursement = 0
  let pourcentage = 0
  let CentPourcent = 100
  if (formattedNbCredits > 0) {
    pourcentageRemboursement = parseInt(formattedNbCredits);
    pourcentage = parseInt((FormattedNbCreditsRembouse * CentPourcent) / pourcentageRemboursement)
  }
  else {
    pourcentage = 0
    CentPourcent = 0

  }

  const optionsPie = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
    },
    title: { text: null },
    tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b>' },
    plotOptions: {
      pie: {
        innerSize: '70%',
        dataLabels: { enabled: false },
        colors: ['green', 'red'],
      },
    },
    series: [
      {
        name: 'Remboursement',
        data: [
          { name: 'Credits Remboursé', y: pourcentage },
          { name: ' Credits Restant', y: CentPourcent - pourcentage },
        ],
      },
    ],
  };
  const fetchEcritures = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/plancomptable/ecriturecomptable/fetch?rows=10000000000&`;

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value !== null && value !== undefined) {
          url += `${key}=${encodeURIComponent(typeof value === "object" ? JSON.stringify(value) : value)}&`;
        }
      }
      if (Selectedoperation?.name) {
        url += `TYPE_OPERATION=${Selectedoperation.name}&`;
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

      const res = await fetchApi(url);
      const allEcritures = res.result.data;
      const MembreTransaction = allEcritures.filter(
        (transaction) => parseInt(transaction?.MEMBRE_ID) === parseInt(membreId)
      );
      setTransaction(MembreTransaction)
      // const totalMontant = allEcritures.reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);
      const totalMontant = allEcritures
        .filter(item => item?.STATUT !== STATUT_ECRITURE_COMPTABLE.ANNULER)
        .reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);

      let filteredEcritures = allEcritures;


      setEcritures(res.result.data);
      setTotalRecords(res.result.totalRecords);
      setMontantTotal(totalMontant);
      setTransanctionNombre(MembreTransaction.length)

    } catch (error) {
      console.error("Erreur lors du chargement des écritures comptables :", error);
    } finally {
      setLoading(false);
    }
  }, [
    lazyState, membreId, Selectedoperation, dates


  ]);


  useEffect(() => {
    if (!membreId) return;
    fetchEcritures();
  }, [lazyState, membreId, Selectedoperation, dates
  ]);
  const fetchtypeoperation = useCallback(async () => {
    try {
      var url = `/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`
      const res = await fetchApi(url);
      setoperationdata(
        res.result.data.map((util) => {
          return {
            name: util.NOM_OPERATION,
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
  const fetchRemboursement_credit = useCallback(async () => {
    try {
      if (!membreId) return; // évite fetch si pas de membreId
      setLoading(true);
      const baseurl = `/credits/remboursement_credit/fetch?rows=10000000`;
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
      const res = await fetchApi(url);
      const DATA = res.result.data
      const updatedCategories = DATA.map((item) => {
        const membre = item?.Credits?.membresmicro?.ID_MEMBRES_MICROFINANCE;
        const ETAT = item?.Credits?.ETAT; // Access ETAT correctly
        const isRetard = ETAT === 1;
        const creditsMembre = DATA.filter(
          (credit) => parseInt(credit.MEMBRE_ID) === membreId
        );
        return {
          ...item.Credits,
          membre,
          isRetard,
          membresmicro: item.Credits?.membresmicro,

        };
      });
      // Réinitialiser l'état
      setRetardCredits([]);
      setListItems([]);
      setnombre(0);

      const retardMembers = updatedCategories.filter((category) =>
        (category.isRetard) &&
        (category.MEMBRE_ID) === parseInt(membreId));

      const references = retardMembers.map(member => member.REFERENCE_CREDIT);
      // Filtre pour les crédits en retard avec ID_STATUTS_CREDIT === 6
      const retardCredits = updatedCategories.filter(category =>
        category.isRetard &&
        category.MEMBRE_ID === parseInt(membreId) &&
        category.ETAT === 1
      );
      // Met à jour l'état avec les crédits filtrés

      // Now you can safely use updatedCategories
      setListItems(retardCredits)
      const remboursementsDuMembre = DATA.filter(item => {
        return item.Credits?.MEMBRE_ID === parseInt(membreId);
      });
      setremboursementsDuMembre(remboursementsDuMembre)
      setmodepaiement(modepaiement)

      setRemboursement_credit(res.result.data);

      // ✅ Laisse le temps au rendu de React avant de désactiver le loading
      setTimeout(() => {
        setLoading(false);
      }, 100);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, membreId]
  );
  useEffect(() => {
    fetchRemboursement_credit();
  },
    [fetchRemboursement_credit]
  );

  const handleClickOpen = () => {
    setListItems(retardCredits); // Remplacez par vos données réelles
    setVisible(true);
  };
  const handleClickOpenCredittotaux = () => {
    setVisibleTotal(true);
  };
  const handleClickOpenCreditEncours = () => {
    setVisibleEncours(true);
  };

  const handleClickOpenCreditsRembourse = () => {
    setVisibleRembourse(true);
  };
  const handleClickOpenCreditEnattente = () => {
    setVisibleAttente(true);
  };

  const handleClose = () => {
    setVisibleTotal(false);
    setVisibleEncours(false);
    setVisibleRembourse(false);
    setVisiblePenalite(false);
    setVisibleAttente(false);
    setVisible(false)
  };
  const handleMembreSelect = (e) => {
    const selected = e.value; // Récupère l’objet du membre sélectionné depuis le dropdown
    if (selected && selected.code) {
      const encodedId = encodeId(selected.code); // Encode l’ID réel pour l’URL 
      setSelectedMembre(selected);              // Sauvegarde l’objet membre complet
      setMembreId(selected.code);               // Sauvegarde l’ID décodé (réel) pour les fetchs
      setCurrentDecodedId(selected.code);       // Facultatif : utile si tu relies ce champ à ton fetch
      navigate(`?ID=${encodedId}`);             // Met à jour l’URL avec ID encodé
    } else {
      console.warn('⚠️ Aucun membre valide sélectionné');
    }
  };
  //FindOne d'un membre microfinance
  const fetchMembreMicrofinance = useCallback(async () => {
    if (!currentDecodedId) return;
    if (!membreId) return; // évite fetch si pas de membreId

    try {
      setLoading(true);
      let url = `/administration/utilisateurs/find/${currentDecodedId}?`;
      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          url += `&${key}=${encodeURIComponent(
            typeof value === "object" ? JSON.stringify(value) : value
          )}`;
        }
      }
      const res = await fetchApi(url);

      setMembre(res.result); // ✅ met à jour les données
      // ✅ Laisse le temps au rendu de React avant de désactiver le loading
      setTimeout(() => {
        setLoading(false);
      }, 100);

    } catch (error) {
      console.error("❌ Erreur récupération membre :", error);

    } finally {
      setLoading(false);
    }
  }, [decodedId, lazyState, currentDecodedId]); // ❌ membre retiré ici
  useEffect(() => {
    if (membreId) {
      fetchMembreMicrofinance();
    }

  }, [lazyState, decodedId, currentDecodedId, fetchMembreMicrofinance]);


  const modePaiementMap = {
    0: "Espèces",
    1: "Virement",
    2: "Versement"
  };
  const fetchCotisation = useCallback(async () => {
    try {
      if (!membreId) return; // évite fetch si pas de membreId

      setLoading(true);

      let url = `/cotisation/cotisations/fetch?rows=100000000&`;

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value !== null && value !== undefined) {
          if (typeof value === "object" && Object.keys(value).length > 0) {
            url += `${key}=${encodeURIComponent(JSON.stringify(value))}&`;
          } else if (typeof value !== "object") {
            url += `${key}=${encodeURIComponent(value)}&`;
          }
        }
      }

      const res = await fetchApi(url);

      const allCotisations = res?.result?.data || [];
      setCotisation(allCotisations);

      const cotisationsFiltered = allCotisations.filter(
        cotisa => parseInt(cotisa?.MEMBRE_ID) === parseInt(membreId)
      );

      const montantTotal = cotisationsFiltered.reduce(
        (total, cotisa) => total + parseFloat(cotisa?.MONTANT || 0),
        0
      );

      setMontant(montantTotal);

    } catch (error) {
      console.error("Erreur fetchCotisation :", error);
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  }, [lazyState, membreId]);

  useEffect(() => {
    fetchCotisation();
  }, [fetchCotisation]);
  useEffect(() => {
    if (membreId) {
      fetchCotisation();
    }
  }, [membreId, fetchCotisation]);

  //lister des menbres du microfinance

  const fetchmembre_microfinance = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/administration/utilisateurs/fetch?rows=100000`;
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
      url += `profil=2`;
      const res = await fetchApi(url);

      setMembres_microfinance(res.result.data);
      setmembredata(
        res.result.data.map((util) => {
          return {
            name: `${util.NOM} ${util.PRENOM}`,
            code: util.ID_UTILISATEUR,
          };
        })
      );
      // ✅ Laisse le temps au rendu de React avant de désactiver le loading
      setTimeout(() => {
        setLoading(false);
      }, 100);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);

  useEffect(() => {
    fetchmembre_microfinance();
  }, [lazyState]
  );
  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };
  const fetchAchats_equipements = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/cotisation/Achats_equipements/fetch?rows=100000000000000&`;

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


      const res = await fetchApi(url);

      setAchats_equipements(res.result.data);
      const allAchatsEquipements = res?.result?.data || [];
      setCotisation(allAchatsEquipements);
      const cotisationsFiltered = allAchatsEquipements.filter(
        cotisa => parseInt(cotisa?.MEMBRE_ID) === parseInt(membreId)
      );
      const montanttotalAchats = cotisationsFiltered.reduce(
        (total, cotisa) => total + parseFloat(cotisa?.MONTANT || 0),
        0
      );


      setmontantTotal(montanttotalAchats)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, membreId]);

  useEffect(() => {
    if (membreId) { fetchAchats_equipements() }

  }, [lazyState, membreId]);
  useEffect(() => {
    if (activeButton === 4) {
      fetchCredit(); // Appelle ta fonction d'importation des crédits
    }
  }, [activeButton]);


  return (
    <>
      {loading && <Loading />}
      <div>  <h4 className="mb-5 ml-5 mt-3  "
        style={{
          color: '#143d8f',
          height: '10px',

          fontSize: "23px",
          marginLeft: "30px"

        }}
      >{membre?.NOM} {membre?.PRENOM}</h4></div>
      <div className="px-4 py-3 main_content ">
        <div className="d-flex align-items-center justify-content-between">
          <div className="">
            {Ismembre === 2 ? null : (
              <>

                {activeButton === 4 ? (
                  <div className="position-relative top-0  p-2 ms-2 mb-6 ">
                    <div className="d-flex justify-content-center position-absolute top-0  start-2 p-2 ms-0"
                      style={{
                        width: '350px',
                        zIndex: 1000
                      }}
                    >
                      <Dropdown
                        value={selectedMembre}
                        onChange={handleMembreSelect}
                        options={membredata}
                        optionLabel="name"
                        style={{ with: "500px" }}
                        placeholder="Sélectionner un membre"
                        className="w-100 w-md-14rem"
                        showClear
                        filter
                      />
                    </div>

                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div
          style={{ backgroundColor: '#fb8c8c', height: "50px", maxWidth: "1300px" }}
          className="mx-auto rounded d-flex align-items-center justify-content-between col-12 col-md-10 col-lg-8"
        >
          <div className="d-flex align-items-center row w-100 borderless mr-2">
            <button
              className="col border-0 rounded-3 "
              onClick={() => handleButtonClick(1)

              }
              style={{
                backgroundColor: activeButton === 1 ? '#000000' : '#fb8c8c',
                color: 'white',

                height: '50px', width: '30%',

              }}
            >
              <span className="me-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24"
                  height="24" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z" />
                </svg></span>
              <span className="font-bold">Profil</span>
            </button>
            <button
              className="col border-0 rounded-3"

              onClick={() => {

                handleButtonClick(4)
                fetchCredit()

              }}
              style={{
                backgroundColor: activeButton === 4 ? '#000000' : '#fb8c8c',
                color: 'white',
                height: '50px', width: '30%',
              }}

            >
              <span className="me-2">  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
              </svg>
              </span>
              <span className="font-bold">Credits</span>
            </button>
            <button
              className="col border-0 rounded-3"
              onClick={() => {

                fetchRemboursement_credit()
                fetchmembre_microfinance()
                handleButtonClick(5)


              }}
              style={{
                backgroundColor: activeButton === 3 || activeButton === 5 ? '#000000' : '#fb8c8c',
                color: 'white',
                height: '50px',
                width: '40%',


              }}
            >
              <span className="me-2 vh-100"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-credit-card" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h12V4a1 1 0 0 0-1-1H2zm0 4v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7H2z" />
              </svg></span><span className="font-bold w-full fs-6 fs-md-5" >Historique</span>
            </button>

          </div>
        </div>

        {activeButton === 1 ?
          <div className="row w-100 p-0">
            {/* Photo passeport visible seulement sur md+ */}
            {membre?.membre?.PHOTO_PASSPORT && (
              <div
                className="col-md-3 me-5 d-none d-md-flex"
                style={{ marginTop: '10px' }} // par exemple 80px
              >
                <div className="w-100 ms-2">
                  <Image
                    src={membre?.membre?.PHOTO_PASSPORT}
                    alt="Image"
                    imageClassName="rounded-4 object-fit-cover w-full"
                    imageStyle={{ width: "100px", height: "300px" }}
                  />
                </div>
              </div>
            )}

            <div className={`card mt-2 ms-5 ${membre?.membre?.PHOTO_PASSPORT ? 'col-md-8' : 'col-12'}`}>

              <div className="w-100" >
                {/* Infos détaillées - apparaissent en premier sur petit écran, deuxième sur grand écran */}
                <div className=" order-1 order-md-2 w-100" style={{ color: '#143d8f' }}>
                  <div className="card bg-dark ms-0 row w-100 h-50 col-12">
                    <div className="text-color-white" >
                      <h6 style={{ color: '#ffff', fontSize: "20px" }}>
                        Credits: {MontantTotalAmortissements ? (-MontantTotalAmortissements).toLocaleString("fr-FR") : 0}
                      </h6></div>
                    <h6 style={{ color: '#ffff', fontSize: '20px' }}>
                      Cotisation : {(Montant - montantTotal).toLocaleString("fr")}
                    </h6>

                  </div>

                  <div className="row text-xl w-100 " >
                    <div className="col-md-6  mb-2" >
                      <span className="text-muted small" style={{ color: '#143d8f' }}>Nom Et Prenom :</span><br />
                      <strong >
                        {membre?.membre ? `${membre.membre.NOM} ${membre.membre.PRENOM}` : "-"}
                      </strong>
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="text-muted small">Telephone :</span><br />
                      <strong className="">{membre?.membre?.TELEPHONE || "-"}</strong>
                    </div>
                  </div>
                  <div className="row w-100">
                    <div className="col-md-6 mb-2">
                      <span className="text-muted small">Email :</span><br />
                      <strong className="">{membre?.membre?.EMAIL || "-"}</strong>
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="text-muted small">Genre :</span><br />
                      <strong>{membre?.membre?.SEXE === 0 ? "Homme"
                        : membre?.membre?.SEXE === 1 ? "Femme" : "-"}</strong>
                    </div>
                  </div>
                  <div className="row w-100">
                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Adresse :</span><br />
                      <strong className="">{membre?.membre?.ADRESSE || "-"}</strong>
                    </div>

                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Lieu de naissance :</span><br />
                      <strong>{membre?.membre?.LIEU_NAISSANCE || "-"}</strong>
                    </div>
                  </div>
                  <div className="row w-100">
                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Anne Naissance :</span><br />
                      <strong>{membre?.membre?.DATE_NAISSANCE || "-"}</strong>
                    </div>

                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Carte Identite :</span><br />
                      <strong>{membre?.membre?.CNI_NUMERO || "-"}</strong>
                    </div>
                  </div>
                  <div>
                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Date inscription :</span><br />
                      <strong>
                        {membre?.membre?.DATE_INSCRIPTION
                          ? new Date(membre.membre.DATE_INSCRIPTION).toLocaleDateString('fr-FR')
                          : "-"}
                      </strong>

                    </div>
                    <div className="col-md-6  mb-2">
                      <span className="text-muted small">Carte D'Identité :</span><br />
                      {membre?.membre?.PHOTO_CNI ? (
                        <img
                          src={membre.membre?.PHOTO_CNI}
                          alt="Photo CNI"
                          className="img-fluid w-full rounded"
                          style={{ width: "700px", maxWidth: '100%', height: 'auto' }} // S'assure que l'image est responsive
                        />
                      ) : (
                        <strong>-</strong>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          : null}

        {/* Identification  */}
        {activeButton === 2 ? (
          <>
            {/* PAGE VIDE */}
            <div className="container-fluid py-5">
              <h5 className="text-center text-muted">Aucun contenu pour le moment</h5>
            </div>

            {/* Bouton flottant pour ajouter */}
            <div style={{ position: "absolute", bottom: 120, right: 80 }} className="w-100 d-flex justify-content-end pb-3 pr-5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="border-0 bg-transparent"
              >
              </button>
            </div>
          </>
        ) : null}
        {/*  Credits button */}
        {activeButton === 4 && (
          <div className="form-group col-sm py-4 w-100 ">
            <div className="container ">
              <div className="row g-3  justify-content-center">

                {/* Crédits totaux */}

                <div className="col-4 " style={{ cursor: 'pointer' }}>
                  <div
                    className="bg-dark text-white text-center p-3  rounded"
                    style={{ height: '125px' }}
                    onClick={handleClickOpenCredittotaux}
                  >
                    <h5 className="fw-bold" style={{ fontSize: '12px' }}>Crédits totaux</h5>
                    <p className="h4 mt-5">{formattedNbCredits}</p>
                  </div>


                  {/* Dialog */}
                  <Dialog
                    name="Total"

                    visible={visibleTotal}
                    onHide={handleClose}
                    maximizable
                    style={{ width: '70vw' }}
                    header={
                      <div
                        className="dialog-header"
                        style={{
                          backgroundColor: '#fb8c8c',
                          padding: '1rem',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >

                      </div>
                    }
                  >
                    <DataTable
                      value={CreditTotaux}
                      paginator
                      rows={5}
                      header="Crédits totaux"
                      emptyMessage="Aucun enregistrement trouvé."
                    >
                      <Column
                        field="membresmicro.NOM"
                        header="Membre"
                        body={(item) => (
                          <span>
                            {item?.membresmicro?.NOM} {item?.membresmicro?.PRENOM}
                          </span>
                        )}
                      />
                      <Column
                        field="REFERENCE_CREDIT"
                        header="Référence"
                        body={(item) => (
                          <span>
                            {item?.REFERENCE_CREDIT}
                          </span>
                        )}
                      />
                      <Column
                        field="MONTANT_DEMANDE"
                        header="Montant Demandé"
                        body={(item) => (
                          <span>
                            {item?.MONTANT_DEMANDE}
                          </span>
                        )}
                      />
                      <Column
                        field="CAISSE_SOCIALE"
                        header="Caisse Sociale"
                        body={(item) => (
                          <span>
                            {item?.CAISSE_SOCIALE}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_DEMANDE"
                        header="Date de Demande"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_DEMANDE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_ECHEANCE"
                        header="Date d'Échéance"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_ECHEANCE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DUREE"
                        header="Durée (mois)"
                        body={(item) => (
                          <span>
                            {item?.DUREE}
                          </span>
                        )}
                      />
                      <Column
                        field="INTERET_TOTAL"
                        header="Intérêt Total"
                        body={(item) => (
                          <span>
                            {item?.INTERET_TOTAL}
                          </span>
                        )}
                      />
                      <Column
                        field="TAUX_INTERET"
                        header="Taux d'Intérêt (%)"
                        body={(item) => (
                          <span>
                            {item?.TAUX_INTERET}
                          </span>
                        )}
                      />
                      <Column
                        field="STATUT "
                        header="Statut"
                        sortable
                        body={(item) => {
                          return (
                            item.statutscre ?
                              <Button className="btn-sm"
                                data-pr-tooltip={item.statutscre ? item.statutscre.DESCRIPTION : "-"}
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
                    </DataTable>
                    <div className="flex justify-content-end">

                    </div>
                  </Dialog>
                </div>

                {/* Crédits en cours */}

                <div className="col-4" style={{ cursor: 'pointer' }}>
                  <div
                    className="bg-dark text-white text-center p-3  rounded"
                    style={{ height: '125px' }}
                    onClick={handleClickOpenCreditEncours}
                  >
                    <h5 className="fw-bold" style={{ fontSize: '12px' }}>Crédits  en cours </h5>
                    <p className="h4 mt-5">{formattedNbCreditsEncours}</p>
                  </div>


                  {/* Dialog */}
                  <Dialog
                    name="En cours"
                    visible={visibleEncours}
                    onHide={handleClose}
                    maximizable
                    style={{ width: '70vw' }}
                    header={

                      <div

                        className="dialog-header"
                        style={{
                          backgroundColor: '#fb8c8c',
                          padding: '1rem',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >

                      </div>
                    }
                  >
                    <DataTable
                      value={CreditEncours}
                      paginator
                      rows={5}
                      header="Crédits en cours"
                      emptyMessage="Aucun enregistrement trouvé."
                    >
                      <Column
                        field="membresmicro.NOM"
                        header="Membre"
                        body={(item) => (
                          <span>
                            {item?.membresmicro?.NOM} {item?.membresmicro?.PRENOM}
                          </span>
                        )}
                      />
                      <Column
                        field="REFERENCE_CREDIT"
                        header="Référence"
                        body={(item) => (
                          <span>
                            {item?.REFERENCE_CREDIT}
                          </span>
                        )}
                      />
                      <Column
                        field="MONTANT_DEMANDE"
                        header="Montant Demandé"
                        body={(item) => (
                          <span>
                            {item?.MONTANT_DEMANDE}
                          </span>
                        )}
                      />
                      <Column
                        field="CAISSE_SOCIALE"
                        header="Caisse Sociale"
                        body={(item) => (
                          <span>
                            {item?.CAISSE_SOCIALE}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_DEMANDE"
                        header="Date de Demande"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_DEMANDE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_ECHEANCE"
                        header="Date d'Échéance"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_ECHEANCE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DUREE"
                        header="Durée (mois)"
                        body={(item) => (
                          <span>
                            {item?.DUREE}
                          </span>
                        )}
                      />
                      <Column
                        field="INTERET_TOTAL"
                        header="Intérêt Total"
                        body={(item) => (
                          <span>
                            {item?.INTERET_TOTAL}
                          </span>
                        )}
                      />
                      <Column
                        field="TAUX_INTERET"
                        header="Taux d'Intérêt (%)"
                        body={(item) => (
                          <span>
                            {item?.TAUX_INTERET}
                          </span>
                        )}
                      />
                      <Column
                        field="STATUT "
                        header="Statut"
                        sortable
                        body={(item) => {
                          return (
                            item.statutscre ?
                              <Button className="btn-sm"
                                data-pr-tooltip={item.statutscre ? item.statutscre.DESCRIPTION : "-"}
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
                    </DataTable>
                    <div className="flex justify-content-end">

                    </div>
                  </Dialog>
                </div>


                {/* Crédits remboursés */}

                <div className="col-4" style={{ cursor: 'pointer' }}>
                  <div
                    className="bg-dark text-white text-center p-3  rounded"
                    style={{ height: '125px' }}
                    onClick={handleClickOpenCreditsRembourse}
                  >
                    <h5 className="fw-bold" style={{ fontSize: '12px' }}>Crédits remboursés</h5>
                    <p className="h4 mt-5">{FormattedNbCreditsRembouse}</p>
                  </div>


                  {/* Dialog */}
                  <Dialog
                    name="Rembourse"

                    visible={visibleRembourse}
                    onHide={handleClose}
                    maximizable
                    style={{ width: '70vw' }}
                    header={
                      <div
                        className="dialog-header"
                        style={{
                          backgroundColor: '#fb8c8c',
                          padding: '1rem',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >

                      </div>
                    }
                  >
                    <DataTable
                      value={CreditsRembourse}
                      paginator
                      rows={5}
                      header="Crédits en Retard"
                      emptyMessage="Aucun enregistrement trouvé."
                    >
                      <Column
                        field="membresmicro.NOM"
                        header="Membre"
                        body={(item) => (
                          <span>
                            {item?.membresmicro?.NOM} {item?.membresmicro?.PRENOM}
                          </span>
                        )}
                      />
                      <Column
                        field="REFERENCE_CREDIT"
                        header="Référence"
                        body={(item) => (
                          <span>
                            {item?.REFERENCE_CREDIT}
                          </span>
                        )}
                      />
                      <Column
                        field="MONTANT_DEMANDE"
                        header="Montant Demandé"
                        body={(item) => (
                          <span>
                            {item?.MONTANT_DEMANDE}
                          </span>
                        )}
                      />
                      <Column
                        field="CAISSE_SOCIALE"
                        header="Caisse Sociale"
                        body={(item) => (
                          <span>
                            {item?.CAISSE_SOCIALE}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_DEMANDE"
                        header="Date de Demande"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_DEMANDE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_ECHEANCE"
                        header="Date d'Échéance"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_ECHEANCE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DUREE"
                        header="Durée (mois)"
                        body={(item) => (
                          <span>
                            {item?.DUREE}
                          </span>
                        )}
                      />
                      <Column
                        field="INTERET_TOTAL"
                        header="Intérêt Total"
                        body={(item) => (
                          <span>
                            {item?.INTERET_TOTAL}
                          </span>
                        )}
                      />
                      <Column
                        field="TAUX_INTERET"
                        header="Taux d'Intérêt (%)"
                        body={(item) => (
                          <span>
                            {item?.TAUX_INTERET}
                          </span>
                        )}
                      />
                      <Column
                        field="STATUT "
                        header="Statut"
                        sortable
                        body={(item) => {
                          return (
                            item.statutscre ?
                              <Button className="btn-sm"
                                data-pr-tooltip={item.statutscre ? item.statutscre.DESCRIPTION : "-"}
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
                    </DataTable>
                    <div className="flex justify-content-end">

                    </div>
                  </Dialog>
                </div>
              </div>
              <div className="row g-3 justify-content-center">
                {/* Remboursé avec pénalité */}
                <div className="col-4" style={{ cursor: 'pointer' }}>
                  <div
                    className="bg-dark text-white text-center p-3  rounded"
                    style={{ height: '125px' }}
                    onClick={handleClickOpen}
                  >
                    <h5 className="fw-bold" style={{ fontSize: '12px' }}>Credits en Retards</h5>
                    <p className="h4 mt-5">{nombre}</p>
                  </div>


                  {/* Dialog */}
                  <Dialog
                    name="penalite"
                    visible={visible}

                    style={{ width: '70vw' }}
                    onHide={handleClose}
                    maximizable
                    header={
                      <div
                        className="dialog-header"
                        style={{
                          backgroundColor: '#fb8c8c',
                          padding: '1rem',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >

                      </div>
                    }
                  >
                    <DataTable
                      value={listItems}
                      paginator
                      rows={5}
                      header="Crédits Remboursé avec pénalité"
                      emptyMessage="Aucun enregistrement trouvé."
                    >
                      <Column
                        field="membresmicro.NOM"
                        header="Membre"
                        body={(item) => (
                          <span>
                            {item?.membresmicro?.NOM} {item?.membresmicro?.PRENOM}
                          </span>
                        )}
                      />
                      <Column
                        field="REFERENCE_CREDIT"
                        header="Référence"
                        body={(item) => (
                          <span>
                            {item?.REFERENCE_CREDIT}
                          </span>
                        )}
                      />
                      <Column
                        field="MONTANT_DEMANDE"
                        header="Montant Demandé"
                        body={(item) => (
                          <span>
                            {item?.MONTANT_DEMANDE}
                          </span>
                        )}
                      />
                      <Column
                        field="CAISSE_SOCIALE"
                        header="Caisse Sociale"
                        body={(item) => (
                          <span>
                            {item?.CAISSE_SOCIALE}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_DEMANDE"
                        header="Date de Demande"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_DEMANDE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_ECHEANCE"
                        header="Date d'Échéance"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_ECHEANCE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DUREE"
                        header="Durée (mois)"
                        body={(item) => (
                          <span>
                            {item?.DUREE}
                          </span>
                        )}
                      />
                      <Column
                        field="INTERET_TOTAL"
                        header="Intérêt Total"
                        body={(item) => (
                          <span>
                            {item?.INTERET_TOTAL}
                          </span>
                        )}
                      />
                      <Column
                        field="TAUX_INTERET"
                        header="Taux d'Intérêt (%)"
                        body={(item) => (
                          <span>
                            {item?.TAUX_INTERET}
                          </span>
                        )}
                      />

                      <Column
                        field="ETAT "
                        header="Statut"
                        sortable
                        body={(item) => {
                          return item?.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_RETARD ? (
                            <Button
                              className="btn-sm"
                              data-pr-tooltip="En Retard"
                              tooltip
                              tooltipOptions={{ position: "top" }}
                              style={{
                                width: 25,
                                height: 25,
                                backgroundColor: statutCreditsColor(item?.ID_STATUTS_CREDIT)
                                  .backgroundColor,
                                color: statutCreditsColor(item.ID_STATUTS_CREDIT).textColor,
                                border: "none",
                              }}
                              icon={(options) => {
                                return (
                                  <span
                                    className="mb-1"
                                    dangerouslySetInnerHTML={{
                                      __html: statutCreditsColor(item.ID_STATUTS_CREDIT).icon,
                                    }}
                                  />
                                );
                              }}
                            />
                          ) : (
                            <Button
                              className="btn-sm"
                              data-pr-tooltip="A temps"
                              tooltip
                              tooltipOptions={{ position: "top" }}
                              style={{
                                width: 25,
                                height: 25,
                                backgroundColor: statutCreditsColor(item.ID_STATUTS_CREDIT)
                                  .backgroundColor,
                                color: statutCreditsColor(item.ID_STATUTS_CREDIT).textColor,
                                border: "none",
                              }}
                              icon={(options) => {
                                return (
                                  <span
                                    className="mb-1"
                                    dangerouslySetInnerHTML={{
                                      __html: statutCreditsColor(item.ID_STATUTS_CREDIT).icon,
                                    }}
                                  />
                                );
                              }}
                            />
                          );
                        }}
                      />
                    </DataTable>
                    <div className="flex justify-content-end">

                    </div>
                  </Dialog>
                </div>


                {/* En attente */}

                <div className="col-4" style={{ cursor: 'pointer' }}>
                  <div
                    className="bg-dark text-white text-center p-3  rounded"
                    style={{ height: '125px' }}
                    onClick={handleClickOpenCreditEnattente}

                  >
                    <h5 className="fw-bold" style={{ fontSize: '12px' }}>Crédits En attente</h5>
                    <p className="h4 mt-5">{FormattedNbCreditsEttente}</p>
                  </div>


                  {/* Dialog */}
                  <Dialog
                    name="Attente"

                    visible={visibleAttente}
                    onHide={handleClose}
                    maximizable
                    style={{ width: '70vw' }}
                    header={
                      <div
                        className="dialog-header"
                        style={{
                          backgroundColor: '#fb8c8c',
                          padding: '1rem',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >

                      </div>
                    }
                  >
                    <DataTable
                      value={CreditsEnattente}
                      paginator
                      rows={5}
                      header="Crédits En attente"
                      emptyMessage="Aucun enregistrement trouvé."
                    >
                      <Column
                        field="membresmicro.NOM"
                        header="Membre"
                        body={(item) => (
                          <span>
                            {item?.membresmicro?.NOM} {item?.membresmicro?.PRENOM}
                          </span>
                        )}
                      />
                      <Column
                        field="REFERENCE_CREDIT"
                        header="Référence"
                        body={(item) => (
                          <span>
                            {item?.REFERENCE_CREDIT}
                          </span>
                        )}
                      />
                      <Column
                        field="MONTANT_DEMANDE"
                        header="Montant Demandé"
                        body={(item) => (
                          <span>
                            {item?.MONTANT_DEMANDE}
                          </span>
                        )}
                      />
                      <Column
                        field="CAISSE_SOCIALE"
                        header="Caisse Sociale"
                        body={(item) => (
                          <span>
                            {item?.CAISSE_SOCIALE}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_DEMANDE"
                        header="Date de Demande"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_DEMANDE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DATE_ECHEANCE"
                        header="Date d'Échéance"
                        body={(item) => (
                          <span>
                            {new Date(item?.DATE_ECHEANCE).toLocaleDateString()}
                          </span>
                        )}
                      />
                      <Column
                        field="DUREE"
                        header="Durée (mois)"
                        body={(item) => (
                          <span>
                            {item?.DUREE}
                          </span>
                        )}
                      />
                      <Column
                        field="INTERET_TOTAL"
                        header="Intérêt Total"
                        body={(item) => (
                          <span>
                            {item?.INTERET_TOTAL}
                          </span>
                        )}
                      />
                      <Column
                        field="TAUX_INTERET"
                        header="Taux d'Intérêt (%)"
                        body={(item) => (
                          <span>
                            {item?.TAUX_INTERET}
                          </span>
                        )}
                      />
                      <Column
                        field="STATUT "
                        header="Statut"
                        sortable
                        body={(item) => {
                          return (
                            item.statutscre ?
                              <Button className="btn-sm"
                                data-pr-tooltip={item.statutscre ? item.statutscre.DESCRIPTION : "-"}
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
                    </DataTable>
                    <div className="flex justify-content-end">

                    </div>
                  </Dialog>
                </div>
                {/* Pourcentage de remboursement */}
                <div className="col-4 d-flex justify-content-center">
                  <div
                    className="bg-dark text-white text-center p-3 rounded"
                    style={{
                      height: '125px',
                      width: '100%',
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <p className="mb-1" style={{ fontSize: '14px' }}>% Remboursement</p>

                    <div
                      className="d-flex justify-content-center align-items-center mt-2"
                      style={{ height: '60px', width: '100px', marginBottom: '8px' }}
                    >
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                          ...optionsPie,
                          chart: { ...optionsPie.chart, width: 120, height: 120 },
                        }}
                      />
                    </div>

                    {/* Centrer le texte avec flexbox */}
                    <div className="d-flex justify-content-center align-items-center" style={{ width: '100%' }}>
                      <p className="mb-0" style={{ fontSize: '14px', marginTop: "-80px", marginLeft: "20px" }}>{pourcentage}%</p>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        )}
        {/*  Historique de Transaction button */}
        {activeButton === 5 ? (
          <div className="container mt-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-center"
              style={{ color: '#143d8f', }}>Historique de toutes les Transaction</h5>
            <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between" >
              <div className="d-flex align-items-center">
                <div className="d-flex w-100 flex-column mx-2">
                  <Dropdown
                    value={Selectedoperation}
                    onChange={(e) => operationSelected(e.value)}
                    options={operationdata}
                    filter
                    filterBy="name"
                    optionLabel="name"
                    placeholder="Filtre par operation"
                    className="w-full md:w-10rem mx-3 no-p"
                    showClear
                    style={{ minWidth: 150 }}
                  />
                </div>
                <div className="d-flex flex-column mx-2">
                  <Calendar
                    value={dates}
                    onChange={(e) => setDates(e.value)}
                    selectionMode="range"
                    readOnlyInput
                    placeholder="Filtre par période"
                    inputStyle={{ padding: "9px 0.75rem" }}
                    showButtonBar
                    dateFormat="dd/mm/yy"
                    className="w-full md:w-14rem mx-3 no-p"
                    style={{ minWidth: 150 }}
                  />
                </div>
              </div>
            </div>


            {Transaction?.length > 0 ? (
              <div className="shadow rounded mt-3 pr-1 bg-white" style={{ paddingBottom: '4rem' }}>
                <DataTable
                  rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 300, 500, 1000]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate={`{first} - {last} dans ${TransanctionNombre} éléments`}
                  emptyMessage="Aucun élément trouvé"
                  value={Array.isArray(Transaction) && Transaction.map((item) => ({
                    // Ici on ajoute le jour de la semaine
                    date: format(new Date(item.DATE_OPERATION), "EEEE dd/MM/yyyy", { locale: fr }),
                    heure: format(new Date(item.DATE_OPERATION), "HH':'mm"),
                    montant:
                      parseFloat(item?.MONTANT).toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      }) + " BIF",
                    Libelle: item?.LIBELLE || "—",
                    note: item.TYPE_OPERATION || "—",
                    REFERENCE: item.REFERENCE || "—"
                  }))}
                  paginator
                  rows={10}
                  responsiveLayout="scroll"
                  stripedRows
                >
                  <Column field="date" header="Date" sortable />
                  <Column field="heure" header="Heure" sortable />
                  <Column field="montant" header="Montant" />
                  <Column field="REFERENCE" header="Référence" />
                  <Column field="Libelle" header="Libellé" />
                  <Column field="note" header="Opération" />
                </DataTable>

              </div>
            ) : (
              <p className="text-muted text-center" style={{ color: '#143d8f' }}>Aucune transaction enregistrée</p>
            )}
          </div>
        ) : null}




      </div >


    </>
  )
}
