"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package } from "lucide-react"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"

interface CraftingItem {
  name: string
  icon: string
  description: string
}

interface FacilityData {
  id: string
  name: string
  level: number
  image: string
  items: CraftingItem[]
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
  console.debug("CraftingPage rendered.");
  const { activeCharacter, updateCharacter } = useCharacter();

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
          updatedQueues[facilityId] = updatedQueues[facilityId].map((queue) => {
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

  const startProcessing = (facilityId: string, itemName: string, quantity: number) => {
    console.debug(`Entering startProcessing - facilityId: ${facilityId}, itemName: ${itemName}, quantity: ${quantity}`);
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
    const totalTime = quantity * 5; // 5 seconds per item
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

  const claimAll = (facilityId: string) => {
    console.debug(`Entering claimAll - facilityId: ${facilityId}`);
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">가공 시설</h1>
          <p className="text-gray-600">원재료를 상위 아이템으로 가공하고 남은 시간을 확인하세요</p>
        </div>
        <Hammer className="w-8 h-8 text-purple-600" />
      </div>

      <div className="space-y-8">
        {allCraftingFacilitiesData.map((facility) => {
          const currentQueues = activeCharacter?.craftingQueues[facility.id] || Array(4).fill(null).map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 }));
          console.debug(`Rendering facility ${facility.name} (${facility.id}) with queues:`, currentQueues);

          return (
            <Card key={facility.id} className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-3">
                  <span className="text-3xl">{facility.image}</span>
                  <span>
                    {facility.name} Lv. {facility.level}
                  </span>
                </CardTitle>
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
                            claimAll(facility.id);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        모두 받기
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
                                claimAll(facility.id); // Claim all for simplicity
                            }
                          }}
                        >
                          {queue.isProcessing ? (
                            queue.timeLeft > 0 ? (
                              <>
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600 font-mono">{queue.timeLeft}s</span>
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
                      {facility.items.map((item, index) => (
                        <CraftingItemCard
                          key={index}
                          item={item}
                          onCraft={(quantity) => startProcessing(facility.id, item.name, quantity)}
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

interface CraftingItemCardProps {
  item: CraftingItem
  onCraft: (quantity: number) => void
}

function CraftingItemCard({ item, onCraft }: CraftingItemCardProps) {
  console.debug(`Entering CraftingItemCard for item: ${item.name}`);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.debug(`handleQuantityChange called with value: ${e.target.value}`);
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
    console.debug(`Quantity updated to: ${isNaN(value) || value < 1 ? 1 : value}`);
  };

  return (
    <Card className="flex flex-col items-center p-4 bg-white border-gray-200 shadow-sm">
      <div className="text-4xl mb-2">{item.icon}</div>
      <h4 className="font-semibold text-gray-800 text-center">{item.name}</h4>
      <p className="text-gray-600 text-sm text-center mb-4">{item.description}</p>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="w-24 text-center"
        />
        <Button onClick={() => {
            console.debug(`'활성화' button clicked for item: ${item.name}, quantity: ${quantity}`);
            onCraft(quantity);
        }} className="bg-purple-600 hover:bg-purple-700">
          활성화
        </Button>
      </div>
    </Card>
  );
}
