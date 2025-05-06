import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { featuredSections } from '@/lib/data';

// Business Card Component with layout variations
function BusinessCard({ business, layout }) {
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col
      hover:scale-[1.02] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="block">
        {/* Image Container */}
        <div className={`relative ${layout === 'compact' ? 'aspect-square' : 'aspect-video'}`}>
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
              <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] px-2 py-0.5 
                rounded-full shadow-lg shadow-primary/20 border-none backdrop-blur-sm">
                ★ DESTACADO
              </Badge>
            </div>
          )}
        </div>
        {/* Content Container */}
        <CardContent className={`p-4 flex-grow flex flex-col ${layout === 'compact' ? 'justify-end' : 'space-y-2'}`}>
          {/* Compact Layout: Overlay style */}
          {layout === 'compact' && (
            <div className="relative z-10">
              <h3 className="font-semibold text-sm md:text-base truncate group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                <span className="font-medium">{business.rating.toFixed(1)}</span>
                <span className="text-primary/40">•</span>
                <span className="text-muted-foreground">{business.category}</span>
              </div>
            </div>
          )}
          {/* Detailed Layout: Below image */}
          {layout === 'detailed' && (
            <>
              <h3 className="font-semibold text-base md:text-lg truncate text-card-foreground group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{business.description}</p>
              <div className="flex justify-between items-center text-sm pt-2">
                <Badge variant="secondary" className="text-xs bg-primary/10 hover:bg-primary/20 transition-colors">
                  {business.category}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
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
    <>
      {featuredSections.map((section, index) => (
        <section key={index} className="space-y-8">
          {/* Título de sección con efecto de destello */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
            <h2 className="text-2xl font-semibold text-foreground relative">
              {section.title}
            </h2>
          </div>
          {section.title === "Novedades en el Barrio" ? (
            // Grid for Novedades - 2 columns on small, 4 on medium+ (forcing 2 rows on medium+)
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="compact" />
              ))}
            </div>
          ) : (
            // Grid for Populares - 1 col mobile, 2 cols md, 3 cols lg (allows more items vertically)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="detailed" />
              ))}
            </div>
          )}
          {/* Optional "See More" button */}
          <div className="text-center pt-4">
            <a
              href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}
              className="inline-flex items-center justify-center rounded-full text-sm font-medium 
                transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                focus-visible:ring-offset-2 ring-offset-background border border-primary/20 
                bg-background/80 hover:bg-primary/10 hover:border-primary h-10 py-2 px-6 group"
            >
              Ver más {section.businesses[0]?.category || 'negocios'} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </section>
      ))}
    </>
  );
}