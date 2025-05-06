import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/payment/PaymentForm';
import type { PaymentResult } from '@/services/payment-methods';
import { Card } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';
import { productPaymentMethods } from '@/services/payment-methods';

export interface ProductPaymentFormProps {
    product: {
        id: number;
        name: string;
        price: number;
        maxQuantity?: number;
    };
    quantity?: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: Error) => void;
    onQuantityChange?: (quantity: number) => void;
    maxQuantity?: number;
}

export function ProductPaymentForm({
    product,
    quantity = 1,
    isOpen,
    onClose,
    onSuccess,
    onError,
    onQuantityChange,
    maxQuantity = product.maxQuantity ?? 99
}: ProductPaymentFormProps) {
    const { toast } = useToast();
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const total = product.price * currentQuantity;

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setCurrentQuantity(newQuantity);
            onQuantityChange?.(newQuantity);
        }
    };

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

    if (!isOpen) return null;

    return (
        <>
            <Card className="p-6 space-y-4">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Cantidad</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                                    disabled={currentQuantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    value={currentQuantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="w-20 text-center"
                                    min={1}
                                    max={maxQuantity}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(currentQuantity + 1)}
                                    disabled={currentQuantity >= maxQuantity}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Máximo disponible: {maxQuantity}
                            </p>
                        </div>
                        <div className="text-right">
                            <Label>Total</Label>
                            <div className="text-2xl font-bold mt-1">
                                ${total.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => setShowPaymentForm(true)}
                    >
                        Proceder al pago
                    </Button>
                </div>
            </Card>

            <PaymentForm
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                amount={total}
                currency="USD"
                concept={`${currentQuantity}x ${product.name}`}
                onPaymentComplete={handlePaymentComplete}
                metadata={{
                    productId: product.id,
                    quantity: currentQuantity,
                    type: 'product_purchase'
                }}
                paymentMethods={productPaymentMethods}
            />
        </>
    );
}