"use client";

import type React from "react";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Github, User } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  githubProvider,
  googleProvider,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "../../firebase";

export default function Page() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}

function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const context = useAuth();
  useEffect(() => {
    if (context.user) {
      const user = {
        firebaseid: context.user.uid,
        displayName: context.user.displayName,
        email: context.user.email,
        photo: context.user.photoURL,
        isAnonymous: context.user.isAnonymous,
        idToken: context.userToken,
      };
      const response = axios.post(
        `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/users/auth`,
        user
      );
      console.log(context.user, response);
      setUser(context.user && !context.loading);
      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    }
  }, [setUser, user, context.loading]);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      context.setUserToken(token);
      setUser(result.user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub Sign-In
  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setUser(result.user);
      const token = await result.user.getIdToken();
      context.setUserToken(token);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Anonymous Sign-In
  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInAnonymously(auth);
      setUser(result.user);
      const token = await result.user.getIdToken();
      context.setUserToken(token);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign-Up
  const handleEmailSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await result.user.getIdToken();
      context.setUserToken(token);
      setUser(result.user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign-In
  const handleEmailSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      context.setUserToken(token);
      setUser(result.user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      context.setUserToken("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      handleEmailSignUp();
    } else {
      handleEmailSignIn();
    }
  };

  if (context.loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <div>Loading...</div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1
          className="text-2xl font-bold mb-8 text-center"
          style={{ color: "var(--primary)" }}
        >
          {user ? "Account" : isSignUp ? "Sign up" : "Sign in"}
        </h1>

        {user ? (
          <div className="p-6 border border-solid border-gray-200 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100 flex items-center justify-center">
              {user.photoURL ? (
                <Image
                  src={user.photoURL || "/placeholder.svg"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} style={{ color: "var(--primary)" }} />
              )}
            </div>
            <h2 className="text-lg font-bold mb-1">
              {user.displayName || "Anonymous User"}
            </h2>
            <p className="text-sm mb-6 text-gray-500">
              {user.email || "No email address"}
            </p>
            <button
              onClick={handleSignOut}
              className="btn w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                "Sign Out"
              )}
            </button>
          </div>
        ) : (
          <div className="p-6 border border-solid border-gray-200">
            <div className="grid gap-4 mb-6">
              <button
                onClick={handleGoogleSignIn}
                className="btn flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-white">
                      {isSignUp ? "Sign up" : "Sign in"} with Google
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={handleGithubSignIn}
                className="btn flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <Github size={18} className="text-white" />
                    <span className="text-white">
                      {isSignUp ? "Sign up" : "Sign in"} with GitHub
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={handleAnonymousSignIn}
                className="btn flex items-center justify-center gap-2"
                style={{ opacity: 0.8 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <User size={18} className="text-white" />
                    <span className="text-white">Continue as Guest</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-black">
                <span className="bg-white px-2 text-sm text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />

              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="btn-text text-sm"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Need an account? Sign Up"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-2 border border-red-300 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
