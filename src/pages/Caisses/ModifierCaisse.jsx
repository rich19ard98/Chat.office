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
import { decodeId } from "../../utils/IdEncryption";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import PROFILS from "../../constants/PROFILS";
const initialForm = {
    NOM_AGENCE: "",
    AGENCE_ID: '',
    NUMERO_COMPTE: "",
    TYPE_CAISSE: ""



};

export default function ModifierAgences() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    console.log({ data });

    const [membre, setMembres] = useState([])
    const { ID_CAISSE: encodedStr } = useParams();
    const ID_CAISSE = decodeId(encodedStr)
    const [operations, setOperations] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [agences, setagences] = useState([])


    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        NOM_CAISSE: {
            required: true,
            alpha: true
        },
        TYPE_CAISSE: {
            required: true
        },
        AGENCE_ID: {
            required: true
        },
      
        NUMERO_COMPTE: {
            required: true
        }

    },
        {
            NOM_CAISSE: {
                required: "ce champ est obligatoire",
                alpha: true
            },
            TYPE_CAISSE: {
                required: "ce champ est obligatoire"
            },
            AGENCE_ID: {
                required: "ce champ est obligatoire"
            },
           
            NUMERO_COMPTE: {
                required: "Ce champs est obligatoire"
            }





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
    const [typecaisse, settypecaisse] = useState([
        {
            code: 0,
            name: 'Principale'
        },
        {
            code: 1,
            name: 'Caisse'
        },


    ]);


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("NOM_CAISSE", data.NOM_CAISSE);
                form.append("NUMERO_COMPTE", data.NUMERO_COMPTE);
                form.append("AGENCE_ID", data.AGENCE_ID?.code);
                form.append("TYPE_CAISSE", data.TYPE_CAISSE?.code);




                const res = await fetchApi(`/Caisses/Caisse/update/${ID_CAISSE}`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Caisse Modifie ",
                        detail: "Caisse a été Modifié avec succès",
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
    const FetchAgences = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/Caisses/Caisse/Find/${ID_CAISSE}`;
            //Caisses/Caisses/Find/:ID_CAISSE
            var url = baseurl;


            const res = await fetchApi(url);

            const resultats = res.result

            setData({
                NOM_CAISSE: resultats?.NOM_CAISSE,
                CAISSIER: {
                    name: `${resultats.caissier?.NOM} ${resultats.caissier?.PRENOM}`,
                    code: resultats.caissier?.ID_UTILISATEUR
                },
                AGENCE_ID: {
                    name: `${resultats.agence?.NOM_AGENCE}`,
                    code: resultats.agence?.ID_AGENCE
                },
                NUMERO_COMPTE: resultats.NUMERO_COMPTE,
                TYPE_CAISSE: {
                    name: TYPE_CAISSE === 0 ? "Principale" : "Caisse",
                    code: TYPE_CAISSE === 0 ? 0 : 1
                }


            });

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [,
        // dates, ID_INIT, 
        // comptesComptables

    ]);

    useEffect(() => {
        FetchAgences();
    }, [,
        //  dates,
        //   ID_INIT, 
        //   comptesComptables

    ]);


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
                    <h1 className="mb-3">Modifier Caisse</h1>
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
                                <label htmlFor="NOM_CAISSE" className="label mb-1">
                                    Nom Caisse
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le nom caisse"
                                    id="NOM_CAISSE"
                                    name="NOM_CAISSE"
                                    value={data.NOM_CAISSE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM_CAISSE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOM_CAISSE") ? getError("NOM_CAISSE") : ""}
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
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="NUMERO_COMPTE" className="label mb-1">
                                    Numero compte
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le Numero Compte"
                                    id="NUMERO_COMPTE"
                                    name="NUMERO_COMPTE"
                                    value={data.NUMERO_COMPTE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NUMERO_COMPTE") ? "p-invalid" : ""}`}
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
