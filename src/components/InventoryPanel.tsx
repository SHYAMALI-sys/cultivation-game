import React from 'react';
import { GameState } from '../types';
import { RARITY_COLORS } from '../gameData';

interface Props {
  state: GameState;
  onUseItem: (itemId: string) => void;
}

export const InventoryPanel: React.FC<Props> = ({ state, onUseItem }) => {
  const usableItems = state.items.filter(i => i.quantity > 0 && i.effect);
  const otherItems = state.items.filter(i => i.quantity > 0 && !i.effect);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
        <span>🎒</span> Inventory
      </h3>

      {state.items.filter(i => i.quantity > 0).length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Your inventory is empty.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {usableItems.map(item => (
            <div 
              key={item.id}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-medium truncate"
                    style={{ color: RARITY_COLORS[item.rarity] }}
                  >
                    {item.name}
                  </span>
                  <span className="text-gray-500 text-xs">x{item.quantity}</span>
                </div>
                <p className="text-gray-500 text-xs truncate">{item.description}</p>
              </div>
              <button
                onClick={() => onUseItem(item.id)}
                className="ml-2 px-2 py-1 text-xs bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 rounded transition-colors shrink-0"
              >
                Use
              </button>
            </div>
          ))}
          {otherItems.map(item => (
            <div 
              key={item.id}
              className="flex items-center justify-between bg-gray-800/30 rounded-lg p-2 border border-gray-700/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-medium truncate"
                    style={{ color: RARITY_COLORS[item.rarity] }}
                  >
                    {item.name}
                  </span>
                  <span className="text-gray-500 text-xs">x{item.quantity}</span>
                </div>
                <p className="text-gray-500 text-xs truncate">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
