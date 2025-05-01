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
    console.log('Geocodificando ubicación:', location);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // TODO: Implement this by calling a real geocoding API (e.g., OpenStreetMap Nominatim, Mapbox, Google Geocoding API).
    // Handle potential errors from the API.

    // Basic mock implementation: Return coordinates if address seems valid, otherwise null.
    if (location.province && location.municipality && location.address && location.address.length > 3) {
         // Generate slightly randomized coordinates around a central point for mock purposes
        return {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        };
    } else {
        console.warn('Geocodificación fallida: Dirección incompleta proporcionada.');
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
    console.log(`Buscando negocios cercanos dentro de ${radius}km de:`, coordinates);
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
