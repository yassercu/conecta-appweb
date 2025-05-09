const CACHE_NAME = 'orbita-y-cudev-v1';
const urlsToCache = [
    '/',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon-512x512-maskable.png',
    '/icons/apple-touch-icon.png',
    // Agrega aquí rutas de archivos estáticos importantes
];

// Instalación del service worker y precacheo de recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    // Activar el nuevo service worker inmediatamente
    self.skipWaiting();
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        )
    );
    // Tomar control de los clientes inmediatamente
    event.waitUntil(self.clients.claim());
});

// Estrategia de caché: primero caché, luego red
self.addEventListener('fetch', event => {
    // Manejo especial para navegación (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/');
            })
        );
        return;
    }

    // Para otros recursos, primero caché, luego red
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                // Almacenar en caché las respuestas de recursos estáticos
                if (fetchResponse && fetchResponse.status === 200 &&
                    (event.request.url.endsWith('.js') ||
                        event.request.url.endsWith('.css') ||
                        event.request.url.endsWith('.png') ||
                        event.request.url.endsWith('.jpg') ||
                        event.request.url.endsWith('.svg'))) {
                    // Clonar la respuesta para poder usarla dos veces
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return fetchResponse;
            }).catch(() => {
                // Página de fallback para recursos que no pueden ser obtenidos
                if (event.request.url.indexOf('/api/') !== -1) {
                    return new Response(JSON.stringify({ error: 'Sin conexión' }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            });
        })
    );
});

// Notificaciones push
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificación';
    const options = {
        body: data.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: data.url || '/'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
}); 