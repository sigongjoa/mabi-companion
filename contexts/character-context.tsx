"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

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
  lastActive: Date
  combatPower: number
  questProgress: {
    daily: { completed: number; total: number }
    weekly: { completed: number; total: number }
  }
  inventory: Record<number, number>
  equipment: Record<string, any>
  skills: Record<number, number>
  completedDailyTasks: Record<string, boolean>;
  completedWeeklyTasks: Record<string, boolean>;
  equippedItems: Record<string, number | null>;
  craftingQueues: Record<string, ProcessingQueue[]>;
  favoriteCraftingFacilities: Record<string, boolean>;
}

interface CharacterContextType {
  characters: Character[]
  activeCharacter: Character | null
  viewMode: "single" | "all"
  setActiveCharacter: (character: Character | null) => void
  setViewMode: (mode: "single" | "all") => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addCharacter: (character: Omit<Character, "id" | "lastActive" | "completedDailyTasks" | "completedWeeklyTasks" | "equippedItems" | "skills" | "craftingQueues" | "favoriteCraftingFacilities">) => void
  deleteCharacter: (id: string) => void
  toggleCharacterFavorite: (id: string) => void
  toggleCraftingFacilityFavorite: (facilityId: string) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

const allItems: Record<string, any> = allItemsData;
const allQuests: any = questsData;
const allEquipment: any[] = equipmentData;
const allSkillsData: any[] = skillsData;
const allCraftingFacilitiesData: any[] = craftingFacilitiesData;

const createInitialInventory = (initialQuantities: Record<number, number> = {}): Record<number, number> => {
  console.debug("Entering createInitialInventory with initialQuantities:", initialQuantities);
  const inventory: Record<number, number> = {};
  // Initialize all items from items.json with quantity 0
  Object.values(allItems).forEach((item: any) => {
    if (item && item.id !== undefined) {
      inventory[item.id] = 0;
    }
  });
  console.debug("Initial inventory with all items set to 0:", inventory);

  // Merge provided initial quantities
  for (const itemId in initialQuantities) {
    if (Object.prototype.hasOwnProperty.call(initialQuantities, itemId)) {
      inventory[Number(itemId)] = initialQuantities[itemId];
    }
  }
  console.debug("Exiting createInitialInventory, merged inventory:", inventory);
  return inventory;
};

const createInitialQuestProgress = (initialCompletedDaily: Record<string, boolean> = {}, initialCompletedWeekly: Record<string, boolean> = {}): { completedDailyTasks: Record<string, boolean>, completedWeeklyTasks: Record<string, boolean> } => {
  console.debug("Entering createInitialQuestProgress");
  const dailyTasks: Record<string, boolean> = {};
  const weeklyTasks: Record<string, boolean> = {};

  // Initialize all daily quests to false, then merge existing completed states
  Object.values(allQuests.daily).flat().forEach((task: any) => {
    if (task && task.id) {
      dailyTasks[task.id] = false;
    }
  });
  for (const taskId in initialCompletedDaily) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedDaily, taskId)) {
      dailyTasks[taskId] = initialCompletedDaily[taskId];
    }
  }
  console.debug("Initial dailyTasks:", dailyTasks);

  // Initialize all weekly quests to false, then merge existing completed states
  Object.values(allQuests.weekly).flat().forEach((task: any) => {
    if (task && task.id) {
      weeklyTasks[task.id] = false;
    }
  });
  for (const taskId in initialCompletedWeekly) {
    if (Object.prototype.hasOwnProperty.call(initialCompletedWeekly, taskId)) {
      weeklyTasks[taskId] = initialCompletedWeekly[taskId];
    }
  }
  console.debug("Initial weeklyTasks:", weeklyTasks);

  return { completedDailyTasks: dailyTasks, completedWeeklyTasks: weeklyTasks };
};

