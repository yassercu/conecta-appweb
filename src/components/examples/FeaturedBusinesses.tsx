/**
 * Componente de ejemplo que muestra negocios destacados desde la API
 */

import React from 'react';
import { useFeaturedBusinesses } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

const FeaturedBusinesses: React.FC = () => {
    // Usar el hook personalizado para obtener negocios destacados
    const {
        data: businesses,
        loading,
        error,
        refresh,
        clearCache
    } = useFeaturedBusinesses();

    // Manejar refresco de datos con limpieza de caché
    const handleRefresh = () => {
        // Limpiar caché específica
        clearCache('businesses:featured');
        // Ejecutar solicitud nuevamente
        refresh();
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando negocios destacados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
                <Button variant="outline" className="mt-4" onClick={refresh}>
                    Intentar nuevamente
                </Button>
            </div>
        );
    }

    if (!businesses || businesses.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No hay negocios destacados disponibles.</p>
                <Button variant="outline" className="mt-4" onClick={refresh}>
                    Actualizar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Negocios Destacados</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={refresh}>
                        Actualizar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleRefresh}>
                        Forzar Actualización
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {businesses.map((business) => (
                    <div
                        key={business.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                    >
                        <div className="h-48 overflow-hidden">
                            {business.image ? (
                                <img
                                    src={business.image}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/80 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">{business.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold line-clamp-1">{business.name}</h3>
                                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                                    <span className="text-primary text-sm">★</span>
                                    <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{business.category}</p>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                {business.description}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {business.location}
                            </p>

                            <Button variant="default" className="w-full mt-4" asChild>
                                <a href={`/business/${business.id}`}>
                                    Ver detalles
                                </a>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedBusinesses; 