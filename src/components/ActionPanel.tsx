import React from 'react';
import { GameState } from '../types';
import { REALMS } from '../gameData';
import { formatNumber } from '../hooks/useGameState';

interface Props {
  state: GameState;
  onToggleMeditation: () => void;
  onStartExploring: () => void;
  onHuntSpiritBeast: () => void;
  onAttemptBreakthrough: () => void;
}

export const ActionPanel: React.FC<Props> = ({ state, onToggleMeditation, onStartExploring, onHuntSpiritBeast, onAttemptBreakthrough }) => {
  const nextRealm = REALMS[state.realm + 1];
  const canBreakthrough = nextRealm && state.qi >= nextRealm.qiRequired;
  const breakthroughBonus = state.items.reduce((sum, item) => sum + (item.quantity > 0 ? (item.effect?.breakthroughBonus ?? 0) : 0), 0);
  const breakthroughChance = nextRealm ? Math.min(1, nextRealm.breakthroughChance + breakthroughBonus) : 0;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <h3 className="text-lg font-bold text-purple-200 mb-4 text-center">Actions</h3>
      
      <div className="space-y-3">
        {/* Meditate Button */}
        <button
          onClick={onToggleMeditation}
          disabled={state.isExploring || state.tribulationActive}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            state.isMeditating
              ? 'bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg shadow-blue-500/30 animate-pulse'
              : 'bg-gradient-to-r from-blue-900 to-blue-700 text-blue-100 hover:from-blue-800 hover:to-blue-600 hover:shadow-blue-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {state.isMeditating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-white animate-ping" />
              Meditating... (Click to Stop)
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🧘 Meditate
            </span>
          )}
        </button>

        {/* Explore Button */}
        <button
          onClick={onStartExploring}
          disabled={state.isMeditating || state.isExploring || state.tribulationActive}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            state.isExploring
              ? 'bg-gradient-to-r from-green-700 to-emerald-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-r from-green-900 to-green-700 text-green-100 hover:from-green-800 hover:to-green-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {state.isExploring ? (
            <span className="flex flex-col items-center">
              <span>Exploring...</span>
              <span className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
                <span 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-200"
                  style={{ width: `${state.exploreProgress}%` }}
                />
              </span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🗺️ Explore Wilderness
            </span>
          )}
        </button>

        {/* Spirit Beast Hunt */}
        <button
          onClick={onHuntSpiritBeast}
          disabled={state.isMeditating || state.isExploring || state.tribulationActive || state.spiritStones < 5}
          className="w-full rounded-lg border border-rose-900/60 bg-gradient-to-r from-rose-950 to-orange-950 px-4 py-3 text-left text-rose-100 transition-all hover:border-rose-600 hover:from-rose-900 hover:to-orange-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-semibold">🐉 Hunt a Spirit Beast</span>
            <span className="text-xs text-rose-300">5 stones</span>
          </span>
          <span className="mt-1 block text-xs text-rose-200/70">Risk Qi to earn spirit stones, materials, and combat mastery.</span>
        </button>

        {/* Breakthrough Button */}
        {nextRealm && (
          <button
            onClick={onAttemptBreakthrough}
            disabled={!canBreakthrough || state.tribulationActive || state.isMeditating || state.isExploring}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              canBreakthrough
                ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-white shadow-lg shadow-yellow-500/30 hover:from-yellow-500 hover:to-amber-400 animate-pulse'
                : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-400 border border-gray-600'
            } disabled:cursor-not-allowed`}
          >
            <span className="flex items-center justify-center gap-2">
              ⚡ Attempt Breakthrough
            </span>
            <span className="text-xs mt-1 opacity-75">
              {canBreakthrough 
                ? `→ ${nextRealm.name} (${Math.floor(breakthroughChance * 100)}% chance)`
                : `Need ${formatNumber(nextRealm.qiRequired)} Qi`
              }
            </span>
          </button>
        )}

        {!nextRealm && (
          <div className="w-full py-3 px-4 rounded-lg text-center bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border border-yellow-600/50 text-yellow-300">
            ✨ You have reached True Immortal! ✨
          </div>
        )}
      </div>

      {/* Tribulation Warning */}
      {state.tribulationActive && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg animate-pulse">
          <div className="text-red-300 font-bold text-center mb-1">⚡ HEAVENLY TRIBULATION ⚡</div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all"
              style={{ width: `${state.tribulationHealth}%` }}
            />
          </div>
          <p className="text-red-400 text-xs text-center mt-1">Endure the tribulation...</p>
        </div>
      )}
    </div>
  );
};
