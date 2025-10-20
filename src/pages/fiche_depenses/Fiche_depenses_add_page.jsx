import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm"; // Adjust the path as needed
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { encodeId } from "../../utils/IdEncryption";
import { comptabilite_routes_items } from "../../routes/admin/comptabilite_routes";
import { useLocation } from 'react-router-dom';
const initialForm = {
  DATE_DEPENSE: "", MODE_PAIEMENT: "", BENEFICIAIRE: "", IS_BENEFICIAIRE: ""
};

export default function Fiche_depenses_add_page() {
  const dispacth = useDispatch();
  //   const [fourn, setFourn] = useState([]);
  const [employ, setEmploy] = useState([]);
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);

  const location = useLocation();
  const { ldetails } = location.state || { ldetails: [] };
  const [fourn, setFourn] = useState([]); // Add this line at the top of your component
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data,
    {
      DATE_DEPENSE: {
        required: true,
      },

      MODE_PAIEMENT: {
        required: true
      },
      BENEFICIAIRE: {
        required: true
      },

      IS_BENEFICIAIRE: {
        required: true,

      },

    },
    {
      DATE_DEPENSE: {
        required: "Ce champ est obligatoire",
      },
      MODE_PAIEMENT: {
        required: "Ce champ est obligatoire",
      },
      BENEFICIAIRE: {
        required: "Ce champ est obligatoire",
      },
      IS_BENEFICIAIRE: {
        required: 'Ce champ est obligatoire'
      },

    }
  );

  const [isbeneficaire, setIsbeneficairet] = useState([
    {
      code: 1,
      name: 'Employe'
    },
    {
      code: 0,
      name: 'Fournisseur'
    },

  ]);
  const [modePaiement, setModePaiement] = useState([
    {
      code: 0,
      name: 'Espèce'
    },
    {
      code: 1,
      name: 'Bancaire'
    },
    {
      code: 2,
      name: 'Virement'
    },

  ]);
  // console.log(ldetails);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("DATE_DEPENSE", moment(data.DATE_DEPENSE).format("YYYY-MM-DD"));
        form.append('BENEFICIAIRE', data.BENEFICIAIRE?.code);
        form.append("IS_BENEFICIAIRE", data.IS_BENEFICIAIRE.code);
        form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);

        const res = await fetchApi(`/depenses/fiche_depenses/create`, {
          method: "POST",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Fiche dépense creer",
            detail: "Fiche dépense a bien été cree avec succès",
            life: 3000,
          })
        );
        const data_recup = res.result
        const url = `/fiche_depenses/details/${encodeId(data_recup)}`;

        // to={`/vent/details/${item.ID_VENTE}`}
        navigate(url);
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
        comptabilite_routes_items.fiche_depenses,
        comptabilite_routes_items.new_fiche_depense])
    );
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);




  //liste deroulante des employes
  const fetchEmploye = useCallback(async () => {
    try {
      const baseurl = `/gerers/employe/fetch?row=100000&`;
      var url = baseurl;
      const res = await fetchApi(url);
      const updatedRef = res.result.data.map((clt) => ({
        name: `${clt.NOM} ${clt.PRENOM}`,
        code: clt.ID_EMPLOYE,
      }));
      setEmploy(updatedRef);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchEmploye();
  }, []);

  //liste deroulant des fournisseurs
  const fetchFournisseur = useCallback(async () => {
    try {
      const baseurl = `/gerers/fournisseur/fetch?row=100000&`;
      var url = baseurl;
      const res = await fetchApi(url);
      const updatedRef = res.result.data.map((clt) => ({
        name: `${clt.NOM_COMPLET}`,
        code: clt.IDFOURNISSEUR,
      }));
      setFourn(updatedRef);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    fetchFournisseur();
  }, []);

  return (
    <>
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">


        <div className="">
          <h1 className="mb-3"> Nouveau fiche depense</h1>
          <div className="d-flex align-items-center">
            <div className="form-group ">

            </div>
          </div>
          <hr className="w-100" />
        </div>
        <form className="form w-75 mt-5" onSubmit={handleSubmit}>


          <div className="form-group col-sm mt-5">


            <div className="row">

              <div className="col-md-4">
                <label htmlFor="IS_BENEFICIAIRE" className="label mb-1">
                  Béneficaire
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.IS_BENEFICIAIRE}
                  options={isbeneficaire}
                  onChange={(e) => setValue("IS_BENEFICIAIRE", e.value)}
                  optionLabel="name"
                  id="IS_BENEFICIAIRE"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le Beneficiare"
                  emptyFilterMessage="Aucun element trouvee"
                  emptyMessage="Aucun element trouvee"
                  name="IS_BENEFICIAIRE"
                  onHide={() => {
                    checkFieldData({ target: { name: "IS_BENEFICIAIRE" } });
                  }}
                  className={`w-100 ${hasError("IS_BENEFICIAIRE") ? "p-invalid" : ""}`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("IS_BENEFICIAIRE") ? getError("IS_BENEFICIAIRE") : ""}
                </div>
              </div>
            </div>

            {data.IS_BENEFICIAIRE?.code == 1 ? (
              <>
                <div className="row">
                  <div className="col-md-4">
                    <label htmlFor="BENEFICIAIRE" className="label mb-1">
                      Employe
                    </label>
                  </div>
                  <div className="col-sm">
                    <Dropdown
                      value={data.BENEFICIAIRE}
                      options={employ}

                      onChange={(e) => setValue("BENEFICIAIRE", e.value)}
                      optionLabel="name"
                      id="BENEFICIAIRE"
                      filter
                      filterBy="name"
                      placeholder="Sélectionner le nom d'employe"
                      emptyFilterMessage="Aucun element trouvee"
                      emptyMessage="Aucun element trouvee"
                      name="BENEFICIAIRE"
                      onHide={() => {
                        checkFieldData({ target: { name: "BENEFICIAIRE" } });
                      }}
                      className={`w-100 ${hasError("BENEFICIAIRE") ? "p-invalid" : ""}`}
                      showClear

                    />
                    <div
                      className="invalid-feedback"
                      style={{ minHeight: 21, display: "block" }}
                    >
                      {hasError("BENEFICIAIRE") ? getError("BENEFICIAIRE") : ""}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="row">
                  <div className="col-md-4">
                    <label htmlFor="PRENOM" className="label mb-1">
                      Fournisseur
                    </label>
                  </div>
                  <div className="col-sm">
                    <Dropdown
                      value={data.BENEFICIAIRE}
                      options={fourn}
                      onChange={(e) => setValue("BENEFICIAIRE", e.value)}
                      optionLabel="name"
                      id="BENEFICIAIRE"
                      filter
                      filterBy="name"
                      placeholder="Sélectionner le nom du fournisseur"
                      emptyFilterMessage="Aucun element trouvee"
                      emptyMessage="Aucun element trouvee"
                      name="BENEFICIAIRE"
                      onHide={() => {
                        checkFieldData({ target: { name: "BENEFICIAIRE" } });
                      }}
                      className={`w-100 ${hasError("BENEFICIAIRE") ? "p-invalid" : ""}`}
                      showClear

                    />
                    <div
                      className="invalid-feedback"
                      style={{ minHeight: 21, display: "block" }}
                    >
                      {hasError("BENEFICIAIRE") ? getError("BENEFICIAIRE") : ""}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="row">
              <div className="col-md-4">
                <label htmlFor="PRENOM" className="label mb-1">
                  Mode de paiement
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.MODE_PAIEMENT}
                  options={modePaiement}
                  onChange={(e) => setValue("MODE_PAIEMENT", e.value)}
                  optionLabel="name"
                  id="MODE_PAIEMENT"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner le mode de paiement"
                  emptyFilterMessage="Aucun element trouvee"
                  emptyMessage="Aucun element trouvee"
                  name="MODE_PAIEMENT"
                  onHide={() => {
                    checkFieldData({ target: { name: "MODE_PAIEMENT" } });
                  }}
                  className={`w-100 ${hasError("MODE_PAIEMENT") ? "p-invalid" : ""}`}
                  showClear

                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MODE_PAIEMENT") ? getError("MODE_PAIEMENT") : ""}
                </div>
              </div>
            </div>



            <div className="row">
              <div className="col-md-4">
                <label htmlFor="DATE_DEPENSE" className="label mb-1">
                  Date de dépense
                </label>
              </div>
              <div className="col-sm">
                <Calendar
                  value={data.DATE_DEPENSE}
                  name="DATE_DEPENSE"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setValue("DATE_DEPENSE", e.value);
                    setError("DATE_DEPENSE", {});
                  }}
                  // minDate={new Date()}
                  placeholder="Choisir la date de dépense"
                  inputClassName="w-100"
                  onHide={() => {
                    checkFieldData({ target: { name: "DATE_DEPENSE" } });
                  }}

                  className={`d-block w-100 ${hasError("DATE_DEPENSE") ? "p-invalid" : ""
                    }`}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                  {hasError("DATE_DEPENSE") ? getError("DATE_DEPENSE") : ""}
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
              disabled={!isValidate()}
              // disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
              </svg>
              <span 
              className="ml-1" 
              style={{ fontWeight: 'bold' }}>Valider</span>
            </Button>
          </div>
        </form >
      </div >
    </>
  );
}

























