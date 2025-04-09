# Conecta - Plataforma de conexión de servicios en Cuba

Conecta es una aplicación web progresiva (PWA) diseñada para conectar proveedores de servicios con clientes en Cuba. La plataforma permite a los usuarios encontrar servicios cercanos utilizando filtros por ubicación geográfica (provincias, municipios), categorías y otros criterios.

## Características principales

- **Búsqueda de servicios por ubicación**: Encuentra servicios cercanos a tu ubicación actual
- **Filtros avanzados**: Busca por provincia, municipio, categoría y distancia
- **Visualización en mapa**: Explora los servicios disponibles en un mapa interactivo
- **Diseño adaptativo**: Funciona perfectamente en dispositivos móviles y de escritorio
- **Aplicación web progresiva (PWA)**: Instala la aplicación en tu dispositivo para uso offline

## Estructura de la aplicación

La aplicación está construida con las siguientes tecnologías:

- **[Astro](https://astro.build/)**: Framework web moderno y rápido
- **[React](https://reactjs.org/)**: Para componentes interactivos
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS para el diseño
- **[Leaflet](https://leafletjs.com/)**: Biblioteca para mapas interactivos
- **[Zustand](https://github.com/pmndrs/zustand)**: Para gestión de estado

## Organización del código

```
├── public              # Archivos estáticos
│   ├── icons           # Iconos para la PWA
│   ├── img             # Imágenes del sitio
│   ├── manifest.json   # Configuración PWA
│   └── service-worker.js # Service Worker para PWA
├── src
│   ├── components      # Componentes reutilizables
│   ├── layouts         # Plantillas y diseños
│   ├── pages           # Páginas de la aplicación
│   └── styles          # Estilos CSS
```

## Consideraciones geográficas

La plataforma está diseñada específicamente para el contexto cubano, respetando su división político-administrativa:

- 15 provincias y 1 municipio especial (Isla de la Juventud)
- Municipios correspondientes a cada provincia
- Distancias calculadas en kilómetros

## Instalación y desarrollo

### Requisitos previos

- Node.js 16+
- npm o pnpm

### Configuración del entorno

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/conecta-appweb.git
   cd conecta-appweb
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o con pnpm
   pnpm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   pnpm run dev
   ```

4. Abre http://localhost:4321 en tu navegador

## Construcción para producción

Para construir la aplicación para producción:

```bash
npm run build
# o
pnpm run build
```

Los archivos optimizados se generarán en la carpeta `dist`.

## Características por implementar

- [ ] Autenticación de usuarios
- [ ] Perfil para proveedores de servicios
- [ ] Sistema de valoraciones y reseñas
- [ ] Notificaciones push
- [ ] Chat integrado entre proveedores y clientes

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para más información o consultas, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com).

```sh
pnpm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
