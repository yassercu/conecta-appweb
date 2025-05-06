import type { Business } from '@/types/business';

// Placeholder data - Includes 'promoted' flag and descriptions
export const allBusinesses: Business[] = [
  {
    id: '1',
    name: 'Café Esquina',
    category: 'Cafeterías',
    rating: 4.5,
    location: 'Centro',
    image: 'https://picsum.photos/300/300?random=1',
    dataAiHint: 'modern cafe interior',
    promoted: false,
    description: 'Un café acogedor con excelente café y pastelería.',
    latitude: 37.7749,
    longitude: -122.4194,
    address: 'Calle Falsa 123',
    phone: '555-1111',
    email: 'info@cafeesquina.com',
    totalReviews: 45,
    products: [
      {
        id: 1,
        name: 'Café Americano',
        price: 2.50,
        category: 'Bebidas',
        description: 'Café recién tostado con agua caliente.',
        image: 'https://picsum.photos/300/300?random=101',
        inStock: true,
        maxQuantity: 50
      },
      {
        id: 2,
        name: 'Croissant de Almendras',
        price: 3.75,
        category: 'Pastelería',
        description: 'Croissant horneado con almendras y azúcar glass.',
        image: 'https://picsum.photos/300/300?random=102',
        inStock: true,
        maxQuantity: 20
      },
      {
        id: 3,
        name: 'Cappuccino Especial',
        price: 4.00,
        category: 'Bebidas',
        description: 'Espresso con leche vaporizada y espuma.',
        image: 'https://picsum.photos/300/300?random=103',
        inStock: false
      }
    ]
  },
  {
    id: '2',
    name: 'Moda Urbana',
    category: 'Tiendas de ropa',
    rating: 5.0,
    location: 'Norte',
    image: 'https://picsum.photos/300/300?random=2',
    dataAiHint: 'stylish clothing display',
    promoted: true,
    description: 'Últimas tendencias de moda y estilos únicos.',
    latitude: 37.7949,
    longitude: -122.4294,
    address: 'Av Moda 456',
    phone: '555-2222',
    email: 'info@modaurbana.com',
    totalReviews: 87,
    products: [
      {
        id: 1,
        name: 'Camiseta Básica',
        price: 19.99,
        category: 'Ropa',
        description: 'Camiseta de algodón premium en varios colores.',
        image: 'https://picsum.photos/300/300?random=301',
        inStock: true,
        maxQuantity: 50
      },
      {
        id: 2,
        name: 'Jeans Clásicos',
        price: 49.99,
        category: 'Ropa',
        description: 'Jeans de corte regular, perfectos para cualquier ocasión.',
        image: 'https://picsum.photos/300/300?random=302',
        inStock: true,
        maxQuantity: 30
      },
      {
        id: 3,
        name: 'Chaqueta de Cuero',
        price: 89.99,
        category: 'Ropa',
        description: 'Chaqueta de cuero sintético con forro interior.',
        image: 'https://picsum.photos/300/300?random=303',
        inStock: false
      }
    ]
  },
  {
    id: '3',
    name: 'Patitas Felices',
    category: 'Veterinarias',
    rating: 4.8,
    location: 'Sur',
    image: 'https://picsum.photos/300/300?random=3',
    dataAiHint: 'vet with cat',
    promoted: true,
    description: 'Cuidado compasivo para tus amigos peludos.',
    latitude: 37.7549,
    longitude: -122.4094,
    address: 'Calle Mascotas 789',
    phone: '555-3333',
    email: 'info@patitas.com',
    totalReviews: 156,
    products: [
      {
        id: 1,
        name: 'Consulta General',
        price: 35.00,
        category: 'Servicios',
        description: 'Revisión completa de salud para tu mascota.',
        image: 'https://picsum.photos/300/300?random=401',
        inStock: true
      },
      {
        id: 2,
        name: 'Vacunación',
        price: 25.00,
        category: 'Servicios',
        description: 'Servicio de vacunación con certificado incluido.',
        image: 'https://picsum.photos/300/300?random=402',
        inStock: true
      },
      {
        id: 3,
        name: 'Peluquería Canina',
        price: 40.00,
        category: 'Servicios',
        description: 'Baño, corte y peinado para perros.',
        image: 'https://picsum.photos/300/300?random=403',
        inStock: true,
        maxQuantity: 8
      }
    ]
  },
  {
    id: '4',
    name: 'Libros & Más',
    category: 'Librerías',
    rating: 4.2,
    location: 'Centro',
    image: 'https://picsum.photos/300/300?random=4',
    dataAiHint: 'cozy bookstore aisle',
    promoted: false,
    description: 'Un lugar tranquilo para encontrar tu próximo libro favorito.',
    latitude: 37.7755,
    longitude: -122.4180,
    address: 'Plaza Libro 1',
    phone: '555-4444',
    email: 'info@librosymas.com',
    totalReviews: 92,
    products: [
      {
        id: 1,
        name: '100 Años de Soledad',
        price: 15.99,
        category: 'Literatura',
        description: 'Obra maestra de Gabriel García Márquez.',
        image: 'https://picsum.photos/300/300?random=501',
        inStock: true,
        maxQuantity: 15
      },
      {
        id: 2,
        name: 'Set de Marcadores',
        price: 8.99,
        category: 'Papelería',
        description: 'Set de 12 marcadores de colores surtidos.',
        image: 'https://picsum.photos/300/300?random=502',
        inStock: true,
        maxQuantity: 100
      },
      {
        id: 3,
        name: 'Agenda 2024',
        price: 12.99,
        category: 'Papelería',
        description: 'Agenda anual con diseño minimalista.',
        image: 'https://picsum.photos/300/300?random=503',
        inStock: false
      }
    ]
  },
  {
    id: '5',
    name: 'Sabor Criollo',
    category: 'Restaurantes',
    rating: 4.7,
    location: 'Este',
    image: 'https://picsum.photos/300/300?random=5',
    dataAiHint: 'traditional dish presentation',
    promoted: true,
    description: 'Experiencia culinaria exquisita con un toque moderno.',
    latitude: 37.7800,
    longitude: -122.3994,
    address: 'Blvd Sabor 987',
    phone: '555-5555',
    email: 'info@saborcriollo.com',
    totalReviews: 128,
    products: [
      {
        id: 1,
        name: 'Ropa Vieja',
        price: 12.99,
        category: 'Platos Principales',
        description: 'Carne deshebrada en salsa de tomate con vegetales.',
        image: 'https://picsum.photos/300/300?random=201',
        inStock: true,
        maxQuantity: 30
      },
      {
        id: 2,
        name: 'Arroz con Mariscos',
        price: 15.99,
        category: 'Platos Principales',
        description: 'Arroz amarillo con variedad de mariscos frescos.',
        image: 'https://picsum.photos/300/300?random=202',
        inStock: true,
        maxQuantity: 25
      },
      {
        id: 3,
        name: 'Flan de Caramelo',
        price: 5.99,
        category: 'Postres',
        description: 'Flan casero con salsa de caramelo.',
        image: 'https://picsum.photos/300/300?random=203',
        inStock: true,
        maxQuantity: 15
      }
    ]
  },
  {
    id: '6',
    name: 'Estilo Casual',
    category: 'Tiendas de ropa',
    rating: 4.0,
    location: 'Sur',
    image: 'https://picsum.photos/300/300?random=6',
    dataAiHint: 'casual wear shop',
    promoted: false,
    description: 'Ropa asequible y con estilo para todos.',
    latitude: 37.7449,
    longitude: -122.4154,
    address: 'Ruta Estilo 101',
    phone: '555-6666',
    email: 'info@estilocasual.com',
    totalReviews: 64,
    products: [
      {
        id: 1,
        name: 'Camisa Casual',
        price: 29.99,
        category: 'Ropa',
        description: 'Camisa de manga larga en algodón.',
        image: 'https://picsum.photos/300/300?random=601',
        inStock: true,
        maxQuantity: 40
      },
      {
        id: 2,
        name: 'Pantalón Chino',
        price: 45.99,
        category: 'Ropa',
        description: 'Pantalón chino en varios colores.',
        image: 'https://picsum.photos/300/300?random=602',
        inStock: true,
        maxQuantity: 25
      }
    ]
  },
  {
    id: '7',
    name: 'Café Central',
    category: 'Cafeterías',
    rating: 4.9,
    location: 'Norte',
    image: 'https://picsum.photos/300/300?random=7',
    dataAiHint: 'coffee shop barista',
    promoted: true,
    description: 'El mejor café y sofás de la ciudad.',
    latitude: 37.8049,
    longitude: -122.4394,
    address: 'Av Cafe 10',
    phone: '555-7777',
    email: 'info@cafecentral.com',
    totalReviews: 183,
    products: [
      {
        id: 1,
        name: 'Café Latte',
        price: 3.99,
        category: 'Bebidas',
        description: 'Espresso con leche cremosa.',
        image: 'https://picsum.photos/300/300?random=701',
        inStock: true,
        maxQuantity: 100
      },
      {
        id: 2,
        name: 'Tarta de Zanahoria',
        price: 4.50,
        category: 'Postres',
        description: 'Tarta casera con cream cheese.',
        image: 'https://picsum.photos/300/300?random=702',
        inStock: true,
        maxQuantity: 15
      }
    ]
  },
  {
    id: '8',
    name: 'Flores del Edén',
    category: 'Floristerías',
    rating: 4.6,
    location: 'Oeste',
    image: 'https://picsum.photos/300/300?random=8',
    dataAiHint: 'flower shop display',
    promoted: false,
    description: 'Arreglos florales frescos para toda ocasión.',
    latitude: 37.7700,
    longitude: -122.4500,
    address: 'Calle Flor 22',
    phone: '555-8888',
    email: 'info@flores.com',
    totalReviews: 78,
    products: [
      {
        id: 1,
        name: 'Ramo de Rosas',
        price: 35.00,
        category: 'Arreglos Florales',
        description: 'Docena de rosas rojas con decoración.',
        image: 'https://picsum.photos/300/300?random=801',
        inStock: true,
        maxQuantity: 20
      },
      {
        id: 2,
        name: 'Centro de Mesa',
        price: 45.00,
        category: 'Arreglos Florales',
        description: 'Arreglo floral para eventos.',
        image: 'https://picsum.photos/300/300?random=802',
        inStock: true,
        maxQuantity: 10
      }
    ]
  },
  {
    id: '9',
    name: 'TecnoSoluciones',
    category: 'Reparación Electrónica',
    rating: 4.3,
    location: 'Centro',
    image: 'https://picsum.photos/300/300?random=9',
    dataAiHint: 'electronics repair bench',
    promoted: false,
    description: 'Reparación rápida y confiable de tus dispositivos.',
    latitude: 37.7780,
    longitude: -122.4150,
    address: 'Pasaje Tecno 3',
    phone: '555-9999',
    email: 'info@tecnosoluciones.com',
    totalReviews: 112,
    products: [
      {
        id: 1,
        name: 'Reparación de Pantalla',
        price: 89.99,
        category: 'Servicios',
        description: 'Cambio de pantalla para smartphones.',
        image: 'https://picsum.photos/300/300?random=901',
        inStock: true
      },
      {
        id: 2,
        name: 'Mantenimiento PC',
        price: 49.99,
        category: 'Servicios',
        description: 'Limpieza y optimización de computadoras.',
        image: 'https://picsum.photos/300/300?random=902',
        inStock: true
      }
    ]
  },
  {
    id: '10',
    name: 'Pan Caliente',
    category: 'Panaderías',
    rating: 4.9,
    location: 'Este',
    image: 'https://picsum.photos/300/300?random=10',
    dataAiHint: 'fresh bread bakery',
    promoted: true,
    description: 'Pan artesanal horneado diariamente.',
    latitude: 37.7850,
    longitude: -122.3950,
    address: 'Esquina Pan 50',
    phone: '555-1010',
    email: 'info@pancaliente.com',
    totalReviews: 245,
    products: [
      {
        id: 1,
        name: 'Pan Baguette',
        price: 2.50,
        category: 'Panadería',
        description: 'Pan francés recién horneado.',
        image: 'https://picsum.photos/300/300?random=1001',
        inStock: true,
        maxQuantity: 50
      },
      {
        id: 2,
        name: 'Pan de Chocolate',
        price: 3.99,
        category: 'Panadería',
        description: 'Pan dulce con trozos de chocolate.',
        image: 'https://picsum.photos/300/300?random=1002',
        inStock: true,
        maxQuantity: 30
      }
    ]
  },
  {
    id: '11',
    name: 'Gym Fuerte',
    category: 'Gimnasios',
    rating: 4.4,
    location: 'Norte',
    image: 'https://picsum.photos/300/300?random=11',
    dataAiHint: 'modern gym equipment',
    promoted: false,
    description: 'Equipamiento moderno y clases variadas.',
    latitude: 37.8000,
    longitude: -122.4300,
    address: 'Calle Fitness 1',
    phone: '555-1112',
    email: 'info@gymfuerte.com',
    totalReviews: 167,
    products: [
      {
        id: 1,
        name: 'Membresía Mensual',
        price: 49.99,
        category: 'Membresías',
        description: 'Acceso ilimitado a instalaciones y clases.',
        image: 'https://picsum.photos/300/300?random=1101',
        inStock: true
      },
      {
        id: 2,
        name: 'Entrenamiento Personal',
        price: 29.99,
        category: 'Servicios',
        description: 'Sesión de 1 hora con entrenador.',
        image: 'https://picsum.photos/300/300?random=1102',
        inStock: true,
        maxQuantity: 10
      }
    ]
  },
  {
    id: '12',
    name: 'Cine Estrella',
    category: 'Cines',
    rating: 4.7,
    location: 'Centro',
    image: 'https://picsum.photos/300/300?random=12',
    dataAiHint: 'cinema movie screen',
    promoted: true,
    description: 'Los últimos estrenos en pantalla grande.',
    latitude: 37.7760,
    longitude: -122.4200,
    address: 'Plaza Cine 5',
    phone: '555-1113',
    email: 'info@cineestrella.com',
    totalReviews: 342,
    products: [
      {
        id: 1,
        name: 'Entrada General',
        price: 8.99,
        category: 'Entradas',
        description: 'Entrada para cualquier película en 2D.',
        image: 'https://picsum.photos/300/300?random=1201',
        inStock: true,
        maxQuantity: 200
      },
      {
        id: 2,
        name: 'Combo Palomitas',
        price: 12.99,
        category: 'Snacks',
        description: 'Palomitas grandes y refresco.',
        image: 'https://picsum.photos/300/300?random=1202',
        inStock: true,
        maxQuantity: 100
      }
    ]
  }
];

// Extract categories from allBusinesses and add "Todas"
export const categories = ["Todas", ...new Set(allBusinesses.map(business => business.category))];

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
