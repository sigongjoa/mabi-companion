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
}

interface CharacterContextType {
  characters: Character[]
  activeCharacter: Character | null
  viewMode: "single" | "all"
  setActiveCharacter: (character: Character | null) => void
  setViewMode: (mode: "single" | "all") => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addCharacter: (character: Omit<Character, "id" | "lastActive" | "completedDailyTasks" | "completedWeeklyTasks" | "equippedItems" | "skills" | "craftingQueues">) => void
  deleteCharacter: (id: string) => void
  toggleCharacterFavorite: (id: string) => void
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
  },
]

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  console.debug("CharacterProvider rendered.");
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters)
  const [activeCharacter, setActiveCharacterState] = useState<Character | null>(defaultCharacters[0])
  const [viewMode, setViewMode] = useState<"single" | "all">("single")

  // Load from localStorage on mount
  useEffect(() => {
    console.debug("CharacterProvider useEffect: Attempting to load from localStorage.");
    try {
      const savedCharacters = localStorage.getItem("mabinogi-characters")
      const savedActiveId = localStorage.getItem("mabinogi-active-character")
      const savedViewMode = localStorage.getItem("mabinogi-view-mode")

      if (savedCharacters) {
        console.debug("Found savedCharacters in localStorage.");
        const parsed = JSON.parse(savedCharacters)
        // Ensure loaded characters have all items initialized to 0 if missing
        const updatedParsedCharacters = parsed.map((char: Character) => {
          console.debug(`Updating character data for loaded character ${char.id}`);
          // Merge existing inventory with all items initialized to 0
          const newInventory = createInitialInventory(char.inventory);

          // Merge existing quest progress with all quests initialized to false
          const newQuestProgress = createInitialQuestProgress(char.completedDailyTasks, char.completedWeeklyTasks);

          // Merge existing equipped items with all slots initialized to null
          const newEquippedItems = createInitialEquipment(char.equippedItems);

          // Merge existing skills with all skills initialized to level 1
          const newSkills = createInitialSkills(char.skills);

          // Merge existing crafting queues with default queues
          const newCraftingQueues = createInitialCraftingQueues(char.craftingQueues);

          return { ...char, inventory: newInventory, ...newQuestProgress, equippedItems: newEquippedItems, skills: newSkills, craftingQueues: newCraftingQueues };
        });
        setCharacters(updatedParsedCharacters)

        if (savedActiveId) {
          console.debug("Found savedActiveId in localStorage.", savedActiveId);
          const active = updatedParsedCharacters.find((c: Character) => c.id === savedActiveId)
          setActiveCharacterState(active || updatedParsedCharacters[0])
        } else if (updatedParsedCharacters.length > 0) {
          console.debug("No savedActiveId, setting first character as active.");
          setActiveCharacterState(updatedParsedCharacters[0])
        }
      } else {
        console.debug("No savedCharacters found, using defaultCharacters.");
        setCharacters(defaultCharacters);
        setActiveCharacterState(defaultCharacters[0]);
      }

      if (savedViewMode) {
        console.debug("Found savedViewMode in localStorage.", savedViewMode);
        setViewMode(savedViewMode as "single" | "all")
      }
    } catch (error) {
      console.warn("Failed to load character data:", error)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    console.debug("CharacterProvider useEffect: characters state changed, saving to localStorage.", characters);
    try {
      localStorage.setItem("mabinogi-characters", JSON.stringify(characters))
    } catch (error) {
      console.warn("Failed to save character data:", error)
    }
  }, [characters])

  useEffect(() => {
    console.debug("CharacterProvider useEffect: activeCharacter state changed, saving to localStorage.", activeCharacter);
    try {
      if (activeCharacter) {
        localStorage.setItem("mabinogi-active-character", activeCharacter.id)
      }
    } catch (error) {
      console.warn("Failed to save active character:", error)
    }
  }, [activeCharacter])

  useEffect(() => {
    console.debug("CharacterProvider useEffect: viewMode state changed, saving to localStorage.", viewMode);
    try {
      localStorage.setItem("mabinogi-view-mode", viewMode)
    } catch (error) {
      console.warn("Failed to save view mode:", error)
    }
  }, [viewMode])

  const setActiveCharacter = useCallback((character: Character | null) => {
    console.debug("setActiveCharacter called with character:", character);
    setActiveCharacterState(character)
    if (character) {
      // Update last active time
      console.debug(`Updating lastActive for character: ${character.id}`);
      setCharacters((prev: Character[]) => prev.map((c: Character) => (c.id === character.id ? { ...c, lastActive: new Date() } : c)))
    }
  }, [])

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) => {
      console.debug(`updateCharacter called for ID: ${id}, updates:`, updates);
      setCharacters((prev: Character[]) => prev.map((c: Character) => (c.id === id ? { ...c, ...updates } : c)))

      // Update active character if it\'s the one being updated
      if (activeCharacter?.id === id) {
        console.debug(`Updating active character state for ID: ${id}`);
        setActiveCharacterState((prev: Character | null) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [activeCharacter],
  )

  const addCharacter = useCallback((character: Omit<Character, "id" | "lastActive" | "completedDailyTasks" | "completedWeeklyTasks" | "equippedItems" | "skills" | "craftingQueues">) => {
    console.debug("addCharacter called with character data:", character);
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      lastActive: new Date(),
      ...createInitialQuestProgress(), // New characters start with all quests incomplete
      equippedItems: createInitialEquipment(), // New characters start with no equipped items
      skills: createInitialSkills(), // New characters start with all skills at level 1
      craftingQueues: createInitialCraftingQueues(), // New characters start with empty crafting queues
    }
    console.debug("New character created:", newCharacter);
    setCharacters((prev: Character[]) => [...prev, newCharacter])
  }, [])

  const deleteCharacter = useCallback(
    (id: string) => {
      console.debug(`deleteCharacter called for ID: ${id}`);
      setCharacters((prev: Character[]) => prev.filter((c: Character) => c.id !== id))
      if (activeCharacter?.id === id) {
        console.debug(`Active character ${id} is being deleted, adjusting activeCharacterState.`);
        const remaining = characters.filter((c: Character) => c.id !== id)
        setActiveCharacterState(remaining[0] || null)
      }
    },
    [activeCharacter, characters],
  )

  const toggleCharacterFavorite = useCallback(
    (id: string) => {
      console.debug(`toggleCharacterFavorite called for ID: ${id}`);
      updateCharacter(id, {
        favorite: !characters.find((c: Character) => c.id === id)?.favorite,
      })
    },
    [characters, updateCharacter],
  )

  return (
    <CharacterContext.Provider
      value={{
        characters,
        activeCharacter,
        viewMode,
        setActiveCharacter,
        setViewMode,
        updateCharacter,
        addCharacter,
        deleteCharacter,
        toggleCharacterFavorite,
      }}
    >
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  const context = useContext(CharacterContext)
  console.debug("useCharacter hook called.");
  if (context === undefined) {
    console.error("useCharacter must be used within a CharacterProvider");
    throw new Error("useCharacter must be used within a CharacterProvider")
  }
  return context;
}
