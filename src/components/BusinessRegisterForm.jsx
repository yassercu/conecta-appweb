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

// Importamos los datos y tipos de ubicaciones
import {
  countries,
  provinces,
  municipalities,
  getProvincesByCountry,
  getMunicipalitiesByProvince
} from '@/lib/locations';

// Importamos las categorías de negocios
import {
  businessCategories,
  getCategoryById
} from '@/lib/categories';

// Lazy load MapView
const MapView = lazy(() => import('@/components/map-view'));

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
  country: z.string({
    required_error: "Por favor, selecciona un país.",
  }),
  province: z.string({
    required_error: "Por favor, selecciona una provincia.",
  }),
  municipality: z.string().optional(),
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

// Obtener coordenadas a partir de dirección usando Nominatim (OpenStreetMap)
async function getCoordinates({ country, province, municipality, address }) {
  try {
    // Construir la dirección completa
    const countryName = countries.find(c => c.id === country)?.name || "";
    const provinceName = provinces.find(p => p.id === province)?.name || "";
    const municipalityName = municipalities.find(m => m.id === municipality)?.name || "";

    // Construir cadena de búsqueda para Nominatim
    let searchQuery = '';
    if (address) searchQuery += `${address}, `;
    if (municipalityName) searchQuery += `${municipalityName}, `;
    if (provinceName) searchQuery += `${provinceName}, `;
    if (countryName) searchQuery += countryName;

    // Limpieza de la consulta
    searchQuery = searchQuery.trim().replace(/(^,)|(,$)/g, '');

    // Construir URL para consulta a Nominatim
    // Formato: https://nominatim.openstreetmap.org/search?q={direccion}&format=json&limit=1
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;

    // Añadir User-Agent personalizado (requerido por la política de uso de Nominatim)
    const headers = {
      'User-Agent': 'OrbitaApp/1.0'
    };

    // Realizar la consulta
    const response = await fetch(nominatimUrl, { headers });
    const data = await response.json();

    // Verificar si se encontraron resultados
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    // Si Nominatim no encuentra resultados, usar valores por defecto según el país
    throw new Error("No se encontraron coordenadas para esta dirección");
  } catch (error) {
    console.error("Error al obtener coordenadas:", error);

    // Coordenadas por defecto según el país (como fallback)
    let baseLat = 23.1;
    let baseLng = -82.3;

    if (country === "cu") {
      // Cuba
      baseLat = 23.1 + Math.random() * 0.1;
      baseLng = -82.3 + Math.random() * 0.1;
    } else if (country === "es") {
      // España
      baseLat = 40.4 + Math.random() * 0.1;
      baseLng = -3.7 + Math.random() * 0.1;
    } else if (country === "mx") {
      // México
      baseLat = 19.4 + Math.random() * 0.1;
      baseLng = -99.1 + Math.random() * 0.1;
    } else if (country === "us") {
      // Estados Unidos
      baseLat = 40.7 + Math.random() * 0.1;
      baseLng = -74.0 + Math.random() * 0.1;
    }

    return {
      lat: baseLat,
      lng: baseLng
    };
  }
}

