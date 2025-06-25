"use client"

import { useFavorites } from "@/contexts/favorites-context"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { usePathname } from "next/navigation"

interface FavoriteToggleProps {
  id: string
  name: string
  type: string
  className?: string
}

export function FavoriteToggle({ id, name, type, className = "" }: FavoriteToggleProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const pathname = usePathname()

  const favorite = isFavorite(id)

  const handleToggle = () => {
    toggleFavorite({
      id,
      name,
      type,
      page: pathname,
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={`p-1 h-auto hover:bg-transparent ${className}`}
      title={favorite ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
    >
      <Star
        className={`w-4 h-4 transition-colors ${
          favorite ? "text-yellow-500 fill-current" : "text-gray-400 hover:text-yellow-400"
        }`}
      />
    </Button>
  )
}
