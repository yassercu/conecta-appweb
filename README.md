# Orbita-Y

Aplicación web para catálogos de productos y servicios, construida con Astro, React (para islas de interactividad) y Tailwind CSS.

## Principios de Diseño

Este proyecto prioriza el rendimiento y la experiencia de usuario utilizando Astro para la generación de sitios estáticos/servidor y React para componentes interactivos específicos (Islas de Astro).

- **Astro Primero**: Las páginas (`.astro`) y la estructura general se renderizan en el servidor o se generan estáticamente.
- **Islas de React**: Componentes React (`.tsx`, `.jsx`) se utilizan para la interactividad del lado del cliente y se hidratan selectivamente (`client:load`, `client:visible`, `client:idle`).
- **Obtención de Datos en Frontmatter**: Se prefiere cargar datos en el *frontmatter* de los archivos `.astro` para el renderizado del servidor.
- **Componentes Reutilizables**: Se fomenta la creación de componentes Astro para UI estática y componentes React para UI interactiva.

## Estructura del Proyecto

El proyecto utiliza Astro para la estructura general y el renderizado del lado del servidor, con componentes React para la interactividad del lado del cliente.

```
orbita-y/
├── public/                # Archivos estáticos (imágenes, fuentes, manifest.webmanifest, service-worker.js)
├── src/
│   ├── components/         # Componentes Astro (.astro) y React (.tsx, .jsx)
│   │   ├── ui/             # Componentes ShadCN UI (React)
│   │   └── business/       # Componentes específicos para negocios (React)
│   ├── layouts/            # Layouts Astro (.astro) para las páginas
│   ├── pages/              # Páginas de la aplicación (principalmente .astro)
│   ├── services/           # Lógica para consumir la API REST
│   │   └── api/            # Clientes y servicios específicos para la API
│   ├── styles/             # Estilos globales (globals.css)
│   ├── hooks/              # Hooks personalizados de React
│   ├── lib/                # Utilidades (utils.ts, core-web-vitals.ts)
│   ├── config/             # Configuración de API (api.ts)
│   └── types/              # Definiciones de tipos TypeScript (business.ts, etc.)
├── mock-api/              # Servidor de API de prueba para desarrollo
├── scripts/               # Scripts de utilidad (generación de iconos PWA, optimización de imágenes)
├── astro.config.mjs       # Configuración de Astro
├── tailwind.config.js     # Configuración de Tailwind CSS
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias y scripts del proyecto
```

## Características Principales

- **Astro**: Para un rendimiento óptimo y SEO, Astro maneja la estructura de las páginas y el contenido estático.
- **React**: Se utiliza para componentes interactivos (islas de Astro) como formularios, carruseles y la lógica de búsqueda/filtrado del lado del cliente.
- **Tailwind CSS**: Para un estilizado rápido y moderno.
- **ShadCN UI**: Biblioteca de componentes React preconstruidos y personalizables.
- **API REST Dinámica**: La aplicación consume datos de una API REST (simulada con `mock-api` para desarrollo).
- **PWA (Progressive Web App)**: Capacidades PWA para una experiencia de usuario mejorada, incluyendo instalación y funcionamiento offline básico.

## Servicios de API

Los servicios para interactuar con la API se encuentran en `src/services/` y `src/config/api.ts`. Incluyen:

- `apiService.ts`: Orquestador central para llamadas a la API.
- `httpClient.ts`: Cliente HTTP para realizar las peticiones.
- Servicios específicos como `businessService.ts`, `categoryService.ts`, `locationService.ts`.

## API Mock para Desarrollo

Se incluye un servidor de API Mock para desarrollo. Para iniciarlo:

```bash
cd mock-api
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`. Los endpoints disponibles están detallados en `mock-api/README.md`.

## Configuración del Entorno

Para configurar el entorno de desarrollo:

1.  Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```
    PUBLIC_API_URL=http://localhost:3001/api 
    PUBLIC_ENZONA_CONSUMER_KEY=tu_consumer_key_de_enzona
    ENZONA_CONSUMER_SECRET=tu_consumer_secret_de_enzona
    PUBLIC_ENZONA_API_URL=https://api.enzona.net/payment/v1.0.0
    # Agrega otras claves API necesarias aquí
    ```
2.  Iniciar el servidor de API Mock (si se usa para desarrollo):
    ```bash
    cd mock-api
    npm run dev
    ```
3.  Iniciar la aplicación Astro:
    ```bash
    npm run dev
    ```
    O para iniciar ambos servicios (API mock y app Astro) en paralelo:
    ```bash
    npm run start:all
    ```

## Scripts Útiles

- `npm run dev`: Inicia el servidor de desarrollo de Astro.
- `npm run build`: Compila la aplicación para producción. Incluye generación de iconos PWA y optimización de imágenes.
- `npm run preview`: Previsualiza la build de producción localmente.
- `npm run generate-pwa-icons`: Genera los iconos necesarios para la PWA.
- `npm run optimize-images`: Optimiza las imágenes en `public/assets`.
- `npm run start:all`: Inicia el servidor API mock y la aplicación Astro en paralelo (útil para desarrollo).

## Integración con Componentes

- Los componentes Astro (`.astro`) se utilizan para la estructura de las páginas y el contenido estático.
- Los componentes React (`.jsx`, `.tsx`) se utilizan para la interactividad y se integran en las páginas Astro como islas de Astro (ej. `<MyReactComponent client:load />`).
- Los datos se pueden obtener en el frontmatter de los archivos `.astro` para el renderizado del lado del servidor o dentro de los componentes React para el renderizado del lado del cliente usando los hooks en `src/hooks/useApi.ts` (aunque se prefiere la carga en *frontmatter* para mejor rendimiento).
```