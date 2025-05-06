/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Coordinates {
    /**
     * The latitude of the location.
     */
    latitude: number;
    /**
     * The longitude of the location.
     */
    longitude: number;
}

/**
 * Represents a business location with detailed address information.
 */
export interface BusinessLocation {
    /**
     * The province where the business is located.
     */
    province: string;
    /**
     * The municipality where the business is located.
     */
    municipality: string;
    /**
     * The exact street address of the business.
     */
    address: string;
}

/**
 * Retrieves the coordinates of a business location.
 *
 * @param location The business location to geocode.
 * @returns A promise that resolves to a Coordinates object containing the latitude and longitude of the location, or null if geocoding fails.
 */
export async function getCoordinates(location: BusinessLocation): Promise<Coordinates | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // TODO: Implement this by calling a real geocoding API (e.g., OpenStreetMap Nominatim, Mapbox, Google Geocoding API).
    // Handle potential errors from the API.

    // Basic mock implementation: Return coordinates if address seems valid, otherwise null.
    if (location.province && location.municipality && location.address && location.address.length > 3) {
        // Generate slightly randomized coordinates around a central point for mock purposes
        return {
            latitude: 18.2208 + (Math.random() - 0.5) * 0.1,
            longitude: -66.5901 + (Math.random() - 0.5) * 0.1,
        };
    } else {
        return null; // Indicate failure
    }
}

/**
 * Retrieves the list of businesses nearby a given set of coordinates.
 *
 * @param coordinates The coordinates of the current location.
 * @param radius Optional radius in kilometers (default could be 5km).
 * @returns A promise that resolves to an array of nearby business objects (or just names for simplicity).
 */
export async function getNearbyBusinesses(coordinates: Coordinates, radius: number = 5): Promise<string[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // TODO: Implement this by calling your backend API, which queries your database
    // for businesses within the specified radius of the given coordinates.

    // Mock implementation (Spanish)
    return [
        'Cafetería Cercana',
        'Librería Local',
        'Pizzería a la vuelta',
        'Tienda de Conveniencia'
    ];
}

export async function geocodeLocation(location: string): Promise<Coordinates | null> {
    // Simulamos la geocodificación de una dirección a coordenadas
    // En un caso real, usaríamos un servicio como Google Maps Geocoding API
    // TODO: Implementar con API de geocodificación real
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock implementation
    // Coordenadas para ubicaciones comunes en Cuba y Puerto Rico
    const mockLocations: Record<string, Coordinates> = {
        'havana': { lat: 23.1136, lng: -82.3666 },
        'habana': { lat: 23.1136, lng: -82.3666 },
        'la habana': { lat: 23.1136, lng: -82.3666 },
        'santiago': { lat: 20.0247, lng: -75.8219 },
        'santiago de cuba': { lat: 20.0247, lng: -75.8219 },
        'trinidad': { lat: 21.8033, lng: -79.9808 },
        'varadero': { lat: 23.1545, lng: -81.2458 },
        'san juan': { lat: 18.4655, lng: -66.1057 },
        'ponce': { lat: 18.0108, lng: -66.6138 },
        'mayagüez': { lat: 18.2011, lng: -67.1397 },
        'mayaguez': { lat: 18.2011, lng: -67.1397 },
        'cuba': { lat: 21.5218, lng: -77.7812 },
        'puerto rico': { lat: 18.2208, lng: -66.5901 },
    };

    // Normalizar la consulta
    const normalizedQuery = location.toLowerCase().trim();

    // Buscar coincidencias exactas primero
    if (mockLocations[normalizedQuery]) {
        return mockLocations[normalizedQuery];
    }

    // Buscar coincidencias parciales
    for (const [key, coords] of Object.entries(mockLocations)) {
        if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
            return coords;
        }
    }

    // Si no hay coincidencias, devolver null
    return null;
}
