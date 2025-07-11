"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import supabase from '@/lib/supabase';
import { logger } from "@/lib/logger"
import { GemData } from "@/types/gem"
import { StarSealData } from "@/types/starSeal"

// Added GameItem interface
export interface GameItem {
  id:           number;
  name:         string;
  category:     string;
  icon:         string | null;
  description:  string | null;
  weight:       number | null;
  price:        number | null;
  tradeable:    boolean;
  sellable:     boolean;
  initialQuantity: number | null;
}

interface GlobalDataContextType {
  allItems: Record<string, GameItem>; // Changed type to GameItem
  allQuests: any;
  allEquipment: any[];
  allSkillsData: any[];
  allCraftingFacilitiesData: any[];
  recipes: Recipe[];
  allGems: GemData | null;
  allStarSeals: StarSealData | null;
  allAvatarSets: any;
  isLoadingGlobalData: boolean;
  globalDataLoadError: string | null;
  isGlobalDataLoaded: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined)

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  logger.debug("GlobalDataProvider 렌더링 시작");

  const [allItems, setAllItems] = useState<Record<string, GameItem>>({}); // Changed type to GameItem
  const [allQuests, setAllQuests] = useState<any>({});
  const [allEquipment, setAllEquipment] = useState<any[]>([]);
  const [allSkillsData, setAllSkillsData] = useState<any[]>([]);
  const [allCraftingFacilitiesData, setAllCraftingFacilitiesData] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allGems, setAllGems] = useState<GemData | null>({});
  const [allAvatarSets, setAllAvatarSets] = useState<any>(null);
  const [allStarSeals, setAllStarSeals] = useState<StarSealData | null>({});

  const [isLoadingGlobalData, setIsLoadingGlobalData] = useState(false);
  const [globalDataLoadError, setGlobalDataLoadError] = useState<string | null>(null);
  const [isGlobalDataLoaded, setIsGlobalDataLoaded] = useState(false);

  const loadGlobalData = useCallback(async () => {
    logger.debug("Supabase 전역 데이터 로드 시작");
    setIsLoadingGlobalData(true);
    setGlobalDataLoadError(null);
    try {
      // Changed from 'items' to 'game_items'
      const { data: items, error: itemsError } = await supabase.from<GameItem>('game_items').select('*');
      const { data: quests, error: questsError } = await supabase.from('quests').select('*');
      const { data: equipment, error: equipmentError } = await supabase.from('equipment').select('*');
      const { data: skills, error: skillsError } = await supabase.from('skills').select('*');
      const { data: facilities, error: facilitiesError } = await supabase.from('craftingFacilities').select('*');
      const { data: recipes, error: recipesError } = await supabase.from('recipes').select('*');
      const { data: gems, error: gemsError } = await supabase.from('gems').select('*');
      const { data: avatarSets, error: avatarSetsError } = await supabase.from('avatarSets').select('*');
      const { data: starSeals, error: starSealsError } = await supabase.from('starSeals').select('*');

      if (itemsError) throw itemsError;
      if (questsError) throw questsError;
      if (equipmentError) throw equipmentError;
      if (skillsError) throw skillsError;
      if (facilitiesError) throw facilitiesError;
      if (recipesError) throw recipesError;
      if (gemsError) throw gemsError;
      if (avatarSetsError) throw avatarSetsError;
      if (starSealsError) throw starSealsError;

      const itemsObject = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      setAllItems(itemsObject);
      setAllQuests(quests[0] || {});
      setAllEquipment(equipment);
      setAllSkillsData(skills);
      setAllCraftingFacilitiesData(facilities);
      setRecipes(recipes);
      setAllGems(gems[0] || {});
      setAllAvatarSets(avatarSets);
      setAllStarSeals(starSeals[0] || {});

      logger.debug("Supabase 전역 데이터 로드 성공", { items, quests, equipment, skills, facilities, recipes, gems, avatarSets, starSeals });
      setIsGlobalDataLoaded(true);
    } catch (error) {
      logger.error("Supabase 전역 데이터 로드 실패", { error });
      setGlobalDataLoadError(`전역 데이터를 불러오는 데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingGlobalData(false);
      logger.debug("Supabase 전역 데이터 로드 완료");
    }
  }, []);

  useEffect(() => {
    loadGlobalData();
  }, [loadGlobalData]);

  const contextValue = React.useMemo(
    () => ({
      allItems,
      allQuests,
      allEquipment,
      allSkillsData,
      allCraftingFacilitiesData,
      recipes,
      allGems,
      allStarSeals,
      allAvatarSets,
      isLoadingGlobalData,
      globalDataLoadError,
      isGlobalDataLoaded,
    }),
    [
      allItems,
      allQuests,
      allEquipment,
      allSkillsData,
      allCraftingFacilitiesData,
      recipes,
      allGems,
      allStarSeals,
      allAvatarSets,
      isLoadingGlobalData,
      globalDataLoadError,
      isGlobalDataLoaded,
    ],
  );

  logger.debug("GlobalDataProvider 렌더링 완료");
  return <GlobalDataContext.Provider value={contextValue}>{children}</GlobalDataContext.Provider>;
}

export function useGlobalData() {
  logger.debug("useGlobalData 호출");
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }
  return context;
}