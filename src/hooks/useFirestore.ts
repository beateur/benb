'use client';

import { useState, useEffect } from 'react';
import { 
  getProperties, 
  getProperty, 
  getReservations, 
  getAvailability,
  getEvents
} from '@/src/lib/firestore';
import type { 
  Property, 
  Reservation, 
  AvailabilityDay, 
  Event,
  PropertyFilters,
  ReservationFilters 
} from '@/src/types/firestore';

// Hook pour récupérer les propriétés
export const useProperties = (filters?: PropertyFilters) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties(filters);
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ça boucle 23")
    fetchProperties();
  }, [JSON.stringify(filters)]);

  return { properties, loading, error, refetch: fetchProperties };
};

// Hook pour récupérer une propriété spécifique
export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ça boucle 24")
    if (!id) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getProperty(id);
        setProperty(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Propriété non trouvée');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return { property, loading, error };
};

// Hook pour récupérer les réservations
export const useReservations = (filters?: ReservationFilters) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getReservations(filters);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ça boucle 25")
    fetchReservations();
  }, [JSON.stringify(filters)]);

  return { reservations, loading, error, refetch: fetchReservations };
};

// Hook pour récupérer la disponibilité
export const useAvailability = (propertyId: string, yearMonth: string) => {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ça boucle 26")
    if (!propertyId || !yearMonth) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const data = await getAvailability(propertyId, yearMonth);
        setAvailability(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [propertyId, yearMonth]);

  return { availability, loading, error };
};

// Hook pour récupérer les événements
export const useEvents = (propertyId?: string, startDate?: Date, endDate?: Date) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("ça boucle 27")
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents(propertyId, startDate, endDate);
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [propertyId, startDate?.toISOString(), endDate?.toISOString()]);

  return { events, loading, error };
};