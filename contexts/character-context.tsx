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
  logger.debug("Entering createInitialQuestProgress")
  const dailyTasks: Record<string, boolean> = {}
  const weeklyTasks: Record<string, boolean> = {}

  Object.values(allQuests.daily)
    .flat()
    .forEach((task: any) => {
      if (task && task.id) {
        dailyTasks[task.id] = false
      }
    })
  for (const taskId in initialCompletedDaily) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedDaily, taskId)) {
      dailyTasks[taskId] = initialCompletedDaily[taskId]
    }
  }
  logger.debug("Initial dailyTasks:", dailyTasks)

  Object.values(allQuests.weekly)
    .flat()
    .forEach((task: any) => {
      if (task && task.id) {
        weeklyTasks[task.id] = false
      }
    })
  for (const taskId in initialCompletedWeekly) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedWeekly, taskId)) {
      weeklyTasks[taskId] = initialCompletedWeekly[taskId]
    }
  }
  logger.debug("Initial weeklyTasks:", weeklyTasks)

  return { completedDailyTasks: dailyTasks, completedWeeklyTasks: weeklyTasks }
}

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
  initialQueues: Record<string, ProcessingQueue[]> = {},
): Record<string, ProcessingQueue[]> => {
  logger.debug("Entering createInitialCraftingQueues with initialQueues:", initialQueues)
  const craftingQueues: Record<string, ProcessingQueue[]> = {}

  for (const facilityId in initialQueues) {
    const defaultQueues: ProcessingQueue[] = Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined }))

    // Merge with existing queues if provided
    craftingQueues[facilityId] = initialQueues[facilityId]
      ? initialQueues[facilityId].map((q, i) => ({ ...defaultQueues[i], ...q }))
      : defaultQueues
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

  // JSON 데이터들을 위한 상태
  const [allItems, setAllItems] = useState<Record<string, any>>({})
  const [allQuests, setAllQuests] = useState<any>({})
  const [allEquipment, setAllEquipment] = useState<any[]>([])
  const [allSkillsData, setAllSkillsData] = useState<any[]>([])
  const [allCraftingFacilitiesData, setAllCraftingFacilitiesData] = useState<any[]>([])

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)

  // 모든 JSON 데이터 로드 함수
  const loadJsonData = useCallback(async () => {
    logger.debug("JSON 데이터 로드 시작")
    setIsLoadingData(true)
    setDataLoadError(null)
    try {
      const [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes] = await Promise.all([
        fetch("/data/items.json"),
        fetch("/data/quests.json"),
        fetch("/data/equipment.json"),
        fetch("/data/skills.json"),
        fetch("/data/craftingFacilities.json"),
      ])

      // 모든 응답이 OK인지 확인
      for (const res of [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes]) {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
        }
      }

      const [items, quests, equipment, skills, facilities] = await Promise.all(
        [itemsRes, questsRes, equipmentRes, skillsRes, facilitiesRes].map(res => res.json())
      );
      
      logger.debug("JSON 데이터 로드 성공", { items, quests, equipment, skills, facilities })

      setAllItems(items)
      setAllQuests(quests)
      setAllEquipment(equipment)
      setAllSkillsData(skills)
      setAllCraftingFacilitiesData(facilities)
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
        try {
          const parsedCharacters: Character[] = JSON.parse(storedCharacters)
          initialCharacters = parsedCharacters.map(char => {
            // 모든 초기화 함수에 로드된 JSON 데이터 전달
            return {
              ...char,
              inventory: createInitialInventory(allItems, char.inventory),
              ...createInitialQuestProgress(allQuests, char.completedDailyTasks, char.completedWeeklyTasks),
              equippedItems: createInitialEquipment(char.equippedItems),
              skills: createInitialSkills(allSkillsData, char.skills),
              craftingQueues: createInitialCraftingQueues(char.craftingQueues),
              favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData, char.favoriteCraftingFacilities),
            }
          })
          logger.debug("localStorage에서 캐릭터 로드 및 초기화 성공", { initialCharactersLength: initialCharacters.length });
        } catch (e) {
          logger.error("localStorage 캐릭터 데이터 파싱 실패", { error: e })
          initialCharacters = []; // Fallback to empty if parsing fails
        }
      } else {
        logger.debug("localStorage에 저장된 캐릭터 없음. defaultCharacters로 초기화.")
        initialCharacters = defaultCharacters.map(char => ({
            ...char,
            inventory: createInitialInventory(allItems, char.inventory), // Use default character's initial inventory with allItems
            ...createInitialQuestProgress(allQuests, char.completedDailyTasks, char.completedWeeklyTasks), // Use default character's quest progress with allQuests
            equippedItems: createInitialEquipment(char.equippedItems), // Use default character's equipped items
            skills: createInitialSkills(allSkillsData, char.skills), // Use default character's skills with allSkillsData
            craftingQueues: createInitialCraftingQueues(char.craftingQueues), // Use default character's crafting queues
            favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData, char.favoriteCraftingFacilities), // Use default character's favorite facilities
        }));
        logger.debug("defaultCharacters로 캐릭터 초기화 성공", { initialCharactersLength: initialCharacters.length });
      }

      setCharacters(initialCharacters);

      // If no active character is set, set the first character from the loaded list
      // This is important for the initial load if localStorage was empty or had no active character
      if (initialCharacters.length > 0 && !activeCharacter) {
          setActiveCharacterState(initialCharacters[0]);
          logger.debug("활성 캐릭터 설정됨 (첫 번째 캐릭터)", { characterName: initialCharacters[0].name });
      }
    } else if (dataLoadError) {
      logger.error("데이터 로드 오류로 인해 캐릭터 초기화 건너뜜", { dataLoadError })
    } else {
      logger.debug("JSON 데이터 로딩 중이거나 아직 로드되지 않아 캐릭터 초기화 대기")
    }
  }, [isLoadingData, dataLoadError, allItems, allQuests, allEquipment, allSkillsData, allCraftingFacilitiesData]);

  // 캐릭터 변경 시 localStorage에 저장
  useEffect(() => {
    if (!isLoadingData && !dataLoadError) {
      logger.debug("useEffect: 캐릭터 데이터 변경 감지, localStorage에 저장", { characters });
      localStorage.setItem("characters", JSON.stringify(characters))
    }
  }, [characters, isLoadingData, dataLoadError])

  const setActiveCharacter = useCallback((character: Character | null) => {
    logger.debug("setActiveCharacter 호출", { character });
    setActiveCharacterState(character)
  }, [])

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) => {
      logger.debug("updateCharacter 호출", { id, updates });
      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === id ? { ...char, ...updates } : char,
        ),
      )
    },
    [],
  )

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
      const newCharacter: Character = {
        id: Date.now().toString(),
        lastActive: new Date().toISOString(),
        ...character,
        inventory: createInitialInventory(allItems), // 빈 재고로 시작
        ...createInitialQuestProgress(allQuests), // 빈 퀘스트 진행 상황으로 시작
        equippedItems: createInitialEquipment(), // 빈 장비로 시작
        skills: createInitialSkills(allSkillsData), // 초기 스킬 레벨로 시작
        craftingQueues: createInitialCraftingQueues(), // 빈 제작 대기열로 시작
        favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(allCraftingFacilitiesData), // 빈 즐겨찾기 시설로 시작
        currencyTimers: {
          eventCoin: { current: 0, isRunning: false, nextChargeTime: null, fullChargeTime: null },
          // ... 기타 통화 타이머 (필요 시 추가)
        }
      }
      setCharacters((prevCharacters) => [...prevCharacters, newCharacter])
      logger.debug("새 캐릭터 추가됨", { newCharacter });
    },
    [allItems, allQuests, allSkillsData, allCraftingFacilitiesData, isLoadingData, dataLoadError], // 의존성 추가
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
