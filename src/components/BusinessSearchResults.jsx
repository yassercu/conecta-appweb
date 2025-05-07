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
import { Star, MapPin, Filter, ArrowDownUp, LocateFixed, List, Grid, Menu } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { categories, allBusinesses } from '@/lib/data';

// Lazy load MapView para evitar problemas con SSR
const MapView = lazy(() => {
  return import('@/components/map-view');
});

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

// Card de negocio para vista en cuadrícula
function BusinessGridCard({ business }) {
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col
      hover:scale-[1.02] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="block">
        <div className="relative aspect-square">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/businesses/default.svg'; }}
          />
          {/* Efecto de brillo orbital */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Destacado Badge */}
          {business.promoted && (
            <div className="absolute top-2 right-2 animate-orbit-small">
              <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[8px] md:text-[10px] px-1.5 py-0.5 
                rounded-full shadow-lg shadow-primary/20 border-none backdrop-blur-sm">
                ★ DESTACADO
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-2 md:p-3 flex-grow flex flex-col justify-end">
          <h3 className="font-semibold text-xs md:text-sm truncate group-hover:text-primary transition-colors">{business.name}</h3>
          <div className="flex items-center gap-1 text-[10px] md:text-xs mt-0.5">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="font-medium">{business.rating.toFixed(1)}</span>
            <span className="text-primary/40">•</span>
            <span className="text-muted-foreground truncate">{business.category}</span>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}

// Card de negocio para vista en lista (horizontal)
function BusinessListCard({ business }) {
  return (
    <Card className="overflow-hidden group relative border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl 
      shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300
      hover:scale-[1.01] hover:-translate-y-1">
      <a href={`/business/${business.id}`} className="flex flex-col md:flex-row">
        <div className="relative md:w-[120px] lg:w-[150px]">
          <div className="aspect-square md:h-full">
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/businesses/default.svg'; }}
            />
            {/* Efecto de brillo orbital */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          {business.promoted && (
            <div className="absolute top-2 right-2 animate-orbit-small">
              <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground text-[8px] md:text-[10px] px-1.5 py-0.5 
                rounded-full shadow-lg shadow-primary/20 border-none backdrop-blur-sm">
                ★ DESTACADO
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3 flex-grow md:w-auto">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xs md:text-sm truncate group-hover:text-primary transition-colors">{business.name}</h3>
              <div className="flex items-center gap-1 text-[9px] md:text-xs mt-0.5">
                <span className="text-muted-foreground truncate">{business.category}</span>
                <span className="text-primary/40">•</span>
                <MapPin className="h-3 w-3" /> <span className="truncate">{business.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
            </div>
          </div>
          {business.description && (
            <p className="text-[9px] md:text-xs text-muted-foreground pt-1 line-clamp-1">{business.description}</p>
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
  const [viewMode, setViewMode] = useState('grid'); // grid o list
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if running in browser
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Parse URL search params on component mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlQuery = urlParams.get('query') || '';
      const urlCategory = urlParams.get('category') || 'Todas';
      const urlRating = urlParams.get('rating') || '0';
      const urlSort = urlParams.get('sort') || 'rating';
      const urlView = urlParams.get('view') || 'list';
      const urlViewMode = urlParams.get('viewMode') || 'grid'; // Asegurar grid como predeterminado


      setQuery(urlQuery);
      setCategory(urlCategory);
      setRating(urlRating);
      setSortBy(urlSort);
      setIsMapView(urlView === 'map');
      setViewMode(urlViewMode);
    } catch (error) {
      // Usar valores predeterminados en caso de error
      setQuery('');
      setCategory('Todas');
      setRating('0');
      setSortBy('rating');
      setIsMapView(false);
      setViewMode('grid');
    }
  }, []);

  // Fetch businesses when filters change
  useEffect(() => {

    async function loadBusinesses() {
      try {
        setIsLoading(true);
        const filters = {
          query: query,
          category: category,
          rating: rating,
          sortBy: sortBy,
        };
        const fetchedBusinesses = await fetchBusinesses(filters);
        setBusinesses(fetchedBusinesses);
      } catch (error) {
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, [query, category, rating, sortBy]);

  // Update URL when filters change
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      params.set('category', category);
      params.set('rating', rating);
      params.set('sort', sortBy);
      params.set('view', isMapView ? 'map' : 'list');
      params.set('viewMode', viewMode);

      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch (error) {
      console.error("Error al actualizar la URL:", error);
      // No interrumpimos la experiencia del usuario si falla la actualización de URL
    }
  }, [query, category, rating, sortBy, isMapView, viewMode]);

  // Alternar entre modos de vista
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  // Registrar cambios de estado de mapa
  const handleMapViewToggle = (newValue) => {
    setIsMapView(newValue);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
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
          {!isMapView && (
            <Button
              variant={viewMode === 'grid' ? "default" : "outline"}
              onClick={toggleViewMode}
              className="flex-1 md:flex-initial"
            >
              {viewMode === 'grid' ? (
                <>
                  <Grid className="mr-2 h-4 w-4" /> Cuadrícula
                </>
              ) : (
                <>
                  <Menu className="mr-2 h-4 w-4" /> Lista
                </>
              )}
            </Button>
          )}
          <Button
            variant={!isMapView ? "default" : "outline"}
            onClick={() => handleMapViewToggle(false)}
            className={`flex-1 md:flex-initial ${!isMapView ? "hidden" : ""}`}
          >
            <List className="mr-2 h-4 w-4" /> Resultados
          </Button>
          <Button
            variant={isMapView ? "default" : "outline"}
            onClick={() => handleMapViewToggle(true)}
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
              <Suspense fallback={<div className="flex items-center justify-center w-full h-full">
                <p>Cargando mapa...</p>
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>}>
                <div className="w-full h-full">
                  <MapView businesses={businesses} />
                </div>
              </Suspense>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p>Esperando navegador...</p>
                <Skeleton className="h-[500px] w-full rounded-lg" />
              </div>
            )}
          </Card>
        </section>
      ) : (
        <section>
          <h2 className="text-2xl font-semibold mb-6 sr-only">Resultados</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
            </div>
          ) : businesses.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {businesses.map(business => (
                  <BusinessGridCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {businesses.map(business => (
                  <BusinessListCard key={business.id} business={business} />
                ))}
              </div>
            )
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