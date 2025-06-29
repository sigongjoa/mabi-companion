"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCharacter } from "@/contexts/character-context"
import { cn } from "@/lib/utils"

interface FavoriteToggleProps {
  itemId: string
  itemType?: "quest" | "recipe" | "equipment" | "skill" | "item"
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteToggle({ itemId, className, size = "md" }: FavoriteToggleProps) {
  const { activeCharacter, updateCharacter } = useCharacter()
  const [isAnimating, setIsAnimating] = useState(false)

  const isFavorited = activeCharacter?.favoriteItems?.[itemId] || false

  const handleToggle = () => {
    setIsAnimating(true)

    if (activeCharacter) {
      const newFavoriteItems = {
        ...activeCharacter.favoriteItems,
        [itemId]: !isFavorited,
      };
      updateCharacter(activeCharacter.id, { favoriteItems: newFavoriteItems });
    }

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
