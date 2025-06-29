"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { logger } from "@/lib/logger"

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
  inventory: Record<number, number>
  equipment: Record<string, any>
  skills: Record<number, number>
  completedDailyTasks: Record<string, boolean>
  completedWeeklyTasks: Record<string, boolean>
  equippedItems: Record<string, number | null>
  craftingQueues: Record<string, ProcessingQueue[]>
  favoriteCraftingFacilities: Record<string, boolean>
  favoriteItems: Record<string, boolean>
  currencyTimers: Record<string, CurrencyTimerState>
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
    >,
  ) => void
  deleteCharacter: (id: string) => void
  toggleCharacterFavorite: (id: string) => void
  toggleCraftingFacilityFavorite: (facilityId: string) => void
  isLoadingData: boolean;
  dataLoadError: string | null;
  allItems: Record<string, any>;
  allQuests: any;
  allEquipment: any[];
  allSkillsData: any[];
  allCraftingFacilitiesData: any[];
  recipes: Recipe[];
  allGems: any[];
  allAvatarSets: any;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

const createInitialInventory = (
  allItems: Record<string, any>,
  initialQuantities: Record<number, number> = {},
): Record<number, number> => {
  logger.debug("Entering createInitialInventory with initialQuantities:", initialQuantities)
  const inventory: Record<number, number> = {}
  Object.values(allItems).forEach((item: any) => {
    if (item && item.id !== undefined) {
      inventory[item.id] = 0
    }
  })
  logger.debug("Initial inventory with all items set to 0:", inventory)

  for (const itemId in initialQuantities) {
    if (Object.prototype.hasOwnProperty.call(initialQuantities, itemId)) {
      inventory[Number(itemId)] = initialQuantities[itemId]
    }
  }
  logger.debug("Exiting createInitialInventory, merged inventory:", inventory)
  return inventory
}

const createInitialQuestProgress = (
  allQuests: any,
  initialCompletedDaily: Record<string, boolean> = {},
  initialCompletedWeekly: Record<string, boolean> = {},
): { completedDailyTasks: Record<string, boolean>; completedWeeklyTasks: Record<string, boolean> } => {
  logger.debug("Entering createInitialQuestProgress", { initialCompletedDaily, initialCompletedWeekly });
  const dailyTasks: Record<string, boolean> = {};
  const weeklyTasks: Record<string, boolean> = {};

  // Get a set of all valid current daily task IDs for quick lookup
  const currentDailyTaskIds = new Set(Object.values(allQuests.daily || {}).flat().map((task: any) => task.id));

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
    // Add other default timers if any
  };

  for (const timerId in initialTimers) {
    if (Object.prototype.hasOwnProperty.call(initialTimers, timerId)) {
      currencyTimers[timerId] = { ...currencyTimers[timerId], ...initialTimers[timerId] };
    }
  }
  logger.debug("Exiting createInitialCurrencyTimers, merged currencyTimers:", currencyTimers);
  return currencyTimers;
};

