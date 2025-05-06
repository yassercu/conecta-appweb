# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

# Orbita App

Plataforma para encontrar y promocionar negocios locales.

## Variables de entorno

La aplicación requiere ciertas variables de entorno para funcionar correctamente. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Variables públicas (accesibles desde el navegador)

Estas variables deben tener el prefijo `PUBLIC_`:

```
# Información de la aplicación
PUBLIC_APP_URL=https://orbita.app

# Configuración de pasarelas de pago
PUBLIC_ENZONA_ACCESS_TOKEN=tu_token_de_acceso
PUBLIC_ENZONA_MERCHANT_UUID=tu_merchant_uuid
PUBLIC_TROPIPAY_API_KEY=tu_api_key
PUBLIC_TRANSFERMOVIL_API_KEY=tu_api_key

# Número de teléfono de soporte (para compras de planes)
PUBLIC_SUPPORT_PHONE=5355555555
```

### Variables privadas (solo accesibles desde el servidor)

Estas variables se mantienen privadas y solo están disponibles en el servidor:

```
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=orbita_db

# Configuración de API
ENZONA_CONSUMER_SECRET=tu_consumer_secret
API_SECRET_KEY=tu_clave_secreta
```

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar la build de producción
npm run preview
```
