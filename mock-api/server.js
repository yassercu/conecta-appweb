const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS para permitir cualquier origen
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Función para normalizar texto (minúsculas y sin tildes)
function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Base de datos en memoria
const db = {
    businesses: [],
    categories: [],
    countries: [],
    provinces: [],
    municipalities: [],
    products: [],
    reviews: []
};

// Cargar datos iniciales
const loadInitialData = () => {
    // Categorías
    const categories = [
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

    // Países - Tomados de locations.ts
    const countries = [
        { id: "cu", name: "Cuba", code: "CU" },
        { id: "es", name: "España", code: "ES" },
        { id: "mx", name: "México", code: "MX" },
        { id: "us", name: "Estados Unidos", code: "US" }
    ];

    // Provincias - Tomadas de locations.ts
    const provinces = [
        { id: "pinar", name: "Pinar del Río", countryId: "cu" },
        { id: "artemisa", name: "Artemisa", countryId: "cu" },
        { id: "habana", name: "La Habana", countryId: "cu" },
        { id: "mayabeque", name: "Mayabeque", countryId: "cu" },
        { id: "matanzas", name: "Matanzas", countryId: "cu" },
        { id: "cienfuegos", name: "Cienfuegos", countryId: "cu" },
        { id: "villa-clara", name: "Villa Clara", countryId: "cu" },
        { id: "sancti-spiritus", name: "Sancti Spíritus", countryId: "cu" },
        { id: "ciego-avila", name: "Ciego de Ávila", countryId: "cu" },
        { id: "camaguey", name: "Camagüey", countryId: "cu" },
        { id: "las-tunas", name: "Las Tunas", countryId: "cu" },
        { id: "granma", name: "Granma", countryId: "cu" },
        { id: "holguin", name: "Holguín", countryId: "cu" },
        { id: "santiago", name: "Santiago de Cuba", countryId: "cu" },
        { id: "guantanamo", name: "Guantánamo", countryId: "cu" },
        { id: "isla", name: "Isla de la Juventud", countryId: "cu" }
    ];

    // Municipios - Tomados de locations.ts (completa para La Habana y otras)
    const municipalities = [
        // Pinar del Río
        { id: "pinar-mun", name: "Pinar del Río", provinceId: "pinar" }, // Ajustado ID para unicidad si es necesario
        { id: "viñales", name: "Viñales", provinceId: "pinar" },
        { id: "san-juan-martinez", name: "San Juan y Martínez", provinceId: "pinar" },
        { id: "san-luis-pinar", name: "San Luis", provinceId: "pinar" }, // Diferenciar de San Luis en Santiago
        { id: "guane", name: "Guane", provinceId: "pinar" },
        { id: "consolacion", name: "Consolación del Sur", provinceId: "pinar" },
        { id: "la-palmas", name: "La Palma", provinceId: "pinar" }, // ID "la-palma" en locations.ts
        { id: "los-palacios", name: "Los Palacios", provinceId: "pinar" },
        { id: "mantua", name: "Mantua", provinceId: "pinar" },
        { id: "minas-matahambre", name: "Minas de Matahambre", provinceId: "pinar" }, // ID "minas-san-juan" en locations.ts, ajustado
        // { id: "sandino", name: "Sandino", provinceId: "pinar" }, // locations.ts lo tiene como san-carlos
        { id: "sandino", name: "Sandino", provinceId: "pinar" }, // Asumiendo Sandino es el correcto, no San Carlos

        // Artemisa
        { id: "artemisa-mun", name: "Artemisa", provinceId: "artemisa" }, // Ajustado ID
        { id: "bauta", name: "Bauta", provinceId: "artemisa" },
        { id: "bahia-honda", name: "Bahía Honda", provinceId: "artemisa" },
        { id: "candelaria", name: "Candelaria", provinceId: "artemisa" },
        { id: "guanajay", name: "Guanajay", provinceId: "artemisa" },
        { id: "güira-melena", name: "Güira de Melena", provinceId: "artemisa" }, // ID "güira" en locations.ts
        { id: "mariel", name: "Mariel", provinceId: "artemisa" },
        { id: "san-antonio-baños", name: "San Antonio de los Baños", provinceId: "artemisa" }, // ID "san-antonio" en locations.ts
        { id: "san-cristobal", name: "San Cristóbal", provinceId: "artemisa" },
        { id: "alquizar", name: "Alquízar", provinceId: "artemisa" }, // Faltaba en locations.ts
        { id: "caimito", name: "Caimito", provinceId: "artemisa" }, // Faltaba en locations.ts


        // La Habana
        { id: "plaza", name: "Plaza de la Revolución", provinceId: "habana" },
        { id: "centro-habana", name: "Centro Habana", provinceId: "habana" },
        { id: "habana-vieja", name: "Habana Vieja", provinceId: "habana" },
        { id: "regla", name: "Regla", provinceId: "habana" },
        { id: "habana-este", name: "Habana del Este", provinceId: "habana" },
        { id: "guanabacoa", name: "Guanabacoa", provinceId: "habana" },
        { id: "san-miguel-padron", name: "San Miguel del Padrón", provinceId: "habana" }, // ID "san-miguel" en locations.ts
        { id: "diez-octubre", name: "Diez de Octubre", provinceId: "habana" },
        { id: "cerro", name: "Cerro", provinceId: "habana" },
        { id: "marianao", name: "Marianao", provinceId: "habana" },
        { id: "playa", name: "Playa", provinceId: "habana" },
        { id: "boyeros", name: "Boyeros", provinceId: "habana" },
        { id: "arroyo-naranjo", name: "Arroyo Naranjo", provinceId: "habana" },
        { id: "cotorro", name: "Cotorro", provinceId: "habana" },
        { id: "la-lisa", name: "La Lisa", provinceId: "habana" },

        // Mayabeque
        { id: "batabano", name: "Batabanó", provinceId: "mayabeque" },
        { id: "bejucal", name: "Bejucal", provinceId: "mayabeque" },
        { id: "güines", name: "Güines", provinceId: "mayabeque" },
        { id: "jaruco", name: "Jaruco", provinceId: "mayabeque" },
        { id: "madruga", name: "Madruga", provinceId: "mayabeque" },
        { id: "melena-sur", name: "Melena del Sur", provinceId: "mayabeque" }, // ID "melena" en locations.ts
        { id: "nueva-paz", name: "Nueva Paz", provinceId: "mayabeque" },
        { id: "quivican", name: "Quivicán", provinceId: "mayabeque" }, // Con tilde en locations.ts
        { id: "san-jose-lajas", name: "San José de las Lajas", provinceId: "mayabeque" }, // ID "san-josé" en locations.ts
        { id: "san-nicolas-bari", name: "San Nicolás de Bari", provinceId: "mayabeque" }, // ID "san-nicolás" en locations.ts
        { id: "santa-cruz-norte", name: "Santa Cruz del Norte", provinceId: "mayabeque" }, // Faltaba en locations.ts

        // Matanzas
        { id: "matanzas-city", name: "Matanzas", provinceId: "matanzas" },
        { id: "cardenas", name: "Cárdenas", provinceId: "matanzas" },
        // { id: "varadero", name: "Varadero", provinceId: "matanzas" }, // Varadero es parte de Cárdenas, no un municipio separado.
        { id: "colon-mtz", name: "Colón", provinceId: "matanzas" }, // ID "colon" en locations.ts
        { id: "jovellanos", name: "Jovellanos", provinceId: "matanzas" },
        { id: "jaguey-grande", name: "Jagüey Grande", provinceId: "matanzas" }, // ID "jaguey" en locations.ts
        { id: "marti-mtz", name: "Martí", provinceId: "matanzas" }, // ID "marti" en locations.ts
        { id: "limonar", name: "Limonar", provinceId: "matanzas" },
        { id: "perico", name: "Perico", provinceId: "matanzas" },
        { id: "union-reyes", name: "Unión de Reyes", provinceId: "matanzas" },
        { id: "pedro-betancourt", name: "Pedro Betancourt", provinceId: "matanzas" },
        { id: "los-arabos", name: "Los Arabos", provinceId: "matanzas" }, // Faltaba en locations.ts
        { id: "calimete", name: "Calimete", provinceId: "matanzas" }, // Faltaba en locations.ts
        { id: "cienfaga-zapata", name: "Ciénaga de Zapata", provinceId: "matanzas" }, // Faltaba en locations.ts

        // Cienfuegos
        { id: "cienfuegos-city", name: "Cienfuegos", provinceId: "cienfuegos" }, // ID "cienfuegos" en locations.ts
        { id: "abreus", name: "Abreus", provinceId: "cienfuegos" }, // ID "abreu" en locations.ts
        { id: "aguada-pasajeros", name: "Aguada de Pasajeros", provinceId: "cienfuegos" }, // ID "aguada" en locations.ts
        { id: "cruces", name: "Cruces", provinceId: "cienfuegos" },
        { id: "lajas-cfg", name: "Lajas", provinceId: "cienfuegos" }, // ID "lajas" en locations.ts
        { id: "palmira", name: "Palmira", provinceId: "cienfuegos" },
        { id: "rodas", name: "Rodas", provinceId: "cienfuegos" }, // ID "rodao" en locations.ts, ajustado
        { id: "cumanayagua", name: "Cumanayagua", provinceId: "cienfuegos" },
        
        // Villa Clara
        { id: "santa-clara", name: "Santa Clara", provinceId: "villa-clara" },
        { id: "caibarien", name: "Caibarién", provinceId: "villa-clara" },
        { id: "camajuani", name: "Camajuaní", provinceId: "villa-clara" },
        { id: "cifuentes", name: "Cifuentes", provinceId: "villa-clara" },
        { id: "corralillo", name: "Corralillo", provinceId: "villa-clara" },
        { id: "encrucijada", name: "Encrucijada", provinceId: "villa-clara" },
        { id: "manicaragua", name: "Manicaragua", provinceId: "villa-clara" },
        { id: "placetas", name: "Placetas", provinceId: "villa-clara" },
        { id: "quemado-guines", name: "Quemado de Güines", provinceId: "villa-clara" }, // ID "quemado" en locations.ts
        { id: "remedios", name: "Remedios", provinceId: "villa-clara" },
        { id: "sagua-la-grande-vc", name: "Sagua la Grande", provinceId: "villa-clara" }, // ID "sagua" en locations.ts
        { id: "santo-domingo-vc", name: "Santo Domingo", provinceId: "villa-clara"}, // Faltaba en locations.ts
        { id: "ranchuelo", name: "Ranchuelo", provinceId: "villa-clara"}, // Faltaba en locations.ts

        // Sancti Spíritus
        { id: "sancti-spiritus-city", name: "Sancti Spíritus", provinceId: "sancti-spiritus" }, // ID "sancti-spiritus" en locations.ts
        { id: "taguasco", name: "Taguasco", provinceId: "sancti-spiritus" },
        // { id: "jiguaní", name: "Jiguaní", provinceId: "sancti-spiritus" }, // Jiguaní está en Granma, no SS
        { id: "trinidad", name: "Trinidad", provinceId: "sancti-spiritus" },
        { id: "yaguajay", name: "Yaguajay", provinceId: "sancti-spiritus" },
        { id: "fomento", name: "Fomento", provinceId: "sancti-spiritus" },
        { id: "cabaiguan", name: "Cabaiguán", provinceId: "sancti-spiritus" },
        { id: "la-sierpe", name: "La Sierpe", provinceId: "sancti-spiritus" },
        { id: "jatibonico", name: "Jatibonico", provinceId: "sancti-spiritus"}, // Faltaba en locations.ts
        
        // Ciego de Ávila
        { id: "ciego-avila-city", name: "Ciego de Ávila", provinceId: "ciego-avila" }, // ID "ciego-avila" en locations.ts
        { id: "moron", name: "Morón", provinceId: "ciego-avila" },
        { id: "chambas", name: "Chambas", provinceId: "ciego-avila" },
        { id: "florencia", name: "Florencia", provinceId: "ciego-avila" },
        { id: "majagua", name: "Majagua", provinceId: "ciego-avila" },
        { id: "primero-enero", name: "Primero de Enero", provinceId: "ciego-avila" },
        { id: "bolivia", name: "Bolivia", provinceId: "ciego-avila" },
        { id: "baragua", name: "Baraguá", provinceId: "ciego-avila" },
        { id: "venezuela-cav", name: "Venezuela", provinceId: "ciego-avila" }, // Faltaba en locations.ts
        { id: "ciro-redondo", name: "Ciro Redondo", provinceId: "ciego-avila" }, // Faltaba en locations.ts

        // Camagüey
        { id: "camaguey-city", name: "Camagüey", provinceId: "camaguey" }, // ID "camaguey" en locations.ts
        { id: "florida-cmg", name: "Florida", provinceId: "camaguey" },
        { id: "nuevitas", name: "Nuevitas", provinceId: "camaguey" },
        { id: "sibanicu", name: "Sibanicú", provinceId: "camaguey" },
        { id: "minas-cmg", name: "Minas", provinceId: "camaguey" }, // ID "minas" en locations.ts
        { id: "guaimaro", name: "Guáimaro", provinceId: "camaguey" }, // Con tilde en locations.ts
        { id: "vertientes", name: "Vertientes", provinceId: "camaguey" },
        { id: "jimaguayu", name: "Jimaguayú", provinceId: "camaguey" }, // Con tilde en locations.ts
        { id: "santa-cruz-sur", name: "Santa Cruz del Sur", provinceId: "camaguey" }, // ID "santa-cruz" en locations.ts
        { id: "esmeralda", name: "Esmeralda", provinceId: "camaguey" },
        { id: "carlos-m-cespedes", name: "Carlos Manuel de Céspedes", provinceId: "camaguey" }, // Faltaba en locations.ts
        { id: "najasa", name: "Najasa", provinceId: "camaguey" }, // Faltaba en locations.ts
        { id: "sierra-cubitas", name: "Sierra de Cubitas", provinceId: "camaguey" }, // Faltaba en locations.ts

        // Las Tunas
        { id: "las-tunas-city", name: "Las Tunas", provinceId: "las-tunas" }, // ID "las-tunas" en locations.ts
        { id: "amancio", name: "Amancio", provinceId: "las-tunas" },
        { id: "colombia", name: "Colombia", provinceId: "las-tunas" },
        { id: "jesus-menendez", name: "Jesús Menéndez", provinceId: "las-tunas" },
        { id: "jobabo", name: "Jobabo", provinceId: "las-tunas" },
        { id: "majibacoa", name: "Majibacoa", provinceId: "las-tunas" },
        { id: "manati", name: "Manatí", provinceId: "las-tunas" },
        { id: "puerto-padre", name: "Puerto Padre", provinceId: "las-tunas" },

        // Granma
        { id: "bayamo", name: "Bayamo", provinceId: "granma" },
        { id: "manzanillo", name: "Manzanillo", provinceId: "granma" },
        { id: "yara", name: "Yara", provinceId: "granma" },
        { id: "campechuela", name: "Campechuela", provinceId: "granma" },
        { id: "bartolome-maso", name: "Bartolomé Masó", provinceId: "granma" }, // ID "bartolome-masó" en locations.ts
        { id: "buey-arriba", name: "Buey Arriba", provinceId: "granma" },
        { id: "cauto-cristo", name: "Cauto Cristo", provinceId: "granma" },
        { id: "guisa", name: "Guisa", provinceId: "granma" },
        { id: "jiguani-granma", name: "Jiguaní", provinceId: "granma" }, // ID "jiguaní-granma" en locations.ts
        { id: "media-luna", name: "Media Luna", provinceId: "granma" },
        { id: "niquero", name: "Niquero", provinceId: "granma" },
        { id: "pilon", name: "Pilón", provinceId: "granma" }, // Con tilde en locations.ts
        { id: "rio-cauto", name: "Río Cauto", provinceId: "granma" },

        // Holguín
        { id: "holguin-city", name: "Holguín", provinceId: "holguin" },
        { id: "banes", name: "Banes", provinceId: "holguin" },
        { id: "antilla", name: "Antilla", provinceId: "holguin" },
        { id: "rafael-freyre", name: "Rafael Freyre", provinceId: "holguin" },
        { id: "gibara", name: "Gibara", provinceId: "holguin" },
        { id: "baguanos", name: "Báguanos", provinceId: "holguin" }, // Con tilde en locations.ts
        { id: "calixto-garcia", name: "Calixto García", provinceId: "holguin" },
        { id: "cueto", name: "Cueto", provinceId: "holguin" },
        { id: "frank-pais", name: "Frank País", provinceId: "holguin" }, // Con tilde en locations.ts
        { id: "mayari", name: "Mayarí", provinceId: "holguin" }, // Con tilde en locations.ts
        { id: "moa", name: "Moa", provinceId: "holguin" },
        { id: "sagua-tanamo", name: "Sagua de Tánamo", provinceId: "holguin" }, // ID "sagua-grande" en locations.ts es incorrecto, debe ser sagua-tanamo
        { id: "urbano-noris", name: "Urbano Noris", provinceId: "holguin" }, // ID "urbano-noriega" en locations.ts, ajustado
        { id: "cacocum", name: "Cacocum", provinceId: "holguin" }, // Faltaba en locations.ts

        // Santiago de Cuba
        { id: "santiago-city", name: "Santiago de Cuba", provinceId: "santiago" }, // ID "santiago" en locations.ts
        { id: "palma-soriano", name: "Palma Soriano", provinceId: "santiago" },
        { id: "contramaestre", name: "Contramaestre", provinceId: "santiago" },
        // { id: "mella", name: "Mella", provinceId: "santiago" }, // Mella es Julio Antonio Mella
        { id: "san-luis-santiago", name: "San Luis", provinceId: "santiago" }, // ID "san-luis" en locations.ts
        { id: "songo-la-maya", name: "Songo-La Maya", provinceId: "santiago" },
        { id: "segundo-frente", name: "Segundo Frente", provinceId: "santiago" },
        { id: "tercer-frente", name: "Tercer Frente", provinceId: "santiago" },
        { id: "julio-antonio-mella", name: "Julio Antonio Mella", provinceId: "santiago" }, // ID "julio-antonio-mella" en locations.ts (antes mella)
        { id: "guama-santiago", name: "Guamá", provinceId: "santiago" }, // ID "guamá" en locations.ts

        // Guantánamo
        { id: "guantanamo-city", name: "Guantánamo", provinceId: "guantanamo" }, // ID "guantanamo" en locations.ts
        { id: "baracoa", name: "Baracoa", provinceId: "guantanamo" },
        { id: "caimanera", name: "Caimanera", provinceId: "guantanamo" },
        { id: "el-salvador", name: "El Salvador", provinceId: "guantanamo" },
        { id: "imias", name: "Imías", provinceId: "guantanamo" }, // Con tilde en locations.ts
        { id: "maisi", name: "Maisí", provinceId: "guantanamo" }, // Con tilde en locations.ts
        { id: "manuel-tames", name: "Manuel Tames", provinceId: "guantanamo" },
        { id: "niceto-perez", name: "Niceto Pérez", provinceId: "guantanamo" },
        { id: "san-antonio-sur", name: "San Antonio del Sur", provinceId: "guantanamo" }, // ID "san-antonio-del-sur" en locations.ts
        { id: "yateras", name: "Yateras", provinceId: "guantanamo" },

        // Isla de la Juventud
        { id: "isla-juventud-mun", name: "Isla de la Juventud", provinceId: "isla" } // ID "isla" en locations.ts
    ];


    // Generar negocios de ejemplo
    const businesses = [];
    const nombreNegocios = [
        "El Rincón Criollo", "La Bodeguita", "Paladar Don José",
        "Café Habana", "Restaurante El Malecón", "Heladería Coppelia",
        "Bar El Floridita", "Hostal Las Palmas", "Artesanías Cubanas",
        "Transportes Viñales", "Salón Belleza Caribeña", "TecnoCuba"
    ];

    for (let i = 1; i <= 30; i++) {
        const categoryIndex = Math.floor(Math.random() * categories.length);
        const provinceIndex = Math.floor(Math.random() * provinces.length);
        const province = provinces[provinceIndex];

        const municipalitiesInProvince = municipalities.filter(m => m.provinceId === province.id);
        // Asegurarse de que haya municipios para la provincia seleccionada
        const municipality = municipalitiesInProvince.length > 0 
            ? municipalitiesInProvince[Math.floor(Math.random() * municipalitiesInProvince.length)]
            : { id: `unknown-${province.id}`, name: 'Desconocido', provinceId: province.id }; // Fallback

        // Generar nombre de negocio
        const nombreIndex = Math.floor(Math.random() * nombreNegocios.length);
        const nombre = `${nombreNegocios[nombreIndex]} ${i}`;

        // Generar coordenadas para Cuba
        const latitude = 21.5 + (Math.random() * 2); // Entre 21.5 y 23.5 (aproximadamente para Cuba)
        const longitude = -84.0 + (Math.random() * 6); // Entre -84.0 y -78.0 (aproximadamente para Cuba)

        // Generar productos
        const productCount = 1 + Math.floor(Math.random() * 5);
        const products = [];
        for (let j = 1; j <= productCount; j++) {
            products.push({
                id: `${i}-${j}`,
                name: `Producto ${j} de ${categories[categoryIndex].name}`,
                price: 5 + (j * 2.5),
                category: categories[categoryIndex].name,
                description: `Descripción del producto ${j} del negocio ${nombre}.`,
                image: `https://placehold.co/200x200.png?text=Producto`,
                inStock: Math.random() > 0.2
            });
        }

        // Generar reseñas
        const reviewCount = Math.floor(Math.random() * 6);
        const reviews = [];
        const authors = ["Carlos Rodríguez", "María González", "Juan Pérez", "Ana López"];
        for (let j = 1; j <= reviewCount; j++) {
            const authorIndex = Math.floor(Math.random() * authors.length);
            const date = new Date();
            date.setDate(date.getDate() - (j * 7));

            reviews.push({
                id: `review-${i}-${j}`,
                businessId: `${i}`,
                author: authors[authorIndex],
                rating: 3 + Math.floor(Math.random() * 3), // Entre 3 y 5
                comment: `Esta es una reseña #${j} para ${nombre}. Buen servicio y productos de calidad.`,
                date: date.toISOString()
            });
        }

        // Agregar negocio
        businesses.push({
            id: `${i}`,
            name: nombre,
            category: categories[categoryIndex].name,
            categoryId: categories[categoryIndex].id,
            rating: 3.5 + (Math.random() * 1.5), // Rating entre 3.5 y 5
            location: `${municipality.name}, ${province.name}`,
            image: "",
            promoted: i <= 5, // Primeros 5 negocios son promocionados
            description: `${nombre} ofrece los mejores servicios de ${categories[categoryIndex].name.toLowerCase()} en ${municipality.name}, ${province.name}.`,
            latitude: latitude,
            longitude: longitude,
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            address: `Calle ${10 + Math.floor(Math.random() * 50)} #${Math.floor(Math.random() * 100)}, ${municipality.name}`,
            phone: "+5350698123",
            email: `contacto@${nombre.toLowerCase().replace(/\s+/g, '')}.cu`,
            totalReviews: reviews.length,
            products: products,
            reviews: reviews,
            country: "Cuba",
            countryId: "cu",
            province: province.name,
            provinceId: province.id,
            municipality: municipality.name,
            municipalityId: municipality.id
        });

        // Agregar productos y reseñas a listas globales
        db.products = [...db.products, ...products];
        db.reviews = [...db.reviews, ...reviews];
    }

    // Guardar en base de datos en memoria
    db.businesses = businesses;
    db.categories = categories;
    db.countries = countries;
    db.provinces = provinces;
    db.municipalities = municipalities;
};

// Cargar datos iniciales
loadInitialData();

// Middleware para simular latencia
const simulateLatency = (req, res, next) => {
    const delay = Math.random() * 300; // Retardo aleatorio hasta 300ms
    setTimeout(next, delay);
};

app.use(simulateLatency);

// Rutas API
// ---------- Negocios ----------
// Obtener todos los negocios
app.get('/api/v1/businesses', (req, res) => {
    res.json(db.businesses);
});

// Obtener negocios destacados
app.get('/api/v1/businesses/featured', (req, res) => {
    // Filtrar 4 negocios para destacar
    const featured = db.businesses.filter((b, index) => index < 4);
    res.json(featured);
});

// Obtener negocios promocionados
app.get('/api/v1/businesses/promoted', (req, res) => {
    const promoted = db.businesses.filter(b => b.promoted);
    res.json(promoted);
});

// Obtener un negocio por ID
app.get('/api/v1/businesses/:id', (req, res) => {
    const business = db.businesses.find(b => b.id === req.params.id);
    if (!business) {
        return res.status(404).json({ message: 'Negocio no encontrado' });
    }
    res.json(business);
});

// Búsqueda de negocios
app.get('/api/v1/search', (req, res) => {
    const { query = '', category, rating, distance, latitude, longitude, sortBy = 'rating', page = 1, limit = 10 } = req.query;

    const normalizedQuery = normalizeText(query);

    let filtered = db.businesses.filter(b => {
        const matchesBusinessName = normalizeText(b.name).includes(normalizedQuery);
        const matchesBusinessDescription = normalizeText(b.description).includes(normalizedQuery);
        // La búsqueda en categoría ya se maneja con el filtro de categoría, 
        // pero si el query coincide con el nombre de la categoría también es válido.
        const matchesCategoryName = normalizeText(b.category).includes(normalizedQuery);

        let matchesProducts = false;
        if (b.products && b.products.length > 0) {
            matchesProducts = b.products.some(product => 
                normalizeText(product.name).includes(normalizedQuery) || 
                normalizeText(product.description).includes(normalizedQuery)
            );
        }

        return (matchesBusinessName || matchesBusinessDescription || matchesCategoryName || matchesProducts) &&
        (!category || category === 'Todas' || b.category === category) &&
               (!rating || b.rating >= parseInt(rating));
    });

    // Filtrar por distancia si se proporcionan coordenadas
    if (distance && distance !== '0' && latitude && longitude) {
        const maxDistance = parseInt(distance);
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);

        filtered = filtered.filter(business => {
            // Calcular distancia entre usuario y negocio
            const lat1 = userLat;
            const lon1 = userLng;
            const lat2 = business.coordinates.latitude;
            const lon2 = business.coordinates.longitude;

            const R = 6371; // Radio de la Tierra en km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distancia en km

            return distance <= maxDistance;
        });
    }

    // Ordenar negocios
    if (sortBy === 'rating') {
        filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
            return b.rating - a.rating || a.name.localeCompare(b.name);
        });
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    } else if (sortBy === 'distance' && latitude && longitude) {
        // Ordenar por distancia
        filtered.sort((a, b) => {
            if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;

            const userLat = parseFloat(latitude);
            const userLng = parseFloat(longitude);

            const distanceA = calculateDistance(
                userLat, userLng,
                a.coordinates.latitude, a.coordinates.longitude
            );

            const distanceB = calculateDistance(
                userLat, userLng,
                b.coordinates.latitude, b.coordinates.longitude
            );

            return distanceA - distanceB;
        });
    }

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const paginatedResults = filtered.slice(startIndex, endIndex);

    res.json({
        businesses: paginatedResults,
        totalCount: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum)
    });
});

