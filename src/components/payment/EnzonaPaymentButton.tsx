import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { enzonaService } from '@/services/enzona.service';
import { generateId } from '@/lib/utils';
import { PaymentErrorAlert } from './PaymentErrorAlert';

interface EnzonaPaymentButtonProps {
  amount: number;
  description: string;
  businessName: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function EnzonaPaymentButton({
  amount,
  description,
  businessName,
  onSuccess,
  onError,
  className
}: EnzonaPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  const handlePayment = async () => {
    setError(null);
    
    try {
      setIsLoading(true);
      
      // Validación básica
      if (!amount || amount <= 0) {
        throw new Error("El monto del pago debe ser mayor que cero");
      }
      
      // Generar ID único para la transacción
      const merchantOpId = generateId(); 
      
      // Crear la solicitud de pago
      const paymentResponse = await enzonaService.createPayment({
        amount,
        description: `${description} - ${businessName}`,
        currency: 'CUP', // Moneda cubana
        merchantOpId,
        returnUrl: `${window.location.origin}/payment/success?transaction_id=${merchantOpId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?transaction_id=${merchantOpId}`,
      });
      
      if (onSuccess) {
        onSuccess(paymentResponse.transactionUuid);
      }
      
      // Redirigir al usuario a la página de pago de EnZona
      window.location.href = paymentResponse.redirectUrl;
      
    } catch (error) {
      console.error('Error al procesar el pago con EnZona:', error);
      
      // Convertir el error a un objeto Error si no lo es
      const errorObj = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : 'Error desconocido al procesar el pago');
      
      // Formatear mensajes de error específicos
      if (errorObj.message.includes('token')) {
        errorObj.message = 'Error de autenticación con la pasarela de pago. Por favor, intenta más tarde.';
      } else if (errorObj.message.includes('network') || errorObj.message.includes('fetch')) {
        errorObj.message = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      }
      
      setError(errorObj);
      setShowErrorDialog(true);
      
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reintentar el pago
  const handleRetry = () => {
    handlePayment();
  };
  
  // Cerrar el diálogo de error
  const handleCloseError = () => {
    setShowErrorDialog(false);
    setError(null);
  };
  
  return (
    <>
      <Button 
        onClick={handlePayment} 
        disabled={isLoading}
        className={className}
        size="lg"
      >
        {isLoading ? 'Procesando...' : 'Pagar con EnZona'}
      </Button>
      
      {/* Diálogo de error */}
      <PaymentErrorAlert 
        error={error}
        open={showErrorDialog}
        onClose={handleCloseError}
        tryAgain={handleRetry}
      />
    </>
  );
} 