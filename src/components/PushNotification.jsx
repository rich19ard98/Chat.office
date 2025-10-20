import React, { useEffect } from "react";
import fetchApi from "../helpers/fetchApi";

const VAPID_PUBLIC_KEY = "BJgxWeLvukodWQjHSabFVBwFkosl3GOBXdx3lvDlkW4fFnVld0F78X3HnjdJFDN90FD2Ct3d1qubmRPPaC0slkY";

export default function PushNotification() {
    const registerPush = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return console.log("Notification refusée");

            // ✅ Chemin correct pour CRA / React
            const reg = await navigator.serviceWorker.register("/service-worker.js");
            console.log("Service Worker enregistré :", reg);

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            await fetchApi("/Notifications/subscription/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription)
            });

            console.log("Abonnement push envoyé au serveur !");
        } catch (err) {
            console.error("Erreur push :", err);
        }
    };
    useEffect(() => {
        registerPush();
    }, []);

}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
