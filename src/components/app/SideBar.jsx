import { useEffect, useRef, useState } from "react";
import Logo from "../../../public/images/Banguka.jpg";
// import Logo from "../../../public/images/inoviacare_.png";
import Sofini from '/images/sofini.png'

import "../../styles/app/sidebar.css";
import { Link, useFetcher, useLocation, useNavigate } from "react-router-dom";
import { confirmDialog } from "primereact/confirmdialog";
import removeUserDataAndCaches from "../../utils/removeUserDataAndCaches";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import { setUserAction } from "../../store/actions/userActions";
import { Button } from "primereact/button";
import AppDateTime from "./AppDateTime";
import { API_URL } from "../../helpers/fetchApi";
import { io } from "socket.io-client";


export default function SideBar({ isMobile, setAsideVisible }) {
    const navigate = useNavigate();
    const dispacth = useDispatch();
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const location = useLocation();
    const user = useSelector(userSelector);


    const socket = useRef(null);
    const Ismembre = user.ID_PROFIL

    useEffect(() => {
        // Connexion au serveur Socket.IO
        socket.current = io(API_URL);

        // Écoute de l'événement "connect" pour émettre un événement "join" une fois connecté
        socket.current.on("connect", () => {
            socket.current.emit("join", { userId: `u_${user.ID_UTILISATEUR}`, userType: `${user.PROFIL.DESCRIPTION}` });
        });

        // Gestion des erreurs
        socket.current.on('error', error => {
            console.log(error);
        });

        // Gestion de la déconnexion
        socket.current.on('disconnect', () => {
            // Actions à effectuer en cas de déconnexion
        });

        // Fonction de nettoyage pour se déconnecter du serveur lorsque le composant est démonté
        return () => {
            socket.current.disconnect();
        };
    }, [user, API_URL]); // Déclencher l'effet lorsque "user" ou "API_URL" change


    useEffect(() => {
        const main = document.querySelector(".main");
        if (isSidebarMinimized) {
            if (main) {
                main.classList.add("minimized");
            }
            const allShown = document.querySelectorAll(".collapse.show");
            if (allShown.length > 0) {
                allShown.forEach((element) => {
                    element.classList.remove("show");
                });
            }
            const allCollapsed = document.querySelectorAll(
                `.nav-item a[aria-expanded="true"]`
            );
            if (allCollapsed.length > 0) {
                allCollapsed.forEach((element) => {
                    element.classList.remove("collapsed");
                    element.setAttribute("aria-expanded", false);
                });
            }
        } else {
            if (main) {
                main.classList.remove("minimized");
            }
        }
    }, [isSidebarMinimized]);

    const toggleSubMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.classList.toggle("collapse-show");
        if (isSidebarMinimized) {
            setIsSidebarMinimized(false);
        }
    };

    useEffect(() => {
        const prevActive = document.querySelector("nav .nav-item.active");
        if (prevActive) {
            prevActive.classList.remove("active");
        }
        const url = location.pathname;
        const entrireUrl = location.pathname + location.search;
        const splits = url.split("/");
        var activeLink;
        const commonNavItem = document.querySelector(`nav a[href='/${splits[1]}']`);
        const exactNavitem = document.querySelector(`nav a[href='${entrireUrl}']`);
        if (exactNavitem) {
            activeLink = exactNavitem;
        } else {
            activeLink = commonNavItem;
        }

        if (activeLink) {
            const parent = activeLink.parentElement;
            parent.classList.add("active");
            const navLinkParent = parent.parentElement;
            if (navLinkParent.classList.contains("collapse")) {
                navLinkParent.classList.add("show");
                const navLinkParentId = navLinkParent.getAttribute("id");
                const toCollapsedElement = document.querySelector(
                    `[aria-controls='${navLinkParentId}']`
                );
                if (toCollapsedElement) {
                    toCollapsedElement.classList.add("collapsed");
                    toCollapsedElement.setAttribute("aria-expanded", true);
                }
            }
        }
    }, [location]);

    const handleAccept = async () => {
        removeUserDataAndCaches(user.ID_UTILISATEUR, user.REFRESH_TOKEN);
        dispacth(setUserAction(null));
        localStorage.setItem("user", null);
        navigate("/login");
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        confirmDialog({
            headerStyle: { backgroundColor: "#ecc5c5", backgroundSize: "cover" },
            headerClassName: "text-black",
            header: "Déconnexion",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <>
                        <div className="font-bold text-center my-2"></div>
                        <div className="text-center">
                            Voulez-vous vraiment se déconnecter?
                        </div>
                    </>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: handleAccept,
        });
    };

    const showSidebar = () => {
        const Dsidebar = document.querySelector(".d-sidebar");
        const sidebar = document.querySelector(".sidebar");
        sidebar.style.display = "block";
        sidebar.style.marginRight = '100%';
        Dsidebar.addEventListener('click', () => {
            console.log("show");
        });
    };

    const [nodes, setNodes] = useState([]);


    return (
        <>
            <aside
                className={`sidebar  flex-column justify-content-between shadow z-1 ${isSidebarMinimized ? "minimized" : ""}`} >



                <div className={`d-flex justify-content-between align-items-center`} style={{ backgroundColor: 'white' }}>
                    <Link className={`d-flex align-items-center px-3 py-2 text-decoration-none link-dark `}
                    >
                        {isMobile ? null : (
                            <button
                                size="small"
                                severity="secondary"
                                outlined
                                style={{
                                    color: "black",
                                    width: 40,
                                    height: 40,
                                    border: "none",
                                    borderRadius: '50px'
                                }}
                                rounded
                                className="p-2 mr-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSidebarMinimized((b) => !b);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    fill="black"
                                    className="bi bi-list"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                                    />
                                </svg>
                            </button>
                        )}


                        <div className={`logo-container `}
                            onClick={toggleSubMenu}
                        >
                            <img src={Logo} alt="" className={`logo`} />
                        </div>
                        <div className="ml-0 mt-1 ">
                            <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
                                {/* <h5 className="mb-0 app-brandName">Inovia</h5>
                <h6 className="mb-0 brandSubName ml-2" style={{ fontSize: '12px' }}>Care</h6> */}
                            </div>
                            {/* <AppDateTime /> */}
                        </div>

                        {/* <div className={`ml-0 mt-1`}>
                <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
                  <h5 className="mb-0 app-brandName">TWIZERE</h5>
                  <h6 className="mb-0 brandSubName ml-2" style={{ fontSize: '12px' }}>Centre de sante</h6>
                </div>
                // <AppDateTime />
              </div> */}

                    </Link>
                    {isMobile ? (
                        <Button
                            size="small"
                            severity="secondary"
                            outlined
                            style={{ color: "black", width: 40, height: 40, border: "none" }}
                            rounded
                            className="p-2 mr-2"
                            onClick={(e) => {
                                e.preventDefault();
                                setAsideVisible(false);
                            }}
                            icon="pi pi-times"
                        />
                    ) : null}
                </div>
                {/* <hr className="mx-3 my-2" style={{ borderTopColor: "black" }} /> */}

                <nav className={`px-2 flex-fill`}  >
                    {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#administration"
                                role="button"
                                aria-expanded="false"
                                aria-controls="administration"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ fontWeight: "bold" }}
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="bi bi-database"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313ZM13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A4.92 4.92 0 0 0 13 5.698ZM14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13V4Zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A4.92 4.92 0 0 0 13 8.698Zm0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525Z" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Administration
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}

                    {Ismembre === 2 ? null : (
                        <div className="sub-menus collapse" id="administration">
                            <div className="nav-item">
                                <Link
                                    to={"utilisateurs"}
                                    className="text-decoration-none rounded d-block"
                                    href="/utilisateurs"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Utilisateurs</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"profil"}
                                    className="text-decoration-none rounded d-block"
                                    href="/profil"
                                    role="button"
                                    aria-expanded="false"
                                    aria-controls="administration"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Profils</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"Sessionutilisateurs"}
                                    className="text-decoration-none rounded d-block"
                                    href="/Sessionutilisateurs"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">
                                                Sessions des utilisateurs
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            <div className="nav-item">
                                <Link
                                    to={"Sessionmembres"}
                                    className="text-decoration-none rounded d-block"
                                    href="/Sessionmembres"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Sessions des membres</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}

                    {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#parametre"
                                role="button"
                                aria-expanded="false"
                                aria-controls="parametre"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Parametres
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}



                    <div className="sub-menus collapse" id="parametre">
                        <div className="nav-item">
                            <Link
                                to={"retard"}
                                className="text-decoration-none rounded d-block"
                                href="/retard"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Retard cotisation</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"statutscredit"}
                                className="text-decoration-none rounded d-block"
                                href="/statutscredit"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Statut des Crédits</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"penalite"}
                                className="text-decoration-none rounded d-block"
                                href="/penalite"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Pénalité</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"FrequenceCredit"}
                                className="text-decoration-none rounded d-block"
                                href="/FrequenceCredit"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Fréquence Credits</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"parametres_financiers"}
                                className="text-decoration-none rounded d-block"
                                href="/parametres_financiers"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Paramètres financiers</span>
                                    </div>
                                </div>
                            </Link>
                        </div>


                        <div className="nav-item">
                            <Link
                                to={"comptecomptable"}
                                className="text-decoration-none rounded d-block"
                                href="/comptecomptable"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Comptes comptables</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"classecomptable"}
                                className="text-decoration-none rounded d-block"
                                href="/classecomptable"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Classe comptable</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"initialisation"}
                                className="text-decoration-none rounded d-block"
                                href="/initialisation"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Initialisation des comptes</span>
                                    </div>
                                </div>
                            </Link>
                        </div>




































                    </div>


                    {/* {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#Rapport"
                                role="button"
                                aria-expanded="false"
                                aria-controls="Rapport"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ fontWeight: "bold" }} width="20" height="20" fill="currentColor" class="bi bi-bar-chart" viewBox="0 0 16 16">
                                                <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Rapports
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )} */}

                    {/* {Ismembre === 2 ? null : (
                        <div className="sub-menus collapse" id="Rapport">
                            <div className="nav-item">
                                <Link
                                    to={"dashbord"}
                                    className="text-decoration-none rounded d-block"
                                    href="/dashbord"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Tableau de bord</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"livre_compte"}
                                    className="text-decoration-none rounded d-block"
                                    href="/livre_compte"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Grand livre des comptes</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"balance_compte"}
                                    className="text-decoration-none rounded d-block"
                                    href="/balance_compte"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Balance des comptes</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"journal"}
                                    className="text-decoration-none rounded d-block"
                                    href="/journal"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Journal Comptable</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link
                                    to={"compteResult"}
                                    className="text-decoration-none rounded d-block"
                                    href="/compteResult"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Compte resultant</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )} */}
                    {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#alimentation"
                                role="button"
                                aria-expanded="false"
                                aria-controls="alimentation"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ fontWeight: "bold" }} width="20" height="20" fill="currentColor" class="bi bi-bar-chart" viewBox="0 0 16 16">
                                                <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Alimentation caisse
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}
                    <div className="sub-menus collapse" id="alimentation">
                        <div className="nav-item">
                            <Link
                                to={"Alimentation"}
                                className="text-decoration-none rounded d-block"
                                href="/Alimentation"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Alimentation caisse</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Caisses"}
                                className="text-decoration-none rounded d-block"
                                href="/Caisses"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Caisses </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"groupements"}
                                className="text-decoration-none rounded d-block"
                                href="/groupements"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Groupements Financiere </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Caissier"}
                                className="text-decoration-none rounded d-block"
                                href="/Caissier"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Caissier </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Agences"}
                                className="text-decoration-none rounded d-block"
                                href="/Agences"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Agences</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Cheaf"}
                                className="text-decoration-none rounded d-block"
                                href="/Cheaf"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Chef Agence </span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                    </div>


                    {/* 
                    {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#frais_adhesion"
                                role="button"
                                aria-expanded="false"
                                aria-controls="frais_adhesion"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                                                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Frais d’adhésion
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )} */}




                    <div className="sub-menus collapse" id="frais_adhesion">
                        <div className="nav-item">
                            <Link
                                to={"frais_adh"}
                                className="text-decoration-none rounded d-block"
                                href="/frais_adh"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Frais d’adhésion </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>


                    <div className="nav-item">
                        <a
                            onClick={toggleSubMenu}
                            className="text-decoration-none rounded d-block"
                            data-bs-toggle="collapse"
                            href="#Cotisation"
                            role="button"
                            aria-expanded="false"
                            aria-controls="Cotisation"
                        >
                            <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="menu-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ fontWeight: "bold" }}
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            className="bi bi-wallet"  // Example contribution icon
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M6 2a1 1 0 0 0-1 1v1H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3V3a1 1 0 0 0-1-1H6zm0 1h4v2H6V3zm-4 2h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                                        </svg>
                                    </div>
                                    <span className="menu-title" style={{ fontWeight: "bold" }}>
                                        Cotisation
                                    </span>
                                </div>
                                <div className="down_caret">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="15"
                                        height="15"
                                        fill="currentColor"
                                        className="bi bi-chevron-right"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="sub-menus collapse" id="Cotisation">
                        <div className="nav-item">
                            <Link
                                to={"membre_microfinance"}
                                className="text-decoration-none rounded d-block"
                                href="/membre_microfinance"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Membre du microfinance</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        {Ismembre === 2 ? null : (
                            <>
                                <div className="nav-item">
                                    <Link
                                        to={"types_operations_comptables"}
                                        className="text-decoration-none rounded d-block"
                                        href="/types_operations_comptables"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Opérations</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link
                                        to={"dividende"}
                                        className="text-decoration-none rounded d-block"
                                        href="/dividende"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Dividende</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link
                                        to={"caisseSocialliste"}
                                        className="text-decoration-none rounded d-block"
                                        href="/caisseSocialliste"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Utilisation caisse social</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                          <div className="nav-item">
                                    <Link
                                        to={"Nantissements"}
                                        className="text-decoration-none rounded d-block"
                                        href="/Nantissements"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Nantissements</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link
                                        to={"cotisation"}
                                        className="text-decoration-none rounded d-block"
                                        href="/cotisation"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Cotisation</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link
                                        to={"achats_equipements"}
                                        className="text-decoration-none rounded d-block"
                                        href="/achats_equipements"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Achats equipements</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link
                                        to={"Comptesmembres"}
                                        className="text-decoration-none rounded d-block"
                                        href="/Comptesmembres"
                                    >
                                        <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="menu-icon"></div>
                                                <span className="menu-title">Comptes membres</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </>

                        )}



                    </div>
                    <div className="nav-item">
                        <a
                            onClick={toggleSubMenu}
                            className="text-decoration-none rounded d-block"
                            data-bs-toggle="collapse"
                            href="#credit"
                            role="button"
                            aria-expanded="false"
                            aria-controls="credit"
                        >
                            <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="menu-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-credit-card" viewBox="0 0 16 16">
                                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h12V4a1 1 0 0 0-1-1H2zm0 4v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7H2z" />
                                        </svg>
                                    </div>
                                    <span className="menu-title" style={{ fontWeight: "bold" }}>
                                        Crédits
                                    </span>
                                </div>
                                <div className="down_caret">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="15"
                                        height="15"
                                        fill="currentColor"
                                        className="bi bi-chevron-right"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="sub-menus collapse" id="credit">
                        <div className="nav-item">
                            <Link
                                to={"credits"}
                                className="text-decoration-none rounded d-block"
                                href="/credits"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Crédits</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"remboursement_credit"}
                                className="text-decoration-none rounded d-block"
                                href="/remboursement_credit"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Remboursement du Crédits</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"amortissements"}
                                className="text-decoration-none rounded d-block"
                                href="/amortissements"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Amortissements</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        {Ismembre === 2 ? null : (
                            <div className="nav-item">
                                <Link
                                    to={"typescredit"}
                                    className="text-decoration-none rounded d-block"
                                    href="/typescredit"
                                >
                                    <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="menu-icon"></div>
                                            <span className="menu-title">Types Crédits </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}


                        {/* <div className="nav-item">
                            <Link
                                to={"menu"}
                                className="text-decoration-none rounded d-block"
                                href="menu"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Menu</span>
                                    </div>
                                </div>
                            </Link>
                        </div> */}
                    </div>
                    {/* {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#Gerers"
                                role="button"
                                aria-expanded="false"
                                aria-controls="Gerers"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ fontWeight: "bold" }} width="20" height="20" fill="currentColor" className="bi bi-grid" viewBox="0 0 16 16">
                                                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Gérer
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )} */}
                    {Ismembre === 2 ? null : (<div className="sub-menus collapse" id="Gerers">
                        <div className="nav-item">
                            <Link
                                to={"employe"}
                                className="text-decoration-none rounded d-block"
                                href="/employe"
                            >


                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Employés</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"fournisseur"}
                                className="text-decoration-none rounded d-block"
                                href="/fournisseur"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Fournisseurs</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"types_de_fonction"}
                                className="text-decoration-none rounded d-block"
                                href="/types_de_fonction"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Fonction</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"equipements"}
                                className="text-decoration-none rounded d-block"
                                href="/equipements"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Equipements</span>
                                    </div>
                                </div>
                            </Link>
                        </div>


                    </div>)}


                    {Ismembre === 2 ? null : (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#comptabilite"
                                role="button"
                                aria-expanded="false"
                                aria-controls="comptabilite"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ fontWeight: "bold" }} width="20" height="20" fill="currentColor" className="bi bi-cash-coin" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0" />
                                                <path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z" />
                                                <path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z" />
                                                <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Comptabilité
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}


                    <div className="sub-menus collapse" id="comptabilite">
                        <div className="nav-item">
                            <Link
                                to={"ecriturescomptables"}
                                className="text-decoration-none rounded d-block"
                                href="/ecriturescomptables"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Ecritures comptables</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"categDep"}
                                className="text-decoration-none rounded d-block"
                                href="/categDep"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Catégories dépense</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"fiche_depenses"}
                                className="text-decoration-none rounded d-block"
                                href="/fiche_depenses"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Fiches depenses</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"detailDep"}
                                className="text-decoration-none rounded d-block"
                                href="/detailDep"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Detail depense</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="nav-item">
                            <Link
                                to={"Transferts"}
                                className="text-decoration-none rounded d-block"
                                href="/Transferts"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Transferts</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                    {/* *********************************Corriger ici en supprimant ce null****************************************************************** */}
                    {Ismembre === 2 ? null : (
                        // <div className="nav-item">
                        //     <a
                        //         onClick={toggleSubMenu}
                        //         className="text-decoration-none rounded d-block"
                        //         data-bs-toggle="collapse"
                        //         href="#bilan"
                        //         role="button"
                        //         aria-expanded="false"
                        //         aria-controls="bilan"
                        //     >
                        //         <div className="d-flex align-items-center justify-content-between py-2 px-3">
                        //             <div className="d-flex align-items-center justify-content-between">
                        //                 <div className="menu-icon">
                        //                     {/* <svg
                        //                     xmlns="http://www.w3.org/2000/svg"
                        //                     style={{ fontWeight: "bold" }}
                        //                     width="20"
                        //                     height="20"
                        //                     fill="currentColor"
                        //                     className="bi bi-file-earmark-text"  // Example accounting icon
                        //                     viewBox="0 0 16 16"
                        //                 >
                        //                     <path d="M3.5 0h9a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zm0 1v14h9V1h-9zM4 3h8v1H4V3zM4 5h8v1H4V5zM4 7h8v1H4V7zM4 9h8v1H4V9zM4 11h8v1H4v-1z" />
                        //                 </svg> */}
                        //                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2048 2048"><path fill="currentColor" d="m0 1898l384-384v534H0zm512-512l384-384v1046H512zm1280-490h128v1152h-384v-918zm-448 426l64-64v790h-384V1002zm704-1066v512h-128V475l-576 575l-384-384L0 1627v-182l960-959l384 384l485-486h-293V256z" /></svg>
                        //                 </div>
                        //                 <span className="menu-title" style={{ fontWeight: "bold" }}>
                        //                     Bilan
                        //                 </span>
                        //             </div>
                        //             <div className="down_caret">
                        //                 <svg
                        //                     xmlns="http://www.w3.org/2000/svg"
                        //                     width="15"
                        //                     height="15"
                        //                     fill="currentColor"
                        //                     className="bi bi-chevron-right"
                        //                     viewBox="0 0 16 16"
                        //                 >
                        //                     <path
                        //                         fillRule="evenodd"
                        //                         d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                        //                     />
                        //                 </svg>
                        //             </div>
                        //         </div>
                        //     </a>
                        // </div>
                        null
                    )}
                    {/* <div className="sub-menus collapse" id="bilan">
                        <div className="nav-item">
                            <Link
                                to={"bilan_liste"}
                                className="text-decoration-none rounded d-block"
                                href="/bilan_liste"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Liste bilan</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"bilan"}
                                className="text-decoration-none rounded d-block"
                                href="/bilan"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Bilan en Temps réel</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Rapport"}
                                className="text-decoration-none rounded d-block"
                                href="/Rapport"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Rapport</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Statistique"}
                                className="text-decoration-none rounded d-block"
                                href="/Statistique"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Statistique des activites </span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                    </div> */}
                    {/* {
                    
                    
                    Ismembre === 2 ? null :
                    
                    (
                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#resultats"
                                role="button"
                                aria-expanded="false"
                                aria-controls="resultats"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2048 2048"><path fill="currentColor" d="m0 1898l384-384v534H0zm512-512l384-384v1046H512zm1280-490h128v1152h-384v-918zm-448 426l64-64v790h-384V1002zm704-1066v512h-128V475l-576 575l-384-384L0 1627v-182l960-959l384 384l485-486h-293V256z" /></svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Resultats
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )
                    
                    } */}


                    <div className="sub-menus collapse" id="resultats">

                        <div className="nav-item">
                            <Link
                                to={"Listes"}
                                className="text-decoration-none rounded d-block"
                                href="/Listes"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Lites</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Resultats"}
                                className="text-decoration-none rounded d-block"
                                href="/Resultats"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Creer Resultats</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* {Ismembre === 2 ? null : (

                        <div className="nav-item">
                            <a
                                onClick={toggleSubMenu}
                                className="text-decoration-none rounded d-block"
                                data-bs-toggle="collapse"
                                href="#Presence"
                                role="button"
                                aria-expanded="false"
                                aria-controls="Presence"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-raised-hand" viewBox="0 0 16 16">
                                                <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207" />
                                                <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                            </svg>
                                        </div>
                                        <span className="menu-title" style={{ fontWeight: "bold" }}>
                                            Présences
                                        </span>
                                    </div>
                                    <div className="down_caret">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15"
                                            height="15"
                                            fill="currentColor"
                                            className="bi bi-chevron-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path

                                                fillRule="evenodd"
                                                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )} */}



                    <div className="sub-menus collapse" id="Presence">
                        <div className="nav-item">
                            <Link to="Presences"
                                className="text-decoration-none rounded d-block"
                                href="/Lieu_Autorise"
                            >

                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title">Présences</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        {/* <div className="nav-item">
                            <Link
                                to={"Lieu_Autorise"}
                                className="text-decoration-none rounded d-block"
                                href="/Lieu_Autorise"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Lieu Autorise</span>
                                    </div>
                                </div>
                            </Link>
                        </div> */}
                        {/* <div className="nav-item">
                            <Link
                                to={"notification"}
                                className="text-decoration-none rounded d-block"
                                href="/notification"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Notification</span>
                                    </div>
                                </div>
                            </Link>
                        </div> */}
                        <div className="nav-item">
                            <Link
                                to={"Planning"}
                                className="text-decoration-none rounded d-block"
                                href="/Planning"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Planning</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Penalite_retard"}
                                className="text-decoration-none rounded d-block"
                                href="/Penalite_retard"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Penalite Retard</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link
                                to={"Demandeabs"}
                                className="text-decoration-none rounded d-block"
                                href="/Demandeabs"
                            >
                                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="menu-icon"></div>
                                        <span className="menu-title"> Demandes d'absence</span>
                                    </div>
                                </div>
                            </Link>
                        </div>


                    </div>



                </nav  >


                {/* </div> */}




                <  div className="aside-footer px-2 py-3"  >
                    <hr style={{ color: 'white' }} />

                    <div className="nav-item">
                        <a
                            className="text-decoration-none rounded d-block "
                            href="#logout"
                            onClick={handleLogout}
                        >
                            <div className="d-flex align-items-center justify-content-between py-2 px-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="menu-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-box-arrow-left"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="menu-title">Déconnexion</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div  >


            </aside >





            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    onClick={showSidebar}
                    fill="black"
                    className="bi bi-justify mx-3 mt-2 d-sidebar"
                    viewBox="0 0 16 16"
                >
                    <path
                        fillRule="evenodd"
                        d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"
                    />
                </svg>
            </div>
        </>
    );
}
