# API Mock de Orbita-Y

Esta es una API mock (simulada) diseñada para proveer datos de ejemplo para el desarrollo y pruebas de la aplicación Orbita-Y. Utiliza una base de datos en memoria, lo que significa que los datos se reinician cada vez que el servidor se detiene y se vuelve a iniciar.

## Características

*   Endpoints para negocios, categorías, ubicaciones (países, provincias, municipios).
*   Búsqueda de negocios con filtros por nombre, categoría, rating, distancia.
*   Paginación y ordenamiento de resultados.
*   Generación de datos de ejemplo al iniciar.

## Requisitos Previos

*   Node.js (se recomienda la versión LTS o superior)
*   npm (generalmente viene con Node.js)

## Instalación (para desarrollo local)

1.  Clona este repositorio (si aplica) o descarga los archivos.
2.  Navega al directorio del proyecto:
    ```bash
    cd mock-api
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```

## Ejecución en Modo Desarrollo

Para iniciar el servidor en modo desarrollo (con recarga automática usando `nodemon`):

```bash
npm run dev
```

El servidor se ejecutará en: `http://localhost:3001` (o el puerto especificado en `process.env.PORT`).

## Ejecución en Modo Producción

Para iniciar el servidor para un entorno de producción:

```bash
npm start
```

### Despliegue en Ubuntu Server con PM2

PM2 es un gestor de procesos para aplicaciones Node.js en producción. Ayuda a mantener viva la aplicación, facilita la gestión de logs, reinicios y escalado.

1.  **Conéctate a tu servidor Ubuntu.**

2.  **Asegúrate de tener Node.js y npm instalados.**
    Puedes seguir [esta guía de DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04-es) o la documentación oficial de Node.js.

3.  **Instala PM2 globalmente:**
    ```bash
    sudo npm install pm2 -g
    ```

4.  **Sube los archivos de tu aplicación al servidor.**
    Puedes usar `scp`, `rsync`, `git clone`, o cualquier método de tu preferencia. Por ejemplo, si tienes tu código en `/srv/my-app`:
    ```bash
    cd /srv/my-app/mock-api 
    ```
    (Asegúrate de que esta sea la ruta a la carpeta que contiene `package.json` y `server.js`).

5.  **Instala las dependencias de la aplicación:**
    ```bash
    npm install --production 
    ```
    (El flag `--production` evita instalar `devDependencies`).

6.  **Inicia la aplicación con PM2:**
    ```bash
    pm2 start server.js --name "orbita-y-mock-api"
    ```
    *   `--name "orbita-y-mock-api"`: Asigna un nombre al proceso para facilitar su gestión.

7.  **Verifica que la aplicación está corriendo:**
    ```bash
    pm2 list
    ```
    o
    ```bash
    pm2 logs orbita-y-mock-api
    ```

8.  **Configura PM2 para que se inicie automáticamente al arrancar el servidor:**
    ```bash
    pm2 startup systemd
    ```
    PM2 te dará un comando para ejecutar con `sudo`. Cópialo y ejecútalo.

9.  **Guarda la configuración de PM2:**
    ```bash
    pm2 save
    ```

Ahora tu API debería estar corriendo y gestionada por PM2.

### Consideraciones para Producción

