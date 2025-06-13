import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/src/firebase';
import type { 
  Property, 
  Reservation, 
  AvailabilityDay, 
  Event, 
  User,
  PropertyFilters,
  ReservationFilters 
} from '@/src/types/firestore';

// Collections references
export const propertiesRef = collection(db, 'properties');
export const reservationsRef = collection(db, 'reservations');
export const availabilityRef = collection(db, 'availability');
export const eventsRef = collection(db, 'events');
export const usersRef = collection(db, 'users');
export const settingsRef = collection(db, 'settings');

// Helper function to convert Firestore timestamps
const convertTimestamps = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Helper function to check if Firebase is available
const isFirebaseAvailable = async (): Promise<boolean> => {
  try {
    // Try a simple operation with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firebase timeout')), 3000)
    );
    
    const testPromise = getDoc(doc(db, 'test', 'connection'));
    await Promise.race([testPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.warn('Firebase is not available:', error);
    return false;
  }
};

// Properties CRUD operations
export const getProperties = async (filters?: PropertyFilters) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    let q = query(propertiesRef, where('status', '==', 'active'));
    
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters?.maxGuests) {
      q = query(q, where('maxGuests', '>=', filters.maxGuests));
    }
    
    if (filters?.city) {
      q = query(q, where('location.city', '==', filters.city));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Property[];
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

export const getProperty = async (id: string) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    const docRef = doc(propertiesRef, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Property not found');
    }
    
    return {
      id: snapshot.id,
      ...convertTimestamps(snapshot.data())
    } as Property;
  } catch (error) {
    console.error('Error getting property:', error);
    throw error;
  }
};

// Reservations CRUD operations
export const getReservations = async (filters?: ReservationFilters) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    let q = query(reservationsRef);
    
    if (filters?.propertyId) {
      q = query(q, where('propertyId', '==', filters.propertyId));
    }
    
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('checkInDate', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Reservation[];
  } catch (error) {
    console.error('Error getting reservations:', error);
    throw error;
  }
};

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline - cannot create reservation');
    }

    const now = new Date();
    const docRef = await addDoc(reservationsRef, {
      ...reservation,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// Availability operations
export const getAvailability = async (propertyId: string, yearMonth: string) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    const monthRef = doc(availabilityRef, yearMonth);
    const daysRef = collection(monthRef, 'days');
    const q = query(
      daysRef, 
      where('propertyId', '==', propertyId),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as AvailabilityDay[];
  } catch (error) {
    console.error('Error getting availability:', error);
    throw error;
  }
};

export const updateAvailability = async (
  yearMonth: string, 
  dayId: string, 
  updates: Partial<AvailabilityDay>
) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline - cannot update availability');
    }

    const monthRef = doc(availabilityRef, yearMonth);
    const dayRef = doc(collection(monthRef, 'days'), dayId);
    
    await updateDoc(dayRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};

// Events operations
export const getEvents = async (propertyId?: string, startDate?: Date, endDate?: Date) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    let q = query(eventsRef);
    
    if (propertyId) {
      q = query(q, where('propertyId', '==', propertyId));
    }
    
    if (startDate) {
      q = query(q, where('startDate', '>=', Timestamp.fromDate(startDate)));
    }
    
    if (endDate) {
      q = query(q, where('endDate', '<=', Timestamp.fromDate(endDate)));
    }
    
    q = query(q, orderBy('startDate', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Event[];
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// User operations
export const getUser = async (userId: string) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline');
    }

    const docRef = doc(usersRef, userId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...convertTimestamps(snapshot.data())
    } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUser = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      throw new Error('Firebase is offline - cannot create user');
    }

    const now = new Date();
    const docRef = doc(usersRef, userId);
    
    await updateDoc(docRef, {
      ...userData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Utility functions
export const generateAvailabilityId = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

export const generateMonthId = (year: number, month: number): string => {
  return `${year}${month.toString().padStart(2, '0')}`; // Format: YYYYMM
};

export const isDateAvailable = async (propertyId: string, date: Date): Promise<boolean> => {
  try {
    const isAvailable = await isFirebaseAvailable();
    if (!isAvailable) {
      return true; // Default to available when offline
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthId = generateMonthId(year, month);
    const dayId = generateAvailabilityId(date);
    
    const monthRef = doc(availabilityRef, monthId);
    const dayRef = doc(collection(monthRef, 'days'), dayId);
    const snapshot = await getDoc(dayRef);
    
    if (!snapshot.exists()) {
      return true; // Par défaut disponible si pas de données
    }
    
    const dayData = snapshot.data() as AvailabilityDay;
    return dayData.isAvailable;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};