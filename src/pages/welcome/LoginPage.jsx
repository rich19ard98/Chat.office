import BANGUKA from '/images/Banguka.jpg'
import Sofini from '/images/sofini.png'
import inovia from '/images/inovia.png'
import "../../styles/app/welcome/login.css"
import { InputText } from 'primereact/inputtext';
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { Button } from "primereact/button";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Createaccount from "../../pages/utilisateurs/Createaccount"; // chemin vers ton composant
import { Dialog } from "primereact/dialog";

import { userSelector } from "../../store/selectors/userSelector";
import Loading from "../../components/app/Loading";
import fetchApi from "../../helpers/fetchApi";
import { setUserAction } from "../../store/actions/userActions";
import { useNavigate } from "react-router";
import getDeviceInfo from "../../utils/getDeviceInfo";
import { Link } from "react-router-dom";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
export default function LoginPage() {
    const user = useSelector(userSelector);
    const ismembre = user?.ID_PROFIL
    const [otpRequired, setOtpRequired] = useState(false);
    const [userData, setUserData] = useState(null);;
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isOffline = !window.navigator.onLine;
    const [step, setStep] = useState("login") // étape actuelle
    const [otpCode, setOtpCode] = useState("") // OTP entré par l’utilisateur
    const [data, handleChange] = useForm({
        EMAIL: '',
        PASSWORD: ''
    })
    const [counter, setCounter] = useState(60); // 30 secondes
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // 1️⃣ Déclare l'état au début de ton composant
    const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false);

    // 2️⃣ Bouton pour ouvrir le dialog


    const { hasError, getError, setErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
        EMAIL: {
            required: true,
            email: true
        },
        PASSWORD: {
            required: true
        },
    }, {
        EMAIL: {
            required: "Ce champ est obligatoire",
            email: "Email invalide"
        },
        PASSWORD: {
            required: "Ce champ est obligatoire"
        },
    })
    document.title = "Banguka"

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidate()) return;

        setLoading(true);
        try {
            const form = new FormData();
            form.append("EMAIL", data.EMAIL);
            form.append("PASSWORD", data.PASSWORD);
            const res = await fetchApi("/administration/auth/login", {
                method: 'POST',
                body: form
            });
            // Si on est en local ET hors ligne, ignorer OTP
            if (isLocal && isOffline) {
                alert("En local sans connexion : OTP ignoré pour les tests");
                dispatch(setUserAction(userData));
                navigate("/"); // ou la route que tu veux
                return;
            }
            //const { user, token, REFRESH_TOKEN, otpRequired } = res.result;
            const { otpRequired: otpFlag, token, REFRESH_TOKEN, otpRequired, ...user } = res.result;
            setUserData(user);
            setOtpRequired(otpFlag);
            if (otpRequired) {
                // OTP nécessaire → ne pas stocker encore user dans localStorage
                setUserData({ ...user, token, REFRESH_TOKEN });
                setOtpRequired(true);
                setStep("otp");
            } else {
                // pas d'OTP → login direct
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", REFRESH_TOKEN);
                dispatch(setUserAction(user));
                navigate("/");
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };



    // Vérification OTP
    // const handleVerifyOtp = async (e) => {
    //     e.preventDefault()
    //     setLoading(true)

    //     try {
    //         const res = await fetchApi("/administration/auth/verify-otp", {
    //             method: "POST",
    //             body: JSON.stringify({ email: userEmail, otpCode }),
    //             headers: { "Content-Type": "application/json" }
    //         })

    //         if (res?.token) {
    //             // ✅ OTP valide → connexion
    //             localStorage.setItem("token", res.token)
    //             dispatch(setUserAction(res.user))
    //             navigate("/dashboard")
    //         } else {
    //             dispatch(setToastAction({ severity: 'error', summary: "OTP invalide", detail: res.message, life: 3000 }))
    //         }
    //     } catch (error) {
    //         console.error(error)
    //         dispatch(setToastAction({ severity: 'error', summary: "Erreur", detail: "Vérification OTP échouée", life: 3000 }))
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetchApi("/administration/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email: userData.EMAIL, otpCode }),
                headers: { "Content-Type": "application/json" }
            });

            if (res?.token) {
                // OTP valide → on stocke définitivement le user et le token
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("token", res.token);
                dispatch(setUserAction(userData));
                navigate("/");
            } else {
                dispatch(setToastAction({ severity: 'error', summary: "OTP invalide", detail: res.message, life: 3000 }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (counter === 0) {
            // Quand le temps est fini → retour login
            navigate("/login");
        }

        // Décrément chaque seconde
        const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);

        return () => clearInterval(timer);
    }, [counter, navigate]);



    const [visiblePassowrd, setVisiblePassword] = useState(false)
    const styles = `
    body {
              overflow-y: scroll !important
    }
    `

    return (
        <>
            <style>{styles}</style>
            {loading && <Loading />}

            <div className="" style={{ backgroundColor: '#eff3f8red' }}>
                <div className="container">
                    <div className="d-flex justify-content-center">
                        <div className="w-50 d-flex justify-content-center bg-white flex-column relative py-6 form_left rounded">
                            <div className="align-self-center w-75 d-flex align-items-center flex-column form_left_container">
                                <div className="cedina-logo d-flex align-items-center">
                                    <div className="logo_container" style={{ height: '80px', width: '150px' }}>
                                        <img src={BANGUKA} alt="BANGUKA"
                                        // className="w-100 h-100 object-fit-cover d-block m-auto"
                                        />
                                    </div>
                                    <div className="block ml-2">
                                        <h5 className="mb-1">BANGUKA</h5>
                                        {/* <div className="text-muted text-sm" style={{ fontSize: 12 }}> Centre de sante</div> */}
                                    </div>
                                </div>
                                {/* === FORM LOGIN === */}
                                {/* {step === "login" && ( */}

                                <form action="" method="POST" className="form w-100" onSubmit={handleSubmit}>

                                    <div className="form-group w-100">
                                        <label htmlFor="EMAIL" className="label mb-1">Email</label>
                                        <div className="col-sm">
                                            <InputText type="text" placeholder="Ecrire votre email" id="EMAIL" name="EMAIL" value={data.EMAIL} onChange={handleChange} onBlur={checkFieldData} className={`w-100 is-invalid ${hasError('EMAIL') ? 'p-invalid' : ''}`} />
                                            <div className="invalid-feedback" style={{ minHeight: 0, display: 'block' }}>
                                                {hasError('EMAIL') ? getError('EMAIL') : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group w-100 mt-3">
                                        <label htmlFor="PASSWORD" className="label mb-1">Mot de passe </label>
                                        <div className="col-sm">
                                            <span className="p-input-icon-right w-100">
                                                <InputText type={visiblePassowrd ? "text" : "PASSWORD"} placeholder="Ecrire le mot de passe" id="PASSWORD" name="PASSWORD" value={data.PASSWORD} onChange={handleChange} onBlur={checkFieldData} className={`w-100 is-invalid ${hasError('PASSWORD') ? 'p-invalid' : ''}`} />
                                                {!visiblePassowrd ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye cursor-pointer" viewBox="0 0 16 16" onClick={() => setVisiblePassword(b => !b)}>
                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                </svg> :
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash cursor-pointer" viewBox="0 0 16 16" onClick={() => setVisiblePassword(b => !b)}>
                                                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                                                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                                                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                                                    </svg>}
                                            </span>
                                            <div className="invalid-feedback" style={{ minHeight: 0, display: 'block' }}>
                                                {hasError('PASSWORD') ? getError('PASSWORD') : ""}
                                            </div>
                                        </div>
                                    </div>
                                    {/* <a href="/forgetpwd" ></a>
                                    <Link to={"/reset_password"} className="d-block text-decoration-none my-3 text-right">

                                        Mot de passe oublié
                                    </Link> */}
                                    <Button label='Se connecter' className="w-100 mt-5" disabled={!isValidate()} loading={loading} />
                                </form>
                                <Button
                                    className="w-75 mt-5"
                                    label="Créer compte"
                                    onClick={() => setShowCreateAccountDialog(true)} // 🔹 Ouvre le dialog
                                />
                                <Dialog
                                    header="Créer un nouveau compte"
                                    visible={showCreateAccountDialog}   // 🔹 Affiche ou cache le dialog selon l'état
                                    modal
                                    style={{ width: "80%" }}
                                    onHide={() => setShowCreateAccountDialog(false)} // 🔹 Ferme le dialog
                                >
                                    <Createaccount onClose={() => setShowCreateAccountDialog(false)} />
                                </Dialog>                                {/* )} */}


                                {/* === FORM OTP === */}
                                {/* {step === "otp" && (
                                    counter > 0 ? (
                                        <form onSubmit={handleVerifyOtp} className="w-100 mt-4">
                                            <h3>Vérification OTP</h3>
                                            <p>Votre code expirera dans <b>{counter} s</b></p>
                                            <InputText
                                                placeholder="Entrez le code OTP"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                className="w-100 mb-3"
                                            />
                                            <Button label="Vérifier OTP" className="w-100" loading={loading} />
                                        </form>
                                    ) : <div className="quick-links mt-2">
                                        <p>Votre code déjà expiré ...</p>
                                        <Link to={"/login"} className="p-button p-component mr-2 p-button-sm p-button-info text-decoration-none">
                                            <span className="p-button-label p-c">Se connecter</span>
                                        </Link>
                                      
                                    </div>
                                )} */}

                                <span className="cedina-logo d-flex align-items-center" style={{ fontSize: '12px', marginTop: '15%' }}>
                                    <div className="logo_container" style={{ height: '80px', width: '100px' }}>
                                        <img src={inovia} alt="INOVIA TECHNOLOGY" />
                                    </div>
                                    <div className="block ">
                                        <h5 className="mb-1" style={{ fontSize: 12 }}>Developed by</h5>
                                        <div className="text-muted1 text-sm1" style={{ fontSize: '8px' }}>
                                            <Link to={"https://inoviatech.com"} className="text-decoration-none" style={{ color: 'chocolate' }}>
                                                Inovia technology
                                            </Link>
                                        </div>
                                    </div>
                                </span>
                            </div>
                        </div>
                        {/* <div className="cedina-collage w-50 d-flex align-items-center justify-content-center" style={{ borderLeftWidth: 0.5, borderLeftColor: '#c4c4c4' }}>
                            <img src={cedina} alt="cedina collage" 
                            className="w-100 h-100 " 
                            />
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    )













}