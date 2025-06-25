"use client"

import { useState } from "react"
import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Plus, Minus, Package, Sparkles } from "lucide-react"

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

const allItems: Record<number, Item> = {
  1: {
    id: 1,
    name: "붕대",
    category: "소모품",
    icon: "🩹",
    description: "가벼운 상처를 치료하는 데 사용되는 기본적인 붕대.",
    weight: 0.1,
    price: 5,
    tradeable: true,
    sellable: true,
  },
  2: {
    id: 2,
    name: "고기",
    category: "음식",
    icon: "🥩",
    description: "요리의 기본 재료. 구워먹으면 허기를 채워준다.",
    weight: 0.5,
    price: 10,
    tradeable: true,
    sellable: true,
  },
  3: {
    id: 3,
    name: "마나 포션",
    category: "소모품",
    icon: "🧪",
    description: "마나를 즉시 회복시켜주는 신비한 물약.",
    weight: 0.2,
    price: 50,
    tradeable: true,
    sellable: true,
  },
  4: {
    id: 4,
    name: "거미줄",
    category: "재료",
    icon: "🕸️",
    description: "옷감이나 붕대를 만드는 데 사용되는 질긴 거미줄.",
    weight: 0.1,
    price: 2,
    tradeable: true,
    sellable: true,
  },
  5: {
    id: 5,
    name: "생가죽",
    category: "재료",
    icon: "🦌",
    description: "무두질하여 가죽으로 만들 수 있는 동물의 생가죽.",
    weight: 1.0,
    price: 8,
    tradeable: true,
    sellable: true,
  },
  10: {
    id: 10,
    name: "질긴 붕대",
    category: "소모품",
    icon: "🩹",
    description: "일반 붕대보다 더 효과가 좋은 붕대. 응급처치에 유용하다.",
    weight: 0.2,
    price: 15,
    tradeable: true,
    sellable: true,
  },
  11: {
    id: 11,
    name: "최고급 가죽",
    category: "재료",
    icon: "🦌",
    description: "장인이 무두질한 최고급 가죽. 방어구 제작에 쓰인다.",
    weight: 0.8,
    price: 150,
    tradeable: true,
    sellable: true,
  },
  12: {
    id: 12,
    name: "스테이크",
    category: "음식",
    icon: "🥩",
    description: "먹음직스럽게 잘 구워진 스테이크. 포만감을 크게 채워준다.",
    weight: 0.4,
    price: 45,
    tradeable: true,
    sellable: true,
  },
}

const recipes: Recipe[] = [
  {
    resultId: 10,
    materials: [
      { itemId: 1, quantity: 5 },
      { itemId: 4, quantity: 10 },
    ],
  },
  { resultId: 11, materials: [{ itemId: 5, quantity: 50 }] },
  { resultId: 12, materials: [{ itemId: 2, quantity: 10 }] },
]

const categories = ["전체", "소모품", "음식", "재료"]

export default function InventoryPage() {
  const { activeCharacter, viewMode, characters, updateCharacter } = useCharacter()
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // Get inventory data based on view mode
  const getInventoryData = () => {
    if (viewMode === "single" && activeCharacter) {
      return new Map(Object.entries(activeCharacter.inventory).map(([k, v]) => [Number(k), v]))
    } else if (viewMode === "all") {
      // Aggregate all character inventories
      const aggregated = new Map<number, number>()
      characters.forEach((character) => {
        Object.entries(character.inventory).forEach(([itemId, quantity]) => {
          const id = Number(itemId)
          aggregated.set(id, (aggregated.get(id) || 0) + quantity)
        })
      })
      return aggregated
    }
    return new Map<number, number>()
  }

  const inventory = getInventoryData()

  const updateQuantity = (itemId: number, change: number) => {
    if (viewMode === "single" && activeCharacter) {
      const currentQuantity = activeCharacter.inventory[itemId] || 0
      const newQuantity = Math.max(0, currentQuantity + change)

      const newInventory = { ...activeCharacter.inventory }
      if (newQuantity === 0) {
        delete newInventory[itemId]
      } else {
        newInventory[itemId] = newQuantity
      }

      updateCharacter(activeCharacter.id, { inventory: newInventory })
    }
  }

  const canCraft = (recipe: Recipe) => {
    return recipe.materials.every((material) => (inventory.get(material.itemId) || 0) >= material.quantity)
  }

  const craftItem = (recipe: Recipe) => {
    if (!canCraft(recipe) || viewMode !== "single" || !activeCharacter) return

    const newInventory = { ...activeCharacter.inventory }

    // 재료 소모
    recipe.materials.forEach((material) => {
      const current = newInventory[material.itemId] || 0
      newInventory[material.itemId] = current - material.quantity
    })

    // 결과물 추가
    const currentResult = newInventory[recipe.resultId] || 0
    newInventory[recipe.resultId] = currentResult + 1

    updateCharacter(activeCharacter.id, { inventory: newInventory })
  }

  const filteredItems = Array.from(inventory.entries())
    .map(([id, quantity]) => ({ ...allItems[id], quantity }))
    .filter((item) => item && (selectedCategory === "전체" || item.category === selectedCategory))

  const craftableRecipes = recipes.filter(canCraft)

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
                  const resultItem = allItems[recipe.resultId]
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
                                const materialItem = allItems[material.itemId]
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
