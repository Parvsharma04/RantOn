"use client";

import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, signOut } from "../firebase";

export default function Navbar() {
  const router = useRouter();
  const user = useAuth().user;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <Link
        href="/"
        className="text-xl font-bold"
        style={{ color: "var(--primary)" }}
      >
        RantOn
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL || "/placeholder.svg"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} style={{ color: "var(--primary)" }} />
              )}
            </Link>
            <button onClick={handleSignOut} className="btn-text">
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth" className="btn-text">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
