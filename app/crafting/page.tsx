"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package, Star, Target, XCircle } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import allItemsData from "@/data/items.json"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import { CraftingQueueItem } from "@/components/crafting-queue-item"
import { CraftingTimerPopup } from "@/components/crafting-timer-popup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemDetailsPopup } from "@/components/item-details-popup"
import Image from "next/image"

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

// Define the structure for a material within a recipe
interface Material {
  item: string // Name of the item
  quantity: number
}

// Define the structure for a single crafting recipe
interface Recipe {
  product: string
  materials: Material[]
  time: number // in seconds
  level_condition: number // Facility level required
}

// Update FacilityData to reflect the new JSON structure
interface FacilityData {
  id: string
  name: string
  description: string
  recipes: Recipe[] // Array of recipes for this facility
}

interface ProcessingQueue {
  id: number
  isProcessing: boolean
  timeLeft: number
  totalTime: number
  itemName?: string
  quantity?: number
}

const allCraftingFacilitiesData: FacilityData[] = craftingFacilitiesData as FacilityData[]

export default function CraftingPage() {
  const { activeCharacter, updateCharacter, toggleCraftingFacilityFavorite } = useCharacter()
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([])
  const [selectedFacilityTab, setSelectedFacilityTab] = useState<string>("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTimerPopupOpen, setIsTimerPopupOpen] = useState(false)
  const [selectedQueueItem, setSelectedQueueItem] = useState<ProcessingQueue | null>(null)
  const [selectedFacilityForPopup, setSelectedFacilityForPopup] = useState<string>("")
  const [isItemDetailsPopupOpen, setIsItemDetailsPopupOpen] = useState(false)
  const [selectedItemForPopup, setSelectedItemForPopup] = useState<Item | null>(null)
  const [selectedRecipeForPopup, setSelectedRecipeForPopup] = useState<Recipe | null>(null)

  const facilityTypes = allCraftingFacilitiesData.map((f) => ({ id: f.id, name: f.name }))

  useEffect(() => {
    logger.debug(`Entering useEffect for facilityType initialization. All facilities: ${JSON.stringify(allCraftingFacilitiesData)}`);
    if (facilityTypes.length > 0 && !selectedFacilityTab) {
      setSelectedFacilityTab(facilityTypes[0].id);
      logger.debug(`Setting default selected facility tab to: ${facilityTypes[0].id}`);
    }
    logger.debug(`Exiting useEffect for facilityType initialization.`);
  }, [facilityTypes, selectedFacilityTab]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeCharacter) {
        return
      }
      const updatedQueues = { ...activeCharacter.craftingQueues }

      let shouldUpdate = false
      for (const facilityId in updatedQueues) {
        if (Object.prototype.hasOwnProperty.call(updatedQueues, facilityId)) {
          updatedQueues[facilityId] = updatedQueues[facilityId].map((queue: ProcessingQueue) => {
            if (queue.isProcessing && queue.timeLeft > 0) {
              shouldUpdate = true
              return { ...queue, timeLeft: Math.max(0, queue.timeLeft - 1) }
            }
            return queue
          })
        }
      }

      if (shouldUpdate) {
        updateCharacter(activeCharacter.id, { craftingQueues: updatedQueues })
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [activeCharacter, updateCharacter]) // Depend on activeCharacter and updateCharacter

  // Create a map from item name to item ID for efficient lookup
  const allItems: Record<string, { id: number; name: string }> = allItemsData as Record<
    string,
    { id: number; name: string }
  >

  const allItemsArray: Item[] = Object.values(allItemsData) as Item[];

  const itemNameMap: Record<string, number> = {}
  for (const key in allItems) {
    if (Object.prototype.hasOwnProperty.call(allItems, key)) {
      const item = allItems[key]
      itemNameMap[item.name] = item.id
    }
  }

  const startProcessing = (facilityId: string, recipe: Recipe, quantity: number) => {
    logger.debug(`Entering startProcessing: facilityId=${facilityId}, recipeProduct=${recipe.product}, quantity=${quantity}, recipeTime=${recipe.time}`);
    if (!activeCharacter) {
      logger.debug(`startProcessing: No active character.`);
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const availableQueueIndex = currentFacilityQueues.findIndex((q: ProcessingQueue) => !q.isProcessing)

    if (availableQueueIndex === -1) {
      return
    }

    // Deduct materials from inventory
    const newInventory = { ...activeCharacter.inventory }
    let canCraft = true
    recipe.materials.forEach((material) => {
      const materialItemData = allItemsArray.find((item: Item) => item.name === material.item);
      if (materialItemData) {
        const currentQuantity = newInventory[materialItemData.id] || 0;
        const requiredQuantity = material.quantity * quantity;
        if (currentQuantity < requiredQuantity) {
          canCraft = false; // Not enough materials
          logger.debug(`startProcessing: Not enough material ${material.item}. Required: ${requiredQuantity}, Available: ${currentQuantity}`);
        } else {
          newInventory[materialItemData.id] = currentQuantity - requiredQuantity;
        }
      } else {
        canCraft = false; // Material not found in item data
        logger.debug(`startProcessing: Material ${material.item} not found in allItemsData.`);
      }
    });

    if (!canCraft) {
      logger.debug(`startProcessing: Cannot craft due to insufficient materials.`);
      return;
    }

    const newQueues = [...currentFacilityQueues]
    const totalTime = quantity * recipe.time // Use recipe.time here
    newQueues[availableQueueIndex] = {
      id: newQueues[availableQueueIndex].id,
      isProcessing: true,
      timeLeft: totalTime,
      totalTime: totalTime,
      itemName: recipe.product,
      quantity: quantity, // Store the quantity here
    }

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }

    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues, inventory: newInventory }) // Update inventory
    logger.debug(`startProcessing: Updated character crafting queues and inventory. Exiting.`);
  }

  const claimCompletedItems = (facilityId: string) => {
    logger.debug(`Entering claimCompletedItems: facilityId=${facilityId}`);
    if (!activeCharacter) {
      logger.debug(`claimCompletedItems: No active character.`);
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newInventory = { ...activeCharacter.inventory };
    const completedItems: { itemName: string; quantity: number }[] = [];

    const newQueues = currentFacilityQueues.map((queue: ProcessingQueue) => {
      if (queue.timeLeft === 0 && queue.isProcessing) {
        if (queue.itemName && queue.quantity !== undefined) {
          const itemName = queue.itemName; // Assign to a new const to help type inference
          const productItemData = allItemsArray.find((item: Item) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim());
          if (productItemData) {
            const craftedQuantity = queue.quantity; // Assign to a new const to help type inference
            const currentQuantity = newInventory[productItemData.id] || 0;
            newInventory[productItemData.id] = currentQuantity + craftedQuantity;
            completedItems.push({ itemName: itemName, quantity: craftedQuantity });
            logger.debug(`claimCompletedItems: Added ${craftedQuantity} of ${itemName} to inventory.`);
          } else {
            logger.debug(`claimCompletedItems: Product '${itemName}' not found in allItemsData. Check spelling or data.`);
          }
        }
        return { ...queue, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined }
      }
      return queue
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues, inventory: newInventory }) // Update inventory
    logger.debug(`claimCompletedItems: Updated character crafting queues and inventory. Exiting.`);
  }

  const cancelQueueItem = (facilityId: string, queueId: number) => {
    logger.debug(`Entering cancelQueueItem: facilityId=${facilityId}, queueId=${queueId}`);
    if (!activeCharacter) {
      logger.debug(`cancelQueueItem: No active character.`);
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newQueues = currentFacilityQueues.map((queue: ProcessingQueue) => {
      if (queue.id === queueId) {
        // If canceling, return materials to inventory (if it was processing)
        if (queue.isProcessing && queue.itemName && queue.quantity !== undefined) {
          const itemName = queue.itemName; // Assign to a new const to help type inference
          const recipeForCancelledItem = allCraftingFacilitiesData
            .flatMap(facility => facility.recipes)
            .find(recipe => recipe.product.toLowerCase().trim() === itemName.toLowerCase().trim());

          if (recipeForCancelledItem) {
            const cancelledQuantity = queue.quantity; // Assign to a new const to help type inference
            const newInventory = { ...activeCharacter.inventory };
            recipeForCancelledItem.materials.forEach(material => {
              const materialItemData = allItemsArray.find((item: Item) => item.name.toLowerCase().trim() === material.item.toLowerCase().trim());
              if (materialItemData) {
                newInventory[materialItemData.id] = (newInventory[materialItemData.id] || 0) + material.quantity * cancelledQuantity;
                updateCharacter(activeCharacter.id, { inventory: newInventory });
                logger.debug(`cancelQueueItem: Returned ${material.quantity * cancelledQuantity} of ${material.item} to inventory.`);
              } else {
                logger.debug(`cancelQueueItem: Material ${material.item} not found for cancelled item.`);
              }
            });
          }
        }
        return { ...queue, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined }; // Reset the queue item
      }
      return queue;
    });

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    };
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues });
    logger.debug(`cancelQueueItem: Updated character crafting queues. Exiting.`);
  };

  const cancelAllQueues = (facilityId: string) => {
    logger.debug(`Entering cancelAllQueues: facilityId=${facilityId}`);
    if (!activeCharacter) {
      logger.debug(`cancelAllQueues: No active character.`);
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newQueues = currentFacilityQueues.map((queue: ProcessingQueue) => {
      // If canceling, return materials to inventory (if it was processing)
      if (queue.isProcessing && queue.itemName && queue.quantity !== undefined) {
        const itemName = queue.itemName; // Assign to a new const to help type inference
        const recipeForCancelledItem = allCraftingFacilitiesData
          .flatMap(facility => facility.recipes)
          .find(recipe => recipe.product.toLowerCase().trim() === itemName.toLowerCase().trim());

        if (recipeForCancelledItem) {
          const cancelledQuantity = queue.quantity; // Assign to a new const to help type inference
          const newInventory = { ...activeCharacter.inventory };
          recipeForCancelledItem.materials.forEach(material => {
            const materialItemData = allItemsArray.find((item: Item) => item.name.toLowerCase().trim() === material.item.toLowerCase().trim());
            if (materialItemData) {
              newInventory[materialItemData.id] = (newInventory[materialItemData.id] || 0) + material.quantity * cancelledQuantity;
              updateCharacter(activeCharacter.id, { inventory: newInventory });
              logger.debug(`cancelAllQueues: Returned ${material.quantity * cancelledQuantity} of ${material.item} to inventory.`);
            } else {
              logger.debug(`cancelAllQueues: Material ${material.item} not found for cancelled item.`);
            }
          });
        }
      }
      return { ...queue, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined }
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
    logger.debug(`cancelAllQueues: Updated character crafting queues. Exiting.`);
  }

  const handleFilterChange = (value: string[]) => {
    logger.debug(`Entering handleFilterChange: value=${JSON.stringify(value)}`);
    setSelectedFacilityIds(value)
    logger.debug(`Exiting handleFilterChange.`);
  }

  const sortFacilities = (a: FacilityData, b: FacilityData) => {
    // Sort logic: favorited first, then by name
    const aIsFavorite = activeCharacter?.favoriteCraftingFacilities[a.id] || false;
    const bIsFavorite = activeCharacter?.favoriteCraftingFacilities[b.id] || false;

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;

    return a.name.localeCompare(b.name);
  };

  const handleOpenTimerPopup = (queue: ProcessingQueue, facilityId: string) => {
    setSelectedQueueItem(queue);
    setSelectedFacilityForPopup(facilityId);
    setIsTimerPopupOpen(true);
    logger.debug(`handleOpenTimerPopup: Opened popup for queue ID ${queue.id} in facility ${facilityId}.`);
  };

  const handleCloseTimerPopup = () => {
    setIsTimerPopupOpen(false);
    setSelectedQueueItem(null);
    setSelectedFacilityForPopup("");
    logger.debug(`handleCloseTimerPopup: Closed timer popup.`);
  };

  const handleTabChange = (value: string) => {
    logger.debug(`Entering handleTabChange: value=${value}`);
    setSelectedFacilityTab(value);
    logger.debug(`Exiting handleTabChange.`);
  }

  const handleCraftFromPopup = (recipe: Recipe, quantity: number) => {
    logger.debug(`Entering handleCraftFromPopup: recipeProduct=${recipe.product}, quantity=${quantity}`);
    if (!selectedFacilityTab) {
      logger.debug(`handleCraftFromPopup: No facility selected.`);
      return;
    }
    startProcessing(selectedFacilityTab, recipe, quantity);
    setIsItemDetailsPopupOpen(false);
    logger.debug(`Exiting handleCraftFromPopup.`);
  };

  const handleViewItemDetails = (item: Item, recipe: Recipe) => {
    logger.debug(`Entering handleViewItemDetails: itemName=${item.name}, recipeProduct=${recipe.product}`);
    setSelectedItemForPopup(item);
    setSelectedRecipeForPopup(recipe);
    setIsItemDetailsPopupOpen(true);
    logger.debug(`Exiting handleViewItemDetails.`);
  };

  const handleCloseItemDetailsPopup = () => {
    logger.debug(`Entering handleCloseItemDetailsPopup.`);
    setIsItemDetailsPopupOpen(false);
    setSelectedItemForPopup(null);
    setSelectedRecipeForPopup(null);
    logger.debug(`Exiting handleCloseItemDetailsPopup.`);
  };

  const filteredFacilities = allCraftingFacilitiesData
    .filter((facility) => {
      const matchesFilter = selectedFacilityIds.length === 0 || selectedFacilityIds.includes(facility.id);
      const matchesFavorite = !showFavoritesOnly || (activeCharacter && activeCharacter.favoriteCraftingFacilities[facility.id]);
      return matchesFilter && matchesFavorite;
    })
    .filter((facility) => {
      // 필터링된 시설의 레시피에 검색어가 포함되는지 확인
      if (searchQuery === "") return true;
      return facility.recipes.some((recipe) =>
        recipe.product.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    })
    .sort(sortFacilities);

  return (
    <div className="min-h-screen bg-white">
      <div className="content-padding section-spacing">
        {/* Enhanced Header */}
        <div className="modern-card fade-in">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <Hammer className="w-8 h-8 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold text-gray-900">제작 관리</h1>
                  <p className="text-lg text-gray-600 mt-1">아이템 제작 현황 및 레시피</p>
                  <p className="text-sm text-gray-500 mt-1">캐릭터별 제작 큐 및 재료 관리</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                <Input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <FavoriteToggle
                  isFavorite={activeCharacter?.favoriteCraftingFacilities?.[selectedFacilityIds[0]] || false}
                  onToggle={() => {
                    if (selectedFacilityIds.length === 1) {
                      toggleCraftingFacilityFavorite(selectedFacilityIds[0])
                    }
                  }}
                  tooltipText="선택된 시설 즐겨찾기"
                  showToggle={selectedFacilityIds.length === 1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="filter-section fade-in">
            <div className="filter-toggles">
              <ToggleGroup
                type="multiple"
                value={selectedFacilityIds}
                onValueChange={handleFilterChange}
                className="flex flex-wrap gap-2"
              >
                {facilityTypes.map((type) => (
                  <ToggleGroupItem key={type.id} value={type.id} aria-label={`Toggle ${type.name}`}>
                    {type.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? "default" : "outline"}
              className="crafting-button-secondary flex-shrink-0"
            >
              <Star className="w-4 h-4 mr-2" /> 즐겨찾기만 보기
            </Button>
          </div>

          {/* Crafting Facilities Grid */}
          <div className="crafting-grid">
            {filteredFacilities.map((facility) => {
              const currentQueues = activeCharacter?.craftingQueues?.[facility.id] || []
              const activeQueuesCount = currentQueues.filter((q) => q.isProcessing).length
              const completedQueuesCount = currentQueues.filter((q) => q.timeLeft === 0 && q.isProcessing).length
              const totalAvailableSlots = 4
              const occupiedSlots = activeQueuesCount

              return (
                <div key={facility.id} className="crafting-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Hammer className="h-6 w-6 text-yellow-600" />
                      <h2 className="crafting-title">{facility.name}</h2>
                    </div>
                    <FavoriteToggle
                      id={facility.id}
                      name={facility.name}
                      type="crafting-facility"
                      isFavorite={activeCharacter?.favoriteCraftingFacilities?.[facility.id]}
                      onToggle={toggleCraftingFacilityFavorite}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-4 text-left">{facility.description}</p>

                  <div className="recipe-grid mb-6">
                    {facility.recipes
                      .filter(
                        (recipe) =>
                          recipe.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.materials.some((material) =>
                            material.item.toLowerCase().includes(searchQuery.toLowerCase()),
                          ),
                      )
                      .map((recipe, index) => (
                        <CraftingRecipeCard
                          key={index}
                          recipe={recipe}
                          inventory={activeCharacter?.inventory || {}}
                          itemNameMap={itemNameMap}
                          onCraft={(recipeArg, quantityArg) =>
                            startProcessing(facility.id, recipeArg, quantityArg)
                          }
                          onViewDetails={handleViewItemDetails}
                        />
                      ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>
                        진행 중인 제작 ({occupiedSlots}/{totalAvailableSlots})
                      </span>
                    </h3>

                    {/* Always render 4 crafting queue items */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Array(4).fill(null).map((_, index) => {
                        const queue = currentQueues[index] || { id: index, isProcessing: false, timeLeft: 0, totalTime: 0 };
                        return (
                          <CraftingQueueItem
                            key={queue.id}
                            queue={queue}
                            onOpenTimerPopup={handleOpenTimerPopup}
                            facilityId={facility.id}
                            allItems={allItemsArray}
                          />
                        );
                      })}
                    </div>

                    {/* Claim/Cancel All Buttons */}
                    {(activeQueuesCount > 0 || completedQueuesCount > 0) && (
                      <div className="space-y-2 mt-4">
                        {completedQueuesCount > 0 && (
                          <Button
                            className="crafting-button-secondary w-full"
                            onClick={() => claimCompletedItems(facility.id)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            완료된 아이템 모두 수령
                          </Button>
                        )}
                        {activeQueuesCount > 0 && (
                          <Button
                            className="crafting-button-secondary w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                            onClick={() => cancelAllQueues(facility.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            모든 제작 취소
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedQueueItem && ( // Only render popup if an item is selected
        <CraftingTimerPopup
          isOpen={isTimerPopupOpen}
          onClose={handleCloseTimerPopup}
          queue={selectedQueueItem}
          onClaim={claimCompletedItems}
          onCancel={cancelQueueItem}
          facilityId={selectedFacilityForPopup}
        />
      )}

      <ItemDetailsPopup
        isOpen={isItemDetailsPopupOpen}
        onClose={handleCloseItemDetailsPopup}
        item={selectedItemForPopup}
        recipe={selectedRecipeForPopup}
        onCraftFromPopup={handleCraftFromPopup}
        inventory={activeCharacter?.inventory || {}}
        itemNameMap={itemNameMap}
      />
    </div>
  )
}

interface CraftingRecipeCardProps {
  recipe: Recipe
  inventory: Record<number, number>
  itemNameMap: Record<string, number>
  onCraft: (recipe: Recipe, quantity: number) => void
  onViewDetails: (item: Item, recipe: Recipe) => void
}

function CraftingRecipeCard({ recipe, onCraft, inventory, itemNameMap, onViewDetails }: CraftingRecipeCardProps) {
  logger.debug(`Entering CraftingRecipeCard: recipeProduct=${recipe.product}`);
  const [quantity, setQuantity] = useState(1)
  const productItemData = allItemsData.find((item: Item) => item.name.toLowerCase().trim() === recipe.product.toLowerCase().trim());
  
  const calculateCraftableQuantity = () => {
    logger.debug(`Entering calculateCraftableQuantity for recipe: ${recipe.product}`);
    let maxCrafts = Number.POSITIVE_INFINITY
    for (const material of recipe.materials) {
      const materialId = itemNameMap[material.item]
      logger.debug(`  Material: ${material.item}, ID: ${materialId}`);
      if (materialId === undefined) {
        logger.debug(`  Material ID is undefined for ${material.item}, returning 0.`);
        return 0
      }
      const ownedQuantity = inventory[materialId] || 0
      logger.debug(`  Owned: ${ownedQuantity}, Required: ${material.quantity}`);
      if (ownedQuantity < material.quantity) {
        logger.debug(`  Not enough of ${material.item}, returning 0.`);
        return 0
      }
      maxCrafts = Math.min(maxCrafts, Math.floor(ownedQuantity / material.quantity))
    }
    logger.debug(`Exiting calculateCraftableQuantity, maxCrafts: ${maxCrafts}`);
    return maxCrafts
  }

  const craftableQuantity = calculateCraftableQuantity();
  const canCraft = craftableQuantity > 0;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.debug(`CraftingRecipeCard: handleQuantityChange: value=${e.target.value}`);
    setQuantity(Number(e.target.value))
    logger.debug(`CraftingRecipeCard: Quantity updated to ${Number(e.target.value)}`);
  }

  const handleCraft = () => {
    logger.debug(`CraftingRecipeCard: handleCraft initiated for recipeProduct=${recipe.product}, quantity=${quantity}`);
    if (canCraft) {
      onCraft(recipe, quantity)
      logger.debug(`CraftingRecipeCard: onCraft called. Exiting.`);
    }
  }

  return (
    <div className="relative border rounded-lg p-4 flex flex-col items-start gap-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-2">
        <FavoriteToggle
          itemId={productItemData?.id || 0} // Use productItemData.id
          isFavorite={productItemData?.isFavorite || false} // Use productItemData.isFavorite
          onToggle={() => { /* Implement if needed */ }}
        />
      </div>
      {productItemData && productItemData.icon && (
        <Image
          src={productItemData.icon}
          alt={recipe.product}
          width={48}
          height={48}
          className="object-contain cursor-pointer"
          onClick={() => onViewDetails(productItemData, recipe)} // Pass item and recipe to handler
        />
      )}
      <h3 className="text-lg font-semibold text-gray-800">{recipe.product}</h3>
      <Badge variant="secondary">Lv.{recipe.level_condition}</Badge>
      <div className="text-sm text-gray-600 w-full">
        <p className="font-medium mb-1">필요 재료:</p>
        <ul className="list-disc list-inside space-y-1">
          {recipe.materials.map((material, index) => {
            const materialId = itemNameMap[material.item];
            const currentQuantity = inventory[materialId] || 0;
            const hasEnough = currentQuantity >= material.quantity;
            return (
              <li key={index} className={cn(!hasEnough && "text-red-500")}>
                {material.item}: {currentQuantity}/{material.quantity}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Clock className="h-4 w-4 mr-1" />
        <span>제작 시간: {recipe.time}초</span>
      </div>
      <div className="w-full flex items-center gap-2 mt-auto">
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="w-24"
        />
        <Button
          onClick={handleCraft}
          disabled={!canCraft}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {canCraft ? "제작 시작" : "재료 부족"}
        </Button>
      </div>
    </div>
  )
}
