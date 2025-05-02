'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import type { Business } from '@/types/business';

// Fix marker icon issue
// Use static imports for image paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete the prototype method override
// delete L.Icon.Default.prototype._getIconUrl; // No longer needed

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src, // Use the imported variable's src
    iconUrl: markerIcon.src,         // Use the imported variable's src
    shadowUrl: markerShadow.src,       // Use the imported variable's src
});

interface MapViewProps {
    businesses: Business[];
    zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ businesses, zoom = 13 }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (map && businesses.length > 0) {
            try {
                 const bounds = new L.LatLngBounds(businesses.map(business => [business.latitude, business.longitude]));
                 map.fitBounds(bounds);
            } catch (error) {
                console.error("Error creating LatLngBounds or fitting map:", error, businesses);
                 // Fallback: Center on the first business if bounds fail
                 if (businesses[0]) {
                     map.setView([businesses[0].latitude, businesses[0].longitude], zoom);
                 }
            }
        } else if (map && businesses.length === 0) {
            // Default view if no businesses (e.g., center of a city or country)
             map.setView([37.7749, -122.4194], 10); // Example: San Francisco
        }
    }, [businesses, map, zoom]);

    // Calculate initial position safely
    const getInitialPosition = (): L.LatLngTuple => {
        if (businesses.length > 0 && businesses[0]?.latitude != null && businesses[0]?.longitude != null) {
            return [businesses[0].latitude, businesses[0].longitude];
        }
        return [37.7749, -122.4194]; // Default fallback (e.g., San Francisco)
    };

    const initialPosition = getInitialPosition();

    return (
        <MapContainer
            className="h-full w-full"
            center={initialPosition}
            zoom={zoom}
            scrollWheelZoom={false}
            ref={setMap} // Use the state setter directly as the ref callback
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Use {s} subdomain
            />
            {businesses.map(business => (
                 (business.latitude != null && business.longitude != null) ? (
                    <Marker
                        key={business.id}
                        position={[business.latitude, business.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-semibold">{business.name}</h3>
                                {business.description && <p className="text-sm text-muted-foreground">{business.description}</p>}
                                {/* Optionally add a link */}
                                <a href={`/business/${business.id}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-1 block">
                                    Ver Detalles
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                 ) : null // Don't render marker if lat/lng are missing
            ))}
        </MapContainer>
    );
};

export default MapView;
