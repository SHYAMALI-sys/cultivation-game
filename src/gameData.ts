import { Realm, Item, Technique } from './types';
import type { CultivationPathId, RegionId } from './types';

export const REALMS: Realm[] = [
  { id: 0, name: 'Mortal', description: 'An ordinary person, unaware of the cultivation world.', qiRequired: 0, breakthroughChance: 1, color: '#6b7280' },
  { id: 1, name: 'Qi Condensation', description: 'First step on the path. Gathering spiritual energy.', qiRequired: 100, breakthroughChance: 0.9, color: '#3b82f6' },
  { id: 2, name: 'Qi Condensation (Mid)', description: 'Qi flows through meridians steadily.', qiRequired: 500, breakthroughChance: 0.85, color: '#2563eb' },
  { id: 3, name: 'Qi Condensation (Peak)', description: 'Standing at the peak of Qi Condensation.', qiRequired: 1500, breakthroughChance: 0.75, color: '#1d4ed8' },
  { id: 4, name: 'Foundation Establishment', description: 'Building the foundation for immortality.', qiRequired: 4000, breakthroughChance: 0.65, color: '#8b5cf6' },
  { id: 5, name: 'Foundation (Mid)', description: 'Foundation deepens, power grows.', qiRequired: 10000, breakthroughChance: 0.6, color: '#7c3aed' },
  { id: 6, name: 'Foundation (Peak)', description: 'Ready for the golden core.', qiRequired: 25000, breakthroughChance: 0.5, color: '#6d28d9' },
  { id: 7, name: 'Core Formation', description: 'Forming the golden core within the dantian.', qiRequired: 60000, breakthroughChance: 0.4, color: '#f59e0b' },
  { id: 8, name: 'Core (Mid)', description: 'The golden core radiates brilliant light.', qiRequired: 150000, breakthroughChance: 0.35, color: '#d97706' },
  { id: 9, name: 'Core (Peak)', description: 'Core nearly perfect, nascent soul approaches.', qiRequired: 400000, breakthroughChance: 0.3, color: '#b45309' },
  { id: 10, name: 'Nascent Soul', description: 'A soul forms within, granting immense power.', qiRequired: 1000000, breakthroughChance: 0.25, color: '#ef4444' },
  { id: 11, name: 'Nascent Soul (Mid)', description: 'The soul grows stronger with each passing day.', qiRequired: 2500000, breakthroughChance: 0.2, color: '#dc2626' },
  { id: 12, name: 'Nascent Soul (Peak)', description: 'Spirit Transformation beckons.', qiRequired: 6000000, breakthroughChance: 0.15, color: '#b91c1c' },
  { id: 13, name: 'Spirit Transformation', description: 'Transcending mortal limits.', qiRequired: 15000000, breakthroughChance: 0.12, color: '#10b981' },
  { id: 14, name: 'Void Refinement', description: 'Refining the void itself.', qiRequired: 40000000, breakthroughChance: 0.1, color: '#059669' },
  { id: 15, name: 'Body Integration', description: 'Merging with the laws of heaven and earth.', qiRequired: 100000000, breakthroughChance: 0.08, color: '#06b6d4' },
  { id: 16, name: 'Mahayana', description: 'Standing at the apex of the mortal realm.', qiRequired: 300000000, breakthroughChance: 0.05, color: '#ec4899' },
  { id: 17, name: 'Tribulation Transcendence', description: 'Facing heavenly tribulation to ascend.', qiRequired: 1000000000, breakthroughChance: 0.03, color: '#f43f5e' },
  { id: 18, name: 'True Immortal', description: 'Ascended beyond mortality. Eternal existence.', qiRequired: 3000000000, breakthroughChance: 1, color: '#fbbf24' },
];

