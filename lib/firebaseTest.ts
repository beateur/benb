// Test de connectivité Firebase
import { db } from '@/src/firebase';
import { addDoc, collection } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔄 Test de connexion Firebase...');
    
    // Test de création d'un document dans la collection 'test'
    const testRef = collection(db, 'test');
    const testDoc = await addDoc(testRef, { 
      test: true, 
      timestamp: new Date(),
      message: 'Test de connectivité Firebase'
    });
    
    console.log('✅ Firebase connecté avec succès! Document test créé:', testDoc.id);
    return { success: true, docId: testDoc.id };
  } catch (error: any) {
    console.error('❌ Erreur de connexion Firebase:', error);
    return { success: false, error: error?.message || 'Erreur inconnue' };
  }
};
