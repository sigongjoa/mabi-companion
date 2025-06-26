"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Inter } from "next/font/google"
import { CharacterProvider } from "@/contexts/character-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true })

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  console.debug(`Entering ClientProviders`);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isSidebarOpen');
      console.debug(`Initial isSidebarOpen from localStorage: ${savedState}`);
      return savedState === 'true';
    }
    return true; // Default value for server-side rendering or if no saved state
  });

  // 클라이언트에서만 실행: 마운트 한 번 완료 후에 mounted를 true로 설정
  useEffect(() => {
    setMounted(true);
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

  // 서버(또는 hydrate 직후)에는 null을 뿌려서
  // 서버·클라이언트 첫 HTML을 완전히 동일하게 만듭니다.
  if (!mounted) return null;

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