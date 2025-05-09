'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Business } from '@/types/business';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, ZoomIn, ZoomOut, Home, X, Navigation, AlertCircle, Loader2, Globe } from 'lucide-react';

// Coordenadas por defecto (Cuba)
const DEFAULT_CENTER: [number, number] = [21.5218, -77.7812];
const DEFAULT_ZOOM = 7;
const BUSINESS_ZOOM = 15;

// URL base para las imágenes de los mosaicos de OpenStreetMap
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Reemplazos para los subdominios de OpenStreetMap
const SUBDOMAINS = ['a', 'b', 'c'];

// Función de debounce para evitar demasiadas actualizaciones
function debounce(func: Function, wait: number) {
    let timeout: number | null = null;
    return function (...args: any[]) {
        const context = this;
        if (timeout) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}

interface MapViewProps {
    businesses?: Business[];
    center?: [number, number];
    zoom?: number;
    className?: string;
    forceFitBounds?: boolean;
    userLocation?: { latitude: number, longitude: number } | null;
    distance?: string; // Distancia en km para mostrar el radio
}

// Tipo para los tiles del mapa
interface MapTile {
    key: string;
    url: string;
    x: number;
    y: number;
    z: number;
    left: number;
    top: number;
}

/**
 * Un componente de mapa que usa OpenStreetMap directamente
 * Esta implementación no requiere ninguna librería adicional
 */
const MapViewImplementation: React.FC<MapViewProps> = ({
    businesses = [],
    center: initialCenter,
    zoom: initialZoom,
    className = "h-full w-full",
    forceFitBounds = true,
    userLocation = null,
    distance = '0',
}: MapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [showPopup, setShowPopup] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(false);

    // Usar useRef para mantener valores que no deben desencadenar re-renders
    const currentCenterRef = useRef<[number, number]>(initialCenter || DEFAULT_CENTER);
    const currentZoomRef = useRef<number>(initialZoom || DEFAULT_ZOOM);

    // Estados que afectan al renderizado visual
    const [currentCenter, setCurrentCenter] = useState<[number, number]>(initialCenter || DEFAULT_CENTER);
    const [currentZoom, setCurrentZoom] = useState<number>(initialZoom || DEFAULT_ZOOM);
    const [mapTiles, setMapTiles] = useState<MapTile[]>([]);
    const [mapOrigin, setMapOrigin] = useState<[number, number]>([0, 0]);
    const [mapSize, setMapSize] = useState<[number, number]>([0, 0]);

    // Variables para el control de arrastre del mapa
    const isDraggingRef = useRef<boolean>(false);
    const startPosRef = useRef<[number, number]>([0, 0]);

    // Para evitar actualizaciones constantes
    const updateRequestRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);

    // Referencia para los tiles cargados (movido aquí para cumplir con las Rules of Hooks)
    const tilesLoaded = useRef<{ [key: string]: boolean }>({});

    // Lista de negocios válidos (con coordenadas)
    const validBusinesses = useMemo(() =>
        businesses.filter((b: Business) =>
            b && b.latitude != null && b.longitude != null &&
            !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))
        ), [businesses]
    );

    // Convertir coordenadas del usuario a formato interno
    const userLocationCoords = useMemo(() => {
        if (!userLocation) return null;
        return [userLocation.latitude, userLocation.longitude] as [number, number];
    }, [userLocation]);

    // Radio para el círculo de distancia en metros
    const distanceRadius = useMemo(() => {
        if (distance === '0' || !userLocation) return 0;
        return parseInt(distance) * 1000; // Convertir km a metros
    }, [distance, userLocation]);

    // Función para manejar cuando cada tile se carga completamente
    const handleTileLoad = useCallback((key: string) => {
        tilesLoaded.current[key] = true;
    }, []);

    // Convertir lat,lng a posición de píxeles (más preciso)
    const latLngToPixel = useCallback((lat: number, lng: number, zoom: number): [number, number] => {
        const scale = Math.pow(2, zoom);
        const worldSize = scale * 256;
        const x = (lng + 180) / 360 * worldSize;
        const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * worldSize;

        // Ajustar según el origen del mapa
        return [
            x - mapOrigin[0],
            y - mapOrigin[1]
        ];
    }, [mapOrigin]);

    // Calcular el radio del círculo en píxeles basado en la distancia y el zoom
    const calculateRadiusInPixels = useCallback((radiusInMeters: number, lat: number, zoom: number): number => {
        // En el ecuador, 1 grado = 111.32 km
        // El factor cambia con la latitud debido a la proyección Mercator
        const metersPerDegree = 111320 * Math.cos(lat * Math.PI / 180);
        const degreesRadius = radiusInMeters / metersPerDegree;

        // Convertir a píxeles basado en el zoom
        const scale = Math.pow(2, zoom);
        const pixelsPerDegree = scale * 256 / 360;

        return degreesRadius * pixelsPerDegree;
    }, []);

    // Obtener URL del mosaico de OpenStreetMap
    const getTileUrl = useCallback((x: number, y: number, z: number): string => {
        const subdomain = SUBDOMAINS[Math.abs(x + y) % SUBDOMAINS.length];
        return OSM_TILE_URL.replace('{s}', subdomain).replace('{z}', z.toString()).replace('{x}', x.toString()).replace('{y}', y.toString());
    }, []);

    // Calcular los tiles visibles basados en el centro y zoom actuales
    const calculateVisibleTiles = useCallback(() => {
        if (!mapRef.current) return;

        const now = Date.now();
        if (now - lastUpdateTimeRef.current < 100) {
            // Limitar la frecuencia de actualizaciones
            if (updateRequestRef.current) {
                cancelAnimationFrame(updateRequestRef.current);
            }
            updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
            return;
        }

        lastUpdateTimeRef.current = now;
        updateRequestRef.current = null;

        const mapWidth = mapRef.current.clientWidth;
        const mapHeight = mapRef.current.clientHeight;

        // Si las dimensiones son 0, probablemente el DOM aún no está listo
        if (mapWidth === 0 || mapHeight === 0) {
            // Intentar de nuevo en un momento
            setTimeout(calculateVisibleTiles, 100);
            return;
        }

        setMapSize([mapWidth, mapHeight]);

        const zoom = currentZoomRef.current;
        const center = currentCenterRef.current;
        const scale = Math.pow(2, zoom);
        const worldSize = scale * 256;

        // Calcular el pixel central en coordenadas mundiales
        const centerPoint = [
            (center[1] + 180) / 360 * worldSize,
            (1 - Math.log(Math.tan(center[0] * Math.PI / 180) + 1 / Math.cos(center[0] * Math.PI / 180)) / Math.PI) / 2 * worldSize
        ];

        // Calcular el origen del mapa (esquina superior izquierda en coordenadas mundiales)
        const origin = [
            centerPoint[0] - mapWidth / 2,
            centerPoint[1] - mapHeight / 2
        ];
        setMapOrigin(origin as [number, number]);

        // Calcular índices de tiles visibles
        const tileSize = 256;
        const startX = Math.floor(origin[0] / tileSize);
        const startY = Math.floor(origin[1] / tileSize);
        const endX = Math.ceil((origin[0] + mapWidth) / tileSize);
        const endY = Math.ceil((origin[1] + mapHeight) / tileSize);

        const tiles: MapTile[] = [];

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                // Asegurar que los índices están dentro del rango válido
                if (x < 0 || y < 0 || x >= scale || y >= scale) continue;

                const left = x * tileSize - origin[0];
                const top = y * tileSize - origin[1];

                tiles.push({
                    key: `${zoom}-${x}-${y}`,
                    url: getTileUrl(x, y, zoom),
                    x,
                    y,
                    z: zoom,
                    left,
                    top
                });
            }
        }

        setMapTiles(tiles);
    }, [getTileUrl]);

    // Función auxiliar para manejar errores de geolocalización
    const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
        let errorMsg;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMsg = "Usuario denegó la solicitud de geolocalización";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMsg = "Información de ubicación no disponible. Intenta en un área con mejor cobertura GPS/WiFi";
                break;
            case error.TIMEOUT:
                errorMsg = "La solicitud para obtener la ubicación del usuario expiró";
                break;
            default:
                errorMsg = "Error desconocido al obtener la ubicación";
        }
        console.warn(`Error de geolocalización: ${errorMsg}`, error);
        setLocationError(errorMsg);
        setIsLocating(false);
    }, []);

    // Función para obtener la ubicación del usuario
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Tu navegador no soporta geolocalización");
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        // Intentar usar primero watchPosition para obtener actualizaciones continuas
        // Esto puede ayudar en algunos dispositivos donde getCurrentPosition falla
        try {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });

                    // Actualizar centro del mapa a la ubicación del usuario
                    currentCenterRef.current = [latitude, longitude];
                    setCurrentCenter([latitude, longitude]);
                    currentZoomRef.current = 13; // Zoom apropiado para ubicación de usuario
                    setCurrentZoom(13);

                    setIsLocating(false);

                    // Una vez obtenida la ubicación, dejar de observar
                    navigator.geolocation.clearWatch(watchId);

                    // Solicitar actualización del mapa
                    if (updateRequestRef.current) {
                        cancelAnimationFrame(updateRequestRef.current);
                    }
                    updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
                },
                (error) => {
                    // Si watchPosition falla, intentamos con getCurrentPosition
                    handleGeolocationError(error);

                    // Limpiar el observador
                    navigator.geolocation.clearWatch(watchId);

                    // Intentar con getCurrentPosition como respaldo
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setUserLocation({ latitude, longitude });
                            currentCenterRef.current = [latitude, longitude];
                            setCurrentCenter([latitude, longitude]);
                            currentZoomRef.current = 13;
                            setCurrentZoom(13);
                            setIsLocating(false);

                            // Actualizar mapa
                            if (updateRequestRef.current) {
                                cancelAnimationFrame(updateRequestRef.current);
                            }
                            updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
                        },
                        handleGeolocationError,
                        {
                            enableHighAccuracy: false, // Intentar sin alta precisión como alternativa
                            timeout: 15000,
                            maximumAge: 60000
                        }
                    );
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0 // Siempre obtener una posición fresca
                }
            );
        } catch (e) {
            // Si watchPosition no está disponible o lanza un error, usamos getCurrentPosition directamente
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    currentCenterRef.current = [latitude, longitude];
                    setCurrentCenter([latitude, longitude]);
                    currentZoomRef.current = 13;
                    setCurrentZoom(13);
                    setIsLocating(false);

                    // Actualizar mapa
                    if (updateRequestRef.current) {
                        cancelAnimationFrame(updateRequestRef.current);
                    }
                    updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
                },
                handleGeolocationError,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }
    }, [calculateVisibleTiles, handleGeolocationError]);

    // Intentar obtener la ubicación del usuario al iniciar
    useEffect(() => {
        // Solo intentamos obtener la ubicación del usuario si no hay un centro inicial especificado
        if (!initialCenter && !forceFitBounds && navigator.geolocation) {
            getUserLocation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ajustar la vista para mostrar todos los negocios (solo se ejecuta una vez al inicio)
    useEffect(() => {
        if (validBusinesses.length > 0 && forceFitBounds) {
            try {
                let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                validBusinesses.forEach(business => {
                    const lat = Number(business.latitude);
                    const lng = Number(business.longitude);
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);
                });
                const latMargin = Math.max((maxLat - minLat) * 0.2, 0.1);
                const lngMargin = Math.max((maxLng - minLng) * 0.2, 0.1);
                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                let newZoom;
                if (validBusinesses.length === 1) {
                    newZoom = BUSINESS_ZOOM;
                } else {
                    const latDiff = maxLat - minLat + latMargin * 2;
                    const lngDiff = maxLng - minLng + lngMargin * 2;
                    const latZoom = Math.log2(180 / latDiff);
                    const lngZoom = Math.log2(360 / lngDiff);
                    newZoom = Math.min(latZoom, lngZoom, 18);
                    newZoom = Math.max(Math.floor(newZoom), 5);
                }

                // Actualizar ambos: el estado y la ref
                currentCenterRef.current = [centerLat, centerLng];
                currentZoomRef.current = newZoom;
                setCurrentCenter([centerLat, centerLng]);
                setCurrentZoom(newZoom);
            } catch (error) {
                // En caso de error, usar valores por defecto
                currentCenterRef.current = initialCenter || DEFAULT_CENTER;
                currentZoomRef.current = initialZoom || DEFAULT_ZOOM;
                setCurrentCenter(initialCenter || DEFAULT_CENTER);
                setCurrentZoom(initialZoom || DEFAULT_ZOOM);
            }
        } else if (initialCenter && initialZoom) {
            currentCenterRef.current = initialCenter;
            currentZoomRef.current = initialZoom;
            setCurrentCenter(initialCenter);
            setCurrentZoom(initialZoom);
        } else {
            // Si no hay negocios ni ubicación inicial, usamos la ubicación del usuario o el centro predeterminado
            if (userLocation) {
                currentCenterRef.current = userLocation;
                currentZoomRef.current = 13;
                setCurrentCenter(userLocation);
                setCurrentZoom(13);
            } else {
                currentCenterRef.current = DEFAULT_CENTER;
                currentZoomRef.current = DEFAULT_ZOOM;
                setCurrentCenter(DEFAULT_CENTER);
                setCurrentZoom(DEFAULT_ZOOM);
            }
        }
        // Ejecutar solo una vez al montar el componente
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mantener sincronizados los estados y las refs
    useEffect(() => {
        currentCenterRef.current = currentCenter;
    }, [currentCenter]);

    useEffect(() => {
        currentZoomRef.current = currentZoom;
    }, [currentZoom]);

    // Recalcular tiles cuando cambia el centro o zoom
    useEffect(() => {
        calculateVisibleTiles();

        // Configurar el manejador de redimensionamiento
        const handleResize = () => {
            if (updateRequestRef.current) {
                cancelAnimationFrame(updateRequestRef.current);
            }
            updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (updateRequestRef.current) {
                cancelAnimationFrame(updateRequestRef.current);
            }
        };
    }, [calculateVisibleTiles]);

    // Inicialización - solo se ejecuta una vez
    useEffect(() => {
        // Simulación de progreso de carga
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                // Incrementar más lento en el medio para dar sensación de carga real
                const increment = prev < 30 ? 5 : prev < 70 ? 2 : 4;
                const newProgress = Math.min(prev + increment, 95);
                return newProgress;
            });
        }, 150);

        const timer = setTimeout(() => {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setIsLoading(false);
        }, 1500);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, []);

    // Efecto adicional para garantizar que el mapa se renderice correctamente al finalizar la carga
    useEffect(() => {
        if (!isLoading && mapRef.current) {
            // Pequeño retraso para asegurar que el DOM está completamente listo
            const renderTimer = setTimeout(() => {
                calculateVisibleTiles();

                // Forzar una segunda actualización para asegurar que todos los tiles se cargan correctamente
                setTimeout(() => {
                    calculateVisibleTiles();
                }, 300);

                // Y una tercera actualización después de un tiempo más largo para asegurar que todo está correcto
                setTimeout(() => {
                    if (mapRef.current && mapTiles.length === 0) {
                        // Si aún no hay tiles, intentar forzar un renderizado completo
                        const forceResize = () => {
                            if (mapRef.current) {
                                // Actualizar dimensiones de forma explícita
                                setMapSize([mapRef.current.clientWidth, mapRef.current.clientHeight]);
                                // Recalcular con los valores actualizados
                                calculateVisibleTiles();
                            }
                        };

                        forceResize();
                    }
                }, 800);
            }, 200);

            return () => clearTimeout(renderTimer);
        }
    }, [isLoading, calculateVisibleTiles, mapTiles.length]);

    // Efecto para centrar el mapa en la ubicación del usuario cuando esté disponible
    useEffect(() => {
        if (userLocation && userLocationCoords) {
            // Centrar el mapa en la ubicación del usuario
            console.log("Centrando mapa en la ubicación del usuario:", userLocationCoords);
            currentCenterRef.current = userLocationCoords;
            setCurrentCenter(userLocationCoords);

            if (!initialZoom) {
                // Si no hay un zoom inicial, usar uno adecuado para visualizar el radio
                const newZoom = distance !== '0' ?
                    (parseInt(distance) <= 5 ? 14 : parseInt(distance) <= 10 ? 13 : 12) :
                    13;
                currentZoomRef.current = newZoom;
                setCurrentZoom(newZoom);
            }

            // Solicitar actualización del mapa
            if (updateRequestRef.current) {
                cancelAnimationFrame(updateRequestRef.current);
            }
            updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
        }
    }, [userLocation, userLocationCoords, calculateVisibleTiles, distance, initialZoom]);

    // Manejadores de eventos
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) { // Solo botón izquierdo
            isDraggingRef.current = true;
            startPosRef.current = [e.clientX, e.clientY];
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - startPosRef.current[0];
        const dy = e.clientY - startPosRef.current[1];

        // Mover el mapa en tiempo real
        const scale = Math.pow(2, currentZoomRef.current);
        const worldSize = scale * 256;

        const deltaLng = -dx * 360 / worldSize;
        const deltaLat = dy * 180 / worldSize;

        const [curLat, curLng] = currentCenterRef.current;
        const newLat = curLat + deltaLat;
        const newLng = curLng + deltaLng;

        // Limitar latitud entre -85 y 85 grados
        const clampedLat = Math.max(-85, Math.min(85, newLat));

        // Actualizar las referencias y los estados
        const newCenter: [number, number] = [clampedLat, newLng];
        currentCenterRef.current = newCenter;
        setCurrentCenter(newCenter);

        // Preparar para el próximo movimiento
        startPosRef.current = [e.clientX, e.clientY];

        // Solicitar actualización de tiles
        if (updateRequestRef.current) {
            cancelAnimationFrame(updateRequestRef.current);
        }
        updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
    }, [calculateVisibleTiles]);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
        }
    }, []);

    // Funciones de zoom mejoradas para evitar actualizaciones constantes
    const handleZoomIn = useCallback(() => {
        const newZoom = Math.min(18, currentZoomRef.current + 1);
        currentZoomRef.current = newZoom;
        setCurrentZoom(newZoom);

        if (updateRequestRef.current) {
            cancelAnimationFrame(updateRequestRef.current);
        }
        updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
    }, [calculateVisibleTiles]);

    const handleZoomOut = useCallback(() => {
        const newZoom = Math.max(1, currentZoomRef.current - 1);
        currentZoomRef.current = newZoom;
        setCurrentZoom(newZoom);

        if (updateRequestRef.current) {
            cancelAnimationFrame(updateRequestRef.current);
        }
        updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
    }, [calculateVisibleTiles]);

    // Función modificada para resetear la vista a Cuba (en lugar de Puerto Rico)
    const handleResetView = useCallback(() => {
        currentCenterRef.current = DEFAULT_CENTER;
        currentZoomRef.current = DEFAULT_ZOOM;
        setCurrentCenter(DEFAULT_CENTER);
        setCurrentZoom(DEFAULT_ZOOM);

        if (updateRequestRef.current) {
            cancelAnimationFrame(updateRequestRef.current);
        }
        updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
    }, [calculateVisibleTiles]);

    // Función para centrar el mapa en la ubicación del usuario
    const handleLocateUser = useCallback(() => {
        if (isLocating) return; // Evitar múltiples solicitudes

        if (userLocation) {
            // Si ya tenemos la ubicación, centramos el mapa en ella
            currentCenterRef.current = userLocation;
            currentZoomRef.current = 13;
            setCurrentCenter(userLocation);
            setCurrentZoom(13);

            if (updateRequestRef.current) {
                cancelAnimationFrame(updateRequestRef.current);
            }
            updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
        } else {
            // Si no tenemos la ubicación, intentamos obtenerla
            getUserLocation();
        }
    }, [calculateVisibleTiles, getUserLocation, isLocating, userLocation]);

    const handleBusinessClick = useCallback((businessId: string) => {
        setShowPopup((prev: string | null) => prev === businessId ? null : businessId);
    }, []);

    // Memoizar las posiciones de los marcadores para evitar parpadeo
    const markersPositions = useMemo(() =>
        validBusinesses.map(business => {
            const lat = Number(business.latitude);
            const lng = Number(business.longitude);
            const [x, y] = latLngToPixel(lat, lng, currentZoom);

            // Solo incluir si está dentro de los límites visibles
            const isVisible = x >= -20 && x <= mapSize[0] + 20 && y >= -20 && y <= mapSize[1] + 20;

            return {
                business,
                x,
                y,
                isVisible
            };
        }),
        [validBusinesses, latLngToPixel, currentZoom, mapSize]
    );

    // Renderizar el mapa
    return (
        <div
            ref={mapRef}
            className={`relative overflow-hidden ${className}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleZoomIn}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
            style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        >
            {/* Contenedor para los tiles del mapa */}
            <div className="absolute inset-0">
                {mapTiles.map(tile => (
                    <div
                        key={tile.key}
                        className="absolute"
                        style={{
                            left: `${tile.left}px`,
                            top: `${tile.top}px`,
                            width: '256px',
                            height: '256px',
                        }}
                    >
                        <img
                            src={tile.url}
                            alt={`Map tile ${tile.z}-${tile.x}-${tile.y}`}
                            className="w-full h-full select-none"
                            onLoad={() => handleTileLoad(tile.key)}
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Marcadores de negocios */}
            {validBusinesses.map((business) => {
                const pixelPos = latLngToPixel(
                    Number(business.latitude),
                    Number(business.longitude),
                    currentZoom
                );

                // Asignar colores diferentes según el tipo de negocio
                const getBusinessColor = () => {
                    if (business.promoted) return 'bg-amber-500';

                    // Determinar color según la categoría
                    switch (business.category) {
                        case 'Restaurante':
                            return 'bg-red-500';
                        case 'Salud y Belleza':
                            return 'bg-pink-500';
                        case 'Tecnología':
                            return 'bg-blue-500';
                        case 'Hogar y Decoración':
                            return 'bg-green-500';
                        case 'Moda':
                            return 'bg-purple-500';
                        case 'Alimentos':
                            return 'bg-orange-500';
                        default:
                            return 'bg-primary';
                    }
                };

                return (
                    <div
                        key={business.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
                        style={{
                            left: `${pixelPos[0]}px`,
                            top: `${pixelPos[1]}px`,
                        }}
                        onClick={() => handleBusinessClick(business.id)}
                    >
                        <div className="relative flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getBusinessColor()} shadow-md animate-bounce-small`}>
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-2 h-2 bg-black opacity-30 rounded-full mt-1" />
                        </div>
                    </div>
                );
            })}

            {/* Círculo de radio para la distancia filtrada */}
            {userLocationCoords && distanceRadius > 0 && (
                <div
                    className="absolute z-5 rounded-full border-2 border-primary/60 bg-primary/10 pointer-events-none"
                    style={{
                        left: `${latLngToPixel(userLocationCoords[0], userLocationCoords[1], currentZoom)[0]}px`,
                        top: `${latLngToPixel(userLocationCoords[0], userLocationCoords[1], currentZoom)[1]}px`,
                        width: `${calculateRadiusInPixels(distanceRadius, userLocationCoords[0], currentZoom) * 2}px`,
                        height: `${calculateRadiusInPixels(distanceRadius, userLocationCoords[0], currentZoom) * 2}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            )}

            {/* Marcador de ubicación del usuario */}
            {userLocationCoords && (
                <div
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `${latLngToPixel(userLocationCoords[0], userLocationCoords[1], currentZoom)[0]}px`,
                        top: `${latLngToPixel(userLocationCoords[0], userLocationCoords[1], currentZoom)[1]}px`,
                    }}
                >
                    <div className="relative flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 shadow-md animate-pulse">
                            <Navigation className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-3 h-3 bg-black opacity-30 rounded-full mt-1" />
                    </div>
                </div>
            )}

            {/* Popup con información de negocio en el mapa */}
            {showPopup && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowPopup(null)} style={{ cursor: 'pointer', pointerEvents: 'all' }} />
                    <div className="relative max-w-md w-full mx-4 pointer-events-auto">
                        <div className="bg-white rounded-lg shadow-xl p-4">
                            <BusinessPopup
                                business={validBusinesses.find(b => b.id === showPopup)!}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute -top-2 -right-2 rounded-full bg-white shadow-md"
                                onClick={() => setShowPopup(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Controles del mapa */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                <Button variant="outline" size="icon" className="bg-white/90" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/90" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/90" onClick={handleResetView}>
                    <Home className="h-4 w-4" />
                </Button>
            </div>

            {/* Indicador de carga */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
                    <Skeleton className="h-[250px] w-[90%] rounded-lg" />
                    <div className="mt-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Cargando mapa...</p>
                    <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error de ubicación */}
            {locationError && isLocating && (
                <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-white p-3 rounded-md shadow-lg z-50 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{locationError}</p>
                </div>
            )}

            {/* Atribución */}
            <div className="absolute bottom-2 left-2 text-[8px] text-muted-foreground p-1 bg-white/60 rounded z-10">
                <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="hover:underline">OpenStreetMap</a> contributors</span>
            </div>
        </div>
    );
};

// Componente para el popup del negocio
function BusinessPopup({ business }: { business: Business }) {
    return (
        <div className="w-full space-y-1.5">
            <h3 className="font-semibold text-sm">{business.name}</h3>
            {business.promoted && (
                <span
                    className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 border border-yellow-600 rounded font-semibold inline-block"
                >
                    ★ DESTACADO
                </span>
            )}
            <p className="text-xs text-muted-foreground">{business.category}</p>
            <Separator className="my-1" />
            <div className="space-y-0.5 text-xs">
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
            <Button asChild size="sm" className="w-full mt-1.5 h-7">
                <a href={`/business/${business.id}`}>Ver Detalles</a>
            </Button>
        </div>
    );
}

export default MapViewImplementation; 