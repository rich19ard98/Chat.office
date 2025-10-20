import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import fetchApi from "../../helpers/fetchApi";
import { InputText } from "primereact/inputtext";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";

const initialForm = {
  NOM_PARAMETRE: "",
  VALEUR: "",
  DESCRIPTION: "",

};

export default function Parametres_edit_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { ID_PARAMETRE } = useParams();
  const [parametre, setParametre] = useState([]);
  const [loadingparametre ,setLoadingParametre] = useState(true);

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
    NOM_PARAMETRE: {
      required: true,
      length: [1, 100],
      alpha: true
    },
    VALEUR: {
      required: true,
      length: [1, 5],
      decimal: true,
    },
    DESCRIPTION: {
      // required: true,
      // alpha: true,
      // length: [1, 30],
    },

  }, {
    NOM_PARAMETRE: {
      required: "Ce champ est obligatoire",
      length: "La description ne doit pas depasser max(100 caracteres)",
      alpha: "Le Nom de la parametre est invalide"
    },
    VALEUR: {
      required: "Ce champ est obligatoire",
      // length: "La description ne doit pas depasser max(30 caracteres)",
      // alpha: "La d est invalide"
    },
    DESCRIPTION: {
      required: 'Ce champ est obligatoire',
      alpha: "La description est invalide",
      // length: "La description ne doit pas depasser max(30 caractéres)",
    },
  });


  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      if (isValidate()) {
        setIsSubmitting(true)
        const form = new FormData()
        form.append("NOM_PARAMETRE", data.NOM_PARAMETRE);
        form.append("VALEUR", data.VALEUR);
        form.append("DESCRIPTION", data.DESCRIPTION);
        const res = await fetchApi(`/credits/parametres_financiers/updateParametre/${ID_PARAMETRE}`, {
          method: "PUT",
          body: form,
        });
        dispacth(
          setToastAction({
            severity: "success",
            summary: "Parametre modifié",
            detail: "Le parametre a été modifié avec succès",
            life: 3000,
          })
        );
        navigate("/parametres_financiers");
      }
      else {
        console.log(getErrors())
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: 'La validation des données a échouée',
            detail: 'Veuillez corriger les erreurs mentionnées pour continuer',
            life: 3000,
          })
        );
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }

      }
    }
    catch (error) {
      console.log(error)
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(setToastAction({
          severity: 'error',
          summary: 'Erreur du système',
          detail: 'Erreur du système, réessayez plus tard',
          life: 3000
        }));
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      } else {
        dispacth(setToastAction({
          severity: 'error',
          summary: 'Erreur du système',
          detail: 'Erreur du système, réessayez plus tard',
          life: 3000
        }));
      }

    } finally {
      setIsSubmitting(false)
    }
  }



  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi(`/credits/parametres_financiers/findOneParametre/${ID_PARAMETRE}`);
        //console.log(res);

        const uti = res.result;
        setParametre(uti);
        setData({
          NOM_PARAMETRE: uti.NOM_PARAMETRE,
          VALEUR: uti.VALEUR,
          DESCRIPTION: uti.DESCRIPTION
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingParametre(false);
        
      }
    })();
  }, []);


  useEffect(() => {
    document.title = "Editer"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'parametres_financiers',
        name: 'Liste'
      },
      {
        path: 'edit_parametres_financiers',
        name: 'Editer'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);



  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  if (loadingparametre) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100">
        <div className="spinner-border" role="status" />
      </div>
    );
  }
  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">
            {parametre?.NOM_PARAMETRE}
          </h1>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row mb-3">
             
              <div className="col-md-2">
                <label htmlFor="NOM_CLASSE" className="label mb-1">Nom d'un parametere</label>
              </div>
              <div className="col-sm me-3">
                <InputText
                  id="NOM_PARAMETRE"
                  name="NOM_PARAMETRE"
                  value={data.NOM_PARAMETRE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("NOM_PARAMETRE") ? "p-invalid" : ""}`}
                  placeholder="Ecrire  le nom d'un paramatre"
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                  {hasError("NOM_PARAMETRE") ? getError("NOM_PARAMETRE") : ""}
                </div>
              </div>
             
              <div className="col-md-2">
                <label htmlFor="VALEUR" className="label mb-1">Intérêt</label>
              </div>
              <div className="col-sm">
                <InputText
                  id="VALEUR"
                  name="VALEUR"
                  value={data.VALEUR}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("VALEUR") ? "p-invalid" : ""}`}
                  placeholder="Saisir l'Intérêt "
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                  {hasError("VALEUR") ? getError("VALEUR") : ""}
                </div>
              </div>
            </div>
            {/* Ligne 2 : Description */}
            <div className="row mb-3">
              <div className="col-md-2">
                <label htmlFor="DESCRIPTION" className="label mb-1">Description</label>
              </div>
              <div className="col-sm">
                <InputText
                  id="DESCRIPTION"
                  name="DESCRIPTION"
                  value={data.DESCRIPTION}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("DESCRIPTION") ? "p-invalid" : ""}`}
                  placeholder="Saisir la description"
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
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
              label="Annuler"
              type="reset"
              outlined
              className="mt-3"
              size="small"
              onClick={(e) => {
                navigate("/parametres_financiers");
              }}
            />
            <Button
              label="Modifier"
              type="submit"
              className="mt-3 ml-3"
              size="small"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </>
  );
}
