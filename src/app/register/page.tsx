'use client';

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
import { useState } from "react";
import { getCoordinates, type BusinessLocation } from '@/services/geolocation'; // Using the service


// Placeholder for business types - replace with actual data (Spanish)
const businessTypes = [
  "Tiendas de ropa",
  "Restaurantes",
  "Veterinarias",
  "Cafeterías",
  "Librerías",
  "Servicios Profesionales",
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
async function registerBusiness(data: RegisterFormValues): Promise<{ success: boolean, message: string }> {
  console.log("Registrando negocio:", data);
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
  const [mapCoordinates, setMapCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

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

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    const result = await registerBusiness(data);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
        variant: "default", // Green accent
      });
      form.reset(); // Reset form on success
      setMapCoordinates(null);
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
          const coords = await getCoordinates(location); // Use the service
          setMapCoordinates(coords);
          setIsGeocoding(false);
          if (!coords) {
              toast({
                  title: "Geocodificación Fallida",
                  description: "No se pudieron encontrar coordenadas para la dirección proporcionada. Por favor, comprueba los detalles.",
                  variant: "destructive",
              });
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
                        <Select onValueChange={(value) => { field.onChange(value); form.resetField("municipality"); setMapCoordinates(null); }} defaultValue={field.value}>
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
                        <Select onValueChange={(value) => {field.onChange(value); setMapCoordinates(null); }} defaultValue={field.value} disabled={!selectedProvince}>
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
                        <Textarea placeholder="Ej., Calle Principal 123, Local 1" {...field} onChange={(e) => {field.onChange(e); setMapCoordinates(null);}} />
                    </FormControl>
                    <FormDescription>
                        Introduce la dirección exacta para la ubicación en el mapa.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding}>
                        {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Localizar en Mapa
                    </Button>
                    {mapCoordinates && (
                        <span className="text-sm text-green-600">¡Ubicación Encontrada! ({mapCoordinates.latitude.toFixed(4)}, {mapCoordinates.longitude.toFixed(4)})</span>
                    )}
                    {isGeocoding && <span className="text-sm text-muted-foreground">Localizando...</span>}
                </div>
                {/* TODO: Add Leaflet map integration here */}
                 <div className="h-40 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Espacio para el Mapa (Requiere Integración con Leaflet)
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
