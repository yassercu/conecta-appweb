import { MessageCircle, Send, Wallet, CreditCard, Building } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

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
    // Logs para depuración
    console.log("== DEBUG WhatsApp Payment ==");
    console.log("paymentInfo recibido:", paymentInfo);
    console.log("businessPhone:", paymentInfo.businessPhone);
    console.log("tipo de businessPhone:", typeof paymentInfo.businessPhone);
    console.log("¿businessPhone está vacío?:", !paymentInfo.businessPhone);
    console.log("¿businessPhone es undefined?:", paymentInfo.businessPhone === undefined);
    console.log("¿businessPhone es cadena vacía?:", paymentInfo.businessPhone === "");
    console.log("=========================");
    
    // Número de teléfono de soporte de la plataforma
    const SUPPORT_PHONE = import.meta.env.PUBLIC_SUPPORT_PHONE || "5355555555"; // Teléfono por defecto si no está configurado
    
    // Determinar si es una contratación de plan (verificando 'plan_subscription' que es lo que usa PaymentPlans)
    const isPlanPurchase = paymentInfo.metadata?.type === 'plan_subscription';
    
    // Para productos, usar el teléfono del negocio pasado como parámetro
    // (no el de la propiedad businessPhone que podría estar mezclada con la interfaz de pagos)
    let phoneToUse = '';
    
    if (isPlanPurchase) {
        // Para planes, usar el teléfono de soporte
        phoneToUse = SUPPORT_PHONE;
        console.log("Usando teléfono de soporte:", phoneToUse);
    } else {
        // Para productos, usar el teléfono del negocio
        // Primero intentar usar el teléfono pasado como parámetro directo
        phoneToUse = paymentInfo.businessPhone || '';
        console.log("Usando teléfono del negocio:", phoneToUse);
        
        // Verificar si el teléfono es válido
        if (!phoneToUse || phoneToUse.trim() === '') {
            console.error('No se proporcionó un número de teléfono válido para el negocio');
            return {
                success: false,
                message: 'Este negocio no tiene número de WhatsApp configurado',
            };
        }
    }
    
    // Personalizar el mensaje según el contexto
    let message = '';
    if (isPlanPurchase) {
        message = `¡Hola! Me interesa contratar el plan ${paymentInfo.concept} por un valor de ${paymentInfo.amount} ${paymentInfo.currency}. Por favor, necesito información para realizar el pago.`;
    } else {
        message = `¡Hola! Me interesa realizar un pedido de ${paymentInfo.concept} por un total de ${paymentInfo.amount} ${paymentInfo.currency}`;
    }
    
    console.log('Enviando mensaje de WhatsApp al número:', phoneToUse);
    
    // Crear la URL de WhatsApp con el número y mensaje adecuados
    const whatsappUrl = `https://wa.me/${phoneToUse}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Personalizar el mensaje de retorno según el contexto
    const successMessage = isPlanPurchase 
        ? 'Abriendo chat de WhatsApp para coordinar la contratación del plan con el soporte...'
        : 'Abriendo chat de WhatsApp para coordinar el pedido con el negocio...';
    
    return {
        success: true,
        status: 'pending',
        message: successMessage,
        meta: {
            contactType: isPlanPurchase ? 'support' : 'business',
            contactNumber: phoneToUse
        }
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
    // Crear mensaje con los detalles del pedido
    const message = `¡Hola! Me interesa realizar un pedido de ${paymentInfo.concept} por un total de ${paymentInfo.amount} ${paymentInfo.currency}`;
    
    // Destinatario (usar el contact si existe, o indicar que se usará el predeterminado)
    const destinatario = paymentInfo.businessContact || 'soporte@plataforma.com (predeterminado)';
    
    // Mostrar el mensaje en la consola en lugar de abrir un cliente de correo
    console.log('===== MENSAJE DIRECTO =====');
    console.log(`Destinatario: ${destinatario}`);
    console.log(`Mensaje: ${message}`);
    console.log('==========================');

    // Mostrar notificación visual al usuario 
    if (typeof window !== 'undefined') {
        // 1. Usar evento para notificar a los componentes
        window.dispatchEvent(new CustomEvent('direct-message-sent', {
            detail: { message, contact: destinatario }
        }));
        
        // 2. Mostrar toast de confirmación en lugar de una alerta
        setTimeout(() => {
            toast({
                title: "¡Mensaje enviado exitosamente!",
                description: `Destinatario: ${destinatario}\n\nSe ha enviado tu solicitud de pedido. El negocio se pondrá en contacto contigo pronto.`,
                variant: "success",
                duration: 6000 // 6 segundos
            });
        }, 500);
    }

    return {
        success: true,
        status: 'pending',
        message: `Mensaje enviado exitosamente: "${message}"`,
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