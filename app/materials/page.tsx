"use client"

import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { Plus, Minus, Package } from "lucide-react"

import allItemsData from "@/data/items.json"

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
}

const allItems: Record<string, Item> = allItemsData as Record<string, Item>;

const materialCategories = [
  "광물", "목재", "가죽", "옷감", "버섯", "결정", "마법", "파편", "꽃", "요리재료"
];

export default function MaterialsPage() {
  console.debug("MaterialsPage rendered.");
  const { activeCharacter, viewMode, updateCharacter } = useCharacter();

  const getMaterialQuantity = (materialId: number): number => {
    if (!activeCharacter) {
      console.warn("No active character to get material quantity.");
      return 0;
    }
    return activeCharacter.inventory[materialId] || 0;
  };

  const updateMaterialQuantity = (materialId: number, change: number) => {
    console.debug(`Entering updateMaterialQuantity for material ${materialId} with change ${change}`);
    if (!activeCharacter || viewMode !== "single") {
      console.warn("Cannot update material quantity: No active character or not in single view mode.");
      return;
    }

    const currentQuantity = activeCharacter.inventory[materialId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    const newInventory = { ...activeCharacter.inventory };
    if (newQuantity === 0) {
      delete newInventory[materialId];
    } else {
      newInventory[materialId] = newQuantity;
    }

    updateCharacter(activeCharacter.id, { inventory: newInventory });
    console.debug(`Updated material ${materialId} to quantity ${newQuantity}.`);
  };

  // Filter items to only show materials based on categories
  const filteredMaterials = Object.values(allItems).filter(item => materialCategories.includes(item.category));
  const sortedMaterials = filteredMaterials.sort((a, b) => a.id - b.id);

  return (
    <div className="min-h-screen" style={{ paddingTop: "120px" }}>
      <div className="content-padding section-spacing">
        <CharacterScopedHeader
          title="재료 관리"
          description="캐릭터가 소유한 재료 아이템 수량을 관리합니다."
          icon={Package}
        />

        <Card className="card section-spacing">
          <CardHeader className="card-header">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>재료 인벤토리</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedMaterials.map((material) => (
              <Card key={material.id} className="card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{material.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-gray-900 text-sm">{material.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {material.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{material.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMaterialQuantity(material.id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold text-gray-900 text-lg">
                        {getMaterialQuantity(material.id)}개
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMaterialQuantity(material.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 