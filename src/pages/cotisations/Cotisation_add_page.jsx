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
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import Cotisation_liste_page from "./Cotisation_liste_page";
import PROFILS from "../../constants/PROFILS";
const initialForm = {
  MONTANT: "",
  MODE_PAIEMENT: '',
  TYPE_OPERATION_ID: "",
  MEMBRE_ID: "",
  INTERET_COTISATION_TARDIVE: "",


};

export default function Cotisation_add_page() {
  const dispacth = useDispatch();
  const [penalite, setPenalite] = useState(null);
  const [tauxPenalite, setTauxPenalite] = useState(0); // état pour stocker le taux
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [membre, setMembres] = useState([])
  const [isChecked, setIsChecked] = useState(false);
  const [operations, setOperations] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Description, setDescription] = useState(null)
  const [afficherExtras, setAfficherExtras] = useState(false);

  const navigate = useNavigate();

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(
    data,
    {
      MONTANT: {
        required: true,
        alpha: true,
        decimal: true
      },
      MODE_PAIEMENT: {
        required: true,
      },
      TYPE_OPERATION_ID: {
        required: true,
      },
      MEMBRE_ID: {
        required: true,
      },
      // Nouveaux champs

      INTERET_COTISATION_TARDIVE: {
        decimal: true,
      },

    },
    {
      MONTANT: {
        required: "Ce champ est obligatoire",
        alpha: "La quantité d'alerte est invalide",
        decimal: "Le montant doit être un nombre réel"
      },
      MODE_PAIEMENT: {
        required: "Ce champ est obligatoire",
      },
      TYPE_OPERATION_ID: {
        required: "Ce champ est obligatoire",
      },
      MEMBRE_ID: {
        required: "Ce champ est obligatoire",
      },

      INTERET_COTISATION_TARDIVE: {
        decimal: "La valeur doit être un nombre réel",
      },

    }
  );


  const [modePaiement, setModePaiement] = useState([
    {
      code: 0,
      name: 'Espèce'
    },
    {
      code: 1,
      name: 'Virement bancaire'
    },
    {
      code: 2,
      name: 'Versement bancaire'
    },

  ]);
  const isCotisationAnticipeValid = () => {
    // La checkbox doit être cochée
    if (!afficherExtras) return false;

    // Vérifie les champs obligatoires principaux
    if (!isValidate()) return false;

    // Si la checkbox est cochée, vérifie les champs supplémentaires
    if (afficherExtras) {
      if (
        !MontantTotal
      ) return false;
    }
    return true;
  };
  // quand l'utilisateur tape le montant


  // recalcul automatique du montant de pénalités
  useEffect(() => {
    try {
      // Conversion sécurisée pour les formats de nombres
      const baseValue = data.MONTANT ? data.MONTANT.toString().replace(',', '.') : '0';
      const tauxValue = tauxPenalite ? tauxPenalite.toString().replace(',', '.') : '0';

      const base = parseFloat(baseValue) || 0;
      const taux = parseFloat(tauxValue) || 0;

      // Vérification que les valeurs sont valides
      if (isNaN(base) || isNaN(taux)) {
        console.warn('Valeurs invalides pour le calcul des pénalités');
        return;
      }

      const montantPenalite = (base * taux) / 100;
      const formatted = montantPenalite.toFixed(2);

      setData(prev => ({
        ...prev,
        INTERET_COTISATION_TARDIVE: formatted
      }));

    } catch (error) {
      console.error('Erreur dans le calcul des pénalités:', error);
      setData(prev => ({
        ...prev,
        INTERET_COTISATION_TARDIVE: "0.00"
      }));
    }
  }, [data.MONTANT, tauxPenalite]);

  // Calcul du Montant Total avec la même logique sécurisée
  const montantBase = parseFloat(data?.MONTANT?.toString().replace(',', '.')) || 0;
  const montantPenalite = parseFloat(data?.INTERET_COTISATION_TARDIVE?.toString().replace(',', '.')) || 0;
  const MontantTotal = (montantBase + montantPenalite).toFixed(2);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("MONTANT", data.MONTANT);
        form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);
        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID.code);
        form.append("MEMBRE_ID", data.MEMBRE_ID.code);
        const res = await fetchApi(`/cotisation/cotisations/create`, {
          method: "POST",
          body: form,
        });
        dispacth(
          setToastAction({
            severity: "success",
            summary: "Cotisation enregistré",
            detail: "Cotisation a été enregistré avec succès",
            life: 3000,
          })
        );
        navigate("/cotisation", { state: { refresh: true } });
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
      if (error.httpStatus === "BAD_REQUEST") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur",
            detail: 'Caisse introuvable ou inactive .',

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
      if (error.httpStatus === "UNAUTHORIZED") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur",
            detail: "Connectez-vous avec un compte autorisé pour accéder à cette fonctionnalité ou contacter votre administrateur.",
            life: 5000,
          })
        )
        //navigate("/login")
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
      else
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
        administration_routes_items.frais_adh,
        administration_routes_items.frais_adh_add,
      ])
    );
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);


  const fetchPenalite = useCallback(async () => {
    try {
      const res = await fetchApi(`/parametre/cotisationretard/fetch?`);
      const dataArray = res.result.data; // c'est un tableau

      if (dataArray && dataArray.length > 0) {
        const taux = parseFloat(dataArray[0].VALEUR); // prends le 1er élément
        setTauxPenalite(taux);
      } else {
        console.log("Aucune pénalité trouvée");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchPenalite();
  }, [fetchPenalite]);

  // exemple d'utilisation
  const calculerPenalite = (montantTape) => {
    return montantTape * tauxPenalite / 100; // si VALEUR est en pourcentage
  };

  ///Cotisation Tardive


  const handleSubmitCotisationTardive = async (e, motif) => {
    try {
      if (isCotisationAnticipeValid()) {
        setIsSubmitting(true);

        const form = new FormData();
        form.append("MONTANT", data.MONTANT);
        form.append("MODE_PAIEMENT", data.MODE_PAIEMENT.code);
        form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID.code);
        form.append("MEMBRE_ID", data.MEMBRE_ID.code);
        form.append("DESCRIPTION", motif);
        form.append("INTERET_COTISATION_TARDIVE", data.INTERET_COTISATION_TARDIVE);
        const res = await fetchApi(`/cotisation/cotisations/CreateCotisationTardive`, {
          method: "POST",
          body: form
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Cotisation enregistrée",
            detail: "La cotisation a été enregistrée avec succès",
            life: 3000,
          })
        );
        navigate("/cotisation", { state: { refresh: true } });
      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échoué",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );

        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          let headerHeight = 0;
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
      if (error.httpStatus === "BAD_REQUEST") {
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "warn",
            summary: "Erreur lors de cotisation ",
            detail: 'Caisse introuvable ou inactive .',

            life: 3000,
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
      else
        if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
          setErrors(error.result);
        }
      dispacth(
        setToastAction({
          severity: "error",
          summary: "Erreur du système",
          detail: "Erreur du système, réessayez plus tard",
          life: 3000,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    dispacth(
      setBreadCrumbItemsAction([
        administration_routes_items.frais_adh,
        administration_routes_items.frais_adh_add,
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
  const handleCotisationtardive = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();

    let motif = ""; // variable pour stocker le texte du textarea

    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Cotisation Tardive",
      message: (
        <div className="d-flex flex-column align-items-center" style={{ width: "400px" }}>
          <div className="text-center mb-3">Veuillez saisir la Description :</div>
          <textarea
            className="p-inputtext p-component"
            style={{ width: '100%', minHeight: '80px' }}
            onChange={(e) => {
              motif = e.target.value; // mettre à jour uniquement la variable locale
            }}
          />
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        if (!motif.trim()) {
          dispacth( // correction dispacth -> dispatch
            setToastAction({
              severity: "warn",
              summary: "Erreur lors de la cotisation tardive",
              detail: "La description est obligatoire pour continuer",
              life: 3000,
            })
          );
          return;
        }
        handleSubmitCotisationTardive(itemsIds, motif);
      },
    });
  };

  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  return (
    <>
      {isSubmitting ? <Loading /> : null}

      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">Nouveau cotisation</h1>
          <div className="d-flex align-items-center">
            <div className="form-group ">
            </div>
          </div>
          <hr className="w-100" />
        </div>


        <form className="form w-75 mt-5" onSubmit={handleSubmit}>
          <div className=" form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="MONTANT" className="label mb-1">
                  Cotisation anticipe
                </label>
              </div>
              <div className="mt-3 col-sm">
                <div className=" cursor-pointer form-check">
                  <input
                    type="checkbox"
                    id="afficherExtras"
                    className="form-check-input "
                    checked={afficherExtras}
                    onChange={(e) =>

                      setAfficherExtras(e.target.checked)}
                  />
                  <label htmlFor="afficherExtras" className="form-check-label">
                    Ajouter Cotisation Anticipe
                  </label>
                </div>
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >

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
                  placeholder="Ecrire le montant  EX:328394"
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
                <label htmlFor="MEMBRE_ID" className="label mb-1">
                  Membre
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.MEMBRE_ID}
                  options={membre}
                  showClear
                  onChange={(e) => setValue("MEMBRE_ID", e.value)}
                  optionLabel="name"
                  id="MEMBRE_ID "
                  filter
                  filterBy="name"
                  placeholder="Sélectionner un membre"
                  emptyFilterMessage="Aucun élement trouvée"
                  emptyMessage="Aucun element trouvee"
                  name="MEMBRE_ID "
                  onHide={() => {
                    checkFieldData({ target: { name: "MEMBRE_ID " } });
                  }}
                  className={`w-100 ${hasError("MEMBRE_ID") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MEMBRE_ID") ? getError("MEMBRE_ID") : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="TYPE_OPERATION_ID" className="label mb-1">
                  Type d'operation
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.TYPE_OPERATION_ID}
                  options={operations}
                  autoFocus
                  showClear
                  onChange={(e) => {
                    setValue("TYPE_OPERATION_ID", e.value);

                    // Vérifiez la valeur sélectionnée par code
                    if (e.value.code === 11) {
                      setValue("MODE_PAIEMENT", modePaiement.find(option => option.name === "Espèce"));
                    }
                    else if (e.value.code === 17) {
                      setValue("MODE_PAIEMENT", null); // Réinitialiser le mode de paiement
                    }
                  }}
                  optionLabel="name"
                  id="TYPE_OPERATION_ID"
                  filter
                  filterBy="name"
                  placeholder="Sélectionner type d'opération"
                  emptyFilterMessage="Aucun élement trouvée"
                  emptyMessage="Aucun element trouvee"
                  name="TYPE_OPERATION_ID"
                  onHide={() => {
                    checkFieldData({ target: { name: "TYPE_OPERATION_ID" } });
                  }}
                  className={`w-100 ${hasError("TYPE_OPERATION_ID") ? "p-invalid" : ""
                    }`}
                />

                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("TYPE_OPERATION_ID") ? getError("TYPE_OPERATION_ID") : ""}
                </div>
              </div>
            </div>
          </div>
          {/* Mode paiement (affiché dynamiquement) */}
          {modePaiement.length > 0 && (
            <div className="form-group col-sm">
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="MODE_PAIEMENT" className="label mb-1">
                    Mode paiement
                  </label>
                </div>
                <div className="col-sm">
                  <Dropdown
                    value={data.MODE_PAIEMENT}
                    // options={modePaiement}
                    onChange={(e) => setValue("MODE_PAIEMENT", e.value)}

                    options={modePaiement.filter(option => {
                      // Filtrer l'option "Espèce" si "Remboursement bancaire" est sélectionné
                      return !(data.TYPE_OPERATION_ID && data.TYPE_OPERATION_ID.code
                        === 17 && option.name === "Espèce");
                    })}

                    optionLabel="name"
                    id="MODE_PAIEMENT"
                    filter
                    showClear
                    filterBy="name"
                    placeholder="Sélectionner mode paiement"
                    emptyFilterMessage="Aucun élement trouvée"
                    emptyMessage="Aucun element trouvee"
                    name="MODE_PAIEMENT"
                    onHide={() => {
                      checkFieldData({ target: { name: "MODE_PAIEMENT" } });
                    }}
                    className={`w-100 ${hasError("MODE_PAIEMENT") ? "p-invalid" : ""
                      }`}
                  />
                  <div
                    className="invalid-feedback"
                    style={{ minHeight: 21, display: "block" }}
                  >
                    {hasError("MODE_PAIEMENT") ? getError("MODE_PAIEMENT") : ""}
                  </div>
                </div>


              </div>
            </div>


          )}
          {afficherExtras && (
            <>
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="INTERET_COTISATION_TARDIVE" className="label mb-1">
                    Montant Penalites
                  </label>
                </div>
                <div className="col-sm">
                  <InputText
                    type="text"
                    placeholder="Ecrire Montant de l'interet anticipé EX:328394"
                    id="INTERET_COTISATION_TARDIVE"
                    name="INTERET_COTISATION_TARDIVE"
                    value={data.INTERET_COTISATION_TARDIVE}
                    onChange={handleChange}
                    onBlur={checkFieldData}
                    className={`w-100 ${hasError("INTERET_COTISATION_TARDIVE") ? "p-invalid" : ""}`}
                  />
                  <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                    {hasError("INTERET_COTISATION_TARDIVE") ? getError("INTERET_COTISATION_TARDIVE") : ""}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="MONTANT_TOTAL" className="label mb-1">
                    Montant Total
                  </label>
                </div>
                <div className="col-sm">
                  <InputText
                    type="text"
                    placeholder="Ecrire Montant de l'interet anticipé EX:328394"
                    id="MONTANT_TOTAL"
                    name="MONTANT_TOTAL"
                    value={MontantTotal.toString()}
                    onChange={handleChange}
                    onBlur={checkFieldData}
                    className={`w-100 ${hasError("MONTANT_TOTAL") ? "p-invalid" : ""}`}
                  />
                  <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                    {hasError("MONTANT_TOTAL") ? getError("MONTANT_TOTAL") : ""}
                  </div>
                </div>
              </div>
            </>
          )}
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
            {!afficherExtras ?

              <Button
                label="Envoyer"
                type="submit"
                className="mt-3 ml-3"
                size="small"
                disabled={!isValidate()}

              />
              : null
            }
            {afficherExtras ?
              <Button
                label="Cotisation Anticipe"
                type="submit"
                className="mt-3 ml-3"
                size="small"
                onClick={handleCotisationtardive}
                disabled={!isCotisationAnticipeValid()}// ← désactive si la checkbox n'est pas cochée

              />
              : null
            }
          </div>
        </form>
      </div>
      {/* </>
      )} */}


    </>
  );
}
