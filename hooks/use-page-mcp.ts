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
  logger.debug("serializeContext 호출", { ctx });
  return JSON.stringify(ctx, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }, 2);
}

// 4) LLM 호출 함수 (클라이언트 사이드에서 서버 API 호출)
async function callLLM(userInput: string, ctx: PageContext): Promise<string> {
  logger.debug("callLLM 호출", { userInput, ctx });
  const response = await fetch("/api/llm-context-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userInput, pageContext: ctx }),
  });

  if (!response.ok) {
    logger.error("LLM API 응답 실패", { status: response.status, statusText: response.statusText });
    throw new Error("Failed to get response from LLM API.");
  }

  const data = await response.json();
  logger.debug("LLM API 응답 성공", { data });
  return data.response;
}

// 5) React 훅으로 묶기
export function usePageMCP() {
  logger.debug("usePageMCP 훅 호출 시작");
  const {
    activeCharacter,
    characters,
    allItems,
    allQuests,
    allEquipment,
    allSkillsData,
    allCraftingFacilitiesData,
    isLoadingData,
    dataLoadError
  } = useCharacter();
  const { favorites } = useFavorites();
  const pathname = usePathname();

  // 훅의 최상위 레벨에서 데이터를 수집하고 useMemo로 래핑
  const pageContext = useMemo(() => {
    logger.debug("pageContext 계산 시작", { activeCharacter, characters, favorites, pathname, allItems, allQuests, allEquipment, allSkillsData, allCraftingFacilitiesData });
    if (isLoadingData || dataLoadError) {
      logger.debug("pageContext: 데이터 로딩 중이거나 오류 발생, 기본값 반환");
      return {
        selectedCharacter: null,
        characters: [],
        inventory: [],
        quests: { daily: {}, weekly: {} },
        equipment: [],
        equippedItems: {},
        skills: [],
        characterSkills: {},
        craftingFacilities: [],
        favoriteCraftingFacilities: {},
        craftingQueues: {},
        favorites: [],
        currentPage: pathname,
      };
    }
    return buildPageContext(
      activeCharacter,
      characters,
      favorites,
      pathname,
      allItems,
      allQuests,
      allEquipment,
      allSkillsData,
      allCraftingFacilitiesData
    );
  }, [
    activeCharacter,
    characters,
    favorites,
    pathname,
    allItems,
    allQuests,
    allEquipment,
    allSkillsData,
    allCraftingFacilitiesData,
    isLoadingData,
    dataLoadError,
  ]);

  const mcp = useCallback(async (userInput: string) => {
    logger.debug("mcp 함수 호출", { userInput });
    try {
      const result = await callLLM(userInput, pageContext);
      logger.debug("mcp 함수 결과", { result });
      return result;
    } catch (error) {
      logger.error("MCP 함수에서 오류 발생", { error });
      return "LLM 호출 중 오류가 발생했습니다.";
    }
  }, [pageContext]);

  logger.debug("usePageMCP 훅 호출 완료");
  return mcp;
}
