import React from 'react';
import { GameState } from '../types';
import { ALCHEMY_RECIPES, REALMS } from '../gameData';

interface Props {
  state: GameState;
  onCraft: (recipeId: string) => void;
  onTrain: (techId: string) => void;
}

export const TechniquesPanel: React.FC<Props> = ({ state, onCraft, onTrain }) => {
  const learnedTechniques = state.techniques.filter(t => t.learned);
  const unlearnedTechniques = state.techniques.filter(t => !t.learned && t.realmRequired <= state.realm + 2);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
        <span>📜</span> Techniques & Alchemy
      </h3>

      {/* Techniques */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Learned Techniques</h4>
        {learnedTechniques.length === 0 ? (
          <p className="text-gray-500 text-xs">No techniques learned yet.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {learnedTechniques.map(tech => (
              <div key={tech.id} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-200">{tech.name}</span>
                    <span className="text-xs text-gray-500 ml-2">Lv.{tech.level}/{tech.maxLevel}</span>
                  </div>
                  {tech.level < tech.maxLevel && (
                    <button
                      onClick={() => onTrain(tech.id)}
                      className="px-2 py-1 text-xs bg-indigo-700/50 hover:bg-indigo-600/50 text-indigo-200 rounded transition-colors"
                    >
                      Train ({tech.level * 50} Qi)
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">{tech.description}</p>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(tech.level / tech.maxLevel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {unlearnedTechniques.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Upcoming Techniques</h4>
            <div className="space-y-1">
              {unlearnedTechniques.map(tech => (
                <div key={tech.id} className="bg-gray-800/30 rounded-lg p-2 border border-gray-700/30 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{tech.name}</span>
                    <span className="text-xs text-gray-600">({REALMS[tech.realmRequired].name})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alchemy */}
      <div className="border-t border-gray-700/50 pt-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">🧪 Alchemy Recipes</h4>
        <div className="space-y-2">
          {ALCHEMY_RECIPES.map(recipe => {
            const canCraft = state.realm >= recipe.realmRequired && recipe.ingredients.every(ing => {
              const item = state.items.find(i => i.id === ing.id);
              return item && item.quantity >= ing.quantity;
            });
            const hasAlchemy = state.techniques.find(t => t.id === 'alchemy_basic')?.learned;

            return (
              <div key={recipe.id} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">{recipe.name}</span>
                  <button
                    onClick={() => onCraft(recipe.id)}
                    disabled={!canCraft || !hasAlchemy}
                    className="px-2 py-1 text-xs bg-emerald-700/50 hover:bg-emerald-600/50 text-emerald-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Craft
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {recipe.ingredients.map(ing => {
                    const item = state.items.find(i => i.id === ing.id);
                    const hasEnough = item && item.quantity >= ing.quantity;
                    return (
                      <span 
                        key={ing.id}
                        className={`text-xs px-1.5 py-0.5 rounded ${hasEnough ? 'bg-gray-700 text-gray-300' : 'bg-red-900/50 text-red-400'}`}
                      >
                        {item?.name || ing.id} ({item?.quantity || 0}/{ing.quantity})
                      </span>
                    );
                  })}
                </div>
                {state.realm < recipe.realmRequired && (
                  <p className="text-xs text-yellow-500 mt-1">Requires: {REALMS[recipe.realmRequired].name}</p>
                )}
                {!hasAlchemy && (
                  <p className="text-xs text-red-400 mt-1">Requires: Basic Alchemy technique</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
