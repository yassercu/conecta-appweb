import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Sparkles, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Planes de promoción
const plans = [
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función simulada para procesar el pago con Stripe
  const handlePayment = async (plan) => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      console.log(`Procesando pago para plan ${plan.id} con ciclo ${billingCycle}`);
      
      // En una implementación real, aquí se llamaría a la API para crear una sesión de pago
      // con Stripe y redirigir al usuario a la página de pago
      
      // Simulación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulación de éxito (90% de probabilidad)
      if (Math.random() < 0.9) {
        setIsSuccess(true);
      } else {
        throw new Error('Error al procesar el pago');
      }
    } catch (error) {
      setErrorMessage('Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Si el pago fue exitoso, mostrar mensaje de confirmación
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            Tu plan de promoción ha sido activado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Tu negocio ahora aparecerá como destacado en nuestra plataforma. Puedes comenzar a disfrutar de los beneficios inmediatamente.
          </p>
          <p className="font-medium">
            Gracias por confiar en ConectaApp para hacer crecer tu negocio.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <a href="/business/dashboard">Ir a Mi Panel</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

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
      <div className="grid md:grid-cols-2 gap-6">
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
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {plan.id === 'premium' ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-blue-500" />
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
                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-muted-foreground ml-1.5">
                    /{billingCycle === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Equivale a {12 - (plan.yearlyDiscount / 100) * 12} meses
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
                disabled={isProcessing}
                onClick={() => handlePayment(plan)}
              >
                {isProcessing ? 'Procesando...' : `Contratar Plan ${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Mensaje de error */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mt-6">
          {errorMessage}
        </div>
      )}
      
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
              Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como PayPal y transferencias bancarias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 