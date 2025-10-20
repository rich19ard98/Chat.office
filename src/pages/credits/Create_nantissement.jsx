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
    MONTANT: "",
    ID_MEMBRE: '',
};

export default function Create_nantissement() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [membre, setMembre] = useState([])
    const [operations, setOperations] = useState([])
    const [groupements, setgroupements] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
        ID_MEMBRE: {
            required: true,
            alpha: true
        },
        MONTANT: {
            required: true,
            alpha: true
        },
    },
        {
            ID_MEMBRE: {
                required: "ce champ est obligatoire",
            },
            MONTANT: {
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
                form.append("MONTANT", data.MONTANT);
                form.append("ID_MEMBRE", data.ID_MEMBRE.code);
                const res = await fetchApi(`/Nantissements/Nantissements/create`, {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Nantissements enregistré",
                        detail: "Nantissements a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/Nantissements");
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
            if (error.httpStatus === 400) {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "warn",
                        summary: "Erreur lors de l'approbation du credis",
                        detail: 'Credits déjà approuvé ou Annuler .',

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
            if (error.httpStatus === "UNAUTHORIZED") {
                setErrors(getErrors());
                dispacth(
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
    const fetchMembre = useCallback(async () => {
        try {
            const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&membre=${PROFILS.MEMBRE}`)
            console.log({ res });

            setMembre(
                res.result.data.map((access) => {
                    return {
                        name: `${access.PRENOM} ${access.NOM}`,
                        code: access.ID_UTILISATEUR,
                    };
                })
            );
            setCodes(res)
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchMembre()
    }, [])
    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}

            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">Nouveau Nantissement</h1>
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
                                <label htmlFor="ID_MEMBRE" className="label mb-1">
                                    Membre
                                </label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.ID_MEMBRE}
                                    options={membre}
                                    onChange={(e) => setValue("ID_MEMBRE", e.value)}
                                    optionLabel="name"
                                    id="ID_MEMBRE "
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner membre"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="ID_GROUPEMENT"
                                    onHide={() => checkFieldData({ target: { name: "ID_MEMBRE" } })}
                                    className={`w-100 ${hasError("ID_MEMBRE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ID_MEMBRE") ? getError("ID_MEMBRE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="MONTANT" className="label mb-1">
                                    Montant
                                </label>
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
                                    className={`w-100 ${hasError("MONTANT") ? "p-invalid" : ""}`}
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
