"use client"

import { useState, useMemo } from "react"
import { useCharacter } from "@/contexts/character-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharacterScopedHeader } from "@/components/character-scoped-header"
import { GemIcon } from "lucide-react"
import { logger } from "@/lib/logger"

interface Gem {
  id: number
  name: string
  type: string
  tier: number
  icon: string
  description: string
  effects: string[]
}

export default function GemsPage() {
  logger.debug("GemsPage 렌더링 시작");
  const { allGems, isLoadingData, dataLoadError } = useCharacter();
  const [selectedTier, setSelectedTier] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const gems: Gem[] = useMemo(() => {
    logger.debug("allGems 데이터 사용", { count: allGems.length });
    return allGems as Gem[];
  }, [allGems]);

  const filteredGems = useMemo(() => {
    logger.debug("filteredGems 계산 시작", { selectedTier, searchQuery });
    let filtered = gems;

    if (selectedTier !== "전체") {
      filtered = filtered.filter((gem) => {
        const match = gem.tier.toString() === selectedTier;
        logger.debug("티어 필터링", { gemName: gem.name, gemTier: gem.tier, selectedTier, match });
        return match;
      });
    }

    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((gem) => {
        const match = gem.name.toLowerCase().includes(lowerCaseSearchQuery) ||
                      gem.description.toLowerCase().includes(lowerCaseSearchQuery);
        logger.debug("검색 필터링", { gemName: gem.name, searchQuery, match });
        return match;
      });
    }
    logger.debug("filteredGems 계산 완료", { count: filtered.length });
    return filtered;
  }, [gems, selectedTier, searchQuery]);

  const tiers = useMemo(() => {
    logger.debug("tiers 계산 시작");
    const uniqueTiers = ["전체", ...new Set(gems.map((gem) => gem.tier.toString()))].sort();
    logger.debug("tiers 계산 완료", { uniqueTiers });
    return uniqueTiers;
  }, [gems]);

  if (isLoadingData) {
    logger.debug("GemsPage 로딩 중...");
    return (
      <div className="p-4 text-center text-gray-500">
        데이터 로딩 중...
      </div>
    );
  }

  if (dataLoadError) {
    logger.error("GemsPage 데이터 로드 오류", { error: dataLoadError });
    return (
      <div className="p-4 text-center text-red-500">
        데이터 로드 중 오류 발생: {dataLoadError}
      </div>
    );
  }

  logger.debug("GemsPage 렌더링 완료");
  return (
    <div className="container mx-auto p-4">
      <CharacterScopedHeader title="젬" />
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="젬 검색..."
          value={searchQuery}
          onChange={(e) => {
            logger.debug("검색어 변경", { query: e.target.value });
            setSearchQuery(e.target.value);
          }}
          className="max-w-sm"
        />
        <Tabs value={selectedTier} onValueChange={(value) => {
          logger.debug("티어 탭 변경", { value });
          setSelectedTier(value);
        }}>
          <TabsList>
            {tiers.map((tier) => (
              <TabsTrigger key={tier} value={tier}>
                {tier === "전체" ? "전체" : `티어 ${tier}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGems.map((gem) => (
          <Card key={gem.id} className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <GemIcon className="w-5 h-5 text-purple-500" />
                <span>{gem.name}</span>
                <Badge variant="secondary" className="ml-auto">티어 {gem.tier}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{gem.description}</p>
              <div className="text-xs text-gray-500">
                <span className="font-semibold">효과:</span> {gem.effects.join(", ")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 