*   **Base de Datos en Memoria:** Esta API utiliza una base de datos en memoria. Cualquier dato creado, modificado o eliminado (vía POST, PUT, DELETE) se perderá cuando el servidor se reinicie. Para persistencia de datos, necesitarías integrar una base de datos real (MongoDB, PostgreSQL, etc.).
*   **Puerto:** La aplicación corre en el puerto `3001` por defecto, o el puerto especificado en la variable de entorno `PORT`.
*   **Seguridad:** Para una API pública, considera añadir medidas de seguridad como:
    *   **HTTPS:** Configura un certificado SSL/TLS (por ejemplo, con Let's Encrypt a través de un reverse proxy como Nginx).
    *   **Helmet:** Middleware para Express que ayuda a securizar la app estableciendo varias cabeceras HTTP. (`npm install helmet`)
    *   **Rate Limiting:** Para prevenir abuso (`npm install express-rate-limit`).
*   **Logging:** Para un logging más avanzado y configurable, considera librerías como Winston o Pino.

### (Opcional) Configurar Nginx como Reverse Proxy

Nginx puede actuar como un reverse proxy, lo que te permite:
*   Servir tu aplicación Node.js en el puerto 80 (HTTP) o 443 (HTTPS) sin necesidad de correr Node.js como root.
*   Gestionar SSL/TLS.
*   Servir archivos estáticos eficientemente.
*   Balancear carga (si tienes múltiples instancias de tu app).

1.  **Instala Nginx:**
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  **Configura Nginx.** Crea un nuevo archivo de configuración en `/etc/nginx/sites-available/your-app-name` (ej. `orbita-y-mock-api`):
    ```bash
    sudo nano /etc/nginx/sites-available/orbita-y-mock-api
    ```
    Pega la siguiente configuración (ajusta `server_name` y `proxy_pass` si es necesario):
    ```nginx
    server {
        listen 80;
        server_name tu_dominio_o_ip; # Reemplaza con tu dominio o IP pública

        location / {
            proxy_pass http://localhost:3001; # Asume que tu app Node.js corre en el puerto 3001
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Habilita el sitio creando un enlace simbólico:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/orbita-y-mock-api /etc/nginx/sites-enabled/
    ```

4.  **Prueba la configuración de Nginx:**
    ```bash
    sudo nginx -t
    ```

5.  **Reinicia Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

Ahora tu API debería ser accesible a través del puerto 80 (o el dominio que hayas configurado).

## Endpoints Disponibles

### Negocios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/v1/businesses` | Obtener todos los negocios |
| GET    | `/api/v1/businesses/featured` | Obtener negocios destacados |
| GET    | `/api/v1/businesses/promoted` | Obtener negocios promocionados |
| GET    | `/api/v1/businesses/:id` | Obtener un negocio por ID |
| GET    | `/api/v1/search` | Búsqueda de negocios con filtros |
| POST   | `/api/v1/businesses` | Crear un nuevo negocio |
| PUT    | `/api/v1/businesses/:id` | Actualizar un negocio existente |
| DELETE | `/api/v1/businesses/:id` | Eliminar un negocio |

Ejemplo: `http://localhost:3001/api/v1/businesses`

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/v1/categories` | Obtener todas las categorías |
| GET    | `/api/v1/categories/:id` | Obtener una categoría por ID |

Ejemplo: `http://localhost:3001/api/v1/categories`

### Ubicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/v1/locations/countries` | Obtener todos los países |
| GET    | `/api/v1/locations/provinces` | Obtener todas las provincias |
| GET    | `/api/v1/locations/countries/:countryId/provinces` | Obtener provincias por país |
| GET    | `/api/v1/locations/municipalities` | Obtener todos los municipios |
| GET    | `/api/v1/locations/provinces/:provinceId/municipalities` | Obtener municipios por provincia |

Ejemplo: `http://localhost:3001/api/v1/locations/countries`

## Parámetros de Búsqueda

La ruta `/api/v1/search` acepta los siguientes parámetros de consulta:

| Parámetro | Tipo   | Descripción                                             |
|-----------|--------|---------------------------------------------------------|
| query     | string | Término de búsqueda para nombre, categoría o descripción |
| category  | string | Filtrar por categoría específica                        |
| rating    | number | Filtrar por calificación mínima                         |
| distance  | number | Distancia máxima en km (requiere latitude y longitude)  |
| latitude  | number | Latitud de la posición del usuario                      |
| longitude | number | Longitud de la posición del usuario                     |
| sortBy    | string | Ordenar por: 'rating', 'name', 'distance'             |
| page      | number | Número de página (por defecto: 1)                       |
| limit     | number | Resultados por página (por defecto: 10)                  |

Ejemplo: `http://localhost:3001/api/v1/search?category=Restaurante&rating=4&sortBy=rating&page=1&limit=5`

## Estructura de Datos

### Negocio (Ejemplo)

```json
{
  "id": "1",
  "name": "Nombre del negocio",
  "category": "Categoría",
  "categoryId": "1",
  "rating": 4.5,
  "location": "Municipio, Provincia",
  "image": "",
  "promoted": true,
  "description": "Descripción del negocio",
  "latitude": 22.5,
  "longitude": -82.3,
  "coordinates": {
    "latitude": 22.5,
    "longitude": -82.3
  },
  "address": "Dirección física",
  "phone": "+53 12345678",
  "email": "contacto@ejemplo.cu",
  "totalReviews": 5,
  "products": [
    // Array de objetos de producto
  ],
  "reviews": [
    // Array de objetos de reseña
  ]
}
```

### Producto (Ejemplo dentro de Negocio)

```json
{
  "id": "businessId-productId",
  "name": "Producto Ejemplo",
  "price": 10.99,
  "category": "Categoría del Producto",
  "description": "Descripción detallada del producto.",
  "image": "",
  "inStock": true
}
```

### Reseña (Ejemplo dentro de Negocio)

```json
{
  "id": "review-businessId-reviewId",
  "businessId": "1",
  "author": "Nombre del Autor",
  "rating": 5,
  "comment": "Comentario de la reseña.",
  "date": "2023-10-27T10:00:00.000Z"
}
```

### Categoría (Ejemplo)

```json
{
  "id": "1",
  "name": "Restaurante",
  "description": "Restaurantes y cafeterías",
  "icon": "utensils"
}
```

### País (Ejemplo)

```json
{
  "id": "cu",
  "name": "Cuba",
  "code": "CU"
}
```

### Provincia (Ejemplo)

```json
{
  "id": "hab",
  "name": "La Habana",
  "countryId": "cu"
}
```

### Municipio (Ejemplo)

```json
{
  "id": "hab-1",
  "name": "Habana Vieja",
  "provinceId": "hab"
}
``` 