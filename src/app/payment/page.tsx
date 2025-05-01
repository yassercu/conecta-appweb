'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, CreditCard } from 'lucide-react';
import { processPayment, type PaymentPlan, type PaymentResult } from '@/services/payment'; // Assuming service exists

// Updated plans with Spanish names
const plans: PaymentPlan[] = [
  { name: 'Mensual', price: 10 },
  { name: 'Anual', price: 96 }, // $8/month effective price
];

// Mock payment methods (Spanish)
const paymentMethods = [
    { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: CreditCard },
    // { id: 'paypal', name: 'PayPal', icon: PaypalIcon }, // Placeholder for PayPal icon
];

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) {
      toast({
        title: "Selección Incompleta",
        description: "Por favor, selecciona un plan y un método de pago.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd collect payment details here (e.g., using Stripe Elements)
      // For now, we just pass the selected method name
      const result: PaymentResult = await processPayment(selectedPlan, selectedMethod);

      if (result.success) {
        toast({
          title: "¡Pago Exitoso!",
          description: `${result.message} Tu promoción ${selectedPlan.name.toLowerCase()} está ahora activa.`,
          variant: "default", // Use default (green accent) for success
        });
        // Reset selection or redirect
        setSelectedPlan(null);
        setSelectedMethod(null);
      } else {
        toast({
          title: "Pago Fallido",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error procesando el pago:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado durante el procesamiento del pago.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Elige Tu Plan de Promoción</CardTitle>
        <CardDescription>Aumenta la visibilidad de tu negocio en LocalSpark.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <RadioGroup
          value={selectedPlan?.name}
          onValueChange={(value) => setSelectedPlan(plans.find(p => p.name === value) || null)}
          className="space-y-2"
        >
          <h3 className="font-medium">Selecciona un Plan:</h3>
          {plans.map((plan) => (
            <Label
              key={plan.name}
              htmlFor={`plan-${plan.name}`}
              className={`flex items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${selectedPlan?.name === plan.name ? 'border-primary bg-secondary' : 'border-muted'}`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={plan.name} id={`plan-${plan.name}`} />
                <div>
                  <span className="font-semibold">{plan.name}</span>
                   {plan.name === 'Anual' && <Badge variant="outline" className="ml-2 bg-accent text-accent-foreground border-none">Ahorra 20%</Badge>}
                </div>
              </div>
              <span className="font-bold text-lg">
                ${plan.price}
                 <span className="text-sm font-normal text-muted-foreground">/{plan.name === 'Mensual' ? 'mes' : 'año'}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        {/* Payment Method Selection */}
        {selectedPlan && (
            <RadioGroup
                value={selectedMethod || undefined}
                onValueChange={setSelectedMethod}
                className="space-y-2 pt-4 border-t"
            >
                 <h3 className="font-medium">Selecciona Método de Pago:</h3>
                 {paymentMethods.map((method) => (
                     <Label
                        key={method.id}
                        htmlFor={`method-${method.id}`}
                        className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:border-primary ${selectedMethod === method.id ? 'border-primary bg-secondary' : 'border-muted'}`}
                     >
                        <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                        <method.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{method.name}</span>
                     </Label>
                 ))}
                 {/* TODO: Add input fields for Credit Card details using Stripe Elements or similar */}
                 {selectedMethod === 'card' && (
                     <div className="p-4 border rounded-md bg-muted text-muted-foreground text-sm">
                         Los campos para detalles de tarjeta de crédito aparecerían aquí (usando una integración segura como Stripe Elements).
                     </div>
                 )}

            </RadioGroup>
        )}

      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={!selectedPlan || !selectedMethod || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Procesando...' : `Pagar $${selectedPlan?.price || 0} (${selectedPlan?.name || 'Plan'})`}
        </Button>
      </CardFooter>
    </Card>
  );
}
