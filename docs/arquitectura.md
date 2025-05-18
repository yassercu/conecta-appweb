# Guía de Arquitectura del Proyecto Orbita-Y

## Estructura General

El proyecto Orbita-Y es una aplicación web construida con **Astro** como framework principal. Se utiliza **React** para componentes interactivos específicos (islas de Astro), aprovechando lo mejor de ambos mundos:

- **Astro**: Para la generación de sitios estáticos (SSG) o renderizados en servidor (SSR) por defecto, ofreciendo un rendimiento óptimo, excelente SEO y carga rápida al enviar HTML con CSS y JavaScript mínimo al cliente.
- **React**: Para componentes con alta interactividad donde se requiere estado y lógica compleja del lado del cliente. Estos componentes se hidratan selectivamente mediante las directivas `client:*` de Astro.

## Principios de Arquitectura

1.  **Astro Primero**: Las páginas y la estructura general de la aplicación se definen con archivos `.astro`. Se prioriza el renderizado en servidor o la generación estática.
2.  **Islas de Interactividad con React**: La interactividad del lado del cliente se encapsula en componentes React (`.tsx`, `.jsx`). Estos se importan en archivos `.astro` y se hidratan solo cuando es necesario (ej., `client:load`, `client:idle`, `client:visible`).
3.  **Mantenimiento de Lógica del Lado del Servidor**: Siempre que sea posible, la lógica de obtención de datos y la preparación del contenido se realiza en el frontmatter de los archivos `.astro`.
4.  **Componentes Reutilizables**:
    -   Componentes Astro puros (`.astro`) para estructuras y UI estática.
    -   Componentes React puros (`.tsx`, `.jsx`) para UI interactiva.
5.  **Estructuración de Directorios**:
    -   `src/pages/`: Contiene las rutas de la aplicación (archivos `.astro` que definen páginas).
    -   `src/layouts/`: Define las plantillas base (`.astro`) para las páginas.
    -   `src/components/`: Almacena componentes reutilizables, tanto Astro (`.astro`) como React (`.tsx`, `.jsx`).
        -   `src/components/ui/`: Componentes ShadCN UI (React).
    -   `src/styles/`: Estilos globales (`globals.css`) y utilidades CSS.
    -   `src/hooks/`: Hooks personalizados de React para la lógica en componentes cliente.
    -   `src/services/`: Lógica para interactuar con la API externa (agnóstica al framework).
    -   `src/config/`: Configuración general de la aplicación, como la configuración de la API.
    -   `public/`: Archivos estáticos (imágenes, fuentes, `manifest.webmanifest`, `service-worker.js`).

## Flujo de Datos

- **Renderizado en Servidor/Estático (Astro)**: Los datos para las páginas se obtienen en el script del frontmatter de los archivos `.astro`. Estos datos se pasan como props a los componentes Astro o React (que se renderizarán estáticamente en el servidor si no tienen directiva `client:*`).
- **Renderizado en Cliente (React Islands)**: Los componentes React interactivos pueden realizar sus propias peticiones de datos usando hooks como `useEffect` y `fetch` (o a través de `useApi.ts`) después de la hidratación en el cliente.

## Estándares de Codificación

1.  **Nomenclatura**:
    -   Componentes Astro y React: PascalCase (ej. `BusinessCard.astro`, `SearchBar.tsx`).
    -   Archivos de página Astro: `kebab-case.astro` o `PascalCase.astro` (Astro es flexible, `kebab-case` es común para URLs).
    -   Utilidades/Hooks: camelCase (ej. `useFormValidation.ts`).
2.  **Estructura de archivos**:
    -   Componentes pequeños: un archivo por componente.
    -   Componentes complejos: pueden organizarse en directorios con un archivo `index` si es necesario.

## Consideraciones de Rendimiento

- **Minimizar JavaScript del Cliente**: Astro ayuda inherentemente con esto. Usar directivas `client:*` juiciosamente para hidratar solo los componentes que lo necesiten.
- **Optimización de Imágenes**: Utilizar el componente `<Image />` de Astro (si está instalado como integración) o `next/image` si se prefiere para componentes React, junto con scripts de optimización (como el `scripts/optimize-images.js` existente). Astro también tiene optimización de assets integrada.
- **Carga Diferida (Lazy Loading)**: Para imágenes (`loading="lazy"`) y componentes (`client:visible` o `client:idle`).

## Próximos Pasos y Mejoras

-   Evaluar la migración de más lógica de obtención de datos de los componentes React al frontmatter de las páginas Astro contenedoras, si aplica.
-   Refinar el uso de las directivas `client:*` para asegurar una hidratación óptima.
-   Asegurar que todas las rutas y la navegación interna utilicen los mecanismos de Astro (principalmente etiquetas `<a>` para navegación simple o el componente `<Link>` de Astro si se usa para prefetching o transiciones de vista).

## Referencias

-   [Documentación oficial de Astro](https://docs.astro.build/es/)
-   [Islas de Astro](https://docs.astro.build/es/concepts/islands/)
-   [Integración React en Astro](https://docs.astro.build/es/guides/integrations-guide/react/)
