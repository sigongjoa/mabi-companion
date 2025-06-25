"use client"

import { useState } from "react"
import { useCharacter, Character } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Plus, Minus, Package, Sparkles } from "lucide-react"

import allItemsData from "@/data/items.json"
import recipesData from "@/data/recipes.json"

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

interface Recipe {
  resultId: number
  materials: { itemId: number; quantity: number }[]
}

const allItems: Record<string, Item> = allItemsData as Record<string, Item>

const recipes: Recipe[] = recipesData as Recipe[]

const categories = ["전체", "소모품", "음식", "재료"]

export default function InventoryPage() {
  const { activeCharacter, viewMode, characters, updateCharacter } = useCharacter()
  console.debug(`InventoryPage rendered - viewMode: ${viewMode}, activeCharacter: ${activeCharacter?.id}`);
  const [selectedCategory, setSelectedCategory] = useState("전체")
  console.debug(`Initial selectedCategory: ${selectedCategory}`);

  // Get inventory data based on view mode
  const getInventoryData = () => {
    console.debug(`Entering getInventoryData - viewMode: ${viewMode}, activeCharacter: ${activeCharacter?.id}`);
    let currentInventoryMap = new Map<number, number>(); // Initialize map
    if (viewMode === "single" && activeCharacter) {
      console.debug(`getInventoryData - single view for character: ${activeCharacter.id}`);
      currentInventoryMap = new Map(Object.entries(activeCharacter.inventory as Record<string, number>).map(([k, v]) => [Number(k), v]))
      console.debug("Exiting getInventoryData - single view, currentInventoryMap:", currentInventoryMap);
    } else if (viewMode === "all") {
      console.debug("getInventoryData - all view");
      // Aggregate all character inventories
      const aggregated = new Map<number, number>()
      characters.forEach((character: Character) => {
        console.debug(`Processing character ${character.id} for aggregated inventory`);
        Object.entries(character.inventory as Record<string, number>).forEach(([itemId, quantity]: [string, number]) => {
          const id = Number(itemId)
          console.debug(`Processing item ${id} with quantity ${quantity} from character ${character.id}'s inventory`);
          aggregated.set(id, (aggregated.get(id) || 0) + quantity)
          console.debug(`Aggregated quantity for item ${id}: ${aggregated.get(id)}`);
        })
      })
      currentInventoryMap = aggregated;
      console.debug("Exiting getInventoryData - all view, aggregated inventory:", currentInventoryMap);
    } else {
      console.debug("Exiting getInventoryData - no active character or viewMode is not single/all");
    }
    return currentInventoryMap;
  }

  const inventory = getInventoryData()
  console.debug("Current inventory state:", inventory);

  const updateQuantity = (itemId: number, change: number) => {
    console.debug(`Entering updateQuantity for item ${itemId} with change ${change}`);
    if (viewMode === "single" && activeCharacter) {
      console.debug("updateQuantity - single view mode and active character exists");
      const currentQuantity = activeCharacter.inventory[itemId] || 0
      console.debug(`updateQuantity - currentQuantity for item ${itemId}: ${currentQuantity}`);
      const newQuantity = Math.max(0, currentQuantity + change)
      console.debug(`updateQuantity - newQuantity for item ${itemId}: ${newQuantity}`);

      const newInventory = { ...activeCharacter.inventory }
      console.debug("updateQuantity - newInventory before update:", newInventory);
      if (newQuantity === 0) {
        console.debug(`updateQuantity - newQuantity is 0, deleting item ${itemId} from inventory`);
        delete newInventory[itemId]
      } else {
        console.debug(`updateQuantity - setting newQuantity for item ${itemId}: ${newQuantity}`);
        newInventory[itemId] = newQuantity
      }
      console.debug("updateQuantity - newInventory after update:", newInventory);

      updateCharacter(activeCharacter.id, { inventory: newInventory })
      console.debug("Exiting updateQuantity - character inventory updated");
    }
  }

  const canCraft = (recipe: Recipe) => {
    console.debug(`Entering canCraft for recipe resultId: ${recipe.resultId}`);
    const result = recipe.materials.every((material) => {
      const currentInventory = inventory.get(material.itemId) || 0;
      const requiredQuantity = material.quantity;
      console.debug(`canCraft - checking material ${material.itemId}: current ${currentInventory}, required ${requiredQuantity}`);
      return currentInventory >= requiredQuantity;
    });
    console.debug(`Exiting canCraft for recipe ${recipe.resultId}, result: ${result}`);
    return result;
  }

  const craftItem = (recipe: Recipe) => {
    console.debug(`Entering craftItem for recipe resultId: ${recipe.resultId}`);
    if (!canCraft(recipe) || viewMode !== "single" || !activeCharacter) {
      console.debug("craftItem - cannot craft or conditions not met, returning");
      return
    }
    console.debug("craftItem - crafting conditions met");

    const newInventory = { ...activeCharacter.inventory }
    console.debug("craftItem - newInventory before crafting:", newInventory);

    // 재료 소모
    recipe.materials.forEach((material) => {
      const current = newInventory[material.itemId] || 0
      newInventory[material.itemId] = current - material.quantity
      console.debug(`craftItem - consumed material ${material.itemId}, new quantity: ${newInventory[material.itemId]}`);
    })

    // 결과물 추가
    const currentResult = newInventory[recipe.resultId] || 0
    newInventory[recipe.resultId] = currentResult + 1
    console.debug(`craftItem - added result item ${recipe.resultId}, new quantity: ${newInventory[recipe.resultId]}`);

    updateCharacter(activeCharacter.id, { inventory: newInventory })
    console.debug("Exiting craftItem - character inventory updated");
  }

  const filteredItems = Array.from(inventory.entries())
    .map(([id, quantity]) => {
      console.debug(`Filtering item with ID: ${id}, quantity: ${quantity}`);
      const item = allItems[id.toString()];
      if (!item) {
        console.warn(`Item with ID ${id} not found in allItems. Skipping.`);
        return null; // Item not found, skip this entry
      }
      const filteredItem = { ...item, quantity };
      console.debug("Filtered item:", filteredItem);
      return filteredItem;
    })
    .filter((item): item is (Item & { quantity: number }) => {
      console.debug(`Checking item for filter: ${item?.name}, category: ${item?.category}, selectedCategory: ${selectedCategory}`);
      return item !== null && (selectedCategory === "전체" || item.category === selectedCategory);
    });
  console.debug("Final filteredItems:", filteredItems);

  const craftableRecipes = recipes.filter(canCraft)
  console.debug("Craftable recipes:", craftableRecipes);

  return (
    <div className="min-h-screen" style={{ paddingTop: "120px" }}>
      <div className="content-padding section-spacing">
        <CharacterScopedHeader
          title="아이템 관리"
          description={
            viewMode === "single" ? "선택된 캐릭터의 인벤토리 관리 및 제작 시스템" : "모든 캐릭터의 통합 인벤토리 현황"
          }
          icon={Package}
        />

        <Tabs defaultValue="inventory" className="section-spacing">
          <div className="card">
            <div className="card-content">
              <TabsList className="bg-gray-100 border border-gray-200">
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  인벤토리
                </TabsTrigger>
                <TabsTrigger
                  value="crafting"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  disabled={viewMode === "all"}
                >
                  제작 가능 ({craftableRecipes.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="inventory" className="section-spacing">
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>{viewMode === "single" ? "개인 인벤토리" : "통합 인벤토리"}</span>
                  </CardTitle>
                  <FavoriteToggle id="inventory-main" name="인벤토리 메인" type="inventory" />
                </div>
                <div className="text-sm text-gray-600">
                  총 {Array.from(inventory.values()).reduce((a, b) => a + b, 0)}개 아이템
                  {viewMode === "all" && ` (${characters.length}명의 캐릭터)`}
                </div>
              </CardHeader>
            </Card>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "form-button-primary" : "form-button-secondary"}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-gray-900 text-sm">{item.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <FavoriteToggle id={`item-${item.id}`} name={item.name} type="item" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      {viewMode === "single" ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 p-0 form-button-secondary"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center text-gray-900 font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 p-0 form-button-secondary"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                          <p className="text-xs text-gray-500">총 보유량</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">가격</p>
                        <p className="text-sm text-yellow-600 font-medium">{item.price}G</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crafting" className="section-spacing">
            <Card className="card">
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>제작 가능 아이템</span>
                  </CardTitle>
                  <FavoriteToggle id="crafting-main" name="제작 시스템" type="crafting" />
                </div>
              </CardHeader>
            </Card>

            {craftableRecipes.length === 0 ? (
              <Card className="card">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">제작 가능한 아이템이 없습니다.</p>
                  <p className="text-gray-500 text-sm">필요한 재료를 수집해보세요.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {craftableRecipes.map((recipe) => {
                  const resultItem = allItems[recipe.resultId.toString()]
                  return (
                    <Card key={recipe.resultId} className="card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{resultItem.icon}</div>
                            <div>
                              <CardTitle className="text-gray-900 text-sm">{resultItem.name}</CardTitle>
                              <Badge className="status-complete text-xs">제작 가능</Badge>
                            </div>
                          </div>
                          <FavoriteToggle
                            id={`recipe-${recipe.resultId}`}
                            name={`${resultItem.name} 제작`}
                            type="recipe"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">필요 재료:</p>
                            <div className="space-y-1">
                              {recipe.materials.map((material) => {
                                const materialItem = allItems[material.itemId.toString()]
                                const owned = inventory.get(material.itemId) || 0
                                return (
                                  <div key={material.itemId} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                      {materialItem.icon} {materialItem.name}
                                    </span>
                                    <span className={owned >= material.quantity ? "text-green-600" : "text-red-500"}>
                                      {owned}/{material.quantity}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <Button onClick={() => craftItem(recipe)} className="w-full form-button-primary" size="sm">
                            제작하기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