export default function BusinessRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // Estados para las listas dependientes
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      email: "",
      password: "",
      country: "cu", // Cuba por defecto
      province: "",
      municipality: "",
      address: "",
    },
  });

  const selectedCountry = form.watch("country");
  const selectedProvince = form.watch("province");

  // Actualizar provincias cuando cambia el país
  useEffect(() => {
    if (selectedCountry) {
      const filteredProvinces = getProvincesByCountry(selectedCountry);
      setAvailableProvinces(filteredProvinces);

      // Limpiar provincia y municipio si cambia el país
      if (selectedProvince && !filteredProvinces.find(p => p.id === selectedProvince)) {
        form.setValue("province", "");
        form.setValue("municipality", "");
      }
    }
  }, [selectedCountry, form]);

  // Actualizar municipios cuando cambia la provincia
  useEffect(() => {
    if (selectedProvince) {
      const filteredMunicipalities = getMunicipalitiesByProvince(selectedProvince);
      setAvailableMunicipalities(filteredMunicipalities);

      // Limpiar municipio si cambia la provincia y el municipio seleccionado no está en la lista
      const currentMunicipality = form.getValues("municipality");
      if (currentMunicipality && !filteredMunicipalities.find(m => m.id === currentMunicipality)) {
        form.setValue("municipality", "");
      }
    }
  }, [selectedProvince, form]);

  // Resetear coordenadas cuando cambian los campos de dirección
  useEffect(() => {
    setMapCoordinates(null);
    setShowMap(false);
  }, [form.watch("country"), form.watch("province"), form.watch("municipality"), form.watch("address")]);

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
      country: form.getValues("country"),
      province: form.getValues("province"),
      municipality: form.getValues("municipality"),
      address: form.getValues("address"),
    };

    // Validar campos mínimos requeridos
    if (!location.country || !location.province || !location.address) {
      setErrorMessage("Por favor, completa al menos el país, la provincia y la dirección para ubicar en el mapa.");
      return;
    }

    setIsGeocoding(true);
    setShowMap(false); // Ocultamos el mapa mientras se busca la nueva ubicación
    setErrorMessage(""); // Limpiamos mensajes de error previos

    try {
      // Obtenemos el nombre de los lugares seleccionados para el mensaje
      const countryName = countries.find(c => c.id === location.country)?.name || "";
      const provinceName = provinces.find(p => p.id === location.province)?.name || "";
      const municipalityName = location.municipality ?
        municipalities.find(m => m.id === location.municipality)?.name || "" : "";

      // Mostrar un mensaje de carga con la dirección que se está buscando
      setErrorMessage(`Buscando dirección: ${location.address}, ${municipalityName ? municipalityName + ", " : ""}${provinceName}, ${countryName}...`);

      const coords = await getCoordinates(location);

      if (coords) {
        setMapCoordinates(coords);
        setShowMap(true);
        setErrorMessage(""); // Limpiar mensaje cuando se encuentra la ubicación
      }
    } catch (error) {
      console.error("Error en geocodificación:", error);
      setErrorMessage(
        "No se pudo encontrar la ubicación exacta con los datos proporcionados. " +
        "Se mostrará una ubicación aproximada basada en la provincia. " +
        "Intenta con una dirección más específica o verifica que sea correcta."
      );

      // Intentar obtener coordenadas aproximadas como fallback
      try {
        const aproximateCoords = await getCoordinates(location);
        setMapCoordinates(aproximateCoords);
        setShowMap(true);
      } catch (secondError) {
        setShowMap(false);
        setErrorMessage("No se pudo determinar la ubicación. Por favor, revisa la dirección e intenta nuevamente.");
      }
    } finally {
      setIsGeocoding(false);
    }
  }

  // Manejar cambio de categoría
  const handleCategoryChange = (id, category) => {
    setCategoryId(id);
    setCategoryName(category.name);
  };

  // Manejar cambios de ubicación
  const handleCountryChange = (id, country) => {
    setCountryId(id);
    setCountryName(country.name);
  };

  const handleProvinceChange = (id, province) => {
    setProvinceId(id);
    setProvinceName(province.name);
  };

  const handleMunicipalityChange = (id, municipality) => {
    setMunicipalityId(id);
    setMunicipalityName(municipality.name);
  };

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
                          <SelectValue placeholder="Selecciona un tipo de negocio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu negocio, servicios o productos que ofreces..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Puedes escribir hasta 500 caracteres
                    </FormDescription>
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
                      <FormLabel>Teléfono*</FormLabel>
                      <FormControl>
                        <Input placeholder="+53 55123456" {...field} />
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
                        <Input placeholder="tu@correo.com" {...field} />
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
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormDescription>
                      Al menos 8 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Ubicación de tu Negocio</h2>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
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
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={availableProvinces.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una provincia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProvinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={availableMunicipalities.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un municipio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableMunicipalities.map((municipality) => (
                          <SelectItem key={municipality.id} value={municipality.id}>
                            {municipality.name}
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección*</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle 23 #105 entre L y M" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeocode}
                  disabled={isGeocoding}
                  className="flex gap-2"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Buscando ubicación...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>Verificar ubicación en el mapa</span>
                    </>
                  )}
                </Button>
              </div>

              {showMap && isBrowser && (
                <div className="rounded-md border border-input overflow-hidden h-64 md:h-80">
                  <Suspense fallback={
                    <div className="h-full flex items-center justify-center bg-muted">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Cargando mapa...</span>
                    </div>
                  }>
                    <MapView
                      center={mapCoordinates ? [mapCoordinates.lat, mapCoordinates.lng] : undefined}
                      businesses={mapCoordinates ? [
                        {
                          id: 'preview',
                          name: form.getValues("businessName") || "Mi Negocio",
                          category: businessCategories.find(c => c.id === form.getValues("businessType"))?.name || "Negocio",
                          latitude: mapCoordinates.lat,
                          longitude: mapCoordinates.lng,
                          rating: 5,
                          totalReviews: 0,
                          promoted: false,
                          location: `${form.getValues("address") || ""}, ${municipalities.find(m => m.id === form.getValues("municipality"))?.name || ""
                            }, ${provinces.find(p => p.id === form.getValues("province"))?.name || ""
                            }`,
                          image: "",
                          description: form.getValues("description") || "Ubicación del negocio"
                        }
                      ] : []}
                      zoom={16}
                    />
                  </Suspense>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-destructive/15 text-destructive rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar mi Negocio"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}