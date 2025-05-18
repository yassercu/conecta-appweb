import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Business Card Component with layout variations
export function BusinessCard({ business, layout }) {
  // Verificar si el negocio está promocionado - forzar evaluación explícita para debugging
  const isPromoted = business.promoted === true;
  
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col
      hover:scale-[1.02] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="block">
        {/* Image Container */}
        <div className={`relative ${layout === 'compact' ? 'aspect-square' : 'aspect-[4/3]'}`}>
          <img
            src={business.image || '/assets/businesses/default.svg'}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            data-ai-hint={business.dataAiHint || business.category?.toLowerCase() || "negocio local"}
          />
          {/* Efecto de brillo orbital */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Destacado Badge */}
          {isPromoted && (
            <div className="absolute top-2 right-2 animate-orbit-small">
              <Badge
                className="bg-amber-400 hover:bg-amber-500 text-black text-xs px-2 py-0.5 
                rounded-full shadow-lg shadow-amber-500/30 border border-amber-500/80 backdrop-blur-sm font-semibold text-[9px] md:text-[11px]"
              >
                ★ DESTACADO
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content Container */}
        <CardContent className={`p-3 flex-grow flex flex-col ${layout === 'compact' ? 'justify-end' : 'space-y-1'}`}>
          {/* Compact Layout: Overlay style */}
          {layout === 'compact' && (
            <div className="relative z-10">
              <h3 className="font-semibold text-xs md:text-sm truncate group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] md:text-xs mt-0.5">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="font-medium">{business.rating.toFixed(1)}</span>
                <span className="text-primary/40">•</span>
                <span className="text-muted-foreground truncate">{business.category}</span>
              </div>
            </div>
          )}
          
          {/* Detailed Layout: Below image */}
          {layout === 'detailed' && (
            <>
              <h3 className="font-semibold text-xs md:text-sm truncate text-card-foreground group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 flex-grow">{business.description}</p>
              <div className="flex justify-between items-center text-[10px] md:text-xs pt-1">
                <Badge variant="secondary" className="text-[8px] md:text-[10px] bg-primary/10 hover:bg-primary/20 transition-colors px-1.5 py-0.5">
                  {business.category}
                </Badge>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </a>
    </Card>
  );
}

export default BusinessCard;
