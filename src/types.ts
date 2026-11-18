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

export type CultivationPathId = 'sword' | 'spirit' | 'body' | 'shadow';
export type RegionId = 'village' | 'bamboo' | 'ruins' | 'thunder_peak' | 'forbidden_vale';

export interface Disciple {
  id: string;
  name: string;
  talent: 'steady' | 'brilliant' | 'unorthodox';
  realm: number;
  loyalty: number;
  recruitedAt: number;
}

export interface WorldEventRecord {
  id: string;
  title: string;
  description: string;
  occurredAt: number;
  region: RegionId;
  character?: string;
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
  worldTime: number;
  lastTickAt: number;
  nextWorldEventAt: number;
  worldEvents: WorldEventRecord[];
  recentEventIds: string[];
  eventCount: number;
  charactersMet: string[];
  path: CultivationPathId;
  divineCooldownUntil: number;
  sectId: string | null;
  sectReputation: number;
  disciples: Disciple[];
  region: RegionId;
  visitedRegions: RegionId[];
  heartDemon: number;
  forbiddenRoute: boolean;
  heavenlyKarma: number;
}
