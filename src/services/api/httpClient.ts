import { API_URL, API_CONFIG, DEFAULT_FETCH_OPTIONS, apiRateLimiter, getRetryDelay } from '@/config/api';

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

        // Aplicar rate limiting
        await this.applyRateLimit();

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

        // Implementación de retries con backoff exponencial
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt <= API_CONFIG.RETRY.MAX_RETRIES) {
            // Controlador para el timeout
            const controller = new AbortController();
            let timeoutId: NodeJS.Timeout | null = null;

            try {
                // Si estamos reintentando, mostrar mensaje
                if (attempt > 0) {
                    const delay = getRetryDelay(attempt);
                    console.log(`Reintento ${attempt}/${API_CONFIG.RETRY.MAX_RETRIES} después de ${delay}ms para: ${url}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // Configurar timeout
                timeoutId = setTimeout(() => {
                    console.warn(`Timeout alcanzado para la petición a ${url}`);
                    controller.abort();
                }, API_CONFIG.TIMEOUT);

                fetchOptions.signal = controller.signal;

                console.log(`Intento ${attempt + 1}: Opciones de fetch:`, JSON.stringify(fetchOptions));
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
                    
                    // Si el estado está en la lista de reintentos y no hemos excedido el máximo
                    if (API_CONFIG.RETRY.RETRY_STATUS_CODES.includes(response.status) && 
                        attempt < API_CONFIG.RETRY.MAX_RETRIES) {
                        attempt++;
                        lastError = new ApiError(response.status, errorData.message || 'Error en la petición');
                        continue;
                    }
                    
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

                // Manejar específicamente el caso de ERR_INSUFFICIENT_RESOURCES
                if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    console.error(`Error de recursos insuficientes en petición a ${url}`);
                    
                    // Siempre reintentar en caso de error de recursos insuficientes
                    if (attempt < API_CONFIG.RETRY.MAX_RETRIES) {
                        attempt++;
                        // Usar un delay más largo para estos errores específicos
                        const delay = getRetryDelay(attempt) * 2;
                        console.log(`Esperando ${delay}ms antes de reintentar por error de recursos`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }

                if (error instanceof ApiError) {
                    console.error(`ApiError en petición a ${url}:`, error.message);
                    
                    // Reintentar para ciertos códigos de error
                    if (API_CONFIG.RETRY.RETRY_STATUS_CODES.includes(error.statusCode) && 
                        attempt < API_CONFIG.RETRY.MAX_RETRIES) {
                        attempt++;
                        lastError = error;
                        continue;
                    }
                    
                    throw error;
                }

                if (error instanceof DOMException && error.name === 'AbortError') {
                    console.error(`Timeout en petición a ${url}`);
                    
                    // Reintentar en caso de timeout
                    if (attempt < API_CONFIG.RETRY.MAX_RETRIES) {
                        attempt++;
                        lastError = new ApiError(408, 'La petición ha excedido el tiempo máximo de espera');
                        continue;
                    }
                    
                    throw new ApiError(408, 'La petición ha excedido el tiempo máximo de espera');
                }

                console.error(`Error inesperado en petición a ${url}:`, error);
                
                // Reintentar errores inesperados que pueden ser de red
                if (attempt < API_CONFIG.RETRY.MAX_RETRIES) {
                    attempt++;
                    lastError = error instanceof Error 
                        ? error 
                        : new Error('Error inesperado');
                    continue;
                }
                
                throw new ApiError(500, (error as Error).message || 'Error inesperado');
            }
        }

        // Si llegamos aquí, es porque excedimos los reintentos
        if (lastError) {
            if (lastError instanceof ApiError) {
                throw lastError;
            } else {
                throw new ApiError(500, lastError.message || 'Error tras múltiples reintentos');
            }
        }

        // No deberíamos llegar aquí, pero por si acaso
        throw new ApiError(500, 'Error inesperado después de agotar reintentos');
    }

    /**
     * Aplica rate limiting para no sobrecargar la API
     * @returns Promise que se resuelve cuando se puede realizar la petición
     */
    private async applyRateLimit(): Promise<void> {
        // Si podemos hacer la petición inmediatamente, salimos
        if (apiRateLimiter.canMakeRequest()) {
            return;
        }

        // Si no, calculamos cuánto tiempo esperar
        const waitTime = apiRateLimiter.getTimeUntilNextAllowedRequest();
        console.log(`Rate limit alcanzado. Esperando ${waitTime}ms antes de continuar.`);
        
        // Esperamos el tiempo necesario
        return new Promise(resolve => setTimeout(resolve, waitTime));
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