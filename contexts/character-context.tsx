"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

import allItemsData from "@/data/items.json"
import questsData from "@/data/quests.json"
import equipmentData from "@/data/equipment.json"
import skillsData from "@/data/skills.json"
import craftingFacilitiesData from "@/data/craftingFacilities.json"

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
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

const allItems: Record<string, any> = allItemsData
const allQuests: any = questsData
const allEquipment: any[] = equipmentData
const allSkillsData: any[] = skillsData
const allCraftingFacilitiesData: any[] = craftingFacilitiesData

const createInitialInventory = (initialQuantities: Record<number, number> = {}): Record<number, number> => {
  console.debug("Entering createInitialInventory with initialQuantities:", initialQuantities)
  const inventory: Record<number, number> = {}
  // Initialize all items from items.json with quantity 0
  Object.values(allItems).forEach((item: any) => {
    if (item && item.id !== undefined) {
      inventory[item.id] = 0
    }
  })
  console.debug("Initial inventory with all items set to 0:", inventory)

  // Merge provided initial quantities
  for (const itemId in initialQuantities) {
    if (Object.prototype.hasOwnProperty.call(initialQuantities, itemId)) {
      inventory[Number(itemId)] = initialQuantities[itemId]
    }
  }
  console.debug("Exiting createInitialInventory, merged inventory:", inventory)
  return inventory
}

const createInitialQuestProgress = (
  initialCompletedDaily: Record<string, boolean> = {},
  initialCompletedWeekly: Record<string, boolean> = {},
): { completedDailyTasks: Record<string, boolean>; completedWeeklyTasks: Record<string, boolean> } => {
  console.debug("Entering createInitialQuestProgress")
  const dailyTasks: Record<string, boolean> = {}
  const weeklyTasks: Record<string, boolean> = {}

  // Initialize all daily quests to false, then merge existing completed states
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
  console.debug("Initial dailyTasks:", dailyTasks)

  // Initialize all weekly quests to false, then merge existing completed states
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
  console.debug("Initial weeklyTasks:", weeklyTasks)

  return { completedDailyTasks: dailyTasks, completedWeeklyTasks: weeklyTasks }
}

const createInitialEquipment = (initialEquipped: Record<string, number | null> = {}): Record<string, number | null> => {
  console.debug("Entering createInitialEquipment with initialEquipped:", initialEquipped)
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
  } // Define all possible slots

  // Merge provided initial equipped items
  for (const slot in initialEquipped) {
    if (Object.prototype.hasOwnProperty.call(initialEquipped, slot)) {
      equipped[slot] = initialEquipped[slot]
    }
  }
  console.debug("Exiting createInitialEquipment, merged equipped:", equipped)
  return equipped
}

const createInitialSkills = (initialSkillLevels: Record<number, number> = {}): Record<number, number> => {
  console.debug("Entering createInitialSkills with initialSkillLevels:", initialSkillLevels)
  const skills: Record<number, number> = {}
  // Initialize all skills from skills.json with level 1
  allSkillsData.forEach((skill: any) => {
    if (skill && skill.id !== undefined) {
      skills[skill.id] = 1
    }
  })
  console.debug("Initial skills with all levels set to 1:", skills)

  // Merge provided initial skill levels
  for (const skillId in initialSkillLevels) {
    if (Object.prototype.hasOwnProperty.call(initialSkillLevels, skillId)) {
      skills[Number(skillId)] = initialSkillLevels[skillId]
    }
  }
  console.debug("Exiting createInitialSkills, merged skills:", skills)
  return skills
}

const createInitialCraftingQueues = (
  initialQueues: Record<string, ProcessingQueue[]> = {},
): Record<string, ProcessingQueue[]> => {
  console.debug("Entering createInitialCraftingQueues with initialQueues:", initialQueues)
  const craftingQueues: Record<string, ProcessingQueue[]> = {}

  allCraftingFacilitiesData.forEach((facility: any) => {
    const facilityId = facility.id
    const defaultQueues: ProcessingQueue[] = Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0, itemName: undefined, quantity: undefined }))

    // Merge with existing queues if provided
    craftingQueues[facilityId] = initialQueues[facilityId]
      ? initialQueues[facilityId].map((q, i) => ({ ...defaultQueues[i], ...q }))
      : defaultQueues
  })
  console.debug("Exiting createInitialCraftingQueues, merged craftingQueues:", craftingQueues)
  return craftingQueues
}

