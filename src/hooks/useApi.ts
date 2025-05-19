/**
 * Hook para utilizar el servicio API en componentes React
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiService from '@/services/apiService';
import { ApiError } from '@/services/api/httpClient';
import type { ApiRequestOptions, BusinessFilters, Business, BusinessSearchResult } from '@/services/apiService'; // Asumiendo que estos tipos existen y son exportados

// Definiciones de tipo placeholder si no se pueden importar (idealmente deben importarse)
// type ApiRequestOptions = any; // Ya importado
// type BusinessFilters = any; // Ya importado
// type Business = any; // BusinessSearchResult lo define

// Cache de tiempo de vida de página para reducir peticiones entre navegaciones
const PAGE_LIFETIME_CACHE = new Map();

// Referencia estable para un array vacío tipado, para funciones API sin argumentos explícitos
const EMPTY_PARAMS: readonly [] = [] as const;

/**
 * Tipo para el estado de la solicitud API
 */
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Opciones para el hook useApi
 */
interface UseApiOptions {
    skip?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    useCache?: boolean;
    cacheKey?: string;
    forceRefresh?: boolean;
    // Nueva opción para usar caché de tiempo de vida de página
    usePageCache?: boolean;
    // Tiempo de expiración de caché (en ms)
    cacheExpiration?: number;
}

/**
 * Hook personalizado para usar el servicio API
 * @param apiFunction Función del servicio API a ejecutar
 * @param params Parámetros para la función de API
 * @param options Opciones adicionales
 * @returns Estado de la solicitud y funciones para manejarla
 */
