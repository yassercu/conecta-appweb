// src/components/map-view/map-view.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import type { Business } from '@/types/business';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail } from 'lucide-react';

// Fix marker icon issue using direct imports
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure Leaflet's default icon paths
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
});

interface MapViewProps {
    businesses?: Business[];
    center?: LatLngExpression;
    zoom?: number;
    className?: string;
    forceFitBounds?: boolean; // Renamed from fitBounds for clarity
}

// Default coordinates for Cuba and zoom level
const CUBA_CENTER: LatLngExpression = [21.5218, -77.7812];
const CUBA_ZOOM = 6;
const DEFAULT_ZOOM = 13;
const USER_LOCATION_ZOOM = 14;
const SINGLE_BUSINESS_ZOOM = 15;

// Component to handle map updates (centering, zooming, bounds fitting)
const MapUpdater: React.FC<{ center?: LatLngExpression; zoom?: number; bounds?: LatLngBoundsExpression }> = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            try {
                map.fitBounds(bounds, { padding: [50, 50] });
            } catch (error) {
                 console.error("Error fitting bounds:", error);
                 // Fallback if bounds are invalid
                 if(center && zoom) {
                    map.setView(center, zoom);
                 } else {
                    map.setView(CUBA_CENTER, CUBA_ZOOM);
                 }
            }
        } else if (center && zoom) {
            map.setView(center, zoom);
        }
    }, [center, zoom, bounds, map]);
    return null;
};

