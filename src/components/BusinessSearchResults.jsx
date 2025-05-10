import React, { useState, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
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
import { Star, MapPin, Filter, ArrowDownUp, LocateFixed, Map, List, Grid, Menu, AlertCircle, Navigation, Search, Info } from 'lucide-react';
import { useCategories, useBusinesses, useBusinessSearch, useCountries, useProvincesByCountry, useMunicipalitiesByProvince } from '@/hooks/useApi';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Lazy load MapView para evitar problemas con SSR
const MapView = lazy(() => {
  return import('@/components/map-view');
});

// Función para obtener la geolocalización aproximada por IP
async function getLocationByIP() {
  try {
    // Usamos un servicio gratuito para obtener la ubicación aproximada por IP
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Error al obtener ubicación por IP');

    const data = await response.json();
    console.log("Ubicación por IP obtenida:", data);

    // Devolvemos los datos relevantes
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country_name
    };
  } catch (error) {
    console.error("Error al obtener ubicación por IP:", error);
    return null;
  }
}

// Función para calcular la distancia entre dos puntos geográficos usando la fórmula haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Asegurar que todos los parámetros son números
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  // Validar coordenadas - si no son válidas, devolver una distancia infinita
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.warn("Coordenadas inválidas en calculateDistance:", { lat1, lon1, lat2, lon2 });
    return Infinity;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km

  return distance;
}

