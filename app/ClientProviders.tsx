"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Inter } from "next/font/google"
import { CharacterProvider } from "@/contexts/character-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true })

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  console.debug(`Entering ClientProviders`);
  const [mounted, setMounted] = useState(false);
  // Initialize isSidebarOpen to true for SSR, then update from localStorage on client
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 클라이언트에서만 실행: 마운트 한 번 완료 후에 mounted를 true로 설정
  useEffect(() => {
    setMounted(true);

    // Update isSidebarOpen from localStorage only on the client after mount
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isSidebarOpen');
      // Only update if a saved state exists, otherwise keep the default (true)
      if (savedState !== null) {
        setIsSidebarOpen(savedState === 'true');
        console.debug(`Updated isSidebarOpen from localStorage: ${savedState}`);
      }
    }
  }, []);

  // localStorage 업데이트 (isSidebarOpen 변경 시)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug(`Updating localStorage isSidebarOpen to: ${isSidebarOpen}`);
      localStorage.setItem('isSidebarOpen', String(isSidebarOpen));
    }
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(
    () => {
      console.debug(`Toggling sidebar, current state: ${isSidebarOpen}`);
      setIsSidebarOpen((prev: boolean) => !prev);
    },
    [isSidebarOpen]
  );

  return (
    <AuthProvider>
      <CharacterProvider>
        <FavoritesProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </FavoritesProvider>
      </CharacterProvider>
    </AuthProvider>
  )
}
