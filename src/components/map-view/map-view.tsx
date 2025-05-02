'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon-2x.png';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import type { Business } from '@/types/business';

// Fix marker icon issue (shadow issue still persists)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default.src,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default.src,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default.src,
});

interface MapViewProps {
    businesses: Business[];
    zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ businesses, zoom = 13 }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (map) {
            const bounds = new L.LatLngBounds(businesses.map(business => [business.latitude, business.longitude]));
            map.fitBounds(bounds);
        }
    }, [businesses, map]);

    const initialPosition = businesses.length > 0 ? [businesses[0].latitude, businesses[0].longitude] : [0, 0];

    return (
        <MapContainer
            className="h-full w-full"
            center={initialPosition}
            zoom={zoom}
            scrollWheelZoom={false}
            ref={setMap}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {businesses.map(business => (
                <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                >
                    <Popup>
                        <div>
                            <h3>{business.name}</h3>
                            <p>{business.description}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;
