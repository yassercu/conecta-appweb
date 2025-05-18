import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import BusinessCard from './BusinessCard'; // Asumiendo que BusinessCard se mantiene como React por ahora

// Este componente ahora espera recibir los datos como props
export default function FeaturedSections({ categories, allBusinesses }) {
  const sections = useMemo(() => {
    if (!categories || !allBusinesses || categories.length === 0 || allBusinesses.length === 0) {
      return [];
    }

    // Filtrar negocios promocionados primero para la sección especial
    const promotedBusinesses = allBusinesses.filter(b => b.promoted === true).slice(0, 5); // Limitar a 5

    // Elegir algunas categorías (ej. las primeras 2 que tengan negocios)
    const popularCategoriesData = [];
    let count = 0;
    for (const category of categories) {
      const categoryName = typeof category === 'object' ? category.name : category;
      const businessesInCategory = allBusinesses.filter(b => b.category === categoryName);
      if (businessesInCategory.length > 0 && categoryName !== 'Todas') {
        popularCategoriesData.push({
          title: `Populares en ${categoryName}`,
          businesses: businessesInCategory.sort((a, b) => b.rating - a.rating).slice(0, 5), // Mostrar hasta 5
          categoryName: categoryName,
        });
        count++;
      }
      if (count >= 2) break; // Limitar a 2 secciones de categorías populares
    }
    
    const novedades = {
      title: "Novedades en el Barrio",
      // Negocios no promocionados, ordenados por algún criterio (ej. más nuevos, o rating si no hay fecha)
      // Aquí asumiremos que no hay fecha y ordenamos por rating, excluyendo los ya promocionados
      businesses: allBusinesses
        .filter(b => !b.promoted)
        .sort((a, b) => b.rating - a.rating) // Simulación, idealmente sería por fecha de creación
        .slice(0, 10), // Mostrar hasta 10 novedades
      categoryName: "Todas" // Para el botón "Ver más"
    };

    const sectionsArray = [];
    if (promotedBusinesses.length > 0) {
      // Esta sección ahora se manejará por `PromotedBusinessesCarousel.jsx`
      // sectionsArray.push({
      //   title: "Negocios Destacados",
      //   businesses: promotedBusinesses,
      //   categoryName: "Destacados" // O un filtro específico si aplica
      // });
    }
    sectionsArray.push(novedades);
    sectionsArray.push(...popularCategoriesData);
    
    return sectionsArray;

  }, [categories, allBusinesses]);

  if (!sections || sections.length === 0) {
    return null; // No renderizar nada si no hay datos o secciones
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4">
      {sections.map((section, index) => (
        <section key={index} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground relative">
              <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 rounded-full blur-lg -z-10"></span>
              {section.title}
            </h2>
            <a
              href={`/search?category=${encodeURIComponent(section.categoryName || 'Todas')}`}
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 group"
            >
              Ver todo
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          
          <div className={`grid gap-4 
            ${section.title === "Novedades en el Barrio" 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' // Más columnas para novedades
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' // Menos columnas para populares
            }`}
          >
            {section.businesses.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                // Aplicar layout estilo Elyerro para todas las tarjetas en estas secciones
                layout="elyerro" 
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
