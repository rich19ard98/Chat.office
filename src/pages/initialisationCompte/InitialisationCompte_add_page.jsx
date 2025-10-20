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
import { InputTextarea } from "primereact/inputtextarea";
const initialForm = {
  selectedComptecredit: null,
  selectedComptedebit: null,
  DESCRIPTION: '',
  MONTANT: "",
  DATE_INITIALISATION: null

};

export default function InitialisationCompte_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [membre, setMembres] = useState([])
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
    selectedComptecredit: {
      required: true,
    },
    MONTANT: {
      required: true,
      number: true
    },
  },
    {
      MONTANT: {
        required: "Ce champ est obligatoire",
        number: "Il faut mettre un nombre entier"
      },
      DATE_INITIALISATION: {
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
        form.append("COMPTE_ID_SENS_DEBIT", selectedComptedebit.code);
        form.append("COMPTE_ID_SENS_CREDIT", selectedComptecredit.code);
        form.append("DESCRIPTION", data.DESCRIPTION);
        form.append("MONTANT", data.MONTANT);
        form.append("DATE_INITIALISATION", data.DATE_INITIALISATION);

        const res = await fetchApi(`/initialisationCompte/initialisationCompte/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Initialisation enregistré",
            detail: "Initialisation a été enregistré avec succès",
            life: 3000,
          })
        );
        const resultant = res.result
        navigate("/initialisation");
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
      }
        else if (error.httpStatus === 400) {
          setErrors(getErrors());
          dispacth(
            setToastAction({
              severity: "warn",
              summary: "Erreur lors de Initialisation Compte",
              detail: 'Montant insuffisant .',

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
    } finally {
      setIsSubmitting(false);
    }
  };

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


  const [comptes, setComptes] = useState([])
  const fetchComptes = useCallback(async () => {
    try {
      const res = await fetchApi(`/plancomptable/comptescomptables/fetch?`);
      if (res && res.result && res.result.data) {
        setComptes(res.result.data.map(access => ({
          name: `${access.NOM} ${access.CODE}`,              // Garde le libellé lisible
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

  const handleCompteChangedebit = (e) => {
    setSelectedComptedebit(e.value);
    const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

  };
  const handleCompteChangecredit = (e) => {
    setSelectedComptecredit(e.value);
    const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

  };

  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouvelle initialisation</h1>
          <div className="d-flex align-items-center">
            <div className="form-group ">



            </div>
          </div>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mzt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="TYPE" className="label mb-1">
                  Compte debit
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
                <label htmlFor="PERIODE" className="label mb-1">
                  Compte credit
                </label>
              </div>
              <div className="col-sm">
                <div className="col-sm">
                  <Dropdown
                    value={selectedComptecredit}
                    options={comptes}
                    onChange={handleCompteChangecredit}
                    optionLabel="name"
                    id="selectedComptecredit"
                    filter
                    filterBy="name"
                    placeholder="Sélectionner le compte"
                    emptyFilterMessage="Aucun élément trouvé"
                    emptyMessage="Aucun élément trouvé"
                    name="selectedComptecredit"
                    onHide={() => {
                      checkFieldData({ target: { name: "selectedComptecredit" } });
                    }}
                    className={`w-100 ${hasError("selectedComptecredit") ? "p-invalid" : ""}`}
                  // showClear
                  />
                  <div
                    className="invalid-feedback"
                    style={{ minHeight: 21, display: "block" }}
                  >
                    {hasError("selectedComptecredit") ? getError("selectedComptecredit") : ""}
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="form-group col-sm">

            <div className="row">
              <div className="col-md-4">
                <label htmlFor="MONTANT" className="label mb-1">
                  Montant
                </label>
              </div>
              <div className="col-sm">

                <InputText
                  type="text"
                  placeholder={"Ecrire le Montant"}
                  id="MONTANT"
                  name="MONTANT"
                  value={data.MONTANT}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("MONTANT") ? "p-invalid" : ""}`}
                //disabled={paye}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                  {hasError("MONTANT") ? getError("MONTANT") : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DATE_INITIALISATION" className="label mb-1">
                  Date d'initialisation
                </label>
              </div>
              <div className="col-sm">
                <Calendar
                  value={data.DATE_INITIALISATION}
                  name="DATE_INITIALISATION"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("DATE_INITIALISATION", e.value);
                    setError("DATE_INITIALISATION", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "DATE_INITIALISATION" } });
                  }}

                  className={`d-block w-100 ${hasError("DATE_INITIALISATION") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("DATE_INITIALISATION") ? getError("DATE_INITIALISATION") : ""}
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
            />
          </div>
        </form>
      </div>
      {/* </>
      )} */}

    </>
  );
}
