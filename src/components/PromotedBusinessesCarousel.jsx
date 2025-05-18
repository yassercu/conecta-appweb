import React, { useState, useEffect, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePromotedBusinesses } from '@/hooks/useApi'; // Asumiendo que este hook existe y funciona

export default function PromotedBusinessesCarousel() {
  const [isClient, setIsClient] = useState(false);
  const dataFetchedRef = useRef(false);

  const { data: businesses, loading, error } = usePromotedBusinesses({
    useCache: true,
    cacheKey: 'businesses:promoted',
    skip: dataFetchedRef.current
  });

  useEffect(() => {
    setIsClient(true);
    if (businesses && businesses.length > 0 && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
    }
  }, [businesses]);

  if (loading && !dataFetchedRef.current) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error cargando negocios promocionados:", error);
    return null;
  }

  if (!isClient || !businesses || businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-8 relative overflow-hidden group/carousel bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2 mb-3 md:mb-0">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Negocios Destacados
          </h2>
          <a
            href="/payment" // Asegúrate que esta ruta exista o ajústala
            className="text-sm font-medium text-primary hover:text-primary/80 group inline-flex items-center"
          >
            Promociona Tu Negocio
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {businesses.map((business) => (
              <CarouselItem
                key={business.id}
                className="pl-2 md:pl-4 basis-[48%] sm:basis-[30%] md:basis-[23%] lg:basis-[18%] xl:basis-[15.5%]" // Ajustado para más items
              >
                <a
                  href={`/business/${business.id}`}
                  className="block group text-center transition-all duration-300 ease-out hover:shadow-lg rounded-lg overflow-hidden"
                >
                  <div className="aspect-square relative bg-muted/50">
                    <img
                      src={business.image || `https://placehold.co/200x200.png?text=${encodeURIComponent(business.name)}`}
                      alt={business.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      data-ai-hint={business.category?.toLowerCase() || "negocio local"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge
                        variant="default" // Este será el estilo dorado
                        className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 font-semibold z-10 bg-amber-400 text-black hover:bg-amber-500 shadow-sm"
                    >
                        ★ DESTACADO
                    </Badge>
                  </div>
                  <div className="py-2 px-1 bg-card/70 backdrop-blur-sm">
                    <h3 className="font-medium text-xs md:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {business.name}
                    </h3>
                     {/* Opcional: mostrar categoría o rating si hay espacio y es deseable */}
                     <div className="flex items-center justify-center text-[10px] text-muted-foreground gap-1 mt-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-current" />
                      <span className="font-normal">{business.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-border h-8 w-8 md:h-10 md:w-10 shadow-md" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background border-border h-8 w-8 md:h-10 md:w-10 shadow-md" />
        </Carousel>
      </div>
    </section>
  );
}
