import { AppProps } from 'next/app';
import { useEffect } from 'react';
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

function registerServiceWorkerAndNotifications() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(reg => {
                // Notificaciones push
                if ('Notification' in window && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                }
            });
        });
    }
}

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        registerServiceWorkerAndNotifications();
    }, []);
    return (
        <>
            <PwaInstallPrompt />
            <Component {...pageProps} />
        </>
    );
} 