
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
    NOM_GROUPEMENT: "",
    TELEPHONE: "",
    ADRESSE: ""
};
export default function AjouterGroupementsFinancieres() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembres] = useState([])
    const [agences, setagences] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        NOM_GROUPEMENT: { required: true, alpha: true },
        ADRESSE: { required: true },
        TELEPHONE: { required: true },
    }, {
        NOM_GROUPEMENT: { required: "Le nom du groupement est obligatoire", alpha: true },
        ADRESSE: { required: "L'adresse est obligatoire" },
        TELEPHONE: { required: "Le téléphone est obligatoire" },
    });






    const [typecaisse, settypecaisse] = useState([
        {
            code: 0,
            name: 'Principale'
        },
        {
            code: 1,
            name: 'Caisse'
        },
        {
            code: 2,
            name: ' Caisse Centrale'
        },


    ]);



    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("NOM_GROUPEMENT", data.NOM_GROUPEMENT);
                form.append("ADRESSE", data.ADRESSE);
                form.append("TELEPHONE", data.TELEPHONE);
                const res = await fetchApi(`/Caisses/Groupement/create`, {
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
                navigate("/groupements");
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
                administration_routes_items.ListesAgences,
                administration_routes_items.NouveauAgences,
            ])
        );
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);


    // Liste deroularantes des membres
    const fetchMembres = useCallback(async () => {
        try {
            const profils = [PROFILS.ADMIN, PROFILS.CAISSIER, PROFILS.GERANT];
            const res = await fetchApi(`/administration/utilisateurs/fetch?rows=100000&Profiles=${JSON.stringify(profils)}`);

            console.log({ res });

            setMembres(
                res.result.data.map((clM) => ({
                    name: `${clM.NOM} ${clM.PRENOM}`,
                    code: clM.ID_UTILISATEUR,
                }))
            );
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchMembres();
    }, []);



    //Recuperation des operations
    const fetchAgences = useCallback(async () => {
        try {
            const res = await fetchApi("/Agences/Agences/fetch?rows=100000&");
            const Agences = res.result.data
            setagences(
                Agences.map((clM) => {
                    return {
                        name: clM.NOM_AGENCE,
                        code: clM.ID_AGENCE,
                    };
                }
                )
            );




        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchAgences();
    }, []);
    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouveau Caisse</h1>
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
                                <label htmlFor="NOM_GROUPEMENT" className="label mb-1">
                                    Nom Groupement
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le nom groupement"
                                    id="NOM_GROUPEMENT"
                                    name="NOM_GROUPEMENT"
                                    value={data.NOM_GROUPEMENT}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM_GROUPEMENT") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOM_GROUPEMENT") ? getError("NOM_GROUPEMENT") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ADRESSE" className="label mb-1">
                                    Adresse
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire l'addresse"
                                    id="ADRESSE"
                                    name="ADRESSE"
                                    value={data.ADRESSE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("ADRESSE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ADRESSE") ? getError("ADRESSE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="TELEPHONE" className="label mb-1">
                                    Telephone
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le Numero telephone"
                                    id="TELEPHONE"
                                    name="TELEPHONE"
                                    value={data.TELEPHONE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("TELEPHONE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("TELEPHONE") ? getError("TELEPHONE") : ""}
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
