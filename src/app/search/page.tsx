'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Filter, StarIcon, ArrowDownUp, LocateFixed, List } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import type { Business } from '@/types/business'; // Import the Business type

// Dynamically import Map component to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />,
});


// Placeholder data - replace with actual data fetching (Spanish)
// Added 'promoted' flag
const allBusinesses: Business[] = [
  { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/200?random=1', promoted: false, dataAiHint: 'cafe interior', latitude: 37.7749, longitude: -122.4194, description: 'Un café acogedor con excelente café y pastelería.', address: 'Calle Falsa 123', phone: '555-1111', email: 'info@cafeesquina.com' },
  { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/400/200?random=2', promoted: true, dataAiHint: 'clothing boutique', latitude: 37.7949, longitude: -122.4294, description: 'Últimas tendencias de moda y estilos únicos.', address: 'Av Moda 456', phone: '555-2222', email: 'info@modaurbana.com' },
  { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/400/200?random=3', promoted: true, dataAiHint: 'veterinary clinic', latitude: 37.7549, longitude: -122.4094, description: 'Cuidado compasivo para tus amigos peludos.', address: 'Calle Mascotas 789', phone: '555-3333', email: 'info@patitas.com' },
  { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/400/200?random=4', promoted: false, dataAiHint: 'bookstore shelf', latitude: 37.7755, longitude: -122.4180, description: 'Un lugar tranquilo para encontrar tu próximo libro favorito.', address: 'Plaza Libro 1', phone: '555-4444', email: 'info@librosymas.com' },
  { id: '5', name: 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/400/200?random=5', promoted: true, dataAiHint: 'restaurant food', latitude: 37.7800, longitude: -122.3994, description: 'Experiencia culinaria exquisita con un toque moderno.', address: 'Blvd Sabor 987', phone: '555-5555', email: 'info@saborcriollo.com' },
  { id: '6', name: 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/400/200?random=6', promoted: false, dataAiHint: 'clothing rack', latitude: 37.7449, longitude: -122.4154, description: 'Ropa asequible y con estilo para todos.', address: 'Ruta Estilo 101', phone: '555-6666', email: 'info@estilocasual.com' },
  { id: '7', name: 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/400/200?random=7', promoted: true, dataAiHint: 'coffee shop counter', latitude: 37.8049, longitude: -122.4394, description: 'El mejor café y sofás de la ciudad.', address: 'Av Cafe 10', phone: '555-7777', email: 'info@cafecentral.com' },
   // Add more businesses for the "Populares" section
    { id: '8', name: 'Flores del Edén', category: 'Floristerías', rating: 4.6, location: 'Oeste', image: 'https://picsum.photos/400/200?random=8', dataAiHint: 'flower shop display', promoted: false, description: 'Arreglos florales frescos para toda ocasión.', latitude: 37.7700, longitude: -122.4500, address: 'Calle Flor 22', phone: '555-8888', email: 'info@flores.com' },
    { id: '9', name: 'TecnoSoluciones', category: 'Reparación Electrónica', rating: 4.3, location: 'Centro', image: 'https://picsum.photos/400/200?random=9', dataAiHint: 'electronics repair bench', promoted: false, description: 'Reparación rápida y confiable de tus dispositivos.', latitude: 37.7780, longitude: -122.4150, address: 'Pasaje Tecno 3', phone: '555-9999', email: 'info@tecnosoluciones.com' },
    { id: '10', name: 'Pan Caliente', category: 'Panaderías', rating: 4.9, location: 'Este', image: 'https://picsum.photos/400/200?random=10', dataAiHint: 'fresh bread bakery', promoted: true, description: 'Pan artesanal horneado diariamente.', latitude: 37.7850, longitude: -122.3950, address: 'Esquina Pan 50', phone: '555-1010', email: 'info@pancaliente.com' },
];

// Placeholder categories (Spanish)
const categories = [
  "Todas",
  "Restaurantes",
  "Tiendas de ropa",
  "Veterinarias",
  "Cafeterías",
  "Librerías",
  "Floristerías",
  "Reparación Electrónica",
  "Panaderías",
  "Servicios Profesionales",
  "Otros",
];

// Simulate API call
async function fetchBusinesses(filters: { query: string, category: string, rating: string, sortBy: string }): Promise<Business[]> {
    console.log("Fetching businesses with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    let filtered = allBusinesses.filter(b =>
        (b.name.toLowerCase().includes(filters.query.toLowerCase()) || b.category.toLowerCase().includes(filters.query.toLowerCase())) &&
        (filters.category === 'Todas' || b.category === filters.category) &&
        (filters.rating === '0' || b.rating >= parseInt(filters.rating))
    );

    // Sorting logic - prioritize promoted businesses first within each sort type
    if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1; // Promoted first (negated logic for descending)
            return b.rating - a.rating || a.name.localeCompare(b.name); // Then by rating, then name
        });
    } else if (filters.sortBy === 'name') {
        filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1; // Promoted first
            return a.name.localeCompare(b.name); // Then by name
        });
    } else { // Default sort (e.g., relevance or just promoted first)
         filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1; // Promoted first
            return 0; // Keep original order otherwise, or implement relevance
         });
    }

    return filtered;
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || 'Todas'; // Changed default to Spanish 'Todas'
  const rating = searchParams.get('rating') || '0';
  const sort = searchParams.get('sort') || 'rating'; // Default sort by rating
  const view = searchParams.get('view') || 'list';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for filters controlled by selects
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [minRating, setMinRating] = useState(rating);
  const [sortBy, setSortBy] = useState(sort);
  const [isMapView, setIsMapView] = useState(view === 'map');

  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      const filters = {
        query: query, // Use query directly from URL params
        category: selectedCategory,
        rating: minRating,
        sortBy: sortBy,
      };
      const fetchedBusinesses = await fetchBusinesses(filters);
      setBusinesses(fetchedBusinesses);
      setIsLoading(false);
    }
    loadBusinesses();
  }, [query, selectedCategory, minRating, sortBy]); // Depend on URL query and select states

  // Update URL when filters change
  useEffect(() => {
      const params = new URLSearchParams(searchParams);
      params.set('category', selectedCategory);
      params.set('rating', minRating);
      params.set('sort', sortBy);
      params.set('view', isMapView ? 'map' : 'list');
      // Keep existing query param
      if (query) {
          params.set('query', query);
      } else {
          params.delete('query');
      }
      // Use replace instead of push to avoid multiple history entries for filter changes
      window.history.replaceState(null, '', `/search?${params.toString()}`);
  }, [selectedCategory, minRating, sortBy, isMapView, query, searchParams]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Resultados de Búsqueda {query ? `para "${query}"` : ''}
        </h1>
         {/* Search Form is in the header */}
      </section>

       {/* Filters and View Toggle */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex flex-wrap gap-4 items-center">
                <Filter className="h-5 w-5 text-muted-foreground hidden md:inline" />
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background"> {/* Full width on small screens */}
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                 {/* Rating Filter */}
                 <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger className="w-full sm:w-[170px] bg-background"> {/* Adjusted width */}
                         <StarIcon className="h-4 w-4 mr-1 inline-block text-yellow-500 fill-current" />
                        <SelectValue placeholder="Valoración" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Cualquiera</SelectItem>
                        <SelectItem value="4">4+ Estrellas</SelectItem> {/* Simplified text */}
                        <SelectItem value="3">3+ Estrellas</SelectItem>
                        <SelectItem value="2">2+ Estrellas</SelectItem>
                        <SelectItem value="1">1+ Estrellas</SelectItem>
                    </SelectContent>
                </Select>

                 {/* Sort By */}
                 <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-background"> {/* Adjusted width */}
                        <ArrowDownUp className="h-4 w-4 mr-1 inline-block" />
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating">Valoración</SelectItem>
                        <SelectItem value="name">Nombre (A-Z)</SelectItem>
                        {/* Add distance sorting later */}
                    </SelectContent>
                </Select>
            </div>

             {/* View Toggle */}
             <div className="flex gap-2 w-full md:w-auto"> {/* Full width on mobile */}
                 <Button variant={!isMapView ? "default" : "outline"} onClick={() => setIsMapView(false)} className="flex-1 md:flex-initial"> {/* Grow on mobile */}
                     <List className="mr-2 h-4 w-4" /> Lista
                 </Button>
                 <Button variant={isMapView ? "default" : "outline"} onClick={() => setIsMapView(true)} className="flex-1 md:flex-initial"> {/* Grow on mobile */}
                     <LocateFixed className="mr-2 h-4 w-4" /> Mapa
                 </Button>
             </div>
        </div>

        {/* Conditional Rendering based on View */}
        {isMapView ? (
             <section>
                 <h2 className="text-2xl font-semibold mb-4 sr-only">Vista de Mapa</h2> {/* Hide title visually */}
                 <Card className="h-[500px] flex items-center justify-center bg-muted text-muted-foreground rounded-lg overflow-hidden border">
                     <MapView businesses={businesses} />
                 </Card>
             </section>
        ) : (
             <>
                {/* Results Section */}
                <section>
                     <h2 className="text-2xl font-semibold mb-6 sr-only">Resultados en Lista</h2> {/* Hide title visually */}
                    {isLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid */}
                             {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)} {/* Adjusted height */}
                         </div>
                    ) : businesses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid */}
                            {businesses.map((business) => (
                                <BusinessCard key={business.id} business={business} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-16 text-lg"> {/* Increased padding and size */}
                          No se encontraron negocios con tus criterios de búsqueda. Intenta ajustar los filtros.
                        </p>
                    )}
                </section>
            </>
        )}
    </div>
  );
}


// Business Card Component (Spanish) - Updated styling
function BusinessCard({ business }: { business: Business }) {
    return (
        <Card className="overflow-hidden group relative border bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"> {/* Use card background and border */}
            <Link href={`/business/${business.id}`} className="block"> {/* Wrap content in link */}
                 <div className="relative aspect-video"> {/* Aspect ratio for image */}
                    <Image
                        src={business.image}
                        alt={business.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={business.dataAiHint}
                    />
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
                <CardContent className="p-4 flex-grow space-y-1"> {/* Consistent padding and spacing */}
                    <CardTitle className="text-lg font-semibold text-card-foreground">{business.name}</CardTitle> {/* Use card-foreground */}
                    <Badge variant="secondary" className="text-xs">{business.category}</Badge> {/* Category Badge */}
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-1"> {/* Use muted-foreground */}
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {business.location}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    {/* Optional: Add a short description snippet */}
                    {business.description && (
                        <p className="text-sm text-muted-foreground pt-2 line-clamp-2">{business.description}</p>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
}
