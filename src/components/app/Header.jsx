import "../../styles/app/header.css"
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import Sofini from '/images/sofini.png'
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import moment from 'moment'
import { Badge } from 'primereact/badge';
import BreadCrumb from "./BreadCrumb";
import { useRef, useState, useEffect } from "react";
import { SlideMenu } from 'primereact/slidemenu';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import { setUserAction } from "../../store/actions/userActions";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppSideBar from "./SideBar";
import { Sidebar } from "primereact/sidebar";
import removeUserDataAndCaches from "../../utils/removeUserDataAndCaches";
import { encodeId } from "../../utils/IdEncryption";
import SearchBar from "../search/SearchBar";
import fetchApi from "../../helpers/fetchApi";
import PROFILS from "../../constants/PROFILS";
moment.updateLocale('fr', {
    weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Séptembre', 'Octoble', 'Novembre', 'Décembre']
})


const AppDateTime = () => {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);
    return (
        <div className="text-light date-time">
            {moment(time).format("dddd DD MMM YYYY HH:mm:ss")}
        </div>
    )
}

export default function Header() {
    const menu = useRef(null);
    const user = useSelector(userSelector)
    
    // Dans ton composant Header
    const [notifications, setNotifications] = useState([]); // récupérées du backend via fetch ou websocket
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const dispacth = useDispatch()
    const navigate = useNavigate()
    const [asideVisible, setAsideVisible] = useState(false);
    const [ids, setId] = useState()
    const handleAccept = async () => {
        removeUserDataAndCaches(user.ID_UTILISATEUR, user.REFRESH_TOKEN)
        dispacth(setUserAction(null))
        localStorage.setItem('user', null)
        navigate('/login')
    }


    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Deconnexion",
            style: { width: '30vw' },
            message: (
                <div className="d-flex flex-column align-items-center">
                    <>
                        <div className="font-bold text-center my-2">
                        </div>
                        <div className="text-center">
                            Voulez -vous vraiment se deconnecter?
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

    const fetchNotifications = async () => {
        try {
            const res = await fetchApi(`/Notifications/notifications/fetch`);
            const notifications = res.result.data;

            // Filtrer uniquement les notifications non lues
            const unreadNotifications = notifications.filter(n => {
                if (n.ISREAD !== 0) return false; // déjà lue

                if (user?.ID_PROFIL === PROFILS.ADMIN) {
                    // Admin voit toutes les notifications destinées aux admins
                    return n.ISADMIN === 0;
                } else {
                    // Membre voit uniquement ses propres notifications
                    return n.ISADMIN === 1 && n.ID_UTILISATEUR === user?.ID_UTILISATEUR;
                }
            });
            // Mettre à jour le state
            setNotifications(unreadNotifications);

            // Pour récupérer un ID précis quand tu cliques sur une notif
            const ids = unreadNotifications.map(notif => notif.ID_NOTIFICATION);
            setId(ids);
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications :", error);
        }
    };


    useEffect(() => {
        if (user) fetchNotifications();
        const interval = setInterval(() => fetchNotifications(), 30000);
        return () => clearInterval(interval);
    }, [user]);

    {
        notifications.map(notif => (
            <div
                key={notif.ID_NOTIFICATION}
                onClick={() => markAsRead(notif.ID_NOTIFICATION)}
                style={{ cursor: 'pointer' }}
            >
                {notif.TITLE}
            </div>
        ))
    }
    const markAsRead = async (id) => {
        setNotifications(prev =>
            prev.map(n => n.ID_NOTIFICATION === id ? { ...n, read: true } : n)
        );

        try {
            const response = await fetchApi(`/Notifications/notifications/update/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ ID_NOTIFICATION: id }) // ✅ ID envoyé dans le body
            });

        } catch (error) {
            console.error("Impossible de marquer la notification comme lue :", error);
            setNotifications(prev =>
                prev.map(n => n.ID_NOTIFICATION === id ? { ...n, read: false } : n)
            );
        }
        fetchNotifications()
    };
    const items = [
        {
            template: () => {
                return (
                    <>
                        <div className="d-flex align-items-center w-100 px-2">
                            <div className="avatar">
                                {user?.IMAGE ? (
                                    <img src={user.IMAGE} alt="" className="" />
                                ) : (
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                    }}>
                                        {user?.NOM.charAt(0)}{user?.PRENOM.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="usernames ml-2">
                                <div className="font-bold white-space-nowrap">{user.NOM} {user.PRENOM}</div>
                                <div className="texte-muted text-sm white-space-nowrap">{user.EMAIL}</div>
                            </div>
                        </div>
                        <hr className="mb-0 mt-2" />
                    </>
                )
            }
        },

        {
            template: (deleteItem, options) => {
                return (
                    <Link to={`utilisateur/u/${encodeId(user?.ID_UTILISATEUR)}`} className="p-menuitem-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16" style={{ marginRight: "0.8rem" }}>
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                        </svg>
                        <span className="p-menuitem-text">Modifier le profil</span>
                    </Link>
                )
            }
        },
        {
            template: (deleteItem, options) => {
                return (
                    <Link to={`changepwd`} className="p-menuitem-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16" style={{ marginRight: "0.8rem" }}>
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                        </svg>
                        <span className="p-menuitem-text">Changer le mot de passe</span>
                    </Link>
                )
            }
        },
        {
            template: (deleteItem, options) => {
                return (
                    <Link to={`#`} className="p-menuitem-link" onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16" style={{ marginRight: "0.8rem" }}>
                            <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
                            <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
                        </svg>
                        <span className="p-menuitem-text">Se déconnecter</span>
                    </Link>
                )
            }
        },
    ];

    // useEffect(() => {
    //     if (user?.IMAGE) {
    //         setImageSrc(`${user.IMAGE}?t=${Date.now()}`); // Force la mise à jour en contournant le cache
    //     }
    // }, [user.IMAGE]); // Réagit aux changements de l'image dans Redux
    const [imageError, setImageError] = useState(false);

    const hasValidImage = user?.IMAGE && !imageError;

    return (
        <> <ConfirmDialog closable dismissableMask={true} />
            <Sidebar visible={asideVisible} onHide={() => setAsideVisible(false)} header={null} showCloseIcon={false} className="appMobileAside">
                <AppSideBar isMobile={true} setAsideVisible={setAsideVisible} />
            </Sidebar>

            <header className="align-items-center justify-content-between px-4 header" >


                <div className="d-flex align-items-center flex-1">
                    <Button size="small" severity="secondary" outlined style={{ color: "black", width: 40, height: 40, border: "none" }} rounded className="p-2 mr-2" id="mobileSidebarOpener" onClick={e => {
                        e.preventDefault()
                        setAsideVisible(true)
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" className="bi bi-list" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                        </svg>
                    </Button>
                    <SearchBar />
                    <BreadCrumb />
                </div>

                <div className="flex align-items-center py-2">
                    <NotificationBell notifications={notifications} onClick={() => setShowNotifPanel(!showNotifPanel)} />

                    {showNotifPanel && (
                        <div className="position-absolute" style={{ right: 60, top: 50, zIndex: 1000 }}>
                            <NotificationPanel notifications={notifications} markAsRead={markAsRead} />
                        </div>
                    )}

                    <SlideMenu ref={menu} model={items} popup viewportHeight={200} menuWidth={300} style={{ width: 300 }} />
                    <Button text className="p-0 avatar mx-2" onClick={(e) => menu.current.toggle(e)}>
                        {hasValidImage ? (
                            <img
                                src={user.IMAGE}
                                alt="Profil"
                                onError={() => setImageError(true)}
                                style={{ width: 40, height: 40, borderRadius: '50%' }}
                            />
                        ) : (
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                backgroundColor: '#ccc', display: 'flex',
                                justifyContent: 'center', alignItems: 'center',
                                color: 'black', fontWeight: 'bold'
                            }}>
                                {user?.NOM?.charAt(0) || ''}{user?.PRENOM?.charAt(0) || ''}
                            </div>
                        )}
                    </Button>
                </div>


            </header>
        </>

    )
}