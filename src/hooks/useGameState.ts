import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LogEntry, Item } from '../types';
import { REALMS, INITIAL_ITEMS, INITIAL_TECHNIQUES, EXPLORE_EVENTS, ALCHEMY_RECIPES } from '../gameData';

const SAVE_KEY = 'cultivation_game_save';

const getInitialState = (): GameState => {
  const defaults: GameState = {
    playerName: 'Unnamed Cultivator', realm: 0, qi: 0, maxQi: 100,
    qiPerSecond: 1, spiritStones: 50, cultivationSpeed: 1, combatPower: 10,
    isMeditating: false, isExploring: false, exploreProgress: 0,
    breakthroughAttempts: 0, tribulationActive: false, tribulationHealth: 100,
    items: INITIAL_ITEMS.map(item => ({ ...item })),
    techniques: INITIAL_TECHNIQUES.map(technique => ({ ...technique })),
    log: [{ id: 0, message: 'You awaken in a small village, feeling a strange energy within...', type: 'info', timestamp: Date.now() }],
    totalCultivationTime: 0, breakthroughs: 0, explorationsCompleted: 0, battlesWon: 0,
  };

  try {
    if (typeof window === 'undefined') return defaults;
    const saved = window.localStorage.getItem(SAVE_KEY);
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as Partial<GameState>;
    if (!parsed || typeof parsed !== 'object') return defaults;

    return {
      ...defaults,
      ...parsed,
      realm: typeof parsed.realm === 'number' && Number.isInteger(parsed.realm)
        ? Math.min(REALMS.length - 1, Math.max(0, parsed.realm))
        : defaults.realm,
      qi: typeof parsed.qi === 'number' && Number.isFinite(parsed.qi) ? Math.max(0, parsed.qi) : defaults.qi,
      items: defaults.items.map(item => {
        const savedItem = parsed.items?.find(candidate => candidate?.id === item.id);
        return savedItem ? { ...item, ...savedItem, quantity: Math.max(0, Number(savedItem.quantity) || 0) } : item;
      }),
      techniques: defaults.techniques.map(technique => {
        const savedTechnique = parsed.techniques?.find(candidate => candidate?.id === technique.id);
        return savedTechnique ? { ...technique, ...savedTechnique } : technique;
      }),
      log: Array.isArray(parsed.log)
        ? parsed.log.filter(entry => entry && typeof entry.message === 'string').slice(0, 50)
        : defaults.log,
    };
  } catch {
    return defaults;
  }
};

let logIdCounter = 1000;