export const INITIAL_ITEMS: Item[] = [
  { id: 'spirit_herb', name: 'Spirit Herb', description: 'A common herb infused with spiritual energy.', type: 'herb', rarity: 'common', quantity: 5, effect: { qiGain: 20 } },
  { id: 'jade_herb', name: 'Jade Spirit Herb', description: 'A jade-green herb with potent energy.', type: 'herb', rarity: 'uncommon', quantity: 2, effect: { qiGain: 80 } },
  { id: 'qi_pill', name: 'Qi Gathering Pill', description: 'A basic pill that accelerates qi gathering.', type: 'pill', rarity: 'common', quantity: 3, effect: { qiGain: 50, cultivationSpeed: 0.1 } },
  { id: 'foundation_pill', name: 'Foundation Pill', description: 'Assists in foundation establishment.', type: 'pill', rarity: 'rare', quantity: 0, effect: { qiGain: 200, breakthroughBonus: 0.1 } },
  { id: 'core_pill', name: 'Core Formation Pill', description: 'Essential for forming the golden core.', type: 'pill', rarity: 'epic', quantity: 0, effect: { qiGain: 1000, breakthroughBonus: 0.2 } },
  { id: 'iron_ore', name: 'Spirit Iron', description: 'Metal infused with spiritual energy.', type: 'material', rarity: 'common', quantity: 3 },
  { id: 'crystal', name: 'Spirit Crystal', description: 'A crystallized form of pure spiritual energy.', type: 'material', rarity: 'uncommon', quantity: 1, effect: { qiGain: 150 } },
  { id: 'wooden_sword', name: 'Wooden Practice Sword', description: 'A simple sword for beginners.', type: 'weapon', rarity: 'common', quantity: 1, effect: { combatPower: 10 } },
];

export const INITIAL_TECHNIQUES: Technique[] = [
  { id: 'basic_meditation', name: 'Basic Meditation', description: 'The fundamental technique for gathering qi.', type: 'cultivation', realmRequired: 0, learned: true, level: 1, maxLevel: 10 },
  { id: 'breath_control', name: 'Breath Control', description: 'Control your breathing to increase cultivation speed.', type: 'cultivation', realmRequired: 1, learned: false, level: 0, maxLevel: 5 },
  { id: 'sword_art', name: 'Flowing Sword Art', description: 'A graceful sword technique.', type: 'combat', realmRequired: 2, learned: false, level: 0, maxLevel: 10 },
  { id: 'cloud_step', name: 'Cloud Step', description: 'Movement technique that mimics drifting clouds.', type: 'movement', realmRequired: 3, learned: false, level: 0, maxLevel: 5 },
  { id: 'alchemy_basic', name: 'Basic Alchemy', description: 'The art of pill refinement.', type: 'alchemy', realmRequired: 1, learned: false, level: 0, maxLevel: 10 },
  { id: 'thunder_palm', name: 'Thunder Palm', description: 'Strike with the force of thunder.', type: 'combat', realmRequired: 4, learned: false, level: 0, maxLevel: 10 },
  { id: 'soul_search', name: 'Soul Search', description: 'Peering into the depths of the soul.', type: 'cultivation', realmRequired: 5, learned: false, level: 0, maxLevel: 5 },
  { id: 'void_step', name: 'Void Step', description: 'Step through space itself.', type: 'movement', realmRequired: 7, learned: false, level: 0, maxLevel: 5 },
  { id: 'heaven_sword', name: 'Heaven Splitting Sword', description: 'A technique said to split the heavens.', type: 'combat', realmRequired: 10, learned: false, level: 0, maxLevel: 10 },
];

export const EXPLORE_EVENTS = [
  { message: 'You discovered a hidden cave with spiritual herbs!', items: [{ id: 'spirit_herb', quantity: 3 }], qi: 0, stones: 10 },
  { message: 'A wandering merchant sold you rare materials.', items: [{ id: 'iron_ore', quantity: 2 }], qi: 0, stones: -5 },
  { message: 'You found an ancient cultivation manual fragment!', items: [], qi: 100, stones: 0 },
  { message: 'A spirit beast attacked! You fought it off and found its treasure.', items: [{ id: 'crystal', quantity: 1 }], qi: 50, stones: 25 },
  { message: 'You stumbled upon a jade herb growing on a cliff!', items: [{ id: 'jade_herb', quantity: 1 }], qi: 0, stones: 0 },
  { message: 'You found a small spirit stone mine!', items: [], qi: 0, stones: 50 },
  { message: 'An elder shared wisdom with you, boosting your cultivation.', items: [], qi: 200, stones: 0 },
  { message: 'You found an abandoned alchemist\'s workshop!', items: [{ id: 'qi_pill', quantity: 2 }], qi: 0, stones: 15 },
  { message: 'A mysterious fog surrounded you. You emerged stronger.', items: [], qi: 150, stones: 5 },
  { message: 'You discovered a rare spiritual spring!', items: [{ id: 'crystal', quantity: 2 }], qi: 100, stones: 30 },
  { message: 'Nothing of note found. The journey was peaceful.', items: [], qi: 20, stones: 0 },
  { message: 'You found a demon\'s hoard after defeating it!', items: [{ id: 'spirit_herb', quantity: 5 }, { id: 'iron_ore', quantity: 3 }], qi: 80, stones: 100 },
];

