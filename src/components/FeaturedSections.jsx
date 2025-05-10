import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCategories, useBusinesses } from '@/hooks/useApi';
import BusinessCard from './BusinessCard';

export default function FeaturedSections() {
  // Usar un flag para evitar múltiples reconstrucciones
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Usar opciones de caché más agresivas para reducir peticiones
  const { data: categories, loading: loadingCategories } = useCategories({
    useCache: true,
    cacheKey: 'categories:all',
    skip: hasFetchedData // Evitar peticiones adicionales si ya tenemos datos
  });

  // Obtener todos los negocios desde la API con la misma estrategia
  const { data: allBusinesses, loading: loadingBusinesses } = useBusinesses({
    useCache: true,
    cacheKey: 'businesses:all',
    skip: hasFetchedData // Evitar peticiones adicionales si ya tenemos datos
  });

  // Estado para almacenar las secciones generadas
  const [sections, setSections] = useState([]);

  // Agregar estado para depuración
  const [debugInfo, setDebugInfo] = useState({
    promotedCount: 0,
    totalBusinesses: 0
  });

  // Usar useMemo para calcular las secciones solo cuando los datos cambien
  // y evitar recreaciones en cada renderizado
  const memoizedSections = useMemo(() => {
    if (!categories || !allBusinesses) return [];
    
    console.log("Generando secciones (memoizadas)");
    
    // Verificar cuántos negocios tienen la propiedad promoted=true
    const promotedBusinesses = allBusinesses.filter(b => b.promoted === true);
    setDebugInfo({
      promotedCount: promotedBusinesses.length,
      totalBusinesses: allBusinesses.length
    });
    
    console.log("Negocios promocionados:", promotedBusinesses.length, "de", allBusinesses.length);
    // Si hay negocios promocionados, mostrar el primero para depuración
    if (promotedBusinesses.length > 0) {
      console.log("Ejemplo de negocio promocionado:", promotedBusinesses[0]);
    }
    
    // Elegir categorías populares de manera determinista
    // Usamos un array de índices fijos en lugar de orden aleatorio
    const categoryIndices = [1, 3, 5];  // Índices específicos para seleccionar categorías consistentes
    const popularCategories = categoryIndices
      .filter(index => categories[index])  // Asegurar que existan esas categorías
      .map(index => categories[index]);
    
    // Si no tenemos suficientes categorías con el enfoque determinista, tomamos las primeras
    const selectedCategories = popularCategories.length >= 3 ? 
      popularCategories : categories.slice(0, 3);
    
    // Crear secciones de manera determinista
    return [
      // "Novedades en el Barrio" - Usar los 10 negocios mejor calificados en lugar de aleatorios
      {
        title: "Novedades en el Barrio",
        businesses: [...allBusinesses]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10)
      },
      // Secciones por categoría
      ...selectedCategories.map(category => ({
        title: `Mejores en ${typeof category === 'object' ? category.name : category}`,
        businesses: allBusinesses
          .filter(b => b.category === (typeof category === 'object' ? category.name : category))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
      }))
    ];
  }, [categories, allBusinesses]);

  // Generar secciones solo cuando los datos estén disponibles y no se hayan procesado antes
  useEffect(() => {
    if (!categories || !allBusinesses || hasFetchedData) return;
    
    console.log("Actualizando secciones desde efectos");
    setSections(memoizedSections);
    
    // Marcar que ya hemos procesado los datos para evitar reprocesamiento
    if (memoizedSections.length > 0) {
      setHasFetchedData(true);
    }
  }, [categories, allBusinesses, memoizedSections, hasFetchedData]);

  // Mostrar un estado de carga solo durante la carga inicial
  if ((loadingCategories || loadingBusinesses) && !hasFetchedData) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay datos, no mostramos nada
  if (sections.length === 0 && memoizedSections.length === 0) {
    return null;
  }

  // Usar las secciones calculadas o memorizadas, lo que esté disponible
  const displaySections = sections.length > 0 ? sections : memoizedSections;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mostrar información de depuración */}
      {debugInfo.promotedCount > 0 && (
        <div className="text-xs text-muted-foreground mb-2 p-2 bg-primary/5 rounded-md">
          Hay {debugInfo.promotedCount} negocios promocionados de un total de {debugInfo.totalBusinesses}.
        </div>
      )}
      
      {displaySections.map((section, index) => (
        <section key={index} className="space-y-4 mb-8">
          {/* Título de sección con efecto de destello */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground relative">
              {section.title}
            </h2>
          </div>
          {section.title === "Novedades en el Barrio" ? (
            // Grid para Novedades - más columnas para mostrar más negocios por fila
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="compact" />
              ))}
            </div>
          ) : (
            // Grid para Populares - más columnas en pantallas grandes
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="detailed" />
              ))}
            </div>
          )}
          {/* Optional "See More" button */}
          <div className="text-center pt-2">
            <a
              href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}
              className="inline-flex items-center justify-center rounded-full text-xs md:text-sm font-medium 
                transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                focus-visible:ring-offset-2 ring-offset-background border border-primary/20 
                bg-background/80 hover:bg-primary/10 hover:border-primary h-8 md:h-10 py-1 md:py-2 px-4 md:px-6 group"
            >
              Ver más {section.businesses[0]?.category || 'negocios'} <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </section>
      ))}
    </div>
  );
}