function useApi<T, P extends any[]>(
    apiFunction: (...args: P) => Promise<T>,
    params: P = [] as unknown as P,
    options: UseApiOptions = {}
) {
    const {
        skip = false,
        onSuccess,
        onError,
        useCache = true,
        cacheKey,
        forceRefresh = false,
        usePageCache = true,
        cacheExpiration = 5 * 60 * 1000 // 5 minutos por defecto
    } = options;

    // Estado de la solicitud
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    // Referencia para evitar actualizaciones de estado en componentes desmontados
    const mounted = useRef(true);
    
    // Referencia para rastrear el momento de la última petición
    const lastFetchTime = useRef<number | null>(null);

    // Registrar montaje/desmontaje del componente
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // Verificar caché de tiempo de vida de página primero
    useEffect(() => {
        if (skip || forceRefresh || !usePageCache || !cacheKey) return;
        
        const cachedData = PAGE_LIFETIME_CACHE.get(cacheKey);
        if (cachedData) {
            const { data, timestamp } = cachedData;
            
            // Verificar si el caché ha expirado
            const now = Date.now();
            if (now - timestamp < cacheExpiration) {
                console.log(`Usando datos en caché de página para: ${cacheKey}`);
                if (mounted.current) {
                    setState({ data, loading: false, error: null });
                    if (onSuccess) onSuccess(data);
                }
            } else {
                // Caché expirado, eliminarlo
                PAGE_LIFETIME_CACHE.delete(cacheKey);
            }
        }
    }, [cacheKey, skip, forceRefresh, usePageCache, onSuccess, cacheExpiration]);

    // Función para ejecutar la solicitud API con reintentos
    const execute = useCallback(async (...args: P) => {
        // No actualizar el estado si el componente está desmontado
        if (!mounted.current) return null;
        
        // Si tenemos un cacheKey, verificar si ya hemos hecho una petición reciente
        if (cacheKey && usePageCache && lastFetchTime.current) {
            const now = Date.now();
            const timeSinceLastFetch = now - lastFetchTime.current;
            
            // Si han pasado menos de 2 segundos desde la última petición y tenemos datos en caché
            if (timeSinceLastFetch < 2000 && PAGE_LIFETIME_CACHE.has(cacheKey)) {
                console.log(`Petición descartada (muy reciente): ${cacheKey}`);
                return PAGE_LIFETIME_CACHE.get(cacheKey).data;
            }
        }
        
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Registrar el momento de la petición
        lastFetchTime.current = Date.now();

        // Configuración de reintentos
        const maxRetries = 2;
        let retries = 0;
        let lastError: Error | null = null;

        while (retries <= maxRetries) {
            try {
                const apiParams = args.length > 0 ? args : params;

                // Si estamos reintentando, mostrar mensaje
                if (retries > 0) {
                    console.log(`Reintentando petición (${retries}/${maxRetries})...`);
                }

                const result = await apiFunction(...apiParams);

                // No actualizar el estado si el componente está desmontado
                if (!mounted.current) return result;

                setState({ data: result, loading: false, error: null });

                // Guardar en caché de tiempo de vida de página
                if (cacheKey && usePageCache) {
                    PAGE_LIFETIME_CACHE.set(cacheKey, { 
                        data: result, 
                        timestamp: Date.now() 
                    });
                }

                if (onSuccess) {
                    onSuccess(result);
                }

                return result;
            } catch (error) {
                lastError = error instanceof ApiError
                    ? error
                    : new Error((error as Error)?.message || 'Error desconocido');

                // Solo reintentar en caso de timeout o errores de red
                if (error instanceof ApiError && error.statusCode === 408) {
                    retries++;
                    if (retries <= maxRetries) {
                        // Esperar antes de reintentar (backoff exponencial)
                        const delay = Math.min(1000 * Math.pow(2, retries - 1), 4000);
                        console.log(`Error de timeout, esperando ${delay}ms antes de reintentar...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                } else {
                    // Para otros errores, no reintentar
                    break;
                }
            }
        }

        // No actualizar el estado si el componente está desmontado
        if (!mounted.current) return null;
        
        setState({ data: null, loading: false, error: lastError });

        if (onError && lastError) {
            onError(lastError);
        }

        throw lastError;
    }, [apiFunction, params, onSuccess, onError, cacheKey, usePageCache]);

    // Función para recargar los datos
    const refresh = useCallback(() => {
        return execute(...params);
    }, [execute, params]);

    // Función para limpiar un elemento específico de la caché de página
    const clearPageCache = useCallback((key?: string) => {
        if (key) {
            PAGE_LIFETIME_CACHE.delete(key);
        } else if (cacheKey) {
            PAGE_LIFETIME_CACHE.delete(cacheKey);
        }
    }, [cacheKey]);

    // Cargar datos automáticamente a menos que se indique lo contrario
    useEffect(() => {
        // Si se debe omitir la carga, no hacer nada
        if (skip) return;
        
        // Si hay datos en caché de página, no hacer petición
        if (usePageCache && cacheKey && PAGE_LIFETIME_CACHE.has(cacheKey) && !forceRefresh) {
            const { data, timestamp } = PAGE_LIFETIME_CACHE.get(cacheKey);
            const now = Date.now();
            
            // Si el caché aún es válido, usarlo
            if (now - timestamp < cacheExpiration) {
                console.log(`useEffect: Usando datos en caché de página para: ${cacheKey}`);
                setState({ data, loading: false, error: null });
                if (onSuccess) onSuccess(data);
                return;
            } else {
                // Caché expirado, eliminarlo
                PAGE_LIFETIME_CACHE.delete(cacheKey);
            }
        }
        
            // Envolvemos en un callback inmediato para proteger contra cambios de referencia
            (async () => {
                try {
                    await execute(...params);
                } catch (error) {
                    // Error ya manejado por execute
                    console.log('Error capturado en useEffect:', (error as Error).message);
                }
            })();
        // Dependencias estables: evitar re-ejecución cuando params no cambia realmente
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, execute, forceRefresh]);

    return {
        ...state,
        execute,
        refresh,
        clearPageCache,
        // Exponer funciones útiles del servicio API
        clearApiCache: apiService.cache.clear
    };
}

/**
 * Hook para utilizar el servicio de negocios
 */
export function useBusinesses(options: UseApiOptions = {}) {
    return useApi(apiService.businesses.getAll, [], {
        cacheKey: 'businesses:all', // Añadir cacheKey por defecto
        ...options
    });
}

/**
 * Hook para obtener un negocio por ID
 */
export function useBusiness(id: string, options: UseApiOptions = {}) {
    const params = useMemo(() => [id, undefined] as [string, ApiRequestOptions?], [id]);
    return useApi(apiService.businesses.getById, params, options);
}

/**
 * Hook para obtener negocios destacados
 */
export function useFeaturedBusinesses(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    return useApi(apiService.businesses.getFeatured, params, {
        usePageCache: true,
        cacheExpiration: 10 * 60 * 1000, // 10 minutos
        cacheKey: 'businesses:featured', // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para obtener negocios promocionados
 */
export function usePromotedBusinesses(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    return useApi(apiService.businesses.getPromoted, params, {
        usePageCache: true,
        cacheExpiration: 10 * 60 * 1000, // 10 minutos
        cacheKey: 'businesses:promoted', // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para buscar negocios con filtros
 */
export function useBusinessSearch(filters?: BusinessFilters, options: UseApiOptions = {}) {
    const safeFilters = useMemo(() => filters || { query: '', category: 'Todas', rating: '0', sortBy: 'rating' }, [filters]);
    
    const apiCallParams = useMemo(() => [safeFilters, undefined] as [BusinessFilters, ApiRequestOptions?], [safeFilters]);

    const isEmptyFilter = !safeFilters.query && 
                         safeFilters.category === 'Todas' && 
                         safeFilters.rating === '0';
    const shouldSkip = options.skip || isEmptyFilter;
    
    const apiCall = useApi<BusinessSearchResult, [BusinessFilters, ApiRequestOptions?] >(
        apiService.businesses.search, 
        apiCallParams, 
        {
        ...options,
            skip: shouldSkip,
        // No cachear búsquedas por defecto
            useCache: options.useCache ?? false,
            usePageCache: options.usePageCache ?? false,
            // Manejar errores específicos de búsqueda si es necesario
            onError: (error) => {
                console.error("Error en búsqueda de negocios:", error);
                if (options.onError) options.onError(error);
            }
        }
    );
    
    return {
        ...apiCall,
        // Exponer apiService para uso directo - aplanar la estructura para facilitar acceso
        apiService
    };
}

/**
 * Hook para utilizar el servicio de categorías
 */
export function useCategories(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    const result = useApi(apiService.categories.getAll, params, {
        usePageCache: true,
        cacheExpiration: 30 * 60 * 1000, // 30 minutos para categorías (cambian poco)
        cacheKey: 'categories:all', // Asegurar que el cacheKey se pasa
        ...options
    });
    
    // Procesar las categorías para devolver un formato utilizable
    const processedData = result.data 
        ? result.data.map((cat: any) => 
            // Si es un objeto con propiedad name, usar esa propiedad
            typeof cat === 'object' && cat !== null && 'name' in cat 
                ? cat.name 
                : cat
          )
        : ['Todas'];
    
    return {
        ...result,
        data: processedData
    };
}

/**
 * Hook para obtener una categoría por ID
 */
export function useCategory(id: string, options: UseApiOptions = {}) {
    const params = useMemo(() => [id, undefined] as [string, ApiRequestOptions?], [id]);
    return useApi(apiService.categories.getById, params, options);
}

/**
 * Hook para obtener todos los países
 */
export function useCountries(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    return useApi(apiService.locations.getCountries, params, {
        usePageCache: true,
        cacheExpiration: 60 * 60 * 1000, // 1 hora para datos geográficos
        cacheKey: 'locations:countries', // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para obtener todas las provincias
 */
export function useProvinces(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    return useApi(apiService.locations.getProvinces, params, {
        usePageCache: true,
        cacheExpiration: 60 * 60 * 1000, // 1 hora
        cacheKey: 'locations:provinces', // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para obtener provincias por país
 */
export function useProvincesByCountry(countryId: string, options: UseApiOptions = {}) {
    const params = useMemo(() => [countryId, undefined] as [string, ApiRequestOptions?], [countryId]);
    return useApi(apiService.locations.getProvincesByCountry, params, {
        usePageCache: true,
        cacheExpiration: 60 * 60 * 1000, // 1 hora
        cacheKey: `locations:provinces:${countryId}`, // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para obtener todos los municipios
 */
export function useMunicipalities(options: UseApiOptions = {}) {
    const params = useMemo(() => [undefined] as [ApiRequestOptions?], []);
    return useApi(apiService.locations.getMunicipalities, params, {
        usePageCache: true,
        cacheExpiration: 60 * 60 * 1000, // 1 hora
        cacheKey: 'locations:municipalities', // Asegurar que el cacheKey se pasa
        ...options
    });
}

/**
 * Hook para obtener municipios por provincia
 */
export function useMunicipalitiesByProvince(provinceId: string, options: UseApiOptions = {}) {
    const params = useMemo(() => [provinceId, undefined] as [string, ApiRequestOptions?], [provinceId]);
    return useApi(apiService.locations.getMunicipalitiesByProvince, params, {
        usePageCache: true,
        cacheExpiration: 60 * 60 * 1000, // 1 hora
        cacheKey: `locations:municipalities:${provinceId}`, // Asegurar que el cacheKey se pasa
        ...options
    });
}

// Exportar hook principal y funciones auxiliares
export { apiService };
export default useApi;
