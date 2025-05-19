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

// Importar hooks de API para datos geográficos y categorías
import {
  useCountries,
  useProvincesByCountry,
  useMunicipalitiesByProvince,
  useCategories
} from '@/hooks/useApi';

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
  phone: z.string()
    .min(7, {
      message: "El número telefónico debe tener al menos 7 dígitos.",
    })
    .refine((val) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(val), {
      message: "Por favor, introduce un número de teléfono válido (ejemplo: +53 55512345).",
    }),
  email: z.string()
    .email({
      message: "Por favor, introduce una dirección de correo electrónico válida.",
    })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "El formato del correo electrónico no es válido.",
    }),
  password: z.string()
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .refine((val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(val), {
      message: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.",
    }),
  country: z.string({
    required_error: "Por favor, selecciona un país.",
  }),
  province: z.string({
    required_error: "Por favor, selecciona una provincia.",
  }),
  municipality: z.string().optional(), // Municipio es opcional si se provee dirección detallada
  address: z.string().min(5, {
    message: "Por favor, introduce una dirección postal válida con al menos 5 caracteres.",
  }),
});

// Función simulada para registrar negocio en API (se mantiene)
async function registerBusiness(data, coordinates) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (Math.random() > 0.2) {
    return { success: true, message: "¡Negocio registrado con éxito!" };
  } else {
    return { success: false, message: "Error en el registro. Por favor, inténtalo de nuevo." };
  }
}

