"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package, Star } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import allItemsData from "@/data/items.json"

// Define the structure for a material within a recipe
interface Material {
  item: string; // Name of the item
  quantity: number;
}

// Define the structure for a single crafting recipe
interface Recipe {
  product: string;
  materials: Material[];
  time: number; // in seconds
  level_condition: number; // Facility level required
}

// Update FacilityData to reflect the new JSON structure
interface FacilityData {
  id: string;
  name: string;
  description: string;
  recipes: Recipe[]; // Array of recipes for this facility
}

interface ProcessingQueue {
  id: number
  isProcessing: boolean
  timeLeft: number
  totalTime: number
  itemName?: string
}

const allCraftingFacilitiesData: FacilityData[] = craftingFacilitiesData as FacilityData[];

export default function CraftingPage() {
  console.debug("Entering CraftingPage component.");
  const { activeCharacter, updateCharacter, toggleCraftingFacilityFavorite } = useCharacter();
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // New state for favorite filter

  // Get all unique facility IDs for filter buttons
  const facilityTypes = allCraftingFacilitiesData.map(f => ({ id: f.id, name: f.name }));
  console.debug("Available facility types for filtering:", facilityTypes);

  // Timer effect
  useEffect(() => {
    console.debug("CraftingPage useEffect: Setting up timer interval.");
    const interval = setInterval(() => {
      if (!activeCharacter) {
        console.debug("No active character, stopping timer interval.");
        return;
      }
      console.debug("Timer tick for activeCharacter.id:", activeCharacter.id);
      const updatedQueues = { ...activeCharacter.craftingQueues };

      let shouldUpdate = false;
      for (const facilityId in updatedQueues) {
        if (Object.prototype.hasOwnProperty.call(updatedQueues, facilityId)) {
          updatedQueues[facilityId] = updatedQueues[facilityId].map((queue: ProcessingQueue) => {
            if (queue.isProcessing && queue.timeLeft > 0) {
              shouldUpdate = true;
              return { ...queue, timeLeft: Math.max(0, queue.timeLeft - 1) };
            }
            return queue;
          });
        }
      }

      if (shouldUpdate) {
        console.debug("Updating character with new queue times.", updatedQueues);
        updateCharacter(activeCharacter.id, { craftingQueues: updatedQueues });
      }
    }, 1000);

    return () => {
      console.debug("CraftingPage useEffect cleanup: Clearing timer interval.");
      clearInterval(interval);
    };
  }, [activeCharacter, updateCharacter]); // Depend on activeCharacter and updateCharacter

  // Create a map from item name to item ID for efficient lookup
  const allItems: Record<string, { id: number; name: string }> = allItemsData as Record<string, { id: number; name: string }>;
  const itemNameMap: Record<string, number> = {};
  for (const key in allItems) {
    if (Object.prototype.hasOwnProperty.call(allItems, key)) {
      const item = allItems[key];
      itemNameMap[item.name] = item.id;
    }
  }
  console.debug("Created itemNameMap:", itemNameMap);

  const startProcessing = (facilityId: string, itemName: string, quantity: number, recipeTime: number) => {
    console.debug(`Entering startProcessing - facilityId: ${facilityId}, itemName: ${itemName}, quantity: ${quantity}, recipeTime: ${recipeTime}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot start processing.");
      return;
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId];
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`);
      return;
    }

    const availableQueueIndex = currentFacilityQueues.findIndex((q) => !q.isProcessing);

    if (availableQueueIndex === -1) {
      console.warn(`No available queue in facility ${facilityId}.`);
      return;
    }

    const newQueues = [...currentFacilityQueues];
    const totalTime = quantity * recipeTime; // Use recipeTime here
    newQueues[availableQueueIndex] = {
      id: newQueues[availableQueueIndex].id,
      isProcessing: true,
      timeLeft: totalTime,
      totalTime: totalTime,
      itemName: itemName,
    };

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    };
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues });
    console.debug(`Started processing ${itemName} in facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues);
  };

  const claimCompletedItems = (facilityId: string) => {
    console.debug(`Entering claimCompletedItems - facilityId: ${facilityId}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot claim items.");
      return;
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId];
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`);
      return;
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.timeLeft === 0 && queue.isProcessing) {
        console.debug(`Claiming item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`);
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 };
      }
      return queue;
    });

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    };
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues });
    console.debug(`Claimed all items from facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues);
  };

  const cancelQueueItem = (facilityId: string, queueId: number) => {
    console.debug(`Entering cancelQueueItem - facilityId: ${facilityId}, queueId: ${queueId}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot cancel queue item.");
      return;
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId];
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`);
      return;
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      if (queue.id === queueId) {
        console.debug(`Cancelling item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`);
        return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 };
      }
      return queue;
    });

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    };
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues });
    console.debug(`Cancelled queue item ${queueId} in facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues);
  };

  const cancelAllQueues = (facilityId: string) => {
    console.debug(`Entering cancelAllQueues - facilityId: ${facilityId}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot cancel all queues.");
      return;
    }

    const currentFacilityQueues = activeCharacter.craftingQueues[facilityId];
    if (!currentFacilityQueues) {
      console.warn(`Facility ${facilityId} not found in active character's crafting queues.`);
      return;
    }

    const newQueues = currentFacilityQueues.map((queue) => {
      console.debug(`Cancelling item ${queue.itemName} from queue ${queue.id} in facility ${facilityId}.`);
      return { ...queue, isProcessing: false, itemName: undefined, timeLeft: 0, totalTime: 0 };
    });

    const updatedCraftingQueues = {
      ...activeCharacter.craftingQueues,
      [facilityId]: newQueues,
    };
    updateCharacter(activeCharacter.id, { craftingQueues: updatedCraftingQueues });
    console.debug(`Cancelled all queues in facility ${facilityId}. New craftingQueues:`, updatedCraftingQueues);
  };

  const handleFilterChange = (value: string[]) => {
    console.debug("Filter change detected:", value);
    setSelectedFacilityIds(value);
  };

  const filteredFacilities = allCraftingFacilitiesData.filter(facility => {
    const matchesCategory = selectedFacilityIds.length === 0 || selectedFacilityIds.includes(facility.id);
    const matchesFavorite = !showFavoritesOnly || activeCharacter?.favoriteCraftingFacilities[facility.id];
    console.debug(`Facility ${facility.name}: matchesCategory=${matchesCategory}, matchesFavorite=${matchesFavorite}`);
    return matchesCategory && matchesFavorite;
  });
  console.debug("Filtered facilities to display:", filteredFacilities.map(f => f.name));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">가공 시설</h1>
          <p className="text-gray-600">원재료를 상위 아이템으로 가공하고 남은 시간을 확인하세요</p>
        </div>
        <Hammer className="w-8 h-8 text-purple-600" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <ToggleGroup type="multiple" value={selectedFacilityIds} onValueChange={handleFilterChange}>
          {facilityTypes.map((type) => (
            <ToggleGroupItem key={type.id} value={type.id} aria-label={`${type.name} 토글`}>
              {type.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => {
            console.debug(`Toggle favorites only button clicked. Current: ${showFavoritesOnly}`);
            setShowFavoritesOnly(!showFavoritesOnly);
          }}
          className="px-4 py-2 rounded-md transition-colors duration-200"
        >
          <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? "fill-current text-yellow-400" : "text-yellow-400"}`} />
          즐겨찾기만 보기
        </Button>
      </div>

      <div className="space-y-8">
        {filteredFacilities.map((facility) => {
          console.debug(`Processing facility: ${facility.name}`);
          const currentQueues = activeCharacter?.craftingQueues[facility.id] || Array(4).fill(null).map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 }));
          console.debug(`Rendering facility ${facility.name} (${facility.id}) with queues:`, currentQueues);

          const isFavorite = activeCharacter?.favoriteCraftingFacilities[facility.id] || false;

          return (
            <Card key={facility.id} className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-3 justify-between">
                  <span className="flex items-center space-x-3">
                    <span className="text-3xl">⚙️</span> {/* Icon based on facility type, hardcoded for now */}
                    <span>
                      {facility.name}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.debug(`Favorite button clicked for facility: ${facility.id}. Current favorite status: ${isFavorite}`);
                      toggleCraftingFacilityFavorite(facility.id);
                    }}
                    className={`${isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}`}
                  >
                    <Star className={`${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">{facility.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Processing Queues */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-900 font-semibold">가공 대기열</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                            console.debug(`Claim all button clicked for facility: ${facility.id}`);
                            claimCompletedItems(facility.id);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        모두 받기
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                            console.debug(`Cancel all button clicked for facility: ${facility.id}`);
                            cancelAllQueues(facility.id);
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        모두 취소
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentQueues.map((queue) => (
                        <div
                          key={queue.id}
                          className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center text-xs ${
                            queue.isProcessing
                              ? queue.timeLeft > 0
                                ? "border-blue-500 bg-blue-50"
                                : "border-green-500 bg-green-50 cursor-pointer"
                              : "border-gray-300 bg-gray-100"
                          }`}
                          onClick={() => {
                            if (queue.timeLeft === 0 && queue.isProcessing) {
                                console.debug(`Queue ${queue.id} in facility ${facility.id} clicked to claim.`);
                                claimCompletedItems(facility.id); // Claim all for simplicity
                            }
                          }}
                        >
                          {queue.isProcessing ? (
                            queue.timeLeft > 0 ? (
                              <>
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600 font-mono">{queue.timeLeft}s</span>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e) => {
                                    console.debug(`Cancel individual queue item ${queue.id} in facility ${facility.id}`);
                                    e.stopPropagation(); // Prevent claiming when cancelling
                                    cancelQueueItem(facility.id, queue.id);
                                  }}
                                  className="absolute bottom-1"
                                >
                                  X
                                </Button>
                              </>
                            ) : (
                              <>
                                <Package className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 text-xs">완료</span>
                              </>
                            )
                          ) : (
                            <span className="text-gray-500">대기</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Craftable Items */}
                  <div className="lg:col-span-2">
                    <h3 className="text-gray-900 font-semibold mb-4">제작 가능 아이템</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          );
        })}
      </div>
    </div>
  );
}

interface CraftingRecipeCardProps {
  recipe: Recipe;
  inventory: Record<number, number>;
  itemNameMap: Record<string, number>;
  onCraft: (quantity: number, recipeTime: number) => void;
}

function CraftingRecipeCard({ recipe, onCraft, inventory, itemNameMap }: CraftingRecipeCardProps) {
  console.debug(`Rendering CraftingRecipeCard for recipe: ${recipe.product}`);
  const [quantity, setQuantity] = useState(1);

  const calculateCraftableQuantity = () => {
    console.debug(`Entering calculateCraftableQuantity for ${recipe.product}. Current inventory:`, inventory);
    let maxCrafts = Infinity;
    for (const material of recipe.materials) {
      console.debug(`Checking material: ${material.item}`);
      const materialId = itemNameMap[material.item];
      console.debug(`Material ID for ${material.item}: ${materialId}`);
      if (materialId === undefined) {
        console.warn(`Material '${material.item}' not found in itemNameMap. Cannot calculate craftable quantity.`);
        return 0; // If material not found, assume cannot craft
      }
      const ownedQuantity = inventory[materialId] || 0;
      console.debug(`Material ${material.item} (ID: ${materialId}): Owned ${ownedQuantity}, Required ${material.quantity}`);
      if (ownedQuantity < material.quantity) {
        console.debug(`Not enough material ${material.item}. Owned: ${ownedQuantity}, Required: ${material.quantity}. Max crafts: 0`);
        return 0; // Cannot craft even once
      }
      maxCrafts = Math.min(maxCrafts, Math.floor(ownedQuantity / material.quantity));
      console.debug(`Intermediate maxCrafts after checking ${material.item}: ${maxCrafts}`);
    }
    console.debug(`Exiting calculateCraftableQuantity for ${recipe.product}. Max crafts: ${maxCrafts}`);
    return maxCrafts;
  };

  const craftableQuantity = calculateCraftableQuantity();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.debug(`Crafting quantity changed for ${recipe.product}: ${e.target.value}`);
    const newQuantity = Number(e.target.value);
    setQuantity(Math.max(1, Math.min(newQuantity, craftableQuantity))); // Ensure quantity is within bounds
  };

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-gray-900 flex items-center justify-between">
          <span>{recipe.product}</span>
          <Badge variant="secondary">Lv.{recipe.level_condition}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-gray-600 mb-2">
          <p>재료:</p>
          <ul className="list-disc list-inside ml-2">
            {recipe.materials.map((material, matIndex) => {
              const materialId = itemNameMap[material.item];
              const ownedQuantity = inventory[materialId] || 0;
              const isEnough = ownedQuantity >= material.quantity;
              return (
                <li key={matIndex}>
                  {material.item} x {material.quantity}{' '}
                  <span className={isEnough ? "text-green-600" : "text-red-600"}>
                    ({ownedQuantity}개 보유)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          시간: {recipe.time}초
          {craftableQuantity > 0 && (
            <span className="ml-2 text-blue-600 font-semibold">({craftableQuantity}개 제작 가능)</span>
          )}
          {craftableQuantity === 0 && (
            <span className="ml-2 text-red-600 font-semibold">(재료 부족)</span>
          )}
        </p>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={craftableQuantity > 0 ? craftableQuantity : 1}
            disabled={craftableQuantity === 0}
            className="w-24 form-input"
          />
          <Button
            onClick={() => {
              console.debug(`Craft button clicked for ${recipe.product}, quantity: ${quantity}`);
              onCraft(quantity, recipe.time);
            }}
            disabled={craftableQuantity === 0 || quantity === 0}
            className="form-button-primary"
          >
            제작
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
