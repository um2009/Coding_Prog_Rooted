// Type definitions for the Rooted app

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  image_url: string;
  district?: string;
  description?: string;
  avg_price?: number;
  hours?: string;
  map_coordinate?: { x: number; y: number };
  average_rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
  user_name: string;
  user_avatar?: string;
}

export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  code?: string;
  expiry_date: string;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

// UI Types
export type ViewMode = 'list' | 'map';
export type SortOption = 'default' | 'rating' | 'reviews' | 'deals';

// Main category types - exactly 8 categories
export type Category = 
  | 'Food'
  | 'Retail'
  | 'Health'
  | 'Entertainment'
  | 'Personal Care'
  | 'Services'
  | 'Home'
  | 'Other';

// Price range type - now represents price brackets
export type PriceRange = '0-10' | '10-20' | '20-35' | '35+';