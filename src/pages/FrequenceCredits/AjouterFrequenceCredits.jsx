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
    NOMBRE_JOURS: "",
    NON_FREQUENCE_CREDIT: '',


};

export default function AjouterFrequenceCredits() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembres] = useState([])
    const [operations, setOperations] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        NON_FREQUENCE_CREDIT: {
            required: true,
            alpha: true,
        },
        NOMBRE_JOURS: {
            required: true,
        },

    },
        {
            NON_FREQUENCE_CREDIT: {
                required: "Ce champ est obligatoire",
                alpha: "La quantite d'alert est invalide",
            },
            NOMBRE_JOURS: {
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
                form.append("NOMBRE_JOURS", data.NOMBRE_JOURS);
                form.append("NON_FREQUENCE_CREDIT", data.NON_FREQUENCE_CREDIT);
                const res = await fetchApi(`/FrequenceCredits/Frequencecredits/create`, {
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
                navigate("/FrequenceCreditd");
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
                administration_routes_items.ListeFrequencesCredits,
                administration_routes_items.AjouterFrequenceCredits,
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
                    <h1 className="mb-3">Nouveau Frequence Credits</h1>
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
                                <label htmlFor="NON_FREQUENCE_CREDIT" className="label mb-1">
                                    NOM FREQUENCE
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le nom frequence"
                                    id="NON_FREQUENCE_CREDIT"
                                    name="NON_FREQUENCE_CREDIT"
                                    value={data.NON_FREQUENCE_CREDIT}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NON_FREQUENCE_CREDIT") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NON_FREQUENCE_CREDIT") ? getError("NON_FREQUENCE_CREDIT") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="NOMBRE_JOURS" className="label mb-1">
                                    NOMBRE DE JOURS
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le nombre de jour"
                                    id="NOMBRE_JOURS"
                                    name="NOMBRE_JOURS"
                                    value={data.NOMBRE_JOURS}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOMBRE_JOURS") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOMBRE_JOURS") ? getError("NOMBRE_JOURS") : ""}
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
