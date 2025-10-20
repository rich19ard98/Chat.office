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
import { useNavigate, useParams } from "react-router-dom";
import { Image } from "primereact/image";
import { decodeId } from "../../utils/IdEncryption";
/**
 * Récupérer toutes les Comptes comptables
 * @date  15/04/2025
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author rosine <gahimbarerosine9@gmail.com>
 */
const initialForm = {
  CODE: "",
  NOM: "",
  TYPE: "",
  CLASSE_ID: null,

};

export default function Comptescomptables_edit_Page() {
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [showCalendar, setShowCalendar] = useState(false);
  const [Classes, setClasses] = useState([]);
 
  const [TYPE, setTYPES] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { ID_COMPTES_COMPTABLES } = useParams();
  
  const [comptesComptables, setComptescomptables] = useState([]);
  const [loading, setLoading] = useState(true);

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
    CODE: {
      required: true,
      length: [1, 50],
      number: true
    },
    NOM: {
      required: true,
      length: [1, 50],
      alpha: true
    },
    TYPE: {
      required: true,
      
    },
    
    CLASSE_ID: {
      required: true,
      
    }
  },
    {
      CODE: {
        required: "Le code est obligatoire",
        length: "Le code ne doit pas dépasser 50 caractères",
        number: "Le code est invalide"
      },
      NOM: {
        required: "Le nom est obligatoire",
        length: "Le nom ne doit pas dépasser 50 caractères",
        alpha: "Le nom est invalide"
      },
      TYPE: {
        required: "Le type est obligatoire",
       
      },
      
      CLASSE_ID: {
        required: "La classe comptable est obligatoire",
        
      }
    }
  );
  

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      if (isValidate()) {
        setIsSubmitting(true)
        const form = new FormData()
        form.append("CODE", data.CODE);
        form.append("NOM", data.NOM);
        form.append("TYPE", data.TYPE?.code ?? "");
        form.append("CLASSE_ID", data.CLASSE_ID?.code ? data.CLASSE_ID?.code : '');

        const res = await fetchApi(`/plancomptable/comptescomptables/update/${ID_COMPTES_COMPTABLES}`, {
          method: "POST",
          body: form,
        });
        dispacth(
          setToastAction({
            severity: "success",
            summary: "comptes comptables modifié",
            detail: "Le comptes comptables a été modifié avec succès",
            life: 3000,
          })
        );
        navigate("/comptecomptable");
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

  

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetchApi("/plancomptable/classcomptable/fetch?");
      const classes = res.result.data.map((CLASSE) => ({
        name: CLASSE.NOM_CLASSE,
        code: CLASSE.ID_CLASSE_COMPTABLE,
      }));
      setClasses(classes);
    } catch (err) {
      console.error("Erreur lors du chargement des classes :", err);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  const [typeCompte , setTypeCompte]= useState(
    [
      { name: "Actifs", code: 0 },
      { name: "Passifs", code: 1 },
      { name: "Produits", code: 2 },
      { name: "Charges", code: 3 },
    ]
  )

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi(`/plancomptable/comptescomptables/find/${ID_COMPTES_COMPTABLES}`);
        const uti = res.result;
        setComptescomptables(uti);
  
        
        setData({
          CODE: uti.CODE,
          NOM: uti.NOM,
         
          CLASSE_ID: {
            name: uti.classe_comptable.NOM_CLASSE,
            code: uti.classe_comptable.ID_CLASSE_COMPTABLE,
          },
          TYPE: uti.TYPE == 0 ? typeCompte[0] : uti.TYPE == 1 ? typeCompte[1] : uti.TYPE == 2 ? typeCompte[2] : uti.TYPE == 3 ? typeCompte[3] : typeCompte[3]
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  useEffect(() => {
    document.title = "Editer compte comptable"
    dispacth(
      setBreadCrumbItemsAction([
        {
          path: "comptecomptable/edit/:ID_COMPTES_COMPTABLES",
          name: "Modifier  le compte comptable",
        },
      ])
    );
    fetchClasses();
    return () => dispacth(setBreadCrumbItemsAction([]));
  }, []);

 
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100">
        <div className="spinner-border" role="status" />
      </div>
    );
  }
  return (
    <>
      <div className="px-4 py-3 main_content bg-white has_footer">
  <div>
    <h1 className="mb-3">
      {comptesComptables.NOM}
    </h1>
    <hr className="w-100" />
  </div>
  
  <form className="form w-80 mt-5" onSubmit={handleSubmit}>
    <div className="form-group col-sm">
      
      {/* Ligne 1 : Nom & Code */}
      <div className="row">
        {/* Nom */}
        <div className="col-md-2">
          <label htmlFor="NOM" className="label mb-1">Nom</label>
        </div>
        <div className="col-sm">
          <InputText
            type="text"
            placeholder="Ecrire le nom"
            id="NOM"
            name="NOM"
            value={data.NOM}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-100 ${hasError("NOM") ? "p-invalid" : ""}`}
          />
          <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
            {hasError("NOM") ? getError("NOM") : ""}
          </div>
        </div>

        {/* Code */}
        <div className="col-md-2">
          <label htmlFor="CODE" className="label mb-1">Code</label>
        </div>
        <div className="col-sm">
          <InputText
            type="text"
            placeholder="Ecrire le CODE"
            id="CODE"
            name="CODE"
            value={data.CODE}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-100 ${hasError("CODE") ? "p-invalid" : ""}`}
          />
          <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
            {hasError("CODE") ? getError("CODE") : ""}
          </div>
        </div>
      </div>

      {/* Ligne 2 : Type & Classe */}
      <div className="row">
        {/* Type */}
        <div className="col-md-2">
          <label htmlFor="TYPE" className="label mb-1">Type</label>
        </div>
        <div className="col-sm">
          <Dropdown
            value={data.TYPE}
            options={typeCompte}
            onChange={(e) => setValue("TYPE", e.value)}
            optionLabel="name"
            id="TYPE"
            filter
            filterBy="name"
            placeholder="Sélectionner le Type"
            emptyFilterMessage="Aucun élément trouvé"
            emptyMessage="Aucun élément trouvé"
            name="TYPE"
            onHide={() => { checkFieldData({ target: { name: "TYPE" } }); }}
            className={`w-100 ${hasError("TYPE") ? "p-invalid" : ""}`}
            showClear
          />
          <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
            {hasError("TYPE") ? getError("TYPE") : ""}
          </div>
        </div>

        {/* Classe */}
        <div className="col-md-2">
          <label htmlFor="CLASSE_ID" className="label mb-1">Classe</label>
        </div>
        <div className="col-sm">
          <Dropdown
            value={data.CLASSE_ID}
            options={Classes}
            onChange={(e) => setValue("CLASSE_ID", e.value)}
            optionLabel="name"
            id="CLASSE_ID"
            filter
            filterBy="name"
            placeholder="Sélectionner la classe"
            emptyFilterMessage="Aucun élément trouvé"
            emptyMessage="Aucun élément trouvé"
            name="CLASSE_ID"
            onHide={() => { checkFieldData({ target: { name: "CLASSE_ID" } }); }}
            className={`w-100 ${hasError("CLASSE_ID") ? "p-invalid" : ""}`}
            showClear
          />
          <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
            {hasError("CLASSE_ID") ? getError("CLASSE_ID") : ""}
          </div>
        </div>
      </div>

    </div>

    {/* Submit Button */}
    <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
      


            <Button
              label="Annuler"
              type="reset"
              //outlined
              className="mt-3 p-button-outlined"
              size="small"
              onClick={(e) => {
                navigate("/comptecomptable");
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
