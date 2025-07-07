"use client";

import { useState, useMemo } from "react";
import { useCharacter } from "@/contexts/character-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CharacterScopedHeader } from "@/components/character-scoped-header";
import { GemIcon, StarIcon } from "lucide-react";
import { logger } from "@/lib/logger";
import UnifiedLayout from "@/components/unified-layout";
import { Button } from "@/components/ui/button";

interface Gem {
  id: number;
  name: string;
  type: string;
  tier: number;
  icon: string;
  description: string;
  effects: string[];
  grade: string;
  quantity: number;
}

export default function GemsPage() {
  logger.debug("GemsPage 렌더링 시작");
  const { allGems, isLoadingData, dataLoadError } = useCharacter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorited, setShowFavorited] = useState(false);
  const [sortBy, setSortBy] = useState("grade");

  const gems: Gem[] = useMemo(() => {
    logger.debug("allGems 데이터 사용", { count: allGems.length });
    return allGems as Gem[];
  }, [allGems]);

  const filteredAndSortedGems = useMemo(() => {
    let filtered = gems;

    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (gem) =>
          gem.name.toLowerCase().includes(lowerCaseSearchQuery) ||
          gem.description.toLowerCase().includes(lowerCaseSearchQuery)
      );
    }

    if (showFavorited) {
      // 즐겨찾기 필터링 (현재 즐겨찾기 데이터가 없으므로, 임시로 일부만 필터링)
      filtered = filtered.slice(0, 5);
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === "grade") {
        return b.tier - a.tier;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "quantity") {
        return b.quantity - a.quantity;
      }
      return 0;
    });

    return filtered;
  }, [gems, searchQuery, showFavorited, sortBy]);

  if (isLoadingData) {
    return (
      <UnifiedLayout>
        <div className="p-4 text-center text-gray-500">데이터 로딩 중...</div>
      </UnifiedLayout>
    );
  }

  if (dataLoadError) {
    return (
      <UnifiedLayout>
        <div className="p-4 text-center text-red-500">
          데이터 로드 중 오류 발생: {dataLoadError}
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="container mx-auto p-4" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">
              Gem Inventory
            </p>
            <p className="text-[#637c88] text-sm font-normal leading-normal">
              Manage your collection of gems, enhance your abilities, and
              strategize your gameplay.
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#637c88]"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
            <Input
              placeholder="Search for gems"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111518] focus:outline-0 focus:ring-0 border-none bg-[#f0f3f4] focus:border-none h-12 placeholder:text-[#637c88] px-10 text-base font-normal leading-normal"
            />
          </div>
        </div>

        <div className="flex gap-3 p-3 flex-wrap pr-4">
          <Button
            variant={!showFavorited ? "secondary" : "ghost"}
            onClick={() => setShowFavorited(false)}
            className="h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl"
          >
            Show All
          </Button>
          <Button
            variant={showFavorited ? "secondary" : "ghost"}
            onClick={() => setShowFavorited(true)}
            className="h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl"
          >
            Show Favorited
          </Button>
        </div>

        <div className="flex gap-3 p-3 flex-wrap pr-4">
          <Button
            variant={sortBy === "grade" ? "secondary" : "ghost"}
            onClick={() => setSortBy("grade")}
            className="h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl"
          >
            Sort by Grade
          </Button>
          <Button
            variant={sortBy === "name" ? "secondary" : "ghost"}
            onClick={() => setSortBy("name")}
            className="h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl"
          >
            Sort by Name
          </Button>
          <Button
            variant={sortBy === "quantity" ? "secondary" : "ghost"}
            onClick={() => setSortBy("quantity")}
            className="h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl"
          >
            Sort by Quantity
          </Button>
        </div>

        <div className="px-4 py-3">
          <div className="overflow-hidden rounded-xl border border-[#dce2e5] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="px-4 py-3 text-left text-[#111518] w-14 text-sm font-medium leading-normal">
                    Gem
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[#111518] w-[200px] text-sm font-medium leading-normal">
                    Name
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[#111518] w-[150px] text-sm font-medium leading-normal">
                    Grade
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[#111518] w-[300px] text-sm font-medium leading-normal">
                    Effects
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[#111518] w-[100px] text-sm font-medium leading-normal">
                    Quantity
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[#637c88] w-60 text-sm font-medium leading-normal">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedGems.map((gem) => (
                  <TableRow key={gem.id} className="border-t border-t-[#dce2e5]">
                    <TableCell className="h-[72px] px-4 py-2 w-14">
                      <GemIcon className="w-10 h-10 text-purple-500" />
                    </TableCell>
                    <TableCell className="h-[72px] px-4 py-2 w-[200px] text-[#111518] text-sm font-medium">
                      {gem.name}
                    </TableCell>
                    <TableCell className="h-[72px] px-4 py-2 w-[150px] text-[#637c88] text-sm">
                      <Badge variant="secondary">티어 {gem.tier}</Badge>
                    </TableCell>
                    <TableCell className="h-[72px] px-4 py-2 w-[300px] text-[#637c88] text-sm">
                      {gem.effects.join(", ")}
                    </TableCell>
                    <TableCell className="h-[72px] px-4 py-2 w-[100px] text-[#637c88] text-sm">
                      {gem.quantity || 0}
                    </TableCell>
                    <TableCell className="h-[72px] px-4 py-2 w-60 text-[#637c88] text-sm font-bold">
                      <Button variant="ghost" size="sm">
                        <StarIcon className="w-4 h-4 mr-2" />
                        Favorite
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
