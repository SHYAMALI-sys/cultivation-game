import React from 'react';
import { REALMS } from '../gameData';

interface Props {
  currentRealm: number;
}

export const RealmProgression: React.FC<Props> = ({ currentRealm }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
        <span>🏔️</span> Path of Cultivation
      </h3>
      
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {REALMS.map((realm, idx) => {
          const isPast = idx < currentRealm;
          const isCurrent = idx === currentRealm;
          const isFuture = idx > currentRealm;
          
          return (
            <div 
              key={realm.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all ${
                isCurrent ? 'bg-gray-700/50 border border-gray-600/50 scale-[1.02]' : 
                isPast ? 'opacity-60' : 'opacity-40'
              }`}
            >
              <div 
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isPast ? 'bg-green-500' : isCurrent ? 'animate-pulse' : 'bg-gray-700'
                }`}
                style={isCurrent ? { backgroundColor: realm.color, boxShadow: `0 0 8px ${realm.color}` } : {}}
              />
              <span 
                className={`font-medium ${isCurrent ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'}`}
                style={isCurrent ? { color: realm.color } : {}}
              >
                {realm.name}
              </span>
              {isPast && <span className="text-green-500 text-xs ml-auto">✓</span>}
              {isCurrent && <span className="text-xs ml-auto" style={{ color: realm.color }}>◄ Current</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
