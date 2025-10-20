import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import fetchApi from "../../helpers/fetchApi";
import { InputText } from "primereact/inputtext";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import { userSelector } from "../../store/selectors/userSelector";
import wait from "../../helpers/wait";
import removeUserDataAndCaches from "../../utils/removeUserDataAndCaches";
import { setUserAction } from "../../store/actions/userActions";
import { ConfirmDialog } from "primereact/confirmdialog";
/**
 * fonction  pour le changement d'un mot de passe
 * @author leohab <leohab@inoviatech.com>
 * @date 16/03/2024
 */
const initialForm = {
    oldPwd: "",
    newPwd: "",
    confirmPwd: "",
};

export default function ChangePwd() {
    const dispacth = useDispatch();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useSelector(userSelector);
    const navigate = useNavigate();
    const query = useQuery();
    const { hasError, getError, getErrors, setErrors, checkFieldData, isValidate, setError,
    } = useFormErrorsHandle(
        data,
        {
            oldPwd: {
                required: true,
                length: [8, 16],
            },
            newPwd: {
                required: true,
                length: [8, 16],
            },
            confirmPwd: {
                required: true,
                length: [8, 16],
            },
        },
        {
            oldPwd: {
                required: "Ce champ est obligatoire",
                length: "L'ancien mot de passe ne doit pas deppasser 16 chiffrees ou caracteres",
            },
            newPwd: {
                required: "Ce champ est obligatoire",
                length: "Le nouveau mot de passe ne doit pas deppasser 16 chiffres ou caracteres",
            },
            confirmPwd: {
                required: "Ce champ est obligatoire",
                length: "Le mot de passe de confirmation ne doit pas deppasser 16 chiffrees ou caracteres",
            },
        }
    );



    const handlePaste = (event) => {
        event.preventDefault();
    }
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (isValidate()) {
                setIsSubmitting(true);
                const form = new FormData();
                form.append("oldPwd", data.oldPwd);
                form.append("newPwd", data.newPwd);
                form.append("confirmPwd", data.confirmPwd);
                const res = await fetchApi(`/administration/utilisateurs/changePWD`, {
                    method: "PUT",
                    body: form,
                });
                dispacth(
                    setToastAction({
                        severity: "success",
                        summary: "Réinitialisation de votre mot de passe a été effectuée avec succès. Connectez-vous en utilisant votre nouveau mot de passe.",
                        life: 3000,
                    })
                );
                // removeUserDataAndCaches(user.ID_UTILISATEUR, user.REFRESH_TOKEN)
                // dispacth(setUserAction(null))
                // localStorage.setItem('user', null)
                // navigate('/login')
                navigate('/')
            } else {
                setErrors(getErrors());
                dispacth(
                    setToastAction({
                        severity: "error",
                        summary: "Problème de validation des données",
                        detail: "Veuillez corriger les erreurs mentionnées pour continuer",
                        life: 3000,
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
            }
        } catch (error) {
            console.log(error);
            if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
                setErrors(error.result);
                dispacth(
                    setToastAction({
                        severity: "error",
                        summary: "Problème de validation des données",
                        detail: "Veuillez corriger les erreurs mentionnées pour continuer",
                        life: 3000,
                    })
                );
                await wait(500);
                const header = document.querySelector("form");
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
            } else if (error.httpStatus == "NOT_FOUND") {
                dispacth(setToastAction({
                    severity: 'error',
                    summary: "Mot de passe incorrect",
                    detail: "Mot de passe incorrect",
                    life: 3000
                }));
            } else if (error.httpStatus == "BAD_REQUEST") {
                dispacth(setToastAction({
                    severity: 'error',
                    summary: "Probleme de validation",
                    detail: "Les mots de passe ne correspondent pas",
                    life: 3000
                }));
            } else {
                dispacth(
                    setToastAction({
                        severity: "error",
                        summary: "Erreur du système",
                        detail: "Problème inconnu, réessayez plus tard",
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
            setBreadCrumbItemsAction([{
                path: "changepwd",
                name: "Changer le mot de passe",
            }
            ])
        );
        document.title = `Twizere-${user?.NOM} ${user?.PRENOM}`
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    useEffect(() => {
        if (data.image) {
            checkFieldData({ target: { name: "image" } });
        }
    }, [data.image]);
    const [visiblePassowrdold, setVisiblePasswordold] = useState(false);
    const [visiblePassowrdnew, setVisiblePasswordnew] = useState(false);
    const [visiblePassowrdcfrm, setVisiblePasswordcfrm] = useState(false);
    return (
        <>
            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {isSubmitting ? <Loading /> : null}
            <div className="px-4 py-3 main_content bg-white has_footer">
                <div className="">
                    <h1 className="mb-3">{user?.NOM} {user?.PRENOM}</h1>
                    <hr className="w-100" />
                </div>
                <form className="form w-75 mt-5">
                    <div className="form-group col-sm">
                        <InputText
                            type="hidden"
                            id="password"
                            name="password"
                            value={user?.USERS_ID}
                            onChange={handleChange}
                        />
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="nom" className="label mb-1">
                                    Ancien mot de passe
                                </label>
                            </div>


                            <div className="col-sm">
                                <span className="p-input-icon-right w-100">
                                    <InputText
                                        type={visiblePassowrdold ? "text" : "password"}
                                        placeholder="Saisir l'ancien mot de passe"
                                        id="oldPwd"
                                        name="oldPwd"
                                        value={data.oldPwd}
                                        onChange={handleChange}
                                        onBlur={checkFieldData}
                                        className={`w-100 is-invalid ${hasError("oldPwd") ? "p-invalid" : ""
                                            }`}
                                    />
                                    {!visiblePassowrdold ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-eye cursor-pointer"
                                            viewBox="0 0 16 16"
                                            onClick={() => setVisiblePasswordold((b) => !b)}
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
                                            onClick={() => setVisiblePasswordold((b) => !b)}
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
                                    {hasError("oldPwd") ? getError("oldPwd") : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-sm mt-5">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="prenom" className="label mb-1">
                                    Nouveau mot de passe
                                </label>
                            </div>
                            <div className="col-sm">
                                <span className="p-input-icon-right w-100">
                                    <InputText
                                        type={visiblePassowrdnew ? "text" : "password"}
                                        placeholder="Saisir  nouveau mot de passe"
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
                    </div>
                    <div className="form-group col-sm mt-5">
                        <div className="row">
                            <div className="col-md-4">
                                <label htmlFor="email" className="label mb-1" style={{}}>
                                    Confirmer mot de passe
                                </label>
                            </div>
                            <div className="col-sm">
                                <span className="p-input-icon-right w-100">
                                    <InputText
                                        type={visiblePassowrdcfrm ? "text" : "password"}
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
                    </div>

                    <div
                        style={{ position: "absolute", bottom: 0, right: 0 }}
                        className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white"
                    >
                        <Button
                            label="Réinitialiser"
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
                            onClick={(e) => {
                                handleSubmit(e);
                            }}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}