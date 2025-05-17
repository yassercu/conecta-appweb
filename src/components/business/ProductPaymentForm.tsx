import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from '@/components/payment/PaymentForm';
import type { PaymentResult } from '@/services/payment-methods';
import { Card } from '@/components/ui/card';
import { productPaymentMethods } from '@/services/payment-methods';
import { useBusiness } from '@/hooks/useApi';
import { X, ShoppingBag, Rocket, Calendar, Clock, MapPin, Phone, User, CreditCard, Mail } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/date-utils';

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
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const total = product.price * quantity;
    
    // Validar si hay al menos un método de contacto
    const hasValidContact = !!customerPhone || !!customerEmail;
    
    // Generar un código de orden único con formato orbital
    const orderCode = `OS-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    
    // Obtener fecha y hora actual para el pedido
    const currentDate = new Date();
    const formattedDate = formatDate ? formatDate(currentDate) : currentDate.toLocaleDateString();
    const formattedTime = formatTime ? formatTime(currentDate) : currentDate.toLocaleTimeString();

    // Usar el hook de API para obtener los datos del negocio
    const {
        data: business,
        loading: loadingBusiness,
        error: businessError
    } = useBusiness(businessId || '', {
        skip: !businessId,
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
            }, 300);
        }
    }, [isOpen]);

    // Mensaje para el negocio
    const generateBusinessMessage = () => {
        return `🚀 Pedido desde Conecta App - Estación Orbital
${orderCode}
📅 ${formattedDate} ⌚ ${formattedTime}

Tipo de servicio: Por definir

👤 Nombre: ${customerName}
${customerPhone ? `📱 Teléfono: ${customerPhone}` : ''}
${customerEmail ? `📧 Email: ${customerEmail}` : ''}
${customerAddress ? `📍 Dirección: ${customerAddress}` : '📍 Entrega: Por acordar con el cliente'}

📋 Productos
✖️${quantity} ${product.name}  💲 ${product.price.toFixed(2)}

Subtotal: 💲 ${total.toFixed(2)}
Entrega: Por definir
Total: 💲 ${total.toFixed(2)}

💰 Pago
Estado del pago: Pendiente
Total a pagar: 💲 ${total.toFixed(2)}`;
    };

    // Mensaje para el cliente
    const generateClientMessage = () => {
        return `¡Tu pedido ha sido enviado con éxito!

🚀 Resumen de tu pedido orbital:
📁 Código: ${orderCode}
📅 Fecha: ${formattedDate}
⌚ Hora: ${formattedTime}

📦 Producto: ${product.name}
🔢 Cantidad: ${quantity}
💰 Total: 💲 ${total.toFixed(2)}

Pronto el negocio se pondrá en contacto contigo para coordinar la entrega y el pago.
¡Gracias por utilizar Conecta App - Estación Orbital!`;
    };

    const handlePaymentComplete = async (result: PaymentResult) => {
        try {
            // Generar mensajes
            const businessMessage = generateBusinessMessage();
            const clientMessage = generateClientMessage();
            
            console.log('Mensaje para el negocio:', businessMessage);
            console.log('Mensaje para el cliente:', clientMessage);
            
            toast({
                title: "¡Pedido enviado con éxito!",
                description: "Tu pedido está siendo procesado. Te contactaremos pronto.",
            });
            
            setShowPaymentForm(false);
            onSuccess?.({...result, orderMessage: businessMessage, clientMessage});
            onClose();
        } catch (error) {
            const err = error as Error;
            toast({
                variant: "destructive",
                title: "Error en el pedido",
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
                                <Rocket className="h-16 w-16 text-primary/50" />
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
                            <h3 className="text-xl font-semibold">Detalles del pedido</h3>
                            <p className="text-sm text-muted-foreground mt-1">Código: {orderCode}</p>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                            <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                                <ShoppingBag className="h-4 w-4" /> Producto:
                            </h4>
                            <div className="pl-5 border-l-2 border-primary/20">
                                <p className="font-medium">{product.name}</p>
                                <div className="flex justify-between text-sm mt-1">
                                    <span>Cantidad: {quantity}</span>
                                    <span>Precio unitario: ${product.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-sm">Total:</span>
                                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                <User className="h-4 w-4" /> Información del cliente:
                            </h4>
                            
                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Nombre</label>
                                    <div className="flex items-center border rounded-md px-3 py-1">
                                        <User className="h-4 w-4 text-muted-foreground mr-2" />
                                        <input 
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Tu nombre"
                                            className="bg-transparent border-none w-full focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Teléfono {!customerEmail && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="flex items-center border rounded-md px-3 py-1">
                                        <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                                        <input 
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Tu número telefónico"
                                            className="bg-transparent border-none w-full focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">
                                        Correo {!customerPhone && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="flex items-center border rounded-md px-3 py-1">
                                        <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                                        <input 
                                            type="email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="Tu correo electrónico"
                                            className="bg-transparent border-none w-full focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Dirección (opcional)</label>
                                    <div className="flex items-center border rounded-md px-3 py-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                        <input 
                                            type="text"
                                            value={customerAddress}
                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                            placeholder="Tu dirección de entrega (opcional)"
                                            className="bg-transparent border-none w-full focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                
                                {!hasValidContact && (
                                    <p className="text-xs text-amber-500 mt-1">
                                        Debes proporcionar al menos un teléfono o correo electrónico.
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <Button
                            className="w-full transition-transform duration-200 hover:scale-[1.02] mt-4"
                            onClick={() => setShowPaymentForm(true)}
                            disabled={!customerName || !hasValidContact}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
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
                    type: 'product_purchase',
                    customerName,
                    customerPhone,
                    customerEmail,
                    customerAddress,
                    orderCode,
                    orderMessage: generateBusinessMessage()
                }}
                paymentMethods={productPaymentMethods}
                businessPhone={businessPhone}
                businessContact={businessContact}
            />
        </>
    );
}