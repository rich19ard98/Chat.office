import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions"
import { administration_routes_items } from "../../routes/admin/administration_routes"
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { decodeId } from "../../utils/IdEncryption";
//import { Image } from 'primereact/image';

const initialForm = {
    NOM: "",
    PRENOM: "",
    ID_TYPE_FONCTIONS: null,
    EMAIL: "",
    TELEPHONE: null,
    ADRESSE: ""
}

export default function Employe_edit_page() {
    const dispacth = useDispatch()
    const [data, handleChange, setData, setValue] = useForm(initialForm)
    const [showCalendar, setShowCalendar] = useState(false);
    const [types_de_fonction, settypes_de_fonction] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { ID_EMPLOYE: encodedStr } = useParams()
    
    const ID_EMPLOYE = decodeId(encodedStr)


    const [employe, setEmploye] = useState(null);
    const [loadingEmploye, setLoadingEmploye] = useState(true);
    // const [loadingFournisseur, setLoadingFournisseur] = useState(true)

    const { hasError, getError, setErrors, checkFieldData, run, isValidate, setError } = useFormErrorsHandle(data, {
        NOM: {
            required: true,
            length: [1, 255],
            alpha: true
        },
        PRENOM: {
            required: true,
            length: [1, 255],
            alpha: true
        },
        ID_TYPE_FONCTIONS: { required: true },
        EMAIL: {
            required: true,
            email: true
        },
        TELEPHONE: { required: true },
        ADRESSE: {
            required: true,
            length: [1, 255],
            alpha: true
        },

    },
    )
    const handleVisibility = (e) => {
        setShowCalendar(!showCalendar);
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (!isValidate()) return false
            setIsSubmitting(true)
            const form = new FormData()
            form.append("NOM", data.NOM);
            form.append("PRENOM", data.PRENOM);
            form.append("ID_TYPE_FONCTIONS", data.ID_TYPE_FONCTIONS?.code);
            form.append("EMAIL", data.EMAIL);
            form.append("TELEPHONE", data.TELEPHONE);
            form.append("ADRESSE", data.ADRESSE);
            //form.append("image", data.image)
            const res = await fetchApi(`/gerers/employe/update/${ID_EMPLOYE}`, {
                method: 'put',
                body: form
            })
            dispacth(setToastAction({
                severity: 'success',
                summary: 'Employé enregistré',
                detail: "L'employé a été modifié avec succès", life: 3000
            }))
            navigate('/employe')
        } catch (error) {
            console.log(error)
            if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                setErrors(error.result)
            } else {
                dispacth(setToastAction({
                    severity: 'error',
                    summary: 'Erreur du système',
                    detail: 'Erreur du système, réessayez plus tard', life: 3000
                }));
            }
        } finally {
            setIsSubmitting(false)
        }
    }


    const fetchtypes_de_fonction = useCallback(async () => {
        try {
            const res = await fetchApi("/gerers/types_de_fonction/fetch?rows=100000&")
            settypes_de_fonction(res.result.data.map(c => {
                return {
                    name: c.LIBELLE,
                    code: c.ID_TYPE_FONCTIONS
                }
            }))
        } catch (error) {
            console.log(error)
        }
    }, [])
    useEffect(() => {
        fetchtypes_de_fonction()
    }, [])



    useEffect(() => {
        (async () => {
            try {
                const res = await fetchApi(`/gerers/employe/find/${ID_EMPLOYE}`)
                const uti = res.result
                setEmploye(uti)

                setData({
                    NOM: uti?.NOM,
                    PRENOM: uti?.PRENOM,
                    TELEPHONE: uti?.TELEPHONE,
                    EMAIL: uti?.EMAIL,
                    ID_TYPE_FONCTIONS: {
                        code: uti?.types_de_fonction?.ID_TYPE_FONCTIONS,
                        name: uti?.types_de_fonction?.LIBELLE,
                    },
                    ADRESSE: uti?.ADRESSE
                })

            } catch (error) {
                console.log(error)
            } finally {
                setLoadingEmploye(false)
            }
        })()
    }, [])




    useEffect(() => {
        document.title = "Editer l'employé"
        dispacth(setBreadCrumbItemsAction([
            administration_routes_items.employe,
            administration_routes_items.edit_employe
        ]))
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);


    const invalidClass = name => hasError(name) ? 'is-invalid' : ''
    if (loadingEmploye) {
        return <div className="d-flex justify-content-center align-items-center h-100 w-100">
            <div className="spinner-border" role="status" />
        </div>
    }
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">{employe?.NOM} {employe?.PRENOM}</h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="NOM" className="label mb-1">
                                    Nom
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le  nom"
                                    id="NOM"
                                    name="NOM"
                                    value={data.NOM}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError(" NOM") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("NOM") ? getError("NOM") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="PRENOM" className="label mb-1">
                                    Prenom
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le  prenom"
                                    id="PRENOM"
                                    name="PRENOM"
                                    value={data.PRENOM}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError(" NOM") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("PRENOM") ? getError("PRENOM") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group  col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ID_TYPE_FONCTIONS" className="label mb-1">Fonction</label>
                            </div>
                            <div className="col-sm">
                                <Dropdown
                                    value={data.ID_TYPE_FONCTIONS}
                                    options={types_de_fonction}
                                    onChange={e => setValue("ID_TYPE_FONCTIONS", e.value)}
                                    optionLabel="name"
                                    id="ID_TYPE_FONCTIONS"
                                    filter
                                    filterBy="name"
                                    placeholder="Selectionner  la fonction"
                                    emptyFilterMessage="Aucun élément trouvé"
                                    emptyMessage="Aucun élément trouvé"
                                    name="ID_TYPE_FONCTIONS"
                                    onHide={() => {
                                        checkFieldData({ target: { name: "ID_TYPE_FONCTIONS" } })
                                    }}
                                    className={`w-100 ${hasError('ID_TYPE_FONCTIONS') ? 'p-invalid' : ''}`}
                                    showClear
                                //valueTemplate={this.selectedCountryTemplate}
                                //itemTemplate={this.countryOptionTemplate}
                                />
                                <div className="invalid-feedback" style={{ minHeight: 21, display: 'block' }}>
                                    {hasError('ID_TYPE_FONCTIONS') ? getError('ID_TYPE_FONCTIONS') : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="EMAIL" className="label mb-1">
                                    Email
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le  prenom"
                                    id="EMAIL"
                                    name="EMAIL"
                                    value={data.EMAIL}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError(" EMAIL") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("EMAIL") ? getError("EMAIL") : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="TELEPHONE" className="label mb-1">
                                    Téléphone
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le numero du telephone"
                                    id="TELEPHONE"
                                    name="TELEPHONE"
                                    value={data.TELEPHONE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError(" TELEPHONE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("TELEPHONE") ? getError("TELEPHONE") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="ADRESSE" className="label mb-1">
                                    Adresse
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire l' adresse"
                                    id="ADRESSE"
                                    name="ADRESSE"
                                    value={data.ADRESSE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError("ADRESSE") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("ADRESSE") ? getError("ADRESSE") : ""}
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
        </>
    )
}