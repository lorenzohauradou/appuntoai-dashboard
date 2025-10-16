import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/src/lib/utils"
import { Providers } from "@/src/components/providers"
import { Toaster } from "@/src/components/ui/sonner"
import { FloatingDashboardButton } from "@/src/components/ui/floating-dashboard-button"
import { Analytics } from "@vercel/analytics/react"
import { StructuredData } from "@/src/components/structured-data"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.appuntoai.com'),
  title: "AppuntoAI - Appunti Automatici con Intelligenza Artificiale",
  description: "Trasforma video lezioni in appunti strutturati con AI. Trascrizione automatica, riassunti intelligenti e quiz personalizzati. Prova gratis!",
  keywords: "AI appunti, trascrizione automatica, intelligenza artificiale studenti, riassunti AI, quiz interattivi, lezioni online, produttività studio",
  authors: [{ name: "AppuntoAI Team" }],
  creator: "AppuntoAI",
  publisher: "AppuntoAI",
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.appuntoai.com',
    languages: {
      'it-IT': 'https://www.appuntoai.com',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.appuntoai.com',
    siteName: 'AppuntoAI',
    title: "AppuntoAI - Appunti AI Automatici",
    description: "Trascrizioni e riassunti intelligenti con AI per studenti",
    images: [
      {
        url: 'https://www.appuntoai.com/appuntoai_logo.png',
        width: 1200,
        height: 630,
        alt: 'AppuntoAI - Appunti Automatici con Intelligenza Artificiale',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AppuntoAI - Trasforma Lezioni in Appunti Strutturati con AI",
    description: "Trascrizione automatica, riassunti intelligenti, quiz personalizzati e chat con i tuoi documenti. Studiare non è mai stato così facile. Prova gratis la potenza dell'intelligenza artificiale per lo studio!",
    images: ['https://www.appuntoai.com/appuntoai_logo.png'],
    creator: '@appuntoai',
    site: '@appuntoai',
  },
  icons: {
    icon: "/appuntoai.ico",
    shortcut: "/appuntoai.ico",
    apple: "/appuntoai_logo.png",
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
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
        <Analytics />
      </body>
    </html>
  )
}