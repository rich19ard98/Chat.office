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
    NOM_COMPLET: '',
    ADRESSE: '',
    TEL: '',
    EMAIL: '',
};

export default function Fournisseur_edit_page() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { IDFOURNISSEUR } = useParams();
    const [loadingUtilisateur, setLoadingUtilisateur] = useState(true);


    const [fournisseur, setFournisseur] = useState([]);

    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        NOM_COMPLET: {
            required: true,
            length: [1, 100],
            alpha: true
        },

        ADRESSE: {
            required: true,
            length: [1, 255],
            alpha: true
        },
        TEL: {
            // required: true,
            length: [1, 20],
            alpha: true
        },
        EMAIL: {
            // required: true,
            length: [1, 100],
            alpha: true,
            email: true
        },


    },
        {
            NOM_COMPLET: {
                required: "Ce champ est obligatoire",
                length: "Le nom d'entite   ne doit pas depasser max(100 caracteres)",
                alpha: "Le nom d'entite  est invalide"
            },
            ADRESSE: {
                required: "Ce champ est obligatoire",
                length: "L'adresse ne doit pas depasser max(255 caracteres)",
                alpha: "Adresse est invalide"
            },
            TEL: {
                // required: "Ce champ est obligatoire",
                length: "Le numéro du téléphone  ne doit pas depasser max(20 chiffres)",
                alpha: "Adresse est invalide"
            },
            EMAIL: {
                // required: "Ce champ est obligatoire",
                length: "L'e-mail  ne doit pas depasser max(200 caracteres)",
                alpha: "Adresse est invalide",
                email: "Email n'est pas valide"
            }
        }
    );
    const handleVisibility = (e) => {
        setShowCalendar(!showCalendar);
    };



    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (isValidate()) {
                setIsSubmitting(true)
                const form = new FormData()
                form.append("NOM_COMPLET", data.NOM_COMPLET);
                form.append("ADRESSE", data.ADRESSE);
                form.append("TEL", data.TEL);
                form.append("EMAIL", data.EMAIL);
                const res = await fetchApi(`/gerers/fournisseur/update/${IDFOURNISSEUR}`, {
                    method: "PUT",
                    body: form,
                });
                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Fournisseur modifié",
                        detail: "Fournisseur a été modifié avec succès",
                        life: 3000,
                    })
                );
                navigate("/fournisseur");
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
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchApi(`/gerers/fournisseur/find/${IDFOURNISSEUR}`);
                const uti = res.result;

                setFournisseur(uti);
                setData({
                    NOM_COMPLET: uti.NOM_COMPLET,
                    ADRESSE: uti.ADRESSE,
                    TEL: uti.TEL,
                    EMAIL: uti.EMAIL
                });
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingUtilisateur(false);
            }
        })();
    }, []);



    useEffect(() => {
        document.title = "Editer"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'fournisseur',
                name: 'Fournisseur'
            },
            {
                path: 'fournisseur_edit',
                name: 'Edit'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);



    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    if (loadingUtilisateur) {
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
                        {fournisseur.NOM_COMPLET}
                    </h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-80 mt-5" onSubmit={handleSubmit}>

                    <div className="form-group row">
                        <div className="col-md-2">
                            <label htmlFor="NOM_COMPLET" className="label mb-1">Nom complet</label>
                        </div>
                        <div className="col-sm">
                            <InputText
                                type="text"
                                placeholder="Ecrire le nom complet"
                                id="NOM_COMPLET"
                                name="NOM_COMPLET"
                                value={data.NOM_COMPLET}
                                onChange={handleChange}
                                onBlur={checkFieldData}
                                className={`w-100 ${hasError("NOM_COMPLET") ? "p-invalid" : ""}`}
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                {hasError("NOM_COMPLET") ? getError("NOM_COMPLET") : ""}
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label htmlFor="EMAIL" className="label mb-1">E-mail</label>
                        </div>
                        <div className="col-sm">
                            <InputText
                                type="text"
                                placeholder="Ecrire e-mail"
                                id="EMAIL"
                                name="EMAIL"
                                value={data.EMAIL}
                                onChange={handleChange}
                                onBlur={checkFieldData}
                                className={`w-100 ${hasError("EMAIL") ? "p-invalid" : ""}`}
                            />
                            <div
                                className="invalid-feedback"
                                style={{ minHeight: 21, display: "block" }}
                            >
                                {hasError("EMAIL") ? getError("EMAIL") : ""}
                            </div>
                        </div>

                    </div>

                    <div className="form-group row">

                        <div className="col-md-2">
                            <label htmlFor="ADRESSE" className="label mb-1">Adresse</label>
                        </div>
                        <div className="col-sm">
                            <InputText
                                type="text"
                                placeholder="Ecrire l'adresse"
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

                        <div className="col-md-2">
                            <label htmlFor="TEL" className="label mb-1">
                                Téléphone
                            </label>
                        </div>
                        <div className="col-sm">

                            <InputText
                                type="text"
                                placeholder="Ecrire le numéro de téléphone"
                                name="TEL"
                                id="TEL"
                                value={data.TEL}
                                onChange={handleChange}
                                onBlur={checkFieldData}
                                className={`w-100 ${hasError("TEL") ? "p-invalid" : ""}`}
                            />
                            <div
                                className="invalid-feedback"
                                style={{ minHeight: 21, display: "block" }}
                            >
                                {hasError("TEL") ? getError("TEL") : ""}
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
                                navigate("/fournisseur");
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
