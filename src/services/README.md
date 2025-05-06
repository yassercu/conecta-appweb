# Integración con EnZona API de Pagos

Este directorio contiene los servicios necesarios para integrar la plataforma de pago EnZona en la aplicación Orbita-Y.

## Configuración de Variables de Entorno

Para que la integración funcione correctamente, debes configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto:

```
# Configuración API de EnZona
PUBLIC_ENZONA_API_URL=https://api.enzona.net/payment/v1.0.0
PUBLIC_ENZONA_CONSUMER_KEY=tu_consumer_key_aqui
ENZONA_CONSUMER_SECRET=tu_consumer_secret_aqui

# Otras configuraciones
PUBLIC_SITE_URL=http://localhost:4321
```

## Flujo de Pago con EnZona

1. **Inicio del Pago**: El usuario selecciona un plan en la página de precios y hace clic en "Pagar con EnZona".
2. **Creación de Transacción**: La aplicación genera un ID único para la transacción y envía una solicitud a la API de EnZona.
3. **Redirección**: El usuario es redirigido a la plataforma de pago de EnZona para completar la transacción.
4. **Callback**: Una vez completada o cancelada la transacción, EnZona redirige al usuario de vuelta a nuestra aplicación:
   - En caso de éxito: `/payment/success`
   - En caso de cancelación: `/payment/cancel`
5. **Verificación**: La aplicación verifica el estado del pago consultando la API de EnZona.

## Componentes Principales

- `enzona.service.ts`: Servicio que maneja todas las operaciones con la API de EnZona.
- `EnzonaPaymentButton.tsx`: Componente React para iniciar el proceso de pago.
- Páginas:
  - `/payment`: Muestra los planes disponibles.
  - `/payment/success`: Gestiona transacciones exitosas.
  - `/payment/cancel`: Gestiona transacciones canceladas o con error.

## Obteniendo Credenciales

Para obtener tus credenciales de EnZona:

1. Regístrate como comercio en el [Portal de Desarrolladores de EnZona](https://www.enzona.net)
2. Solicita las credenciales para el entorno de pruebas.
3. Una vez aprobado tu comercio, obtendrás el `Consumer Key` y `Consumer Secret` para integrar con el entorno de producción.

## Entornos

- **Pruebas**: `https://apisandbox.enzona.net/payment/v1.0.0`
- **Producción**: `https://api.enzona.net/payment/v1.0.0`

## Documentación Adicional

Para más información sobre la API de EnZona, consulta la [documentación oficial](https://www.enzona.net/desarrollo). 