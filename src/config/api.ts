/**
 * Configuración central para la API de Orbita-Y
 */

// URL base de la API
export const API_CONFIG = {
    BASE_URL: 'http://localhost:3001/api',
    // BASE_URL: 'http://216.7.89.170:3001/api',
    VERSION: 'v1',
    TIMEOUT: 30000,
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Tiempo de caché para respuestas (en milisegundos)
    CACHE_TIME: 15 * 60 * 1000, // Aumentado a 15 minutos para reducir solicitudes
    // Configuración de reintentos
    RETRY: {
        MAX_RETRIES: 5,
        RETRY_DELAY: 5000, // Delay inicial (ms)
        BACKOFF_FACTOR: 1.5,  // Factor de backoff exponencial reducido
        JITTER: 1000,        // Jitter aleatorio aumentado para mejor distribución
        RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504, 0] // Incluir código 0 para errores de red
    },
    // Rate limiting
    RATE_LIMIT: {
        MAX_REQUESTS_PER_MINUTE: 20, // Reducido para evitar sobrecarga
        REQUESTS_TRACKING_WINDOW: 120000 // 2 minutos en ms para mejor distribución
    }
};

// URL completa de la API con versión
export const API_URL = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`;

// Log para depuración
console.log('API_URL configurada:', API_URL);

// Configuración por defecto para las peticiones fetch
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
    headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
    },
    // Eliminar 'include' si tienes problemas con CORS
    // credentials: 'include',
};

// Endpoints de la API
export const ENDPOINTS = {
    // Negocios
    BUSINESSES: '/businesses',
    BUSINESS_BY_ID: (id: string) => `/businesses/${id}`,
    FEATURED_BUSINESSES: '/businesses/featured',
    PROMOTED_BUSINESSES: '/businesses/promoted',

    // Categorías
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

    // Productos
    PRODUCTS: '/products',
    PRODUCTS_BY_BUSINESS: (businessId: string) => `/businesses/${businessId}/products`,
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,

    // Ubicaciones
    COUNTRIES: '/locations/countries',
    PROVINCES: '/locations/provinces',
    PROVINCES_BY_COUNTRY: (countryId: string) => `/locations/countries/${countryId}/provinces`,
    MUNICIPALITIES: '/locations/municipalities',
    MUNICIPALITIES_BY_PROVINCE: (provinceId: string) => `/locations/provinces/${provinceId}/municipalities`,

    // Usuarios
    USER_PROFILE: '/user/profile',
    USER_LOGIN: '/auth/login',
    USER_REGISTER: '/auth/register',
    USER_LOGOUT: '/auth/logout',

    // Reseñas
    REVIEWS: '/reviews',
    REVIEWS_BY_BUSINESS: (businessId: string) => `/businesses/${businessId}/reviews`,

    // Búsqueda
    SEARCH: '/search',
};

// Caché de respuestas de la API
interface CacheItem {
    data: any;
    timestamp: number;
}

const apiCache: Record<string, CacheItem> = {};

/**
 * Obtiene un elemento del caché si está disponible y no ha expirado
 * @param key Clave del caché
 * @returns Datos del caché o null si no existe o ha expirado
 */
export const getCachedData = (key: string): any => {
    const item = apiCache[key];
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > API_CONFIG.CACHE_TIME) {
        // La caché ha expirado
        delete apiCache[key];
        return null;
    }

    return item.data;
};

/**
 * Guarda datos en el caché
 * @param key Clave del caché
 * @param data Datos a guardar
 */
export const setCachedData = (key: string, data: any): void => {
    apiCache[key] = {
        data,
        timestamp: Date.now()
    };
};

/**
 * Limpia todo el caché o una clave específica
 * @param key Clave específica a limpiar (opcional)
 */
export const clearCache = (key?: string): void => {
    if (key) {
        delete apiCache[key];
    } else {
        Object.keys(apiCache).forEach(k => delete apiCache[k]);
    }
};

// Sistema de rate limiting para evitar exceder límites del servidor
class RateLimiter {
    private requestTimestamps: number[] = [];

    /**
     * Verifica si se puede realizar una nueva solicitud
     * @returns true si se permite la solicitud, false si se debe limitar
     */
    canMakeRequest(): boolean {
        const now = Date.now();
        // Eliminar timestamps antiguos fuera de la ventana de seguimiento
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < API_CONFIG.RATE_LIMIT.REQUESTS_TRACKING_WINDOW
        );

        // Verificar si estamos dentro del límite
        if (this.requestTimestamps.length < API_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
            this.requestTimestamps.push(now);
            return true;
        }

        return false;
    }

    /**
     * Calcular tiempo de espera hasta la próxima solicitud permitida
     * @returns Tiempo en ms hasta que se permita la próxima solicitud
     */
    getTimeUntilNextAllowedRequest(): number {
        if (this.requestTimestamps.length === 0) return 0;

        const now = Date.now();
        const oldestTimestamp = this.requestTimestamps[0];
        return Math.max(0, API_CONFIG.RATE_LIMIT.REQUESTS_TRACKING_WINDOW - (now - oldestTimestamp));
    }
}

// Instancia única del rate limiter
export const apiRateLimiter = new RateLimiter();

/**
 * Calcula el tiempo de espera para un reintento usando backoff exponencial con jitter
 * @param attempt Número de intento
 * @returns Tiempo de espera en milisegundos
 */
export const getRetryDelay = (attempt: number): number => {
    const baseDelay = API_CONFIG.RETRY.RETRY_DELAY;
    const exponentialDelay = baseDelay * Math.pow(API_CONFIG.RETRY.BACKOFF_FACTOR, attempt);
    // Añadir jitter aleatorio para evitar "thundering herd"
    const jitter = Math.random() * API_CONFIG.RETRY.JITTER;
    return exponentialDelay + jitter;
};

// Estado global de carga de la API
let isLoadingCounter = 0;

export const apiLoadingState = {
    /**
     * Incrementa el contador de carga
     */
    startLoading: () => {
        isLoadingCounter++;
    },

    /**
     * Decrementa el contador de carga
     */
    stopLoading: () => {
        if (isLoadingCounter > 0) {
            isLoadingCounter--;
        }
    },

    /**
     * Verifica si hay operaciones de API en curso
     */
    isLoading: () => isLoadingCounter > 0
};