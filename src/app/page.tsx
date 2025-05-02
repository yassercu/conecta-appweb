'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect } from 'react'; // Import hooks for client-side execution

// Placeholder data - Includes 'promoted' flag
const promotedBusinesses = [
    { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/300/300?random=2', dataAiHint: 'stylish clothing display', promoted: true },
    { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/300/300?random=3', dataAiHint: 'vet with cat', promoted: true },
    { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/300/300?random=5', dataAiHint: 'traditional dish presentation', promoted: true },
    { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/300/300?random=7', dataAiHint: 'coffee shop barista', promoted: true },
    { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=1', dataAiHint: 'modern cafe interior', promoted: false }, // Example of non-promoted
];

const featuredSections = [
  {
    title: "Novedades en el Barrio",
    businesses: [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=1', dataAiHint: 'modern cafe interior', promoted: false },
      { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/300/300?random=4', dataAiHint: 'cozy bookstore aisle', promoted: false },
      { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/300/300?random=6', dataAiHint: 'casual wear shop', promoted: false },
      // Include one promoted business for variety
      { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/300/300?random=7', dataAiHint: 'coffee shop barista', promoted: true },
    ]
  },
  {
    title: "Populares Cerca de Ti",
    businesses: [
       // Include one promoted business for variety
       { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/300/300?random=3', dataAiHint: 'vet with cat', promoted: true },
       { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=8', dataAiHint: 'latte art close up', promoted: false }, // Reusing ID for example
       { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/300/300?random=5', dataAiHint: 'traditional dish presentation', promoted: true },
       { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/300/300?random=2', dataAiHint: 'stylish clothing display', promoted: true },
    ]
  },
];


// Filter out only promoted businesses for the carousel
const carouselBusinesses = promotedBusinesses.filter(b => b.promoted);

export default function Home() {
    // State to manage hydration, ensure client-only rendering for Carousel
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <div className="space-y-12">
      {/* Hero Section Minimalist */}
      <section className="text-center py-10">
        {/* SearchBar is in the Header, this section can be simplified */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Explora Negocios Locales
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mb-6">
          Encuentra lo mejor de tu comunidad.
        </p>
        <Button asChild>
          <Link href="/search">Ver Todos los Negocios</Link>
        </Button>
      </section>

       {/* Promoted Business Carousel Section - Simplified & Novel Design */}
       {isClient && carouselBusinesses.length > 0 && ( // Render only on client and if businesses exist
        <section className="py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl opacity-50 -z-10"></div>
            <div className="container mx-auto px-0 sm:px-4 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-4 sm:px-0">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-0">
                  <Sparkles className="text-primary h-6 w-6" />
                  Negocios Destacados
                </h2>
                 <Button asChild variant="outline" size="sm" className="border-accent hover:bg-accent/10 hover:text-accent">
                    <Link href="/payment">
                        Promociona Tu Negocio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: carouselBusinesses.length > 4, // Loop only if enough items based on typical screen sizes
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4"> {/* Adjust negative margin */}
                  {carouselBusinesses.map((business) => (
                    <CarouselItem key={business.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-[12%] 2xl:basis-[10%] pl-2 md:pl-4"> {/* Increased density */}
                      <Link href={`/business/${business.id}`} className="block group text-center">
                        <div className="overflow-hidden rounded-full aspect-square relative shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-primary mb-2">
                           <Image
                               src={business.image}
                               alt={business.name}
                               fill
                               sizes="15vw" // Smaller sizes for denser layout
                               className="object-cover"
                               data-ai-hint={business.dataAiHint}
                               priority={true} // Prioritize images in the carousel
                           />
                           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                         <h3 className="font-medium text-xs sm:text-sm text-foreground truncate transition-colors group-hover:text-primary">{business.name}</h3>
                         <div className="flex items-center justify-center text-[10px] sm:text-xs text-yellow-500 gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span className="font-medium">{business.rating.toFixed(1)}</span>
                         </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-8px] sm:left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 hover:bg-background" />
                <CarouselNext className="absolute right-[-8px] sm:right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 hover:bg-background" />
              </Carousel>
            </div>
          </section>
        )}


      {/* Existing Featured Sections */}
      {featuredSections.map((section, index) => (
        <section key={index}>
          <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.businesses.map((business) => (
              <Card key={business.id} className="overflow-hidden group relative border-0 shadow-sm hover:shadow-md transition-shadow aspect-[4/3] flex flex-col bg-card"> {/* Adjusted aspect ratio */}
                <Link href={`/business/${business.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver detalles de {business.name}</span>
                </Link>
                {/* Promoted Badge */}
                {business.promoted && (
                    <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 z-20">★ PROMO</Badge>
                 )}
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" // Adjusted sizes
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={business.dataAiHint}
                  priority={index < 1 && business.promoted}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>

                <CardContent className="p-2 mt-auto z-10 relative text-white">
                  <h3 className="font-semibold text-sm truncate">{business.name}</h3>
                  {/* Category */}
                  <p className="text-xs text-gray-300 truncate">{business.category}</p>
                  {/* Rating and Location */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">{business.rating.toFixed(1)}</span>
                    {/* Location (optional, shown on larger screens) */}
                    <span className="text-xs text-gray-400 ml-auto hidden sm:inline">• {business.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Optional "See More" button for each section */}
          <div className="text-center mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}>
                Ver más {section.businesses[0]?.category || 'negocios'}
              </Link>
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