// Obtener coordenadas a partir de dirección usando Nominatim (OpenStreetMap) (se mantiene, pero los nombres de país/provincia/municipio podrían venir de los hooks)
async function getCoordinates({ countryId, provinceId, municipalityId, address, allCountries, allProvinces, allMunicipalities }) {
  try {
    const countryName = allCountries?.find(c => c.id === countryId)?.name || "";
    const provinceName = allProvinces?.find(p => p.id === provinceId)?.name || "";
    const municipalityName = allMunicipalities?.find(m => m.id === municipalityId)?.name || "";

    let searchQuery = '';
    if (address) searchQuery += `${address}, `;
    if (municipalityName) searchQuery += `${municipalityName}, `;
    if (provinceName) searchQuery += `${provinceName}, `;
    if (countryName) searchQuery += countryName;
    searchQuery = searchQuery.trim().replace(/(^,)|(,$)/g, '');

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    const headers = { 'User-Agent': 'OrbitaApp/1.0' };
    const response = await fetch(nominatimUrl, { headers });
    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    throw new Error("No se encontraron coordenadas para esta dirección");
  } catch (error) {
    console.error("Error al obtener coordenadas:", error);
    // Fallback a coordenadas genéricas (se mantiene)
    let baseLat = 23.1; let baseLng = -82.3;
    if (countryId === "cu") { baseLat = 23.1 + Math.random() * 0.1; baseLng = -82.3 + Math.random() * 0.1; }
    // ... (otras lógicas de fallback para países)
    return { lat: baseLat, lng: baseLng };
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

  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      businessName: "", description: "", phone: "", email: "", password: "",
      country: "cu", province: "", municipality: "", address: "",
      businessType: "",
    },
  });

  const selectedCountryId = form.watch("country");
  const selectedProvinceId = form.watch("province");

  // Cargar datos geográficos usando hooks de API
  const { data: countriesList, loading: loadingCountries, error: errorCountries } = useCountries();
  const { data: provincesList, loading: loadingProvinces, error: errorProvinces } = useProvincesByCountry(selectedCountryId, { skip: !selectedCountryId });
  const { data: municipalitiesList, loading: loadingMunicipalities, error: errorMunicipalities } = useMunicipalitiesByProvince(selectedProvinceId, { skip: !selectedProvinceId });
  // Cargar categorías usando hook de API
  const { data: businessCategoriesList, loading: loadingCategories, error: errorCategories } = useCategories();

  // Depurar categorías
  console.log('Categorías cargadas:', businessCategoriesList);
  console.log('Cargando categorías:', loadingCategories);
  console.log('Error de categorías:', errorCategories);

  // Actualizar provincia y municipio si cambia el país y el valor actual no es válido
  useEffect(() => {
    if (selectedCountryId && provincesList) {
      if (selectedProvinceId && !provincesList.find(p => p.id === selectedProvinceId)) {
        form.setValue("province", "");
        form.setValue("municipality", "");
      }
    }
  }, [selectedCountryId, selectedProvinceId, provincesList, form]);

  // Actualizar municipio si cambia la provincia y el valor actual no es válido
  useEffect(() => {
    if (selectedProvinceId && municipalitiesList) {
      const currentMunicipality = form.getValues("municipality");
      if (currentMunicipality && !municipalitiesList.find(m => m.id === currentMunicipality)) {
        form.setValue("municipality", "");
      }
    }
  }, [selectedProvinceId, municipalitiesList, form]);

  // Resetear coordenadas cuando cambian los campos de dirección (se mantiene)
  useEffect(() => {
    setMapCoordinates(null);
    setShowMap(false);
  }, [form.watch("country"), form.watch("province"), form.watch("municipality"), form.watch("address")]);

  useEffect(() => { setIsBrowser(true); }, []);

  async function onSubmit(data) {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await registerBusiness(data, mapCoordinates); // mapCoordinates debe actualizarse con getCoordinates
      if (result.success) {
        setIsSuccess(true); form.reset(); setMapCoordinates(null); setShowMap(false);
      } else { setErrorMessage(result.message); }
    } catch (error) { setErrorMessage("Ocurrió un error inesperado."); }
    finally { setIsLoading(false); }
  }

  async function handleGeocode() {
    setIsGeocoding(true);
    const addressData = form.getValues();
    const coords = await getCoordinates({
      countryId: addressData.country,
      provinceId: addressData.province,
      municipalityId: addressData.municipality,
      address: addressData.address,
      allCountries: countriesList, // Pasar listas cargadas para la búsqueda de nombres
      allProvinces: provincesList,
      allMunicipalities: municipalitiesList
    });
    setMapCoordinates(coords);
    setShowMap(true);
    setIsGeocoding(false);
  }

  if (isSuccess) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">¡Registro Exitoso!</h2>
        <p>Tu negocio ha sido registrado correctamente.</p>
        <Button onClick={() => setIsSuccess(false)} className="mt-6">Registrar otro negocio</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos del formulario... (Nombre, Tipo, Descripción, etc. se mantienen) */}
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Negocio</FormLabel>
              <FormControl><Input placeholder="Ej: Paladar Don José" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría del Negocio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories}>
                <FormControl><SelectTrigger><SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Selecciona una categoría"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {errorCategories && <p className="text-xs text-red-500 p-2">Error al cargar categorías</p>}
                  {businessCategoriesList && Array.isArray(businessCategoriesList) && businessCategoriesList.map(category => (
                    <SelectItem key={typeof category === 'object' ? category.id : category} value={typeof category === 'object' ? category.id : category}>
                      {typeof category === 'object' ? category.name : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ... otros campos como descripción, teléfono, email, contraseña ... */}
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe tu negocio..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" placeholder="Ej: +53 55512345" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico (para administración)</FormLabel><FormControl><Input type="email" placeholder="Ej: ejemplo@dominio.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña (para administrar tu negocio)</FormLabel><FormControl><Input type="password" placeholder="Ej: M1n1m0$8" {...field} /></FormControl><FormMessage /></FormItem>)} />


        <h3 className="text-lg font-medium pt-4 border-t">Ubicación del Negocio</h3>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="cu">
                <FormControl>
                  <SelectTrigger disabled={loadingCountries}>
                    <SelectValue placeholder={loadingCountries ? "Cargando países..." : "Selecciona un país"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {errorCountries && <p className="text-xs text-red-500 p-2">Error al cargar países</p>}
                  {countriesList?.map(country => (
                    <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
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
              <FormLabel>Provincia</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountryId || loadingProvinces || provincesList?.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingProvinces ? "Cargando provincias..." :
                        !selectedCountryId ? "Selecciona un país primero" :
                          provincesList?.length === 0 && !loadingProvinces ? "No hay provincias" :
                            "Selecciona una provincia"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {errorProvinces && <p className="text-xs text-red-500 p-2">Error al cargar provincias</p>}
                  {provincesList?.map(province => (
                    <SelectItem key={province.id} value={province.id}>{province.name}</SelectItem>
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
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvinceId || loadingMunicipalities || municipalitiesList?.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingMunicipalities ? "Cargando municipios..." :
                        !selectedProvinceId ? "Selecciona una provincia primero" :
                          municipalitiesList?.length === 0 && !loadingMunicipalities ? "No hay municipios" :
                            "Selecciona un municipio"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {errorMunicipalities && <p className="text-xs text-red-500 p-2">Error al cargar municipios</p>}
                  {municipalitiesList?.map(municipality => (
                    <SelectItem key={municipality.id} value={municipality.id}>{municipality.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage /> {/* Mensaje de validación de Zod para municipio opcional */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl><Input placeholder="Calle y número, edificio, apartamento..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding || !form.getValues("address")}>
          {isGeocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar y Mostrar en Mapa
        </Button>

        {showMap && mapCoordinates && isBrowser && (
          <Card className="mt-4 h-64">
            <CardContent className="p-0 h-full">
              <Suspense fallback={<div className="flex items-center justify-center w-full h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Cargando mapa...</div>}>
                <MapView
                  businesses={[{
                    id: 'new-business',
                    name: form.getValues("businessName") || "Nuevo Negocio",
                    coordinates: { latitude: mapCoordinates.lat, longitude: mapCoordinates.lng },
                    // Otros campos que MapView pueda necesitar
                  }]}
                  userLocation={null} // O la ubicación del usuario si se quiere centrar diferente
                  initialCenter={{ lat: mapCoordinates.lat, lng: mapCoordinates.lng }}
                  initialZoom={15}
                />
              </Suspense>
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{errorMessage}</p>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Negocio
        </Button>
      </form>
    </Form>
  );
}