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
    <section className="py-6 relative overflow-hidden group/carousel">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 blur-3xl opacity-30 dark:opacity-50 -z-10"></div>

      <div className="container mx-auto px-0 sm:px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-4 sm:px-0">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="text-yellow-500 h-6 w-6" /> {/* Golden Sparkles */}
            Negocios Destacados
          </h2>
          <a 
            href="/payment" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          >
            Promociona Tu Negocio <ArrowRight className="ml-2 h-4 w-4" />
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
            {carouselBusinesses.map((business) => (
              <CarouselItem key={business.id} className="basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%] pl-2 md:pl-4">
                <a href={`/business/${business.id}`} className="block group text-center transition-transform duration-300 ease-out hover:scale-[1.03]">
                  <div className="overflow-hidden rounded-lg aspect-square relative shadow-md mb-2 border-2 border-transparent group-hover:border-yellow-500/50">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                    {/* Destacado Badge */}
                    <Badge
                      className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 z-10 shadow-sm border border-yellow-600"
                    >
                      ★ DESTACADO
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary">{business.name}</h3>
                  <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 fill-current" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="font-medium">{business.rating.toFixed(1)}</span>
                    <span className="hidden sm:inline">• {business.category}</span>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-8px] sm:left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background" />
          <CarouselNext className="absolute right-[-8px] sm:right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background" />
        </Carousel>
      </div>
    </section>
  );
} 