
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";

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
    SOURCE_CAISSE_ID: "",
    DESTINATION_CAISSE_ID: '',
    TYPE_ALIMENTATION: "",
    MONTANT: "",
    MOTIF: ""
};
export default function NouveauAgences() {
    const dispatch = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembres] = useState([])
    const [operations, setOperations] = useState([])
    const [loading, setLoading] = useState(true);
    const user = useSelector(userSelector);
    const Isadmin = user.ID_PROFIL
    const agence = user?.agence?.ID_AGENCE
    const NomAgence = user.agence?.NOM_AGENCE
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [caisses, setCaisses] = useState([]); // ✅ Au lieu de useState(null)
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        MOTIF: {
            required: true,
            alpha: true
        },

        SOURCE_CAISSE_ID: {
            required: true
        },
        DESTINATION_CAISSE_ID: {
            required: false
        },
        MONTANT: {
            required: true
        }
        ,
        TYPE_ALIMENTATION: {
            required: true
        }

    },
        {
            TYPE_ALIMENTATION: {
                required: "ce champ est obligatoire",
                alpha: true
            },

            MOTIF: {
                required: "ce champ est obligatoire"
            },
            MONTANT: {
                required: "ce champ est obligatoire"
            },
            DESTINATION_CAISSE_ID: {
                required: "ce champ est obligatoire"
            },
            SOURCE_CAISSE_ID: {
                required: "Ce champs est obligatoire"
            }





        });
    // const FetchCaisses = useCallback(async () => {
    //     try {
    //         setLoading(true);
    //         const baseurl = `/Caisses/Caisse/fetch?`;

    //         var url = baseurl;

    //         const res = await fetchApi(url);
    //         const result = res.result.data
    //         const agence_id = result.map(agence => agence.AGENCE_ID)


    //         setcaisses(
    //             result.map((clM) => {
    //                 const typeCaisseLibelle = clM.TYPE_CAISSE === 0 ? "Principale"
    //                     : clM.TYPE_CAISSE === 1 ? "Caisse simple" : "Caisse centrale"
    //                 agence === agence_id
    //                 const soldeFormatted = Number(clM.SOLDE).toLocaleString('fr-FR', {
    //                     minimumFractionDigits: 2,
    //                     maximumFractionDigits: 2

    //                 });
    //                 return {
    //                     name: `${clM.NOM_CAISSE} (${typeCaisseLibelle}) -- SOLDE : ${soldeFormatted} Fbu`,
    //                     code: clM.ID_CAISSE,
    //                 };
    //             })
    //         );





    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [agence
    //     // dates, ID_INIT, 
    //     // comptesComptables

    // ]);
    const FetchCaisses = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/Caisses/Caisse/fetch?`;
            const res = await fetchApi(baseurl);
            const result = res.result.data || [];
            console.log({ result });

            // 🔎 filtrer les caisses de l’agence de l’utilisateur connecté

            // if (Isadmin) {
            //     console.log({Isadmin});

            //     const filtered = result.filter(clM => clM.AGENCE_ID === agence);

            //     setcaisses(
            //         filtered.map((clM) => {
            //             const typeCaisseLibelle = clM.TYPE_CAISSE === 0
            //                 ? "Principale"
            //                 : clM.TYPE_CAISSE === 1
            //                     ? "Caisse simple"
            //                     : "Caisse centrale";

            //             const soldeFormatted = Number(clM.SOLDE).toLocaleString('fr-FR', {
            //                 minimumFractionDigits: 2,
            //                 maximumFractionDigits: 2
            //             });

            //             return {
            //                 name: `${clM.NOM_CAISSE} (${typeCaisseLibelle}) -- SOLDE : ${soldeFormatted} Fbu`,
            //                 code: clM.ID_CAISSE,
            //             };
            //         })
            //     );
            // }
            // Si l'utilisateur est admin, on montre toutes les caisses
            // Si l'utilisateur n'est pas admin, on filtre par son agence
            if (Isadmin) {

                // Admin voit toutes les caisses
                setCaisses(
                    result.map((clM) => {
                        const typeCaisseLibelle = clM.TYPE_CAISSE === 0
                            ? "Principale"
                            : clM.TYPE_CAISSE === 1
                                ? "Caisse simple"
                                : "Caisse centrale";

                        const soldeFormatted = Number(clM.SOLDE).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                        return {
                            name: `${clM.CODE_CAISSE} (${typeCaisseLibelle}) -- SOLDE : ${soldeFormatted} Fbu`,
                            code: clM.ID_CAISSE,
                            agence_id: clM.AGENCE_ID // Garder l'info agence pour debug
                        };
                    })
                );
            } else {
                // Utilisateur non-admin : on filtre par son agence

                const filtered = result.filter(clM => clM.AGENCE_ID === agence);


                setCaisses(
                    filtered.map((clM) => {
                        const typeCaisseLibelle = clM.TYPE_CAISSE === 0
                            ? "Principale"
                            : clM.TYPE_CAISSE === 1
                                ? "Caisse simple"
                                : "Caisse centrale";

                        const soldeFormatted = Number(clM.SOLDE).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                        return {
                            name: `${clM.NOM_CAISSE} (${typeCaisseLibelle}) -- SOLDE : ${soldeFormatted} Fbu`,
                            code: clM.NUMERO_COMPTE,
                            agence_id: clM.AGENCE_ID
                        };
                    })
                );
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [agence]); // ✅ dépendance agence
    useEffect(() => {
        FetchCaisses();
    }, [agence
        //  dates,
        //   ID_INIT, 
        //   comptesComptables

    ]);
    const [Typealimentation, setTypealimentation] = useState([
        {
            code: 0,
            name: 'ALIMENTATION'
        },
        {
            code: 1,
            name: 'REMISE'
        },


    ]);



    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("SOURCE_CAISSE_ID", data.SOURCE_CAISSE_ID.code);
                form.append("DESTINATION_CAISSE_ID", data.DESTINATION_CAISSE_ID.code);
                form.append("MONTANT", data.MONTANT);
                form.append("TYPE_ALIMENTATION", data.TYPE_ALIMENTATION.code);
                form.append("MOTIF", data.MOTIF);


                const res = await fetchApi(`/Caisses/Alimentation/create`, {
                    method: "POST",
                    body: form,
                });

                dispatch(
                    setToastAction({
                        severity: "success",
                        summary: "Alimentation enregistré",
                        detail: "Alimentation a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/Alimentation");
            } else {
                console.log(getErrors());
                setErrors(getErrors());
                dispatch(
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
            if (error.httpStatus === "CONFLICT") {
                setErrors(getErrors());
                dispatch(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de l'alimentation caisse",
                        detail: 'Impossible de transférer vers la même caisse.',

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
            if (error.httpStatus === "BAD_REQUEST") {
                setErrors(getErrors());
                dispatch(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de l'Annulation",
                        detail: 'Montant insuffisant.',

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
            else
                if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                    setErrors(error.result);
                    dispatch(
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
                    dispatch(
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
        dispatch(
            setBreadCrumbItemsAction([
                administration_routes_items.ListesAgences,
                administration_routes_items.NouveauAgences,
            ])
        );
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
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
    const typeCaisses = [
        { id: 0, name: "Caisse centrale" },
        { id: 1, name: "Caisse principale" },
        { id: 2, name: "Caisse simple" },
    ];
    // Filtrage des caisses pour la destination
    const filteredCCaisses = caisses.filter(
        (caisse) => caisse.code !== data.SOURCE_CAISSE_ID?.code
    );
    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouvelle Alimentation dans l'agence {NomAgence}</h1>
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
                                <label htmlFor="SOURCE_CAISSE_ID" className="label mb-1">
                                    Source
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.SOURCE_CAISSE_ID}
                                    options={caisses}
                                    onChange={(e) => setValue("SOURCE_CAISSE_ID", e.value)}
                                    optionLabel="name"
                                    id="SOURCE_CAISSE_ID"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner compte source"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="SOURCE_CAISSE_ID"
                                    onHide={() => checkFieldData({ target: { name: "SOURCE_CAISSE_ID" } })}
                                    className={`w-100 ${hasError("SOURCE_CAISSE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("SOURCE_CAISSE_ID") ? getError("SOURCE_CAISSE_ID") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="DESTINATION_CAISSE_ID" className="label mb-1">
                                    Destination
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.DESTINATION_CAISSE_ID}
                                    options={filteredCCaisses}
                                    onChange={(e) => setValue("DESTINATION_CAISSE_ID", e.value)}
                                    optionLabel="name"
                                    id="DESTINATION_CAISSE_ID"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner destination"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="DESTINATION_CAISSE_ID"
                                    onHide={() => checkFieldData({ target: { name: "DESTINATION_CAISSE_ID" } })}
                                    className={`w-100 ${hasError("DESTINATION_CAISSE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("DESTINATION_CAISSE_ID") ? getError("DESTINATION_CAISSE_ID") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="TYPE_ALIMENTATION" className="label mb-1">
                                    Type alimentation
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.TYPE_ALIMENTATION}
                                    options={Typealimentation}
                                    onChange={(e) => setValue("TYPE_ALIMENTATION", e.value)}
                                    optionLabel="name"
                                    id="TYPE_ALIMENTATION"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Types alimentation"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="TYPE_ALIMENTATION"
                                    onHide={() => checkFieldData({ target: { name: "TYPE_ALIMENTATION" } })}
                                    className={`w-100 ${hasError("TYPE_ALIMENTATION") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("TYPE_ALIMENTATION") ? getError("TYPE_ALIMENTATION") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="MONTANT" className="label mb-1">
                                    Montant                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le Montant"
                                    id="MONTANT"
                                    name="MONTANT"
                                    value={data.MONTANT}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NUMERO_COMPTE") ? "p-invalid" : ""}`}
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
                                <label htmlFor="MOTIF" className="label mb-1">
                                    Motif                                </label>
                            </div>
                            <div className="col-sm">
                                <textarea
                                    type="text"
                                    placeholder="Ecrire le Motif"
                                    id="MOTIF"
                                    name="MOTIF"
                                    value={data.MOTIF}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("MOTIF") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("MOTIF") ? getError("MOTIF") : ""}
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
