import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

interface PaymentErrorHandlerProps {
  transactionId?: string;
  merchantOpId?: string;
  errorCode?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

/**
 * Códigos de error conocidos de transacciones de pago
 */
const ERROR_MESSAGES: Record<string, string> = {
  'invalid_token': 'La sesión ha expirado. Por favor, inicia el proceso de pago nuevamente.',
  'unauthorized': 'No tienes permiso para realizar esta operación.',
  'not_found': 'No se encontró la transacción solicitada.',
  'insufficient_funds': 'Fondos insuficientes para realizar la operación.',
  'invalid_amount': 'El monto del pago es inválido.',
  'duplicate_transaction': 'Ya existe una transacción con este identificador.',
  'service_unavailable': 'El servicio de pago no está disponible en este momento.',
  'network_error': 'Error de conexión con el servicio de pago.',
  'timeout': 'La operación ha excedido el tiempo de espera.',
  'invalid_data': 'Los datos proporcionados son inválidos.',
  'default': 'Error al procesar el pago. Por favor, intenta nuevamente.'
};

export function PaymentErrorHandler({ 
  transactionId, 
  merchantOpId, 
  errorCode, 
  errorMessage, 
  onRetry 
}: PaymentErrorHandlerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(!!errorMessage);
  
  useEffect(() => {
    // Mostrar diálogo si hay un mensaje de error
    setIsDialogOpen(!!errorMessage);
    
    // Mostrar notificación toast para errores menos graves
    if (errorMessage && !errorCode?.includes('critical')) {
      toast({
        title: "Error en la transacción",
        description: getFormattedErrorMessage(),
        variant: "destructive",
      });
    }
    
    // Registrar el error
    if (errorMessage) {
      logPaymentError();
    }
  }, [errorMessage, errorCode]);
  
  // Obtener mensaje de error formateado
  const getFormattedErrorMessage = () => {
    if (!errorMessage && !errorCode) return ERROR_MESSAGES.default;
    
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    
    return errorMessage || ERROR_MESSAGES.default;
  };
  
  // Registrar error para análisis
  const logPaymentError = () => {
    console.error("Error de pago:", {
      transactionId,
      merchantOpId,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    
    // Aquí podrías enviar el error a un servicio de analítica o registro
    // La función actual solo registra en consola, pero se puede extender
  };
  
  // Manejar cierre del diálogo
  const handleClose = () => {
    setIsDialogOpen(false);
  };
  
  // Manejar reintento
  const handleRetry = () => {
    setIsDialogOpen(false);
    if (onRetry) {
      onRetry();
    }
  };
  
  if (!errorMessage && !errorCode) return null;
  
  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Error en el Procesamiento de Pago
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 py-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-destructive" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-destructive font-medium">
                      {getFormattedErrorMessage()}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Por favor, intenta nuevamente o utiliza otro método de pago. Si el problema persiste, 
                  contacta con nuestro soporte técnico.
                </p>
                
                {(transactionId || merchantOpId) && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Información de Referencia:</h4>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      {transactionId && <div>ID Transacción: {transactionId}</div>}
                      {merchantOpId && <div>ID Orden: {merchantOpId}</div>}
                      {errorCode && <div>Código: {errorCode}</div>}
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>Cerrar</AlertDialogAction>
            {onRetry && (
              <AlertDialogAction 
                onClick={handleRetry}
                className="bg-primary hover:bg-primary/90"
              >
                Intentar Nuevamente
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 