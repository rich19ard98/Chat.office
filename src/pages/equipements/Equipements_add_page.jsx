import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
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
// import Frais_adhesions_liste_page from "./Frais_adhesions_liste_page";
import { InputTextarea } from "primereact/inputtextarea";
const initialForm = {
  DUREE_VIE: "",
  selectedComptedebit: null,
  DESCRIPTION: '',
  VALEUR_BRUTE: "",
  DATE_ACQUISITION: null

};

export default function Equipements_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [membre, setMembres] = useState([])
  const [loading, setLoading] = useState(true);
   const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
  const [PrixEquipement, setPrixEquipement] = useState(null);
  const [operations, setOperations] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [selectedComptedebit, setSelectedComptedebit] = useState(null);
  const [selectedComptecredit, setSelectedComptecredit] = useState(null);

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle({ ...data, selectedComptedebit, selectedComptecredit }, {

    selectedComptedebit: {
      required: true,
    },
    DESCRIPTION: {
      required: false,
    },
 
    VALEUR_BRUTE: {
      required: true,
      number: true
    },
  },
    {
      VALEUR_BRUTE: {
        required: "Ce champ est obligatoire",
        number: "Il faut mettre un nombre entier"
      },
      DATE_ACQUISITION: {
        required: "Ce champ est obligatoire",

      },
      selectedComptedebit: {
        required: "Ce champ est obligatoire",

      },
      selectedComptecredit: {
        required: "Ce champ est obligatoire",

      },
      DESCRIPTION: {
        required: "Ce champ est obligatoire",
      },



    });




  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();

        form.append("COMPTE_ID", selectedComptedebit.code);
        form.append("CODE_EQUIP", selectedComptedebit.equipe);
         form.append("DUREE_VIE", data.DUREE_VIE);
        form.append("OBSERVATION", data.DESCRIPTION);
        form.append("VALEUR_BRUTE", data.VALEUR_BRUTE);
        form.append("DATE_ACQUISITION", data.DATE_ACQUISITION);

        const res = await fetchApi(`/equipements/equipements/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Equipements enregistré",
            detail: "Equipements a été enregistré avec succès",
            life: 3000,
          })
        );
        const resultant = res.result
        navigate("/equipements");
        //setShowAddPageFrais(true)
        
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
        
      } else {
        dispacth(
           setToastAction({
                                severity: "warn",
                                summary: "Montant non disponible",
                                detail: "Le montant n'est pas disponible",
                                life: 5000,
                            })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
    //api d'approbation credit
    const fetchMontantTotalCredits = useCallback(async () => {
      try {
        setLoading(true);
  
        let url = "/rapport/findCoutRevenuCredits/fetch?";
  
  
        const res = await fetchApi(url);
  
  
        // Mise à jour selon la structure du backend corrigé
  
        setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))
  
  
  
      } catch (error) {
        console.error("Erreur lors de la récupération des crédits :", error);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchMontantTotalCredits();
    }, []);
  const fetchOperation = useCallback(async () => {
    try {
      const res = await fetchApi("/cotisation/types_operations_comptables/fetchtypeoperation?rows=100000&");

      const filteredOperations = res.result.data.filter((clM) =>
        clM.NOM_OPERATION === "Frais d'adhésion (Bancaire)" ||
        clM.NOM_OPERATION === "Frais d'adhésion (en espèce)"
      );

      setOperations(
        filteredOperations.map((clM) => ({
          name: clM.NOM_OPERATION,
          code: clM.ID_TYPES_OPERATIONS,
        }))
      );

    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchOperation();
  }, []);
  // const [showAddPageFrais, setShowAddPageFrais] = useState(false)
  // const handlAddPageFrais = (e) => {
  //   e.preventDefault(true)
  //   setShowAddPageFrais(true)
  // }

  const [comptes, setComptes] = useState([])



  const handleCompteChangedebit = (e) => {
    setSelectedComptedebit(e.value);
    const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

  };
  const handleCompteChangecredit = (e) => {
    setSelectedComptecredit(e.value);
    const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

  };
  const fetchComptes = useCallback(async () => {
    try {
      const res = await fetchApi(`/plancomptable/comptescomptables/fetchActif_et_Classe2?`);
      if (res && res.result && res.result.data) {
        setComptes(res.result.data.map(access => ({
          name: `${access.NOM} ${access.CODE}`,
          equipe:access.CODE,           // Garde le libellé lisible
          code: access.ID_COMPTES_COMPTABLES, // ✅ code est un number pur
        })));
      } else {
        console.error("Données non trouvées dans la réponse.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes :", error);
    }
  }, []);
  useEffect(() => {
    fetchComptes();
  }, [fetchComptes]);


  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouveau equipenment</h1>
          <div className="d-flex align-items-center">
            <div className="form-group ">

              {/* <Button
                    className=" mb-3 ml-3 button-mobile  px-2 py-1 "
                    label="Affiche liste"
                    size="small"
                    onClick={handlAddPageFrais}
                  > */}
              {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                        <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                      </svg> */}
              {/* </Button> */}

            </div>
          </div>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mzt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="TYPE" className="label mb-1">
                  Compte
                </label>
              </div>
              <div className="col-sm">
                <div className="col-sm">
                  <Dropdown
                    value={selectedComptedebit}
                    options={comptes}
                    onChange={handleCompteChangedebit}
                    optionLabel="name"
                    id="selectedComptedebit"
                    filter
                    filterBy="name"
                    placeholder="Sélectionner le compte"
                    emptyFilterMessage="Aucun élément trouvé"
                    emptyMessage="Aucun élément trouvé"
                    name="selectedComptedebit"
                    onHide={() => {
                      checkFieldData({ target: { name: "selectedComptedebit" } });
                    }}
                    className={`w-100 ${hasError("selectedComptedebit") ? "p-invalid" : ""}`}
                  // showClear
                  />
                  <div
                    className="invalid-feedback"
                    style={{ minHeight: 21, display: "block" }}
                  >
                    {hasError("TYPE") ? getError("TYPE") : ""}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="form-group col-sm">

            <div className="row">
              <div className="col-md-4">
                <label htmlFor="VALEUR_BRUTE" className="label mb-1">
                  Valeur brute
                </label>
              </div>
              <div className="col-sm">

                <InputText
                  type="text"
                  placeholder={"Ecrire la periode numerique"}
                  id="VALEUR_BRUTE"
                  name="VALEUR_BRUTE"
                  value={data.VALEUR_BRUTE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("VALEUR_BRUTE") ? "p-invalid" : ""}`}
                //disabled={paye}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                  {hasError("VALEUR_BRUTE") ? getError("VALEUR_BRUTE") : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DATE_ACQUISITION" className="label mb-1">
                  Date d'acquisition
                </label>
              </div>
              <div className="col-sm">
                <Calendar
                  value={data.DATE_ACQUISITION}
                  name="DATE_ACQUISITION"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("DATE_ACQUISITION", e.value);
                    setError("DATE_ACQUISITION", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "DATE_ACQUISITION" } });
                  }}

                  className={`d-block w-100 ${hasError("DATE_ACQUISITION") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("DATE_ACQUISITION") ? getError("DATE_ACQUISITION") : ""}
                </div>
              </div>

            </div>
          </div>
  <div className="form-group col-sm">

            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DUREE_VIE" className="label mb-1">
                 Duree a vie
                </label>
              </div>
              <div className="col-sm">

                <InputText
                  type="text"
                  placeholder={"Ecrire la periode numerique"}
                  id="DUREE_VIE"
                  name="DUREE_VIE"
                  value={data.DUREE_VIE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("DUREE_VIE") ? "p-invalid" : ""}`}
                //disabled={paye}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                  {hasError("DUREE_VIE") ? getError("DUREE_VIE") : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DESCRIPTION" className="label mb-1">
                  Description
                </label>
              </div>
              <div className="col-sm">
                <div className="col-sm">
                  <InputTextarea
                    type="text"
                    placeholder="Ecrire la dscription"
                    id="DESCRIPTION"
                    name="DESCRIPTION"
                    value={data?.DESCRIPTION}
                    onChange={handleChange}
                    onBlur={checkFieldData}
                    rows={3}
                    cols={30}
                    className={`w-100 ${hasError("DESCRIPTION") ? "p-invalid" : ""}`}
                  />
                  <div
                    className="invalid-feedback"
                    style={{ minHeight: 21, display: "block" }}
                  >
                    {hasError("DESCRIPTION") ? getError("DESCRIPTION") : ""}
                  </div>
                </div>

              </div>
            </div>
          </div>




          <div
            style={{ position: "absolute", bottom: 0, right: 0 }}
            className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
          >
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
              label="Envoyer"
              type="submit"
              className="mt-3 ml-3"
              size="small"
              disabled={!isValidate()}
              // disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
      {/* </>
      )} */}

    </>
  );
}
