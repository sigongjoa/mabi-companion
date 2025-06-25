"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hammer, Clock, Package } from "lucide-react"

interface CraftingItem {
  name: string
  icon: string
}

interface Facility {
  id: string
  name: string
  level: number
  image: string
  items: CraftingItem[]
  queues: ProcessingQueue[]
}

interface ProcessingQueue {
  id: number
  isProcessing: boolean
  timeLeft: number
  totalTime: number
  itemName?: string
}

const facilitiesData: Facility[] = [
  {
    id: "metal",
    name: "금속 가공 시설",
    level: 4,
    image: "🔥",
    items: [
      { name: "철괴", icon: "⚙️" },
      { name: "강철괴", icon: "🔩" },
      { name: "합금괴", icon: "⚡" },
    ],
    queues: Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 })),
  },
  {
    id: "wood",
    name: "목재 가공 시설",
    level: 3,
    image: "🪵",
    items: [
      { name: "목재", icon: "🌳" },
      { name: "상급 목재", icon: "🌲" },
      { name: "부드러운 목재", icon: "🍃" },
    ],
    queues: Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 })),
  },
  {
    id: "potion",
    name: "약품 가공",
    level: 3,
    image: "🧪",
    items: [
      { name: "새벽 버섯 진액", icon: "🍄" },
      { name: "튼튼 버섯 가루", icon: "🟫" },
      { name: "불꽃의 결정", icon: "💎" },
    ],
    queues: Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 })),
  },
]

export default function CraftingPage() {
  const [facilities, setFacilities] = useState<Facility[]>(facilitiesData)

  const startProcessing = (facilityId: string, itemName: string, quantity: number) => {
    setFacilities((prev) =>
      prev.map((facility) => {
        if (facility.id !== facilityId) return facility

        const availableQueue = facility.queues.find((q) => !q.isProcessing)
        if (!availableQueue) return facility

        const totalTime = quantity * 5 // 5 seconds per item
        availableQueue.isProcessing = true
        availableQueue.timeLeft = totalTime
        availableQueue.totalTime = totalTime
        availableQueue.itemName = itemName

        return facility
      }),
    )
  }

  const claimAll = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((facility) => {
        if (facility.id !== facilityId) return facility

        facility.queues.forEach((queue) => {
          if (queue.timeLeft === 0 && queue.isProcessing) {
            queue.isProcessing = false
            queue.itemName = undefined
          }
        })

        return facility
      }),
    )
  }

  // Timer effect would go here in a real implementation
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setFacilities(prev => prev.map(facility => ({
  //       ...facility,
  //       queues: facility.queues.map(queue => ({
  //         ...queue,
  //         timeLeft: queue.isProcessing ? Math.max(0, queue.timeLeft - 1) : queue.timeLeft
  //       }))
  //     })))
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [])

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
        {facilities.map((facility) => (
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
                      onClick={() => claimAll(facility.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      모두 받기
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {facility.queues.map((queue) => (
                      <div
                        key={queue.id}
                        className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center text-xs ${
                          queue.isProcessing
                            ? queue.timeLeft > 0
                              ? "border-blue-500 bg-blue-50"
                              : "border-green-500 bg-green-50 cursor-pointer"
                            : "border-gray-300 bg-gray-100"
                        }`}
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
        ))}
      </div>
    </div>
  )
}

interface CraftingItemCardProps {
  item: CraftingItem
  onCraft: (quantity: number) => void
}

function CraftingItemCard({ item, onCraft }: CraftingItemCardProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4 text-center">
        <div className="text-3xl mb-2">{item.icon}</div>
        <p className="text-gray-900 text-sm font-medium mb-3">{item.name}</p>
        <div className="space-y-2">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            min="1"
            className="bg-white border-gray-300 text-gray-900 text-center"
            placeholder="수량"
          />
          <Button onClick={() => onCraft(quantity)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
            제작
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
