import { useEffect, useRef, useState } from "react";
import Logo from "../../../public/images/logo3.png";
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
import IDS_ROLES from "../../constants/IDS_ROLES";

export default function SideBar({ isMobile, setAsideVisible }) {
  const navigate = useNavigate();
  const dispacth = useDispatch();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const location = useLocation();


  const user = useSelector(userSelector);
  const socket = useRef(null);

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

  //   const user = useSelector(userSelector);
  //   const socket=useRef(io(API_URL)).current
  //   console.log(socket,'socketsocket');
  //   useEffect(() => {
  //     socket.on("connect", (err, data) => {
  //               socket.emit("join", { userId: `u_${user.ID_UTILISATEUR}`, userType: "admin" });
  //     });
  //     socket.on('error', error => {
  //               console.log(error)
  //     })
  //     socket.on('disconnect', () => {
  //               // isSocketConnected = false;
  //     });
  //     return () => {
  //               socket.disconnect()
  //     }
  // }, [socket])

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
    // sidebar.style.display = "block";
    // sidebar.style.marginRight='100%';
    // Dsidebar.addEventListener('click', () => {
    // console.log("show");
    // });
  };

  const [nodes, setNodes] = useState([]);




  const adminPermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.ADMINISTRATION)
  const adminAcces = adminPermission && (adminPermission.CAN_READ || adminPermission.CAN_WRITE)

  const parametrePermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.PARAMETRE)
  const parametreAcces = parametrePermission && (parametrePermission.CAN_READ || parametrePermission.CAN_WRITE)

  const rapportPermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.RAPPORTS)
  const rapportAcces = rapportPermission && (rapportPermission.CAN_READ || rapportPermission.CAN_WRITE)

  const gererPermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.GERER)
  const gerertAcces = gererPermission && (gererPermission.CAN_READ || gererPermission.CAN_WRITE)


  const approvisionnementPermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.APPROVISIONNEMENTS)
  const approvisionnementsAcces = approvisionnementPermission && (approvisionnementPermission.CAN_READ || approvisionnementPermission.CAN_WRITE)

  const comptabilitePermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.COMPTABILITES)
  const comptabilitesAcces = comptabilitePermission && (comptabilitePermission.CAN_READ || comptabilitePermission.CAN_WRITE)

  
  const ActivitesPermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.ACTIVITES)
  const activitesAcces = ActivitesPermission && (ActivitesPermission.CAN_READ || ActivitesPermission.CAN_WRITE)


  const ventePermission = user?.PROFIL?.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.VENTES)
  const venteAcces = ventePermission && (ventePermission.CAN_READ || ventePermission.CAN_WRITE)




  return (
    <>
      <aside
        className={`sidebar  flex-column justify-content-between shadow z-1 ${isSidebarMinimized ? "minimized" : ""
          }`}

      >
        {/* <Link
                to={"/"}
                className="d-flex align-items-center px-3 py-2 text-decoration-none link-dark"
            >
                <div className="logo-container">
                    <img src={Logo} alt="" className="logo" />
                </div>
                <div className="mx-3">
                    <h4 className='mx-2 mb-0 text-success'>AFPM</h4>
                </div>
            </Link> */}

        <div className="d-flex justify-content-between align-items-center">
          <Link
            // to={user.ID_PROFIL !== PROFILS.CORPORATE ? "/" : null}
            className="d-flex align-items-center px-3 py-2 text-decoration-none link-dark"
          >
            {isMobile ? null : (
              <Button
                size="small"
                severity="secondary"
                outlined
                style={{
                  color: "black",
                  width: 40,
                  height: 40,
                  border: "none",
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
              </Button>
            )}
            {/* <div className="col"> */}
            <div className="logo-container">
              <img src={Logo} alt="" className="logo" />
            </div>
            <div className="ml-0 mt-1 ">
              <div className="d-flex align-items-center" style={{ flexDirection: 'column' }}>
                <h5 className="mb-0 app-brandName">TWIZERE</h5>
                <h6 className="mb-0 brandSubName ml-2" style={{ fontSize: '12px' }}>Centre de sante</h6>
              </div>
              <AppDateTime />
            </div>
            {/* </div> */}

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



        <hr className="mx-3 my-2" style={{ borderTopColor: "black" }} />
        {/* <div className="" style={{backgroundColor:'red'}}> */}
        <nav className={`px-2 flex-fill`}  >


          {adminAcces ? <>
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
                      <span className="menu-title">Profiles</span>
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


            </div>
          </> : null}



          {parametreAcces ? <>
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

            <div className="sub-menus collapse" id="parametre">
              <div className="nav-item">
                <Link
                  to={"statutcmdmedtsedit"}
                  className="text-decoration-none rounded d-block"
                  href="/statutcmdmedtsedit"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Statut des médicaments</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"statutinventaire"}
                  className="text-decoration-none rounded d-block"
                  href="/statutinventaire"
                  role="button"
                  aria-expanded="false"
                  aria-controls="administration"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Statut de l'inventaire</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"statutreception"}
                  className="text-decoration-none rounded d-block"
                  href="/statutreception"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Statut de récéption
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"statutrequis"}
                  className="text-decoration-none rounded d-block"
                  href="/statutrequis"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Statut de réquisition
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"statusliberation"}
                  className="text-decoration-none rounded d-block"
                  href="/statusliberation"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Status de libération du stock
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"motifliberation"}
                  className="text-decoration-none rounded d-block"
                  href="/motifliberation"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Motif de libération
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"typesactivites"}
                  className="text-decoration-none rounded d-block"
                  href="/typesactivites"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Types activités
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </> : null}

          {rapportAcces ? <>
            <div className="nav-item">
              <a
                className="text-decoration-none rounded d-block"
                data-bs-toggle="collapse"
                href="#rapport"
                role="button"
                aria-expanded="false"
                aria-controls="rapport"
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
            <div className="sub-menus collapse" id="rapport">

              <div className="nav-item">
                <Link
                  to={"rapport"}
                  className="text-decoration-none rounded d-block"
                  href="/rapport"
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
                  to={"journalier"}
                  className="text-decoration-none rounded d-block"
                  href="/journalier"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Rapport journalier</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailrapportliste"}
                  className="text-decoration-none rounded d-block"
                  href="/detailrapportliste"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail du rapport journalier</span>
                    </div>
                  </div>
                </Link>
              </div>

            </div>

          </> : null}

          {gerertAcces ? <>

            <div className="nav-item">
              <a
                onClick={toggleSubMenu}
                className="text-decoration-none rounded d-block"
                data-bs-toggle="collapse"
                href="#gerer"
                role="button"
                aria-expanded="false"
                aria-controls="gerer"
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

            <div className="sub-menus collapse" id="gerer">
              <div className="nav-item">
                <Link
                  to={"clients"}
                  className="text-decoration-none rounded d-block"
                  href="/clients"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Clients</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"fournisseurs"}
                  className="text-decoration-none rounded d-block"
                  href="/fournisseurs"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Fournisseurs</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"effetsSecend"}
                  className="text-decoration-none rounded d-block"
                  href="/effetsSecend"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Effets secondaire</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"formeGaln"}
                  className="text-decoration-none rounded d-block"
                  href="/formeGaln"
                  role="button"
                  aria-expanded="false"
                  aria-controls="administration"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Forme galénique</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"princAct"}
                  className="text-decoration-none rounded d-block"
                  href="/princAct"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Principes actifs
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"classemedicamenteuse"}
                  className="text-decoration-none rounded d-block"
                  href="/classemedicamenteuse"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Classe de médicaments</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"medic"}
                  className="text-decoration-none rounded d-block"
                  href="/medic"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">
                        Médicaments
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"prixVente"}
                  className="text-decoration-none rounded d-block"
                  href="/prixVente"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Tarification</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"typeservice"}
                  className="text-decoration-none rounded d-block"
                  href="/typeservice"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Type de services</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"service"}
                  className="text-decoration-none rounded d-block"
                  href="/service"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Services</span>
                    </div>
                  </div>
                </Link>
              </div>


            </div>
          </> : null}


          {approvisionnementsAcces ? <>
            <div className="nav-item">
              <a
                onClick={toggleSubMenu}
                className="text-decoration-none rounded d-block"
                data-bs-toggle="collapse"
                href="#reapprovisionner"
                role="button"
                aria-expanded="false"
                aria-controls="reapprovisionner"
              >
                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="menu-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-menu-button-wide" viewBox="0 0 16 16">
                        <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-13A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z" />
                        <path d="M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m10.823.323-.396-.396A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
                      </svg>

                    </div>
                    <span className="menu-title" style={{ fontWeight: "bold" }}>
                      Réapprovisionner
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

            <div className="sub-menus collapse" id="reapprovisionner">
            
              <div className="nav-item">
                <Link
                  to={"requisitionner"}
                  className="text-decoration-none rounded d-block"
                  href="/requisitionner"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Réquisition</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailsrequisitionner"}
                  className="text-decoration-none rounded d-block"
                  href="/detailsrequisitionner"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail de la réquisition</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"commande"}
                  className="text-decoration-none rounded d-block"
                  href="/commande"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Commande</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailscommande"}
                  className="text-decoration-none rounded d-block"
                  href="/detailscommande"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail de la commande</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"reception"}
                  className="text-decoration-none rounded d-block"
                  href="/reception"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Réception</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailsreception"}
                  className="text-decoration-none rounded d-block"
                  href="/detailsreception"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail de la réception</span>
                    </div>
                  </div>
                </Link>
              </div>


              <div className="nav-item">
                <Link
                  to={"liberationstock"}
                  className="text-decoration-none rounded d-block"
                  href="/liberationstock"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title"> Libération de stock </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailliberation"}
                  className="text-decoration-none rounded d-block"
                  href="/detailliberation"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail de la libération</span>
                    </div>
                  </div>
                </Link>
              </div>



              <div className="nav-item">
                <Link
                  to={"inventaire"}
                  className="text-decoration-none rounded d-block"
                  href="/inventaire"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Inventaire</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailsinventaire"}
                  className="text-decoration-none rounded d-block"
                  href="/detailsinventaire"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détails inventaire </span>
                    </div>
                  </div>
                </Link>
              </div>

            </div>
          </> : null}

        

          {comptabilitesAcces ? <>

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
                      Comptabilités
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

            <div className="sub-menus collapse" id="comptabilite">

              <div className="nav-item">
                <Link
                  to={"typecompte"}
                  className="text-decoration-none rounded d-block"
                  href="/typecompte"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Type de compte</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"compte"}
                  className="text-decoration-none rounded d-block"
                  href="/compte"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Comptes</span>
                    </div>
                  </div>
                </Link>
              </div>


            </div>
          </> : null}

          {venteAcces ? <>

            <div className="nav-item">
              <a
                onClick={toggleSubMenu}
                className="text-decoration-none rounded d-block"
                data-bs-toggle="collapse"
                href="#ventes"
                role="button"
                aria-expanded="false"
                aria-controls="ventes"
              >
                <div className="d-flex align-items-center justify-content-between py-2 px-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="menu-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ fontWeight: "bold" }} width="20" height="20" fill="currentColor" className="bi bi-cash" viewBox="0 0 16 16">
                        <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                        <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <span className="menu-title" style={{ fontWeight: "bold" }}>
                      Ventes
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
            <div className="sub-menus collapse" id="ventes">
            <div className="nav-item">
                <Link
                  to={"stock"}
                  className="text-decoration-none rounded d-block"
                  href="/stock"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Stock</span>
                    </div>
                  </div>
                </Link>

              </div>
              <div className="nav-item">
                <Link
                  to={"paiement"}
                  className="text-decoration-none rounded d-block"
                  href="/paiement"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Paiements</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"detailPaie"}
                  className="text-decoration-none rounded d-block"
                  href="/detailPaie"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail des paiements</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"vent"}
                  className="text-decoration-none rounded d-block"
                  href="/vent"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Vente de médicaments</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"ventDetail"}
                  className="text-decoration-none rounded d-block"
                  href="/ventDetail"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail ventes médicaments</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="nav-item">
                <Link
                  to={"ventServ"}
                  className="text-decoration-none rounded d-block"
                  href="/ventServ"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Vente de services</span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="nav-item">
                <Link
                  to={"ventDetailServ"}
                  className="text-decoration-none rounded d-block"
                  href="/ventDetailServ"
                >
                  <div className="d-flex align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="menu-icon"></div>
                      <span className="menu-title">Détail de la vente de services</span>
                    </div>
                  </div>
                </Link>
              </div>

            </div>
          </> : null}
        </nav>
        <div className="aside-footer px-2 py-3">
          <hr />

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
        </div>
        {/* </div> */}



      </aside>
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
