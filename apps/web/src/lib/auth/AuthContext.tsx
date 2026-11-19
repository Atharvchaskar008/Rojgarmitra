'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
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
  signInWithGoogle: (role?: UserRole) => Promise<User>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string, role?: UserRole) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

  const signInWithGoogle = async (role: UserRole = 'candidate'): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    const now = new Date().toISOString();

    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || '',
        photoURL: u.photoURL || '',
        role,
        preferredLocale,
        createdAt: now,
        updatedAt: now,
      });
      setUserRole(role);
    } else {
      const data = snap.data();
      if (data?.role) setUserRole(data.role as UserRole);
    }

    return u;
  };

  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    if (typeof window === 'undefined') {
      throw new Error('reCAPTCHA can only be initialized on the client');
    }
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // Invisible captcha solved
      },
    });
  };

  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult, 
    code: string, 
    role: UserRole = 'candidate'
  ): Promise<User> => {
    const result = await confirmationResult.confirm(code);
    const u = result.user;
    const now = new Date().toISOString();

    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        phoneNumber: u.phoneNumber || '',
        role,
        preferredLocale,
        createdAt: now,
        updatedAt: now,
      });
      setUserRole(role);
    } else {
      const data = snap.data();
      if (data?.role) setUserRole(data.role as UserRole);
    }

    return u;
  };

  const logOut = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        confirmPhoneOtp,
        logOut,
        resetPassword,
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
