import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { FloatingDashboardButton } from "@/components/ui/floating-dashboard-button"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL('https://appuntoai.com'),
  title: "Appuntoai - Trasforma audio, video e testo in appunti strutturati con AI",
  description: "Appuntoai utilizza l'intelligenza artificiale per convertire automaticamente riunioni, lezioni e interviste in appunti strutturati, riassunti chiari e task organizzati. Risparmia tempo e aumenta la produttività.",
  keywords: "AI, appunti automatici, trascrizione, riassunti, intelligenza artificiale, produttività",
  openGraph: {
    title: "Appuntoai - Appunti strutturati con AI",
    description: "Trasforma audio, video e testo in appunti strutturati con intelligenza artificiale",
    images: [
      {
        url: '/appuntoai_logo.png',
        alt: 'Logo Appuntoai - Analisi AI per meeting e lezioni',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Appuntoai - Appunti strutturati con AI",
    description: "Trasforma audio, video e testo in appunti strutturati con AI",
    images: [
      {
        url: '/appuntoai_logo.png',
        alt: 'Logo Appuntoai - Trasforma audio e video in appunti',
      }
    ],
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
    <html lang="it" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
          <FloatingDashboardButton /> 
        </Providers>
      </body>
    </html>
  )
}


import './globals.css'