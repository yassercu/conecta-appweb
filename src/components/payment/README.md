# Sistema de Pagos Orbita-Y

Este módulo implementa un sistema de pagos modular y reutilizable para Orbita-Y.

## Métodos de Pago Disponibles

### 1. WhatsApp
- Permite coordinar pagos directamente con el agente comercial
- Número de contacto: +5350698123
- Ideal para clientes que prefieren atención personalizada

### 2. Tropipay
- Integración directa con la API de Tropipay
- Procesamiento automático de pagos
- Soporte para múltiples monedas

### 3. Pagos Locales (Solo Cuba)
#### Enzona
- Integración con la API de Enzona
- Pagos en moneda nacional (CUP)
- Proceso automático de verificación

#### Transfermóvil
- Integración con la API de Transfermóvil
- Pagos en moneda nacional (CUP)
- Verificación automática de transacciones

### 4. Tarjeta de Crédito/Débito
- Procesamiento seguro de tarjetas
- Soporte para principales emisores

## Uso del Sistema

### 1. Para Planes de Suscripción
```jsx
import { PaymentForm } from '@/components/payment/PaymentForm';
import { usePayment } from '@/hooks/use-payment';

// Usar el hook usePayment
const {
  isOpen,
  handlePayment,
  handlePaymentComplete,
} = usePayment({
  onSuccess: (result) => {
    // Manejar éxito
  },
  onError: (error) => {
    // Manejar error
  }
});

// Renderizar el formulario
<PaymentForm
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  amount={amount}
  currency="USD"
  concept="Concepto del pago"
  onPaymentComplete={handlePaymentComplete}
/>
```

### 2. Para Productos
```jsx
import { ProductPaymentForm } from '@/components/business/ProductPaymentForm';

<ProductPaymentForm
  product={product}
  quantity={quantity}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

## Configuración

### Variables de Entorno Requeridas
```env
TROPIPAY_API_KEY=your_tropipay_api_key
ENZONA_ACCESS_TOKEN=your_enzona_token
ENZONA_MERCHANT_UUID=your_merchant_uuid
TRANSFERMOVIL_API_KEY=your_transfermovil_key
```

## Personalización

El sistema es completamente modular y se puede extender agregando nuevos métodos de pago en el archivo `payment-methods.ts`. Cada método de pago debe implementar la interfaz `PaymentMethod`.