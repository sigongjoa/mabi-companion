"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sword, User } from "lucide-react"
import { useCharacter, Character } from "@/contexts/character-context"
import equipmentData from "@/data/equipment.json"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemDetailsPopup } from "@/components/item-details-popup"
import { logger } from "@/lib/logger"

interface Equipment {
  id: number
  name: string
  type: string
  icon: string
  stats?: string
}

interface EquipmentSlots {
  weapon?: number | null
  shield?: number | null
  armor?: number | null
  gloves?: number | null
  pants?: number | null
  boots?: number | null
  ring1?: number | null
  ring2?: number | null
  belt?: number | null
}

const allEquipment: Equipment[] = equipmentData as Equipment[];

export default function EquipmentPage() {
  const { activeCharacter, updateCharacter } = useCharacter();

  // Retrieve equipped items from activeCharacter
  const equippedItems = activeCharacter?.equippedItems || {};

  const [searchQuery, setSearchQuery] = useState("")

  // Helper to get full Equipment object from ID
  const getEquipmentById = (id: number | null | undefined): Equipment | undefined => {
    if (id === null || id === undefined) return undefined;
    return allEquipment.find(eq => eq.id === id);
  }

  const equipItem = (itemId: number, slot: keyof EquipmentSlots) => {
    if (!activeCharacter) {
      return;
    }

    const newEquippedItems = { ...activeCharacter.equippedItems, [slot]: itemId };
    updateCharacter(activeCharacter.id, { equippedItems: newEquippedItems });
  };

  const unequipItem = (slot: keyof EquipmentSlots) => {
    if (!activeCharacter) {
      return;
    }

    const newEquippedItems = { ...activeCharacter.equippedItems };
    newEquippedItems[slot] = null; // Set to null to explicitly mark as empty
    updateCharacter(activeCharacter.id, { equippedItems: newEquippedItems });
  };

  const isEquipped = (itemId: number) => {
    if (!activeCharacter) {
        return false;
    }
    const result = Object.values(activeCharacter.equippedItems).some((eqItemId) => eqItemId === itemId);
    return result;
  };

  const filteredEquipment = allEquipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.stats && item.stats.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-purple-100 rounded-2xl flex-shrink-0">
                <Sword className="w-8 h-8 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">캐릭터 장비</h1>
                <p className="text-lg text-gray-600 mt-1">장비 관리 및 착용 시스템</p>
                <p className="text-sm text-gray-500 mt-1">내 캐릭터의 장비를 효율적으로 관리하고 최적의 세팅을 찾아보세요.</p>
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
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Equipment Display */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{activeCharacter?.name || "선택된 캐릭터 없음"} - Lv.{activeCharacter?.level || 0} {activeCharacter?.profession || ""}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {/* Left column */}
                <div className="space-y-4">
                  <EquipmentSlot
                    slot="weapon"
                    equippedItemId={equippedItems.weapon}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    label="무기"
                  />
                  <EquipmentSlot
                    slot="belt"
                    equippedItemId={equippedItems.belt}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    label="벨트"
                  />
                  <EquipmentSlot
                    slot="ring1"
                    equippedItemId={equippedItems.ring1}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
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
                    equippedItemId={equippedItems.shield}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    label="방패"
                  />
                  <EquipmentSlot
                    slot="armor"
                    equippedItemId={equippedItems.armor}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    label="갑옷"
                  />
                  <EquipmentSlot
                    slot="ring2"
                    equippedItemId={equippedItems.ring2}
                    allEquipment={allEquipment}
                    onEquip={equipItem}
                    onUnequip={unequipItem}
                    label="반지2"
                  />
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex justify-center space-x-4 mt-6">
                <EquipmentSlot
                  slot="gloves"
                  equippedItemId={equippedItems.gloves}
                  allEquipment={allEquipment}
                  onEquip={equipItem}
                  onUnequip={unequipItem}
                  label="장갑"
                />
                <EquipmentSlot
                  slot="pants"
                  equippedItemId={equippedItems.pants}
                  allEquipment={allEquipment}
                  onEquip={equipItem}
                  onUnequip={unequipItem}
                  label="바지"
                />
                <EquipmentSlot
                  slot="boots"
                  equippedItemId={equippedItems.boots}
                  allEquipment={allEquipment}
                  onEquip={equipItem}
                  onUnequip={unequipItem}
                  label="신발"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipment List */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-gray-200 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-gray-900">모든 장비</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto excel-scrollbar">
              <div className="space-y-4">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((equipment) => (
                    <div
                      key={equipment.id}
                      className={`flex items-center space-x-3 p-3 rounded-md border ${isEquipped(equipment.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
                    >
                      <img src={equipment.icon} alt={equipment.name} className="w-10 h-10 object-contain" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{equipment.name}</p>
                        <p className="text-sm text-gray-600">타입: {equipment.type}</p>
                        {equipment.stats && <p className="text-sm text-gray-500">{equipment.stats}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant={isEquipped(equipment.id) ? "destructive" : "default"}
                        onClick={() => {
                          const slot = equipment.type.toLowerCase() as keyof EquipmentSlots;
                          if (isEquipped(equipment.id)) {
                            unequipItem(slot);
                          } else {
                            equipItem(equipment.id, slot);
                          }
                        }}
                      >
                        {isEquipped(equipment.id) ? "해제" : "착용"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface EquipmentSlotProps {
  slot: keyof EquipmentSlots;
  equippedItemId?: number | null;
  allEquipment: Equipment[];
  onEquip: (itemId: number, slot: keyof EquipmentSlots) => void;
  onUnequip: (slot: keyof EquipmentSlots) => void;
  label: string;
}

function EquipmentSlot({ slot, equippedItemId, allEquipment, onEquip, onUnequip, label }: EquipmentSlotProps) {
  const equippedItem = equippedItemId ? allEquipment.find(eq => eq.id === equippedItemId) : undefined;

  return (
    <div className="flex flex-col items-center p-2 border border-gray-200 rounded-lg bg-gray-50">
      <span className="text-xs font-semibold text-gray-700 mb-2">{label}</span>
      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 overflow-hidden">
        {equippedItem ? (
          <img src={equippedItem.icon} alt={equippedItem.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-2xl text-gray-400">+</span>
        )}
      </div>
      {equippedItem && (
        <p className="text-sm text-gray-800 font-medium mt-2 text-center">{equippedItem.name}</p>
      )}
      {equippedItem ? (
        <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={() => {
          onUnequip(slot);
        }}>
          해제
        </Button>
      ) : (
        <Button size="sm" className="mt-2 w-full" onClick={() => {
          alert(`'${label}' 슬롯에 착용할 아이템을 선택하세요.`);
        }}>
          착용
        </Button>
      )}
    </div>
  );
}
