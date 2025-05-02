// src/types/business.ts

export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string; // Neighborhood/Area
  address: string; // Full address
  phone: string;
  email: string;
  description: string;
  image: string;
  promoted: boolean; // Flag for promoted businesses
  dataAiHint?: string; // Optional hint for image generation/search
  latitude: number;
  longitude: number;
}
