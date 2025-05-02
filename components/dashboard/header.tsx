"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden pl-10">
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

      <div className="hidden md:flex md:w-1/3 lg:w-1/4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cerca..."
            className="w-full bg-background pl-8 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <Skeleton className="h-9 w-20" />
        ) : status === "authenticated" ? (
          <Button
            variant="ghost"
            className="text-sm font-medium"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="text-sm font-medium"
            onClick={() => router.push('/login')}
          >
            Accedi
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 hidden">
            <DropdownMenuLabel>Notifiche</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="cursor-pointer py-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">Elaborazione completata</p>
                    <p className="text-sm text-muted-foreground">
                      Il tuo file "Riunione-{i}.mp4" è stato elaborato con successo.
                    </p>
                    <p className="text-xs text-muted-foreground">2 ore fa</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {status === "authenticated" && session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {session.user.image ? (
                    <AvatarImage src={session.user.image} alt={session.user.name ?? "User"} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-white">
                     {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{session.user.name || session.user.email || "Il mio Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profilo</DropdownMenuItem>
              <DropdownMenuItem>Abbonamento</DropdownMenuItem>
              <DropdownMenuItem>Impostazioni</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                 Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {status === 'unauthenticated' && (
            <></>
        )}
      </div>
    </header>
  )
}
