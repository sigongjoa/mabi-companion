"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sword, User } from "lucide-react"

interface Equipment {
  id: number
  name: string
  type: string
  icon: string
  stats?: string
}

interface EquipmentSlots {
  weapon?: Equipment
  shield?: Equipment
  armor?: Equipment
  gloves?: Equipment
  pants?: Equipment
  boots?: Equipment
  ring1?: Equipment
  ring2?: Equipment
  belt?: Equipment
}

const availableEquipment: Equipment[] = [
  { id: 1, name: "견습 마법사의 스태프", type: "weapon", icon: "🪄", stats: "마법 공격력 +15" },
  { id: 2, name: "가죽 갑옷", type: "armor", icon: "🦺", stats: "방어력 +20" },
  { id: 3, name: "가죽 장갑", type: "gloves", icon: "🧤", stats: "방어력 +5" },
  { id: 4, name: "나무 방패", type: "shield", icon: "🛡️", stats: "방어력 +10" },
  { id: 5, name: "힘의 반지", type: "ring", icon: "💍", stats: "힘 +3" },
  { id: 6, name: "민첩의 반지", type: "ring", icon: "💍", stats: "민첩 +3" },
  { id: 7, name: "가죽 바지", type: "pants", icon: "👖", stats: "방어력 +8" },
  { id: 8, name: "가죽 부츠", type: "boots", icon: "👢", stats: "방어력 +6" },
]

export default function EquipmentPage() {
  const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({})
  const [inventory] = useState<Equipment[]>(availableEquipment)

  const equipItem = (item: Equipment, slot: keyof EquipmentSlots) => {
    setEquippedItems((prev) => ({
      ...prev,
      [slot]: item,
    }))
  }

  const unequipItem = (slot: keyof EquipmentSlots) => {
    setEquippedItems((prev) => {
      const newEquipped = { ...prev }
      delete newEquipped[slot]
      return newEquipped
    })
  }

  const isEquipped = (itemId: number) => {
    return Object.values(equippedItems).some((item) => item?.id === itemId)
  }

  const canEquipToSlot = (itemType: string, slot: keyof EquipmentSlots) => {
    if (itemType === "ring" && (slot === "ring1" || slot === "ring2")) return true
    return itemType === slot
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">캐릭터 장비</h1>
          <p className="text-gray-600">장비 관리 및 착용 시스템</p>
        </div>
        <Sword className="w-8 h-8 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Equipment Display */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>SessionLocal - Lv.28 견습 힐러</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {/* Left column */}
                <div className="space-y-4">
                  <EquipmentSlot
                    slot="weapon"
                    item={equippedItems.weapon}
                    onEquip={(item) => equipItem(item, "weapon")}
                    onUnequip={() => unequipItem("weapon")}
                    label="무기"
                  />
                  <EquipmentSlot
                    slot="belt"
                    item={equippedItems.belt}
                    onEquip={(item) => equipItem(item, "belt")}
                    onUnequip={() => unequipItem("belt")}
                    label="벨트"
                  />
                  <EquipmentSlot
                    slot="ring1"
                    item={equippedItems.ring1}
                    onEquip={(item) => equipItem(item, "ring1")}
                    onUnequip={() => unequipItem("ring1")}
                    label="반지1"
                  />
                </div>

                {/* Center - Character */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl border border-gray-200">
                    👤
                  </div>
                  <p className="text-gray-900 text-sm mt-2 text-center">캐릭터</p>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <EquipmentSlot
                    slot="shield"
                    item={equippedItems.shield}
                    onEquip={(item) => equipItem(item, "shield")}
                    onUnequip={() => unequipItem("shield")}
                    label="방패"
                  />
                  <EquipmentSlot
                    slot="armor"
                    item={equippedItems.armor}
                    onEquip={(item) => equipItem(item, "armor")}
                    onUnequip={() => unequipItem("armor")}
                    label="갑옷"
                  />
                  <EquipmentSlot
                    slot="ring2"
                    item={equippedItems.ring2}
                    onEquip={(item) => equipItem(item, "ring2")}
                    onUnequip={() => unequipItem("ring2")}
                    label="반지2"
                  />
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex justify-center space-x-4 mt-6">
                <EquipmentSlot
                  slot="gloves"
                  item={equippedItems.gloves}
                  onEquip={(item) => equipItem(item, "gloves")}
                  onUnequip={() => unequipItem("gloves")}
                  label="장갑"
                />
                <EquipmentSlot
                  slot="pants"
                  item={equippedItems.pants}
                  onEquip={(item) => equipItem(item, "pants")}
                  onUnequip={() => unequipItem("pants")}
                  label="바지"
                />
                <EquipmentSlot
                  slot="boots"
                  item={equippedItems.boots}
                  onEquip={(item) => equipItem(item, "boots")}
                  onUnequip={() => unequipItem("boots")}
                  label="신발"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory */}
        <div>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">인벤토리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isEquipped(item.id)
                        ? "border-purple-500 bg-purple-50 opacity-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      if (isEquipped(item.id)) return

                      // Auto-equip to appropriate slot
                      if (item.type === "ring") {
                        if (!equippedItems.ring1) {
                          equipItem(item, "ring1")
                        } else if (!equippedItems.ring2) {
                          equipItem(item, "ring2")
                        }
                      } else {
                        equipItem(item, item.type as keyof EquipmentSlots)
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-gray-900 text-xs font-medium">{item.name}</p>
                      {item.stats && <p className="text-green-600 text-xs mt-1">{item.stats}</p>}
                      {isEquipped(item.id) && <Badge className="mt-1 bg-purple-600 text-xs">착용중</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface EquipmentSlotProps {
  slot: string
  item?: Equipment
  onEquip: (item: Equipment) => void
  onUnequip: () => void
  label: string
}

function EquipmentSlot({ slot, item, onEquip, onUnequip, label }: EquipmentSlotProps) {
  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
          item ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => item && onUnequip()}
      >
        {item ? <div className="text-2xl">{item.icon}</div> : <div className="text-gray-400 text-xs">빈 슬롯</div>}
      </div>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
      {item && <p className="text-gray-900 text-xs font-medium mt-1">{item.name}</p>}
    </div>
  )
}
