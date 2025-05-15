import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/payment/PaymentForm';
import type { PaymentResult } from '@/services/payment-methods';
import { Card } from '@/components/ui/card';
import { productPaymentMethods } from '@/services/payment-methods';
import { useBusiness } from '@/hooks/useApi';
import { X, ShoppingBag } from 'lucide-react';

export interface ProductPaymentFormProps {
    product: {
        id: number;
        name: string;
        price: number;
        maxQuantity?: number;
        image?: string;
    };
    quantity: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: Error) => void;
    onQuantityChange?: (quantity: number) => void;
    maxQuantity?: number;
    businessId?: string;
}

export function ProductPaymentForm({
    product,
    quantity = 1,
    isOpen,
    onClose,
    onSuccess,
    onError,
    onQuantityChange,
    maxQuantity = product.maxQuantity ?? 99,
    businessId
}: ProductPaymentFormProps) {
    const { toast } = useToast();
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const total = product.price * quantity;

    // Usar el hook de API para obtener los datos del negocio
    const {
        data: business,
        loading: loadingBusiness,
        error: businessError
    } = useBusiness(businessId || '', {
        skip: !businessId, // No realizar la petición si no hay ID de negocio
        useCache: true,
        cacheKey: businessId ? `businesses:${businessId}` : undefined
    });

    // Efecto para animación de entrada y salida
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => {
                setIsVisible(false);
            }, 300); // Tiempo de la animación de salida
        }
    }, [isOpen]);

    useEffect(() => {
        if (business) {
            console.log('Negocio encontrado:', business);
            console.log('Teléfono del negocio:', business.phone);
        } else if (businessId && !loadingBusiness && !businessError) {
            console.error('No se encontró el negocio con ID:', businessId);
        }
    }, [business, businessId, loadingBusiness, businessError]);

    const handlePaymentComplete = async (result: PaymentResult) => {
        try {
            toast({
                title: "¡Pago exitoso!",
                description: "Tu pedido ha sido procesado correctamente.",
            });
            setShowPaymentForm(false);
            onSuccess?.(result);
            onClose();
        } catch (error) {
            const err = error as Error;
            toast({
                variant: "destructive",
                title: "Error en el pago",
                description: err.message,
            });
            onError?.(err);
        }
    };

    if (!isOpen && !isVisible) return null;

    const businessPhone = business?.phone ? String(business.phone) : '';
    const businessContact = business?.email ? String(business.email) : '';

    // Si estamos cargando los datos del negocio y se necesita para el pago, mostrar un estado de carga
    if (loadingBusiness && businessId && showPaymentForm) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <Card className="p-6 max-w-md w-full flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Cargando información del negocio...</span>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => {
                    // Cerrar si se hace clic fuera de la tarjeta
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <Card className={`p-0 max-w-md w-full mx-4 overflow-hidden shadow-lg transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    {/* Cabecera con imagen y botón de cerrar */}
                    <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-24 w-24 object-cover rounded-md shadow-md"
                                />
                            ) : (
                                <ShoppingBag className="h-16 w-16 text-primary/50" />
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-2 right-2 rounded-full bg-background/50 hover:bg-background/80"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* Contenido del pedido */}
                    <div className="p-6 space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold">{product.name}</h3>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-muted-foreground">
                                    Cantidad: <span className="font-medium text-foreground">{quantity}</span>
                                </p>
                                <p className="text-sm">
                                    Precio unitario: <span className="font-medium">${product.price.toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total a pagar:</span>
                                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <Button
                            className="w-full transition-transform duration-200 hover:scale-[1.02] mt-4"
                            onClick={() => setShowPaymentForm(true)}
                        >
                            Proceder al pago
                        </Button>
                    </div>
                </Card>
            </div>

            <PaymentForm
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                amount={total}
                currency="USD"
                concept={`${quantity}x ${product.name}`}
                onPaymentComplete={handlePaymentComplete}
                metadata={{
                    productId: product.id,
                    quantity: quantity,
                    type: 'product_purchase'
                }}
                paymentMethods={productPaymentMethods}
                businessPhone={businessPhone}
                businessContact={businessContact}
            />
        </>
    );
}