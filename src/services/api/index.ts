/**
 * Índice del módulo de servicios de API
 * 
 * Este archivo reexporta todos los servicios de API y tipos relacionados.
 */

// Exportar servicios
export { businessService } from './businessService';
export { categoryService } from './categoryService';
export { locationService } from './locationService';

// Exportar cliente HTTP
export { httpClient, ApiError } from './httpClient';

// Exportar tipos
export type { BusinessFilters } from './businessService';
export type { Category } from './categoryService';
export type { Country, Province, Municipality } from './locationService';

// Configuración centralizada importada desde /config/api.ts
export {
    API_URL,
    API_CONFIG,
    ENDPOINTS,
    DEFAULT_FETCH_OPTIONS
} from '@/config/api'; 