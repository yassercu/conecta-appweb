'use client';

import React from 'react';
import type { Business } from '@/types/business';
import MapViewImplementation from '../MapViewImplementation';

export type LatLngExpression = [number, number];

export interface MapViewProps {
    businesses?: Business[];
    center?: LatLngExpression;
    zoom?: number;
    className?: string;
    forceFitBounds?: boolean;
}

/**
 * Componente de mapa usando OpenStreetMap (gratuito)
 * Esta es una implementación simplificada que no requiere librerías externas
 */
const MapView: React.FC<MapViewProps> = (props) => {
    // Usamos directamente nuestro componente de mapa con OpenStreetMap
    return <MapViewImplementation {...props} />;
};

export default MapView; 