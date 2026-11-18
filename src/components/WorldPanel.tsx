import React from 'react';
import { CultivationPathId, GameState, RegionId } from '../types';
import { CULTIVATION_PATHS, REGIONS, SECTS } from '../gameData';
import { formatNumber } from '../hooks/useGameState';

interface Props {
  state: GameState;
  onChoosePath: (path: CultivationPathId) => void;
  onTravel: (region: RegionId) => void;
  onJoinSect: (id: string) => void;
  onContribute: () => void;
  onRecruit: () => void;
  onUseAbility: () => void;
  onToggleForbidden: () => void;
  onConfrontDemon: () => void;
}

export const WorldPanel: React.FC<Props> = ({ state, onChoosePath, onTravel, onJoinSect, onContribute, onRecruit, onUseAbility, onToggleForbidden, onConfrontDemon }) => {
  const sect = SECTS.find(candidate => candidate.id === state.sectId);
  const day = Math.floor(state.worldTime / 86_400) + 1;
  const year = Math.floor((day - 1) / 360) + 1;
  const month = Math.floor(((day - 1) % 360) / 30) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  const cooldown = Math.max(0, Math.ceil((state.divineCooldownUntil - state.worldTime) / 60));
  const capacity = 3 + Math.floor(state.sectReputation / 50);

  return (
    <section className="rounded-xl border border-emerald-900/50 bg-gradient-to-br from-slate-950/95 via-emerald-950/40 to-indigo-950/70 p-4 shadow-lg shadow-emerald-950/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/70">The living frontier</p>
          <h3 className="mt-1 text-lg font-bold text-emerald-100">World Atlas & Household</h3>
          <p className="text-xs text-slate-400">Year {year} · Month {month} · Day {dayOfMonth} · {state.charactersMet.length} lives crossed</p>
        </div>
        <div className="rounded-lg border border-emerald-800/50 bg-slate-950/60 px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Current region</div>
          <div className="text-sm font-semibold text-emerald-200">{REGIONS[state.region].name}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Choose a cultivation path</h4>
          <button onClick={onUseAbility} disabled={cooldown > 0} className="rounded-md border border-amber-700/50 bg-amber-950/50 px-2.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-900/70 disabled:cursor-not-allowed disabled:opacity-40">
            {cooldown ? `${cooldown}m · recovering` : `Use ${CULTIVATION_PATHS[state.path].ability}`}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {(Object.entries(CULTIVATION_PATHS) as [CultivationPathId, typeof CULTIVATION_PATHS[CultivationPathId]][]).map(([id, path]) => (
            <button key={id} onClick={() => onChoosePath(id)} aria-pressed={state.path === id} className={`rounded-lg border p-2 text-left transition ${state.path === id ? 'border-emerald-400/70 bg-emerald-900/40' : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'}`}>
              <span className="text-xs font-semibold text-slate-100">{path.name}</span>
              <span className="mt-1 block text-[10px] leading-relaxed text-slate-400">{path.description}</span>
              <span className="mt-1 block text-[10px] text-emerald-300">+{Math.round(path.qi * 100)}% Qi · +{path.combat} force · +{Math.round(path.breakthrough * 100)}% breakthrough</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Regions · higher risk, richer finds</h4>
        <div className="space-y-1.5">
          {(Object.entries(REGIONS) as [RegionId, typeof REGIONS[RegionId]][]).map(([id, region]) => {
            const locked = state.realm < region.minRealm;
            return <div key={id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200">
                  <span>{region.name}</span>
                  {state.region === id && <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 text-[9px] text-emerald-200">HERE</span>}
                  {state.visitedRegions.includes(id) && state.region !== id && <span className="text-[9px] text-slate-500">visited</span>}
                </div>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">{region.description}</p>
              </div>
              <button onClick={() => onTravel(id)} disabled={locked || state.region === id || state.isMeditating || state.isExploring || state.tribulationActive} className="shrink-0 rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-emerald-700 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-35">
                {locked ? `Realm ${region.minRealm}+` : `Risk ${region.risk} · ×${region.reward}`}
              </button>
            </div>;
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-indigo-900/60 bg-slate-950/45 p-3">
          <div className="flex items-center justify-between gap-2">
            <div><h4 className="text-sm font-semibold text-indigo-100">Sect household</h4><p className="text-[10px] text-slate-500">{sect ? `${sect.name} · ${sect.motto}` : 'Choose one oath; it cannot be changed yet.'}</p></div>
            {sect && <span className="text-[10px] text-indigo-300">Rep {state.sectReputation}</span>}
          </div>
          {!sect ? <div className="mt-2 flex flex-wrap gap-1.5">{SECTS.map(item => <button key={item.id} onClick={() => onJoinSect(item.id)} className="rounded border border-indigo-800/70 px-2 py-1.5 text-[10px] text-indigo-200 hover:bg-indigo-900/50">Join {item.name}</button>)}</div> : <div className="mt-2 flex gap-2"><button onClick={onContribute} disabled={state.spiritStones < 10} className="rounded border border-indigo-800/70 px-2 py-1.5 text-[10px] text-indigo-200 disabled:opacity-40">Donate 10 stones → +10 rep</button><button onClick={onRecruit} disabled={state.spiritStones < 25 || state.disciples.length >= capacity} className="rounded border border-indigo-800/70 px-2 py-1.5 text-[10px] text-indigo-200 disabled:opacity-40">Recruit · 25 stones</button></div>}
          <div className="mt-2 space-y-1">{state.disciples.length ? state.disciples.map(disciple => <div key={disciple.id} className="flex justify-between text-[10px] text-slate-400"><span>{disciple.name} · {disciple.talent}</span><span>Realm {disciple.realm + 1} · Loyalty {disciple.loyalty}</span></div>) : <p className="text-[10px] text-slate-600">No disciples yet. The world sends new faces as time passes.</p>}</div>
        </div>

        <div className="rounded-lg border border-rose-900/50 bg-slate-950/45 p-3">
          <h4 className="text-sm font-semibold text-rose-100">Inner trials & forbidden arts</h4>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400"><span>Heart demon</span><span>{Math.round(state.heartDemon * 100)}%</span></div>
          <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-800"><div className="h-full bg-rose-500 transition-all" style={{ width: `${state.heartDemon * 100}%` }} /></div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button onClick={onConfrontDemon} disabled={state.heartDemon < 0.35} className="rounded border border-rose-800/70 px-2 py-1 text-[10px] text-rose-200 disabled:opacity-35">Confront demon</button>
            <button onClick={onToggleForbidden} className={`rounded border px-2 py-1 text-[10px] ${state.forbiddenRoute ? 'border-red-500/70 text-red-200' : 'border-rose-800/70 text-rose-200'}`}>{state.forbiddenRoute ? 'Seal forbidden route' : 'Open forbidden route'}</button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Heavenly karma {formatNumber(state.heavenlyKarma)} · {state.forbiddenRoute ? 'Forbidden route grants faster Qi but increases tribulation risk and heart demons.' : 'Repeated tribulation and forbidden arts draw heaven’s notice.'}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Recent world chronicle</h4><span className="text-[10px] text-slate-500">{state.worldEvents.length} recorded</span></div>
        {state.worldEvents.length ? <div className="space-y-1.5">{state.worldEvents.slice(0, 5).map(event => <div key={event.id} className="rounded-md border-l-2 border-emerald-700 bg-slate-950/50 px-2.5 py-1.5"><div className="text-[10px] font-medium text-emerald-100">{event.title} · {REGIONS[event.region].name}</div><p className="mt-0.5 text-[10px] text-slate-400">{event.description}</p></div>)}</div> : <p className="text-[10px] text-slate-600">The frontier is quiet for now. Events unfold as time passes.</p>}
      </div>
    </section>
  );
};
