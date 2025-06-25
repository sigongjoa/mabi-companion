"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

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
    inventory: { 1: 10, 2: 59, 3: 30, 4: 21, 5: 45 },
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
    inventory: { 1: 5, 2: 30, 3: 15, 4: 8 },
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
    inventory: { 1: 8, 2: 25, 3: 20 },
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
    inventory: { 1: 15, 2: 40, 3: 10 },
    equipment: {},
    skills: { 1: 1, 2: 1, 3: 1 },
  },
]

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters)
  const [activeCharacter, setActiveCharacterState] = useState<Character | null>(defaultCharacters[0])
  const [viewMode, setViewMode] = useState<"single" | "all">("single")

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCharacters = localStorage.getItem("mabinogi-characters")
      const savedActiveId = localStorage.getItem("mabinogi-active-character")
      const savedViewMode = localStorage.getItem("mabinogi-view-mode")

      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters)
        setCharacters(parsed)

        if (savedActiveId) {
          const active = parsed.find((c: Character) => c.id === savedActiveId)
          setActiveCharacterState(active || parsed[0])
        } else if (parsed.length > 0) {
          setActiveCharacterState(parsed[0])
        }
      }

      if (savedViewMode) {
        setViewMode(savedViewMode as "single" | "all")
      }
    } catch (error) {
      console.warn("Failed to load character data:", error)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem("mabinogi-characters", JSON.stringify(characters))
    } catch (error) {
      console.warn("Failed to save character data:", error)
    }
  }, [characters])

  useEffect(() => {
    try {
      if (activeCharacter) {
        localStorage.setItem("mabinogi-active-character", activeCharacter.id)
      }
    } catch (error) {
      console.warn("Failed to save active character:", error)
    }
  }, [activeCharacter])

  useEffect(() => {
    try {
      localStorage.setItem("mabinogi-view-mode", viewMode)
    } catch (error) {
      console.warn("Failed to save view mode:", error)
    }
  }, [viewMode])

  const setActiveCharacter = useCallback((character: Character | null) => {
    setActiveCharacterState(character)
    if (character) {
      // Update last active time
      setCharacters((prev) => prev.map((c) => (c.id === character.id ? { ...c, lastActive: new Date() } : c)))
    }
  }, [])

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) => {
      setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))

      // Update active character if it's the one being updated
      if (activeCharacter?.id === id) {
        setActiveCharacterState((prev) => (prev ? { ...prev, ...updates } : null))
      }
    },
    [activeCharacter],
  )

  const addCharacter = useCallback((character: Omit<Character, "id" | "lastActive">) => {
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      lastActive: new Date(),
    }
    setCharacters((prev) => [...prev, newCharacter])
  }, [])

  const deleteCharacter = useCallback(
    (id: string) => {
      setCharacters((prev) => prev.filter((c) => c.id !== id))
      if (activeCharacter?.id === id) {
        const remaining = characters.filter((c) => c.id !== id)
        setActiveCharacterState(remaining[0] || null)
      }
    },
    [activeCharacter, characters],
  )

  const toggleCharacterFavorite = useCallback(
    (id: string) => {
      updateCharacter(id, {
        favorite: !characters.find((c) => c.id === id)?.favorite,
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
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider")
  }
  return context
}
