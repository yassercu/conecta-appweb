/**
 * Datos de ubicación geográfica para la aplicación
 * Incluye países (Cuba por defecto), provincias y municipios
 */

export interface Country {
    id: string;
    name: string;
    code: string;
}

export interface Province {
    id: string;
    name: string;
    countryId: string;
}

export interface Municipality {
    id: string;
    name: string;
    provinceId: string;
}

// Lista de países disponibles (Cuba como predeterminado)
export const countries: Country[] = [
    { id: "cu", name: "Cuba", code: "CU" },
    { id: "es", name: "España", code: "ES" },
    { id: "mx", name: "México", code: "MX" },
    { id: "us", name: "Estados Unidos", code: "US" }
];

// Provincias de Cuba
export const provinces: Province[] = [
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

// Municipios de Cuba por provincia (completa para La Habana)
export const municipalities: Municipality[] = [
    // Pinar del Río
    { id: "pinar", name: "Pinar del Río", provinceId: "pinar" },
    { id: "viñales", name: "Viñales", provinceId: "pinar" },
    { id: "san-juan-martinez", name: "San Juan y Martínez", provinceId: "pinar" },
    { id: "san-luis-pinar", name: "San Luis", provinceId: "pinar" },
    { id: "guane", name: "Guane", provinceId: "pinar" },
    { id: "consolacion", name: "Consolación del Sur", provinceId: "pinar" },
    { id: "la-palmas", name: "La Palma", provinceId: "pinar" },
    { id: "los-palacios", name: "Los Palacios", provinceId: "pinar" },
    { id: "mantua", name: "Mantua", provinceId: "pinar" },
    { id: "minas-san-juan", name: "Minas de Matahambre", provinceId: "pinar" },
    { id: "san-carlos", name: "San Carlos", provinceId: "pinar" },
    // Artemisa
    { id: "artemisa", name: "Artemisa", provinceId: "artemisa" },
    { id: "bauta", name: "Bauta", provinceId: "artemisa" },
    { id: "bahia-honda", name: "Bahía Honda", provinceId: "artemisa" },
    { id: "candelaria", name: "Candelaria", provinceId: "artemisa" },
    { id: "guanajay", name: "Guanajay", provinceId: "artemisa" },
    { id: "güira", name: "Güira de Melena", provinceId: "artemisa" },
    { id: "mariel", name: "Mariel", provinceId: "artemisa" },
    { id: "san-antonio", name: "San Antonio de los Baños", provinceId: "artemisa" },
    { id: "san-cristobal", name: "San Cristóbal", provinceId: "artemisa" },
    // La Habana
    { id: "plaza", name: "Plaza de la Revolución", provinceId: "habana" },
    { id: "centro-habana", name: "Centro Habana", provinceId: "habana" },
    { id: "habana-vieja", name: "Habana Vieja", provinceId: "habana" },
    { id: "regla", name: "Regla", provinceId: "habana" },
    { id: "habana-este", name: "Habana del Este", provinceId: "habana" },
    { id: "guanabacoa", name: "Guanabacoa", provinceId: "habana" },
    { id: "san-miguel", name: "San Miguel del Padrón", provinceId: "habana" },
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
    { id: "melena", name: "Melena del Sur", provinceId: "mayabeque" },
    { id: "nueva-paz", name: "Nueva Paz", provinceId: "mayabeque" },
    { id: "quivicán", name: "Quivicán", provinceId: "mayabeque" },
    { id: "san-josé", name: "San José de las Lajas", provinceId: "mayabeque" },
    { id: "san-nicolás", name: "San Nicolás de Bari", provinceId: "mayabeque" },
    // Matanzas
    { id: "matanzas-city", name: "Matanzas", provinceId: "matanzas" },
    { id: "cardenas", name: "Cárdenas", provinceId: "matanzas" },
    { id: "varadero", name: "Varadero", provinceId: "matanzas" },
    { id: "colon", name: "Colón", provinceId: "matanzas" },
    { id: "jovellanos", name: "Jovellanos", provinceId: "matanzas" },
    { id: "jaguey", name: "Jagüey Grande", provinceId: "matanzas" },
    { id: "marti", name: "Martí", provinceId: "matanzas" },
    { id: "limonar", name: "Limonar", provinceId: "matanzas" },
    { id: "perico", name: "Perico", provinceId: "matanzas" },
    { id: "union-reyes", name: "Unión de Reyes", provinceId: "matanzas" },
    { id: "pedro-betancourt", name: "Pedro Betancourt", provinceId: "matanzas" },
    // Cienfuegos
    { id: "cienfuegos", name: "Cienfuegos", provinceId: "cienfuegos" },
    { id: "abreu", name: "Abreus", provinceId: "cienfuegos" },
    { id: "aguada", name: "Aguada de Pasajeros", provinceId: "cienfuegos" },
    { id: "cruces", name: "Cruces", provinceId: "cienfuegos" },
    { id: "lajas", name: "Lajas", provinceId: "cienfuegos" },
    { id: "palmira", name: "Palmira", provinceId: "cienfuegos" },
    { id: "rodao", name: "Rodas", provinceId: "cienfuegos" },
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
    { id: "quemado", name: "Quemado de Güines", provinceId: "villa-clara" },
    { id: "remedios", name: "Remedios", provinceId: "villa-clara" },
    { id: "sagua", name: "Sagua la Grande", provinceId: "villa-clara" },
    // Sancti Spíritus
    { id: "sancti-spiritus", name: "Sancti Spíritus", provinceId: "sancti-spiritus" },
    { id: "taguasco", name: "Taguasco", provinceId: "sancti-spiritus" },
    { id: "jiguaní", name: "Jiguaní", provinceId: "sancti-spiritus" },
    { id: "trinidad", name: "Trinidad", provinceId: "sancti-spiritus" },
    { id: "yaguajay", name: "Yaguajay", provinceId: "sancti-spiritus" },
    { id: "fomento", name: "Fomento", provinceId: "sancti-spiritus" },
    { id: "cabaiguan", name: "Cabaiguán", provinceId: "sancti-spiritus" },
    { id: "la-sierpe", name: "La Sierpe", provinceId: "sancti-spiritus" },
    // Ciego de Ávila
    { id: "ciego-avila", name: "Ciego de Ávila", provinceId: "ciego-avila" },
    { id: "moron", name: "Morón", provinceId: "ciego-avila" },
    { id: "chambas", name: "Chambas", provinceId: "ciego-avila" },
    { id: "florencia", name: "Florencia", provinceId: "ciego-avila" },
    { id: "majagua", name: "Majagua", provinceId: "ciego-avila" },
    { id: "primero-enero", name: "Primero de Enero", provinceId: "ciego-avila" },
    { id: "bolivia", name: "Bolivia", provinceId: "ciego-avila" },
    { id: "baragua", name: "Baraguá", provinceId: "ciego-avila" },
    // Camagüey
    { id: "camaguey", name: "Camagüey", provinceId: "camaguey" },
    { id: "florida-cmg", name: "Florida", provinceId: "camaguey" },
    { id: "nuevitas", name: "Nuevitas", provinceId: "camaguey" },
    { id: "sibanicu", name: "Sibanicú", provinceId: "camaguey" },
    { id: "minas", name: "Minas", provinceId: "camaguey" },
    { id: "guáimaro", name: "Guáimaro", provinceId: "camaguey" },
    { id: "vertientes", name: "Vertientes", provinceId: "camaguey" },
    { id: "jimaguayú", name: "Jimaguayú", provinceId: "camaguey" },
    { id: "santa-cruz", name: "Santa Cruz del Sur", provinceId: "camaguey" },
    { id: "esmeralda", name: "Esmeralda", provinceId: "camaguey" },
    // Las Tunas
    { id: "las-tunas", name: "Las Tunas", provinceId: "las-tunas" },
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
    { id: "bartolome-masó", name: "Bartolomé Masó", provinceId: "granma" },
    { id: "buey-arriba", name: "Buey Arriba", provinceId: "granma" },
    { id: "cauto-cristo", name: "Cauto Cristo", provinceId: "granma" },
    { id: "guisa", name: "Guisa", provinceId: "granma" },
    { id: "jiguaní-granma", name: "Jiguaní", provinceId: "granma" },
    { id: "media-luna", name: "Media Luna", provinceId: "granma" },
    { id: "niquero", name: "Niquero", provinceId: "granma" },
    { id: "pilón", name: "Pilón", provinceId: "granma" },
    { id: "rio-cauto", name: "Río Cauto", provinceId: "granma" },
    // Holguín
    { id: "holguin-city", name: "Holguín", provinceId: "holguin" },
    { id: "banes", name: "Banes", provinceId: "holguin" },
    { id: "antilla", name: "Antilla", provinceId: "holguin" },
    { id: "rafael-freyre", name: "Rafael Freyre", provinceId: "holguin" },
    { id: "gibara", name: "Gibara", provinceId: "holguin" },
    { id: "báguanos", name: "Báguanos", provinceId: "holguin" },
    { id: "calixto-garcia", name: "Calixto García", provinceId: "holguin" },
    { id: "cueto", name: "Cueto", provinceId: "holguin" },
    { id: "frank-país", name: "Frank País", provinceId: "holguin" },
    { id: "mayarí", name: "Mayarí", provinceId: "holguin" },
    { id: "moa", name: "Moa", provinceId: "holguin" },
    { id: "sagua-grande", name: "Sagua de Tánamo", provinceId: "holguin" },
    { id: "urbano-noriega", name: "Urbano Noriega", provinceId: "holguin" },
    // Santiago de Cuba
    { id: "santiago", name: "Santiago de Cuba", provinceId: "santiago" },
    { id: "palma-soriano", name: "Palma Soriano", provinceId: "santiago" },
    { id: "contramaestre", name: "Contramaestre", provinceId: "santiago" },
    { id: "mella", name: "Mella", provinceId: "santiago" },
    { id: "san-luis", name: "San Luis", provinceId: "santiago" },
    { id: "songo-la-maya", name: "Songo-La Maya", provinceId: "santiago" },
    { id: "segunda-frente", name: "Segundo Frente", provinceId: "santiago" },
    { id: "tercer-frente", name: "Tercer Frente", provinceId: "santiago" },
    { id: "julio-antonio-mella", name: "Julio Antonio Mella", provinceId: "santiago" },
    { id: "guamá", name: "Guamá", provinceId: "santiago" },
    // Guantánamo
    { id: "guantanamo", name: "Guantánamo", provinceId: "guantanamo" },
    { id: "baracoa", name: "Baracoa", provinceId: "guantanamo" },
    { id: "caimanera", name: "Caimanera", provinceId: "guantanamo" },
    { id: "el-salvador", name: "El Salvador", provinceId: "guantanamo" },
    { id: "imias", name: "Imías", provinceId: "guantanamo" },
    { id: "maisí", name: "Maisí", provinceId: "guantanamo" },
    { id: "manuel-tames", name: "Manuel Tames", provinceId: "guantanamo" },
    { id: "niceto-perez", name: "Niceto Pérez", provinceId: "guantanamo" },
    { id: "san-antonio-del-sur", name: "San Antonio del Sur", provinceId: "guantanamo" },
    { id: "yateras", name: "Yateras", provinceId: "guantanamo" },
    // Isla de la Juventud
    { id: "isla", name: "Isla de la Juventud", provinceId: "isla" }
];

// Funciones de ayuda

// Obtener país por ID
export function getCountryById(id: string): Country | undefined {
    return countries.find(country => country.id === id);
}

// Obtener provincias por país
export function getProvincesByCountry(countryId: string): Province[] {
    return provinces.filter(province => province.countryId === countryId);
}

// Obtener municipios por provincia
export function getMunicipalitiesByProvince(provinceId: string): Municipality[] {
    return municipalities.filter(municipality => municipality.provinceId === provinceId);
}