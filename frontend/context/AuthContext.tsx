"use client";

import { FirebaseUser } from "@/lib/utils";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../firebase"; // Import existing auth instance

const AuthContext = createContext<{
  user: FirebaseUser | null;
  loading: boolean;
}>({
  user: null,
  loading: true, // Default loading state
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const transformedUser: FirebaseUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName || "",
            isAnonymous: firebaseUser.isAnonymous,
            photoURL: firebaseUser.photoURL || "",
            providerData: firebaseUser.providerData.map((provider) => ({
              providerId: provider.providerId,
              uid: provider.uid,
              displayName: provider.displayName || "",
              email: provider.email || "",
              phoneNumber: provider.phoneNumber || null,
              photoURL: provider.photoURL || "",
            })),
            createdAt: firebaseUser.metadata.creationTime || "",
            lastLoginAt: firebaseUser.metadata.lastSignInTime || "",
            stsTokenManager: {
              accessToken: "",
              expirationTime: 0,
              refreshToken: "",
            },
            apiKey: "",
            appName: "",
          };

          setUser(transformedUser);
        } else {
          setUser(null);
        }
        setLoading(false); // ✅ Set loading to false after user is set
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