// Simulate API call with filters
async function fetchBusinesses(filters) {
  try {
    setIsLoading(true);
    // Usar useBusinessSearch hook para obtener los datos filtrados
    const result = await apiService.businesses.search(filters);
    return result.businesses || [];
  } catch (error) {
    console.error("Error al buscar negocios:", error);
    return [];
  }
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

// Componente para el diálogo de ubicación manual
function ManualLocationDialog({ open, onOpenChange, onConfirm, ipLocation }) {
  const [locationOption, setLocationOption] = useState(ipLocation ? 'ip' : 'manual');
  const [manualAddress, setManualAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  // Estados para los selectores geográficos
  const [selectedCountryId, setSelectedCountryId] = useState('cu'); // Default Cuba
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');

  // Obtener datos geográficos
  const { data: countries, loading: loadingCountries } = useCountries();
  const { data: provinces, loading: loadingProvinces } = useProvincesByCountry(selectedCountryId, { skip: !selectedCountryId });
  const { data: municipalities, loading: loadingMunicipalities } = useMunicipalitiesByProvince(selectedProvinceId, { skip: !selectedProvinceId });

  // Efecto para inicializar selectedCoordinates y locationOption basado en ipLocation
  useEffect(() => {
    if (ipLocation) {
      setSelectedCoordinates({
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        display: `${ipLocation.city}, ${ipLocation.region}, ${ipLocation.country}`
      });
      // Si tenemos ipLocation, podríamos intentar preseleccionar país/provincia si coinciden
      // Esto es más complejo y lo dejaremos para una mejora futura si es necesario
    } else {
      setLocationOption('manual');
      setSelectedCoordinates(null);
    }
  }, [ipLocation]);

  // Efecto para actualizar selectedCoordinates cuando cambia la opción de radio
  useEffect(() => {
    if (locationOption === 'ip' && ipLocation) {
      setSelectedCoordinates({
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        display: `${ipLocation.city}, ${ipLocation.region}, ${ipLocation.country}`
      });
      // Limpiar selecciones manuales si se cambia a IP
      setSelectedCountryId('cu');
      setSelectedProvinceId('');
      setSelectedMunicipalityId('');
      setManualAddress('');
      setSearchResults([]);
    }
  }, [locationOption, ipLocation]);

  // Efecto para resetear provincia y municipio cuando cambia el país
  useEffect(() => {
    setSelectedProvinceId('');
    setSelectedMunicipalityId('');
  }, [selectedCountryId]);

  // Efecto para resetear municipio cuando cambia la provincia
  useEffect(() => {
    setSelectedMunicipalityId('');
  }, [selectedProvinceId]);

  // Búsqueda de dirección usando OpenStreetMap Nominatim
  const searchAddress = async () => {
    if (locationOption === 'manual') {
      const missingFields = [];
      if (!selectedCountryId) missingFields.push("País");
      
      // Solo requerir provincia si hay provincias disponibles para el país seleccionado O si no se ha ingresado dirección manual
      const countryHasProvinces = provinces?.length > 0;
      if (!selectedProvinceId && countryHasProvinces && !manualAddress.trim()) missingFields.push("Provincia");
      
      // Solo requerir municipio si hay municipios disponibles para la provincia seleccionada O si no se ha ingresado dirección manual
      const provinceHasMunicipalities = municipalities?.length > 0;
      if (!selectedMunicipalityId && provinceHasMunicipalities && !manualAddress.trim()) missingFields.push("Municipio");

      if (!manualAddress.trim() && missingFields.length > 0) {
        toast({
            title: "Información geográfica requerida",
            description: `Por favor, selecciona: ${missingFields.join(", ")}. O introduce una dirección específica. `,
            variant: "warning", // Usar warning para campos faltantes
            duration: 4000
        });
        return;
      }
    }

    try {
      setIsSearching(true);
      
      let queryParts = [];
      if (manualAddress.trim()) queryParts.push(manualAddress.trim());
      
      const selectedMunicipality = municipalities?.find(m => m.id === selectedMunicipalityId);
      if (selectedMunicipality) queryParts.push(selectedMunicipality.name);
      
      const selectedProvince = provinces?.find(p => p.id === selectedProvinceId);
      if (selectedProvince) queryParts.push(selectedProvince.name);
      
      const selectedCountry = countries?.find(c => c.id === selectedCountryId);
      if (selectedCountry) queryParts.push(selectedCountry.name);

      const searchQuery = queryParts.join(', ');
      
      if (!searchQuery) {
          toast({ title: "Nada que buscar", description: "Introduce algún dato de ubicación.", variant: "info" });
          setIsSearching(false);
          return;
      }

      console.log("Buscando dirección con Nominatim:", searchQuery);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );

      if (!response.ok) throw new Error('Error en la búsqueda de dirección');

      const data = await response.json();
      setSearchResults(data.map(item => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        display: item.display_name,
        // Podríamos guardar item.address aquí para una mejor reconstrucción del país/prov/mun
      })));

      if (data.length > 0) {
        setSelectedCoordinates({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display: data[0].display_name
        });
      } else {
        toast({ title: "Sin resultados", description: "No se encontraron ubicaciones para tu búsqueda.", variant: "info" });
      }
    } catch (error) {
      console.error("Error al buscar dirección:", error);
      toast({ title: "Error de búsqueda", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (selectedCoordinates) {
      onConfirm(selectedCoordinates);
    }
  };

  const TutorialTooltipContent = () => (
    <div className="space-y-2 text-sm p-1">
      <p className="font-semibold">Cómo indicar tu ubicación:</p>
      <ol className="list-decimal list-inside space-y-1">
        <li><strong>Opción Rápida (IP):</strong> Usaremos tu conexión para una ubicación aproximada (si está disponible).</li>
        <li><strong>Opción Manual Precisa:</strong></li>
        <ul className="list-disc list-inside pl-4 space-y-0.5 text-xs">
            <li>Selecciona País, Provincia y Municipio.</li>
            <li>En "Dirección específica", escribe calle, número, o un lugar conocido.</li>
            <li><strong>Ejemplo (Plaza de la Revolución):</strong></li>
            <ul className="list-disc list-inside pl-5">
                <li>País: Cuba</li>
                <li>Provincia: La Habana</li>
                <li>Municipio: Plaza de la Revolución</li>
                <li>Dirección: Plaza de la Revolución <em>(o dejar en blanco si el municipio es suficiente para una búsqueda general en esa área)</em></li>
            </ul>
            <li>Haz clic en el botón de búsqueda (lupa).</li>
            <li>Selecciona el resultado correcto de la lista.</li>
        </ul>
        <li>Verifica la ubicación en el mini-mapa.</li>
        <li>¡Confirma!</li>
      </ol>
      <p className="text-xs italic mt-1">Mientras más detalles proporciones, más precisa será la búsqueda.</p>
    </div>
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="relative pr-8">
          <DialogTitle>Configura tu ubicación</DialogTitle>
          <DialogDescription>
            Elige cómo quieres establecer tu ubicación para encontrar negocios cercanos.
          </DialogDescription>
          <div className="absolute top-0 right-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Info className="h-5 w-5 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs z-[1000] bg-background text-foreground border p-3"> 
                  <TutorialTooltipContent />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="grid gap-3 py-2 overflow-y-auto flex-grow pr-1 sm:pr-2">
          <RadioGroup
            value={locationOption}
            onValueChange={setLocationOption}
            className="grid gap-3"
          >
            {ipLocation && (
              <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="ip" id="r1" />
                <div className="grid gap-1">
                  <Label htmlFor="r1" className="font-medium cursor-pointer">
                    Usar ubicación por IP (aproximada)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {ipLocation.city}, {ipLocation.region}, {ipLocation.country}
                  </p>
                </div>
              </div>
            )}

            <div className={cn(
                "p-3 border rounded-md",
                locationOption === 'manual' && "ring-1 ring-primary"
            )}>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="manual" id="r2" />
                <Label htmlFor="r2" className="font-medium cursor-pointer w-full">
                    Indicar una ubicación manualmente
                </Label>
              </div>
              {locationOption === 'manual' && (
                <div className="grid gap-3 mt-2.5 pl-1">
                  {/* Selectores geográficos: en línea en desktop, apilados en móvil */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Selector de País */}
                    <div className="grid gap-1">
                      <Label htmlFor="country" className="text-xs">País</Label>
                      <Select 
                          value={selectedCountryId} 
                          onValueChange={setSelectedCountryId}
                          disabled={loadingCountries}
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder={loadingCountries ? "Cargando..." : "Selecciona un país"} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.map(country => (
                            <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de Provincia */}
                    <div className="grid gap-1">
                      <Label htmlFor="province" className="text-xs">Provincia</Label>
                      <Select 
                          value={selectedProvinceId} 
                          onValueChange={setSelectedProvinceId}
                          disabled={!selectedCountryId || loadingProvinces || provinces?.length === 0}
                      >
                        <SelectTrigger id="province">
                          <SelectValue placeholder={
                              loadingProvinces ? "Cargando..." : 
                              !selectedCountryId ? "País primero" :
                              provinces?.length === 0 && !loadingProvinces ? "No hay provincias" :
                              "Selecciona provincia"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces?.map(province => (
                            <SelectItem key={province.id} value={province.id}>{province.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de Municipio */}
                    <div className="grid gap-1">
                      <Label htmlFor="municipality" className="text-xs">Municipio</Label>
                      <Select 
                          value={selectedMunicipalityId} 
                          onValueChange={setSelectedMunicipalityId}
                          disabled={!selectedProvinceId || loadingMunicipalities || municipalities?.length === 0}
                      >
                        <SelectTrigger id="municipality">
                          <SelectValue placeholder={
                              loadingMunicipalities ? "Cargando..." :
                              !selectedProvinceId ? "Provincia primero" :
                              municipalities?.length === 0 && !loadingMunicipalities ? "No hay municipios" :
                              "Selecciona municipio"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {municipalities?.map(municipality => (
                            <SelectItem key={municipality.id} value={municipality.id}>{municipality.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                
                  <div className="grid gap-1 mt-0.5"> {/* Reducido mt aquí */}
                    <Label htmlFor="manual-address-detail" className="text-xs">Dirección específica (opcional)</Label>
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            id="manual-address-detail"
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            placeholder="Calle, número, punto de referencia..."
                            disabled={locationOption !== 'manual'}
                            className="h-9"
                        />
                        <Button
                            type="button"
                            size="icon"
                            onClick={searchAddress}
                            disabled={locationOption !== 'manual' || isSearching}
                            aria-label="Buscar dirección"
                            className="h-9 w-9 shrink-0"
                        >
                            {isSearching ? <span className="animate-spin text-xs">↻</span> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>

          {/* Resultados de búsqueda */}
          {locationOption === 'manual' && searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-md bg-background p-1"> {/* Aumentado max-h y añadido p-1 */}
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-2.5 py-1.5 text-xs cursor-pointer hover:bg-muted rounded", // Añadido rounded
                    selectedCoordinates?.display === result.display && "bg-muted font-semibold"
                  )}
                  onClick={() => setSelectedCoordinates(result)}
                >
                  {result.display}
                </div>
              ))}
            </div>
          )}

          {selectedCoordinates && (
            <div className="mt-2.5 space-y-1.5">
              <div className="px-2.5 py-2 text-xs bg-muted rounded-md">
                <p className="font-medium">Ubicación seleccionada:</p>
                <p className="text-muted-foreground mt-0.5 truncate">{selectedCoordinates.display}</p>
                {selectedCoordinates.latitude && selectedCoordinates.longitude && (
                    <p className="text-xs mt-0.5">
                    Lat: {selectedCoordinates.latitude?.toFixed(5)}, Lon: {selectedCoordinates.longitude?.toFixed(5)}
                    </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between pt-3 mt-auto"> {/* Añadido mt-auto para empujar al fondo */}
          {locationOption === 'manual' && ipLocation && (
             <Button variant="ghost" size="sm" onClick={() => setLocationOption('ip')} className="text-xs mr-auto"> {/* mr-auto para empujar a la izq */}
                Restablecer a ubicación por IP
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm" // Consistencia de tamaño
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedCoordinates || (!selectedCoordinates.latitude || !selectedCoordinates.longitude)}
              size="sm" // Consistencia de tamaño
            >
              Confirmar ubicación
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  // Estados para el filtro de distancia
  const [distance, setDistance] = useState('0');
  const [distanceValue, setDistanceValue] = useState([0]); // Para el slider
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const locationRequested = useRef(false);

  // Nuevos estados para la ubicación manual
  const [showManualLocationDialog, setShowManualLocationDialog] = useState(false);
  const [ipLocation, setIpLocation] = useState(null);
  const [isLoadingIpLocation, setIsLoadingIpLocation] = useState(false);

  // Obtener categorías de la API
  const { data: categories = ['Todas'] } = useCategories({
    useCache: true,
    cacheKey: 'categories:all'
  });

  // Importar API Service para búsquedas
  const { apiService } = useBusinessSearch();
  
  // Estado para rastrear si apiService está inicializado
  const [isApiReady, setIsApiReady] = useState(false);

  const { toast } = useToast();

  // Mapeo de valores del slider a distancias en km
  const distanceMarks = {
    0: 'Sin límite',
    1: '1 km',
    5: '5 km',
    10: '10 km',
    20: '20 km',
    200: '200 km'
  };

  const distanceSteps = [0, 1, 5, 10, 20, 200]; // Valores posibles en el slider

  const displayCategories = useMemo(() => {
    const allCatsOption = { value: 'Todas', label: 'Todas las categorías' };
    // categories ya tiene ['Todas'] por defecto si la API no devuelve nada o devuelve null/undefined.
    // Si categories es ['Todas'], uniqueApiCategories será un array vacío.
    const uniqueApiCategories = Array.isArray(categories)
        ? categories.filter(cat => cat !== 'Todas')
        : [];

    return [
        allCatsOption,
        ...uniqueApiCategories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [categories]);

  // Check if running in browser
  useEffect(() => {
    setIsBrowser(true);

    // Intentar cargar la ubicación guardada del localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedLocationString = localStorage.getItem('userLocation');
        const savedAddressString = localStorage.getItem('userAddress');

        if (savedLocationString) {
          const savedLocation = JSON.parse(savedLocationString);
          if (savedLocation && savedLocation.latitude && savedLocation.longitude) {
            console.log("Cargando ubicación guardada:", savedLocation);
            setUserLocation(savedLocation);
          }
        }

        if (savedAddressString) {
          setUserAddress(savedAddressString);
        }
      } catch (error) {
        console.error("Error al cargar ubicación guardada:", error);
      }
    }
  }, []);

  // Guardar ubicación en localStorage cuando cambie
  useEffect(() => {
    if (userLocation && typeof window !== 'undefined') {
      try {
        localStorage.setItem('userLocation', JSON.stringify(userLocation));
        console.log("Ubicación guardada en localStorage:", userLocation);
      } catch (error) {
        console.error("Error al guardar ubicación:", error);
      }
    }
  }, [userLocation]);

  // Guardar dirección en localStorage cuando cambie
  useEffect(() => {
    if (userAddress && typeof window !== 'undefined') {
      try {
        localStorage.setItem('userAddress', userAddress);
      } catch (error) {
        console.error("Error al guardar dirección:", error);
      }
    }
  }, [userAddress]);

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

  // Verificar que apiService esté disponible
  useEffect(() => {
    if (apiService && apiService.businesses && typeof apiService.businesses.search === 'function') {
      setIsApiReady(true);
    }
  }, [apiService]);

  // Función para solicitar la ubicación del usuario
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      // Si no hay soporte para geolocalización, verificar si ya tenemos ubicación guardada
      if (userLocation) {
        toast({
          title: "Usando ubicación guardada",
          description: "Se está utilizando tu ubicación guardada anteriormente.",
        });
        return;
      }

      // Si no hay ubicación guardada, iniciar proceso alternativo
      handleGeolocationFailure('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    locationRequested.current = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log("Ubicación obtenida por geolocalización:", coords);

        // Actualizar el estado con las nuevas coordenadas
        setUserLocation(coords);

        // Intentar obtener la dirección de las coordenadas
        const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
        setUserAddress(address);

        setIsLoadingLocation(false);

        // Si hay un filtro de distancia activo, mantenerlo con la nueva ubicación
        if (distance !== '0') {
          console.log(`Ubicación actualizada, recalculando negocios con filtro de distancia: ${distance}km`);
        }

        toast({
          title: "Ubicación actualizada",
          description: "Se utilizará tu ubicación actual para filtrar negocios cercanos.",
        });
      },
      async (error) => {
        console.error("Error de geolocalización:", error);

        // Verificar si ya tenemos una ubicación guardada
        if (userLocation) {
          console.log("Usando ubicación guardada previamente:", userLocation);
          setIsLoadingLocation(false);
          toast({
            variant: "warning",
            title: "Usando ubicación guardada",
            description: "No se pudo obtener tu ubicación actual. Se utilizará la ubicación guardada anteriormente.",
          });
          return;
        }

        // Si no hay ubicación guardada, iniciar proceso alternativo
        await handleGeolocationFailure(
          'No se pudo obtener tu ubicación. ' +
          (error.code === 1
            ? 'Has denegado el permiso.'
            : error.code === 2
              ? 'Ubicación no disponible.'
              : 'Tiempo de espera agotado.')
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Función para manejar el fallo de geolocalización
  const handleGeolocationFailure = async (errorMessage) => {
    setLocationError(errorMessage);
    setIsLoadingLocation(false);

    // Intentar obtener ubicación por IP
    setIsLoadingIpLocation(true);
    try {
      const ipLocationData = await getLocationByIP();
      setIpLocation(ipLocationData);

      // Mostrar diálogo para selección manual o confirmación de ubicación por IP
      setShowManualLocationDialog(true);
    } catch (error) {
      console.error("Error al obtener ubicación por IP:", error);
    } finally {
      setIsLoadingIpLocation(false);
    }

    // Por ahora, desactivamos el filtro de distancia
    setDistance('0');
    setDistanceValue([0]);

    toast({
      variant: "destructive" ,
      title: "Error de ubicación",
      description: "No se pudo obtener tu ubicación automáticamente. Por favor, ingresa tu ubicación manualmente.",
    });
  };

  // Función para manejar la confirmación de ubicación manual
  const handleManualLocationConfirm = (locationData) => {
    // Actualizar estados con la ubicación elegida
    setUserLocation({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });

    setUserAddress(locationData.display);
    setShowManualLocationDialog(false);

    // Si había una distancia seleccionada, la mantenemos
    if (distanceValue[0] > 0) {
      const selectedDistance = distanceSteps[distanceValue[0]].toString();
      setDistance(selectedDistance);
    }

    toast({
      title: "Ubicación actualizada",
      description: "Se utilizará la ubicación seleccionada para filtrar negocios cercanos.",
    });
  };

  // Fetch businesses when filters change
  useEffect(() => {
    // No hacer nada si el servicio API no está listo
    if (!isApiReady) {
      console.log("Esperando a que el servicio API esté listo...");
      return;
    }
    
    async function loadBusinesses() {
      try {
        setIsLoading(true);
        
        // Construir objeto de filtros con valores por defecto seguros
        const filters = {
          query: query || '',
          category: category || 'Todas',
          rating: rating || '0',
          sortBy: sortBy || 'rating',
          distance: distance || '0',
          userLocation: userLocation || null
        };
        
        console.log("Buscando negocios con filtros (BusinessSearchResults.jsx):", JSON.stringify(filters, null, 2));
        if (filters.distance !== '0' && !filters.userLocation) {
            console.warn("ADVERTENCIA (BusinessSearchResults.jsx): Intentando filtrar por distancia SIN userLocation. El backend podría no manejar esto como se espera, o devolver resultados vacíos.");
        }
        
        // Usar try-catch específico para la llamada a la API
        try {
          const result = await apiService.businesses.search(filters);
          
          // Verificar si result existe y tiene la propiedad businesses
          if (result && typeof result === 'object' && 'businesses' in result) {
            setBusinesses(result.businesses || []);
            console.log(`Se encontraron ${result.businesses ? result.businesses.length : 0} negocios`);
          } else {
            // Si el resultado no tiene el formato esperado
            console.error("Formato de respuesta inesperado:", result);
            setBusinesses([]);
          }
        } catch (apiError) {
          console.error("Error en la llamada a la API:", apiError);
          setBusinesses([]);
        }
      } catch (error) {
        console.error("Error al cargar negocios:", error);
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBusinesses();
  }, [query, category, rating, sortBy, distance, userLocation, apiService, isApiReady]);

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

    console.log(`Cambio en slider de distancia: ${selectedDistance}km, posición: ${sliderPosition}`);
    setDistanceValue(value);

    // Si se selecciona un valor de distancia mayor a 0 
    if (selectedDistance !== '0') {
      // Si ya tenemos ubicación (guardada o actual), aplicar filtro directamente
      if (userLocation) {
        console.log("Aplicando filtro de distancia con ubicación existente:", selectedDistance);
        setDistance(selectedDistance);
      }
      // Si no tenemos ubicación, intentar obtenerla
      else if (!isLoadingLocation) {
        console.log("Solicitando ubicación para filtrar por distancia");
        requestUserLocation();
        // Guardamos la distancia seleccionada para aplicarla cuando tengamos ubicación
        setDistance(selectedDistance);
      }
    } else {
      // Si se selecciona "Sin límite", actualizar distance directamente
      console.log("Desactivando filtro de distancia");
      setDistance('0');
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
                {displayCategories.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
            locationError && "border-destructive"
          )}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Distancia</span>
                {isLoadingLocation && <span className="ml-1 animate-spin text-xs">↻</span>}
              </div>
              <div>
                <Badge variant={distance === '0' ? "outline" : "default"} className="text-xs">
                  {distanceMarks[distanceSteps[distanceValue[0]]]}
                </Badge>
              </div>
            </div>

            {locationError && !isLoadingLocation && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}

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
                <span>200 km</span>
              </div>
            </div>

            {!userLocation && distance !== '0' && !isLoadingLocation ? (
              <div className="text-xs text-muted-foreground flex justify-between items-center">
                <span>
                  {locationError ? "No se pudo obtener tu ubicación" : "Esperando ubicación..."}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={requestUserLocation}
                  >
                    Reintentar
                  </Button>
                  {locationError && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowManualLocationDialog(true)}
                    >
                      Configurar manualmente
                    </Button>
                  )}
                </div>
              </div>
            ) : userLocation && (
              <div className="text-xs flex items-center gap-1 text-primary-foreground/80">
                <LocateFixed className="h-3 w-3" />
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
              variant={"outline"}
              onClick={() => handleMapViewToggle(false)}
              className={`flex-1 ${!isMapView ? "hidden" : ""}`}
            >
              <List className="mr-2 h-4 w-4" /> Resultados {isMapView && businesses.length > 0 && `(${businesses.length})`}
            </Button>
            <Button
              variant={isMapView ? "default" : "outline"}
              onClick={() => handleMapViewToggle(true)}
              className="flex-1"
            >
              <Map className="mr-2 h-4 w-4" /> Mapa
            </Button>

            {/* Botón Mi ubicación (solo icono) */}
            <Button
              variant="outline"
              onClick={requestUserLocation}
              disabled={isLoadingLocation}
              className="w-10 px-0"
            >
              {isLoadingLocation ? (
                <span className="animate-spin text-xs">↻</span>
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
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
                {displayCategories.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
            <div className={cn(
              "flex-1 min-w-[180px] md:min-w-[240px] max-w-[280px] flex items-center gap-2 p-2 bg-background rounded-md border",
              locationError && "border-destructive"
            )}>
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

              {locationError && !isLoadingLocation ? (
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => setShowManualLocationDialog(true)}
                        >
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[250px] bg-background border text-foreground">
                        <p className="font-medium text-destructive-foreground bg-destructive px-2 py-1 rounded-sm">Error de Ubicación</p>
                        <p className="mt-1">{locationError}</p>
                        <p className="mt-1 text-xs">Haz clic para configurar tu ubicación manualmente.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              ) : null}
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
              variant={"outline"}
              onClick={() => handleMapViewToggle(false)}
              className={!isMapView ? "hidden" : ""}
              size="sm"
            >
              <List className="mr-2 h-4 w-4" /> Resultados {isMapView && businesses.length > 0 && `(${businesses.length})`}
            </Button>
            <Button
              variant={isMapView ? "default" : "outline"}
              onClick={() => handleMapViewToggle(true)}
              size="sm"
            >
              <Map className="mr-2 h-4 w-4" /> Mapa
            </Button>

            {/* Botón Mi Ubicación (solo icono) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={requestUserLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <span className="animate-spin text-xs">↻</span>
                    ) : (
                      <LocateFixed className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Mi ubicación</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Mostrar información de la ubicación en modo escritorio */}
        {userLocation && !isLoadingLocation && (
          <div className="hidden sm:flex text-xs items-center gap-1 mt-1 text-muted-foreground">
            <LocateFixed className="h-3 w-3" />
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
                  <MapView
                    businesses={businesses}
                    userLocation={userLocation}
                    distance={distance}
                    onResetFilters={() => {
                      setQuery('');
                      setCategory('Todas');
                      setRating('0');
                      setSortBy('rating');
                      setDistance('0');
                      setDistanceValue([0]);
                      // Considerar si también se debe limpiar userLocation o si debe persistir
                      // setUserLocation(null);
                      // setUserAddress(null);
                      toast({
                        title: "Filtros limpiados",
                        description: "Se han restablecido los valores por defecto.",
                      });
                    }}
                  />
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

      {/* Agregar el diálogo de ubicación manual */}
      <ManualLocationDialog
        open={showManualLocationDialog}
        onOpenChange={setShowManualLocationDialog}
        onConfirm={handleManualLocationConfirm}
        ipLocation={ipLocation}
      />
    </div>
  );
}