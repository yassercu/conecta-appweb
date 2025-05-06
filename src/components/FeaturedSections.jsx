import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { featuredSections } from '@/lib/data';

// Business Card Component with layout variations
function BusinessCard({ business, layout }) {
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col
      hover:scale-[1.02] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="block">
        {/* Image Container */}
        <div className={`relative ${layout === 'compact' ? 'aspect-square' : 'aspect-[4/3]'}`}>
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Efecto de brillo orbital */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Destacado Badge */}
          {business.promoted && (
            <div className="absolute top-2 right-2 animate-orbit-small">
              <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs px-1.5 py-0.5 
                rounded-full shadow-lg shadow-primary/20 border-none backdrop-blur-sm text-[8px] md:text-[10px]">
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

export default function FeaturedSections() {
  return (
    <div className="max-w-6xl mx-auto">
      {featuredSections.map((section, index) => (
        <section key={index} className="space-y-6 mb-12">
          {/* Título de sección con efecto de destello */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground relative">
              {section.title}
            </h2>
          </div>
          {section.title === "Novedades en el Barrio" ? (
            // Grid para Novedades - más columnas para mostrar más negocios por fila
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="compact" />
              ))}
            </div>
          ) : (
            // Grid para Populares - más columnas en pantallas grandes
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="detailed" />
              ))}
            </div>
          )}
          {/* Optional "See More" button */}
          <div className="text-center pt-4">
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