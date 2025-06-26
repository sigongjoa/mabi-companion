"use client"

import React, { useState, useCallback } from "react"
import { Inter } from "next/font/google"
import { CharacterProvider } from "@/contexts/character-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true })

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  )

  return (
    <CharacterProvider>
      <FavoritesProvider>
        <div className={cn("min-h-screen bg-gray-50 flex", "force-no-padding")}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed !top-0 z-50 hidden md:flex bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
              isSidebarOpen ? "left-64 ml-4" : "left-4"
            )}
            onClick={toggleSidebar}
          >
            {console.debug(`isSidebarOpen: ${isSidebarOpen}`)}
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <main
            className={cn(
              "flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out",
              isSidebarOpen ? "md:ml-64" : "md:ml-0"
            )}
          >
            {children}
          </main>
        </div>
        <Toaster />
      </FavoritesProvider>
    </CharacterProvider>
  )
} 