# Guía de Arquitectura del Proyecto Orbita-Y

## Estructura General

El proyecto Orbita-Y es una aplicación web construida principalmente con Astro, utilizando componentes React para funcionalidades interactivas específicas. Esta estructura híbrida nos permite aprovechar lo mejor de ambos mundos:

- **Astro**: Para páginas estáticas o con poca interactividad, ofreciendo mejor rendimiento y SEO.
- **React**: Para componentes con alta interactividad donde se requiere estado y lógica compleja.

## Principios de Arquitectura

<<<<<<< HEAD
1.  **Astro Primero**: Las páginas y la estructura general de la aplicación se definen con archivos `.astro`. Se prioriza el renderizado en servidor o la generación estática.
2.  **Obtención de Datos en Frontmatter**: Siempre que sea posible, la lógica de obtención de datos para las páginas y componentes principales se realiza en el script del *frontmatter* de los archivos `.astro`. Estos datos se pasan como props a los componentes Astro o React.
3.  **Islas de Interactividad con React**: La interactividad del lado del cliente se encapsula en componentes React (`.tsx`, `.jsx`). Estos se importan en archivos `.astro` y se hidratan solo cuando es necesario (ej., `client:load` para funcionalidad inmediata, `client:idle` para funcionalidad menos crítica, o `client:visible` para componentes que solo necesitan JS cuando son visibles).
4.  **Minimizar JavaScript del Cliente**: Astro ayuda inherentemente con esto. Usar directivas `client:*` juiciosamente para hidratar solo los componentes que lo necesiten y cuando lo necesiten.
5.  **Componentes Reutilizables**:
    -   Componentes Astro puros (`.astro`) para estructuras y UI estática o con lógica simple del lado del servidor.
    -   Componentes React puros (`.tsx`, `.jsx`) para UI interactiva compleja.
6.  **Estructuración de Directorios**:
    -   `src/pages/`: Contiene las rutas de la aplicación (archivos `.astro` que definen páginas).
    -   `src/layouts/`: Define las plantillas base (`.astro`) para las páginas.
    -   `src/components/`: Almacena componentes reutilizables, tanto Astro (`.astro`) como React (`.tsx`, `.jsx`).
        -   `src/components/ui/`: Componentes ShadCN UI (React).
    -   `src/styles/`: Estilos globales (`globals.css`) y utilidades CSS.
    -   `src/hooks/`: Hooks personalizados de React para la lógica en componentes cliente.
    -   `src/services/`: Lógica para interactuar con la API externa (agnóstica al framework).
    -   `src/config/`: Configuración general de la aplicación, como la configuración de la API.
    -   `public/`: Archivos estáticos (imágenes, fuentes, `manifest.webmanifest`, `service-worker.js`).
=======
1. **Preferencia por Astro**: Las páginas nuevas deben crearse con Astro a menos que haya una necesidad específica de interactividad compleja.
>>>>>>> parent of d2da8e7 (revisa el proyecto)

2. **Componentes híbridos**: Los componentes pueden ser de tres tipos:
   - Componentes Astro puros (`.astro`)
   - Componentes React puros (`.tsx`, `.jsx`)
   - Componentes React utilizados dentro de archivos Astro con la directiva `client:load` u otras.

<<<<<<< HEAD
- **Renderizado en Servidor/Estático (Astro)**: Los datos para las páginas se obtienen en el script del *frontmatter* de los archivos `.astro`. Estos datos se pasan como props a los componentes Astro o React (que se renderizarán estáticamente en el servidor si no tienen directiva `client:*` o si los datos son suficientes para el renderizado inicial).
- **Renderizado en Cliente (React Islands)**: Los componentes React interactivos pueden realizar sus propias peticiones de datos usando hooks como `useEffect` y `fetch` (o a través de `useApi.ts`) después de la hidratación en el cliente, especialmente para datos dinámicos o específicos del usuario. Sin embargo, se prefiere cargar la mayor cantidad de datos posible en el servidor.
=======
3. **Estructuración de directorios**: 
   - `/src/pages/`: Páginas de la aplicación (prioritariamente en formato `.astro`)
   - `/src/components/`: Componentes reutilizables (en formato `.astro`, `.tsx` o `.jsx`)
   - `/src/layouts/`: Layouts compartidos entre páginas
   - `/src/styles/`: Estilos globales y utilidades de CSS
   - `/src/hooks/`: Hooks personalizados de React
   - `/src/services/`: Servicios y lógica de negocio

