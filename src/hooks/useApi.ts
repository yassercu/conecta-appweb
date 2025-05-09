/**
 * Hook para utilizar el servicio API en componentes React
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/apiService';
import { ApiError } from '@/services/api/httpClient';

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
        useCache,
        cacheKey,
        forceRefresh
    } = options;

    // Estado de la solicitud
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    // Función para ejecutar la solicitud API con reintentos
    const execute = useCallback(async (...args: P) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

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

                setState({ data: result, loading: false, error: null });

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

        // Si llegamos aquí, se agotaron los reintentos o es un error diferente a timeout
        setState({ data: null, loading: false, error: lastError });

        if (onError && lastError) {
            onError(lastError);
        }

        throw lastError;
    }, [apiFunction, params, onSuccess, onError]);

    // Función para recargar los datos
    const refresh = useCallback(() => {
        return execute(...params);
    }, [execute, params]);

    // Cargar datos automáticamente a menos que se indique lo contrario
    useEffect(() => {
        if (!skip) {
            // Envolvemos en un callback inmediato para proteger contra cambios de referencia
            (async () => {
                try {
                    await execute(...params);
                } catch (error) {
                    // Error ya manejado por execute
                    console.log('Error capturado en useEffect:', (error as Error).message);
                }
            })();
        }
        // Dependencias estables: evitar re-ejecución cuando params no cambia realmente
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, execute]);

    return {
        ...state,
        execute,
        refresh,
        // Exponer funciones útiles del servicio API
        clearCache: apiService.cache.clear
    };
}

/**
 * Hook para utilizar el servicio de negocios
 */
export function useBusinesses(options: UseApiOptions = {}) {
    return useApi(apiService.businesses.getAll, [], options);
}

/**
 * Hook para obtener un negocio por ID
 */
export function useBusiness(id: string, options: UseApiOptions = {}) {
    return useApi(apiService.businesses.getById, [id], options);
}

/**
 * Hook para obtener negocios destacados
 */
export function useFeaturedBusinesses(options: UseApiOptions = {}) {
    return useApi(apiService.businesses.getFeatured, [], options);
}

/**
 * Hook para obtener negocios promocionados
 */
export function usePromotedBusinesses(options: UseApiOptions = {}) {
    return useApi(apiService.businesses.getPromoted, [], options);
}

/**
 * Hook para buscar negocios con filtros
 */
export function useBusinessSearch(filters: any, options: UseApiOptions = {}) {
    return useApi(apiService.businesses.search, [filters], {
        ...options,
        // No cachear búsquedas por defecto
        useCache: options.useCache ?? false
    });
}

/**
 * Hook para utilizar el servicio de categorías
 */
export function useCategories(options: UseApiOptions = {}) {
    return useApi(apiService.categories.getAll, [], options);
}

/**
 * Hook para obtener una categoría por ID
 */
export function useCategory(id: string, options: UseApiOptions = {}) {
    return useApi(apiService.categories.getById, [id], options);
}

/**
 * Hook para obtener todos los países
 */
export function useCountries(options: UseApiOptions = {}) {
    return useApi(apiService.locations.getCountries, [], options);
}

/**
 * Hook para obtener todas las provincias
 */
export function useProvinces(options: UseApiOptions = {}) {
    return useApi(apiService.locations.getProvinces, [], options);
}

/**
 * Hook para obtener provincias por país
 */
export function useProvincesByCountry(countryId: string, options: UseApiOptions = {}) {
    return useApi(apiService.locations.getProvincesByCountry, [countryId], options);
}

/**
 * Hook para obtener todos los municipios
 */
export function useMunicipalities(options: UseApiOptions = {}) {
    return useApi(apiService.locations.getMunicipalities, [], options);
}

/**
 * Hook para obtener municipios por provincia
 */
export function useMunicipalitiesByProvince(provinceId: string, options: UseApiOptions = {}) {
    return useApi(apiService.locations.getMunicipalitiesByProvince, [provinceId], options);
}

// Exportar hook principal y funciones auxiliares
export { apiService };
export default useApi; 