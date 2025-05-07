import type { Business } from '@/types/business';
import type { Product } from '@/components/business/ProductCard';
import type { Review } from '@/components/business/ReviewCard';
import { businessCategories, categoryNames } from './categories';
import { provinces, municipalities } from './locations';

// Generador de productos de ejemplo
function generarProductos(negocioId: number, categoryId: string, cantidad: number): Product[] {
  const productos: Product[] = [];
  const categoryName = businessCategories.find(c => c.id === categoryId)?.name || 'General';

  for (let i = 1; i <= cantidad; i++) {
    productos.push({
      id: i,
      name: `Producto ${i} de ${categoryName}`,
      price: 5 + (i * 2.5),
      category: categoryName,
      description: `Descripción detallada del producto ${i}. Este ${categoryName.toLowerCase()} es uno de nuestros productos más populares.`,
      image: ``, // Usará la imagen de fallback
      inStock: Math.random() > 0.2, // 80% de probabilidad de estar en stock
      maxQuantity: 5 + (i % 10)
    });
  }
  return productos;
}

// Generador de reseñas de ejemplo
function generarReseñas(cantidad: number): Review[] {
  const reseñas: Review[] = [];
  const nombres = [
    "Carlos Rodríguez", "María González", "Juan Pérez",
    "Ana López", "Pedro Martínez", "Laura Díaz",
    "Miguel Suárez", "Carmen Fernández", "José Sánchez"
  ];

  for (let i = 1; i <= cantidad; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (i * 5)); // Reseñas en diferentes fechas

    reseñas.push({
      id: i,
      author: nombres[Math.floor(Math.random() * nombres.length)],
      rating: 3 + Math.floor(Math.random() * 3), // Ratings entre 3 y 5
      comment: `Esta es una reseña de ejemplo #${i}. El servicio fue bueno y los productos de calidad. Recomendaría este negocio a otros clientes.`,
      date: fecha.toISOString()
    });
  }
  return reseñas;
}

// Lista de nombres comerciales realistas para Cuba
const nombresNegocios = [
  "El Rincón Criollo", "La Bodeguita", "Paladar Don José",
  "Café Habana", "Restaurante El Malecón", "Heladería Coppelia",
  "Bar El Floridita", "Hostal Las Palmas", "Artesanías Cubanas",
  "Transportes Viñales", "Salón Belleza Caribeña", "TecnoCuba",
  "Consultorio Médico Familiar", "Gimnasio Revolución", "Clases Particulares",
  "Construcciones Isla Grande", "Tienda El Encanto", "Cafetería El Bulevar",
  "Taxi Tour Cuba", "Peluquería Estilo", "Masajes Cubano",
  "Taller Mecánico Nacional", "Dulcería La Especial", "Zapatería La Moderna"
];

// Generador de negocios de prueba con datos más realistas
function generarNegocios(cantidad: number, promocionados: number) {
  const negocios: Business[] = [];

  for (let i = 1; i <= cantidad; i++) {
    // Seleccionar categoría aleatoria de las categorías reales
    const categoryIndex = Math.floor(Math.random() * businessCategories.length);
    const category = businessCategories[categoryIndex];

    // Seleccionar provincia y municipio aleatorios
    const provinciaIndex = Math.floor(Math.random() * provinces.length);
    const provincia = provinces[provinciaIndex];

    const municipiosDisponibles = municipalities.filter(m => m.provinceId === provincia.id);
    const municipioIndex = Math.floor(Math.random() * (municipiosDisponibles.length || 1));
    const municipio = municipiosDisponibles[municipioIndex] || { id: "desconocido", name: "Desconocido", provinceId: provincia.id };

    // Obtener nombre de negocio
    const nombreIndex = Math.floor(Math.random() * nombresNegocios.length);
    const nombreNegocio = `${nombresNegocios[nombreIndex]} ${i}`;

    // Generar entre 1 y 6 productos por negocio
    const cantidadProductos = 1 + Math.floor(Math.random() * 6);
    const productos = generarProductos(i, category.id, cantidadProductos);

    // Generar entre 0 y 10 reseñas por negocio
    const cantidadReseñas = Math.floor(Math.random() * 11);
    const reseñas = generarReseñas(cantidadReseñas);

    negocios.push({
      id: `${i}`,
      name: nombreNegocio,
      category: category.name,
      categoryId: category.id,
      rating: 3.5 + (Math.random() * 1.5), // Rating entre 3.5 y 5
      location: `${municipio.name}, ${provincia.name}`,
      image: ``, // Usará la imagen SVG de fallback
      promoted: i <= promocionados,
      description: `${nombreNegocio} ofrece los mejores servicios de ${category.name.toLowerCase()} en ${municipio.name}, ${provincia.name}. Visítenos para disfrutar de la mejor calidad y atención.`,
      latitude: 23.1 + (Math.random() * 0.1),
      longitude: -82.3 - (Math.random() * 0.1),
      address: `Calle ${10 + Math.floor(Math.random() * 50)} #${Math.floor(Math.random() * 100)}, ${municipio.name}`,
      phone: `+53 ${5000 + Math.floor(Math.random() * 5000)}`,
      email: `contacto@${nombreNegocio.toLowerCase().replace(/\s+/g, '')}.cu`,
      totalReviews: reseñas.length,
      products: productos,
      reviews: reseñas,
      // Información geográfica
      country: "Cuba",
      countryId: "cu",
      province: provincia.name,
      provinceId: provincia.id,
      municipality: municipio.name,
      municipalityId: municipio.id
    });
  }
  return negocios;
}

export const allBusinesses: Business[] = generarNegocios(55, 15);

// Extract categories from categories module
export const categories = ["Todas", ...categoryNames];

// Filter out only promoted businesses for the carousel
export const carouselBusinesses = allBusinesses.filter(b => b.promoted);

// Define businesses for featured sections
export const featuredSections = [
  {
    title: "Novedades en el Barrio",
    // Use 4 businesses for a 2x2 grid (forcing 2 rows on medium+)
    businesses: allBusinesses.filter(b => ['1', '4', '6', '8'].includes(b.id))
  },
  {
    title: "Populares Cerca de Ti",
    // Use 10 businesses for a multi-row grid
    businesses: allBusinesses.slice(0, 10) // Take the first 10 for variety
  },
];
