import { API_URL, API_CONFIG, DEFAULT_FETCH_OPTIONS } from '@/config/api';

/**
 * Cliente HTTP para realizar peticiones a la API
 */
class HttpClient {
    /**
     * Realiza una petición GET
     * @param endpoint Endpoint de la API
     * @param options Opciones adicionales para fetch
     * @returns Promise con la respuesta procesada
     */
    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            ...options,
        });
    }

    /**
     * Realiza una petición POST
     * @param endpoint Endpoint de la API
     * @param data Datos a enviar en el body
     * @param options Opciones adicionales para fetch
     * @returns Promise con la respuesta procesada
     */
    async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }

    /**
     * Realiza una petición PUT
     * @param endpoint Endpoint de la API
     * @param data Datos a enviar en el body
     * @param options Opciones adicionales para fetch
     * @returns Promise con la respuesta procesada
     */
    async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    /**
     * Realiza una petición PATCH
     * @param endpoint Endpoint de la API
     * @param data Datos a enviar en el body
     * @param options Opciones adicionales para fetch
     * @returns Promise con la respuesta procesada
     */
    async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options,
        });
    }

    /**
     * Realiza una petición DELETE
     * @param endpoint Endpoint de la API
     * @param options Opciones adicionales para fetch
     * @returns Promise con la respuesta procesada
     */
    async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }

    /**
     * Método base para realizar peticiones HTTP
     * @param endpoint Endpoint de la API
     * @param options Opciones para fetch
     * @returns Promise con la respuesta procesada
     */
    private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

        // Log para depuración
        console.log(`Realizando petición a: ${url}`);

        // Combinar las opciones por defecto con las proporcionadas
        const fetchOptions: RequestInit = {
            ...DEFAULT_FETCH_OPTIONS,
            ...options,
            headers: {
                ...DEFAULT_FETCH_OPTIONS.headers,
                ...options.headers,
            },
        };

        // Implementación del timeout para la petición
        const controller = new AbortController();
        let timeoutId: NodeJS.Timeout | null = null;

        try {
            // Configurar timeout
            timeoutId = setTimeout(() => {
                console.warn(`Timeout alcanzado para la petición a ${url}`);
                controller.abort();
            }, API_CONFIG.TIMEOUT);

            fetchOptions.signal = controller.signal;

            console.log('Opciones de fetch:', JSON.stringify(fetchOptions));
            const response = await fetch(url, fetchOptions);

            // Limpiar timeout al recibir respuesta
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            // Log para depuración
            console.log(`Respuesta recibida de ${url}:`, response.status);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                console.error(`Error en petición a ${url}:`, errorData);
                throw new ApiError(response.status, errorData.message || 'Error en la petición');
            }

            // Si la respuesta está vacía, devolver un objeto vacío
            if (response.status === 204) {
                return {} as T;
            }

            // Procesar la respuesta como JSON
            const data = await response.json();
            console.log(`Datos recibidos de ${url}:`, data ? 'Datos válidos' : 'Sin datos');
            return data;
        } catch (error) {
            // Limpiar timeout si existe
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (error instanceof ApiError) {
                console.error(`ApiError en petición a ${url}:`, error.message);
                throw error;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                console.error(`Timeout en petición a ${url}`);
                throw new ApiError(408, 'La petición ha excedido el tiempo máximo de espera');
            }

            console.error(`Error inesperado en petición a ${url}:`, error);
            throw new ApiError(500, (error as Error).message || 'Error inesperado');
        }
    }
}

/**
 * Clase personalizada para errores de la API
 */
export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// Exportar una instancia del cliente HTTP
export const httpClient = new HttpClient(); 