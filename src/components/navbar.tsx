"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Menu, X } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const navigateToLogin = () => {
    router.push('/login')
    if (mobileMenuOpen) {
      toggleMobileMenu()
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    if (mobileMenuOpen) {
      toggleMobileMenu()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 12H23M9 16H19M9 20H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M24 19L26 21L22 25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold">Appuntoai</span>
          </Link>
        </div>

        <nav className="hidden md:flex md:gap-6">
          <Link
            href="#come-funziona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Come funziona
          </Link>
          <Link
            href="#casi-uso"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Casi d'uso
          </Link>
          <Link
            href="#prezzi"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Prezzi
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          {status === 'loading' && (
            <Button variant="ghost" disabled>Caricamento...</Button>
          )}
          {status === 'unauthenticated' && (
            <>
              <Button
                variant="ghost"
                className="text-sm font-medium"
                onClick={navigateToLogin}
              >
                Accedi
              </Button>
              <Link href="/dashboard">
                <Button className="bg-primary text-white hover:bg-primary/90">Prova Appuntoai</Button>
              </Link>
            </>
          )}
          {status === 'authenticated' && (
            <>
              <Button
                variant="ghost"
                className="text-sm font-medium"
                onClick={handleSignOut}
              >
                Logout
              </Button>
              <Link href="/dashboard">
                <Button className="bg-primary text-white hover:bg-primary/90">Vai alla Dashboard</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {status === 'loading' && (
            <Button variant="ghost" size="sm" disabled>...</Button>
          )}
          {status === 'unauthenticated' && (
            <Button variant="ghost" size="sm" onClick={navigateToLogin}>Accedi</Button>
          )}
          {status === 'authenticated' && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>Logout</Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-16 z-50 mt-px h-[calc(100vh-4rem)] overflow-y-auto bg-background md:hidden",
          mobileMenuOpen ? "block" : "hidden",
        )}
      >
        <div className="container space-y-4 py-4">
          <Link href="#come-funziona" className="block py-2 text-lg font-medium" onClick={toggleMobileMenu}>
            Come funziona
          </Link>
          <Link href="#casi-uso" className="block py-2 text-lg font-medium" onClick={toggleMobileMenu}>
            Casi d'uso
          </Link>
          <Link href="#prezzi" className="block py-2 text-lg font-medium" onClick={toggleMobileMenu}>
            Prezzi
          </Link>
          <Link href="#faq" className="block py-2 text-lg font-medium" onClick={toggleMobileMenu}>
            FAQ
          </Link>
          <div className="flex flex-col gap-2 pt-4">
            {status === 'loading' && (
              <Button variant="outline" className="w-full" disabled>Caricamento...</Button>
            )}
            {status === 'unauthenticated' && (
              <>
                {/* <Button
                  variant="outline"
                  className="w-full"
                  onClick={navigateToLogin}
                >
                Accedi
                </Button> */}
                <Link href="/dashboard" onClick={toggleMobileMenu}>
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Prova Appuntoai</Button>
                </Link>
              </>
            )}
            {status === 'authenticated' && (
              <>
                {/* <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Logout
                </Button> */}
                <Link href="/dashboard" onClick={toggleMobileMenu}>
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Vai alla Dashboard</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
