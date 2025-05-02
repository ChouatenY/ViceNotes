"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, User } from "./firebase-config";

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  switchUser: (newUser: User) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  switchUser: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to switch to a different user
  const switchUser = (newUser: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vice_notes_user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User state:", user ? `User: ${user.id}` : "No user");
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    switchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
