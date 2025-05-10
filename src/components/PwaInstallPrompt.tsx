import React, { useEffect, useState, useRef } from "react";

const PwaInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [animation, setAnimation] = useState("slide-in-down");
    const [isButtonPulsing, setIsButtonPulsing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasBeenShownInSessionKey = "pwaInstallPromptShownInSession";

    // Definición de animaciones para usar en el estilo
    const animations = {
        slideInDown: `
            @keyframes slideInDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
        `,
        slideOutUp: `
            @keyframes slideOutUp {
                from {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
                to {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
            }
        `,
        pulse: `
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
                }
            }
        `,
        fadeIn: `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `
    };

    useEffect(() => {
        // Agregar estilos de animación al documento
        const styleEl = document.createElement('style');
        styleEl.textContent = animations.slideInDown + animations.slideOutUp +
            animations.pulse + animations.fadeIn;
        document.head.appendChild(styleEl);

        // Limpiar el estilo cuando se desmonta el componente
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();

            // Verificar si ya se mostró en esta sesión
            if (sessionStorage.getItem(hasBeenShownInSessionKey) === "true") {
                console.log("PWA install prompt already shown in this session.");
                return;
            }

            setDeferredPrompt(e);
            setShowPrompt(true);
            sessionStorage.setItem(hasBeenShownInSessionKey, "true");

            // Iniciar pulsación del botón después de 3 segundos
            setTimeout(() => {
                setIsButtonPulsing(true);
            }, 3000);

            // Ocultar automáticamente después de 15 segundos
            timerRef.current = setTimeout(() => {
                handleClose();
            }, 15000);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                handleClose();
            }
        }
    };

    const handleClose = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setAnimation("slide-out-up");
        setTimeout(() => {
            setShowPrompt(false);
            setAnimation("slide-in-down");
        }, 500);
    };

    if (!showPrompt) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                maxWidth: 400,
                background: "linear-gradient(135deg, #1e293b, #111927)",
                color: "#fff",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                padding: 0,
                zIndex: 1000,
                animation: `${animation === "slide-in-down" ? "slideInDown 0.5s forwards" : "slideOutUp 0.5s forwards"}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)"
            }}
        >
            {/* Barra superior con gradiente */}
            <div style={{
                height: "4px",
                background: "linear-gradient(to right, #3b82f6, #2563eb, #1d4ed8)",
                animation: "fadeIn 1s"
            }} />

            <div style={{
                padding: "16px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        {/* Icono de instalación */}
                        <div style={{
                            backgroundColor: "rgba(37, 99, 235, 0.2)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16L12 8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 13L12 16L15 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 19H15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            paddingRight: 16
                        }}>
                            Instala Orbita-Y App en tu dispositivo
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#fff",
                            opacity: 0.7,
                            fontSize: "1.2rem",
                            padding: 0,
                            lineHeight: 1,
                            marginTop: -2
                        }}
                    >
                        ×
                    </button>
                </div>

                <p style={{
                    fontSize: "0.9rem",
                    margin: "6px 0 12px",
                    opacity: 0.8
                }}>
                    Disfruta de una mejor experiencia instalando la app en tu dispositivo
                </p>

                <button
                    style={{
                        background: "linear-gradient(to right, #3b82f6, #2563eb)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 20px",
                        fontWeight: 600,
                        cursor: "pointer",
                        alignSelf: "center",
                        width: "100%",
                        boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        animation: isButtonPulsing ? "pulse 1.5s infinite" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                    }}
                    onMouseOver={(e) => {
                        setIsButtonPulsing(false);
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.4)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 10px rgba(37, 99, 235, 0.3)";
                    }}
                    onClick={handleInstallClick}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12H12M16 12H12M12 12V8M12 12V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Instalar aplicación
                </button>
            </div>
        </div>
    );
};

export default PwaInstallPrompt; 