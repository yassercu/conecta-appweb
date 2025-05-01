import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MapPin, Phone, Mail, Star, ShoppingBag, MessageSquare } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

// Placeholder data - replace with actual data fetching based on ID
const getBusinessDetails = async (id: string) => {
  console.log("Fetching details for business ID:", id);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  // Find business or return a default placeholder if not found
  const business = [
      { id: '1', name: 'Cool Cafe', category: 'Restaurantes', rating: 4.5, location: 'Downtown', address: '123 Main St', phone: '555-1234', email: 'info@coolcafe.com', description: 'A cozy cafe with great coffee and pastries.', image: 'https://picsum.photos/800/400', promoted: true, dataAiHint: 'cafe interior detail' },
      { id: '2', name: 'Trendy Boutique', category: 'Tiendas de ropa', rating: 5.0, location: 'Uptown', address: '456 Fashion Ave', phone: '555-5678', email: 'contact@trendyboutique.com', description: 'Latest fashion trends and unique styles.', image: 'https://picsum.photos/800/400', promoted: true, dataAiHint: 'fashion boutique display' },
      { id: '3', name: 'Happy Paws Vet', category: 'Veterinarias', rating: 4.8, location: 'Suburbia', address: '789 Pet Lane', phone: '555-9012', email: 'care@happypaws.vet', description: 'Compassionate care for your furry friends.', image: 'https://picsum.photos/800/400', promoted: true, dataAiHint: 'veterinarian examining dog' },
      // Add other businesses matching the search page...
      { id: '4', name: 'Bookworm Haven', category: 'Librerías', rating: 4.2, location: 'Downtown', address: '321 Read St', phone: '555-1122', email: 'books@bookworm.com', description: 'A quiet place to find your next favorite book.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'cozy bookstore corner'},
      { id: '5', 'name': 'Gourmet Grill', category: 'Restaurantes', rating: 4.7, location: 'Midtown', address: '654 Foodie Blvd', phone: '555-3344', email: 'reservations@gourmetgrill.com', description: 'Exquisite dining experience with a modern twist.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'fine dining plate'},
      { id: '6', 'name': 'Style Spot', category: 'Tiendas de ropa', rating: 4.0, location: 'Suburbia', address: '987 Style Rd', phone: '555-5566', email: 'shop@stylespot.com', description: 'Affordable and stylish clothing for everyone.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'casual clothing store'},
      { id: '7', 'name': 'Central Perk Cafe', category: 'Cafeterías', rating: 4.9, location: 'Uptown', address: '101 Coffee Ave', phone: '555-7788', email: 'friends@centralperk.com', description: 'The best coffee and couches in town.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'famous coffee shop sofa'},
  ].find(b => b.id === id);

   if (!business) {
        // Return a default structure or throw an error
        return { id: 'not-found', name: 'Business Not Found', category: 'Unknown', rating: 0, location: 'N/A', address: 'N/A', phone: 'N/A', email: 'N/A', description: 'Could not find details for this business.', image: 'https://picsum.photos/800/400', promoted: false, dataAiHint: 'empty street' };
    }

  return business;
};

// Placeholder review data
const reviews = [
    { id: 'r1', author: 'Alice', rating: 5, comment: 'Amazing coffee and atmosphere!', date: '2 days ago' },
    { id: 'r2', author: 'Bob', rating: 4, comment: 'Good place, a bit crowded sometimes.', date: '1 week ago' },
];

// Placeholder catalog data
const catalogItems = [
    { id: 'c1', name: 'Espresso', price: '$3.00', description: 'Rich and bold single shot.' },
    { id: 'c2', name: 'Croissant', price: '$2.50', description: 'Flaky and buttery pastry.' },
]

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const business = await getBusinessDetails(params.id);

  if (business.id === 'not-found') {
      return <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Business Not Found</h1>
          <p className="text-muted-foreground">We couldn't find the business you were looking for.</p>
          <Button asChild className="mt-4">
              <a href="/search">Back to Search</a>
          </Button>
      </div>
  }

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
           {business.promoted && <Badge variant="default" className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg p-2">🌟 Promoted</Badge>}
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
                    <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
            </div>

          <p className="text-base">{business.description}</p>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div>
                  <span className="font-medium">Location:</span> {business.address}, {business.location}
                  {/* TODO: Add link to map view */}
                  <Button variant="link" size="sm" className="p-0 h-auto ml-1">View on Map</Button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div><span className="font-medium">Phone:</span> {business.phone}</div>
            </div>
             <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div><span className="font-medium">Email:</span> <a href={`mailto:${business.email}`} className="text-primary hover:underline">{business.email}</a></div>
            </div>
          </div>

        </CardContent>
      </Card>

       {/* Catalog Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Products / Services
                </CardTitle>
                 <CardDescription>Explore what {business.name} offers.</CardDescription>
            </CardHeader>
            <CardContent>
                 {catalogItems.length > 0 ? (
                    <ul className="space-y-3">
                        {catalogItems.map(item => (
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
                     <p className="text-muted-foreground">No catalog items available yet.</p>
                 )}
                 {/* TODO: Add full catalog management for business owner */}
            </CardContent>
        </Card>


      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Customer Reviews
          </CardTitle>
           <CardDescription>See what others are saying about {business.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TODO: Implement review submission form */}
           <Button variant="outline">Write a Review</Button>

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
            <p className="text-muted-foreground">No reviews yet. Be the first!</p>
          )}
        </CardContent>
      </Card>

       {/* TODO: Add Promotion Management Section for Business Owner */}
       {/* This should only be visible if the current user is the owner */}
        {/* <Card>
            <CardHeader>
                <CardTitle>Manage Promotion</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Promotion controls go here (upgrade plan, view stats, etc.)</p>
            </CardContent>
        </Card> */}

    </div>
  );
}
