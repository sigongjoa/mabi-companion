"use client"

import { useMemo, useCallback } from "react";
import { useCharacter } from "@/contexts/character-context";
import { useFavorites } from "@/contexts/favorites-context";
import { usePathname } from "next/navigation";
import {
  PageContext,
  Character,
  InventoryItem,
  Quest,
  Equipment,
  LifeSkill,
  CraftingFacility,
  ProcessingQueue,
  FavoriteItem,
  QuestCategory,
} from "@/types/page-context";

import allItemsData from "@/data/items.json";
import questsData from "@/data/quests.json";
import equipmentData from "@/data/equipment.json";
import skillsData from "@/data/skills.json";
import craftingFacilitiesData from "@/data/craftingFacilities.json";

const allItems: Record<string, InventoryItem> = allItemsData;
const allQuests: { daily: QuestCategory; weekly: QuestCategory } = questsData;
const allEquipment: Equipment[] = equipmentData;
const allSkills: LifeSkill[] = skillsData;
const allCraftingFacilities: CraftingFacility[] = craftingFacilitiesData;

// 2) 순수 함수: 훅 호출 없이, 인자로 받은 값으로만 작동
function buildPageContext(
  activeCharacter: Character | null,
  characters: Character[],
  favorites: FavoriteItem[],
  pathname: string,
  allItemsData: Record<string, InventoryItem>,
  questsData: { daily: QuestCategory; weekly: QuestCategory },
  equipmentData: Equipment[],
  skillsData: LifeSkill[],
  craftingFacilitiesData: CraftingFacility[],
): PageContext {
  const inventoryItems = activeCharacter
    ? Object.entries(activeCharacter.inventory)
        .map(([id, quantity]) => {
          const item = allItemsData[id];
          return item ? { ...item, quantity } : null; // null 필터링을 위해 조건부 반환
        })
        .filter(Boolean) as InventoryItem[]
    : [];

  const equippedItemsDetailed: Record<string, Equipment | null> = activeCharacter
    ? (() => {
        const equipped: Record<string, Equipment | null> = {};
        for (const slot in activeCharacter.equippedItems) {
          if (activeCharacter.equippedItems[slot] !== null) {
            equipped[slot] = equipmentData.find(eq => eq.id === activeCharacter.equippedItems[slot]) || null;
          } else {
            equipped[slot] = null;
          }
        }
        return equipped;
      })()
    : {};

  const characterSkillLevels: Record<number, number> = activeCharacter?.skills || {};

  const craftingQueuesData: Record<string, ProcessingQueue[]> = activeCharacter?.craftingQueues || {};

  const favoriteCraftingFacilitiesData: Record<string, boolean> = activeCharacter?.favoriteCraftingFacilities || {};

  const currentPageName = pathname; // You might want to map this to a more readable name

  return {
    selectedCharacter: activeCharacter,
    characters,
    inventory: inventoryItems,
    quests: questsData,
    equipment: equipmentData,
    equippedItems: equippedItemsDetailed,
    skills: skillsData,
    characterSkills: characterSkillLevels,
    craftingFacilities: craftingFacilitiesData,
    favoriteCraftingFacilities: favoriteCraftingFacilitiesData,
    craftingQueues: craftingQueuesData,
    favorites,
    currentPage: currentPageName,
  };
}

// 3) 직렬화 함수
function serializeContext(ctx: PageContext): string {
  return JSON.stringify(ctx, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }, 2);
}

// 4) LLM 호출 함수 (클라이언트 사이드에서 서버 API 호출)
async function callLLM(userInput: string, ctx: PageContext): Promise<string> {
  const response = await fetch("/api/llm-context-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userInput, pageContext: ctx }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from LLM API.");
  }

  const data = await response.json();
  return data.response;
}

// 5) React 훅으로 묶기
export function usePageMCP() {
  const { activeCharacter, characters } = useCharacter();
  const { favorites } = useFavorites();
  const pathname = usePathname();

  // 훅의 최상위 레벨에서 데이터를 수집하고 useMemo로 래핑
  const pageContext = useMemo(() => {
    return buildPageContext(
      activeCharacter,
      characters,
      favorites,
      pathname,
      allItems,
      allQuests,
      allEquipment,
      allSkills,
      allCraftingFacilities
    );
  }, [
    activeCharacter,
    characters,
    favorites,
    pathname,
    // allItems, allQuests, allEquipment, allSkills, allCraftingFacilities는 상수이므로 의존성 배열에 포함할 필요 없음
  ]);

  const mcp = useCallback(async (userInput: string) => {
    try {
      const result = await callLLM(userInput, pageContext);
      return result;
    } catch (error) {
      console.error("Error in MCP function:", error);
      return "LLM 호출 중 오류가 발생했습니다.";
    }
  }, [pageContext]);

  return mcp;
}
