import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MapPin, Phone, Mail, Star, ShoppingBag, MessageSquare } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Link from "next/link"; // Import Link

// Placeholder data - replace with actual data fetching based on ID (Spanish)
const getBusinessDetails = async (id: string) => {
  console.log("Fetching details for business ID:", id);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  // Find business or return a default placeholder if not found (Spanish)
  const business = [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', address: 'Calle Principal 123', phone: '555-1234', email: 'info@cafeesquina.com', description: 'Un café acogedor con excelente café y pastelería.', image: 'https://picsum.photos/800/400?random=1', promoted: false, dataAiHint: 'cafe interior detail' }, // Removed promoted
      { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', address: 'Av. Moda 456', phone: '555-5678', email: 'contacto@modaurbana.com', description: 'Últimas tendencias de moda y estilos únicos.', image: 'https://picsum.photos/800/400?random=2', promoted: false, dataAiHint: 'fashion boutique display' }, // Removed promoted
      { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', address: 'Calle Mascotas 789', phone: '555-9012', email: 'cuidado@patitasfelices.vet', description: 'Cuidado compasivo para tus amigos peludos.', image: 'https://picsum.photos/800/400?random=3', promoted: false, dataAiHint: 'veterinarian examining dog' }, // Removed promoted
      { id: '4', name: 'Libros & Más', category: 'Librerías', rating: 4.2, location: 'Centro', address: 'Calle Lectura 321', phone: '555-1122', email: 'libros@librosymas.com', description: 'Un lugar tranquilo para encontrar tu próximo libro favorito.', image: 'https://picsum.photos/800/400?random=4', promoted: false, dataAiHint: 'cozy bookstore corner'},
      { id: '5', 'name': 'Sabor Criollo', category: 'Restaurantes', rating: 4.7, location: 'Este', address: 'Blvd. Gastronomía 654', phone: '555-3344', email: 'reservas@saborcriollo.com', description: 'Experiencia culinaria exquisita con un toque moderno.', image: 'https://picsum.photos/800/400?random=5', promoted: false, dataAiHint: 'fine dining plate'},
      { id: '6', 'name': 'Estilo Casual', category: 'Tiendas de ropa', rating: 4.0, location: 'Sur', address: 'Ruta Estilo 987', phone: '555-5566', email: 'tienda@estilocasual.com', description: 'Ropa asequible y con estilo para todos.', image: 'https://picsum.photos/800/400?random=6', promoted: false, dataAiHint: 'casual clothing store'},
      { id: '7', 'name': 'Café Central', category: 'Cafeterías', rating: 4.9, location: 'Norte', address: 'Av. Café 101', phone: '555-7788', email: 'amigos@cafecentral.com', description: 'El mejor café y sofás de la ciudad.', image: 'https://picsum.photos/800/400?random=7', promoted: false, dataAiHint: 'famous coffee shop sofa'},
  ].find(b => b.id === id);

   if (!business) {
        // Return a default structure or throw an error (Spanish)
        return { id: 'not-found', name: 'Negocio No Encontrado', category: 'Desconocida', rating: 0, location: 'N/A', address: 'N/A', phone: 'N/A', email: 'N/A', description: 'No se pudieron encontrar los detalles de este negocio.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'empty street' };
    }

  return business;
};

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

  if (business.id === 'not-found') {
      return <div className="text-center py-16"> {/* Increased padding */}
          <h1 className="text-3xl font-bold mb-4">Negocio No Encontrado</h1>
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
      <Card className="overflow-hidden shadow-lg"> {/* Added shadow */}
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
           {/* Removed Promoted Badge */}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6"> {/* Increased padding */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4"> {/* Align items start for multi-line text */}
                 <div>
                    <CardTitle className="text-3xl md:text-4xl mb-1">{business.name}</CardTitle>
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
                  {/* TODO: Add link to map view */}
                  <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-base">Ver en Mapa</Button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
               <div>
                    <span className="font-medium text-foreground">Teléfono:</span>
                    <p className="text-muted-foreground">{business.phone}</p>
               </div>
            </div>
             <div className="flex items-start gap-3 md:col-span-2"> {/* Email takes full width on medium */}
              <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
              <div>
                  <span className="font-medium text-foreground">Correo:</span>
                  <a href={`mailto:${business.email}`} className="block text-primary hover:underline text-muted-foreground">{business.email}</a>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

       {/* Catalog Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"> {/* Increased text size */}
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
                                     <p className="font-medium text-lg">{item.name}</p> {/* Increased text size */}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
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
                    <span className="font-semibold text-lg">{review.author}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                       {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-current' : 'text-muted-foreground opacity-50'}`} /> /* Larger stars */
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{review.date}</p> {/* Increased margin */}
                  <p className="text-base">{review.comment}</p> {/* Base text size */}
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
