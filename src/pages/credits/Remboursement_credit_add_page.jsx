
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
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
import { Tooltip } from 'primereact/tooltip';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import TYPE_OPERATION from "../../constants/TYPE_OPERATION";

const initialForm = {
    DATE_ENREGISTREMENT: "",
    MONTANT_CAPITAL: "",
    MONTANT_RESTANT: "",
    MODE_PAIEMENT: "",
    UTILISATEUR_ID: "",
    CREDIT_ID: "",
    TYPE_OPERATION_ID: "",
};
export default function Remboursement_credit_add_page() {
    const dispatch = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [Utilisateurs, setUtilisateurs] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [Credits, setCredits] = useState([]);
    const [totalRecords, setTotalRecords] = useState(1);

    const [amortissements, setAmortissements] = useState([]);
    const [codes, setCodes] = useState(null);
    const [montantPaye, setMontantPaye] = useState(0);
    const [montantRestant, setMontantRestant] = useState(0);
    const [afficherRemboursement, setAfficherRemboursement] = useState(false);
    const [selectedCreditId, setSelectedCreditId] = useState(null);
    const [montantCapital, setMontantCapital] = useState(0);
    const [TotalRemboursement, setTotalRemboursement] = useState([])
    const [isMontantCapitalDisabled, setIsMontantCapitalDisabled] = useState(false);
    const [fetchRemboursementPrecoceInfo, setfetchRemboursementPrecoceInfo] = useState()
    const [DateEcheance, setDateEcheance] = useState();
    const [operationSelected, setOperationSelected] = useState(null);
    const [typePaiementSelected, setTypePaiementSelected] = useState(null);
    const [isAnticipatif, setIsAnticipatif] = useState(false);
    const [penalite, setPenalite] = useState(0);
    const [Montant, setMontant] = useState(0);

    const [loading, setLoading] = useState(true);

    const [Types_operations_comptables, setTypes_operations_comptables] = useState([]);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        search: "",
        filters: {
            name: { value: "", matchMode: "contains" },
            "country.name": { value: "", matchMode: "contains" },
            company: { value: "", matchMode: "contains" },
            "representative.name": { value: "", matchMode: "contains" },
        },
    });
    const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
        CREDIT_ID: {
            required: true,
        },
        MONTANT_CAPITAL: {
            required: true,
            alpha: true,
            decimal: true
        },
        MODE_PAIEMENT: {
            required: true,

        },


        TYPE_OPERATION_ID: {
            required: true,
        },

    },
        {

            CREDIT_ID: {
                required: "Ce champ est obligatoire",
            },
            MONTANT_CAPITAL: {
                required: "Ce champ est obligatoire",
                alpha: "Le montant  est invalide",
                decimal: "La montant doit etre un nombre reel"
            },
            MODE_PAIEMENT: {
                required: "Ce champ est obligatoire",
                decimal: "Le montant est invalide",
            },
            TYPE_OPERATION_ID: {
                required: "Ce champ est obligatoire",

            },

        }
    );
    const [modePaiement, setModePaiement] = useState([
        {
            code: 0,
            name: 'Espèce'
        },
        {
            code: 1,
            name: 'Virement'
        },
        {
            code: 2,
            name: 'Versement'
        },

    ]);


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("CREDIT_ID", data.CREDIT_ID?.code);
                form.append("MONTANT_CAPITAL", data.MONTANT_CAPITAL);
                form.append("MODE_PAIEMENT", data.MODE_PAIEMENT?.code);

                form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID?.code);

                const res = await fetchApi("/credits/remboursement_credit/create", {
                    method: "POST",
                    body: form,
                });

                dispatch(
                    setToastAction({
                        severity: "success",
                        summary: " Le remboursement initie",
                        detail: "Le remboursement a bien été initie avec succès",
                        life: 2000,
                    })
                );
                navigate("/remboursement_credit", { state: { refresh: true } });
                // navigate('/remboursement_credit')
                //setShowAddPageRemboursement(true)

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
        }

        catch (error) {
            console.log(error);
            if (error.httpStatus === "UNAUTHORIZED") {
                setErrors(getErrors());
                dispatch(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur",
                        detail: "Connectez-vous avec un compte autorisé pour accéder à cette fonctionnalité ou contacter votre administrateur.",
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
                }
                else if (error.httpStatus == "BAD_REQUEST") {
                    setErrors(getErrors());
                    dispatch(
                        setToastAction({
                            severity: "warn",
                            summary: "Erreur lors de Remboursement",
                            detail: 'Montant remboursement ne doit pas etre supérieur au montant du credit demande.',

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
                else {
                    dispatch(
                        setToastAction({
                            severity: "error",
                            summary: "Erreur du système",
                            detail: "Erreur du système, réessayez plus tard",
                            life: 3000,
                        })
                    );
                }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // liste deroulante des credits
    const fetchCredit = useCallback(async () => {
        try {
            const res = await fetchApi(`/credits/credits/fetchCredit?rows=1000000`);
            const Data = res.result.data.DATE_ECHEANCE
            const Date = Data?.DATE_ECHEANCE

            setCredits(
                res.result.data.map((access) => {

                    return {
                        name: `${access.REFERENCE_CREDIT} - ${access.membresmicro?.NOM || ''} ${access.membresmicro?.PRENOM || ''}`,
                        code: access.ID_OCTROI_CREDIT,
                        setDateEcheance: access?.DATE_ECHEANCE
                    };


                })
            );
            setDateEcheance(
                res.result.data.map((date) => {

                    return {
                        name: `${date?.DATE_ECHEANCE}`,

                    };


                })
            )


            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchCredit()
    }, [])
    const [Typesoperations, setTypesoperations] = useState([
        {
            code: TYPE_OPERATION.REMBOURSEMENT_BANCAIRE,
            name: 'Remboursement Bancaire'
        },
        {
            code: TYPE_OPERATION.REMBOURSEMENT_ESPECE,
            name: 'Remboursement en Espèce'
        },

    ])
    const handlechangemontantcapital = ((e) => {
        e.preventDefault()
        e.stopPropagation()
        setMontant(e.value.target)

    })

    // liste deroulante des types operations
    const fetchTypes_operations_comptables = useCallback(async () => {
        try {
            const res = await fetchApi(`/cotisation/Types_operations_comptables/fetchTypeoperation?rows=1000000&`)
            const Typeoperation = res.result.data
            const Types = Typeoperation?.ID_TYPES_OPERATIONS
            const filtered = res.result.data.filter((tyop) =>
                tyop.NOM_OPERATION === "Remboursement bancaire" ||
                tyop.NOM_OPERATION === "Remboursement en espèce"

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

    useEffect(() => {
        if (operationSelected === "Remboursement en espèce") {
            setTypePaiementSelected(0); // 0 = Espèce
        } else if (operationSelected === "Remboursement bancaire") {
            setTypePaiementSelected(1, 2); // 1 = Virement
        }
    }, [operationSelected]);


    // liste deroulante des types operations
    const fetchUtilisateurs = useCallback(async () => {
        try {
            const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&`)
            setUtilisateurs(
                res.result.data.map((tyop) => {
                    return {
                        name: tyop.USERNAME,
                        code: tyop.ID_UTILISATEUR,
                    };
                })
            );
            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchUtilisateurs()
    }, [])

    useEffect(() => {
        dispatch(
            setBreadCrumbItemsAction([
                administration_routes_items.remboursement_credit,
                administration_routes_items.add_remboursement_credit,
            ])
        );
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, []);

    const handleBlur = (e) => {
        checkFieldData(e); // Appelle la logique existante

        const { name, value } = e.target;

        if (name === "MONTANT_CAPITAL" && parseFloat(value) === 0) {
            setToastAction?.show({
                severity: 'info',
                summary: 'Montant déjà payé',
                detail: 'Ce montant est déjà remboursé.',
                life: 3000
            });
        }
    };
    const resetForm = () => {
        setData(initialForm);
        setErrors({}); // Réinitialiser les erreurs si nécessaire
    };
    const submitRemboursementAnticipatifItems = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Terminer le remboursement anticipé",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment faire le remboursement anticipé ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                submitRemboursementAnticipatif(itemsIds); // Passer itemsIds si nécessaire
            },
        });
    };
    const submitRemboursementAnticipatif = async (itemsIds) => {
        try {
            setIsSubmitting(true);

            if (isValidate()) {
                const form = new FormData();
                form.append("CREDIT_ID", data.CREDIT_ID?.code);
                form.append("MONTANT_CAPITAL", data.MONTANT_CAPITAL);
                form.append("MODE_PAIEMENT", data.MODE_PAIEMENT?.code);
                form.append("TYPE_OPERATION_ID", data.TYPE_OPERATION_ID?.code);
                form.append("isAnticipe", true);

                const res = await fetchApi("/credits/RemboursementPrecoce/create", {
                    method: "POST",
                    body: form,
                });

                dispatch(
                    setToastAction({
                        severity: "success",
                        summary: "Remboursement anticipé initié",
                        detail: "Le remboursement a bien été initié avec succès",
                        life: 3000,
                    })
                );
                navigate('/remboursement_credit')
                resetForm(); // Réinitialiser le formulaire
                setIsAnticipatif(false);
                setIsMontantCapitalDisabled(false);
            } else {
                console.log(getErrors());
                setErrors(getErrors());
                dispatch(
                    setToastAction({
                        severity: "error",
                        summary: "Échec de validation",
                        detail: "Veuillez corriger les erreurs pour continuer",
                        life: 3000,
                    })
                );
                await wait(500);
                scrollToFirstError();
            }
        } catch (error) {
            console.log(error);
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Fonction pour gérer le défilement vers la première erreur
    const scrollToFirstError = () => {
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
            let headerHeight = 0;
            if (header) headerHeight += header.offsetHeight;
            if (nav) headerHeight += nav.offsetHeight;
            const scrollPosition =
                firstErrorElement.getBoundingClientRect().top +
                window.scrollY - headerHeight;
            window.scrollTo({
                top: scrollPosition,
                behavior: "smooth",
            });
        }
    };
    // Fonction pour gérer les erreurs
    const handleError = (error) => {
        if (error.httpStatus === "UNPROCESSABLE_ENTITY") {
            setErrors(error.result);
            dispatch(
                setToastAction({
                    severity: "error",
                    summary: "Erreur du système",
                    detail: "Erreur de validation côté serveur",
                    life: 3000,
                })
            );
        } else if (error.httpStatus === "BAD_REQUEST") {
            setErrors(getErrors());
            dispatch(
                setToastAction({
                    severity: "warn",
                    summary: "Erreur lors du paiement",
                    detail: "Le montant remboursé ne dépasse pas le total requis",
                    life: 3000,
                })
            );
        } else {
            dispatch(
                setToastAction({
                    severity: "error",
                    summary: "Erreur du système",
                    detail: "Une erreur est survenue. Veuillez réessayer plus tard",
                    life: 3000,
                })
            );
        }
        scrollToFirstError(); // Faire défiler vers la première erreur
    };
    const handleRemboursementPrecoceItems = (e, selectedCreditId) => {
        e.preventDefault(); // Décommenté pour empêcher le comportement par défaut
        e.stopPropagation(); // Décommenté pour arrêter la propagation de l'événement

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Faire  Le Remboursement Precoce",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment faire un remboursement précoce ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                handleRemboursementPrecoce(selectedCreditId.code);
            },
        });
    };

    const handleRemboursementPrecoce = async (selectedCreditId) => {
        setIsAnticipatif(true);

        if (!selectedCreditId) {
            return;
        }
        try {
            const res = await fetchApi(`/credits/RemboursementPrecoce/Fetch/${selectedCreditId}`);
            // Mise à jour du formulaire avec les informations reçues
            setValue("MONTANT_CAPITAL", res.totalARembourser); // afficher 51510 dans l'input
            setPenalite(res.penaliteAnticipation);
            setTotalRemboursement(res.totalARembourser);

            // Calculer le total à rembourser (montant restant + pénalité)
            const totalRemboursement = parseFloat(res.totalARembourser)

            setTotalRemboursement(totalRemboursement);  // Total à rembourser

            // Désactiver le champ de montant capital
            setIsMontantCapitalDisabled(true);
            // Vérifie si la date d'échéance est inférieure à la date actuelle
            const isDateExpired = selectedCreditId ? new Date(selectedCreditId.setDateEcheance) < new Date() : false;
        }
        catch (error) {
            console.log(error);
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
            }
            else
                if (error.statusCode == 400) {
                    setErrors(getErrors());
                    dispatch(
                        setToastAction({
                            severity: "warn",
                            summary: "Erreur lors de paiement",
                            detail:
                                "Désole vous avez déjà depassé le periode de remboursement precoce ou vous n'avez pas selectionne le credit",

                            life: 4000,
                        })
                    );

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
                    setIsAnticipatif(false)
                }
                else {
                    dispatch(
                        setToastAction({
                            severity: "error",
                            summary: "Erreur du système",
                            detail: "Erreur du système, réessayez plus tard",
                            life: 3000,
                        })
                    );
                }
        }
        finally {

        }
    };
    //Gestion de la validation de textinput MONTANT_CAPITAL  pour qu'il accepte le montant vienne de remboursement precoce
    // Cette ref servira à savoir si le composant est monté pour la première fois
    const isInitialRender = useRef(true);

    useEffect(() => {
        // Si c'est le premier rendu du composant…
        if (isInitialRender.current) {
            // …on passe le drapeau à false pour les prochains rendus
            isInitialRender.current = false;
            // …et on quitte le useEffect sans valider le champ (on ignore le premier rendu)
            return;
        }

        // À partir du deuxième rendu :
        // Vérifie que le montant n'est pas undefined ET pas une chaîne vide
        if (data.MONTANT_CAPITAL !== undefined && data.MONTANT_CAPITAL !== "") {
            // Appelle la fonction de validation en simulant un événement
            checkFieldData({ target: { name: "MONTANT_CAPITAL", value: data.MONTANT_CAPITAL } })
        }
    }, [data.MONTANT_CAPITAL]); // Ce useEffect se déclenche à chaque fois que MONTANT_CAPITAL change


    const handleRetour = () => {
        setIsAnticipatif(false); // Réinitialise l'état pour afficher le remboursement précoce
        setData(initialForm);
        setErrors({});
        setIsMontantCapitalDisabled(false)

    };
    const fetchAmortissements = useCallback(async () => {
        try {
            setLoading(true);

            const baseurl = `/credits/amortissements/fetch?rows=1000000000&`;
            let url = baseurl;

            for (let key in lazyState) {
                const value = lazyState[key];
                if (value) {
                    if (typeof value === "object") {
                        url += `${key}=${JSON.stringify(value)}&`;
                    } else {
                        url += `${key}=${value}&`;
                    }
                }
            }
            const res = await fetchApi(url);
            const data = res.result.data;
            setAmortissements(data);
            setTotalRecords(res.result.totalRecords);
            // ✅ Vérifie que selectedCreditId existe et contient un `code`
            const creditId = selectedCreditId?.code;
            // ✅ Filtrer les échéances du crédit sélectionné
            const echeancesDuCredit = data.filter(item => item.CREDIT_ID === creditId);
            // ✅ Calculer le total des échéances
            const total = echeancesDuCredit.reduce((acc, cur) => {
                const montantRestant = parseFloat(cur.MONTANT_RESTANT || 0);
                const penalite = parseFloat(cur.MONTANT_PENALITE || 0);

                const totalAvecPenalite = (isNaN(montantRestant) ? 0 : montantRestant) +
                    (isNaN(penalite) ? 0 : penalite);

                return acc + totalAvecPenalite;
            }, 0);

            setValue("MONTANT_RESTANT", Number(total).toFixed(2));
            setMontant(Number(total.toFixed(2)));



        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, selectedCreditId]);
    useEffect(() => {
        if (selectedCreditId) {
            fetchAmortissements();
        }
    }, [lazyState, selectedCreditId]);


    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3"> Nouveau remboursement</h1>
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
                                <label htmlFor="CREDIT_ID" className="label mb-1">
                                    Credits
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.CREDIT_ID}
                                    options={Credits}
                                    autoFocus
                                    onChange={(e) => {
                                        setValue("CREDIT_ID", e.value);
                                        setSelectedCreditId(e.value);
                                    }}
                                    optionLabel="name"
                                    id="CREDIT_ID"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner le crédit"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="CREDIT_ID"
                                    onHide={() => {
                                        checkFieldData({ target: { name: "CREDIT_ID" } });
                                    }}
                                    className={`w-100 ${hasError("CREDIT_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("CREDIT_ID") ? getError("CREDIT_ID") : ""}
                                </div>


                            </div>

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <label htmlFor="TYPE_OPERATION_ID" className="label mb-1">
                                Type operation
                            </label>
                        </div>
                        <div className="col-sm">
                            <Dropdown
                                value={data.TYPE_OPERATION_ID}
                                options={Types_operations_comptables}

                                onChange={(e) => {
                                    setValue("TYPE_OPERATION_ID", e.value);

                                    // Vérifiez la valeur sélectionnée par code
                                    if (e.value.code === TYPE_OPERATION.REMBOURSEMENT_ESPECE) {
                                        setValue("MODE_PAIEMENT", modePaiement.find(option => option.name === "Espèce"));
                                    }
                                    else if (e.value.code === TYPE_OPERATION.REMBOURSEMENT_BANCAIRE) {
                                        setValue("MODE_PAIEMENT", null); // Réinitialiser le mode de paiement
                                    }
                                }}
                                optionLabel="name"
                                id="TYPE_OPERATION_ID"
                                filter
                                filterBy="name"
                                placeholder="Sélectionner le type d'opération"
                                emptyFilterMessage="Aucun élément trouvé"
                                emptyMessage="Aucun élément trouvé"
                                name="TYPE_OPERATION_ID"
                                onHide={() => {
                                    checkFieldData({ target: { name: "TYPE_OPERATION_ID" } });
                                }}
                                className={`w-100 ${hasError("TYPE_OPERATION_ID") ? "p-invalid" : ""}`}
                                showClear
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                {hasError("TYPE_OPERATION_ID") ? getError("TYPE_OPERATION_ID") : ""}
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="MODE_PAIEMENT" className="label mb-1">
                                    Mode paiement
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.MODE_PAIEMENT}
                                    options={modePaiement.filter(option => {
                                        // Filtrer l'option "Espèce" si "Remboursement bancaire" est sélectionné
                                        return !(data.TYPE_OPERATION_ID &&
                                            data.TYPE_OPERATION_ID.code ===
                                            TYPE_OPERATION.REMBOURSEMENT_BANCAIRE && option.name === "Espèce");
                                    })}
                                    onChange={(e) => {
                                        setValue("MODE_PAIEMENT", e.value);
                                    }}
                                    optionLabel="name"
                                    id="MODE_PAIEMENT"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner mode paiement"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="MODE_PAIEMENT"
                                    onHide={() => {
                                        checkFieldData({ target: { name: "MODE_PAIEMENT" } });
                                    }}
                                    className={`w-100 ${hasError("MODE_PAIEMENT") ? "p-invalid" : ""}`}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("MODE_PAIEMENT") ? getError("MODE_PAIEMENT") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <label htmlFor="MONTANT_CAPITAL" className="label mb-1">
                                Montant capital
                            </label>
                        </div>
                        <div className="col-sm">
                            <InputText
                                type="text"
                                placeholder="Ecrire le montant demandé"
                                id="MONTANT_CAPITAL"
                                name="MONTANT_CAPITAL"
                                value={data.MONTANT_CAPITAL}
                                onChange={handleChange}
                                disabled={isMontantCapitalDisabled}
                                className={`w-100 is-invalid ${hasError("MONTANT_CAPITAL") ? "p-invalid" : ""}`}
                            />
                            <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                {hasError("MONTANT_CAPITAL") ? getError("MONTANT_CAPITAL") : ""}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <label htmlFor="MONTANT_RESTANT" className="label mb-1">
                                Montant restant
                            </label>
                        </div>
                        <div className="col-sm">
                            <InputText
                                type="text"
                                placeholder="Montant restant"
                                id="MONTANT_RESTANT"
                                name="MONTANT_RESTANT"
                                value={data.MONTANT_RESTANT}
                                disabled
                                className="w-100"
                            />
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
                        {/* Rembourse */}

                        <Button
                            label="Rembourse"
                            type="submit"
                            outlined
                            className="mt-3 ml-3"
                            size="small"
                            disabled={!isValidate()}
                        // disabled={isSubmitting}
                        />




                    </div>
                </form >

            </div >
            {/* </>
            )} */}

        </>
    );
}