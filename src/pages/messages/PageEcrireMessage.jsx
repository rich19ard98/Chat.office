
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/app/PageEcrireMessage.css";
import { setToastAction } from "../../store/actions/appActions";
import fetchApi from "../../helpers/fetchApi";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import { socket } from "../../helpers/fetchsocket";

export default function PageEcrireMessage() {
    const { id: otherUserId } = useParams(); // id de l'autre utilisateur (pas conversation)
    const dispatch = useDispatch();
    const user = useSelector(userSelector);
    const userId = user?.ID_UTILISATEUR;
    console.log({ userId });

    const [loading, setLoading] = useState(true);
    const [autreUtilisateur, setAutreUtilisateur] = useState(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    // const [conversationId, setConversationId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const conversationId = otherUserId; // pour chat 1:1, la conversation = autre utilisateur
    const [utilisateurs, setUtilisateurs] = useState([]);

    const messagesEndRef = useRef(null);
    const fetchUtilisateurs = useCallback(async () => {
        if (!otherUserId) return; // pas d'id, rien à faire

        try {
            setLoading(true);
            const baseurl = `/administration/utilisateurs/fetch?Receiver=${otherUserId}`;
            console.log("Fetching utilisateur pour ID :", otherUserId);

            const res = await fetchApi(baseurl);
            const data = res.result.data || [];
            if (data.length > 0) {
                setAutreUtilisateur(data[0]);
            } else {
                setAutreUtilisateur(null);
            }
        } catch (error) {
            console.error(error);
            setAutreUtilisateur(null);
        } finally {
            setLoading(false);
        }
    }, [otherUserId]); // 🔹 dépendance = déclenchement si useParams change

    // 🔹 Déclenchement automatique si otherUserId change
    useEffect(() => {
        fetchUtilisateurs();
    }, [fetchUtilisateurs]);
    // 🟢 Étape 1 : Récupérer ou créer la conversation entre les 2 utilisateurs

    const fetchMessages = useCallback(async (silent = false, forceRefresh = false) => {

        try {
            setLoading(true);
            const baseurl = `/messages/messages/conversation/${conversationId}`;

            const res = await fetchApi(baseurl);
            const data = res.result || [];
            console.log({ res });
            setMessages(data)

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false);
        }
    }, []); // 🔹 dépendance = déclenchement si useParams change

    useEffect(() => {
        fetchMessages();
    }, []);
    const fetchCreditRef = useRef((silent = false, forceRefresh = false) => { });

    useEffect(() => {
        fetchCreditRef.current = (silent = false, forceRefresh = false) =>
            fetchMessages(silent, forceRefresh);
    }, [fetchMessages]);

    const wsCoalesceRef = useRef(null);

    useEffect(() => {
        // ✅ Définition des types et actions autorisés
        const ALLOWED_TYPES = ["messages"];
        const ALLOWED_ACTIONS = ["ajout", "update", "delete", "validation", "approbation"];
        const DEBOUNCE_DELAY = 300;

        const handler = (payload) => {

            // Validation du payload
            if (!payload?.type || !payload?.action) {
                return;
            }

            const rawType = payload.type.trim().toLowerCase();
            const rawAction = payload.action.trim().toLowerCase();
            // Filtrage par type
            if (!ALLOWED_TYPES.includes(rawType)) {
                return;
            }

            // Filtrage par action
            if (!ALLOWED_ACTIONS.includes(rawAction)) {
                return;
            }

            // Debounce
            if (wsCoalesceRef.current) {
                clearTimeout(wsCoalesceRef.current);
            }

            wsCoalesceRef.current = setTimeout(() => {
                fetchCreditRef.current?.(true, true);
                wsCoalesceRef.current = null;
            }, DEBOUNCE_DELAY);
        };
        socket.on("new_data", handler);

        return () => {
            socket.off("new_data", handler);
            if (wsCoalesceRef.current) {
                clearTimeout(wsCoalesceRef.current);
                wsCoalesceRef.current = null;
            }
        };
    }, [socket]);
    // 🟢 Initialisation
    // useEffect(() => {
    //     (async () => {
    //         const convId = await fetchOrCreateConversation();
    //         if (convId) fetchMessages(convId);
    //     })();

    //     const interval = setInterval(() => {
    //         if (conversationId) fetchMessages(conversationId);
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, [otherUserId]);

    // 🟢 Scroll automatique en bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // lister les utilisateurs

    const Nom = utilisateurs.map(nom => nom.NOM)
    const Prenom = utilisateurs.map(nom => nom.PREBOM)

    // 🟢 Envoi de message
    const handleSend = async () => {
        try {
            if (!message.trim() && files.length === 0) return;
            if (!conversationId && !otherUserId) return;

            setIsSubmitting(true);

            const form = new FormData();
            form.append("SENDER_ID", userId);
            form.append("RECEIVER_ID", conversationId);
            form.append("CONTENT", message);
            form.append("TYPE", files.length > 0 ? "file" : "text");

            files.forEach((file) => form.append("FILES", file));

            if (conversationId) {
                form.append("CONVERSATION_ID", conversationId);
            } else {
                form.append("RECEIVER_ID", otherUserId);
            }

            const res = await fetchApi("/messages/messages/create", {
                method: "POST",
                body: form,
            });

            // if (res.statusCode === 201) {
            //     setMessage("");
            //     setFiles([]);
            //     fetchMessages(conversationId);
            //     dispatch(
            //         setToastAction({
            //             severity: "success",
            //             summary: "Message envoyé",
            //             detail: "Votre message a été envoyé avec succès",
            //             life: 3000,
            //         })
            //     );
            // } else {
            //     throw new Error("Impossible d'envoyer le message");
            // }
        } catch (error) {
            console.error(error);
            dispatch(
                setToastAction({
                    severity: "error",
                    summary: "Erreur",
                    detail: "Une erreur est survenue, réessayez plus tard",
                    life: 3000,
                })
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🟢 Upload de fichier
    const handleFileChange = (e) => setFiles(Array.from(e.target.files));

    return (
        <div className="page-message">
            {/* Header */}
            {/* Header */}
            <div
                className="message-header flex-end"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
                {autreUtilisateur ? (
                    <>
                        <img
                            src={autreUtilisateur.IMAGE || "/images/default-user.png"}
                            alt={`${autreUtilisateur.NOM} ${autreUtilisateur.PRENOM}`}
                            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        />
                        <span>{`${autreUtilisateur.NOM || "Nom"} ${autreUtilisateur.PRENOM || ""}`}</span>
                    </>
                ) : (
                    <span>Utilisateur</span>
                )}
            </div>



            {/* Messages */}
            <div className="message-body">
                {messages.map((msg) => (
                    <div
                        key={msg.ID}
                        className={`message ${msg.sender.ID_UTILISATEUR === userId ? "received" : "sent"}`}
                    >
                        {msg.CONTENT}
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>

            {/* Footer fixe */}
            <div className="message-input">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrire votre message..."
                    rows={2}
                />
                <button onClick={handleSend} disabled={isSubmitting}>
                    {isSubmitting ? "Envoi..." : "Envoyer"}
                </button>
            </div>
        </div>
    );
}

