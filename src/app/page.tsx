import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Store, Utensils, Shirt, PawPrint } from 'lucide-react';
import Image from 'next/image';

// Placeholder data - replace with actual data fetching
const promotedBusinesses = [
  { id: '1', name: 'Cool Cafe', category: 'Restaurantes', rating: 4.5, location: 'Downtown', image: 'https://picsum.photos/400/200', dataAiHint: 'cafe interior' },
  { id: '2', name: 'Trendy Boutique', category: 'Tiendas de ropa', rating: 5.0, location: 'Uptown', image: 'https://picsum.photos/400/200', dataAiHint: 'clothing boutique' },
  { id: '3', name: 'Happy Paws Vet', category: 'Veterinarias', rating: 4.8, location: 'Suburbia', image: 'https://picsum.photos/400/200', dataAiHint: 'veterinary clinic' },
];

const categories = [
  { name: 'Restaurantes', icon: Utensils },
  { name: 'Tiendas de ropa', icon: Shirt },
  { name: 'Veterinarias', icon: PawPrint },
  { name: 'Other Shops', icon: Store },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Find Local Businesses Near You</h1>
        <p className="text-lg text-muted-foreground">Discover amazing local shops, restaurants, and services in your community.</p>
        <div className="max-w-xl mx-auto flex gap-2">
          <Input type="text" placeholder="Search by name, category, or product..." className="flex-grow" />
          <Button>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
         <p className="text-sm text-muted-foreground">
           Or browse by <Link href="/search" className="text-primary underline">category</Link> or <Link href="/search?map=true" className="text-primary underline">location</Link>.
         </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🌟 Promoted Businesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotedBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
               <CardHeader className="p-0 relative">
                 <Image
                   src={business.image}
                   alt={business.name}
                   width={400}
                   height={200}
                   className="w-full h-48 object-cover"
                   data-ai-hint={business.dataAiHint}
                 />
                 <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground">Promoted</Badge>
               </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg">{business.name}</CardTitle>
                 <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {business.location}
                  </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground">{business.category}</span>
                 <div className="flex items-center gap-1 text-yellow-500">
                   <Star className="h-4 w-4 fill-current" />
                   <span>{business.rating.toFixed(1)}</span>
                 </div>
              </CardFooter>
              <div className="p-4 pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/business/${business.id}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.name} href={`/search?category=${encodeURIComponent(category.name)}`} passHref>
              <Card className="text-center p-6 hover:bg-secondary transition-colors cursor-pointer flex flex-col items-center gap-2">
                <category.icon className="h-8 w-8 text-primary" />
                <span className="font-medium">{category.name}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
