import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";

export type UserRole = "Admin" | "Organiser" | "Artist";

export interface AuthUser extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get Firebase ID token
          let idToken: string | null = null;
          
          // Ensure getIdToken exists before calling
          if (typeof firebaseUser.getIdToken === 'function') {
            try {
              idToken = await firebaseUser.getIdToken();
            } catch (tokenErr) {
              console.error("Error getting ID token, retrying with auth.currentUser:", tokenErr);
              // Fallback: try with fresh auth.currentUser reference
              if (auth.currentUser) {
                idToken = await auth.currentUser.getIdToken();
              }
            }
          } else {
            console.warn('firebaseUser.getIdToken is not a function, using auth.currentUser');
            // Fallback: use auth.currentUser directly
            if (auth.currentUser) {
              idToken = await auth.currentUser.getIdToken();
            }
          }

          // Sync user to MongoDB and get role
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/sync-user`,
            {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified, // Pass current verification status
            },
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          const userRole = response.data.role as UserRole;
          setUser({
            ...firebaseUser,
            role: userRole,
          });
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Auth state update error:", err);
        setError(err instanceof Error ? err.message : "Auth error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
      throw err;
    }
  };

  const getIdToken = async (forceRefresh?: boolean): Promise<string | null> => {
    try {
      // Try user from context first
      if (user && typeof user.getIdToken === 'function') {
        return await user.getIdToken(forceRefresh);
      }
      
      // Fallback to auth.currentUser if user object doesn't have method
      if (auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
        return await auth.currentUser.getIdToken(forceRefresh);
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token retrieval failed");
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    role,
    loading,
    error,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
