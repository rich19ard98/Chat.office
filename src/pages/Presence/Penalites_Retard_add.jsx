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
import PROFILS from "../../constants/PROFILS";

const initialForm = {
  MONTANT: "",
  N_PENALITE_RETARD: '',


};

export default function Penalites_Retard_add() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [membre, setMembres] = useState([])
  const [operations, setOperations] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
    MONTANT: {
      required: true,
      alpha: true,
      decimal: true
    },
    N_PENALITE_RETARD: {
      required: true,
    },
  
  },
    {
      MONTANT: {
        required: "Ce champ est obligatoire",
        alpha: "La quantite d'alert est invalide",
        decimal: "Le montant doit etre un nombre réel"
      },
      N_PENALITE_RETARD: {
        required: "Ce champ est obligatoire",

      },
    


    });

  const [nom_penalite, setnom_penalite] = useState([
    {
      code: 0,
      name: 'Retard'
    },
    {
      code: 1,
      name: 'Absent'
    },
 

  ]);



  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MONTANT", data.MONTANT);
        form.append("N_PENALITE_RETARD", data.N_PENALITE_RETARD.code);
        const res = await fetchApi(`/presence/Penalite_retard/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Penalite_retard enregistré",
            detail: "Penalite_retard a été enregistré avec succès",
            life: 3000,
          })
        );
        navigate("/Penalite_retard");
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
        administration_routes_items.Penalite_retard,
        administration_routes_items.Nouveau_Penalite_retard,
      ])
    );
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);


  // Liste deroularantes des membres
  const fetchMembres = useCallback(async () => {
    try {
      const res = await fetchApi(`/administration/utilisateurs/fetch?rows=100000&membre=${PROFILS.MEMBRE}`);


      setMembres(
        res.result.data.map((clM) => {
          return {
            name: `${clM.NOM} ${clM.PRENOM}`,
            code: clM.ID_UTILISATEUR,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchMembres();
  }, []);

  //Recuperation des operations
  const fetchOperation = useCallback(async () => {
    try {
      const res = await fetchApi("/cotisation/types_operations_comptables/fetchtypeoperation?rows=100000&");

      const filteredOperations = res.result.data.filter((clM) =>
        clM.NOM_OPERATION === "Cotisations Membres (Bancaire)" ||
        clM.NOM_OPERATION === "Cotisations Membres (Espèce)"
      );
      setOperations(
        filteredOperations.map((clM) => {
          return {
            name: clM.NOM_OPERATION,
            code: clM.ID_TYPES_OPERATIONS,
          };
        }
        )
      );




    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchOperation();
  }, []);
  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouveau Type penalite</h1>
          <div className="d-flex align-items-center">
            <div className="form-group ">
            </div>
          </div>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mt-5" onSubmit={handleSubmit}>
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
                  placeholder="Ecrire le montant"
                  id="MONTANT"
                  name="MONTANT"
                  value={data.MONTANT}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("MONTANT") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MONTANT") ? getError("MONTANT") : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="N_PENALITE_RETARD" className="label mb-1">
                  Nom
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.N_PENALITE_RETARD}
                  options={nom_penalite}
                  onChange={(e) => setValue("N_PENALITE_RETARD", e.value)}
                  optionLabel="name"
                  id="N_PENALITE_RETARD "
                  filter
                  filterBy="name"
                  placeholder="Type Penalite"
                  emptyFilterMessage="Aucun élement trouvée"
                  emptyMessage="Aucun element trouvee"
                  name="N_PENALITE_RETARD "
                  onHide={() => {
                    checkFieldData({ target: { name: "N_PENALITE_RETARD " } });
                  }}
                  className={`w-100 ${hasError("N_PENALITE_RETARD") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("N_PENALITE_RETARD") ? getError("N_PENALITE_RETARD") : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group col-sm">
            <div className="row">
           
          
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
