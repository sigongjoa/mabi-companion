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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false) // New state for favorite filter
  const [searchQuery, setSearchQuery] = useState("") // 검색 쿼리 상태 추가

  // Get all unique facility IDs for filter buttons
  const facilityTypes = allCraftingFacilitiesData.map((f) => ({ id: f.id, name: f.name }))

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
                const currentQuantity = newInventory[materialItemData.id] || 0;
                newInventory[materialItemData.id] = currentQuantity + (material.quantity * cancelledQuantity);
                logger.debug(`cancelQueueItem: Returned ${material.quantity * cancelledQuantity} of ${material.item} to inventory.`);
              }
            });
            updateCharacter(activeCharacter.id, { inventory: newInventory });
          }
        }
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0, quantity: undefined }
      }
      return queue
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
  }

  const cancelAllQueues = (facilityId: string) => {
    if (!activeCharacter) {
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newQueues = currentFacilityQueues.map((queue: ProcessingQueue) => ({
      ...queue,
      isProcessing: false,
      itemName: undefined,
      timeLeft: 0,
      totalTime: 0,
    }))

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
  }

  const handleFilterChange = (value: string[]) => {
    setSelectedFacilityIds(value)
  }

  const filteredFacilities = allCraftingFacilitiesData.filter((facility) => {
    const isFavorite = activeCharacter?.favoriteCraftingFacilities?.[facility.id]

    const matchesSearchQuery =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.recipes.some(
        (recipe) =>
          recipe.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.materials.some((material) => material.item.toLowerCase().includes(searchQuery.toLowerCase())),
      )

    if (showFavoritesOnly && !isFavorite) {
      return false
    }
    if (selectedFacilityIds.length > 0 && !selectedFacilityIds.includes(facility.id)) {
      return false
    }
    return matchesSearchQuery
  })

  const sortFacilities = (a: FacilityData, b: FacilityData) => {
    const aIsFavorite = activeCharacter?.favoriteCraftingFacilities?.[a.id]
    const bIsFavorite = activeCharacter?.favoriteCraftingFacilities?.[b.id]

    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    return a.name.localeCompare(b.name)
  }

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
            {filteredFacilities.sort(sortFacilities).map((facility) => {
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

                    {currentQueues.length > 0 ? (
                      <div className="space-y-3">
                        {currentQueues.map((queue) => (
                          <div key={queue.id} className="queue-item">
                            <div className="queue-info">
                              <p className="font-medium text-left">
                                {queue.isProcessing ? queue.itemName || "알 수 없는 아이템" : "비어있음"}
                              </p>
                              {queue.isProcessing && queue.timeLeft > 0 && (
                                <p className="text-sm text-gray-600 text-left">
                                  남은 시간: {Math.floor(queue.timeLeft / 60)}분 {queue.timeLeft % 60}초
                                </p>
                              )}
                              {queue.timeLeft === 0 && queue.isProcessing && (
                                <Badge variant="default" className="status-success mt-1">
                                  제작 완료!
                                </Badge>
                              )}
                            </div>
                            <div className="queue-actions">
                              {queue.timeLeft === 0 && queue.isProcessing && (
                                <Button
                                  className="crafting-button-success"
                                  size="sm"
                                  onClick={() => claimCompletedItems(facility.id)}
                                >
                                  <Package className="w-4 h-4" />
                                  수령
                                </Button>
                              )}
                              {queue.isProcessing && (
                                <Button
                                  className="crafting-button-danger"
                                  size="sm"
                                  onClick={() => cancelQueueItem(facility.id, queue.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                  취소
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-left">진행 중인 제작이 없습니다.</p>
                    )}

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
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CraftingRecipeCardProps {
  recipe: Recipe
  inventory: Record<number, number>
  itemNameMap: Record<string, number>
  onCraft: (recipe: Recipe, quantity: number) => void
}

function CraftingRecipeCard({ recipe, onCraft, inventory, itemNameMap }: CraftingRecipeCardProps) {
  const [quantity, setQuantity] = useState(1)

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

  const craftableQuantity = calculateCraftableQuantity()
  const canCraft = craftableQuantity > 0

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value)
    setQuantity(Math.max(1, Math.min(newQuantity, craftableQuantity)))
  }

  const handleCraft = () => {
    if (quantity > 0 && canCraft) {
      onCraft(recipe, quantity);
    }
  };

  return (
    <div className={`recipe-card ${canCraft ? "hover:shadow-md" : "opacity-75"}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="recipe-title">{recipe.product}</h4>
        <Badge className={`level-badge ${canCraft ? "status-success" : "status-error"}`}>
          Lv.{recipe.level_condition}
        </Badge>
      </div>

      {/* Material Requirements */}
      <div className="mb-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Package className="w-4 h-4 mr-2" />
          필요 재료
        </h5>
        <div className="space-y-2">
          {recipe.materials.map((material, matIndex) => {
            const materialId = itemNameMap[material.item]
            const ownedQuantity = inventory[materialId] || 0
            const isEnough = ownedQuantity >= material.quantity
            const percentage = Math.min(100, (ownedQuantity / material.quantity) * 100)

            return (
              <div key={matIndex} className="material-item">
                <span className="material-name">{material.item}</span>
                <div className="flex items-center space-x-3">
                  <div className="material-progress">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isEnough ? "progress-fill-success" : "progress-fill-danger"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={`material-count ${isEnough ? "text-green-600" : "text-red-600"}`}>
                    {ownedQuantity}/{material.quantity}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Crafting Info */}
      <div className="info-section mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="info-text">제작 시간: {recipe.time}초</span>
        </div>
        {canCraft ? (
          <Badge className="status-success">
            <Target className="w-3 h-3 mr-1" />
            {craftableQuantity}개 제작 가능
          </Badge>
        ) : (
          <Badge className="status-error">재료 부족</Badge>
        )}
      </div>

      {/* Crafting Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={craftableQuantity > 0 ? craftableQuantity : 1}
            disabled={!canCraft}
            className="crafting-input"
            placeholder="수량"
          />
        </div>
        <Button
          onClick={handleCraft}
          disabled={!canCraft || quantity === 0}
          className={`flex-2 ${canCraft ? "crafting-button-primary" : "crafting-button-secondary"}`}
        >
          <Hammer className="w-4 h-4 mr-2" />
          제작 시작
        </Button>
      </div>
    </div>
  )
}
