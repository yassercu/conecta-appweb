import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductPaymentForm } from './ProductPaymentForm';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';

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
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const isAvailable = product.inStock ?? true;
  const maxQuantity = product.maxQuantity ?? 99;
  const total = product.price * quantity;

  // Efecto para animación suave al mostrar/ocultar la sección de pedido
  useEffect(() => {
    if (orderSectionRef.current) {
      if (isOrderMode) {
        orderSectionRef.current.style.maxHeight = `${orderSectionRef.current.scrollHeight}px`;
      } else {
        orderSectionRef.current.style.maxHeight = '0';
      }
    }
  }, [isOrderMode, quantity]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderClick = () => {
    setIsOrderMode(true);
  };

  const handleCancelClick = () => {
    setIsOrderMode(false);
    // Restablecer la cantidad al cancelar
    setQuantity(1);
  };

  const handleContinueClick = () => {
    setIsPaymentFormOpen(true);
  };

  const handlePaymentSuccess = (result: any) => {
    toast({
      title: "¡Compra exitosa!",
      description: "Tu pedido ha sido procesado correctamente.",
    });
    setIsPaymentFormOpen(false);
    setIsOrderMode(false);
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
        <CardFooter className="flex justify-between items-center pt-0">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          {!isOrderMode ? (
            <Button
              size="sm"
              onClick={handleOrderClick}
              disabled={!isAvailable}
              className="transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAvailable ? "Ordenar" : "Agotado"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelClick}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
        
        {/* Sección de pedido con animaciones */}
        <div 
          ref={orderSectionRef}
          className="overflow-hidden transition-all duration-300 ease-in-out bg-primary/5 border-t"
          style={{ maxHeight: 0 }}
        >
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Solicitar: {product.name}</h4>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Cantidad</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center"
                  min={1}
                  max={maxQuantity}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                  className="h-8 w-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground ml-2">
                  (Máx: {maxQuantity})
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-sm font-medium">Total:</span>
                  <span className="ml-2 text-lg font-bold">${total.toFixed(2)}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleContinueClick}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
}