
"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { logger } from "@/lib/logger"

interface Favorite {
  id: string
  name: string
  type: string
  page?: string // Optional page field
}

interface FavoritesContextType {
  favorites: Favorite[]
  addFavorite: (favorite: Favorite) => void
  removeFavorite: (id: string) => void
  getFavoritesByType: (type: string) => Favorite[]
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedFavorites = localStorage.getItem("mabi-favorites")
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
          logger.debug("Favorites loaded from localStorage", JSON.parse(storedFavorites))
        }
      } catch (error) {
        logger.error("Failed to load favorites from localStorage", error)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("mabi-favorites", JSON.stringify(favorites))
        logger.debug("Favorites saved to localStorage", favorites)
      } catch (error) {
        logger.error("Failed to save favorites to localStorage", error)
      }
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((favorite: Favorite) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.some((fav) => fav.id === favorite.id)) {
        logger.debug("Adding favorite", favorite)
        return [...prevFavorites, favorite]
      }
      return prevFavorites
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
      logger.debug("Removing favorite with ID", id)
      return prevFavorites.filter((favorite) => favorite.id !== id)
    })
  }, [])

  const getFavoritesByType = useCallback(
    (type: string) => {
      return favorites.filter((favorite) => favorite.type === type)
    },
    [favorites],
  )

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, getFavoritesByType }}
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
