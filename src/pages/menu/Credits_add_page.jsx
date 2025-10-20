import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
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

const initialForm = {
  MEMBRE_ID: null,
  MONTANT_DEMANDE: "",
  //TAUX_INTERET: "",
  DUREE: "",
  // INTERET_TOTAL: "",
  // CAISSE_SOCIALE: "",
  DATE_ECHEANCEL: "",
  TYPE_OPERATION_ID: "",
  ID_TYPES_CREDIT:""
};



export default function Credits_add_page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [membre, setMembre] = useState([]);
  const [codes, setCodes] = useState(null);
  const [typesoperation, setTypeOperation] = useState([]);
  const [typescredit, setTypescredit] = useState([]);
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
    MEMBRE_ID: {
      required: true,
    },
    MONTANT_DEMANDE: {
      required: true,
      alpha: true,
      decimal: true
    },
   
    DUREE: {
      required: true,
      //decimal: true,
    },
   
    TYPE_OPERATION_ID: {
      required: true,
    },
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
      // TAUX_INTERET: {
      //   required: "Ce champ est obligatoire",
      //   decimal: "Le taux d'interet est invalide",
      // },
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
        navigate('/credits')
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


  // liste deroulante des membres
  const fetchMembre = useCallback(async () => {
    try {
      const res = await fetchApi(`/cotisation/membres_microfinance/fetch?rows=1000000&`)
      // console.log(res, 'dcccccccccccccccccc');

      setMembre(
        res.result.data.map((access) => {
          return {
            name : `${access.PRENOM} ${access.NOM}`,


            code: access.ID_MEMBRES_MICROFINANCE,
          };
        })
      );
      //  console.log(res,"uuuuuuuuuuuuuuuuuuuuuuuuuu");

      setCodes(res)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchMembre()
  }, [])


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

// liste deroulante des types operations
const fetchTypescredit= useCallback(async () => {
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







  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="row">
          <div className="d-flex align-items-center justify-content-between w-100">
            <h1 className="mb-3">Crédit</h1>
            <div className="d-flex align-items-center">
              <div className="form-group ">

                <Button
                  className=" mb-3 ml-3 button-mobile  px-2 py-1 "
                  label="Retour"
                  size="small"
                  onClick={() => {
                    navigate("/credits");
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
        <form className="form w-80 mt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-2">
                <label htmlFor="MEMBRE_ID" className="label mb-1">
                  Membre
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.MEMBRE_ID}
                  options={membre}
                  onChange={(e) => setValue("MEMBRE_ID", e.value)}
                  optionLabel="name"
                  id="MEMBRE_ID"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le membre"
                  emptyFilterMessage="Aucun element trouvee"
                  emptyMessage="Aucun element trouvee"
                  name="MEMBRE_ID"
                  onHide={() => {
                    checkFieldData({ target: { name: "MEMBRE_ID" } });
                  }}
                  className={`w-100 ${hasError("MEMBRE_ID") ? "p-invalid" : ""
                    }`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MEMBRE_ID") ? getError("MEMBRE_ID") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="TYPE_OPERATION_ID" className="label mb-1">
                  Type operation
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.TYPE_OPERATION_ID}
                  options={typesoperation}
                  autoFocus
                  onChange={(e) => setValue("TYPE_OPERATION_ID", e.value)}
                  optionLabel="name"
                  id="TYPE_OPERATION_ID"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le type d'opération"
                  emptyFilterMessage="Aucun élément trouvé"
                  emptyMessage="Aucun élément trouvé"
                  name="TYPE_OPERATION_ID"
                  onHide={() => {
                    checkFieldData({ target: { name: "TYPE_OPERATION_ID" } });
                  }}
                  className={`w-100 ${hasError("TYPE_OPERATION_ID") ? "p-invalid" : ""}`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("TYPE_OPERATION_ID") ? getError("TYPE_OPERATION_ID") : ""}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-2">
                <label htmlFor="MONTANT_DEMANDE" className="label mb-1">
                  Montant demandé
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  // pattern="[0-9]
                  // {3}-[0-9]{3}-[0-9]{4}"
                  placeholder="Ecrire le montant demande"
                  id="MONTANT_DEMANDE"
                  name="MONTANT_DEMANDE"
                  value={data.MONTANT_DEMANDE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("MONTANT_DEMANDE") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MONTANT_DEMANDE") ? getError("MONTANT_DEMANDE") : ""}
                </div>
              </div>


              <div className="col-md-2">
                <label htmlFor="DUREE" className="label mb-1">
                  Durée
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire la durée"
                  name="DUREE"
                  id="DUREE"
                  value={data.DUREE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 is-invalid ${hasError("DUREE") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("DUREE") ? getError("DUREE") : ""}
                </div>
              </div>
            </div>
            <div className="row">
            <div className="col-md-2">
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
                  placeholder="Sélectionner le type de credit"
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
              label="Valide"
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
