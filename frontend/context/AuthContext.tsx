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
  userId: string | null;
  username: string | null;
  needsUsername: boolean;
  updateUsername: (username: string | null) => Promise<void>;
}>({
  user: null,
  loading: true, // Default loading state
  userToken: null,
  saveToken: (_token: string) => {},
  logOut: () => {},
  postLogin: (_user: any) => {},
  userId: null,
  username: null,
  needsUsername: false,
  updateUsername: async (_username: string | null) => {},
});

export interface UserInterface {
  firebaseId: string;
  displayName: string;
  email?: string | null;
  photo?: string | null;
  isAnonymous?: boolean | null;
  idToken: unknown;
}

const TOKEN = "fb-rant-access";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userid, setUserid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const [userToken, setUserToken] = useState<string | null>(null);
  const router = useRouter();


  const saveToken = (token: string): void => {
    setUserToken(token);
    localStorage.setItem(TOKEN, token);
  } 

  const logOut = async (): Promise<void> => {
    localStorage.removeItem(TOKEN);
    await signOut(auth);
    console.log('bye buddy')
    router.push('/')
  }

  
  const postLogin = async function(user: UserInterface): Promise<void> {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/users/auth`,
        user
      );
      setUserid(response.data.user.u_id);
      setUsername(response.data.user.username || null);
      setNeedsUsername(Boolean(response.data.needsUsername));
      saveToken(response.data.token);
  }

  const updateUsername = async (newUsername: string | null): Promise<void> => {
    if (!userToken || !user) {
      throw new Error("You must be signed in to set a username");
    }
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/users/username`,
      { username: newUsername },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    setUsername(response.data.username || null);
    setNeedsUsername(false);
  };

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
          
          await postLogin({
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
          setUserid(null);
          setUsername(null);
          setNeedsUsername(false);
          setUserToken(null);
        }
        setLoading(false); 
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userToken,
        saveToken,
        logOut,
        postLogin,
        userId: userid,
        username,
        needsUsername,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
