/**
 * DEPRECATED: Este archivo está obsoleto. 
 * Por favor utiliza la configuración centralizada en src/config/api.ts
 */

// Re-exportar desde la configuración centralizada para mantener compatibilidad
export * from '@/config/api';

// Mostrar advertencia de uso
console.warn(
    'ADVERTENCIA: El archivo src/services/api/config.ts está obsoleto. ' +
    'Por favor actualiza las importaciones para usar src/config/api.ts'
); 