const createInitialEquipment = (initialEquipped: Record<string, number | null> = {}): Record<string, number | null> => {
  console.debug("Entering createInitialEquipment with initialEquipped:", initialEquipped);
  const equipped: Record<string, number | null> = {
    weapon: null, shield: null, armor: null, gloves: null, pants: null, boots: null, ring1: null, ring2: null, belt: null
  }; // Define all possible slots

  // Merge provided initial equipped items
  for (const slot in initialEquipped) {
    if (Object.prototype.hasOwnProperty.call(initialEquipped, slot)) {
      equipped[slot] = initialEquipped[slot];
    }
  }
  console.debug("Exiting createInitialEquipment, merged equipped:", equipped);
  return equipped;
};

const createInitialSkills = (initialSkillLevels: Record<number, number> = {}): Record<number, number> => {
  console.debug("Entering createInitialSkills with initialSkillLevels:", initialSkillLevels);
  const skills: Record<number, number> = {};
  // Initialize all skills from skills.json with level 1
  allSkillsData.forEach((skill: any) => {
    if (skill && skill.id !== undefined) {
      skills[skill.id] = 1;
    }
  });
  console.debug("Initial skills with all levels set to 1:", skills);

  // Merge provided initial skill levels
  for (const skillId in initialSkillLevels) {
    if (Object.prototype.hasOwnProperty.call(initialSkillLevels, skillId)) {
      skills[Number(skillId)] = initialSkillLevels[skillId];
    }
  }
  console.debug("Exiting createInitialSkills, merged skills:", skills);
  return skills;
};

const createInitialCraftingQueues = (initialQueues: Record<string, ProcessingQueue[]> = {}): Record<string, ProcessingQueue[]> => {
  console.debug("Entering createInitialCraftingQueues with initialQueues:", initialQueues);
  const craftingQueues: Record<string, ProcessingQueue[]> = {};

  allCraftingFacilitiesData.forEach((facility: any) => {
    const facilityId = facility.id;
    const defaultQueues: ProcessingQueue[] = Array(4)
      .fill(null)
      .map((_, i) => ({ id: i, isProcessing: false, timeLeft: 0, totalTime: 0 }));

    // Merge with existing queues if provided
    craftingQueues[facilityId] = initialQueues[facilityId]
      ? initialQueues[facilityId].map((q: ProcessingQueue, index: number) => ({
          ...defaultQueues[index], // Ensure all default properties are present
          ...q,
        }))
      : defaultQueues;
  });

  console.debug("Exiting createInitialCraftingQueues, merged craftingQueues:", craftingQueues);
  return craftingQueues;
};