// Función para calcular distancia
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
}

// Crear un negocio
app.post('/api/v1/businesses', (req, res) => {
    const newBusiness = {
        id: uuidv4(),
        ...req.body,
        // Datos adicionales
        totalReviews: 0,
        products: [],
        reviews: []
    };

    db.businesses.push(newBusiness);
    res.status(201).json(newBusiness);
});

// Actualizar un negocio
app.put('/api/v1/businesses/:id', (req, res) => {
    const index = db.businesses.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    db.businesses[index] = { ...db.businesses[index], ...req.body };
    res.json(db.businesses[index]);
});

// Eliminar un negocio
app.delete('/api/v1/businesses/:id', (req, res) => {
    const index = db.businesses.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    db.businesses.splice(index, 1);
    res.status(204).end();
});

// ---------- Categorías ----------
app.get('/api/v1/categories', (req, res) => {
    res.json(db.categories);
});

app.get('/api/v1/categories/:id', (req, res) => {
    const category = db.categories.find(c => c.id === req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
});

// ---------- Ubicaciones ----------
app.get('/api/v1/locations/countries', (req, res) => {
    res.json(db.countries);
});

app.get('/api/v1/locations/provinces', (req, res) => {
    res.json(db.provinces);
});

app.get('/api/v1/locations/countries/:countryId/provinces', (req, res) => {
    const provinces = db.provinces.filter(p => p.countryId === req.params.countryId);
    res.json(provinces);
});

app.get('/api/v1/locations/municipalities', (req, res) => {
    res.json(db.municipalities);
});

app.get('/api/v1/locations/provinces/:provinceId/municipalities', (req, res) => {
    const municipalities = db.municipalities.filter(m => m.provinceId === req.params.provinceId);
    res.json(municipalities);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor API mock ejecutándose en http://localhost:${PORT}`);
    console.log(`Ejemplo: http://localhost:${PORT}/api/v1/businesses`);
});
