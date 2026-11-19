'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/client';
import { UserRole, SupportedLocale } from '@rojgarmitra/shared';

interface AuthContextValue {
  user: User | null;
  userRole: UserRole | null;
  preferredLocale: SupportedLocale;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, role: UserRole, locale?: SupportedLocale) => Promise<void>;
  logOut: () => Promise<void>;
  setLocale: (locale: SupportedLocale) => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [preferredLocale, setPreferredLocale] = useState<SupportedLocale>('mr');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved local storage locale
    const savedLocale = localStorage.getItem('rojgarmitra_locale') as SupportedLocale;
    if (savedLocale && ['mr', 'hi', 'en'].includes(savedLocale)) {
      setPreferredLocale(savedLocale);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role as UserRole);
            if (data.preferredLocale) {
              setPreferredLocale(data.preferredLocale as SupportedLocale);
              localStorage.setItem('rojgarmitra_locale', data.preferredLocale);
            }
          }
        } catch (e) {
          console.error('Error fetching user document:', e);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setLocale = (locale: SupportedLocale) => {
    setPreferredLocale(locale);
    localStorage.setItem('rojgarmitra_locale', locale);
    if (user) {
      setDoc(doc(db, 'users', user.uid), { preferredLocale: locale }, { merge: true }).catch(console.error);
    }
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (
    email: string, 
    pass: string, 
    role: UserRole, 
    locale: SupportedLocale = preferredLocale
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const now = new Date().toISOString();
    
    // Create users/{uid} document with explicit role and locale
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role,
      preferredLocale: locale,
      createdAt: now,
      updatedAt: now,
    });

    setUserRole(role);
    setPreferredLocale(locale);
  };

  const logOut = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        preferredLocale,
        loading,
        signIn,
        signUp,
        logOut,
        setLocale,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
