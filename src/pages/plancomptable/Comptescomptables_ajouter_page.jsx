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

const initialForm = {
    CODE: "",
    NOM: "",
    TYPE: null, // Initialisé à null pour correspondre au Dropdown
    CLASSE_ID: null, // Idem
};




export default function Comptescomptables_ajouter_page() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [classe, setclasse] = useState([]);
    const [codes, setCodes] = useState(null);
    const [typeCompte, setTypecompte] = useState([]);
    const [typescredit, setTypescredit] = useState([]);

    const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
        CODE: {
            required: true,
            length: [1, 50],
            number: true
        },
        NOM: {
            required: true,
            length: [1, 50],
            alpha: true
        },
        TYPE: {
            required: false,
            //number: true,
            //in: [0, 1, 2, 3], // pour valider que le code fait partie des valeurs valides
        },

        CLASSE_ID: {
            required: true,
            //number: true,
            //exists: "classe_comptable,ID_CLASSE_COMPTABLE"
        }
    },
        {
            CODE: {
                required: "Le code est obligatoire",
                length: "Le code ne doit pas dépasser 50 caractères",
                number: "Le code est invalide"
            },
            NOM: {
                required: "Le nom est obligatoire",
                length: "Le nom ne doit pas dépasser 50 caractères",
                alpha: "Le nom est invalide"
            },
            TYPE: {
                required: "Le type est obligatoire",
                //number: "Le type doit être un nombre",
                //in: "Le type sélectionné est invalide"
            },

            CLASSE_ID: {
                required: "La classe comptable est obligatoire",
                number: "La classe comptable doit être un nombre",
                exists: "La classe comptable n'existe pas"
            }
        }
    );

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();

                form.append("CODE", data.CODE);
                form.append("NOM", data.NOM);
                form.append("TYPE", data.TYPE);
                form.append("CLASSE_ID", data.CLASSE_ID?.code);

                const res = await fetchApi("/plancomptable/comptescomptables/creatercomptes", {
                    method: "POST",
                    body: form,
                });

                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: " Le compte comptable",
                        detail: "Le compte comptable a bien été creer avec succès",
                        life: 3000,
                    })
                );
                navigate('/comptecomptable')
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


    // liste deroulante des membres
    const fetchclasse = useCallback(async () => {
        try {
            const res = await fetchApi("/plancomptable/classcomptable/fetch?");
            const classes = res.result.data.map((CLASSE) => ({
                name: CLASSE.NOM_CLASSE,
                code: CLASSE.ID_CLASSE_COMPTABLE, 
            }));
            setclasse(classes);
        } catch (err) {
            console.error("Erreur lors du chargement des classes :", err);
        }
    }, []);
     useEffect(() => {
    fetchclasse()
  }, [])


    const [typeOptions, setTypeOptions] = useState([
        { label: "Actifs", value: 0 },
        { label: "Passifs", value: 1 },
        { label: "Produits", value: 2 },
        { label: "Charges", value: 3 },
        { label: "Achats", value: 4 },
    ]);

     useEffect(() => {
        fetchclasse();
        dispacth(setBreadCrumbItemsAction([
            { ...administration_routes_items.comptescomptables },
            { ...administration_routes_items.comptescomptables_ajouter },
        ]));

        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, [dispacth, fetchclasse]);

    //   const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <h1 className="mb-3">Comptes comptables</h1>
                        <div className="d-flex align-items-center">
                            <div className="form-group ">

                                <Button
                                    className=" mb-3 ml-3 button-mobile  px-2 py-1 "
                                    label="Retour"
                                    size="small"
                                    onClick={() => {
                                        navigate("/comptecomptable");
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                                        <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z" />
                                    </svg>
                                </Button>

                            </div>
                        </div>
                    </div>
                    <hr className="w-100" />

                </div>
                <form className="form w-80 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">

                        {/* Ligne 1 : Nom & Code */}
                        <div className="row">
                            {/* Nom */}
                            <div className="col-md-2">
                                <label htmlFor="NOM" className="label mb-1">Nom</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le nom"
                                    id="NOM"
                                    name="NOM"
                                    value={data.NOM}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM") ? "p-invalid" : ""}`}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("NOM") ? getError("NOM") : ""}
                                </div>
                            </div>

                            {/* Code */}
                            <div className="col-md-2">
                                <label htmlFor="CODE" className="label mb-1">Code</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le CODE"
                                    id="CODE"
                                    name="CODE"
                                    value={data.CODE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("CODE") ? "p-invalid" : ""}`}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("CODE") ? getError("CODE") : ""}
                                </div>
                            </div>
                        </div>

                        {/* Ligne 2 : Type & Classe */}
                        <div className="row">
                            {/* Type */}
                            <div className="col-md-2">
                                <label htmlFor="TYPE" className="label mb-1">Type</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.TYPE}
                                    options={typeOptions}
                                    onChange={(e) => setValue("TYPE", e.value)}
                                    optionLabel="label" // Correctement lié à la clé "label"
                                    id="TYPE"
                                    filter
                                    filterBy="label" // Filtre également par "label"
                                    placeholder="Sélectionner le Type"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="TYPE"
                                    onHide={() => { checkFieldData({ target: { name: "TYPE" } }); }}
                                    className={`w-100 ${hasError("TYPE") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("TYPE") ? getError("TYPE") : ""}
                                </div>
                            </div>

                            {/* Classe */}
                            <div className="col-md-2">
                                <label htmlFor="CLASSE_ID" className="label mb-1">Classe</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.CLASSE_ID}
                                    options={classe}
                                    onChange={(e) => setValue("CLASSE_ID", e.value)}
                                    optionLabel="name"
                                    id="CLASSE_ID"
                                    filter
                                    filterBy="name"
                                    placeholder="Sélectionner la classe"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="CLASSE_ID"
                                    onHide={() => { checkFieldData({ target: { name: "CLASSE_ID" } }); }}
                                    className={`w-100 ${hasError("CLASSE_ID") ? "p-invalid" : ""}`}
                                    showClear
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("CLASSE_ID") ? getError("CLASSE_ID") : ""}
                                </div>
                            </div>
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
                        <Button
                            label="Ajouter"
                            type="submit"
                            className="mt-3 ml-3"
                            size="small"
                            disabled={!isValidate()}
                            // disabled={isSubmitting}
                        />
                    </div>
                </form>


            </div>
        </>
    );
}
