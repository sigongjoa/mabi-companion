"use client"

import React, { useCallback, useEffect } from "react"

import { Inter } from "next/font/google"
import { CharacterProvider } from "@/contexts/character-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import Sidebar from "@/components/sidebar"
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
  

  return (
    <AuthProvider>
      <CharacterProvider>
        <FavoritesProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FavoritesProvider>
      </CharacterProvider>
    </AuthProvider>
  )
}
