import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Sparkles, Calendar, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/use-payment';
import { PaymentForm } from './PaymentForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Planes de promoción
const plans = [
  {
    id: 'free',
    name: 'Plan Básico',
    description: 'Comienza a mostrar tu negocio',
    features: [
      'Registro básico del negocio',
      'Perfil básico en la plataforma',
      'Aparición en resultados de búsqueda',
      'Información de contacto básica',
    ],
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: 0,
    popular: false,
  },
  {
    id: 'basic',
    name: 'Destacado Local',
    description: 'Impulsa tu negocio en tu comunidad local',
    features: [
      'Aparición destacada en búsquedas locales',
      'Badge "Destacado" en tu perfil',
      'Prioridad en resultados de búsqueda',
      'Estadísticas básicas de visitas',
    ],
    monthlyPrice: 10,
    yearlyPrice: 96,
    yearlyDiscount: 20,
    popular: false,
  },
  {
    id: 'premium',
    name: 'Destacado Premium',
    description: 'Máxima visibilidad para tu negocio',
    features: [
      'Todo lo incluido en el plan Destacado Local',
      'Aparición en la sección "Destacados" de la página principal',
      'Estadísticas avanzadas de interacciones',
      'Destacado en resultados de tu categoría',
      'Soporte prioritario',
    ],
    monthlyPrice: 20,
    yearlyPrice: 192,
    yearlyDiscount: 20,
    popular: true,
  },
];

// Componente para el proceso de pago
export default function PaymentPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { toast } = useToast();

  const {
    isOpen: isPaymentFormOpen,
    loading,
    error,
    handlePayment,
    handlePaymentComplete,
    setIsOpen: setIsPaymentFormOpen
  } = usePayment({
    onSuccess: (result) => {
      toast({
        title: "¡Pago exitoso!",
        description: "Tu plan ha sido activado correctamente.",
      });
      window.location.href = '/business/dashboard';
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: error.message,
      });
    }
  });

  const handlePlanSelect = (plan) => {
    if (plan.id === 'free') {
      window.location.href = '/register';
      return;
    }

    setSelectedPlan(plan);
    handlePayment({
      amount: billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
      currency: 'USD',
      concept: `Plan ${plan.name} (${billingCycle === 'monthly' ? 'Mensual' : 'Anual'})`,
      metadata: {
        planId: plan.id,
        billingCycle,
        type: 'plan_subscription'
      }
    });
  };

  // Mostrar planes de promoción
  return (
    <div className="space-y-8">
      {/* Selector de ciclo de facturación */}
      <div className="flex justify-center mb-8">
        <Tabs
          defaultValue="monthly"
          value={billingCycle}
          onValueChange={setBillingCycle}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" className="text-center">
              Mensual
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-center">
              Anual <span className="ml-1.5 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 dark:bg-green-900 dark:text-green-100">20% ahorro</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Planes de promoción */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden flex flex-col h-full ${plan.popular ? 'border-primary shadow-md' : ''}`}
          >
            {/* Badge de popular */}
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-md font-medium">
                  Más Popular
                </div>
              </div>
            )}

            <CardHeader className="px-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {plan.id === 'premium' ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : plan.id === 'basic' ? (
                      <Sparkles className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              {/* Precio */}
              <div className="mt-1">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    {plan.monthlyPrice === 0 ? 'Gratis' : `$${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground ml-1.5">
                      /{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.yearlyDiscount > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex flex-col items-start">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Equivale a {12 - (plan.yearlyDiscount / 100) * 12} meses
                    </span>
                    <span className="ml-5">
                      Sin descuento: <span className="line-through">${plan.monthlyPrice * 12}</span> USD
                    </span>
                    <span className="ml-5 text-xs text-muted-foreground">
                      (Ahorro de {plan.yearlyDiscount}% respecto al pago mensual)
                    </span>
                  </p>
                )}
              </div>

              {/* Lista de características */}
              <ul className="space-y-2.5 mt-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4 mt-auto">
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                disabled={plan.id === 'free'}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.id === 'free' ? 'Plan Actual' : `Contratar Plan ${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Formulario de pago */}
      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        amount={selectedPlan ? (billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice) : 0}
        currency="USD"
        concept={selectedPlan ? `Plan ${selectedPlan.name} (${billingCycle === 'monthly' ? 'Mensual' : 'Anual'})` : ''}
        onPaymentComplete={handlePaymentComplete}
        metadata={{
          planId: selectedPlan?.id,
          billingCycle,
          type: 'plan_subscription'
        }}
      />

      {/* Información adicional */}
      <div className="mt-12 bg-muted/50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />
          Preguntas Frecuentes
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">¿Cómo funciona la promoción destacada?</h4>
            <p className="text-sm text-muted-foreground">
              Tu negocio aparecerá en posiciones prioritarias en los resultados de búsqueda y con un distintivo especial que lo hará más visible para los usuarios.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Puedo cancelar mi suscripción?</h4>
            <p className="text-sm text-muted-foreground">
              Sí, puedes cancelar en cualquier momento desde tu panel de control. Los planes mensuales se cancelan al final del mes en curso, y los anuales al final del periodo contratado.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Qué métodos de pago aceptan?</h4>
            <p className="text-sm text-muted-foreground">
              Aceptamos tarjetas de crédito y débito, pagos conciliados mediante WhatsApp y Tropipay.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">¿Qué tipo de modenas y taza de cambio aceptan?</h4>
            <p className="text-sm text-muted-foreground">
              Aceptamos casi cuanquire moneda de curso legal en Cuban (USD,EUR, MLC, CUP) y cualqueir otra que se pacte directamente con nuestro equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}