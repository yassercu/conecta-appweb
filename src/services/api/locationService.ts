import { httpClient } from './httpClient';
import { ENDPOINTS } from '@/config/api';

/**
 * Interfaz para países
 */
export interface Country {
    id: string;
    name: string;
    code: string;
}

/**
 * Interfaz para provincias
 */
export interface Province {
    id: string;
    name: string;
    countryId: string;
}

/**
 * Interfaz para municipios
 */
export interface Municipality {
    id: string;
    name: string;
    provinceId: string;
}

/**
 * Servicio para gestionar las operaciones relacionadas con ubicaciones
 */
export const locationService = {
    /**
     * Obtiene todos los países
     */
    async getAllCountries(): Promise<Country[]> {
        return httpClient.get<Country[]>(ENDPOINTS.COUNTRIES);
    },

    /**
     * Obtiene todas las provincias
     */
    async getAllProvinces(): Promise<Province[]> {
        return httpClient.get<Province[]>(ENDPOINTS.PROVINCES);
    },

    /**
     * Obtiene todas las provincias de un país
     * @param countryId ID del país
     */
    async getProvincesByCountry(countryId: string): Promise<Province[]> {
        return httpClient.get<Province[]>(ENDPOINTS.PROVINCES_BY_COUNTRY(countryId));
    },

    /**
     * Obtiene todos los municipios
     */
    async getAllMunicipalities(): Promise<Municipality[]> {
        return httpClient.get<Municipality[]>(ENDPOINTS.MUNICIPALITIES);
    },

    /**
     * Obtiene todos los municipios de una provincia
     * @param provinceId ID de la provincia
     */
    async getMunicipalitiesByProvince(provinceId: string): Promise<Municipality[]> {
        return httpClient.get<Municipality[]>(ENDPOINTS.MUNICIPALITIES_BY_PROVINCE(provinceId));
    },

    /**
     * Obtiene una dirección a partir de coordenadas (geocodificación inversa)
     * @param latitude Latitud
     * @param longitude Longitud
     */
    async getAddressFromCoordinates(latitude: number, longitude: number): Promise<{
        address: string;
        city: string;
        province: string;
        country: string;
    } | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
                return {
                    address: data.display_name || '',
                    city: data.address.city || data.address.town || data.address.village || '',
                    province: data.address.state || '',
                    country: data.address.country || '',
                };
            }
            return null;
        } catch (error) {
            console.error("Error al obtener dirección:", error);
            return null;
        }
    },

    /**
     * Obtiene coordenadas a partir de una dirección (geocodificación)
     * @param address Dirección a buscar
     */
    async getCoordinatesFromAddress(address: string): Promise<{
        latitude: number;
        longitude: number;
        display: string;
    } | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                    display: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error("Error al buscar coordenadas para dirección:", error);
            return null;
        }
    }
}; 