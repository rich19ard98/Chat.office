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
import { RadioButton } from 'primereact/radiobutton';
import Membre_microfinance_list_page from "./Membre_microfinance_list_page";

const initialForm = {

    NOM: "",
    PRENOM: "",
    EMAIL: "",
    TELEPHONE: "",
    ADRESSE: "",
    DATE_NAISSANCE: "",
    PHOTO_PASSPORT: "",
    LIEU_NAISSANCE: "",
    PHOTO_CNI: "",
    CNI_NUMERO: "",
    SEXE: 0


};

export default function Ajouter_membre_microfinance() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [profil, setProfil] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const {
        hasError,
        getError,
        setErrors,
        getErrors,
        checkFieldData,
        isValidate,
        setError,
    } = useFormErrorsHandle(
        data,
        {
            NOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PRENOM: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            EMAIL: {
                required: true,
                length: [1, 50],
                alpha: true,
                email: true,
            },
            TELEPHONE: {
                required: true,
                length: [1, 12],
                alpha: true,
            },
            ADRESSE: {
                required: true,
                length: [1, 150],
                alpha: true
            },
            DATE_NAISSANCE: {
                required: true,


            },
            PHOTO_PASSPORT: {
                image: 4000000,
                // required: true

            },
            LIEU_NAISSANCE: {
                required: true,
                length: [1, 50],
                alpha: true
            },
            PHOTO_CNI: {
                image: 4000000,
                // required: true
            },
            CNI_NUMERO: {
                required: true,
                length: [1, 30],
                alpha: true
            },

        },
        {
            NOM: {
                required: "Ce champ est obligatoire",
                length: "Le nom ne doit pas dépasser 50 caractères",
                alpha: "Le nom est invalide"
            },
            PRENOM: {
                required: "Ce champ est obligatoire",
                length: "Le prénom ne doit pas dépasser 50 caractères",
                alpha: "Le prénom est invalide"
            },
            EMAIL: {
                required: "Ce champ est obligatoire",
                length: "L'email ne doit pas dépasser 50 caractères",
                alpha: "L'email est invalide",
                email: "L'email n'est pas valide",
                unique: "Cet email est déjà utilisé"
            },
            TELEPHONE: {
                required: "Ce champ est obligatoire",
                length: "Le numéro ne doit pas dépasser 12 chiffres",
                number: "Le téléphone doit être numérique",
                unique: "Ce numéro  de Telephone est déjà utilisé"
            },
            ADRESSE: {
                required: "Ce champ est obligatoire",
                length: "L'adresse est trop longue",
                alpha: "L'adresse est invalide"
            },
            DATE_NAISSANCE: {
                required: "Ce champ est obligatoire",

            },
            // PHOTO_PASSPORT: {
            //     required: "Photo passport est obligatoire",
            //     image: "Le photo passport est trop long"
            // },
            LIEU_NAISSANCE: {
                required: "Ce champ est obligatoire",
                length: "Lieu de naissance be peut pas depasser 50 caracteres",
            },
            // PHOTO_CNI: {
            //     required: "Photo passport est obligatoire",
            //     image: "Le photo passport est trop long"
            // },
            CNI_NUMERO: {
                required: "Ce champ est obligatoire",
                length: "Numero CNI est trop longue",
                alpha: "Le Numero CNI  est invalide",
                unique: "Ce numéro CNI est déjà utilisé"
            }
        }
    );
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("NOM", data.NOM);
                form.append("PRENOM", data.PRENOM);
                form.append("EMAIL", data.EMAIL);
                form.append("TELEPHONE", data.TELEPHONE);
                form.append("ADRESSE", data.ADRESSE);
                form.append("DATE_NAISSANCE", moment(data.DATE_NAISSANCE).format("YYYY-MM-DD"));
                form.append("LIEU_NAISSANCE", data.LIEU_NAISSANCE);
                form.append("CNI_NUMERO", data.CNI_NUMERO);
                form.append("SEXE", data.SEXE);
                // Vérifie si PHOTO_PASSPORT et PHOTO_CNI sont bien des objets File
                if (data?.PHOTO_PASSPORT) {
                    form.append("PHOTO_PASSPORT", data.PHOTO_PASSPORT);
                     // Data est de type File, pas d'URL
                }
                if (data?.PHOTO_CNI) {
                    form.append("PHOTO_CNI", data.PHOTO_CNI);
                     // Data est de type File, pas d'URL
                }
                const res = await fetchApi(`/cotisation/membres_microfinance/createMembre`, {
                    method: "POST",
                    body: form,
                });
                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Le membre enregistré",
                        detail: "Le Membre a été enregistré avec succès",
                        life: 3000,
                    })
                );
                navigate("/membre_microfinance");
                setShowAddPageMembre(true)
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

    // Liste deroularantes des profiles
    const fetchProfil = useCallback(async () => {
        try {
            const res = await fetchApi("/administration/utilisateurs/profile");
            setProfil(
                res.result.map((prof) => {
                    return {
                        name: prof.DESCRIPTION,
                        code: prof.ID_PROFIL,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        document.title = "Nouveau"
        dispacth(
            setBreadCrumbItemsAction([
                administration_routes_items.membre_microfinance,
                administration_routes_items.New_membre_microfinance,
            ])
        );
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    useEffect(() => {
        fetchProfil();
    }, []);

    useEffect(() => {
        if (data.PHOTO_PASSPORT) {
            checkFieldData({ target: { name: "PHOTO_PASSPORT" } });
        }
        if (data.PHOTO_CNI) {
            checkFieldData({ target: { name: "PHOTO_CNI" } });
        }
    }, [data.PHOTO_PASSPORT, data.PHOTO_CNI]);




    const [showAddPageMembre, setShowAddPageMembre] = useState(false)
    const handlAddPageMembre = (e) => {
        e.preventDefault(true)
        setShowAddPageMembre(true)
    }

    const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            {showAddPageMembre ? (
                <Membre_microfinance_list_page />
            ) : (
                <>
                    <div className="px-4 py-3 main_content bg-white has_footer">
                        <div className="">
                            <h1 className="mb-3"> Nouveau membre microfinance</h1>
                            <div className="d-flex align-items-center">
                                <div className="form-group ">

                                  

                                </div>
                            </div>
                            <hr className="w-100" />
                        </div>
                        <form className="form w-80 mt-5" onSubmit={handleSubmit}>
                            <div className="form-group col-sm">
                                <div className="row">
                                    <div className="col-md-2">
                                        <label htmlFor="NOM" className="label mb-1">
                                            Nom
                                        </label>
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
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("NOM") ? getError("NOM") : ""}
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <label htmlFor="PRENOM" className="label mb-1">
                                            Prénom
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            placeholder="Ecrire le prénom"
                                            id="PRENOM"
                                            name="PRENOM"
                                            value={data.PRENOM}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("PRENOM") ? "p-invalid" : ""}`}
                                        />
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("PRENOM") ? getError("PRENOM") : ""}
                                        </div>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-md-2">
                                        <label htmlFor="EMAIL" className="label mb-1">
                                            Email
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="email"
                                            placeholder="Ecrire Votre Email"
                                            id="EMAIL"
                                            name="EMAIL"
                                            value={data.EMAIL}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("EMAIL") ? "p-invalid" : ""
                                                }`}
                                        />
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("EMAIL") ? getError("EMAIL") : ""}
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <label htmlFor="TELEPHONE" className="label mb-1">
                                            Telephone
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            placeholder="Ecrire le Telephone"
                                            name="TELEPHONE"
                                            id="TELEPHONE"
                                            value={data.TELEPHONE}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 is-invalid ${hasError("TELEPHONE") ? "p-invalid" : ""
                                                }`}
                                        />
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("TELEPHONE") ? getError("TELEPHONE") : ""}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-2">
                                        <label className="label mb-1">Sexe</label>
                                    </div>
                                    <div className="col-sm d-flex align-items-center">
                                        <div className="form-check me-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="SEXE"

                                                id="homme"
                                                value={0}
                                                checked={data.SEXE === 0}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: parseInt(e.target.value),
                                                    }))
                                                }
                                                onBlur={checkFieldData}
                                            />
                                            <label className="form-check-label" htmlFor="homme">
                                                Homme
                                            </label>
                                        </div>
                                        <div className="form-check me-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="SEXE"
                                                id="femme"
                                                value={1}
                                                checked={data.SEXE === 1}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: parseInt(e.target.value),
                                                    }))
                                                }
                                                onBlur={checkFieldData}
                                            />
                                            <label className="form-check-label" htmlFor="femme">
                                                Femme
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="SEXE"
                                                id="autres"
                                                value={2}
                                                checked={data.SEXE === 2}
                                                onChange={(e) =>
                                                    setData((prev) => ({
                                                        ...prev,
                                                        [e.target.name]: parseInt(e.target.value),
                                                    }))
                                                }
                                                onBlur={checkFieldData}
                                            />
                                            <label className="form-check-label" htmlFor="autres">
                                                Autres
                                            </label>
                                        </div>
                                    </div>
                                    <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                        {hasError("SEXE") ? getError("SEXE") : ""}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-2">
                                        <label htmlFor="ADRESSE" className="label mb-1">
                                            Adresse
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            
                                            placeholder="Ecrire Votre Addresse"
                                            id="ADRESSE"
                                            name="ADRESSE"
                                            value={data.ADRESSE}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("ADRESSE") ? "p-invalid" : ""
                                                }`}
                                        />
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("ADRESSE") ? getError("ADRESSE") : ""}
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <label htmlFor="LIEU_NAISSANCE" className="label mb-1">
                                            Lien de Naissance
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            placeholder="Ecrire le lien de naissance"
                                            name="LIEU_NAISSANCE"
                                            id="LIEU_NAISSANCE"
                                            value={data.LIEU_NAISSANCE}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 is-invalid ${hasError("LIEU_NAISSANCE") ? "p-invalid" : ""
                                                }`}
                                        />
                                        <div
                                            className="invalid-feedback"
                                            style={{ minHeight: 21, display: "block" }}
                                        >
                                            {hasError("LIEU_NAISSANCE") ? getError("LIEU_NAISSANCE") : ""}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* Label + Champ CNI_NUMERO */}
                                    <div className="col-md-2">
                                        <label htmlFor="CNI_NUMERO" className="label mb-1">
                                            Numéro de CNI
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <InputText
                                            type="text"
                                            placeholder="Écrire votre numéro CNI"
                                            id="CNI_NUMERO"
                                            name="CNI_NUMERO"
                                            value={data.CNI_NUMERO}
                                            onChange={handleChange}
                                            onBlur={checkFieldData}
                                            className={`w-100 ${hasError("CNI_NUMERO") ? "p-invalid" : ""}`}
                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                            {hasError("CNI_NUMERO") ? getError("CNI_NUMERO") : ""}
                                        </div>
                                    </div>

                                    {/* Label + Champ DATE_NAISSANCE */}
                                    <div className="col-md-2">
                                        <label htmlFor="DATE_NAISSANCE" className="label mb-1">
                                            Date de Naissance
                                        </label>
                                    </div>
                                    <div className="col-sm">
                                        <Calendar
                                            value={data.DATE_NAISSANCE}
                                            name="DATE_NAISSANCE"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                setValue("DATE_NAISSANCE", e.value);
                                                setError("DATE_NAISSANCE", {});
                                            }}
                                            placeholder="Choisir la date"
                                            inputClassName="w-100"
                                            onHide={() => {
                                                checkFieldData({ target: { name: "DATE_NAISSANCE" } });
                                            }}
                                            className={`d-block w-100 ${hasError("DATE_NAISSANCE") ? "p-invalid" : ""}`}
                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                            {hasError("DATE_NAISSANCE") ? getError("DATE_NAISSANCE") : ""}
                                        </div>
                                    </div>
                                </div>



                                <div className="row">

                                    {/* Champ CNI */}
                                    <div className="col-md-2">
                                        <label htmlFor="PHOTO_CNI" className="label mb-1">
                                            Photo CNI
                                        </label>
                                    </div>
                                    <div className="col-sm mb-3">
                                        <FileUpload
                                            chooseLabel="Choisir l'image"
                                            cancelLabel="Annuler"
                                            name="PHOTO_CNI"
                                            customUpload
                                            uploadOptions={{ style: { display: "none" } }}
                                            accept="image/*"
                                            maxFileSize={4000000}
                                            invalidFileSizeMessageDetail="Image trop lourde"
                                            emptyTemplate={<p className="m-0">Glissez et déposez l'image ici.</p>}
                                            onSelect={(e) => {
                                                const file = e.files[0];
                                                setValue("PHOTO_CNI", file);
                                                clearErrors("PHOTO_CNI");
                                            }}
                                            onClear={() => {
                                                setValue("PHOTO_CNI", null);
                                                setError("PHOTO_CNI", { type: "manual", message: "Champ requis" });
                                            }}
                                            className={`${hasError("PHOTO_CNI") ? "p-invalid" : ""}`}
                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                            {hasError("PHOTO_CNI") ? getError("PHOTO_CNI") : ""}
                                        </div>
                                    </div>

                                    {/* Champ Photo Passport */}
                                    <div className="col-md-2">
                                        <label htmlFor="PHOTO_PASSPORT" className="label mb-1">
                                            Photo Passport
                                        </label>
                                    </div>
                                    <div className="col-sm mb-3">
                                        <FileUpload
                                            chooseLabel="Choisir l'image"
                                            cancelLabel="Annuler"
                                            name="PHOTO_PASSPORT"
                                            customUpload
                                            uploadOptions={{ style: { display: "none" } }}
                                            accept="image/*"
                                            maxFileSize={4000000}
                                            invalidFileSizeMessageDetail="Image trop lourde"
                                            emptyTemplate={<p className="m-0">Glissez et déposez l'image ici.</p>}
                                            onSelect={(e) => {
                                                const file = e.files[0];
                                                setValue("PHOTO_PASSPORT", file);
                                                clearErrors("PHOTO_PASSPORT");
                                            }}
                                            onClear={() => {
                                                setValue("PHOTO_PASSPORT", null);
                                                setError("PHOTO_PASSPORT", { type: "manual", message: "Champ requis" });
                                            }}
                                            className={`${hasError("PHOTO_PASSPORT") ? "p-invalid" : ""}`}
                                        />
                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                            {hasError("PHOTO_PASSPORT") ? getError("PHOTO_PASSPORT") : ""}
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
                                    label="Envoyer"
                                    type="submit"
                                    className="mt-3 ml-3"
                                    size="small"
                                    disabled={!isValidate()}
                                />
                            </div>
                        </form>
                    </div>
                </>
            )}

        </>
    );
}
