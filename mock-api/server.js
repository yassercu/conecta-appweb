const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
        { id: '1', name: 'Restaurante', description: 'Restaurantes y cafeterías', icon: 'utensils' },
        { id: '2', name: 'Alojamiento', description: 'Hoteles y alojamientos', icon: 'bed' },
        { id: '3', name: 'Salud y Belleza', description: 'Salones de belleza y centros de salud', icon: 'heart' },
        { id: '4', name: 'Tecnología', description: 'Tiendas y servicios tecnológicos', icon: 'laptop' },
        { id: '5', name: 'Hogar y Decoración', description: 'Productos y servicios para el hogar', icon: 'home' },
        { id: '6', name: 'Moda', description: 'Ropa y accesorios', icon: 'tshirt' },
        { id: '7', name: 'Deportes', description: 'Artículos y servicios deportivos', icon: 'futbol' },
        { id: '8', name: 'Educación', description: 'Academias y centros educativos', icon: 'book' },
        { id: '9', name: 'Transporte', description: 'Servicios de transporte', icon: 'car' },
        { id: '10', name: 'Alimentos', description: 'Tiendas de alimentación', icon: 'shopping-basket' }
    ];

    // Países
    const countries = [
        { id: 'cu', name: 'Cuba', code: 'CU' }
    ];

    // Provincias de Cuba
    const provinces = [
        { id: 'hab', name: 'La Habana', countryId: 'cu' },
        { id: 'mat', name: 'Matanzas', countryId: 'cu' },
        { id: 'vcl', name: 'Villa Clara', countryId: 'cu' },
        { id: 'cfg', name: 'Cienfuegos', countryId: 'cu' },
        { id: 'ssp', name: 'Sancti Spíritus', countryId: 'cu' },
        { id: 'cav', name: 'Ciego de Ávila', countryId: 'cu' },
        { id: 'cam', name: 'Camagüey', countryId: 'cu' },
        { id: 'ltu', name: 'Las Tunas', countryId: 'cu' },
        { id: 'hol', name: 'Holguín', countryId: 'cu' },
        { id: 'gra', name: 'Granma', countryId: 'cu' },
        { id: 'scu', name: 'Santiago de Cuba', countryId: 'cu' },
        { id: 'gtm', name: 'Guantánamo', countryId: 'cu' },
        { id: 'ijv', name: 'Isla de la Juventud', countryId: 'cu' },
        { id: 'pri', name: 'Pinar del Río', countryId: 'cu' },
        { id: 'art', name: 'Artemisa', countryId: 'cu' },
        { id: 'may', name: 'Mayabeque', countryId: 'cu' }
    ];

    // Municipios por provincia
    const municipalities = [
        // La Habana
        { id: 'hab-1', name: 'Habana Vieja', provinceId: 'hab' },
        { id: 'hab-2', name: 'Centro Habana', provinceId: 'hab' },
        { id: 'hab-3', name: 'Plaza de la Revolución', provinceId: 'hab' },
        { id: 'hab-4', name: 'Vedado', provinceId: 'hab' },
        { id: 'hab-5', name: 'Miramar', provinceId: 'hab' },
        // Matanzas
        { id: 'mat-1', name: 'Matanzas', provinceId: 'mat' },
        { id: 'mat-2', name: 'Varadero', provinceId: 'mat' },
        { id: 'mat-3', name: 'Cárdenas', provinceId: 'mat' },
        // Santiago de Cuba
        { id: 'scu-1', name: 'Santiago de Cuba', provinceId: 'scu' },
        { id: 'scu-2', name: 'Palma Soriano', provinceId: 'scu' }
        // Añadir más según sea necesario...
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

        // Buscar municipios de la provincia
        const municipalitiesInProvince = municipalities.filter(m => m.provinceId === province.id);
        const municipalityIndex = Math.floor(Math.random() * municipalitiesInProvince.length);
        const municipality = municipalitiesInProvince[municipalityIndex] || { id: 'unknown', name: 'Desconocido' };

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
                image: '',
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
            image: '',
            promoted: i <= 5, // Primeros 5 negocios son promocionados
            description: `${nombre} ofrece los mejores servicios de ${categories[categoryIndex].name.toLowerCase()} en ${municipality.name}, ${province.name}.`,
            latitude: latitude,
            longitude: longitude,
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            address: `Calle ${10 + Math.floor(Math.random() * 50)} #${Math.floor(Math.random() * 100)}, ${municipality.name}`,
            phone: `+53 ${5000 + Math.floor(Math.random() * 5000)}`,
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

    let filtered = db.businesses.filter(b =>
        (b.name.toLowerCase().includes(query.toLowerCase()) ||
            b.category.toLowerCase().includes(query.toLowerCase()) ||
            b.description.toLowerCase().includes(query.toLowerCase())) &&
        (!category || category === 'Todas' || b.category === category) &&
        (!rating || b.rating >= parseInt(rating))
    );

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