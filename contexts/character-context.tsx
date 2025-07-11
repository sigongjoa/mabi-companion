"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import supabase from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { logger } from "@/lib/logger"
import { CharacterGemInstance, GemData } from "@/types/gem"
import { CharacterStarSeal, StarSealData } from "@/types/starSeal"
import { UserItem } from "@/types/page-context"
import { useGlobalData } from "./GlobalDataContext"; // Added import

interface ProcessingQueue {
  id: number
  isProcessing: boolean
  timeLeft: number
  totalTime: number
  itemName?: string
  quantity?: number
}

// Add this interface for currency timer state
interface CurrencyTimerState {
  current: number
  isRunning: boolean
  nextChargeTime: string | null // Stored as ISO string
  fullChargeTime: string | null // Stored as ISO string
}

export interface Character {
  id: string
  name: string
  server: string
  level: number
  profession: string
  silverCoins: number
  demonTribute: number
  favorite: boolean
  lastActive: string
  combatPower: number
  questProgress: {
    daily: { completed: number; total: number }
    weekly: { completed: number; total: number }
  }
  userItems: UserItem[]; // Changed from inventory: Record<number, number>
  equipment: Record<string, any>
  skills: Record<number, number>
  completedDailyTasks: Record<string, boolean>
  completedWeeklyTasks: Record<string, boolean>
  equippedItems: Record<string, number | null>
  craftingQueues: Record<string, ProcessingQueue[]>
  favoriteCraftingFacilities: Record<string, boolean>
  favoriteItems: Record<string, boolean>
  currencyTimers: Record<string, CurrencyTimerState>
  gems: CharacterGemInstance[]; // Add gems property
  starSeals: CharacterStarSeal[]; // Add starSeals property
  guildName?: string
  guildRank?: string
  createdAt: string
}

interface CharacterContextType {
  characters: Character[]
  activeCharacter: Character | null
  viewMode: "single" | "all"
  setActiveCharacter: (character: Character | null) => void
  setViewMode: (mode: "single" | "all") => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addCharacter: (
    character: Omit<
      Character,
      | "id"
      | "lastActive"
      | "completedDailyTasks"
      | "completedWeeklyTasks"
      | "equippedItems"
      | "skills"
      | "craftingQueues"
      | "favoriteCraftingFacilities"
      | "gems"
      | "starSeals"
    >,
  ) => void
  deleteCharacter: (id: string) => void
  toggleCharacterFavorite: (id: string) => void
  toggleCraftingFacilityFavorite: (facilityId: string) => void
  isLoadingData: boolean;
  dataLoadError: string | null;
  // Removed global data properties
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)


const createInitialQuestProgress = (
  allQuests: any,
  initialCompletedDaily: Record<string, boolean> = {},
  initialCompletedWeekly: Record<string, boolean> = {},
): { completedDailyTasks: Record<string, boolean>; completedWeeklyTasks: Record<string, boolean> } => {
  logger.debug("Entering createInitialQuestProgress", { initialCompletedDaily, initialCompletedWeekly });
  const dailyTasks: Record<string, boolean> = {};
  const weeklyTasks: Record<string, boolean> = {};

  // Get a set of all valid current daily task IDs for quick lookup
  const currentDailyTaskIds = new Set(Object.values(allQuests.daily || []).flat().map((task: any) => task.id));

  // Initialize dailyTasks with all current daily tasks set to false
  if (allQuests?.daily) {
    Object.values(allQuests.daily)
      .flat()
      .forEach((task: any) => {
        if (task && task.id) {
          dailyTasks[task.id] = false;
        }
      });
  }
  logger.debug("createInitialQuestProgress: 초기 dailyTasks (allQuests 기반)", dailyTasks);

  // Merge with initialCompletedDaily, only including tasks that are currently valid
  for (const taskId in initialCompletedDaily) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedDaily, taskId) && currentDailyTaskIds.has(taskId)) {
      dailyTasks[taskId] = initialCompletedDaily[taskId];
      logger.debug(`createInitialQuestProgress: dailyTasks 병합 - ID: ${taskId}, 값: ${initialCompletedDaily[taskId]}`);
    } else if (Object.prototype.hasOwnProperty.call(initialCompletedDaily, taskId) && !currentDailyTaskIds.has(taskId)) {
      logger.debug(`createInitialQuestProgress: 오래된 일일 숙제 ID 건너뛰기/제거 - ID: ${taskId}`);
      // Explicitly set to false or remove if not in current tasks to prevent stale true values
      delete dailyTasks[taskId];
    }
  }
  logger.debug("createInitialQuestProgress: 병합 후 dailyTasks", dailyTasks);

  // Get a set of all valid current weekly task IDs for quick lookup
  const currentWeeklyTaskIds = new Set(Object.values(allQuests.weekly || {}).flat().map((task: any) => task.id));

  // Initialize weeklyTasks with all current weekly tasks set to false
  if (allQuests?.weekly) {
    Object.values(allQuests.weekly)
      .flat()
      .forEach((task: any) => {
        if (task && task.id) {
          weeklyTasks[task.id] = false;
        }
      });
  }
  logger.debug("createInitialQuestProgress: 초기 weeklyTasks (allQuests 기반)", weeklyTasks);

  // Merge with initialCompletedWeekly, only including tasks that are currently valid
  for (const taskId in initialCompletedWeekly) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedWeekly, taskId) && currentWeeklyTaskIds.has(taskId)) {
      weeklyTasks[taskId] = initialCompletedWeekly[taskId];
      logger.debug(`createInitialQuestProgress: weeklyTasks 병합 - ID: ${taskId}, 값: ${initialCompletedWeekly[taskId]}`);
    } else if (Object.prototype.hasOwnProperty.call(initialCompletedWeekly, taskId) && !currentWeeklyTaskIds.has(taskId)) {
      logger.debug(`createInitialQuestProgress: 오래된 주간 숙제 ID 건너뛰기/제거 - ID: ${taskId}`);
      // Explicitly set to false or remove if not in current tasks to prevent stale true values
      delete weeklyTasks[taskId];
    }
  }
  logger.debug("createInitialQuestProgress: 병합 후 weeklyTasks", weeklyTasks);

  return { completedDailyTasks: dailyTasks, completedWeeklyTasks: weeklyTasks };
};

