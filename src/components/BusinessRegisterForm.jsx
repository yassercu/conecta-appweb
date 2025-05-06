import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

// Lazy load MapView
const MapView = lazy(() => import('@/components/map-view'));

// Tipos de negocios
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

// Provincias y municipios de ejemplo (reemplazar con datos reales)
const provinces = ["Provincia A", "Provincia B", "Provincia C"];
const municipalities = {
  "Provincia A": ["Municipio A1", "Municipio A2", "Municipio A3"],
  "Provincia B": ["Municipio B1", "Municipio B2", "Municipio B3"],
  "Provincia C": ["Municipio C1", "Municipio C2", "Municipio C3"],
};

// Esquema de validación del formulario
const registerFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "El nombre del negocio debe tener al menos 2 caracteres.",
  }),
  businessType: z.string({
    required_error: "Por favor, selecciona un tipo de negocio.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }).max(500, {
    message: "La descripción no debe exceder los 500 caracteres."
  }),
  phone: z.string().min(7, {
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

// Función simulada para registrar negocio en API
async function registerBusiness(data, coordinates) {
  // Simular API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simular éxito/fallo (80% de éxito)
  if (Math.random() > 0.2) {
    return { success: true, message: "¡Negocio registrado con éxito!" };
  } else {
    return { success: false, message: "Error en el registro. Por favor, inténtalo de nuevo." };
  }
}

// Obtener coordenadas a partir de dirección
async function getCoordinates({ province, municipality, address }) {
  // Simular API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulación - generar coordenadas aleatorias en Puerto Rico
  // En producción, usar un servicio real de geocodificación
  const baseLat = 18.2 + Math.random() * 0.4; // Latitud para Puerto Rico
  const baseLng = -66.8 + Math.random() * 0.6; // Longitud para Puerto Rico

  return {
    lat: baseLat,
    lng: baseLng
  };
}

export default function BusinessRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      email: "",
      password: "",
      address: "",
    },
  });

  const selectedProvince = form.watch("province");

  // Resetear coordenadas cuando cambian los campos de dirección
  useEffect(() => {
    setMapCoordinates(null);
    setShowMap(false);
  }, [form.watch("province"), form.watch("municipality"), form.watch("address")]);

  // Check if running in browser
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Manejar envío del formulario
  async function onSubmit(data) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await registerBusiness(data, mapCoordinates);

      if (result.success) {
        setIsSuccess(true);
        form.reset();
        setMapCoordinates(null);
        setShowMap(false);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Manejar geocodificación de dirección
  async function handleGeocode() {
    const location = {
      province: form.getValues("province"),
      municipality: form.getValues("municipality"),
      address: form.getValues("address"),
    };

    if (location.province && location.municipality && location.address) {
      setIsGeocoding(true);
      setShowMap(true);

      try {
        const coords = await getCoordinates(location);
        setMapCoordinates(coords);
      } catch (error) {
        setErrorMessage("No se pudieron obtener las coordenadas para la dirección proporcionada.");
        setShowMap(false);
        console.error(error);
      } finally {
        setIsGeocoding(false);
      }
    } else {
      setErrorMessage("Por favor, completa todos los campos de ubicación para obtener las coordenadas.");
    }
  }

  if (isSuccess) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">¡Registro Exitoso!</h2>
          <p className="text-muted-foreground">
            Tu negocio ha sido registrado correctamente. Pronto recibirás un correo electrónico con los detalles de tu cuenta.
          </p>
          <div className="pt-4">
            <Button asChild>
              <a href="/business/dashboard">Ir a Mi Panel</a>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del negocio */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Información del Negocio</h2>

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Negocio*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Café del Barrio" {...field} />
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
                    <FormLabel>Tipo de Negocio*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu negocio en pocas palabras..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo 500 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Datos de Contacto</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono*</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Número de teléfono" {...field} />
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
                      <FormLabel>Correo Electrónico*</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
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
                    <FormLabel>Contraseña*</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Ubicación</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                      <FormLabel>Municipio*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedProvince}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona municipio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedProvince &&
                            municipalities[selectedProvince].map((municipality) => (
                              <SelectItem key={municipality} value={municipality}>
                                {municipality}
                              </SelectItem>
                            ))}
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
                    <FormLabel>Dirección*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Calle 23 #504 entre D y E" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeocode}
                  disabled={isGeocoding}
                  className="gap-2"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Obteniendo coordenadas...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>Verificar ubicación</span>
                    </>
                  )}
                </Button>
              </div>

              {showMap && (
                <div className="mt-4 rounded-md overflow-hidden border h-60">
                  {isBrowser ? (
                    <Suspense fallback={<div className="h-60 bg-muted flex items-center justify-center text-muted-foreground">Cargando mapa...</div>}>
                      <MapView
                        client:only="react"
                        center={mapCoordinates ? [mapCoordinates.lat, mapCoordinates.lng] : undefined}
                        zoom={16}
                        businesses={mapCoordinates ? [
                          {
                            id: "preview",
                            name: form.getValues("businessName"),
                            category: form.getValues("businessType"),
                            latitude: mapCoordinates.lat,
                            longitude: mapCoordinates.lng,
                          }
                        ] : []}
                      />
                    </Suspense>
                  ) : null}
                </div>
              )}
            </div>

            {/* Datos de acceso */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Datos de Acceso</h2>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico*</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Usarás este correo para acceder a tu cuenta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña*</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {errorMessage && (
              <div className="px-4 py-3 rounded-md bg-red-50 text-red-500 text-sm">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Negocio"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}