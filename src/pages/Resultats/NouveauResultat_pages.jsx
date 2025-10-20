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
import { userSelector } from "../../store/selectors/userSelector";

import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { InputTextarea } from "primereact/inputtextarea";
import PROFILS from "../../constants/PROFILS";
const initialForm = {
    RESERVE_GENERAL: null,
    DIVIDENTE_PAYER: null,
    PRIME_ADMINISTRATION: null

};



export default function NouveauResultat_pages() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const user = useSelector(userSelector)

    const [membre, setMembres] = useState([])
    const [operations, setOperations] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [totalresultant, setTotalresultant] = useState(null)
    const [Dividende, setDividende] = useState(null)
    const [PrimeAdministrative, setPrimeAdministrative] = useState(null)
    const [Reservegenerale, setReservegenerale] = useState(null)
    const [loading, setLoading] = useState(true);
    const [modes, setmodes] = useState(true);
    const [selectedComptedebit, setSelectedComptedebit] = useState(null);
    const [selectedComptecredit, setSelectedComptecredit] = useState(null);
    const IsGerant = user.ID_PROFIL === PROFILS.GERANT

    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle({ ...data }, {

        DIVIDENTE_PAYER: {
            required: true,

        },
        PRIME_ADMINISTRATION: {
            required: true,

        },
        RESERVE_GENERAL: {
            required: true,

        },
    },
        {
            PRIME_ADMINISTRATION: {
                required: "Ce champ est obligatoire",
                number: "Il faut mettre un nombre entier"
            },
            RESERVE_GENERAL: {
                required: "Ce champ est obligatoire",

            },


            DIVIDENTE_PAYER: {
                required: "Ce champ est obligatoire",
            },



        });
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


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();

                form.append("RESERVE_GENERAL", data.RESERVE_GENERAL);
                form.append("DIVIDENTE_PAYER", data.DIVIDENTE_PAYER);
                form.append("PRIME_ADMINISTRATION", data.PRIME_ADMINISTRATION);

                const res = await fetchApi(`/Resultats/Resultats/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Initialisation enregistré",
                        detail: "Initialisation a été enregistré avec succès",
                        life: 3000,
                    })
                );
                const resultant = res.result
                navigate("/Listes");

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
            }
            else if (error.httpStatus === 400) {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de Initialisation Compte",
                        detail: 'Montant insuffisant .',

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
    //fonction pour lister les frais d'adhesion
    const FetchResultats = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/bilan/bilan/fetchTempsreel?`;
            const url = baseurl;

            const res = await fetchApi(url);
            const total = res.result.totalresultant;
            setTotalresultant(total);

            const Montantdividende = parseFloat((total * 15) / 100).toFixed(2);
            const Montantreservegeneral = parseFloat((total * 80) / 100).toFixed(2);
            const Montantprimeadministrative = parseFloat((total * 5) / 100).toFixed(2);

            setData((prev) => ({
                ...prev,
                DIVIDENTE_PAYER: Montantdividende, // ✅ corrigé
                PRIME_ADMINISTRATION: Montantprimeadministrative, // ✅ corrigé
                RESERVE_GENERAL: Montantreservegeneral, // ✅ corrigé
            }));

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState]);
    useEffect(() => {
        FetchResultats();
    }, [lazyState]);
    const [comptes, setComptes] = useState([])
    const FetchResultatsapprouve = useCallback(async () => {
        try {
            const res = await fetchApi(`/Resultats/Resultats/fetch?`);
            console.log(res);

            setmodes(res.result.data)
            if (res && res.result && res.result.data) {
                setComptes(res.result.data.map(access => ({
                    name: `${access.NOM} ${access.CODE}`,              // Garde le libellé lisible
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
        FetchResultatsapprouve();
    }, [FetchResultatsapprouve]);


    const handleCompteChangedebit = (e) => {
        setSelectedComptedebit(e.value);
        const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

    };
    const handleCompteChangecredit = (e) => {
        setSelectedComptecredit(e.value);
        const cpm = e.value ? comptes.find(c => c.code === e.value.code) : null;

    };
    useEffect(() => {
        document.title = "Compte"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'Résultats',
                name: 'Liste'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);
    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouvel Résultat</h1>
                    <div className="d-flex align-items-center">
                        <div className="form-group ">
                        </div>
                    </div>
                    <hr className="w-100" />
                </div>
                <form className="form w-100 mzt-5" onSubmit={handleSubmit}>
                    <div className="grid">
                        <div className="col-12 w-100 md:col-3">
                            <div className="card bg-dark shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Valeur Nette</h5>
                                <p className="text-center text-white text-xl font-semibold">
                                    {new Intl.NumberFormat('fr-FR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(totalresultant)} FBU
                                </p>

                            </div>

                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card bg-dark shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Réserve générale</h5>
                                <p className="text-center text-xl text-white font-semibold">80%</p>
                            </div>
                            <div className="form-group col-sm">
                                <div className="row">
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            disabled
                                            placeholder="Montant"
                                            id="RESERVE_GENERAL"
                                            name="RESERVE_GENERAL"
                                            value={
                                                data?.RESERVE_GENERAL
                                                    ? new Intl.NumberFormat("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(data.RESERVE_GENERAL) + " FBU"
                                                    : "0.00"
                                            }
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("RESERVE_GENERAL") ? "p-invalid" : ""} font-bold text-black`}
                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                            {hasError("RESERVE_GENERAL") ? getError("RESERVE_GENERAL") : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card bg-dark shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Prime administrative</h5>
                                <p className="text-center text-white text-xl font-semibold">5%</p>
                            </div>
                            <div className="form-group col-sm">

                                <div className="row">

                                    <div className="col-sm">

                                        <InputText
                                            disabled
                                            type="text"
                                            placeholder={"Montant"}
                                            id="PRIME_ADMINISTRATION"
                                            name="PRIME_ADMINISTRATION"
                                            value={
                                                data?.PRIME_ADMINISTRATION
                                                    ? new Intl.NumberFormat("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(data.PRIME_ADMINISTRATION) + " FBU"
                                                    : "0.00"
                                            }
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("PRIME_ADMINISTRATION") ? "p-invalid" : ""} font-bold text-black`}

                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                                            {hasError("PRIME_ADMINISTRATION") ? getError("PRIME_ADMINISTRATION") : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card bg-dark shadow-2 p-3 border-round-2xl">
                                <h5 className="text-center mb-2 text-white">Dividende a payer</h5>
                                <p className="text-center text-white text-xl font-semibold">15%</p>
                            </div>
                            <div className="form-group col-sm">
                                <div className="row">
                                    <div className="col-sm ">

                                        <InputText
                                            type="text"
                                            placeholder={"Montant"}
                                            id="DIVIDENTE_PAYER"
                                            disabled
                                            name="DIVIDENTE_PAYER"
                                            value={
                                                data?.DIVIDENTE_PAYER
                                                    ? new Intl.NumberFormat("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(data.DIVIDENTE_PAYER) + " FBU"
                                                    : "0.00"
                                            }
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("DIVIDENTE_PAYER") ? "p-invalid" : ""} font-bold text-black`}

                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>

                                            {hasError("DIVIDENTE_PAYER") ? getError("DIVIDENTE_PAYER") : ""}
                                        </div>
                                    </div>

                                </div>
                            </div>


                        </div>

                    </div>
                    {IsGerant ? null :(<div
                        style={{ position: "absolute", bottom: 0, right: 0 }}
                        className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                    >

                        <Button
                            label="Creer"
                            type="submit"
                            className="mt-3 ml-3"
                            size="small"
                            disabled={isSubmitting}
                        />
                    </div>)}

                    {modes.STATUT === 0 ?
                        <div
                            style={{ position: "absolute", bottom: 0, right: 0 }}
                            className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                        >

                            <Button
                                label="Approuve"
                                type="submit"
                                className="mt-3 ml-3"
                                size="small"
                                disabled={isSubmitting}
                            />
                        </div>
                        : null
                    }


                </form>
            </div>
            {/* </>
      )} */}

        </>
    );
}
