/**
 * Categorías reales de negocios para la aplicación
 * Estas categorías se utilizarán en toda la aplicación para mantener consistencia
 */

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string; // Nombre del icono en lucide-react
}

export const businessCategories: Category[] = [
    {
        id: "restaurantes",
        name: "Restaurantes",
        description: "Establecimientos gastronómicos que ofrecen comidas y bebidas para consumo en el local",
        icon: "utensils"
    },
    {
        id: "cafeterias",
        name: "Cafeterías",
        description: "Locales que sirven café, té, aperitivos y comidas ligeras",
        icon: "coffee"
    },
    {
        id: "alojamiento",
        name: "Alojamiento",
        description: "Casas particulares, hostales y opciones de hospedaje",
        icon: "bed"
    },
    {
        id: "transporte",
        name: "Transporte",
        description: "Servicios de taxi, renta de autos y transporte turístico",
        icon: "car"
    },
    {
        id: "belleza",
        name: "Belleza y Estética",
        description: "Salones de belleza, peluquerías y barberías",
        icon: "scissors"
    },
    {
        id: "tecnologia",
        name: "Tecnología",
        description: "Servicios informáticos, reparación de celulares y electrónica",
        icon: "laptop"
    },
    {
        id: "artesania",
        name: "Artesanía",
        description: "Productos artesanales, souvenirs y arte local",
        icon: "paintbrush"
    },
    {
        id: "salud",
        name: "Salud y Bienestar",
        description: "Consultas médicas, masajes, terapias alternativas",
        icon: "heart-pulse"
    },
    {
        id: "deportes",
        name: "Deportes y Recreación",
        description: "Gimnasios, clases deportivas y actividades recreativas",
        icon: "dumbbell"
    },
    {
        id: "educacion",
        name: "Educación",
        description: "Clases particulares, tutorías y cursos especializados",
        icon: "graduation-cap"
    },
    {
        id: "construccion",
        name: "Construcción",
        description: "Servicios de construcción, reparación y mantenimiento",
        icon: "hammer"
    },
    {
        id: "tiendas",
        name: "Tiendas",
        description: "Comercios minoristas de diversos productos",
        icon: "shopping-bag"
    }
];

// Obtener solo los nombres de las categorías para listas simples
export const categoryNames = businessCategories.map(cat => cat.name);

// Agregar "Todas" para filtros
export const categoriesWithAll = ["Todas", ...categoryNames];

// Función para obtener una categoría por su ID
export function getCategoryById(id: string): Category | undefined {
    return businessCategories.find(cat => cat.id === id);
}

// Función para obtener una categoría por su nombre
export function getCategoryByName(name: string): Category | undefined {
    return businessCategories.find(cat => cat.name === name);
} 