import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";

import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { Tooltip } from 'primereact/tooltip';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Credits_liste_page from "./Credits_liste_page";
import Credit_approuve_Page from "./Credit_approuve_Page";
import { encodeId } from "../../utils/IdEncryption";
import ID_STATUTS_CREDIT from "../../constants/ID_STATUTS_CREDIT";
import PROFILS from "../../constants/PROFILS";
const initialForm = {
  MEMBRE_ID: null,
  MONTANT_DEMANDE: "",
  DATE_ECHEANCEL: "",
  TYPE_OPERATION_ID: "",
  ID_TYPES_CREDIT: ""
};
export default function Credits_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [currentCredit, setCurrentCredit] = useState(null); // Initialisé à null
  const [membre, setMembre] = useState([]);
  const [codes, setCodes] = useState(null);
  const [modes, setModes] = useState([]);
  const idrls = encodeId()
  const user = useSelector(userSelector);
  const Ismembre = user.ID_PROFIL
  const Membre = Ismembre === 2 ? 0 : 1
  const [Frequencecredits, setFrequencecredits] = useState([])

  const [typesoperation, setTypeOperation] = useState([]);
  const [typescredit, setTypescredit] = useState([]);
  const [currentCreditId, setCurrentCreditId] = useState(null);
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
    MEMBRE_ID: {
      required: true,
    },
    MONTANT_DEMANDE: {
      required: true,
      alpha: true,
      decimal: true
    },

    // DUREE: {
    //   required: true,

    // },
    ID_TYPES_CREDIT: {
      required: true,
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

      TYPE_OPERATION_ID: {
        required: "Ce champ est obligatoire",

      },

      ID_TYPES_CREDIT: {
        required: "Ce champ est obligatoire",
      },
    }
  );
  const handleSubmitItems = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Terminer le  demamde de credit",
      message: (
        <div className="d-flex flex-column align-items-center">
          <div className="text-center mt-5">
            Voulez-vous vraiment faire le demande d'un credit ?
          </div>
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        handleSubmit(e, itemsIds); // Passer itemsIds si nécessaire
      },
    });
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MEMBRE_ID", data.MEMBRE_ID?.code);
        form.append("IS_CAISSIER", Membre);
        form.append("MONTANT_DEMANDE", data.MONTANT_DEMANDE);
        form.append("ID_TYPES_CREDIT", data.ID_TYPES_CREDIT?.code);

        const res = await fetchApi("/credits/credits/createCredits", {
          method: "POST",
          body: form,
        });
        const creditData = {
          id: res.result.ID_OCTROI_CREDIT, // 106 dans l'exemple
          reference: res.result.REFERENCE_CREDIT // "C/106/20250613"
        };
        navigate(`/credits`, { state: { refresh: true } });

        if (!creditData.id || !creditData.reference) {
          throw new Error("Données essentielles manquantes dans la réponse");
        }
        setCurrentCredit(creditData);
        setShowAddPageCredit(true);
        dispacth(
          setToastAction({
            severity: "success",
            summary: " Le crédit initie",
            detail: "Le crédit a bien été initie avec succès",
            life: 3000,
          })
        );
        // navigate('/credits')

        setCurrentCredit({
          id: res.ID_OCTROI_CREDIT,
          reference: res.REFERENCE_CREDIT
        });
        setShowAddPageCredit(true);

      }
      else {
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
      if (error.httpStatus === "UNAUTHORIZED") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur",
            detail: "Connectez-vous avec un compte autorisé pour accéder à cette fonctionnalité ou contacter votre administrateur.",
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
      } else
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
    } finally {
      setIsSubmitting(false);
    }
  };
  // liste deroulante des membres
  const fetchMembre = useCallback(async () => {
    try {
      const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&membre=${PROFILS.MEMBRE}`)
      setMembre(
        res.result.data.map((access) => {
          return {
            name: `${access.PRENOM} ${access.NOM}`,
            code: access.ID_UTILISATEUR,
          };
        })
      );
      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchMembre()
  }, [])
  // const FetchFrequenceCredits = useCallback(async () => {
  //   try {
  //     const baseurl = `/FrequenceCredits/Frequencecredits/fetch?Frequence=`;

  //     var url = baseurl;


  //     const res = await fetchApi(url);
  //     const filteredfrequence = res.result.data.filter((freqence) =>
  //       freqence.ID_FREQUENCE_CREDIT === 2

  //     );
  //     setFrequencecredits(
  //       filteredfrequence.map((typc) => {
  //         return {
  //           name: typc.NON_FREQUENCE_CREDIT,
  //           code: typc.ID_FREQUENCE_CREDIT,
  //         };
  //       })
  //     );



  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //   }
  // }, [,


  // ]);

  // useEffect(() => {
  //   FetchFrequenceCredits();
  // }, [
  // ]);
  // liste deroulante des types operations
  const fetchOperation = useCallback(async () => {
    try {
      const res = await fetchApi(`/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`);
      // Filtrer uniquement "Octroi d’un crédit bancaire" et "Octroi d’un crédit en espèce"
      const filtered = res.result.data.filter((tyop) =>
        tyop.NOM_OPERATION === "Octroi d'un crédit (Bancaire)" ||
        tyop.NOM_OPERATION === "Octroi d'un crédit en espèce"
      );
      // Mapper les données filtrées
      setTypeOperation(
        filtered.map((tyop) => ({
          name: tyop.NOM_OPERATION,
          code: tyop.ID_TYPES_OPERATIONS,
        }))
      );
      setCodes(res); // Tu peux aussi filtrer ici si nécessaire
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchOperation();
  }, []);
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
      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchTypescredit()
  }, [])


  useEffect(() => {
    document.title = "Nouveau crédits"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'credits',
        name: 'Crédits'
      },
      {
        path: 'add_credits',
        name: 'Nouveau'
      },

    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const [showAddPageCredit, setShowAddPageCredit] = useState(false)
  const handlAddPageCredit = (e) => {
    e.preventDefault(true)
    setShowAddPageCredit(true)
  }

  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">


        <div className="">
          <h1 className="mb-3">Nouveau Crédit</h1>
          <hr className="w-100" />

        </div>
        <form className="form w-75 mt-5" onSubmit={handleSubmit}>
          {/* <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="CREDIT_ID" className="label mb-1">
                  Credits
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.CREDIT_ID}
                  options={cred}
                  autoFocus
                  onChange={(e) => {
                    setValue("CREDIT_ID", e.value);
                    setSelectedCreditId(e.value);
                  }}
                  optionLabel="name"
                  id="CREDIT_ID"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le crédit"
                  emptyFilterMessage="Aucun élément trouvé"
                  emptyMessage="Aucun élément trouvé"
                  name="CREDIT_ID"
                  onHide={() => {
                    checkFieldData({ target: { name: "CREDIT_ID" } });
                  }}
                  className={`w-100 ${hasError("CREDIT_ID") ? "p-invalid" : ""}`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("CREDIT_ID") ? getError("CREDIT_ID") : ""}
                </div>


              </div>

            </div>
          </div> */}

          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="MEMBRE_ID" className="label mb-1">
                  Membre
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.MEMBRE_ID}
                  options={membre}
                  autoFocus
                  onChange={(e) => setValue("MEMBRE_ID", e.value)}
                  optionLabel="name"
                  id="MEMBRE_ID"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le crédit"
                  emptyFilterMessage="Aucun élément trouvé"
                  emptyMessage="Aucun élément trouvé"
                  name="MEMBRE_ID"
                  onHide={() => {
                    checkFieldData({ target: { name: "MEMBRE_ID" } });
                  }}
                  className={`w-100 ${hasError("MEMBRE_ID") ? "p-invalid" : ""}`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MEMBRE_ID") ? getError("MEMBRE_ID") : ""}
                </div>


              </div>

            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="ID_TYPES_CREDIT" className="label mb-1">
                  Type credit
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.ID_TYPES_CREDIT}
                  options={typescredit}
                  autoFocus
                  onChange={(e) => setValue("ID_TYPES_CREDIT", e.value)}
                  optionLabel="name"
                  id="ID_TYPES_CREDIT"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le crédit"
                  emptyFilterMessage="Aucun élément trouvé"
                  emptyMessage="Aucun élément trouvé"
                  name="ID_TYPES_CREDIT"
                  onHide={() => {
                    checkFieldData({ target: { name: "ID_TYPES_CREDIT" } });
                  }}
                  className={`w-100 ${hasError("ID_TYPES_CREDIT") ? "p-invalid" : ""}`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("ID_TYPES_CREDIT") ? getError("ID_TYPES_CREDIT") : ""}
                </div>


              </div>

            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="MONTANT_DEMANDE" className="label mb-1">
                  Montant
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Écrire le montant demandé"
                  id="MONTANT_DEMANDE"
                  name="MONTANT_DEMANDE"
                  value={data.MONTANT_DEMANDE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("MONTANT_DEMANDE") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MONTANT_DEMANDE") ? getError("MONTANT_DEMANDE") : ""}
                </div>


              </div>

            </div>
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white" >

            <Button
              label="Reinitialiser"
              type="reset"
              outlined
              className="mt-3"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                setData(initialForm);
                setErrors({});
              }}
            />
            <Button
              label="Demande credit"
              type="submit"
              className="mt-3 ml-3"
              size="small"
              onClick={(e) => handleSubmitItems(e)} // Passer l'événement e
              disabled={!isValidate()} // Désactiver si en soumission
            />
          </div>







        </form >

      </div >
      ?

    </>
  );
}
