import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import Logo from "../../../public/images/Chat.png";
import "../../styles/app/sidebar.css";
import { encodeId } from "../../utils/IdEncryption";
import { userSelector } from "../../store/selectors/userSelector";
import { setUserAction } from "../../store/actions/userActions";
import removeUserDataAndCaches from "../../utils/removeUserDataAndCaches";
import fetchApi from "../../helpers/fetchApi";

export default function ChatSidebar({ isMobile, setAsideVisible }) {
    const user = useSelector(userSelector);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // ton useCallback adapté ici
    const fetchUtilisateurs = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/administration/utilisateurs/fetch?rows=10000000000&`;
            let url = baseurl;

            // si tu as des filtres, adapte selon ton contexte :
            // (lazyState, profil, etc.)

            const res = await fetchApi(url);
            setUtilisateurs(res.result.data || []);
        } catch (error) {
            console.error("Erreur chargement utilisateurs :", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUtilisateurs();
    }, [fetchUtilisateurs]);

    const handleLogout = () => {
        confirmDialog({
            header: "Déconnexion",
            message: "Voulez-vous vraiment vous déconnecter ?",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            acceptClassName: "p-button-danger",
            accept: () => {
                removeUserDataAndCaches(user.ID_UTILISATEUR, user.REFRESH_TOKEN);
                dispatch(setUserAction(null));
                localStorage.removeItem("user");
                navigate("/login");
            },
        });
    };

    const filteredUsers = utilisateurs.filter((u) =>
        (u.NOM || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <aside className="chat-sidebar">
            {/* Header */}
            <div className="chat-header flex justify-between align-items-center p-3">
                <div className="flex align-items-center gap-2">
                    <img src={Logo} alt="Banguka" className="chat-logo" />
                    <span className="app-name font-bold">RichaChat</span>
                </div>
                {isMobile && (
                    <Button
                        icon="pi pi-times"
                        text
                        onClick={() => setAsideVisible(false)}
                    />
                )}
            </div>

            {/* Barre de recherche */}
            <div className="search-bar p-3">
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher un utilisateur..."
                        className="w-full"
                        value={searchTerm}
                        autoFocus 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </span>
            </div>

            {/* Liste des utilisateurs */}
            <div className="conversations-list flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center p-3">Chargement...</div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.ID_UTILISATEUR}
                            className="conversation-item"
                            onClick={() => navigate(`/messages/${user?.ID_UTILISATEUR}`)}
                        >
                            <Avatar
                                image={
                                    user.AVATAR ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.NOM || "User"
                                    )}&background=random`
                                }
                                label={user.NOM?.charAt(0)}
                                shape="circle"
                                size="large"
                                className="mr-3"
                            />
                            <div className="flex-grow-1">
                                <span className="font-semibold">{user.NOM}  {user.PRENOM} </span>
                                <div className="text-sm text-muted">{user.EMAIL || ""}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted p-3">
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>

            {/* Footer profil + déconnexion */}
            <div className="chat-footer p-3 border-top mb-2 flex align-items-center justify-between" style={{ marginTop: '10px' }}>
                <div className="flex align-items-center gap-3">
                    <Avatar
                        image={user.avatar}
                        label={user.displayName?.charAt(0)}
                        shape="circle"
                    />
                    <div>
                        <div className="font-bold">
                            {user.displayName || user.username}
                        </div>
                        <div className="text-sm text-success">En ligne</div>
                    </div>
                </div>
                <Button
                    icon="pi pi-sign-out"
                    text
                    severity="danger"
                    onClick={handleLogout}
                />
            </div>

        </aside>
    );
}
