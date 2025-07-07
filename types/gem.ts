export interface BasicGem {
  id: string;
  name: string;
  effect: string;
  description?: string;
}

export interface CombinedGem {
  id: string;
  name: string;
  recipe?: string[];
  recipe_description?: string;
  effect: string;
}

export interface PremiumGem {
  id: string;
  name: string;
  acquisition: string;
  effect: string;
  description: string;
}

export interface UpgradeStage {
  level: number;
  grade: string;
  stat_increase: number;
}

export interface SkillTagCount {
  gem_type: string;
  count: number;
}

export interface GrowthRouteStep {
  step: string;
}

export interface GrowthRoute {
  name: string;
  steps: string[];
  note?: string;
}

export interface GemData {
  basicGems: BasicGem[];
  combinedGems: CombinedGem[];
  premiumGems: PremiumGem[];
  upgradeSystem: {
    stages: UpgradeStage[];
    example: string;
  };
  skillTagSystem: {
    description: string;
    skillTagCounts: SkillTagCount[];
    skillTagMeaning: string;
    changeMethod: string;
  };
  acquisitionMethods: string[];
  growthRoutes: GrowthRoute[];
}

export interface CharacterGemInstance {
  id: string; // Corresponds to BasicGem.id or CombinedGem.id or PremiumGem.id
  name: string; // Name of the gem
  grade: string; // e.g., "조각난", "투박한 S", "루비 그 자체"
  quantity: number; // How many of this specific gem (with its grade) the character has
  skillTags?: string[]; // Optional skill tags
}