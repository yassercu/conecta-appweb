import { useState } from 'react';
import type { PaymentInfo, PaymentResult } from '@/services/payment-methods';

interface UsePaymentOptions {
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
}

export function usePayment(options: UsePaymentOptions = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async (paymentInfo: PaymentInfo) => {
        setIsOpen(true);
        setError(null);
    };

    const handlePaymentComplete = (result: PaymentResult) => {
        setLoading(false);
        setIsOpen(false);

        if (result.success) {
            options.onSuccess?.(result);
        } else {
            const error = new Error(result.message);
            setError(result.message);
            options.onError?.(error);
        }

        options.onComplete?.();
    };

    return {
        isOpen,
        loading,
        error,
        setIsOpen,
        handlePayment,
        handlePaymentComplete,
    };
}