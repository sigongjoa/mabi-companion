export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  icon: string;
  description: string;
  weight: number;
  price: number;
  tradeable: boolean;
  sellable: boolean;
  isFavorite: boolean;
  quantity?: number; // Added for inventory context
}

export interface Quest {
  id: string;
  text: string;
}

export interface QuestCategory {
  [key: string]: Quest[];
}

export interface Equipment {
  id: number;
  name: string;
  type: string;
  icon: string;
  stats?: string;
}

export interface LifeSkill {
  id: number;
  name: string;
  category: string;
  level?: number; // Added for skills context
}

export interface Material {
  item: string;
  quantity: number;
}

export interface Recipe {
  product?: string; // For craftingFacilities.json, product name
  resultId?: number; // For recipes.json, result item ID
  materials: Material[];
  time?: number; // In seconds, for craftingFacilities.json
  level_condition?: number; // For craftingFacilities.json
}

export interface CraftingFacility {
  id: string;
  name: string;
  description: string;
  recipes: Recipe[];
}

export interface ProcessingQueue {
  id: number;
  isProcessing: boolean;
  timeLeft: number;
  totalTime: number;
  itemName?: string;
  quantity?: number; // Add quantity to the processing queue
}

export interface Character {
  id: string;
  name: string;
  server: string;
  level: number;
  profession: string;
  silverCoins: number;
  demonTribute: number;
  favorite: boolean;
  lastActive: Date;
  combatPower: number;
  questProgress: {
    daily: { completed: number; total: number };
    weekly: { completed: number; total: number };
  };
  inventory: Record<number, number>;
  equipment: Record<string, any>; // This is equippedItems in Character context
  skills: Record<number, number>;
  completedDailyTasks: Record<string, boolean>;
  completedWeeklyTasks: Record<string, boolean>;
  equippedItems: Record<string, number | null>;
  craftingQueues: Record<string, ProcessingQueue[]>;
  favoriteCraftingFacilities: Record<string, boolean>;
}

export interface FavoriteItem {
  id: string;
  name: string;
  type: string; // e.g., 'character', 'item', 'quest', 'crafting', 'equipment', 'timer', 'guide', 'skill', 'stat'
  page: string; // e.g., '/', '/inventory', '/quests'
  lastToggled: Date;
}

export interface PageContext {
  selectedCharacter: Character | null;
  characters: Character[]; // All characters
  inventory: InventoryItem[]; // Active character's inventory with item details
  quests: {
    daily: QuestCategory;
    weekly: QuestCategory;
  };
  equipment: Equipment[]; // All equipment data
  equippedItems: Record<string, Equipment | null>; // Active character's equipped items with full details
  skills: LifeSkill[]; // All skills data
  characterSkills: Record<number, number>; // Active character's skill levels
  craftingFacilities: CraftingFacility[]; // All crafting facilities data
  favoriteCraftingFacilities: Record<string, boolean>; // Active character's favorite crafting facilities
  craftingQueues: Record<string, ProcessingQueue[]>; // Active character's crafting queues
  favorites: FavoriteItem[]; // All favorite items
  domSnapshot?: Record<string, string>; // Optional: for DOM snapshots
  currentPage: string; // Current page path
}
