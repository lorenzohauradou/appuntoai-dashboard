import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Appuntoai - Trasforma audio, video e testo in appunti strutturati",
  description:
    "Appuntoai utilizza l'intelligenza artificiale per trasformare le tue riunioni e lezioni in appunti strutturati, riassunti e task.",
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