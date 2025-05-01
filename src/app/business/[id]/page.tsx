import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MapPin, Phone, Mail, Star, ShoppingBag, MessageSquare } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

// Placeholder data - replace with actual data fetching based on ID (Spanish)
const getBusinessDetails = async (id: string) => {
  console.log("Fetching details for business ID:", id);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  // Find business or return a default placeholder if not found (Spanish)
  const business = [
      { id: '1', name: 'Café Esquina', category: 'Cafeterías', rating: 4.5, location: 'Centro', address: 'Calle Principal 123', phone: '555-1234', email: 'info@cafeesquina.com', description: 'Un café acogedor con excelente café y pastelería.', image: 'https://picsum.photos/800/400?random=1', promoted: true, dataAiHint: 'cafe interior detail' },
      { id: '2', name: 'Moda Urbana', category: 'Tiendas de ropa', rating: 5.0, location: 'Norte', address: 'Av. Moda 456', phone: '555-5678', email: 'contacto@modaurbana.com', description: 'Últimas tendencias de moda y estilos únicos.', image: 'https://picsum.photos/800/400?random=2', promoted: true, dataAiHint: 'fashion boutique display' },
      { id: '3', name: 'Patitas Felices', category: 'Veterinarias', rating: 4.8, location: 'Sur', address: 'Calle Mascotas 789', phone: '555-9012', email: 'cuidado@patitasfelices.vet', description: 'Cuidado compasivo para tus amigos peludos.', image: 'https://picsum.photos/800/400?random=3', promoted: true, dataAiHint: 'veterinarian examining dog' },
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
      return <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Negocio No Encontrado</h1>
          <p className="text-muted-foreground">No pudimos encontrar el negocio que buscabas.</p>
          <Button asChild className="mt-4">
              <a href="/search">Volver a la Búsqueda</a>
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
    <div className="space-y-8">
      <Card>
        <CardHeader className="p-0 relative">
          <Image
            src={business.image}
            alt={business.name}
            width={800}
            height={400}
            className="w-full h-64 md:h-96 object-cover rounded-t-lg"
            priority // Load hero image quickly
            data-ai-hint={business.dataAiHint}
          />
           {business.promoted && <Badge variant="default" className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg p-2">🌟 Promo</Badge>}
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                 <div>
                    <CardTitle className="text-3xl">{business.name}</CardTitle>
                    <p className="text-lg text-muted-foreground">{business.category}</p>
                 </div>
                 <div className="flex items-center gap-1 text-yellow-500 mt-2 md:mt-0">
                    <Star className="h-6 w-6 fill-current" />
                    <span className="text-xl font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({reviews.length} reseñas)</span>
                </div>
            </div>

          <p className="text-base">{business.description}</p>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div>
                  <span className="font-medium">Ubicación:</span> {business.address}, {business.location}
                  {/* TODO: Add link to map view */}
                  <Button variant="link" size="sm" className="p-0 h-auto ml-1">Ver en Mapa</Button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div><span className="font-medium">Teléfono:</span> {business.phone}</div>
            </div>
             <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div><span className="font-medium">Correo:</span> <a href={`mailto:${business.email}`} className="text-primary hover:underline">{business.email}</a></div>
            </div>
          </div>

        </CardContent>
      </Card>

       {/* Catalog Section (Spanish) */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Productos / Servicios
                </CardTitle>
                 <CardDescription>Explora lo que {business.name} ofrece.</CardDescription>
            </CardHeader>
            <CardContent>
                 {relevantCatalogItems.length > 0 ? (
                    <ul className="space-y-3">
                        {relevantCatalogItems.map(item => (
                             <li key={item.id} className="flex justify-between items-center border-b pb-2">
                                 <div>
                                     <p className="font-medium">{item.name}</p>
                                     <p className="text-sm text-muted-foreground">{item.description}</p>
                                 </div>
                                 <span className="font-semibold text-primary">{item.price}</span>
                             </li>
                        ))}
                    </ul>
                 ) : (
                     <p className="text-muted-foreground">Aún no hay artículos en el catálogo.</p>
                 )}
                 {/* TODO: Add full catalog management for business owner */}
            </CardContent>
        </Card>


      {/* Reviews Section (Spanish) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Reseñas de Clientes
          </CardTitle>
           <CardDescription>Mira lo que otros dicen sobre {business.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TODO: Implement review submission form */}
           <Button variant="outline">Escribir una Reseña</Button>

          <Separator />

          {reviews.length > 0 ? (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{review.author}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                       {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                        ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                  <p>{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Aún no hay reseñas. ¡Sé el primero!</p>
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
