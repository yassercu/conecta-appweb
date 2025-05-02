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

// Placeholder data - Includes 'promoted' flag
const promotedBusinesses = [
    { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/400/400?random=2', dataAiHint: 'stylish clothing display', promoted: true },
    { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/400/400?random=3', dataAiHint: 'vet with cat', promoted: true },
    { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/400/400?random=5', dataAiHint: 'traditional dish presentation', promoted: true },
    { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/400/400?random=7', dataAiHint: 'coffee shop barista', promoted: true },
    { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/400?random=1', dataAiHint: 'modern cafe interior', promoted: false }, // Example of non-promoted
];

const featuredSections = [
  {
    title: "Novedades en el Barrio",
    businesses: [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/400?random=1', dataAiHint: 'modern cafe interior', promoted: false },
      { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/400/400?random=4', dataAiHint: 'cozy bookstore aisle', promoted: false },
      { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/400/400?random=6', dataAiHint: 'casual wear shop', promoted: false },
      // Include one promoted business for variety
      { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/400/400?random=7', dataAiHint: 'coffee shop barista', promoted: true },
    ]
  },
  {
    title: "Populares Cerca de Ti",
    businesses: [
       // Include one promoted business for variety
       { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/400/400?random=3', dataAiHint: 'vet with cat', promoted: true },
       { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/400?random=8', dataAiHint: 'latte art close up', promoted: false }, // Reusing ID for example
       { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/400/400?random=5', dataAiHint: 'traditional dish presentation', promoted: true },
       { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/400/400?random=2', dataAiHint: 'stylish clothing display', promoted: true },
    ]
  },
];


// Filter out only promoted businesses for the carousel
const carouselBusinesses = promotedBusinesses.filter(b => b.promoted);

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section Minimalist - No changes needed */}
      <section className="text-center py-10">
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

      {/* Promoted Business Carousel Section */}
      <section className="py-10 bg-gradient-to-b from-background to-muted/50 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="text-primary h-6 w-6" />
              Negocios Destacados
            </h2>
             <Button asChild variant="outline">
                <Link href="/payment">
                    Promociona Tu Negocio <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {carouselBusinesses.map((business) => (
                <CarouselItem key={business.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1"> {/* Add padding for spacing */}
                    <Card className="overflow-hidden group relative border bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                        <Link href={`/business/${business.id}`} className="block">
                            <div className="relative aspect-video">
                                <Image
                                    src={business.image}
                                    alt={business.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={business.dataAiHint}
                                    priority={true} // Prioritize images in the carousel
                                />
                                <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 z-20">★ PROMO</Badge>
                            </div>
                            <CardContent className="p-3 flex-grow space-y-1">
                                <h3 className="font-semibold text-lg truncate text-card-foreground">{business.name}</h3>
                                <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                                <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                                    </div>
                                    <span>{business.location}</span>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" /> {/* Hide on mobile for cleaner look */}
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>


      {/* Existing Featured Sections */}
      {featuredSections.map((section, index) => (
        <section key={index}>
          <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.businesses.map((business) => (
              <Card key={business.id} className="overflow-hidden group relative border-0 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col">
                <Link href={`/business/${business.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver detalles de {business.name}</span>
                </Link>
                {/* Promoted Badge - smaller and positioned */}
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
