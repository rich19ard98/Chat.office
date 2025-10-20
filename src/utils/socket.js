
import { io } from "socket.io-client";

const hostname = window.location.hostname;

let SOCKET_URL;

if (hostname === "nodebu.inoviatech.com") {
    SOCKET_URL = "https://api.nodebu.inoviatech.com";
} else if (hostname === "prototype.nodebu.inoviatech.com") {
    SOCKET_URL = "https://api.prototype.nodebu.inoviatech.com";
} else if (hostname === "localhost") {
    SOCKET_URL = "http://169.254.94.169:5550"; // dev local http://169.254.94.169:5550
} else {
    SOCKET_URL = window.location.origin; // fallback générique
}

console.log("🌐 [Socket.io] URL choisie :", SOCKET_URL);

const socket = io(SOCKET_URL, {
    path: "/socket.io",
   transports: ["websocket", "polling"], // ordre conseillé
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
});

socket.on("connect", () => {
    console.log("✅ [Socket.io] Connecté :", socket.id);
});
    const transport = socket.io.engine.transport.name;
    console.log("🚀 Transport actif :", transport);

    if (transport === "websocket") {
        console.log("🔵 WebSocket est actif !");
    } else {
        console.log("🟡 Fallback polling HTTP utilisé");
    }
socket.on("connect_error", (err) => {
    console.error("❌ [Socket.io] Erreur connexion :", err.message);
});

socket.on("disconnect", (reason) => {
    console.warn("⚠️ [Socket.io] Déconnecté :", reason);
});

socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 [Socket.io] Tentative de reconnexion #${attempt}`);
});

socket.on("reconnect_failed", () => {
    console.error("❌ [Socket.io] Échec des tentatives de reconnexion");
});

export default socket;