const createInitialFavoriteCraftingFacilities = (
  initialFavorites: Record<string, boolean> = {},
): Record<string, boolean> => {
  console.debug("Entering createInitialFavoriteCraftingFacilities with initialFavorites:", initialFavorites)
  const favoriteFacilities: Record<string, boolean> = {}

  allCraftingFacilitiesData.forEach((facility: any) => {
    favoriteFacilities[facility.id] = false
  })

  for (const facilityId in initialFavorites) {
    if (Object.prototype.hasOwnProperty.call(initialFavorites, facilityId)) {
      favoriteFacilities[facilityId] = initialFavorites[facilityId]
    }
  }
  console.debug("Exiting createInitialFavoriteCraftingFacilities, merged favoriteFacilities:", favoriteFacilities)
  return favoriteFacilities
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
    inventory: createInitialInventory({ 1: 10, 2: 59, 3: 30, 4: 21, 5: 45, 13: 10 }), // 13번 아이템 10개 추가
    equipment: {},
    skills: createInitialSkills({ 1: 1, 2: 1, 3: 2, 4: 6 }),
    completedDailyTasks: { d1: true, d4: true, w1: true },
    completedWeeklyTasks: {},
    equippedItems: createInitialEquipment({
      weapon: 1,
      shield: 2,
      armor: 3,
      gloves: 4,
      pants: 5,
      boots: 6,
      ring1: 7,
      ring2: 8,
      belt: 9,
    }),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
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
    inventory: createInitialInventory({ 10: 5, 11: 15, 12: 25 }),
    equipment: {},
    skills: createInitialSkills({ 5: 1, 6: 3, 7: 5 }),
    completedDailyTasks: { d2: true, d5: true },
    completedWeeklyTasks: {},
    equippedItems: createInitialEquipment(),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
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
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeCharacter, setActiveCharacterState] = useState<Character | null>(null)
  const [viewMode, setViewMode] = useState<"single" | "all">("single")
  const [isLoaded, setIsLoaded] = useState(false); // New state to track if data is loaded

  useEffect(() => {
    console.debug("CharacterProvider: useEffect - Initializing characters from localStorage.");
    try {
      const storedCharacters = localStorage.getItem("characters");
      if (storedCharacters) {
        const parsedCharacters: Character[] = JSON.parse(storedCharacters);
        // Apply initial structures to loaded characters to ensure new fields are present
        const initializedCharacters = parsedCharacters.map((char: Character) => {
          const { completedDailyTasks, completedWeeklyTasks } = createInitialQuestProgress(
            char.completedDailyTasks, // Pass existing completedDailyTasks (Record<string, boolean>)
            char.completedWeeklyTasks  // Pass existing completedWeeklyTasks (Record<string, boolean>)
          );
          return {
            ...char,
            inventory: createInitialInventory(char.inventory),
            // Ensure questProgress is initialized if missing from parsed data (it holds numbers)
            questProgress: char.questProgress || {
              daily: { completed: 0, total: Object.keys(allQuests.daily).length },
              weekly: { completed: 0, total: Object.keys(allQuests.weekly).length },
            },
            completedDailyTasks, // Use the initialized boolean maps
            completedWeeklyTasks, // Use the initialized boolean maps
            equipment: createInitialEquipment(char.equipment),
            skills: createInitialSkills(char.skills),
            craftingQueues: createInitialCraftingQueues(char.craftingQueues),
            favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
            currencyTimers: char.currencyTimers ? Object.entries(char.currencyTimers).reduce((acc: Record<string, CurrencyTimerState>, [key, value]: [string, any]) => {
              acc[key] = {
                current: value.current,
                isRunning: value.isRunning,
                nextChargeTime: value.nextChargeTime ? value.nextChargeTime : null,
                fullChargeTime: value.fullChargeTime ? value.fullChargeTime : null,
              };
              return acc;
            }, {}) : {
              silver: { current: 0, isRunning: false, nextChargeTime: null, fullChargeTime: null },
              demon: { current: 0, isRunning: false, nextChargeTime: null, fullChargeTime: null },
            },
          };
        });
        setCharacters(initializedCharacters);
        console.debug("CharacterProvider: Loaded characters from localStorage.", initializedCharacters);

        const storedActiveCharacterId = localStorage.getItem("activeCharacterId");
        if (storedActiveCharacterId) {
          const foundActive = initializedCharacters.find(char => char.id === storedActiveCharacterId);
          setActiveCharacterState(foundActive || null);
          console.debug("CharacterProvider: Set active character from localStorage.", foundActive);
        }

        const storedViewMode = localStorage.getItem("viewMode") as "single" | "all";
        if (storedViewMode) {
          setViewMode(storedViewMode);
          console.debug("CharacterProvider: Set view mode from localStorage.", storedViewMode);
        }

      } else {
        console.debug("CharacterProvider: No characters found in localStorage. Initializing with default characters.");
        // If no characters in localStorage, initialize with default characters
        const initializedDefaults = defaultCharacters.map(char => {
          const { completedDailyTasks, completedWeeklyTasks } = createInitialQuestProgress(
            char.completedDailyTasks, // Pass existing completedDailyTasks (Record<string, boolean>)
            char.completedWeeklyTasks  // Pass existing completedWeeklyTasks (Record<string, boolean>)
          );
          return {
            ...char,
            inventory: createInitialInventory(char.inventory),
            questProgress: char.questProgress, // defaultCharacters already has this correctly defined (it holds numbers)
            completedDailyTasks, // Use the initialized boolean maps
            completedWeeklyTasks, // Use the initialized boolean maps
            equipment: createInitialEquipment(char.equipment),
            skills: createInitialSkills(char.skills),
            craftingQueues: createInitialCraftingQueues(char.craftingQueues),
            favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
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
          };
        });
        setCharacters(initializedDefaults);
        setActiveCharacterState(initializedDefaults.length > 0 ? initializedDefaults[0] : null); // Set first default character as active
        console.debug("CharacterProvider: Initialized with default characters and set active.", initializedDefaults);
      }
    } catch (error) {
      console.error("CharacterProvider: Error loading from localStorage:", error);
      // Fallback to default characters on error as well
      const initializedDefaults = defaultCharacters.map(char => {
        const { completedDailyTasks, completedWeeklyTasks } = createInitialQuestProgress(
          char.completedDailyTasks, // Pass existing completedDailyTasks (Record<string, boolean>)
          char.completedWeeklyTasks  // Pass existing completedWeeklyTasks (Record<string, boolean>)
        );
        return {
          ...char,
          inventory: createInitialInventory(char.inventory),
          questProgress: char.questProgress, // defaultCharacters already has this correctly defined (it holds numbers)
          completedDailyTasks, // Use the initialized boolean maps
          completedWeeklyTasks, // Use the initialized boolean maps
          equipment: createInitialEquipment(char.equipment),
          skills: createInitialSkills(char.skills),
          craftingQueues: createInitialCraftingQueues(char.craftingQueues),
          favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
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
        };
      });
      setCharacters(initializedDefaults);
      setActiveCharacterState(initializedDefaults.length > 0 ? initializedDefaults[0] : null);
      console.debug("CharacterProvider: Fallback to default characters due to localStorage error.", initializedDefaults);
    } finally {
      setIsLoaded(true); // Mark as loaded whether successful or not
    }
  }, []);

  useEffect(() => {
    if (isLoaded) { // Only save to localStorage after initial load
      console.debug("CharacterProvider: useEffect - Saving characters to localStorage.", characters);
      localStorage.setItem("characters", JSON.stringify(characters));
    }
  }, [characters, isLoaded]);

  useEffect(() => {
    if (isLoaded && activeCharacter) { // Only save to localStorage after initial load
      console.debug("CharacterProvider: useEffect - Saving activeCharacterId to localStorage.", activeCharacter.id);
      localStorage.setItem("activeCharacterId", activeCharacter.id);
    } else if (isLoaded && !activeCharacter) {
      localStorage.removeItem("activeCharacterId");
    }
  }, [activeCharacter, isLoaded]);

  useEffect(() => {
    if (isLoaded) { // Only save to localStorage after initial load
      console.debug("CharacterProvider: useEffect - Saving viewMode to localStorage.", viewMode);
      localStorage.setItem("viewMode", viewMode);
    }
  }, [viewMode, isLoaded]);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    console.debug(`updateCharacter: Updating character with ID ${id}.`, updates);
    setCharacters((prevCharacters: Character[]) => {
      const updated = prevCharacters.map((char: Character) =>
        char.id === id ? { ...char, ...updates, lastActive: new Date().toISOString() } : char,
      )
      // Ensure activeCharacter is updated if it's the one being modified
      if (activeCharacter?.id === id) {
        setActiveCharacterState((prevActive: Character | null) => prevActive ? { ...prevActive, ...updates, lastActive: new Date().toISOString() } : null);
      }
      return updated
    })
  }, [activeCharacter]); // Depend on activeCharacter

  const setActiveCharacter = useCallback((character: Character | null) => {
    console.debug("setActiveCharacter: Setting active character to:", character);
    setActiveCharacterState(character);
  }, []);

  const addCharacter = useCallback(
    (character: Omit<
      Character,
      | "id"
      | "lastActive"
      | "completedDailyTasks"
      | "completedWeeklyTasks"
      | "equippedItems"
      | "skills"
      | "craftingQueues"
      | "favoriteCraftingFacilities"
    >) => {
      console.debug("addCharacter: Adding new character:", character);
      const newId = `char-${Date.now()}`
      const now = new Date().toISOString()
      
      // Initialize values for properties that are omitted from the input 'character'
      const { completedDailyTasks, completedWeeklyTasks } = createInitialQuestProgress();
      const initialEquipment = createInitialEquipment(); // Pass no argument, use default
      const initialSkills = createInitialSkills();       // Pass no argument, use default
      const initialCraftingQueues = createInitialCraftingQueues(); // Pass no argument, use default
      const initialFavoriteCraftingFacilities = createInitialFavoriteCraftingFacilities(); // Pass no argument, use default

      const newCharacter: Character = {
        ...character, // Spread incoming 'character' properties first
        id: newId,
        lastActive: now,
        inventory: createInitialInventory(character.inventory),
        questProgress: {
          daily: character.questProgress?.daily || { completed: 0, total: Object.keys(allQuests.daily).length },
          weekly: character.questProgress?.weekly || { completed: 0, total: Object.keys(allQuests.weekly).length },
        },
        completedDailyTasks: completedDailyTasks,
        completedWeeklyTasks: completedWeeklyTasks,
        equipment: initialEquipment,
        skills: initialSkills,
        equippedItems: initialEquipment, // Initialize equipped items as well, reusing initialEquipment
        craftingQueues: initialCraftingQueues,
        favoriteCraftingFacilities: initialFavoriteCraftingFacilities,
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
      }
      setCharacters((prev: Character[]) => [...prev, newCharacter])
      setActiveCharacterState(newCharacter) // Set newly added character as active
      console.debug("addCharacter: New character added and set as active:", newCharacter);
    },
    [],
  )

  const deleteCharacter = useCallback((id: string) => {
    console.debug(`deleteCharacter: Deleting character with ID ${id}.`);
    setCharacters((prev: Character[]) => prev.filter((char: Character) => char.id !== id))
    setActiveCharacterState(null) // Clear active character if deleted
  }, [])

  const toggleCharacterFavorite = useCallback((id: string) => {
    console.debug(`toggleCharacterFavorite: Toggling favorite for character ID ${id}.`);
    setCharacters((prev: Character[]) =>
      prev.map((char: Character) =>
        char.id === id ? { ...char, favorite: !char.favorite } : char,
      ),
    )
  }, [])

  const toggleCraftingFacilityFavorite = useCallback((facilityId: string) => {
    console.debug(`toggleCraftingFacilityFavorite: Toggling favorite for crafting facility ID ${facilityId}.`);
    if (!activeCharacter) {
      console.warn("toggleCraftingFacilityFavorite: No active character to toggle favorite facility.");
      return;
    }

    const currentFavorites = activeCharacter.favoriteCraftingFacilities || {};
    const newFavorites = {
      ...currentFavorites,
      [facilityId]: !currentFavorites[facilityId],
    };
    updateCharacter(activeCharacter.id, { favoriteCraftingFacilities: newFavorites });
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
    }),
    [characters, activeCharacter, viewMode, setActiveCharacter, setViewMode, updateCharacter, addCharacter, deleteCharacter, toggleCharacterFavorite, toggleCraftingFacilityFavorite],
  )

  return <CharacterContext.Provider value={contextValue}>{isLoaded ? children : null}</CharacterContext.Provider>;
}

export function useCharacter() {
  const context = useContext(CharacterContext)
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider")
  }
  return context
}
