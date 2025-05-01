import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'; // Import Badge for category

// Placeholder data - replace with actual data fetching and diversify
const featuredSections = [
  {
    title: "Novedades en el Barrio",
    businesses: [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/400?random=1', dataAiHint: 'modern cafe interior', promoted: false },
      { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/400/400?random=2', dataAiHint: 'stylish clothing display', promoted: false }, // No longer smaller
      { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/400/400?random=4', dataAiHint: 'cozy bookstore aisle', promoted: false },
      { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/400/400?random=5', dataAiHint: 'traditional dish presentation', promoted: false },
    ]
  },
  {
    title: "Populares Cerca de Ti",
    businesses: [
       { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/400/400?random=3', dataAiHint: 'vet with cat', promoted: false }, // No longer smaller
       { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/400/400?random=6', dataAiHint: 'casual wear shop', promoted: false },
       { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/400/400?random=7', dataAiHint: 'coffee shop barista', promoted: false },
       { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/400?random=8', dataAiHint: 'latte art close up', promoted: false }, // Reusing ID for example
    ]
  },
  // Add more sections as needed
];

export default function Home() {
  return (
    <div className="space-y-16"> {/* Increased spacing between sections */}
       {/* Hero Section Minimalist - Simplified */}
       <section className="text-center py-16"> {/* Increased padding */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"> {/* Use foreground color */}
                Descubre lo Mejor de <span className="text-primary">Tu Ciudad</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explora restaurantes, tiendas y servicios locales únicos cerca de ti.
            </p>
            {/* Search bar is now in the header */}
            <Button size="lg" asChild>
                <Link href="/search">Explorar Negocios</Link>
            </Button>
        </section>


      {featuredSections.map((section, index) => (
        <section key={index}>
          <h2 className="text-3xl font-semibold mb-6 text-center md:text-left">{section.title}</h2> {/* Larger title, center on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Adjusted grid for responsiveness */}
            {section.businesses.map((business) => (
              <Card key={business.id} className="overflow-hidden group relative border bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"> {/* Added card background and border */}
                <Link href={`/business/${business.id}`} className="block"> {/* Use block link */}
                    <div className="relative aspect-square"> {/* Maintain aspect ratio for image */}
                        <Image
                            src={business.image}
                            alt={business.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={business.dataAiHint}
                            priority={index < 1 && business.promoted} // Prioritize only first section's promoted (if any)
                        />
                         {/* Removed gradient overlay */}
                    </div>
                    <CardContent className="p-4 space-y-1"> {/* Added space-y */}
                        <h3 className="font-semibold text-lg truncate text-card-foreground">{business.name}</h3> {/* Use card-foreground */}
                         <Badge variant="secondary" className="text-xs">{business.category}</Badge> {/* Category badge */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-1"> {/* Use muted-foreground */}
                             <div className="flex items-center gap-1">
                                 <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                 <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                             </div>
                             <span>{business.location}</span>
                        </div>
                    </CardContent>
                </Link>
                 {/* Removed Promoted Badge */}
              </Card>
            ))}
          </div>
           {/* Optional "See More" button for each section */}
           <div className="text-center mt-8"> {/* Increased margin */}
               <Button variant="outline" asChild>
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
