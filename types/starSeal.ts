export interface StarSealType {
  id: string;
  name: string;
  grade: "에픽" | "엘리트";
  slot: string;
  effect: string;
}

export interface AcquisitionMethod {
  method: string;
  description: string;
  bosses?: {
    name: string;
    recommended_class: string;
    unique_equipment: string;
  }[];
  note?: string;
  black_hole_types?: {
    type: string;
    features: string;
  }[];
}

export interface StarSealQA {
  question: string;
  answer: string;
}

export interface StarSealData {
  types: StarSealType[];
  acquisitionMethods: AcquisitionMethod[];
  qa: StarSealQA[];
}

export interface CharacterStarSeal {
  id: string; // Corresponds to StarSealType.id
  equipped: boolean; // Whether the character has this star seal equipped
  acquisitionMethod?: string; // Optional: How it was acquired (e.g., "NPC 상점 구매")
}
