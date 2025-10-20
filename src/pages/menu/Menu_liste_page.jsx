import { Link, Outlet, useNavigate, useNavigation, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import { Calendar } from "primereact/calendar";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Badge } from 'primereact/badge'
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import { InputSwitch } from 'primereact/inputswitch';

import { Tooltip } from 'primereact/tooltip';
//import statutComdeMedicaColor from "../../helpers/statutComdeAccessColor";
import { decodeId, encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { useForm } from "../../hooks/useForm";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import Credits_liste_page from "../credits/Credits_liste_page";
import Credits_add_page from "../credits/Credits_add_page";
import Membre_microfinance_list_page from "../cotisations/Membre_microfinance_list_page";
import Edit_membre_microfinance from "../cotisations/Edit_membre_microfinance";
import Frais_adhesions_liste_page from "../frais_adhesions/Frais_adhesions_liste_page";
import Remboursement_credit_liste_page from "../credits/Remboursement_credit_liste_page";
import EcrituresComptablesListePage from "../plancomptable/Ecriturescomptables_liste_page";
import Cotisation_liste_page from "../cotisations/Cotisation_liste_page";
import Comptabilite_liste_page from "../comptabilites/Comptablite_liste_page";



const initialForm = {
  MEMBRE_ID: null,
  MONTANT_DEMANDE: "",

  DUREE: "",

  DATE_ECHEANCEL: "",
  TYPE_OPERATION_ID: "",
  ID_TYPES_CREDIT: "",
  //membre
  NOM: "",
  PRENOM: "",
  EMAIL: "",
  TELEPHONE: "",
  ADRESSE: "",
  DATE_NAISSANCE: "",
  PHOTO_PASSPORT: "",
  LIEU_NAISSANCE: "",
  PHOTO_CNI: "",
  CNI_NUMERO: "",
  SEXE: 0,
 
  MONTANT: "",
  MODE_PAIEMENT: '',
  

  DATE_ENREGISTREMENT: "",
  MONTANT_CAPITAL: "",
  
  UTILISATEUR_ID: "",
  CREDIT_ID: "",
 

  //operation
  NOM_OPERATION: "",
  COMPTE_DEBIT: "",
  COMPTE_CREDIT: "",
};


export default function Menu_liste_page() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(1);

  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [globalLoading, setGloabalLoading] = useState(false);
  const [membredata, setmembredata] = useState([]);
  const [statusdata, setstatusdata] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingm, setIsSubmittingm] = useState(false);
  const [isSubmittingme, setIsSubmittingme] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [selectedstatus, setSelectedstatus] = useState(null);
  const [activeButton, setActiveButton] = useState(1)
  const [affichecredit, setAfficheCredit] = useState(1)
  const [afficheMembre, setAfficheMembre] = useState(1)
  const [afficheFrais, setAfficheFrais] = useState(1)
  const [afficheRemboursement, setAfficheRemboursement] = useState(1)
  const [afficheCotisation, setAfficheCotisation] = useState(1)
  const [afficheCharge, setAfficheCharge] = useState(1)

  const [montantTotal, setMontantTotal] = useState(0);
  const navigate = useNavigate();
  const [membres, setmembres] = useState();
  const [membre, setMembre] = useState([]);
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [typesoperation, setTypeOperation] = useState([]);
  const [typescredit, setTypescredit] = useState([]);
  const [codes, setCodes] = useState(null);
  const [operations, setOperations] = useState([])
  const [Credits, setCredits] = useState([]);
  const [Creditse, setCreditse] = useState([]);
  const [isMontantCapitalDisabled, setIsMontantCapitalDisabled] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState(null);
  const [comptes_comptables, setComptes_comptables] = useState([]);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
  const [utilisateurdata, setutilisateurdata] = useState([]);
  const [Selectedoperation, setSelecteoperation] = useState(null);
  const [operationdata, setoperationdata] = useState([]);
  //[selectedMembre, setSelectedMembre] = useState(null);
  const [selectedcomptedebit, setSelectedcomptedebit] = useState(null);
  const [selectedcomptecredit, setSelectedcomptecredit] = useState(null);
  const [montantTotalDebit, setMontantTotalDebit] = useState(0);
  const [montantTotalCredit, setMontantTotalCredit] = useState(0);
  const [ecritures, setEcritures] = useState([]);
  const [charge_depenses, setCharge_depenses] = useState([]);
  const [membres_microfinance, setMembres_microfinance] = useState(null);
  const [frais, setFrais] = useState([]);
  const [remboursement_credit, setRemboursement_credit] = useState([]);
  const { ID_MEMBRES_MICROFINANCE: encodedStr } = useParams();
  const ID_MEMBRES_MICROFINANCE = decodeId(encodedStr);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [detail_users, setDetail_users] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [fetchRemboursementPrecoceInfo, setfetchRemboursementPrecoceInfo] = useState()
  //console.log({ id });

  const [loadingUtilisateur, setLoadingUtilisateur] = useState(true);






  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
    MEMBRE_ID: {
      required: activeButton === 1 ? true : false,
    },
    MONTANT_DEMANDE: {
      required: activeButton === 1 ? true : false,
      alpha: true,
      decimal: true
    },

    DUREE: {
      required: activeButton === 1 ? true : false,
      //decimal: true,
    },

    TYPE_OPERATION_ID: {
      required: activeButton === 1 ? true : false,
    },
    ID_TYPES_CREDIT: {
      required: activeButton === 1 ? true : false,
    },
   

  },
    {
      MEMBRE_ID: {
        required: "Ce champ est obligatoire",
      },
      MONTANT_DEMANDE: {
        required: "Ce champ est obligatoire",
        alpha: "Le montant  est invalide",
        decimal: "La montant doit etre un nombre reel"
      },

      DUREE: {
        required: "Ce champ est obligatoire",
      },

      DATE_ECHEANCE: {
        required: "Ce champ est obligatoire",

      },
      TYPE_OPERATION_ID: {
        required: "Ce champ est obligatoire",

      },

      ID_TYPES_CREDIT: {
        required: "Ce champ est obligatoire",

      },


    }
  );
  const [modePaiement, setModePaiement] = useState([
    {
      code: 0,
      name: 'Espèce'
    },
    {
      code: 1,
      name: 'Bancaire'
    },
    {
      code: 2,
      name: 'Virement'
    },

  ]);


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
              {
               
              }

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

  const [sexe, setSexe] = useState([
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
    }
  ])


  useEffect(() => {
    dispacth(
      setBreadCrumbItemsAction([
        administration_routes_items.credits,
        administration_routes_items.add_credits,
      ])
    );
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MEMBRE_ID", data.MEMBRE_ID?.code);
        form.append("MONTANT_DEMANDE", data.MONTANT_DEMANDE);
        form.append("TAUX_INTERET", data.TAUX_INTERET);
        form.append("DUREE", data.DUREE);
        form.append("INTERET_TOTAL", data.INTERET_TOTAL);
        form.append("DATE_ECHEANCE", data.DATE_ECHEANCE);
        form.append("CAISSE_SOCIALE", data.CAISSE_SOCIALE);
        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID?.code);
        form.append("ID_TYPES_CREDIT", data.ID_TYPES_CREDIT?.code);

        const res = await fetchApi("/credits/credits/createCredits", {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: " Le crédit initie",
            detail: "Le crédit a bien été initie avec succès",
            life: 3000,
          })
        );
        //navigate('/credits')
        handleButtonClickCredit(1)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitmembre = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmittingme(true);
        const form = new FormData();
        form.append("NOM", data.NOM);
        form.append("PRENOM", data.PRENOM);
        form.append("EMAIL", data.EMAIL);
        form.append("TELEPHONE", data.TELEPHONE);
        form.append("ADRESSE", data.ADRESSE);
        form.append("DATE_NAISSANCE", moment(data.DATE_NAISSANCE).format("YYYY-MM-DD"));

        form.append("LIEU_NAISSANCE", data.LIEU_NAISSANCE);
        console.log(data.LIEU_NAISSANCE);

        form.append("CNI_NUMERO", data.CNI_NUMERO);
        form.append("SEXE", data.SEXE);

        // Vérifie si PHOTO_PASSPORT et PHOTO_CNI sont bien des objets File
        if (data?.PHOTO_PASSPORT) {


          form.append("PHOTO_PASSPORT", data.PHOTO_PASSPORT); // Data est de type File, pas d'URL
        }

        if (data?.PHOTO_CNI) {


          form.append("PHOTO_CNI", data.PHOTO_CNI); // Data est de type File, pas d'URL
        }


        const res = await fetchApi(`/cotisation/membres_microfinance/createMembre`, {
          method: "POST",
          body: form,
          "Content-Type": "multipart/form-data"
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Le membre enregistré",
            detail: "Le Membre a été enregistré avec succès",
            life: 3000,
          })
        );
        // navigate("/membre_microfinance");
        handleButtonClickMembre(1)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmittingme(false);
    }
  };

  const handleSubmitfrais = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MONTANT", data.MONTANT);
        form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);
        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID.code);
        form.append("MEMBRE_ID", data.MEMBRE_ID.code);


        const res = await fetchApi(`/fraisAdhesions/frais_adhesions/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Frais d'adhesion enregistré",
            detail: "Frais d'adhesion a été enregistré avec succès",
            life: 3000,
          })
        );
        //navigate("/frais_adh");
        handleButtonClickFrais(1)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCotisation = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MONTANT", data.MONTANT);
        form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);
        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID.code);
        form.append("MEMBRE_ID", data.MEMBRE_ID.code);


        const res = await fetchApi(`/cotisation/cotisations/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Cotisation enregistré",
            detail: "Cotisation a été enregistré avec succès",
            life: 3000,
          })
        );
        //navigate("/cotisation");
        handleButtonClickCotisation(1)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitrembourese = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("CREDIT_ID", data.CREDIT_ID?.code);
        form.append("MONTANT_CAPITAL", data.MONTANT_CAPITAL);
        //form.append("MONTANT_PENALITE", data.MONTANT_PENALITE);

        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID?.code);

        const res = await fetchApi("/credits/remboursement_credit/create", {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: " Le remboursement initie",
            detail: "Le remboursement a bien été initie avec succès",
            life: 3000,
          })
        );
        //navigate('/remboursement_credit')
        handleButtonClickRemboursement(1)
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    }

    catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
      else
        if (error.statusCode == 400) {
          setErrors(getErrors());
          dispacth(
            setToastAction({
              severity: "warn",
              summary: "Erreur lors de paiement",
              detail:
                " Désole Le Montant Rembourse ne depasse pas le montant total a payer",

              life: 3000,
            })
          );

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
    finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitopera = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("NOM_OPERATION", data.NOM_OPERATION);
        form.append("COMPTE_DEBIT", data.COMPTE_DEBIT?.code);
        form.append("COMPTE_CREDIT", data.COMPTE_CREDIT?.code);
        const res = await fetchApi(`/cotisation/types_operations_comptables/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Le type d'operation enregistré",
            detail: "Le type d'operation a été enregistré avec succès",
            life: 3000,
          })
        );
        navigate("/types_operations_comptables");
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
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

  const calculateTotals = useCallback(() => {
    if (ecritures.length > 0) {

      const filteredEcritures = Selectedoperation?.name
        ? ecritures.filter((e) => e.TYPE_OPERATION === Selectedoperation.name)
        : ecritures;


      const totalDebit = filteredEcritures.reduce(
        (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
        0
      );

      const totalCredit = filteredEcritures.reduce(
        (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
        0
      );


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

  const onPage = (event) => {
    setlazyState(event);
  };

  const onSort = (event) => {
    setlazyState(event);
  };
  const membresSelected = (membre) => {
    setSelectedMembre(membre);
  };
  const statusSelected = (status) => {
    setSelectedstatus(status);
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

  // const onSelectAllChange = (event) => {
  //   const selectAll = event.checked;

  //   if (selectAll) {
  //     setSelectAll(true);
  //     setSelectedItems(menu);
  //   } else {
  //     setSelectAll(false);
  //     setSelectedItems([]);
  //   }
  // };



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

  const operationSelected = (operation) => {
    setSelecteoperation(operation);
  };
  //liste deroulante des utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    try {
      var url = `/administration/utilisateurs/fetch?`
      const res = await fetchApi(url);
      setutilisateurdata(
        res.result.data.map((util) => {
          return {
            name: `${util.NOM} ${util.PRENOM}`,
            code: util.ID_UTILISATEUR
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

  //lister les charges depenses
  const fetchCharge_depense = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/comptabilite/charges_depenses/fetchcharge?`;
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
      //   if (profil) {
      //     url += `profil=${profil.code}&`;
      //   }
      //   if (sessionutilisateurstatut) {
      //     url += `Utilisateurstatut=${sessionutilisateurstatut.code}&`;
      //   }

      const res = await fetchApi(url);
      // console.log(res, 'hhhhhhhhhhhhh');

      setCharge_depenses(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState,
    // /*profil,sessionutilisateurstatut

  ]);

  useEffect(() => {
    fetchCharge_depense();

  },
    [fetchCharge_depense]
  );



  const fetchmembres = useCallback(async () => {
    try {
      var url = `/cotisation/membres_microfinance/fetch?rows=100000&`
      const res = await fetchApi(url);
      //console.log(res,'yyyyyyyyyggdasa');
      
      setmembredata(
        res.result.data.map((util) => {
          return {
            name: `${util.NOM} ${util.PRENOM}`,
            code: util.ID_MEMBRES_MICROFINANCE,
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

  const fetchCredit = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/credits/credits/fetch?`;

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
      if (selectedMembre?.code) {
        url += `membresmicro=${selectedMembre.code}&`;
      }
      if (selectedstatus?.code) {
        url += `statutscre=${selectedstatus.code}&`;
      }
      const res = await fetchApi(url);
      const allcredits = res.result.data;

      let filteredcredits = allcredits;
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day");
        const end = moment(endDate).endOf("day");
        filteredcredits = allcredits.filter((credits) => {
          const operationDate = moment(credits.DATE_DEMANDE);
          return operationDate.isBetween(start, end, null, "[]");
        });
      }

      setCredits(filteredcredits);
      setTotalRecords(res.result.totalRecords);
      //setMontantTotal(totalMontant);


    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState,
    selectedMembre,
    selectedstatus,
    startDate,
    endDate,]);

  useEffect(() => {
    fetchCredit();
  }, [lazyState,
    selectedMembre,
    selectedstatus,
    startDate,
    endDate,]);
  useEffect(() => {
    setlazyState((s) => ({ ...s, first: 0 }));
  }, [

    selectedMembre,
    startDate,
    selectedstatus,
    endDate,]);


  useEffect(() => {
    document.title = "menu"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'menu',
        name: 'menu'

      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);



  const handleRemboursementPrecoce = async (selectedCreditId) => {
    if (!selectedCreditId) {
      console.log("Veuillez d'abord sélectionner un crédit.");
      return;
    }

    try {
      console.log("CREDIT_ID avant requête:", selectedCreditId);

      const res = await fetchApi(`/credits/RemboursementPrecoce/Fetch/${selectedCreditId}`);
      console.log("Infos remboursement précoce :", res);

      // Mise à jour du formulaire avec les informations reçues
      // setValue("MONTANT_CAPITAL", res.montantRestant);  // Montant restant à payer avant la pénalité
      // setPenalite(res.penalite1Pourcent);  // Pénalité de 1% sur le montant restant
      setValue("MONTANT_CAPITAL", res.totalARembourser); // afficher 51510 dans l'input
      setPenalite(res.penalite1Pourcent);
      setTotalRemboursement(res.totalARembourser);

      // Optionnel : afficher le total à payer (montant restant + pénalité)
      const totalRemboursement = parseFloat(res.montantRestant + res.penalite1Pourcent);
      setTotalRemboursement(totalRemboursement);  // Total à rembourser
      console.log("Total à rembourser avec pénalité : ", totalRemboursement);

      // Désactiver le champ de montant capital
      setIsMontantCapitalDisabled(true);

    } catch (error) {
      console.error("Erreur remboursement précoce :", error);
      console.error(error?.message || "Erreur lors du remboursement précoce.");
    }
  };

  //console.log('Active: ', activeButton)
  const ID_STATUTS_CREDIT = {
    ANNULE: 1,
    APPROUVE: 2,
    EN_ATTENTE_D_APPROBATION: 3,
    EN_COURS: 4,
    EN_RETARD: 5,
    REMBOURSE: 6,
  };

  const totalMontant = Credits.reduce((total, item) => {

    if (!item.statutscre || typeof item.statutscre.ID_STATUTS_CREDIT !== 'number') {
     // console.log("Crédit ignoré, statut manquant ou invalide :", item);
      return total;
    }


    console.log("Statut actuel :", item.statutscre.ID_STATUTS_CREDIT);


    if (
      item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.APPROUVE ||
      item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_RETARD ||
      item.statutscre.ID_STATUTS_CREDIT === ID_STATUTS_CREDIT.EN_COURS
    ) {
      const Montant = parseFloat(item.MONTANT_DEMANDE) || 0;
     // console.log("Montant ajouté :", Montant);
      return total + Montant;
    }


   // console.log("Montant ignoré :", item.MONTANT_DEMANDE); // Debugging
    return total;
  }, 0);

  //console.log('Total montant des crédits approuvés, en retard ou en cours :', totalMontant);

  const fetchEcritures = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/plancomptable/ecriturecomptable/fetch?";

      for (let key in lazyState) {
        const value = lazyState[key];
        if (value !== null && value !== undefined) {
          url += `${key}=${encodeURIComponent(typeof value === "object" ? JSON.stringify(value) : value)}&`;
        }
      }


      if (selectedUtilisateur?.code) {
        url += `utilisateurs=${selectedUtilisateur.code}&`;
      }
      if (selectedMembre?.code) {
        url += `membres_microfinance=${selectedMembre.code}&`;
      }
      if (Selectedoperation?.name) {
        url += `TYPE_OPERATION=${Selectedoperation.name}&`;
      }
      if (selectedcomptedebit) {
        url += `compte_debit=${selectedcomptedebit.code}&`;
      }
      if (selectedcomptecredit) {
        url += `compte_credit=${selectedcomptecredit.code}&`;
      }

      const res = await fetchApi(url);


      const allEcritures = res.result.data;
      const totalMontant = allEcritures.reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);


      let filteredEcritures = allEcritures;
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day");
        const end = moment(endDate).endOf("day");
        filteredEcritures = allEcritures.filter((ecriture) => {
          const operationDate = moment(ecriture.DATE_OPERATION);
          return operationDate.isBetween(start, end, null, "[]");
        });
      }

      setEcritures(filteredEcritures);
      setTotalRecords(res.result.totalRecords);
      setMontantTotal(totalMontant);

    } catch (error) {
      console.error("Erreur lors du chargement des écritures comptables :", error);
    } finally {
      setLoading(false);
    }
  }, [
    lazyState,
    selectedUtilisateur,
    selectedMembre,
    Selectedoperation,
    selectedcomptecredit,
    selectedcomptedebit,
    startDate,
    endDate,
  ]);
  useEffect(() => {
    fetchEcritures();

  }, [lazyState.first,
  lazyState.rows,
    selectedUtilisateur,
    selectedMembre,
    Selectedoperation,
    selectedcomptecredit,
    selectedcomptedebit,
    startDate,
    endDate,]);

  useEffect(() => {
    setlazyState((s) => ({ ...s, first: 0 }));
  }, [
    selectedUtilisateur,
    selectedMembre,

    Selectedoperation,
    selectedcomptedebit,
    selectedcomptecredit,
    startDate,
    endDate,]);

  //fonction pour lister les frais d'adhesion
  const fetchFraisAdhesion = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/fraisAdhesions/frais_adhesions/fetch?`;

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
      setFrais(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);

  useEffect(() => {
    fetchFraisAdhesion();
  }, [lazyState]);

  const handleSubmitmodiermembre = async (e) => {
    try {
      e.preventDefault();
      console.log("Submitting form with data:", data); // Log form data
      if (isValidate()) {
        setIsSubmittingm(true);
        const form = new FormData();
        form.append("NOM", data.NOM);
        form.append("PRENOM", data.PRENOM);
        form.append("EMAIL", data.EMAIL);
        form.append("TELEPHONE", data.TELEPHONE);
        form.append("ADRESSE", data.ADRESSE);
        form.append("DATE_NAISSANCE", moment(data.DATE_NAISSANCE).format("YYYY-MM-DD"));

        form.append("LIEU_NAISSANCE", data.LIEU_NAISSANCE);


        form.append("CNI_NUMERO", data.CNI_NUMERO);
        form.append("SEXE", data.SEXE);

        // Vérifie si PHOTO_PASSPORT et PHOTO_CNI sont bien des objets File
        if (data?.PHOTO_PASSPORT) {
          console.log("Appending PHOTO_PASSPORT:", data.PHOTO_PASSPORT);

          form.append("PHOTO_PASSPORT", data.PHOTO_PASSPORT); // Data est de type File, pas d'URL

        } else {
          console.warn("PHOTO_PASSPORT is missing or invalid.");
        }

        if (data?.PHOTO_CNI) {
          console.log("Appending PHOTO_PASSPORT:", data.PHOTO_CNI);

          form.append("PHOTO_CNI", data.PHOTO_CNI); // Data est de type File, pas d'URL
        }
        else {
          console.warn("PHOTO_CNI is missing or invalid.");
        }

        const res = await fetchApi(`/cotisation/membres_microfinance/update/${id}`, {
          method: "POST",
          body: form,

        });
        //console.log(res);


        dispacth(
          setToastAction({
            severity: "success",
            summary: "Le membre enregistré",
            detail: "Le Membre a été Modifié avec succès",
            life: 3000,
          })
        );
        //navigate("/membre_microfinance");
        handleButtonClickMembre(1);
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmittingm(false);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi(`/cotisation/membres_microfinance/find/${id}?`);
    // console.log(res,'jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
     

        if (res && res.result) {
          const membre = res.result;
          setmembres(membre);
          setData({
            NOM: membre?.NOM,
            PRENOM: membre?.PRENOM,
            EMAIL: membre.EMAIL,
            TELEPHONE: membre.TELEPHONE,
            ADRESSE: membre.ADRESSE,
            DATE_NAISSANCE: new Date(membre.DATE_NAISSANCE),
            PHOTO_PASSPORT: membre.PHOTO_PASSPORT,
            LIEU_NAISSANCE: membre.LIEU_NAISSANCE,
            PHOTO_CNI: membre.PHOTO_CNI,
            CNI_NUMERO: membre.CNI_NUMERO,
            SEXE: membre.SEXE,
          });
        } else {
          console.error('Aucun membre trouvé ou réponse invalide', res);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du membre:', error);
      } finally {
        setLoadingUtilisateur(false);
      }
    })();
  }, []);


  //liste deroulante des remboursement
  const fetchRemboursement_credit = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/credits/remboursement_credit/fetch?rows=1000000`;
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
     // console.log(res, 'resssssssssssssssssssssssssssssssssssssssssssssssssssssssss');

      setRemboursement_credit(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]
    /*[lazyState,profil,sessionutilisateurstatut]*/
  );






  useEffect(() => {
    fetchRemboursement_credit();

  },
    [fetchRemboursement_credit]

  );

  //fonction pour lister les cotisation
  const fetchCotisation = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/cotisation/cotisations/fetch?rows=1000000&`;

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
      setFrais(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);

  useEffect(() => {
    fetchCotisation();
  }, [lazyState]);


  // liste deroulante des types operations
  const fetchOperation = useCallback(async () => {
    try {
      const res = await fetchApi(`/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`)


      setTypeOperation(
        res.result.data.map((tyop) => {
          return {
            name: tyop.NOM_OPERATION,
            code: tyop.ID_TYPES_OPERATIONS,
          };
        })
      );
      //console.log(res,"uuuuuuuuuuuuuuuuuuuuuuuuuu");

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchOperation()
  }, [])

  // liste deroulante des credits
  const fetchCredite = useCallback(async () => {
    try {
      const res = await fetchApi(`/credits/credits/fetchCredit?rows=1000000&`)


      setCreditse(
        res.result.data.map((access) => {

          return {
            name: `${access.REFERENCE_CREDIT} - ${access.membresmicro?.NOM || ''} ${access.membresmicro?.PRENOM || ''}`,
            code: access.ID_OCTROI_CREDIT,
          };


        })
      );
      //console.log(res,'jeaqnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchCredite()
  }, [])
  // liste deroulante des types operations
  const fetchTypescredit = useCallback(async () => {
    try {
      const res = await fetchApi(`/credits/types_credit/fetch?rows=1000000&`)


      setTypescredit(
        res.result.data.map((typc) => {
          return {
            name: typc.NOM_CREDIT,
            code: typc.ID_TYPES_CREDIT,
          };
        })
      );
      //console.log(res,"uuuuuuuuuuuuuuuuuuuuuuuuuu");

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchTypescredit()
  }, [])

  // liste deroulante des Comptes debit
  const fetchComptes_debit = useCallback(async () => {
    try {
      const res = await fetchApi(`/plancomptable/comptescomptables/fetch?rows=1000000&`)


      setComptes_comptables(
        res.result.data.map((tyop) => {
          return {
            name: tyop.NOM,
            code: tyop.ID_COMPTES_COMPTABLES,
          };
        })
      );
      //console.log(res, "uuuuuuuuuuuuuuuuuuuuuuuuuu");

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchComptes_debit()
  }, [])

  // liste deroulante des Comptes credit
  const fetchComptes_credit = useCallback(async () => {
    try {
      const res = await fetchApi(`plancomptable/comptescomptables/fetch?rows=1000000&`)


      setComptes_comptables(
        res.result.data.map((tyop) => {
          return {
            name: tyop.NOM,
            code: tyop.ID_COMPTES_COMPTABLES,
          };
        })
      );
      // console.log(res, "uuuuuuuuuuuuuuuuuuuuuuuuuu");

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchComptes_credit()
  }, [])



  //lister des membres du microfinance
  const fetchmembre_microfinance = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/cotisation/membres_microfinance/fetch?rows=1000000&`;
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
      if (membre) {
        url += `sexe=${membre.code}&`;
      }
      // if (sessionutilisateurstatut) {
      //   url += `Utilisateurstatut=${sessionutilisateurstatut.code}&`;
      // }

      const res = await fetchApi(url);
      //console.log(res,'uuuuuuuuuuuuujjjjjjjjjj');

      setMembres_microfinance(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState, membre]);

  useEffect(() => {
    fetchmembre_microfinance();
  }, [lazyState, membre]
  );



  useEffect(() => {
    document.title = "membre_microfinance"
    dispacth(setBreadCrumbItemsAction([administration_routes_items.membre_microfinance]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const MembreSelected = async (membre_nmicro) => {
    setMembre(membre_nmicro);
  };


  // liste deroulante des credits
  //   const fetchCredite = useCallback(async () => {
  //     try {
  //         const res = await fetchApi(`/credits/credits/fetchCredit?rows=1000000&`)


  //         setCredits(
  //             res.result.data.map((access) => {

  //                 return {
  //                     name: `${access.REFERENCE_CREDIT} - ${access.membresmicro?.NOM || ''} ${access.membresmicro?.PRENOM || ''}`,
  //                     code: access.ID_OCTROI_CREDIT,
  //                 };


  //             })
  //         );


  //         setCodes(res)
  //     } catch (error) {
  //         console.log(error);
  //     }
  // }, []);

  // useEffect(() => {
  //     fetchCredite()
  // }, [])

  const filteredcomptes_comptables = comptes_comptables.filter((comptes) => comptes.code !== data.COMPTE_DEBIT?.code)

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };
  const handleButtonClickCredit = (buttonId) => {
    setAfficheCredit(buttonId);
  };
  const handleButtonClickMembre = (buttonId) => {
    setAfficheMembre(buttonId);
  };
  const handleButtonClickFrais = (buttonId) => {
    setAfficheFrais(buttonId);
  };
  const handleButtonClickRemboursement = (buttonId) => {
    setAfficheRemboursement(buttonId);
  };
  const handleButtonClickCotisation = (buttonId) => {
    setAfficheCotisation(buttonId);

  };
  const handleButtonClickCharge = (buttonId) => {
    setAfficheCharge(buttonId);

  };
  return (
    <>


      <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center flex-wrap">
          {/* Recherche */}
          <div className="p-input-icon-left">
            <div className="d-flex align-items-center row w-100 borderless mx-1">
              {Array.from({ length: 7 }, (_, index) => (

                <button
                  key={index + 1}
                  className="col border-0 rounded-3 mx-1 mt-2"
                  onClick={() => handleButtonClick(index + 1)}
                  style={{
                    backgroundColor: activeButton === index + 1 ? '#669934' : '#FF8702',
                    color: 'white',
                    height: '50px',

                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s, transform 0.3s',
                    marginLeft: index === 0 ? '20px' : '0',
                    marginRight: index === 1 ? '20px' : '0s',
                    width: '200px', 

                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span className="font-bold">
                    {[
                      // Icône de Crédit
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-credit-card mx-2 mt-0" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm1 0v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                        <path d="M4 6h8v2H4V6zm0 3h8v2H4V9z" />
                      </svg>,

                      // Icône de Membre
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-people-fill mx-2" viewBox="0 0 16 16">
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                      </svg>,

                      // Icône de Frais d'Adhésions
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-cash mx-2" viewBox="0 0 16 16">
                        <path d="M7.5 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5zm0 14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zM0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm1 0v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                      </svg>,

                      // Icône de Remboursement améliorée
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-arrow-clockwise mx-2" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3.5a4.5 4.5 0 1 0 4.5 4.5h-1A3.5 3.5 0 1 1 8 3.5v1zM1 8a7 7 0 1 1 7 7v-1a6 6 0 1 0-6-6H1z" />
                      </svg>,

                      // Icône d'Écriture Comptable
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-pencil-square mx-2" viewBox="0 0 16 16">
                        <path d="M15.878 0.878a2 2 0 0 1 0 2.828l-2.828 2.828-2.828-2.828 2.828-2.828a2 2 0 0 1 2.828 0zM1 13.414V16h2.586l10.545-10.545-2.586-2.586L1 13.414z" />
                      </svg>,

                      // Icône de Charge Dépenses améliorée
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-bag-fill mx-2" viewBox="0 0 16 16">
                        <path d="M8 0a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4V2a2 2 0 0 1 2-2zm0 2H6v1h4V2zM1 5v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5H1z" />
                      </svg>,

                      // Icône de Cotisation améliorée
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" fill="currentColor" className="bi bi-wallet mx-2" viewBox="0 0 16 16">
                        <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5v7A1.5 1.5 0 0 1 14.5 13H1.5A1.5 1.5 0 0 1 0 11.5v-7zm1 0v7a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0-.5.5z" />
                        <path d="M1 5h14v2H1V5z" />
                      </svg>
                    ][index]}
                    {[
                      "Credit",
                      "Membre",
                      "Frais d'Adhesions",
                      "Remboursement",
                      "Ecriture comptable",
                      "Charge depenses",
                      "Cotisation"
                    ][index]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeButton === 1
            && affichecredit === 2 ?
            <button onClick={() => {

              handleButtonClickCredit(1)

                ; // Navigue vers l'URL
              // console.log(url); // Aff

            }} className="btn btn-primary ms-8">
              Affiche la liste
            </button>

            : null}
          {activeButton === 2 &&
            afficheMembre === 2 ? (
            <button
              onClick={() => {
                handleButtonClickMembre(1);
                // Navigue vers l'URL
                // console.log(url); // Aff
              }}
              className="btn btn-primary ms-5"
            >
              Affiche la liste
            </button>
          ) : null}
          {activeButton === 2 &&
            afficheMembre === 3 ? (
            <button
              onClick={() => {
                handleButtonClickMembre(1);
                // Navigue vers l'URL
                // console.log(url); // Aff
              }}
              className="btn btn-primary ms-5"
            >
              Affiche la liste
            </button>
          ) : null}
          {activeButton === 3 && afficheFrais === 2 ? (
            <button
              onClick={() => {
                handleButtonClickFrais(1);
                // Navigue vers l'URL
                // console.log(url); // Aff
              }}
              className="btn btn-primary ms-5"
            >
              Affiche la liste
            </button>
          ) : null}

          {activeButton === 4 && afficheRemboursement === 2 ? (
            <button onClick={() => {

              handleButtonClickRemboursement(1)

                ; // Navigue vers l'URL
              // console.log(url); // Aff

            }} className="btn btn-primary ms-5">
              Affiche la liste
            </button>

          ) : null}
          {activeButton === 6 && afficheCharge === 2 ? (
            <button onClick={() => {

              handleButtonClickCharge(1)

                ; // Navigue vers l'URL
              // console.log(url); // Aff

            }} className="btn btn-primary ms-5">
              Affiche la liste
            </button>

          ) : null}
          {activeButton === 7 && afficheCotisation === 2 ? (
            <button
              onClick={() => {
                handleButtonClickCotisation(1);
                // Navigue vers l'URL
                // console.log(url); // Aff
              }}
              className="btn btn-primary ms-5"
            >
              Affiche la liste
            </button>
          ) : null}
        </div>
      </div>
      {activeButton === 2 && (
        <>
          {afficheMembre === 3 && (
            <Edit_membre_microfinance />
          )}
        </>
      )}

      {activeButton === 7 ?
        <>
          {afficheCotisation === 1 ?
            <>
              <Cotisation_liste_page />
            </>
            : null}
        </>
        : null}

      {activeButton === 4 ?
        <>
          {afficheRemboursement === 1 ?
            <>
              <Remboursement_credit_liste_page />
            </>
            : null}
        </>
        : null}

      {activeButton === 3 ?
        <>
          {afficheFrais === 1 ?
            <>
              <Frais_adhesions_liste_page />
            </>



            : null}
        </>
        : null}

      {activeButton === 2 ?
        <>
          {afficheMembre === 1 ?
            <>
              <Membre_microfinance_list_page />
              {/* <Credits_add_page /> */}
            </>
            : null}
        </>
        : null
      }


      {activeButton === 1 ?
        <>


          {affichecredit === 1 ?
            <>
              <Credits_liste_page />
              {/* <Credits_add_page /> */}
            </>

            : null}

        </>
        : null
      }



      {activeButton === 5 ?
        <EcrituresComptablesListePage />


        : null
      }


      {activeButton === 6 ?
        <>
          {afficheCharge === 1 ?
            <Comptabilite_liste_page />

            : null}

        </>
        : null}



    </>

  );

}
