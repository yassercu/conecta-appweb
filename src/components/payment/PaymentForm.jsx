import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { paymentMethods as globalPaymentMethods } from '@/services/payment-methods';
import { PaymentErrorHandler } from '@/components/payment/PaymentErrorHandler';
import { AlertCircle } from 'lucide-react';

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
    
    // Estados para los campos de tarjeta
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    
    // Estados para los errores de validación
    const [cardNumberError, setCardNumberError] = useState('');
    const [cardExpiryError, setCardExpiryError] = useState('');
    const [cardCvcError, setCardCvcError] = useState('');

    const handlePaymentMethodSelect = (method) => {
        setSelectedMethod(method);
        if (method.id !== 'local') {
            setSelectedLocalMethod(null);
        }
        // Limpiar errores al cambiar de método
        setError(null);
        setErrorCode(null);
        
        // Reiniciar los campos de tarjeta y sus errores
        if (method.id === 'card') {
            setCardNumber('');
            setCardExpiry('');
            setCardCvc('');
            setCardNumberError('');
            setCardExpiryError('');
            setCardCvcError('');
        }
    };
    
    // Funciones de validación
    const validateCardNumber = (number) => {
        const cardNumberRegex = /^[0-9]{13,19}$/;
        if (!number || !cardNumberRegex.test(number.replace(/\s/g, ''))) {
            setCardNumberError('Introduce un número de tarjeta válido (13-19 dígitos)');
            return false;
        }
        setCardNumberError('');
        return true;
    };
    
    const validateCardExpiry = (expiry) => {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiry || !expiryRegex.test(expiry)) {
            setCardExpiryError('Formato válido: MM/AA');
            return false;
        }
        
        // Validar que la fecha no haya expirado
        const [month, year] = expiry.split('/');
        const expiryDate = new Date(20 + year, month - 1);
        const currentDate = new Date();
        
        if (expiryDate < currentDate) {
            setCardExpiryError('La tarjeta ha expirado');
            return false;
        }
        
        setCardExpiryError('');
        return true;
    };
    
    const validateCardCvc = (cvc) => {
        const cvcRegex = /^[0-9]{3,4}$/;
        if (!cvc || !cvcRegex.test(cvc)) {
            setCardCvcError('El CVC debe tener 3 o 4 dígitos');
            return false;
        }
        setCardCvcError('');
        return true;
    };
    
    // Manejadores de cambios en los inputs con validación
    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/[^\d\s]/g, '');
        // Formatear el número con espacios cada 4 dígitos
        const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };
    
    const handleCardExpiryChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, '');
        
        // Automáticamente añadir el '/' después de los 2 primeros dígitos
        if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }
        
        setCardExpiry(value);
    };
    
    const handleCardCvcChange = (e) => {
        const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
        setCardCvc(value);
    };
    
    // Validación del formulario completa
    const validateCardForm = () => {
        const isCardNumberValid = validateCardNumber(cardNumber);
        const isCardExpiryValid = validateCardExpiry(cardExpiry);
        const isCardCvcValid = validateCardCvc(cardCvc);
        
        return isCardNumberValid && isCardExpiryValid && isCardCvcValid;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Validar datos de tarjeta si ese es el método seleccionado
        if (selectedMethod?.id === 'card' && !validateCardForm()) {
            return;
        }
        
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
                businessContact,
                // Incluir datos de tarjeta si ese es el método seleccionado
                ...(selectedMethod?.id === 'card' && {
                    cardData: {
                        number: cardNumber.replace(/\s/g, ''),
                        expiry: cardExpiry,
                        cvc: cardCvc
                    }
                })
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
                            placeholder="Ej: 1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            onBlur={() => validateCardNumber(cardNumber)}
                            className={cardNumberError ? 'border-red-500' : ''}
                            required
                        />
                        {cardNumberError && (
                            <p className="text-xs text-red-500 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> {cardNumberError}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Fecha de expiración</Label>
                            <Input
                                id="expiry"
                                placeholder="Ej: 12/25"
                                value={cardExpiry}
                                onChange={handleCardExpiryChange}
                                onBlur={() => validateCardExpiry(cardExpiry)}
                                className={cardExpiryError ? 'border-red-500' : ''}
                                required
                            />
                            {cardExpiryError && (
                                <p className="text-xs text-red-500 flex items-center mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" /> {cardExpiryError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                                id="cvc"
                                placeholder="Ej: 123"
                                value={cardCvc}
                                onChange={handleCardCvcChange}
                                onBlur={() => validateCardCvc(cardCvc)}
                                className={cardCvcError ? 'border-red-500' : ''}
                                required
                            />
                            {cardCvcError && (
                                <p className="text-xs text-red-500 flex items-center mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" /> {cardCvcError}
                                </p>
                            )}
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
                onClose={() => {
                    setError(null);
                    setErrorCode(null);
                }}
            />
        </>
    );
}