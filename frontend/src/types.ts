export type Role = 'admin' | 'guest';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';
export type Difficulty = 'facil' | 'moderada' | 'dificil';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Cabin {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  galleryUrls: string[];
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  available?: boolean;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  details: string;
  cost: number;
  duration: string;
  difficulty: Difficulty;
  imageUrl: string;
  galleryUrls: string[];
  includes: string[];
}

export interface Reservation {
  id: string;
  cabinId: string;
  cabinName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  whatsappNumber: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface ReservationDetail extends Reservation {
  nights: number;
  total: number;
  cabin: { name: string; price: number; imageUrl: string };
}

export interface Review {
  id: string;
  cabinId: string;
  guestName: string;
  rating: number;
  comment: string;
  featured?: boolean;
  createdAt: string;
  cabin?: { name: string };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  sortOrder: number;
}

export interface HotelSettings {
  hotelName: string;
  whatsappNumber: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  heroImages: string[];
}

export interface BookedRange {
  start: string;
  end: string;
}
