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

// Placeholder for business types - replace with actual data
const businessTypes = [
  "Tiendas de ropa",
  "Restaurantes",
  "Veterinarias",
  "Cafeterías",
  "Librerías",
  "Servicios Profesionales",
  "Otros",
];

// Placeholder for provinces and municipalities - replace with actual data or API call
const provinces = ["Province A", "Province B"];
const municipalities: Record<string, string[]> = {
  "Province A": ["Municipality A1", "Municipality A2"],
  "Province B": ["Municipality B1", "Municipality B2"],
};

const registerFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  businessType: z.string({
    required_error: "Please select a business type.",
  }),
  phone: z.string().min(7, { // Basic validation
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  province: z.string({
    required_error: "Please select a province.",
  }),
  municipality: z.string({
    required_error: "Please select a municipality.",
  }),
  address: z.string().min(5, {
    message: "Please enter a valid street address.",
  }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Mock function to simulate registration API call
async function registerBusiness(data: RegisterFormValues): Promise<{ success: boolean, message: string }> {
  console.log("Registering business:", data);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate success/failure
  const success = Math.random() > 0.2; // 80% success rate
  return {
    success,
    message: success ? "Business registered successfully!" : "Registration failed. Please try again.",
  };
}

// Mock function to simulate geocoding API call
async function getMapCoordinates(province: string, municipality: string, address: string): Promise<{ lat: number, lng: number } | null> {
  console.log("Geocoding:", province, municipality, address);
  await new Promise(resolve => setTimeout(resolve, 800));
  // Simulate geocoding result (replace with actual Leaflet/geocoding logic)
  if (province && municipality && address) {
    return { lat: 37.7749 + (Math.random() - 0.5) * 0.1, lng: -122.4194 + (Math.random() - 0.5) * 0.1 };
  }
  return null;
}


export default function RegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number, lng: number } | null>(null);
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
        title: "Success!",
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
      const province = form.getValues("province");
      const municipality = form.getValues("municipality");
      const address = form.getValues("address");

      if (province && municipality && address) {
          setIsGeocoding(true);
          const coords = await getMapCoordinates(province, municipality, address);
          setMapCoordinates(coords);
          setIsGeocoding(false);
          if (!coords) {
              toast({
                  title: "Geocoding Failed",
                  description: "Could not find coordinates for the provided address. Please check the details.",
                  variant: "destructive",
              });
          }
      } else {
          toast({
              title: "Missing Information",
              description: "Please fill in Province, Municipality, and Address to locate on map.",
              variant: "destructive",
          });
      }
  }


  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>Fill in the details below to list your business on LocalSpark.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., The Corner Cafe" {...field} />
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
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a business type" />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="Contact phone" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Contact email" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Choose a secure password" {...field} />
                        </FormControl>
                        <FormDescription>
                            Must be at least 8 characters long.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />


                <h3 className="text-lg font-medium border-t pt-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Province</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.resetField("municipality"); setMapCoordinates(null); }} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select province" />
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
                        <FormLabel>Municipality</FormLabel>
                        <Select onValueChange={(value) => {field.onChange(value); setMapCoordinates(null); }} defaultValue={field.value} disabled={!selectedProvince}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select municipality" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {selectedProvince && municipalities[selectedProvince]?.map((municipality) => (
                                <SelectItem key={municipality} value={municipality}>
                                {municipality}
                                </SelectItem>
                            ))}
                            {!selectedProvince && <SelectItem value="disabled" disabled>Select province first</SelectItem>}
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
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., 123 Main St, Suite 100" {...field} onChange={(e) => {field.onChange(e); setMapCoordinates(null);}} />
                    </FormControl>
                    <FormDescription>
                        Enter the exact address for map location.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding}>
                        {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Locate on Map
                    </Button>
                    {mapCoordinates && (
                        <span className="text-sm text-green-600">Location Found! ({mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)})</span>
                    )}
                    {isGeocoding && <span className="text-sm text-muted-foreground">Locating...</span>}
                </div>
                {/* TODO: Add Leaflet map integration here */}
                 <div className="h-40 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Map Placeholder (Requires Leaflet Integration)
                </div>


                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Registering...' : 'Register Business'}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
