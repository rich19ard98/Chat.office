// DashboardProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "../../utils/socket";
import { debounce } from "lodash"; // ⚡ import debounce

const DashboardContext = createContext();

export const useDashboardTrigger = () => useContext(DashboardContext);

const relevantTypes = [
    "ecriturecomptable",
    "ecriturecomptableanticipe",
    "remboursementecriturecomptable",
    "reemboursementprecoceecriturecomptable",
    "approuvecredit",
    "fraisadhesion",
    "fichedepenseecriturecomptable"
];

const relevantActions = ["ajout", "update", "delete"];

export default function DashboardProvider({ children }) {
    const [updateTrigger, setUpdateTrigger] = useState(0);

    useEffect(() => {
        // 🔹 handler avec debounce pour limiter les re-renders
        const debouncedHandler = debounce((payload) => {
            console.log("📩 WS Dashboard reçu:", payload);

            if (
                payload &&
                relevantTypes.includes(payload.type) &&
                relevantActions.includes(payload.action)
            ) {
                setUpdateTrigger(prev => prev + 1);
            }
        }, 200); // 200ms de délai, ajustable selon le besoin

        socket.on("new_data", debouncedHandler);
        return () => socket.off("new_data", debouncedHandler);
    }, []);

    return (
        <DashboardContext.Provider value={{ updateTrigger }}>
            {children}
        </DashboardContext.Provider>
    );
}
