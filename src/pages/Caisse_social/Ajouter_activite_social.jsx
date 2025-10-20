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
//import Cotisation_liste_page from "./Cotisation_liste_page";
import PROFILS from "../../constants/PROFILS";
import { InputTextarea } from "primereact/inputtextarea";

const initialForm = {
    MONTANT: "",
    TYPE_OPERATION_ID: "",
    BENEFICIAIRE: "",
    DESCRIPTION: "",

};

export default function Ajouter_activite_social() {
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
        DESCRIPTION: {
            required: true,
        },
        TYPE_OPERATION_ID: {
            required: true,
        },
        BENEFICIAIRE: {
            required: true,
        },
    },
        {
            MONTANT: {
                required: "Ce champ est obligatoire",
                alpha: "La quantite d'alert est invalide",
                decimal: "Le montant doit etre un nombre réel"
            },
            BENEFICIAIRE: {
                required: "Ce champ est obligatoire",

            },
            TYPE_OPERATION_ID: {
                required: "Ce champ est obligatoire",
            },
            DESCRIPTION: {
                required: "Ce champ est obligatoire",
            },


        });

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



    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("MONTANT", data.MONTANT);
                form.append("DESCRIPTION", data.DESCRIPTION);
                form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID.code);
                form.append("BENEFICIAIRE", data.BENEFICIAIRE.code);


                const res = await fetchApi(`/cotisation/UtilisationCaisseSocial/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Activite enregistré",
                        detail: "Activite a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/caisseSocialliste");
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
            else if (error.httpStatus === "BAD_REQUEST") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de Activitite",
                        detail: 'Montant insuffisant .',

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
    useEffect(() => {
        dispacth(
            setBreadCrumbItemsAction([
                administration_routes_items.CaisseSocialListe,
                administration_routes_items.CaisseSocialadd,
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
                clM.NOM_OPERATION === "Utilisation caisse social"

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
                    <h1 className="mb-3">Nouveau Activites</h1>
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
                                <label htmlFor="BENEFICIAIRE" className="label mb-1">
                                    Membre
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.BENEFICIAIRE}
                                    options={membre}
                                    onChange={(e) =>
                                        setValue("BENEFICIAIRE", e.value)}
                                    optionLabel="name"
                                    id="BENEFICIAIRE "
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner un membre"
                                    emptyFilterMessage="Aucun élement trouvée"
                                    emptyMessage="Aucun element trouvee"
                                    name="BENEFICIAIRE "
                                    onHide={() => {
                                        checkFieldData({ target: { name: "BENEFICIAIRE " } });
                                    }}
                                    className={`w-100 ${hasError("BENEFICIAIRE") ? "p-invalid" : ""
                                        }`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("BENEFICIAIRE") ? getError("BENEFICIAIRE") : ""}
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
                                <label htmlFor="TYPE_OPERATION_ID" className="label mb-1">
                                    Type d'operation
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.TYPE_OPERATION_ID}
                                    options={operations}
                                    autoFocus
                                    onChange={(e) => {
                                        setValue("TYPE_OPERATION_ID", e.value);
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
                                    <label htmlFor="DESCRIPTION" className="label mb-1">
                                        Description
                                    </label>
                                </div>
                                <div className="col-sm">
                                    <InputTextarea
                                        type="text"
                                        placeholder="Description"
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
       


        </>
    );
}
