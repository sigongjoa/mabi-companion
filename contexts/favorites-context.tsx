"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface FavoriteComponent {
  id: string
  name: string
  type: string
  page: string
  addedAt: Date
}

interface FavoritesContextType {
  favorites: FavoriteComponent[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (component: Omit<FavoriteComponent, "addedAt">) => void
  removeFavorite: (id: string) => void
  getFavoritesByPage: (page: string) => FavoriteComponent[]
  getFavoritesByType: (type: string) => FavoriteComponent[]
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteComponent[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("mabinogi-favorites")
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites).map((f: any) => ({
          ...f,
          addedAt: new Date(f.addedAt),
        }))
        setFavorites(parsed)
      }
    } catch (error) {
      console.warn("Failed to load favorites:", error)
    }
  }, [])

  // Save to localStorage when favorites change
  useEffect(() => {
    try {
      localStorage.setItem("mabinogi-favorites", JSON.stringify(favorites))
    } catch (error) {
      console.warn("Failed to save favorites:", error)
    }
  }, [favorites])

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id)
    },
    [favorites],
  )

  const toggleFavorite = useCallback((component: Omit<FavoriteComponent, "addedAt">) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === component.id)
      if (exists) {
        return prev.filter((f) => f.id !== component.id)
      } else {
        return [...prev, { ...component, addedAt: new Date() }]
      }
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const getFavoritesByPage = useCallback(
    (page: string) => {
      return favorites.filter((f) => f.page === page)
    },
    [favorites],
  )

  const getFavoritesByType = useCallback(
    (type: string) => {
      return favorites.filter((f) => f.type === type)
    },
    [favorites],
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        getFavoritesByPage,
        getFavoritesByType,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
