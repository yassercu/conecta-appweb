import { MessageCircle, Send, Wallet, CreditCard, Building } from 'lucide-react';

export interface PaymentMethod {
    id: string;
    name: string;
    icon: any;
    description: string;
    countryRestriction?: string;
    processor: (paymentInfo: PaymentInfo) => Promise<PaymentResult>;
    children?: PaymentMethod[];
}

export interface PaymentInfo {
    amount: number;
    currency: string;
    concept: string;
    orderId?: string;
    customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    metadata?: Record<string, any>;
    businessPhone?: string; // Añadido para el número de WhatsApp del negocio
    businessContact?: string; // Añadido para el contacto directo del negocio
}

export interface PaymentResult {
    success: boolean;
    message: string;
    status?: 'completed' | 'pending';
    transactionId?: string;
    meta?: Record<string, any>;
}

// WhatsApp Payment Implementation
const processWhatsAppPayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    if (!paymentInfo.businessPhone) {
        return {
            success: false,
            message: 'Este negocio no tiene número de WhatsApp configurado',
        };
    }

    const message = `¡Hola! Me interesa realizar un pedido de ${paymentInfo.concept} por un total de ${paymentInfo.amount} ${paymentInfo.currency}`;
    const whatsappUrl = `https://wa.me/${paymentInfo.businessPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    return {
        success: true,
        status: 'pending',
        message: 'Abriendo chat de WhatsApp para coordinar el pedido...',
    };
};

// Internal Request Implementation
const processInternalRequest = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    // Aquí iría la lógica para enviar la solicitud al propietario del negocio
    // Por ahora solo simulamos el proceso
    return {
        success: true,
        status: 'pending',
        message: 'Tu solicitud ha sido enviada al propietario del negocio. Te contactarán pronto para coordinar los detalles.',
    };
};

// Direct Message Payment Implementation
const processDirectMessagePayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    if (!paymentInfo.businessContact) {
        return {
            success: false,
            message: 'Este negocio no tiene contacto directo configurado',
        };
    }

    const message = `¡Hola! Me interesa realizar un pedido de ${paymentInfo.concept} por un total de ${paymentInfo.amount} ${paymentInfo.currency}`;
    const directMessageUrl = `mailto:${paymentInfo.businessContact}?subject=Pedido&body=${encodeURIComponent(message)}`;
    window.open(directMessageUrl, '_blank');

    // Notificar al usuario con los detalles del mensaje enviado
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('direct-message-sent', {
            detail: { message, contact: paymentInfo.businessContact }
        }));
    }

    return {
        success: true,
        status: 'pending',
        message: `Se abrió tu cliente de correo para coordinar el pedido con ${paymentInfo.businessContact}. Mensaje: ${message}`,
    };
};

// Tropipay Implementation
const processTropipayPayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    try {
        // Verificar si la API key está disponible
        if (!import.meta.env.PUBLIC_TROPIPAY_API_KEY) {
            console.error('Falta la API key de Tropipay');
            return {
                success: false,
                message: 'Error de configuración: No se pueden procesar pagos con Tropipay en este momento',
            };
        }

        const response = await fetch('https://tropipay.com/api/v2/paymentcards', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.PUBLIC_TROPIPAY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reference: paymentInfo.orderId || Date.now().toString(),
                concept: paymentInfo.concept,
                description: paymentInfo.concept,
                currency: paymentInfo.currency,
                amount: paymentInfo.amount,
                singleUse: true,
                redirectUrl: `${window.location.origin}/payment/success`,
                // Agregar campos adicionales según la documentación de Tropipay
            }),
        });

        const data = await response.json();

        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
            return {
                success: true,
                message: 'Redirigiendo a Tropipay',
                transactionId: data.reference,
            };
        }

        throw new Error('No se pudo crear la tarjeta de pago');
    } catch (error) {
        console.error('Error al procesar pago con Tropipay:', error);
        return {
            success: false,
            message: 'Error al procesar el pago con Tropipay',
        };
    }
};

// Enzona Implementation
const processEnzonaPayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    try {
        // Verificar si las variables de entorno están disponibles
        if (!import.meta.env.PUBLIC_ENZONA_ACCESS_TOKEN || !import.meta.env.PUBLIC_ENZONA_MERCHANT_UUID) {
            console.error('Faltan variables de entorno para EnZona');
            return {
                success: false,
                message: 'Error de configuración: No se pueden procesar pagos con EnZona en este momento',
            };
        }

        const response = await fetch('https://api.enzona.net/payment/v1.0.0/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.PUBLIC_ENZONA_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchant_uuid: import.meta.env.PUBLIC_ENZONA_MERCHANT_UUID,
                currency: 'CUP',
                amount: paymentInfo.amount,
                description: paymentInfo.concept,
                return_url: `${window.location.origin}/payment/success`,
                cancel_url: `${window.location.origin}/payment/cancel`,
                // Campos adicionales según la documentación de Enzona
            }),
        });

        const data = await response.json();

        if (data.payment_url) {
            window.location.href = data.payment_url;
            return {
                success: true,
                message: 'Redirigiendo a Enzona',
                transactionId: data.transaction_uuid,
            };
        }

        throw new Error('No se pudo crear el pago en Enzona');
    } catch (error) {
        console.error('Error al procesar pago con Enzona:', error);
        return {
            success: false,
            message: 'Error al procesar el pago con Enzona',
        };
    }
};

// Transfermóvil Implementation
const processTransfermovilPayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    try {
        // Verificar si la API key está disponible
        if (!import.meta.env.PUBLIC_TRANSFERMOVIL_API_KEY) {
            console.error('Falta la API key de Transfermóvil');
            return {
                success: false,
                message: 'Error de configuración: No se pueden procesar pagos con Transfermóvil en este momento',
            };
        }

        const response = await fetch('https://api.transfermovil.com/payment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.PUBLIC_TRANSFERMOVIL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: paymentInfo.amount,
                currency: 'CUP',
                description: paymentInfo.concept,
                returnUrl: `${window.location.origin}/payment/success`,
                // Campos adicionales según la documentación de Transfermóvil
            }),
        });

        const data = await response.json();

        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
            return {
                success: true,
                message: 'Redirigiendo a Transfermóvil',
                transactionId: data.transactionId,
            };
        }

        throw new Error('No se pudo crear el pago en Transfermóvil');
    } catch (error) {
        console.error('Error al procesar pago con Transfermóvil:', error);
        return {
            success: false,
            message: 'Error al procesar el pago con Transfermóvil',
        };
    }
};

// Credit Card Implementation (placeholder)
const processCreditCardPayment = async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
    // Implementar integración con pasarela de pago
    return {
        success: false,
        message: 'Método de pago en implementación',
    };
};

// Define los métodos de pago disponibles para productos
export const productPaymentMethods: PaymentMethod[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: MessageCircle,
        description: 'Coordina el pedido directamente por WhatsApp',
        processor: processWhatsAppPayment,
    },
    {
        id: 'directMessage',
        name: 'Mensaje Directo',
        icon: Send,
        description: 'Coordina el pedido directamente por correo electrónico',
        processor: processDirectMessagePayment,
    }
];

// Mantener los métodos de pago originales para otras funcionalidades
export const paymentMethods = [
    ...productPaymentMethods,
    {
        id: 'card',
        name: 'Tarjeta de Crédito/Débito',
        icon: CreditCard,
        description: 'Paga de forma segura con tu tarjeta',
        processor: processCreditCardPayment,
    },
    {
        id: 'tropipay',
        name: 'Tropipay',
        icon: Wallet,
        description: 'Paga usando tu cuenta de Tropipay',
        processor: processTropipayPayment,
    },
    {
        id: 'local',
        name: 'Pagos Locales',
        icon: Building,
        description: 'Métodos de pago disponibles solo en Cuba',
        countryRestriction: 'CU',
        processor: async (paymentInfo: PaymentInfo): Promise<PaymentResult> => {
            // Este es un procesador placeholder que debería ser reemplazado por la implementación específica
            return {
                success: false,
                message: 'Por favor selecciona un método de pago local específico',
            };
        },
        children: [
            {
                id: 'enzona',
                name: 'Enzona',
                icon: Building,
                description: 'Paga con tu cuenta de Enzona',
                countryRestriction: 'CU',
                processor: processEnzonaPayment,
            },
            {
                id: 'transfermovil',
                name: 'Transfermóvil',
                icon: Building,
                description: 'Paga con Transfermóvil',
                countryRestriction: 'CU',
                processor: processTransfermovilPayment,
            },
        ],
    },
];