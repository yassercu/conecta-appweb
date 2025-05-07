# Guía de Arquitectura del Proyecto Orbita-Y

## Estructura General

El proyecto Orbita-Y es una aplicación web construida principalmente con Astro, utilizando componentes React para funcionalidades interactivas específicas. Esta estructura híbrida nos permite aprovechar lo mejor de ambos mundos:

- **Astro**: Para páginas estáticas o con poca interactividad, ofreciendo mejor rendimiento y SEO.
- **React**: Para componentes con alta interactividad donde se requiere estado y lógica compleja.

## Principios de Arquitectura

1. **Preferencia por Astro**: Las páginas nuevas deben crearse con Astro a menos que haya una necesidad específica de interactividad compleja.

2. **Componentes híbridos**: Los componentes pueden ser de tres tipos:
   - Componentes Astro puros (`.astro`)
   - Componentes React puros (`.tsx`, `.jsx`)
   - Componentes React utilizados dentro de archivos Astro con la directiva `client:load` u otras.

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

## Estándares de Codificación

1. **Nomenclatura**:
   - Componentes: PascalCase (ej. `BusinessCard.astro`, `SearchBar.tsx`)
   - Utilidades/Hooks: camelCase (ej. `useFormValidation.ts`)
   - Páginas: kebab-case para URLs amigables (ej. `business-registration.astro`)

2. **Estructura de archivos**:
   - Componentes pequeños: un archivo por componente
   - Componentes complejos: directorio con index

## Flujo de Trabajo de Desarrollo

1. Preferir componentes Astro para nuevas funcionalidades estáticas/de presentación
2. Utilizar React solo cuando se necesite interactividad compleja
3. Migrar progresivamente componentes React a Astro cuando sea apropiado

## Referencias

- [Documentación oficial de Astro](https://docs.astro.build/es/)
- [Integración React en Astro](https://docs.astro.build/es/guides/integrations-guide/react/) 