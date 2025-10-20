import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import fetchApi from "../../helpers/fetchApi";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import wait from "../../helpers/wait";
import { decodeId } from "../../utils/IdEncryption";
import { Dropdown } from "primereact/dropdown";
/**
* Récupérer toutes les classes comptables
* @date  15/04/2025
* @param {express.Request} req 
* @param {express.Response} res 
* @author rosine <gahimbarerosine9@gmail.com>
*/
const initialForm = {
    NOM_CLASSE: "",
    DESCRIPTION: "",
    CLASSE_POUR: "",
};

export default function Classecomptable_edit_page() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { ID_CLASSE_COMPTABLE } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [classe, setclasse] = useState();
    const [Classecomptable, setClassecomptable] = useState([]);
    const [data, handleChange, setData, setValue] = useForm(initialForm);

    const { hasError, getError, setErrors, checkFieldData, isValidate, getErrors } = useFormErrorsHandle(data, {
        NOM_CLASSE: { required: true },
        DESCRIPTION: { required: true },
        CLASSE_POUR: { required: true }
    }, {
        NOM_CLASSE: { required: "Le nom de la classe est obligatoire" },
        DESCRIPTION: { required: "La description est obligatoire" },
        CLASSE_POUR: { required: "Le champ 'classe pour' est obligatoire" },
    });


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("NOM_CLASSE", data.NOM_CLASSE);
                form.append("DESCRIPTION", data.DESCRIPTION);
                form.append("CLASSE_POUR", data.CLASSE_POUR);

                const res = await fetchApi(`/plancomptable/classcomptable/update/${ID_CLASSE_COMPTABLE}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                });

                dispatch(setToastAction({
                    severity: "success",
                    summary: "Classe modifiée",
                    detail: "La classe comptable a été modifiée avec succès",
                    life: 3000,
                }));
                navigate("/classecomptable");
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
        (async () => {
            try {
                const res = await fetchApi(`/plancomptable/classcomptable/find/${ID_CLASSE_COMPTABLE}?`);
                if (res && res.result) {
                    const classe = res.result;

                    setclasse(classe);
                    setData({
                        NOM_CLASSE: classe?.NOM_CLASSE,
                        DESCRIPTION: classe?.DESCRIPTION,
                        CLASSE_POUR: classe?.CLASSE_POUR,

                    });
                } else {
                    console.error('Aucun classe trouvé ou réponse invalide', res);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du classe:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        document.title = " Edit comptable"
        dispatch(setBreadCrumbItemsAction([
            {
                path: 'classecomptable/edit/:ID_CLASSE_COMPTABLE',
                name: 'Modifier la classe comptable'
            },
        ]));
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, []);


    if (loading) {
        return <div className="d-flex justify-content-center align-items-center h-100 w-100"><div className="spinner-border" role="status" /></div>;
    }

    return (
        <>
            {isSubmitting && <Loading />}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div>
                    <h1 className="mb-3">
                        {classe.NOM_CLASSE}
                    </h1>
                    <hr className="w-100" />
                </div>

                <form className="form w-80 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">

                        {/* Ligne 1 : Nom & Classe pour */}
                        <div className="row mb-3">
                            {/* Nom */}
                            <div className="col-md-2">
                                <label htmlFor="NOM_CLASSE" className="label mb-1">Nom</label>
                            </div>
                            <div className="col-sm me-3">
                                <InputText
                                    id="NOM_CLASSE"
                                    name="NOM_CLASSE"
                                    value={data.NOM_CLASSE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("NOM_CLASSE") ? "p-invalid" : ""}`}
                                    placeholder="Saisir le nom"
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("NOM_CLASSE") ? getError("NOM_CLASSE") : ""}
                                </div>
                            </div>

                            {/* Classe pour */}
                            <div className="col-md-2">
                                <label htmlFor="CLASSE_POUR" className="label mb-1">Classe pour</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    id="CLASSE_POUR"
                                    name="CLASSE_POUR"
                                    value={data.CLASSE_POUR}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("CLASSE_POUR") ? "p-invalid" : ""}`}
                                    placeholder="Saisir le type (ex : Entreprise)"
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("CLASSE_POUR") ? getError("CLASSE_POUR") : ""}
                                </div>
                            </div>
                        </div>

                        {/* Ligne 2 : Description */}
                        <div className="row mb-3">
                            <div className="col-md-2">
                                <label htmlFor="DESCRIPTION" className="label mb-1">Description</label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    id="DESCRIPTION"
                                    name="DESCRIPTION"
                                    value={data.DESCRIPTION}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("DESCRIPTION") ? "p-invalid" : ""}`}
                                    placeholder="Saisir la description"
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                    {hasError("DESCRIPTION") ? getError("DESCRIPTION") : ""}
                                </div>
                            </div>
                        </div>

                    </div>



                    <div className="d-flex justify-content-end mt-5">
                        <Button
                            label="Annuler"
                            type="reset"
                            outlined
                            className="mt-3"
                            size="small"
                            onClick={(e) => {
                                navigate("/classecomptable");
                            }}
                        />
                        <Button
                            label="Modifier"
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