// Main MapView component
const MapView: React.FC<MapViewProps> = ({
    businesses = [],
    center: initialCenter,
    zoom: initialZoom,
    className = "h-full w-full",
    forceFitBounds = true, // Default behavior is to fit bounds if multiple markers
 }) => {
    const [currentCenter, setCurrentCenter] = useState<LatLngExpression | null>(initialCenter || null);
    const [currentZoom, setCurrentZoom] = useState<number>(initialZoom || DEFAULT_ZOOM);
    const [currentBounds, setCurrentBounds] = useState<LatLngBoundsExpression | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setHasError(false);

        try {
            // Filtrar negocios con coordenadas válidas
            const validBusinesses = businesses.filter(b => 
                b && b.latitude != null && b.longitude != null && 
                !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))
            );

            // Priority 1: Use businesses if provided
            if (validBusinesses.length > 0) {
                const shouldFitBounds = (validBusinesses.length > 1 || (validBusinesses.length === 1 && forceFitBounds));

                if (shouldFitBounds) {
                    try {
                        const bounds = new L.LatLngBounds(
                            validBusinesses.map(b => [Number(b.latitude), Number(b.longitude)] as LatLngExpression)
                        );
                        if (isMounted) {
                            setCurrentBounds(bounds);
                            setCurrentCenter(bounds.getCenter()); // Fallback center
                            setCurrentZoom(DEFAULT_ZOOM); // Fallback zoom, fitBounds will override
                        }
                    } catch (error) {
                        console.error("Error creating LatLngBounds:", error, validBusinesses);
                        if (isMounted) {
                            // Fallback for invalid bounds: center on the first valid business
                            setCurrentCenter([Number(validBusinesses[0].latitude), Number(validBusinesses[0].longitude)]);
                            setCurrentZoom(SINGLE_BUSINESS_ZOOM);
                            setCurrentBounds(null);
                        }
                    }
                } else {
                    // Single business and forceFitBounds is false
                    if (isMounted) {
                        setCurrentCenter([Number(validBusinesses[0].latitude), Number(validBusinesses[0].longitude)]);
                        setCurrentZoom(SINGLE_BUSINESS_ZOOM);
                        setCurrentBounds(null);
                    }
                }
                if (isMounted) setIsLoading(false);
                return; // Don't proceed to other priorities
            }

            // Priority 2: Use explicit center if provided (and no valid businesses)
            if (initialCenter && initialZoom) {
                if (isMounted) {
                    setCurrentCenter(initialCenter);
                    setCurrentZoom(initialZoom);
                    setCurrentBounds(null);
                    setIsLoading(false);
                }
                return;
            }

            // Priority 3: Try to get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (isMounted) {
                            setCurrentCenter([position.coords.latitude, position.coords.longitude]);
                            setCurrentZoom(USER_LOCATION_ZOOM);
                            setCurrentBounds(null);
                            setIsLoading(false);
                        }
                    },
                    (error) => {
                        console.warn("Error getting user location:", error.message);
                        // Priority 4: Default to Cuba if geolocation fails
                        if (isMounted) {
                            setCurrentCenter(CUBA_CENTER);
                            setCurrentZoom(CUBA_ZOOM);
                            setCurrentBounds(null);
                            setIsLoading(false);
                        }
                    },
                    { timeout: 5000 }
                );
            } else {
                console.warn("Geolocation is not supported by this browser.");
                // Priority 4: Default to Cuba if geolocation is not supported
                if (isMounted) {
                    setCurrentCenter(CUBA_CENTER);
                    setCurrentZoom(CUBA_ZOOM);
                    setCurrentBounds(null);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("Error al inicializar el mapa:", error);
            if (isMounted) {
                setHasError(true);
                setIsLoading(false);
                setCurrentCenter(CUBA_CENTER);
                setCurrentZoom(CUBA_ZOOM);
                setCurrentBounds(null);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [businesses, initialCenter, initialZoom, forceFitBounds]);

    if (isLoading || !currentCenter) {
        return <Skeleton className={className} />;
    }

    if (hasError) {
        return (
            <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
                <p>No se pudo cargar el mapa. Por favor, intente nuevamente.</p>
            </div>
        );
    }

    // Key to force re-render if map logic changes significantly (e.g., switching from center/zoom to bounds)
    const mapKey = currentBounds ? 'bounds' : `${currentCenter?.toString()}-${currentZoom}`;

    return (
        <MapContainer
            key={mapKey}
            className={className}
            center={currentCenter} // Use state for initial center
            zoom={currentZoom} // Use state for initial zoom
            scrollWheelZoom={true}
            ref={mapRef} // Assign map instance to ref
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* MapUpdater handles dynamic updates after initial render */}
            <MapUpdater center={currentBounds ? undefined : currentCenter} zoom={currentBounds ? undefined : currentZoom} bounds={currentBounds || undefined} />

            {businesses?.map(business => (
                 (business.latitude != null && business.longitude != null) ? (
                    <Marker
                        key={business.id}
                        position={[business.latitude, business.longitude]}
                    >
                        {/* Use the BusinessPopup component for content */}
                        <Popup>
                             <BusinessPopup business={business} />
                        </Popup>
                    </Marker>
                 ) : null
            ))}
        </MapContainer>
    );
};

// Helper component for the popup content (kept small and focused)
function BusinessPopup({ business }: { business: Business }) {
  return (
    <div className="w-60 space-y-1.5"> {/* Adjusted width and spacing */}
      <h3 className="font-semibold text-base">{business.name}</h3>
      {business.promoted && (
        <Badge
          variant="default"
          className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 border border-yellow-600"
        >
          ★ DESTACADO
        </Badge>
      )}
      <p className="text-xs text-muted-foreground">{business.category}</p>
      <Separator className="my-1" /> {/* Reduced margin */}
      <div className="space-y-0.5 text-xs"> {/* Reduced spacing */}
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
          <span>{business.address}</span>
        </div>
        {business.phone && (
          <div className="flex items-start gap-1.5">
            <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{business.phone}</span>
          </div>
        )}
        {business.email && (
          <div className="flex items-start gap-1.5">
            <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <a href={`mailto:${business.email}`} className="text-primary hover:underline truncate">{business.email}</a>
          </div>
        )}
      </div>
      <Separator className="my-1"/> {/* Reduced margin */}
      <Button asChild size="xs" className="w-full mt-1.5 h-7"> {/* Adjusted size and margin */}
        <a href={`/business/${business.id}`}>Ver Detalles</a>
      </Button>
    </div>
  );
}


export default MapView;
