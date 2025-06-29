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
import craftingFacilitiesData from "/public/data/craftingFacilities.json"
import { cn } from "@/lib/utils"
import { Popover as UIPopover } from "@/components/ui/popover"
import { FavoriteToggle } from "@/components/favorite-toggle"
import { ItemDetailsPopup } from "@/components/item-details-popup"
import { useRouter } from "next/navigation"
import { Users, Package, Shield, Zap, CheckSquare, BookOpen, Bot } from "lucide-react"

// Import data files
import allItemsData from "/public/data/items.json"
import equipmentData from "/public/data/equipment.json"
import gemsData from "/public/data/gems.json"
import questsData from "/public/data/quests.json"
import skillsData from "/public/data/skills.json"
import recipesData from "/public/data/recipes.json"

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

const allItems: Item[] = allItemsData as Item[]
const allEquipment: Equipment[] = equipmentData as Equipment[]
const allGems: Gem[] = gemsData as Gem[]
const allSkills: Skill[] = skillsData as Skill[]
const allQuests: Quest[] = questsData as Quest[]
const allRecipes: Recipe[] = recipesData as Recipe[]

const getItemByName = (name: string): Item | undefined => {
  logger.debug("getItemByName 호출", { name });
  return allItems.find(item => item.name === name);
}

