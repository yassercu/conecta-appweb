import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentErrorAlertProps {
  error: Error | string | null;
  open: boolean;
  onClose: () => void;
  tryAgain?: () => void;
}

export function PaymentErrorAlert({ 
  error, 
  open, 
  onClose, 
  tryAgain 
}: PaymentErrorAlertProps) {
  const [isOpen, setIsOpen] = useState(open);
  
  // Sincronizar el estado isOpen con el prop open
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  // Manejar el cierre del diálogo
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  // Manejar la acción de reintentar
  const handleTryAgain = () => {
    setIsOpen(false);
    if (tryAgain) {
      tryAgain();
    } else {
      onClose();
    }
  };

  // Extraer el mensaje de error
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : 'Se produjo un error al procesar el pago';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Error en el Procesamiento de Pago
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4 py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-red-500" 
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
                  <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Por favor, intenta nuevamente o utiliza otro método de pago. Si el problema persiste, 
                contacta con nuestro soporte técnico.
              </p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium">Posibles causas:</h4>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Problemas de conexión con la pasarela de pago</li>
                  <li>Datos de pago incorrectos o incompletos</li>
                  <li>La pasarela de pago puede estar experimentando problemas técnicos</li>
                  <li>Tu banco puede haber rechazado la transacción</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>Cerrar</AlertDialogAction>
          {tryAgain && (
            <AlertDialogAction 
              onClick={handleTryAgain}
              className="bg-primary hover:bg-primary/90"
            >
              Intentar de nuevo
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 