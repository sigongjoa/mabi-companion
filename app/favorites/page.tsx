"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useFavorites } from "@/contexts/favorites-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { Star, Trash2, ExternalLink, Calendar, Filter, X } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useCharacter } from "@/contexts/character-context"
import craftingFacilitiesData from "@/data/craftingFacilities.json"
import { cn } from "@/lib/utils"
import { Popover as UIPopover } from "@/components/ui/popover"

const typeColors: Record<string, string> = {
  inventory: "bg-blue-100 text-blue-800",
  crafting: "bg-green-100 text-green-800",
  equipment: "bg-purple-100 text-purple-800",
  quest: "bg-orange-100 text-orange-800",
  character: "bg-pink-100 text-pink-800",
  timer: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
}

interface CraftingFacility {
  id: number;
  name: string;
  type: string;
  recipes: Array<{ itemId: number; quantity: number }>;
}

interface CraftingQueueItem {
  recipeId: number;
  facilityId: number;
  startTime: number;
  duration: number;
  outputItemId: number;
  outputQuantity: number;
}

// Explicitly type craftingFacilitiesData to ensure correct data structure
const allCraftingFacilities: CraftingFacility[] = craftingFacilitiesData as CraftingFacility[];

export default function FavoritesPage() {
  const { favorites, removeFavorite, getFavoritesByType } = useFavorites()
  const [selectedType, setSelectedType] = useState("all")
  const { activeCharacter, updateCharacter } = useCharacter()
  const { favoriteCraftingFacilities, toggleCraftingFacilityFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([])

  const types = Array.from(new Set(favorites.map((f) => f.type)))
  const filteredFavorites = selectedType === "all" ? favorites : getFavoritesByType(selectedType)

  const groupedByPage = filteredFavorites.reduce(
    (acc, favorite) => {
      const page = favorite.page || "기타"
      if (!acc[page]) acc[page] = []
      acc[page].push(favorite)
      return acc
    },
    {} as Record<string, typeof favorites>,
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getPageName = (path: string) => {
    const pageNames: Record<string, string> = {
      "/": "대시보드",
      "/inventory": "아이템 관리",
      "/equipment": "캐릭터 장비",
      "/quests": "퀘스트 관리",
      "/characters": "캐릭터 관리",
      "/crafting": "가공 시설",
      "/skills": "생활 스킬",
      "/assistant": "AI 어시스턴트",
      "/guides": "종합 가이드",
      "/stats": "게임 통계",
      "/timers": "타이머 관리",
      "/calculator": "게임 계산기",
    }
    return pageNames[path] || path
  }

  const facilityTypes = useMemo(() => {
    const types = new Set<string>()
    allCraftingFacilities.forEach((facility) => types.add(facility.type))
    return Array.from(types).sort()
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTypeChange = useCallback((type: string) => {
    setSelectedFacilityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const filteredAndFavoritedFacilities = useMemo(() => {
    let facilities = allCraftingFacilities.filter(facility =>
      favoriteCraftingFacilities.includes(facility.id)
    )

    if (searchQuery) {
      facilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedFacilityTypes.length > 0) {
      facilities = facilities.filter(facility =>
        selectedFacilityTypes.includes(facility.type)
      )
    }

    return facilities
  }, [favoriteCraftingFacilities, searchQuery, selectedFacilityTypes])

  const getFacilityById = useCallback((facilityId: number) => {
    const facility = allCraftingFacilities.find(f => f.id === facilityId);
    return facility;
  }, []);

  const favoriteCraftingQueues = useMemo(() => {
    const queues = (activeCharacter?.craftingQueues || []).filter(queueItem =>
      favoriteCraftingFacilities.includes(queueItem.facilityId)
    );
    return queues;
  }, [activeCharacter?.craftingQueues, favoriteCraftingFacilities]);

  const getRemainingTime = useCallback((queueItem: CraftingQueueItem): string => {
    const now = Date.now();
    const endTime = queueItem.startTime + queueItem.duration * 1000; // duration is in seconds
    const remaining = endTime - now;

    if (remaining <= 0) {
      return "완료";
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const timeString = [
      hours > 0 ? `${hours}시간` : "",
      minutes > 0 ? `${minutes}분` : "",
      seconds > 0 ? `${seconds}초` : "",
    ].filter(Boolean).join(" ") || "0초";

    return timeString;
  }, []);

  const cancelQueueItem = useCallback((queueItemToCancel: CraftingQueueItem) => {
    if (activeCharacter) {
      const updatedQueues = activeCharacter.craftingQueues.filter(
        (item) => item !== queueItemToCancel
      );
      updateCharacter({ ...activeCharacter, craftingQueues: updatedQueues });
    }
  }, [activeCharacter, updateCharacter]);

  const claimCompletedItems = useCallback(() => {
    if (activeCharacter) {
      const completedItems: CraftingQueueItem[] = [];
      const remainingQueues: CraftingQueueItem[] = [];

      activeCharacter.craftingQueues.forEach((queueItem) => {
        if (Date.now() >= queueItem.startTime + queueItem.duration * 1000) {
          completedItems.push(queueItem);
        } else {
          remainingQueues.push(queueItem);
        }
      });

      if (completedItems.length > 0) {
        const updatedInventory = { ...activeCharacter.inventory };
        completedItems.forEach((item) => {
          updatedInventory[item.outputItemId] = (
            updatedInventory[item.outputItemId] || 0
          ) + item.outputQuantity;
        });
        updateCharacter({
          ...activeCharacter,
          inventory: updatedInventory,
          craftingQueues: remainingQueues,
        });
        // Optionally, add a toast notification here
      }
    }
  }, [activeCharacter, updateCharacter]);

  useEffect(() => {
    const interval = setInterval(() => {
      claimCompletedItems();
    }, 1000);
    return () => clearInterval(interval);
  }, [claimCompletedItems]);

  return (
    <div className="min-h-screen">
      <div className="content-padding section-spacing">
        <CharacterScopedHeader
          title="즐겨찾기"
          description="자주 사용하는 컴포넌트와 기능들을 관리하세요"
          icon={Star}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 즐겨찾기</p>
                      <p className="text-2xl font-bold text-gray-900">{favorites.length}개</p>
                    </div>
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">페이지 수</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedByPage).length}개</p>
                    </div>
                    <ExternalLink className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">컴포넌트 유형</p>
                      <p className="text-2xl font-bold text-gray-900">{types.length}개</p>
                    </div>
                    <Filter className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardContent className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">최근 추가</p>
                      <p className="text-sm font-bold text-gray-900">
                        {favorites.length > 0
                          ? formatDate(
                              favorites.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())[0].addedAt,
                            ).split(" ")[0]
                          : "없음"}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="card">
              <CardHeader className="card-header">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>필터</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="space-y-2">
                  <Button
                    variant={selectedType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("all")}
                    className="w-full justify-start"
                  >
                    전체 ({favorites.length})
                  </Button>
                  {types.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="w-full justify-start"
                    >
                      {type} ({getFavoritesByType(type).length})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorites List */}
          <div className="lg:col-span-3">
            {favorites.length === 0 ? (
              <Card className="card">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">아직 즐겨찾기가 없습니다.</p>
                  <p className="text-gray-500 text-sm">
                    각 페이지의 컴포넌트에서 ⭐ 버튼을 클릭하여 즐겨찾기에 추가하세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByPage).map(([page, pageFavorites]) => (
                  <Card key={page} className="card">
                    <CardHeader className="card-header">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <ExternalLink className="w-5 h-5" />
                          <span>{getPageName(page)}</span>
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {pageFavorites.length}개
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="space-y-3">
                        {pageFavorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <div>
                                <div className="font-medium text-gray-900">{favorite.name}</div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Badge className={`text-xs ${typeColors[favorite.type] || typeColors.default}`}>
                                    {favorite.type}
                                  </Badge>
                                  <span>•</span>
                                  <span>{formatDate(favorite.addedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
                                <Link href={favorite.page}>
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFavorite(favorite.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <Input
            type="text"
            placeholder="시설 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-xs"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                시설 타입 <span className="text-gray-500">({selectedFacilityTypes.length})</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 max-h-60 overflow-y-auto">
              {facilityTypes.map((type) => (
                <Label
                  key={type}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <Checkbox
                    checked={selectedFacilityTypes.includes(type)}
                    onCheckedChange={() => handleTypeChange(type)}
                  />
                  <span>{type}</span>
                </Label>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Favorite Crafting Facilities */}
        <h2 className="text-2xl font-bold mb-4">즐겨찾는 제작 시설</h2>
        {filteredAndFavoritedFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndFavoritedFacilities.map((facility) => (
              <Card key={facility.id} className="group relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {facility.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCraftingFacilityFavorite(facility.id)}
                    className="text-yellow-500 opacity-100 transition-opacity"
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">타입: {facility.type}</p>
                  <h3 className="text-base font-semibold mt-4 mb-2">가능한 레시피:</h3>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-2 mb-2">
                    {facility.recipes.length > 0 ? (
                      <ul>
                        {facility.recipes.map((recipe, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {allCraftingFacilities.find(f => f.id === facility.id)?.recipes.find(r => r.itemId === recipe.itemId)?.output?.quantity}x {recipe.itemId} (Item ID)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">레시피 없음.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">즐겨찾는 제작 시설이 없습니다.</p>
        )}

        {/* Active Crafting Queues for Favorites */}
        <h2 className="text-2xl font-bold mt-8 mb-4">즐겨찾는 시설의 진행 중인 제작</h2>
        {favoriteCraftingQueues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCraftingQueues.map((queueItem) => {
              const facility = getFacilityById(queueItem.facilityId);
              const remainingTime = getRemainingTime(queueItem);
              return facility ? (
                <Card key={queueItem.recipeId} className="group relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      {facility.name} - {queueItem.outputQuantity}x Item ID {queueItem.outputItemId}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelQueueItem(queueItem)}
                      className="text-red-500 opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">남은 시간: {remainingTime}</p>
                  </CardContent>
                </Card>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-gray-500">즐겨찾는 시설의 진행 중인 제작이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
