// import "../../styles/welcome/login.css"
import "../../styles/app/welcome/login.css"
import cedina from '/images/inovia.png'
import { InputText } from 'primereact/inputtext';
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { Button } from "primereact/button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setToastAction } from "../../store/actions/appActions";
import Loading from "../../components/app/Loading";
import fetchApi from "../../helpers/fetchApi";
import { setUserAction } from "../../store/actions/userActions";
import { useNavigate } from "react-router";
import getDeviceInfo from "../../utils/getDeviceInfo";
// import { useIntl } from "react-intl";
// import PROFILS from "../../constants/PROFILS";
// import { encodeId } from "../../utils/IdEncryption";

export default function ForgetPasswordPage() {
    const [data, handleChange] = useForm({
        email: '',
        OTP: '',
        newPwd: '',
        confirmPwd: ''
    })
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [confirm_email, setConfirm_email] = useState(false)
    const [user_data, setUser_data] = useState(null)
    const [check_OTP, setCheck_OTP] = useState(null)
    const [visiblePassowrdnew, setVisiblePasswordnew] = useState(false);
    const [visiblePassowrdcfrm, setVisiblePasswordcfrm] = useState(false);
    // const intl = useIntl()
    const { hasError, getError, setErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
        email: {
            required: !confirm_email ? true : null,
            email: true
        },
        OTP: {
            required: confirm_email ? true : null,
            // number:true
        },
        newPwd: {
            required: check_OTP ? true : null,
            length: [8, 16],
        },
        confirmPwd: {
            required: check_OTP ? true : null,
            length: [8, 16],
        },
    }, {
        email: {
            required: "Ce champ est obligatoire",
            email: "Email invalide"
        },
        OTP: {
            required: "Ce champ est obligatoire",
        },
        newPwd: {
            required:"Ce champ est obligatoire",
            length: "Le mot de passe doit contenir 8 caractères ou plus",
        },
        confirmPwd: {
            required:"Ce champ est obligatoire",
            length: "Le mot de passe doit contenir 8 caractères ou plus",
        },
    })
    document.title = "AFPM burundi"
    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            if (!isValidate()) return false
            setLoading(true)
            setErrors({})
            const form = new FormData()
            //quand on a pas encore valider l email
            if (!confirm_email) {
                form.append("email", data.email)
                const res = await fetchApi("/administration/auth/checkemail", {
                    method: 'POST',
                    body: form
                })
                const user = res.result
                setConfirm_email(true)
                setUser_data(user)
            }
            if (confirm_email && !check_OTP) {
                form.append("OTP", data.OTP)
                form.append("ID_UTILISATEUR", user_data?.ID_UTILISATEUR)
                const res = await fetchApi("/administration/auth/checkOTP", {
                    method: 'POST',
                    body: form
                })
                const user = res.result
                setCheck_OTP(user)
                // navigate(`/ChangePwd?id=${encodeId(user.ID_UTILISATEUR)}`)
                dispatch(setToastAction({
                    severity: 'success',
                    summary: 'Vérification du code de confirmation',
                    detail: 'La vérification du code de confirmation a été effectuée avec succès.', life: 3000, position: 'top-left'
                }))
            }

            if (check_OTP) {
                form.append("newPwd", data.newPwd);
                form.append("confirmPwd", data.confirmPwd);
                form.append("id", user_data?.ID_UTILISATEUR)
                const res = await fetchApi("/administration/auth/changePwd", {
                    method: 'PUT',
                    body: form
                })
                const user = res.result
                navigate("/login")
                dispatch(setToastAction({
                    severity: 'success',
                    summary: 'Mot de passe modifie',
                    detail: 'Votre mot de passe a été modifié avec succès.', 
                    life: 3000, position: 'top-left'
                }))
            }
            // navigate(`/confirmOTP?user=${encodeId(user.ID_UTILISATEUR)}&email=${encodeId(user.EMAIL)}&phone=${encodeId(user.TELEPHONE)}`)
            // dispatch(setToastAction({ severity: 'success', summary: intl.formatMessage({ id: "LoginPage.Vous_êtes_connecté" }), detail: intl.formatMessage({ id: "LoginPage.Vos_identifiants_sont_corrects" }), life: 3000, position: 'top-left' }))
        } catch (error) {
            console.log(error)
            if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                setErrors(error.result)
            } else if (error.httpStatus == "NOT_FOUND") {
                // confirm_email && !check_OTP ?
                !confirm_email ?
                    dispatch(setToastAction({
                        severity: 'error', summary: 'Email incorect',
                        detail: 'Veuillez vérifier votre adresse e-mail, car elle ne correspond à aucun compte enregistré.',
                        life: 3000
                    }))
                    : null
                confirm_email && !check_OTP ?
                    dispatch(setToastAction({
                        severity: 'error', summary: 'Code de confirmation incorrect',
                        detail: 'Votre code de confirmation  est invalide', life: 3000
                    }))
                    : null

            } else if (error.httpStatus == "BADREQUEST") {
                dispatch(setToastAction({
                    severity: 'error',
                    summary: 'Les mots de passe ne correspondent pas',
                    detail: 'Les mots de passe ne correspondent pas',
                    life: 3000
                }));
            } else {
                dispatch(setToastAction({ severity: 'error', 
                summary: 'Erreur du système', 
                detail: 'Problème inconnu, réessayez plus tard', life: 3000 }));
            }
        } finally {
            setLoading(false)
        }
    }
    const handlePaste = (event) => {
        event.preventDefault();
        // Ne rien faire lors de la tentative de collage
    }
    const styles = `
          body {
                    overflow-y: scroll !important
          }
          `
    return (
        <>
            <style>{styles}</style>
            {loading && <Loading />}
            <div className="" style={{ backgroundColor: '#eff3f8' }}>
                <div className="container">
                    <div className="d-flex justify-content-center">
                        <div className="w-50 d-flex justify-content-center bg-white flex-column relative py-6 form_left rounded">
                            <div className="align-self-center w-75 d-flex align-items-center flex-column form_left_container">
                                <div className="cedina-logo d-flex align-items-center">
                                    {
                                        !confirm_email ?
                                            <div className="block ml-2">
                                                <h5 className="mb-1">Réinitialiser votre mot de passe</h5>
                                                <div className="text-muted text-sm" style={{ fontSize: 12 }}>
                                                    Veuillez saisir l'email associé à votre compte pour obtenir le code de vérification
                                                </div>
                                            </div> : null}
                                    {
                                        confirm_email && !check_OTP ?
                                            <div className="block ml-2">
                                                <h5 className="mb-1">Confirmation</h5>
                                                <div className="text-muted text-sm" style={{ fontSize: 12 }}>
                                                    Entrer le code de confirmation envoyé au <b>{user_data.TELEPHONE}</b>&nbsp;
                                                    ou à <b>{user_data.EMAIL}</b>&nbsp;
                                                    pour confirmer l'authenticité de votre compte.
                                                </div>
                                            </div>
                                            : null
                                    }
                                    {check_OTP ?
                                        <div className="block ml-2">
                                            <h5 className="mb-1">Créer un nouveau mot de passe</h5>
                                        </div>
                                        : null
                                    }
                                </div>
                                <form action="" method="POST" className="form w-100" onSubmit={handleSubmit}>
                                    {/* <h1 className="m
                                    b-0">{intl.formatMessage({ id: "LoginPage.Se_connecter" })}</h1> */}
                                    {/* INPUT EMAIL */}
                                    {
                                        !confirm_email ?
                                            <div className="form-group w-100 mb-3">
                                                <label htmlFor="email" className="label mb-1">Email</label>
                                                <div className="col-sm">
                                                    <InputText type="text" placeholder="Ecrire votre email" id="email" name="email" value={data.email} onChange={handleChange} onBlur={checkFieldData} className={`w-100 is-invalid ${hasError('email') ? 'p-invalid' : ''}`} />
                                                    <div className="invalid-feedback" style={{ minHeight: 0, display: 'block' }}>
                                                        {hasError('email') ? getError('email') : ""}
                                                    </div>
                                                </div>
                                            </div> : null
                                    }
                                    {/* INPUT OTP */}
                                    {confirm_email && !check_OTP ?
                                        <div className="form-group w-100 mb-3">
                                            <div className="col-sm">
                                                <InputText type="text" placeholder="Ecrire votre code de confirmation" id="OTP" name="OTP" value={data.OTP} onChange={handleChange} onBlur={checkFieldData} className={`w-100 is-invalid ${hasError('OTP') ? 'p-invalid' : ''}`} />
                                                <div className="invalid-feedback" style={{ minHeight: 0, display: 'block' }}>
                                                    {hasError('OTP') ? getError('OTP') : ""}
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }
                                    {
                                        check_OTP ?
                                            <>
                                                <div className="form-group col-sm">
                                                    <label htmlFor="prenom" className="label mb-1">
                                                        Nouveau mot de passe
                                                    </label>
                                                    <div className="col-sm">
                                                        <span className="p-input-icon-right w-100">
                                                            <InputText
                                                                type={visiblePassowrdnew ? "text" : "PASSWORD"}
                                                                placeholder="Saisir nouveau mot de passe"
                                                                id="newPwd"
                                                                name="newPwd"
                                                                value={data.newPwd}
                                                                onChange={handleChange}
                                                                onBlur={checkFieldData}
                                                                className={`w-100 is-invalid ${hasError("newPwd") ? "p-invalid" : ""
                                                                    }`}
                                                            />
                                                            {!visiblePassowrdnew ? (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-eye cursor-pointer"
                                                                    viewBox="0 0 16 16"
                                                                    onClick={() => setVisiblePasswordnew((b) => !b)}
                                                                >
                                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-eye-slash cursor-pointer"
                                                                    viewBox="0 0 16 16"
                                                                    onClick={() => setVisiblePasswordnew((b) => !b)}
                                                                >
                                                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                                                                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                                                                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                        <div
                                                            className="invalid-feedback"
                                                            style={{ minHeight: 0, display: "block" }}
                                                        >
                                                            {hasError("newPwd") ? getError("newPwd") : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group col-sm mt-5">
                                                    <label htmlFor="email" className="label mb-1" style={{}}>
                                                        Confirmer mot de passe
                                                    </label>
                                                    <div className="col-sm">
                                                        <span className="p-input-icon-right w-100">
                                                            <InputText
                                                                type={visiblePassowrdcfrm ? "text" : "PASSWORD"}
                                                                placeholder="Confirmez votre mot de passe"
                                                                onPaste={handlePaste}
                                                                onCopy={handlePaste}
                                                                id="confirmPwd"
                                                                name="confirmPwd"
                                                                value={data.confirmPwd}
                                                                onChange={handleChange}
                                                                onBlur={checkFieldData}
                                                                className={`w-100 is-invalid ${hasError("confirmPwd") ? "p-invalid" : ""
                                                                    }`}
                                                            />
                                                            {!visiblePassowrdcfrm ? (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-eye cursor-pointer"
                                                                    viewBox="0 0 16 16"
                                                                    onClick={() => setVisiblePasswordcfrm((b) => !b)}
                                                                >
                                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-eye-slash cursor-pointer"
                                                                    viewBox="0 0 16 16"
                                                                    onClick={() => setVisiblePasswordcfrm((b) => !b)}
                                                                >
                                                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                                                                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                                                                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                        <div
                                                            className="invalid-feedback"
                                                            style={{ minHeight: 0, display: "block" }}
                                                        >
                                                            {hasError("confirmPwd") ? getError("confirmPwd") : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                            : null
                                    }
                                    <Button label="Confirmer" className="w-100 mt-3" disabled={!isValidate()} loading={loading} />
                                </form>
                            </div>
                        </div>
                        <div className="cedina-collage  w-50 d-flex align-items-center justify-content-center" style={{ borderLeftWidth: 0.5, borderLeftColor: '#c4c4c4' }}>
                            <img src={cedina} alt="cedina collage" className="w-100 h-100 object-fit-cover d-block m-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}