const createInitialEquipment = (initialEquipped: Record<string, number | null> = {}): Record<string, number | null> => {
  logger.debug("Entering createInitialEquipment with initialEquipped:", initialEquipped)
  const equipped: Record<string, number | null> = {
    weapon: null,
    shield: null,
    armor: null,
    gloves: null,
    pants: null,
    boots: null,
    ring1: null,
    ring2: null,
    belt: null,
  }

  for (const slot in initialEquipped) {
    if (Object.prototype.hasOwnProperty.call(initialEquipped, slot)) {
      equipped[slot] = initialEquipped[slot]
    }
  }
  logger.debug("Exiting createInitialEquipment, merged equipped:", equipped)
  return equipped
}

const createInitialSkills = (
  allSkillsData: any[],
  initialSkillLevels: Record<number, number> = {},
): Record<number, number> => {
  logger.debug("Entering createInitialSkills with initialSkillLevels:", initialSkillLevels)
  const skills: Record<number, number> = {}
  allSkillsData.forEach((skill: any) => {
    if (skill && skill.id !== undefined) {
      skills[skill.id] = 1
    }
  })
  logger.debug("Initial skills with all levels set to 1:", skills)

  for (const skillId in initialSkillLevels) {
    if (Object.prototype.hasOwnProperty.call(initialSkillLevels, skillId)) {
      skills[Number(skillId)] = initialSkillLevels[skillId]
    }
  }
  logger.debug("Exiting createInitialSkills, merged skills:", skills)
  return skills
}

const createInitialCraftingQueues = (
  allCraftingFacilitiesData: any[],
  initialQueues: Record<string, ProcessingQueue[]> = {},
): Record<string, ProcessingQueue[]> => {
  logger.debug("Entering createInitialCraftingQueues with initialQueues:", initialQueues)
  const craftingQueues: Record<string, ProcessingQueue[]> = {}

  allCraftingFacilitiesData.forEach((facility: any) => {
    craftingQueues[facility.id] = initialQueues[facility.id] || [];
    while (craftingQueues[facility.id].length < 4) {
      craftingQueues[facility.id].push({ id: craftingQueues[facility.id].length, isProcessing: false, timeLeft: 0, totalTime: 0 });
    }
  });

  for (const facilityId in initialQueues) {
    if (Object.prototype.hasOwnProperty.call(initialQueues, facilityId)) {
      initialQueues[facilityId].forEach((queueItem, index) => {
        if (craftingQueues[facilityId] && craftingQueues[facilityId][index]) {
          craftingQueues[facilityId][index] = { ...craftingQueues[facilityId][index], ...queueItem };
        }
      });
    }
  }

  logger.debug("Exiting createInitialCraftingQueues, merged craftingQueues:", craftingQueues)
  return craftingQueues
}

