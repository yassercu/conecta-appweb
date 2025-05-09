# Orbita-Y

Aplicación web para catalgos de productos y servicios.

## Estructura del Proyecto

El proyecto se ha actualizado para consumir datos dinámicos a través de una API REST. La estructura de la aplicación es la siguiente:

```
orbita-y/
├── src/
│   ├── components/         # Componentes de la aplicación
│   ├── lib/                # Utilidades y configuraciones
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios para comunicación con API
│   │   └── api/            # Servicios específicos para la API
│   └── types/              # Definiciones de tipos TypeScript
├── mock-api/              # Servidor de API de prueba
├── public/                # Archivos estáticos
└── ...
```

## Servicios de API

Los servicios de API están organizados en una estructura modular:

- `api/config.ts` - Configuración global para la API
- `api/httpClient.ts` - Cliente HTTP central para todas las peticiones
- `api/businessService.ts` - Servicio para operaciones con negocios
- `api/categoryService.ts` - Servicio para operaciones con categorías
- `api/locationService.ts` - Servicio para operaciones con ubicaciones

## API Mock para desarrollo

Se ha incluido un servidor de API Mock para desarrollo. Para iniciarlo:

```bash
cd mock-api
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`.

## Endpoints de la API

La API provee los siguientes endpoints:

### Negocios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/businesses` | Obtener todos los negocios |
| GET | `/api/v1/businesses/:id` | Obtener un negocio por ID |
| GET | `/api/v1/businesses/featured` | Obtener negocios destacados |
| GET | `/api/v1/businesses/promoted` | Obtener negocios promocionados |
| GET | `/api/v1/search` | Buscar negocios con filtros |
| POST | `/api/v1/businesses` | Crear un nuevo negocio |
| PUT | `/api/v1/businesses/:id` | Actualizar un negocio existente |
| DELETE | `/api/v1/businesses/:id` | Eliminar un negocio |

#### Parámetros de búsqueda

El endpoint `/api/v1/search` acepta los siguientes parámetros:

- `query` - Texto de búsqueda (nombre, categoría, descripción)
- `category` - ID o nombre de la categoría
- `rating` - Valoración mínima (1-5)
- `distance` - Distancia máxima en km
- `latitude` - Latitud para búsqueda por ubicación
- `longitude` - Longitud para búsqueda por ubicación
- `sortBy` - Campo para ordenar resultados (rating, name, distance)
- `page` - Número de página para paginación
- `limit` - Elementos por página

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Obtener todas las categorías |
| GET | `/api/v1/categories/:id` | Obtener una categoría por ID |
| POST | `/api/v1/categories` | Crear una nueva categoría |
| PUT | `/api/v1/categories/:id` | Actualizar una categoría existente |
| DELETE | `/api/v1/categories/:id` | Eliminar una categoría |

### Ubicaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/locations/countries` | Obtener todos los países |
| GET | `/api/v1/locations/provinces` | Obtener todas las provincias |
| GET | `/api/v1/locations/countries/:countryId/provinces` | Obtener provincias por país |
| GET | `/api/v1/locations/municipalities` | Obtener todos los municipios |
| GET | `/api/v1/locations/provinces/:provinceId/municipalities` | Obtener municipios por provincia |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/products` | Obtener todos los productos |
| GET | `/api/v1/products/:id` | Obtener un producto por ID |
| GET | `/api/v1/businesses/:businessId/products` | Obtener productos de un negocio |

### Reseñas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/reviews` | Obtener todas las reseñas |
| GET | `/api/v1/businesses/:businessId/reviews` | Obtener reseñas de un negocio |

## Configuración del entorno

Para configurar el entorno de desarrollo:

1. Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. Iniciar el servidor de API Mock:

```bash
cd mock-api
npm run dev
```

3. Iniciar la aplicación web:

```bash
npm run dev
```

## Integración con componentes existentes

Los componentes existentes deben ser actualizados para utilizar los servicios de API en lugar de los datos estáticos. Por ejemplo:

```jsx
// Antes
import { allBusinesses } from '@/lib/data';

// Después
import { businessService } from '@/services/api';
import { useEffect, useState } from 'react';

function Component() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await businessService.getAllBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    // Usar los datos obtenidos de la API
  );
}
```