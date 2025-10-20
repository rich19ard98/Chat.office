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
  TYPE: null,
  PARIODE: null,
  DESCRIPTION: '',
  PERIODE_NUMERIQUE: "",
  DATE_BILAN: null

};

export default function Bilans_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [membre, setMembres] = useState([])
  const [operations, setOperations] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {

    TYPE: {
      required: true,
    },
    DESCRIPTION: {
      required: false,
    },
    PERIODE: {
      required: true,
    },
    PERIODE_NUMERIQUE: {
      required: true,
      number: true
    },
  },
    {
      PERIODE_NUMERIQUE: {
        required: "Ce champ est obligatoire",
        number: "Il faut mettre un nombre entier"
      },
      DATE_BILAN: {
        required: "Ce champ est obligatoire",

      },
      TYPE: {
        required: "Ce champ est obligatoire",

      },
      PERIODE: {
        required: "Ce champ est obligatoire",

      },
      DESCRIPTION: {
        required: "Ce champ est obligatoire",
      },



    });

  const [periode, setPeriode] = useState([
    {
      code: 0,
      name: 'Mensuel'
    },
    {
      code: 1,
      name: 'Trimestriel'
    },
    {
      code: 2,
      name: 'Annuel'
    },

  ]);
  const [type, setType] = useState([
    {
      code: 0,
      name: "Ouverture"
    },
    {
      code: 1,
      name: "Clôture"
    },

  ])


  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("TYPE", data.TYPE.code);
        form.append("PERIODE", data.PERIODE.code);
        form.append("DESCRIPTION", data.DESCRIPTION);
        form.append("PERIODE_NUMERIQUE", data.PERIODE_NUMERIQUE);
        form.append("DATE_BILAN", data.DATE_BILAN);

        const res = await fetchApi(`/bilan/bilan/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "bilan enregistré",
            detail: "Bilan a été enregistré avec succès",
            life: 3000,
          })
        );
        const resultant=res.result
         navigate(`/bilan/details?id=${resultant}`);
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
  // useEffect(() => {
  //   dispacth(
  //     setBreadCrumbItemsAction([
  //       administration_routes_items.frais_adh,
  //       administration_routes_items.frais_adh_add,
  //     ])
  //   );
  //   return () => {
  //     dispacth(setBreadCrumbItemsAction([]));
  //   };
  // }, []);


  // Liste deroularantes des membres
  // const fetchMembres = useCallback(async () => {
  //   try {
  //     const res = await fetchApi("/cotisation/membres_microfinance/fetch?rows=100000&");


  //     setMembres(
  //       res.result.data.map((clM) => {
  //         return {
  //           name: `${clM.NOM} ${clM.PRENOM}`,
  //           code: clM.ID_MEMBRES_MICROFINANCE,
  //         };
  //       })
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);
  // useEffect(() => {
  //   fetchMembres();
  // }, []);

  // Liste deroularantes des operations
  // const fetchOperation = useCallback(async () => {
  //   try {
  //     const res = await fetchApi("/cotisation/types_operations_comptables/fetchtypeoperation?rows=100000&");


  //     setOperations(
  //       res.result.data.map((clM) => {
  //         return {
  //           name: clM.NOM_OPERATION,
  //           code: clM.ID_TYPES_OPERATIONS,
  //         };
  //       })
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);

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
  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouveau bilan</h1>
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
                  Type
                </label>
              </div>
              <div className="col-sm">
                <div className="col-sm">
                  <Dropdown
                    value={data.TYPE}
                    options={type}
                    onChange={(e) => setValue("TYPE", e.value)}
                    optionLabel="name"
                    id="TYPE"
                    filter
                    placeholder="Sélectionner le type du bilan "
                    className={`w-100 ${hasError("TYPE") ? "p-invalid" : ""
                      }`}
                    showClear
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
                  Periode
                </label>
              </div>
              <div className="col-sm">
                <div className="col-sm">
                  <Dropdown
                    value={data.PERIODE}
                    options={periode}
                    onChange={(e) => setValue("PERIODE", e.value)}
                    optionLabel="name"
                    id="PERIODE"
                    filter
                    placeholder="Sélectionner la periode d'operation "
                    className={`w-100 ${hasError("PERIODE") ? "p-invalid" : ""
                      }`}
                    showClear
                  />
                  <div
                    className="invalid-feedback"
                    style={{ minHeight: 21, display: "block" }}
                  >
                    {hasError("PERIODE") ? getError("PERIODE") : ""}
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="form-group col-sm">

            <div className="row">
              <div className="col-md-4">
                <label htmlFor="NOM_ENTITE" className="label mb-1">
                  Periode numerique
                </label>
              </div>
              <div className="col-sm">

                <InputText
                  type="text"
                  placeholder={"Ecrire la periode numerique"}
                  id="PERIODE_NUMERIQUE"
                  name="PERIODE_NUMERIQUE"
                  value={data.PERIODE_NUMERIQUE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("PERIODE_NUMERIQUE") ? "p-invalid" : ""}`}
                //disabled={paye}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                  {hasError("PERIODE_NUMERIQUE") ? getError("PERIODE_NUMERIQUE") : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DATE_BILAN" className="label mb-1">
                  Date du bilan
                </label>
              </div>
              <div className="col-sm">
                <Calendar
                  value={data.DATE_BILAN}
                  name="DATE_BILAN"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("DATE_BILAN", e.value);
                    setError("DATE_BILAN", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "DATE_BILAN" } });
                  }}

                  className={`d-block w-100 ${hasError("DATE_BILAN") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("DATE_BILAN") ? getError("DATE_BILAN") : ""}
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
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
      {/* </>
      )} */}

    </>
  );
}
