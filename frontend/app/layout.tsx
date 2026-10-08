import { Roboto_Mono } from "next/font/google";
import type React from "react";
import Navbar from "../components/Navbar";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={robotoMono.className}>
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
