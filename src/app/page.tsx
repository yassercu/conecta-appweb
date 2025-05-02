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
import type { Business } from '@/types/business'; // Import Business type

// Placeholder data - Includes 'promoted' flag and descriptions
const allBusinesses: Business[] = [
    { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=1', dataAiHint: 'modern cafe interior', promoted: false, description: 'Un café acogedor con excelente café y pastelería.', latitude: 37.7749, longitude: -122.4194, address: 'Calle Falsa 123', phone: '555-1111', email: 'info@cafeesquina.com' },
    { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/300/300?random=2', dataAiHint: 'stylish clothing display', promoted: true, description: 'Últimas tendencias de moda y estilos únicos.', latitude: 37.7949, longitude: -122.4294, address: 'Av Moda 456', phone: '555-2222', email: 'info@modaurbana.com' },
    { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/300/300?random=3', dataAiHint: 'vet with cat', promoted: true, description: 'Cuidado compasivo para tus amigos peludos.', latitude: 37.7549, longitude: -122.4094, address: 'Calle Mascotas 789', phone: '555-3333', email: 'info@patitas.com' },
    { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/300/300?random=4', dataAiHint: 'cozy bookstore aisle', promoted: false, description: 'Un lugar tranquilo para encontrar tu próximo libro favorito.', latitude: 37.7755, longitude: -122.4180, address: 'Plaza Libro 1', phone: '555-4444', email: 'info@librosymas.com' },
    { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/300/300?random=5', dataAiHint: 'traditional dish presentation', promoted: true, description: 'Experiencia culinaria exquisita con un toque moderno.', latitude: 37.7800, longitude: -122.3994, address: 'Blvd Sabor 987', phone: '555-5555', email: 'info@saborcriollo.com' },
    { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/300/300?random=6', dataAiHint: 'casual wear shop', promoted: false, description: 'Ropa asequible y con estilo para todos.', latitude: 37.7449, longitude: -122.4154, address: 'Ruta Estilo 101', phone: '555-6666', email: 'info@estilocasual.com' },
    { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/300/300?random=7', dataAiHint: 'coffee shop barista', promoted: true, description: 'El mejor café y sofás de la ciudad.', latitude: 37.8049, longitude: -122.4394, address: 'Av Cafe 10', phone: '555-7777', email: 'info@cafecentral.com' },
    // Add more businesses for the "Populares" section
    { id: '8', name: 'Flores del Edén', category: 'Floristerías', rating: 4.6, location: 'Oeste', image: 'https://picsum.photos/300/300?random=8', dataAiHint: 'flower shop display', promoted: false, description: 'Arreglos florales frescos para toda ocasión.', latitude: 37.7700, longitude: -122.4500, address: 'Calle Flor 22', phone: '555-8888', email: 'info@flores.com' },
    { id: '9', name: 'TecnoSoluciones', category: 'Reparación Electrónica', rating: 4.3, location: 'Centro', image: 'https://picsum.photos/300/300?random=9', dataAiHint: 'electronics repair bench', promoted: false, description: 'Reparación rápida y confiable de tus dispositivos.', latitude: 37.7780, longitude: -122.4150, address: 'Pasaje Tecno 3', phone: '555-9999', email: 'info@tecnosoluciones.com' },
    { id: '10', name: 'Pan Caliente', category: 'Panaderías', rating: 4.9, location: 'Este', image: 'https://picsum.photos/300/300?random=10', dataAiHint: 'fresh bread bakery', promoted: true, description: 'Pan artesanal horneado diariamente.', latitude: 37.7850, longitude: -122.3950, address: 'Esquina Pan 50', phone: '555-1010', email: 'info@pancaliente.com' },
];


// Filter out only promoted businesses for the carousel
const carouselBusinesses = allBusinesses.filter(b => b.promoted);

// Define businesses for each section
const featuredSections = [
  {
    title: "Novedades en el Barrio",
    // Use 4 businesses for a 2x2 grid (2 rows on all screens)
    businesses: allBusinesses.filter(b => ['1', '4', '6', '8'].includes(b.id))
  },
  {
    title: "Populares Cerca de Ti",
    // Use 10 businesses for a multi-row grid (10 rows mobile, 5 rows md+)
    businesses: allBusinesses.slice(0, 10) // Take the first 10 for variety
  },
];

// Extract categories from allBusinesses
const availableCategories = [...new Set(allBusinesses.map(business => business.category))];


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
        {/* SearchBar is in the Header */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">
          Explora Negocios Locales
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mb-6">
          Encuentra lo mejor de tu comunidad.
        </p>
        <Button asChild size="lg">
          <Link href="/search">Ver Todos los Negocios</Link>
        </Button>
      </section>

       {/* Promoted Business Carousel Section */}
       {isClient && carouselBusinesses.length > 0 && (
        <section className="py-6 relative overflow-hidden group/carousel">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 blur-3xl opacity-30 dark:opacity-50 -z-10"></div>

            <div className="container mx-auto px-0 sm:px-4 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-4 sm:px-0">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-0">
                  <Sparkles className="text-yellow-500 h-6 w-6" /> {/* Golden Sparkles */}
                  Negocios Destacados
                </h2>
                 <Button asChild variant="ghost" size="sm" className="text-accent-foreground hover:bg-accent/10 hover:text-accent">
                    <Link href="/payment">
                        Promociona Tu Negocio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: carouselBusinesses.length > 8, // Adjust loop condition based on visible items
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4"> {/* Adjust negative margin */}
                  {carouselBusinesses.map((business) => (
                    <CarouselItem key={business.id} className="basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%] pl-2 md:pl-4"> {/* Adjusted basis for more items */}
                      <Link href={`/business/${business.id}`} className="block group text-center transition-transform duration-300 ease-out hover:scale-[1.03]">
                        <div className="overflow-hidden rounded-lg aspect-square relative shadow-md mb-2 border-2 border-transparent group-hover:border-yellow-500/50"> {/* Rectangular card */}
                           <Image
                               src={business.image}
                               alt={business.name}
                               fill
                               sizes="20vw" // Adjust sizes
                               className="object-cover"
                               data-ai-hint={business.dataAiHint}
                               priority={true} // Prioritize images in the carousel
                           />
                           {/* Subtle Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                           {/* Destacado Badge */}
                            <Badge
                              variant="default"
                              className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 z-10 shadow-sm border border-yellow-600" // Golden badge style
                            >
                              ★ DESTACADO
                            </Badge>
                        </div>
                         <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary">{business.name}</h3>
                         <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{business.rating.toFixed(1)}</span>
                            <span className="hidden sm:inline">• {business.category}</span>
                         </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                 {/* Navigation Buttons - Visible on hover over the section */}
                <CarouselPrevious className="absolute left-[-8px] sm:left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background" />
                <CarouselNext className="absolute right-[-8px] sm:right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background" />
              </Carousel>
            </div>
          </section>
        )}


      {/* Featured Sections */}
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
            <Button variant="outline" size="sm" asChild>
              <Link href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}>
                Ver más {section.businesses[0]?.category || 'negocios'} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}

// Unified Business Card Component with layout variations
interface BusinessCardProps {
  business: Business;
  layout: 'compact' | 'detailed'; // Control layout differences
}

function BusinessCard({ business, layout }: BusinessCardProps) {
  return (
    <Card className="overflow-hidden group relative border bg-card rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <Link href={`/business/${business.id}`} className="block">
             {/* Image Container */}
            <div className={`relative ${layout === 'compact' ? 'aspect-square' : 'aspect-video'}`}> {/* Different aspect ratios */}
                <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={business.dataAiHint}
                    // Prioritize images in the first 'Novedades' section
                    priority={layout === 'compact'}
                />
                 {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>
                {/* Destacado Badge */}
                {business.promoted && (
                    <Badge
                      variant="default"
                      className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 z-10 shadow-sm border border-yellow-600" // Golden badge style
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
        </Link>
    </Card>
  );
}
