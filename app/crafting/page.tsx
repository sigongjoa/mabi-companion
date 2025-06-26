"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package, Star, Activity, Target, Settings } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import allItemsData from "@/data/items.json"

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
  console.debug("Entering CraftingPage component.")
  const { activeCharacter, updateCharacter, toggleCraftingFacilityFavorite } = useCharacter()
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false) // New state for favorite filter

  // Get all unique facility IDs for filter buttons
  const facilityTypes = allCraftingFacilitiesData.map((f) => ({ id: f.id, name: f.name }))
  console.debug("Available facility types for filtering:", facilityTypes)

  // Timer effect
  useEffect(() => {
    console.debug("CraftingPage useEffect: Setting up timer interval.")
    const interval = setInterval(() => {
      if (!activeCharacter) {
        console.debug("No active character, stopping timer interval.")
        return
      }
      console.debug("Timer tick for activeCharacter.id:", activeCharacter.id)
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
        console.debug("Updating character with new queue times.", updatedQueues)
        updateCharacter(activeCharacter.id, { craftingQueues: updatedQueues })
      }
    }, 1000)

    return () => {
      console.debug("CraftingPage useEffect cleanup: Clearing timer interval.")
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
  console.debug("Created itemNameMap:", itemNameMap)

  const startProcessing = (facilityId: string, itemName: string, quantity: number, recipeTime: number) => {
    console.debug(
      `Entering startProcessing - facilityId: ${facilityId}, itemName: ${itemName}, quantity: ${quantity}, recipeTime: ${recipeTime}`,
    )
    if (!activeCharacter) {
      console.warn("No active character, cannot start processing.")
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`)
      return
    }

    const availableQueueIndex = currentFacilityQueues.findIndex((q) => !q.isProcessing)

    if (availableQueueIndex === -1) {
      console.warn(`No available queue in facility ${facilityId}.`)
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
    console.debug(
      `Started processing ${itemName} in facility ${facilityId}. New craftingQueues:`,
      updatedCraftingQueues,
    )
  }

  const claimCompletedItems = (facilityId: string) => {
    console.debug(`Entering claimCompletedItems - facilityId: ${facilityId}`)
    if (!activeCharacter) {
      console.warn("No active character, cannot claim items.")
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`)
      return
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.timeLeft === 0 && queue.isProcessing) {
        console.debug(`Claiming item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`)
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }
      }
      return queue
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
    console.debug(`Claimed all items from facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues)
  }

  const cancelQueueItem = (facilityId: string, queueId: number) => {
    console.debug(`Entering cancelQueueItem - facilityId: ${facilityId}, queueId: ${queueId}`)
    if (!activeCharacter) {
      console.warn("No active character, cannot cancel queue item.")
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`)
      return
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.id === queueId) {
        console.debug(`Cancelling item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`)
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }
      }
      return queue
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
    console.debug(
      `Cancelled queue item ${queueId} in facility ${facilityId}. New craftingQueues:`,
      updatedCraftingQueues,
    )
  }

  const cancelAllQueues = (facilityId: string) => {
    console.debug(`Entering cancelAllQueues - facilityId: ${facilityId}`)
    if (!activeCharacter) {
      console.warn("No active character, cannot cancel all queues.")
      return
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId]
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`)
      return
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      console.debug(`Cancelling item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`)
      return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 }
    })

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    }
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues })
    console.debug(`Cancelled all queues in facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues)
  }

  const handleFilterChange = (value: string[]) => {
    console.debug("Filter change detected:", value)
    setSelectedFacilityIds(value)
  }

  const filteredFacilities = allCraftingFacilitiesData.filter((facility) => {
    const matchesCategory = selectedFacilityIds.length === 0 || selectedFacilityIds.includes(facility.id)
    const matchesFavorite = !showFavoritesOnly || activeCharacter?.favoriteCraftingFacilities[facility.id]
    console.debug(`Facility ${facility.name}: matchesCategory=${matchesCategory}, matchesFavorite=${matchesFavorite}`)
    return matchesCategory && matchesFavorite
  })
  console.debug(
    "Filtered facilities to display:",
    filteredFacilities.map((f) => f.name),
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="modern-card fade-in">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-orange-100 rounded-2xl flex-shrink-0">
                  <Hammer className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">가공 시설</h1>
                  <p className="text-lg text-gray-600 mt-1">원재료를 상위 아이템으로 가공하고 진행 상황을 확인하세요</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{filteredFacilities.length}</div>
                  <div className="text-sm text-gray-500">활성 시설</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="modern-card slide-up">
          <div className="p-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                필터:
              </span>
              <ToggleGroup type="multiple" value={selectedFacilityIds} onValueChange={handleFilterChange}>
                {facilityTypes.map((type) => (
                  <ToggleGroupItem
                    key={type.id}
                    value={type.id}
                    aria-label={`${type.name} 토글`}
                    className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                  >
                    {type.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly ? "bg-blue-600 text-white" : ""}
              >
                <Star
                  className={`w-4 h-4 mr-2 ${showFavoritesOnly ? "fill-current text-yellow-400" : "text-yellow-400"}`}
                />
                즐겨찾기만 보기
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Facility Cards */}
        <div className="space-y-8">
          {filteredFacilities.map((facility, index) => {
            const currentQueues =
              activeCharacter?.craftingQueues[facility.id] ||
              Array(4)
                .fill(null)
                .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 }))
            const isFavorite = activeCharacter?.favoriteCraftingFacilities[facility.id] || false
            const activeQueues = currentQueues.filter((q) => q.isProcessing).length
            const completedQueues = currentQueues.filter((q) => q.isProcessing && q.timeLeft === 0).length

            return (
              <Card key={facility.id} className="modern-card scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-xl">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                        ⚙️
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{facility.name}</h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge className={`status-indicator ${activeQueues > 0 ? "status-success" : "status-info"}`}>
                            <Activity className="w-3 h-3 mr-1" />
                            {activeQueues}/4 가동
                          </Badge>
                          {completedQueues > 0 && (
                            <Badge className="status-error animate-pulse">
                              <Package className="w-3 h-3 mr-1" />
                              {completedQueues}개 완료
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCraftingFacilityFavorite(facility.id)}
                      className={`w-12 h-12 rounded-xl transition-all duration-300 ${
                        isFavorite
                          ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                  </CardTitle>
                  <p className="text-gray-600 mt-2">{facility.description}</p>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Processing Queues */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-600" />
                          가공 대기열
                        </h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => claimCompletedItems(facility.id)}
                            className="btn-primary-modern text-xs"
                            disabled={completedQueues === 0}
                          >
                            <Package className="w-3 h-3 mr-1" />
                            모두 받기
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelAllQueues(facility.id)}
                            className="text-xs"
                            disabled={activeQueues === 0}
                          >
                            모두 취소
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {currentQueues.map((queue) => (
                          <div
                            key={queue.id}
                            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                              queue.isProcessing
                                ? queue.timeLeft > 0
                                  ? "border-blue-300 bg-blue-50 shadow-lg hover:shadow-xl"
                                  : "border-green-300 bg-green-50 shadow-lg hover:shadow-xl animate-pulse"
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (queue.timeLeft === 0 && queue.isProcessing) {
                                claimCompletedItems(facility.id)
                              }
                            }}
                          >
                            {queue.isProcessing ? (
                              queue.timeLeft > 0 ? (
                                <div className="text-center space-y-2">
                                  <Clock className="w-8 h-8 text-blue-600 mx-auto" />
                                  <div className="text-lg font-bold text-blue-600 font-mono">
                                    {Math.floor(queue.timeLeft / 60)}:
                                    {(queue.timeLeft % 60).toString().padStart(2, "0")}
                                  </div>
                                  <div className="text-xs text-blue-500 font-medium truncate">{queue.itemName}</div>
                                  <div className="progress-modern mt-2">
                                    <div
                                      className="progress-fill-modern"
                                      style={{
                                        width: `${((queue.totalTime - queue.timeLeft) / queue.totalTime) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      cancelQueueItem(facility.id, queue.id)
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 text-xs"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center space-y-2">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Package className="w-6 h-6 text-green-600" />
                                  </div>
                                  <div className="text-lg font-bold text-green-600">완료!</div>
                                  <div className="text-xs text-green-500 font-medium">클릭하여 수령</div>
                                </div>
                              )
                            ) : (
                              <div className="text-center space-y-2">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center mx-auto">
                                  <span className="text-gray-400 text-2xl">+</span>
                                </div>
                                <div className="text-sm text-gray-500 font-medium">대기 중</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Recipe Cards */}
                    <div className="lg:col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Hammer className="w-5 h-5 mr-2 text-orange-600" />
                        제작 가능 아이템
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {facility.recipes.map((recipe, index) => (
                          <CraftingRecipeCard
                            key={index}
                            recipe={recipe}
                            inventory={activeCharacter?.inventory || {}}
                            itemNameMap={itemNameMap}
                            onCraft={(quantity) => startProcessing(facility.id, recipe.product, quantity, recipe.time)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
