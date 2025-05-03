// src/types/business.ts

export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string; // Neighborhood/Area
  image: string;
  dataAiHint?: string; // Optional hint for image generation/search
  promoted: boolean; // Flag for promoted businesses
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  email?: string;
}
