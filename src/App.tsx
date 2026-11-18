import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { StatusPanel } from './components/StatusPanel';
import { ActionPanel } from './components/ActionPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { TechniquesPanel } from './components/TechniquesPanel';
import { EventLog } from './components/EventLog';
import { RealmProgression } from './components/RealmProgression';
import { AdvisorPanel } from './components/AdvisorPanel';

const STAR_FIELD = Array.from({ length: 30 }, (_, i) => ({ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 61 + 7) % 100}%`, delay: `${(i % 7) * 0.43}s`, opacity: 0.2 + ((i * 13) % 5) * 0.12 }));

function App() {
  const {
    state,
    toggleMeditation,
    startExploring,
    attemptBreakthrough,
    useItem,
    craftPill,
    trainTechnique,
    huntSpiritBeast,
    resetGame,
  } = useGameState();

  const [showReset, setShowReset] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'inventory' | 'techniques'>('actions');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Stars */}
        {STAR_FIELD.map((star, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 text-center py-6 border-b border-purple-900/30">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
          Path of Immortal Ascension
        </h1>
        <p className="text-gray-400 text-sm mt-1">A Cultivation Journey</p>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Status & Realm */}
          <div className="lg:col-span-3 space-y-4">
            <StatusPanel state={state} />
            <RealmProgression currentRealm={state.realm} />
          </div>

          {/* Center Column - Actions & Log */}
          <div className="lg:col-span-5 space-y-4">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex gap-1 bg-gray-900/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'actions' ? 'bg-purple-700/50 text-purple-200' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                ⚔️ Actions
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'inventory' ? 'bg-purple-700/50 text-purple-200' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🎒 Items
              </button>
              <button
                onClick={() => setActiveTab('techniques')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'techniques' ? 'bg-purple-700/50 text-purple-200' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📜 Skills
              </button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-4">
              <ActionPanel
                state={state}
                onToggleMeditation={toggleMeditation}
                onStartExploring={startExploring}
                onHuntSpiritBeast={huntSpiritBeast}
                onAttemptBreakthrough={attemptBreakthrough}
              />
              <InventoryPanel state={state} onUseItem={useItem} />
              <TechniquesPanel state={state} onCraft={craftPill} onTrain={trainTechnique} />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
              {activeTab === 'actions' && (
                <ActionPanel
                  state={state}
                  onToggleMeditation={toggleMeditation}
                  onStartExploring={startExploring}
                  onHuntSpiritBeast={huntSpiritBeast}
                  onAttemptBreakthrough={attemptBreakthrough}
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryPanel state={state} onUseItem={useItem} />
              )}
              {activeTab === 'techniques' && (
                <TechniquesPanel state={state} onCraft={craftPill} onTrain={trainTechnique} />
              )}
            </div>

            <EventLog log={state.log} />
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-4 space-y-4">
            <AdvisorPanel
              state={state}
              onMeditate={toggleMeditation}
              onExplore={startExploring}
              onBreakthrough={attemptBreakthrough}
              onTrain={trainTechnique}
            />
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
              <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
                <span>🌟</span> Cultivation Guide
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>🧘 <span className="text-gray-300">Meditate</span> to gather Qi over time.</p>
                <p>🗺️ <span className="text-gray-300">Explore</span> to find herbs, materials, and spirit stones.</p>
                <p>⚡ <span className="text-gray-300">Breakthrough</span> when you have enough Qi to advance realms.</p>
                <p>🧪 <span className="text-gray-300">Craft pills</span> using alchemy to boost your cultivation.</p>
                <p>📜 <span className="text-gray-300">Train techniques</span> to increase your power.</p>
                <p>🎒 <span className="text-gray-300">Use items</span> for instant Qi gains or permanent bonuses.</p>
              </div>
            </div>

            {/* Meditation Visualization */}
            {state.isMeditating && (
              <div className="bg-gray-900/80 backdrop-blur-sm border border-blue-900/50 rounded-xl p-6 shadow-lg shadow-blue-900/20 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-cyan-500/40 animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute inset-4 rounded-full border-2 border-purple-500/50 animate-ping" style={{ animationDelay: '1s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-pulse">🧘</span>
                  </div>
                </div>
                <p className="text-blue-300 mt-3 text-sm">Gathering spiritual energy...</p>
                <p className="text-blue-400 text-xs mt-1">
                  +{(state.qiPerSecond * state.cultivationSpeed).toFixed(1)} Qi/sec
                </p>
              </div>
            )}

            {/* Quick Stats Card */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500">Realm</span>
                  <div className="text-purple-300 font-medium">{state.realm + 1}/{19}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500">Techniques</span>
                  <div className="text-indigo-300 font-medium">{state.techniques.filter(t => t.learned).length}/{state.techniques.length}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500">Items</span>
                  <div className="text-green-300 font-medium">{state.items.filter(i => i.quantity > 0).length}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <span className="text-gray-500">BT Attempts</span>
                  <div className="text-amber-300 font-medium">{state.breakthroughAttempts}</div>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              {!showReset ? (
                <button
                  onClick={() => setShowReset(true)}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Reset Game
                </button>
              ) : (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                  <p className="text-red-300 text-sm mb-2">Are you sure? This cannot be undone!</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => { resetGame(); setShowReset(false); }}
                      className="px-3 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setShowReset(false)}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-gray-600 text-xs border-t border-gray-800/50">
        <p>Path of Immortal Ascension • Auto-saves every 5 seconds</p>
      </footer>
    </div>
  );
}

export default App;
