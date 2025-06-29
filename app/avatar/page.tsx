"use client"

import { useState, useMemo } from "react"
import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logger } from "@/lib/logger"

interface AvatarSet {
  id: string
  name: string
  category: string
  icon: string
  description: string
  items: { slot: string; item_name: string; image: string }[]
}

export default function AvatarPage() {
  logger.debug("AvatarPage 렌더링 시작");
  const { allAvatarSets, isLoadingData, dataLoadError } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const avatarSets: AvatarSet[] = useMemo(() => {
    if (!allAvatarSets) {
      logger.warn("allAvatarSets 데이터가 없습니다.");
      return [];
    }
    logger.debug("allAvatarSets 데이터 사용", { count: Object.keys(allAvatarSets).length });
    return Object.values(allAvatarSets) as AvatarSet[];
  }, [allAvatarSets]);

  const categories = useMemo(() => {
    logger.debug("categories 계산 시작");
    const uniqueCategories = ["전체", ...new Set(avatarSets.map(set => set.category))].sort();
    logger.debug("categories 계산 완료", { uniqueCategories });
    return uniqueCategories;
  }, [avatarSets]);

  const filteredAvatarSets = useMemo(() => {
    logger.debug("filteredAvatarSets 계산 시작", { selectedCategory, searchQuery });
    let filtered = avatarSets;

    if (selectedCategory !== "전체") {
      filtered = filtered.filter(set => {
        const match = set.category === selectedCategory;
        logger.debug("카테고리 필터링", { setName: set.name, setCategory: set.category, selectedCategory, match });
        return match;
      });
    }

    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(set => {
        const match = set.name.toLowerCase().includes(lowerCaseSearchQuery) ||
                      set.description.toLowerCase().includes(lowerCaseSearchQuery) ||
                      set.items.some(item => item.item_name.toLowerCase().includes(lowerCaseSearchQuery));
        logger.debug("검색 필터링", { setName: set.name, searchQuery, match });
        return match;
      });
    }
    logger.debug("filteredAvatarSets 계산 완료", { count: filtered.length });
    return filtered;
  }, [avatarSets, selectedCategory, searchQuery]);

  if (isLoadingData) {
    logger.debug("AvatarPage 로딩 중...");
    return (
      <div className="p-4 text-center text-gray-500">
        데이터 로딩 중...
      </div>
    );
  }

  if (dataLoadError) {
    logger.error("AvatarPage 데이터 로드 오류", { error: dataLoadError });
    return (
      <div className="p-4 text-center text-red-500">
        데이터 로드 중 오류 발생: {dataLoadError}
      </div>
    );
  }

  logger.debug("AvatarPage 렌더링 완료");
  return (
    <div className="container mx-auto p-4">
      <CharacterScopedHeader title="아바타" />

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="아바타 세트 검색..."
          value={searchQuery}
          onChange={(e) => {
            logger.debug("검색어 변경", { query: e.target.value });
            setSearchQuery(e.target.value);
          }}
          className="max-w-sm"
        />
        <Tabs value={selectedCategory} onValueChange={(value) => {
          logger.debug("카테고리 탭 변경", { value });
          setSelectedCategory(value);
        }}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAvatarSets.map((set) => (
          <Card key={set.id} className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={set.icon} alt={set.name} />
                  <AvatarFallback>{set.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{set.name}</span>
                <Badge variant="secondary" className="ml-auto">{set.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{set.description}</p>
              <div className="text-xs text-gray-500">
                <span className="font-semibold">포함 아이템:</span>
                <ul className="list-disc list-inside ml-2">
                  {set.items.map((item, index) => (
                    <li key={index}>{item.item_name} ({item.slot})</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 