import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { comptabilite_routes_items } from "../../routes/admin/comptabilite_routes";
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

    DESCRIPTION: "",
    COMPTE_DEBIT: null,
};

export default function Types_charges_depenses_add_page() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [comptes_comptables, setComptes_comptables] = useState([]);
    const [classe_comptable, setclasse] = useState();
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

            DESCRIPTION: {
                required: true,
                alpha: true,
                length: [1, 50],
            },
            COMPTE_DEBIT: {
                required: true,
            },

        },
        {

            DESCRIPTION: {
                required: "Ce champ est obligatoire",
                length: "Le  description ne doit pas depasser max(50 caracteres)",
                alpha: "Le description est invalide"
            },
            COMPTE_DEBIT: {
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
                form.append("DESCRIPTION", data.DESCRIPTION);
                form.append("COMPTE_DEBIT", data.COMPTE_DEBIT?.code);
                const res = await fetchApi(`/comptabilite/type_charges_depenses/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Le type charge depense enregistré",
                        detail: "Le type  charge depense a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/type_charge_depenses");
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
    }
    // liste deroulante des Comptes debit
    const fetchComptesByClasse = useCallback(async () => {
        try {
            const res = await fetchApi(`/plancomptable/comptescomptables/fetch?idclasse_comptable=6`);
            setComptes_comptables(
                res.result.data.map((compte) => ({
                    name: compte.NOM,
                    code: compte.ID_COMPTES_COMPTABLES,
                }))
            );
        } catch (error) {
            console.log(error);
        }
    }, []);



    useEffect(() => {
        fetchComptesByClasse();
    }, []);

    useEffect(() => {
        document.title = "Nouvelle types charge depense"
        dispacth(
            setBreadCrumbItemsAction([
                comptabilite_routes_items.type_charge_depenses,
                comptabilite_routes_items.new_type_charge_depenses,
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
                    <h1 className="mb-3">Nouvelle type charge depense</h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="COMPTE_DEBIT" className="label mb-1">Type charge</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.COMPTE_DEBIT}
                                    options={comptes_comptables}
                                    onChange={e => setValue("COMPTE_DEBIT", e.value)}
                                    optionLabel="name"
                                    id="COMPTE_DEBIT"
                                    filter
                                    placeholder="Sélectionner le compte"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="COMPTE_DEBIT"
                                    className={`w-100 ${hasError("COMPTE_DEBIT") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: 'block' }}>
                                    {hasError("COMPTE_DEBIT") ? getError("COMPTE_DEBIT") : ""}
                                </div>
                            </div>
                        </div>

                        <div className="form-group col-sm">
                            <div className="row">
                                <div className="col-md-4">
                                    <label htmlFor="DESCRIPTION" className="label mb-1">
                                        Description
                                    </label>
                                </div>
                                <div className="col-sm">
                                    <InputText
                                        type="text"
                                        placeholder="Ecrire le decription"
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
                        // disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}
