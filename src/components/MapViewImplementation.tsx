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
}: MapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [showPopup, setShowPopup] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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

    // Función para manejar cuando cada tile se carga completamente
    const handleTileLoad = useCallback((key: string) => {
        tilesLoaded.current[key] = true;
    }, []);

    // Función para obtener la ubicación del usuario
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Tu navegador no soporta geolocalización");
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);

                // Actualizar centro del mapa a la ubicación del usuario
                currentCenterRef.current = [latitude, longitude];
                setCurrentCenter([latitude, longitude]);
                currentZoomRef.current = 13; // Zoom apropiado para ubicación de usuario
                setCurrentZoom(13);

                setIsLocating(false);

                // Solicitar actualización del mapa
                if (updateRequestRef.current) {
                    cancelAnimationFrame(updateRequestRef.current);
                }
                updateRequestRef.current = requestAnimationFrame(calculateVisibleTiles);
            },
            (error) => {
                let errorMsg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Usuario denegó la solicitud de geolocalización";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Información de ubicación no disponible";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "La solicitud para obtener la ubicación del usuario expiró";
                        break;
                    default:
                        errorMsg = "Error desconocido al obtener la ubicación";
                }
                setLocationError(errorMsg);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
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

    // Renderizado de carga mejorado
    if (isLoading) {
        return (
            <div className={`${className} border rounded-md bg-gray-50 flex flex-col justify-center items-center relative overflow-hidden`} style={{ minHeight: '400px' }}>
                {/* Fondo del mapa simulado durante la carga */}
                <div className="absolute inset-0 bg-blue-50/80"></div>

                {/* Contenido de carga */}
                <div className="flex flex-col items-center justify-center space-y-4 z-10">
                    <div className="text-primary flex items-center justify-center flex-col">
                        <Globe className="h-16 w-16 text-primary/60 animate-pulse" />
                        <div className="animate-spin mt-2">
                            <Loader2 className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    <h3 className="text-base font-medium text-gray-700">Cargando mapa...</h3>

                    {/* Barra de progreso */}
                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">Preparando visualización del mapa {loadingProgress}%</p>
                </div>

                {/* Skeleton del mapa para mostrar la estructura */}
                <div className="absolute inset-0 z-0">
                    <Skeleton className="h-full w-full opacity-30" />
                </div>
            </div>
        );
    }

    // Cuando el mapa no está cargando, mostramos el mapa real
    return (
        <div
            ref={mapRef}
            className={`${className} relative overflow-hidden bg-blue-50 border rounded-md select-none`}
            style={{ minHeight: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Fondo del mapa */}
            <div className="absolute inset-0 bg-blue-100"></div>

            {/* Capa de tiles */}
            <div className="absolute inset-0 overflow-hidden">
                {mapTiles.map((tile: MapTile) => (
                    <img
                        key={tile.key}
                        src={tile.url}
                        alt=""
                        crossOrigin="anonymous"
                        referrerPolicy="origin"
                        className="absolute select-none pointer-events-none"
                        style={{
                            left: `${tile.left}px`,
                            top: `${tile.top}px`,
                            width: '256px',
                            height: '256px'
                        }}
                        onLoad={() => handleTileLoad(tile.key)}
                        onDragStart={e => e.preventDefault()}
                    />
                ))}
            </div>

            {/* Marcador de ubicación del usuario */}
            {userLocation && (
                <div
                    className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `${latLngToPixel(userLocation[0], userLocation[1], currentZoom)[0]}px`,
                        top: `${latLngToPixel(userLocation[0], userLocation[1], currentZoom)[1]}px`,
                    }}
                >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            )}

            {/* Marcadores para los negocios */}
            <div className="absolute inset-0 pointer-events-none">
                {markersPositions
                    .filter(m => m.isVisible)
                    .map(({ business, x, y }) => (
                        <div
                            key={business.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                            style={{
                                left: `${x}px`,
                                top: `${y}px`
                            }}
                            onClick={() => handleBusinessClick(business.id)}
                        >
                            <div className={`flex flex-col items-center group ${showPopup === business.id ? 'z-30' : 'z-20'}`}>
                                <div className={`bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md cursor-pointer 
                                    hover:bg-red-600 transition-all duration-200 ${business.promoted ? 'animate-pulse' : ''} 
                                    ${showPopup === business.id ? 'ring-4 ring-primary/50' : ''}`}>
                                    <MapPin className="h-4 w-4" />
                                </div>

                                {/* Nombre del negocio al hacer hover */}
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-md 
                                    text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-max">
                                    {business.name}
                                </div>

                                {/* Popup de información */}
                                {showPopup === business.id && (
                                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-[280px]">
                                        <div className="bg-white rounded-md shadow-lg p-3 max-w-xs">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex-1">
                                                    <BusinessPopup business={business} />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 -mt-1 -mr-1"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        setShowPopup(null);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Información de atribución (requerida por OpenStreetMap) */}
            <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-0.5 text-[10px] z-50">
                &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    OpenStreetMap
                </a> contributors
            </div>

            {/* Controles del mapa */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-50">
                <Button size="icon" variant="secondary" onClick={handleZoomIn} title="Acercar">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={handleZoomOut} title="Alejar">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={handleResetView} title="Centrar en Cuba">
                    <Home className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleLocateUser}
                    title="Mi ubicación"
                    disabled={isLocating}
                    className={`${userLocation ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''} ${isLocating ? 'animate-pulse' : ''}`}
                >
                    <Navigation className="h-4 w-4" />
                </Button>
            </div>

            {/* Error de ubicación */}
            {locationError && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-3 py-1.5 rounded z-50 text-xs flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {locationError}
                </div>
            )}

            {/* Lista de negocios */}
            {validBusinesses.length > 0 && (
                <div className="absolute top-2 left-2 bg-white rounded-md shadow-md p-2 max-w-xs z-40">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-sm text-gray-800">Negocios ({validBusinesses.length})</h4>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        <ul className="space-y-1">
                            {validBusinesses.map((business: Business) => (
                                <li
                                    key={business.id}
                                    className={`text-xs flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer ${showPopup === business.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                    onClick={() => handleBusinessClick(business.id)}
                                >
                                    <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                                    <span className="truncate font-semibold text-gray-700">{business.name}</span>
                                    <span className="ml-1 text-[10px] text-gray-500 font-medium">{business.location}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
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