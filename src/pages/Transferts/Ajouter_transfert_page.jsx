import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    setBreadCrumbItemsAction,
    setToastAction,
} from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { Button } from "primereact/button";
import moment from "moment";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useForm } from "../../hooks/useForm";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
const initialForm = {
    COMPTE_SOURCE_ID: "",
    COMPTE_DESTINATAIRE_ID: "",
    MONTANT_TRANSFERE: null,
    DESCRIPTION: "",
    TYPE_OPERATION_ID: ""
};
export default function Ajouter_Transfert_page() {
    const dispatch = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [Types_operations_comptables, setTypes_operations_comptables] = useState([]);
    const [Comptes, setComptes] = useState([]);
    const [MontantCompteInterne, setMontantCompteInterne] = useState(0);
    const [MontantTransfert, setMontantTransfert] = useState(0);
    const [loading, setLoading] = useState(true);
    const {
        hasError,
        getError,
        setErrors,
        getErrors,
        checkFieldData,
        isValidate,
    } = useFormErrorsHandle(data, {
        COMPTE_SOURCE_ID: { required: true },
        COMPTE_DESTINATAIRE_ID: { required: true },
        MONTANT_TRANSFERE: { required: true },
        DESCRIPTION: { required: true, length: [1, 1000], alpha: true },
        TYPE_OPERATION_ID: { required: true }
    }, {
        COMPTE_SOURCE_ID: { required: "Ce champ est obligatoire" },
        COMPTE_DESTINATAIRE_ID: { required: "Ce champ est obligatoire" },
        MONTANT_TRANSFERE: { required: "Le montant est obligatoire", decimal: "Montant invalide" },
        DESCRIPTION: { required: "Ce champ est obligatoire", length: "Le motif ne doit pas dépasser 1000 caractères", alpha: "Le motif est invalide" },
        TYPE_OPERATION_ID: { required: "Ce champ est obligatoire" },
    });

    const fetchMontantTotalCredits = useCallback(async () => {
        try {
            setLoading(true);

            let url = "/rapport/findCoutRevenuCredits/fetch?";


            const res = await fetchApi(url);

            // Mise à jour selon la structure du backend corrigé

            setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))


        } catch (error) {
            console.error("Erreur lors de la récupération des crédits :", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMontantTotalCredits();
    }, []);

    const fetchComptes = useCallback(async () => {
        try {
            const res = await fetchApi(`/plancomptable/comptescomptables/fetch?rows=100000000000000&`);

            if (res && res.result && res.result.data) {
                setComptes(res.result.data.map(access => ({
                    name: `${access.NOM}`,              // Garde le libellé lisible
                    code: access.ID_COMPTES_COMPTABLES, // ✅ code est un number pur
                })));
            } else {
                console.error("Données non trouvées dans la réponse.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des comptes :", error);
        }
    }, []);

    useEffect(() => {
        fetchComptes();
    }, [fetchComptes]);

    const handleSubmit = async (e) => {
        // e.preventDefault();
        if (isValidate()) {
            setIsSubmitting(true);
            const form = new FormData();
            form.append("COMPTE_SOURCE_ID", data.COMPTE_SOURCE_ID?.code);
            form.append("COMPTE_DESTINATAIRE_ID", data.COMPTE_DESTINATAIRE_ID?.code);
            form.append("MONTANT_TRANSFERE", data.MONTANT_TRANSFERE);
            form.append("DESCRIPTION", data.DESCRIPTION);
            form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID?.code);
            try {
                const res = await fetchApi(`/transferts/transfert/create`, {
                    method: "POST",
                    body: form,
                });
                setMontantTransfert(res?.result?.MONTANT_TRANSFERE)
                if (MontantTransfert > MontantCompteInterne) {
                    dispatch(setToastAction({
                        severity: "warn",
                        summary: "Transfert error",
                        detail: "Le Compte insuffisant",
                        life: 3000,
                    }));
                }
                else {
                    dispatch(setToastAction({
                        severity: "success",
                        summary: "Transfert enregistré",
                        detail: "Le transfert a été enregistré avec succès",
                        life: 3000,
                    }));
                    navigate("/Transferts");
                }

            } catch (error) {
                console.error(error);
                dispatch(setToastAction({
                    severity: "warn",
                    summary: "Échec de Transfert",
                    detail: "Le solde est insuffisant ou le compte n'existe pas",
                    life: 3000,
                }));
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setErrors(getErrors());
        }
    };

    useEffect(() => {
        dispatch(setBreadCrumbItemsAction([
            administration_routes_items.Transferts,
            administration_routes_items.Transferts_add,
        ]));
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, [dispatch]);


    const handlesubmititems = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Terminer le Transfert",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment faire le Transfert ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                handleSubmit(itemsIds); // Passer itemsIds si nécessaire
            },
        });
    };



    const fetchTypes_operations_comptables = useCallback(async () => {
        try {
            const res = await fetchApi(`/cotisation/Types_operations_comptables/fetchTypeoperation?rows=1000000&`)

            const filtered = res.result.data.filter((tyop) =>
                tyop.NOM_OPERATION === "Transfert Caisse-Bancaire" ||
                tyop.NOM_OPERATION === "Transfert Bancaire-Caisse"

            );
            setTypes_operations_comptables(
                filtered.map((tyop) => {
                    return {
                        name: tyop.NOM_OPERATION,
                        code: tyop.ID_TYPES_OPERATIONS,
                    };
                }
                )
            );

            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchTypes_operations_comptables()
    }, [])

    // Filter accounts for the destination dropdown
    const filteredComptes = Comptes.filter(compte => compte.code !== data.COMPTE_SOURCE_ID?.code);

    return (
        <>
            {isSubmitting && <Loading />}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <h1 className="mb-3">Nouveau Transfert</h1>
                <hr className="w-100" />
                <form className="form w-75 mt-3" onSubmit={handleSubmit}>
                    <div className="form-group col-sm mt-2">
                        <div className="row mt-3">
                            <div className="col-md-4">
                                <label htmlFor="TYPE_OPERATION_ID" className="label mb-1">Types d'opération</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.TYPE_OPERATION_ID}
                                    options={Types_operations_comptables}
                                    onChange={(e) => setValue("TYPE_OPERATION_ID", e.value)}
                                    optionLabel="name"
                                    id="TYPE_OPERATION_ID"
                                    filter
                                    placeholder="Sélectionner un type d'opération"
                                    className={`w-100 ${hasError("TYPE_OPERATION_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("TYPE_OPERATION_ID") ? getError("TYPE_OPERATION_ID") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm mt-2">
                        <div className="row mt-3">
                            <div className="col-md-4">
                                <label htmlFor="COMPTE_SOURCE_ID" className="label mb-1">Compte source</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.COMPTE_SOURCE_ID}
                                    options={Comptes}
                                    onChange={(e) => {
                                        console.log("Compte source sélectionné:", e.value); // Debug log
                                        setValue("COMPTE_SOURCE_ID", e.value);
                                    }}
                                    optionLabel="name"
                                    id="COMPTE_SOURCE_ID"
                                    filter
                                    placeholder="Sélectionner le compte source"
                                    className={`w-100 ${hasError("COMPTE_SOURCE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("COMPTE_SOURCE_ID") ? getError("COMPTE_SOURCE_ID") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm mt-2">
                        <div className="row mt-3">
                            <div className="col-md-4">
                                <label htmlFor="COMPTE_DESTINATAIRE_ID" className="label mb-1">Compte destination</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.COMPTE_DESTINATAIRE_ID}
                                    options={Comptes} // Use filtered accounts
                                    onChange={(e) => {
                                        setValue("COMPTE_DESTINATAIRE_ID", e.value);
                                    }}
                                    optionLabel="name"
                                    id="COMPTE_DESTINATAIRE_ID"
                                    filter
                                    placeholder="Sélectionner le compte destination"
                                    className={`w-100 ${hasError("COMPTE_DESTINATAIRE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("COMPTE_DESTINATAIRE_ID") ? getError("COMPTE_DESTINATAIRE_ID") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm mt-2">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="MONTANT_TRANSFERE" className="label mb-1">Montant</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    id="MONTANT_TRANSFERE"
                                    placeholder="Le Montant"
                                    name="MONTANT_TRANSFERE"
                                    value={data.MONTANT_TRANSFERE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("MONTANT_TRANSFERE") ? "p-invalid" : ""}`}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("MONTANT_TRANSFERE") ? getError("MONTANT_TRANSFERE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm mt-2">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="DESCRIPTION" className="label mb-1">Description</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    name="DESCRIPTION"
                                    placeholder="Le Motif de transfert"
                                    id="DESCRIPTION"
                                    value={data.DESCRIPTION}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("DESCRIPTION") ? "p-invalid" : ""}`}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("DESCRIPTION") ? getError("DESCRIPTION") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                        <Button
                            label="Réinitialiser"
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
                            onClick={
                                (e) => {
                                    e.preventDefault()
                                    handlesubmititems(e)
                                }}
                            disabled={!isValidate()}
                        // disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}