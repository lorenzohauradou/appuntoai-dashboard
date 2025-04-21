import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Appuntoai - Trasforma audio, video e testo in appunti strutturati con AI",
  description: "Appuntoai utilizza l'intelligenza artificiale per convertire automaticamente riunioni, lezioni e interviste in appunti strutturati, riassunti chiari e task organizzati. Risparmia tempo e aumenta la produttività.",
  keywords: "AI, appunti automatici, trascrizione, riassunti, intelligenza artificiale, produttività",
  openGraph: {
    title: "Appuntoai - Appunti strutturati con AI",
    description: "Trasforma audio, video e testo in appunti strutturati con intelligenza artificiale",
    images: ['/og-image.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Appuntoai - Appunti strutturati con AI",
    description: "Trasforma audio, video e testo in appunti strutturati con AI",
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: "/appuntoai.ico",
    shortcut: "/appuntoai.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


import './globals.css'