export const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const ALCHEMY_RECIPES = [
  { id: 'qi_pill', name: 'Qi Gathering Pill', ingredients: [{ id: 'spirit_herb', quantity: 3 }], result: { id: 'qi_pill', quantity: 2 }, realmRequired: 1 },
  { id: 'foundation_pill', name: 'Foundation Pill', ingredients: [{ id: 'jade_herb', quantity: 3 }, { id: 'crystal', quantity: 1 }], result: { id: 'foundation_pill', quantity: 1 }, realmRequired: 4 },
  { id: 'core_pill', name: 'Core Formation Pill', ingredients: [{ id: 'jade_herb', quantity: 5 }, { id: 'crystal', quantity: 3 }, { id: 'iron_ore', quantity: 5 }], result: { id: 'core_pill', quantity: 1 }, realmRequired: 7 },
];


export const CULTIVATION_PATHS: Record<CultivationPathId, { name: string; description: string; qi: number; combat: number; breakthrough: number; ability: string }> = {
  spirit: { name: 'Spirit Meridian', description: 'Steady qi circulation and calm insight.', qi: 0.24, combat: 0, breakthrough: 0.02, ability: 'Heavenly Insight' },
  sword: { name: 'Sword Heart', description: 'Turn resolve into clean, decisive force.', qi: 0.04, combat: 14, breakthrough: 0.01, ability: 'Thousand-Li Sword Intent' },
  body: { name: 'Mountain Body', description: 'Temper flesh and endure heaven’s trials.', qi: 0.08, combat: 8, breakthrough: 0.04, ability: 'Mountain-Bearing Frame' },
  shadow: { name: 'Hidden Moon', description: 'Walk the edge of forbidden knowledge.', qi: 0.18, combat: 4, breakthrough: 0.03, ability: 'Borrowed Shadow' },
};

export const REGIONS: Record<RegionId, { name: string; description: string; minRealm: number; risk: number; reward: number }> = {
  village: { name: 'Willowmist Village', description: 'A safe foothold where wandering cultivators trade stories.', minRealm: 0, risk: 0, reward: 1 },
  bamboo: { name: 'Jade Bamboo Sea', description: 'Herbs grow beneath a canopy that muffles distant footsteps.', minRealm: 0, risk: 1, reward: 1.25 },
  ruins: { name: 'Sunken Star Ruins', description: 'Ancient formations still pulse below cracked stone.', minRealm: 2, risk: 2, reward: 1.7 },
  thunder_peak: { name: 'Thunder-Crowned Peak', description: 'A storm-scarred ridge where heaven tests the ambitious.', minRealm: 5, risk: 3, reward: 2.3 },
  forbidden_vale: { name: 'Forbidden Vale', description: 'The valley answers desire, then asks what you will surrender.', minRealm: 3, risk: 4, reward: 3 },
};

export const SECTS = [
  { id: 'azure-pavilion', name: 'Azure Cloud Pavilion', motto: 'Stillness reveals the way.', focus: 'cultivation' },
  { id: 'iron-peak', name: 'Iron Peak Hall', motto: 'Strength is a promise kept.', focus: 'combat' },
  { id: 'moonless-court', name: 'Moonless Court', motto: 'Every shadow has a price.', focus: 'forbidden' },
] as const;

export const WORLD_EVENT_TEMPLATES = [
  { id: 'traveller', title: 'A traveller at the crossroads', text: '{name} shares a rumor from {region}. You leave with a new perspective.', qi: 35, stones: 3 },
  { id: 'omen', title: 'A sign in the heavens', text: 'A pale constellation turns above {region}; your meridians answer with a quiet pulse.', qi: 65, stones: 0 },
  { id: 'market', title: 'The wandering market', text: 'A merchant caravan reaches {region}. You trade good fortune for spirit stones.', qi: 0, stones: 12 },
  { id: 'rival', title: 'A rival takes notice', text: '{name} challenges the tale of your progress in {region}; the encounter sharpens your intent.', qi: 20, stones: 5 },
  { id: 'herbs', title: 'A season of spirit herbs', text: 'A brief rain awakens a patch of herbs in {region}.', qi: 25, stones: 2 },
  { id: 'heaven', title: 'Heaven’s distant warning', text: 'Thunder rolls over {region}. Your actions have drawn heaven’s attention.', qi: 45, stones: 0 },
] as const;

export const GENERATED_NAMES = ['Lin Yue', 'Shen Rui', 'Qiao Wen', 'Mo Yan', 'Bai Lian', 'Ren Kai', 'Su Nian', 'Gu Chen', 'Yun Zhi', 'He Fang', 'Luo Xin', 'Tao Ming'];
