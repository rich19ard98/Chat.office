import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { userSelector } from "../../store/selectors/userSelector";

const initialForm = {
    ID_UTILISATEUR: "",
    ID_AGENCE: '',
    ID_CAISSE: null,




};

export default function AjouterCaissier() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const user = useSelector(userSelector);
    const [membre, setMembres] = useState([])
    const [operations, setOperations] = useState([])
    const [Agences, setAgences] = useState(null)
    const [caisses, setcaisses] = useState([])
    const [groupements, setgroupements] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const agence = user?.agence?.ID_AGENCE
    const AgenceNom = user.agence?.NOM_AGENCE

    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        ID_UTILISATEUR: {
            required: true,
        },

        ID_AGENCE: {
            required: true,
        },
        ID_CAISSE: {
            required: true,
        },

    },
        {
            ID_CAISSE: {
                required: "ce champ est obligatoire",

            },
            ID_UTILISATEUR: {
                required: "ce champ est obligatoire",

            },
            ID_AGENCE: {
                required: "ce champ est obligatoire",

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
                form.append("ID_CAISSE", data.ID_CAISSE);
                form.append("ID_AGENCE", data.ID_AGENCE.code);
                const res = await fetchApi(`/Caisses/Caissier/create`, {
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
                navigate("/Caissier");
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
            const profils = [PROFILS.CAISSIER];
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
    //     const FetchCaisses = useCallback(async (ID_AGENCE = null) => {
    //         try {
    //             // Si une agence est choisie, on filtre par agence
    //             let url = `/Caisses/Caisse/fetch?`;
    //             if (ID_AGENCE) {
    //                 url += `Agence=${ID_AGENCE}`;
    //             }

    //             const res = await fetchApi(url);
    //             const resultats = res.result.data || [];
    // console.log({resultats});

    //             // On remplit la liste
    //             setcaisses(
    //                 resultats.map((item) => ({
    //                     name: `${item.NOM_CAISSE} — ${item.TYPE_CAISSE === 0
    //                         ? "Centrale"
    //                         : item.TYPE_CAISSE === 1
    //                             ? "Principale"
    //                             : "Secondaire"
    //                         }`,
    //                     code: item.ID_CAISSE,
    //                 }))
    //             );
    //         } catch (error) {
    //             console.error("Erreur lors du chargement des caisses :", error);
    //         }
    //     }, []);
    //     useEffect(() => {
    //         if (data.ID_AGENCE) {
    //             const Id = data.ID_AGENCE
    //             console.log({ Id }, 'jdddddddddddddddddddddddddddddddddd');

    //             // Si une agence est sélectionnée → charger ses caisses
    //             FetchCaisses(data.ID_AGENCE);
    //             console.log({caisses});

    //         } else {
    //             // Si aucune agence → vider la liste
    //             setcaisses([]);
    //         }
    //     }, [data.ID_AGENCE, FetchCaisses]);

    const FetchCaisses = useCallback(async (ID_AGENCE = null) => {
        try {
            let url = `/Caisses/Caisse/fetch?`;
            if (ID_AGENCE) {
                url += `Agence=${ID_AGENCE}`;
            }
            const res = await fetchApi(url);
            const resultats = Array.isArray(res?.result?.data) ? res.result.data : [];
            // On filtre côté front pour éviter les caisses d'autres agences
            const caissesFiltres = ID_AGENCE
                ? resultats.filter((c) => c.AGENCE_ID === ID_AGENCE)
                : resultats;
            // On mappe proprement les noms selon le type
            const caissesFormatees = caissesFiltres.map((item) => ({
                name: `${item.NOM_CAISSE} — ${item.TYPE_CAISSE === 0
                    ? "Principale"
                    : item.TYPE_CAISSE === 1
                        ? "Caisse"
                        : "Caisse Centrale"
                    }`,
                code: item.ID_CAISSE,
            }));
            console.log({ caissesFormatees });
            if (caissesFormatees.length === 1) {
                setValue("ID_CAISSE", caissesFormatees[0].code);
            }

            setcaisses(caissesFormatees);
        } catch (error) {
            console.error("Erreur lors du chargement des caisses :", error);
        }
    }, []);

    useEffect(() => {
        if (data?.ID_AGENCE) {
            // ✅ Si ID_AGENCE est un objet, on prend son code
            const agenceId =
                typeof data.ID_AGENCE === "object" ? data.ID_AGENCE.code : data.ID_AGENCE;

            FetchCaisses(agenceId);
        } else {
            setcaisses([]);
        }
    }, [data?.ID_AGENCE, FetchCaisses]);

    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div>
                    <h1 className="mb-3">Nouveau Caissier dans l'agence: {AgenceNom}</h1>
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
                                    placeholder="Sélectionner Caissier"
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
                    {/* === AGENCE === */}
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ID_CAISSE" className="label mb-1">
                                    Caisse
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.ID_CAISSE}
                                    options={caisses}
                                    onChange={(e) => setValue("ID_CAISSE", e.value)}
                                    optionLabel="name"
                                    optionValue="code"
                                    id="ID_CAISSE"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner Caisse"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="ID_AGENCE"
                                    disabled={caisses.length === 0}
                                    onHide={() =>
                                        checkFieldData({ target: { name: "ID_CAISSE" } })
                                    }
                                    className={`w-100 ${hasError("ID_CAISSE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ID_CAISSE") ? getError("ID_CAISSE") : ""}
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