const defaultCharacters: Character[] = [
  {
    id: "1",
    name: "기사단장 테오",
    server: "류트",
    level: 120,
    profession: "석궁사수",
    silverCoins: 75,
    demonTribute: 3,
    favorite: true,
    lastActive: new Date().toISOString(),
    combatPower: 52340,
    questProgress: {
      daily: { completed: 8, total: 12 },
      weekly: { completed: 3, total: 6 },
    },
    inventory: { 1: 10, 2: 59, 3: 30, 4: 21, 5: 45, 13: 10 }, // 13번 아이템 10개 추가
    equipment: {},
    skills: { 1: 1, 2: 1, 3: 2, 4: 6 },
    completedDailyTasks: { d1: true, d4: true, w1: true },
    completedWeeklyTasks: {},
    equippedItems: {
      weapon: 1,
      shield: 2,
      armor: 3,
      gloves: 4,
      pants: 5,
      boots: 6,
      ring1: 7,
      ring2: 8,
      belt: 9,
    },
    craftingQueues: {},
    favoriteCraftingFacilities: { 1: true },
    favoriteItems: {},
    currencyTimers: {
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
    },
    guildName: "데모 길드",
    guildRank: "단장",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "음유시인 리안",
    server: "만돌린",
    level: 88,
    profession: "음유시인",
    silverCoins: 300,
    demonTribute: 2,
    favorite: false,
    lastActive: new Date().toISOString(),
    combatPower: 35120,
    questProgress: {
      daily: { completed: 5, total: 12 },
      weekly: { completed: 1, total: 6 },
    },
    inventory: { 10: 5, 11: 15, 12: 25 },
    equipment: {},
    skills: { 5: 1, 6: 3, 7: 5 },
    completedDailyTasks: { d2: true, d5: true },
    completedWeeklyTasks: {},
    equippedItems: {},
    craftingQueues: {},
    favoriteCraftingFacilities: { 1: true },
    favoriteItems: {},
    currencyTimers: {
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
    },
    guildName: "뮤직 홀릭",
    guildRank: "멤버",
    createdAt: new Date().toISOString(),
  },
]

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  logger.debug("CharacterProvider 렌더링 시작")
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeCharacter, setActiveCharacterState] = useState<Character | null>(null)
  const [viewMode, setViewMode] = useState<"single" | "all">("all")
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    logger.debug("CharacterProvider: 컴포넌트 마운트됨");
    return () => {
      logger.debug("CharacterProvider: 컴포넌트 언마운트됨");
    };
  }, []);

  // JSON 데이터들을 위한 상태
  const [allItems, setAllItems] = useState<Record<string, any>>({})
  const [allQuests, setAllQuests] = useState<any>({})
  const [allEquipment, setAllEquipment] = useState<any[]>([])
  const [allSkillsData, setAllSkillsData] = useState<any[]>([])
  const [allCraftingFacilitiesData, setAllCraftingFacilitiesData] = useState<any[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [allGems, setAllGems] = useState<any[]>([])
  const [allAvatarSets, setAllAvatarSets] = useState<any>({})

  // 다른 탭에서 localStorage 변경 시 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "characters" && event.newValue) {
        logger.debug("CharacterProvider: storage 이벤트 감지 - 캐릭터 데이터 업데이트");
        try {
          const parsedCharacters: Character[] = JSON.parse(event.newValue);
          setCharacters(parsedCharacters.map(char => {
            // JSON 데이터가 로드된 후에만 초기화 함수 사용
            if (Object.keys(allItems).length > 0 && Object.keys(allQuests).length > 0 && allSkillsData.length > 0 && allCraftingFacilitiesData.length > 0) {
              return {
                ...char,
                inventory: createInitialInventory(allItems, char.inventory),
                ...createInitialQuestProgress(allQuests, char.completedDailyTasks, char.completedWeeklyTasks),
                equippedItems: createInitialEquipment(char.equippedItems),
                skills: createInitialSkills(allSkillsData, char.skills),
                craftingQueues: createInitialCraftingQueues(allCraftingFacilitiesData, char.craftingQueues),
                favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData, char.favoriteCraftingFacilities),
                favoriteItems: char.favoriteItems,
                currencyTimers: createInitialCurrencyTimers(char.currencyTimers),
                combatPower: char.combatPower || 0,
              };
            } else {
              // JSON 데이터가 아직 로드되지 않았다면, 파싱된 데이터만 사용
              return char;
            }
          }));
          logger.debug("CharacterProvider: storage 이벤트로 캐릭터 상태 업데이트 성공");
        } catch (e) {
          logger.error("CharacterProvider: storage 이벤트 데이터 파싱 실패", { error: e });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    logger.debug("CharacterProvider: storage 이벤트 리스너 등록됨");

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      logger.debug("CharacterProvider: storage 이벤트 리스너 해제됨");
    };
  }, [allItems, allQuests, allSkillsData, allCraftingFacilitiesData]);

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)

  // 모든 JSON 데이터 로드 함수
  const loadJsonData = useCallback(async () => {
    logger.debug("JSON 데이터 로드 시작")
    setIsLoadingData(true)
    setDataLoadError(null)
    try {
      const [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes, recipesRes, gemsRes, avatarSetsRes] = await Promise.all([
        fetch("/data/items.json"),
        fetch("/data/quests.json"),
        fetch("/data/equipment.json"),
        fetch("/data/skills.json"),
        fetch("/data/craftingFacilities.json"),
        fetch("/data/recipes.json"),
        fetch("/data/gems.json"),
        fetch("/data/avatarSets.json"),
      ])

      // 모든 응답이 OK인지 확인
      for (const res of [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes, recipesRes, gemsRes, avatarSetsRes]) {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
        }
      }

      const [items, quests, equipment, skills, facilities, recipes] = await Promise.all(
        [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes, recipesRes].map(res => res.json())
      );
      
      logger.debug("JSON 데이터 로드 성공", { items, quests, equipment, skills, facilities, recipes })

      setAllItems(items)
      setAllQuests(quests)
      setAllEquipment(equipment)
      setAllSkillsData(skills)
      setAllCraftingFacilitiesData(facilities)
      setRecipes(recipes)
    } catch (error) {
      logger.error("JSON 데이터 로드 실패", { error })
      setDataLoadError(`데이터를 불러오는 데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingData(false)
      logger.debug("JSON 데이터 로드 완료")
    }
  }, [])

  // 컴포넌트 마운트 시 JSON 데이터 로드
  useEffect(() => {
    logger.debug("useEffect: loadJsonData 호출")
    loadJsonData()
  }, [loadJsonData])

  useEffect(() => {
    logger.debug("useEffect: 캐릭터 데이터 로드 및 초기화 시작", { isLoadingData, dataLoadError, allItems, allQuests, allEquipment, allSkillsData, allCraftingFacilitiesData })

    if (!isLoadingData && !dataLoadError && Object.keys(allItems).length > 0) {
      logger.debug("JSON 데이터 로드 완료, localStorage에서 캐릭터 로드 시도")
      const storedCharacters = localStorage.getItem("characters")
      let initialCharacters: Character[];

      if (storedCharacters) {
        logger.debug("localStorage에서 storedCharacters 발견", { storedCharactersLength: storedCharacters.length });
        try {
          const parsedCharacters: Character[] = JSON.parse(storedCharacters)
          logger.debug("localStorage 캐릭터 데이터 파싱 성공", { parsedCharactersLength: parsedCharacters.length });
          initialCharacters = parsedCharacters.map(char => {
            // 모든 초기화 함수에 로드된 JSON 데이터 전달
            return {
              ...char,
              inventory: createInitialInventory(allItems, char.inventory),
              ...createInitialQuestProgress(allQuests, char.completedDailyTasks, char.completedWeeklyTasks),
              equippedItems: createInitialEquipment(char.equippedItems),
              skills: createInitialSkills(allSkillsData, char.skills),
              craftingQueues: createInitialCraftingQueues(allCraftingFacilitiesData, char.craftingQueues),
              favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData, char.favoriteCraftingFacilities),
              favoriteItems: char.favoriteItems,
              currencyTimers: createInitialCurrencyTimers(char.currencyTimers),
              combatPower: char.combatPower || 0,
            }
          })
          logger.debug("localStorage에서 캐릭터 로드 및 초기화 성공", { initialCharactersLength: initialCharacters.length });
        } catch (e) {
          logger.error("localStorage 캐릭터 데이터 파싱 실패. 빈 배열로 대체합니다.", { error: e })
          initialCharacters = []; // Fallback to empty if parsing fails
        }
      } else {
        logger.debug("localStorage에 저장된 캐릭터 없음. defaultCharacters로 초기화.", { defaultCharactersLength: defaultCharacters.length });
        initialCharacters = defaultCharacters.map(char => ({
            ...char,
            inventory: createInitialInventory(allItems, char.inventory), // Use default character's initial inventory with allItems
            ...createInitialQuestProgress(allQuests, char.completedDailyTasks, char.completedWeeklyTasks), // Use default character's quest progress with allQuests
            equippedItems: createInitialEquipment(char.equippedItems), // Use default character's equipped items
            skills: createInitialSkills(allSkillsData, char.skills), // Use default character's skills with allSkillsData
            craftingQueues: createInitialCraftingQueues(allCraftingFacilitiesData, char.craftingQueues), // Use default character's crafting queues
            favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData, char.favoriteCraftingFacilities), // Use default character's favorite facilities
            favoriteItems: char.favoriteItems,
            currencyTimers: createInitialCurrencyTimers(char.currencyTimers),
            combatPower: char.combatPower || 0, // defaultCharacters에도 combatPower가 없을 수 있으므로 초기화
        }));
        logger.debug("defaultCharacters로 캐릭터 초기화 성공", { initialCharactersLength: initialCharacters.length });
      }

      setCharacters(initialCharacters);
      logger.debug("CharacterProvider: characters 상태 업데이트 완료", { finalCharactersLength: initialCharacters.length });

      // If no active character is set, set the first character from the loaded list
      // This is important for the initial load if localStorage was empty or had no active character
      if (initialCharacters.length > 0 && !activeCharacter) {
          setActiveCharacterState(initialCharacters[0]);
          logger.debug("활성 캐릭터 설정됨 (첫 번째 캐릭터)", { characterName: initialCharacters[0].name });
      }
      setIsInitialized(true); // Data has been loaded and characters set, mark as initialized
    } else if (dataLoadError) {
      logger.error("데이터 로드 오류로 인해 캐릭터 초기화 건너뜜", { dataLoadError })
    } else {
      logger.debug("JSON 데이터 로딩 중이거나 아직 로드되지 않아 캐릭터 초기화 대기")
    }
  }, [isLoadingData, dataLoadError, allItems, allQuests, allEquipment, allSkillsData, allCraftingFacilitiesData]);

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
    logger.debug("setActiveCharacter 호출", { character });
    setActiveCharacterState(character)
  }, [])

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) => {
      logger.debug(`updateCharacter 호출됨: ${id}`, { updates });
      setCharacters(prev =>
        prev.map(char =>
          char.id === id
            ? { ...char, ...updates }
            : char
        )
      );
      setActiveCharacterState(prev =>
        prev?.id === id
          ? { ...prev, ...updates }
          : prev
      );
    },
    []
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
      if (isLoadingData || dataLoadError) {
        logger.warn("JSON 데이터 로드 중이거나 오류 발생으로 인해 캐릭터 추가 불가")
        return;
      }
      const initialInventory = createInitialInventory(allItems);
      const initialEquipment = createInitialEquipment();
      const initialSkills = createInitialSkills(allSkillsData);
      const initialCraftingQueues = createInitialCraftingQueues(allCraftingFacilitiesData);
      const initialFavoriteCraftingFacilities = createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData);
      const initialCurrencyTimers = createInitialCurrencyTimers();

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
        inventory: initialInventory,
        equippedItems: initialEquipment,
        skills: initialSkills,
        craftingQueues: initialCraftingQueues,
        favoriteCraftingFacilities: initialFavoriteCraftingFacilities,
        currencyTimers: initialCurrencyTimers,
      };
      logger.debug("addCharacter: 생성된 새 캐릭터 객체 (initialQuestProgress 병합 후)", newCharacter);

      setCharacters((prev) => {
        const updatedCharacters = [...prev, newCharacter];
        logger.debug("새 캐릭터 추가됨", { newCharacter });
        return updatedCharacters;
      });
    },
    [allItems, allQuests, allSkillsData, allCraftingFacilitiesData, isLoadingData, dataLoadError],
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
      allItems,
      allQuests,
      allEquipment,
      allSkillsData,
      allCraftingFacilitiesData,
      recipes,
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
      allItems,
      allQuests,
      allEquipment,
      allSkillsData,
      allCraftingFacilitiesData,
      recipes,
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
