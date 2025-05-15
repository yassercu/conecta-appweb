const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Directorio de imágenes a optimizar
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'assets');
// Directorio de destino para imágenes optimizadas
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets', 'optimized');

// Formatos de imágenes a procesar
const IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

// Directorios a excluir del procesamiento
const EXCLUDED_DIRS = ['optimized', 'node_modules', '.git'];

// Configuraciones para diferentes tamaños de imágenes
const IMAGE_SIZES = [
  { width: 640, suffix: 'sm' },
  { width: 1024, suffix: 'md' },
  { width: 1280, suffix: 'lg' }
];

// Asegurarse de que el directorio de salida exista
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

// Procesa una imagen individual
async function processImage(imagePath, outputDir) {
  const filename = path.basename(imagePath);
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  
  if (!IMAGE_FORMATS.includes(ext.toLowerCase())) {
    return; // Omitir archivos que no son imágenes
  }

  console.log(`Procesando: ${filename}`);

  try {
    // Cargar la imagen
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Optimizar la imagen original manteniendo su tamaño
    await image
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, `${name}.webp`));

    // Crear versiones en diferentes tamaños
    for (const size of IMAGE_SIZES) {
      // Solo redimensionar si la imagen original es más grande
      if (metadata.width > size.width) {
        await image
          .resize({ width: size.width, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(path.join(outputDir, `${name}-${size.suffix}.webp`));
      }
    }
  } catch (err) {
    console.error(`Error al procesar ${filename}:`, err);
  }
}

// Recorre el directorio de imágenes recursivamente
async function processDirectory(dir, outputBaseDir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Saltamos los directorios excluidos
      if (entry.isDirectory() && EXCLUDED_DIRS.includes(entry.name)) {
        console.log(`Omitiendo directorio excluido: ${entry.name}`);
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(PUBLIC_IMAGES_DIR, dir);
      const currentOutputDir = path.join(outputBaseDir, relativePath);
      
      if (entry.isDirectory()) {
        // Crear el directorio de salida correspondiente
        const outputSubDir = path.join(currentOutputDir, entry.name);
        await ensureDir(outputSubDir);
        
        // Procesar el subdirectorio
        await processDirectory(fullPath, outputBaseDir);
      } else if (entry.isFile()) {
        // Asegurarse de que el directorio de salida exista
        await ensureDir(currentOutputDir);
        
        // Procesar el archivo
        await processImage(fullPath, currentOutputDir);
      }
    }
  } catch (err) {
    console.error(`Error al procesar el directorio ${dir}:`, err);
  }
}

// Función para limpiar el directorio de salida antes de comenzar
async function cleanOutputDirectory() {
  try {
    console.log(`Limpiando el directorio de salida: ${OUTPUT_DIR}`);
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
    console.log('Directorio de salida limpiado');
  } catch (err) {
    // Si el directorio no existe, no hay problema
    if (err.code !== 'ENOENT') {
      console.error('Error al limpiar el directorio de salida:', err);
    }
  }
}

// Función principal
async function optimizeImages() {
  console.log('Iniciando optimización de imágenes...');
  
  try {
    // Limpiar directorio de salida antes de comenzar
    await cleanOutputDirectory();
    
    // Crear directorio de salida fresco
    await ensureDir(OUTPUT_DIR);
    
    // Procesar todos los directorios y archivos
    await processDirectory(PUBLIC_IMAGES_DIR, OUTPUT_DIR);
    
    console.log('¡Optimización de imágenes completada!');
  } catch (err) {
    console.error('Error durante la optimización de imágenes:', err);
    process.exit(1);
  }
}

// Ejecutar la función principal
optimizeImages(); 