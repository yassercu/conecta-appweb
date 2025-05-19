import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Business Card Component
export function BusinessCard({ business, layout = "elyerro" }) { // Default to elyerro layout
  const isPromoted = business.promoted === true;
<<<<<<< HEAD
  const categoryName = typeof business.category === 'object' && business.category !== null 
    ? business.category.name 
    : typeof business.category === 'string' 
    ? business.category 
    : 'General';
  const dataAiHintValue = categoryName?.toLowerCase().split(' ').slice(0,2).join(' ') || "negocio local";


  if (layout === "elyerro") {
    return (
      <Card className="overflow-hidden group relative aspect-square flex flex-col justify-end border-0 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
        <a href={`/business/${business.id}`} className="block h-full">
          <img
            src={business.image || `https://placehold.co/300x300.png?text=${encodeURIComponent(business.name)}`}
            alt={business.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            loading="lazy"
            data-ai-hint={dataAiHintValue}
          />
          {/* Overlay oscuro en la parte inferior para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
          
          {isPromoted && (
             <Badge
             variant="default" // Usar 'default' que ahora será dorado
             className="absolute top-2 right-2 text-xs px-2 py-0.5 
               font-semibold z-10 bg-amber-400 text-black hover:bg-amber-500 shadow-md" // Estilo dorado
           >
             ★ DESTACADO
           </Badge>
          )}

          <CardContent className="relative z-10 p-3 text-white flex flex-col justify-end h-full">
            <h3 className="font-semibold text-base md:text-lg truncate group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs md:text-sm mt-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
              <span className="font-medium">{business.rating?.toFixed(1) || 'N/A'}</span>
              <span className="text-white/70">•</span>
              <span className="text-white/90 truncate">{categoryName}</span>
            </div>
          </CardContent>
        </a>
      </Card>
    );
  }

  // Fallback al layout detallado si no es 'elyerro' (aunque ahora es el default)
  // Este layout se puede simplificar o eliminar si se adopta globalmente el estilo Elyerro.
=======
  
  // Log para depuración
  if (isPromoted) {
    console.log(`Negocio promocionado: ${business.name} (${business.id})`);
  }
  
>>>>>>> parent of d2da8e7 (revisa el proyecto)
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col
      hover:scale-[1.02] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="block">
        <div className="relative aspect-[4/3]">
          <img
            src={business.image || `https://placehold.co/400x300.png?text=${encodeURIComponent(business.name)}`}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
<<<<<<< HEAD
            data-ai-hint={dataAiHintValue}
          />
           {isPromoted && (
             <Badge
             variant="default" // Usar 'default' que ahora será dorado
             className="absolute top-2 right-2 text-xs px-2 py-0.5 
               font-semibold z-10 bg-amber-400 text-black hover:bg-amber-500 shadow-md" // Estilo dorado
           >
             ★ DESTACADO
           </Badge>
=======
          />
          {/* Efecto de brillo orbital */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Destacado Badge */}
          {isPromoted && (
            <div className="absolute top-2 right-2 animate-orbit-small">
              <Badge
                className="bg-amber-300/90 hover:bg-amber-300 text-black text-xs px-1.5 py-0.5 
                rounded-full shadow-lg shadow-amber-500/20 border border-amber-300/80 backdrop-blur-sm font-semibold text-[8px] md:text-[10px]"
              >
                ★ DESTACADO
              </Badge>
            </div>
>>>>>>> parent of d2da8e7 (revisa el proyecto)
          )}
        </div>
        
        <CardContent className="p-3 flex-grow flex flex-col space-y-1">
          <h3 className="font-semibold text-sm md:text-base truncate text-card-foreground group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 flex-grow">{business.description}</p>
          <div className="flex justify-between items-center text-xs md:text-sm pt-1">
            <Badge variant="secondary" className="text-[9px] md:text-[11px] bg-primary/10 hover:bg-primary/20 transition-colors px-1.5 py-0.5">
              {categoryName}
            </Badge>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium text-foreground">{business.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}

export default BusinessCard; 