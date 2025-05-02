'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import type { Business } from '@/types/business';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Fix marker icon issue using static imports
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure Leaflet's default icon paths
// delete (L.Icon.Default.prototype as any)._getIconUrl; // Remove potential override if exists
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
});


interface MapViewProps {
    businesses?: Business[]; // Make businesses optional for default view
    center?: LatLngExpression; // Allow passing explicit center
    zoom?: number; // Allow passing explicit zoom
    className?: string; // Allow custom styling
    fitBounds?: boolean; // Option to fit bounds even for single business
}

// Default coordinates for Cuba and zoom level
const CUBA_CENTER: LatLngExpression = [21.5218, -77.7812];
const CUBA_ZOOM = 6;
const DEFAULT_ZOOM = 13;
const USER_LOCATION_ZOOM = 14;
const SINGLE_BUSINESS_ZOOM = 15;

const MapUpdater: React.FC<{ center?: LatLngExpression; zoom?: number; bounds?: LatLngBoundsExpression }> = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            try {
                map.fitBounds(bounds, { padding: [50, 50] }); // Add padding
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


const MapView: React.FC<MapViewProps> = ({
    businesses = [], // Default to empty array
    center: initialCenter,
    zoom: initialZoom,
    className = "h-full w-full",
    fitBounds: forceFitBounds = false,
 }) => {
    const [currentCenter, setCurrentCenter] = useState<LatLngExpression | null>(initialCenter || null);
    const [currentZoom, setCurrentZoom] = useState<number>(initialZoom || DEFAULT_ZOOM);
    const [currentBounds, setCurrentBounds] = useState<LatLngBoundsExpression | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading until location is determined
    const mapRef = useRef<L.Map | null>(null);


    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        setIsLoading(true);

        // Priority 1: Use businesses if provided
        if (businesses && businesses.length > 0) {
            const validBusinesses = businesses.filter(b => b.latitude != null && b.longitude != null);
            if (validBusinesses.length > 0) {
                if (validBusinesses.length > 1 || forceFitBounds) {
                    try {
                        const bounds = new L.LatLngBounds(validBusinesses.map(b => [b.latitude, b.longitude]));
                         if (isMounted) {
                            setCurrentBounds(bounds);
                            // Let MapUpdater handle zoom/center via fitBounds
                            setCurrentCenter(bounds.getCenter()); // Set a fallback center
                            setCurrentZoom(DEFAULT_ZOOM); // Set a fallback zoom
                         }
                    } catch (error) {
                         console.error("Error creating LatLngBounds:", error, validBusinesses);
                          // Fallback for invalid bounds: center on the first valid business
                         if (isMounted) {
                            setCurrentCenter([validBusinesses[0].latitude, validBusinesses[0].longitude]);
                            setCurrentZoom(SINGLE_BUSINESS_ZOOM);
                            setCurrentBounds(null);
                         }
                    }
                } else {
                    // Single business
                     if (isMounted) {
                        setCurrentCenter([validBusinesses[0].latitude, validBusinesses[0].longitude]);
                        setCurrentZoom(SINGLE_BUSINESS_ZOOM);
                        setCurrentBounds(null);
                     }
                }
                 if (isMounted) setIsLoading(false);
                return; // Don't proceed to geolocation or default
            }
        }

        // Priority 2: Use explicit center if provided (and no businesses)
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
                        console.log("User location obtained:", position.coords);
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
                { timeout: 5000 } // Add a timeout
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

        return () => {
            isMounted = false; // Cleanup function to set flag
        };

    }, [businesses, initialCenter, initialZoom, forceFitBounds]); // Rerun if businesses or initial props change

    if (isLoading || !currentCenter) {
        return <Skeleton className={className} />; // Show skeleton while loading initial center
    }

    // Add key to MapContainer to force re-render when center/bounds logic changes significantly
    const mapKey = currentBounds ? 'bounds' : `${currentCenter.toString()}-${currentZoom}`;

    return (
        <MapContainer
            key={mapKey} // Force re-mount might be needed if switching between bounds/center drastically
            className={className}
            center={currentCenter} // Initial center for first render
            zoom={currentZoom} // Initial zoom for first render
            scrollWheelZoom={true} // Enable scroll wheel zoom
            whenCreated={instance => { mapRef.current = instance; }} // Assign map instance to ref
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Use MapUpdater component to handle dynamic updates */}
            <MapUpdater center={currentBounds ? undefined : currentCenter} zoom={currentBounds ? undefined : currentZoom} bounds={currentBounds || undefined} />

            {businesses?.map(business => (
                 (business.latitude != null && business.longitude != null) ? (
                    <Marker
                        key={business.id}
                        position={[business.latitude, business.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-semibold">{business.name}</h3>
                                <p className="text-sm text-muted-foreground">{business.address}</p>
                                <a href={`/business/${business.id}`} className="text-primary text-sm hover:underline mt-1 block">
                                    Ver Detalles
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                 ) : null
            ))}
        </MapContainer>
    );
};