## Guía de Migración de React a Astro

### Cuándo migrar un componente React a Astro:

1. **Componentes estáticos o con interactividad limitada**: Si un componente principalmente muestra contenido estático o tiene interactividad mínima.

2. **Componentes para el SEO**: Si el componente es crítico para SEO, como encabezados, metadatos, o contenido principal.

3. **Componentes que solo necesitan un evento básico**: Si solo responde a clics simples o eventos básicos.

### Estrategia de migración:

1. **Identificar componentes candidatos**: Revisar el código para identificar componentes de React que podrían beneficiarse de la migración a Astro.

2. **Crear versión Astro**: Crear un archivo `.astro` equivalente al componente React.

3. **Extraer lógica compleja**: Si el componente tiene lógica compleja, considerar mantenerla en un componente React más pequeño y llamarlo desde Astro con `client:load`.

4. **Actualizar importaciones**: Actualizar todas las importaciones a través del proyecto para usar la nueva versión Astro.

5. **Eliminar versión antigua**: Una vez probado, eliminar la versión React original.

### Consideraciones importantes:

- **No duplicar código**: Evitar tener dos versiones activas del mismo componente (React y Astro) por mucho tiempo.
- **Pruebas extensivas**: Probar minuciosamente después de la migración para garantizar el mismo comportamiento.
- **Actualizar documentación**: Mantener actualizada esta guía con patrones y decisiones nuevas.

## Mejores Prácticas para Componentes

### Componentes Astro:

- Usar estructura de Props con TypeScript.
- Minimizar la lógica en la sección frontmatter.
- Utilizar slots para plantillas flexibles.

### Componentes React:

- Usar TypeScript para Props y definir interfaces claras.
- Preferir componentes funcionales con hooks.
- Seguir el patrón presentacional/contenedor cuando sea apropiado.
>>>>>>> parent of d2da8e7 (revisa el proyecto)

## Estándares de Codificación

1. **Nomenclatura**:
   - Componentes: PascalCase (ej. `BusinessCard.astro`, `SearchBar.tsx`)
   - Utilidades/Hooks: camelCase (ej. `useFormValidation.ts`)
   - Páginas: kebab-case para URLs amigables (ej. `business-registration.astro`)

2. **Estructura de archivos**:
   - Componentes pequeños: un archivo por componente
   - Componentes complejos: directorio con index

<<<<<<< HEAD
- **Optimización de Imágenes**: Utilizar el componente `<Image />` de Astro o `next/image` (si se prefiere para componentes React, aunque `<Image />` de Astro es más nativo), junto con scripts de optimización (como el `scripts/optimize-images.js` existente). Astro también tiene optimización de assets integrada.
- **Carga Diferida (Lazy Loading)**: Para imágenes (`loading="lazy"`) y componentes (`client:visible` o `client:idle`).
- **Evitar JavaScript innecesario**: Convertir componentes React de solo presentación a componentes `.astro` si no requieren estado o interactividad del lado del cliente.

## Próximos Pasos y Mejoras

-   **Refactorización de Componentes**: Identificar componentes React que pueden ser convertidos a componentes Astro puros para reducir el JS del cliente.
-   **Optimización de Directivas `client:*`**: Asegurar que se usa la directiva de hidratación más eficiente para cada isla de React. Por ejemplo, `client:visible` para componentes que solo necesitan JS cuando entran en el viewport.
-   **Navegación**: Asegurar que todas las rutas y la navegación interna utilicen los mecanismos de Astro (principalmente etiquetas `<a>` para navegación simple o el componente `<Link>` de Astro si se usa para prefetching o transiciones de vista).

## Referencias

-   [Documentación oficial de Astro](https://docs.astro.build/es/)
-   [Islas de Astro](https://docs.astro.build/es/concepts/islands/)
-   [Integración React en Astro](https://docs.astro.build/es/guides/integrations-guide/react/)
```
=======
## Flujo de Trabajo de Desarrollo

1. Preferir componentes Astro para nuevas funcionalidades estáticas/de presentación
2. Utilizar React solo cuando se necesite interactividad compleja
3. Migrar progresivamente componentes React a Astro cuando sea apropiado

## Referencias

- [Documentación oficial de Astro](https://docs.astro.build/es/)
- [Integración React en Astro](https://docs.astro.build/es/guides/integrations-guide/react/) 
>>>>>>> parent of d2da8e7 (revisa el proyecto)
