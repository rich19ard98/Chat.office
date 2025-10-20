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
    ID_UTILISATEUR: "",
    ID_AGENCE: '',




};

export default function Ajouter_Chef_Agences() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembres] = useState([])
    const [operations, setOperations] = useState([])
    const [Agences, setAgences] = useState(null)


    const [groupements, setgroupements] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {


        ID_UTILISATEUR: {
            required: true,
            alpha: true
        },
        ID_AGENCE: {
            required: true
        },


    },
        {
            ID_UTILISATEUR: {
                required: "ce champ est obligatoire",
                alpha: true
            },
            ID_AGENCE: {
                required: "ce champ est obligatoire"
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
                form.append("ID_UTILISATEUR", data.ID_UTILISATEUR.code);
                form.append("ID_AGENCE", data.ID_AGENCE.code);

                const res = await fetchApi(`/Caisses/Cheaf/create`, {
                    method: "POST",
                    body: form,
                })

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Atribution enregistré",
                        detail: "Atribution a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/Cheaf");
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
                    let headerHeight = 0;
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
            if (error.httpStatus === "BAD_REQUEST") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur",
                        detail: 'Cet utilisateur est déjà chef de cette agence .',

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
            } else
            if (error.httpStatus === "CONFLICT") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur",
                        detail: 'Cet utilisateur est déjà chef de cette agence .',

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
                        let headerHeight = 0;
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

    const FetchGroupements = useCallback(async () => {
        try {
            const baseurl = `/Caisses/Groupement/fetch?`;

            var url = baseurl
            const res = await fetchApi(url);
            setgroupements(
                res.result.data.map((clM) => ({
                    name: `${clM.NOM_GROUPEMENT}`,
                    code: clM.ID_GROUPEMENT,
                }))
            );
        } catch (error) {
            console.log(error);
        } finally {
        }
    }, [


    ]);

    useEffect(() => {
        FetchGroupements();
    }, [

    ]);
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
    const FetchAgences = useCallback(async () => {
        try {
            const baseurl = `/Agences/Agences/fetch?`;

            var url = baseurl;


            const res = await fetchApi(url);



            const Resultas = res.result.data
            console.log({ Resultas }, 'erdgtfhgjkhgfdsfghjkm,');

            setAgences(
                res.result.data.map((clM) => ({
                    name: `${clM.NOM_AGENCE}`,
                    code: clM.ID_AGENCE,
                }))
            );

        } catch (error) {
            console.log(error);
        } finally {
        }
    }, [


    ]);

    useEffect(() => {
        FetchAgences();
    }, [


    ]);
    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div>
                    <h1 className="mb-3">Nouveau Chef agence</h1>
                    <hr className="w-100" />
                </div>

                {/* ✅ Formulaire centré et propre */}
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>

                    {/* === CAISSIER === */}
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ID_UTILISATEUR" className="label mb-1">
                                    Caissier
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.ID_UTILISATEUR}
                                    options={membre}
                                    onChange={(e) => setValue("ID_UTILISATEUR", e.value)}
                                    optionLabel="name"
                                    id="ID_UTILISATEUR"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Chef agence"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="ID_UTILISATEUR"
                                    onHide={() =>
                                        checkFieldData({ target: { name: "ID_UTILISATEUR" } })
                                    }
                                    className={`w-100 ${hasError("ID_UTILISATEUR") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ID_UTILISATEUR") ? getError("ID_UTILISATEUR") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === AGENCE === */}
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ID_AGENCE" className="label mb-1">
                                    Agence
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.ID_AGENCE}
                                    options={Agences}
                                    onChange={(e) => setValue("ID_AGENCE", e.value)}
                                    optionLabel="name"
                                    id="ID_AGENCE"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Agence"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="ID_AGENCE"
                                    onHide={() =>
                                        checkFieldData({ target: { name: "ID_AGENCE" } })
                                    }
                                    className={`w-100 ${hasError("ID_AGENCE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ID_AGENCE") ? getError("ID_AGENCE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* === BOUTONS === */}
                    <div
                        style={{ position: "absolute", bottom: 0, right: 0 }}
                        className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                    >
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
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </>
    );

}
