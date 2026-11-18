import { useState, useEffect, useCallback, useRef } from 'react';
import { CultivationPathId, Disciple, GameState, LogEntry, RegionId } from '../types';
import { REALMS, INITIAL_ITEMS, INITIAL_TECHNIQUES, EXPLORE_EVENTS, ALCHEMY_RECIPES, CULTIVATION_PATHS, REGIONS, SECTS, WORLD_EVENT_TEMPLATES } from '../gameData';

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
    worldTime: 0, lastTickAt: Date.now(), nextWorldEventAt: 3600, worldEvents: [], recentEventIds: [], eventCount: 0,
    charactersMet: [], path: 'spirit', divineCooldownUntil: 0, sectId: null, sectReputation: 0, disciples: [],
    region: 'village', visitedRegions: ['village'], heartDemon: 0, forbiddenRoute: false, heavenlyKarma: 0,
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
      worldTime: finiteNonNegative(parsed.worldTime, defaults.worldTime),
      lastTickAt: finiteNonNegative(parsed.lastTickAt, Date.now()),
      nextWorldEventAt: finiteNonNegative(parsed.nextWorldEventAt, defaults.nextWorldEventAt),
      worldEvents: Array.isArray(parsed.worldEvents) ? parsed.worldEvents.filter(isWorldEvent).slice(0, 40) : [],
      recentEventIds: Array.isArray(parsed.recentEventIds) ? parsed.recentEventIds.filter((id): id is string => typeof id === 'string').slice(0, 8) : [],
      eventCount: Math.max(0, Math.floor(finiteNonNegative(parsed.eventCount, 0))),
      charactersMet: Array.isArray(parsed.charactersMet) ? parsed.charactersMet.filter((name): name is string => typeof name === 'string').slice(-2000) : [],
      path: isPath(parsed.path) ? parsed.path : defaults.path,
      divineCooldownUntil: finiteNonNegative(parsed.divineCooldownUntil, 0),
      sectId: typeof parsed.sectId === 'string' && SECTS.some(sect => sect.id === parsed.sectId) ? parsed.sectId : null,
      sectReputation: finiteNonNegative(parsed.sectReputation, 0),
      disciples: Array.isArray(parsed.disciples) ? parsed.disciples.filter(isDisciple).slice(0, 20) : [],
      region: isRegion(parsed.region) ? parsed.region : defaults.region,
      visitedRegions: Array.from(new Set([...(Array.isArray(parsed.visitedRegions) ? parsed.visitedRegions.filter(isRegion) : defaults.visitedRegions), isRegion(parsed.region) ? parsed.region : defaults.region])),
      heartDemon: Math.min(1, finiteNonNegative(parsed.heartDemon, 0)),
      forbiddenRoute: parsed.forbiddenRoute === true,
      heavenlyKarma: finiteNonNegative(parsed.heavenlyKarma, 0),
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
        const now = Date.now();
        const elapsedSeconds = Math.min(28_800, Math.max(0, (now - (prev.lastTickAt || now)) / 1000));
        let newState = { ...prev, lastTickAt: now, worldTime: prev.worldTime + elapsedSeconds * 60 };
        
        // Meditation gains
        if (prev.isMeditating) {
          const qiGain = prev.qiPerSecond * prev.cultivationSpeed * getTechniqueBonus(prev) * getPathBonus(prev) * elapsedSeconds;
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
            const region = REGIONS[newState.region];
            const pool = EXPLORE_EVENTS.filter((_, index) => region.risk > 1 || index !== 11);
            const event = pool[Math.floor(Math.random() * pool.length)];
            newState.log = addLog(newState.log, `${region.name}: ${event.message}`, 'success');
            newState.qi = Math.min(newState.qi + Math.round(event.qi * region.reward), newState.maxQi);
            newState.spiritStones = Math.max(0, newState.spiritStones + Math.round(event.stones * region.reward));
            
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

        // World clock: one real second advances one in-world minute. Events are contextual,
        // persistent and rate-limited so offline catch-up cannot flood the chronicle.
        if (newState.worldTime >= newState.nextWorldEventAt) {
          const eligible = WORLD_EVENT_TEMPLATES.filter(event => !newState.recentEventIds.includes(event.id));
          const template = eligible[Math.floor(Math.random() * eligible.length)] ?? WORLD_EVENT_TEMPLATES[0];
          const stranger = newState.charactersMet.length === 0 || newState.eventCount % 3 === 0;
          const name = stranger
            ? generateCharacterName(newState.charactersMet, newState.eventCount + Math.floor(newState.worldTime / 3600))
            : newState.charactersMet[(newState.eventCount + 2) % newState.charactersMet.length];
          const eventRecord = {
            id: `world-${newState.eventCount + 1}`, title: template.title,
            description: template.text.replace('{name}', name).replace('{region}', REGIONS[newState.region].name),
            occurredAt: now, region: newState.region, ...(stranger ? { character: name } : {}),
          };
          newState.worldEvents = [eventRecord, ...newState.worldEvents].slice(0, 40);
          newState.recentEventIds = [...newState.recentEventIds, template.id].slice(-4);
          newState.eventCount += 1;
          newState.nextWorldEventAt = newState.worldTime + 3600;
          if (stranger && !newState.charactersMet.includes(name)) newState.charactersMet = [...newState.charactersMet, name].slice(-2000);
          const rewardScale = REGIONS[newState.region].reward;
          newState.qi = Math.min(newState.maxQi, newState.qi + Math.round(template.qi * rewardScale));
          newState.spiritStones = Math.max(0, newState.spiritStones + Math.round(template.stones * rewardScale));
          if (newState.region === 'forbidden_vale') newState.heartDemon = Math.min(1, newState.heartDemon + 0.025);
          newState.log = addLog(newState.log, eventRecord.description, 'info');
        }
        const arrivalCount = Math.max(0, Math.floor(newState.worldTime / 21_600) - Math.floor(prev.worldTime / 21_600));
        for (let arrival = 0; arrival < arrivalCount; arrival += 1) {
          const name = generateCharacterName(newState.charactersMet, newState.eventCount + newState.disciples.length * 3 + arrival);
          if (!newState.charactersMet.includes(name)) {
            newState.charactersMet = [...newState.charactersMet, name].slice(-2000);
            const talent = ['steady', 'brilliant', 'unorthodox'][(newState.eventCount + arrival) % 3];
            newState.worldEvents = [{ id: `arrival-${newState.eventCount}-${name}`, title: 'A new cultivator arrives', description: `${name}, a ${talent} talent, arrives near ${REGIONS[newState.region].name}.`, occurredAt: now, region: newState.region, character: name }, ...newState.worldEvents].slice(0, 40);
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

      if (prev.isMeditating || prev.isExploring || prev.tribulationActive || prev.heartDemon >= 0.75) {
        return { ...prev, log: addLog(prev.log, 'Finish your current activity before attempting a breakthrough.', 'warning') };
      }
      
      if (!nextRealm) {
        return { ...prev, log: addLog(prev.log, 'You have already reached the pinnacle of cultivation!', 'warning') };
      }
      
      if (prev.qi < nextRealm.qiRequired) {
        return { ...prev, log: addLog(prev.log, `Not enough Qi. Need ${formatNumber(nextRealm.qiRequired)}, have ${formatNumber(Math.floor(prev.qi))}.`, 'warning') };
      }

      const breakthroughChance = Math.min(0.95, Math.max(0.05, nextRealm.breakthroughChance + getBreakthroughBonus(prev) + CULTIVATION_PATHS[prev.path].breakthrough - prev.heartDemon * 0.12));
      const success = Math.random() < breakthroughChance;
      
      const newState = { ...prev, breakthroughAttempts: prev.breakthroughAttempts + 1 };
      
      if (success) {
        newState.realm = prev.realm + 1;
        newState.maxQi = nextRealm.qiRequired * 2;
        newState.qiPerSecond = 1 + (prev.realm + 1) * 2;
        newState.combatPower = 10 + (prev.realm + 1) * 50;
        newState.breakthroughs += 1;
        newState.heartDemon = Math.max(0, newState.heartDemon - 0.12);
        newState.heavenlyKarma = Math.min(100, newState.heavenlyKarma + (prev.forbiddenRoute ? 8 : 2));
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
        newState.heartDemon = Math.min(1, prev.heartDemon + 0.18 + (prev.forbiddenRoute ? 0.08 : 0));
        newState.heavenlyKarma = Math.min(100, prev.heavenlyKarma + 5 + (prev.forbiddenRoute ? 8 : 0));
        newState.log = addLog(newState.log, `Breakthrough failed! The qi scattered. (${Math.floor(breakthroughChance * 100)}% chance)`, 'danger');
        
        // Chance of tribulation at higher realms
        if ((prev.realm >= 6 || prev.heavenlyKarma >= 25) && Math.random() < Math.min(0.65, 0.2 + prev.heavenlyKarma / 200)) {
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

      const enemyPower = 18 + prev.realm * 30 + REGIONS[prev.region].risk * 18 + Math.floor(Math.random() * 24);
      const playerPower = prev.combatPower + CULTIVATION_PATHS[prev.path].combat;
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
      const regionReward = REGIONS[prev.region].reward;
      const rewardStones = Math.round((12 + prev.realm * 6) * regionReward);
      const rewardQi = Math.round((10 + prev.realm * 20) * regionReward);
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

  const choosePath = useCallback((path: CultivationPathId) => {
    setState(prev => prev.path === path ? prev : { ...prev, path, log: addLog(prev.log, `You commit to the ${CULTIVATION_PATHS[path].name} path.`, 'success') });
  }, []);

  const travelTo = useCallback((regionId: RegionId) => {
    setState(prev => {
      const region = REGIONS[regionId];
      if (prev.realm < region.minRealm) return { ...prev, log: addLog(prev.log, `${region.name} requires realm ${region.minRealm}.`, 'warning') };
      if (prev.isMeditating || prev.isExploring || prev.tribulationActive) return { ...prev, log: addLog(prev.log, 'Finish your current activity before travelling.', 'warning') };
      return { ...prev, region: regionId, visitedRegions: Array.from(new Set([...prev.visitedRegions, regionId])), log: addLog(prev.log, `You arrive at ${region.name}. ${region.description}`, 'info') };
    });
  }, []);

  const joinSect = useCallback((sectId: string) => {
    setState(prev => {
      if (!SECTS.some(sect => sect.id === sectId)) return prev;
      if (prev.sectId) return { ...prev, log: addLog(prev.log, 'You already belong to a sect. Leave your oath intact.', 'warning') };
      return { ...prev, sectId, sectReputation: 0, log: addLog(prev.log, `You swear an oath to ${SECTS.find(sect => sect.id === sectId)!.name}.`, 'success') };
    });
  }, []);

  const contributeToSect = useCallback(() => {
    setState(prev => {
      if (!prev.sectId) return prev;
      if (prev.spiritStones < 10) return { ...prev, log: addLog(prev.log, 'A contribution requires 10 spirit stones.', 'warning') };
      return { ...prev, spiritStones: prev.spiritStones - 10, sectReputation: prev.sectReputation + 10, log: addLog(prev.log, 'Your 10-stone contribution earns 10 sect reputation.', 'success') };
    });
  }, []);

  const recruitDisciple = useCallback(() => {
    setState(prev => {
      const capacity = 3 + Math.floor(prev.sectReputation / 50);
      if (!prev.sectId) return { ...prev, log: addLog(prev.log, 'Join a sect before taking disciples.', 'warning') };
      if (prev.disciples.length >= capacity) return { ...prev, log: addLog(prev.log, `Your current disciple capacity is ${capacity}. Raise sect reputation to expand it.`, 'warning') };
      if (prev.spiritStones < 25) return { ...prev, log: addLog(prev.log, 'Recruitment requires 25 spirit stones.', 'warning') };
      const name = generateCharacterName([...prev.charactersMet, ...prev.disciples.map(d => d.name)], prev.eventCount + prev.disciples.length);
      const talent: Disciple['talent'] = ['steady', 'brilliant', 'unorthodox'][Math.floor(Math.random() * 3)] as Disciple['talent'];
      const disciple = { id: `disciple-${Date.now()}-${prev.disciples.length}`, name, talent, realm: Math.max(0, prev.realm - 1), loyalty: 60 + Math.floor(Math.random() * 31), recruitedAt: prev.worldTime };
      return { ...prev, spiritStones: prev.spiritStones - 25, disciples: [...prev.disciples, disciple], charactersMet: [...prev.charactersMet, name].slice(-2000), log: addLog(prev.log, `${name}, a ${talent} talent, joins your sect household.`, 'success') };
    });
  }, []);

  const useDivineAbility = useCallback(() => {
    setState(prev => {
      if (prev.worldTime < prev.divineCooldownUntil) return { ...prev, log: addLog(prev.log, 'Your divine ability is still recovering.', 'warning') };
      const path = CULTIVATION_PATHS[prev.path];
      const qi = prev.path === 'spirit' ? Math.min(prev.maxQi, prev.qi + Math.round(prev.maxQi * 0.18)) : prev.qi;
      const combat = prev.path === 'sword' ? prev.combatPower + 18 : prev.combatPower;
      const heartDemon = prev.path === 'shadow' ? Math.min(1, prev.heartDemon + 0.12) : Math.max(0, prev.heartDemon - (prev.path === 'body' ? 0.2 : 0.06));
      const karma = prev.path === 'shadow' ? Math.min(100, prev.heavenlyKarma + 6) : Math.max(0, prev.heavenlyKarma - 2);
      return { ...prev, qi, combatPower: combat, heartDemon, heavenlyKarma: karma, divineCooldownUntil: prev.worldTime + 3600, log: addLog(prev.log, `${path.ability} answers your call.`, 'success') };
    });
  }, []);

  const toggleForbiddenRoute = useCallback(() => {
    setState(prev => prev.forbiddenRoute
      ? { ...prev, forbiddenRoute: false, heartDemon: Math.max(0, prev.heartDemon - 0.05), log: addLog(prev.log, 'You seal the forbidden route and regain a measure of clarity.', 'info') }
      : { ...prev, forbiddenRoute: true, heavenlyKarma: Math.min(100, prev.heavenlyKarma + 5), log: addLog(prev.log, 'You open a forbidden route. Power may come faster; heaven and your own heart will exact a price.', 'danger') });
  }, []);

  const confrontHeartDemon = useCallback(() => {
    setState(prev => {
      if (prev.heartDemon < 0.35) return { ...prev, log: addLog(prev.log, 'Your heart is clear enough; no demon can take form.', 'info') };
      const chance = Math.min(0.85, 0.45 + prev.realm * 0.025 + (prev.path === 'body' ? 0.15 : 0));
      if (Math.random() < chance) return { ...prev, heartDemon: Math.max(0, prev.heartDemon - 0.45), qi: Math.min(prev.maxQi, prev.qi + 40), log: addLog(prev.log, 'You face the heart demon without flinching. Clarity returns.', 'success') };
      return { ...prev, heartDemon: Math.min(1, prev.heartDemon + 0.15), qi: Math.floor(prev.qi * 0.9), log: addLog(prev.log, 'The heart demon finds a crack in your resolve. You lose 10% Qi.', 'danger') };
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
    choosePath, travelTo, joinSect, contributeToSect, recruitDisciple, useDivineAbility, toggleForbiddenRoute, confrontHeartDemon,
    addLogEntry,
    resetGame,
  };
}

function generateCharacterName(used: string[], salt: number): string {
  const given = ['Yue', 'Rui', 'Wen', 'Yan', 'Lian', 'Kai', 'Nian', 'Chen', 'Zhi', 'Fang', 'Xin', 'Ming'];
  const family = ['Lin', 'Shen', 'Qiao', 'Mo', 'Bai', 'Ren', 'Su', 'Gu', 'Yun', 'He', 'Luo', 'Tao'];
  for (let offset = 0; offset < family.length * given.length; offset += 1) {
    const index = (salt + offset) % (family.length * given.length);
    const candidate = `${family[Math.floor(index / given.length)]} ${given[index % given.length]}`;
    if (!used.includes(candidate)) return candidate;
  }
  let suffix = Math.max(1, salt + 1);
  while (used.includes(`Wandering Cultivator ${suffix}`)) suffix += 1;
  return `Wandering Cultivator ${suffix}`;
}
function isPath(value: unknown): value is CultivationPathId { return value === 'sword' || value === 'spirit' || value === 'body' || value === 'shadow'; }
function isRegion(value: unknown): value is RegionId { return value === 'village' || value === 'bamboo' || value === 'ruins' || value === 'thunder_peak' || value === 'forbidden_vale'; }
function finiteNonNegative(value: unknown, fallback: number): number { return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback; }
function isWorldEvent(value: any): boolean { return value && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.description === 'string' && isRegion(value.region); }
function isDisciple(value: any): value is Disciple { return value && typeof value.id === 'string' && typeof value.name === 'string' && (value.talent === 'steady' || value.talent === 'brilliant' || value.talent === 'unorthodox') && Number.isFinite(value.realm) && Number.isFinite(value.loyalty) && Number.isFinite(value.recruitedAt); }
function getPathBonus(state: GameState): number { return 1 + CULTIVATION_PATHS[state.path].qi + (state.forbiddenRoute ? 0.12 : 0); }

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
