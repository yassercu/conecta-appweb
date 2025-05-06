// src/types/business.ts
import type { Product } from '@/components/business/ProductCard';
import type { Review } from '@/components/business/ReviewCard';

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
  totalReviews: number;
  products?: Product[];
  reviews?: Review[];
}
