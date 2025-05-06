import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { paymentMethods as globalPaymentMethods } from '@/services/payment-methods';
import { PaymentErrorHandler } from '@/components/payment/PaymentErrorHandler';

export function PaymentForm({
    isOpen,
    onClose,
    amount,
    currency = 'USD',
    concept,
    onPaymentComplete,
    customerInfo = null,
    metadata,
    paymentMethods: customPaymentMethods,
    businessPhone,
    businessContact
}) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedLocalMethod, setSelectedLocalMethod] = useState(null);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    const paymentMethods = customPaymentMethods || globalPaymentMethods;

    const handlePaymentMethodSelect = (method) => {
        setSelectedMethod(method);
        if (method.id !== 'local') {
            setSelectedLocalMethod(null);
        }
        // Limpiar errores al cambiar de método
        setError(null);
        setErrorCode(null);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setErrorCode(null);

        try {
            const methodToUse = selectedLocalMethod || selectedMethod;
            const generatedOrderId = Date.now().toString();
            
            const result = await methodToUse.processor({
                amount,
                currency,
                concept,
                orderId: generatedOrderId,
                customerInfo,
                metadata,
                businessPhone,
                businessContact
            });

            if (result.transactionId) {
                setTransactionId(result.transactionId);
            }

            if (!result.success) {
                // Capturar errores devueltos desde el procesador
                setError(result.message);
                setErrorCode(result.errorCode || 'payment_failed');
                setLoading(false);
                return;
            }

            onPaymentComplete(result);
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            
            // Detectar errores de configuración específicos
            if (error.message && error.message.includes('process is not defined')) {
                setErrorCode('config_error');
                setError('Error de configuración en el sistema de pagos. Por favor contacta al soporte.');
            } else {
                setErrorCode('unknown_error');
                setError(error.message || 'Hubo un error al procesar el pago');
            }
            
            onPaymentComplete({
                success: false,
                message: error.message || 'Hubo un error al procesar el pago'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        // Reintentar el pago
        handleSubmit();
    };

    const renderPaymentMethodContent = () => {
        if (selectedMethod?.id === 'local') {
            return (
                <div className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Estos métodos de pago solo están disponibles para usuarios en Cuba.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                        {selectedMethod.children.map((localMethod) => (
                            <Card
                                key={localMethod.id}
                                className={`p-4 cursor-pointer transition-all ${selectedLocalMethod?.id === localMethod.id
                                        ? 'border-2 border-primary bg-primary/5 shadow-sm'
                                        : 'border-transparent hover:border-primary/20 hover:bg-muted/50'
                                    }`}
                                onClick={() => setSelectedLocalMethod(localMethod)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <localMethod.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{localMethod.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {localMethod.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        if (selectedMethod?.id === 'card') {
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de tarjeta</Label>
                        <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Fecha de expiración</Label>
                            <Input
                                id="expiry"
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                                id="cvc"
                                placeholder="123"
                                required
                            />
                        </div>
                    </div>
                </form>
            );
        }

        return null;
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Selecciona el método de pago</DialogTitle>
                        <DialogDescription>
                            Monto a pagar: {amount} {currency}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            {paymentMethods
                                .filter((method) => {
                                    // Filtrar métodos de pago según el tipo de transacción:
                                    // - Para producto: mostrar WhatsApp y Mensaje Directo
                                    // - Para plan: mostrar WhatsApp para contactar soporte
                                    // - Para otras operaciones: no mostrar Mensaje Directo
                                    
                                    if (metadata?.type === 'product_purchase') {
                                        // Mostrar todos los métodos para compras de productos
                                        return true;
                                    } else if (metadata?.type === 'plan_subscription') {
                                        // Para planes, permitir WhatsApp para contactar soporte, pero no Mensaje Directo
                                        return method.id !== 'directMessage';
                                    } else {
                                        // Para otros tipos, no mostrar mensaje directo
                                        return method.id !== 'directMessage';
                                    }
                                })
                                .map((method) => (
                                    <Card
                                        key={method.id}
                                        className={`p-4 cursor-pointer transition-all ${selectedMethod?.id === method.id
                                                ? 'border-2 border-primary bg-primary/5 shadow-sm'
                                                : 'border-transparent hover:border-primary/20 hover:bg-muted/50'
                                            }`}
                                        onClick={() => handlePaymentMethodSelect(method)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <method.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{method.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>

                        {renderPaymentMethodContent()}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedMethod || (selectedMethod.id === 'local' && !selectedLocalMethod) || loading}
                        >
                            {loading ? 'Procesando...' : 'Continuar con el pago'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Integrar el manejador de errores */}
            <PaymentErrorHandler 
                errorMessage={error}
                errorCode={errorCode}
                transactionId={transactionId}
                merchantOpId={metadata?.orderId}
                onRetry={handleRetry}
            />
        </>
    );
}