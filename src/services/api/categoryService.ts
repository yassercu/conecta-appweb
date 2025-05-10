import { httpClient } from './httpClient';
import { ENDPOINTS } from '@/config/api';

/**
 * Interfaz para categorías
 */
export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

/**
 * Servicio para gestionar las operaciones relacionadas con categorías
 */
export const categoryService = {
    /**
     * Obtiene todas las categorías
     */
    async getAllCategories(): Promise<Category[]> {
        return httpClient.get<Category[]>(ENDPOINTS.CATEGORIES);
    },

    /**
     * Obtiene una categoría por su ID
     * @param id ID de la categoría
     */
    async getCategoryById(id: string): Promise<Category> {
        return httpClient.get<Category>(ENDPOINTS.CATEGORY_BY_ID(id));
    },

    /**
     * Crea una nueva categoría
     * @param category Datos de la categoría
     */
    async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
        return httpClient.post<Category>(ENDPOINTS.CATEGORIES, category);
    },

    /**
     * Actualiza una categoría existente
     * @param id ID de la categoría
     * @param category Datos actualizados
     */
    async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
        return httpClient.put<Category>(ENDPOINTS.CATEGORY_BY_ID(id), category);
    },

    /**
     * Elimina una categoría
     * @param id ID de la categoría
     */
    async deleteCategory(id: string): Promise<void> {
        await httpClient.delete(ENDPOINTS.CATEGORY_BY_ID(id));
    }
}; 