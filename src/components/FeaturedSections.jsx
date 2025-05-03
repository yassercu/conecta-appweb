import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { featuredSections } from '@/lib/data';

// Business Card Component with layout variations
function BusinessCard({ business, layout }) {
  return (
    <Card className="overflow-hidden group relative border bg-card rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <a href={`/business/${business.id}`} className="block">
        {/* Image Container */}
        <div className={`relative ${layout === 'compact' ? 'aspect-square' : 'aspect-video'}`}>
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
          {/* Destacado Badge */}
          {business.promoted && (
            <Badge
              className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 z-10 shadow-sm border border-yellow-600"
            >
              ★ DESTACADO
            </Badge>
          )}
        </div>
        {/* Content Container */}
        <CardContent className={`p-3 flex-grow flex flex-col ${layout === 'compact' ? 'justify-end' : 'space-y-1'}`}>
          {/* Compact Layout: Overlay style */}
          {layout === 'compact' && (
            <div className="relative z-10 text-white">
              <h3 className="font-semibold text-sm md:text-base truncate">{business.name}</h3>
              <div className="flex items-center gap-1 text-xs mt-0.5">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{business.rating.toFixed(1)}</span>
                <span className="text-gray-300">• {business.category}</span>
              </div>
            </div>
          )}
          {/* Detailed Layout: Below image */}
          {layout === 'detailed' && (
            <>
              <h3 className="font-semibold text-base md:text-lg truncate text-card-foreground">{business.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{business.description}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
                <Badge variant="secondary" className="text-xs">{business.category}</Badge>
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
        <section key={index} className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
          {section.title === "Novedades en el Barrio" ? (
            // Grid for Novedades - 2 columns on small, 4 on medium+ (forcing 2 rows on medium+)
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="compact" />
              ))}
            </div>
          ) : (
            // Grid for Populares - 1 col mobile, 2 cols md, 3 cols lg (allows more items vertically)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {section.businesses.map((business) => (
                <BusinessCard key={business.id} business={business} layout="detailed" />
              ))}
            </div>
          )}
          {/* Optional "See More" button */}
          <div className="text-center pt-2">
            <a 
              href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Ver más {section.businesses[0]?.category || 'negocios'} <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </section>
      ))}
    </>
  );
} 