export default function FavoritesPage() {
  logger.debug("FavoritesPage 렌더링 시작");
  const { favorites, removeFavorite, getFavoritesByType } = useFavorites()
  const [selectedType, setSelectedType] = useState("all")
  const { activeCharacter, updateCharacter, favoriteCraftingFacilities, toggleCraftingFacilityFavorite } = useCharacter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

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
      "/quests": "숙제 관리",
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

  useEffect(() => {
    logger.debug("useEffect 시작: isClient 설정");
    setIsClient(true);
  }, []);

  // Define the order of categories
  const categoryOrder = [
    "characters",
    "items",
    "craftingFacilities",
    "dailyQuests",
    "weeklyQuests",
    "skills",
    "equipment",
    "gems",
    "avatarSets",
  ];

  // Mapping for display names of categories
  const categoryDisplayNames: Record<string, string> = {
    characters: "캐릭터",
    items: "아이템",
    craftingFacilities: "제작 시설",
    dailyQuests: "일일 숙제",
    weeklyQuests: "주간 숙제",
    skills: "스킬",
    equipment: "장비",
    gems: "보석",
    avatarSets: "아바타 세트",
  };

  // Favorites grouped by type
  const groupedFavorites = useMemo(() => {
    const allFavorites: Record<string, any[]> = {
      characters: characters.filter(char => char.favorite),
      items: activeCharacter ? Object.keys(activeCharacter.favoriteItems || {}).filter(key => activeCharacter.favoriteItems[key]).map(itemId => ({
        id: itemId,
        name: activeCharacter.allItems?.[itemId]?.name || `아이템 #${itemId}`
      })) : [],
      craftingFacilities: activeCharacter ? Object.keys(activeCharacter.favoriteCraftingFacilities || {}).filter(key => activeCharacter.favoriteCraftingFacilities[key]).map(facilityId => ({
        id: facilityId,
        name: activeCharacter.allCraftingFacilitiesData?.find((f: any) => f.id === facilityId)?.name || `제작 시설 #${facilityId}`
      })) : [],
      dailyQuests: activeCharacter ? Object.keys(activeCharacter.completedDailyTasks || {}).filter(key => activeCharacter.completedDailyTasks[key]).map(taskId => ({
        id: taskId,
        name: activeCharacter.allQuests?.daily ? Object.values(activeCharacter.allQuests.daily).flat().find((q: any) => q.id === taskId)?.text : `일일 숙제 #${taskId}`
      })) : [],
      weeklyQuests: activeCharacter ? Object.keys(activeCharacter.completedWeeklyTasks || {}).filter(key => activeCharacter.completedWeeklyTasks[key]).map(taskId => ({
        id: taskId,
        name: activeCharacter.allQuests?.weekly ? Object.values(activeCharacter.allQuests.weekly).flat().find((q: any) => q.id === taskId)?.text : `주간 숙제 #${taskId}`
      })) : [],
      skills: activeCharacter ? Object.keys(activeCharacter.skills || {}).filter(key => activeCharacter.skills[key] && activeCharacter.skills[key] > 1).map(skillId => ({
        id: skillId,
        name: activeCharacter.allSkillsData?.find((s: any) => s.id === parseInt(skillId))?.name || `스킬 #${skillId}`
      })) : [],
      equipment: activeCharacter ? Object.keys(activeCharacter.equippedItems || {}).filter(key => activeCharacter.equippedItems[key]).map(itemId => ({
        id: itemId,
        name: activeCharacter.allItems?.[itemId]?.name || `장비 #${itemId}`
      })) : [],
      gems: activeCharacter ? Object.keys(activeCharacter.allGems || {}).filter(key => activeCharacter.allGems[key]).map(gemId => ({
        id: gemId,
        name: activeCharacter.allGems?.find((g: any) => g.id === gemId)?.name || `보석 #${gemId}`
      })) : [],
      avatarSets: activeCharacter ? Object.keys(activeCharacter.allAvatarSets || {}).filter(key => activeCharacter.allAvatarSets[key]).map(setId => ({
        id: setId,
        name: activeCharacter.allAvatarSets?.find((s: any) => s.id === setId)?.name || `아바타 세트 #${setId}`
      })) : [],
    };

    const filtered = Object.fromEntries(
      Object.entries(allFavorites).map(([category, items]) => [
        category,
        items.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ])
    );

    return filtered;

  }, [activeCharacter, characters, searchQuery]);

  // Navigation links for favorites. Note: some paths might not directly correspond to favorites, but are included for quick access to related pages.
  const favoriteNavigationLinks: Record<string, string> = {
    "/characters": "캐릭터 관리",
    "/inventory": "인벤토리 관리",
    "/equipment": "장비 관리",
    "/skills": "스킬 관리",
    "/crafting": "제작 관리",
    "/timers": "타이머 관리",
    "/quests": "숙제 관리",
    "/guides": "가이드",
    "/assistant": "어시스턴트",
  };

  if (!isClient) {
    logger.debug("클라이언트가 아님: 로딩 상태 렌더링");
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="modern-card fade-in mb-6">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-yellow-100 rounded-2xl flex-shrink-0">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-gray-900">즐겨찾기</h1>
                <p className="text-lg text-gray-600 mt-1">빠르게 접근하고 싶은 항목을 관리하세요.</p>
                <p className="text-sm text-gray-500 mt-1">즐겨찾는 캐릭터, 아이템, 숙제 등을 빠르게 확인하세요.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* 추가적인 요소가 필요하다면 여기에 추가 */}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="modern-card p-4 flex items-center space-x-3 mb-6">
        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
        <Input
          placeholder="즐겨찾기 검색..."
          className="flex-grow border-none focus-visible:ring-0 shadow-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Favorite Navigation Links */}
      <Card className="document-card">
        <CardHeader>
          <CardTitle>빠른 이동</CardTitle>
          <CardDescription>자주 방문하는 페이지</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(favoriteNavigationLinks).map(([href, label]) => (
              <Button
                key={href}
                variant="outline"
                className="h-auto py-3 flex-col bg-transparent"
                onClick={() => router.push(href)}
              >
                {
                  href === "/characters" ? <Users className="h-6 w-6 mb-2" /> : 
                  href === "/inventory" ? <Package className="h-6 w-6 mb-2" /> : 
                  href === "/equipment" ? <Shield className="h-6 w-6 mb-2" /> : 
                  href === "/skills" ? <Zap className="h-6 w-6 mb-2" /> : 
                  href === "/crafting" ? <Hammer className="h-6 w-6 mb-2" /> : 
                  href === "/timers" ? <Clock className="h-6 w-6 mb-2" /> : 
                  href === "/quests" ? <CheckSquare className="h-6 w-6 mb-2" /> : 
                  href === "/guides" ? <BookOpen className="h-6 w-6 mb-2" /> : 
                  href === "/assistant" ? <Bot className="h-6 w-6 mb-2" /> : null
                }
                <span className="text-sm text-center">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorites List */}
      {Object.entries(groupedFavorites).map(([category, items]) => {
        if (items.length === 0) return null;

        return (
          <Card key={category} className="document-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                {
                  category === "characters" ? <Users className="h-5 w-5 text-purple-600" /> : 
                  category === "items" ? <Package className="h-5 w-5 text-blue-600" /> : 
                  category === "craftingFacilities" ? <Hammer className="h-5 w-5 text-orange-600" /> : 
                  category === "dailyQuests" ? <CheckSquare className="h-5 w-5 text-green-600" /> : 
                  category === "weeklyQuests" ? <Calendar className="h-5 w-5 text-indigo-600" /> : 
                  category === "skills" ? <Zap className="h-5 w-5 text-red-600" /> : 
                  category === "equipment" ? <Shield className="h-5 w-5 text-yellow-600" /> : 
                  category === "gems" ? <Gem className="h-5 w-5 text-pink-600" /> : 
                  category === "avatarSets" ? <Star className="h-5 w-5 text-teal-600" /> : null
                }
                <span>{categoryDisplayNames[category]}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm text-gray-700 p-2 rounded-md hover:bg-gray-50">
                  <span className="flex items-center space-x-2">
                    {item.name}
                  </span>
                  <FavoriteToggle id={item.id} name={item.name} type={category.replace("daily", "").replace("weekly", "").toLowerCase().slice(0, -1) || "item"} />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  )
}
