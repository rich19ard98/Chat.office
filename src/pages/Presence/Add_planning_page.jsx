import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const initialForm = {
  TITRE_REUNION: "",
  LIEU_REUNION:"",
  HEURE_DEBUT: '',
  DATE_REUNION: "",
};
export default function Add_planning_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data,
    {
      TITRE_REUNION: {
        required: true,
        alpha: true,
      },
      LIEU_REUNION:{
        required: true,
        alpha: true,
      },
      DATE_REUNION: {
        required: true
      },
      HEURE_DEBUT: {
        required: true,
      },

    }, {

    TITRE_REUNION: {
      required: "Ce champ est obligatoire",
      alpha: "Le titre du reunion est invalide",
    },
    DATE_REUNION: {
      required: "Ce champ est obligatoire",
    },
    LIEU_REUNION:{
      required: "Ce champ est obligatoire",
      alpha: "Le lieu du reunion est invalide",
    },

    HEURE_DEBUT: {
      required: "Ce champ est obligatoire",
    },
  }
  );


  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("TITRE_REUNION", data.TITRE_REUNION);
        form.append("DATE_REUNION", data.DATE_REUNION);
        form.append("HEURE_DEBUT", data.HEURE_DEBUT);
        form.append("LIEU_REUNION", data.LIEU_REUNION);
        const res = await fetchApi(`/presence/Planning/planifierReunion`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Reunion planifier",
            detail: "La reunion a bien été planifie avec succès",
            life: 3000,
          })
        );
        navigate('/Planning');
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
    document.title = "Planification du reunion"
    dispacth(setBreadCrumbItemsAction([
      {
        path: 'Planning',
        name: 'Liste des planing'
      },
      {
        path: 'Planning_new',
        name: 'Planification du reunion'
      },
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="row">
          <div className="d-flex align-items-center justify-content-between w-100">
            <h3 className="mb-3">Planning reunion</h3>
            <div className="d-flex align-items-center">

              <div className="form-group ">
                <Button
                  className=" mt-9 mb-3 ml-3 button-mobile  px-2 py-1 "
                  label="Retour"
                  size="small"
                  onClick={() => {
                    navigate("/Planning");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                    <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                  </svg>
                </Button>

              </div>
            </div>
          </div>
          <hr className="w-100" />
        </div>
        <form className="form w-100 mt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm mt-5">
            <div className="form-group row ">
              <div className="col-md-2">
                <label htmlFor="TITRE_REUNION" className="label mb-1">Titre du reunion</label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le titre"
                  id="TITRE_REUNION"
                  name="TITRE_REUNION"
                  value={data.TITRE_REUNION}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("TITRE_REUNION") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("TITRE_REUNION") ? getError("TITRE_REUNION") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="LIEU_REUNION" className="label mb-1">Lieu du reunion</label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le lieu du réunion"
                  id="LIEU_REUNION"
                  name="LIEU_REUNION"
                  value={data.LIEU_REUNION}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("LIEU_REUNION") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("LIEU_REUNION") ? getError("LIEU_REUNION") : ""}
                </div>
              </div>
            </div>

            <div className="form-group row ">

            <div className="col-md-2">
                <label htmlFor="DATE_REUNION" className="label mb-1">
                  Date planifier
                </label>
              </div>
              <div className="col-sm">
                <Calendar
                  value={data.DATE_REUNION}
                  name="DATE_REUNION"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("DATE_REUNION", e.value);
                    setError("DATE_REUNION", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date de vente"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "DATE_REUNION" } });
                  }}

                  className={`d-block w-100 ${hasError("DATE_REUNION") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("DATE_REUNION") ? getError("DATE_REUNION") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="HEURE_DEBUT" className="label mb-1">
                  Heure du debut
                </label>
              </div>
              {/* <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly /> */}

              <div className="col-sm">
                <Calendar
                  value={data.HEURE_DEBUT}
                  name="HEURE_DEBUT"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("HEURE_DEBUT", e.value);
                    setError("HEURE_DEBUT", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date de vente"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "HEURE_DEBUT" } });
                  }}
                  timeOnly
                  className={`d-block w-100 ${hasError("HEURE_DEBUT") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("HEURE_DEBUT") ? getError("HEURE_DEBUT") : ""}
                </div>
              </div>

            </div>

          </div>
          <div
            style={{ position: "absolute", bottom: 0, right: 0 }}
            className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
          >
            <Button
              className="mt-3 ml-3 button-mobile"
              size="small"
              type="reset"
              outlined
              onClick={(e) => {
                e.preventDefault();
                setData(initialForm);
                setErrors({});
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
              </svg>
              <span className="ml-1" style={{ fontWeight: 'bold' }}>Reinitialiser</span>
            </Button>
            <Button
              className="mt-3 ml-3 button-mobile"
              size="small"
              type="submit"
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
              </svg>
              <span className="ml-1" style={{ fontWeight: 'bold' }}>Valider</span>
            </Button>
          </div>
        </form >
      </div >
    </>
  );
}

























