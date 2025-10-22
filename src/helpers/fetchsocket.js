// socket.js ou config.js
import { io } from "socket.io-client";

// ⚡ Détection de l'environnement selon le hostname
const hostname = window.location.hostname;

export const SOCKET_URL =
    hostname === "nodebu.inoviatech.com"
        ? "https://api.nodebu.inoviatech.com"
        : hostname === "prototype.nodebu.inoviatech.com"
            ? "https://api.prototype.nodebu.inoviatech.com"
            : hostname === "localhost"
                ? "http://169.254.94.169:7000"
                : null; // fallback local

// ⚡ Création du socket singleton (optionnel si tu veux)
export const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
});

// Export du hostname si besoin
export { hostname };
