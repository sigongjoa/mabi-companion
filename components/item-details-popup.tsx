"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Clock } from "lucide-react"
import { logger } from "@/lib/logger"

// Define the structure for a material within a recipe (re-used from page.tsx)
interface Material {
  item: string // Name of the item
  quantity: number
}

// Define the structure for a single crafting recipe (re-used from page.tsx)
interface Recipe {
  product: string
  materials: Material[]
  time: number // in seconds
  level_condition: number // Facility level required
}

// Define the structure for an item (re-used from page.tsx)
interface Item {
  id: number
  name: string
  category: string
  icon: string
  description: string
  weight: number
  price: number
  tradeable: boolean
  sellable: boolean
  isFavorite: boolean
}

interface ItemDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
  recipe: Recipe | null
  onCraftFromPopup: (recipe: Recipe, quantity: number) => void
  inventory: Record<number, number>
  itemNameMap: Record<string, number>
}

export function ItemDetailsPopup({
  isOpen,
  onClose,
  item,
  recipe,
  onCraftFromPopup,
  inventory,
  itemNameMap,
}: ItemDetailsPopupProps) {
  logger.debug(`Entering ItemDetailsPopup: isOpen=${isOpen}, itemName=${item?.name}`);

  if (!isOpen || !item || !recipe) {
    logger.debug(`ItemDetailsPopup: Not open, or item/recipe is null.`);
    return null
  }

  const handleCraft = () => {
    logger.debug(`ItemDetailsPopup: handleCraft initiated for recipeProduct=${recipe.product}`);
    onCraftFromPopup(recipe, 1); // Always craft 1 from popup for simplicity
    onClose();
    logger.debug(`ItemDetailsPopup: handleCraft completed. Popup closed.`);
  };

  // Calculate if enough materials are available
  let canCraft = true;
  recipe.materials.forEach(material => {
    const materialId = itemNameMap[material.item];
    const currentQuantity = inventory[materialId] || 0;
    if (currentQuantity < material.quantity) {
      canCraft = false;
      logger.debug(`ItemDetailsPopup: Not enough material for ${material.item}. Required: ${material.quantity}, Available: ${currentQuantity}`);
    }
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md w-full p-6 bg-white rounded-lg shadow-xl">
        <AlertDialogHeader className="flex flex-row items-center gap-4">
          <Image src={item.icon} alt={item.name} width={64} height={64} className="rounded-md" />
          <div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-800">{item.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              {item.description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>제작 시간: {recipe.time}초</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">필요 재료:</div>
          <ul className="space-y-2">
            {recipe.materials.map((material, index) => {
              const materialId = itemNameMap[material.item];
              const currentQuantity = inventory[materialId] || 0;
              const hasEnough = currentQuantity >= material.quantity;
              return (
                <li key={index} className="flex items-center text-sm">
                  <span className={hasEnough ? "text-gray-800" : "text-red-500 font-semibold"}>
                    {material.item}
                  </span>
                  <span className="ml-2">
                    {currentQuantity}/{material.quantity}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="text-sm text-gray-700">대성공 확률 20.0%</div> {/* Placeholder for now */}
        </div>
        <AlertDialogFooter className="mt-6 flex justify-end">
          <Button onClick={handleCraft} disabled={!canCraft} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            가공하러 가기
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 