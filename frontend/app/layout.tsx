import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
})

export const metadata = {
  title: "Minimalist Discussions",
  description: "A simple discussions platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={robotoMono.className}>{children}</body>
    </html>
  )
}



import './globals.css'