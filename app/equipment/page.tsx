"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sword, User } from "lucide-react"
import { useCharacter, Character } from "@/contexts/character-context"
import equipmentData from "@/data/equipment.json"

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
  console.debug("EquipmentPage rendered.");
  const { activeCharacter, updateCharacter } = useCharacter();

  // Retrieve equipped items from activeCharacter
  const equippedItems = activeCharacter?.equippedItems || {};
  console.debug("Current equippedItems from activeCharacter:", equippedItems);

  // Helper to get full Equipment object from ID
  const getEquipmentById = (id: number | null | undefined): Equipment | undefined => {
    if (id === null || id === undefined) return undefined;
    return allEquipment.find(eq => eq.id === id);
  }

  const equipItem = (itemId: number, slot: keyof EquipmentSlots) => {
    console.debug(`Entering equipItem - itemId: ${itemId}, slot: ${slot}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot equip item.");
      return;
    }

    const newEquippedItems = { ...activeCharacter.equippedItems, [slot]: itemId };
    updateCharacter(activeCharacter.id, { equippedItems: newEquippedItems });
    console.debug(`Item ${itemId} equipped to ${slot}. New equippedItems:`, newEquippedItems);
  };

  const unequipItem = (slot: keyof EquipmentSlots) => {
    console.debug(`Entering unequipItem - slot: ${slot}`);
    if (!activeCharacter) {
      console.warn("No active character, cannot unequip item.");
      return;
    }

    const newEquippedItems = { ...activeCharacter.equippedItems };
    newEquippedItems[slot] = null; // Set to null to explicitly mark as empty
    updateCharacter(activeCharacter.id, { equippedItems: newEquippedItems });
    console.debug(`Item from ${slot} unequipped. New equippedItems:`, newEquippedItems);
  };

  const isEquipped = (itemId: number) => {
    console.debug(`Entering isEquipped - itemId: ${itemId}`);
    if (!activeCharacter) {
        console.debug("No active character, isEquipped returning false.");
        return false;
    }
    const result = Object.values(activeCharacter.equippedItems).some((eqItemId) => eqItemId === itemId);
    console.debug(`Exiting isEquipped for item ${itemId}, result: ${result}`);
    return result;
  };

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

        {/* Inventory */}
        <div>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">인벤토리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {allEquipment.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isEquipped(item.id)
                        ? "border-purple-500 bg-purple-50 opacity-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      console.debug(`Inventory item ${item.name} clicked. isEquipped: ${isEquipped(item.id)}`);
                      if (isEquipped(item.id)) {
                        console.debug("Item already equipped, not doing anything.");
                        return;
                      }

                      // Auto-equip to appropriate slot
                      if (item.type === "ring") {
                        if (equippedItems.ring1 === null) {
                          equipItem(item.id, "ring1");
                        } else if (equippedItems.ring2 === null) {
                          equipItem(item.id, "ring2");
                        } else {
                            console.debug("Both ring slots are full.");
                        }
                      } else {
                        equipItem(item.id, item.type as keyof EquipmentSlots);
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
  slot: keyof EquipmentSlots;
  equippedItemId?: number | null;
  allEquipment: Equipment[];
  onEquip: (itemId: number, slot: keyof EquipmentSlots) => void;
  onUnequip: (slot: keyof EquipmentSlots) => void;
  label: string;
}

function EquipmentSlot({ slot, equippedItemId, allEquipment, onEquip, onUnequip, label }: EquipmentSlotProps) {
  console.debug(`EquipmentSlot rendered - slot: ${slot}, equippedItemId: ${equippedItemId}`);
  const item = equippedItemId ? allEquipment.find(eq => eq.id === equippedItemId) : undefined;
  console.debug(`EquipmentSlot - found item: ${item?.name || "None"}`);

  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
          item ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => {
            console.debug(`EquipmentSlot click - slot: ${slot}, current item: ${item?.name || "None"}`);
            if (item) {
                console.debug("Item found, unequipping.");
                onUnequip(slot);
            } else {
                console.debug("No item, slot is empty. No action.");
                // No action for empty slot click, as equip comes from inventory
            }
        }}
      >
        {item ? <div className="text-2xl">{item.icon}</div> : <div className="text-gray-400 text-xs">빈 슬롯</div>}
      </div>
      <p className="text-gray-500 text-xs mt-1">{label}</p>
      {item && <p className="text-gray-900 text-xs font-medium mt-1">{item.name}</p>}
    </div>
  )
}
