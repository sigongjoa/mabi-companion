export type Gem = {
  이름: string;
  능력치1: string;
  능력치2: string | null;
  티어1: string;
  티어2: string;
  티어3: string;
  티어4: string;
  티어5: string;
};

export type CharacterGem = Gem & {
  quantity: number;
  tier: '티어1' | '티어2' | '티어3' | '티어4' | '티어5';
}; 