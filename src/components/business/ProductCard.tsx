import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductPaymentForm } from './ProductPaymentForm';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  inStock?: boolean;
  maxQuantity?: number;
}

interface ProductCardProps {
  product: Product;
  businessId?: string;
}

export function ProductCard({ product, businessId }: ProductCardProps) {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const isAvailable = product.inStock ?? true;

  const handlePaymentSuccess = (result: any) => {
    toast({
      title: "¡Compra exitosa!",
      description: "Tu pedido ha sido procesado correctamente.",
    });
    setIsPaymentFormOpen(false);
  };

  const handlePaymentError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Error en la compra",
      description: error.message,
    });
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <a href={businessId ? `/business/${businessId}?product=${product.id}` : '#'} className="block">
          <div className="relative aspect-video">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <Badge
              variant={isAvailable ? "secondary" : "outline"}
              className="absolute top-2 right-2"
            >
              {isAvailable ? "Disponible" : "Agotado"}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </CardContent>
        </a>
        <CardFooter className="flex justify-between items-center pt-0">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={() => setIsPaymentFormOpen(true)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Ordenar" : "Agotado"}
          </Button>
        </CardFooter>
      </Card>

      <ProductPaymentForm
        product={product}
        quantity={quantity}
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onQuantityChange={setQuantity}
        maxQuantity={product.maxQuantity}
      />
    </>
  );
}