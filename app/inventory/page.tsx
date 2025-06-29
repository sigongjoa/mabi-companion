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
import { Input } from "@/components/ui/input"
import { logger } from "@/lib/logger"
import { type Item, type Recipe } from "@/types/page-context"

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
  logger.debug("InventoryPage 렌더링 시작");
  const { activeCharacter, viewMode, characters, updateCharacter, allItems, recipes } = useCharacter()
  const [selectedCategory, setSelectedCategory] = useState<string[]>(["전체"])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  // Change state for main tabs
  const [currentMainTab, setCurrentMainTab] = useState("inventory-table")
  const [currentCraftingViewMode, setCurrentCraftingViewMode] = useState("card")
  const [searchQuery, setSearchQuery] = useState("")

  // Get inventory data based on view mode
  const getInventoryData = () => {
    logger.debug("getInventoryData 호출");
    let currentInventoryMap = new Map<number, number>() // Initialize map
    if (viewMode === "single" && activeCharacter) {
      currentInventoryMap = new Map(
        Object.entries(activeCharacter.inventory as Record<string, number>).map(([k, v]) => [Number(k), v]),
      )
      logger.debug("getInventoryData - single character mode", { activeCharacterId: activeCharacter.id });
    } else if (viewMode === "all") {
      // Aggregate all character inventories
      const aggregated = new Map<number, number>()
      characters.forEach((character: Character) => {
        Object.entries(character.inventory as Record<string, number>).forEach(
          ([itemId, quantity]: [string, number]) => {
            const id = Number(itemId)
            aggregated.set(id, (aggregated.get(id) || 0) + quantity)
          },
        )
      })
      currentInventoryMap = aggregated
      logger.debug("getInventoryData - all characters mode", { characterCount: characters.length });
    }
    logger.debug("getInventoryData 결과", { inventorySize: currentInventoryMap.size });
    return currentInventoryMap
  }

  const inventory = getInventoryData()
  logger.debug("인벤토리 데이터 로드됨", { inventory });

  const updateQuantity = (itemId: number, change: number) => {
    logger.debug("updateQuantity 호출", { itemId, change, viewMode, activeCharacterId: activeCharacter?.id });
    let targetCharacter = null;
    if (viewMode === "single" && activeCharacter) {
      targetCharacter = activeCharacter;
    } else if (viewMode === "all" && characters.length > 0) {
      targetCharacter = characters[0];
    }

    if (targetCharacter) {
      logger.debug("updateQuantity: 캐릭터 인벤토리 업데이트 진행", { itemId, change, targetCharacterId: targetCharacter.id });
      const currentQuantity = targetCharacter.inventory[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      const newInventory = { ...targetCharacter.inventory };
      if (newQuantity === 0) {
        delete newInventory[itemId];
        logger.debug("updateQuantity: 아이템 수량 0이 되어 인벤토리에서 삭제", { itemId });
      } else {
        newInventory[itemId] = newQuantity;
        logger.debug("updateQuantity: 아이템 수량 업데이트", { itemId, newQuantity });
      }

      updateCharacter(targetCharacter.id, { inventory: newInventory });
      logger.debug("updateQuantity: 캐릭터 인벤토리 업데이트 완료", { targetCharacterId: targetCharacter.id, newInventory });
    } else {
      logger.debug("updateQuantity: 활성 캐릭터 또는 타겟 캐릭터 없음, 업데이트 건너뜀", { viewMode, activeCharacter: !!activeCharacter, charactersCount: characters.length });
    }
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    logger.debug("handleQuantityChange 호출", { itemId, value, viewMode, activeCharacterId: activeCharacter?.id });
    let targetCharacter = null;
    if (viewMode === "single" && activeCharacter) {
      targetCharacter = activeCharacter;
    } else if (viewMode === "all" && characters.length > 0) {
      targetCharacter = characters[0];
    }

    if (targetCharacter) {
      logger.debug("handleQuantityChange: 캐릭터 인벤토리 업데이트 진행", { itemId, value, targetCharacterId: targetCharacter.id });
      const newQuantity = Math.max(0, parseInt(value) || 0);
      const newInventory = { ...targetCharacter.inventory };

      if (newQuantity === 0) {
        delete newInventory[itemId];
        logger.debug("handleQuantityChange: 아이템 수량 0이 되어 인벤토리에서 삭제 (텍스트박스 입력)", { itemId });
      } else {
        newInventory[itemId] = newQuantity;
        logger.debug("handleQuantityChange: 아이템 수량 업데이트 (텍스트박스 입력)", { itemId, newQuantity });
      }

      updateCharacter(targetCharacter.id, { inventory: newInventory });
      logger.debug("handleQuantityChange: 캐릭터 인벤토리 업데이트 완료", { targetCharacterId: targetCharacter.id, newInventory });
    } else {
      logger.debug("handleQuantityChange: 활성 캐릭터 또는 타겟 캐릭터 없음, 업데이트 건너뜀", { viewMode, activeCharacter: !!activeCharacter, charactersCount: characters.length });
    }
  };

  const handleCategoryToggle = (category: string) => {
    logger.debug("handleCategoryToggle 호출", { category });
    setSelectedCategory((prev) => {
      if (category === "전체") {
        logger.debug("카테고리 전체 선택");
        return ["전체"];
      } else {
        let newCategories: string[];
        if (prev.includes("전체")) {
          // "전체"가 선택된 상태에서 다른 카테고리 선택 시 "전체" 제거
          newCategories = [category];
          logger.debug("'전체' 제거 후 카테고리 선택", { category });
        } else if (prev.includes(category)) {
          // 이미 선택된 카테고리 해제
          newCategories = prev.filter((c) => c !== category);
          logger.debug("카테고리 선택 해제", { category });
        } else {
          // 새로운 카테고리 선택
          newCategories = [...prev, category];
          logger.debug("새로운 카테고리 선택", { category });
        }

        // 모든 카테고리가 선택 해제되면 자동으로 "전체" 선택
        if (newCategories.length === 0) {
          logger.debug("모든 카테고리 해제, '전체' 자동 선택");
          return ["전체"];
        }

        logger.debug("handleCategoryToggle 결과", { newCategories });
        return newCategories;
      }
    });
  };

  const canCraft = (recipe: Recipe) => {
    logger.debug("canCraft 호출", { recipeResultId: recipe.resultId });
    const result = recipe.materials.every((material) => {
      const materialItem = allItems[material.itemId.toString()];
      if (!materialItem) {
        logger.warn("재료 아이템을 allItems에서 찾을 수 없음", { itemId: material.itemId });
        return false;
      }
      const currentInventory = inventory.get(materialItem.id) || 0;
      const requiredQuantity = material.quantity;
      logger.debug("재료 확인", { materialId: material.itemId, currentInventory, requiredQuantity });
      return currentInventory >= requiredQuantity;
    });
    logger.debug("canCraft 결과", { result });
    return result;
  };

  const craftItem = (recipe: Recipe) => {
    logger.debug("craftItem 호출", { recipeResultId: recipe.resultId });
    if (!canCraft(recipe) || viewMode !== "single" || !activeCharacter) {
      logger.warn("제작 불가 조건", { canCraft: canCraft(recipe), viewMode, activeCharacter: !!activeCharacter });
      return;
    }

    const newInventory = { ...activeCharacter.inventory };
    logger.debug("제작 전 인벤토리", { newInventory });

    // 재료 소모
    recipe.materials.forEach((material) => {
      const materialItem = allItems[material.itemId.toString()];
      if (!materialItem) {
        logger.error("재료 아이템을 찾을 수 없음", { itemId: material.itemId });
        return;
      }
      const current = newInventory[materialItem.id] || 0;
      newInventory[materialItem.id] = current - material.quantity;
      logger.debug("재료 소모됨", { materialId: materialItem.id, quantityUsed: material.quantity });
    });

    // 결과물 추가
    const resultItem = allItems[recipe.resultId.toString()];
    if (!resultItem) {
      logger.error("결과 아이템을 찾을 수 없음", { resultId: recipe.resultId });
      return;
    }
    const currentResult = newInventory[resultItem.id] || 0;
    newInventory[resultItem.id] = currentResult + 1;
    logger.debug("결과 아이템 추가됨", { resultItemId: resultItem.id, newQuantity: newInventory[resultItem.id] });

    updateCharacter(activeCharacter.id, { inventory: newInventory });
    logger.debug("아이템 제작 완료, 캐릭터 인벤토리 업데이트됨");
  };

  const filteredItems = Array.from(inventory.entries())
    .map(([id, quantity]) => {
      const item = allItems[id.toString()]
      if (!item) {
        logger.warn("인벤토리 아이템을 allItems에서 찾을 수 없음", { itemId: id });
        return null // Item not found, skip this entry
      }
      const filteredItem = { ...item, quantity }
      return filteredItem
    })
    .filter((item): item is Item & { quantity: number } => {
      if (!item) return false

      // Category filter
      const categoryMatch = selectedCategory.includes("전체") || selectedCategory.includes(item.category);

      // Favorites filter
      const favoritesMatch = !showFavoritesOnly || (activeCharacter?.favoriteItems?.[item.id] === true);

      // Search filter
      const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      logger.debug("아이템 필터링 중", { itemName: item.name, categoryMatch, favoritesMatch, searchMatch });

      return categoryMatch && favoritesMatch && searchMatch
    })
    .sort((a, b) => a.name.localeCompare(b.name))
  logger.debug("filteredItems 결과", { filteredItemsLength: filteredItems.length });

  const craftableRecipes = recipes.filter(canCraft)
  logger.debug("craftableRecipes 결과", { craftableRecipesLength: craftableRecipes.length });

  const filteredRecipes = recipes.filter((recipe) => {
    logger.debug("filteredRecipes 필터링 중", { recipeResultId: recipe.resultId });
    const resultItem = allItems[recipe.resultId.toString()];
    if (!resultItem) {
      logger.warn("제작 결과 아이템을 allItems에서 찾을 수 없음", { resultId: recipe.resultId });
      return false;
    }

    // Search query filter
    const searchMatch = resultItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        recipe.materials.some(material => {
                            const materialItem = allItems[material.itemId.toString()];
                            return materialItem && materialItem.name.toLowerCase().includes(searchQuery.toLowerCase());
                        });
    logger.debug("레시피 검색 일치 여부", { recipeResultId: recipe.resultId, searchMatch });
    return searchMatch;
  })
  logger.debug("filteredRecipes 결과", { filteredRecipesLength: filteredRecipes.length });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-yellow-100 rounded-2xl flex-shrink-0">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">아이템 관리</h1>
                <p className="text-lg text-gray-600 mt-1">인벤토리 및 아이템 현황 관리</p>
                <p className="text-sm text-gray-500 mt-1">내 캐릭터의 아이템을 효율적으로 관리하고 생산에 활용하세요.</p>
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

      <Tabs defaultValue={currentMainTab} onValueChange={setCurrentMainTab} className="space-y-6">
        <div className="document-card p-4">
          <Tabs
            defaultValue="inventory-table"
            value={currentMainTab}
            onValueChange={setCurrentMainTab}
            className="section-spacing"
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4">
                <TabsList className="bg-gray-50 border border-gray-200">
                  <TabsTrigger
                    value="inventory-table"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    <Table2 className="w-4 h-4 mr-2" /> 아이템 (테이블)
                  </TabsTrigger>
                  <TabsTrigger
                    value="craftable-items"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> 제작 가능 ({craftableRecipes.length})
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="inventory-table" className="space-y-6">
              <Card className="document-card">
                <CardHeader className="excel-header flex-row items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>통합 인벤토리</span>
                    <Badge variant="secondary" className="ml-2 font-normal text-gray-500">
                      총 {filteredItems.length}개 아이템 ({activeCharacter ? activeCharacter.name : '선택된 캐릭터 없음'})
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="favorites-only"
                      checked={showFavoritesOnly}
                      onCheckedChange={setShowFavoritesOnly}
                    />
                    <Label htmlFor="favorites-only" className="text-sm text-muted-foreground">
                      즐겨찾기만
                    </Label>
                    <FavoriteToggle
                      itemId="inventory-header"
                      itemType="header"
                      size="sm"
                      className="ml-2"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-wrap gap-2 mb-4 p-4">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className={cn(
                          "transition-all duration-200",
                          selectedCategory.includes(category)
                            ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400",
                        )}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <div className="max-h-[600px] overflow-y-auto excel-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[70px] text-center">즐겨찾기</TableHead>
                          <TableHead className="w-[80px] text-center">아이콘</TableHead>
                          <TableHead>이름</TableHead>
                          <TableHead>카테고리</TableHead>
                          <TableHead className="text-right w-[180px]">수량</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center align-middle">
                              <FavoriteToggle itemId={item.id.toString()} itemType="item" size="sm" />
                            </TableCell>
                            <TableCell className="text-2xl text-center">
                              {/* 아이콘 이미지 경로 대신 이모지를 직접 렌더링합니다. */}
                              {item.icon}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  className="w-24 text-center inline-block mx-1"
                                  min={0}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredItems.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">
                      표시할 아이템이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="craftable-items" className="space-y-6">
              <Card className="document-card">
                <CardHeader className="excel-header">
                  <CardTitle className="text-gray-900 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>제작 가능 아이템</span>
                    <Badge variant="secondary" className="ml-2 font-normal text-gray-500">
                      총 {craftableRecipes.length}개
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto excel-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px] text-center">즐겨찾기</TableHead>
                          <TableHead className="w-[80px]">아이콘</TableHead>
                          <TableHead>이름</TableHead>
                          <TableHead>필요 재료</TableHead>
                          <TableHead className="text-right">제작</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecipes.map((recipe) => (
                          <TableRow key={recipe.resultId}>
                            <TableCell className="text-center">
                              <FavoriteToggle itemId={recipe.resultId.toString()} itemType="recipe" size="sm" />
                            </TableCell>
                            <TableCell>
                              {allItems[recipe.resultId.toString()]?.icon && (
                                <img
                                  src={allItems[recipe.resultId.toString()]?.icon}
                                  alt={allItems[recipe.resultId.toString()]?.name}
                                  className="w-8 h-8 object-contain"
                                />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {allItems[recipe.resultId.toString()]?.name}
                            </TableCell>
                            <TableCell>
                              {recipe.materials.map((material, index) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1">
                                  {allItems[material.itemId.toString()]?.name} x{material.quantity}
                                </Badge>
                              ))}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => craftItem(recipe)}
                                disabled={!canCraft(recipe) || viewMode !== "single"}
                              >
                                제작
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredRecipes.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">
                      제작 가능한 아이템이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Tabs>
    </div>
  )
}