export function useGameState() {
  const [state, setState] = useState<GameState>(getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save periodically and when the page is about to close.
  useEffect(() => {
    const persist = () => {
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
      } catch {
        // Storage can be disabled or full; keep the game playable.
      }
    };
    const interval = setInterval(persist, 5000);
    window.addEventListener('beforeunload', persist);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', persist);
      persist();
    };
  }, []);

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const elapsedSeconds = 0.1; // 100 ms loop; game rates are per second.
        let newState = { ...prev };
        
        // Meditation gains
        if (prev.isMeditating) {
          const qiGain = prev.qiPerSecond * prev.cultivationSpeed * getTechniqueBonus(prev) * elapsedSeconds;
          newState.qi = Math.min(prev.qi + qiGain, prev.maxQi);
          newState.totalCultivationTime += elapsedSeconds;
        }

        // Exploration progress
        if (prev.isExploring) {
          newState.exploreProgress = Math.min(100, prev.exploreProgress + 20 * elapsedSeconds);
          if (newState.exploreProgress >= 100) {
            newState.isExploring = false;
            newState.exploreProgress = 0;
            newState.explorationsCompleted += 1;
            
            // Random event
            const event = EXPLORE_EVENTS[Math.floor(Math.random() * EXPLORE_EVENTS.length)];
            newState.log = addLog(newState.log, event.message, 'success');
            newState.qi = Math.min(newState.qi + event.qi, newState.maxQi);
            newState.spiritStones = Math.max(0, newState.spiritStones + event.stones);
            
            // Add items
            for (const itemDrop of event.items) {
              if (newState.items.some(item => item.id === itemDrop.id)) {
                newState.items = newState.items.map(item =>
                  item.id === itemDrop.id ? { ...item, quantity: item.quantity + itemDrop.quantity } : item
                );
              } else {
                const template = INITIAL_ITEMS.find(item => item.id === itemDrop.id);
                if (template) newState.items = [...newState.items, { ...template, quantity: itemDrop.quantity }];
              }
            }
          }
        }

        // Tribulation
        if (prev.tribulationActive) {
          newState.tribulationHealth = Math.max(0, prev.tribulationHealth - 10 * elapsedSeconds);
          if (newState.tribulationHealth <= 0) {
            newState.tribulationActive = false;
            newState.tribulationHealth = 100;
            newState.log = addLog(newState.log, 'The tribulation lightning fades. You have survived!', 'success');
          }
        }

        return newState;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const addLogEntry = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      log: addLog(prev.log, message, type),
    }));
  }, []);

  const toggleMeditation = useCallback(() => {
    setState(prev => {
      if (prev.isExploring) return prev;
      const newState = { ...prev, isMeditating: !prev.isMeditating };
      if (newState.isMeditating) {
        newState.log = addLog(newState.log, 'You sit down and begin cultivating...', 'info');
      } else {
        newState.log = addLog(newState.log, 'You stop meditating.', 'info');
      }
      return newState;
    });
  }, []);

  const startExploring = useCallback(() => {
    setState(prev => {
      if (prev.isMeditating || prev.isExploring) return prev;
      return { ...prev, isExploring: true, exploreProgress: 0, log: addLog(prev.log, 'You set out to explore the wilderness...', 'info') };
    });
  }, []);

  const attemptBreakthrough = useCallback(() => {
    setState(prev => {
      const currentRealm = REALMS[prev.realm];
      const nextRealm = REALMS[prev.realm + 1];

      if (prev.isMeditating || prev.isExploring || prev.tribulationActive) {
        return { ...prev, log: addLog(prev.log, 'Finish your current activity before attempting a breakthrough.', 'warning') };
      }
      
      if (!nextRealm) {
        return { ...prev, log: addLog(prev.log, 'You have already reached the pinnacle of cultivation!', 'warning') };
      }
      
      if (prev.qi < nextRealm.qiRequired) {
        return { ...prev, log: addLog(prev.log, `Not enough Qi. Need ${formatNumber(nextRealm.qiRequired)}, have ${formatNumber(Math.floor(prev.qi))}.`, 'warning') };
      }

      const breakthroughChance = Math.min(1, nextRealm.breakthroughChance + getBreakthroughBonus(prev));
      const success = Math.random() < breakthroughChance;
      
      const newState = { ...prev, breakthroughAttempts: prev.breakthroughAttempts + 1 };
      
      if (success) {
        newState.realm = prev.realm + 1;
        newState.maxQi = nextRealm.qiRequired * 2;
        newState.qiPerSecond = 1 + (prev.realm + 1) * 2;
        newState.combatPower = 10 + (prev.realm + 1) * 50;
        newState.breakthroughs += 1;
        newState.log = addLog(newState.log, `⚡ BREAKTHROUGH! You have advanced to ${nextRealm.name}! ⚡`, 'breakthrough');
        
        // Learn techniques available at new realm
        newState.techniques = prev.techniques.map(t => {
          if (!t.learned && t.realmRequired <= newState.realm) {
            return { ...t, learned: true, level: 1 };
          }
          return t;
        });
        
        const newLearned = newState.techniques.filter((t, i) => t.learned && !prev.techniques[i].learned);
        for (const tech of newLearned) {
          newState.log = addLog(newState.log, `New technique learned: ${tech.name}!`, 'success');
        }
      } else {
        newState.qi = prev.qi * 0.7; // Lose 30% qi on failure
        newState.log = addLog(newState.log, `Breakthrough failed! The qi scattered. (${Math.floor(breakthroughChance * 100)}% chance)`, 'danger');
        
        // Chance of tribulation at higher realms
        if (prev.realm >= 6 && Math.random() < 0.3) {
          newState.tribulationActive = true;
          newState.tribulationHealth = 100;
          newState.log = addLog(newState.log, '⚡ Heavenly Tribulation descends! Endure the lightning!', 'danger');
        }
      }
      
      return newState;
    });
  }, []);

  const useItem = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === itemId);
      if (!item || item.quantity <= 0) return prev;
      if (!item.effect) return prev;

      const newState = { ...prev };
      newState.items = prev.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      
      if (item.effect.qiGain) {
        newState.qi = Math.min(prev.qi + item.effect.qiGain, prev.maxQi);
      }
      if (item.effect.combatPower) {
        newState.combatPower = prev.combatPower + item.effect.combatPower;
      }
      if (item.effect.cultivationSpeed) {
        newState.cultivationSpeed = prev.cultivationSpeed + item.effect.cultivationSpeed;
      }
      
      newState.log = addLog(prev.log, `Used ${item.name}. ${item.effect.qiGain ? `+${item.effect.qiGain} Qi` : ''}`, 'success');
      return newState;
    });
  }, []);

  const craftPill = useCallback((recipeId: string) => {
    setState(prev => {
      const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
      if (!recipe) return prev;
      
      if (prev.realm < recipe.realmRequired) {
        return { ...prev, log: addLog(prev.log, `Need ${REALMS[recipe.realmRequired].name} realm to craft this.`, 'warning') };
      }
      
      // Check ingredients
      for (const ingredient of recipe.ingredients) {
        const item = prev.items.find(i => i.id === ingredient.id);
        if (!item || item.quantity < ingredient.quantity) {
          return { ...prev, log: addLog(prev.log, `Not enough ingredients for ${recipe.name}.`, 'warning') };
        }
      }
      
      // Consume ingredients
      const newItems = prev.items.map(i => {
        const ingredient = recipe.ingredients.find(ing => ing.id === i.id);
        if (ingredient) {
          return { ...i, quantity: i.quantity - ingredient.quantity };
        }
        return { ...i };
      });
      
      // Success chance based on alchemy level
      const alchemyTech = prev.techniques.find(t => t.id === 'alchemy_basic');
      const successChance = alchemyTech ? 0.5 + (alchemyTech.level * 0.05) : 0.5;
      const success = Math.random() < successChance;
      
      if (!success) {
        return { ...prev, items: newItems, log: addLog(prev.log, `Alchemy failed! The pill furnace exploded...`, 'danger') };
      }

      // Only create the pill after a successful refinement.
      const resultItem = newItems.find(i => i.id === recipe.result.id);
      if (resultItem) resultItem.quantity += recipe.result.quantity;
      
      // Level up alchemy
      const newTechniques = prev.techniques.map(t => {
        if (t.id === 'alchemy_basic' && t.level < t.maxLevel) {
          return { ...t, level: t.level + 1 };
        }
        return t;
      });
      
      return { ...prev, items: newItems, techniques: newTechniques, log: addLog(prev.log, `Successfully crafted ${recipe.name}!`, 'success') };
    });
  }, []);

  const trainTechnique = useCallback((techId: string) => {
    setState(prev => {
      const tech = prev.techniques.find(t => t.id === techId);
      if (!tech || !tech.learned || tech.level >= tech.maxLevel) return prev;
      
      // Training costs qi
      const cost = tech.level * 50;
      if (prev.qi < cost) {
        return { ...prev, log: addLog(prev.log, `Need ${cost} Qi to train ${tech.name}.`, 'warning') };
      }
      
      const newState = { ...prev };
      newState.qi -= cost;
      newState.techniques = prev.techniques.map(t => {
        if (t.id === techId) {
          return { ...t, level: t.level + 1 };
        }
        return t;
      });
      
      // Apply bonuses
      if (tech.type === 'cultivation') {
        newState.cultivationSpeed = prev.cultivationSpeed + 0.2;
      } else if (tech.type === 'combat') {
        newState.combatPower = prev.combatPower + 20;
      }
      
      const updatedTech = newState.techniques.find(t => t.id === techId)!;
      newState.log = addLog(prev.log, `Trained ${tech.name} to level ${updatedTech.level}!`, 'success');
      
      return newState;
    });
  }, []);

  const huntSpiritBeast = useCallback(() => {
    setState(prev => {
      if (prev.isMeditating || prev.isExploring || prev.tribulationActive) {
        return { ...prev, log: addLog(prev.log, 'Finish your current activity before hunting a spirit beast.', 'warning') };
      }
      const entryCost = 5;
      if (prev.spiritStones < entryCost) {
        return { ...prev, log: addLog(prev.log, `Hunting requires ${entryCost} spirit stones.`, 'warning') };
      }

      const enemyPower = 18 + prev.realm * 30 + Math.floor(Math.random() * 24);
      const playerPower = prev.combatPower;
      const winChance = Math.min(0.9, Math.max(0.15, 0.55 + (playerPower - enemyPower) / Math.max(80, enemyPower * 1.5)));
      const victory = Math.random() < winChance;
      const remainingStones = prev.spiritStones - entryCost;

      if (!victory) {
        return {
          ...prev,
          spiritStones: remainingStones,
          qi: Math.floor(prev.qi * 0.9),
          log: addLog(prev.log, `The spirit beast overpowered you. You escaped with 10% less Qi. (${Math.round(winChance * 100)}% estimated odds)`, 'danger'),
        };
      }

      const lootIds = ['spirit_herb', 'iron_ore', 'crystal'];
      const lootId = lootIds[Math.floor(Math.random() * lootIds.length)];
      const items = prev.items.some(item => item.id === lootId)
        ? prev.items.map(item => item.id === lootId ? { ...item, quantity: item.quantity + 1 } : item)
        : prev.items;
      const rewardStones = 12 + prev.realm * 6;
      const rewardQi = 10 + prev.realm * 20;
      return {
        ...prev,
        items,
        qi: Math.min(prev.maxQi, prev.qi + rewardQi),
        spiritStones: remainingStones + rewardStones,
        combatPower: prev.combatPower + 1,
        battlesWon: prev.battlesWon + 1,
        log: addLog(prev.log, `Victory! You defeated a spirit beast, found ${rewardStones} spirit stones and 1 ${lootId.replace('_', ' ')}. Combat mastery increased.`, 'success'),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* Storage may be unavailable. */ }
    setState(getInitialState());
  }, []);

  return {
    state,
    toggleMeditation,
    startExploring,
    attemptBreakthrough,
    useItem,
    craftPill,
    trainTechnique,
    huntSpiritBeast,
    addLogEntry,
    resetGame,
  };
}

function addLog(log: LogEntry[], message: string, type: LogEntry['type']): LogEntry[] {
  const entry: LogEntry = { id: logIdCounter++, message, type, timestamp: Date.now() };
  return [entry, ...log].slice(0, 50);
}

function getTechniqueBonus(state: GameState): number {
  let bonus = 1;
  for (const tech of state.techniques) {
    if (tech.learned && tech.type === 'cultivation') {
      bonus += tech.level * 0.15;
    }
  }
  return bonus;
}

function getBreakthroughBonus(state: GameState): number {
  let bonus = 0;
  for (const item of state.items) {
    if (item.effect?.breakthroughBonus && item.quantity > 0) {
      bonus += item.effect.breakthroughBonus;
    }
  }
  return bonus;
}

export function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}
