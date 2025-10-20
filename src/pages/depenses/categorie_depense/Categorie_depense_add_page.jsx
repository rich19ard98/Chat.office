import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../../store/actions/appActions";
import { comptabilite_routes_items } from "../../../routes/admin/comptabilite_routes";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../../hooks/useForm";
import { useFormErrorsHandle } from "../../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../../helpers/wait";
import Loading from "../../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { InputTextarea } from "primereact/inputtextarea";

const initialForm = {
  NOM_DEPENSES: "",
  DESCRIPTION: '',
 
};

export default function Categorie_depense_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
    
      NOM_DEPENSES: {
        required: true,
        length: [1, 100],
        alpha: true,
      },
      DESCRIPTION: {
        //required: true,
        alpha:true
      },
    },
    {
      NOM_DEPENSES: {
        required: "Ce champ est obligatoire",
        length: "Le nom de depense   ne doit pas depasser max(100 caracteres)",
        alpha: "Le nom de depense est invalide",
      },
      DESCRIPTION: {
        //required: "Ce champ est obligatoire",
        alpha: "La description est invalide",
      },

    });

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("NOM_DEPENSES", data.NOM_DEPENSES);
        form.append("DESCRIPTION", data.DESCRIPTION);


        const res = await fetchApi(`/depenses/categorieDepense/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "La catégorie dépense  enregistré",
            detail: "La catégorie dépense  a été enregistré avec succès",
            life: 3000,
          })
        );
        navigate("/categDep");
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
  useEffect(() => {
    dispacth(
      setBreadCrumbItemsAction([
        comptabilite_routes_items.categDep,
    comptabilite_routes_items.categDep_add,
      ])
    );
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);
  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouveau</h1>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="NOM_DEPENSES" className="label mb-1">
                  Nom de dépense
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le nom de la categorie"
                  id="NOM_DEPENSES"
                  name="NOM_DEPENSES"
                  value={data.NOM_DEPENSES}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("NOM_DEPENSES") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("NOM_DEPENSES") ? getError("NOM_DEPENSES") : ""}
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
                <InputTextarea
                  type="text"
                  placeholder="Ecrire la description"
                  id="DESCRIPTION"
                  name="DESCRIPTION"
                  value={data.DESCRIPTION}
                  onChange={handleChange}
                  onBlur={checkFieldData}
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
    </>
  );
}
