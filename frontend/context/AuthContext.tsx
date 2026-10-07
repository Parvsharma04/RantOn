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
import { auth, signOut } from "../firebase"; // Import existing auth instance
import { useRouter } from "next/navigation";
import axios from "axios";

const AuthContext = createContext<{
  user: FirebaseUser | null;
  loading: boolean;
  userToken: string | null;
  saveToken: (token: string) => void;
  logOut: () => void;
  postLogin: (user: any) => void;
}>({
  user: null,
  loading: true, // Default loading state
  userToken: null,
  saveToken: (_token: string) => {},
  logOut: () => {},
  postLogin: (_user: any) => {},
});

export interface UserInterface {
  firebaseId: string;
  displayName: string;
  email?: string | null;
  photo?: string | null;
  isAnonymous?: boolean | null;
  idToken: unknown;
}

const TOKEN="fb-rant-access";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [userToken, setUserToken] = useState<string | null>(null);
  const router = useRouter();


  const saveToken = (token: string): void => {
    setUserToken(token);
    localStorage.setItem(TOKEN, token);

    //checking
    console.log("this yo token bitch: ", localStorage.getItem(TOKEN));
  } 

  const logOut = async (): Promise<void> => {
    localStorage.removeItem(TOKEN);
    await signOut(auth);
    console.log('bye buddy')
    router.push('/')
  }

  
  const postLogin = async function(user: UserInterface) {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/users/auth`,
        user
      );  
      console.log(response.data);
      saveToken(response.data.token);
  }

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
          
          postLogin({
            firebaseId: transformedUser.uid,
            displayName: transformedUser.displayName,
            email: transformedUser.email,
            photo: transformedUser.photoURL,
            isAnonymous: transformedUser.isAnonymous,
            idToken: await firebaseUser.getIdToken(),
          })
          setUser(transformedUser);
        } else {
          setUser(null);
        }
        setLoading(false); 
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userToken, saveToken, logOut, postLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
