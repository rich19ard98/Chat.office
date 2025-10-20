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
import { RadioButton } from 'primereact/radiobutton';

const initialForm = {

    NOM_OPERATION: "",
    COMPTE_DEBIT: "",
    COMPTE_CREDIT: "",
};
export default function Types_operations_comptables_add_page() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [comptes_comptables, setComptes_comptables] = useState([]);
    const [codes, setCodes] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const {
        hasError,
        getError,
        setErrors,
        getErrors,
        checkFieldData,
        isValidate,
        setError,
    } = useFormErrorsHandle(
        data,
        {
            NOM_OPERATION: {
                required: true,
                alpha: true,
                length: [1, 50],
            },
            COMPTE_DEBIT: {
                required: true,
            },
            COMPTE_CREDIT: {
                required: true,
            },


        },
        {
            NOM_OPERATION: {
                required: "Ce champ est obligatoire",
                length: "Le nom d'oporation ne doit pas depasser max(50 caracteres)",
                alpha: "Le nom d'operation est invalide"
            },
            COMPTE_DEBIT: {
                required: "Ce champ est obligatoire",

            },
            COMPTE_CREDIT: {
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
                form.append("NOM_OPERATION", data.NOM_OPERATION);
                form.append("COMPTE_DEBIT", data.COMPTE_DEBIT?.code);
                form.append("COMPTE_CREDIT", data.COMPTE_CREDIT?.code);
                const res = await fetchApi(`/cotisation/types_operations_comptables/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Le type d'operation enregistré",
                        detail: "Le type d'operation a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/types_operations_comptables");
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
    // liste deroulante des Comptes debit
    const fetchComptes_debit = useCallback(async () => {
        try {
            const res = await fetchApi(`/plancomptable/comptescomptables/fetch?rows=1000000&`)
            setComptes_comptables(
                res.result.data.map((tyop) => {
                    return {
                        name: tyop.NOM,
                        code: tyop.ID_COMPTES_COMPTABLES,
                    };
                })
            );
            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchComptes_debit()
    }, [])
    // liste deroulante des Comptes credit
    const fetchComptes_credit = useCallback(async () => {
        try {
            const res = await fetchApi(`plancomptable/comptescomptables/fetch?rows=1000000&`)
            setComptes_comptables(
                res.result.data.map((tyop) => {
                    return {
                        name: tyop.NOM,
                        code: tyop.ID_COMPTES_COMPTABLES,
                    };
                })
            );

            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchComptes_credit()
    }, [])

    useEffect(() => {
        document.title = "Nouvelle Opération"
        dispacth(
            setBreadCrumbItemsAction([
                administration_routes_items.types_operations_comptables,
                administration_routes_items.New_types_operations_comptables,
            ])
        );
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    const filteredcomptes_comptables = comptes_comptables.filter((comptes) => comptes.code !== data.COMPTE_DEBIT?.code)

    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouvelle Opération</h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="NOM_OPERATION" className="label mb-1">
                                    Nom d'pération
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire nom de l'opération"
                                    id="NOM_OPERATION"
                                    name="NOM_OPERATION"
                                    value={data.NOM_OPERATION}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM_OPERATION") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOM_OPERATION") ? getError("NOM_OPERATION") : ""}
                                </div>
                            </div>
                        </div>


                        <div className="form-group col-sm">
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="COMPTE_DEBIT" className="label mb-1">
                                        Compte débit
                                    </label>
                                </div>
                                <div className="col-sm">
                                    <Dropdown
                                        value={data.COMPTE_DEBIT}
                                        options={comptes_comptables}
                                        onChange={(e) => setValue("COMPTE_DEBIT", e.value)}
                                        optionLabel="name"
                                        id="COMPTE_DEBIT"
                                        filter
                                        filterBy="name"
                                        placeholder="Sélectionner compte source"
                                        emptyFilterMessage="Aucun élement trouvée"
                                        emptyMessage="Aucun element trouvee"
                                        name="COMPTE_DEBIT"
                                        onHide={() => {
                                            checkFieldData({ target: { name: "COMPTE_DEBIT" } });
                                        }}
                                        className={`w-100 ${hasError("COMPTE_DEBIT") ? "p-invalid" : ""
                                            }`}
                                        showClear
                                    />
                                    <div
                                        className="invalid-feedback"
                                        style={{ minHeight: 21, display: "block" }}
                                    >
                                        {hasError("COMPTE_DEBIT") ? getError("COMPTE_DEBIT") : ""}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group col-sm">
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="COMPTE_CREDIT" className="label mb-1">
                                        Compte credit
                                    </label>
                                </div>
                                <div className="col-sm">
                                    <Dropdown
                                        value={data.COMPTE_CREDIT}
                                        options={filteredcomptes_comptables}
                                        onChange={(e) => setValue("COMPTE_CREDIT", e.value)}
                                        optionLabel="name"
                                        id="COMPTE_CREDIT"
                                        filter
                                        filterBy="name"
                                        placeholder="Sélectionner  compte credit"
                                        emptyFilterMessage="Aucun élement trouvée"
                                        emptyMessage="Aucun element trouvee"
                                        name="COMPTE_CREDIT "
                                        onHide={() => {
                                            checkFieldData({ target: { name: "COMPTE_CREDIT" } });
                                        }}
                                        className={`w-100 ${hasError("COMPTE_CREDIT") ? "p-invalid" : ""
                                            }`}
                                        showClear
                                    />
                                    <div
                                        className="invalid-feedback"
                                        style={{ minHeight: 21, display: "block" }}
                                    >
                                        {hasError("COMPTE_CREDIT") ? getError("COMPTE_CREDIT") : ""}
                                    </div>
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
