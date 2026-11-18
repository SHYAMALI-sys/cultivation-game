import React from 'react';
import { GameState } from '../types';
import { REALMS } from '../gameData';
import { formatNumber } from '../hooks/useGameState';

interface Props {
  state: GameState;
}

export const StatusPanel: React.FC<Props> = ({ state }) => {
  const currentRealm = REALMS[state.realm];
  const nextRealm = REALMS[state.realm + 1];
  const qiPercent = nextRealm ? Math.min((state.qi / nextRealm.qiRequired) * 100, 100) : 100;
  const techniqueMultiplier = 1 + state.techniques.reduce((bonus, technique) => bonus + (technique.learned && technique.type === 'cultivation' ? technique.level * 0.15 : 0), 0);
  const effectiveQiRate = state.qiPerSecond * state.cultivationSpeed * techniqueMultiplier;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-purple-200">{state.playerName}</h2>
        <div 
          className="text-lg font-semibold mt-1 px-3 py-1 rounded-full inline-block"
          style={{ color: currentRealm.color, borderColor: currentRealm.color, borderWidth: 1 }}
        >
          {currentRealm.name}
        </div>
      </div>

      <p className="text-gray-400 text-xs text-center mb-4 italic">{currentRealm.description}</p>

      {/* Qi Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-blue-300">Qi</span>
          <span className="text-blue-200">{formatNumber(state.qi)} / {nextRealm ? formatNumber(nextRealm.qiRequired) : '∞'}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-blue-900/50">
          <div 
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-400"
            style={{ width: `${qiPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Qi/sec</div>
          <div className="text-cyan-300 font-semibold">{effectiveQiRate.toFixed(1)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Cult. Speed</div>
          <div className="text-green-300 font-semibold">x{state.cultivationSpeed.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Combat Power</div>
          <div className="text-red-300 font-semibold">{formatNumber(state.combatPower)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Spirit Stones</div>
          <div className="text-yellow-300 font-semibold">{formatNumber(state.spiritStones)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 grid grid-cols-2 gap-2 text-xs text-gray-400">
        <div>Breakthroughs: <span className="text-purple-300">{state.breakthroughs}</span></div>
        <div>Explorations: <span className="text-green-300">{state.explorationsCompleted}</span></div>
        <div>Battles Won: <span className="text-red-300">{state.battlesWon}</span></div>
        <div>Cult. Time: <span className="text-blue-300">{formatTime(state.totalCultivationTime)}</span></div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}
