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
import { decodeId } from "../../utils/IdEncryption";

const initialForm = {
    NOM_PENALITE: "",
    VALEUR: "",


};

export default function Penalite_Cotisation_retard_update() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { ID_COTISATION_RETARD: encodedStr } = useParams();
    const ID_COTISATION_RETARD = decodeId(encodedStr)
    console.log({ ID_COTISATION_RETARD });

    const { ID_PENALITE } = useParams();
    const [penalite, setPenalite] = useState([]);
    const [loadingpenalite, setLoadingPenalite] = useState(true);

    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        NOM_PENALITE: {
            required: true,

        },
        VALEUR: {
            required: true,

            decimal: true,
        },


    }, {
        NOM_PENALITE: {
            required: "Ce champ est obligatoire",
            alpha: "Le Nom de la penalite est invalide"
        },
        VALEUR: {
            required: "Ce champ est obligatoire",
            // length: "La description ne doit pas depasser max(30 caracteres)",
            // alpha: "La d est invalide"
        },

    });


    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (isValidate()) {
                setIsSubmitting(true)
                const form = new FormData()
                form.append("NOM_PENALITE", data.NOM_PENALITE);
                form.append("VALEUR", data.VALEUR);
                const res = await fetchApi(`/parametre/cotisationretard/update/${ID_COTISATION_RETARD}`, {
                    method: "post",
                    body: form,
                });
                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Pénalité modifié",
                        detail: "La Pénalité a été modifié avec succès",
                        life: 3000,
                    })
                );
                navigate("/retard");
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



    useEffect(() => {
        (async () => {
            try {
                const res = await fetchApi(`/parametre/cotisationretard/Findone/${ID_COTISATION_RETARD}`);

                const uti = res.result;
                setPenalite(uti);
                setData({
                    NOM_PENALITE: uti.NOM_PENALITE,
                    VALEUR: uti.VALEUR,

                });
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingPenalite(false);
            }
        })();
    }, []);


    useEffect(() => {
        document.title = "Editer"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'penalite',
                name: 'Liste'
            },
            {
                path: 'edit_penalite',
                name: 'Editer'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);



    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    if (loadingpenalite) {
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
                    <h1 className="mb-3">Update Taux penalite</h1>
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
                                <label htmlFor="NOM_PENALITE" className="label mb-1">
                                    NOM PENALITE
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le telephone"
                                    id="NOM_PENALITE"
                                    name="NOM_PENALITE"
                                    value={data.NOM_PENALITE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM_PENALITE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOM_PENALITE") ? getError("NOM_PENALITE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="VALEUR" className="label mb-1">
                                    VALEUR
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire Adresse"
                                    id="VALEUR"
                                    name="VALEUR"
                                    value={data.VALEUR}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("VALEUR") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("VALEUR") ? getError("VALEUR") : ""}
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
