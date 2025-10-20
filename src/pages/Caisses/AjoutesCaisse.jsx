
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
    NOM_AGENCE: "",
    AGENCE_ID: '',
    CAISSIER: "",
    NUMERO_COMPTE: "",
    TYPE_CAISSE: ""



};

export default function NouveauAgences() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembres] = useState([])
    const [comptesComptables, setComptesComptables] = useState([]);
    console.log({ data });

    const [agences, setagences] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {

        TYPE_CAISSE: {
            required: true
        },
        AGENCE_ID: {
            required: true
        },
        NUMERO_COMPTE: {
            required: true
        },

    },
        {
            TYPE_CAISSE: {
                required: "ce champ est obligatoire"
            },
            AGENCE_ID: {
                required: "ce champ est obligatoire"
            },
            NUMERO_COMPTE: {
                required: "ce champ est obligatoire"
            }
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
            name: 'Caisse Centrale'
        },


    ]);



    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("NUMERO_COMPTE", data.NUMERO_COMPTE);
                form.append("AGENCE_ID", data.AGENCE_ID?.code);
                form.append("TYPE_CAISSE", data.TYPE_CAISSE?.code);


                const res = await fetchApi(`/Caisses/Caisse/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Caissier enregistré",
                        detail: "Caissier a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/Caisses");
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
            if (error.httpStatus === "BAD_REQUEST") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de creation caisse",
                        detail: 'Numéro de compte existe déjà.',

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
        else  if (error.httpStatus === "CONFLICT") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de creation caisse",
                        detail: 'Une caisse avec ce numéro de compte existe déjà.',

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
             else  if (error.httpStatus === "CONFLICT") {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de creation caisse",
                        detail: 'Une caisse avec ce numéro de compte existe déjà.',

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
            else if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
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


    const fetchComptesComptables = useCallback(async () => {
        try {
            const url = `/plancomptable/comptescomptables/fetch`;
            const res = await fetchApi(url);

            // Vérifier si data existe
            const data = res?.result?.data || [];

            // Filtrer uniquement la classe 5 et ne garder que CODE + NOM
            const comptesClasse5 = data
                .filter((c) => c.CLASSE_ID === 5)
                .map((c) => ({
                    name: c.NOM,
                    code: c.CODE,
                }));


            setComptesComptables(comptesClasse5);
        } catch (error) {
            console.error("❌ Erreur fetchComptesComptables :", error);
        }
    }, []);


    useEffect(() => {
        fetchComptesComptables();
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
                                <label htmlFor="NUMERO_COMPTE" className="label mb-1">
                                    Nom Caisse
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.NUMERO_COMPTE}
                                    options={comptesComptables}
                                    onChange={(e) => setValue("NUMERO_COMPTE", e.value)}
                                    optionLabel="name"
                                    optionValue="code"
                                    id="NUMERO_COMPTE"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Caisse"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="NUMERO_COMPTE"
                                    disabled={comptesComptables.length === 0}
                                    onHide={() =>
                                        checkFieldData({ target: { name: "NUMERO_COMPTE" } })
                                    }
                                    className={`w-100 ${hasError("NUMERO_COMPTE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NUMERO_COMPTE") ? getError("NUMERO_COMPTE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="TELEPHONE" className="label mb-1">
                                    Type caisse
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.TYPE_CAISSE}
                                    options={typecaisse}
                                    onChange={(e) => setValue("TYPE_CAISSE", e.value)}
                                    optionLabel="name"
                                    id="TYPE_CAISSE"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner le type de caisse"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="TYPE_CAISSE"
                                    onHide={() => checkFieldData({ target: { name: "TYPE_CAISSE" } })}
                                    className={`w-100 ${hasError("TYPE_CAISSE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("TYPE_CAISSE") ? getError("TYPE_CAISSE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="CAISSIER" className="label mb-1">
                                    Agence
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.AGENCE_ID}
                                    options={agences}
                                    onChange={(e) => setValue("AGENCE_ID", e.value)}
                                    optionLabel="name"
                                    id="AGENCE_ID"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Agences"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="AGENCE_ID"
                                    onHide={() => checkFieldData({ target: { name: "AGENCE_ID" } })}
                                    className={`w-100 ${hasError("AGENCE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("AGENCE_ID") ? getError("AGENCE_ID") : ""}
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
