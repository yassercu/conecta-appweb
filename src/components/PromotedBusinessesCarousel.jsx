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
    <section className="py-4 relative overflow-hidden group/carousel">
      {/* Fondo espacial animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 blur-3xl opacity-30 dark:opacity-50 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      <div className="container mx-auto max-w-6xl px-0 sm:px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-4 sm:px-0">
          <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2 mb-3 md:mb-0 relative">
            <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/10 rounded-full blur-xl"></span>
            <Sparkles className="text-amber-300 h-5 w-5 animate-pulse" />
            Promocionados
          </h2>
          <a
            href="/payment"
            className="text-amber-300 inline-flex items-center justify-center rounded-full text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-primary/20 bg-background/80 hover:bg-primary/10 hover:border-primary h-7 md:h-9 py-1 px-3 md:px-5 group"
          >
            Promociona Tu Negocio
            <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {carouselBusinesses.map((business, index) => (
              <CarouselItem
                key={business.id}
                className="pl-2 md:pl-3 basis-[33.33%] sm:basis-1/4 md:basis-1/5 lg:basis-[16.66%] xl:basis-[14.28%]"
              >
                <a
                  href={`/business/${business.id}`}
                  className="block group text-center transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1"
                >
                  <div className="overflow-hidden rounded-xl aspect-square relative shadow-md mb-1.5 
                    border border-primary/10 group-hover:border-primary/30 
                    bg-gradient-to-br from-background to-muted/50
                    transition-all duration-300"
                  >
                    <img
                      src={business.image || '/assets/businesses/default.svg'}
                      alt={business.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Orbital Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>

                    {/* Destacado Badge with orbit animation - Cambiado a dorado */}
                    {/* <div className="absolute top-1 right-1 animate-orbit-small">
                      <Badge
                        className="bg-amber-300/90 hover:bg-amber-300 text-black text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full 
                          shadow-md shadow-amber-500/20 border border-amber-300/80 backdrop-blur-sm font-semibold"
                      >
                        ★ DESTACADO
                      </Badge>
                    </div> */}
                  </div>
                  <h3 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                  <div className="flex items-center justify-center text-[9px] text-muted-foreground gap-1">
                    <div className="flex items-center gap-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="hidden sm:inline text-primary/40 text-[8px]">•</span>
                    <span className="hidden sm:inline text-[9px] truncate">{business.category}</span>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-3 sm:left-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-primary/20 h-7 w-7" />
          <CarouselNext className="absolute -right-3 sm:right-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-primary/20 h-7 w-7" />
        </Carousel>
      </div>
    </section>
  );
}