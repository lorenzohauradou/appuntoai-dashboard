"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { FileUp, FileText, Settings, History, Home, LogOut, Menu, X, BrainCircuit } from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onToggle?: (expanded: boolean) => void
}

export function Sidebar({ activeTab, setActiveTab, onToggle }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (onToggle) {
      onToggle(newExpandedState);
    }
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    { id: "upload", label: "Carica File", icon: FileUp },
    { id: "results", label: "Risultati", icon: FileText },
    { id: "settings", label: "Impostazioni", icon: Settings },
  ]

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleMobileSidebar}>
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 transform bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full w-64 flex-col bg-gradient-to-b from-primary to-primary-600 text-white p-4">
          <div className="flex items-center gap-2 mb-8 mt-12">
            <Link href="/" className="flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
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

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                  activeTab === item.id && "bg-white/20",
                )}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileOpen(false)
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={cn(
          "hidden md:flex fixed left-0 top-0 bottom-0 h-screen flex-col bg-gradient-to-b from-primary to-primary-600 text-white transition-all duration-300 z-30",
          expanded ? "w-64" : "w-20",
        )}
      >
        <div className="flex items-center gap-2 p-4 h-16">
          <Link href="/" className={cn("flex items-center gap-2", !expanded && "justify-center")}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
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
            {expanded && <span className="text-xl font-bold">Appuntoai</span>}
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 md:hidden"
          onClick={toggleSidebar}
        >
          {expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <nav className="flex-1 space-y-2 p-4">


          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                activeTab === item.id && "bg-white/20",
                !expanded && "justify-center p-2",
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={cn("h-5 w-5", expanded && "mr-2")} />
              {expanded && item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-white hover:bg-white/10", !expanded && "justify-center p-2")}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className={cn("h-5 w-5", expanded && "mr-2")} />
            {expanded && "Esci"}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="self-end m-4 text-white hover:bg-white/10"
        >
          {expanded ? <Menu className="h-5 w-5 rotate-180" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </>
  )
}