const createInitialFavoriteCraftingFacilities = (initialFavorites: Record<string, boolean> = {}): Record<string, boolean> => {
  console.debug("Entering createInitialFavoriteCraftingFacilities with initialFavorites:", initialFavorites);
  const favorites: Record<string, boolean> = {};
  allCraftingFacilitiesData.forEach((facility: any) => {
    favorites[facility.id] = false;
  });
  for (const facilityId in initialFavorites) {
    if (Object.prototype.hasOwnProperty.call(initialFavorites, facilityId)) {
      favorites[facilityId] = initialFavorites[facilityId];
    }
  }
  console.debug("Exiting createInitialFavoriteCraftingFacilities, merged favorites:", favorites);
  return favorites;
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
    lastActive: new Date(),
    combatPower: 52340,
    questProgress: {
      daily: { completed: 8, total: 12 },
      weekly: { completed: 3, total: 6 },
    },
    inventory: createInitialInventory({ 1: 10, 2: 59, 3: 30, 4: 21, 5: 45, 13: 10 }), // 13번 아이템 10개 추가
    equipment: {},
    skills: createInitialSkills({ 1: 1, 2: 1, 3: 2, 4: 6 }),
    ...createInitialQuestProgress({d1: true, d4: true, w1: true}),
    equippedItems: createInitialEquipment({ weapon: 1, armor: 2, gloves: 3, shield: 4, ring1: 5, ring2: 6, pants: 7, boots: 8 }),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities({"metal": true}), // Example: metal facility is favorite
  },
  {
    id: "2",
    name: "마법사 에리나",
    server: "만돌린",
    level: 95,
    profession: "화염술사",
    silverCoins: 45,
    demonTribute: 7,
    favorite: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    combatPower: 41850,
    questProgress: {
      daily: { completed: 6, total: 12 },
      weekly: { completed: 2, total: 6 },
    },
    inventory: createInitialInventory({ 1: 5, 2: 30, 3: 15, 4: 8 }),
    equipment: {},
    skills: createInitialSkills({ 1: 1, 2: 1, 8: 1, 14: 1 }),
    ...createInitialQuestProgress({d2: true, w2: true}),
    equippedItems: createInitialEquipment(),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
  },
  {
    id: "3",
    name: "음유시인 리안",
    server: "하프",
    level: 88,
    profession: "바드",
    silverCoins: 92,
    demonTribute: 2,
    favorite: false,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    combatPower: 41500,
    questProgress: {
      daily: { completed: 4, total: 12 },
      weekly: { completed: 1, total: 6 },
    },
    inventory: createInitialInventory({ 1: 8, 2: 25, 3: 20 }),
    equipment: {},
    skills: createInitialSkills({ 1: 1, 2: 1, 17: 1, 18: 1 }),
    ...createInitialQuestProgress({d3: true, w3: true}),
    equippedItems: createInitialEquipment(),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
  },
  {
    id: "4",
    name: "쌀숭이",
    server: "류트",
    level: 65,
    profession: "모험가",
    silverCoins: 30,
    demonTribute: 5,
    favorite: false,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    combatPower: 28500,
    questProgress: {
      daily: { completed: 3, total: 12 },
      weekly: { completed: 1, total: 6 },
    },
    inventory: createInitialInventory({ 1: 15, 2: 40, 3: 10 }),
    equipment: {},
    skills: createInitialSkills({ 1: 1, 2: 1, 3: 1 }),
    ...createInitialQuestProgress({d10: true}),
    equippedItems: createInitialEquipment(),
    craftingQueues: createInitialCraftingQueues(),
    favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
  },
]

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  console.debug("CharacterProvider rendered.");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterState, setActiveCharacterState] = useState<Character | null>(null);
  const [viewMode, _setViewModeState] = useState<"single" | "all">("single");

  // Load characters from localStorage on mount
  useEffect(() => {
    console.debug("CharacterProvider useEffect: Initial load from localStorage.");
    try {
      const savedCharacters = localStorage.getItem("mabinogi-characters");
      const savedActiveCharacterId = localStorage.getItem("mabinogi-active-character-id");

      let loadedChars: Character[] = [];
      if (savedCharacters) {
        console.debug("Found saved characters in localStorage.");
        const parsedCharacters: Character[] = JSON.parse(savedCharacters).map((char: any) => ({ // Explicitly type char
          ...char,
          lastActive: char.lastActive ? new Date(char.lastActive) : new Date(), // Ensure Date objects
          inventory: createInitialInventory(char.inventory), // Re-initialize inventory with all items
          ...createInitialQuestProgress(char.completedDailyTasks, char.completedWeeklyTasks),
          equippedItems: createInitialEquipment(char.equippedItems),
          skills: createInitialSkills(char.skills),
          craftingQueues: createInitialCraftingQueues(char.craftingQueues),
          favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
        }));
        loadedChars = parsedCharacters;
        console.debug("Parsed characters from localStorage:", loadedChars);
      } else {
        console.debug("No saved characters found, using default characters.");
        loadedChars = defaultCharacters.map(char => ({
          ...char, // Ensure default characters also go through initializers
          inventory: createInitialInventory(char.inventory),
          ...createInitialQuestProgress(char.completedDailyTasks, char.completedWeeklyTasks),
          equippedItems: createInitialEquipment(char.equippedItems),
          skills: createInitialSkills(char.skills),
          craftingQueues: createInitialCraftingQueues(char.craftingQueues),
          favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
        }));
      }

      setCharacters(loadedChars);
      console.debug("Characters state set to:", loadedChars);

      let initialActiveChar: Character | null = null;
      if (savedActiveCharacterId) {
        initialActiveChar = loadedChars.find((char) => char.id === savedActiveCharacterId) || null;
        if (initialActiveChar) {
          console.debug(`Found active character from saved ID: ${initialActiveChar.name}`);
        } else {
          console.warn(`Saved active character ID ${savedActiveCharacterId} not found in loaded characters.`);
        }
      }

      if (!initialActiveChar && loadedChars.length > 0) {
        // If no saved active character or not found, select the most recently active or the first one
        initialActiveChar = loadedChars.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())[0];
        console.debug(`No saved active character or not found, defaulting to: ${initialActiveChar.name}`);
      }

      setActiveCharacterState(initialActiveChar);
      console.debug("Active character state set to:", initialActiveChar?.name || "null");

      // Set view mode from localStorage, default to 'single'
      const savedViewMode = localStorage.getItem("mabinogi-view-mode");
      if (savedViewMode === "all") {
        _setViewModeState("all");
        console.debug("View mode set to 'all' from localStorage.");
      } else {
        _setViewModeState("single");
        console.debug("View mode defaulted to 'single'.");
      }

    } catch (error) {
      console.error("Failed to load characters from localStorage", error);
      // Fallback to default if localStorage fails
      const defaultLoadedChars = defaultCharacters.map(char => ({
        ...char, // Ensure default characters also go through initializers
        inventory: createInitialInventory(char.inventory),
        ...createInitialQuestProgress(char.completedDailyTasks, char.completedWeeklyTasks),
        equippedItems: createInitialEquipment(char.equippedItems),
        skills: createInitialSkills(char.skills),
        craftingQueues: createInitialCraftingQueues(char.craftingQueues),
        favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(char.favoriteCraftingFacilities),
      }));
      setCharacters(defaultLoadedChars);
      setActiveCharacterState(defaultLoadedChars.length > 0 ? defaultLoadedChars[0] : null);
      _setViewModeState("single");
      console.debug("Falling back to default characters due to localStorage error.");
    }
  }, []);

  // Save characters and active character to localStorage whenever they change
  useEffect(() => {
    console.debug("CharacterProvider useEffect: Saving characters and active character to localStorage.");
    if (characters.length > 0) {
      localStorage.setItem("mabinogi-characters", JSON.stringify(characters));
      console.debug("Characters saved to localStorage.", characters);
    }
    if (activeCharacterState) {
      localStorage.setItem("mabinogi-active-character-id", activeCharacterState.id);
      console.debug(`Active character ID ${activeCharacterState.id} saved to localStorage.`);
    } else {
      localStorage.removeItem("mabinogi-active-character-id");
      console.debug("Active character ID removed from localStorage (no active character).");
    }
    localStorage.setItem("mabinogi-view-mode", viewMode);
    console.debug(`View mode ${viewMode} saved to localStorage.`);
  }, [characters, activeCharacterState, viewMode]);

  const setActiveCharacter = useCallback((character: Character | null) => {
    console.debug(`setActiveCharacter called. Character: ${character?.name || "null"}`);
    setActiveCharacterState(character);
    // The useEffect above will handle saving to localStorage
  }, []);

  const setViewMode = useCallback((mode: "single" | "all") => {
    console.debug(`setViewMode called. Mode: ${mode}`);
    _setViewModeState(mode);
  }, []);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    console.debug(`updateCharacter called. ID: ${id}, Updates:`, updates);
    setCharacters((prevCharacters: Character[]) => {
      const updatedChars = prevCharacters.map((char: Character) =>
        char.id === id ? { ...char, ...updates, lastActive: new Date() } : char
      );
      // If the updated character is the active one, update activeCharacterState
      if (activeCharacterState && activeCharacterState.id === id) {
        console.debug("Updated character is active, updating activeCharacterState.");
        setActiveCharacterState((prevActiveChar: Character | null) => {
          const newActiveChar = updatedChars.find((c: Character) => c.id === id) || null; // c has type Character
          console.debug("New active character state after update:", newActiveChar?.name || "null");
          return newActiveChar;
        });
      }
      console.debug("Characters state after update:", updatedChars);
      return updatedChars;
    });
  }, [activeCharacterState]);

  const addCharacter = useCallback((newChar: Omit<Character, "id" | "lastActive" | "completedDailyTasks" | "completedWeeklyTasks" | "equippedItems" | "skills" | "craftingQueues" | "favoriteCraftingFacilities">) => {
    console.debug("addCharacter called. New character data:", newChar);
    const characterId = Date.now().toString(); // Generate a unique string ID
    const fullCharacter: Character = {
      // Ensure newChar properties are applied first, then default values for missing ones
      ...newChar,
      id: characterId,
      lastActive: new Date(),
      silverCoins: 0,
      demonTribute: 0,
      favorite: false,
      combatPower: 0,
      questProgress: { daily: { completed: 0, total: Object.values(allQuests.daily).flat().length }, weekly: { completed: 0, total: Object.values(allQuests.weekly).flat().length } },
      inventory: createInitialInventory(),
      equipment: {},
      skills: createInitialSkills(),
      ...createInitialQuestProgress(),
      equippedItems: createInitialEquipment(),
      craftingQueues: createInitialCraftingQueues(),
      favoriteCraftingFacilities: createInitialFavoriteCraftingFacilities(),
    };
    console.debug("Full character to add:", fullCharacter);
    setCharacters((prev: Character[]) => {
      const updatedChars = [...prev, fullCharacter];
      console.debug("Characters state after add:", updatedChars);
      return updatedChars;
    });
    // Automatically set the newly added character as active if it's the first one or if needed
    // This logic might need refinement based on UX preference
    setActiveCharacterState(fullCharacter);
    console.debug("Newly added character set as active:", fullCharacter.name);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    console.debug(`deleteCharacter called. ID: ${id}`);
    setCharacters((prev: Character[]) => {
      const filteredChars = prev.filter((char) => char.id !== id);
      console.debug("Characters state after delete:", filteredChars);

      // If the deleted character was active, clear active character or set a new one
      if (activeCharacterState && activeCharacterState.id === id) {
        console.debug("Deleted character was active.");
        const newActiveChar = filteredChars.length > 0 ? filteredChars[0] : null;
        setActiveCharacterState(newActiveChar);
        console.debug("New active character after delete:", newActiveChar?.name || "null");
      }
      return filteredChars;
    });
  }, [activeCharacterState]);

  const toggleCharacterFavorite = useCallback((id: string) => {
    console.debug(`toggleCharacterFavorite called. ID: ${id}`);
    setCharacters((prev: Character[]) => {
      const updatedChars = prev.map((char: Character) =>
        char.id === id ? { ...char, favorite: !char.favorite } : char
      );
      console.debug("Characters state after favorite toggle:", updatedChars);
      return updatedChars;
    });
  }, []);

  const toggleCraftingFacilityFavorite = useCallback((facilityId: string) => {
    console.debug(`toggleCraftingFacilityFavorite called for facility ID: ${facilityId}`);
    if (!activeCharacterState) {
      console.warn("No active character to toggle favorite crafting facility.");
      return;
    }

    updateCharacter(activeCharacterState.id, {
      favoriteCraftingFacilities: {
        ...activeCharacterState.favoriteCraftingFacilities,
        [facilityId]: !activeCharacterState.favoriteCraftingFacilities[facilityId],
      },
    });
  }, [activeCharacterState, updateCharacter]);

  const contextValue = {
    characters,
    activeCharacter: activeCharacterState,
    viewMode,
    setActiveCharacter,
    setViewMode,
    updateCharacter,
    addCharacter,
    deleteCharacter,
    toggleCharacterFavorite,
    toggleCraftingFacilityFavorite,
  };

  console.debug("CharacterProvider returning context value.", contextValue);
  return <CharacterContext.Provider value={contextValue}>{children}</CharacterContext.Provider>
}

export function useCharacter() {
  console.debug("useCharacter hook called.");
  const context = useContext(CharacterContext)
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider")
  }
  return context
}
