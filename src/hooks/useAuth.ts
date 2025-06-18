'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from '@/src/firebase';
import { auth } from '@/src/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    console.log("ça boucle 29")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setAuthState({
            user,
            loading: false,
            isAdmin: !!idTokenResult.claims.admin,
          });
        } catch (error) {
          console.error('Error getting token:', error);
          setAuthState({
            user,
            loading: false,
            isAdmin: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAdmin: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...authState,
    logout,
  };
};