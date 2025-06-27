"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import { cn } from "@/lib/utils"

interface FavoriteToggleProps {
  itemId: string
  itemType: "quest" | "recipe" | "equipment" | "skill"
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteToggle({ itemId, itemType, className, size = "md" }: FavoriteToggleProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)

  const isFavorited = favorites.some((fav) => fav.id === itemId && fav.type === itemType)

  const handleToggle = () => {
    setIsAnimating(true)

    if (isFavorited) {
      removeFavorite(itemId, itemType)
    } else {
      addFavorite(itemId, itemType)
    }

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 200)
  }

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        sizeClasses[size],
        "transition-all duration-200 hover:scale-110",
        isAnimating && "scale-125",
        className,
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400",
          isAnimating && "animate-pulse",
        )}
      />
    </Button>
  )
}
