import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import Image from 'next/image';

// Placeholder data - replace with actual data fetching and diversify
const featuredSections = [
  {
    title: "Novedades en el Barrio",
    businesses: [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=1', dataAiHint: 'modern cafe interior', promoted: false },
      { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/300/300?random=2', dataAiHint: 'stylish clothing display', promoted: true },
      { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/300/300?random=4', dataAiHint: 'cozy bookstore aisle', promoted: false },
      { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/300/300?random=5', dataAiHint: 'traditional dish presentation', promoted: false },
    ]
  },
  {
    title: "Populares Cerca de Ti",
    businesses: [
       { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/300/300?random=3', dataAiHint: 'vet with cat', promoted: true },
       { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/300/300?random=6', dataAiHint: 'casual wear shop', promoted: false },
       { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/300/300?random=7', dataAiHint: 'coffee shop barista', promoted: false },
       { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/300/300?random=8', dataAiHint: 'latte art close up', promoted: false }, // Reusing ID for example
    ]
  },
  // Add more sections as needed
];

export default function Home() {
  return (
    <div className="space-y-12">
       {/* Hero Section Minimalist */}
       <section className="text-center py-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Explora Negocios Locales</h1>
            <p className="text-md md:text-lg text-muted-foreground mb-6">Encuentra lo mejor de tu comunidad.</p>
            <Button asChild>
                <Link href="/search">Ver Todos los Negocios</Link>
            </Button>
        </section>


      {featuredSections.map((section, index) => (
        <section key={index}>
          <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.businesses.map((business) => (
              <Card key={business.id} className="overflow-hidden group relative border-0 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col">
                <Link href={`/business/${business.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Ver detalles de {business.name}</span>
                </Link>
                 <Image
                   src={business.image}
                   alt={business.name}
                   fill // Use fill layout
                   sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" // Responsive sizes
                   className="object-cover transition-transform duration-300 group-hover:scale-105"
                   data-ai-hint={business.dataAiHint}
                   priority={index < 1} // Prioritize images in the first section
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>

                  {business.promoted && (
                    <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 z-20">
                       ★ PROMO
                    </Badge>
                  )}

                 <CardContent className="p-2 mt-auto z-10 relative text-white">
                    <h3 className="font-semibold text-sm truncate">{business.name}</h3>
                    <p className="text-xs text-gray-300 truncate">{business.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                         <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                         <span className="text-xs font-medium">{business.rating.toFixed(1)}</span>
                         <span className="text-xs text-gray-400 ml-auto hidden sm:inline">• {business.location}</span>
                    </div>
                 </CardContent>
              </Card>
            ))}
          </div>
           {/* Optional "See More" button for each section */}
           <div className="text-center mt-6">
               <Button variant="outline" size="sm" asChild>
                   <Link href={`/search?category=${encodeURIComponent(section.businesses[0]?.category || '')}`}>Ver más {section.businesses[0]?.category || 'negocios'}</Link>
               </Button>
           </div>
        </section>
      ))}
    </div>
  );
}
