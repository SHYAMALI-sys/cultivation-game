import React from 'react';
import { GameState } from '../types';
import { REALMS, ALCHEMY_RECIPES } from '../gameData';
import { formatNumber } from '../hooks/useGameState';

interface Props {
  state: GameState;
  onMeditate: () => void;
  onExplore: () => void;
  onBreakthrough: () => void;
  onTrain: (id: string) => void;
  onHunt: () => void;
}

type Insight = { title: string; detail: string; action: string; tone: 'good' | 'warn' | 'info'; run: () => void };

export const AdvisorPanel: React.FC<Props> = ({ state, onMeditate, onExplore, onBreakthrough, onTrain, onHunt }) => {
  const nextRealm = REALMS[state.realm + 1];
  const cultivationTechniques = state.techniques.filter(t => t.learned && t.type === 'cultivation');
  const breakthroughBonus = state.items.reduce((sum, item) =>
    sum + (item.quantity > 0 ? (item.effect?.breakthroughBonus ?? 0) : 0), 0);
  const chance = nextRealm ? Math.min(1, Math.max(0, nextRealm.breakthroughChance + breakthroughBonus)) : 1;
  const required = nextRealm?.qiRequired ?? Infinity;
  const qiRatio = nextRealm ? Math.min(1, state.qi / required) : 1;
  const qiRate = state.qiPerSecond * state.cultivationSpeed * (1 + cultivationTechniques.reduce((sum, t) => sum + t.level * 0.15, 0));
  const missingQi = nextRealm ? Math.max(0, required - state.qi) : 0;
  const secondsToBreakthrough = qiRate > 0 ? Math.ceil(missingQi / qiRate) : Infinity;
  const affordableTraining = state.techniques.find(t =>
    t.learned && t.level < t.maxLevel && state.qi >= t.level * 50 && t.type === 'cultivation');
  const trainable = state.techniques.filter(t =>
    t.learned && t.level < t.maxLevel && state.qi >= t.level * 50)
    .sort((a, b) => (a.type === 'cultivation' ? -1 : 0) - (b.type === 'cultivation' ? -1 : 0))[0];
  const craftableRecipe = ALCHEMY_RECIPES.find(recipe =>
    state.realm >= recipe.realmRequired &&
    recipe.ingredients.every(ingredient =>
      (state.items.find(item => item.id === ingredient.id)?.quantity ?? 0) >= ingredient.quantity));
  const expectedBeastPower = 30 + state.realm * 30;
  const huntOdds = Math.round(Math.min(0.9, Math.max(0.15, 0.55 + (state.combatPower - expectedBeastPower) / Math.max(80, expectedBeastPower * 1.5))) * 100);

  const insights: Insight[] = [];

  if (state.tribulationActive) {
    insights.push({ title: 'Heavenly tribulation active', detail: 'Your breakthrough trial is underway. The simulation will resolve it automatically; wait before starting another activity.', action: 'Endure the trial', tone: 'warn', run: () => undefined });
  } else if (nextRealm && state.qi >= required) {
    insights.push({ title: 'Breakthrough is available', detail: `You have enough Qi for ${nextRealm.name}. Estimated success chance: ${Math.round(chance * 100)}%.`, action: 'Attempt breakthrough', tone: chance >= 0.7 ? 'good' : 'warn', run: onBreakthrough });
  } else if (nextRealm) {
    insights.push({ title: 'Build your Qi reserve', detail: `${formatNumber(missingQi)} Qi remain. At your current rate, that is about ${Number.isFinite(secondsToBreakthrough) ? formatDuration(secondsToBreakthrough) : 'an unknown time'} of uninterrupted meditation.`, action: state.isMeditating ? 'Meditation running' : 'Start meditation', tone: 'info', run: onMeditate });
  } else {
    insights.push({ title: 'The Immortal summit', detail: 'You have reached the final realm. Focus on mastery, collection, and completing your personal cultivation record.', action: 'Explore the world', tone: 'good', run: onExplore });
  }

  if (trainable && !state.tribulationActive) {
    insights.push({ title: 'Training opportunity', detail: `${trainable.name} can reach level ${trainable.level + 1} for ${trainable.level * 50} Qi.${trainable.type === 'cultivation' ? ' This improves your meditation efficiency.' : ' This strengthens your combat or utility skill.'}`, action: `Train ${trainable.name}`, tone: 'good', run: () => onTrain(trainable.id) });
  } else if (affordableTraining) {
    insights.push({ title: 'Technique mastery', detail: 'A learned technique is ready for training.', action: 'Train technique', tone: 'good', run: () => onTrain(affordableTraining.id) });
  }

  if (craftableRecipe && state.techniques.some(t => t.id === 'alchemy_basic' && t.learned)) {
    insights.push({ title: 'Alchemy materials ready', detail: `You have the ingredients to attempt ${craftableRecipe.name}. Crafting has a success chance, so keep spare materials when possible.`, action: 'Open alchemy', tone: 'info', run: () => undefined });
  }

  if (!state.tribulationActive) {
    insights.push({
      title: 'Combat readiness',
      detail: `Your combat power is ${formatNumber(state.combatPower)}. A spirit-beast hunt costs 5 spirit stones; estimated victory odds are around ${huntOdds}%. Defeat costs 10% of your current Qi.`,
      action: 'Hunt a spirit beast',
      tone: huntOdds >= 60 ? 'good' : 'warn',
      run: onHunt,
    });
  }

  const successEstimate = nextRealm ? Math.round(chance * 100) : 100;
  const progression = nextRealm ? Math.round(qiRatio * 100) : 100;
  const learned = state.techniques.filter(t => t.learned).length;

  return (
    <section className="rounded-xl border border-cyan-800/50 bg-gradient-to-br from-slate-900/95 via-indigo-950/80 to-slate-900/90 p-4 shadow-lg shadow-cyan-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Strategic intelligence</p>
          <h3 className="mt-1 text-lg font-bold text-cyan-100">Spirit Mind Advisor</h3>
          <p className="text-xs text-slate-400">Live analysis from your current cultivation state</p>
        </div>
        <span className="rounded-full border border-cyan-700/60 bg-cyan-950/60 px-2 py-1 text-xs text-cyan-200">ADVISOR</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Realm progress" value={`${progression}%`} detail={nextRealm ? `to ${nextRealm.name}` : 'summit reached'} />
        <Metric label="Breakthrough odds" value={`${successEstimate}%`} detail="includes available pill bonus" />
        <Metric label="Effective Qi rate" value={`${qiRate.toFixed(1)}/s`} detail={state.isMeditating ? 'meditation active' : 'while meditating'} />
        <Metric label="Techniques learned" value={`${learned}/${state.techniques.length}`} detail={`${state.breakthroughs} successful ascensions`} />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-400 transition-all" style={{ width: `${progression}%` }} />
      </div>

      <div className="mt-4 space-y-2">
        {insights.map((insight, index) => (
          <div key={insight.title} className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${insight.tone === 'good' ? 'bg-emerald-400' : insight.tone === 'warn' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
              <p className="text-sm font-semibold text-slate-100">{insight.title}</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{insight.detail}</p>
            {index === 0 && insight.action !== 'Endure the trial' && insight.action !== 'Meditation running' && insight.action !== 'Open alchemy' && (
              <button onClick={insight.run} disabled={state.tribulationActive || state.isMeditating || state.isExploring} className="mt-2 rounded-md bg-cyan-800/70 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">
                {insight.action}
              </button>
            )}
            {index > 0 && (insight.action.startsWith('Train ') || insight.action === 'Hunt a spirit beast') && (
              <button onClick={insight.run} disabled={state.tribulationActive || state.isMeditating || state.isExploring || (insight.action === 'Hunt a spirit beast' && state.spiritStones < 5)} className="mt-2 rounded-md bg-indigo-800/70 px-3 py-1.5 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
                {insight.action}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-700/70 pt-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">Cultivation milestones</h4>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Achievements</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { name: 'First Ascension', detail: 'Reach your first new realm', current: state.breakthroughs, target: 1 },
            { name: 'Wayfarer', detail: 'Complete 10 expeditions', current: state.explorationsCompleted, target: 10 },
            { name: 'Persistent Will', detail: 'Make 10 breakthrough attempts', current: state.breakthroughAttempts, target: 10 },
            { name: 'Grand Scholar', detail: 'Learn every technique', current: learned, target: state.techniques.length },
          ].map(milestone => {
            const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
            const complete = progress >= 100;
            return (
              <div key={milestone.name} className={`rounded-lg border p-2 ${complete ? 'border-emerald-700/60 bg-emerald-950/30' : 'border-slate-700/60 bg-slate-950/40'}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-200">{milestone.name}</span>
                  <span className={`text-[10px] ${complete ? 'text-emerald-300' : 'text-slate-500'}`}>{complete ? '✓' : `${Math.min(milestone.current, milestone.target)}/${milestone.target}`}</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{milestone.detail}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${complete ? 'bg-emerald-400' : 'bg-indigo-400'}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2 text-xs">
          <span className="text-slate-400">Breakthrough success rate</span>
          <strong className="text-cyan-200">{state.breakthroughAttempts ? Math.round((state.breakthroughs / state.breakthroughAttempts) * 100) : 0}%</strong>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Estimates assume uninterrupted meditation and the game's current deterministic bonuses. Actual breakthrough outcomes remain probabilistic.</p>
    </section>
  );
};

const Metric: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-2.5">
    <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-bold tabular-nums text-white">{value}</p>
    <p className="text-[10px] text-slate-500">{detail}</p>
  </div>
);

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
