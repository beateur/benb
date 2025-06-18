// Types TypeScript pour les collections Firestore

export interface Property {
  id: string;
  name: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio';
  status: 'active' | 'inactive' | 'maintenance';
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // en m²
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  videos?: string[]; // Ajout support vidéos
  mediaType?: 'image' | 'video'; // Type de média pour background Hero
  rules: string[];
  checkInTime: string;
  checkOutTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface PropertyAmenity {
  id: string;
  name: string;
  icon: string;
  category: 'essential' | 'comfort' | 'safety' | 'entertainment';
}

export interface Reservation {
  id: string;
  propertyId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalNights: number;
  pricePerNight: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityMonth {
  id: string; // Format: YYYYMM (ex: 202401)
  year: number;
  month: number;
  propertyId: string;
}

export interface AvailabilityDay {
  id: string; // Format: YYYY-MM-DD (ex: 2024-01-15)
  date: Date;
  propertyId: string;
  isAvailable: boolean;
  price?: number; // Prix spécifique pour ce jour (optionnel)
  minStay?: number; // Séjour minimum pour ce jour (optionnel)
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'maintenance' | 'blocked' | 'special_rate' | 'minimum_stay';
  propertyId?: string; // Optionnel si l'événement concerne toutes les propriétés
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  metadata?: {
    specialRate?: number;
    minimumStay?: number;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'guest' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    nationality?: string;
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  category: 'general' | 'booking' | 'payment' | 'notifications';
  key: string;
  value: any;
  description?: string;
  updatedAt: Date;
}

// Types pour les requêtes et filtres
export interface PropertyFilters {
  type?: Property['type'];
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  amenities?: string[];
  city?: string;
  checkIn?: Date;
  checkOut?: Date;
}

export interface ReservationFilters {
  propertyId?: string;
  userId?: string;
  status?: Reservation['status'];
  startDate?: Date;
  endDate?: Date;
}