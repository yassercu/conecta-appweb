import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { carouselBusinesses } from '@/lib/data';

export default function PromotedBusinessesCarousel() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || carouselBusinesses.length === 0) {
    return null;
  }

  return (
    <section className="py-12 relative overflow-hidden group/carousel">
      {/* Fondo espacial animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 blur-3xl opacity-30 dark:opacity-50 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 px-4 sm:px-0">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-0 relative">
            <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-xl"></span>
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
            Negocios Destacados
          </h2>
          <a
            href="/payment"
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary h-10 py-2 px-6 group"
          >
            Promociona Tu Negocio
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: carouselBusinesses.length > 8,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {carouselBusinesses.map((business, index) => (
              <CarouselItem
                key={business.id}
                className="basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%] pl-2 md:pl-4"
              >
                <a
                  href={`/business/${business.id}`}
                  className="block group text-center transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1"
                >
                  <div className="overflow-hidden rounded-xl aspect-square relative shadow-lg mb-3 
                    border border-primary/10 group-hover:border-primary/30 
                    bg-gradient-to-br from-background to-muted/50
                    transition-all duration-300"
                  >
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Orbital Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>

                    {/* Destacado Badge with orbit animation */}
                    <div className="absolute top-2 right-2 animate-orbit-small">
                      <Badge
                        className="bg-primary/90 hover:bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full 
                          shadow-lg shadow-primary/20 border-none backdrop-blur-sm"
                      >
                        ★ DESTACADO
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                  <div className="flex items-center justify-center text-xs text-muted-foreground gap-1.5">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="hidden sm:inline text-primary/40">•</span>
                    <span className="hidden sm:inline text-xs">{business.category}</span>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-3 sm:left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-primary/20" />
          <CarouselNext className="absolute -right-3 sm:right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-primary/20" />
        </Carousel>
      </div>
    </section>
  );
}