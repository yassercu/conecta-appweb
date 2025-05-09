# API Mock de Orbita-Y

Esta API mock proporciona datos simulados para el desarrollo y pruebas de la aplicación Orbita-Y.

## Ejecución

Para iniciar el servidor API mock:

```bash
cd mock-api
npm install
npm start
```

El servidor se ejecutará en: `http://localhost:3001`

## Endpoints disponibles

### Negocios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/businesses` | Obtener todos los negocios |
| GET | `/api/v1/businesses/featured` | Obtener negocios destacados |
| GET | `/api/v1/businesses/promoted` | Obtener negocios promocionados |
| GET | `/api/v1/businesses/:id` | Obtener un negocio por ID |
| GET | `/api/v1/search` | Búsqueda de negocios con filtros |
| POST | `/api/v1/businesses` | Crear un nuevo negocio |
| PUT | `/api/v1/businesses/:id` | Actualizar un negocio existente |
| DELETE | `/api/v1/businesses/:id` | Eliminar un negocio |

Ejemplo: `http://localhost:3001/api/v1/businesses`

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Obtener todas las categorías |
| GET | `/api/v1/categories/:id` | Obtener una categoría por ID |

Ejemplo: `http://localhost:3001/api/v1/categories`

### Ubicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/locations/countries` | Obtener todos los países |
| GET | `/api/v1/locations/provinces` | Obtener todas las provincias |
| GET | `/api/v1/locations/countries/:countryId/provinces` | Obtener provincias por país |
| GET | `/api/v1/locations/municipalities` | Obtener todos los municipios |
| GET | `/api/v1/locations/provinces/:provinceId/municipalities` | Obtener municipios por provincia |

Ejemplo: `http://localhost:3001/api/v1/locations/countries`

## Parámetros de búsqueda

La ruta `/api/v1/search` acepta los siguientes parámetros de consulta:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| query | string | Término de búsqueda para nombre, categoría o descripción |
| category | string | Filtrar por categoría específica |
| rating | number | Filtrar por calificación mínima |
| distance | number | Distancia máxima en km (requiere latitude y longitude) |
| latitude | number | Latitud de la posición del usuario |
| longitude | number | Longitud de la posición del usuario |
| sortBy | string | Ordenar por: 'rating', 'name', 'distance' |
| page | number | Número de página (por defecto: 1) |
| limit | number | Resultados por página (por defecto: 10) |

Ejemplo: `http://localhost:3001/api/v1/search?category=Restaurante&rating=4&sortBy=rating&page=1&limit=5`

## Estructura de datos

### Negocio

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
  "products": [...],
  "reviews": [...]
}
``` 