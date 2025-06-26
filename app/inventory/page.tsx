"use client"

import { useState } from "react"
import { useCharacter, type Character } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { Plus, Minus, Package, Sparkles, LayoutGrid, Table2, Star, User } from "lucide-react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

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
  isFavorite: boolean
}

interface Recipe {
  resultId: number
  materials: { itemId: number; quantity: number }[]
}

const allItems: Record<string, Item> = allItemsData as Record<string, Item>

const recipes: Recipe[] = recipesData as Recipe[]

// Update categories to include individual material categories
const categories = [
  "전체",
  "소모품",
  "음식",
  "장비",
  "기타",
  "화폐",
  "광물",
  "목재",
  "가죽",
  "옷감",
  "버섯",
  "결정",
  "마법",
  "파편",
  "꽃",
  "요리재료",
]

export default function InventoryPage() {
  console.debug(`Entering InventoryPage`)
  const { activeCharacter, viewMode, characters, updateCharacter } = useCharacter()
  console.debug(`InventoryPage rendered - viewMode: ${viewMode}, activeCharacter: ${activeCharacter?.id}`)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  // Change state for main tabs
  const [currentMainTab, setCurrentMainTab] = useState("inventory-card")
  const [currentCraftingViewMode, setCurrentCraftingViewMode] = useState("card")
  console.debug(`Initial selectedCategory: ${selectedCategory}`)

  // Get inventory data based on view mode
  const getInventoryData = () => {
    console.debug(`Entering getInventoryData - viewMode: ${viewMode}, activeCharacter: ${activeCharacter?.id}`)
    let currentInventoryMap = new Map<number, number>() // Initialize map
    if (viewMode === "single" && activeCharacter) {
      console.debug(`getInventoryData - single view for character: ${activeCharacter.id}`)
      currentInventoryMap = new Map(
        Object.entries(activeCharacter.inventory as Record<string, number>).map(([k, v]) => [Number(k), v]),
      )
      console.debug("Exiting getInventoryData - single view, currentInventoryMap:", currentInventoryMap)
    } else if (viewMode === "all") {
      console.debug("getInventoryData - all view")
      // Aggregate all character inventories
      const aggregated = new Map<number, number>()
      characters.forEach((character: Character) => {
        console.debug(`Processing character ${character.id} for aggregated inventory`)
        Object.entries(character.inventory as Record<string, number>).forEach(
          ([itemId, quantity]: [string, number]) => {
            const id = Number(itemId)
            console.debug(`Processing item ${id} with quantity ${quantity} from character ${character.id}'s inventory`)
            aggregated.set(id, (aggregated.get(id) || 0) + quantity)
            console.debug(`Aggregated quantity for item ${id}: ${aggregated.get(id)}`)
          },
        )
      })
      currentInventoryMap = aggregated
      console.debug("Exiting getInventoryData - all view, aggregated inventory:", currentInventoryMap)
    } else {
      console.debug("Exiting getInventoryData - no active character or viewMode is not single/all")
    }
    return currentInventoryMap
  }

  const inventory = getInventoryData()
  console.debug("Current inventory state:", inventory)

  const updateQuantity = (itemId: number, change: number) => {
    console.debug(`Entering updateQuantity for item ${itemId} with change ${change}`)
    if (viewMode === "single" && activeCharacter) {
      console.debug("updateQuantity - single view mode and active character exists")
      const currentQuantity = activeCharacter.inventory[itemId] || 0
      console.debug(`updateQuantity - currentQuantity for item ${itemId}: ${currentQuantity}`)
      const newQuantity = Math.max(0, currentQuantity + change)
      console.debug(`updateQuantity - newQuantity for item ${itemId}: ${newQuantity}`)

      const newInventory = { ...activeCharacter.inventory }
      console.debug("updateQuantity - newInventory before update:", newInventory)
      if (newQuantity === 0) {
        console.debug(`updateQuantity - newQuantity is 0, deleting item ${itemId} from inventory`)
        delete newInventory[itemId]
      } else {
        console.debug(`updateQuantity - setting newQuantity for item ${itemId}: ${newQuantity}`)
        newInventory[itemId] = newQuantity
      }
      console.debug("updateQuantity - newInventory after update:", newInventory)

      updateCharacter(activeCharacter.id, { inventory: newInventory })
      console.debug("Exiting updateQuantity - character inventory updated")
    }
  }

  const canCraft = (recipe: Recipe) => {
    console.debug(`Entering canCraft for recipe resultId: ${recipe.resultId}`)
    const result = recipe.materials.every((material) => {
      const currentInventory = inventory.get(material.itemId) || 0
      const requiredQuantity = material.quantity
      console.debug(
        `canCraft - checking material ${material.itemId}: current ${currentInventory}, required ${requiredQuantity}`,
      )
      return currentInventory >= requiredQuantity
    })
    console.debug(`Exiting canCraft for recipe ${recipe.resultId}, result: ${result}`)
    return result
  }

  const craftItem = (recipe: Recipe) => {
    console.debug(`Entering craftItem for recipe resultId: ${recipe.resultId}`)
    if (!canCraft(recipe) || viewMode !== "single" || !activeCharacter) {
      console.debug("craftItem - cannot craft or conditions not met, returning")
      return
    }
    console.debug("craftItem - crafting conditions met")

    const newInventory = { ...activeCharacter.inventory }
    console.debug("craftItem - newInventory before crafting:", newInventory)

    // 재료 소모
    recipe.materials.forEach((material) => {
      const current = newInventory[material.itemId] || 0
      newInventory[material.itemId] = current - material.quantity
      console.debug(`craftItem - consumed material ${material.itemId}, new quantity: ${newInventory[material.itemId]}`)
    })

    // 결과물 추가
    const currentResult = newInventory[recipe.resultId] || 0
    newInventory[recipe.resultId] = currentResult + 1
    console.debug(`craftItem - added result item ${recipe.resultId}, new quantity: ${newInventory[recipe.resultId]}`)

    updateCharacter(activeCharacter.id, { inventory: newInventory })
    console.debug("Exiting craftItem - character inventory updated")
  }

  const filteredItems = Array.from(inventory.entries())
    .map(([id, quantity]) => {
      console.debug(`Filtering item with ID: ${id}, quantity: ${quantity}`)
      const item = allItems[id.toString()]
      if (!item) {
        console.warn(`Item with ID ${id} not found in allItems. Skipping.`)
        return null // Item not found, skip this entry
      }
      const filteredItem = { ...item, quantity }
      console.debug("Filtered item:", filteredItem)
      return filteredItem
    })
    .filter((item): item is Item & { quantity: number } => {
      if (!item) return false

      // Category filter
      const categoryMatch = selectedCategory === "전체" || item.category === selectedCategory

      // Favorites filter
      const favoritesMatch = !showFavoritesOnly || item.isFavorite

      console.debug(
        `Checking item for filter: ${item?.name}, category: ${item?.category}, selectedCategory: ${selectedCategory}, isFavorite: ${item?.isFavorite}, showFavoritesOnly: ${showFavoritesOnly}`,
      )

      return categoryMatch && favoritesMatch
    })
  console.debug("Final filteredItems:", filteredItems)

  const craftableRecipes = recipes.filter(canCraft)
  console.debug("Craftable recipes:", craftableRecipes)

  return (
    <div className="min-h-screen bg-white">
      <div className="content-padding section-spacing">
        <CharacterScopedHeader
          title="아이템 관리"
          description={
            viewMode === "single" ? "선택된 캐릭터의 인벤토리 관리 및 제작 시스템" : "모든 캐릭터의 통합 인벤토리 현황"
          }
          icon={Package}
        />

        {/* Character Info Display */}
        {viewMode === "single" && activeCharacter && (
          <Card className="mb-6 border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeCharacter.name}</h3>
                  <p className="text-sm text-gray-500">
                    레벨 {activeCharacter.level} • {activeCharacter.server}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          defaultValue="inventory-card"
          value={currentMainTab}
          onValueChange={setCurrentMainTab}
          className="section-spacing"
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4">
              <TabsList className="bg-gray-50 border border-gray-200">
                <TabsTrigger
                  value="inventory-card"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" /> 아이템 (카드)
                </TabsTrigger>
                <TabsTrigger
                  value="inventory-table"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <Table2 className="w-4 h-4 mr-2" /> 아이템 (테이블)
                </TabsTrigger>
                <TabsTrigger
                  value="crafting"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  disabled={viewMode === "all"}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> 제작 가능 ({craftableRecipes.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="inventory-card" className="section-spacing">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>{viewMode === "single" ? "개인 인벤토리" : "통합 인벤토리"}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="favorites-toggle"
                        checked={showFavoritesOnly}
                        onCheckedChange={setShowFavoritesOnly}
                      />
                      <Label htmlFor="favorites-toggle" className="text-sm font-medium flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>즐겨찾기만</span>
                      </Label>
                    </div>
                    <FavoriteToggle id="inventory-main" name="인벤토리 메인" type="inventory" />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  총 {Array.from(inventory.values()).reduce((a, b) => a + b, 0)}개 아이템
                  {viewMode === "all" && ` (${characters.length}명의 캐릭터)`}
                  {showFavoritesOnly && " • 즐겨찾기 필터 적용"}
                </div>
              </CardHeader>
            </Card>

            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "transition-all duration-200",
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400",
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <CardHeader className="pb-2 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="text-xl flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-gray-900 text-xs font-medium truncate">{item.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 mt-1">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-1">
                        <FavoriteToggle id={`item-${item.id}`} name={item.name} type="item" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 p-3">
                    <div className="flex items-center justify-between">
                      {viewMode === "single" ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold text-gray-900 text-sm min-w-[40px] text-center">
                            {inventory.get(item.id) || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900 text-sm">{inventory.get(item.id) || 0}개</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">{item.price}G</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory-table" className="section-spacing">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "transition-all duration-200",
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400",
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">아이콘</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead className="w-[100px] text-right">수량</TableHead>
                      <TableHead className="w-[120px] text-right">가격</TableHead>
                      {viewMode === "single" && <TableHead className="w-[120px] text-center">관리</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-2xl">{item.icon}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right font-bold">{inventory.get(item.id) || 0}개</TableCell>
                        <TableCell className="text-right text-sm text-gray-500">{item.price}G</TableCell>
                        {viewMode === "single" && (
                          <TableCell className="flex items-center justify-center space-x-1">
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crafting" className="section-spacing">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>제작 가능 아이템</span>
                </CardTitle>
              </CardHeader>
            </Card>

            <Tabs
              defaultValue="card"
              value={currentCraftingViewMode}
              onValueChange={setCurrentCraftingViewMode}
              className="mt-4"
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <TabsList className="bg-gray-50 border border-gray-200">
                    <TabsTrigger
                      value="card"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" /> 카드 뷰
                    </TabsTrigger>
                    <TabsTrigger
                      value="table"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                    >
                      <Table2 className="w-4 h-4 mr-2" /> 테이블 뷰
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="card" className="section-spacing">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {craftableRecipes.map((recipe) => (
                    <Card
                      key={recipe.resultId}
                      className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{allItems[recipe.resultId]?.icon}</div>
                            <div className="flex-1">
                              <CardTitle className="text-gray-900 text-sm">{allItems[recipe.resultId]?.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                제작 가능
                              </Badge>
                            </div>
                          </div>
                          <FavoriteToggle
                            id={`recipe-${recipe.resultId}`}
                            name={allItems[recipe.resultId]?.name || ""}
                            type="recipe"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-3">
                          <p className="text-gray-600 text-xs mb-2">필요 재료:</p>
                          {recipe.materials.map((material, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-gray-700">
                              <span>{allItems[material.itemId]?.name}:</span>
                              <span
                                className={
                                  inventory.get(material.itemId) || 0 < material.quantity
                                    ? "text-red-500"
                                    : "text-green-600"
                                }
                              >
                                {inventory.get(material.itemId) || 0}/{material.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => craftItem(recipe)}>
                          제작하기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="section-spacing">
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">아이콘</TableHead>
                          <TableHead>아이템</TableHead>
                          <TableHead>필요 재료</TableHead>
                          <TableHead className="w-[120px] text-center">제작</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {craftableRecipes.map((recipe) => (
                          <TableRow key={recipe.resultId}>
                            <TableCell className="text-2xl">{allItems[recipe.resultId]?.icon}</TableCell>
                            <TableCell className="font-medium">{allItems[recipe.resultId]?.name}</TableCell>
                            <TableCell>
                              {recipe.materials.map((material, index) => (
                                <div key={index} className="flex items-center justify-between text-xs text-gray-700">
                                  <span>{allItems[material.itemId]?.name}:</span>
                                  <span
                                    className={
                                      inventory.get(material.itemId) || 0 < material.quantity
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }
                                  >
                                    {inventory.get(material.itemId) || 0}/{material.quantity}
                                  </span>
                                </div>
                              ))}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => craftItem(recipe)}
                              >
                                제작하기
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
