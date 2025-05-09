/**
 * Servicio centralizado para la API de Orbita-Y
 * 
 * Este servicio proporciona un punto único de acceso a todos los servicios de API
 * y gestiona aspectos como caché, estados de carga y errores.
 */

import {
    businessService, categoryService, locationService,
    type BusinessFilters, type Category, type Country, type Province, type Municipality
} from './api';
import {
    getCachedData, setCachedData, clearCache,
    apiLoadingState, API_URL, ENDPOINTS
} from '@/config/api';
import { ApiError } from './api/httpClient';

/**
 * Tipo para las opciones de solicitud a la API
 */
interface ApiRequestOptions {
    useCache?: boolean;
    cacheKey?: string;
    forceRefresh?: boolean;
}

/**
 * Servicio centralizado para la API de Orbita-Y
 */
const apiService = {
    /**
     * URL base de la API
     */
    apiUrl: API_URL,

    /**
     * Estados de carga
     */
    loading: apiLoadingState,

    /**
     * Gestión de caché
     */
    cache: {
        get: getCachedData,
        set: setCachedData,
        clear: clearCache
    },

    /**
     * Ejecuta una función de API con gestión de caché y estados de carga
     * @param fn Función a ejecutar
     * @param options Opciones para la solicitud
     * @returns Resultado de la función
     */
    async execute<T>(
        fn: () => Promise<T>,
        options: ApiRequestOptions = { useCache: true }
    ): Promise<T> {
        const { useCache = true, cacheKey, forceRefresh = false } = options;

        // Verificar caché si está habilitada y no se fuerza refresco
        if (useCache && cacheKey && !forceRefresh) {
            const cachedData = getCachedData(cacheKey);
            if (cachedData) return cachedData;
        }

        try {
            // Iniciar estado de carga
            apiLoadingState.startLoading();

            // Ejecutar función de API
            const result = await fn();

            // Guardar en caché si está habilitada
            if (useCache && cacheKey) {
                setCachedData(cacheKey, result);
            }

            return result;
        } catch (error) {
            // Relanzar el error para que lo manejen los componentes
            throw error instanceof ApiError
                ? error
                : new ApiError(500, (error as Error).message || 'Error inesperado');
        } finally {
            // Finalizar estado de carga
            apiLoadingState.stopLoading();
        }
    },

    /**
     * Servicios de negocios
     */
    businesses: {
        /**
         * Obtiene todos los negocios
         */
        getAll: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => businessService.getAllBusinesses(),
                { ...options, cacheKey: options.cacheKey || 'businesses:all' }
            );
        },

        /**
         * Obtiene un negocio por su ID
         * @param id ID del negocio
         */
        getById: async (id: string, options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => businessService.getBusinessById(id),
                { ...options, cacheKey: options.cacheKey || `businesses:${id}` }
            );
        },

        /**
         * Obtiene negocios destacados
         */
        getFeatured: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => businessService.getFeaturedBusinesses(),
                { ...options, cacheKey: options.cacheKey || 'businesses:featured' }
            );
        },

        /**
         * Obtiene negocios promocionados
         */
        getPromoted: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => businessService.getPromotedBusinesses(),
                { ...options, cacheKey: options.cacheKey || 'businesses:promoted' }
            );
        },

        /**
         * Busca negocios con filtros
         * @param filters Filtros para la búsqueda
         */
        search: async (filters: BusinessFilters, options: ApiRequestOptions = {}) => {
            // Las búsquedas generalmente no se cachean por defecto
            return apiService.execute(
                () => businessService.searchBusinesses(filters),
                { ...options, useCache: options.useCache ?? false }
            );
        },

        /**
         * Crea un nuevo negocio
         * @param business Datos del negocio
         */
        create: async (business: any) => {
            const result = await apiService.execute(
                () => businessService.createBusiness(business),
                { useCache: false }
            );

            // Limpiar caché relacionada con negocios tras crear uno nuevo
            clearCache('businesses:all');
            clearCache('businesses:featured');
            clearCache('businesses:promoted');

            return result;
        },

        /**
         * Actualiza un negocio existente
         * @param id ID del negocio
         * @param business Datos actualizados
         */
        update: async (id: string, business: any) => {
            const result = await apiService.execute(
                () => businessService.updateBusiness(id, business),
                { useCache: false }
            );

            // Limpiar caché del negocio actualizado
            clearCache(`businesses:${id}`);
            clearCache('businesses:all');
            clearCache('businesses:featured');
            clearCache('businesses:promoted');

            return result;
        },

        /**
         * Elimina un negocio
         * @param id ID del negocio
         */
        delete: async (id: string) => {
            await apiService.execute(
                () => businessService.deleteBusiness(id),
                { useCache: false }
            );

            // Limpiar caché del negocio eliminado
            clearCache(`businesses:${id}`);
            clearCache('businesses:all');
            clearCache('businesses:featured');
            clearCache('businesses:promoted');
        }
    },

    /**
     * Servicios de categorías
     */
    categories: {
        /**
         * Obtiene todas las categorías
         */
        getAll: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => categoryService.getAllCategories(),
                { ...options, cacheKey: options.cacheKey || 'categories:all' }
            );
        },

        /**
         * Obtiene una categoría por su ID
         * @param id ID de la categoría
         */
        getById: async (id: string, options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => categoryService.getCategoryById(id),
                { ...options, cacheKey: options.cacheKey || `categories:${id}` }
            );
        }
    },

    /**
     * Servicios de ubicaciones
     */
    locations: {
        /**
         * Obtiene todos los países
         */
        getCountries: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => locationService.getAllCountries(),
                { ...options, cacheKey: options.cacheKey || 'locations:countries' }
            );
        },

        /**
         * Obtiene todas las provincias
         */
        getProvinces: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => locationService.getAllProvinces(),
                { ...options, cacheKey: options.cacheKey || 'locations:provinces' }
            );
        },

        /**
         * Obtiene provincias por país
         * @param countryId ID del país
         */
        getProvincesByCountry: async (countryId: string, options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => locationService.getProvincesByCountry(countryId),
                { ...options, cacheKey: options.cacheKey || `locations:provinces:${countryId}` }
            );
        },

        /**
         * Obtiene todos los municipios
         */
        getMunicipalities: async (options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => locationService.getAllMunicipalities(),
                { ...options, cacheKey: options.cacheKey || 'locations:municipalities' }
            );
        },

        /**
         * Obtiene municipios por provincia
         * @param provinceId ID de la provincia
         */
        getMunicipalitiesByProvince: async (provinceId: string, options: ApiRequestOptions = {}) => {
            return apiService.execute(
                () => locationService.getMunicipalitiesByProvince(provinceId),
                { ...options, cacheKey: options.cacheKey || `locations:municipalities:${provinceId}` }
            );
        },

        /**
         * Obtiene dirección a partir de coordenadas
         * @param latitude Latitud
         * @param longitude Longitud
         */
        getAddressFromCoordinates: async (latitude: number, longitude: number) => {
            return apiService.execute(
                () => locationService.getAddressFromCoordinates(latitude, longitude),
                { useCache: false } // No cachear resultados de geocodificación
            );
        },

        /**
         * Obtiene coordenadas a partir de una dirección
         * @param address Dirección
         */
        getCoordinatesFromAddress: async (address: string) => {
            return apiService.execute(
                () => locationService.getCoordinatesFromAddress(address),
                { useCache: false } // No cachear resultados de geocodificación
            );
        }
    }
};

export default apiService; 