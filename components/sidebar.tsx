"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileUp, FileText, Settings, History, LogOut, Menu, X, BrainCircuit } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    { id: "upload", label: "Carica File", icon: FileUp },
    { id: "results", label: "Risultati", icon: FileText },
    { id: "history", label: "Cronologia", icon: History },
    { id: "settings", label: "Impostazioni", icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
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
        <div className="flex h-full w-64 flex-col bg-gradient-to-b from-teal-800 to-blue-900 text-white p-4">
          <div className="flex items-center gap-2 mb-8 mt-4">
            <BrainCircuit className="h-8 w-8" />
            <span className="text-xl font-bold">Appuntoai</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-white/10",
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
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <LogOut className="mr-2 h-5 w-5" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={cn(
          "hidden md:flex h-screen flex-col bg-gradient-to-b from-teal-800 to-blue-900 text-white transition-all duration-300",
          expanded ? "w-64" : "w-20",
        )}
      >
        <div className="flex items-center gap-2 p-4 h-16">
          <BrainCircuit className="h-8 w-8" />
          {expanded && <span className="text-xl font-bold">Appuntoai</span>}
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
                "w-full justify-start text-white hover:bg-white/10",
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
