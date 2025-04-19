import Link from "next/link"
import { BrainCircuit } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
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
          <nav className="flex flex-wrap gap-6">
            <Link href="#come-funziona" className="text-sm text-muted-foreground hover:text-foreground">
              Come funziona
            </Link>
            <Link href="#casi-uso" className="text-sm text-muted-foreground hover:text-foreground">
              Casi d'uso
            </Link>
            <Link href="#prezzi" className="text-sm text-muted-foreground hover:text-foreground">
              Prezzi
            </Link>
            <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/termini" className="text-sm text-muted-foreground hover:text-foreground">
              Termini
            </Link>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Appuntoai. Tutti i diritti riservati. <br />Made with ❤️
        </div>
      </div>
    </footer>
  )
}
