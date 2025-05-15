# API Mock de Orbita-Y

Esta es una API mock (simulada) diseñada para proveer datos de ejemplo para el desarrollo y pruebas de la aplicación Orbita-Y. Utiliza una base de datos en memoria, lo que significa que los datos se reinician cada vez que el servidor se detiene y se vuelve a iniciar.

## Características

*   Endpoints para negocios, categorías, ubicaciones (países, provincias, municipios).
*   Búsqueda de negocios con filtros por nombre, categoría, rating y distancia.
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

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/v1/categories` | Obtener todas las categorías |
| GET    | `/api/v1/categories/:id` | Obtener una categoría por ID |

### Ubicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/api/v1/locations/countries` | Obtener todos los países |
| GET    | `/api/v1/locations/provinces` | Obtener todas las provincias |
| GET    | `/api/v1/locations/countries/:countryId/provinces` | Obtener provincias por país |
| GET    | `/api/v1/locations/municipalities` | Obtener todos los municipios |
| GET    | `/api/v1/locations/provinces/:provinceId/municipalities` | Obtener municipios por provincia |

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
  "id": "restaurantes",
  "name": "Restaurantes",
  "description": "Establecimientos gastronómicos que ofrecen comidas y bebidas para consumo en el local",
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