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
import { FavoriteToggle } from "@/components/favorite-toggle"

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
  id: string;
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
  console.debug("Rendering FavoritesPage component");
  const { favorites, removeFavorite, getFavoritesByType } = useFavorites()
  const [selectedType, setSelectedType] = useState("all")
  const { activeCharacter, updateCharacter, favoriteCraftingFacilities, toggleCraftingFacilityFavorite } = useCharacter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([])

  const types = Array.from(new Set(favorites.map((f) => f.type)))
  const filteredFavorites = selectedType === "all" ? favorites : getFavoritesByType(selectedType)

  const filteredFavoritesBySearch = useMemo(() => {
    if (!searchQuery) return filteredFavorites;
    return filteredFavorites.filter(favorite =>
      favorite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (favorite.type && favorite.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (favorite.page && favorite.page.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [filteredFavorites, searchQuery]);

  const groupedByPage = filteredFavoritesBySearch.reduce(
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

  const getFacilityById = useCallback((facilityId: string) => {
    const facility = allCraftingFacilities.find(f => f.id === facilityId);
    return facility;
  }, []);

  const favoriteCraftingQueues = useMemo(() => {
    const queues = activeCharacter?.craftingQueues?.filter(queueItem =>
      favoriteCraftingFacilities.includes(queueItem.facilityId.toString())
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
      updateCharacter(activeCharacter.id, { craftingQueues: updatedQueues });
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
        updateCharacter(activeCharacter.id, {
          inventory: updatedInventory,
          craftingQueues: remainingQueues,
        });
      }
    }
  }, [activeCharacter, updateCharacter]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header - Dashboard style */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-red-100 rounded-2xl flex-shrink-0">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">즐겨찾기</h1>
                <p className="text-lg text-gray-600 mt-1">자주 사용하는 정보 모아보기</p>
                <p className="text-sm text-gray-500 mt-1">즐겨찾는 캐릭터, 아이템, 퀘스트 등을 빠르게 확인하세요.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      <CharacterScopedHeader title="내 즐겨찾기 목록" />

      {/* Favorite Categories */}
      <div className="document-card p-4">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            className={selectedType === "all" ? "bg-blue-600 text-white" : ""}
          >
            모두 보기 ({favorites.length})
          </Button>
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-blue-600 text-white" : ""}
            >
              <Badge className={cn("mr-2", typeColors[type] || typeColors.default)}>{type}</Badge>
              {type} ({getFavoritesByType(type).length})
            </Button>
          ))}
        </div>
      </div>

      {Object.entries(groupedByPage).map(([page, pageFavorites]) => (
        <Card key={page} className="document-card">
          <CardHeader className="excel-header">
            <CardTitle className="text-gray-900 text-lg border-l-4 border-blue-500 pl-3 flex items-center justify-between">
              <span>{getPageName(page)}</span>
              <Badge className="bg-gray-200 text-gray-700">총 {pageFavorites.length}개</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pageFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="excel-cell hover:excel-selected p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Badge className={cn("h-6", typeColors[favorite.type] || typeColors.default)}>
                    {favorite.type}
                  </Badge>
                  <span className="text-gray-700 font-medium">{favorite.name}</span>
                  {favorite.lastUpdated && (
                    <span className="text-sm text-gray-500 ml-2">
                      (마지막 업데이트: {formatDate(new Date(favorite.lastUpdated))})
                    </span>
                  )}
                  {favorite.url && (
                    <Link
                      href={favorite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm ml-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFavorite(favorite.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Favorite Crafting Facilities Section */}
      <Card className="document-card">
        <CardHeader className="excel-header">
          <CardTitle className="text-gray-900 text-lg border-l-4 border-orange-500 pl-3 flex items-center justify-between">
            <span>즐겨찾는 가공 시설</span>
            <Badge className="bg-gray-200 text-gray-700">총 {filteredAndFavoritedFacilities.length}개</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndFavoritedFacilities.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <Input
                  placeholder="시설 이름 검색..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="max-w-xs"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      시설 유형 필터
                      {selectedFacilityTypes.length > 0 && (
                        <Badge className="ml-2">{selectedFacilityTypes.length}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4">
                    <Label className="text-sm font-semibold mb-2 block">유형 선택</Label>
                    <div className="space-y-2">
                      {facilityTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={selectedFacilityTypes.includes(type)}
                            onCheckedChange={() => handleTypeChange(type)}
                          />
                          <Label htmlFor={type}>{type}</Label>
                        </div>
                      ))}
                      {selectedFacilityTypes.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFacilityTypes([])}
                            className="w-full justify-center text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            필터 초기화
                          </Button>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-3">
                  {filteredAndFavoritedFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center justify-between excel-cell p-3 rounded-lg hover:excel-selected"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-orange-100 text-orange-800">{facility.type}</Badge>
                        <span className="font-medium text-gray-700">{facility.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCraftingFacilityFavorite(facility.id)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-gray-500">즐겨찾는 가공 시설이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* Favorite Crafting Queues Section */}
      <Card className="document-card">
        <CardHeader className="excel-header">
          <CardTitle className="text-gray-900 text-lg border-l-4 border-blue-500 pl-3 flex items-center justify-between">
            <span>진행 중인 즐겨찾기 제작</span>
            <Badge className="bg-gray-200 text-gray-700">총 {favoriteCraftingQueues?.length || 0}개</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCharacter && favoriteCraftingQueues && favoriteCraftingQueues.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-end mb-4">
                <Button onClick={claimCompletedItems} className="btn-primary-modern text-sm">
                  완료된 아이템 모두 수령
                </Button>
              </div>
              {favoriteCraftingQueues.map((queueItem, index) => {
                const facility = getFacilityById(queueItem.facilityId.toString());
                const isCompleted = getRemainingTime(queueItem) === "완료";
                return (
                  <div
                    key={index}
                    className={cn(
                      "excel-cell p-3 rounded-lg flex items-center justify-between",
                      isCompleted ? "bg-green-50 border-green-300" : "bg-blue-50 border-blue-300"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {facility ? facility.name : "알 수 없음"}
                      </Badge>
                      <span className="font-medium text-gray-700">
                        {queueItem.outputItemId} ({queueItem.outputQuantity}개)
                      </span>
                      <span className="text-sm font-mono text-gray-600">
                        {getRemainingTime(queueItem)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelQueueItem(queueItem)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">즐겨찾는 시설의 진행 중인 제작이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