const createInitialFavoriteCraftingFacilities = (
  allCraftingFacilitiesData: any[],
  initialFavorites: Record<string, boolean> = {},
): Record<string, boolean> => {
  logger.debug("Entering createInitialFavoriteCraftingFacilities with initialFavorites:", initialFavorites)
  const facilities: Record<string, boolean> = {}

  allCraftingFacilitiesData.forEach((facility: any) => {
    if (facility && facility.id) {
      facilities[facility.id] = false
    }
  })

  for (const facilityId in initialFavorites) {
    if (Object.prototype.hasOwnProperty.call(initialFavorites, facilityId)) {
      facilities[facilityId] = initialFavorites[facilityId]
    }
  }
  logger.debug("Exiting createInitialFavoriteCraftingFacilities, merged facilities:", facilities)
  return facilities
}

const createInitialCurrencyTimers = (initialTimers: Record<string, CurrencyTimerState> = {}): Record<string, CurrencyTimerState> => {
  logger.debug("Entering createInitialCurrencyTimers with initialTimers:", initialTimers);
  const currencyTimers: Record<string, CurrencyTimerState> = {
    dailyLoginReward: {
      current: 0,
      isRunning: false,
      nextChargeTime: null,
      fullChargeTime: null,
    },
    silver: {
      current: 0,
      isRunning: false,
      nextChargeTime: null,
      fullChargeTime: null,
    },
    demon: {
      current: 0,
      isRunning: false,
      nextChargeTime: null,
      fullChargeTime: null,
    },
  };

  for (const timerId in initialTimers) {
    if (Object.prototype.hasOwnProperty.call(initialTimers, timerId)) {
      currencyTimers[timerId] = { ...currencyTimers[timerId], ...initialTimers[timerId] };
    }
  }
  logger.debug("Exiting createInitialCurrencyTimers, merged currencyTimers:", currencyTimers);
  return currencyTimers;
};

const createInitialGems = (initialGems: CharacterGemInstance[] = []): CharacterGemInstance[] => {
  logger.debug("Entering createInitialGems with initialGems:", initialGems);
  // Here you might want to initialize with default gem instances if any,
  // or simply return the provided initialGems if they are meant to be the source of truth.
  // For now, we'll just return the initialGems as is, assuming they are loaded from storage.
  return initialGems;
};

