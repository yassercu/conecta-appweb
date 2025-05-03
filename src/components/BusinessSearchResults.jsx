import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, Filter, ArrowDownUp, LocateFixed, List } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { categories, allBusinesses } from '@/lib/data';

// Lazy load MapView to avoid SSR issues with Leaflet
const MapView = lazy(() => import('@/components/map-view/map-view'));

// Simulate API call with filters
async function fetchBusinesses(filters) {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let filtered = allBusinesses.filter(b =>
    (b.name.toLowerCase().includes(filters.query.toLowerCase()) || 
     b.category.toLowerCase().includes(filters.query.toLowerCase()) ||
     b.description.toLowerCase().includes(filters.query.toLowerCase())) &&
    (filters.category === 'Todas' || b.category === filters.category) &&
    (filters.rating === '0' || b.rating >= parseInt(filters.rating))
  );

  // Sorting logic - prioritize promoted businesses first
  if (filters.sortBy === 'rating') {
    filtered.sort((a, b) => {
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      return b.rating - a.rating || a.name.localeCompare(b.name);
    });
  } else if (filters.sortBy === 'name') {
    filtered.sort((a, b) => {
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } else {
    filtered.sort((a, b) => {
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      return 0;
    });
  }

  return filtered;
}

// Business Card Component
function BusinessCard({ business }) {
  return (
    <Card className="overflow-hidden group relative border bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <a href={`/business/${business.id}`} className="block">
        <div className="relative aspect-video">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {business.promoted && (
            <Badge
              className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 z-10 shadow-sm border border-yellow-600"
            >
              ★ DESTACADO
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex-grow space-y-1">
          <CardTitle className="text-lg font-semibold text-card-foreground">{business.name}</CardTitle>
          <Badge variant="secondary" className="text-xs">{business.category}</Badge>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {business.location}
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
            </div>
          </div>
          {business.description && (
            <p className="text-sm text-muted-foreground pt-2 line-clamp-2">{business.description}</p>
          )}
        </CardContent>
      </a>
    </Card>
  );
}

export default function BusinessSearchResults() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [rating, setRating] = useState('0');
  const [sortBy, setSortBy] = useState('rating');
  const [isMapView, setIsMapView] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if running in browser
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Parse URL search params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('query') || '';
    const urlCategory = urlParams.get('category') || 'Todas';
    const urlRating = urlParams.get('rating') || '0';
    const urlSort = urlParams.get('sort') || 'rating';
    const urlView = urlParams.get('view') || 'list';

    setQuery(urlQuery);
    setCategory(urlCategory);
    setRating(urlRating);
    setSortBy(urlSort);
    setIsMapView(urlView === 'map');
  }, []);

  // Fetch businesses when filters change
  useEffect(() => {
    async function loadBusinesses() {
      setIsLoading(true);
      const filters = {
        query: query,
        category: category,
        rating: rating,
        sortBy: sortBy,
      };
      const fetchedBusinesses = await fetchBusinesses(filters);
      setBusinesses(fetchedBusinesses);
      setIsLoading(false);
    }
    loadBusinesses();
  }, [query, category, rating, sortBy]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    params.set('category', category);
    params.set('rating', rating);
    params.set('sort', sortBy);
    params.set('view', isMapView ? 'map' : 'list');
    
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [query, category, rating, sortBy, isMapView]);

  // Handle search form submission
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <SearchBar initialQuery={query} onSearch={handleSearch} />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center">
          <Filter className="h-5 w-5 text-muted-foreground hidden md:inline" />
          
          {/* Category Filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-full sm:w-[170px] bg-background">
              <Star className="h-4 w-4 mr-1 inline-block text-yellow-500 fill-current" />
              <SelectValue placeholder="Valoración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Cualquiera</SelectItem>
              <SelectItem value="4">4+ Estrellas</SelectItem>
              <SelectItem value="3">3+ Estrellas</SelectItem>
              <SelectItem value="2">2+ Estrellas</SelectItem>
              <SelectItem value="1">1+ Estrellas</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <ArrowDownUp className="h-4 w-4 mr-1 inline-block" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Valoración</SelectItem>
              <SelectItem value="name">Nombre (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant={!isMapView ? "default" : "outline"} 
            onClick={() => setIsMapView(false)}
            className="flex-1 md:flex-initial"
          >
            <List className="mr-2 h-4 w-4" /> Lista
          </Button>
          <Button 
            variant={isMapView ? "default" : "outline"} 
            onClick={() => setIsMapView(true)}
            className="flex-1 md:flex-initial"
          >
            <LocateFixed className="mr-2 h-4 w-4" /> Mapa
          </Button>
        </div>
      </div>

      {/* Results Display */}
      {isMapView ? (
        <section>
          <h2 className="text-2xl font-semibold mb-4 sr-only">Vista de Mapa</h2>
          <Card className="h-[500px] flex items-center justify-center bg-muted text-muted-foreground rounded-lg overflow-hidden border">
            {isBrowser ? (
              <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
                <MapView businesses={businesses} />
              </Suspense>
            ) : (
              <Skeleton className="h-[500px] w-full rounded-lg" />
            )}
          </Card>
        </section>
      ) : (
        <section>
          <h2 className="text-2xl font-semibold mb-6 sr-only">Resultados en Lista</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">No se encontraron negocios con los filtros seleccionados.</p>
              <Button 
                onClick={() => {
                  setQuery('');
                  setCategory('Todas');
                  setRating('0');
                }} 
                variant="link" 
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
} 