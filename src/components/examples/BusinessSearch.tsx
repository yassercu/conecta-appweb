/**
 * Componente de ejemplo para buscar negocios con filtros
 */

import React, { useState, useEffect } from 'react';
import { useBusinessSearch, useCategories } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { BusinessFilters } from '@/services/api';

const BusinessSearch: React.FC = () => {
    // Estado para los filtros
    const [filters, setFilters] = useState<BusinessFilters>({
        query: '',
        category: '',
        rating: '',
        distance: '',
        userLocation: undefined,
        sortBy: 'rating',
        page: 1,
        limit: 10
    });

    // Estado para la posición actual del usuario
    const [isLocating, setIsLocating] = useState(false);

    // Obtener categorías para el selector
    const { data: categories, loading: loadingCategories } = useCategories();

    // Ejecutar búsqueda con los filtros actuales
    const {
        data: searchResults,
        loading: loadingSearch,
        error: searchError,
        execute: executeSearch
    } = useBusinessSearch(filters, { skip: true });

    // Manejar cambios en los filtros
    const handleFilterChange = (name: string, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obtener ubicación del usuario para filtrar por distancia
    const getUserLocation = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFilters(prev => ({
                        ...prev,
                        userLocation: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    }));
                    setIsLocating(false);
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error);
                    setIsLocating(false);
                    alert('No se pudo obtener tu ubicación. Por favor, intenta de nuevo o permite el acceso a tu ubicación en la configuración del navegador.');
                }
            );
        } else {
            alert('Tu navegador no soporta geolocalización.');
        }
    };

    // Manejar envío del formulario de búsqueda
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(filters);
    };

    // Cargar página siguiente
    const handleLoadMore = () => {
        if (searchResults && searchResults.page < searchResults.totalPages) {
            const nextPage = searchResults.page + 1;
            setFilters(prev => ({ ...prev, page: nextPage }));
            executeSearch({ ...filters, page: nextPage });
        }
    };

    // Limpiar filtros pero mantener ubicación del usuario
    const handleClearFilters = () => {
        setFilters({
            query: '',
            category: '',
            rating: '',
            distance: '',
            userLocation: filters.userLocation,
            sortBy: 'rating',
            page: 1,
            limit: 10
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Búsqueda de Negocios</h2>

            {/* Formulario de búsqueda */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {/* Búsqueda por texto */}
                <div className="space-y-2">
                    <Label htmlFor="query">Buscar</Label>
                    <Input
                        id="query"
                        placeholder="Nombre, categoría, descripción..."
                        value={filters.query}
                        onChange={(e) => handleFilterChange('query', e.target.value)}
                    />
                </div>

                {/* Filtro por categoría */}
                <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <select
                        id="category"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        disabled={loadingCategories}
                    >
                        <option value="">Todas las categorías</option>
                        {categories?.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro por valoración */}
                <div className="space-y-2">
                    <Label htmlFor="rating">Valoración mínima</Label>
                    <select
                        id="rating"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                    >
                        <option value="">Cualquier valoración</option>
                        <option value="3">3+ estrellas</option>
                        <option value="4">4+ estrellas</option>
                        <option value="5">5 estrellas</option>
                    </select>
                </div>

                {/* Filtro por distancia */}
                <div className="space-y-2">
                    <Label htmlFor="distance">Distancia</Label>
                    <div className="flex gap-2">
                        <select
                            id="distance"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={filters.distance}
                            onChange={(e) => handleFilterChange('distance', e.target.value)}
                            disabled={!filters.userLocation}
                        >
                            <option value="">Cualquier distancia</option>
                            <option value="1">1 km</option>
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                        </select>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={getUserLocation}
                            disabled={isLocating}
                            className="whitespace-nowrap"
                        >
                            {isLocating ? 'Localizando...' : filters.userLocation ? 'Actualizar' : 'Mi ubicación'}
                        </Button>
                    </div>
                </div>

                {/* Ordenar por */}
                <div className="space-y-2">
                    <Label htmlFor="sortBy">Ordenar por</Label>
                    <select
                        id="sortBy"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <option value="rating">Valoración</option>
                        <option value="name">Nombre</option>
                        <option value="distance">Distancia</option>
                    </select>
                </div>

                {/* Botón de búsqueda */}
                <div className="md:col-span-2 flex items-end">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loadingSearch}
                    >
                        {loadingSearch ? 'Buscando...' : 'Buscar Negocios'}
                    </Button>
                </div>
            </form>

            {/* Resultados de búsqueda */}
            <div className="mt-8">
                {searchError && (
                    <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">Error: {searchError.message}</p>
                        <Button variant="outline" className="mt-4" onClick={() => executeSearch(filters)}>
                            Intentar nuevamente
                        </Button>
                    </div>
                )}

                {!searchError && loadingSearch && !searchResults && (
                    <div className="p-8 text-center">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Buscando negocios...</p>
                    </div>
                )}

                {!searchError && searchResults && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">
                                {searchResults.totalCount} {searchResults.totalCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Página {searchResults.page} de {searchResults.totalPages}
                            </p>
                        </div>

                        {searchResults.businesses.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400">No se encontraron negocios con los filtros seleccionados.</p>
                                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                                    Limpiar filtros
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {searchResults.businesses.map((business) => (
                                        <div
                                            key={business.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
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

                                {searchResults.page < searchResults.totalPages && (
                                    <div className="mt-8 text-center">
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            disabled={loadingSearch}
                                        >
                                            {loadingSearch ? 'Cargando más...' : 'Cargar más resultados'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessSearch; 