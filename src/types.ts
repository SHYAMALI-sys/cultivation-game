export interface Realm {
  id: number;
  name: string;
  description: string;
  qiRequired: number;
  breakthroughChance: number;
  color: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'herb' | 'pill' | 'material' | 'weapon' | 'artifact';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  effect?: {
    qiGain?: number;
    breakthroughBonus?: number;
    combatPower?: number;
    cultivationSpeed?: number;
  };
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  type: 'cultivation' | 'combat' | 'movement' | 'alchemy';
  realmRequired: number;
  learned: boolean;
  level: number;
  maxLevel: number;
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger' | 'breakthrough';
  timestamp: number;
}

export interface GameState {
  playerName: string;
  realm: number;
  qi: number;
  maxQi: number;
  qiPerSecond: number;
  spiritStones: number;
  cultivationSpeed: number;
  combatPower: number;
  isMeditating: boolean;
  isExploring: boolean;
  exploreProgress: number;
  breakthroughAttempts: number;
  tribulationActive: boolean;
  tribulationHealth: number;
  items: Item[];
  techniques: Technique[];
  log: LogEntry[];
  totalCultivationTime: number;
  breakthroughs: number;
  explorationsCompleted: number;
  battlesWon: number;
}
