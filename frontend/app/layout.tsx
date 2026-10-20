import { Roboto_Mono } from "next/font/google";
import type React from "react";
import Navbar from "../components/Navbar";
import PWARegistration from "../components/PWARegistration";
import { AuthProvider } from "../context/AuthContext";
import { RantProvider } from "../context/RantContext";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  title: "RantOn - Rant Away 😩",
  description: "Rant away on RantOn with your silliest thoughts.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "RantOn",
    statusBarStyle: "default" as const,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={robotoMono.className}>
        <PWARegistration />
        <AuthProvider>
          <RantProvider>
            <Navbar />
            {children}
          </RantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
