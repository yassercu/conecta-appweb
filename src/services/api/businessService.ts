import { httpClient } from './httpClient';
import { ENDPOINTS } from '@/config/api';
import type { Business } from '@/types/business';

/**
 * Parámetros para filtrar negocios
 */
export interface BusinessFilters {
    query?: string;
    category?: string;
    rating?: string;
    distance?: string;
    userLocation?: {
        latitude: number;
        longitude: number;
    };
    sortBy?: string;
    page?: number;
    limit?: number;
}

/**
 * Servicio para gestionar las operaciones relacionadas con negocios
 */
export const businessService = {
    /**
     * Obtiene todos los negocios
     */
    async getAllBusinesses(): Promise<Business[]> {
        return httpClient.get<Business[]>(ENDPOINTS.BUSINESSES);
    },

    /**
     * Obtiene un negocio por su ID
     * @param id ID del negocio
     */
    async getBusinessById(id: string): Promise<Business> {
        return httpClient.get<Business>(ENDPOINTS.BUSINESS_BY_ID(id));
    },

    /**
     * Obtiene negocios destacados
     */
    async getFeaturedBusinesses(): Promise<Business[]> {
        return httpClient.get<Business[]>(ENDPOINTS.FEATURED_BUSINESSES);
    },

    /**
     * Obtiene negocios promocionados
     */
    async getPromotedBusinesses(): Promise<Business[]> {
        return httpClient.get<Business[]>(ENDPOINTS.PROMOTED_BUSINESSES);
    },

    /**
     * Busca negocios con filtros
     * @param filters Filtros para la búsqueda
     */
    async searchBusinesses(filters: BusinessFilters): Promise<{
        businesses: Business[];
        totalCount: number;
        page: number;
        totalPages: number;
    }> {
        // Construir query string con los filtros
        const queryParams = new URLSearchParams();

        if (filters.query) queryParams.append('query', filters.query);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.rating) queryParams.append('rating', filters.rating);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());

        // Añadir parámetros de ubicación y distancia si están disponibles
        if (filters.distance && filters.distance !== '0' && filters.userLocation) {
            queryParams.append('distance', filters.distance);
            queryParams.append('latitude', filters.userLocation.latitude.toString());
            queryParams.append('longitude', filters.userLocation.longitude.toString());
        }

        const url = `${ENDPOINTS.SEARCH}?${queryParams.toString()}`;
        return httpClient.get<{
            businesses: Business[];
            totalCount: number;
            page: number;
            totalPages: number;
        }>(url);
    },

    /**
     * Crea un nuevo negocio
     * @param business Datos del negocio
     */
    async createBusiness(business: Omit<Business, 'id'>): Promise<Business> {
        return httpClient.post<Business>(ENDPOINTS.BUSINESSES, business);
    },

    /**
     * Actualiza un negocio existente
     * @param id ID del negocio
     * @param business Datos actualizados
     */
    async updateBusiness(id: string, business: Partial<Business>): Promise<Business> {
        return httpClient.put<Business>(ENDPOINTS.BUSINESS_BY_ID(id), business);
    },

    /**
     * Elimina un negocio
     * @param id ID del negocio
     */
    async deleteBusiness(id: string): Promise<void> {
        await httpClient.delete(ENDPOINTS.BUSINESS_BY_ID(id));
    }
}; 