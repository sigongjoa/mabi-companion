"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

import allItemsData from "@/data/items.json"

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
}

interface CharacterContextType {
  characters: Character[]
  activeCharacter: Character | null
  viewMode: "single" | "all"
  setActiveCharacter: (character: Character | null) => void
  setViewMode: (mode: "single" | "all") => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addCharacter: (character: Omit<Character, "id" | "lastActive">) => void
  deleteCharacter: (id: string) => void
  toggleCharacterFavorite: (id: string) => void
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

const allItems: Record<string, any> = allItemsData;

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
    skills: { 1: 1, 2: 1, 3: 2, 4: 6 },
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
    skills: { 1: 1, 2: 1, 8: 1, 14: 1 },
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
    skills: { 1: 1, 2: 1, 17: 1, 18: 1 },
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
    skills: { 1: 1, 2: 1, 3: 1 },
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
          console.debug(`Updating inventory for loaded character ${char.id}`);
          return { ...char, inventory: createInitialInventory(char.inventory) };
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

      // Update active character if it's the one being updated
      if (activeCharacter?.id === id) {
        console.debug(`Updating active character state for ID: ${id}`);
        setActiveCharacterState((prev: Character | null) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [activeCharacter],
  )

  const addCharacter = useCallback((character: Omit<Character, "id" | "lastActive">) => {
    console.debug("addCharacter called with character data:", character);
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      lastActive: new Date(),
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
