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

# Conecta AppWeb

## Descripción del Proyecto

Conecta AppWeb es una aplicación diseñada para facilitar la conexión entre usuarios y servicios a través de una plataforma intuitiva y fácil de usar. La aplicación permite a los usuarios buscar, comparar y contratar servicios de manera eficiente.

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express
- **Base de Datos**: MongoDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Estilos**: CSS, Bootstrap
- **Control de Versiones**: Git

## Guía de Uso

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/conecta-appweb.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd conecta-appweb
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

### Ejecución

1. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
2. Abre tu navegador y visita `http://localhost:3000` para ver la aplicación en acción.

### Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

---

¡Gracias por usar Conecta AppWeb! Si tienes alguna pregunta o sugerencia, no dudes en contactarnos.
