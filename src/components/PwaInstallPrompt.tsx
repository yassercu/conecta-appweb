import React, { useEffect, useState } from "react";

const PwaInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setShowPrompt(false);
            }
        }
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 24,
            left: 0,
            right: 0,
            margin: "auto",
            maxWidth: 340,
            background: "#222e3a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            padding: 16,
            zIndex: 1000,
            textAlign: "center"
        }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Instala Conecta AppWeb en tu dispositivo
            </div>
            <button
                style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: 600,
                    cursor: "pointer"
                }}
                onClick={handleInstallClick}
            >
                Instalar aplicación
            </button>
        </div>
    );
};

export default PwaInstallPrompt; 