export default MapView;
```
  </change>
  <change>
    <file>src/app/business/[id]/page.tsx</file>
    <description>Update business detail page to correctly use the improved MapView component, passing the single business and setting forceFitBounds to false.</description>
    <content><![CDATA[import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MapPin, Phone, Mail, Star, ShoppingBag, MessageSquare } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Link from "next/link"; // Import Link
import dynamic from 'next/dynamic';
import type { Business } from '@/types/business'; // Import the Business type
import { getBusinessDetails } from "@/lib/data"; // Import data fetching function

// Dynamically import Map component to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map-view/map-view'), {
  ssr: false,
  loading: () => <div className="h-40 bg-muted rounded-md flex items-center justify-center text-muted-foreground">Cargando mapa...</div>,
});


// Placeholder review data (Spanish)
const reviews = [
    { id: 'r1', author: 'Alicia', rating: 5, comment: '¡Café y ambiente increíbles!', date: 'Hace 2 días' },
    { id: 'r2', author: 'Roberto', rating: 4, comment: 'Buen lugar, a veces un poco lleno.', date: 'Hace 1 semana' },
    { id: 'r3', author: 'Carla', rating: 5, comment: '¡La mejor atención para mi perro!', date: 'Hace 3 días' },
];

// Placeholder catalog data (Spanish)
const catalogItems = [
    { id: 'c1', name: 'Espresso', price: '$3.00', description: 'Un shot rico y audaz.' },
    { id: 'c2', name: 'Croissant', price: '$2.50', description: 'Pastelito hojaldrado y mantecoso.' },
    { id: 'c3', name: 'Consulta Veterinaria', price: '$50.00', description: 'Revisión general de salud.' },
]

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const business = await getBusinessDetails(params.id);

  if (!business) {
      return <div className="text-center py-16"> {/* Increased padding */}
          <h1 className="text-3xl font-bold mb-4 text-foreground">Negocio No Encontrado</h1>
          <p className="text-lg text-muted-foreground mb-6">No pudimos encontrar el negocio que buscabas.</p>
          <Button asChild size="lg" className="mt-4">
              <Link href="/search">Volver a la Búsqueda</Link>
          </Button>
      </div>
  }

  // Select catalog items relevant to the business category (example logic)
  const relevantCatalogItems = catalogItems.filter(item => {
      if (business.category === 'Cafeterías' || business.category === 'Restaurantes') {
          return ['Espresso', 'Croissant'].includes(item.name);
      } else if (business.category === 'Veterinarias') {
          return ['Consulta Veterinaria'].includes(item.name);
      }
      return false; // Show nothing for other categories by default
  });


  return (
    <div className="space-y-10"> {/* Increased spacing */}
      {/* Main Business Info Card */}
      <Card className="overflow-hidden shadow-lg border bg-card"> {/* Added border */}
        <CardHeader className="p-0 relative">
          <div className="aspect-video relative"> {/* Consistent aspect ratio */}
            <Image
              src={business.image}
              alt={business.name}
              fill
              sizes="(max-width: 768px) 100vw, 800px" // Adjusted sizes
              className="object-cover" // Removed rounded-t-lg for full bleed
              priority // Load hero image quickly
              data-ai-hint={business.dataAiHint}
            />
             {/* Destacado Badge */}
            {business.promoted && (
                 <Badge
                   variant="default"
                   className="absolute top-3 right-3 bg-yellow-500 text-black text-xs px-2 py-1 z-10 shadow-md border border-yellow-600" // Golden badge style
                 >
                   ★ DESTACADO
                 </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6"> {/* Increased padding */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4"> {/* Align items start for multi-line text */}
                 <div>
                    <CardTitle className="text-3xl md:text-4xl mb-1 text-card-foreground">{business.name}</CardTitle>
                    <Badge variant="secondary">{business.category}</Badge> {/* Use Badge for category */}
                 </div>
                 <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0 mt-2 md:mt-0">
                    <Star className="h-6 w-6 fill-current" />
                    <span className="text-2xl font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">({reviews.length} reseñas)</span>
                </div>
            </div>

          <p className="text-base md:text-lg text-muted-foreground">{business.description}</p>

          <Separator />

          {/* Contact & Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-base"> {/* Increased text size */}
            <div className="flex items-start gap-3"> {/* Increased gap */}
              <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
              <div>
                  <span className="font-medium text-foreground">Dirección:</span>
                  <p className="text-muted-foreground">{business.address}, {business.location}</p>
                  {/* Map View Integrated - pass only the current business */}
                  <div className="mt-2 h-60 rounded-md overflow-hidden border"> {/* Increased height */}
                       <MapView
                          businesses={[business]} // Pass only this business
                          forceFitBounds={false} // Don't force fit bounds for single business (uses center/zoom)
                        />
                   </div>
              </div>
            </div>
            <div className="space-y-4"> {/* Stack phone and email */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                   <div>
                        <span className="font-medium text-foreground">Teléfono:</span>
                        <p className="text-muted-foreground">{business.phone}</p>
                   </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                      <span className="font-medium text-foreground">Correo:</span>
                      <a href={`mailto:${business.email}`} className="block text-primary hover:underline text-muted-foreground">{business.email}</a>
                  </div>
                </div>
            </div>
          </div>

        </CardContent>
      </Card>

       {/* Catalog Section */}
        <Card className="border bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground"> {/* Increased text size */}
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Productos / Servicios
                </CardTitle>
                 <CardDescription>Explora lo que {business.name} ofrece.</CardDescription>
            </CardHeader>
            <CardContent>
                 {relevantCatalogItems.length > 0 ? (
                    <ul className="space-y-4"> {/* Increased spacing */}
                        {relevantCatalogItems.map(item => (
                             <li key={item.id} className="flex justify-between items-start border-b pb-3 last:border-b-0"> {/* Align items start, increased padding */}
                                 <div>
                                     <p className="font-medium text-lg text-card-foreground">{item.name}</p> {/* Increased text size */}
                                     <p className="text-sm text-muted-foreground">{item.description}</p>
                                 </div>
                                 <span className="font-semibold text-primary text-lg ml-4 flex-shrink-0">{item.price}</span> {/* Increased text size */}
                             </li>
                        ))}
                    </ul>
                 ) : (
                     <p className="text-muted-foreground italic">Aún no hay artículos en el catálogo.</p>
                 )}
                 {/* TODO: Add full catalog management for business owner */}
            </CardContent>
        </Card>


      {/* Reviews Section */}
      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
              <MessageSquare className="h-6 w-6 text-primary" />
              Reseñas de Clientes
          </CardTitle>
           <CardDescription>Mira lo que otros dicen sobre {business.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          {/* TODO: Implement review submission form */}
           <Button variant="outline">Escribir una Reseña</Button>

          <Separator />

          {reviews.length > 0 ? (
            <ul className="space-y-6"> {/* Increased spacing */}
              {reviews.map((review) => (
                <li key={review.id} className="border p-4 rounded-lg shadow-sm bg-muted/50"> {/* Subtle background, larger padding */}
                  <div className="flex justify-between items-center mb-2"> {/* Increased margin */}
                    <span className="font-semibold text-lg text-card-foreground">{review.author}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                       {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-current' : 'text-muted-foreground opacity-50'}`} /> /* Larger stars */
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{review.date}</p> {/* Increased margin */}
                  <p className="text-base text-card-foreground">{review.comment}</p> {/* Base text size */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">Aún no hay reseñas. ¡Sé el primero!</p>
          )}
        </CardContent>
      </Card>

       {/* TODO: Add Promotion Management Section for Business Owner (Spanish) */}
       {/* This should only be visible if the current user is the owner */}
        {/* <Card>
            <CardHeader>
                <CardTitle>Gestionar Promoción</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Controles de promoción van aquí (mejorar plan, ver estadísticas, etc.)</p>
            </CardContent>
        </Card> */}

    </div>
  );
}
```
  </change>
  <change>
    <file>src/app/register/page.tsx</file>
    <description>Integrate MapView component into the registration page for address geocoding visualization.</description>
    <content><![CDATA['use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getCoordinates, type BusinessLocation, type Coordinates } from '@/services/geolocation'; // Using the service
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import Map component
const MapView = dynamic(() => import('@/components/map-view/map-view'), {
  ssr: false,
  loading: () => <div className="h-60 bg-muted rounded-md flex items-center justify-center text-muted-foreground">Cargando mapa...</div>, // Adjusted height
});


// Placeholder for business types - replace with actual data (Spanish)
const businessTypes = [
  "Tiendas de ropa",
  "Restaurantes",
  "Veterinarias",
  "Cafeterías",
  "Librerías",
  "Servicios Profesionales",
  "Floristerías",
  "Gimnasios",
  "Cines",
  "Panaderías",
  "Reparación Electrónica",
  "Otros",
];

// Placeholder for provinces and municipalities - replace with actual data or API call (Spanish)
const provinces = ["Provincia A", "Provincia B"];
const municipalities: Record<string, string[]> = {
  "Provincia A": ["Municipio A1", "Municipio A2"],
  "Provincia B": ["Municipio B1", "Municipio B2"],
};

const registerFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "El nombre del negocio debe tener al menos 2 caracteres.",
  }),
  businessType: z.string({
    required_error: "Por favor, selecciona un tipo de negocio.",
  }),
  phone: z.string().min(7, { // Basic validation
    message: "Por favor, introduce un número de teléfono válido.",
  }),
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo electrónico válida.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  province: z.string({
    required_error: "Por favor, selecciona una provincia.",
  }),
  municipality: z.string({
    required_error: "Por favor, selecciona un municipio.",
  }),
  address: z.string().min(5, {
    message: "Por favor, introduce una dirección postal válida.",
  }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Mock function to simulate registration API call (Spanish messages)
async function registerBusiness(data: RegisterFormValues, coordinates: Coordinates | null): Promise<{ success: boolean, message: string }> {
  console.log("Registrando negocio:", data, "Coordenadas:", coordinates);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate success/failure
  const success = Math.random() > 0.2; // 80% success rate
  return {
    success,
    message: success ? "¡Negocio registrado con éxito!" : "Fallo en el registro. Por favor, inténtalo de nuevo.",
  };
}

export default function RegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
   const [showMap, setShowMap] = useState(false); // State to control map visibility

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      businessName: "",
      phone: "",
      email: "",
      password: "",
      address: "",
    },
  });

  const selectedProvince = form.watch("province");

  // Reset coordinates and hide map if address fields change
  useEffect(() => {
    setMapCoordinates(null);
    setShowMap(false);
  }, [form.watch("province"), form.watch("municipality"), form.watch("address")]);


  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    // Pass coordinates along with form data
    const result = await registerBusiness(data, mapCoordinates);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
        variant: "default", // Green accent
      });
      form.reset(); // Reset form on success
      setMapCoordinates(null);
      setShowMap(false); // Hide map on success
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  async function handleGeocode() {
      const location: BusinessLocation = {
          province: form.getValues("province"),
          municipality: form.getValues("municipality"),
          address: form.getValues("address"),
      };

      if (location.province && location.municipality && location.address) {
          setIsGeocoding(true);
          setShowMap(true); // Show map immediately
          const coords = await getCoordinates(location); // Use the service
          setMapCoordinates(coords);
          setIsGeocoding(false);
          if (!coords) {
              toast({
                  title: "Geocodificación Fallida",
                  description: "No se pudieron encontrar coordenadas para la dirección proporcionada. Por favor, comprueba los detalles.",
                  variant: "destructive",
              });
              setShowMap(false); // Hide map if geocoding fails
          }
      } else {
          toast({
              title: "Información Incompleta",
              description: "Por favor, rellena Provincia, Municipio y Dirección para localizar en el mapa.",
              variant: "destructive",
          });
      }
  }


  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Registra Tu Negocio</CardTitle>
            <CardDescription>Completa los detalles a continuación para listar tu negocio en LocalSpark.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre del Negocio</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej., El Rincón del Café" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Negocio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de negocio" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                            {type}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Número de Teléfono</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="Teléfono de contacto" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Correo de contacto" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Elige una contraseña segura" {...field} />
                        </FormControl>
                        <FormDescription>
                            Debe tener al menos 8 caracteres.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />


                <h3 className="text-lg font-medium border-t pt-4">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.resetField("municipality"); }} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona provincia" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {provinces.map((province) => (
                                <SelectItem key={province} value={province}>
                                {province}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="municipality"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Municipio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedProvince}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona municipio" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {selectedProvince && municipalities[selectedProvince]?.map((municipality) => (
                                <SelectItem key={municipality} value={municipality}>
                                {municipality}
                                </SelectItem>
                            ))}
                            {!selectedProvince && <SelectItem value="disabled" disabled>Selecciona provincia primero</SelectItem>}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Ej., Calle Principal 123, Local 1" {...field} />
                    </FormControl>
                    <FormDescription>
                        Introduce la dirección exacta para la ubicación en el mapa.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                 {/* Map Section */}
                <div className="space-y-2">
                     <div className="flex items-center gap-4">
                         <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding}>
                             {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                             Localizar en Mapa
                         </Button>
                         {mapCoordinates && showMap && (
                             <span className="text-sm text-green-600">¡Ubicación Encontrada! ({mapCoordinates.latitude.toFixed(4)}, {mapCoordinates.longitude.toFixed(4)})</span>
                         )}
                         {isGeocoding && <span className="text-sm text-muted-foreground">Localizando...</span>}
                     </div>

                      {/* Conditionally render MapView */}
                      {showMap && (
                         <div className="h-60 rounded-md overflow-hidden border">
                             <MapView
                                 key={`${mapCoordinates?.latitude}-${mapCoordinates?.longitude}`} // Re-render map if coordinates change
                                 center={mapCoordinates ? [mapCoordinates.latitude, mapCoordinates.longitude] : undefined}
                                 zoom={mapCoordinates ? 15 : undefined} // Zoom in if coordinates found
                             />
                         </div>
                     )}
                 </div>


                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Registrando...' : 'Registrar Negocio'}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
```
  </change>
  <change>
    <file>package.json</file>
    <description>Add react-leaflet and @types/leaflet dependencies for map integration.</description>
    <content><![CDATA[{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/googleai": "^1.6.2",
    "@genkit-ai/next": "^1.6.2",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tanstack-query-firebase/react": "^1.0.5",
    "@tanstack/react-query": "^5.66.0",
    "@types/leaflet": "^1.9.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.2.0",
    "firebase": "^11.3.0",
    "genkit": "^1.6.2",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.475.0",
    "next": "15.2.3",
    "next-themes": "^0.3.0",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "react-leaflet": "^4.2.1",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "genkit-cli": "^1.6.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

    