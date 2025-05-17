import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductPaymentForm } from './ProductPaymentForm';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [clientMessage, setClientMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const { toast } = useToast();

  const isAvailable = product.inStock ?? true;
  const maxQuantity = product.maxQuantity ?? 99;
  const total = product.price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderClick = () => {
    setIsPaymentFormOpen(true);
  };

  const handlePaymentSuccess = (result: any) => {
    // Si hay un mensaje para el cliente en el resultado, mostrarlo
    if (result.clientMessage) {
      setClientMessage(result.clientMessage);
      setIsSuccessDialogOpen(true);
    } else {
      toast({
        title: "¡Compra exitosa!",
        description: "Tu pedido ha sido procesado correctamente.",
      });
    }
    
    setIsPaymentFormOpen(false);
    setQuantity(1);
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
      <Card className="overflow-hidden h-full flex flex-col relative group">
        <a href={businessId ? `/business/${businessId}?product=${product.id}` : '#'} className="block">
          <div className="relative aspect-video">
            <img
              src={product.image || '/assets/businesses/default.svg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        
        {/* Controles de cantidad y precio integrados directamente en la tarjeta */}
        <CardContent className="pt-2 border-t border-muted/30">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Cantidad:</Label>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || !isAvailable}
                className="h-6 w-6"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-12 h-6 text-center text-sm p-1"
                min={1}
                max={maxQuantity}
                disabled={!isAvailable}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity || !isAvailable}
                className="h-6 w-6"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Total:</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button
            className="w-full transition-all duration-300 hover:scale-105"
            onClick={handleOrderClick}
            disabled={!isAvailable}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Obtener
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
        maxQuantity={maxQuantity}
        businessId={businessId}
      />
      
      {/* Diálogo de confirmación con el mensaje para el cliente */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md border-none bg-white text-gray-800 shadow-xl border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-green-200">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center text-center gap-2 text-gray-800 dark:text-green-200">
              <span className="text-2xl">🚀</span> Misión Completada
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-3">
            <div className="bg-gray-100 p-5 rounded-lg text-sm whitespace-pre-wrap text-gray-800 border border-gray-300 shadow-inner dark:bg-gray-700">
              {clientMessage}
            </div>
            
            <Button 
              variant="secondary"
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 border-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500" 
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}