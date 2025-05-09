import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
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
import { Star, MapPin, Filter, ArrowDownUp, LocateFixed, List, Grid, Menu, AlertCircle, Navigation } from 'lucide-react';
import { categories, allBusinesses } from '@/lib/data';
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Lazy load MapView para evitar problemas con SSR
const MapView = lazy(() => {
  return import('@/components/map-view');
});

// Función para calcular la distancia entre dos puntos geográficos usando la fórmula haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  return distance;
}

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

  // Aplicar filtro de distancia si están disponibles las coordenadas del usuario
  if (filters.distance !== '0' && filters.userLocation?.latitude && filters.userLocation?.longitude) {
    const maxDistance = parseInt(filters.distance);
    filtered = filtered.filter(business => {
      // Verificar si el negocio tiene coordenadas
      if (!business.coordinates?.latitude || !business.coordinates?.longitude) {
        return false;
      }
      
      // Calcular distancia entre el usuario y el negocio
      const distance = calculateDistance(
        filters.userLocation.latitude,
        filters.userLocation.longitude,
        business.coordinates.latitude,
        business.coordinates.longitude
      );
      
      return distance <= maxDistance;
    });
  }


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
  } else if (filters.sortBy === 'distance' && filters.userLocation) {
    filtered.sort((a, b) => {
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      
      // Si algún negocio no tiene coordenadas, ponerlo al final
      if (!a.coordinates && !b.coordinates) return 0;
      if (!a.coordinates) return 1;
      if (!b.coordinates) return -1;
      
      const distanceA = calculateDistance(
        filters.userLocation.latitude,
        filters.userLocation.longitude,
        a.coordinates.latitude,
        a.coordinates.longitude
      );
      
      const distanceB = calculateDistance(
        filters.userLocation.latitude,
        filters.userLocation.longitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      );
      
      return distanceA - distanceB;
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
              <Badge className="bg-amber-500/90 hover:bg-amber-500 text-black text-[8px] md:text-[10px] px-1.5 py-0.5 
                rounded-full shadow-lg shadow-amber-500/20 border border-amber-300 backdrop-blur-sm font-semibold">
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
        <div className="relative md:w-[100px] lg:w-[120px]">
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
              <Badge className="bg-amber-500/90 hover:bg-amber-500 text-black text-[8px] md:text-[10px] px-1.5 py-0.5 
                rounded-full shadow-lg shadow-amber-500/20 border border-amber-300 backdrop-blur-sm font-semibold">
                ★ DESTACADO
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-2 md:p-3 flex-grow md:w-auto">
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

// Función para obtener la dirección de unas coordenadas
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.address) {
      // Extraer información relevante de la dirección
      const { road, neighbourhood, suburb, city, town, village, state } = data.address;
      const locality = city || town || village || suburb || neighbourhood || state || '';
      const street = road || '';
      
      if (street && locality) {
        return `${street}, ${locality}`;
      } else if (street) {
        return street;
      } else if (locality) {
        return locality;
      }
    }
    return null;
  } catch (error) {
    console.error("Error al obtener dirección:", error);
    return null;
  }
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
  
  // Nuevos estados para el filtro de distancia
  const [distance, setDistance] = useState('0');
  const [distanceValue, setDistanceValue] = useState([0]); // Para el slider
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const locationRequested = useRef(false);
  const { toast } = useToast();

  // Mapeo de valores del slider a distancias en km
  const distanceMarks = {
    0: 'Sin límite',
    1: '1 km',
    5: '5 km',
    10: '10 km',
    20: '20 km'
  };
  
  const distanceSteps = [0, 1, 5, 10, 20]; // Valores posibles en el slider

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
      const urlDistance = urlParams.get('distance') || '0';

      setQuery(urlQuery);
      setCategory(urlCategory);
      setRating(urlRating);
      setSortBy(urlSort);
      setIsMapView(urlView === 'map');
      setViewMode(urlViewMode);
      setDistance(urlDistance);
      
      // Configurar el valor del slider basado en la distancia de la URL
      const distanceNum = parseInt(urlDistance);
      const sliderIndex = distanceSteps.indexOf(distanceNum);
      if (sliderIndex !== -1) {
        setDistanceValue([sliderIndex]);
      } else {
        setDistanceValue([0]); // Valor predeterminado (sin límite)
      }
      
      // Si hay un filtro de distancia en la URL, solicitar la ubicación
      if (urlDistance !== '0') {
        requestUserLocation();
      }
    } catch (error) {
      // Usar valores predeterminados en caso de error
      setQuery('');
      setCategory('Todas');
      setRating('0');
      setSortBy('rating');
      setIsMapView(false);
      setViewMode('grid');
      setDistance('0');
      setDistanceValue([0]);
    }
  }, []);

  // Función para solicitar la ubicación del usuario
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }
    
    if (locationRequested.current) return;
    locationRequested.current = true;
    
    setIsLoadingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(coords);
        
        // Intentar obtener la dirección de las coordenadas
        const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
        setUserAddress(address);
        
        setIsLoadingLocation(false);
        toast({
          title: "Ubicación obtenida",
          description: "Se utilizará tu ubicación para filtrar negocios cercanos.",
        });
      },
      (error) => {
        setLocationError('No se pudo obtener tu ubicación. ' + 
          (error.code === 1 
            ? 'Has denegado el permiso.' 
            : error.code === 2 
              ? 'Ubicación no disponible.' 
              : 'Tiempo de espera agotado.'));
        setIsLoadingLocation(false);
        setDistance('0'); // Resetear distancia si no se puede obtener ubicación
        toast({
          variant: "destructive",
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación. Los resultados no se filtrarán por distancia.",
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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
          distance: distance,
          userLocation: userLocation
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
  }, [query, category, rating, sortBy, distance, userLocation]);

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
      params.set('distance', distance);

      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch (error) {
      console.error("Error al actualizar la URL:", error);
      // No interrumpimos la experiencia del usuario si falla la actualización de URL
    }
  }, [query, category, rating, sortBy, isMapView, viewMode, distance]);

  // Manejar cambio en el slider de distancia
  const handleDistanceSliderChange = (value) => {
    const sliderPosition = value[0];
    const selectedDistance = distanceSteps[sliderPosition].toString();
    setDistanceValue(value);
    setDistance(selectedDistance);
    
    // Si se selecciona un valor de distancia mayor a 0 y aún no tenemos la ubicación del usuario
    if (selectedDistance !== '0' && !userLocation && !isLoadingLocation && !locationError) {
      requestUserLocation();
    }
  };

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
      {/* Filters and View Toggle - Estructura revisada */}
      <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg border">
        {/* Vista móvil: elementos apilados verticalmente */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Primera fila en móvil: Categorías */}
          <div className="w-full">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Segunda fila en móvil: Rating y Sort */}
          <div className="flex w-full gap-2 items-center">
            {/* Rating Filter */}
            <div className="w-1/2">
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="w-full bg-background">
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
            </div>

            {/* Sort By */}
            <div className="w-1/2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full bg-background">
                  <ArrowDownUp className="h-4 w-4 mr-1 inline-block" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Valoración</SelectItem>
                  <SelectItem value="name">Nombre (A-Z)</SelectItem>
                  {userLocation && <SelectItem value="distance">Más cercanos</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tercera fila en móvil: Distancia */}
          <div className={cn(
            "flex flex-col gap-2 bg-background p-3 rounded-md border",
            locationError && "border-destructive/50"
          )}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Distancia</span>
                {isLoadingLocation && <span className="ml-1 animate-spin text-xs">↻</span>}
                {locationError && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 text-destructive cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[250px]">
                        {locationError}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div>
                <Badge variant={distance === '0' ? "outline" : "default"} className="text-xs">
                  {distanceMarks[distanceSteps[distanceValue[0]]]}
                </Badge>
              </div>
            </div>

            <div className="px-2 py-3">
              <Slider
                value={distanceValue}
                onValueChange={handleDistanceSliderChange}
                max={distanceSteps.length - 1}
                step={1}
                className={cn(
                  "cursor-pointer",
                  !userLocation && distance !== '0' && "opacity-70"
                )}
                disabled={isLoadingLocation}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Sin límite</span>
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>
            
            {!userLocation && distance !== '0' && !isLoadingLocation ? (
              <div className="text-xs text-muted-foreground flex justify-between items-center">
                <span>
                  {locationError ? "No se pudo obtener tu ubicación" : "Esperando ubicación..."}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={requestUserLocation}
                >
                  Reintentar
                </Button>
              </div>
            ) : userLocation && (
              <div className="text-xs flex items-center gap-1 text-primary-foreground/80">
                <Navigation className="h-3 w-3" />
                <span className="truncate">{userAddress || `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`}</span>
              </div>
            )}
          </div>
          
          {/* Cuarta fila en móvil: Botones de vista */}
          <div className="flex gap-2 w-full">
            {!isMapView && (
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                onClick={toggleViewMode}
                className="flex-1"
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
              className={`flex-1 ${!isMapView ? "hidden" : ""}`}
            >
              <List className="mr-2 h-4 w-4" /> Resultados
            </Button>
            <Button
              variant={isMapView ? "default" : "outline"}
              onClick={() => handleMapViewToggle(true)}
              className="flex-1"
            >
              <LocateFixed className="mr-2 h-4 w-4" /> Mapa
            </Button>
          </div>
        </div>
        
        {/* Vista escritorio: todos los elementos en línea horizontal */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground hidden lg:block" />
          
          {/* Contenedor flexible para los filtros */}
          <div className="flex flex-1 flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px] md:w-[180px] bg-background">
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
              <SelectTrigger className="w-[140px] bg-background">
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
              <SelectTrigger className="w-[140px] bg-background">
                <ArrowDownUp className="h-4 w-4 mr-1 inline-block" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Valoración</SelectItem>
                <SelectItem value="name">Nombre (A-Z)</SelectItem>
                {userLocation && <SelectItem value="distance">Más cercanos</SelectItem>}
              </SelectContent>
            </Select>
            
            {/* Distance Compact */}
            <div className="flex-1 min-w-[180px] md:min-w-[240px] max-w-[280px] flex items-center gap-2 p-2 bg-background rounded-md border">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs whitespace-nowrap">Distancia:</span>
                {isLoadingLocation && <span className="animate-spin text-xs">↻</span>}
              </div>
              
              <div className="flex-1 px-1">
                <Slider
                  value={distanceValue}
                  onValueChange={handleDistanceSliderChange}
                  max={distanceSteps.length - 1}
                  step={1}
                  className={cn(
                    "cursor-pointer h-4",
                    !userLocation && distance !== '0' && "opacity-70"
                  )}
                  disabled={isLoadingLocation}
                />
              </div>
              
              <div>
                <Badge variant={distance === '0' ? "outline" : "default"} className="text-xs whitespace-nowrap">
                  {distanceMarks[distanceSteps[distanceValue[0]]]}
                </Badge>
              </div>
              
              {locationError && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-destructive cursor-help shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[250px]">
                      {locationError}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex gap-2">
            {!isMapView && (
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                onClick={toggleViewMode}
                size="sm"
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
              className={!isMapView ? "hidden" : ""}
              size="sm"
            >
              <List className="mr-2 h-4 w-4" /> Resultados
            </Button>
            <Button
              variant={isMapView ? "default" : "outline"}
              onClick={() => handleMapViewToggle(true)}
              size="sm"
            >
              <LocateFixed className="mr-2 h-4 w-4" /> Mapa
            </Button>
          </div>
        </div>
        
        {/* Mostrar información de la ubicación en modo escritorio */}
        {userLocation && !isLoadingLocation && (
          <div className="hidden sm:flex text-xs items-center gap-1 mt-1 text-muted-foreground">
            <Navigation className="h-3 w-3" />
            <span className="truncate">Tu ubicación: {userAddress || `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`}</span>
          </div>
        )}
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
                  <MapView businesses={businesses} userLocation={userLocation} />
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
                  setDistance('0');
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