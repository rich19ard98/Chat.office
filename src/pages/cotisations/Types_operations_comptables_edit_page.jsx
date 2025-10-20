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

const initialForm = {
    NOM_OPERATION: "",
    COMPTE_DEBIT: "",
    COMPTE_CREDIT: "",

};
export default function Types_operations_comptables_edit_page() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [showCalendar, setShowCalendar] = useState(false);
    const [comptes_comptables, setComptes_comptables] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { ID_TYPES_OPERATIONS: encodedStr } = useParams();
    const ID_TYPES_OPERATIONS = decodeId(encodedStr)
    const [Types_operations_comptables, setTypes_operations_comptables] = useState(null);
    const [loadingTypes_operations_comptables, setLoadingTypes_operations_comptables] = useState(true);

    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
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

    });
    const handleVisibility = (e) => {
        setShowCalendar(!showCalendar);
    };
    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (isValidate()) {
                setIsSubmitting(true)
                const form = new FormData()
                form.append("NOM_OPERATION", data.NOM_OPERATION);
                form.append("COMPTE_DEBIT", data.COMPTE_DEBIT?.code);
                form.append("COMPTE_CREDIT", data.COMPTE_CREDIT?.code);
                const res = await fetchApi(`/cotisation/types_operations_comptables/update/${ID_TYPES_OPERATIONS}`, {
                    method: "PUT",
                    body: form,
                });
                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Operation modifié",
                        detail: "L'Operation a été modifié avec succès",
                        life: 3000,
                    })
                );
                navigate("/types_operations_comptables");
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
        (async () => {
            try {
                const res = await fetchApi(`/cotisation/types_operations_comptables/find/${ID_TYPES_OPERATIONS}`);
                const ope = res.result;
                setTypes_operations_comptables(ope);
                setData({
                    NOM_OPERATION: ope.NOM_OPERATION,
                    COMPTE_DEBIT: {
                        name: ope.comptes_debit?.NOM,
                        code: ope.comptes_debit?.ID_COMPTES_COMPTABLES,
                    },
                    COMPTE_CREDIT: {
                        name: ope.comptes_credit?.NOM,
                        code: ope.comptes_credit?.ID_COMPTES_COMPTABLES,
                    }
                });
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingTypes_operations_comptables(false);
            }
        })();
    }, []);
    useEffect(() => {
        document.title = "Editer"
        dispacth(
            setBreadCrumbItemsAction([
                administration_routes_items.types_operations_comptables,
                administration_routes_items.edit_types_operations_comptables,
            ])
        );
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    const filteredcomptes_comptables = comptes_comptables.filter((comptes) => comptes.code !== data.COMPTE_DEBIT?.code)

    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">
                        {Types_operations_comptables?.NOM_OPERATION}
                    </h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="NOM_OPERATION" className="label mb-1">
                                    Opérations
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire l'opérations"
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
                                        compte débit
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
                                        compte credit
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
                                navigate("/types_operations_comptables");
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
