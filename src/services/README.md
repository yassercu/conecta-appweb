# Sistema API de Orbita-Y

Este directorio contiene la implementación del sistema de API para Orbita-Y, que permite conectar la aplicación con servicios de backend de manera eficiente y organizada.

## Estructura del Sistema API

El sistema API está organizado en los siguientes componentes:

### 1. Configuración Central (`/config/api.ts`)

Este archivo proporciona configuración global para todas las operaciones de API:

- URLs y versiones de la API
- Timeouts y encabezados predeterminados
- Sistema de caché para optimizar rendimiento
- Gestión global del estado de carga

### 2. Servicios API Específicos (`/services/api/`)

Los servicios específicos manejan operaciones relacionadas con diferentes entidades:

- `businessService.ts`: Operaciones con negocios
- `categoryService.ts`: Operaciones con categorías 
- `locationService.ts`: Operaciones con ubicaciones
- `httpClient.ts`: Cliente HTTP centralizado para todas las peticiones
- `config.ts`: Configuración específica del módulo API (endpoints, etc.)

### 3. Servicio API Centralizado (`/services/apiService.ts`)

Este servicio actúa como punto de entrada unificado para todos los servicios de API:

- Gestiona caché automática de respuestas
- Maneja estados de carga globales
- Procesa errores de manera consistente
- Expone todas las operaciones de los servicios específicos

### 4. Hooks Personalizados (`/hooks/useApi.ts`)

Hooks de React para facilitar el uso de la API en componentes:

- Manejo automático de estados (carga, error, datos)
- Hooks específicos para cada tipo de recurso (useBusinesses, useCategories, etc.)
- Opciones flexibles para caché, refresco y omisión de carga inicial

## Uso del Sistema API

### Opción 1: Hooks Específicos para Recursos

Para el caso más común, usa los hooks específicos para cada tipo de recurso:

```tsx
import { useBusinesses, useFeaturedBusinesses, useCategories } from '@/hooks/useApi';

function MyComponent() {
  // Obtener negocios destacados
  const { data: featuredBusinesses, loading, error } = useFeaturedBusinesses();
  
  // Renderizar según estado
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {featuredBusinesses?.map(business => (
        <div key={business.id}>{business.name}</div>
      ))}
    </div>
  );
}
```

### Opción 2: Hook Genérico para Operaciones Personalizadas

Para casos más específicos, usa el hook genérico con cualquier función de servicio:

```tsx
import useApi, { apiService } from '@/hooks/useApi';

function MyComponent() {
  // Buscar negocios con filtros personalizados
  const { 
    data: searchResults, 
    loading, 
    error,
    execute: executeSearch,
    refresh
  } = useApi(apiService.businesses.search, [{
    query: 'restaurante',
    category: 'Comida',
    rating: '4',
    sortBy: 'rating'
  }]);
  
  // Puedes ejecutar la búsqueda manualmente o volver a cargar
  const handleRefresh = () => refresh();
  const handleNewSearch = (query) => executeSearch({ query });
  
  // Renderizar según estado...
}
```

### Opción 3: Acceso Directo al Servicio API

Para operaciones de escritura o flujos complejos, puedes usar el servicio directamente:

```tsx
import { apiService } from '@/hooks/useApi';

async function handleCreateBusiness(businessData) {
  try {
    // Crear un nuevo negocio
    const newBusiness = await apiService.businesses.create(businessData);
    
    // Limpiar caché específica
    apiService.cache.clear('businesses:featured');
    
    return newBusiness;
  } catch (error) {
    console.error('Error al crear negocio:', error);
    throw error;
  }
}
```

## Características Avanzadas

### Caché de Respuestas

El sistema implementa caché automática basada en claves para optimizar rendimiento:

```tsx
// Con caché por defecto (5 minutos)
const { data } = useCategories();

// Forzar refresco desde API
const { data, refresh } = useCategories();
refresh(); // Ignora caché y carga de nuevo

// Personalizar comportamiento de caché
const { data } = useCategories({ 
  useCache: true,
  cacheKey: 'categories:special',
  forceRefresh: false
});
```

### Gestión de Estados de Carga

El sistema proporciona estados globales y locales de carga:

```tsx
// Estado local en el hook
const { loading } = useBusinesses();

// Estado global de API (para indicadores globales)
import { apiService } from '@/hooks/useApi';
const isAnyRequestLoading = apiService.loading.isLoading();
```

### Gestión de Errores

Manejo consistente de errores en toda la aplicación:

```tsx
const { error, data } = useBusinesses();

// Error con código de status y mensaje
if (error) {
  console.log(`Error ${error.statusCode}: ${error.message}`);
}
```

## Ejemplos de Implementación

Revisa los componentes de ejemplo para ver el sistema API en acción:

- `src/components/examples/FeaturedBusinesses.tsx`: Muestra negocios destacados
- `src/components/examples/BusinessSearch.tsx`: Implementa búsqueda con filtros

## Configuración del Entorno

El sistema API utiliza las siguientes variables de entorno:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Puedes configurarlas en el archivo `.env` de tu proyecto. 