const createInitialStarSeals = (initialStarSeals: CharacterStarSeal[] = []): CharacterStarSeal[] => {
  logger.debug("Entering createInitialStarSeals with initialStarSeals:", initialStarSeals);
  // Similar to gems, return initialStarSeals as is.
  return initialStarSeals;
};

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  logger.debug("CharacterProvider 렌더링 시작")
  const { user, loading: authLoading } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeCharacter, setActiveCharacterState] = useState<Character | null>(null)
  const [viewMode, setViewMode] = useState<"single" | "all">("all")
  
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)

  const { allQuests, allSkillsData, allCraftingFacilitiesData, allGems, allStarSeals, isGlobalDataLoaded } = useGlobalData(); // Use useGlobalData hook

  const [isInitialized, setIsInitialized] = useState(false); // Add isInitialized state

  const loadUserData = useCallback(async (userId: string) => {
    logger.debug("Supabase 사용자 데이터 로드 시작", { userId });
    setIsLoadingData(true);
    setDataLoadError(null);
    try {
      const { data: fetchedCharacters, error: charactersError } = await supabase
        .from('characters')
        .select('*, user_items(*)') // Nest user_items directly
        .eq('user_id', userId);

      if (charactersError) throw charactersError;

      setCharacters(fetchedCharacters || []);

      // Restore active character from localStorage
      const savedActiveCharacterId = localStorage.getItem("activeCharacterId");
      if (savedActiveCharacterId) {
        const savedActiveCharacter = (fetchedCharacters || []).find(c => c.id === savedActiveCharacterId);
        if (savedActiveCharacter) {
          setActiveCharacterState(savedActiveCharacter);
        }
      }

      logger.debug("Supabase 사용자 데이터 로드 성공", { characters: fetchedCharacters });
    } catch (error) {
      logger.error("Supabase 사용자 데이터 로드 실패", { error });
      setDataLoadError(`사용자 데이터를 불러오는 데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingData(false);
      logger.debug("Supabase 사용자 데이터 로드 완료");
    }
  }, [supabase]);

  // 사용자 변경 시 사용자 데이터 로드
  useEffect(() => {
    logger.debug("useEffect: 사용자 데이터 로드 및 초기화 시작", { user, isLoadingData, dataLoadError, isGlobalDataLoaded })

    // 전역 데이터 로딩이 완료되면 (items가 비어 있어도) 캐릭터 데이터 로드
    if (user && isGlobalDataLoaded && !dataLoadError) {
      logger.debug("Supabase 전역 데이터 로드 완료 및 사용자 로그인 상태, 사용자 데이터 로드 시도");
      loadUserData(user.id);
    } else if (!user) {
      logger.debug("사용자 로그아웃 상태, 캐릭터 데이터 초기화");
      setCharacters([]);
      setActiveCharacterState(null);
      setIsInitialized(true); // Mark as initialized even if no user data
    } else if (dataLoadError) {
      logger.error("데이터 로드 오류로 인해 캐릭터 초기화 건너뜜", { dataLoadError })
    } else {
      logger.debug("전역 데이터 로딩 중이거나 아직 로드되지 않아 사용자 데이터 초기화 대기")
    }
  }, [user, isGlobalDataLoaded, dataLoadError, loadUserData]);

  // 캐릭터 변경 시 localStorage에 저장
  useEffect(() => {
    // isInitialized가 true이고 characters 배열이 비어있지 않으며 activeCharacter가 설정되어 있을 때만 저장
    if (isInitialized && characters.length > 0 && activeCharacter) {
      const charactersToSave = JSON.stringify(characters);
      logger.debug("useEffect: localStorage에 저장할 캐릭터 데이터", { charactersToSaveLength: charactersToSave.length, charactersToSave });
      localStorage.setItem("characters", charactersToSave);
    }
  }, [characters, isInitialized, activeCharacter]);

  const setActiveCharacter = useCallback((character: Character | null) => {
    logger.debug("setActiveCharacter 호출됨", { characterName: character?.name, characterId: character?.id });
    setActiveCharacterState(character);
    if (character) {
      localStorage.setItem("activeCharacterId", character.id);
      logger.debug(`localStorage에 activeCharacterId 저장됨: ${character.id}`);
    } else {
      localStorage.removeItem("activeCharacterId");
      logger.debug("localStorage에서 activeCharacterId 제거됨");
    }
  }, []);

  const updateCharacter = useCallback(
    async (id: string, updates: Partial<Character>) => {
      logger.debug(`updateCharacter 호출됨: ${id}`, { updates });

      // Optimistically update local state first for a responsive UI
      const originalCharacters = characters;
      const originalActiveCharacter = activeCharacter;

      setCharacters(prev =>
        prev.map(char =>
          char.id === id ? { ...char, ...updates } : char
        )
      );
      if (activeCharacter?.id === id) {
        setActiveCharacterState(prev => prev ? { ...prev, ...updates } : null);
      }

      try {
        // If userItems are being updated, handle them in the database
        if (updates.userItems !== undefined) {
          const { userItems, ...restUpdates } = updates;

          // First, update the character's other properties if there are any
          if (Object.keys(restUpdates).length > 0) {
            const { error: characterUpdateError } = await supabase
              .from('characters')
              .update(restUpdates)
              .eq('id', id);
            if (characterUpdateError) throw characterUpdateError;
          }

          // Then, handle the user_items separately
          // Delete all existing items for the character to prevent conflicts
          const { error: deleteError } = await supabase
            .from('user_items')
            .delete()
            .eq('character_id', id);
          if (deleteError) throw deleteError;

          // Filter out items with zero or negative quantity before inserting
          const itemsToInsert = userItems
            .filter(item => item.quantity > 0)
            .map(item => ({
              character_id: id,
              item_id: item.item_id,
              quantity: item.quantity,
              durability: item.durability,
              custom_props: item.custom_props,
            }));

          // Insert the new item list only if there are items to insert
          if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('user_items')
              .insert(itemsToInsert);
            if (insertError) throw insertError;
          }
        } else {
          // Handle other character updates (non-userItems)
          const { error } = await supabase
            .from('characters')
            .update(updates)
            .eq('id', id);
          if (error) throw error;
        }
        logger.debug(`Successfully updated character ${id} in the database.`);

      } catch (error) {
        logger.error("Error updating character, reverting local state:", error);
        // If the database update fails, revert the optimistic UI update
        setCharacters(originalCharacters);
        setActiveCharacterState(originalActiveCharacter);
      }
    },
    [characters, activeCharacter, supabase]
  );

  const addCharacter = useCallback(
    (
      character: Omit<
        Character,
        | "id"
        | "lastActive"
        | "completedDailyTasks"
        | "completedWeeklyTasks"
        | "equippedItems"
        | "skills"
        | "craftingQueues"
        | "favoriteCraftingFacilities"
      >,
    ) => {
      logger.debug("addCharacter 호출", { character });
      if (isLoadingData || dataLoadError || !isGlobalDataLoaded) {
        logger.warn("JSON 데이터 로드 중이거나 오류 발생으로 인해 캐릭터 추가 불가")
        return;
      }
      const initialEquipment = createInitialEquipment();
      const initialSkills = createInitialSkills(allSkillsData);
      const initialCraftingQueues = createInitialCraftingQueues(allCraftingFacilitiesData);
      const initialFavoriteCraftingFacilities = createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData);
      const initialCurrencyTimers = createInitialCurrencyTimers();
      const initialGems = createInitialGems();
      const initialStarSeals = createInitialStarSeals(); // Initialize starSeals

      const newCharacter: Character = {
        id: Date.now().toString(),
        lastActive: new Date().toISOString(),
        silverCoins: 0,
        demonTribute: 0,
        favorite: false,
        combatPower: 0,
        guildName: "",
        guildRank: "",
        createdAt: new Date().toISOString(),
        ...character,
        ...createInitialQuestProgress(allQuests),
        userItems: [], // Initialize userItems as an empty array
        equippedItems: initialEquipment,
        skills: initialSkills,
        craftingQueues: initialCraftingQueues,
        favoriteCraftingFacilities: initialFavoriteCraftingFacilities,
        currencyTimers: initialCurrencyTimers,
        gems: initialGems,
        starSeals: initialStarSeals, // Initialize starSeals for new character
      };
      logger.debug("addCharacter: 생성된 새 캐릭터 객체 (initialQuestProgress 병합 후)", newCharacter);

      setCharacters((prev) => {
        const updatedCharacters = [...prev, newCharacter];
        logger.debug("새 캐릭터 추가됨", { newCharacter });
        return updatedCharacters;
      });
    },
    [allQuests, allSkillsData, allCraftingFacilitiesData, isLoadingData, dataLoadError, isGlobalDataLoaded], // Updated dependencies
  )

  const deleteCharacter = useCallback((id: string) => {
    logger.debug("deleteCharacter 호출", { id });
    setCharacters((prevCharacters) =>
      prevCharacters.filter((char) => char.id !== id),
    )
    if (activeCharacter?.id === id) {
      setActiveCharacterState(null)
    }
  }, [activeCharacter])

  const toggleCharacterFavorite = useCallback((id: string) => {
    logger.debug("toggleCharacterFavorite 호출", { id });
    setCharacters((prevCharacters) =>
      prevCharacters.map((char) =>
        char.id === id ? { ...char, favorite: !char.favorite } : char,
      ),
    )
  }, [])

  const toggleCraftingFacilityFavorite = useCallback((facilityId: string) => {
    logger.debug("toggleCraftingFacilityFavorite 호출", { facilityId });
    if (!activeCharacter) return;

    updateCharacter(activeCharacter.id, {
      favoriteCraftingFacilities: {
        ...activeCharacter.favoriteCraftingFacilities,
        [facilityId]: !activeCharacter.favoriteCraftingFacilities[facilityId]
      }
    });
  }, [activeCharacter, updateCharacter]);

  const contextValue = React.useMemo(
    () => ({
      characters,
      activeCharacter,
      viewMode,
      setActiveCharacter,
      setViewMode,
      updateCharacter,
      addCharacter,
      deleteCharacter,
      toggleCharacterFavorite,
      toggleCraftingFacilityFavorite,
      isLoadingData,
      dataLoadError,
    }),
    [
      characters,
      activeCharacter,
      viewMode,
      setActiveCharacter,
      setViewMode,
      updateCharacter,
      addCharacter,
      deleteCharacter,
      toggleCharacterFavorite,
      toggleCraftingFacilityFavorite,
      isLoadingData,
      dataLoadError,
    ],
  )

  logger.debug("CharacterProvider 렌더링 완료")
  return <CharacterContext.Provider value={contextValue}>{children}</CharacterContext.Provider>
}

export function useCharacter() {
  logger.debug("useCharacter 호출")
  const context = useContext(CharacterContext)
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider")
  }
  return context
}