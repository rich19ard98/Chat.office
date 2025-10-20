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

const initialForm = {
    LIBELLE: "",

}

export default function Types_de_fonction_edit_page() {
    const dispacth = useDispatch()
    const [data, handleChange, setData, setValue] = useForm(initialForm)
    const [showCalendar, setShowCalendar] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { ID_TYPE_FONCTIONS: encodedStr } = useParams()
    const ID_TYPE_FONCTIONS = decodeId(encodedStr)
    const [types_de_fonction, settypes_de_fonction] = useState([]);
    const [loadingntypes_de_fonction, setLoadingTypes_de_fonction] = useState(true);
    // const [loadingFournisseur, setLoadingFournisseur] = useState(true)

    const { hasError, getError, setErrors, checkFieldData, run, isValidate, setError } = useFormErrorsHandle(data, {
        LIBELLE: {
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
            form.append("LIBELLE", data.LIBELLE);

            const res = await fetchApi(`/gerers/types_de_fonction/update/${ID_TYPE_FONCTIONS}`, {
                method: 'put',
                body: form
            })
            dispacth(setToastAction({ severity: 'success', summary: '   Fonction  enregistré', detail: "La fonction a été modiffier avec succès", life: 3000 }))
            navigate('/types_de_fonction')
        } catch (error) {
            console.log(error)
            if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                setErrors(error.result)
            } else {
                dispacth(setToastAction({ severity: 'error', summary: 'Erreur du système', detail: 'Erreur du système, réessayez plus tard', life: 3000 }));
            }
        } finally {
            setIsSubmitting(false)
        }
    }




    useEffect(() => {
        (async () => {
            try {
                const res = await fetchApi(`/gerers/types_de_fonction/find/${ID_TYPE_FONCTIONS}`)
                const uti = res.result



                settypes_de_fonction(uti)

                setData({
                    LIBELLE: uti.LIBELLE,
                })
              

            } catch (error) {
                console.log(error)
            } finally {
                setLoadingTypes_de_fonction(false)
            }
        })()
    }, [])

    useEffect(() => {
        dispacth(setBreadCrumbItemsAction([
            administration_routes_items.types_de_fonction,
            administration_routes_items.edit_types_de_fonction
        ]))
        return () => {
            dispacth(setBreadCrumbItemsAction([]))
        }
    }, [])


    const invalidClass = name => hasError(name) ? 'is-invalid' : ''
    if (loadingntypes_de_fonction) {
        return <div className="d-flex justify-content-center align-items-center h-100 w-100">
            <div className="spinner-border" role="status" />
        </div>
    }
    return (
        <>
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">{types_de_fonction.LIBELLE} </h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5" onSubmit={handleSubmit}>
                    <div className="form-group col-sm">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="LIBELLE" className="label mb-1">
                                    Libelle
                                </label>
                            </div>
                            <div className="col-sm">
                                <InputText
                                    type="text"
                                    placeholder="Ecrire le libelle"
                                    id="LIBELLE"
                                    name="LIBELLE"
                                    value={data.LIBELLE}
                                    onChange={handleChange}
                                    onBlur={checkFieldData}
                                    className={`w-100 ${hasError(" NOM") ? "p-invalid" : ""}`}
                                />
                                <div
                                    className="invalid-feedback"
                                    style={{ minHeight: 21, display: "block" }}
                                >
                                    {hasError("LIBELLE") ? getError("LIBELLE") : ""}
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