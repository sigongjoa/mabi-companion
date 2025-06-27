"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package, Star, Activity, Target, Settings, XCircle } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import allItemsData from "@/data/items.json"
import { FavoriteToggle } from "@/components/favorite-toggle"

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
  const itemNameMap: Record<string, number> = {}
  for (const key in allItems) {
    if (Object.prototype.hasOwnProperty.call(allItems, key)) {
      const item = allItems[key]
      itemNameMap[item.name] = item.id
    }
  }

  const startProcessing = (facilityId: string, itemName: string, quantity: number, recipeTime: number) => {
    if (!activeCharacter) {
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const availableQueueIndex = currentFacilityQueues.findIndex((q) => !q.isProcessing)

    if (availableQueueIndex === -1) {
      return
    }

    const newQueues = [...currentFacilityQueues]
    const totalTime = quantity * recipeTime // Use recipeTime here
    newQueues[availableQueueIndex] = {
      id: newQueues[availableQueueIndex].id,
      isProcessing: true,
      timeLeft: totalTime,
      totalTime: totalTime,
      itemName: itemName,
    }

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
  }

  const claimCompletedItems = (facilityId: string) => {
    if (!activeCharacter) {
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.timeLeft === 0 && queue.isProcessing) {
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }
      }
      return queue
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
  }

  const cancelQueueItem = (facilityId: string, queueId: number) => {
    if (!activeCharacter) {
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      return
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.id === queueId) {
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }
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

    const newQueues = currentFacilityQueues.map((queue) => ({ ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }));

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
    const isFavorite = activeCharacter?.favoriteCraftingFacilities?.[facility.id];

    const matchesSearchQuery = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.recipes.some(recipe => 
        recipe.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.materials.some(material => material.item.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    if (showFavoritesOnly && !isFavorite) {
      return false;
    }
    if (selectedFacilityIds.length > 0 && !selectedFacilityIds.includes(facility.id)) {
      return false;
    }
    return matchesSearchQuery;
  });

  const sortFacilities = (a: FacilityData, b: FacilityData) => {
    const aIsFavorite = activeCharacter?.favoriteCraftingFacilities?.[a.id];
    const bIsFavorite = activeCharacter?.favoriteCraftingFacilities?.[b.id];

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return a.name.localeCompare(b.name);
  };

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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters and Search */}
          <div className="modern-card section-spacing fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full flex justify-center md:justify-start">
              <ToggleGroup
                type="multiple"
                value={selectedFacilityIds}
                onValueChange={handleFilterChange}
                className="flex flex-wrap justify-center md:justify-start gap-2"
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
              className="flex-shrink-0"
            >
              <Star className="w-4 h-4 mr-2" /> 즐겨찾기만 보기
            </Button>
          </div>

          {/* Crafting Facilities List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFacilities.sort(sortFacilities).map((facility) => {
              const currentQueues = activeCharacter?.craftingQueues?.[facility.id] || [];
              const activeQueuesCount = currentQueues.filter(q => q.isProcessing).length;
              const completedQueuesCount = currentQueues.filter(q => q.timeLeft === 0 && q.isProcessing).length;
              const totalAvailableSlots = 4; // Assuming 4 slots per facility
              const occupiedSlots = activeQueuesCount;

              return (
                <Card key={facility.id} className="document-card">
                  <CardHeader className="excel-header flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Hammer className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-2xl font-bold">{facility.name}</CardTitle>
                    </div>
                    <FavoriteToggle
                      id={facility.id}
                      name={facility.name}
                      type="crafting-facility"
                      isFavorite={activeCharacter?.favoriteCraftingFacilities?.[facility.id]}
                      onToggle={toggleCraftingFacilityFavorite}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">{facility.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {facility.recipes
                        .filter(recipe => // Filter recipes based on searchQuery here as well
                          recipe.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.materials.some(material => material.item.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((recipe, index) => (
                          <CraftingRecipeCard
                            key={index}
                            recipe={recipe}
                            inventory={activeCharacter?.inventory || {}}
                            itemNameMap={itemNameMap}
                            onCraft={(quantity, recipeTime) =>
                              startProcessing(facility.id, recipe.product, quantity, recipeTime)
                            }
                          />
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>진행 중인 제작 ({occupiedSlots}/{totalAvailableSlots})</span>
                    </h3>
                    {currentQueues.length > 0 ? (
                      <div className="space-y-3">
                        {currentQueues.map((queue) => (
                          <div key={queue.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                            <div>
                              <p className="font-medium">
                                {queue.isProcessing ? (queue.itemName || "알 수 없는 아이템") : "비어있음"}
                              </p>
                              {queue.isProcessing && queue.timeLeft > 0 && (
                                <p className="text-sm text-gray-600">
                                  남은 시간: {Math.floor(queue.timeLeft / 60)}분 {queue.timeLeft % 60}초
                                </p>
                              )}
                              {queue.timeLeft === 0 && queue.isProcessing && (
                                <Badge variant="default" className="bg-green-500 text-white">
                                  제작 완료!
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {queue.timeLeft === 0 && queue.isProcessing && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => {
                                    claimCompletedItems(facility.id);
                                  }}
                                >
                                  <Package className="w-4 h-4 mr-1" />
                                  수령
                                </Button>
                              )}
                              {queue.isProcessing && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    cancelQueueItem(facility.id, queue.id);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  취소
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">진행 중인 제작이 없습니다.</p>
                    )}

                    {completedQueuesCount > 0 && (
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => {
                          claimCompletedItems(facility.id);
                        }}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        완료된 아이템 모두 수령
                      </Button>
                    )}
                    {activeQueuesCount > 0 && (
                      <Button
                        variant="outline"
                        className="mt-2 w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          cancelAllQueues(facility.id);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        모든 제작 취소
                      </Button>
                    )}
                  </CardContent>
                </Card>
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
  onCraft: (quantity: number, recipeTime: number) => void
}

function CraftingRecipeCard({ recipe, onCraft, inventory, itemNameMap }: CraftingRecipeCardProps) {
  const [quantity, setQuantity] = useState(1)

  const calculateCraftableQuantity = () => {
    let maxCrafts = Number.POSITIVE_INFINITY
    for (const material of recipe.materials) {
      const materialId = itemNameMap[material.item]
      if (materialId === undefined) {
        return 0
      }
      const ownedQuantity = inventory[materialId] || 0
      if (ownedQuantity < material.quantity) {
        return 0
      }
      maxCrafts = Math.min(maxCrafts, Math.floor(ownedQuantity / material.quantity))
    }
    return maxCrafts
  }

  const craftableQuantity = calculateCraftableQuantity()
  const canCraft = craftableQuantity > 0

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value)
    setQuantity(Math.max(1, Math.min(newQuantity, craftableQuantity)))
  }

  return (
    <Card className={`modern-card transition-all duration-300 ${canCraft ? "hover:shadow-xl" : "opacity-75"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">{recipe.product}</CardTitle>
          <Badge className={`status-indicator ${canCraft ? "status-success" : "status-error"}`}>
            Lv.{recipe.level_condition}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Material Requirements */}
        <div>
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
                <div key={matIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="flex-1 font-medium text-gray-700">{material.item}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isEnough ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold min-w-[60px] text-right ${
                        isEnough ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {ownedQuantity}/{material.quantity}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enhanced Crafting Info */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">제작 시간: {recipe.time}초</span>
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

        {/* Enhanced Crafting Controls */}
        <div className="flex items-center space-x-3 pt-2">
          <div className="flex-1">
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={craftableQuantity > 0 ? craftableQuantity : 1}
              disabled={!canCraft}
              className="text-center font-bold"
              placeholder="수량"
            />
          </div>
          <Button
            onClick={() => onCraft(quantity, recipe.time)}
            disabled={!canCraft || quantity === 0}
            className={`flex-2 ${canCraft ? "btn-primary-modern" : ""}`}
          >
            <Hammer className="w-4 h-4 mr-2" />
            제작 시작
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

