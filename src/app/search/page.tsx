'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Filter, StarIcon, ArrowDownUp, LocateFixed, List } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Placeholder data - replace with actual data fetching (Spanish)
const allBusinesses = [
  { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', image: 'https://picsum.photos/400/200?random=1', promoted: true, dataAiHint: 'cafe interior' },
  { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', image: 'https://picsum.photos/400/200?random=2', promoted: true, dataAiHint: 'clothing boutique' },
  { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', image: 'https://picsum.photos/400/200?random=3', promoted: true, dataAiHint: 'veterinary clinic' },
  { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', image: 'https://picsum.photos/400/200?random=4', promoted: false, dataAiHint: 'bookstore shelf' },
  { id: '5', 'name': 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', image: 'https://picsum.photos/400/200?random=5', promoted: false, dataAiHint: 'restaurant food' },
  { id: '6', 'name': 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', image: 'https://picsum.photos/400/200?random=6', promoted: false, dataAiHint: 'clothing rack' },
  { id: '7', 'name': 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', image: 'https://picsum.photos/400/200?random=7', promoted: false, dataAiHint: 'coffee shop counter'},
];

// Placeholder categories (Spanish)
const categories = [
  "Todas",
  "Restaurantes",
  "Tiendas de ropa",
  "Veterinarias",
  "Cafeterías",
  "Librerías",
  "Servicios Profesionales",
  "Otros",
];

// Simulate API call
async function fetchBusinesses(filters: { query: string, category: string, rating: string, sortBy: string }): Promise<typeof allBusinesses> {
    console.log("Fetching businesses with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    let filtered = allBusinesses.filter(b =>
        (b.name.toLowerCase().includes(filters.query.toLowerCase()) || b.category.toLowerCase().includes(filters.query.toLowerCase())) &&
        (filters.category === 'Todas' || b.category === filters.category) &&
        (filters.rating === '0' || b.rating >= parseInt(filters.rating))
    );

    // Sorting logic
    if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
     // Prioritize promoted listings
    filtered.sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0));


    return filtered;
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'Todas'; // Changed default to Spanish 'Todas'
  const initialMapView = searchParams.get('map') === 'true';

  const [businesses, setBusinesses] = useState<typeof allBusinesses>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapView, setIsMapView] = useState(initialMapView);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState('0'); // 0 means all ratings
  const [sortBy, setSortBy] = useState('rating'); // Default sort by rating

  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      const filters = {
        query: searchQuery,
        category: selectedCategory,
        rating: minRating,
        sortBy: sortBy,
      };
      const fetchedBusinesses = await fetchBusinesses(filters);
      setBusinesses(fetchedBusinesses);
      setIsLoading(false);
    }
    loadBusinesses();
  }, [searchQuery, selectedCategory, minRating, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      // Trigger useEffect by updating a state variable, even if it's the same value
      // This ensures the fetch happens on form submit, not just input change
      setSearchQuery(prev => prev + ''); // Simple way to trigger re-fetch
  }

  const promotedListings = businesses.filter(b => b.promoted);
  const regularListings = businesses.filter(b => !b.promoted);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Buscar Negocios</h1>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <Input
                type="text"
                placeholder="Buscar por nombre, categoría..."
                className="flex-grow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
                <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
        </form>
      </section>

       {/* Filters and View Toggle */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex flex-wrap gap-4 items-center">
                <Filter className="h-5 w-5 text-muted-foreground hidden md:inline" />
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[150px]">
                         <StarIcon className="h-4 w-4 mr-1 inline-block text-yellow-500 fill-current" />
                        <SelectValue placeholder="Valoración" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Cualquiera</SelectItem>
                        <SelectItem value="4">4 Estrellas o más</SelectItem>
                        <SelectItem value="3">3 Estrellas o más</SelectItem>
                        <SelectItem value="2">2 Estrellas o más</SelectItem>
                        <SelectItem value="1">1 Estrella o más</SelectItem>
                    </SelectContent>
                </Select>

                 {/* Sort By */}
                 <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
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
             <div className="flex gap-2">
                 <Button variant={isMapView ? "outline" : "default"} onClick={() => setIsMapView(false)}>
                     <List className="mr-2 h-4 w-4" /> Vista Lista
                 </Button>
                 <Button variant={isMapView ? "default" : "outline"} onClick={() => setIsMapView(true)}>
                     <LocateFixed className="mr-2 h-4 w-4" /> Vista Mapa
                 </Button>
             </div>
        </div>

        {/* Conditional Rendering based on View */}
        {isMapView ? (
             <section>
                 <h2 className="text-2xl font-semibold mb-4">Vista de Mapa</h2>
                 <Card className="h-[500px] flex items-center justify-center bg-muted text-muted-foreground">
                     Mapa (Requiere Integración con Leaflet)
                     {/* TODO: Implement Leaflet map here, plotting businesses */}
                 </Card>
             </section>
        ) : (
             <>
                {/* Promoted Results */}
                {isLoading && promotedListings.length === 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-primary">🌟 Negocios Destacados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80" />)}
                         </div>
                    </section>
                )}
                {!isLoading && promotedListings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-primary">🌟 Negocios Destacados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {promotedListings.map((business) => (
                                <BusinessCard key={business.id} business={business} />
                            ))}
                        </div>
                        <hr className="my-8" />
                    </section>
                )}

                {/* Regular Results */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Resultados ({isLoading ? '...' : regularListings.length})</h2>
                    {isLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80" />)}
                         </div>
                    ) : regularListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regularListings.map((business) => (
                                <BusinessCard key={business.id} business={business} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No se encontraron negocios con tus criterios.</p>
                    )}
                </section>
            </>
        )}
    </div>
  );
}


// Business Card Component (Spanish)
function BusinessCard({ business }: { business: typeof allBusinesses[0] }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="p-0 relative">
                <Image
                    src={business.image}
                    alt={business.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    data-ai-hint={business.dataAiHint} // Added AI hint
                    priority={business.promoted} // Prioritize loading promoted images
                />
                {business.promoted && <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground">Promo</Badge>}
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
                <CardTitle className="text-lg">{business.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {business.location}
                </p>
                 <p className="text-sm text-muted-foreground mt-1">{business.category}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center text-sm pt-0">
                 <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(business.rating) ? 'fill-current' : 'text-muted-foreground'}`} />
                    ))}
                    <span className="text-muted-foreground ml-1">({business.rating.toFixed(1)})</span>
                 </div>
                 <Button variant="outline" size="sm" asChild>
                     {/* TODO: Update href when business detail page is created */}
                     <Link href={`/business/${business.id}`}>Ver</Link>
                 </Button>
            </CardFooter>
        </Card>
    );
}
